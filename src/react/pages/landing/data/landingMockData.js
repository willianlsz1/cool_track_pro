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
  { href: '#segmentos', label: 'Segmentos' },
  { href: '#fluxo', label: 'Fluxo' },
  { href: '#relatorios', label: 'Relatórios' },
  { href: '#contato', label: 'Contato' },
];

export const heroQuickCards = [
  { id: 'os', label: 'OS digital' },
  { id: 'historico', label: 'Histórico por equipamento' },
  { id: 'relatorios', label: 'Relatórios técnicos' },
  { id: 'alertas', label: 'Alertas de preventiva' },
  { id: 'fotos', label: 'Fotos antes e depois' },
];

export const segments = [
  {
    id: 'split',
    title: 'Ar-condicionado split',
    description: 'Instalação, limpeza, correção e manutenção preventiva.',
  },
  {
    id: 'comercial',
    title: 'Ar-condicionado comercial',
    description: 'Organização de contratos, visitas e histórico técnico.',
  },
  {
    id: 'camara',
    title: 'Câmaras frias',
    description: 'Controle de temperatura, fluido, componentes e manutenções.',
  },
  {
    id: 'freezer',
    title: 'Geladeiras e freezers comerciais',
    description: 'Acompanhamento de chamados, peças, diagnóstico e relatório final.',
  },
  {
    id: 'industrial',
    title: 'Refrigeração industrial',
    description: 'Gestão de ativos, preventivas e serviços com rastreabilidade.',
  },
  {
    id: 'pmoc',
    title: 'PMOC e manutenção preventiva',
    description: 'Controle de rotinas, datas, checklists e evidências do serviço.',
  },
];

export const problems = [
  {
    id: 'os',
    title: 'OS sem padrão',
    description: 'Informações faltando e desorganizadas.',
  },
  {
    id: 'historico',
    title: 'Histórico perdido',
    description: 'Dados importantes perdidos ou difíceis de encontrar.',
  },
  {
    id: 'relatorios',
    title: 'Relatórios improvisados',
    description: 'Relatórios feitos às pressas, sem padrão ou credibilidade.',
  },
  {
    id: 'preventivas',
    title: 'Preventivas esquecidas',
    description: 'Manutenções em atraso e risco de paradas.',
  },
  {
    id: 'fotos',
    title: 'Fotos espalhadas',
    description: 'Fotos salvas no celular e difíceis de localizar depois.',
  },
  {
    id: 'dados',
    title: 'Dados técnicos soltos',
    description: 'Informações técnicas dispersas, sem padronização.',
  },
];

export const features = [
  {
    id: 'clientes',
    title: 'Clientes',
    description: 'Cadastre clientes e unidades, com contatos, endereços e contratos organizados.',
  },
  {
    id: 'equipamentos',
    title: 'Equipamentos',
    description:
      'Cadastro completo com dados técnicos, histórico de serviços e anexos importantes.',
  },
  {
    id: 'os',
    title: 'Ordens de serviço',
    description: 'Crie, organize e acompanhe OS do início ao fim, com status e prioridades.',
  },
  {
    id: 'preventivas',
    title: 'Preventivas',
    description:
      'Planeje e controle manutenções preventivas com calendário, checklists e recorrências.',
  },
  {
    id: 'relatorios',
    title: 'Relatórios técnicos',
    description:
      'Gere relatórios profissionais com dados, fotos, peças utilizadas e assinatura do cliente.',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Acompanhe indicadores em tempo real e tome decisões com base em dados.',
  },
];

export const workflowSteps = [
  { id: 1, title: 'Cliente solicita atendimento' },
  { id: 2, title: 'Técnico cria ou aceita a OS' },
  { id: 3, title: 'Serviço é agendado' },
  { id: 4, title: 'Atendimento é executado' },
  { id: 5, title: 'Fotos e checklist são registrados' },
  { id: 6, title: 'Relatório técnico é gerado' },
  { id: 7, title: 'Histórico fica salvo no equipamento' },
];

// Etapa visualmente destacada (estatica neste PR — interatividade fica
// pro PR 2 do landing-page-plan.md).
export const workflowActiveStepId = 3;

export const dashboardSidebar = [
  { id: 'dashboard', label: 'Dashboard', active: true },
  { id: 'clientes', label: 'Clientes' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'os', label: 'Ordens de serviço' },
  { id: 'preventivas', label: 'Preventivas' },
  { id: 'relatorios', label: 'Relatórios' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'checklists', label: 'Checklists' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'config', label: 'Configurações' },
];

export const dashboardKpis = [
  { id: 'os-abertas', label: 'OS abertas', value: '28' },
  { id: 'preventivas-mes', label: 'Preventivas do mês', value: '34' },
  { id: 'equipamentos', label: 'Equipamentos cadastrados', value: '482' },
  { id: 'relatorios', label: 'Relatórios gerados', value: '76' },
];

export const dashboardAlerts = [
  {
    id: 'a1',
    tone: 'red',
    title: 'Preventiva vencida',
    subtitle: 'Climatize SA · Split 18.000 BTU · 6 dias em atraso',
  },
  {
    id: 'a2',
    tone: 'orange',
    title: 'Preventiva próxima do vencimento',
    subtitle: 'Frigorífico Norte · Câmara fria 2 · 3 dias',
  },
  {
    id: 'a3',
    tone: 'blue',
    title: 'OS aguardando execução',
    subtitle: 'Padaria São Lucas · Freezer comercial',
  },
  {
    id: 'a4',
    tone: 'green',
    title: 'PMOC vencido',
    subtitle: 'Edifício Cantareira · 14 unidades split',
  },
];

// Alturas das barras do chart (em %). 30 valores fixos.
export const dashboardChartBars = [
  42, 55, 38, 62, 48, 72, 55, 80, 45, 60, 70, 88, 55, 42, 65, 78, 50, 90, 64, 48, 72, 60, 82, 55,
  68, 75, 92, 65, 58, 74,
];

export const dashboardOsRows = [
  {
    id: 'OS-3421',
    customer: 'Climatize SA',
    equipment: 'Split 18k',
    type: 'Preventiva',
    status: { label: 'Concluída', tone: 'green' },
  },
  {
    id: 'OS-3420',
    customer: 'Frigorífico Norte',
    equipment: 'Câmara fria 2',
    type: 'Corretiva',
    status: { label: 'Em execução', tone: 'orange' },
  },
  {
    id: 'OS-3419',
    customer: 'Padaria São Lucas',
    equipment: 'Freezer comercial',
    type: 'Diagnóstico',
    status: { label: 'Agendada', tone: 'blue' },
  },
  {
    id: 'OS-3418',
    customer: 'Mercado Bom Preço',
    equipment: 'Refrig. industrial',
    type: 'Preventiva',
    status: { label: 'Atrasada', tone: 'red' },
  },
];

export const dashboardEquipStrip = [
  { id: 'split', label: 'Split', value: '186' },
  { id: 'camara', label: 'Câmara fria', value: '58' },
  { id: 'freezer', label: 'Freezer comercial', value: '71' },
  { id: 'condensadora', label: 'Condensadora', value: '89' },
  { id: 'compressor', label: 'Compressor', value: '42' },
  { id: 'evaporadora', label: 'Evaporadora', value: '36' },
];

export const footerProductLinks = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#segmentos', label: 'Segmentos' },
  { href: '#fluxo', label: 'Fluxo' },
  { href: '#relatorios', label: 'Relatórios' },
];

export const footerCompanyLinks = [
  { href: '#', label: 'Sobre nós' },
  { href: '#', label: 'Contato' },
  { href: '#', label: 'Suporte' },
];
