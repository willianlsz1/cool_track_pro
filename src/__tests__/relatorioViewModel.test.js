import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  RELATORIO_ACTIONS,
  RELATORIO_DATA_ATTRIBUTES,
  RELATORIO_PUBLIC_CLASSES,
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../ui/viewModels/relatorioContracts.js';
import {
  buildPeriodNarrative,
  buildRelatorioViewModel,
  getProximasAcoes,
  shouldShowCorretivasBanner,
} from '../ui/viewModels/relatorioViewModel.js';

const NOW = new Date('2026-04-30T12:00:00');

function collectKeys(value, keys = []) {
  if (!value || typeof value !== 'object') return keys;
  Object.keys(value).forEach((key) => {
    keys.push(key);
    collectKeys(value[key], keys);
  });
  return keys;
}

function buildState() {
  return {
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split Recepcao',
        tag: 'SP-01',
        local: 'Recepcao',
        clienteId: 'cliente-1',
        setorId: 'setor-1',
      },
      {
        id: 'eq-2',
        nome: 'Chiller Central',
        tag: 'CH-01',
        local: 'Casa de maquinas',
        clienteId: 'cliente-2',
        setorId: 'setor-2',
      },
    ],
    clientes: [
      { id: 'cliente-1', nome: 'Cliente Alpha' },
      { id: 'cliente-2', nome: 'Cliente Beta' },
    ],
    setores: [
      { id: 'setor-1', nome: 'Sala 1', clienteId: 'cliente-1' },
      { id: 'setor-2', nome: 'Central', clienteId: 'cliente-2' },
    ],
    registros: [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-04-20T09:00:00',
        tipo: 'Manutencao Preventiva',
        custoPecas: '100',
        custoMaoObra: '50',
        proxima: '2026-05-03',
      },
      {
        id: 'reg-2',
        equipId: 'eq-1',
        data: '2026-04-15T09:00:00',
        tipo: 'Manutencao Corretiva',
        custoPecas: '10',
        custoMaoObra: '5',
        proxima: '2026-04-25',
      },
      {
        id: 'reg-3',
        equipId: 'eq-2',
        data: '2026-03-15T09:00:00',
        tipo: 'Inspecao Geral',
        custoPecas: '0',
        custoMaoObra: '0',
        proxima: '2026-06-01',
      },
    ],
  };
}

const dateHelpers = {
  now: NOW,
  daysUntil: (iso) => {
    const target = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
    const today = new Date('2026-04-30T00:00:00');
    return Math.round((target - today) / 86400000);
  },
  formatDueRelative: (iso) => {
    const days = dateHelpers.daysUntil(iso);
    if (days === 0) return 'vence hoje';
    if (days > 0) return `daqui ${days}d`;
    return `atrasada ${Math.abs(days)}d`;
  },
  formatShortDateRange: (de, ate) => `${de || '*'} -> ${ate || '*'}`,
};

describe('relatorio view model', () => {
  it('representa estado vazio sem DOM, React, storage, PDF ou assinatura', () => {
    const vm = buildRelatorioViewModel({
      equipamentos: [],
      registros: [],
      clientes: [],
      setores: [],
      isPro: false,
      filters: {},
      ...dateHelpers,
    });

    expect(vm.isEmpty).toBe(true);
    expect(vm.records).toEqual([]);
    expect(vm.kpis).toMatchObject({
      count: 0,
      total: 0,
      mostCommonType: null,
      nextDue: null,
    });
    expect(vm.filters).toMatchObject({
      equipId: '',
      de: '',
      ate: '',
      hasPeriodoFilter: false,
      hasEquipFilter: false,
      periodoTxt: 'Todo o per\u00edodo',
      equipTxt: 'Todos os equipamentos',
    });
    expect(vm.modeCopy).toMatchObject({
      pageTitle: 'Seus relat\u00f3rios',
      pageSubtitle: 'Veja servi\u00e7os por cliente, equipamento ou setor.',
      heroBrand: 'Relat\u00f3rio livre',
    });
    expect(vm.reportSummary).toEqual({
      servicos: 0,
      equipamentos: 0,
      periodo: 'todo o per\u00edodo',
    });
    expect(vm.narrative).toBeNull();
    expect(vm.proximasAcoes).toEqual([]);
    expect(collectKeys(vm).join(' ')).not.toMatch(/html|innerHTML|dangerouslySetInnerHTML/i);
  });

  it('filtra registros, calcula KPIs e prepara contexto Pro sem side effects', () => {
    const state = buildState();
    const vm = buildRelatorioViewModel({
      ...state,
      isPro: true,
      viewMode: RELATORIO_VIEW_MODES.detailed,
      filters: {
        equipId: 'eq-1',
        de: '2026-04-01',
        ate: '2026-04-30',
      },
      pmocSummary: { status: 'atencao' },
      ...dateHelpers,
    });

    expect(vm.records.map((registro) => registro.id)).toEqual(['reg-1', 'reg-2']);
    expect(vm.isEmpty).toBe(false);
    expect(vm.viewMode).toBe(RELATORIO_VIEW_MODES.detailed);
    expect(vm.filters).toMatchObject({
      hasPeriodoFilter: true,
      hasEquipFilter: true,
      periodoTxt: '2026-04-01 -> 2026-04-30',
      equipTxt: 'Split Recepcao',
      singleEquipFilter: true,
    });
    expect(vm.context).toMatchObject({
      cliente: { id: 'cliente-1', nome: 'Cliente Alpha' },
      setor: { id: 'setor-1', nome: 'Sala 1' },
      equipamento: { id: 'eq-1', nome: 'Split Recepcao' },
    });
    expect(vm.modeCopy).toMatchObject({
      pageTitle: 'Seus relat\u00f3rios',
      pageSubtitle: 'Veja servi\u00e7os por cliente, equipamento ou setor.',
      heroBrand: 'Relat\u00f3rio livre',
    });
    expect(vm.reportSummary).toEqual({
      servicos: 2,
      equipamentos: 1,
      periodo: '2026-04-01 -> 2026-04-30',
    });
    expect(vm.hasPmocAttention).toBe(true);
    expect(vm.kpis).toMatchObject({
      count: 2,
      total: 165,
      mostCommonType: 'Manutencao Preventiva',
      mostCommonCount: 1,
    });
    expect(vm.kpis.nextDue).toMatchObject({ iso: '2026-05-03', n: 3 });
    expect(vm.corretivasCount).toBe(1);
    expect(vm.showCorretivasBanner).toBe(false);
    expect(vm.proximasAcoes.map((item) => item.equipId)).toEqual(['eq-1']);
    expect(vm.actions).toEqual(
      expect.objectContaining({
        exportPdf: RELATORIO_ACTIONS.exportPdf,
        whatsappExport: RELATORIO_ACTIONS.whatsappExport,
        toggleCard: RELATORIO_ACTIONS.toggleCard,
      }),
    );
  });

  it('normaliza entradas invalidas e mantem textos maliciosos como dados, nao HTML', () => {
    const vm = buildRelatorioViewModel({
      equipamentos: [
        {
          id: 'eq-x',
          nome: '<img src=x onerror=alert(1)>',
          tag: '<svg onload=alert(1)>',
        },
      ],
      registros: [
        {
          id: 'reg-x',
          equipId: 'eq-x',
          data: '2026-04-10T09:00:00',
          tipo: '<script>alert(1)</script>',
          obs: '<b onclick=alert(1)>x</b>',
          proxima: 'not-a-date',
        },
        null,
        { id: 'sem-data', equipId: 'eq-x' },
      ],
      clientes: 'invalid',
      setores: null,
      filters: { equipId: 'eq-x' },
      ...dateHelpers,
    });

    expect(vm.records.map((registro) => registro.id)).toEqual(['reg-x', 'sem-data']);
    expect(vm.filters.equipTxt).toBe('<img src=x onerror=alert(1)>');
    expect(vm.kpis.mostCommonType).toBe('<script>alert(1)</script>');
    expect(JSON.stringify(vm)).toContain('<script>alert(1)</script>');
    expect(collectKeys(vm).join(' ')).not.toMatch(/html|dangerouslySetInnerHTML/i);
  });

  it('mantem helpers puros usados pelo adapter legado', () => {
    const narrative = buildPeriodNarrative([
      { equipId: 'eq-1', tipo: 'Manutencao Preventiva' },
      { equipId: 'eq-2', tipo: 'Manutencao Corretiva' },
      { equipId: 'eq-2', tipo: 'Manutencao Corretiva' },
    ]);

    expect(narrative).toMatchObject({
      total: 3,
      equipsUnicos: 2,
      tipoTop: 'Manutencao Corretiva',
      tipoTopCount: 2,
      corretivas: 2,
    });
    expect(shouldShowCorretivasBanner(2, 3)).toBe(true);
    expect(
      getProximasAcoes(
        [
          { equipId: 'eq-1', proxima: '2026-05-05' },
          { equipId: 'eq-1', proxima: '2026-05-01' },
          { equipId: 'eq-2', proxima: '2026-06-15' },
        ],
        [{ id: 'eq-1', nome: 'Split Recepcao', tag: 'SP-01' }],
        5,
        14,
        dateHelpers,
      ),
    ).toEqual([
      expect.objectContaining({
        equipId: 'eq-1',
        equipNome: 'Split Recepcao',
        daysUntil: 1,
        label: 'daqui 1d',
      }),
    ]);
  });

  it('centraliza contratos publicos para futura ilha React', () => {
    expect(RELATORIO_PUBLIC_IDS).toMatchObject({
      view: 'view-relatorio',
      hero: 'rel-hero',
      filters: 'rel-filters',
      filtersChips: 'rel-filters-chips',
      filtersAdvanced: 'rel-filters-advanced',
      equipSelect: 'rel-equip',
      dateFrom: 'rel-de',
      dateTo: 'rel-ate',
      body: 'relatorio-corpo',
      pdfQuotaSlot: 'pdf-quota-slot',
    });
    expect(RELATORIO_ACTIONS).toMatchObject({
      exportPdf: 'export-pdf',
      whatsappExport: 'whatsapp-export',
      toggleAdvanced: 'rel-toggle-advanced',
      clearFilters: 'rel-clear-filters',
      viewSignature: 'rel-view-signature',
      toggleCard: 'rel-toggle-card',
      openPmocModal: 'open-pmoc-modal',
    });
    expect(RELATORIO_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-rel-action', 'data-nav', 'data-id']),
    );
    expect(RELATORIO_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'servicos-toggle',
        'rel-toolbar',
        'rel-hero',
        'rel-kpi',
        'rel-chip',
        'rel-record',
        'rel-empty',
        'rel-sigthumb',
      ]),
    );
  });

  it('nao importa infraestrutura proibida no view model puro', () => {
    const source = readFileSync('src/ui/viewModels/relatorioViewModel.js', 'utf8');
    expect(source).not.toMatch(/from ['"].*react|react-dom|createRoot/i);
    expect(source).not.toMatch(/from ['"].*(router|storage|backend|pdf|signature)/i);
    expect(source).not.toMatch(/\b(document|window|localStorage|sessionStorage)\b/);
  });
});
