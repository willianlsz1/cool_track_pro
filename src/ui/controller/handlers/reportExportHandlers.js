import { on } from '../../../core/events.js';
import { Toast } from '../../../core/toast.js';
import { ErrorCodes, handleError } from '../../../core/errors.js';
// PDFGenerator é dynamic-imported dentro do handler pra evitar bundlar
// jspdf + jspdf-autotable + pako (~150 KB gz) no chunk principal. Só baixa
// quando o usuário clica "Gerar PDF".
import { WhatsAppExport } from '../../../domain/whatsapp.js';
import { Auth } from '../../../core/auth.js';
import { trackEvent } from '../../../core/telemetry.js';
import { runAsyncAction } from '../../components/actionFeedback.js';
import { ShareSuccessToast } from '../../components/shareSuccessToast.js';
import { PdfSuccessToast } from '../../components/pdfSuccessToast.js';
import { PdfQuotaBadge } from '../../components/pdfQuotaBadge.js';
import * as SignatureComponents from '../../components/signature.js';
import {
  getEffectivePlan,
  getPlanCodeForUserId,
  PLAN_CODE_FREE,
  PLAN_CODE_PLUS,
} from '../../../core/plans/subscriptionPlans.js';
import { fetchOperationalProfile } from '../../../core/plans/operationalPlan.js';
import { OnboardingChecklist } from '../../components/onboarding/onboardingChecklist.js';
import {
  getMonthlyLimitForPlan,
  getMonthlyUsageSnapshot,
  hasReachedMonthlyLimit,
  incrementMonthlyUsage,
  USAGE_RESOURCE_PDF_EXPORT,
  USAGE_RESOURCE_WHATSAPP_SHARE,
} from '../../../core/usageLimits.js';
import { buildWhatsAppSuccessCopy } from '../../../domain/reportExportHelpers.js';

export function buildReportFilters({
  equipId = '',
  registroId = '',
  de = '',
  ate = '',
  filtEq = '',
} = {}) {
  return {
    registroId: String(registroId || ''),
    filtEq: String(filtEq || equipId || ''),
    de: String(de || ''),
    ate: String(ate || ''),
  };
}

function getReportFilters({ triggerEl = null } = {}) {
  // registroId vem do botão clicado quando a ação é disparada de um card
  // individual (Histórico/Relatório). Quando vem da toolbar global, o botão
  // não carrega data-registro-id e o filtro segue lendo os campos da view
  // de Relatório (#rel-equip / #rel-de / #rel-ate). filterRegistrosForReport
  // curto-circuita pelo registroId, então passar os dois é seguro.
  return buildReportFilters({
    filtEq: document.getElementById('rel-equip')?.value || '',
    de: document.getElementById('rel-de')?.value || '',
    ate: document.getElementById('rel-ate')?.value || '',
    registroId: triggerEl?.dataset?.registroId || '',
  });
}

async function resolvePlanAndUsage(userId) {
  const [planCode, usageSnapshot] = await Promise.all([
    getPlanCodeForUserId(userId),
    getMonthlyUsageSnapshot(userId),
  ]);

  return { planCode, usageSnapshot };
}

function buildPdfLimitMessage(planCode, pdfLimit) {
  if (planCode === PLAN_CODE_FREE) {
    return `Voce atingiu o limite operacional de ${pdfLimit} PDF/mes. O WhatsApp usa uma cota separada.`;
  }
  if (planCode === PLAN_CODE_PLUS) {
    return `Voce atingiu o limite operacional de ${pdfLimit} PDFs/mes.`;
  }
  return `Você atingiu o limite mensal de ${pdfLimit} PDFs.`;
}

/**
 * ensureReportBudget
 * -------------------
 * Porta de entrada compartilhada por "Exportar PDF" e "Imprimir" — ambos
 * consomem a mesma quota mensal (USAGE_RESOURCE_PDF_EXPORT). Centraliza:
 *   1. Auth.getUser() + modal de conversão para convidados
 *   2. fetchOperationalProfile() + getEffectivePlan() para o plano efetivo
 *   3. getMonthlyUsageSnapshot + hasReachedMonthlyLimit + modal de limite
 *   4. commit(): incremento condicional (apenas planos com limite finito)
 *
 * Retorna `{ ok: false }` quando bloqueia (guest ou limite) e o caller sai.
 * Retorna `{ ok: true, user, planCode, pdfUsed, pdfLimit, commit }` no happy path.
 */
async function ensureReportBudget({ attemptedEvent, blockedEvent }) {
  const user = await Auth.getUser();
  if (!user) {
    // Defensivo: sem usuário autenticado, sem export. Na prática o bootstrap
    // já redireciona pra landing quando não há sessão, mas se por algum motivo
    // chegar aqui sem user, mostramos um aviso em vez de quebrar.
    trackEvent(blockedEvent, { reason: 'not_authenticated' });
    Toast.warning('Faça login para gerar o relatório.');
    return { ok: false };
  }

  const { profile } = await fetchOperationalProfile();
  const planCode = getEffectivePlan(profile);
  trackEvent(attemptedEvent, { plan: planCode });

  // ── Quota mensal: Free=ilimitado (com marca d'água), Plus=ilimitado (sem marca), Pro=ilimitado (sem marca) ─
  const usageSnapshot = await getMonthlyUsageSnapshot(user.id);
  const pdfUsed = usageSnapshot[USAGE_RESOURCE_PDF_EXPORT];
  const pdfLimit = getMonthlyLimitForPlan(planCode, USAGE_RESOURCE_PDF_EXPORT);

  if (
    hasReachedMonthlyLimit({
      planCode,
      resource: USAGE_RESOURCE_PDF_EXPORT,
      usedCount: pdfUsed,
    })
  ) {
    trackEvent(blockedEvent, { reason: 'limit_reached', plan: planCode });
    Toast.warning(buildPdfLimitMessage(planCode, pdfLimit));
    Toast.warning('Recurso indisponivel nesta etapa.');
    return { ok: false };
  }

  return {
    ok: true,
    user,
    planCode,
    pdfUsed,
    pdfLimit,
    async commit() {
      // Incrementa contagem só se o plano tem limite finito (Free/Plus).
      // Pro (limit=Infinity) não consome quota.
      if (!Number.isFinite(pdfLimit)) return pdfUsed;
      return incrementMonthlyUsage(user.id, USAGE_RESOURCE_PDF_EXPORT);
    },
  };
}

/**
 * Mostra modal de pré-visualização do PDF antes do download/share.
 * Recebe um Blob + fileName e exibe num iframe. Retorna 'confirm' se o
 * usuário clicou "Baixar/Enviar" ou 'cancel' se descartou. Sempre revoga
 * a Object URL ao fechar pra liberar memória.
 *
 * @param {{blob: Blob, primaryLabel?: string, subtitle?: string}} opts
 * @returns {Promise<'confirm'|'cancel'>}
 */
function showPdfPreview({
  blob,
  primaryLabel = 'Baixar PDF',
  subtitle = 'Confira antes de baixar',
}) {
  return new Promise((resolve) => {
    const modal = document.getElementById('modal-pdf-preview');
    const frame = document.getElementById('pdf-preview-frame');
    const fallbackLink = document.getElementById('pdf-preview-fallback-link');
    const subtitleEl = document.getElementById('pdf-preview-subtitle');
    const actionBtn = document.getElementById('pdf-preview-action-btn');

    if (!modal || !frame || !actionBtn) {
      console.warn('[PDF Preview] Modal não encontrado no DOM.');
      resolve('confirm');
      return;
    }

    const url = URL.createObjectURL(blob);
    // <object> usa data=, não src=. O fallback nativo do <object> aparece
    // sozinho se o browser não souber renderizar application/pdf.
    frame.setAttribute('data', url);
    if (fallbackLink) {
      // Sem download attribute — queremos que o link ABRA em nova aba pra
      // visualizacao, não force download. O usuário pode baixar pelo botao
      // primario do modal.
      fallbackLink.href = url;
      fallbackLink.removeAttribute('download');
    }
    if (subtitleEl) subtitleEl.textContent = subtitle;
    actionBtn.textContent = primaryLabel;

    let resolved = false;
    const cleanup = (decision) => {
      if (resolved) return;
      resolved = true;
      try {
        frame.setAttribute('data', '');
        URL.revokeObjectURL(url);
      } catch (_e) {
        /* ignore */
      }
      modal.removeEventListener('click', onModalClick, true);
      document.removeEventListener('keydown', onKey, true);
      import('../../../core/modal.js').then((m) => m.Modal.close('modal-pdf-preview'));
      resolve(decision);
    };

    function onModalClick(e) {
      const cancelHit = e.target.closest('[data-action="pdf-preview-cancel"]');
      const confirmHit = e.target.closest('[data-action="pdf-preview-confirm"]');
      if (cancelHit) {
        e.preventDefault();
        e.stopPropagation();
        cleanup('cancel');
        return;
      }
      if (confirmHit) {
        e.preventDefault();
        e.stopPropagation();
        cleanup('confirm');
        return;
      }
      // Click no overlay (fora do .modal) também cancela.
      if (e.target === modal) cleanup('cancel');
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanup('cancel');
      }
    }

    modal.addEventListener('click', onModalClick, true);
    document.addEventListener('keydown', onKey, true);

    // Abre o modal — fallback eventual e tratado nativamente pelo <object>.
    import('../../../core/modal.js').then((m) => m.Modal.open('modal-pdf-preview'));
  });
}

/**
 * Dispara o download de um Blob como arquivo via <a download>.
 */
function triggerBlobDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 100);
}

function bindPdfExport() {
  on('export-pdf', async (el) => {
    try {
      await exportPdfFlow({
        filters: getReportFilters({ triggerEl: el }),
        triggerEl: el,
      });
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.NETWORK_ERROR,
        message: 'Não foi possivel gerar o PDF agora.',
        context: { action: 'controller.export-pdf' },
      });
    }
  });
}

/**
 * Preview do PDF agora eh OPT-IN: por default, click no "Baixar PDF" gera
 * e baixa direto (1 click). Power user pode ligar via localStorage:
 *   localStorage.setItem('cooltrack-pdf-preview', 'true');
 * Ai o preview reaparece como antes. Configuracoes UI futura pode expor
 * essa flag formalmente.
 */
function _isPreviewEnabled() {
  try {
    return localStorage.getItem('cooltrack-pdf-preview') === 'true';
  } catch (_e) {
    return false;
  }
}

function resolvePdfExportBudget() {
  return ensureReportBudget({
    attemptedEvent: 'pdf_export_attempted',
    blockedEvent: 'pdf_export_blocked',
  });
}

async function generateReportPdfBlob(filters, planCode) {
  const { PDFGenerator } = await import('../../../domain/pdf.js');
  return PDFGenerator.generateMaintenanceReport(
    { ...filters, asBlob: true },
    { planCode, resolveSignatureForRecord: getPdfSignatureResolver() },
  );
}

function getPdfSignatureResolver() {
  const resolveSignatureForRecord = getSignatureComponentExport('resolveSignatureForRecord');
  if (typeof resolveSignatureForRecord === 'function') return resolveSignatureForRecord;

  const getSignatureForRecord = getSignatureComponentExport('getSignatureForRecord');
  if (typeof getSignatureForRecord !== 'function') return null;

  return (registro) => getSignatureForRecord(registro?.id || registro);
}

function getSignatureComponentExport(exportName) {
  try {
    return SignatureComponents[exportName];
  } catch (_err) {
    return null;
  }
}

async function confirmPdfExportPreview({ blob, fileName, planCode }) {
  if (!_isPreviewEnabled()) return true;

  const decision = await showPdfPreview({
    blob,
    fileName,
    primaryLabel: 'Baixar PDF',
    subtitle: 'Confira antes de baixar',
  });
  if (decision !== 'confirm') {
    trackEvent('pdf_export_cancelled', { plan: planCode, stage: 'preview' });
    return false;
  }
  return true;
}

function showPdfExportSuccess({ pdfLimit, newUsedCount, fileName }) {
  PdfSuccessToast.show(
    Number.isFinite(pdfLimit) ? { used: newUsedCount, limit: pdfLimit, fileName } : { fileName },
  );
  PdfQuotaBadge.refresh();
}

function markReportPdfOnboardingStep() {
  try {
    OnboardingChecklist.markStep('pdf');
  } catch (_) {
    /* nunca quebra o flow */
  }
}

async function executePdfExport(filters) {
  const budget = await resolvePdfExportBudget();
  if (!budget.ok) return false;

  const { planCode, pdfLimit } = budget;

  // SEM confirmacao inicial — clicar no botao Baixar PDF JA significa intencao.
  // Se preview opt-in estiver ligado, mostra preview antes do download.
  const result = await generateReportPdfBlob(filters, planCode);
  if (!result || !result.blob) {
    Toast.error('Erro ao gerar PDF.');
    return false;
  }

  // Preview opt-in (default OFF): se ligado, mostra preview antes de baixar.
  const previewConfirmed = await confirmPdfExportPreview({
    blob: result.blob,
    fileName: result.fileName,
    planCode,
  });
  if (!previewConfirmed) {
    return false;
  }

  // Dispara o download e commita o uso.
  triggerBlobDownload(result.blob, result.fileName);
  const newUsedCount = await budget.commit();

  showPdfExportSuccess({
    pdfLimit,
    newUsedCount,
    fileName: result.fileName,
  });
  // Onboarding: marca passo "PDF gerado" — caminho do relatório (Baixar PDF).
  markReportPdfOnboardingStep();
  return true;
}

export async function exportPdfFlow({ filters, triggerEl = null } = {}) {
  const safeFilters = buildReportFilters(filters);
  if (triggerEl) {
    let done = false;
    await runAsyncAction(triggerEl, { loadingLabel: 'Gerando PDF...' }, async () => {
      done = await executePdfExport(safeFilters);
    });
    return done;
  }
  return executePdfExport(safeFilters);
}

function bindWhatsAppExport() {
  on('whatsapp-export', async (el) => {
    try {
      await shareWhatsAppFlow({
        filters: getReportFilters({ triggerEl: el }),
        triggerEl: el,
      });
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.NETWORK_ERROR,
        message: 'Não foi possivel preparar o envio para o WhatsApp.',
        context: { action: 'controller.whatsapp-export' },
      });
    }
  });
}

function buildWhatsAppLimitMessage(planCode, whatsappLimit) {
  return planCode === 'plus'
    ? `Você atingiu ${whatsappLimit} compartilhamentos este mês no Plus. O Pro tem envios ilimitados.`
    : `Voce atingiu ${whatsappLimit} compartilhamentos este mes.`;
}

async function resolveWhatsAppShareBudget() {
  const user = await Auth.getUser();
  trackEvent('whatsapp_share_attempted', {});

  if (!user) {
    // Defensivo: bootstrap já redireciona não-autenticados pra landing.
    trackEvent('whatsapp_share_blocked', { reason: 'not_authenticated' });
    Toast.warning('Faça login para compartilhar o relatório.');
    return false;
  }

  const { planCode, usageSnapshot } = await resolvePlanAndUsage(user.id);
  const whatsappUsed = usageSnapshot[USAGE_RESOURCE_WHATSAPP_SHARE];
  const whatsappLimit = getMonthlyLimitForPlan(planCode, USAGE_RESOURCE_WHATSAPP_SHARE);

  if (
    hasReachedMonthlyLimit({
      planCode,
      resource: USAGE_RESOURCE_WHATSAPP_SHARE,
      usedCount: whatsappUsed,
    })
  ) {
    trackEvent('whatsapp_share_blocked', { reason: 'limit_reached', plan: planCode });
    Toast.warning(buildWhatsAppLimitMessage(planCode, whatsappLimit));
    Toast.warning('Recurso indisponivel nesta etapa.');
    return false;
  }

  return {
    ok: true,
    user,
    planCode,
    whatsappUsed,
    whatsappLimit,
  };
}

async function confirmWhatsAppSharePreview({ pdfResult, whatsappLimit, whatsappUsed, planCode }) {
  if (!_isPreviewEnabled()) return true;

  const wasSubtitle = Number.isFinite(whatsappLimit)
    ? `Restam ${Math.max(0, whatsappLimit - whatsappUsed)} de ${whatsappLimit} envios este mês · confira antes de enviar`
    : 'Confira antes de compartilhar';
  const previewDecision = await showPdfPreview({
    blob: pdfResult.blob,
    fileName: pdfResult.fileName,
    primaryLabel: 'Enviar via WhatsApp',
    subtitle: wasSubtitle,
  });
  if (previewDecision !== 'confirm') {
    trackEvent('whatsapp_share_cancelled', { plan: planCode, stage: 'preview' });
    return false;
  }
  return true;
}

async function shareReportPdfWithWhatsApp({ pdfResult, prefixText, user, filters }) {
  const { shareReportPdf } = await import('../../../domain/pdf/shareReport.js');
  return shareReportPdf({
    pdfBlob: pdfResult.blob,
    fileName: pdfResult.fileName,
    whatsappText: prefixText,
    metadata: { userId: user.id, registroId: filters?.registroId || null },
  });
}

async function commitWhatsAppShareUsage({ user, whatsappLimit, whatsappUsed }) {
  if (!Number.isFinite(whatsappLimit)) return whatsappUsed;
  return incrementMonthlyUsage(user.id, USAGE_RESOURCE_WHATSAPP_SHARE);
}

function showWhatsAppShareSuccess({ whatsappLimit, newUsedCount, shareResult }) {
  ShareSuccessToast.show({
    ...(Number.isFinite(whatsappLimit) ? { used: newUsedCount, limit: whatsappLimit } : {}),
    ...buildWhatsAppSuccessCopy(shareResult.channel),
  });
}

async function executeWhatsAppShare(filters) {
  const budget = await resolveWhatsAppShareBudget();
  if (!budget.ok) return false;

  const { user, planCode, whatsappUsed, whatsappLimit } = budget;

  // Sem modal de confirmação inicial — preview do PDF antes do share funciona
  // como confirmação visual. Para Free/Plus, info de quota aparece no subtitle
  // do preview ("Restam X compartilhamentos este mês").

  // Gera o PDF como Blob (sem disparar download) e deixa o shareReport
  // decidir o canal: Web Share API (mobile) ou upload+wa.me (desktop/fallback).
  Toast.info?.('Gerando relatório...');
  const pdfResult = await generateReportPdfBlob(filters, planCode);
  if (!pdfResult || !pdfResult.blob) {
    trackEvent('whatsapp_share_blocked', { reason: 'pdf_generation_failed', plan: planCode });
    Toast.warning('Nenhum registro para enviar.');
    return false;
  }

  // Texto curto pro share — usa o prefixo canônico do WhatsAppExport quando
  // houver registros; fallback pra mensagem padrão do shareReport senão.
  const prefixText = WhatsAppExport.generateText(filters) || null;

  // Preview opt-in (mesma flag do PDF). Default OFF: gera + abre share sheet
  // direto. Power user pode ligar via localStorage 'cooltrack-pdf-preview=true'.
  const previewConfirmed = await confirmWhatsAppSharePreview({
    pdfResult,
    whatsappLimit,
    whatsappUsed,
    planCode,
  });
  if (!previewConfirmed) {
    return false;
  }

  Toast.info?.('Preparando compartilhamento...');
  const shareResult = await shareReportPdfWithWhatsApp({
    pdfResult,
    prefixText,
    user,
    filters,
  });

  // Cancelamento do share sheet não conta como erro nem consome quota.
  if (!shareResult.ok && shareResult.cancelled) {
    return false;
  }
  // Onboarding: marca passo "PDF gerado" — caminho WhatsApp share também
  // dispara, mesmo que o user não tenha feito download direto.
  if (shareResult.ok) {
    try {
      OnboardingChecklist.markStep('pdf');
    } catch (_) {
      /* no-op */
    }
  }

  if (!shareResult.ok) {
    Toast.warning('Não foi possível compartilhar o PDF. Tente baixar o relatório.');
    return false;
  }

  const newUsedCount = await commitWhatsAppShareUsage({
    user,
    whatsappLimit,
    whatsappUsed,
  });

  trackEvent('whatsapp_share_completed', {
    channel: shareResult.channel,
    plan: planCode,
  });

  showWhatsAppShareSuccess({
    whatsappLimit,
    newUsedCount,
    shareResult,
  });
  return true;
}

export async function shareWhatsAppFlow({ filters, triggerEl = null } = {}) {
  const safeFilters = buildReportFilters(filters);
  if (triggerEl) {
    let done = false;
    await runAsyncAction(triggerEl, { loadingLabel: 'Preparando...' }, async () => {
      done = await executeWhatsAppShare(safeFilters);
    });
    return done;
  }
  return executeWhatsAppShare(safeFilters);
}

/**
 * Detecta cliente pré-selecionado a partir de:
 *   1. data-cliente-id no elemento que disparou (CTA do card cliente)
 *   2. filtro do relatório (rel-equip) quando aponta pra equip único
 *      cuja clienteId é definida
 */
function detectPreselectClienteId(el, equipamentos) {
  // Prioridade 1: explicito no data-cliente-id
  const explicit = el?.dataset?.clienteId;
  if (explicit) return String(explicit);
  // Prioridade 2: filtro do relatório aponta pra equip específico
  const relEquipSelect = document.getElementById('rel-equip');
  const equipId = relEquipSelect?.value;
  if (!equipId) return null;
  const eq = equipamentos.find((e) => e.id === equipId);
  return eq?.clienteId || null;
}

function bindPmocFormal() {
  on('open-pmoc-modal', async (el) => {
    try {
      // Lazy-load do modal e do gerador (chunk Pro-only).
      const [
        { PmocModal },
        { generatePmocPdf },
        { Profile },
        { getState },
        { Auth },
        { isCachedPlanPlusOrHigher },
        { hasProAccess },
      ] = await Promise.all([
        import('../../components/pmocModal.js'),
        import('../../../domain/pdf/pmoc/pmocReport.js'),
        import('../../../core/profile.js'),
        import('../../../core/state.js'),
        import('../../../core/auth.js'),
        import('../../../core/plans/planCache.js'),
        import('../../../core/plans/subscriptionPlans.js'),
      ]);

      // Pro-gate: tenta cache primeiro, depois confirma com fetch real
      // pra evitar mostrar variante errada por TTL stale.
      let isPro = isCachedPlanPlusOrHigher();
      // Refinar: cache Plus+ é mais permissivo do que Pro estrito.
      // Faz fetch defensivo do profile real.
      try {
        const { fetchOperationalProfile } = await import('../../../core/plans/operationalPlan.js');
        const { profile } = await fetchOperationalProfile();
        isPro = hasProAccess(profile);
      } catch (_) {
        /* offline: mantém cache (over-permissive nessa edge case é OK pro PMOC) */
      }

      const user = await Auth.getUser();
      const profile = Profile.get();

      // Bug fix: state.clientes só é populado quando user visita /clientes
      // ou abre o modal de equipamento. Se ele abre PMOC direto do header
      // sem nunca ter ido em /clientes, o dropdown vem vazio. Garante o
      // load aqui antes de ler o state. Silencia erros (offline / Free
      // sem feature) — nesses casos o dropdown fica genérico mesmo.
      try {
        const { loadClientes } = await import('../../../core/clientes.js');
        await loadClientes();
      } catch (_) {
        /* offline ok — usa o que tiver no cache de state */
      }

      const { clientes = [], equipamentos = [], registros = [] } = getState();

      // PMOC Fase 6: smart preselect do cliente
      const preselectClienteId = detectPreselectClienteId(el, equipamentos);

      PmocModal.open({
        clientes,
        isPro,
        preselectClienteId,
        onConfirm: async ({ ano, cliente }) => {
          trackEvent('pmoc_pdf_generated', {
            ano,
            cliente_vinculado: Boolean(cliente),
            equipamentos_count: equipamentos.length,
            from_preselect: Boolean(preselectClienteId),
          });
          const fileName = await generatePmocPdf({
            ano,
            cliente,
            equipamentos,
            registros,
            profile,
            userId: user?.id || null,
          });
          // Onboarding: marca passo PDF (caminho PMOC)
          try {
            OnboardingChecklist.markStep('pdf');
          } catch (_) {
            /* no-op */
          }
          if (fileName) {
            Toast.success(`PMOC gerado: ${fileName}`);
          }
        },
      });
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.NETWORK_ERROR,
        message: 'Não foi possível abrir o gerador PMOC.',
        context: { action: 'controller.open-pmoc-modal' },
      });
    }
  });

  // PMOC Fase 6: dropdown unificado "Exportar PDF ▾"
  if (typeof document !== 'undefined' && !document.body.dataset.exportDdBound) {
    document.body.dataset.exportDdBound = '1';
    // Click fora fecha o menu
    document.addEventListener('click', (event) => {
      const dd = document.getElementById('rel-export-dd');
      const menu = document.getElementById('rel-export-dd-menu');
      const toggle = document.getElementById('btn-export-dd-toggle');
      if (!dd || !menu || menu.hidden) return;
      if (dd.contains(event.target)) return;
      menu.hidden = true;
      toggle?.setAttribute('aria-expanded', 'false');
    });
    // Esc fecha
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const menu = document.getElementById('rel-export-dd-menu');
      const toggle = document.getElementById('btn-export-dd-toggle');
      if (!menu || menu.hidden) return;
      menu.hidden = true;
      toggle?.setAttribute('aria-expanded', 'false');
    });
    // Fechar ao clicar em qualquer item do menu (handlers individuais já rodam via delegate global)
    document.addEventListener('click', (event) => {
      const item = event.target.closest('.rel-export-dd__item');
      if (!item) return;
      const menu = document.getElementById('rel-export-dd-menu');
      const toggle = document.getElementById('btn-export-dd-toggle');
      if (menu) menu.hidden = true;
      toggle?.setAttribute('aria-expanded', 'false');
    });
  }

  on('toggle-export-dd', (el) => {
    const menu = document.getElementById('rel-export-dd-menu');
    if (!menu) return;
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    el?.setAttribute('aria-expanded', String(willOpen));
  });

  on('open-pmoc-info', async () => {
    try {
      const { PmocInfoModal } = await import('../../components/pmocInfoModal.js');
      PmocInfoModal.open();
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.NETWORK_ERROR,
        message:
          'Não conseguimos abrir a página do PMOC agora. Tente novamente em instantes ou use o suporte pelo menu.',
        context: { action: 'controller.open-pmoc-info' },
      });
    }
  });
}

export function bindReportExportHandlers() {
  bindPdfExport();
  bindWhatsAppExport();
  bindPmocFormal();
}
