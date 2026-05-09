let notas = null;
let source = 'manual';

export function setNameplateMetadata({ notas: nextNotas = null, source: nextSource = null } = {}) {
  if (nextNotas != null) notas = String(nextNotas);
  if (nextSource === 'ai' || nextSource === 'manual') source = nextSource;
}

export function resetNameplateMetadata() {
  notas = null;
  source = 'manual';
}

export function getNameplateMetadata() {
  return {
    notas,
    source,
  };
}
