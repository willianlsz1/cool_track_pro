/**
 * CoolTrack Pro - Photos Module v3.4
 * Extraído de ui.js. Limite de 5 fotos por registro + aviso de storage.
 */

import { Utils, MAX_PHOTOS_PER_RECORD, MAX_PHOTO_WIDTH, PHOTO_QUALITY } from '../../core/utils.js';
import { Toast } from '../../core/toast.js';
import { Storage } from '../../core/storage.js';
import {
  buildRegistroPhotoItems,
  REGISTRO_PHOTO_ACTIONS,
  REGISTRO_PHOTOS_DEFAULT_DROP_TEXT,
  REGISTRO_PHOTOS_ROOT_ID,
  isSafeRegistroPhotoSrc,
} from '../viewModels/registroPhotosModel.js';

let _registroPhotosRenderGeneration = 0;

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

function appendTextElement(parent, tagName, className, textContent, options = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (options.id) element.id = options.id;
  if (options.ariaHidden) element.setAttribute('aria-hidden', 'true');
  element.textContent = textContent;
  parent.appendChild(element);
  return element;
}

function appendSpriteIcon(parent, id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');

  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${id}`);
  svg.appendChild(use);
  parent.appendChild(svg);
  return svg;
}

function appendInlineCameraIcon(parent) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z',
  );
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.6');
  path.setAttribute('stroke-linejoin', 'round');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '13');
  circle.setAttribute('r', '3');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '1.6');

  svg.append(path, circle);
  parent.appendChild(svg);
  return svg;
}

function createFileInput({ id, label, capture, multiple, onAddPhotos }) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.id = id;
  input.setAttribute('aria-label', label);
  if (multiple) input.multiple = true;
  if (capture) input.setAttribute('capture', capture);
  input.addEventListener('change', (event) => onAddPhotos?.(event.currentTarget));
  return input;
}

function renderRegistroPhotosDom(root, props = {}) {
  const {
    photos = [],
    dropText = REGISTRO_PHOTOS_DEFAULT_DROP_TEXT,
    dropDisabled = false,
    onAddPhotos,
    onOpenPhoto,
    onRemovePhoto,
  } = props;

  root.replaceChildren();
  root.dataset.reactRegistroPhotosMounted = 'true';

  const dropZone = document.createElement('label');
  dropZone.id = 'photo-drop-zone';
  dropZone.className = 'registro-photo-drop';
  dropZone.htmlFor = 'input-fotos';
  if (dropDisabled) dropZone.style.pointerEvents = 'none';

  const icon = appendTextElement(dropZone, 'span', 'registro-photo-drop__icon', '', {
    ariaHidden: true,
  });
  appendSpriteIcon(icon, 'ri-camera');
  appendTextElement(
    dropZone,
    'div',
    'registro-photo-drop__title',
    String(dropText || REGISTRO_PHOTOS_DEFAULT_DROP_TEXT),
    { id: 'photo-drop-text' },
  );
  appendTextElement(
    dropZone,
    'p',
    'registro-photo-drop__hint',
    'Antes / depois, etiqueta do equipamento, peca trocada',
  );
  appendTextElement(dropZone, 'div', 'registro-photo-drop__meta', 'ATE 5 FOTOS - JPG OU PNG');
  dropZone.appendChild(
    createFileInput({
      id: 'input-fotos',
      label: 'Adicionar fotos',
      multiple: true,
      onAddPhotos,
    }),
  );

  const cameraShortcut = document.createElement('label');
  cameraShortcut.className =
    'equip-photo-shortcut registro-photo-quick registro-photo-quick--evidence';
  cameraShortcut.htmlFor = 'input-fotos-camera';
  appendInlineCameraIcon(cameraShortcut);
  cameraShortcut.appendChild(document.createTextNode('Tirar foto agora'));

  const cameraInput = createFileInput({
    id: 'input-fotos-camera',
    label: 'Tirar foto com a camera',
    capture: 'environment',
    onAddPhotos,
  });
  cameraInput.className = 'visually-hidden';

  const preview = document.createElement('div');
  preview.className = 'photo-grid';
  preview.id = 'photo-preview';
  preview.setAttribute('role', 'list');
  preview.setAttribute('aria-label', 'Fotos adicionadas');

  buildRegistroPhotoItems(photos).forEach((item, displayIndex) => {
    const thumb = document.createElement('div');
    thumb.className = 'photo-thumb';
    thumb.setAttribute('role', 'listitem');

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = `Foto ${displayIndex + 1}`;
    img.dataset.rAction = REGISTRO_PHOTO_ACTIONS.open;
    img.dataset.photoIndex = String(item.index);
    img.addEventListener('click', () => onOpenPhoto?.(item.src));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'photo-thumb__remove';
    remove.dataset.rAction = REGISTRO_PHOTO_ACTIONS.remove;
    remove.dataset.photoIndex = String(item.index);
    remove.setAttribute('aria-label', `Remover foto ${displayIndex + 1}`);
    remove.textContent = 'x';
    remove.addEventListener('click', () => onRemovePhoto?.(item.index));

    thumb.append(img, remove);
    preview.appendChild(thumb);
  });

  root.append(dropZone, cameraShortcut, cameraInput, preview);
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
    if (renderGeneration !== _registroPhotosRenderGeneration) return null;

    return renderRegistroPhotosDom(root, {
      photos: this.pending,
      dropText: this._dropText,
      dropDisabled: this._dropDisabled,
      onAddPhotos: (input) => this.add(input),
      onOpenPhoto: (src) => this.openLightbox(src),
      onRemovePhoto: (index) => this.remove(index),
    });
  },

  unmount() {
    _registroPhotosRenderGeneration += 1;
    if (typeof document === 'undefined') return null;

    const root = Utils.getEl(REGISTRO_PHOTOS_ROOT_ID);
    if (!root?.dataset.reactRegistroPhotosMounted) return null;

    root.replaceChildren();
    delete root.dataset.reactRegistroPhotosMounted;
    return null;
  },
};
