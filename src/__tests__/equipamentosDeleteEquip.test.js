import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureDeleteEquip, deleteEquip } from '../ui/views/equipamentos/ui/deleteEquip.js';

function configureDeleteEquipTestDeps(overrides = {}) {
  const calls = [];
  const state = {
    registros: [
      { id: 'reg-1', equipId: 'eq-1' },
      { id: 'reg-2', equipId: 'eq-2' },
      { id: 'reg-3', equipId: 'eq-1' },
    ],
  };
  const modalClose = vi.fn(() => calls.push('modalClose'));
  const deps = {
    getState: vi.fn(() => state),
    setState: vi.fn((updater) => {
      calls.push('setState');
      state.next = updater({
        equipamentos: [{ id: 'eq-1' }, { id: 'eq-2' }],
        registros: [...state.registros],
        untouched: true,
      });
      return state.next;
    }),
    markEquipDeleted: vi.fn(() => calls.push('markEquipDeleted')),
    loadModal: vi.fn(async () => ({
      Modal: {
        close: modalClose,
      },
    })),
    handleError: vi.fn(() => calls.push('handleError')),
    ErrorCodes: { NETWORK_ERROR: 'NETWORK_ERROR' },
    renderEquip: vi.fn(() => calls.push('renderEquip')),
    updateGlobalHeader: vi.fn(() => calls.push('updateGlobalHeader')),
    Toast: {
      info: vi.fn(() => calls.push('toastInfo')),
    },
    ...overrides,
  };

  configureDeleteEquip(deps);
  return { calls, deps, modalClose, state };
}

describe('deleteEquip', () => {
  beforeEach(() => {
    configureDeleteEquip({});
  });

  it('preserva storage, state, modal, refresh e toast na ordem do fluxo atual', async () => {
    const { calls, deps, modalClose, state } = configureDeleteEquipTestDeps();

    await deleteEquip('eq-1');

    expect(deps.markEquipDeleted).toHaveBeenCalledWith('eq-1', ['reg-1', 'reg-3']);
    expect(deps.setState).toHaveBeenCalledTimes(1);
    expect(state.next).toEqual({
      equipamentos: [{ id: 'eq-2' }],
      registros: [{ id: 'reg-2', equipId: 'eq-2' }],
      untouched: true,
    });
    expect(modalClose).toHaveBeenCalledWith('modal-eq-det');
    expect(deps.Toast.info).toHaveBeenCalledWith('Equipamento removido.');
    expect(calls).toEqual([
      'markEquipDeleted',
      'setState',
      'modalClose',
      'renderEquip',
      'updateGlobalHeader',
      'toastInfo',
    ]);
  });

  it('mantem handleError do modal e continua refresh/toast quando close falha', async () => {
    const closeError = new Error('close failed');
    const { calls, deps } = configureDeleteEquipTestDeps({
      loadModal: vi.fn(async () => ({
        Modal: {
          close: vi.fn(() => {
            throw closeError;
          }),
        },
      })),
    });

    await deleteEquip('eq-1');

    expect(deps.handleError).toHaveBeenCalledWith(closeError, {
      code: 'NETWORK_ERROR',
      message: 'Equipamento removido, mas não foi possível fechar o modal.',
      context: { action: 'equipamentos.deleteEquip.closeModal', id: 'eq-1' },
      severity: 'warning',
    });
    expect(calls).toEqual([
      'markEquipDeleted',
      'setState',
      'handleError',
      'renderEquip',
      'updateGlobalHeader',
      'toastInfo',
    ]);
  });

  it('nao importa adapter obsoleto', () => {
    const source = readFileSync(resolve('src/ui/views/equipamentos/ui/deleteEquip.js'), 'utf8');

    expect(source).not.toContain('views/equipamentos.js');
  });
});
