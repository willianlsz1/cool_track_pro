import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';

export const mockHomeToday = '2026-05-10';

export const mockHomeClientes: Cliente[] = [
  {
    id: 'cliente-1',
    nome: 'Mercado Bom Preço',
    endereco: 'Setor frios',
  },
  {
    id: 'cliente-2',
    nome: 'Indústria Frio Sul',
    endereco: 'Linha 2',
  },
];

export const mockHomeEquipamentos: Equipamento[] = [
  {
    id: 'eq-1',
    nome: 'Split 24.000 BTU',
    local: 'Recepção',
    status: 'warn',
    clienteId: 'cliente-1',
    tipo: 'Ar condicionado',
  },
  {
    id: 'eq-2',
    nome: 'Camara fria',
    local: 'Estoque',
    status: 'danger',
    clienteId: 'cliente-1',
    tipo: 'Refrigeração',
  },
  {
    id: 'eq-3',
    nome: 'Central de refrigeração',
    local: 'Producao',
    status: 'ok',
    clienteId: 'cliente-2',
    tipo: 'Refrigeração',
  },
];

export const mockHomeCompromissos: CompromissoServico[] = [
  {
    id: 'compromisso-1',
    equipamentoId: 'eq-1',
    tipo: 'preventiva',
    status: 'agendado',
    dataAlvo: '2026-05-08',
    origem: 'periodicidade',
  },
  {
    id: 'compromisso-2',
    equipamentoId: 'eq-2',
    tipo: 'corretiva',
    status: 'agendado',
    dataAlvo: '2026-05-10',
    origem: 'manual',
    prioridade: 'alta',
  },
  {
    id: 'compromisso-3',
    equipamentoId: 'eq-3',
    tipo: 'preventiva',
    status: 'agendado',
    dataAlvo: '2026-05-11',
    origem: 'periodicidade',
  },
];

export const mockHomeRegistros: RegistroServico[] = [
  {
    id: 'registro-1',
    equipamentoId: 'eq-1',
    data: '2026-05-07',
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Técnico',
  },
  {
    id: 'registro-2',
    equipamentoId: 'eq-2',
    data: '2026-05-09',
    tipo: 'corretiva',
    status: 'warn',
    tecnico: 'Técnico',
  },
];
