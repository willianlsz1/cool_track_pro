import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setupDom({ equipValue = '', de = '', ate = '' } = {}) {
  document.body.innerHTML = `
    <div id="view-relatorio">
      <h1 id="rel-main-title"></h1>
      <p id="rel-main-subtitle"></p>
      <div id="rel-mode-segment-slot"></div>
      <div id="rel-hero" class="rel-hero" aria-live="polite"></div>
      <div id="rel-filters" class="rel-filters">
        <div id="rel-filters-chips"></div>
        <div id="rel-filters-advanced" hidden></div>
        <select id="rel-equip"><option value="${equipValue}" selected>${equipValue}</option></select>
        <input id="rel-de" value="${de}" />
        <input id="rel-ate" value="${ate}" />
      </div>
      <div id="rel-company-pmoc-slot"></div>
      <div id="relatorio-corpo"></div>
      <div id="rel-dd-pmoc-main"></div>
      <div id="rel-dd-pmoc-info"></div>
      <div id="rel-dd-pmoc-nudge"></div>
    </div>
  `;
}

async function loadRelatorioView({ state, planCode = 'free' }) {
  vi.resetModules();

  const getState = vi.fn(() => state);
  const findEquip = vi.fn(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  const refreshQuota = vi.fn();
  const getPmocSummaryForCliente = vi.fn(() => null);
  const getSignatureForRecord = vi.fn(() => null);
  const signatureOpen = vi.fn();

  vi.doMock('../core/state.js', () => ({
    getState,
    findEquip,
  }));
  vi.doMock('../core/plans/planCache.js', () => ({
    getCachedPlan: vi.fn(() => planCode),
  }));
  vi.doMock('../ui/components/skeleton.js', () => ({
    withSkeleton: (_el, _opts, renderFn) => renderFn(),
  }));
  vi.doMock('../domain/maintenance.js', () => ({
    CRITICIDADE_LABEL: { media: 'Media', alta: 'Alta' },
    PRIORIDADE_OPERACIONAL_LABEL: { normal: 'Normal', alta: 'Alta' },
  }));
  vi.doMock('../domain/dadosPlacaDisplay.js', () => ({
    formatDadosPlacaRows: vi.fn(() => []),
  }));
  vi.doMock('../ui/components/pdfQuotaBadge.js', () => ({
    PdfQuotaBadge: { refresh: refreshQuota },
  }));
  vi.doMock('../ui/components/signature.js', () => ({
    getSignatureForRecord,
    SignatureViewerModal: { open: signatureOpen },
  }));
  vi.doMock('../core/pmocProgress.js', () => ({
    getPmocSummaryForCliente,
  }));

  const module = await import('../ui/views/relatorio.js');
  return {
    ...module,
    mocks: {
      findEquip,
      getPmocSummaryForCliente,
      getSignatureForRecord,
      refreshQuota,
      signatureOpen,
    },
  };
}

function emptyState() {
  return {
    equipamentos: [],
    registros: [],
    clientes: [],
    setores: [],
  };
}

function reportState() {
  const equipamento = {
    id: 'eq-1',
    nome: 'Split Recepcao',
    tag: 'SP-01',
    local: 'Recepcao',
    fluido: 'R410A',
    criticidade: 'media',
    prioridadeOperacional: 'normal',
    periodicidadePreventivaDias: 30,
  };

  return {
    equipamentos: [equipamento],
    registros: [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-04-20T09:00:00',
        tipo: 'Manuten\u00e7\u00e3o Preventiva',
        tecnico: 'Ana',
        status: 'ok',
        custoPecas: 100,
        custoMaoObra: 20,
        proxima: '2026-05-10',
      },
      {
        id: 'reg-2',
        equipId: 'eq-1',
        data: '2026-04-15T09:00:00',
        tipo: 'Manuten\u00e7\u00e3o Preventiva',
        tecnico: 'Bia',
        status: 'ok',
        custoPecas: 10,
        custoMaoObra: 5,
        proxima: '2026-05-03',
      },
      {
        id: 'reg-3',
        equipId: 'eq-1',
        data: '2026-04-10T09:00:00',
        tipo: 'Manuten\u00e7\u00e3o Corretiva',
        tecnico: 'Caio',
        status: 'warn',
        custoPecas: 0,
        custoMaoObra: 0,
      },
    ],
    clientes: [],
    setores: [],
  };
}

function expectClass(element, className) {
  expect(element?.classList.contains(className)).toBe(true);
}

function expectText(element, expected) {
  const text = element?.textContent || '';
  if (expected instanceof RegExp) {
    expect(text).toMatch(expected);
    return;
  }
  expect(text).toContain(expected);
}

function expectNoText(element, expected) {
  expect(element?.textContent || '').not.toContain(expected);
}

function expectAttribute(element, name, value) {
  expect(element?.getAttribute(name)).toBe(value);
}

async function renderWithReactHero(renderRelatorio) {
  await act(async () => {
    await renderRelatorio();
  });
}

describe('relatorio legacy #rel-hero render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renderiza estado vazio preservando ids, classes e fallbacks dos KPIs', async () => {
    setupDom();
    const { renderRelatorio } = await loadRelatorioView({ state: emptyState() });

    await renderWithReactHero(renderRelatorio);

    const view = document.querySelector('#view-relatorio');
    const hero = document.querySelector('#rel-hero');
    expect(view).not.toBeNull();
    expect(hero).not.toBeNull();
    expectClass(hero, 'rel-hero');
    expectClass(hero.querySelector('#rel-hero-title'), 'rel-hero__title');
    expect(hero.querySelector('.rel-hero__brand')).not.toBeNull();
    expect(hero.querySelector('.rel-hero__meta')).not.toBeNull();
    expect(hero.querySelector('.rel-hero__kpis')).not.toBeNull();

    const kpi = hero.querySelector('.rel-kpi');
    expect(kpi).not.toBeNull();
    expect(kpi.querySelector('.rel-kpi__row')).not.toBeNull();
    expect(kpi.querySelector('.rel-kpi__icon')).not.toBeNull();
    expectText(kpi.querySelector('.rel-kpi__value'), '0');
    expectText(kpi.querySelector('.rel-kpi__label'), 'Registros');
    expectText(hero, 'Todo o per\u00edodo');
    expectText(hero, 'Todos os equipamentos');
    expectNoText(hero, 'Custo total');
    expectNoText(hero, 'Tipo mais comum');
    expectNoText(hero, 'Pr\u00f3x. vencimento');
  });

  it('renderiza relat\u00f3rio com dados preservando narrativa, custo, tipo comum e vencimento', async () => {
    setupDom();
    const { renderRelatorio } = await loadRelatorioView({ state: reportState() });

    await renderWithReactHero(renderRelatorio);

    const hero = document.querySelector('#rel-hero');
    expectText(hero.querySelector('.rel-hero__narrative'), '3 atendimentos em 1 equipamento');
    expectText(hero.querySelector('.rel-hero__narrative'), 'predom\u00ednio de Preventiva (67%)');
    expectText(hero.querySelector('.rel-hero__narrative'), '1 corretiva');
    expectText(hero, 'R$ 135,00');
    expectText(hero, /2\u00d7\s+Preventiva/);
    expectText(hero, 'Pr\u00f3x. vencimento');

    const kpis = [...hero.querySelectorAll('.rel-kpi')];
    expect(kpis.length).toBeGreaterThanOrEqual(4);
    expect(kpis.every((kpi) => kpi.querySelector('.rel-kpi__row'))).toBe(true);
    expect(kpis.every((kpi) => kpi.querySelector('.rel-kpi__icon'))).toBe(true);
    expect(kpis.every((kpi) => kpi.querySelector('.rel-kpi__value'))).toBe(true);
    expect(kpis.every((kpi) => kpi.querySelector('.rel-kpi__label'))).toBe(true);
  });

  it('preserva data-view-mode para compacto e detalhado sem quebrar o hero', async () => {
    localStorage.setItem('cooltrack_relatorio_view_mode', 'detailed');
    setupDom();
    const { renderRelatorio } = await loadRelatorioView({ state: reportState() });

    await renderWithReactHero(renderRelatorio);

    const hero = document.querySelector('#rel-hero');
    const compact = hero.querySelector('[data-view-mode="compact"]');
    const detailed = hero.querySelector('[data-view-mode="detailed"]');
    expect(compact).not.toBeNull();
    expect(detailed).not.toBeNull();
    expectAttribute(compact, 'role', 'radio');
    expectAttribute(detailed, 'role', 'radio');
    expectAttribute(detailed, 'aria-checked', 'true');
    expectClass(detailed, 'is-active');
    expect(hero.querySelector('#rel-hero-title')).not.toBeNull();
  });

  it('escapa textos din\u00e2micos do hero sem injetar HTML/script/event handler', async () => {
    setupDom({ equipValue: 'eq-x' });
    const state = {
      equipamentos: [
        {
          id: 'eq-x',
          nome: '<img src=x onerror=alert(1)>',
          tag: 'X',
          local: '<svg onload=alert(1)>',
          clienteId: 'cliente-x',
          setorId: 'setor-x',
        },
      ],
      clientes: [{ id: 'cliente-x', nome: '<script>alert(1)</script>' }],
      setores: [{ id: 'setor-x', nome: '<span onclick=alert(1)>Setor</span>' }],
      registros: [
        {
          id: 'reg-x',
          equipId: 'eq-x',
          data: '2026-04-20T09:00:00',
          tipo: '<img src=x onerror=alert(1)>',
          tecnico: '<b onclick=alert(1)>Ana</b>',
          status: 'ok',
          custoPecas: 1,
          custoMaoObra: 1,
          proxima: 'javascript:alert(1)',
        },
      ],
    };
    const { renderRelatorio } = await loadRelatorioView({ state, planCode: 'pro' });

    await renderWithReactHero(renderRelatorio);

    const hero = document.querySelector('#rel-hero');
    expect(hero.innerHTML).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(hero.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(hero.querySelector('script')).toBeNull();
    expect(hero.querySelector('img')).toBeNull();
    expect(hero.querySelector('[onclick]')).toBeNull();
    expect(hero.querySelector('[onerror]')).toBeNull();
    expect(hero.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
  });

  it('continua legado e nao importa React/createRoot no render do relatorio', () => {
    const source = readFileSync('src/ui/views/relatorio.js', 'utf8');
    expect(source).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(source).not.toMatch(/\bcreateRoot\b/);
    expect(source).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
