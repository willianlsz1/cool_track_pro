/**
 * CoolTrack Pro - Checklist Templates NBR 13971 (Fase 3 PMOC, abr/2026)
 *
 * Templates de checklist baseados na ABNT NBR 13971 (Manutenção de
 * sistemas de refrigeração, condicionamento de ar e ventilação) e
 * recomendações da Portaria GM/MS 3.523/1998.
 *
 * Cada template tem:
 *   - tipo_template: chave estável (ex: 'split_hi_wall', 'vrf')
 *   - version:       número (incrementa ao mudar items — registros
 *                    antigos preservam a versão original)
 *   - items:         lista de pontos a verificar
 *     - id:        chave estável do item
 *     - label:     texto exibido pro técnico
 *     - group:     agrupamento visual no formulário (Mecânico, Elétrico, etc)
 *     - mandatory: true = obrigatório pra PMOC formal (warn se faltar)
 *
 * Fonte: NBR 13971:2014 (anexos A, B), CONFEA Resolução 1.025/2009 (RRT).
 *
 * IMPORTANTE: nunca edite items existentes — adicione novos com id novo
 * e bumpe a `version`. Os registros antigos referenciam version + id.
 */

// ─── Catálogo de tipos de equipamento → template key ──────────────────
// Map o `tipo` do equipamento (string visível no select) pra chave do
// template. Tipos não mapeados caem no template GENERIC.
import { ALL_TEMPLATES, EQUIP_TIPO_TO_TEMPLATE } from './checklistTemplatesCatalog.js';

/** Retorna o template apropriado pra um tipo de equipamento. */
export function getChecklistTemplate(tipoEquip) {
  const key = EQUIP_TIPO_TO_TEMPLATE[String(tipoEquip || '').trim()] || 'generic';
  return ALL_TEMPLATES[key];
}

/** Retorna template por chave (ex: pra renderizar checklist persistido). */
export function getTemplateByKey(key) {
  return ALL_TEMPLATES[key] || ALL_TEMPLATES.generic;
}

/** Lista todos os templates (útil pra seleção manual num futuro). */
export function listTemplates() {
  return Object.values(ALL_TEMPLATES);
}

/**
 * Cria um checklist vazio (todos items com status null) pronto pra
 * preenchimento. Usado no init do form quando o user expande o accordion.
 */
export function buildEmptyChecklist(tipoEquip) {
  const tpl = getChecklistTemplate(tipoEquip);
  return {
    tipo_template: tpl.tipo_template,
    version: tpl.version,
    items: tpl.items.map((item) => {
      const base = {
        id: item.id,
        status: null, // 'ok' | 'fail' | 'na' | null
        obs: '',
      };
      // PMOC Fase 4: items measurable nascem com measure: null (vazio).
      // Preenchido por setChecklistItemMeasure quando user digita valor.
      if (item.measurable) {
        base.measure = null; // { value: number, unit: string } quando preenchido
      }
      return base;
    }),
  };
}

/**
 * PMOC Fase 4: helper de formatação pra display/PDF.
 * Aceita numero, string numérica ou null. Retorna "{valor} {unit}" ou "".
 * Usa vírgula como separador decimal (pt-BR).
 */
export function formatMeasure(measure) {
  if (!measure || measure.value == null || measure.value === '') return '';
  const n = Number(measure.value);
  if (!Number.isFinite(n)) return '';
  // Display compacto: integer fica sem casa decimal, fracionário com até 2.
  const formatted = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
  const display = formatted.replace('.', ',');
  return measure.unit ? `${display} ${measure.unit}` : display;
}

/**
 * Verifica se um checklist preenchido tem todos os items obrigatórios
 * marcados (qualquer status, exceto null). Retorna { complete, missing }.
 */
export function validateChecklist(checklist) {
  if (!checklist || !checklist.tipo_template) {
    return { complete: false, missing: [], reason: 'empty' };
  }
  const tpl = getTemplateByKey(checklist.tipo_template);
  const itemMap = new Map((checklist.items || []).map((i) => [i.id, i]));
  const missing = tpl.items
    .filter((i) => i.mandatory)
    .filter((i) => !itemMap.get(i.id) || itemMap.get(i.id).status == null)
    .map((i) => i.label);
  return { complete: missing.length === 0, missing };
}

/**
 * Conta resumo do checklist: quantos OK / FAIL / NA / pendentes.
 * Útil pra mostrar progresso no form e no card do registro.
 */
export function summarizeChecklist(checklist) {
  if (!checklist || !Array.isArray(checklist.items)) {
    return { ok: 0, fail: 0, na: 0, pending: 0, total: 0 };
  }
  const total = checklist.items.length;
  let ok = 0,
    fail = 0,
    na = 0,
    pending = 0;
  checklist.items.forEach((i) => {
    if (i.status === 'ok') ok += 1;
    else if (i.status === 'fail') fail += 1;
    else if (i.status === 'na') na += 1;
    else pending += 1;
  });
  return { ok, fail, na, pending, total };
}
