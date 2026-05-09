export const CRITICIDADE_LABEL = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const PRIORIDADE_OPERACIONAL_LABEL = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
};

const PERIODICIDADE_PREVENTIVA_BASE = {
  split_hi_wall: 90,
  split_cassette: 90,
  split_piso_teto: 60,
  vrf_vrv: 45,
  ghp: 45,
  chiller: 30,
  fan_coil: 60,
  self_contained: 60,
  roof_top: 45,
  camara_fria: 30,
  balcao_frigorico: 45,
  freezer: 45,
  geladeira: 60,
  bebedouro: 90,
  outro: 60,
};

export const PERIODICIDADE_PREVENTIVA_POR_TIPO = {
  'Split Hi-Wall': PERIODICIDADE_PREVENTIVA_BASE.split_hi_wall,
  'Split Cassette': PERIODICIDADE_PREVENTIVA_BASE.split_cassette,
  'Split Piso Teto': PERIODICIDADE_PREVENTIVA_BASE.split_piso_teto,
  'VRF / VRV': PERIODICIDADE_PREVENTIVA_BASE.vrf_vrv,
  GHP: PERIODICIDADE_PREVENTIVA_BASE.ghp,
  Chiller: PERIODICIDADE_PREVENTIVA_BASE.chiller,
  'Fan Coil': PERIODICIDADE_PREVENTIVA_BASE.fan_coil,
  'Self Contained': PERIODICIDADE_PREVENTIVA_BASE.self_contained,
  'Roof Top': PERIODICIDADE_PREVENTIVA_BASE.roof_top,
  'Câmara Fria': PERIODICIDADE_PREVENTIVA_BASE.camara_fria,
  'Camara Fria': PERIODICIDADE_PREVENTIVA_BASE.camara_fria,
  'Camera Fria': PERIODICIDADE_PREVENTIVA_BASE.camara_fria,
  'Balcão Frigorífico': PERIODICIDADE_PREVENTIVA_BASE.balcao_frigorico,
  Freezer: PERIODICIDADE_PREVENTIVA_BASE.freezer,
  Geladeira: PERIODICIDADE_PREVENTIVA_BASE.geladeira,
  Bebedouro: PERIODICIDADE_PREVENTIVA_BASE.bebedouro,
  Outro: PERIODICIDADE_PREVENTIVA_BASE.outro,
};

const CRITICIDADE_VALUES = Object.keys(CRITICIDADE_LABEL);
const PRIORIDADE_OPERACIONAL_VALUES = Object.keys(PRIORIDADE_OPERACIONAL_LABEL);
const CRITICIDADE_FACTOR = { baixa: 1.15, media: 1, alta: 0.85, critica: 0.7 };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getTipoKey(tipo) {
  const raw = String(tipo || '').trim();
  if (!raw) return 'outro';

  if (
    raw.includes('Fria') &&
    (raw.includes('Camara') ||
      raw.includes('Camera') ||
      raw.includes('Câmara') ||
      raw.includes('Câmara'))
  ) {
    return 'camara_fria';
  }

  const aliases = {
    'Split Hi-Wall': 'split_hi_wall',
    'Split Cassette': 'split_cassette',
    'Split Piso Teto': 'split_piso_teto',
    'VRF / VRV': 'vrf_vrv',
    GHP: 'ghp',
    Chiller: 'chiller',
    'Fan Coil': 'fan_coil',
    'Self Contained': 'self_contained',
    'Roof Top': 'roof_top',
    'Balcão Frigorífico': 'balcao_frigorico',
    Freezer: 'freezer',
    Geladeira: 'geladeira',
    Bebedouro: 'bebedouro',
  };

  return aliases[raw] || 'outro';
}

export function normalizeCriticidade(value, fallback = 'media') {
  return CRITICIDADE_VALUES.includes(value) ? value : fallback;
}

export function normalizePrioridadeOperacional(value, fallback = 'normal') {
  return PRIORIDADE_OPERACIONAL_VALUES.includes(value) ? value : fallback;
}

export function getSuggestedPreventiveDays(tipo, criticidade = 'media') {
  const tipoKey = getTipoKey(tipo);
  const baseDays = PERIODICIDADE_PREVENTIVA_BASE[tipoKey] || PERIODICIDADE_PREVENTIVA_BASE.outro;
  const factor = CRITICIDADE_FACTOR[normalizeCriticidade(criticidade)];
  return clamp(Math.round((baseDays * factor) / 5) * 5, 15, 180);
}

export function normalizePeriodicidadePreventivaDias(value, tipo, criticidade = 'media') {
  const numeric = Number.parseInt(value, 10);
  if (Number.isFinite(numeric)) return clamp(numeric, 15, 365);
  return getSuggestedPreventiveDays(tipo, criticidade);
}
