export type EquipmentStatus = 'ok' | 'warn' | 'danger';
export type EquipmentCriticality = 'baixa' | 'media' | 'alta' | 'critica';
export type OperationalPriority = 'baixa' | 'normal' | 'alta';

export type ServiceCommitmentKind = 'preventiva' | 'corretiva';
export type ServiceCommitmentStatus = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';

export type ServiceRecordKind = 'preventiva' | 'corretiva' | 'instalacao' | 'visita' | 'outro';
export type ServiceRecordStatus = EquipmentStatus;

export type QuoteStatus =
  | 'rascunho'
  | 'enviado'
  | 'aguardando_assinatura'
  | 'aprovado'
  | 'recusado'
  | 'expirado';

export interface Cliente {
  id: string;
  nome: string;
  razaoSocial?: string;
  documento?: string;
  contato?: string;
  endereco?: string;
}

export interface Equipamento {
  id: string;
  nome: string;
  local: string;
  status: EquipmentStatus;
  clienteId?: string;
  tag?: string;
  tipo?: string;
  criticidade?: EquipmentCriticality;
  prioridadeOperacional?: OperationalPriority;
  periodicidadePreventivaDias?: number;
  createdAt?: string;
}

export interface CompromissoServico {
  id: string;
  equipamentoId: string;
  tipo: ServiceCommitmentKind;
  status: ServiceCommitmentStatus;
  dataAlvo: string;
  prioridade?: OperationalPriority;
  origem: 'manual' | 'registro' | 'periodicidade';
}

export interface RegistroServico {
  id: string;
  equipamentoId: string;
  data: string;
  tipo: ServiceRecordKind;
  tipoDescricao?: string;
  status: ServiceRecordStatus;
  tecnico: string;
  observacoes?: string;
  pecas?: string;
  custoPecas?: string;
  custoMaoObra?: string;
  proximaData?: string;
}

export interface Orcamento {
  id: string;
  numero: string;
  status: QuoteStatus;
  clienteId?: string;
  equipamentoId?: string;
  registroId?: string;
  titulo: string;
  total: number;
}
