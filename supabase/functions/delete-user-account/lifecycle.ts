// Logica destrutiva pura da Edge Function delete-user-account.
// Mantida separada do handler para permitir teste unitario sem Deno.serve.

export const STORAGE_LIST_PAGE_SIZE = 1000;
export const STORAGE_REMOVE_CHUNK_SIZE = 100;
export const TABLES_IN_DELETE_ORDER = ['registros', 'equipamentos', 'setores', 'tecnicos'];

export class AccountDeletionError extends Error {
  constructor(code, step, publicMessage, cause) {
    super(cause instanceof Error ? cause.message : String(cause ?? publicMessage));
    this.name = 'AccountDeletionError';
    this.code = code;
    this.step = step;
    this.publicMessage = publicMessage;
    this.cause = cause;
  }
}

export function toPublicAccountDeletionError(error) {
  if (error instanceof AccountDeletionError) {
    return {
      code: error.code,
      step: error.step,
      message: error.publicMessage,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Nao foi possivel concluir a exclusao da conta.',
  };
}

function splitIntoChunks(values, chunkSize) {
  const chunks = [];
  for (let i = 0; i < values.length; i += chunkSize) {
    chunks.push(values.slice(i, i + chunkSize));
  }
  return chunks;
}

function isStorageFolderEntry(entry) {
  // Supabase Storage retorna `id` para objetos e null para "pastas virtuais".
  return entry?.id == null;
}

/**
 * Lista recursivamente todos os objetos em {userId}/ e retorna array de paths.
 * Faz paginacao por offset (limit=1000) em cada prefixo para evitar truncamento
 * silencioso em contas com grande volume de arquivos.
 */
export async function listUserStoragePaths(supabaseAdmin, userId, bucketName) {
  const paths = [];
  const bucket = supabaseAdmin.storage.from(bucketName);
  const pendingPrefixes = [String(userId)];

  while (pendingPrefixes.length > 0) {
    const prefix = pendingPrefixes.pop();
    if (!prefix) continue;

    let offset = 0;
    while (true) {
      const { data, error: listErr } = await bucket.list(prefix, {
        limit: STORAGE_LIST_PAGE_SIZE,
        offset,
      });
      if (listErr) {
        throw new AccountDeletionError(
          'STORAGE_CLEANUP_FAILED',
          `storage:${bucketName}`,
          'Nao foi possivel remover os arquivos da conta.',
          listErr,
        );
      }

      const items = Array.isArray(data) ? data : [];
      if (!items.length) break;

      for (const item of items) {
        if (!item?.name) continue;
        const nextPath = `${prefix}/${item.name}`;
        if (isStorageFolderEntry(item)) {
          pendingPrefixes.push(nextPath);
        } else {
          paths.push(nextPath);
        }
      }

      if (items.length < STORAGE_LIST_PAGE_SIZE) break;
      offset += STORAGE_LIST_PAGE_SIZE;
    }
  }

  return paths;
}

export async function removeStoragePaths(supabaseAdmin, bucketName, paths) {
  if (!paths.length) return;

  const chunks = splitIntoChunks(paths, STORAGE_REMOVE_CHUNK_SIZE);
  for (const chunk of chunks) {
    const { error } = await supabaseAdmin.storage.from(bucketName).remove(chunk);
    if (error) {
      throw new AccountDeletionError(
        'STORAGE_CLEANUP_FAILED',
        `storage:${bucketName}`,
        'Nao foi possivel remover os arquivos da conta.',
        error,
      );
    }
  }
}

async function cleanupUserStorage(supabaseAdmin, userId, bucketNames, steps, logger) {
  let totalRemoved = 0;

  for (const bucketName of bucketNames) {
    logger?.info?.('[delete-user-account] storage cleanup start', { bucketName });
    const paths = await listUserStoragePaths(supabaseAdmin, userId, bucketName);
    await removeStoragePaths(supabaseAdmin, bucketName, paths);
    steps[`storage:${bucketName}`] = { ok: true, count: paths.length };
    totalRemoved += paths.length;
    logger?.info?.('[delete-user-account] storage cleanup done', {
      bucketName,
      removed: paths.length,
    });
  }

  steps.storage = { ok: true, count: totalRemoved };
}

async function deleteCoreTables(supabaseAdmin, userId, steps, logger) {
  for (const table of TABLES_IN_DELETE_ORDER) {
    const { error, count } = await supabaseAdmin
      .from(table)
      .delete({ count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      logger?.error?.('[delete-user-account] table delete failed', {
        table,
        message: error.message,
      });
      steps[table] = { ok: false };
      throw new AccountDeletionError(
        'TABLE_DELETE_FAILED',
        table,
        'Nao foi possivel concluir a exclusao dos dados da conta.',
        error,
      );
    }

    steps[table] = { ok: true, count: count ?? 0 };
  }
}

async function deleteAuthUser(supabaseAdmin, userId, steps, logger) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    logger?.error?.('[delete-user-account] auth delete failed', { message: error.message });
    steps.auth = { ok: false };
    throw new AccountDeletionError(
      'AUTH_DELETE_FAILED',
      'auth',
      'Nao foi possivel concluir a exclusao da conta de autenticacao.',
      error,
    );
  }

  steps.auth = { ok: true };
}

export async function deleteUserAccountLifecycle(
  supabaseAdmin,
  userId,
  bucketNames,
  logger = console,
) {
  const steps = {};

  // Storage vem antes de DB/Auth para evitar conta ativa com dados de banco ja
  // removidos quando list/remove do Storage falha.
  await cleanupUserStorage(supabaseAdmin, userId, bucketNames, steps, logger);
  await deleteCoreTables(supabaseAdmin, userId, steps, logger);
  await deleteAuthUser(supabaseAdmin, userId, steps, logger);

  return steps;
}
