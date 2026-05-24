import { describe, expect, it, vi } from 'vitest';
import {
  applySaveEquipToState,
  createSaveEquipInState,
  updateSaveEquipInState,
} from '../ui/views/equipamentos/crud/persist.js';

function createPayload(overrides = {}) {
  return {
    equipId: 'eq-new',
    nome: 'Evaporadora 01',
    local: 'Sala Técnica',
    tag: 'TAG-01',
    tipo: 'Split Hi-Wall',
    modelo: 'ABC-123',
    fluido: 'R-410A',
    componente: null,
    criticidade: 'alta',
    prioridadeOperacional: 'alta',
    periodicidadePreventivaDias: 30,
    setorId: 'setor-1',
    clienteId: 'cliente-1',
    fotosPayload: [{ url: 'foto-nova.jpg' }],
    dadosPlaca: { marca: 'Cool', modelo: 'ABC-123' },
    ...overrides,
  };
}

function createState() {
  return {
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Antigo',
        local: 'Local antigo',
        status: 'warn',
        tag: 'OLD',
        tipo: 'Janela',
        modelo: 'OLD-1',
        fluido: 'R-22',
        componente: 'compressor',
        criticidade: 'baixa',
        prioridadeOperacional: 'normal',
        periodicidadePreventivaDias: 90,
        setorId: 'setor-old',
        clienteId: 'cliente-old',
        fotos: [{ url: 'foto-antiga.jpg' }],
        dadosPlaca: { marca: 'Old' },
        campoLegado: 'preservado',
      },
      {
        id: 'eq-2',
        nome: 'Intocado',
        status: 'ok',
        campoLegado: 'tambem-preservado',
      },
    ],
    setores: [{ id: 'setor-1', nome: 'Setor 1' }],
    clientes: [{ id: 'cliente-1', nome: 'Cliente 1' }],
    registros: [{ id: 'reg-1', equipId: 'eq-1' }],
  };
}

function createStateHarness(initialState = createState()) {
  let state = structuredClone(initialState);
  const setState = vi.fn((updater) => {
    state = updater(state);
  });

  return {
    get state() {
      return state;
    },
    setState,
  };
}

describe('saveEquip state persistence helpers', () => {
  it('createSaveEquipInState adiciona equipamento novo ao array', () => {
    const harness = createStateHarness();
    const payload = createPayload();

    const result = createSaveEquipInState({ setState: harness.setState, payload });

    expect(result).toBeUndefined();
    expect(harness.setState).toHaveBeenCalledTimes(1);
    expect(harness.state.equipamentos).toHaveLength(3);
    expect(harness.state.equipamentos.at(-1)).toMatchObject({
      id: 'eq-new',
      nome: 'Evaporadora 01',
      local: 'Sala Técnica',
      tag: 'TAG-01',
      tipo: 'Split Hi-Wall',
      fotos: [{ url: 'foto-nova.jpg' }],
      dadosPlaca: { marca: 'Cool', modelo: 'ABC-123' },
    });
  });

  it("createSaveEquipInState preserva status 'ok' no equipamento criado", () => {
    const harness = createStateHarness();

    createSaveEquipInState({ setState: harness.setState, payload: createPayload() });

    expect(harness.state.equipamentos.at(-1).status).toBe('ok');
  });

  it('updateSaveEquipInState atualiza somente o equipamento alvo', () => {
    const harness = createStateHarness();
    const untouchedBefore = harness.state.equipamentos[1];

    const result = updateSaveEquipInState({
      setState: harness.setState,
      editingId: 'eq-1',
      payload: createPayload({ nome: 'Atualizado' }),
    });

    expect(result).toBeUndefined();
    expect(harness.setState).toHaveBeenCalledTimes(1);
    expect(harness.state.equipamentos[0].nome).toBe('Atualizado');
    expect(harness.state.equipamentos[1]).toEqual(untouchedBefore);
  });

  it('updateSaveEquipInState preserva campos existentes via spread e sobrescreve payload', () => {
    const harness = createStateHarness();

    updateSaveEquipInState({
      setState: harness.setState,
      editingId: 'eq-1',
      payload: createPayload({
        status: 'ignored',
        fotosPayload: [{ url: 'foto-preservada-normalizada.jpg' }],
      }),
    });

    expect(harness.state.equipamentos[0]).toMatchObject({
      id: 'eq-1',
      status: 'warn',
      campoLegado: 'preservado',
      nome: 'Evaporadora 01',
      fotos: [{ url: 'foto-preservada-normalizada.jpg' }],
      dadosPlaca: { marca: 'Cool', modelo: 'ABC-123' },
    });
  });

  it('applySaveEquipToState chama update quando editingId existe', () => {
    const setState = vi.fn();
    const payload = createPayload();
    const updateMutation = vi.fn();
    const createMutation = vi.fn();

    const result = applySaveEquipToState({
      setState,
      editingId: 'eq-1',
      payload,
      updateMutation,
      createMutation,
    });

    expect(result).toBeUndefined();
    expect(updateMutation).toHaveBeenCalledWith({ setState, editingId: 'eq-1', payload });
    expect(createMutation).not.toHaveBeenCalled();
  });

  it('applySaveEquipToState chama create quando editingId é null ou undefined', () => {
    for (const editingId of [null, undefined]) {
      const setState = vi.fn();
      const payload = createPayload();
      const updateMutation = vi.fn();
      const createMutation = vi.fn();

      const result = applySaveEquipToState({
        setState,
        editingId,
        payload,
        updateMutation,
        createMutation,
      });

      expect(result).toBeUndefined();
      expect(updateMutation).not.toHaveBeenCalled();
      expect(createMutation).toHaveBeenCalledWith({ setState, payload });
    }
  });

  it('não altera setores, clientes ou registros ao criar e atualizar equipamentos', () => {
    const initialState = createState();
    const harness = createStateHarness(initialState);
    const expectedSetores = structuredClone(initialState.setores);
    const expectedClientes = structuredClone(initialState.clientes);
    const expectedRegistros = structuredClone(initialState.registros);

    createSaveEquipInState({ setState: harness.setState, payload: createPayload() });
    updateSaveEquipInState({
      setState: harness.setState,
      editingId: 'eq-1',
      payload: createPayload({ nome: 'Atualizado' }),
    });

    expect(harness.state.setores).toEqual(expectedSetores);
    expect(harness.state.clientes).toEqual(expectedClientes);
    expect(harness.state.registros).toEqual(expectedRegistros);
  });
});
