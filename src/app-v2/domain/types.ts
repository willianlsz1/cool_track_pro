export type EquipmentStatus = 'ok' | 'warn' | 'danger';
export type EquipmentCriticality = 'baixa' | 'media' | 'alta' | 'critica';
export type OperationalPriority = 'baixa' | 'normal' | 'alta';
export type EquipmentAttachmentKind = 'foto' | 'documento';
export type EquipmentAttachmentSource = 'mock' | 'placeholder';

export type ServiceCommitmentKind = 'preventiva' | 'corretiva';
export type ServiceCommitmentStatus = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';

export type ServiceRecordKind = 'preventiva' | 'corretiva' | 'instalacao' | 'visita' | 'outro';
export type ServiceRecordStatus = EquipmentStatus;

export type QuoteStatus = 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'expirado';

export interface Cliente {
  id: string;
  nome: string;
  razaoSocial?: string;
  documento?: string;
  contato?: string;
  endereco?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  canalChamados?: string;
  finalidadeAmbiente?: string;
  observacoesInternas?: string;
}

export interface SetorEquipamento {
  id: string;
  nome: string;
  clienteId?: string;
  cor?: string;
  descricao?: string;
  responsavel?: string;
}

export interface EquipmentAttachment {
  id: string;
  kind: EquipmentAttachmentKind;
  label: string;
  source: EquipmentAttachmentSource;
  createdAt: string;
  cover?: boolean;
}

export interface Equipamento {
  id: string;
  nome: string;
  local: string;
  status: EquipmentStatus;
  clienteId?: string;
  setorId?: string;
  tag?: string;
  tipo?: string;
  componente?: string;
  fluidoRefrigerante?: string;
  marcaModelo?: string;
  numeroSerie?: string;
  capacidadeBtuh?: string;
  criticidade?: EquipmentCriticality;
  prioridadeOperacional?: OperationalPriority;
  periodicidadePreventivaDias?: number;
  anexos?: EquipmentAttachment[];
  createdAt?: string;
  archivedAt?: string;
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
  diagnostico?: string;
  acoesExecutadas?: string;
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
  modeloId?: string;
  titulo: string;
  descricao?: string;
  total: number;
  desconto?: number;
  validadeDias?: number;
  formaPagamento?: string;
  observacoes?: string;
  itens?: OrcamentoItem[];
}

export interface OrcamentoItem {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}
