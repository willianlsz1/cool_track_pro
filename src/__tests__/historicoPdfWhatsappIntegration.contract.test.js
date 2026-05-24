import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountHistoricoTimelineReact } from '../react/entrypoints/historicoTimelineIsland.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  handlers: new Map(),
  runAsyncAction: vi.fn(async (_el, _opts, fn) => fn()),
  getUser: vi.fn(),
  generateMaintenanceReport: vi.fn(),
  shareReportPdf: vi.fn(),
  generateWhatsAppText: vi.fn(() => 'Mensagem WhatsApp'),
  trackEvent: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  shareToastShow: vi.fn(),
  pdfToastShow: vi.fn(),
  pdfBadgeRefresh: vi.fn(),
  fetchOperationalProfile: vi.fn(),
  getPlanCodeForUserId: vi.fn(),
  getEffectivePlan: vi.fn(),
  getMonthlyUsageSnapshot: vi.fn(),
  getMonthlyLimitForPlan: vi.fn(),
  hasReachedMonthlyLimit: vi.fn(),
  incrementMonthlyUsage: vi.fn(),
  goTo: vi.fn(),
  onboardingMarkStep: vi.fn(),
  resolveSignatureForRecord: vi.fn(),
}));

vi.mock('../core/events.js', () => ({
  on: vi.fn((action, handler) => {
    mocks.handlers.set(action, handler);
  }),
}));

vi.mock('../ui/components/actionFeedback.js', () => ({
  runAsyncAction: mocks.runAsyncAction,
}));

vi.mock('../core/auth.js', () => ({
  Auth: { getUser: mocks.getUser },
}));

vi.mock('../domain/pdf.js', () => ({
  PDFGenerator: { generateMaintenanceReport: mocks.generateMaintenanceReport },
}));

vi.mock('../domain/pdf/shareReport.js', () => ({
  shareReportPdf: mocks.shareReportPdf,
}));

vi.mock('../domain/whatsapp.js', () => ({
  WhatsAppExport: { generateText: mocks.generateWhatsAppText, send: vi.fn() },
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: mocks.trackEvent,
}));

vi.mock('../core/toast.js', () => ({
  Toast: mocks.toast,
}));

vi.mock('../ui/components/shareSuccessToast.js', () => ({
  ShareSuccessToast: { show: mocks.shareToastShow },
}));

vi.mock('../ui/components/pdfSuccessToast.js', () => ({
  PdfSuccessToast: { show: mocks.pdfToastShow },
}));

vi.mock('../ui/components/pdfQuotaBadge.js', () => ({
  PdfQuotaBadge: { refresh: mocks.pdfBadgeRefresh, remove: vi.fn() },
}));

vi.mock('../core/plans/monetization.js', () => ({
  fetchOperationalProfile: mocks.fetchOperationalProfile,
}));

vi.mock('../core/plans/subscriptionPlans.js', () => ({
  getPlanCodeForUserId: mocks.getPlanCodeForUserId,
  getEffectivePlan: mocks.getEffectivePlan,
  PLAN_CODE_FREE: 'free',
  PLAN_CODE_PLUS: 'plus',
  PLAN_CODE_PRO: 'pro',
}));

vi.mock('../core/usageLimits.js', () => ({
  USAGE_RESOURCE_PDF_EXPORT: 'pdf_export',
  USAGE_RESOURCE_WHATSAPP_SHARE: 'whatsapp_share',
  getMonthlyUsageSnapshot: mocks.getMonthlyUsageSnapshot,
  getMonthlyLimitForPlan: mocks.getMonthlyLimitForPlan,
  hasReachedMonthlyLimit: mocks.hasReachedMonthlyLimit,
  incrementMonthlyUsage: mocks.incrementMonthlyUsage,
}));

vi.mock('../core/modal.js', () => ({
  Modal: { open: vi.fn(), close: vi.fn() },
  CustomConfirm: { show: vi.fn() },
}));

vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
  currentRoute: vi.fn(),
  currentRouteParams: vi.fn(() => ({})),
  registerRoute: vi.fn(),
}));

vi.mock('../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: { markStep: mocks.onboardingMarkStep },
}));

vi.mock('../ui/components/signature.js', () => ({
  resolveSignatureForRecord: mocks.resolveSignatureForRecord,
}));

function makePdfBlob() {
  return new Blob(['pdf'], { type: 'application/pdf' });
}

function createTimelineItem(overrides = {}) {
  return {
    id: 'reg-1',
    equipId: 'eq-1',
    isLatest: true,
    status: 'ok',
    headerDateLabel: '09:30',
    headPills: [{ id: 'type', label: 'Preventiva', color: 'cyan' }],
    serviceTitle: 'Preventiva mensal',
    equipmentName: 'Split Recepcao',
    setorName: 'Loja',
    context: 'Cliente Alpha - Loja - Split Recepcao',
    obs: 'Troca de filtros',
    meta: [{ id: 'tecnico', icon: 'user', text: 'Ana' }],
    photoUrls: ['https://cdn.example/foto-1.jpg'],
    signature: {
      url: 'data:image/png;base64,assinatura',
      ariaLabel: 'Ver assinatura de Cliente Alpha',
      alt: 'Assinatura registrada pelo cliente',
    },
    showFilterEquip: true,
    ...overrides,
  };
}

function createTimelineViewModel(item = createTimelineItem()) {
  return {
    operationSummary: { totalServicosHoje: 1, totalEquipHoje: 1 },
    attentionItems: [],
    emptyState: null,
    groups: [
      {
        id: 'hoje',
        label: 'Hoje',
        countLabel: '1 servico',
        items: [item],
      },
    ],
  };
}

async function renderHistoricoCard(item = createTimelineItem()) {
  document.body.innerHTML = `
    <select id="rel-equip"><option value="eq-active" selected>eq-active</option></select>
    <input id="rel-de" value="2026-05-01" />
    <input id="rel-ate" value="2026-05-31" />
    <main id="view-historico">
      <section id="timeline"></section>
    </main>
  `;
  const root = document.getElementById('timeline');
  await act(async () => {
    mountHistoricoTimelineReact(root, { viewModel: createTimelineViewModel(item) });
  });
  return root;
}

async function bindReportHandlers() {
  const mod = await import('../ui/controller/handlers/reportExportHandlers.js');
  mod.bindReportExportHandlers();
}

function setupReportMocks() {
  mocks.getUser.mockResolvedValue({ id: 'user-1' });
  mocks.fetchOperationalProfile.mockResolvedValue({
    profile: { id: 'user-1', plan_code: 'free', subscription_status: 'inactive' },
  });
  mocks.getPlanCodeForUserId.mockResolvedValue('free');
  mocks.getEffectivePlan.mockReturnValue('free');
  mocks.getMonthlyUsageSnapshot.mockResolvedValue({
    monthStart: '2026-05-01',
    pdf_export: 1,
    whatsapp_share: 2,
  });
  mocks.getMonthlyLimitForPlan.mockImplementation((_planCode, resource) => {
    if (resource === 'whatsapp_share') return 5;
    return Number.POSITIVE_INFINITY;
  });
  mocks.hasReachedMonthlyLimit.mockReturnValue(false);
  mocks.incrementMonthlyUsage.mockResolvedValue(3);
  mocks.generateMaintenanceReport.mockResolvedValue({
    fileName: 'relatorio-reg-1.pdf',
    blob: makePdfBlob(),
  });
  mocks.shareReportPdf.mockResolvedValue({ ok: true, channel: 'wa-link' });
}

function expectGeneratedForHistoricoCard() {
  expect(mocks.generateMaintenanceReport).toHaveBeenCalledWith(
    expect.objectContaining({
      registroId: 'reg-1',
      filtEq: 'eq-active',
      de: '2026-05-01',
      ate: '2026-05-31',
      asBlob: true,
    }),
    expect.objectContaining({
      planCode: 'free',
      resolveSignatureForRecord: mocks.resolveSignatureForRecord,
    }),
  );
}

describe('Historico -> PDF/WhatsApp integration contract', () => {
  beforeEach(() => {
    mocks.handlers.clear();
    vi.clearAllMocks();
    localStorage.clear();
    setupReportMocks();

    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = vi.fn(() => 'blob:historico-report');
    } else {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:historico-report');
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    }
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options);
      if (String(tagName).toLowerCase() === 'a') {
        element.click = vi.fn();
      }
      return element;
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('routes Historico card export-pdf through report filters preserving data-registro-id over active filters', async () => {
    const root = await renderHistoricoCard();
    await bindReportHandlers();

    const pdfButton = root.querySelector('[data-action="export-pdf"]');

    expect(pdfButton?.dataset.registroId).toBe('reg-1');

    await mocks.handlers.get('export-pdf')(pdfButton);

    expectGeneratedForHistoricoCard();
    expect(mocks.runAsyncAction).toHaveBeenCalledWith(
      pdfButton,
      expect.objectContaining({ loadingLabel: 'Gerando PDF...' }),
      expect.any(Function),
    );
    expect(mocks.pdfToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'relatorio-reg-1.pdf' }),
    );
    expect(mocks.shareReportPdf).not.toHaveBeenCalled();
  });

  it('routes Historico card whatsapp-export with the same registroId used by PDF', async () => {
    const root = await renderHistoricoCard();
    await bindReportHandlers();

    const pdfButton = root.querySelector('[data-action="export-pdf"]');
    const whatsappButton = root.querySelector('[data-action="whatsapp-export"]');

    expect(pdfButton?.dataset.registroId).toBe('reg-1');
    expect(whatsappButton?.dataset.registroId).toBe(pdfButton?.dataset.registroId);

    await mocks.handlers.get('whatsapp-export')(whatsappButton);

    expectGeneratedForHistoricoCard();
    expect(mocks.generateWhatsAppText).toHaveBeenCalledWith(
      expect.objectContaining({
        registroId: 'reg-1',
        filtEq: 'eq-active',
        de: '2026-05-01',
        ate: '2026-05-31',
      }),
    );
    expect(mocks.shareReportPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'relatorio-reg-1.pdf',
        whatsappText: 'Mensagem WhatsApp',
        metadata: { userId: 'user-1', registroId: 'reg-1' },
      }),
    );
    expect(mocks.incrementMonthlyUsage).toHaveBeenCalledWith('user-1', 'whatsapp_share');
  });

  it('keeps PDF and WhatsApp card actions when optional card data is absent', async () => {
    const root = await renderHistoricoCard(
      createTimelineItem({
        id: 'reg-minimal',
        context: '',
        obs: '',
        meta: [],
        photoUrls: [],
        signature: null,
        showFilterEquip: false,
      }),
    );

    expect(
      root.querySelector('[data-action="export-pdf"][data-registro-id="reg-minimal"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[data-action="whatsapp-export"][data-registro-id="reg-minimal"]'),
    ).not.toBeNull();
  });
});
