import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handlers: new Map(),
  runAsyncAction: vi.fn(async (_el, _opts, fn) => fn()),
  getUser: vi.fn(),
  generateMaintenanceReport: vi.fn(),
  shareReportPdf: vi.fn(),
  getState: vi.fn(),
  findEquip: vi.fn(),
  profileGet: vi.fn(),
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
  customConfirmShow: vi.fn(),
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

vi.mock('../core/state.js', () => ({
  getState: () => mocks.getState(),
  findEquip: (...args) => mocks.findEquip(...args),
}));

vi.mock('../core/profile.js', () => ({
  Profile: { get: () => mocks.profileGet() },
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
  CustomConfirm: { show: mocks.customConfirmShow },
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

function source(path) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function makePdfBlob() {
  return new Blob(['pdf'], { type: 'application/pdf' });
}

async function bindHandlers() {
  const mod = await import('../ui/controller/handlers/reportExportHandlers.js');
  mod.bindReportExportHandlers();
  return mod;
}

describe('report export public contracts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    mocks.handlers.clear();
    vi.clearAllMocks();
    localStorage.clear();

    document.body.innerHTML = `
      <select id="rel-equip"><option value="eq-old" selected>eq-old</option></select>
      <input id="rel-de" value="2026-04-01" />
      <input id="rel-ate" value="2026-04-30" />
    `;

    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = vi.fn(() => 'blob:report-contract');
    } else {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report-contract');
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

    mocks.getUser.mockResolvedValue({ id: 'user-1' });
    mocks.fetchOperationalProfile.mockResolvedValue({
      profile: { id: 'user-1', plan_code: 'free', subscription_status: 'inactive' },
    });
    mocks.getPlanCodeForUserId.mockResolvedValue('free');
    mocks.getEffectivePlan.mockReturnValue('free');
    mocks.getMonthlyUsageSnapshot.mockResolvedValue({
      monthStart: '2026-04-01',
      pdf_export: 2,
      whatsapp_share: 3,
    });
    mocks.getMonthlyLimitForPlan.mockImplementation((_planCode, resource) => {
      if (resource === 'pdf_export') return Number.POSITIVE_INFINITY;
      if (resource === 'whatsapp_share') return 5;
      return Number.POSITIVE_INFINITY;
    });
    mocks.hasReachedMonthlyLimit.mockReturnValue(false);
    mocks.incrementMonthlyUsage.mockResolvedValue(4);
    mocks.generateMaintenanceReport.mockResolvedValue({
      fileName: 'relatorio.pdf',
      blob: makePdfBlob(),
    });
    mocks.shareReportPdf.mockResolvedValue({ ok: true, channel: 'wa-link' });
    mocks.getState.mockReturnValue({
      registros: [
        {
          id: 'reg-old',
          equipId: 'eq-old',
          tipo: 'Preventiva',
          tecnico: 'Ana',
          data: '2026-04-10T10:00',
        },
        {
          id: 'reg-target',
          equipId: 'eq-new',
          tipo: 'Corretiva',
          tecnico: 'Bruno',
          data: '2026-04-20T10:00',
        },
      ],
    });
    mocks.findEquip.mockImplementation((id) => ({
      id,
      nome: id === 'eq-new' ? 'Split Novo' : 'Split Antigo',
    }));
    mocks.profileGet.mockReturnValue({ nome: 'Tecnico Perfil', empresa: 'CoolTrack' });
  });

  it('mantem CTAs de PDF/WhatsApp fora da timeline de Historico', async () => {
    const timelineSource = source('src/ui/views/historico/timelineRenderer.js');

    expect(timelineSource).not.toContain('data-action="export-pdf"');
    expect(timelineSource).not.toContain('data-action="whatsapp-export"');
    expect(timelineSource).not.toContain('data-registro-id="${escapeAttr(');
  });

  it('mantem paridade de filtros e prioridade de filters.registroId para PDF e WhatsApp', async () => {
    const { buildReportFilters } =
      await import('../ui/controller/handlers/reportExportHandlers.js');
    const { filterRegistrosForReport } = await import('../domain/pdf/reportModel.js');
    const { WhatsAppExport } = await import('../domain/whatsapp.js');

    const filters = buildReportFilters({
      registroId: 'reg-target',
      equipId: 'eq-old',
      de: '2026-04-01',
      ate: '2026-04-30',
    });

    expect(filters).toEqual({
      registroId: 'reg-target',
      filtEq: 'eq-old',
      de: '2026-04-01',
      ate: '2026-04-30',
    });

    const pdfRecords = filterRegistrosForReport(mocks.getState().registros, filters);
    const whatsappText = WhatsAppExport.generateText(filters);

    expect(pdfRecords.map((item) => item.id)).toEqual(['reg-target']);
    expect(whatsappText).toContain('Split Novo');
    expect(whatsappText).toMatch(/Servi.o: Corretiva\./u);
    expect(whatsappText).not.toContain('Split Antigo');
  });

  it('exportPdfFlow usa data-registro-id do trigger e valida quota PDF com recurso correto', async () => {
    await bindHandlers();

    await mocks.handlers.get('export-pdf')({
      dataset: { registroId: 'reg-target' },
    });

    expect(mocks.hasReachedMonthlyLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        planCode: 'free',
        resource: 'pdf_export',
        usedCount: 2,
      }),
    );
    expect(mocks.generateMaintenanceReport).toHaveBeenCalledWith(
      expect.objectContaining({
        registroId: 'reg-target',
        filtEq: 'eq-old',
        de: '2026-04-01',
        ate: '2026-04-30',
        asBlob: true,
      }),
      expect.objectContaining({
        planCode: 'free',
        resolveSignatureForRecord: mocks.resolveSignatureForRecord,
      }),
    );
    expect(mocks.shareReportPdf).not.toHaveBeenCalled();
    expect(mocks.pdfToastShow).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'relatorio.pdf' }),
    );
  });

  it('shareWhatsAppFlow usa data-registro-id, valida quota WhatsApp e envia metadata ao share', async () => {
    await bindHandlers();

    await mocks.handlers.get('whatsapp-export')({
      dataset: { registroId: 'reg-target' },
    });

    expect(mocks.hasReachedMonthlyLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        planCode: 'free',
        resource: 'whatsapp_share',
        usedCount: 3,
      }),
    );
    expect(mocks.generateMaintenanceReport).toHaveBeenCalledWith(
      expect.objectContaining({
        registroId: 'reg-target',
        filtEq: 'eq-old',
        de: '2026-04-01',
        ate: '2026-04-30',
        asBlob: true,
      }),
      expect.objectContaining({
        planCode: 'free',
        resolveSignatureForRecord: mocks.resolveSignatureForRecord,
      }),
    );
    expect(mocks.shareReportPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'relatorio.pdf',
        metadata: { userId: 'user-1', registroId: 'reg-target' },
      }),
    );
    expect(mocks.incrementMonthlyUsage).toHaveBeenCalledWith('user-1', 'whatsapp_share');
    expect(mocks.shareToastShow).toHaveBeenCalled();
  });

  it('documenta fallback share/upload e consumo PDF de fotos, assinatura e checklist', () => {
    const shareReportSource = source('src/domain/pdf/shareReport.js');
    const shareReportTestSource = source('src/__tests__/shareReport.test.js');
    const servicesSource = source('src/domain/pdf/sections/services.js');
    const signaturesSource = source('src/domain/pdf/sections/signatures.js');
    const checklistSource = source('src/domain/pdf/sections/checklist.js');
    const pdfSource = source('src/domain/pdf.js');
    const reportExportHandlersSource = source('src/ui/controller/handlers/reportExportHandlers.js');

    expect(shareReportSource).toContain('uploadReportPdf');
    expect(shareReportSource).toContain('downloadPdfLocally');
    expect(shareReportSource).not.toContain(
      '../../ui/components/onboarding/onboardingChecklist.js',
    );
    expect(shareReportTestSource).toContain('fallback final');
    expect(shareReportTestSource).toContain("channel).toBe('download')");

    expect(servicesSource).toContain('registro.fotos');
    expect(servicesSource).toContain('resolvePhotoDataUrlForPdf');
    expect(signaturesSource).toContain('registro.assinatura');
    expect(signaturesSource).toContain('getSignatureForRecord(registro.id)');
    expect(checklistSource).toContain('registro.checklist.tipo_template');
    expect(checklistSource).toContain('registro.checklist.items');

    expect(pdfSource).not.toContain('../ui/components/signature.js');
    expect(pdfSource).toContain('resolveSignatureForRecord');
    expect(reportExportHandlersSource).toContain('../../components/signature.js');
    expect(reportExportHandlersSource).toContain('resolveSignatureForRecord');
  });
});
