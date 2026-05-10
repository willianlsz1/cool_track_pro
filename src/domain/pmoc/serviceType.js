function normalizeServiceType(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isCorrectiveLike(normalized) {
  return normalized.includes('corretiv');
}

export function isPmocLikeServiceType(tipo) {
  const normalized = normalizeServiceType(tipo);
  if (!normalized || isCorrectiveLike(normalized)) return false;
  return normalized.includes('pmoc');
}

export function isPreventivaLikeServiceType(tipo) {
  const normalized = normalizeServiceType(tipo);
  if (!normalized || isCorrectiveLike(normalized)) return false;
  return (
    normalized.includes('preventiv') ||
    normalized.includes('higieniz') ||
    normalized.includes('limpeza preventiva')
  );
}

export function isPreventivaOrPmocServiceType(tipo) {
  return isPreventivaLikeServiceType(tipo) || isPmocLikeServiceType(tipo);
}
