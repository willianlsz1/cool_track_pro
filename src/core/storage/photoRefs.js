const PHOTO_REF_VERSION = 1;

function isString(value) {
  return typeof value === 'string';
}

function isValidPhotoRefObject(photo) {
  if (!photo || typeof photo !== 'object') return false;
  if (photo.pending === true && isString(photo.queueKey) && isString(photo.recordId)) return true;
  return Boolean(photo.path || photo.url || photo.signedUrl || photo.publicUrl);
}

export function normalizePhotoEntry(photo) {
  if (isString(photo)) {
    const value = photo.trim();
    if (!value) return null;

    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
          return normalizePhotoEntry(parsed);
        }
      } catch (_err) {
        return value;
      }
    }

    return value;
  }

  if (!isValidPhotoRefObject(photo)) return null;

  if (photo.pending === true && isString(photo.queueKey) && isString(photo.recordId)) {
    return {
      pending: true,
      queueKey: photo.queueKey.trim(),
      userId: isString(photo.userId) && photo.userId.trim() ? photo.userId.trim() : undefined,
      recordId: photo.recordId.trim(),
      index: Number(photo.index) || 0,
    };
  }

  const bucket = isString(photo.bucket) && photo.bucket.trim() ? photo.bucket.trim() : undefined;
  const path = isString(photo.path) ? photo.path.trim() : '';
  const directUrl = isString(photo.url)
    ? photo.url.trim()
    : isString(photo.signedUrl)
      ? photo.signedUrl.trim()
      : isString(photo.publicUrl)
        ? photo.publicUrl.trim()
        : '';
  const captionRaw = isString(photo.caption) ? photo.caption.trim() : '';
  const caption = captionRaw ? captionRaw.slice(0, 60) : undefined;

  return {
    version: Number(photo.version) || PHOTO_REF_VERSION,
    provider: isString(photo.provider) && photo.provider.trim() ? photo.provider.trim() : undefined,
    bucket,
    path,
    url: directUrl || undefined,
    urlExpiresAt: isString(photo.urlExpiresAt) ? photo.urlExpiresAt : undefined,
    mimeType: isString(photo.mimeType) ? photo.mimeType : undefined,
    size: Number(photo.size) || undefined,
    uploadedAt: isString(photo.uploadedAt) ? photo.uploadedAt : undefined,
    caption,
  };
}

export function normalizePhotoList(photoList) {
  if (!Array.isArray(photoList)) return [];
  return photoList.map(normalizePhotoEntry).filter(Boolean);
}
