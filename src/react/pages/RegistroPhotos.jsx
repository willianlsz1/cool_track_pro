import {
  buildRegistroPhotoItems,
  REGISTRO_PHOTO_ACTIONS,
  REGISTRO_PHOTOS_DEFAULT_DROP_TEXT,
} from '../../ui/viewModels/registroPhotosModel.js';

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function InlineCameraIcon({ width = 14, height = 14 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SpriteIcon({ id }) {
  return (
    <svg aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

function PhotoThumb({ item, displayIndex, onOpenPhoto, onRemovePhoto }) {
  return (
    <div className="photo-thumb" role="listitem">
      <img
        src={item.src}
        alt={`Foto ${displayIndex + 1}`}
        data-r-action={REGISTRO_PHOTO_ACTIONS.open}
        data-photo-index={String(item.index)}
        onClick={() => onOpenPhoto?.(item.src)}
      />
      <button
        type="button"
        className="photo-thumb__remove"
        data-r-action={REGISTRO_PHOTO_ACTIONS.remove}
        data-photo-index={String(item.index)}
        aria-label={`Remover foto ${displayIndex + 1}`}
        onClick={() => onRemovePhoto?.(item.index)}
      >
        ×
      </button>
    </div>
  );
}

export function RegistroPhotos({
  photos = [],
  dropText = REGISTRO_PHOTOS_DEFAULT_DROP_TEXT,
  dropDisabled = false,
  onAddPhotos,
  onOpenPhoto,
  onRemovePhoto,
}) {
  const photoItems = buildRegistroPhotoItems(photos);

  return (
    <>
      <label
        id="photo-drop-zone"
        className="registro-photo-drop"
        htmlFor="input-fotos"
        style={dropDisabled ? { pointerEvents: 'none' } : undefined}
      >
        <span className="registro-photo-drop__icon" aria-hidden="true">
          <SpriteIcon id="ri-camera" />
        </span>
        <div className="registro-photo-drop__title" id="photo-drop-text">
          {text(dropText, REGISTRO_PHOTOS_DEFAULT_DROP_TEXT)}
        </div>
        <p className="registro-photo-drop__hint">
          Antes / depois, etiqueta do equipamento, peça trocada
        </p>
        <div className="registro-photo-drop__meta">ATÉ 5 FOTOS · JPG OU PNG</div>
        <input
          type="file"
          accept="image/*"
          multiple
          id="input-fotos"
          aria-label="Adicionar fotos"
          onChange={(event) => onAddPhotos?.(event.currentTarget)}
        />
      </label>

      <label
        className="equip-photo-shortcut registro-photo-quick registro-photo-quick--evidence"
        htmlFor="input-fotos-camera"
      >
        <InlineCameraIcon />
        Tirar foto agora
      </label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        id="input-fotos-camera"
        className="visually-hidden"
        aria-label="Tirar foto com a câmera"
        onChange={(event) => onAddPhotos?.(event.currentTarget)}
      />

      <div className="photo-grid" id="photo-preview" role="list" aria-label="Fotos adicionadas">
        {photoItems.map((item, displayIndex) => (
          <PhotoThumb
            item={item}
            displayIndex={displayIndex}
            onOpenPhoto={onOpenPhoto}
            onRemovePhoto={onRemovePhoto}
            key={`${item.index}:${item.src}`}
          />
        ))}
      </div>
    </>
  );
}
