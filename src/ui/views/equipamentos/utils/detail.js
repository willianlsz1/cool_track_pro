/**
 * Pure HTML render helpers pra detail modal de equipamento.
 *
 * Extraídos de src/ui/views/equipamentos.js no Mudança 11 / CP-B.
 * Recebem dados como argumentos e retornam strings HTML — sem leitura de
 * state, sem mutação, sem chamadas a Supabase / DOM.
 */

import { Utils } from '../../../../core/utils.js';

/**
 * Renderiza o subtítulo do detail card: "Local · TAG" (HTML escapado).
 * Tag vem em <span> separado quando presente; só local é texto puro.
 */
export function _eqDetailSubtitle(eq) {
  const parts = [];
  if (eq.local) parts.push(Utils.escapeHtml(eq.local));
  if (eq.tag && String(eq.tag).trim() !== '') {
    parts.push(
      `<span class="eq-detail-title-block__tag">${Utils.escapeHtml(String(eq.tag).trim())}</span>`,
    );
  }
  return parts.join(' · ');
}

/**
 * Renderiza um info-row__value: mostra o valor se existe, ou um CTA
 * "Adicionar X" clicável (abre o modal de editar) se vazio. Antes, campos
 * vazios viravam só "—" sem ação — o usuário ficava preso. Agora cada
 * campo vazio é uma porta aberta pra completar dados.
 */
export function _infoRowValueOrEmpty(value, addLabel, safeId, variant = '', fieldKey = '') {
  const clean = value && String(value).trim() !== '' ? String(value).trim() : null;
  if (clean) {
    const variantCls = variant === 'mono' ? ' info-row__value--mono' : '';
    return `<span class="info-row__value${variantCls}">${Utils.escapeHtml(clean)}</span>`;
  }
  const focusAttr = fieldKey ? ` data-focus-field="${Utils.escapeAttr(fieldKey)}"` : '';
  return `<button type="button" class="info-row__value info-row__value--add"
    data-action="edit-equip" data-id="${safeId}"${focusAttr}
    aria-label="${Utils.escapeAttr(addLabel)}">
    ${Utils.escapeHtml(addLabel)}
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
  </button>`;
}

/**
 * Mapeia um "factor" de risco (string vinda de evaluateEquipmentRisk) pra um
 * chip com ou sem CTA. Pedido do refino UX: antes, os factors eram só texto
 * informativo — "preventiva sem agenda" aparecia mas não levava a ação
 * alguma. Agora, chips acionáveis viram atalho: click abre modal de editar
 * (pra agendar) ou o fluxo de registro (pra preventiva vencida).
 *
 * Regra de decisão:
 *  - "sem agenda" / "não agendada" → CTA "Agendar" (edit-equip)
 *  - "vencida" / "atrasada" → CTA "Registrar" (go-register-equip)
 *  - "criticidade alta/crítica/operacional" → CTA "Ajustar" (edit-equip)
 *  - positivos ("rotina estável", "sem corretivas") → chip informativo
 *  - outros → chip informativo neutro
 */
export function _riskFactorChipHtml(factor, safeId) {
  const factorStr = String(factor || '').trim();
  const lower = factorStr.toLowerCase();
  const escaped = Utils.escapeHtml(factorStr);

  // Detecta intenção a partir do texto do factor + qual campo focar
  // quando o action é edit-equip (focusField propaga via data attribute).
  let action = null;
  let actionLabel = null;
  let focusField = null;
  if (lower.includes('sem agenda') || lower.includes('não agendada')) {
    action = 'edit-equip';
    actionLabel = 'Agendar';
    focusField = 'periodicidade';
  } else if (lower.includes('vencida') || lower.includes('atrasada')) {
    action = 'go-register-equip';
    actionLabel = 'Registrar';
  } else if (
    lower.includes('criticidade') &&
    (lower.includes('alta') || lower.includes('crítica') || lower.includes('operacional'))
  ) {
    action = 'edit-equip';
    actionLabel = 'Ajustar';
    focusField = 'criticidade';
  }

  if (!action) {
    return `<span class="eq-risk-panel__factor">${escaped}</span>`;
  }
  const focusAttr = focusField ? ` data-focus-field="${focusField}"` : '';
  return `<button type="button"
      class="eq-risk-panel__factor eq-risk-panel__factor--actionable"
      data-action="${action}" data-id="${safeId}"${focusAttr}
      aria-label="${escaped} — ${actionLabel}">
      <span class="eq-risk-panel__factor-text">${escaped}</span>
      <span class="eq-risk-panel__factor-cta">${actionLabel} <span aria-hidden="true">→</span></span>
    </button>`;
}
