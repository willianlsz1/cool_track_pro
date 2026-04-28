const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const FOLLOW_UP_DAYS = 3;

function getTime(value) {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function getOrcamentoDisplayStatus(orcamento) {
  if (!orcamento || typeof orcamento !== 'object') return 'rascunho';
  if (orcamento.status === 'aguardando_assinatura') {
    return orcamento.visualizadoEm ? 'visualizado' : 'enviado';
  }
  return orcamento.status || 'rascunho';
}

export function getFollowUpMeta(orcamento, now = Date.now()) {
  const sentAt = getTime(orcamento?.enviadoEm);
  if (!sentAt) return { shouldShow: false, daysOpen: 0 };

  const displayStatus = getOrcamentoDisplayStatus(orcamento);
  const eligibleStatus = displayStatus === 'enviado' || displayStatus === 'visualizado';
  const blockedByOutcome =
    displayStatus === 'aprovado' ||
    displayStatus === 'recusado' ||
    displayStatus === 'expirado' ||
    !!orcamento?.assinadoEm;

  if (!eligibleStatus || blockedByOutcome) {
    return { shouldShow: false, daysOpen: 0 };
  }

  const daysOpen = Math.floor((now - sentAt) / ONE_DAY_MS);
  if (daysOpen < FOLLOW_UP_DAYS) {
    return { shouldShow: false, daysOpen };
  }

  return { shouldShow: true, daysOpen };
}
