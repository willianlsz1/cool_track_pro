import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  buildHistoricoFiltersSheetModel,
  getHistoricoFiltersSheetEquipOptions,
  HISTORICO_FILTERS_SHEET_CLASSES,
  HISTORICO_FILTERS_SHEET_DATA_ATTRIBUTES,
  HISTORICO_FILTERS_SHEET_IDS,
} from '../ui/components/historicoFiltersSheetModel.js';

const setores = [
  { id: 'setor-1', nome: 'Casa de maquinas' },
  { id: 'setor-2', nome: 'Recepcao' },
];

const equipamentos = [
  { id: 'eq-1', nome: 'Chiller Central', setorId: 'setor-1' },
  { id: 'eq-2', nome: 'Split Recepcao', setorId: 'setor-2' },
  { id: 'eq-3', nome: 'Cassete', setorId: '' },
];

const tipoOptions = [
  { id: 'preventiva', label: 'Preventiva' },
  { id: 'corretiva', label: 'Corretiva' },
];

describe('historico filters sheet model', () => {
  it('centraliza contratos publicos do sheet mobile atual', () => {
    expect(HISTORICO_FILTERS_SHEET_IDS).toEqual(
      expect.objectContaining({
        overlay: 'hist-filters-sheet-overlay',
        title: 'hist-filters-sheet-title',
        setor: 'hfs-setor',
        equip: 'hfs-equip',
        close: 'hfs-close',
        reset: 'hfs-reset',
        apply: 'hfs-apply',
      }),
    );
    expect(HISTORICO_FILTERS_SHEET_CLASSES).toEqual(
      expect.arrayContaining([
        'hist-filters-sheet-overlay',
        'hist-filters-sheet',
        'hist-filters-sheet__select',
        'hist-filters-sheet__tipo-chip',
        'hist-filters-sheet__reset',
        'hist-filters-sheet__apply',
      ]),
    );
    expect(HISTORICO_FILTERS_SHEET_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-tipo-id', 'data-current']),
    );
  });

  it('prepara dados prontos para o adapter sem acessar DOM ou side effects', () => {
    const model = buildHistoricoFiltersSheetModel({
      setores,
      equipamentos,
      tipoOptions,
      initial: { setor: 'setor-1', equip: 'eq-1', tipo: 'preventiva' },
    });

    expect(model.initial).toEqual({ setor: 'setor-1', equip: 'eq-1', tipo: 'preventiva' });
    expect(model.showSetorSelect).toBe(true);
    expect(model.setorOptions).toEqual([
      { id: 'setor-1', label: 'Casa de maquinas', selected: true },
      { id: 'setor-2', label: 'Recepcao', selected: false },
    ]);
    expect(model.equipOptions).toEqual([{ id: 'eq-1', label: 'Chiller Central', selected: true }]);
    expect(model.tipoOptions).toEqual([
      { id: 'preventiva', label: 'Preventiva', active: true },
      { id: 'corretiva', label: 'Corretiva', active: false },
    ]);
  });

  it('recalcula equipamentos por setor preservando o equipamento atual quando ainda valido', () => {
    expect(getHistoricoFiltersSheetEquipOptions({ equipamentos, setorId: 'setor-2' })).toEqual([
      { id: 'eq-2', label: 'Split Recepcao', selected: false },
    ]);
    expect(
      getHistoricoFiltersSheetEquipOptions({
        equipamentos,
        setorId: '',
        currentEquipId: 'eq-3',
      }),
    ).toEqual([
      { id: 'eq-1', label: 'Chiller Central', selected: false },
      { id: 'eq-2', label: 'Split Recepcao', selected: false },
      { id: 'eq-3', label: 'Cassete', selected: true },
    ]);
  });

  it('normaliza valores ausentes e mantem payloads maliciosos como texto inerte', () => {
    const malicious = '<img src=x onerror=alert(1)>javascript:alert(2)';
    const model = buildHistoricoFiltersSheetModel({
      setores: [{ id: 'setor-xss" onclick="alert(1)', nome: malicious }],
      equipamentos: [
        {
          id: 'eq-xss" data-injected="1',
          nome: malicious,
          setorId: 'setor-xss" onclick="alert(1)',
        },
      ],
      tipoOptions: [{ id: 'tipo-xss" onclick="alert(1)', label: malicious }],
      initial: {},
    });

    expect(model.initial).toEqual({ setor: '', equip: '', tipo: '' });
    expect(model.setorOptions[0].label).toBe(malicious);
    expect(model.equipOptions[0].label).toBe(malicious);
    expect(model.tipoOptions[0].label).toBe(malicious);
  });

  it('fica isolado de React, DOM, storage, router e fluxos criticos', () => {
    const source = readFileSync('src/ui/components/historicoFiltersSheetModel.js', 'utf8');

    expect(source).not.toMatch(
      /\b(document|window|localStorage|sessionStorage|React|createRoot|innerHTML|Storage|goTo|Photos|SignatureViewerModal)\b/,
    );
  });
});
