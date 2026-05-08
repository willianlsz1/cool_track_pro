/**
 * Model puro da detail view de equipamento.
 *
 * Mantém o contrato antes montado no adapter legado, sem tocar DOM/modal/HTML.
 */
export function buildViewEquipDetailModel({
  id,
  equip: eq,
  regsForEquip,
  evaluateEquipmentHealth,
  evaluateEquipmentRisk,
  getHealthClass,
  utils: Utils,
}) {
  const regs = regsForEquip(id).sort((a, b) => b.data.localeCompare(a.data));
  const health = evaluateEquipmentHealth(eq, regs);
  const score = health.score;
  const cls = getHealthClass(score);
  const safeId = Utils.escapeAttr(id);
  const context = health.context;
  const risk = evaluateEquipmentRisk(eq, regs);
  const proximaPreventiva = context?.proximaPreventiva
    ? Utils.formatDate(context.proximaPreventiva)
    : 'Sem agenda';
  const healthSummary = health.reasons.length
    ? Utils.escapeHtml(health.reasons.slice(0, 2).join(' | '))
    : 'Histórico dentro da rotina prevista';

  // SVG ring progress
  const ringR = 30;
  const ringC = +(2 * Math.PI * ringR).toFixed(1);
  const ringOffset = +(ringC * (1 - score / 100)).toFixed(1);

  return {
    id,
    eq,
    regs,
    health,
    score,
    cls,
    safeId,
    context,
    risk,
    proximaPreventiva,
    healthSummary,
    ringR,
    ringC,
    ringOffset,
  };
}
