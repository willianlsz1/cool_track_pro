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
import {
  TEMPLATE_SPLIT_CASSETTE,
  TEMPLATE_SPLIT_HI_WALL,
  TEMPLATE_SPLIT_PISO_TETO,
} from './checklistTemplatesSplit.js';
import {
  TEMPLATE_CHILLER,
  TEMPLATE_FAN_COIL,
  TEMPLATE_GENERIC,
  TEMPLATE_SELF_CONTAINED,
  TEMPLATE_VRF,
} from './checklistTemplatesSystems.js';

export const EQUIP_TIPO_TO_TEMPLATE = Object.freeze({
  'Split Hi-Wall': 'split_hi_wall',
  'Split Cassette': 'split_cassette',
  'Split Piso Teto': 'split_piso_teto',
  'VRF / VRV': 'vrf',
  GHP: 'vrf', // GHP usa mesma topologia de VRF pra checklist
  'Fan Coil': 'fan_coil',
  Chiller: 'chiller',
  'Self Contained': 'self_contained',
  'Roof Top': 'self_contained', // Roof top é autocontido
  // Tipos não-climatização (câmara fria, dry cooler, etc) caem no GENERIC.
});

// ─── Templates ────────────────────────────────────────────────────────

export const ALL_TEMPLATES = Object.freeze({
  split_hi_wall: TEMPLATE_SPLIT_HI_WALL,
  split_cassette: TEMPLATE_SPLIT_CASSETTE,
  split_piso_teto: TEMPLATE_SPLIT_PISO_TETO,
  vrf: TEMPLATE_VRF,
  fan_coil: TEMPLATE_FAN_COIL,
  chiller: TEMPLATE_CHILLER,
  self_contained: TEMPLATE_SELF_CONTAINED,
  generic: TEMPLATE_GENERIC,
});
