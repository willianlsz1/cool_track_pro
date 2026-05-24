import { supabase } from './supabase.js';
import { AppError, ErrorCodes } from './errors.js';
import { enqueueBlob, getBlobEntry, removeBlob } from './blobQueue.js';

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_PHOTOS_BUCKET || 'registro-fotos';
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

function parseSignedUrlTtlSeconds(rawValue) {
  const parsed = Number.parseInt(String(rawValue || ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_SIGNED_URL_TTL_SECONDS;
  return parsed;
}

const SIGNED_URL_TTL_SECONDS = parseSignedUrlTtlSeconds(
  import.meta.env.VITE_SUPABASE_PHOTO_URL_TTL,
);
const PHOTO_REF_VERSION = 1;
const PENDING_PHOTO_QUEUE_PREFIX = 'photo';
const PENDING_PHOTO_QUEUE_KEY = 'cooltrack-photo-pending-upload';

function normalizeQueueSegment(value) {
  return String(value || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function buildPhotoQueueKey(userId, recordId, index) {
  return `${PENDING_PHOTO_QUEUE_PREFIX}-${normalizeQueueSegment(userId)}-${String(recordId)}-${Number(index)}`;
}

function readPendingPhotoRefs() {
  try {
    const raw = localStorage.getItem(PENDING_PHOTO_QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function writePendingPhotoRefs(entries) {
  try {
    localStorage.setItem(PENDING_PHOTO_QUEUE_KEY, JSON.stringify(entries));
  } catch (_err) {
    /* noop */
  }
}

function normalizePendingPhotoRef(entry) {
  if (!entry || typeof entry !== 'object') return null;
  if (!isString(entry.queueKey) || !entry.queueKey.trim()) return null;
  if (!isString(entry.recordId) || !entry.recordId.trim()) return null;
  if (!Number.isFinite(Number(entry.index))) return null;
  return {
    queueKey: entry.queueKey.trim(),
    userId: isString(entry.userId) && entry.userId.trim() ? entry.userId.trim() : null,
    recordId: entry.recordId.trim(),
    index: Number(entry.index),
    queuedAt: Number(entry.queuedAt) || Date.now(),
  };
}

function upsertPendingPhotoRef(entry) {
  const normalized = normalizePendingPhotoRef(entry);
  if (!normalized) return;
  const current = readPendingPhotoRefs().map(normalizePendingPhotoRef).filter(Boolean);
  const next = current.filter((it) => it.queueKey !== normalized.queueKey);
  next.push(normalized);
  writePendingPhotoRefs(next);
}

function removePendingPhotoRef(queueKey) {
  const current = readPendingPhotoRefs().map(normalizePendingPhotoRef).filter(Boolean);
  const next = current.filter((it) => it.queueKey !== queueKey);
  if (next.length !== current.length) writePendingPhotoRefs(next);
}

function listPendingPhotoRefs() {
  return readPendingPhotoRefs().map(normalizePendingPhotoRef).filter(Boolean);
}

export async function enqueuePhotoForRetry(blob, recordId, index, { userId = null } = {}) {
  if (!(blob instanceof Blob) || !recordId || !Number.isFinite(Number(index))) return null;
  const ownerId = userId || (await getAuthenticatedUserId());
  if (!ownerId) return null;
  const queueKey = buildPhotoQueueKey(ownerId, recordId, index);
  await enqueueBlob(queueKey, blob, {
    userId: ownerId,
    recordId: String(recordId),
    index: Number(index),
    queuedAt: Date.now(),
  });
  upsertPendingPhotoRef({
    queueKey,
    userId: ownerId,
    recordId: String(recordId),
    index: Number(index),
    queuedAt: Date.now(),
  });
  return {
    pending: true,
    queueKey,
    userId: ownerId,
    recordId: String(recordId),
    index: Number(index),
  };
}

export function listPendingPhotos() {
  return listPendingPhotoRefs();
}

function isString(value) {
  return typeof value === 'string';
}

function isDataUrl(value) {
  return isString(value) && /^data:image\/[a-z0-9.+-]+;base64,/i.test(value.trim());
}

function normalizeRecordId(value) {
  return String(value || 'registro').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function mimeToExtension(mimeType) {
  const normalized = String(mimeType || '').toLowerCase();
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('jpg') || normalized.includes('jpeg')) return 'jpg';
  return 'jpg';
}

// Scopes suportados pra organizar os paths dentro do bucket.
// Sempre que adicionar um scope novo, só incluir aqui — o upload não
// precisa ser diferente por scope.
const SUPPORTED_SCOPES = new Set(['registros', 'equipamentos']);

function resolveScope(scope) {
  const value = String(scope || 'registros').toLowerCase();
  return SUPPORTED_SCOPES.has(value) ? value : 'registros';
}

function buildObjectPath({ userId, recordId, index, mimeType, scope = 'registros' }) {
  const safeRecordId = normalizeRecordId(recordId);
  const ext = mimeToExtension(mimeType);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${index}`;
  return `${userId}/${resolveScope(scope)}/${safeRecordId}/${unique}.${ext}`;
}

export async function dataUrlToBlob(dataUrl) {
  const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,(.*)$/i.exec(
    String(dataUrl || '').trim(),
  );
  if (!match) {
    throw new Error('Data URL invalida para upload de foto.');
  }

  const mimeType = match[1] || 'application/octet-stream';
  const encodedPayload = match[3] || '';
  const isBase64 = Boolean(match[2]);

  let binary;
  if (isBase64) {
    if (typeof atob === 'function') {
      binary = atob(encodedPayload);
    } else if (typeof globalThis.Buffer !== 'undefined') {
      binary = globalThis.Buffer.from(encodedPayload, 'base64').toString('binary');
    } else {
      throw new Error('Ambiente sem decodificador base64 para data URL.');
    }
  } else {
    binary = decodeURIComponent(encodedPayload);
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

export async function createSignedUrl(bucket, path, ttlSeconds = SIGNED_URL_TTL_SECONDS) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, ttlSeconds);
  if (error || !data?.signedUrl) {
    throw new AppError(
      'Não foi possível obter URL assinada da foto.',
      ErrorCodes.SYNC_FAILED,
      'warning',
      {
        action: 'photoStorage.createSignedUrl',
        bucket,
        path,
        detail: error?.message,
      },
    );
  }
  return {
    url: data.signedUrl,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  };
}

async function getAuthenticatedUserId() {
  const result = await supabase.auth.getUser();
  const user = result?.data?.user;
  return user?.id || null;
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

    // Legacy fallback: quando a coluna `registros.fotos` foi criada como
    // `text[]` em vez de `jsonb`, o PostgREST serializa cada objeto como
    // string JSON ao inserir. Ao ler de volta recebemos uma string que
    // parece JSON ao invés do objeto original. Detectamos e reidratamos
    // aqui pra o app funcionar mesmo antes da migração da coluna.
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
          return normalizePhotoEntry(parsed);
        }
      } catch (_err) {
        /* string não era JSON válido — trata como URL/path bruto abaixo */
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

  const bucket =
    isString(photo.bucket) && photo.bucket.trim() ? photo.bucket.trim() : DEFAULT_BUCKET;
  const path = isString(photo.path) ? photo.path.trim() : '';
  const directUrl = isString(photo.url)
    ? photo.url.trim()
    : isString(photo.signedUrl)
      ? photo.signedUrl.trim()
      : isString(photo.publicUrl)
        ? photo.publicUrl.trim()
        : '';

  // Caption opcional por foto (#3.B refino UX abr/2026): legenda que o
  // técnico usa pra lembrar o contexto ("Vista da etiqueta", "Parafuso
  // solto", "Lado direito"). Limite de 60 chars pra ficar enxuta em UI.
  // Omitida do payload quando vazia pra não poluir jsonb.
  const captionRaw = isString(photo.caption) ? photo.caption.trim() : '';
  const caption = captionRaw ? captionRaw.slice(0, 60) : undefined;

  return {
    version: Number(photo.version) || PHOTO_REF_VERSION,
    provider: 'supabase-storage',
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

export function hasInlineLegacyPhotos(photoList) {
  return Array.isArray(photoList) && photoList.some((photo) => isDataUrl(photo));
}

async function uploadDataUrlPhoto(
  dataUrl,
  { userId, recordId, index, bucket = DEFAULT_BUCKET, scope = 'registros' },
) {
  const blob = await dataUrlToBlob(dataUrl);
  const mimeType = blob.type || 'image/jpeg';
  const path = buildObjectPath({ userId, recordId, index, mimeType, scope });

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, {
    upsert: false,
    contentType: mimeType,
    cacheControl: '31536000',
  });

  if (uploadError) {
    throw new AppError(
      'Falha ao enviar foto para o armazenamento.',
      ErrorCodes.SYNC_FAILED,
      'warning',
      {
        action: 'photoStorage.uploadDataUrlPhoto',
        bucket,
        path,
        detail: uploadError.message,
      },
    );
  }

  const signed = await createSignedUrl(bucket, path);
  return {
    version: PHOTO_REF_VERSION,
    provider: 'supabase-storage',
    bucket,
    path,
    url: signed.url,
    urlExpiresAt: signed.expiresAt,
    mimeType,
    size: blob.size,
    uploadedAt: new Date().toISOString(),
  };
}

export async function uploadPendingPhotos(
  photos,
  { recordId, userId = null, bucket = DEFAULT_BUCKET, scope = 'registros' } = {},
) {
  const source = Array.isArray(photos) ? photos : [];
  if (!source.length) return { photos: [], uploadedCount: 0, failedCount: 0 };

  const authUserId = userId || (await getAuthenticatedUserId());
  if (!authUserId) {
    throw new AppError(
      'Usuário não autenticado para upload de fotos.',
      ErrorCodes.AUTH_FAILED,
      'warning',
      { action: 'photoStorage.uploadPendingPhotos' },
    );
  }

  const result = [];
  let uploadedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < source.length; i += 1) {
    const photo = source[i];

    if (isDataUrl(photo)) {
      try {
        const uploaded = await uploadDataUrlPhoto(photo, {
          userId: authUserId,
          recordId,
          index: i,
          bucket,
          scope,
        });
        result.push(uploaded);
        uploadedCount += 1;
      } catch (_err) {
        try {
          const blob = await dataUrlToBlob(photo);
          const pendingMarker = await enqueuePhotoForRetry(blob, recordId, i, {
            userId: authUserId,
          });
          if (pendingMarker) result.push(pendingMarker);
        } catch {
          // queue write falhou - perde essa foto sem quebrar save
        }
        failedCount += 1;
      }
      continue;
    }

    const normalized = normalizePhotoEntry(photo);
    if (normalized) result.push(normalized);
  }

  return { photos: normalizePhotoList(result), uploadedCount, failedCount };
}

/**
 * Race condition possível se usuário salvar registro durante flush.
 * Mesmo padrão de signatures não tem proteção; aceitar comportamento atual.
 */
export async function flushPendingPhotos() {
  const pendingRefs = listPendingPhotoRefs();
  if (!pendingRefs.length) return { processed: 0, failed: 0, skipped: 0 };

  const authUserId = await getAuthenticatedUserId();
  if (!authUserId) return { processed: 0, failed: 0, skipped: pendingRefs.length };

  const updatesByRecord = new Map();
  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const ref of pendingRefs) {
    if (!ref.userId || ref.userId !== authUserId) {
      skipped += 1;
      continue;
    }

    const row = await getBlobEntry(ref.queueKey);
    if (!row || !(row.blob instanceof Blob)) {
      removePendingPhotoRef(ref.queueKey);
      skipped += 1;
      continue;
    }
    try {
      const path = buildObjectPath({
        userId: authUserId,
        recordId: ref.recordId,
        index: ref.index,
        mimeType: row.blob.type || 'image/jpeg',
        scope: 'registros',
      });
      const { error: uploadError } = await supabase.storage
        .from(DEFAULT_BUCKET)
        .upload(path, row.blob, {
          upsert: false,
          contentType: row.blob.type || 'image/jpeg',
          cacheControl: '31536000',
        });
      if (uploadError) throw uploadError;

      const signed = await createSignedUrl(DEFAULT_BUCKET, path);
      const uploadedRef = {
        version: PHOTO_REF_VERSION,
        provider: 'supabase-storage',
        bucket: DEFAULT_BUCKET,
        path,
        url: signed.url,
        urlExpiresAt: signed.expiresAt,
        mimeType: row.blob.type || 'image/jpeg',
        size: row.blob.size,
        uploadedAt: new Date().toISOString(),
      };

      if (!updatesByRecord.has(ref.recordId)) updatesByRecord.set(ref.recordId, []);
      updatesByRecord.get(ref.recordId).push({ queueKey: ref.queueKey, uploadedRef });
      await removeBlob(ref.queueKey);
      removePendingPhotoRef(ref.queueKey);
      processed += 1;
    } catch (_err) {
      failed += 1;
    }
  }

  for (const [recordId, items] of updatesByRecord.entries()) {
    const { data } = await supabase
      .from('registros')
      .select('fotos,fotos_pendentes')
      .eq('id', recordId)
      .maybeSingle();

    const currentPhotos = normalizePhotoList(data?.fotos || []);
    const pendingKeys = new Set(Array.isArray(data?.fotos_pendentes) ? data.fotos_pendentes : []);
    const byKey = new Map(items.map((it) => [it.queueKey, it.uploadedRef]));

    const nextPhotos = currentPhotos.map((entry) => {
      if (entry?.pending === true && byKey.has(entry.queueKey)) {
        return byKey.get(entry.queueKey);
      }
      return entry;
    });

    items.forEach((it) => pendingKeys.delete(it.queueKey));
    const patch = { fotos: normalizePhotoList(nextPhotos) };
    if (pendingKeys.size > 0) patch.fotos_pendentes = Array.from(pendingKeys);
    else patch.fotos_pendentes = null;

    await supabase.from('registros').update(patch).eq('id', recordId);
  }

  return { processed, failed, skipped };
}

export async function migrateLegacyPhotosForRegistros(
  registros,
  { userId = null, bucket = DEFAULT_BUCKET } = {},
) {
  const source = Array.isArray(registros) ? registros : [];
  if (!source.length) return { registros: source, migratedCount: 0, failedCount: 0 };

  const authUserId = userId || (await getAuthenticatedUserId());
  if (!authUserId) return { registros: source, migratedCount: 0, failedCount: 0 };

  const nextRegistros = [];
  let migratedCount = 0;
  let failedCount = 0;

  for (const registro of source) {
    const fotos = normalizePhotoList(registro?.fotos || []);
    if (!hasInlineLegacyPhotos(fotos)) {
      nextRegistros.push({ ...registro, fotos });
      continue;
    }

    const migrated = await uploadPendingPhotos(fotos, {
      userId: authUserId,
      recordId: registro.id,
      bucket,
    });

    migratedCount += migrated.uploadedCount;
    failedCount += migrated.failedCount;
    nextRegistros.push({ ...registro, fotos: migrated.photos });
  }

  return { registros: nextRegistros, migratedCount, failedCount };
}

function hasValidCachedUrl(photoRef) {
  if (!photoRef?.url || !photoRef?.urlExpiresAt) return Boolean(photoRef?.url);
  return new Date(photoRef.urlExpiresAt).getTime() > Date.now() + 10_000;
}

export async function resolvePhotoDisplayUrl(photo) {
  if (isString(photo)) return photo;

  const normalized = normalizePhotoEntry(photo);
  if (!normalized) return null;

  if (hasValidCachedUrl(normalized)) return normalized.url;
  if (!normalized.path) return normalized.url || null;

  try {
    const signed = await createSignedUrl(normalized.bucket, normalized.path);
    return signed.url;
  } catch (_err) {
    return normalized.url || null;
  }
}
