import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mocks ───────────────────────────────────────────────────────────────────
// Testamos só os helpers puros (sem DOM/state). Mockamos tudo que é side-effect
// pra não carregar o mundo. Utils é real — getProximaStatus depende de
// Utils.daysDiff pra fazer a conta certa.

vi.mock('../core/state.js', () => ({
  getState: vi.fn(() => ({ registros: [], equipamentos: [], setores: [] })),
  findEquip: vi.fn(),
  setState: vi.fn(),
}));
vi.mock('../core/storage.js', () => ({
  Storage: { markRegistroDeleted: vi.fn() },
}));
vi.mock('../core/toast.js', () => ({
  Toast: { success: vi.fn(), warning: vi.fn() },
}));
vi.mock('../core/router.js', () => ({
  goTo: vi.fn(),
}));
vi.mock('../ui/components/emptyState.js', () => ({
  emptyStateHtml: vi.fn(() => ''),
}));
vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { applyIfPending: vi.fn() },
}));
vi.mock('../ui/components/photos.js', () => ({
  Photos: { openLightbox: vi.fn() },
}));
vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: (_el, _opts, fn) => fn(),
}));
vi.mock('../ui/views/dashboard.js', () => ({
  updateHeader: vi.fn(),
}));
vi.mock('../ui/composables/header.js', () => ({
  updateGlobalHeader: vi.fn(),
}));

vi.mock('../core/equipmentRules.js', () => ({
  getOperationalStatus: vi.fn(() => ({ uiStatus: 'ok', label: 'Em dia' })),
}));
vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPro: vi.fn(() => false),
}));
vi.mock('../core/clientePmoc.js', () => ({
  buildClientePmocDetails: vi.fn(() => ({ status: 'em_dia', statusLabel: 'Em dia' })),
}));
beforeEach(() => {
  vi.clearAllMocks();
});

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function localDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

describe('getHistInsights', () => {
  it('retorna zeros quando a lista está vazia', async () => {
    const { getHistInsights } = await import('../ui/views/historico.js');
    expect(getHistInsights([], [])).toEqual({
      preventivasCount: 0,
      corretivasCount: 0,
      equipsAtendidos: 0,
      equipsAtencao: 0,
    });
  });

  it('conta preventivas e corretivas por keyword no tipo', async () => {
    const { getHistInsights } = await import('../ui/views/historico.js');
    const result = getHistInsights(
      [
        { equipId: 'e1', tipo: 'Preventiva mensal' },
        { equipId: 'e2', tipo: 'preventiva' },
        { equipId: 'e3', tipo: 'Corretiva urgente' },
        { equipId: 'e4', tipo: 'Limpeza de filtros' }, // nem preventiva nem corretiva
      ],
      [],
    );
    expect(result.preventivasCount).toBe(2);
    expect(result.corretivasCount).toBe(1);
  });

  it('conta equipamentos atendidos (únicos) no período', async () => {
    const { getHistInsights } = await import('../ui/views/historico.js');
    const result = getHistInsights(
      [
        { equipId: 'e1', tipo: 'a' },
        { equipId: 'e1', tipo: 'b' }, // mesmo equip — não recontar
        { equipId: 'e2', tipo: 'c' },
      ],
      [],
    );
    expect(result.equipsAtendidos).toBe(2);
  });

  it('conta equipsAtencao apenas entre atendidos (não em todos os equipamentos)', async () => {
    const { getHistInsights } = await import('../ui/views/historico.js');
    const equipamentos = [
      { id: 'e1', status: 'ok' },
      { id: 'e2', status: 'warn' }, // atendido — conta
      { id: 'e3', status: 'danger' }, // NÃO foi atendido no período — não conta
      { id: 'e4', status: 'danger' }, // atendido — conta
    ];
    const result = getHistInsights(
      [
        { equipId: 'e1', tipo: 'preventiva' },
        { equipId: 'e2', tipo: 'corretiva' },
        { equipId: 'e4', tipo: 'limpeza' },
      ],
      equipamentos,
    );
    expect(result.equipsAtencao).toBe(2);
  });

  it('ignora equipId ausente sem quebrar', async () => {
    const { getHistInsights } = await import('../ui/views/historico.js');
    const result = getHistInsights(
      [{ tipo: 'preventiva' }, { equipId: 'e1', tipo: 'preventiva' }],
      [],
    );
    expect(result.equipsAtendidos).toBe(1);
    expect(result.preventivasCount).toBe(2);
  });
});

describe('getRecurringEquips', () => {
  it('retorna vazio quando lista está vazia', async () => {
    const { getRecurringEquips } = await import('../ui/views/historico.js');
    expect(getRecurringEquips([])).toEqual([]);
  });

  it('detecta equipamentos com 3+ registros na janela de 14 dias', async () => {
    const { getRecurringEquips } = await import('../ui/views/historico.js');
    const hoje = new Date();
    const diasAtras = (n) => new Date(hoje.getTime() - n * 86400000).toISOString();
    const list = [
      { equipId: 'e1', data: diasAtras(1) },
      { equipId: 'e1', data: diasAtras(5) },
      { equipId: 'e1', data: diasAtras(10) },
      { equipId: 'e2', data: diasAtras(2) }, // só 1 registro — não entra
    ];
    const result = getRecurringEquips(list);
    expect(result).toEqual([{ equipId: 'e1', count: 3 }]);
  });

  it('ignora registros fora da janela', async () => {
    const { getRecurringEquips } = await import('../ui/views/historico.js');
    const hoje = new Date();
    const diasAtras = (n) => new Date(hoje.getTime() - n * 86400000).toISOString();
    const list = [
      { equipId: 'e1', data: diasAtras(1) },
      { equipId: 'e1', data: diasAtras(5) },
      { equipId: 'e1', data: diasAtras(20) }, // fora da janela de 14d
    ];
    expect(getRecurringEquips(list)).toEqual([]);
  });

  it('ordena por count desc quando há múltiplos equipamentos', async () => {
    const { getRecurringEquips } = await import('../ui/views/historico.js');
    const hoje = new Date();
    const diasAtras = (n) => new Date(hoje.getTime() - n * 86400000).toISOString();
    const list = [
      { equipId: 'e1', data: diasAtras(1) },
      { equipId: 'e1', data: diasAtras(2) },
      { equipId: 'e1', data: diasAtras(3) },
      { equipId: 'e2', data: diasAtras(1) },
      { equipId: 'e2', data: diasAtras(2) },
      { equipId: 'e2', data: diasAtras(3) },
      { equipId: 'e2', data: diasAtras(4) },
    ];
    const result = getRecurringEquips(list);
    expect(result[0]).toEqual({ equipId: 'e2', count: 4 });
    expect(result[1]).toEqual({ equipId: 'e1', count: 3 });
  });

  it('respeita days e threshold customizados', async () => {
    const { getRecurringEquips } = await import('../ui/views/historico.js');
    const hoje = new Date();
    const diasAtras = (n) => new Date(hoje.getTime() - n * 86400000).toISOString();
    const list = [
      { equipId: 'e1', data: diasAtras(1) },
      { equipId: 'e1', data: diasAtras(2) },
      { equipId: 'e1', data: diasAtras(10) }, // fora da janela custom de 5d
    ];
    const result = getRecurringEquips(list, 5, 2);
    expect(result).toEqual([{ equipId: 'e1', count: 2 }]);
  });
});

describe('getProximaStatus', () => {
  it('retorna null quando não há data', async () => {
    const { getProximaStatus } = await import('../ui/views/historico.js');
    expect(getProximaStatus(null)).toBeNull();
    expect(getProximaStatus(undefined)).toBeNull();
    expect(getProximaStatus('')).toBeNull();
  });

  it('marca como danger quando data está no passado', async () => {
    const { getProximaStatus } = await import('../ui/views/historico.js');
    const iso = localDateOffset(-1);
    const result = getProximaStatus(iso);
    expect(result.tone).toBe('danger');
    expect(result.label).toMatch(/Vencida há 1 dia/);
    expect(result.days).toBe(-1);
  });

  it('usa plural quando passou mais de 1 dia', async () => {
    const { getProximaStatus } = await import('../ui/views/historico.js');
    const iso = localDateOffset(-5);
    const result = getProximaStatus(iso);
    expect(result.label).toMatch(/Vencida há 5 dias/);
  });

  it('marca como warn "Vence hoje" quando data é hoje', async () => {
    const { getProximaStatus } = await import('../ui/views/historico.js');
    const hoje = localDateOffset(0);
    const result = getProximaStatus(hoje);
    expect(result.tone).toBe('warn');
    expect(result.label).toBe('Vence hoje');
    expect(result.days).toBe(0);
  });

  it('marca como warn quando está a ≤7 dias no futuro', async () => {
    const { getProximaStatus } = await import('../ui/views/historico.js');
    const iso = localDateOffset(3);
    const result = getProximaStatus(iso);
    expect(result.tone).toBe('warn');
    expect(result.label).toMatch(/Vence em 3 dias/);
  });

  it('marca como neutral quando está a >7 dias no futuro', async () => {
    const { getProximaStatus } = await import('../ui/views/historico.js');
    const iso = localDateOffset(30);
    const result = getProximaStatus(iso);
    expect(result.tone).toBe('neutral');
    expect(result.label).toMatch(/Próxima em 30 dias/);
  });
});

describe('getTodaySummary', () => {
  it('resume apenas os registros de hoje e conta equipamentos únicos', async () => {
    const { getTodaySummary } = await import('../ui/views/historico.js');
    const today = localDateString();
    const result = getTodaySummary([
      { id: '1', equipId: 'eq-1', data: `${today}T08:00:00.000Z` },
      { id: '2', equipId: 'eq-1', data: `${today}T09:00:00.000Z` },
      { id: '3', equipId: 'eq-2', data: `${today}T10:00:00.000Z` },
      { id: '4', equipId: 'eq-3', data: `${localDateOffset(-1)}T10:00:00.000Z` },
    ]);
    expect(result).toEqual({ totalServicosHoje: 3, totalEquipHoje: 2 });
  });
});

describe('getAttentionItems', () => {
  it('retorna atenção para próxima manutenção vencida e status crítico', async () => {
    const { getAttentionItems } = await import('../ui/views/historico.js');
    const attention = getAttentionItems({
      registros: [
        {
          id: 'r1',
          equipId: 'eq-1',
          data: `${localDateString()}T08:00:00.000Z`,
          proxima: localDateOffset(-2),
        },
      ],
      equipamentos: [{ id: 'eq-1', nome: 'Split Sala', status: 'danger' }],
      clientes: [],
      setores: [],
      isPro: false,
    });
    expect(attention.length).toBeGreaterThan(0);
    expect(attention.some((i) => i.id === 'proxima-eq-1')).toBe(true);
    expect(attention.some((i) => i.id === 'status-eq-1')).toBe(true);
  });
});

describe('getEquipStatusPill', () => {
  it('retorna null quando eq está ausente ou sem status', async () => {
    const { getEquipStatusPill } = await import('../ui/views/historico.js');
    expect(getEquipStatusPill(null)).toBeNull();
    expect(getEquipStatusPill({ id: 'e1' })).toBeNull();
    expect(getEquipStatusPill({ id: 'e1', status: '' })).toBeNull();
  });

  it('mapeia status=ok para tone=ok com label default', async () => {
    const { getEquipStatusPill } = await import('../ui/views/historico.js');
    const result = getEquipStatusPill({ status: 'ok' });
    expect(result.tone).toBe('ok');
    expect(result.label).toBe('Em dia');
  });

  it('mapeia status=warn para tone=warn com label default', async () => {
    const { getEquipStatusPill } = await import('../ui/views/historico.js');
    const result = getEquipStatusPill({ status: 'warn' });
    expect(result.tone).toBe('warn');
    expect(result.label).toBe('Atenção');
  });

  it('mapeia status=danger para tone=danger com label default', async () => {
    const { getEquipStatusPill } = await import('../ui/views/historico.js');
    const result = getEquipStatusPill({ status: 'danger' });
    expect(result.tone).toBe('danger');
    expect(result.label).toBe('Crítico');
  });

  it('prefere statusDescricao quando presente', async () => {
    const { getEquipStatusPill } = await import('../ui/views/historico.js');
    const result = getEquipStatusPill({
      status: 'warn',
      statusDescricao: 'Preventiva vencida há 3 dias',
    });
    expect(result.tone).toBe('warn');
    expect(result.label).toBe('Preventiva vencida há 3 dias');
  });
});

describe('histórico — acesso completo para todos os planos (sem corte por data)', () => {
  it('o plano Free não define `historicoDias` — histórico é ilimitado no tempo', async () => {
    const plans = await import('../core/plans/subscriptionPlans.js');
    const freeLimits = plans.PLAN_CATALOG[plans.PLAN_CODE_FREE].limits;
    expect(freeLimits.historicoDias).toBeUndefined();
  });

  it('a perk do Free menciona "histórico completo", não mais 15 dias', async () => {
    const plans = await import('../core/plans/subscriptionPlans.js');
    const freePerks = plans.PLAN_CATALOG[plans.PLAN_CODE_FREE].perks;
    const joined = freePerks.join(' ').toLowerCase();
    expect(joined).toContain('histórico completo');
    expect(joined).not.toContain('15 dias');
  });

  it('historico view não usa mais `isCachedPlanPlusOrHigher` pra filtrar histórico', async () => {
    // Ajuda a detectar regressão se alguém reintroduzir um corte temporal
    // baseado em plano. O módulo continua válido pra outras features, mas
    // historico.js não deve importar ele.
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(path.resolve('./src/ui/views/historico.js'), 'utf-8');
    expect(source).not.toMatch(/isCachedPlanPlusOrHigher/);
    expect(source).not.toMatch(/HIST_FREE_LIMIT_DAYS/);
  });
});

describe('renderHist runtime safety', () => {
  it('não quebra com registros do mês e com dados malformados', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));

    document.body.innerHTML = `
      <input id="hist-busca" value="" />
      <select id="hist-equip"></select>
      <select id="hist-setor"></select>
      <div id="hist-quickfilters-slot"></div>
      <div id="hist-active-chips-slot"></div>
      <div id="hist-count"></div>
      <div id="timeline"></div>
    `;

    const stateMod = await import('../core/state.js');
    stateMod.getState.mockReturnValue({
      registros: [
        { id: 'r-mes', equipId: 'e1', data: '2026-04-10', tipo: 'preventiva', obs: 'ok' },
        { id: 'r-bad-1', equipId: 'e1', data: null, tipo: null, obs: null },
        { id: 'r-bad-2', equipId: null, data: '2026-04-22' },
      ],
      equipamentos: [{ id: 'e1', nome: 'Split 01', status: 'ok' }],
      setores: [],
    });

    const { renderHist } = await import('../ui/views/historico.js');

    expect(() => renderHist()).not.toThrow();

    vi.useRealTimers();
  });
});
