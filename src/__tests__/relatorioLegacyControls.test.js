import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setupDom() {
  document.body.innerHTML = renderShellViews();
}

function baseEquipamentos() {
  return [
    {
      id: 'eq-1',
      nome: 'Split Recepcao',
      tag: 'SP-01',
      local: 'Recepcao',
      clienteId: 'cliente-1',
      setorId: 'setor-1',
      fluido: 'R410A',
      criticidade: 'media',
      prioridadeOperacional: 'normal',
    },
    {
      id: 'eq-2',
      nome: 'Cassete Financeiro',
      tag: 'CF-02',
      local: 'Financeiro',
      fluido: 'R32',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
    },
  ];
}

function baseRegistros() {
  return [
    {
      id: 'reg-1',
      equipId: 'eq-1',
      data: '2026-04-20T09:00:00',
      tipo: 'Manutencao Preventiva',
      tecnico: 'Ana',
      status: 'ok',
      custoPecas: 100,
      custoMaoObra: 20,
      proxima: '2026-05-10',
    },
    {
      id: 'reg-2',
      equipId: 'eq-2',
      data: '2026-03-15T09:00:00',
      tipo: 'Manutencao Corretiva',
      tecnico: 'Bia',
      status: 'warn',
      custoPecas: 10,
      custoMaoObra: 5,
    },
  ];
}

function buildState(overrides = {}) {
  return {
    equipamentos: baseEquipamentos(),
    registros: baseRegistros(),
    clientes: [{ id: 'cliente-1', nome: 'Cliente Pro' }],
    setores: [{ id: 'setor-1', nome: 'Recepcao' }],
    ...overrides,
  };
}

async function loadRelatorioView({ state = buildState(), planCode = 'free' } = {}) {
  vi.resetModules();

  const getState = vi.fn(() => state);
  const findEquip = vi.fn(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  const refreshQuota = vi.fn();
  const getPmocSummaryForCliente = vi.fn(() => ({ attention: true }));
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

async function renderWithRelatorio(module, options) {
  await act(async () => {
    module.populateRelatorioSelects();
    await module.renderRelatorio(options);
  });
}

function expectClass(element, className) {
  expect(element?.classList.contains(className)).toBe(true);
}

function expectNoUnsafeHtml(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('img')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  expect(root.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
}

describe('relatorio legacy filters and controls render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renderiza estado inicial preservando filtros, toolbar, export e quota como contratos DOM', async () => {
    setupDom();
    const module = await loadRelatorioView({ state: buildState() });

    await renderWithRelatorio(module);

    expect(document.querySelector('#view-relatorio')).not.toBeNull();
    const relatorioView = document.querySelector('#view-relatorio');
    expectClass(relatorioView.querySelector('.servicos-toggle'), 'servicos-toggle');
    expect(relatorioView.querySelectorAll('.servicos-toggle__btn')).toHaveLength(2);
    expect(relatorioView.querySelector('[data-nav="historico"]')).not.toBeNull();
    expect(relatorioView.querySelector('[data-nav="relatorio"]')).not.toBeNull();

    expectClass(document.querySelector('.rel-toolbar'), 'rel-toolbar');
    expectClass(document.querySelector('.rel-toolbar__actions'), 'rel-toolbar__actions');
    expect(document.querySelectorAll('.rel-toolbar__btn').length).toBeGreaterThanOrEqual(3);
    expect(document.querySelector('[data-action="whatsapp-export"]')).not.toBeNull();
    expect(document.querySelector('[data-action="export-pdf"]')).not.toBeNull();
    expect(document.querySelector('[data-action="toggle-export-dd"]')).not.toBeNull();

    expectClass(document.querySelector('#rel-export-dd'), 'rel-export-dd');
    expectClass(document.querySelector('#rel-export-dd-menu'), 'rel-export-dd__menu');
    expect(document.querySelectorAll('#rel-export-dd-menu .rel-export-dd__item').length).toBe(0);
    expectClass(document.querySelector('#pdf-quota-slot'), 'rel-toolbar__quota-slot');
    expect(module.mocks.refreshQuota).toHaveBeenCalledTimes(1);

    expectClass(document.querySelector('#rel-filters'), 'rel-filters');
    expectClass(document.querySelector('#rel-filters-chips'), 'rel-filters__chips');
    expectClass(document.querySelector('#rel-filters-advanced'), 'rel-filters__advanced');
    expect(document.querySelector('#rel-equip')).not.toBeNull();
    expect(document.querySelector('#rel-de')).not.toBeNull();
    expect(document.querySelector('#rel-ate')).not.toBeNull();
    expect(document.querySelector('#rel-equip option[value="eq-1"]')?.textContent).toContain(
      'Split Recepcao',
    );
  });

  it('integra filtros do DOM ao view model e preserva chips ativos e limpar filtros', async () => {
    setupDom();
    const module = await loadRelatorioView({ state: buildState(), planCode: 'pro' });
    module.populateRelatorioSelects();
    document.querySelector('#rel-equip').value = 'eq-1';
    document.querySelector('#rel-de').value = '2026-04-01';
    document.querySelector('#rel-ate').value = '2026-04-30';

    await act(async () => {
      await module.renderRelatorio();
    });

    const chips = document.querySelector('#rel-filters-chips');
    expect(chips.querySelectorAll('.rel-chip').length).toBeGreaterThanOrEqual(3);
    expect(chips.querySelectorAll('.rel-chip.is-active')).toHaveLength(2);
    expect(chips.textContent).toContain('Split Recepcao');
    expect(chips.textContent).toContain('1 de abr');
    expect(chips.textContent).toContain('30 de abr');
    expectClass(chips.querySelector('.rel-chip__clear'), 'rel-chip__clear');
    expect(chips.querySelector('[data-action="rel-clear-filters"]')).not.toBeNull();

    const cards = document.querySelectorAll('#relatorio-corpo .rel-record');
    expect(cards).toHaveLength(1);
    expect(cards[0].textContent).toContain('Manutencao Preventiva');
    expect(cards[0].textContent).not.toContain('Manutencao Corretiva');
    const cardToggle = cards[0].querySelector('[data-rel-action="rel-toggle-card"]');
    expect(cardToggle).not.toBeNull();
    expect(cardToggle.getAttribute('data-id')).toBe('reg-1');
  });

  it('preserva filtros ao desmontar controles e aplica equipId recebido pela rota', async () => {
    setupDom();
    const module = await loadRelatorioView({ state: buildState(), planCode: 'pro' });
    module.populateRelatorioSelects();
    document.querySelector('#rel-equip').value = 'eq-1';
    document.querySelector('#rel-de').value = '2026-04-01';
    document.querySelector('#rel-ate').value = '2026-04-30';

    await act(async () => {
      await module.renderRelatorio();
      await module.unmountRelatorioHero();
      await module.unmountRelatorioControls();
      await module.renderRelatorio();
    });

    expect(document.querySelector('#rel-equip')?.value).toBe('eq-1');
    expect(document.querySelector('#rel-de')?.value).toBe('2026-04-01');
    expect(document.querySelector('#rel-ate')?.value).toBe('2026-04-30');
    expect(document.querySelectorAll('#relatorio-corpo .rel-record')).toHaveLength(1);

    await act(async () => {
      await module.unmountRelatorioHero();
      await module.unmountRelatorioControls();
      await module.renderRelatorio({ equipId: 'eq-2' });
    });

    expect(document.querySelector('#rel-equip')?.value).toBe('eq-2');
    expect(document.querySelector('#rel-filters-chips')?.textContent).toContain(
      'Cassete Financeiro',
    );
  });

  it('preserva controles de modo compacto/detalhado e segmento de contexto Pro', async () => {
    setupDom();
    localStorage.setItem('cooltrack_relatorio_view_mode', 'detailed');
    const module = await loadRelatorioView({ state: buildState(), planCode: 'pro' });

    await renderWithRelatorio(module);

    const compact = document.querySelector('[data-view-mode="compact"]');
    const detailed = document.querySelector('[data-view-mode="detailed"]');
    expect(compact).not.toBeNull();
    expect(detailed).not.toBeNull();
    expect(compact.getAttribute('role')).toBe('radio');
    expect(detailed.getAttribute('role')).toBe('radio');
    expect(detailed.getAttribute('aria-checked')).toBe('true');
    expectClass(detailed, 'rel-segmented__opt');
    expectClass(detailed, 'is-active');
    expectClass(document.querySelector('.rel-segmented'), 'rel-segmented');

    const modeSegment = document.querySelector('#rel-mode-segment-slot .rel-mode-segment');
    expect(modeSegment).not.toBeNull();
    expect(modeSegment.querySelectorAll('.rel-mode-segment__item')).toHaveLength(3);
  });

  it('preserva disclosure avancado, PMOC e dropdown apenas como contratos DOM', async () => {
    setupDom();
    const module = await loadRelatorioView({ state: buildState(), planCode: 'pro' });

    await renderWithRelatorio(module);

    const advanced = document.querySelector('#rel-filters-advanced');
    expect(advanced.hasAttribute('hidden')).toBe(true);
    const toggle = document.querySelector('#rel-filters-chips [data-action="rel-toggle-advanced"]');
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('aria-controls')).toBe('rel-filters-advanced');

    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(document.querySelector('#rel-filters-advanced').hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('#rel-filters-chips').textContent).toContain('Fechar filtros');

    const pmocMain = document.querySelector('#rel-dd-pmoc-main');
    const pmocInfo = document.querySelector('#rel-dd-pmoc-info');
    const pmocNudge = document.querySelector('#rel-dd-pmoc-nudge');
    expect(pmocMain.hidden).toBe(false);
    expect(pmocInfo).toBeNull();
    expect(pmocNudge).toBeNull();
    expect(pmocMain.getAttribute('data-action')).toBe('open-pmoc-modal');
    expect(pmocMain.getAttribute('data-tier')).toBe('pro');
  });

  it('escapa labels de equipamentos e chips sem injetar HTML/script/event handler', async () => {
    setupDom();
    const maliciousState = buildState({
      equipamentos: [
        {
          id: 'eq-x',
          nome: '<img src=x onerror=alert(1)>',
          local: '<svg onload=alert(1)>',
          tag: '<script>alert(1)</script>',
          clienteId: 'cliente-x',
          setorId: 'setor-x',
        },
      ],
      clientes: [{ id: 'cliente-x', nome: '<span onclick=alert(1)>Cliente</span>' }],
      setores: [{ id: 'setor-x', nome: '<script>alert(1)</script>' }],
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
        },
      ],
    });
    const module = await loadRelatorioView({ state: maliciousState, planCode: 'pro' });
    module.populateRelatorioSelects();
    document.querySelector('#rel-equip').value = 'eq-x';

    await act(async () => {
      await module.renderRelatorio();
    });

    const filters = document.querySelector('#rel-filters');
    expect(filters.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(filters.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expectNoUnsafeHtml(filters);
    expectNoUnsafeHtml(document.querySelector('#rel-equip'));
    expectNoUnsafeHtml(document.querySelector('#rel-filters-chips'));
  });

  it('mantem createRoot fora do adapter legado ao conectar a ilha de controles', () => {
    const source = readFileSync('src/ui/views/relatorio.js', 'utf8');
    expect(source).toContain('../../react/entrypoints/relatorioControlsIsland.jsx');
    expect(source).not.toMatch(/function renderModeSegment\b/);
    expect(source).not.toMatch(/function renderFilterChips\b/);
    expect(source).not.toMatch(/\bcreateRoot\b/);
    expect(source).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
