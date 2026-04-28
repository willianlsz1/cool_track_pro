export const TIPOS_COM_COMPONENTE = new Set([
  'Split Hi-Wall',
  'Split Cassette',
  'Split Piso Teto',
  'VRF / VRV',
  'GHP',
  'Fan Coil',
  'Chiller',
  'Self Contained',
  'Roof Top',
]);

export const SETOR_PALETTE = [
  { hex: '#00c8e8', nome: 'Ciano' },
  { hex: '#00c853', nome: 'Esmeralda' },
  { hex: '#ffab40', nome: 'Âmbar' },
  { hex: '#ff5252', nome: 'Coral' },
  { hex: '#7c4dff', nome: 'Violeta' },
  { hex: '#448aff', nome: 'Azul' },
  { hex: '#f06292', nome: 'Rosa' },
  { hex: '#9ccc65', nome: 'Verde-lima' },
  { hex: '#ff7043', nome: 'Laranja' },
  { hex: '#26a69a', nome: 'Teal' },
];

export const SETOR_DESC_LIMIT = 120;
export const EDIT_FOCUS_FIELD_MAP = {
  nome: 'eq-nome',
  local: 'eq-local',
  setor: 'eq-setor',
  tag: 'eq-tag',
  tipo: 'eq-tipo',
  fluido: 'eq-fluido',
  modelo: 'eq-modelo',
  serie: 'eq-número-serie',
  capacidade: 'eq-capacidade-btu',
  tensao: 'eq-tensao',
  frequencia: 'eq-frequencia',
  fase: 'eq-fase',
  potencia: 'eq-potencia',
  'corrente-refrig': 'eq-corrente-refrig',
  'corrente-aquec': 'eq-corrente-aquec',
  'pressao-suc': 'eq-pressao-suc',
  'pressao-desc': 'eq-pressao-desc',
  'grau-protecao': 'eq-grau-protecao',
  ano: 'eq-ano-fabricacao',
  criticidade: 'eq-criticidade',
  prioridade: 'eq-prioridade',
  periodicidade: 'eq-periodicidade',
};
export const EDIT_FOCUS_ETIQUETA_MORE = new Set([
  'tensao',
  'frequencia',
  'fase',
  'potencia',
  'corrente-refrig',
  'corrente-aquec',
  'pressao-suc',
  'pressao-desc',
  'grau-protecao',
  'ano',
]);
export const EDIT_FOCUS_ESSENCIAIS = new Set(['nome', 'local', 'setor']);
