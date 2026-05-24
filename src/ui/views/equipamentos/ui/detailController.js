import {
  ErrorCodes as defaultErrorCodes,
  handleError as defaultHandleError,
} from '../../../../core/errors.js';
import { Utils as defaultUtils } from '../../../../core/utils.js';
import { Photos as defaultPhotos } from '../../../components/photos.js';

function defaultImportModal() {
  return import('../../../../core/modal.js');
}

export function mountViewEquipDetail(html, deps = {}) {
  const getEl = deps.getEl ?? defaultUtils.getEl;
  getEl('eq-det-corpo').innerHTML = html;
}

export function bindViewEquipDetailCoverActions(firstPhotoUrl, deps = {}) {
  const documentRef = deps.documentRef ?? document;
  const HTMLImageElementCtor = deps.HTMLImageElementCtor ?? HTMLImageElement;
  const Photos = deps.Photos ?? defaultPhotos;

  const coverImg = documentRef.querySelector('.eq-detail-cover__img');
  if (coverImg instanceof HTMLImageElementCtor) {
    coverImg.addEventListener(
      'load',
      () => {
        coverImg.closest('.eq-detail-cover')?.classList.add('eq-detail-cover--loaded');
      },
      { once: true },
    );
    coverImg.addEventListener(
      'error',
      () => {
        coverImg.closest('.eq-detail-cover')?.classList.add('eq-detail-cover--fallback');
        coverImg.remove();
      },
      { once: true },
    );
  }
  const coverPreviewHit = documentRef.querySelector('.eq-detail-cover__preview-hit');
  if (coverPreviewHit && firstPhotoUrl) {
    coverPreviewHit.addEventListener('click', () => {
      Photos.openLightbox(firstPhotoUrl);
    });
  }
}

export async function openViewEquipDetailModal(id, deps = {}) {
  const importModal = deps.importModal ?? defaultImportModal;
  const handleError = deps.handleError ?? defaultHandleError;
  const ErrorCodes = deps.ErrorCodes ?? defaultErrorCodes;

  try {
    const { Modal: M } = await importModal();
    M.open('modal-eq-det');
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Não foi possível abrir os detalhes do equipamento.',
      context: { action: 'equipamentos.viewEquip.openModal', id },
    });
  }
}
