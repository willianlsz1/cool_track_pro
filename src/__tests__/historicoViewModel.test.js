import { describe, expect, it } from 'vitest';
import {
  HISTORICO_ACTIONS,
  HISTORICO_DATA_ATTRIBUTES,
  HISTORICO_PERIOD_OPTIONS,
  HISTORICO_PUBLIC_CLASSES,
  HISTORICO_PUBLIC_IDS,
  HISTORICO_TIPO_OPTIONS,
} from '../ui/viewModels/historicoContracts.js';
import { buildHistoricoViewModel, getProximaStatus } from '../ui/viewModels/historicoViewModel.js';

const NOW = new Date('2026-04-30T12:00:00');

function buildState() {
  return {
    registros: [
      {
        id: 'reg-new',
        equipId: 'eq-1',
        data: '2026-04-30T09:00:00',
        tipo: 'Preventiva mensal',
        obs: 'Troca de filtros',
        tecnico: 'Ana',
        pecas: 'Filtro',
        custoPecas: '100',
        custoMaoObra: 50,
        proxima: '2026-05-05',
        status: 'ok',
        prioridade: 'alta',
      },
      {
        id: 'reg-old',
        equipId: 'eq-2',
        data: '2026-04-20T10:00:00',
        tipo: 'Corretiva urgente',
        obs: 'Compressor',
        tecnico: 'Bruno',
        custoPecas: 0,
        custoMaoObra: 250,
        status: 'warn',
      },
      {
        id: 'reg-invalid',
        equipId: '',
        data: '2026-04-29T08:00:00',
        tipo: 'Limpeza',
      },
    ],
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split Recepcao',
        local: 'Recepcao',
        tag: 'SP-01',
        setorId: 'setor-1',
        clienteId: 'cliente-1',
        status: 'ok',
      },
      {
        id: 'eq-2',
        nome: 'Chiller Central',
        local: 'Casa de maquinas',
        tag: 'CH-01',
        setorId: 'setor-2',
        clienteId: 'cliente-2',
        status: 'danger',
        statusDescricao: 'Critico',
      },
    ],
    setores: [
      { id: 'setor-1', nome: 'Loja', clienteId: 'cliente-1' },
      { id: 'setor-2', nome: 'Casa de maquinas', clienteId: 'cliente-2' },
    ],
    clientes: [
      { id: 'cliente-1', nome: 'Alpha Mercado' },
      { id: 'cliente-2', nome: 'Beta Hospital' },
    ],
  };
}

describe('historico view model', () => {
  it('representa estado vazio sem gerar HTML', () => {
    const vm = buildHistoricoViewModel({
      registros: [],
      equipamentos: [],
      setores: [],
      clientes: [],
      now: NOW,
    });

    expect(vm.list).toEqual([]);
    expect(vm.items).toEqual([]);
    expect(vm.groups).toEqual([]);
    expect(vm.countLabel).toBe('Sem registros');
    expect(vm.emptyState).toMatchObject({ kind: 'empty' });
    expect(Object.keys(vm)).not.toContain('html');
  });

  it('filtra registros invalidos, ordena por data desc e prepara metadados dos cards', () => {
    const state = buildState();
    const vm = buildHistoricoViewModel({ ...state, now: NOW });

    expect(vm.list.map((registro) => registro.id)).toEqual(['reg-new', 'reg-old']);
    expect(vm.items.map((item) => item.id)).toEqual(['reg-new', 'reg-old']);
    expect(vm.items[0]).toMatchObject({
      id: 'reg-new',
      equipId: 'eq-1',
      equipmentName: 'Split Recepcao',
      setorName: 'Loja',
      clienteName: 'Alpha Mercado',
      typePill: { color: 'cyan', label: 'Preventiva mensal' },
      costTotal: 150,
      isToday: true,
      actions: {
        edit: { action: 'edit-reg', id: 'reg-new' },
        delete: { action: 'delete-reg', id: 'reg-new' },
        toggleMenu: { histAction: 'toggle-card-menu', id: 'reg-new' },
      },
    });
    expect(vm.groups.map((group) => group.id)).toEqual(['hoje', 'mes']);
    expect(vm.countLabel).toBe('2 registros');
  });

  it('aplica filtros principais e monta chips ativos como dados', () => {
    const state = buildState();
    const vm = buildHistoricoViewModel({
      ...state,
      filters: {
        busca: 'bruno',
        setorId: 'setor-2',
        equipId: 'eq-2',
        period: '30d',
        tipo: 'corretiva',
      },
      now: NOW,
    });

    expect(vm.list.map((registro) => registro.id)).toEqual(['reg-old']);
    expect(vm.activeFilters).toMatchObject({
      busca: 'bruno',
      setorLabel: 'Casa de maquinas',
      equipLabel: 'Chiller Central',
      period: '30d',
      tipo: 'corretiva',
    });
    expect(vm.activeChips.map((chip) => chip.clearAction)).toEqual([
      'hist-clear-setor',
      'hist-clear-equip',
      'hist-clear-tipo',
      'hist-clear-period',
      'hist-clear-busca',
    ]);
    expect(vm.emptyState).toBeNull();
  });

  it('restringe por cliente e resume servicos do dia', () => {
    const state = buildState();
    const vm = buildHistoricoViewModel({
      ...state,
      clienteFilter: { id: 'cliente-1', nome: 'Alpha Mercado' },
      now: NOW,
    });

    expect(vm.list.map((registro) => registro.id)).toEqual(['reg-new']);
    expect(vm.clienteFilter).toEqual({ id: 'cliente-1', nome: 'Alpha Mercado' });
    expect(vm.todaySummary).toEqual({ totalServicosHoje: 1, totalEquipHoje: 1 });
  });

  it('mantem textos maliciosos como dados e nao como HTML', () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const vm = buildHistoricoViewModel({
      registros: [
        {
          id: 'xss',
          equipId: 'eq-xss',
          data: '2026-04-30T09:00:00',
          tipo: malicious,
          obs: malicious,
          tecnico: malicious,
        },
      ],
      equipamentos: [{ id: 'eq-xss', nome: malicious, status: 'bad' }],
      now: NOW,
    });

    expect(vm.items[0].serviceTitle).toBe(malicious);
    expect(vm.items[0].equipmentName).toBe(malicious);
    expect(JSON.stringify(vm)).toContain(malicious);
    expect(Object.keys(vm.items[0])).not.toContain('html');
    expect(Object.keys(vm)).not.toContain('html');
  });

  it('centraliza contratos publicos da tela legado', () => {
    expect(HISTORICO_PUBLIC_IDS).toMatchObject({
      view: 'view-historico',
      timeline: 'timeline',
      searchInput: 'hist-busca',
      quickfiltersSlot: 'hist-quickfilters-slot',
      activeChipsSlot: 'hist-active-chips-slot',
    });
    expect(HISTORICO_ACTIONS).toMatchObject({
      editReg: 'edit-reg',
      deleteReg: 'delete-reg',
      filterEquip: 'hist-filter-equip',
      openPhoto: 'hist-open-photo',
      viewSignature: 'hist-view-signature',
      clearAll: 'hist-clear-all',
    });
    expect(HISTORICO_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-hist-action', 'data-action', 'data-reg-id', 'data-equip-id']),
    );
    expect(HISTORICO_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining(['timeline__item', 'hist-quickfilter', 'hist-active-chip']),
    );
    expect(HISTORICO_PERIOD_OPTIONS.map((option) => option.id)).toEqual([
      'hoje',
      '7d',
      '30d',
      'tudo',
    ]);
    expect(HISTORICO_TIPO_OPTIONS.map((option) => option.id)).toEqual([
      'preventiva',
      'corretiva',
      'limpeza',
      'recarga',
      'inspecao',
    ]);
  });

  it('permanece puro, sem DOM, React, storage ou router', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(
      path.resolve('./src/ui/viewModels/historicoViewModel.js'),
      'utf-8',
    );

    expect(source).not.toMatch(/\b(document|window|localStorage|sessionStorage|getState|goTo)\b/);
    expect(source).not.toMatch(/react|createRoot|innerHTML/i);
  });

  it('calcula status de proxima manutencao sem depender de Utils', () => {
    expect(getProximaStatus('2026-04-29', NOW)).toMatchObject({
      tone: 'danger',
      label: 'Vencida ha 1 dia',
      days: -1,
    });
    expect(getProximaStatus('2026-04-30', NOW)).toMatchObject({
      tone: 'warn',
      label: 'Vence hoje',
      days: 0,
    });
    expect(getProximaStatus('2026-05-03', NOW)).toMatchObject({
      tone: 'warn',
      label: 'Vence em 3 dias',
      days: 3,
    });
  });
});
