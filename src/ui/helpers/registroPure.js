export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function isPreventivaTipo(tipoValue) {
  return String(tipoValue || '')
    .toLowerCase()
    .includes('preventiva');
}
