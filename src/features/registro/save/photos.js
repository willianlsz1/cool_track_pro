export function normalizeRegistroPhotoItems(rawPhotos = [], { isSafeRegistroPhotoSrc } = {}) {
  return [...rawPhotos].filter(isSafeRegistroPhotoSrc);
}

export function getRegistroPhotoState({ Photos, isSafeRegistroPhotoSrc }) {
  return {
    fotosRegistro: normalizeRegistroPhotoItems(Photos.pending, { isSafeRegistroPhotoSrc }),
    fotosPendentes: [],
  };
}

export async function persistRegistroPhotosForSave(
  photoState,
  { registroId, uploadPendingPhotos, Toast, handleError, ErrorCodes },
) {
  let { fotosRegistro, fotosPendentes } = photoState;

  if (fotosRegistro.length > 0) {
    try {
      const uploadResult = await uploadPendingPhotos(fotosRegistro, { recordId: registroId });
      fotosRegistro = uploadResult.photos;
      fotosPendentes = fotosRegistro
        .filter((entry) => entry?.pending === true && typeof entry.queueKey === 'string')
        .map((entry) => entry.queueKey);
      if (uploadResult.failedCount > 0) {
        Toast.warning(
          'Algumas fotos nÃ£o puderam ser enviadas para a nuvem e ficaram salvas localmente.',
        );
      }
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.SYNC_FAILED,
        severity: 'warning',
        message: 'Falha no upload das fotos. O registro serÃ¡ salvo com fallback local.',
        context: { action: 'registro.saveRegistro.photoUpload', registroId },
      });
    }
  }

  return { fotosRegistro, fotosPendentes };
}

export function buildRegistroPhotoPayload({ fotosRegistro, fotosPendentes }) {
  return {
    fotos: fotosRegistro,
    ...(fotosPendentes.length > 0 ? { fotos_pendentes: fotosPendentes } : {}),
  };
}
