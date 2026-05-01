import { readFileSync } from 'node:fs';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountRegistroPhotosReact,
  unmountRegistroPhotosReact,
} from '../react/entrypoints/registroPhotosIsland.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const SAFE_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z';
const SAFE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const MALICIOUS = '<img src=x onerror=alert(1)><script>alert(2)</script>';

function setRoot() {
  document.body.innerHTML = `
    <main id="view-registro">
      <div id="registro-header-root"></div>
      <section id="registro-photos-root"></section>
      <div id="registro-signature-hint"></div>
      <button data-action="save-registro"></button>
      <button data-action="save-and-share-registro"></button>
    </main>
  `;
  return document.getElementById('registro-photos-root');
}

function expectNoInjectedMarkup(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  root?.querySelectorAll('[href], [src]').forEach((node) => {
    ['href', 'src']
      .map((attr) => node.getAttribute(attr))
      .filter(Boolean)
      .forEach((value) => {
        const lower = value.toLowerCase();
        expect(lower).not.toContain('javascript:');
        expect(lower).not.toContain('data:text/html');
        expect(lower).not.toContain('image/svg+xml');
      });
  });
}

describe('registro photos React island', () => {
  afterEach(async () => {
    await act(async () => {
      unmountRegistroPhotosReact();
    });
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('monta somente no container de fotos preservando ids, classes e estado vazio', async () => {
    const root = setRoot();
    const onAddPhotos = vi.fn();

    await act(async () => {
      mountRegistroPhotosReact(root, { photos: [], onAddPhotos });
    });

    expect(root?.dataset.reactRegistroPhotosMounted).toBe('true');
    expect(document.getElementById('view-registro')?.dataset.reactRegistroPhotosMounted).toBe(
      undefined,
    );
    expect(document.querySelectorAll('[data-react-registro-photos-mounted="true"]')).toHaveLength(
      1,
    );

    const dropZone = document.getElementById('photo-drop-zone');
    const dropText = document.getElementById('photo-drop-text');
    const galleryInput = document.getElementById('input-fotos');
    const cameraInput = document.getElementById('input-fotos-camera');
    const preview = document.getElementById('photo-preview');

    expect(dropZone?.classList.contains('registro-photo-drop')).toBe(true);
    expect(dropZone?.getAttribute('for')).toBe('input-fotos');
    expect(dropText?.textContent).toBe('Toque para adicionar fotos');
    expect(galleryInput?.type).toBe('file');
    expect(galleryInput?.accept).toBe('image/*');
    expect(galleryInput?.multiple).toBe(true);
    expect(cameraInput?.type).toBe('file');
    expect(cameraInput?.accept).toBe('image/*');
    expect(cameraInput?.getAttribute('capture')).toBe('environment');
    expect(cameraInput?.classList.contains('visually-hidden')).toBe(true);
    expect(preview?.classList.contains('photo-grid')).toBe(true);
    expect(preview?.getAttribute('role')).toBe('list');
    expect(preview?.children).toHaveLength(0);
    expect(document.getElementById('registro-signature-hint')).not.toBeNull();
    expect(document.querySelector('[data-action="save-registro"]')).not.toBeNull();

    await act(async () => {
      galleryInput?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onAddPhotos).toHaveBeenCalledWith(galleryInput);
  });

  it('renderiza previews seguros preservando data-r-action e callbacks legados', async () => {
    const root = setRoot();
    const onOpenPhoto = vi.fn();
    const onRemovePhoto = vi.fn();

    await act(async () => {
      mountRegistroPhotosReact(root, {
        photos: [SAFE_JPEG, SAFE_PNG],
        onOpenPhoto,
        onRemovePhoto,
      });
    });

    const preview = document.getElementById('photo-preview');
    const cards = preview?.querySelectorAll('.photo-thumb');
    expect(cards).toHaveLength(2);
    expect(cards?.[0].getAttribute('role')).toBe('listitem');

    const img = cards?.[0].querySelector('img');
    const remove = cards?.[1].querySelector('.photo-thumb__remove');
    expect(img?.getAttribute('alt')).toBe('Foto 1');
    expect(img?.dataset.rAction).toBe('registro-photo-open');
    expect(img?.dataset.photoIndex).toBe('0');
    expect(img?.src).toContain('data:image/jpeg;base64');
    expect(remove?.type).toBe('button');
    expect(remove?.dataset.rAction).toBe('registro-photo-remove');
    expect(remove?.dataset.photoIndex).toBe('1');
    expect(remove?.getAttribute('aria-label')).toBe('Remover foto 2');

    await act(async () => {
      img?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      remove?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onOpenPhoto).toHaveBeenCalledWith(SAFE_JPEG);
    expect(onRemovePhoto).toHaveBeenCalledWith(1);
  });

  it('atualiza o mesmo root sem multiplos createRoot ou render duplicado', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountRegistroPhotosReact(root, { photos: [SAFE_JPEG] });
      mountRegistroPhotosReact(root, { photos: [SAFE_JPEG, SAFE_PNG] });
    });

    expect(root?.querySelectorAll('#photo-preview')).toHaveLength(1);
    expect(root?.querySelectorAll('.photo-thumb')).toHaveLength(2);
    expect(document.querySelectorAll('[data-react-registro-photos-mounted="true"]')).toHaveLength(
      1,
    );
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('desmonta com seguranca e tolera chamadas repetidas', async () => {
    const root = setRoot();

    await act(async () => {
      mountRegistroPhotosReact(root, { photos: [SAFE_JPEG] });
      unmountRegistroPhotosReact(root);
      unmountRegistroPhotosReact(root);
    });

    expect(root?.dataset.reactRegistroPhotosMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('bloqueia URLs inseguras e payloads HTML sem preview clicavel', async () => {
    const root = setRoot();

    await act(async () => {
      mountRegistroPhotosReact(root, {
        photos: [
          'javascript:alert(1)',
          `data:text/html,${MALICIOUS}`,
          'data:image/svg+xml,<svg onload="alert(1)"></svg>',
          SAFE_JPEG,
        ],
      });
    });

    const preview = document.getElementById('photo-preview');
    expect(preview?.querySelectorAll('.photo-thumb')).toHaveLength(1);
    expect(preview?.querySelector('[src^="javascript:"]')).toBeNull();
    expect(preview?.textContent).not.toContain('alert(1)');
    expectNoInjectedMarkup(root);
  });

  it('mantem o componente puro e createRoot fora do adapter legado de Registro', () => {
    const componentSource = readFileSync('src/react/pages/RegistroPhotos.jsx', 'utf8');
    const adapterSource = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
