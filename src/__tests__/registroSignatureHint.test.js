import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  renderRegistroSignatureHint,
  unmountRegistroSignatureHint,
} from '../ui/views/registro/signatureHint.js';

const SAFE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const SAFE_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z';
const MALICIOUS = '<img src=x onerror=alert(1)><script>alert(2)</script>';

function setRoot() {
  document.body.innerHTML = `
    <main id="view-registro">
      <div id="registro-header-root"></div>
      <div id="registro-signature-hint" class="registro-sig-hint" hidden></div>
      <button data-action="save-registro"></button>
      <button data-action="save-and-share-registro"></button>
    </main>
  `;
  return document.getElementById('registro-signature-hint');
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

describe('registro signature DOM hint', () => {
  afterEach(() => {
    unmountRegistroSignatureHint();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('monta no bloco de assinatura preservando estado free e CTA legado', () => {
    const root = setRoot();
    const onUpsellClick = vi.fn();

    renderRegistroSignatureHint(root, {
      isPlusOrHigher: false,
      onUpsellClick,
    });

    expect(root?.dataset.registroSignatureMounted).toBe('true');
    expect(root?.hidden).toBe(false);
    expect(root?.classList.contains('registro-sig-hint')).toBe(true);
    expect(root?.classList.contains('registro-sig-hint--upsell')).toBe(true);
    expect(document.querySelectorAll('[data-registro-signature-mounted="true"]')).toHaveLength(1);
    expect(root?.querySelector('.registro-sig-hint__title')?.textContent).toContain(
      'Assinatura do cliente',
    );
    expect(root?.querySelector('.registro-sig-hint__badge--plus')?.textContent).toBe('Plus');

    const cta = root?.querySelector('[data-action="signature-upsell-cta"]');
    expect(cta?.tagName).toBe('BUTTON');
    expect(cta?.getAttribute('type')).toBe('button');

    cta?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onUpsellClick).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-action="save-registro"]')).not.toBeNull();
    expectNoInjectedMarkup(root);
  });

  it('renderiza estado Plus sem assinatura sem abrir captura real', () => {
    const root = setRoot();

    renderRegistroSignatureHint(root, { isPlusOrHigher: true });

    expect(root?.classList.contains('registro-sig-hint--upsell')).toBe(false);
    expect(root?.querySelector('.registro-sig-hint__title')?.textContent).toBe(
      'Assinatura do cliente',
    );
    expect(root?.querySelector('.registro-sig-hint__badge')?.textContent).toBe('Incluso');
    expect(root?.querySelector('[data-action="signature-upsell-cta"]')).toBeNull();
    expect(document.querySelector('#modal-signature-overlay')).toBeNull();
    expectNoInjectedMarkup(root);
  });

  it('renderiza preview seguro e contratos de capturar, abrir e remover quando fornecidos', () => {
    const root = setRoot();
    const onCapture = vi.fn();
    const onOpen = vi.fn();
    const onRemove = vi.fn();

    renderRegistroSignatureHint(root, {
      isPlusOrHigher: true,
      signatureSrc: SAFE_PNG,
      showCaptureAction: true,
      onCaptureSignature: onCapture,
      onOpenSignature: onOpen,
      onRemoveSignature: onRemove,
    });

    const image = root?.querySelector('.registro-sig-hint__preview-img');
    const capture = root?.querySelector('[data-r-action="registro-signature-capture"]');
    const open = root?.querySelector('[data-r-action="registro-signature-open"]');
    const remove = root?.querySelector('[data-r-action="registro-signature-remove"]');

    expect(root?.querySelector('.registro-sig-hint__badge')?.textContent).toBe('Assinado');
    expect(image?.getAttribute('src')).toContain('data:image/png;base64');
    expect(image?.getAttribute('alt')).toBe('Assinatura registrada');
    expect(capture?.getAttribute('type')).toBe('button');
    expect(open?.getAttribute('type')).toBe('button');
    expect(remove?.getAttribute('type')).toBe('button');

    capture?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    open?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    remove?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onCapture).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(SAFE_PNG);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expectNoInjectedMarkup(root);
  });

  it('bloqueia assinatura insegura e payloads HTML sem preview clicavel', () => {
    const root = setRoot();

    renderRegistroSignatureHint(root, {
      isPlusOrHigher: true,
      signatureSrc: `data:text/html,${MALICIOUS}`,
      label: MALICIOUS,
      description: MALICIOUS,
    });

    expect(root?.querySelector('.registro-sig-hint__preview-img')).toBeNull();
    expect(root?.querySelector('[data-r-action="registro-signature-open"]')).toBeNull();
    expect(root?.innerHTML).not.toContain('<script>');
    expect(root?.textContent).toContain(MALICIOUS);
    expectNoInjectedMarkup(root);

    renderRegistroSignatureHint(root, {
      isPlusOrHigher: true,
      signatureSrc: 'data:image/svg+xml,<svg onload="alert(1)"></svg>',
    });

    expect(root?.querySelector('.registro-sig-hint__preview-img')).toBeNull();
    expect(root?.textContent).not.toContain('alert(1)');
    expectNoInjectedMarkup(root);
  });

  it('atualiza o mesmo root e desmonta com seguranca', () => {
    const root = setRoot();

    renderRegistroSignatureHint(root, { isPlusOrHigher: true, signatureSrc: SAFE_PNG });
    renderRegistroSignatureHint(root, { isPlusOrHigher: true, signatureSrc: SAFE_JPEG });
    unmountRegistroSignatureHint(root);
    unmountRegistroSignatureHint(root);

    expect(root?.dataset.registroSignatureMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('mantem renderizador DOM isolado do adapter legado de Registro', () => {
    const rendererSource = readFileSync('src/ui/views/registro/signatureHint.js', 'utf8');
    const adapterSource = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(rendererSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML\s*=/);
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
