export function buildRegistroReportFilters({ equipId, registroId } = {}) {
  return { equipId, registroId };
}

export function buildRegistroReportRoute({
  destination = 'whatsapp',
  equipId,
  registroId,
  includeEmptyRegistroId = false,
} = {}) {
  return {
    equipId,
    intent: destination,
    ...(registroId || includeEmptyRegistroId ? { registroId } : {}),
  };
}

export function notifyRegistroShareStarted({ Toast } = {}) {
  Toast?.success?.('Serviço salvo. Abrindo WhatsApp...');
}

export async function runRegistroWhatsappShare(
  { equipId, registroId } = {},
  { shareWhatsAppFlow } = {},
) {
  return shareWhatsAppFlow?.({ filters: buildRegistroReportFilters({ equipId, registroId }) });
}

export function runRegistroReportFallback(
  { destination = 'whatsapp', equipId, registroId, includeEmptyRegistroId = false } = {},
  { goTo } = {},
) {
  goTo?.(
    'relatorio',
    buildRegistroReportRoute({ destination, equipId, registroId, includeEmptyRegistroId }),
  );
}

export function runRegistroPdfAction({ equipId, registroId } = {}, { exportPdfFlow } = {}) {
  return exportPdfFlow?.({ filters: buildRegistroReportFilters({ equipId, registroId }) });
}

export async function runRegistroWhatsappAction(
  { equipId, registroId } = {},
  { shareWhatsAppFlow } = {},
) {
  return runRegistroWhatsappShare({ equipId, registroId }, { shareWhatsAppFlow });
}

export function buildRegistroPostSaveToastActions({ exportPdfFlow, shareWhatsAppFlow, goTo } = {}) {
  return {
    onAction: async ({ destination, equipId, registroId }) => {
      if (destination === 'pdf') {
        return runRegistroPdfAction({ equipId, registroId }, { exportPdfFlow });
      }
      return runRegistroWhatsappAction({ equipId, registroId }, { shareWhatsAppFlow });
    },
    onFallback: ({ destination, equipId, registroId }) => {
      runRegistroReportFallback({ destination, equipId, registroId }, { goTo });
    },
  };
}
