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
const freezeTemplate = Object.freeze;

export const TEMPLATE_SPLIT_HI_WALL = freezeTemplate({
  tipo_template: 'split_hi_wall',
  version: 1,
  label: 'Split Hi-Wall (NBR 13971)',
  items: [
    // Mecânico
    {
      id: 'filtros_limpeza',
      label: 'Limpeza dos filtros de ar',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'serpentina_evap',
      label: 'Limpeza da serpentina evaporadora',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'serpentina_cond',
      label: 'Limpeza da serpentina condensadora',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'helice_ventilador',
      label: 'Inspeção da hélice e turbina (sujeira/folga)',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'dreno_funcional',
      label: 'Dreno e bandeja de condensado (vazão e vedação)',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'gabinete_estado',
      label: 'Estado do gabinete e fixações',
      group: 'Mecânico',
      mandatory: false,
    },

    // Elétrico
    {
      id: 'tensao_alimentacao',
      label: 'Tensão de alimentação dentro da faixa de placa',
      group: 'Elétrico',
      mandatory: true,
      measurable: true,
      unit: 'V',
    },
    {
      id: 'corrente_compressor',
      label: 'Corrente do compressor x placa',
      group: 'Elétrico',
      mandatory: true,
      measurable: true,
      unit: 'A',
    },
    {
      id: 'aterramento',
      label: 'Aterramento e continuidade da carcaça',
      group: 'Elétrico',
      mandatory: true,
    },
    {
      id: 'capacitor',
      label: 'Capacitor (visual + capacitância se em dúvida)',
      group: 'Elétrico',
      mandatory: false,
    },
    {
      id: 'conexoes_eletricas',
      label: 'Reaperto de conexões elétricas',
      group: 'Elétrico',
      mandatory: true,
    },

    // Refrigeração
    {
      id: 'pressao_succao',
      label: 'Pressão de sucção em regime',
      group: 'Refrigeração',
      mandatory: true,
      measurable: true,
      unit: 'psi',
    },
    {
      id: 'pressao_descarga',
      label: 'Pressão de descarga em regime',
      group: 'Refrigeração',
      mandatory: true,
      measurable: true,
      unit: 'psi',
    },
    {
      id: 'superaquecimento',
      label: 'Superaquecimento (ΔT) na sucção',
      group: 'Refrigeração',
      mandatory: false,
      measurable: true,
      unit: '°C',
    },
    {
      id: 'vazamento_inspecao',
      label: 'Inspeção visual de vazamento (juntas/conexões)',
      group: 'Refrigeração',
      mandatory: true,
    },

    // Operacional
    {
      id: 'controle_remoto',
      label: 'Funcionamento do controle remoto e display',
      group: 'Operacional',
      mandatory: false,
    },
    {
      id: 'temperatura_insuflamento',
      label: 'Temperatura de insuflamento conforme setpoint',
      group: 'Operacional',
      mandatory: true,
      measurable: true,
      unit: '°C',
    },
    {
      id: 'ruido_anormal',
      label: 'Ausência de ruído anormal (vibração, batida)',
      group: 'Operacional',
      mandatory: false,
    },
  ],
});

export const TEMPLATE_SPLIT_CASSETTE = freezeTemplate({
  tipo_template: 'split_cassette',
  version: 1,
  label: 'Split Cassette (NBR 13971)',
  items: [
    // Mesmo core do hi-wall + 2 itens específicos do cassette
    {
      id: 'filtros_limpeza',
      label: 'Limpeza dos filtros de ar',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'serpentina_evap',
      label: 'Limpeza da serpentina evaporadora',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'serpentina_cond',
      label: 'Limpeza da serpentina condensadora',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'turbina_centrifuga',
      label: 'Inspeção e limpeza da turbina centrífuga',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'painel_difusor',
      label: 'Estado do painel difusor (4 vias) e flaps',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'bomba_dreno',
      label: 'Bomba de dreno (acionamento + vazão)',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'dreno_funcional',
      label: 'Tubulação de dreno (caimento e vedação)',
      group: 'Mecânico',
      mandatory: true,
    },

    {
      id: 'tensao_alimentacao',
      label: 'Tensão de alimentação dentro da faixa de placa',
      group: 'Elétrico',
      mandatory: true,
      measurable: true,
      unit: 'V',
    },
    {
      id: 'corrente_compressor',
      label: 'Corrente do compressor x placa',
      group: 'Elétrico',
      mandatory: true,
      measurable: true,
      unit: 'A',
    },
    {
      id: 'aterramento',
      label: 'Aterramento e continuidade da carcaça',
      group: 'Elétrico',
      mandatory: true,
    },
    {
      id: 'conexoes_eletricas',
      label: 'Reaperto de conexões elétricas',
      group: 'Elétrico',
      mandatory: true,
    },

    {
      id: 'pressao_succao',
      label: 'Pressão de sucção em regime',
      group: 'Refrigeração',
      mandatory: true,
      measurable: true,
      unit: 'psi',
    },
    {
      id: 'pressao_descarga',
      label: 'Pressão de descarga em regime',
      group: 'Refrigeração',
      mandatory: true,
      measurable: true,
      unit: 'psi',
    },
    {
      id: 'vazamento_inspecao',
      label: 'Inspeção visual de vazamento (juntas/conexões)',
      group: 'Refrigeração',
      mandatory: true,
    },

    {
      id: 'temperatura_insuflamento',
      label: 'Temperatura de insuflamento conforme setpoint',
      group: 'Operacional',
      mandatory: true,
      measurable: true,
      unit: '°C',
    },
    {
      id: 'ruido_anormal',
      label: 'Ausência de ruído anormal (vibração, batida)',
      group: 'Operacional',
      mandatory: false,
    },
  ],
});

export const TEMPLATE_SPLIT_PISO_TETO = freezeTemplate({
  tipo_template: 'split_piso_teto',
  version: 1,
  label: 'Split Piso-Teto (NBR 13971)',
  items: [
    {
      id: 'filtros_limpeza',
      label: 'Limpeza dos filtros de ar',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'serpentina_evap',
      label: 'Limpeza da serpentina evaporadora',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'serpentina_cond',
      label: 'Limpeza da serpentina condensadora',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'helice_ventilador',
      label: 'Inspeção da hélice e turbina (sujeira/folga)',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'dreno_funcional',
      label: 'Dreno e bandeja de condensado (vazão e vedação)',
      group: 'Mecânico',
      mandatory: true,
    },
    {
      id: 'fixacao_evaporadora',
      label: 'Fixação e nivelamento da evaporadora',
      group: 'Mecânico',
      mandatory: false,
    },

    {
      id: 'tensao_alimentacao',
      label: 'Tensão de alimentação dentro da faixa de placa',
      group: 'Elétrico',
      mandatory: true,
      measurable: true,
      unit: 'V',
    },
    {
      id: 'corrente_compressor',
      label: 'Corrente do compressor x placa',
      group: 'Elétrico',
      mandatory: true,
      measurable: true,
      unit: 'A',
    },
    {
      id: 'aterramento',
      label: 'Aterramento e continuidade da carcaça',
      group: 'Elétrico',
      mandatory: true,
    },
    {
      id: 'conexoes_eletricas',
      label: 'Reaperto de conexões elétricas',
      group: 'Elétrico',
      mandatory: true,
    },

    {
      id: 'pressao_succao',
      label: 'Pressão de sucção em regime',
      group: 'Refrigeração',
      mandatory: true,
      measurable: true,
      unit: 'psi',
    },
    {
      id: 'pressao_descarga',
      label: 'Pressão de descarga em regime',
      group: 'Refrigeração',
      mandatory: true,
      measurable: true,
      unit: 'psi',
    },
    {
      id: 'vazamento_inspecao',
      label: 'Inspeção visual de vazamento (juntas/conexões)',
      group: 'Refrigeração',
      mandatory: true,
    },

    {
      id: 'temperatura_insuflamento',
      label: 'Temperatura de insuflamento conforme setpoint',
      group: 'Operacional',
      mandatory: true,
      measurable: true,
      unit: '°C',
    },
    {
      id: 'ruido_anormal',
      label: 'Ausência de ruído anormal (vibração, batida)',
      group: 'Operacional',
      mandatory: false,
    },
  ],
});
