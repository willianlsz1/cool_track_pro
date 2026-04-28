import { migrateLegacyPhotosForRegistros } from '../photoStorage.js';

export async function migrateLegacyPhotosInState(
  state,
  userId,
  { storageKey, storage = localStorage },
) {
  if (!state?.registros?.length) {
    return { state, migratedCount: 0, failedCount: 0 };
  }

  const migration = await migrateLegacyPhotosForRegistros(state.registros, { userId });
  if (!migration.migratedCount && !migration.failedCount) {
    return { state, migratedCount: 0, failedCount: 0 };
  }

  const migratedState = { ...state, registros: migration.registros };
  try {
    storage.setItem(storageKey, JSON.stringify(migratedState));
  } catch (_err) {
    // cache local é opcional nessa etapa
  }

  return {
    state: migratedState,
    migratedCount: migration.migratedCount,
    failedCount: migration.failedCount,
  };
}
