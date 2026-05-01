/**
 * CoolTrack Pro - Photos Module v3.4
 * Extraído de ui.js. Limite de 5 fotos por registro + aviso de storage.
 */

import { Utils, MAX_PHOTOS_PER_RECORD, MAX_PHOTO_WIDTH, PHOTO_QUALITY } from '../../core/utils.js';
import { Toast } from '../../core/toast.js';
import { Storage } from '../../core/storage.js';
import {
  REGISTRO_PHOTOS_DEFAULT_DROP_TEXT,
  REGISTRO_PHOTOS_ROOT_ID,
  isSafeRegistroPhotoSrc,
} from '../viewModels/registroPhotosModel.js';

let _registroPhotosBridgePromise = null;
let _registroPhotosBridge = null;
let _registroPhotosRenderGeneration = 0;

function loadRegistroPhotosBridge() {
  if (_registroPhotosBridge) return Promise.resolve(_registroPhotosBridge);
  if (!_registroPhotosBridgePromise) {
    _registroPhotosBridgePromise = import('../../react/entrypoints/registroPhotosIsland.jsx').then(
      (mod) => {
        _registroPhotosBridge = mod;
        return mod;
      },
    );
  }
  return _registroPhotosBridgePromise;
}

function ensureRegistroPhotosRoot() {
  let root = Utils.getEl(REGISTRO_PHOTOS_ROOT_ID);
  if (root) return root;

  const dropZone = Utils.getEl('photo-drop-zone');
  const preview = Utils.getEl('photo-preview');
  if (!dropZone?.parentNode || !preview) return null;

  root = document.createElement('div');
  root.id = REGISTRO_PHOTOS_ROOT_ID;
  root.style.display = 'contents';
  dropZone.parentNode.insertBefore(root, dropZone);

  let node = dropZone;
  while (node) {
    const next = node.nextSibling;
    root.appendChild(node);
    if (node === preview) break;
    node = next;
  }

  return root;
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      fn(payload);
    };
    const timeoutId = setTimeout(() => {
      Toast.error('Tempo esgotado ao processar foto. Tente novamente.');
      finish(reject, new Error('Tempo esgotado ao processar foto.'));
    }, 15000);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > MAX_PHOTO_WIDTH) {
          h = Math.round((h * MAX_PHOTO_WIDTH) / w);
          w = MAX_PHOTO_WIDTH;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        finish(resolve, canvas.toDataURL('image/jpeg', PHOTO_QUALITY));
      };
      img.onerror = () => {
        Toast.error('Arquivo de imagem inválido ou corrompido.');
        finish(reject, new Error('Arquivo de imagem inválido ou corrompido.'));
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      Toast.error('Não foi possível ler o arquivo. Tente outro.');
      finish(reject, new Error('Falha ao ler arquivo de imagem.'));
    };
    reader.readAsDataURL(file);
  });
}

export const Photos = {
  pending: [],
  _dropText: REGISTRO_PHOTOS_DEFAULT_DROP_TEXT,
  _dropDisabled: false,

  async add(input) {
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const available = MAX_PHOTOS_PER_RECORD - this.pending.length;
    if (available <= 0) {
      Toast.warning(`Limite de ${MAX_PHOTOS_PER_RECORD} fotos por registro atingido.`);
      input.value = '';
      return;
    }

    const toProcess = files.slice(0, available);
    if (files.length > available) {
      Toast.warning(
        `Apenas ${available} foto(s) adicionada(s). Limite é ${MAX_PHOTOS_PER_RECORD} por registro.`,
      );
    }

    this._dropDisabled = true;
    this._dropText = `Processando ${toProcess.length} foto(s)...`;
    this.render();

    try {
      for (const file of toProcess) {
        try {
          this.pending.push(await compressImage(file));
          this.render();
        } catch (err) {
          console.error('[Photos] Erro ao processar foto', err);
        }
      }
    } finally {
      this._dropDisabled = false;
      this._dropText = REGISTRO_PHOTOS_DEFAULT_DROP_TEXT;
      input.value = '';
      this.render();
    }

    // Aviso de storage após adicionar fotos
    const { percent } = Storage.usage();
    if (percent >= 70) {
      Toast.warning(
        `Armazenamento em ${percent}% do limite. Considere remover registros antigos com fotos.`,
      );
    }
  },

  remove(i) {
    this.pending.splice(i, 1);
    this.render();
  },

  clear() {
    this.pending = [];
    this._dropDisabled = false;
    this._dropText = REGISTRO_PHOTOS_DEFAULT_DROP_TEXT;
    this.render();
  },

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

  render() {
    if (typeof document === 'undefined') return null;

    const root = ensureRegistroPhotosRoot();
    if (!root) return null;

    const renderGeneration = (_registroPhotosRenderGeneration += 1);
    const props = {
      photos: this.pending,
      dropText: this._dropText,
      dropDisabled: this._dropDisabled,
      onAddPhotos: (input) => this.add(input),
      onOpenPhoto: (src) => this.openLightbox(src),
      onRemovePhoto: (index) => this.remove(index),
    };

    const mountWithBridge = (bridge) => {
      if (renderGeneration !== _registroPhotosRenderGeneration) return null;
      return bridge.mountRegistroPhotosReact(root, props);
    };

    if (_registroPhotosBridge?.mountRegistroPhotosReact) {
      return mountWithBridge(_registroPhotosBridge);
    }

    return loadRegistroPhotosBridge().then(mountWithBridge);
  },

  unmount() {
    _registroPhotosRenderGeneration += 1;
    if (typeof document === 'undefined') return null;

    const root = Utils.getEl(REGISTRO_PHOTOS_ROOT_ID);
    if (!root?.dataset.reactRegistroPhotosMounted) return null;

    if (_registroPhotosBridge?.unmountRegistroPhotosReact) {
      _registroPhotosBridge.unmountRegistroPhotosReact(root);
      return null;
    }

    return loadRegistroPhotosBridge().then((bridge) => {
      bridge.unmountRegistroPhotosReact?.(root);
    });
  },
};
