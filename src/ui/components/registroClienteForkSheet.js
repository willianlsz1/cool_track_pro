import { Utils } from '../../core/utils.js';
import { attachDialogA11y } from '../../core/modal.js';

const OVERLAY_ID = 'registro-cliente-fork-overlay';
const EMPTY_CLIENT = {
  clienteNome: '',
  clienteDocumento: '',
  clienteContato: '',
  localAtendimento: '',
};

let _a11yCleanup = null;
let _activeResolve = null;

function close(overlay, result = null) {
  if (_a11yCleanup) {
    _a11yCleanup();
    _a11yCleanup = null;
  }
  const resolve = _activeResolve;
  _activeResolve = null;
  overlay?.classList.remove('is-open');
  window.setTimeout(() => overlay?.parentNode?.removeChild(overlay), 220);
  resolve?.(result);
}

function readIdentifiedClient(overlay) {
  return {
    clienteNome: overlay.querySelector('#rcf-cliente-nome')?.value?.trim() || '',
    clienteDocumento: overlay.querySelector('#rcf-cliente-documento')?.value?.trim() || '',
    clienteContato: overlay.querySelector('#rcf-cliente-contato')?.value?.trim() || '',
    localAtendimento: overlay.querySelector('#rcf-local-atendimento')?.value?.trim() || '',
  };
}

function buildHtml(initial = {}) {
  return `
    <div class="modal registro-cliente-fork-sheet" role="dialog" aria-modal="true" aria-labelledby="registro-cliente-fork-title">
      <header class="registro-cliente-fork-sheet__head">
        <div class="registro-cliente-fork-sheet__handle" aria-hidden="true"></div>
        <div class="registro-cliente-fork-sheet__head-row">
          <h2 class="registro-cliente-fork-sheet__title" id="registro-cliente-fork-title">Pra quem é esse PDF?</h2>
          <button type="button" class="registro-cliente-fork-sheet__close" id="rcf-close" aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </header>
      <div class="registro-cliente-fork-sheet__body">
        <button type="button" class="registro-cliente-fork-sheet__option" id="rcf-identify" aria-expanded="false" aria-controls="rcf-fields">
          <strong>Cliente identificado</strong>
          <span>Informar dados para capa do PDF e WhatsApp.</span>
        </button>
        <div class="registro-cliente-fork-sheet__fields" id="rcf-fields" hidden>
          <label class="registro-field__label" for="rcf-cliente-nome">Nome ou razão social</label>
          <input id="rcf-cliente-nome" class="registro-field__input" type="text" maxlength="200" value="${Utils.escapeHtml(initial.clienteNome || '')}" />
          <label class="registro-field__label" for="rcf-cliente-documento">CPF / CNPJ</label>
          <input id="rcf-cliente-documento" class="registro-field__input" type="text" maxlength="30" value="${Utils.escapeHtml(initial.clienteDocumento || '')}" />
          <label class="registro-field__label" for="rcf-cliente-contato">Telefone / contato</label>
          <input id="rcf-cliente-contato" class="registro-field__input" type="text" maxlength="120" value="${Utils.escapeHtml(initial.clienteContato || '')}" />
          <label class="registro-field__label" for="rcf-local-atendimento">Local do atendimento</label>
          <input id="rcf-local-atendimento" class="registro-field__input" type="text" maxlength="300" value="${Utils.escapeHtml(initial.localAtendimento || '')}" />
          <button type="button" class="btn btn--primary registro-cliente-fork-sheet__confirm" id="rcf-confirm">Confirmar e enviar</button>
        </div>
        <button type="button" class="registro-cliente-fork-sheet__option" id="rcf-anonymous">
          <strong>Enviar sem identificar</strong>
          <span>Salvar com cliente vazio e abrir o WhatsApp sem número.</span>
        </button>
      </div>
    </div>`;
}

export const RegistroClienteForkSheet = {
  open({ initial = {} } = {}) {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'modal-overlay registro-cliente-fork-overlay';
    overlay.innerHTML = buildHtml(initial);
    document.body.appendChild(overlay);

    return new Promise((resolve) => {
      _activeResolve = resolve;
      requestAnimationFrame(() => overlay.classList.add('is-open'));
      _a11yCleanup = attachDialogA11y(overlay, { onDismiss: () => close(overlay, null) });
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) close(overlay, null);
      });
      overlay.querySelector('#rcf-close')?.addEventListener('click', () => close(overlay, null));
      const identify = overlay.querySelector('#rcf-identify');
      const fields = overlay.querySelector('#rcf-fields');
      identify?.addEventListener('click', () => {
        fields.hidden = false;
        identify.setAttribute('aria-expanded', 'true');
        overlay.querySelector('#rcf-cliente-nome')?.focus();
      });
      overlay
        .querySelector('#rcf-anonymous')
        ?.addEventListener('click', () => close(overlay, { ...EMPTY_CLIENT }));
      overlay
        .querySelector('#rcf-confirm')
        ?.addEventListener('click', () => close(overlay, readIdentifiedClient(overlay)));
    });
  },
};
