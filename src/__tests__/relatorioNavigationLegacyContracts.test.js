import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';
import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_PUBLIC_IDS,
} from '../ui/viewModels/relatorioContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const SAFE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/atK9E8AAAAASUVORK5CYII=';
const MALICIOUS_ID = 'javascript:alert(1)" onclick="alert(2)';

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
      periodicidadePreventivaDias: 30,
    },
  ];
}

function createRegistro(overrides = {}) {
  return {
    id: 'reg-1',
    equipId: 'eq-1',
    clienteNome: 'Cliente ACME',
    data: '2026-04-20T09:00:00',
    tipo: 'Preventiva',
    tecnico: 'Ana',
    status: 'ok',
    custoPecas: 100,
    custoMaoObra: 20,
    pecas: 'Filtro lavavel',
    obs: 'Fluxo ok',
    proxima: '2026-05-10',
    assinatura: true,
    ...overrides,
  };
}

function buildState(overrides = {}) {
  return {
    equipamentos: baseEquipamentos(),
    registros: [createRegistro()],
    clientes: [{ id: 'cliente-1', nome: 'Cliente ACME' }],
    setores: [{ id: 'setor-1', nome: 'Recepcao' }],
    ...overrides,
  };
}

async function loadRelatorioNavigation({
  initialState = buildState(),
  initialPlanCode = 'free',
  initialPmocSummary = null,
  signatureById = { 'reg-1': SAFE_SIGNATURE },
} = {}) {
  vi.resetModules();

  let state = initialState;
  let planCode = initialPlanCode;
  let pmocSummary = initialPmocSummary;

  const goTo = vi.fn();
  const getState = vi.fn(() => state);
  const findEquip = vi.fn(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  const refreshQuota = vi.fn();
  const getPmocSummaryForCliente = vi.fn(() => pmocSummary);
  const getSignatureForRecord = vi.fn((id) => signatureById[id] || null);
  const signatureOpen = vi.fn();

  vi.doMock('../core/router.js', () => ({
    goTo,
    currentRoute: vi.fn(),
    currentRouteParams: vi.fn(() => ({})),
    registerRoute: vi.fn(),
  }));
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
    formatDadosPlacaRows: vi.fn(() => [{ label: 'Placa', value: 'PLACA-123', mono: true }]),
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

  const events = await import('../core/events.js');
  const relatorio = await import('../ui/views/relatorio.js');

  return {
    events,
    relatorio,
    setPlanCode(nextPlanCode) {
      planCode = nextPlanCode;
    },
    setPmocSummary(nextSummary) {
      pmocSummary = nextSummary;
    },
    setState(nextState) {
      state = nextState;
    },
    mocks: {
      findEquip,
      getPmocSummaryForCliente,
      getSignatureForRecord,
      goTo,
      refreshQuota,
      signatureOpen,
    },
  };
}

async function renderRelatorio(ctx, options) {
  await act(async () => {
    ctx.relatorio.populateRelatorioSelects();
    await ctx.relatorio.renderRelatorio(options);
  });
}

async function clickNavAndExpect(ctx, element, target) {
  expect(element).not.toBeNull();
  ctx.mocks.goTo.mockClear();

  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });

  await vi.waitFor(() => {
    expect(ctx.mocks.goTo).toHaveBeenCalledWith(target);
  });
}

function expectNoExecutableHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
  expect(root?.querySelector('[data-nav^="javascript:"]')).toBeNull();
}

describe('relatorio DOM renderers with legacy data-nav navigation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    setupDom();
  });

  it('aciona o handler legado de data-nav para controles, empty state e PMOC atual', async () => {
    const ctx = await loadRelatorioNavigation({
      initialState: buildState({ registros: [] }),
      initialPlanCode: 'free',
    });
    ctx.events.bindEvents();

    await renderRelatorio(ctx);

    const controlsRoot = document.getElementById(RELATORIO_PUBLIC_IDS.controlsRoot);
    const cardsRoot = document.getElementById(RELATORIO_PUBLIC_IDS.body);
    expect(controlsRoot?.dataset.relatorioControlsMounted).toBe('true');
    expect(cardsRoot?.dataset.relatorioCardsMounted).toBe('true');

    await clickNavAndExpect(
      ctx,
      document.querySelector('.servicos-toggle__btn--lista[data-nav="historico"]'),
      RELATORIO_NAV_TARGETS.historico,
    );
    await clickNavAndExpect(
      ctx,
      document.querySelector('.servicos-toggle__btn--relatorio[data-nav="relatorio"]'),
      RELATORIO_NAV_TARGETS.relatorio,
    );
    await clickNavAndExpect(
      ctx,
      document.querySelector('.rel-empty__cta[data-nav="registro"]'),
      RELATORIO_NAV_TARGETS.registro,
    );
    expect(
      document.querySelector(
        `#${RELATORIO_PUBLIC_IDS.pmocNudge}${['[data-nav="', 'pric', 'ing', '"]'].join('')}`,
      ),
    ).toBeNull();
    expect(
      document.querySelector(`#${RELATORIO_PUBLIC_IDS.pmocNudge}[data-action="open-upgrade"]`),
    ).toBeNull();

    ctx.setPlanCode('pro');
    ctx.setState(buildState());
    ctx.setPmocSummary({ status: 'atencao' });
    await renderRelatorio(ctx, { equipId: 'eq-1' });

    expect(document.querySelector('#rel-company-pmoc-slot [data-nav="clientes"]')).toBeNull();
    expect(document.querySelector('.pmoc-hero [data-action="open-pmoc-modal"]')).not.toBeNull();
    expect(ctx.mocks.refreshQuota).toHaveBeenCalled();
    expect(ctx.mocks.signatureOpen).not.toHaveBeenCalled();
  });

  it('preserva data-id, data-action e data-rel-action dos cards DOM para handlers legados', async () => {
    const ctx = await loadRelatorioNavigation({ initialPlanCode: 'pro' });

    await renderRelatorio(ctx);

    const body = document.getElementById(RELATORIO_PUBLIC_IDS.body);
    const card = body?.querySelector('.rel-record[data-id="reg-1"]');
    const toggle = card?.querySelector('.rel-record__toggle');
    const signature = card?.querySelector('.rel-sigthumb');

    expect(body?.dataset.relatorioCardsMounted).toBe('true');
    expect(card).not.toBeNull();
    expect(toggle?.getAttribute('data-rel-action')).toBe(RELATORIO_ACTIONS.toggleCard);
    expect(toggle?.getAttribute('data-id')).toBe('reg-1');
    expect(signature?.getAttribute('data-action')).toBe(RELATORIO_ACTIONS.viewSignature);
    expect(signature?.getAttribute('data-id')).toBe('reg-1');
    expect(card?.querySelector('[data-nav]')).toBeNull();
  });

  it('mantem payloads maliciosos em data-id inertes e nao emite data-nav inseguro', async () => {
    const alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
    const maliciousState = buildState({
      equipamentos: [
        {
          ...baseEquipamentos()[0],
          nome: '<img src=x onerror=alert(1)>',
          tag: '<script>alert(1)</script>',
          local: '<svg onload=alert(1)>',
        },
      ],
      registros: [
        createRegistro({
          id: MALICIOUS_ID,
          clienteNome: '<b onclick=alert(1)>Cliente</b>',
          tipo: '<img src=x onerror=alert(1)>',
          tecnico: '<span onclick=alert(1)>Ana</span>',
          pecas: '<script>alert(1)</script>',
          obs: '<img src=x onerror=alert(1)>',
        }),
      ],
    });
    const ctx = await loadRelatorioNavigation({
      initialState: maliciousState,
      initialPlanCode: 'free',
      signatureById: { [MALICIOUS_ID]: SAFE_SIGNATURE },
    });

    await renderRelatorio(ctx);

    const controlsRoot = document.getElementById(RELATORIO_PUBLIC_IDS.controlsRoot);
    const body = document.getElementById(RELATORIO_PUBLIC_IDS.body);
    const maliciousCard = [...body.querySelectorAll('.rel-record')].find(
      (card) => card.getAttribute('data-id') === MALICIOUS_ID,
    );
    const maliciousSignature = maliciousCard?.querySelector('[data-action="rel-view-signature"]');

    expect(maliciousCard).not.toBeNull();
    expect(maliciousSignature?.getAttribute('data-id')).toBe(MALICIOUS_ID);
    expectNoExecutableHtml(controlsRoot);
    expectNoExecutableHtml(body);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('mantem navegacao legada e createRoot fora do adapter de Relatorio', () => {
    const adapterSource = readFileSync('src/ui/views/relatorio.js', 'utf8');
    const eventsSource = readFileSync('src/core/events.js', 'utf8');

    expect(eventsSource).toContain("closest('[data-nav]')");
    expect(eventsSource).toContain('goTo(navBtn.dataset.nav)');
    expect(adapterSource).toContain('./relatorio/controlsRenderer.js');
    expect(adapterSource).toContain('./relatorio/cardsRenderer.js');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
