import { on } from '../../../core/events.js';
import { CustomConfirm } from '../../../core/modal.js';
import { ErrorCodes, handleError } from '../../../core/errors.js';
import {
  saveRegistro,
  clearRegistro,
  applyQuickTemplate,
  setChecklistItemStatus,
  setChecklistItemObs,
  setChecklistItemMeasure,
  captureRegistroSignatureFromHint,
  openRegistroSignatureFromHint,
  removeRegistroSignatureFromHint,
} from '../../views/registro.js';
import { deleteReg } from '../../views/historico.js';
import { runAsyncAction } from '../../components/actionFeedback.js';
import { REGISTRO_SIGNATURE_ACTIONS } from '../../viewModels/registroSignatureModel.js';

export function bindRegistroHandlers() {
  on('save-registro', async (el) => {
    try {
      await runAsyncAction(el, { loadingLabel: 'Salvando...' }, async () => {
        const saved = await saveRegistro();
        if (!saved) return;
      });
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Não foi possível salvar o registro.',
        context: { action: 'controller.save-registro' },
      });
    }
  });

  on('clear-registro', () => clearRegistro());
  on('quick-service-template', (el) => applyQuickTemplate(el.dataset.template, el));
  on(REGISTRO_SIGNATURE_ACTIONS.capture, (el) => captureRegistroSignatureFromHint(el));
  on(REGISTRO_SIGNATURE_ACTIONS.open, (el) => openRegistroSignatureFromHint(el));
  on(REGISTRO_SIGNATURE_ACTIONS.remove, (el) => removeRegistroSignatureFromHint(el));

  on('r-checklist-set', (el) => {
    const itemId = el.dataset.item || el.dataset.itemId;
    const status = el.dataset.status;
    if (!itemId || !status) return;
    setChecklistItemStatus(itemId, status);
  });

  if (typeof document !== 'undefined' && !document.body.dataset.checklistObsBound) {
    document.body.dataset.checklistObsBound = '1';
    document.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLTextAreaElement && target.dataset?.action === 'r-checklist-obs') {
        const itemId = target.dataset.item || target.dataset.itemId;
        if (itemId) setChecklistItemObs(itemId, target.value);
        return;
      }
      if (target instanceof HTMLInputElement && target.dataset?.action === 'r-checklist-measure') {
        const itemId = target.dataset.item || target.dataset.itemId;
        const unit = target.dataset.unit || '';
        if (itemId) setChecklistItemMeasure(itemId, target.value, unit);
      }
    });
  }

  on('delete-reg', async (el) => {
    try {
      const ok = await CustomConfirm.show(
        'Excluir este registro?',
        'Essa ação não pode ser desfeita.',
        {
          confirmLabel: 'Excluir',
          cancelLabel: 'Cancelar',
          tone: 'danger',
        },
      );
      if (ok) await Promise.resolve(deleteReg(el.dataset.id));
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Não foi possível confirmar a exclusão do registro.',
        context: { action: 'controller.delete-reg', id: el.dataset.id },
      });
    }
  });
}
