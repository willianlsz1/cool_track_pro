import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountHistoricoTimelineDom } from '../ui/views/historico/timelineRenderer.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  handlers: new Map(),
  runAsyncAction: vi.fn(async (_el, _opts, fn) => fn()),
  getUser: vi.fn(),
  generateMaintenanceReport: vi.fn(),
  shareReportPdf: vi.fn(),
  generateWhatsAppText: vi.fn(() => 'Mensagem WhatsApp do registro critico'),
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

vi.mock('../core/plans/operationalPlan.js', () => ({
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

function createCriticalFixture() {
  const equipamento = {
    id: 'eq-critical-1',
    nome: 'Split Recepcao',
    setor: 'Loja',
    cliente: 'Cliente Alpha',
  };
  const registro = {
    id: 'reg-critical-1',
    equipId: equipamento.id,
    tipo: 'Preventiva',
    status: 'ok',
    data: '2026-05-09T09:30:00',
    tecnico: 'Ana',
    obs: 'Troca de filtros',
  };

  return {
    equipamento,
    registro,
    timelineItem: {
      id: registro.id,
      equipId: equipamento.id,
      isLatest: true,
      status: registro.status,
      headerDateLabel: '09:30',
      headPills: [{ id: 'type', label: registro.tipo, color: 'cyan' }],
      serviceTitle: 'Preventiva mensal',
      equipmentName: equipamento.nome,
      setorName: equipamento.setor,
      context: `${equipamento.cliente} - ${equipamento.setor} - ${equipamento.nome}`,
      obs: registro.obs,
      meta: [{ id: 'tecnico', icon: 'user', text: registro.tecnico }],
      photoUrls: [],
      signature: null,
      checklist: null,
      showFilterEquip: true,
    },
  };
}

function createTimelineViewModel(item) {
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

async function renderCriticalHistoricoCard(item) {
  document.body.innerHTML = `
    <select id="rel-equip"><option value="eq-other" selected>eq-other</option></select>
    <input id="rel-de" value="2026-05-01" />
    <input id="rel-ate" value="2026-05-31" />
    <main id="view-historico">
      <section id="timeline"></section>
    </main>
  `;
  const root = document.getElementById('timeline');

  await act(async () => {
    mountHistoricoTimelineDom(root, { viewModel: createTimelineViewModel(item) });
  });

  return root;
}

async function bindReportHandlers() {
  const mod = await import('../ui/controller/handlers/reportExportHandlers.js');
  mod.bindReportExportHandlers();
}

function setupReportMocks() {
  mocks.getUser.mockResolvedValue({ id: 'user-critical' });
  mocks.fetchOperationalProfile.mockResolvedValue({
    profile: {
      id: 'user-critical',
      plan_code: 'free',
      subscription_status: 'inactive',
    },
  });
  mocks.getPlanCodeForUserId.mockResolvedValue('free');
  mocks.getEffectivePlan.mockReturnValue('free');
  mocks.getMonthlyUsageSnapshot.mockResolvedValue({
    monthStart: '2026-05-01',
    pdf_export: 0,
    whatsapp_share: 0,
  });
  mocks.getMonthlyLimitForPlan.mockReturnValue(Number.POSITIVE_INFINITY);
  mocks.hasReachedMonthlyLimit.mockReturnValue(false);
  mocks.incrementMonthlyUsage.mockResolvedValue(1);
  mocks.generateMaintenanceReport.mockResolvedValue({
    fileName: 'relatorio-reg-critical-1.pdf',
    blob: makePdfBlob(),
  });
  mocks.shareReportPdf.mockResolvedValue({ ok: true, channel: 'wa-link' });
}

function expectReportGeneratedForCriticalRegistro() {
  expect(mocks.generateMaintenanceReport).toHaveBeenCalledWith(
    expect.objectContaining({
      registroId: 'reg-critical-1',
      filtEq: 'eq-other',
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

describe('critical Equipamentos -> Registro -> Historico -> PDF/WhatsApp contract', () => {
  beforeEach(() => {
    mocks.handlers.clear();
    vi.clearAllMocks();
    localStorage.clear();
    setupReportMocks();

    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = vi.fn(() => 'blob:critical-report');
    } else {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:critical-report');
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

  it('preserves registro identity from equipment-linked service card to PDF and WhatsApp flows', async () => {
    const { equipamento, registro, timelineItem } = createCriticalFixture();
    const root = await renderCriticalHistoricoCard(timelineItem);
    await bindReportHandlers();

    const card = root.querySelector(`.timeline__item[data-reg-id="${registro.id}"]`);
    const editAction = root.querySelector(`[data-action="edit-reg"][data-id="${registro.id}"]`);
    const deleteAction = root.querySelector(`[data-action="delete-reg"][data-id="${registro.id}"]`);
    const pdfAction = root.querySelector(
      `[data-action="export-pdf"][data-registro-id="${registro.id}"]`,
    );
    const whatsappAction = root.querySelector(
      `[data-action="whatsapp-export"][data-registro-id="${registro.id}"]`,
    );

    expect(card?.textContent).toContain(equipamento.nome);
    expect(card?.textContent).toContain(registro.tipo);
    expect(editAction).not.toBeNull();
    expect(deleteAction).not.toBeNull();
    expect(pdfAction?.dataset.registroId).toBe(registro.id);
    expect(whatsappAction?.dataset.registroId).toBe(pdfAction?.dataset.registroId);

    await mocks.handlers.get('export-pdf')(pdfAction);

    expectReportGeneratedForCriticalRegistro();
    expect(mocks.pdfToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'relatorio-reg-critical-1.pdf' }),
    );
    expect(mocks.shareReportPdf).not.toHaveBeenCalled();

    mocks.generateMaintenanceReport.mockClear();
    await mocks.handlers.get('whatsapp-export')(whatsappAction);

    expectReportGeneratedForCriticalRegistro();
    expect(mocks.generateWhatsAppText).toHaveBeenCalledWith(
      expect.objectContaining({
        registroId: registro.id,
        filtEq: 'eq-other',
      }),
    );
    expect(mocks.shareReportPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'relatorio-reg-critical-1.pdf',
        whatsappText: 'Mensagem WhatsApp do registro critico',
        metadata: { userId: 'user-critical', registroId: registro.id },
      }),
    );
  });

  it('keeps critical actions when optional photos, signature and checklist are absent', async () => {
    const { registro, timelineItem } = createCriticalFixture();
    const root = await renderCriticalHistoricoCard({
      ...timelineItem,
      photoUrls: [],
      signature: null,
      checklist: null,
      obs: '',
    });

    expect(root.querySelector(`[data-action="edit-reg"][data-id="${registro.id}"]`)).not.toBeNull();
    expect(
      root.querySelector(`[data-action="delete-reg"][data-id="${registro.id}"]`),
    ).not.toBeNull();
    expect(
      root.querySelector(`[data-action="export-pdf"][data-registro-id="${registro.id}"]`),
    ).not.toBeNull();
    expect(
      root.querySelector(`[data-action="whatsapp-export"][data-registro-id="${registro.id}"]`),
    ).not.toBeNull();
  });
});
