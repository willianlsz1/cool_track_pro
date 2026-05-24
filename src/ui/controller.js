/**
 * CoolTrack Pro - UI Controller (Orchestrator)
 * Responsabilidade: compor rotas, handlers e helpers de inicializacao.
 */

import { registerAppRoutes } from './controller/routes.js';
import { bindNavigationHandlers } from './controller/handlers/navigationHandlers.js';
import { bindEquipmentHandlers } from './controller/handlers/equipmentHandlers.js';
import { bindRegistroHandlers } from './controller/handlers/registroHandlers.js';
import { bindProfileAccountHandlers } from './controller/handlers/profileAccountHandlers.js';
import { bindReportExportHandlers } from './controller/handlers/reportExportHandlers.js';
import { bindClienteHandlers } from './controller/handlers/clienteHandlers.js';
import { bindOrcamentoHandlers } from './controller/handlers/orcamentoHandlers.js';
import { initControllerHelpers } from './controller/helpers/themeInitHelpers.js';
import { registerBlockingLayer } from '../core/router.js';
import { SignatureModal } from './components/signature/signature-modal.js';
import { SignatureViewerModal } from './components/signature/signature-viewer-modal.js';

/**
 * Registra modais "blocking layer" no router pra serem fechados pelo botao
 * Voltar do browser. Inverte a dependencia que antes era core/router.js
 * importando de ui/components/signature/* (violava core ↛ ui).
 */
function registerSignatureBlockingLayers() {
  registerBlockingLayer({
    id: 'signature-capture',
    isOpen: () => {
      const el = document.getElementById('modal-signature-overlay');
      return Boolean(el?.classList.contains('is-open'));
    },
    close: () => SignatureModal.closeIfOpen(),
    getElement: () => document.getElementById('modal-signature-overlay'),
  });
  registerBlockingLayer({
    id: 'signature-viewer',
    isOpen: () => {
      const el = document.getElementById('modal-signature-viewer-overlay');
      return Boolean(el?.classList.contains('is-open'));
    },
    close: () => SignatureViewerModal.closeIfOpen(),
    getElement: () => document.getElementById('modal-signature-viewer-overlay'),
  });
}

export function initController() {
  registerAppRoutes();

  bindNavigationHandlers();
  bindEquipmentHandlers();
  bindRegistroHandlers();
  bindProfileAccountHandlers();
  bindReportExportHandlers();
  bindClienteHandlers();
  bindOrcamentoHandlers();

  registerSignatureBlockingLayers();

  initControllerHelpers();
}
