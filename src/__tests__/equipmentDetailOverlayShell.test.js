import { describe, expect, it } from 'vitest';

import { renderShellModals } from '../ui/shell/templates/modals.js';

describe('equipment detail overlay shell', () => {
  it('mantem o detalhe do equipamento em corpo rolavel com fechar acessivel', () => {
    document.body.innerHTML = renderShellModals();

    const modal = document.querySelector('#modal-eq-det > .modal--eq-detail');
    const body = document.querySelector('#eq-det-corpo');
    const close = document.querySelector(
      '#modal-eq-det [data-action="close-modal"][data-id="modal-eq-det"]',
    );

    expect(modal).not.toBeNull();
    expect(body).not.toBeNull();
    expect(body?.classList.contains('modal__body')).toBe(true);
    expect(body?.classList.contains('modal__body--scroll')).toBe(true);
    expect(body?.classList.contains('eq-detail-shell-body')).toBe(true);
    expect(close).not.toBeNull();
    expect(close?.getAttribute('aria-label')).toBe('Fechar detalhes do equipamento');
    expect(close?.textContent).toContain('Voltar');
  });
});
