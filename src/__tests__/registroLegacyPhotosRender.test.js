import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Photos } from '../ui/components/photos.js';
import { renderShellViews } from '../ui/shell/templates/views.js';

const mocks = vi.hoisted(() => ({
  storageUsage: vi.fn(() => ({ percent: 0 })),
  toastWarning: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../core/storage.js', () => ({
  Storage: { usage: mocks.storageUsage },
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    warning: mocks.toastWarning,
    error: mocks.toastError,
  },
}));

const SAFE_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z';
const SAFE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const MALICIOUS = '<img src=x onerror=alert(1)><script>alert(2)</script>';

function setupRegistroPhotosDom() {
  document.body.innerHTML = `
    ${renderShellViews()}
    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true">
      <button class="lightbox__close" data-action="close-lightbox">Fechar</button>
      <img class="lightbox__img" id="lightbox-img" src="" alt="Registro fotografico" />
    </div>
  `;
}

function expectNoUnsafeMarkup(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  root.querySelectorAll('[href], [src]').forEach((node) => {
    const values = ['href', 'src'].map((attr) => node.getAttribute(attr)).filter(Boolean);
    values.forEach((value) => expect(value.toLowerCase()).not.toContain('javascript:'));
  });
}

function expectExternalFlowsNotExecuted() {
  expect(mocks.storageUsage).not.toHaveBeenCalled();
  expect(mocks.toastWarning).not.toHaveBeenCalled();
  expect(mocks.toastError).not.toHaveBeenCalled();
  expect(document.getElementById('lightbox')?.classList.contains('is-open')).toBe(false);
}

describe('registro legacy photos render adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupRegistroPhotosDom();
    Photos.pending = [];
  });

  it('preserva bloco vazio de fotos/anexos com ids, classes e inputs publicos', () => {
    Photos.render();

    const dropZone = document.getElementById('photo-drop-zone');
    const dropText = document.getElementById('photo-drop-text');
    const galleryInput = document.getElementById('input-fotos');
    const cameraInput = document.getElementById('input-fotos-camera');
    const preview = document.getElementById('photo-preview');

    expect(dropZone).not.toBeNull();
    expect(dropZone.classList.contains('registro-photo-drop')).toBe(true);
    expect(dropZone.getAttribute('for')).toBe('input-fotos');
    expect(dropText.textContent).toBe('Toque para adicionar fotos');
    expect(galleryInput.type).toBe('file');
    expect(galleryInput.accept).toBe('image/*');
    expect(galleryInput.multiple).toBe(true);
    expect(cameraInput.type).toBe('file');
    expect(cameraInput.accept).toBe('image/*');
    expect(cameraInput.getAttribute('capture')).toBe('environment');
    expect(cameraInput.classList.contains('visually-hidden')).toBe(true);
    expect(preview.classList.contains('photo-grid')).toBe(true);
    expect(preview.getAttribute('role')).toBe('list');
    expect(preview.children).toHaveLength(0);
    expectExternalFlowsNotExecuted();
  });

  it('renderiza previews seguros preservando contratos de abrir/remover sem executar fluxos', () => {
    Photos.pending = [SAFE_JPEG, SAFE_PNG];

    Photos.render();

    const preview = document.getElementById('photo-preview');
    const cards = preview.querySelectorAll('.photo-thumb');
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute('role')).toBe('listitem');

    const img = cards[0].querySelector('img');
    const remove = cards[0].querySelector('.photo-thumb__remove');
    expect(img.getAttribute('alt')).toBe('Foto 1');
    expect(img.dataset.rAction).toBe('registro-photo-open');
    expect(img.dataset.photoIndex).toBe('0');
    expect(img.src).toContain('data:image/jpeg;base64');
    expect(remove.type).toBe('button');
    expect(remove.dataset.rAction).toBe('registro-photo-remove');
    expect(remove.dataset.photoIndex).toBe('0');
    expect(remove.getAttribute('aria-label')).toBe('Remover foto 1');
    expect(Photos.pending).toHaveLength(2);
    expectExternalFlowsNotExecuted();
  });

  it('bloqueia URLs inseguras e payloads HTML sem renderizar preview clicavel', () => {
    Photos.pending = [
      'javascript:alert(1)',
      `data:text/html,${MALICIOUS}`,
      `data:image/svg+xml,<svg onload="alert(1)"></svg>`,
      SAFE_JPEG,
    ];

    Photos.render();
    Photos.openLightbox('javascript:alert(2)');

    const preview = document.getElementById('photo-preview');
    expect(preview.querySelectorAll('.photo-thumb')).toHaveLength(1);
    expect(preview.querySelector('[src^="javascript:"]')).toBeNull();
    expect(preview.textContent).not.toContain('alert(1)');
    expectNoUnsafeMarkup(preview);
    expect(document.getElementById('lightbox-img')?.getAttribute('src')).toBe('');
    expectExternalFlowsNotExecuted();
  });
});
