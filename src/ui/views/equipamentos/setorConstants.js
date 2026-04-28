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
  tipo: 'eq-tipo',
  capacidade: 'eq-capacidade',
  componente: 'eq-componente',
  tag: 'eq-tag',
  serial: 'eq-serial',
  fabricante: 'eq-fabricante',
  modelo: 'eq-modelo',
  observacoes: 'eq-observacoes',
};

export const EDIT_FOCUS_ETIQUETA_MORE = new Set([
  'tag',
  'serial',
  'fabricante',
  'modelo',
  'observacoes',
  'tipo',
  'capacidade',
  'componente',
]);

export const EDIT_FOCUS_ESSENCIAIS = new Set(['nome', 'local', 'setor']);
