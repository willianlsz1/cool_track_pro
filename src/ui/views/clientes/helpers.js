import { DAYS_30_MS, DAYS_60_MS } from './constants.js';

/**
 * Extrai a cidade do endereço (heurística): pega o último segmento antes de UF
 * ou o segmento depois da última vírgula.
 */
export function extractCity(endereco) {
  if (!endereco) return '';
  const str = String(endereco).trim();
  const mUf = str.match(/([A-Za-zÀ-ÿ\s.]+?)[\s,/-]+([A-Z]{2})\s*$/);
  if (mUf?.[1]) return mUf[1].trim().replace(/^[\s,-]+|[\s,-]+$/g, '');
  const parts = str
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return '';
}

export function formatRelativeDate(ts, now = Date.now()) {
  if (!ts) return 'Nunca';
  const diff = now - ts;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (diff < DAYS_30_MS) {
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
  }
  return `${days} dias atrás`;
}

export function lastServiceClass(sinceLast) {
  if (!Number.isFinite(sinceLast)) return 'cli-stat__value--danger';
  if (sinceLast > DAYS_60_MS) return 'cli-stat__value--danger';
  if (sinceLast > DAYS_30_MS) return 'cli-stat__value--warn';
  return 'cli-stat__value--ok';
}

export function pmocStatusClass(status) {
  if (status === 'em_dia') return 'cli-pmoc__chip--ok';
  if (status === 'atencao') return 'cli-pmoc__chip--warn';
  if (status === 'atrasado') return 'cli-pmoc__chip--danger';
  return 'cli-pmoc__chip--muted';
}
