/**
 * CoolTrack Pro - Photos lightbox bridge.
 *
 * Registro v1 no longer captures/uploads photos. This module remains only for
 * legacy read-only photo visualization until Historico/Equipamentos are cut in
 * their own CPs.
 */

import { Utils } from '../../core/utils.js';
import { isSafeRegistroPhotoSrc } from '../viewModels/registroPhotosModel.js';

export const Photos = {
  openLightbox(src) {
    if (!isSafeRegistroPhotoSrc(src)) return;
    const lightboxImg = Utils.getEl('lightbox-img');
    const lightbox = Utils.getEl('lightbox');
    if (!lightboxImg || !lightbox) return;
    lightboxImg.src = src;
    lightbox.classList.add('is-open');
  },

  closeLightbox() {
    Utils.getEl('lightbox')?.classList.remove('is-open');
  },
};
