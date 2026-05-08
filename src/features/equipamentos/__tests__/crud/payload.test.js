import { describe, expect, it, vi } from 'vitest';

import {
  buildSaveEquipPayload,
  collectSaveEquipBaseFormValues,
  collectSaveEquipContextFormValues,
  collectSaveEquipExtraFormValues,
} from '../../crud/payload.js';

const baseFormValues = {
  tipo: 'Split Hi-Wall',
  criticidade: 'alta',
  prioridadeOperacional: 'alta',
  periodicidadePreventivaDias: 45,
  setorId: 'setor-1',
  clienteId: 'cliente-1',
  fluido: 'R-32',
  componente: 'Evaporadora',
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
      'eq-tipo': 'Split Hi-Wall',
      'eq-criticidade': 'alta',
      'eq-prioridade': 'urgente',
      'eq-periodicidade': '45',
      'eq-setor': 'setor-1',
      'eq-cliente': 'cliente-1',
      'eq-fluido': 'R-32',
      'eq-componente': 'Evaporadora',
    }[id] || ''
  );
}

describe('crud/payload', () => {
  it('collectSaveEquipBaseFormValues coleta tipo, criticidade e prioridadeOperacional', () => {
    expect(collectSaveEquipBaseFormValues({ getValue })).toEqual({
      tipo: 'Split Hi-Wall',
      criticidade: 'alta',
      prioridadeOperacional: 'urgente',
    });
  });

  it('collectSaveEquipBaseFormValues preserva defaults de criticidade e prioridade', () => {
    const emptyValue = (id) => ({ 'eq-tipo': 'Câmara Fria' })[id] || '';

    expect(collectSaveEquipBaseFormValues({ getValue: emptyValue })).toEqual({
      tipo: 'Câmara Fria',
      criticidade: 'media',
      prioridadeOperacional: 'normal',
    });
  });

  it('collectSaveEquipContextFormValues coleta periodicidade, setor e cliente do form', () => {
    const normalizePeriodicidadePreventivaDias = vi.fn(() => 45);
    const result = collectSaveEquipContextFormValues({
      baseFormValues: {
        tipo: 'Split Hi-Wall',
        criticidade: 'alta',
        prioridadeOperacional: 'urgente',
      },
      saveWithoutClient: false,
      getValue,
      getForcedEquipContext: vi.fn(() => null),
      normalizePeriodicidadePreventivaDias,
    });

    expect(result).toEqual({
      tipo: 'Split Hi-Wall',
      criticidade: 'alta',
      prioridadeOperacional: 'urgente',
      periodicidadePreventivaDias: 45,
      setorId: 'setor-1',
      clienteId: 'cliente-1',
    });
    expect(normalizePeriodicidadePreventivaDias).toHaveBeenCalledWith(
      '45',
      'Split Hi-Wall',
      'alta',
    );
  });

  it('collectSaveEquipContextFormValues preserva contexto forçado e saveWithoutClient', () => {
    const normalizePeriodicidadePreventivaDias = vi.fn(() => 30);
    const forcedContext = { setorId: 'setor-forcado', clienteId: 'cliente-forcado' };

    const withForcedClient = collectSaveEquipContextFormValues({
      baseFormValues: {
        tipo: 'Split Hi-Wall',
        criticidade: 'media',
        prioridadeOperacional: 'normal',
      },
      saveWithoutClient: false,
      getValue,
      getForcedEquipContext: vi.fn(() => forcedContext),
      normalizePeriodicidadePreventivaDias,
    });
    const withoutClient = collectSaveEquipContextFormValues({
      baseFormValues: {
        tipo: 'Split Hi-Wall',
        criticidade: 'media',
        prioridadeOperacional: 'normal',
      },
      saveWithoutClient: true,
      getValue,
      getForcedEquipContext: vi.fn(() => forcedContext),
      normalizePeriodicidadePreventivaDias,
    });

    expect(withForcedClient).toMatchObject({
      periodicidadePreventivaDias: 30,
      setorId: 'setor-forcado',
      clienteId: 'cliente-forcado',
    });
    expect(withoutClient).toMatchObject({
      periodicidadePreventivaDias: 30,
      setorId: 'setor-forcado',
      clienteId: null,
    });
  });

  it('collectSaveEquipExtraFormValues coleta fluido e componente explicitamente', () => {
    expect(collectSaveEquipExtraFormValues({ getValue })).toEqual({
      fluido: 'R-32',
      componente: 'Evaporadora',
    });
  });

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
      fluido: 'R-32',
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
      tiposComComponente: new Set(['Split Hi-Wall']),
    });

    expect(result.componente).toBeNull();
    expect(result).toMatchObject({
      fluido: 'R-32',
      setorId: 'setor-1',
      clienteId: 'cliente-1',
      periodicidadePreventivaDias: 45,
      dadosPlaca: {},
    });
  });

  it('buildSaveEquipPayload preserva componente nulo quando tipo aceita componente mas valor está vazio', () => {
    const result = buildSaveEquipPayload({
      formValues: { ...baseFormValues, componente: '' },
      payloadValidation,
      dadosPlaca: {},
      editingId: null,
      createId: vi.fn(() => 'eq-new'),
      findEquip: vi.fn(),
      normalizePhotoList: vi.fn(),
      tiposComComponente: new Set(['Split Hi-Wall']),
    });

    expect(result.componente).toBeNull();
  });
});
