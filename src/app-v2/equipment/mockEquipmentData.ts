import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';

export const mockEquipmentToday = '2026-05-10';

export const mockEquipmentClientes: Cliente[] = [
  {
    id: 'cliente-1',
    nome: 'Mercado Bom Preço',
    contato: '(11) 99999-0000',
    endereco: 'Rua das Palmeiras, 120',
  },
  {
    id: 'cliente-2',
    nome: 'Indústria Frio Sul',
    contato: '(11) 98888-0000',
    endereco: 'Distrito Industrial',
  },
];

export const mockEquipmentEquipamentos: Equipamento[] = [
  {
    id: 'eq-1',
    nome: 'Split 24.000 BTU',
    local: 'Recepção',
    status: 'warn',
    clienteId: 'cliente-1',
    tag: 'SPL-024',
    tipo: 'Ar condicionado',
    criticidade: 'media',
    prioridadeOperacional: 'normal',
  },
  {
    id: 'eq-2',
    nome: 'Câmara fria',
    local: 'Estoque',
    status: 'danger',
    clienteId: 'cliente-1',
    tag: 'CAM-001',
    tipo: 'Refrigeração',
    criticidade: 'critica',
    prioridadeOperacional: 'alta',
  },
  {
    id: 'eq-3',
    nome: 'Central de refrigeração',
    local: 'Produção',
    status: 'ok',
    clienteId: 'cliente-2',
    tag: 'CTR-002',
    tipo: 'Refrigeração',
    criticidade: 'alta',
    prioridadeOperacional: 'alta',
  },
  {
    id: 'eq-4',
    nome: 'Cassete recepção',
    local: 'Sala de espera',
    status: 'ok',
    clienteId: 'cliente-1',
    tag: 'CAS-010',
    tipo: 'Ar condicionado',
  },
];

export const mockEquipmentCompromissos: CompromissoServico[] = [
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
    dataAlvo: '2026-05-16',
    origem: 'periodicidade',
  },
];

export const mockEquipmentRegistros: RegistroServico[] = [
  {
    id: 'registro-1',
    equipamentoId: 'eq-1',
    data: '2026-05-07',
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Técnico',
    observacoes: 'Limpeza de filtros e teste de temperatura.',
    proximaData: '2026-06-06',
  },
  {
    id: 'registro-2',
    equipamentoId: 'eq-2',
    data: '2026-05-09',
    tipo: 'corretiva',
    status: 'warn',
    tecnico: 'Técnico',
    observacoes: 'Alarme intermitente no controlador.',
  },
  {
    id: 'registro-3',
    equipamentoId: 'eq-3',
    data: '2026-04-20',
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Técnico',
    proximaData: '2026-05-16',
  },
];
