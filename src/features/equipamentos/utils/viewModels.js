/**
 * Pure view-model builders pra view de equipamentos.
 *
 * Extraídos de src/ui/views/equipamentos.js no Mudança 11 / CP-B.
 * Sem leitura de state module-level. Dependências só via imports
 * estáveis (Utils, state helpers, domain) ou parâmetros (evalCtx).
 */

import { Utils } from '../../../core/utils.js';
import { regsForEquip } from '../../../core/state.js';
import { calculateHealthScore, getHealthClass } from '../../../domain/maintenance.js';
import { ACTION_CODE } from '../../../domain/suggestedAction.js';
import {
  PRIORIDADE_LABEL,
  RISK_CLASS_LABEL,
  STATUS_OPERACIONAL,
} from '../../../ui/views/equipamentos/constants.js';
import {
  classifyRiskFactor,
  componentPillModel,
  ctaLabelForAction,
  preventiveTimelineModel,
  recencia,
} from '../../../ui/views/equipamentos/helpers.js';
import { getEquipmentVisualMeta } from '../../../ui/components/equipmentVisual.js';

const EQUIP_TONE_LABELS = {
  ok: 'Estável',
  warn: 'Em atenção',
  danger: 'Crítico',
};

/**
 * Strip opções internas (que começam com `__`) antes de re-render.
 * Usado pra evitar que `__skipPlanRefresh` vaze pra renders subsequentes.
 */
export function _stripRenderInternalOptions(options = {}) {
  const { __skipPlanRefresh: _skip, ...publicOptions } = options || {};
  return publicOptions;
}

/**
 * Constrói view-model de um equip card pra a lista React.
 * Recebe `evalCtx` (criado por _createEquipRenderEvalContext) com getters
 * de regs, risco, contexto de manutenção e suggested action.
 */
export function buildEquipamentoListCardModel(eq, evalCtx) {
  const eqRegs = evalCtx.getRegs(eq.id);
  const context = evalCtx.getMaintenanceContext(eq);
  const last = context.ultimoRegistro;
  const score = calculateHealthScore(eq, regsForEquip(eq.id));
  const healthClass = getHealthClass(score);
  const statusClass = Utils.safeStatus(eq.status);
  const priorityLabel = PRIORIDADE_LABEL[eq.criticidade] || PRIORIDADE_LABEL.media;
  const risk = evalCtx.getRisk(eq);
  const suggestedAction = evalCtx.getSuggestedAction(eq);
  const hasAction =
    suggestedAction.actionCode !== ACTION_CODE.NONE &&
    suggestedAction.actionCode !== ACTION_CODE.MONITOR;
  const hasMetrics = Boolean(last) || Boolean(context.proximaPreventiva);
  const isFullyIdle = evalCtx.isFullyIdle(eq);
  const isActivationPending = !last && suggestedAction.actionCode === ACTION_CODE.COLLECT_DATA;
  const ctaLabel =
    !last && !hasAction ? 'Começar' : ctaLabelForAction(suggestedAction.actionCode, ACTION_CODE);
  const isUrgent =
    statusClass === 'danger' ||
    (risk.factors || []).some((factor) => /parado desde|preventiva vencida/i.test(String(factor)));
  const primaryLabel = isActivationPending
    ? 'STATUS INICIAL'
    : isUrgent
      ? 'AÇÃO URGENTE'
      : 'PRÓXIMA AÇÃO';
  const timeline = hasMetrics
    ? {
        lastLabel: last ? recencia(last.data) : '—',
        ...(preventiveTimelineModel(context, Utils.daysDiff) || {
          nextLabel: 'sem agenda',
          nextTone: 'neutral',
        }),
      }
    : null;
  const visual = getEquipmentVisualMeta(eq);

  return {
    id: String(eq.id || ''),
    name: String(eq.nome || ''),
    statusClass,
    statusLabel: EQUIP_TONE_LABELS[statusClass] || EQUIP_TONE_LABELS.ok,
    ariaLabel: `${eq.nome || ''} — ${STATUS_OPERACIONAL[statusClass] || ''}`,
    isIdle: isFullyIdle,
    visual,
    nameClass: statusClass === 'danger' ? 'equip-card__name--danger' : '',
    tagParts: [
      isFullyIdle && eq.tag && String(eq.tag).trim() ? String(eq.tag).trim() : eq.tag || '—',
      eq.fluido || eq.tipo || '—',
      priorityLabel,
    ].filter((part, index) => (isFullyIdle && index === 0 ? Boolean(part && part !== '—') : true)),
    componentPill: componentPillModel(eq.componente),
    subtitle: eq.local || 'Local não informado',
    score,
    healthClass,
    risk: {
      classification: risk.classification || 'baixo',
      label: RISK_CLASS_LABEL[risk.classification] || RISK_CLASS_LABEL.baixo,
      score: Number(risk.score) || 0,
      factors: (risk.factors || []).map((factor) => ({
        label: String(factor || ''),
        tone: classifyRiskFactor(factor),
      })),
    },
    timeline,
    primaryLabel,
    primaryTitle: isActivationPending
      ? 'Sem manutenção recente ⚠️'
      : hasAction
        ? suggestedAction.actionLabel
        : ctaLabel,
    primaryMeta: hasAction && last?.tecnico ? `Por ${last.tecnico} · ${recencia(last.data)}` : '',
    ctaLabel,
    eqRegsCount: eqRegs.length,
  };
}

/**
 * Constrói view-model do empty state da lista React. Detecta o tipo de CTA
 * pelo `cta.action` (eq-add-for-cliente vira ícone 👥, resto fica 🔧).
 */
export function buildReactListEmptyState(emptyCopy, { filterClienteId, isPro } = {}) {
  const fallback = {
    title: 'Nenhum equipamento encontrado',
    description: 'Tente outro termo ou cadastre um novo.',
    cta: {
      label: '+ Novo equipamento',
      action: 'open-modal',
      id: 'modal-add-eq',
    },
  };
  const source = emptyCopy || fallback;
  const cta = source.cta?.action
    ? {
        label: source.cta.label,
        action: source.cta.action,
        id: source.cta.id || '',
        tone: 'primary',
        size: 'sm',
        autoWidth: true,
      }
    : {
        label: '+ Novo equipamento',
        action: 'open-modal',
        id: 'modal-add-eq',
        tone: 'primary',
        size: 'sm',
        autoWidth: true,
      };

  return {
    icon: source.cta?.action === 'eq-add-for-cliente' ? '👥' : '🔧',
    title: source.title,
    description: source.description,
    cta,
    proHint: Boolean(isPro && !filterClienteId),
  };
}

/**
 * Constrói view-model agregado da lista React (cards + idle/active split +
 * cluster + emptyState). Usa buildEquipamentoListCardModel pra cada card.
 */
export function buildReactListViewModel(
  viewModel,
  { evalCtx, clusterActive, filterClienteId, isPro },
) {
  const cards = viewModel.sortedItems.map((eq) => buildEquipamentoListCardModel(eq, evalCtx));
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const toCards = (items) =>
    (items || []).map((eq) => cardsById.get(String(eq.id || ''))).filter(Boolean);

  return {
    listTitle: 'Todos os equipamentos',
    cards,
    idleCards: toCards(viewModel.idleItems),
    activeCards: toCards(viewModel.activeItems),
    clusterActive,
    quickMove: viewModel.quickMove,
    emptyState: cards.length
      ? null
      : buildReactListEmptyState(viewModel.emptyState, { filterClienteId, isPro }),
  };
}
