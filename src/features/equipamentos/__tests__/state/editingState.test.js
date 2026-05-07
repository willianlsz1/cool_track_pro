import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearEditingState,
  getEditingEquipId,
  getEditingSetorId,
  getForcedEquipContext,
  setEditingEquipId,
  setEditingSetorId,
  setForcedEquipContext,
} from '../../state/editingState.js';

describe('state/editingState', () => {
  beforeEach(() => {
    clearEditingState();
  });

  it('começa com estados null', () => {
    expect(getEditingEquipId()).toBeNull();
    expect(getEditingSetorId()).toBeNull();
    expect(getForcedEquipContext()).toBeNull();
  });

  it('faz set/get de editingEquipId', () => {
    setEditingEquipId('eq-1');

    expect(getEditingEquipId()).toBe('eq-1');
  });

  it('faz set/get de editingSetorId', () => {
    setEditingSetorId('setor-1');

    expect(getEditingSetorId()).toBe('setor-1');
  });

  it('faz set/get de forcedEquipContext', () => {
    const context = { clienteId: 'c-1', setorId: 's-1' };

    setForcedEquipContext(context);

    expect(getForcedEquipContext()).toBe(context);
  });

  it('mantém independência entre editingEquipId, editingSetorId e forcedEquipContext', () => {
    const context = { clienteId: 'c-1' };

    setEditingEquipId('eq-1');
    setEditingSetorId('setor-1');
    setForcedEquipContext(context);

    expect(getEditingEquipId()).toBe('eq-1');
    expect(getEditingSetorId()).toBe('setor-1');
    expect(getForcedEquipContext()).toBe(context);
  });

  it('clearEditingState limpa os três estados', () => {
    setEditingEquipId('eq-1');
    setEditingSetorId('setor-1');
    setForcedEquipContext({ clienteId: 'c-1' });

    clearEditingState();

    expect(getEditingEquipId()).toBeNull();
    expect(getEditingSetorId()).toBeNull();
    expect(getForcedEquipContext()).toBeNull();
  });
});
