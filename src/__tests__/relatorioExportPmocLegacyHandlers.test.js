import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const MALICIOUS_VALUE = 'javascript:alert(1)" onclick="alert(2)';

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
  ];
}

function baseRegistros() {
  return [
    {
      id: 'reg-1',
      equipId: 'eq-1',
      clienteNome: 'Cliente ACME',
      data: '2026-04-20T09:00:00',
      tipo: 'Preventiva',
      tecnico: 'Ana',
      status: 'ok',
      custoPecas: 100,
      custoMaoObra: 20,
      obs: 'Fluxo ok',
      proxima: '2026-05-10',
    },
  ];
}

function buildState(overrides = {}) {
  return {
    equipamentos: baseEquipamentos(),
    registros: baseRegistros(),
    clientes: [{ id: 'cliente-1', nome: 'Cliente ACME' }],
    setores: [{ id: 'setor-1', nome: 'Recepcao' }],
    ...overrides,
  };
}

function stubBlobDownload() {
  if (typeof URL.createObjectURL !== 'function') {
    URL.createObjectURL = vi.fn(() => 'blob:mock-report-url');
  } else {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-report-url');
  }

  if (typeof URL.revokeObjectURL !== 'function') {
    URL.revokeObjectURL = vi.fn();
  } else {
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  }

  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
}

async function loadRelatorioWithExportHandlers({ state = buildState(), planCode = 'pro' } = {}) {
  vi.resetModules();

  const handlers = new Map();
  const getState = vi.fn(() => state);
  const findEquip = vi.fn(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  const runAsyncAction = vi.fn(async (_el, _opts, fn) => fn());
  const getUser = vi.fn(async () => ({ id: 'u1' }));
  const generateMaintenanceReport = vi.fn(async () => ({
    fileName: 'relatorio.pdf',
    blob: new Blob(['pdf'], { type: 'application/pdf' }),
  }));
  const generateText = vi.fn(() => 'Relatorio pronto');
  const send = vi.fn();
  const shareReportPdf = vi.fn(async () => ({ ok: true, channel: 'wa-link' }));
  const trackEvent = vi.fn();
  const toastSuccess = vi.fn();
  const toastError = vi.fn();
  const toastWarning = vi.fn();
  const toastInfo = vi.fn();
  const shareSuccessShow = vi.fn();
  const pdfSuccessShow = vi.fn();
  const pdfQuotaRefresh = vi.fn();
  const pdfQuotaRemove = vi.fn();
  const fetchOperationalProfile = vi.fn(async () => ({
    profile: { id: 'u1', plan_code: planCode, subscription_status: 'active', is_dev: false },
  }));
  const getPlanCodeForUserId = vi.fn(async () => planCode);
  const getEffectivePlan = vi.fn(() => planCode);
  const hasProAccess = vi.fn(() => planCode === 'pro');
  const getMonthlyUsageSnapshot = vi.fn(async () => ({
    monthStart: '2026-04-01',
    pdf_export: 0,
    whatsapp_share: 0,
  }));
  const getMonthlyLimitForPlan = vi.fn((_code, resource) => {
    if (resource === 'whatsapp_share') return Number.POSITIVE_INFINITY;
    if (resource === 'pdf_export') return Number.POSITIVE_INFINITY;
    return Number.POSITIVE_INFINITY;
  });
  const hasReachedMonthlyLimit = vi.fn(() => false);
  const incrementMonthlyUsage = vi.fn(async () => 1);
  const customConfirmShow = vi.fn(async () => true);
  const modalOpen = vi.fn();
  const modalClose = vi.fn();
  const goTo = vi.fn();
  const onboardingMarkStep = vi.fn();
  const pmocModalOpen = vi.fn();
  const generatePmocPdf = vi.fn();
  const profileGet = vi.fn(() => ({ empresa: 'CoolTrack' }));
  const loadClientes = vi.fn(async () => {});
  const pmocInfoOpen = vi.fn();
  const getPmocSummaryForCliente = vi.fn(() => ({ attention: true }));
  const getSignatureForRecord = vi.fn(() => null);
  const signatureOpen = vi.fn();

  vi.doMock('../core/events.js', () => ({
    on: vi.fn((action, handler) => {
      handlers.set(action, handler);
    }),
  }));
  vi.doMock('../core/state.js', () => ({
    getState,
    findEquip,
  }));
  vi.doMock('../core/plans/planCache.js', () => ({
    getCachedPlan: vi.fn(() => planCode),
    isCachedPlanPlusOrHigher: vi.fn(() => planCode === 'plus' || planCode === 'pro'),
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
    PdfQuotaBadge: { refresh: pdfQuotaRefresh, remove: pdfQuotaRemove },
  }));
  vi.doMock('../ui/components/signature.js', () => ({
    getSignatureForRecord,
    SignatureViewerModal: { open: signatureOpen },
  }));
  vi.doMock('../core/pmocProgress.js', () => ({
    getPmocSummaryForCliente,
  }));
  vi.doMock('../ui/components/actionFeedback.js', () => ({
    runAsyncAction,
  }));
  vi.doMock('../core/auth.js', () => ({
    Auth: { getUser },
  }));
  vi.doMock('../domain/pdf.js', () => ({
    PDFGenerator: { generateMaintenanceReport },
  }));
  vi.doMock('../domain/whatsapp.js', () => ({
    WhatsAppExport: { send, generateText },
  }));
  vi.doMock('../domain/pdf/shareReport.js', () => ({
    shareReportPdf,
  }));
  vi.doMock('../core/telemetry.js', () => ({
    trackEvent,
  }));
  vi.doMock('../core/toast.js', () => ({
    Toast: {
      success: toastSuccess,
      error: toastError,
      warning: toastWarning,
      info: toastInfo,
    },
  }));
  vi.doMock('../ui/components/shareSuccessToast.js', () => ({
    ShareSuccessToast: { show: shareSuccessShow },
  }));
  vi.doMock('../ui/components/pdfSuccessToast.js', () => ({
    PdfSuccessToast: { show: pdfSuccessShow },
  }));
  vi.doMock('../core/plans/operationalPlan.js', () => ({
    fetchOperationalProfile,
  }));
  vi.doMock('../core/plans/subscriptionPlans.js', () => ({
    getPlanCodeForUserId,
    getEffectivePlan,
    hasProAccess,
    PLAN_CODE_FREE: 'free',
    PLAN_CODE_PLUS: 'plus',
    PLAN_CODE_PRO: 'pro',
  }));
  vi.doMock('../core/usageLimits.js', () => ({
    USAGE_RESOURCE_PDF_EXPORT: 'pdf_export',
    USAGE_RESOURCE_WHATSAPP_SHARE: 'whatsapp_share',
    getMonthlyUsageSnapshot,
    getMonthlyLimitForPlan,
    hasReachedMonthlyLimit,
    incrementMonthlyUsage,
  }));
  vi.doMock('../core/modal.js', () => ({
    Modal: { open: modalOpen, close: modalClose },
    CustomConfirm: { show: customConfirmShow },
  }));
  vi.doMock('../core/router.js', () => ({
    goTo,
    currentRoute: vi.fn(),
    currentRouteParams: vi.fn(() => ({})),
    registerRoute: vi.fn(),
  }));
  vi.doMock('../ui/components/onboarding/onboardingChecklist.js', () => ({
    OnboardingChecklist: { markStep: onboardingMarkStep },
  }));
  vi.doMock('../ui/components/pmocModal.js', () => ({
    PmocModal: { open: pmocModalOpen },
  }));
  vi.doMock('../domain/pdf/pmoc/pmocReport.js', () => ({
    generatePmocPdf,
  }));
  vi.doMock('../features/profile.js', () => ({
    Profile: { get: profileGet },
  }));
  vi.doMock('../core/clientes.js', () => ({
    loadClientes,
  }));
  vi.doMock('../ui/components/pmocInfoModal.js', () => ({
    PmocInfoModal: { open: pmocInfoOpen },
  }));

  const relatorio = await import('../ui/views/relatorio.js');
  const reportHandlers = await import('../ui/controller/handlers/reportExportHandlers.js');
  reportHandlers.bindReportExportHandlers();

  return {
    relatorio,
    handlers,
    mocks: {
      fetchOperationalProfile,
      generateMaintenanceReport,
      generatePmocPdf,
      generateText,
      getEffectivePlan,
      getMonthlyUsageSnapshot,
      getPlanCodeForUserId,
      getUser,
      goTo,
      hasReachedMonthlyLimit,
      incrementMonthlyUsage,
      loadClientes,
      onboardingMarkStep,
      pdfQuotaRefresh,
      pdfSuccessShow,
      pmocInfoOpen,
      pmocModalOpen,
      runAsyncAction,
      send,
      shareReportPdf,
      shareSuccessShow,
      signatureOpen,
      toastWarning,
      trackEvent,
    },
  };
}

async function renderRelatorio(ctx, options) {
  await act(async () => {
    ctx.relatorio.populateRelatorioSelects();
    await ctx.relatorio.renderRelatorio(options);
  });
}

async function runLegacyAction(ctx, element) {
  const action = element?.dataset?.action;
  const handler = ctx.handlers.get(action);
  expect(handler).toBeTypeOf('function');

  await act(async () => {
    await handler(element, new MouseEvent('click', { bubbles: true }));
  });
}

function setReportFilters({ equipId = 'eq-1', de = '2026-04-01', ate = '2026-04-30' } = {}) {
  document.querySelector('#rel-equip').value = equipId;
  document.querySelector('#rel-de').value = de;
  document.querySelector('#rel-ate').value = ate;
}

function expectNoExecutableHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
}

describe('relatorio React controls with legacy export PMOC quota handlers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    setupDom();
    stubBlobDownload();
  });

  it('aciona o handler legado de export-pdf usando filtros emitidos pelos controles DOM', async () => {
    const ctx = await loadRelatorioWithExportHandlers();

    await renderRelatorio(ctx);
    setReportFilters();

    const controlsRoot = document.querySelector('#rel-controls-root');
    const pdfButton = document.querySelector('[data-action="export-pdf"]');
    expect(controlsRoot?.dataset.relatorioControlsMounted).toBe('true');
    expect(pdfButton).not.toBeNull();
    expect(document.querySelector('#rel-equip')?.value).toBe('eq-1');
    expect(document.querySelector('#rel-de')?.value).toBe('2026-04-01');
    expect(document.querySelector('#rel-ate')?.value).toBe('2026-04-30');

    await runLegacyAction(ctx, pdfButton);

    expect(ctx.mocks.runAsyncAction).toHaveBeenCalledWith(
      pdfButton,
      { loadingLabel: 'Gerando PDF...' },
      expect.any(Function),
    );
    expect(ctx.mocks.generateMaintenanceReport).toHaveBeenCalledWith(
      expect.objectContaining({
        asBlob: true,
        filtEq: 'eq-1',
        de: '2026-04-01',
        ate: '2026-04-30',
      }),
      expect.objectContaining({ planCode: 'pro' }),
    );
    expect(ctx.mocks.pdfSuccessShow).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'relatorio.pdf' }),
    );
    expect(ctx.mocks.shareReportPdf).not.toHaveBeenCalled();
    expect(ctx.mocks.pmocModalOpen).not.toHaveBeenCalled();
  });

  it('aciona o handler legado de whatsapp-export sem usar o fluxo antigo texto-only', async () => {
    const ctx = await loadRelatorioWithExportHandlers();

    await renderRelatorio(ctx);
    setReportFilters();

    const whatsappButton = document.querySelector('[data-action="whatsapp-export"]');
    expect(whatsappButton).not.toBeNull();

    await runLegacyAction(ctx, whatsappButton);

    expect(ctx.mocks.runAsyncAction).toHaveBeenCalledWith(
      whatsappButton,
      { loadingLabel: 'Preparando...' },
      expect.any(Function),
    );
    expect(ctx.mocks.generateMaintenanceReport).toHaveBeenCalledWith(
      expect.objectContaining({
        asBlob: true,
        filtEq: 'eq-1',
        de: '2026-04-01',
        ate: '2026-04-30',
      }),
      expect.objectContaining({ planCode: 'pro' }),
    );
    expect(ctx.mocks.shareReportPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'relatorio.pdf',
        metadata: expect.objectContaining({ userId: 'u1' }),
      }),
    );
    expect(ctx.mocks.send).not.toHaveBeenCalled();
    expect(ctx.mocks.pmocModalOpen).not.toHaveBeenCalled();
    expect(ctx.mocks.shareSuccessShow).toHaveBeenCalled();
  });

  it('mantem toggle-export-dd operando sobre o dropdown renderizado pelos controles DOM', async () => {
    const ctx = await loadRelatorioWithExportHandlers();

    await renderRelatorio(ctx);

    const toggle = document.querySelector('#btn-export-dd-toggle');
    const dropdown = document.querySelector('#rel-export-dd');
    const menu = document.querySelector('#rel-export-dd-menu');
    expect(dropdown?.classList.contains('rel-export-dd')).toBe(true);
    expect(toggle?.getAttribute('data-action')).toBe('toggle-export-dd');
    expect(menu?.hidden).toBe(true);

    await runLegacyAction(ctx, toggle);

    expect(menu?.hidden).toBe(false);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');

    await runLegacyAction(ctx, toggle);

    expect(menu?.hidden).toBe(true);
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
  });

  it('preserva PMOC e quota como fluxos legados acionaveis por data-action', async () => {
    const ctx = await loadRelatorioWithExportHandlers();

    await renderRelatorio(ctx);
    setReportFilters();
    ctx.mocks.pdfQuotaRefresh.mockClear();

    const quotaSlot = document.querySelector('#pdf-quota-slot');
    const pmocMain = document.querySelector('#rel-dd-pmoc-main');
    const pmocInfo = document.querySelector('#rel-dd-pmoc-info');
    const pmocNudge = document.querySelector('#rel-dd-pmoc-nudge');

    expect(quotaSlot?.classList.contains('rel-toolbar__quota-slot')).toBe(true);
    expect(pmocMain?.hidden).toBe(false);
    expect(pmocInfo).toBeNull();
    expect(pmocNudge).toBeNull();
    expect(pmocMain?.getAttribute('data-action')).toBe('open-pmoc-modal');
    expect(pmocMain?.getAttribute('data-tier')).toBe('pro');

    await runLegacyAction(ctx, pmocMain);

    expect(ctx.mocks.loadClientes).toHaveBeenCalled();
    expect(ctx.mocks.pmocModalOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        clientes: [{ id: 'cliente-1', nome: 'Cliente ACME' }],
        isPro: true,
        preselectClienteId: 'cliente-1',
        onConfirm: expect.any(Function),
      }),
    );
    expect(ctx.mocks.pmocInfoOpen).not.toHaveBeenCalled();
    expect(ctx.mocks.generatePmocPdf).not.toHaveBeenCalled();
    expect(ctx.mocks.generateMaintenanceReport).not.toHaveBeenCalled();
    expect(ctx.mocks.shareReportPdf).not.toHaveBeenCalled();
    expect(ctx.mocks.pdfQuotaRefresh).not.toHaveBeenCalled();
  });

  it('nao executa payloads maliciosos em atributos e mantem createRoot fora do adapter legado', async () => {
    const alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
    const maliciousState = buildState({
      equipamentos: [
        {
          id: MALICIOUS_VALUE,
          nome: '<img src=x onerror=alert(1)>',
          tag: '<script>alert(1)</script>',
          local: '<svg onload=alert(1)>',
          clienteId: 'cliente-1',
          setorId: 'setor-1',
        },
      ],
      registros: [
        {
          id: 'reg-mal',
          equipId: MALICIOUS_VALUE,
          clienteNome: '<span onclick=alert(1)>Cliente</span>',
          data: '2026-04-20T09:00:00',
          tipo: '<img src=x onerror=alert(1)>',
          tecnico: '<b onclick=alert(1)>Ana</b>',
          status: 'ok',
          custoPecas: 1,
          custoMaoObra: 1,
        },
      ],
    });
    const ctx = await loadRelatorioWithExportHandlers({ state: maliciousState });

    localStorage.setItem('cooltrack_relatorio_view_mode', MALICIOUS_VALUE);
    await renderRelatorio(ctx);
    setReportFilters({ equipId: MALICIOUS_VALUE, de: MALICIOUS_VALUE, ate: '2026-04-30' });

    const controlsRoot = document.querySelector('#rel-controls-root');
    const pdfButton = document.querySelector('[data-action="export-pdf"]');
    expect(document.querySelector('#rel-equip')?.value).toBe(MALICIOUS_VALUE);
    expect(document.querySelector('[data-view-mode="compact"]')).not.toBeNull();
    expectNoExecutableHtml(controlsRoot);

    await runLegacyAction(ctx, pdfButton);

    expect(ctx.mocks.generateMaintenanceReport).toHaveBeenCalledWith(
      expect.objectContaining({
        filtEq: MALICIOUS_VALUE,
        de: '',
      }),
      expect.any(Object),
    );
    expect(alertSpy).not.toHaveBeenCalled();

    const adapterSource = readFileSync('src/ui/views/relatorio.js', 'utf8');
    expect(adapterSource).toContain('./relatorio/controlsRenderer.js');
    expect(adapterSource).toContain('../../react/entrypoints/relatorioCardsIsland.jsx');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
