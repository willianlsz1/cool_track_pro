export const REGISTRO_PHOTOS_ROOT_ID = 'registro-photos-root';

export const REGISTRO_PHOTO_ACTIONS = Object.freeze({
  open: 'registro-photo-open',
  remove: 'registro-photo-remove',
});

export const REGISTRO_PHOTOS_DEFAULT_DROP_TEXT = 'Toque para adicionar fotos';

export function isSafeRegistroPhotoSrc(src) {
  const value = String(src || '').trim();
  if (!value || /[<>"'\s]/.test(value)) return false;
  if (/^data:image\/(?:jpe?g|png|webp|gif);base64,[a-z0-9+/=]+$/i.test(value)) return true;
  if (/^blob:/i.test(value)) return true;

  try {
    const base =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost';
    const url = new URL(value, base);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}

export function buildRegistroPhotoItems(photos) {
  return (Array.isArray(photos) ? photos : [])
    .map((src, index) => ({ index, src: String(src || '').trim() }))
    .filter(({ src }) => isSafeRegistroPhotoSrc(src));
}
