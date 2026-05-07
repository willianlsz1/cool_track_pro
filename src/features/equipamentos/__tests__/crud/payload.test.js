import { describe, expect, it, vi } from 'vitest';

import { buildSaveEquipPayload } from '../../crud/payload.js';

const baseFormValues = {
  tipo: 'Split Hi-Wall',
  criticidade: 'alta',
  prioridadeOperacional: 'alta',
  periodicidadePreventivaDias: 45,
  setorId: 'setor-1',
  clienteId: 'cliente-1',
};

const payloadValidation = {
  value: {
    nome: 'Split Sala',
    local: 'Sala',
    tag: 'TAG-1',
    modelo: 'Modelo A',
  },
};

function getValue(id) {
  return (
    {
      'eq-fluido': 'R-32',
      'eq-componente': 'Evaporadora',
    }[id] || ''
  );
}

describe('crud/payload', () => {
  it('buildSaveEquipPayload em criação gera id novo e fotos vazias', () => {
    const createId = vi.fn(() => 'eq-new');
    const findEquip = vi.fn();
    const normalizePhotoList = vi.fn();

    const result = buildSaveEquipPayload({
      formValues: baseFormValues,
      payloadValidation,
      dadosPlaca: { tensao: '220' },
      editingId: null,
      createId,
      findEquip,
      normalizePhotoList,
      getValue,
      tiposComComponente: new Set(['Split Hi-Wall']),
    });

    expect(result).toEqual({
      equipId: 'eq-new',
      fotosPayload: [],
      ...baseFormValues,
      nome: 'Split Sala',
      local: 'Sala',
      tag: 'TAG-1',
      modelo: 'Modelo A',
      fluido: 'R-32',
      componente: 'Evaporadora',
      dadosPlaca: { tensao: '220' },
    });
    expect(createId).toHaveBeenCalledTimes(1);
    expect(findEquip).not.toHaveBeenCalled();
    expect(normalizePhotoList).not.toHaveBeenCalled();
  });

  it('buildSaveEquipPayload em edição preserva fotos existentes normalizadas', () => {
    const fotos = [{ id: 'foto-1', url: 'https://example.test/foto.jpg' }];
    const normalizedFotos = [{ id: 'foto-1', url: 'normalized' }];
    const createId = vi.fn();
    const findEquip = vi.fn(() => ({ id: 'eq-1', fotos }));
    const normalizePhotoList = vi.fn(() => normalizedFotos);

    const result = buildSaveEquipPayload({
      formValues: baseFormValues,
      payloadValidation,
      dadosPlaca: { corrente: '8,5' },
      editingId: 'eq-1',
      createId,
      findEquip,
      normalizePhotoList,
      getValue,
      tiposComComponente: new Set(['Split Hi-Wall']),
    });

    expect(result).toMatchObject({
      equipId: 'eq-1',
      fotosPayload: normalizedFotos,
      setorId: 'setor-1',
      clienteId: 'cliente-1',
      periodicidadePreventivaDias: 45,
      tipo: 'Split Hi-Wall',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
      componente: 'Evaporadora',
      dadosPlaca: { corrente: '8,5' },
    });
    expect(createId).not.toHaveBeenCalled();
    expect(findEquip).toHaveBeenCalledWith('eq-1');
    expect(normalizePhotoList).toHaveBeenCalledWith(fotos);
  });

  it('buildSaveEquipPayload preserva componente nulo para tipos sem componente', () => {
    const result = buildSaveEquipPayload({
      formValues: { ...baseFormValues, tipo: 'Geladeira' },
      payloadValidation,
      dadosPlaca: {},
      editingId: null,
      createId: vi.fn(() => 'eq-new'),
      findEquip: vi.fn(),
      normalizePhotoList: vi.fn(),
      getValue,
      tiposComComponente: new Set(['Split Hi-Wall']),
    });

    expect(result.componente).toBeNull();
    expect(result).toMatchObject({
      setorId: 'setor-1',
      clienteId: 'cliente-1',
      periodicidadePreventivaDias: 45,
      dadosPlaca: {},
    });
  });
});
