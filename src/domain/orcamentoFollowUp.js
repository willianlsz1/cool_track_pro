const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const FOLLOW_UP_DAYS = 3;

function getTime(value) {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  const time = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
        0,
        0,
        0,
        0,
      ).getTime()
    : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function getOrcamentoDisplayStatus(orcamento) {
  if (!orcamento || typeof orcamento !== 'object') return 'rascunho';
  const status = orcamento.status || 'rascunho';
  if (orcamento.visualizadoEm && (status === 'aguardando_assinatura' || status === 'enviado')) {
    return 'visualizado';
  }
  return status;
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
