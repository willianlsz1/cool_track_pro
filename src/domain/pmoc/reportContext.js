import { isPmocLikeServiceType, isPreventivaOrPmocServiceType } from './serviceType.js';

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasMarkedChecklist(registro) {
  return asArray(registro?.checklist?.items).some((item) => item?.status);
}

function summarizeChecklist(items) {
  const summary = asArray(items).reduce(
    (acc, item) => {
      if (item?.status === 'ok') acc.ok += 1;
      if (item?.status === 'fail') acc.fail += 1;
      if (item?.status === 'na') acc.na += 1;
      return acc;
    },
    { ok: 0, fail: 0, na: 0 },
  );

  return [
    summary.ok ? `${summary.ok} conforme` : '',
    summary.fail ? `${summary.fail} nao conforme` : '',
    summary.na ? `${summary.na} N/A` : '',
  ]
    .filter(Boolean)
    .join(', ');
}

function formatPreventiveDate(value, formatDate, formatDueRelative) {
  const raw = safeString(value);
  if (!raw) return '';
  const dateText = typeof formatDate === 'function' ? formatDate(raw) : raw;
  const dueText = typeof formatDueRelative === 'function' ? formatDueRelative(raw) : '';
  return dueText ? `${dateText} (${dueText})` : dateText;
}

export function buildContextualPmocReportSummary({
  registro = null,
  equipamento = null,
  formatDate,
  formatDueRelative,
} = {}) {
  const tipo = safeString(registro?.tipo, 'Outro') || 'Outro';
  const isPmocOrPreventive = isPreventivaOrPmocServiceType(tipo);
  const hasChecklist = hasMarkedChecklist(registro);
  if (!isPmocOrPreventive && !hasChecklist) return null;

  const items = [{ label: 'Tipo', value: tipo }];
  const periodicidade = Number(equipamento?.periodicidadePreventivaDias || 0);
  if (Number.isFinite(periodicidade) && periodicidade > 0) {
    items.push({ label: 'Rotina preventiva', value: `${periodicidade} dias` });
  }

  const proxima = formatPreventiveDate(registro?.proxima, formatDate, formatDueRelative);
  if (proxima) {
    items.push({ label: 'Proxima preventiva', value: proxima });
  }

  const checklistSummary = summarizeChecklist(registro?.checklist?.items);
  if (checklistSummary) {
    items.push({ label: 'Checklist', value: checklistSummary });
  }

  const badges = [];
  if (isPmocLikeServiceType(tipo) || hasChecklist) badges.push('Contexto PMOC');
  if (hasChecklist) badges.push('Checklist preenchido');
  if (!badges.length && isPmocOrPreventive) badges.push('Preventiva');

  return {
    visible: true,
    title: 'Resumo PMOC/preventivo',
    description: 'Resumo tecnico do atendimento preventivo. Nao substitui o PMOC formal.',
    badges,
    items,
  };
}
