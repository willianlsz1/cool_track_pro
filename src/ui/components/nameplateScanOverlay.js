// IDs do overlay de scan.
const ID_SCAN = 'nameplate-scan';
const ID_SCAN_IMG = 'nameplate-scan-img';
const ID_SCAN_STAGE_TEXT = 'nameplate-scan-stage-text';
const ID_SCAN_BAR = 'nameplate-scan-bar';
const ID_SCAN_BAR_FILL = 'nameplate-scan-bar-fill';
const ID_SCAN_PERCENT = 'nameplate-scan-percent';
const ID_SCAN_RESULT = 'nameplate-scan-result';
const ID_SCAN_DETECTED = 'nameplate-scan-detected';
const ID_SCAN_TOTAL = 'nameplate-scan-total';
const ID_SCAN_RESULT_PERCENT = 'nameplate-scan-result-percent';
const ID_SCAN_RESULT_SUB = 'nameplate-scan-result-sub';
const ID_SCAN_REVIEW_LIST = 'nameplate-scan-review-list';

const REVIEW_FIELDS = [
  { key: 'marcaModelo', label: 'Marca / modelo' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'fluido', label: 'Fluido' },
  { key: 'tensao', label: 'Tensão' },
  { key: 'frequenciaHz', label: 'Frequência' },
  { key: 'fases', label: 'Fases' },
  { key: 'capacidadeBtu', label: 'Capacidade BTU' },
  { key: 'potenciaW', label: 'Potência' },
  { key: 'correnteA', label: 'Corrente refrig.' },
  { key: 'correnteAquecA', label: 'Corrente aquec.' },
  { key: 'numeroSerie', label: 'Nº série' },
  { key: 'pressaoSuccaoMpa', label: 'Pressão sucção' },
  { key: 'pressaoDescargaMpa', label: 'Pressão descarga' },
  { key: 'grauProtecao', label: 'Grau proteção' },
  { key: 'anoFabricacao', label: 'Ano fabricação' },
];

const AI_FIELD_TOTAL = REVIEW_FIELDS.length + 1;

let progressInterval = null;

export async function showScanOverlay(file) {
  const overlay = document.getElementById(ID_SCAN);
  if (!overlay) return;

  // Reset
  const resultPanel = document.getElementById(ID_SCAN_RESULT);
  if (resultPanel) resultPanel.hidden = true;

  overlay.hidden = false;
  overlay.dataset.state = 'scanning';
  setScanProgress(0);
  setScanStage('Carregando foto…');

  // Thumbnail: URL.createObjectURL pra mostrar rápido (não precisa ler
  // base64 só pra thumbnail).
  const img = document.getElementById(ID_SCAN_IMG);
  if (img) {
    const url = URL.createObjectURL(file);
    img.src = url;
    // revoke quando carregar pra não vazar memória
    const revoke = () => URL.revokeObjectURL(url);
    img.addEventListener('load', revoke, { once: true });
    img.addEventListener('error', revoke, { once: true });
  }

  // Pequeno delay cosmético pra o user ver o "Carregando foto" antes de
  // pular pra "Analisando" — evita flash.
  await new Promise((r) => setTimeout(r, 180));
  setScanStage('Enviando pra IA…');
}

export function hideScanOverlay() {
  stopFakeProgress();
  const overlay = document.getElementById(ID_SCAN);
  if (!overlay) return;
  overlay.hidden = true;
  overlay.dataset.state = 'idle';
  const resultPanel = document.getElementById(ID_SCAN_RESULT);
  if (resultPanel) resultPanel.hidden = true;
}

export function setScanState(state) {
  const overlay = document.getElementById(ID_SCAN);
  if (overlay) overlay.dataset.state = state;
}

export function setScanStage(text) {
  const el = document.getElementById(ID_SCAN_STAGE_TEXT);
  if (el) el.textContent = text;
}

function setScanProgress(pct) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const fill = document.getElementById(ID_SCAN_BAR_FILL);
  const label = document.getElementById(ID_SCAN_PERCENT);
  const bar = document.getElementById(ID_SCAN_BAR);
  if (fill) fill.style.width = `${clamped}%`;
  if (label) label.textContent = `${clamped}%`;
  if (bar) bar.setAttribute('aria-valuenow', String(clamped));
}

/**
 * Progress "fake" que simula análise. Cresce assintóticamente 0→85%
 * durante ~4-5s (tempo típico de análise) e pára em 85 até o fetch real
 * completar, quando pulamos pra 100%.
 *
 * Curva: cada tick acrescenta (TARGET - atual) * 0.06, suavizando perto do
 * TARGET. Timer de 120ms = ~7 ticks por segundo.
 */
export function startFakeProgress() {
  stopFakeProgress();
  const TARGET = 85;
  let current = 0;
  setScanStage('Analisando imagem…');

  progressInterval = setInterval(() => {
    current += (TARGET - current) * 0.06;
    if (current >= TARGET - 0.1) current = TARGET;
    setScanProgress(current);

    // Estágio vai mudando pra dar sensação de progresso real
    if (current > 15 && current < 40) setScanStage('Identificando dados da etiqueta…');
    else if (current >= 40 && current < 70) setScanStage('Separando campos encontrados…');
    else if (current >= 70) setScanStage('Preparando revisão antes de aplicar…');
  }, 120);
}

export function stopFakeProgress(finalPct) {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  if (typeof finalPct === 'number') {
    setScanProgress(finalPct);
  }
}

export function showScanResult(fields, detected, percent) {
  const panel = document.getElementById(ID_SCAN_RESULT);
  const detectedEl = document.getElementById(ID_SCAN_DETECTED);
  const totalEl = document.getElementById(ID_SCAN_TOTAL);
  const percentEl = document.getElementById(ID_SCAN_RESULT_PERCENT);
  const subEl = document.getElementById(ID_SCAN_RESULT_SUB);

  if (detectedEl) detectedEl.textContent = String(detected);
  if (totalEl) totalEl.textContent = String(AI_FIELD_TOTAL);
  if (percentEl) percentEl.textContent = `${percent}%`;

  // Mensagem adaptativa ao % detectado
  if (subEl) {
    if (percent >= 80) {
      subEl.textContent = 'Leitura forte. Revise rapidamente e aplique os dados.';
    } else if (percent >= 50) {
      subEl.textContent = 'Leitura parcial útil. Confirme os dados e complete o restante.';
    } else if (percent >= 20) {
      subEl.textContent = 'Encontramos parte dos dados. Complete os campos não identificados.';
    } else {
      subEl.textContent = 'Poucos dados identificados. Tente outra foto ou siga manualmente.';
    }
  }

  renderReviewList(fields);
  if (panel) panel.hidden = false;
}

export function showScanErrorResult(message) {
  const panel = document.getElementById(ID_SCAN_RESULT);
  const subEl = document.getElementById(ID_SCAN_RESULT_SUB);
  const list = document.getElementById(ID_SCAN_REVIEW_LIST);
  const detectedEl = document.getElementById(ID_SCAN_DETECTED);
  const totalEl = document.getElementById(ID_SCAN_TOTAL);
  const percentEl = document.getElementById(ID_SCAN_RESULT_PERCENT);

  if (detectedEl) detectedEl.textContent = '0';
  if (totalEl) totalEl.textContent = String(AI_FIELD_TOTAL);
  if (percentEl) percentEl.textContent = '0%';
  if (subEl) subEl.textContent = message;
  if (list) list.replaceChildren();
  if (panel) panel.hidden = false;
}

export function classifyNotIdentified(message) {
  const raw = String(message || '').toLowerCase();
  const poorImage =
    raw.includes('escur') ||
    raw.includes('desfoc') ||
    raw.includes('nítid') ||
    raw.includes('nitid') ||
    raw.includes('reflex') ||
    raw.includes('ileg') ||
    raw.includes('ler a etiqueta');
  const insufficient =
    raw.includes('insuf') || raw.includes('fora do padrão') || raw.includes('poucos');

  if (poorImage) {
    return {
      stage: 'Etiqueta difícil de ler',
      subtitle: 'A etiqueta está difícil de ler nesta foto. Tente sem reflexo e mais próxima.',
      fallback: 'Tente novamente com a etiqueta inteira no quadro ou continue sem foto.',
    };
  }
  if (insufficient) {
    return {
      stage: 'Dados insuficientes na etiqueta',
      subtitle: 'Não encontramos dados suficientes para preencher automaticamente.',
      fallback: 'Você pode tentar outra foto ou continuar sem foto.',
    };
  }
  return {
    stage: 'Não foi possível ler a etiqueta',
    subtitle: 'Não deu para concluir a leitura automática desta foto.',
    fallback: 'Tente outra foto ou continue manualmente sem prejuízo.',
  };
}

function renderReviewList(fields) {
  const list = document.getElementById(ID_SCAN_REVIEW_LIST);
  if (!list) return;
  list.replaceChildren();

  for (const entry of REVIEW_FIELDS) {
    const status = resolveReviewStatus(entry.key, fields?.[entry.key]);
    const item = document.createElement('li');
    item.className = 'nameplate-scan__review-item';

    const label = document.createElement('span');
    label.className = 'nameplate-scan__review-label';
    label.textContent = entry.label;

    const value = document.createElement('span');
    value.className = `nameplate-scan__review-value ${status.className}`;
    value.textContent = status.text;

    item.appendChild(label);
    item.appendChild(value);
    list.appendChild(item);
  }
}

export function resolveReviewStatus(key, value) {
  if (value === null || value === undefined || value === '') {
    return { text: 'Não identificado', className: 'nameplate-scan__review-value--missing' };
  }
  if (key === 'marcaModelo') {
    const chunks = String(value).trim().split(/\s+/).filter(Boolean);
    if (chunks.length < 2) {
      return { text: `${value} (revisar)`, className: 'nameplate-scan__review-value--warn' };
    }
  }
  return { text: 'Encontrado', className: 'nameplate-scan__review-value--ok' };
}
