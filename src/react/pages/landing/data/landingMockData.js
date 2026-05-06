/**
 * Dados mockados estaticos para a nova landing React.
 *
 * Sem fetch, sem estado global, sem auth. Tudo em UTF-8 nativo (sem
 * escapes Unicode literais — segue convencao adotada apos a limpeza
 * de unicode-escapes).
 *
 * Mantido em arquivo proprio pra:
 *  1. separar conteudo de markup (componentes ficam estruturais);
 *  2. facilitar revisao/edicao de copy sem mexer em JSX;
 *  3. reutilizar entre componentes (header + footer compartilham menu).
 */

export const navItems = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#fluxo', label: 'Como funciona' },
  { href: '#planos', label: 'Planos' },
];

export const heroQuickCards = [
  { id: 'celular', label: 'Tudo do celular' },
  { id: 'pdf', label: 'PDF que dá orgulho de mandar' },
  { id: 'offline', label: 'Funciona com sinal ruim' },
  { id: 'assinatura', label: 'Cliente assina na hora' },
  { id: 'cobranca', label: 'Sem cobrança escondida' },
  { id: 'cartao', label: 'Sem cartão pra começar' },
];

export const segments = [
  {
    id: 'split',
    title: 'Ar-condicionado split',
    where: 'Residencial · Comercial pequeno',
    description:
      'Limpeza, manutenção preventiva, recarga de gás, troca de placa, instalação. O básico do dia a dia.',
  },
  {
    id: 'comercial',
    title: 'Ar-condicionado comercial',
    where: 'Loja · Escritório · Clínica',
    description:
      'Visitas recorrentes em cliente fixo. Histórico do que rolou na última, próxima preventiva já agendada.',
  },
  {
    id: 'camara',
    title: 'Câmaras frias',
    where: 'Padaria · Restaurante · Mercearia',
    description:
      'Temperatura, fluido, compressor, evaporador. Tudo registrado pra próxima visita ou chamado urgente.',
  },
  {
    id: 'freezer',
    title: 'Geladeiras e freezers comerciais',
    where: 'Bar · Lanchonete · Sorveteria',
    description:
      'Diagnóstico, peça trocada, relatório com foto antes/depois. Cliente vê o que foi feito e por quê.',
  },
  {
    id: 'industrial',
    title: 'Refrigeração industrial',
    where: 'Frigorífico · Indústria alimentícia · Química',
    description:
      'Equipamentos grandes com histórico técnico detalhado e periodicidade rigorosa de manutenção.',
  },
  {
    id: 'pmoc',
    title: 'PMOC e manutenção preventiva',
    where: 'Hospital · Prédio comercial · Escola',
    description:
      'PMOC NBR 13971 com termo de RT. Calendário de preventivas, checklists técnicos e evidências fotográficas.',
  },
];

export const problems = [
  {
    id: 'os',
    title: 'Atendimento sem padrão',
    description: 'Cada serviço fica registrado de um jeito diferente.',
    solution: 'Template pronto pra cada tipo de serviço — você só preenche o que mudou.',
  },
  {
    id: 'historico',
    title: 'Histórico perdido',
    description: 'Cliente liga, você não lembra o que fez no último.',
    solution: 'Linha do tempo por equipamento com filtros, fotos e assinaturas.',
  },
  {
    id: 'relatorios',
    title: 'Relatório no WhatsApp',
    description: 'Texto solto, foto separada, sem cara de profissional.',
    solution:
      'PDF profissional com cabeçalho da sua marca, foto antes/depois, assinatura do cliente. PMOC NBR 13971 quando precisar.',
  },
  {
    id: 'preventivas',
    title: 'Preventiva esquecida',
    description: 'Cliente não chama porque você não cobrou data.',
    solution: 'Calendário com alertas automáticos e recorrência por equipamento.',
  },
  {
    id: 'fotos',
    title: 'Foto perdida no celular',
    description: '"Cadê aquela foto do antes? Apaguei sem querer."',
    solution: 'Foto entra direto no atendimento e fica vinculada ao equipamento — pra sempre.',
  },
  {
    id: 'dados',
    title: 'Ficha do equipamento incompleta',
    description: 'Modelo, fluido, capacidade — tudo na cabeça.',
    solution: 'Ficha completa com fluido, capacidade, modelo e periodicidade preventiva.',
  },
];

export const features = [
  {
    id: 'clientes',
    title: 'Cliente que volta',
    description:
      'Ficha viva com histórico, contatos e equipamentos. Cliente liga? Você já sabe quem é e o que rolou no último atendimento.',
  },
  {
    id: 'equipamentos',
    title: 'Equipamento com biografia',
    description:
      'Modelo, fluido, capacidade, garantia. Foto da etiqueta. Tudo que já rolou no equipamento fica salvo, mesmo se você trocar de celular.',
  },
  {
    id: 'os',
    title: 'Atendimento em 1 minuto',
    description:
      'Template pronto pra cada tipo (preventiva, corretiva, instalação). Foto, peça e checklist em poucos toques — direto na obra, do celular.',
  },
  {
    id: 'preventivas',
    title: 'Preventiva que não escapa',
    description:
      'Calendário avisa antes de vencer. Cada equipamento tem sua periodicidade. Cliente fica feliz, você não perde recorrência.',
  },
  {
    id: 'relatorios',
    title: 'PDF que dá orgulho',
    description:
      'Logo, CNPJ, foto antes/depois, peças usadas, assinatura do cliente. Cabeçalho profissional, WhatsApp em 1 toque. PMOC NBR 13971 quando precisar.',
  },
  {
    id: 'dashboard',
    title: 'Painel que cabe no bolso',
    description:
      'Quantos atendimentos no mês, quantas preventivas vencendo, quanto faturou. Tudo numa tela, sem PC, sem complicação.',
  },
];

export const workflowSteps = [
  {
    id: 1,
    title: 'Cliente chama',
    description:
      'Liga, manda WhatsApp ou mensagem. Você abre o cadastro dele e vê histórico, equipamentos, último atendimento. Sem puxar pela cabeça.',
  },
  {
    id: 2,
    title: 'Você abre um novo registro',
    description:
      'Escolhe o cliente e o equipamento. O histórico aparece automático — última visita, fluido, modelo, garantia. Sem precisar lembrar de nada.',
  },
  {
    id: 3,
    title: 'Preventiva no calendário',
    description:
      'O app te avisa quando tá perto de vencer. Você nunca esquece de marcar a próxima visita com o cliente.',
  },
  {
    id: 4,
    title: 'Atendimento na obra',
    description:
      'Foto antes, leituras técnicas (fluido, pressão, temperatura), peças trocadas, checklist preventivo, foto depois. Tudo do celular, na obra mesmo — funciona offline se não tiver sinal.',
  },
  {
    id: 5,
    title: 'Cliente assina e PDF sai',
    description:
      'Cliente assina na tela do seu celular. Você gera o PDF profissional com sua marca, logo e CNPJ. WhatsApp abre direto pro número dele.',
  },
  {
    id: 6,
    title: 'Histórico salva pro próximo',
    description:
      'Tudo entra na linha do tempo do equipamento. Na próxima visita, você já chega com contexto. PMOC formal anual? Já tá meio pronto.',
  },
];

// Etapa inicial destacada quando a landing renderiza. Usuario pode
// clicar em outra etapa pra trocar (state local em WorkflowSection).
export const workflowDefaultStepId = 3;

// Abas interativas do DashboardPreview. Apenas estes ids tem conteudo
// proprio em `dashboardTabContent` — clicar troca o body central via
// state local. Configurações fica visual-only no sidebar pra preservar
// o look-and-feel do app sem virar aba principal.
export const dashboardTabs = [
  { id: 'dashboard', label: 'Painel' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'os', label: 'Atendimentos' },
  { id: 'preventivas', label: 'Preventivas' },
  { id: 'relatorios', label: 'Relatórios' },
  { id: 'alertas', label: 'Alertas' },
];

export const dashboardSidebarStaticItems = [{ id: 'config', label: 'Configurações' }];

export const dashboardDefaultTabId = 'dashboard';

export const dashboardKpis = [
  { id: 'equipamentos', label: 'Equipamentos', value: '12', delta: '+2 mês' },
  { id: 'atendimentos', label: 'Atendimentos', value: '23', delta: '+18% vs abr' },
  { id: 'pdfs', label: 'PDFs enviados', value: '21', delta: '91% taxa' },
  { id: 'proxima-preventiva', label: 'Próx. preventiva', value: '3d', delta: 'Padaria Estrela' },
];

export const dashboardAlerts = [
  {
    id: 'a1',
    tone: 'red',
    title: 'Preventiva vencida',
    subtitle: '1 · Padaria Estrela · Câmara fria',
  },
  {
    id: 'a2',
    tone: 'orange',
    title: 'Próxima do vencimento',
    subtitle: '2 · Mercado São José · Split 12k',
  },
  {
    id: 'a3',
    tone: 'blue',
    title: 'Atendimento sem relatório enviado',
    subtitle: '1 · Restaurante Don Carlo · Geladeira comercial',
  },
  {
    id: 'a4',
    tone: 'green',
    title: 'Cliente sem retorno há 60 dias',
    subtitle: '1 · Bar do João · Freezer comercial',
  },
];

// Alturas das barras do chart (em %). 30 valores fixos.
export const dashboardChartBars = [
  42, 55, 38, 62, 48, 72, 55, 80, 45, 60, 70, 88, 55, 42, 65, 78, 50, 90, 64, 48, 72, 60, 82, 55,
  68, 75, 92, 65, 58, 74,
];

/**
 * Conteudo por aba do DashboardPreview interativo.
 *
 * `dashboard` mantem o layout overview (KPIs animaveis + alerts + chart
 * + tabela de atendimentos + strip equipamentos) — continua sendo o "vendedor" da
 * interface. Demais abas usam layout `kpis-list` (4 KPIs + lista
 * tabular curta) pra dar sensacao de SaaS real sem inflar o bundle.
 */
export const dashboardTabContent = {
  dashboard: {
    title: 'Painel',
    subtitle: 'Bom dia, Carlos',
    layout: 'overview',
  },
  clientes: {
    title: 'Clientes',
    subtitle: 'Clientes e equipamentos no bolso',
    layout: 'kpis-list',
    kpis: [
      { id: 'total', label: 'Total de clientes', value: 86 },
      { id: 'unidades', label: 'Unidades ativas', value: 142 },
      { id: 'recorrentes', label: 'Clientes recorrentes', value: 12 },
      { id: 'novos', label: 'Novos no mês', value: 8 },
    ],
    list: {
      title: 'Clientes recentes',
      headers: ['Cliente', 'Unidades', 'Equip.', 'Status'],
      rows: [
        { col1: 'Climatize SA', col2: '3', col3: '48', tone: 'green', status: 'Em dia' },
        {
          col1: 'Frigorífico Norte',
          col2: '1',
          col3: '12',
          tone: 'orange',
          status: 'PMOC próximo',
        },
        {
          col1: 'Padaria Estrela',
          col2: '2',
          col3: '7',
          tone: 'blue',
          status: 'Atendimento aberto',
        },
        { col1: 'Mercado Bom Preço', col2: '4', col3: '23', tone: 'green', status: 'Em dia' },
      ],
    },
  },
  equipamentos: {
    title: 'Equipamentos',
    subtitle: 'Parque cadastrado por tipo',
    layout: 'kpis-list',
    kpis: [
      { id: 'total', label: 'Total de equipamentos', value: 12 },
      { id: 'ativos', label: 'Equipamentos ativos', value: 12 },
      { id: 'pendentes', label: 'Manutenção pendente', value: 2 },
      { id: 'vencidas', label: 'Preventiva vencida', value: 1 },
    ],
    list: {
      title: 'Distribuição por tipo',
      headers: ['Tipo', 'Total', 'Equip.', 'Status'],
      rows: [
        { col1: 'Split', col2: '5', col3: '5', tone: 'green', status: 'OK' },
        { col1: 'Câmara fria', col2: '2', col3: '2', tone: 'orange', status: 'Atenção' },
        { col1: 'Freezer comercial', col2: '2', col3: '2', tone: 'green', status: 'OK' },
        { col1: 'Condensadora', col2: '2', col3: '2', tone: 'green', status: 'OK' },
        { col1: 'Compressor', col2: '1', col3: '1', tone: 'red', status: 'Crítico' },
      ],
    },
  },
  os: {
    title: 'Atendimentos',
    subtitle: 'Registros do mês',
    layout: 'kpis-list',
    kpis: [
      { id: 'abertas', label: 'Atendimentos abertos', value: 4 },
      { id: 'execucao', label: 'Em execução', value: 11 },
      { id: 'aguardando', label: 'Aguardando peça', value: 4 },
      { id: 'concluidas', label: 'Concluídas no mês', value: 142 },
    ],
    list: {
      title: 'Atendimentos recentes',
      headers: ['#', 'Cliente', 'Tipo', 'Status'],
      rows: [
        {
          col1: 'A-0089',
          col2: 'Padaria Estrela',
          col3: 'Câmara fria · Compressor · Corretiva',
          tone: 'green',
          status: 'Concluído',
        },
        {
          col1: 'A-0088',
          col2: 'Mercado São José',
          col3: 'Split 12k · Sala · Preventiva',
          tone: 'green',
          status: 'Concluído',
        },
        {
          col1: 'A-0087',
          col2: 'Restaurante Don Carlo',
          col3: 'Geladeira comercial · Corretiva',
          tone: 'orange',
          status: 'Aguarda PDF',
        },
      ],
    },
  },
  preventivas: {
    title: 'Preventivas',
    subtitle: 'Preventivas que não escapam',
    layout: 'kpis-list',
    kpis: [
      { id: 'mes', label: 'Preventivas do mês', value: 34 },
      { id: 'vencidas', label: 'Vencidas', value: 5 },
      { id: 'proximas', label: 'Próximas (7 dias)', value: 9 },
      { id: 'concluidas', label: 'Concluídas no mês', value: 20 },
    ],
    list: {
      title: 'Próximas preventivas',
      headers: ['Equipamento', 'Cliente', 'Data', 'Status'],
      rows: [
        {
          col1: 'Split Sala 02',
          col2: 'Climatize SA',
          col3: 'Hoje',
          tone: 'orange',
          status: 'Hoje',
        },
        {
          col1: 'Câmara fria 2',
          col2: 'Frigorífico Norte',
          col3: 'Em 3 dias',
          tone: 'blue',
          status: 'Em 3 dias',
        },
        {
          col1: 'Freezer 04',
          col2: 'Padaria São Lucas',
          col3: 'Em 5 dias',
          tone: 'blue',
          status: 'Em 5 dias',
        },
        {
          col1: 'Compressor B-12',
          col2: 'Mercado Bom Preço',
          col3: 'Em 7 dias',
          tone: 'green',
          status: 'No prazo',
        },
      ],
    },
  },
  relatorios: {
    title: 'Relatórios',
    subtitle: 'PDFs profissionais e PMOC',
    layout: 'kpis-list',
    kpis: [
      { id: 'gerados', label: 'Relatórios gerados', value: 76 },
      { id: 'assinados', label: 'Assinados pelo cliente', value: 64 },
      { id: 'enviados', label: 'Enviados por WhatsApp', value: 71 },
      { id: 'pmoc', label: 'PMOC do mês', value: 8 },
    ],
    list: {
      title: 'Últimos relatórios',
      headers: ['Relatório', 'Cliente', 'Tipo', 'Status'],
      rows: [
        {
          col1: '#REL-2104',
          col2: 'Climatize SA',
          col3: 'Preventiva',
          tone: 'green',
          status: 'Assinado',
        },
        {
          col1: '#REL-2103',
          col2: 'Frigorífico Norte',
          col3: 'Corretiva',
          tone: 'green',
          status: 'Assinado',
        },
        {
          col1: '#REL-2102',
          col2: 'Edif. Cantareira',
          col3: 'PMOC',
          tone: 'blue',
          status: 'Enviado',
        },
        {
          col1: '#REL-2101',
          col2: 'Padaria São Lucas',
          col3: 'Diagnóstico',
          tone: 'orange',
          status: 'Aguardando',
        },
      ],
    },
  },
  alertas: {
    title: 'Alertas',
    subtitle: 'Itens importantes do dia a dia',
    layout: 'kpis-list',
    kpis: [
      { id: 'preventiva-venc', label: 'Preventivas vencidas', value: 5 },
      { id: 'pmoc-venc', label: 'PMOC vencido', value: 2 },
      { id: 'atendimento-atrasado', label: 'Atendimentos atrasados', value: 3 },
      { id: 'criticos', label: 'Equipamentos críticos', value: 4 },
    ],
    list: {
      title: 'Alertas ativos',
      headers: ['Tipo', 'Cliente', 'Equipamento', 'Severidade'],
      rows: [
        {
          col1: 'Preventiva vencida',
          col2: 'Climatize SA',
          col3: 'Split 18.000 BTU',
          tone: 'red',
          status: 'Crítica',
        },
        {
          col1: 'PMOC vencido',
          col2: 'Edif. Cantareira',
          col3: '14 unidades split',
          tone: 'red',
          status: 'Crítica',
        },
        {
          col1: 'Atendimento atrasado',
          col2: 'Mercado Bom Preço',
          col3: 'Refrig. industrial',
          tone: 'orange',
          status: 'Atenção',
        },
        {
          col1: 'Equip. crítico',
          col2: 'Frigorífico Norte',
          col3: 'Compressor B-12',
          tone: 'red',
          status: 'Crítica',
        },
      ],
    },
  },
};

export const dashboardOsRows = [
  {
    id: 'A-0089',
    customer: 'Padaria Estrela',
    equipment: 'Câmara fria · Compressor',
    type: 'Corretiva',
    status: { label: 'Concluído', tone: 'green' },
  },
  {
    id: 'A-0088',
    customer: 'Mercado São José',
    equipment: 'Split 12k · Sala',
    type: 'Preventiva',
    status: { label: 'Concluído', tone: 'green' },
  },
  {
    id: 'A-0087',
    customer: 'Restaurante Don Carlo',
    equipment: 'Geladeira comercial',
    type: 'Corretiva',
    status: { label: 'Aguarda PDF', tone: 'orange' },
  },
];

export const dashboardEquipStrip = [
  { id: 'split', label: 'Split', value: '5' },
  { id: 'camara', label: 'Câmara fria', value: '2' },
  { id: 'freezer', label: 'Freezer comercial', value: '2' },
  { id: 'condensadora', label: 'Condensadora', value: '2' },
  { id: 'compressor', label: 'Compressor', value: '1' },
  { id: 'evaporadora', label: 'Evaporadora', value: '0' },
];

export const footerProductLinks = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#segmentos', label: 'Onde funciona' },
  { href: '#fluxo', label: 'Como funciona' },
  { href: '#planos', label: 'Planos' },
];

export const footerCompanyLinks = [
  { href: '#', label: 'Sobre nós' },
  { href: '#', label: 'Contato' },
  { href: '#', label: 'Suporte' },
];

/**
 * Links legais do footer.
 *
 * Apontam para os HTMLs estaticos em `public/legal/`. O conteudo
 * juridico fica centralizado nestes 3 arquivos — sem rotas/views React
 * dedicadas, e o redesign visual deles ja segue a mesma identidade da
 * landing nova.
 *
 * Sao links INTERNOS do produto — abrem na mesma aba (sem
 * `target="_blank"`). Mantem o user no mesmo contexto e respeita a
 * politica padrao do projeto pra rotas legais.
 */
export const footerLegalLinks = [
  { href: '/legal/privacidade.html', label: 'Privacidade' },
  { href: '/legal/termos.html', label: 'Termos de uso' },
  { href: '/legal/lgpd.html', label: 'LGPD' },
];
