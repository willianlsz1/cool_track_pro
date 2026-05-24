import { describe, expect, it, vi } from 'vitest';

import { finishSaveEquipSuccess } from '../ui/views/equipamentos/crud/postSave.js';

function createHarness(overrides = {}) {
  const calls = [];
  return {
    calls,
    closeModal: vi.fn((keepOpen) => {
      calls.push(['closeModal', keepOpen]);
    }),
    resetForm: vi.fn((keepOpen) => {
      calls.push(['resetForm', keepOpen]);
    }),
    refreshViews: vi.fn(() => {
      calls.push(['refreshViews']);
    }),
    toastSuccess: vi.fn((message) => {
      calls.push(['toastSuccess', message]);
    }),
    ...overrides,
  };
}

describe('crud/postSave', () => {
  it('executa close modal, reset, refresh e toast em ordem', async () => {
    const harness = createHarness();

    await finishSaveEquipSuccess({
      keepOpen: false,
      wasEditing: false,
      closeModal: harness.closeModal,
      resetForm: harness.resetForm,
      refreshViews: harness.refreshViews,
      toastSuccess: harness.toastSuccess,
    });

    expect(harness.calls).toEqual([
      ['closeModal', false],
      ['resetForm', false],
      ['refreshViews'],
      ['toastSuccess', 'Equipamento cadastrado.'],
    ]);
  });

  it('usa mensagem de edição quando wasEditing é true', async () => {
    const harness = createHarness();

    await finishSaveEquipSuccess({
      keepOpen: false,
      wasEditing: true,
      closeModal: harness.closeModal,
      resetForm: harness.resetForm,
      refreshViews: harness.refreshViews,
      toastSuccess: harness.toastSuccess,
    });

    expect(harness.toastSuccess).toHaveBeenCalledWith('Equipamento atualizado.');
  });

  it('preserva keepOpen ao chamar closeModal e resetForm', async () => {
    const harness = createHarness();

    await finishSaveEquipSuccess({
      keepOpen: true,
      wasEditing: false,
      closeModal: harness.closeModal,
      resetForm: harness.resetForm,
      refreshViews: harness.refreshViews,
      toastSuccess: harness.toastSuccess,
    });

    expect(harness.closeModal).toHaveBeenCalledWith(true);
    expect(harness.resetForm).toHaveBeenCalledWith(true);
  });

  it('aguarda promises de closeModal e refreshViews antes de continuar', async () => {
    const calls = [];
    let resolveClose;
    let resolveRefresh;
    const closePromise = new Promise((resolve) => {
      resolveClose = resolve;
    });
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });
    const closeModal = vi.fn(() => {
      calls.push('close-start');
      return closePromise.then(() => calls.push('close-done'));
    });
    const resetForm = vi.fn(() => calls.push('reset'));
    const refreshViews = vi.fn(() => {
      calls.push('refresh-start');
      return refreshPromise.then(() => calls.push('refresh-done'));
    });
    const toastSuccess = vi.fn(() => calls.push('toast'));

    const result = finishSaveEquipSuccess({
      keepOpen: false,
      wasEditing: false,
      closeModal,
      resetForm,
      refreshViews,
      toastSuccess,
    });

    await Promise.resolve();
    expect(calls).toEqual(['close-start']);

    resolveClose();
    await Promise.resolve();
    await Promise.resolve();
    expect(calls).toEqual(['close-start', 'close-done', 'reset', 'refresh-start']);

    resolveRefresh();
    await result;
    expect(calls).toEqual([
      'close-start',
      'close-done',
      'reset',
      'refresh-start',
      'refresh-done',
      'toast',
    ]);
  });

  it('não executa post-actions do saveEquip', async () => {
    const postAction = vi.fn();
    const harness = createHarness();

    await finishSaveEquipSuccess({
      keepOpen: false,
      wasEditing: false,
      closeModal: harness.closeModal,
      resetForm: harness.resetForm,
      refreshViews: harness.refreshViews,
      toastSuccess: harness.toastSuccess,
      postAction,
    });

    expect(postAction).not.toHaveBeenCalled();
  });
});
