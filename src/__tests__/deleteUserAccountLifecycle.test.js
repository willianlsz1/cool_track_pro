import { describe, expect, it } from 'vitest';

import {
  AccountDeletionError,
  deleteUserAccountLifecycle,
  toPublicAccountDeletionError,
} from '../../supabase/functions/delete-user-account/lifecycle.ts';

const silentLogger = {
  info() {},
  error() {},
};

function makeAdminMock({
  listByPrefix = {},
  removeError = null,
  tableErrors = {},
  authDeleteError = null,
} = {}) {
  const calls = [];

  return {
    calls,
    storage: {
      from(bucketName) {
        return {
          async list(prefix, options) {
            calls.push(`storage.list:${bucketName}:${prefix}:${options?.offset ?? 0}`);
            const result = listByPrefix[prefix] ?? [];
            return { data: result, error: null };
          },
          async remove(paths) {
            calls.push(`storage.remove:${bucketName}:${paths.join('|')}`);
            return { error: removeError };
          },
        };
      },
    },
    from(tableName) {
      return {
        delete() {
          return {
            eq(column, value) {
              calls.push(`db.delete:${tableName}:${column}:${value}`);
              return { count: 1, error: tableErrors[tableName] ?? null };
            },
          };
        },
      };
    },
    auth: {
      admin: {
        async deleteUser(userId) {
          calls.push(`auth.delete:${userId}`);
          return { error: authDeleteError };
        },
      },
    },
  };
}

describe('deleteUserAccountLifecycle', () => {
  it('remove Storage antes de apagar tabelas e Auth', async () => {
    const admin = makeAdminMock({
      listByPrefix: {
        'user-1': [{ id: 'file-1', name: 'foto.jpg' }],
      },
    });

    const steps = await deleteUserAccountLifecycle(
      admin,
      'user-1',
      ['registro-fotos'],
      silentLogger,
    );

    expect(steps.storage.ok).toBe(true);
    expect(admin.calls).toEqual([
      'storage.list:registro-fotos:user-1:0',
      'storage.remove:registro-fotos:user-1/foto.jpg',
      'db.delete:registros:user_id:user-1',
      'db.delete:equipamentos:user_id:user-1',
      'db.delete:setores:user_id:user-1',
      'db.delete:tecnicos:user_id:user-1',
      'auth.delete:user-1',
    ]);
  });

  it('falha fechado se Storage falhar e nao apaga banco/Auth', async () => {
    const admin = makeAdminMock({
      listByPrefix: {
        'user-1': [{ id: 'file-1', name: 'foto.jpg' }],
      },
      removeError: { message: 'provider leaked bucket detail' },
    });

    await expect(
      deleteUserAccountLifecycle(admin, 'user-1', ['registro-fotos'], silentLogger),
    ).rejects.toMatchObject({
      code: 'STORAGE_CLEANUP_FAILED',
      step: 'storage:registro-fotos',
    });

    expect(admin.calls).toEqual([
      'storage.list:registro-fotos:user-1:0',
      'storage.remove:registro-fotos:user-1/foto.jpg',
    ]);
  });

  it('falha fechado se delete de banco falhar e nao deleta Auth', async () => {
    const admin = makeAdminMock({
      tableErrors: {
        equipamentos: { message: 'raw db constraint with user-1' },
      },
    });

    let error;
    try {
      await deleteUserAccountLifecycle(admin, 'user-1', ['registro-fotos'], silentLogger);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(AccountDeletionError);
    expect(error).toMatchObject({
      code: 'TABLE_DELETE_FAILED',
      step: 'equipamentos',
    });
    expect(admin.calls).not.toContain('auth.delete:user-1');

    const publicError = toPublicAccountDeletionError(error);
    expect(publicError).toEqual({
      code: 'TABLE_DELETE_FAILED',
      step: 'equipamentos',
      message: 'Nao foi possivel concluir a exclusao dos dados da conta.',
    });
    expect(JSON.stringify(publicError)).not.toContain('raw db constraint');
    expect(JSON.stringify(publicError)).not.toContain('user-1');
  });

  it('retorna erro publico seguro quando Auth delete falha', async () => {
    const admin = makeAdminMock({
      authDeleteError: { message: 'raw auth provider token detail' },
    });

    let error;
    try {
      await deleteUserAccountLifecycle(admin, 'user-1', ['registro-fotos'], silentLogger);
    } catch (caught) {
      error = caught;
    }

    expect(error).toMatchObject({
      code: 'AUTH_DELETE_FAILED',
      step: 'auth',
    });
    const publicError = toPublicAccountDeletionError(error);
    expect(publicError).toEqual({
      code: 'AUTH_DELETE_FAILED',
      step: 'auth',
      message: 'Nao foi possivel concluir a exclusao da conta de autenticacao.',
    });
    expect(JSON.stringify(publicError)).not.toContain('raw auth provider');
  });
});
