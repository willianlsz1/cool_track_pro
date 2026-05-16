import type {
  Cliente,
  CompromissoServico,
  Equipamento,
  Orcamento,
  RegistroServico,
} from '../domain/types';

export interface AppV2MockData {
  today: string;
  clientes: Cliente[];
  equipamentos: Equipamento[];
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
  tecnicos: string[];
  orcamentos: Orcamento[];
}

export const appV2MockData: AppV2MockData = {
  today: '2026-05-10',
  clientes: [
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
  ],
  equipamentos: [
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
      createdAt: '2026-04-01',
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
      createdAt: '2026-03-15',
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
      createdAt: '2026-02-20',
    },
    {
      id: 'eq-4',
      nome: 'Cassete recepção',
      local: 'Sala de espera',
      status: 'ok',
      clienteId: 'cliente-1',
      tag: 'CAS-010',
      tipo: 'Ar condicionado',
      createdAt: '2026-05-09',
    },
  ],
  compromissos: [
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
  ],
  registros: [
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
  ],
  tecnicos: ['TÃ©cnico'],
  orcamentos: [
    {
      id: 'orcamento-1',
      numero: 'ORC-2026-001',
      status: 'rascunho',
      clienteId: 'cliente-1',
      equipamentoId: 'eq-2',
      registroId: 'registro-2',
      titulo: 'Troca de controlador da camara fria',
      total: 1250,
    },
  ],
};
