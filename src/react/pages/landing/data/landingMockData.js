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
  { href: '#planos', label: 'Planos' },
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
    solution: 'Templates de OS com campos obrigatórios e checklist por tipo de serviço.',
  },
  {
    id: 'historico',
    title: 'Histórico perdido',
    description: 'Dados importantes perdidos ou difíceis de encontrar.',
    solution: 'Linha do tempo por equipamento com filtros, fotos e assinaturas.',
  },
  {
    id: 'relatorios',
    title: 'Relatórios improvisados',
    description: 'Relatórios feitos às pressas, sem padrão ou credibilidade.',
    solution: 'PDF profissional com KPIs, fotos antes/depois e assinatura do cliente.',
  },
  {
    id: 'preventivas',
    title: 'Preventivas esquecidas',
    description: 'Manutenções em atraso e risco de paradas.',
    solution: 'Calendário com alertas automáticos e recorrência por equipamento.',
  },
  {
    id: 'fotos',
    title: 'Fotos espalhadas',
    description: 'Fotos salvas no celular e difíceis de localizar depois.',
    solution: 'Captura direto na OS, vinculada ao equipamento e ao serviço.',
  },
  {
    id: 'dados',
    title: 'Dados técnicos soltos',
    description: 'Informações técnicas dispersas, sem padronização.',
    solution: 'Ficha completa com fluido, capacidade, modelo e periodicidade preventiva.',
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
  {
    id: 1,
    title: 'Cliente solicita atendimento',
    description:
      'Pedido entra pelo canal de atendimento (telefone, WhatsApp, e-mail). Cliente, equipamento e prioridade já ficam pré-vinculados.',
  },
  {
    id: 2,
    title: 'Técnico cria ou aceita a OS',
    description:
      'O técnico responsável recebe a OS com contexto: histórico do equipamento, contrato vigente e SLA do cliente.',
  },
  {
    id: 3,
    title: 'Serviço é agendado',
    description:
      'Data, hora e equipe alocadas. Calendário evita choque com preventivas já agendadas e respeita restrições do cliente.',
  },
  {
    id: 4,
    title: 'Atendimento é executado',
    description:
      'No campo, o técnico registra checklist, leituras técnicas (fluido, pressão, temperatura) e peças utilizadas.',
  },
  {
    id: 5,
    title: 'Fotos e checklist são registrados',
    description:
      'Captura direto pelo app — antes e depois, etiqueta do equipamento, evidências de execução. Tudo vinculado à OS.',
  },
  {
    id: 6,
    title: 'Relatório técnico é gerado',
    description:
      'PDF profissional com KPIs, fotos, peças, assinatura do cliente e marca da empresa. Pronto pra envio por WhatsApp.',
  },
  {
    id: 7,
    title: 'Histórico fica salvo no equipamento',
    description:
      'Cada serviço alimenta a linha do tempo do equipamento — disponível para próxima visita, PMOC e auditoria.',
  },
];

// Etapa inicial destacada quando a landing renderiza. Usuario pode
// clicar em outra etapa pra trocar (state local em WorkflowSection).
export const workflowDefaultStepId = 3;

// Abas interativas do DashboardPreview. Apenas estes ids tem conteudo
// proprio em `dashboardTabContent` — clicar troca o body central via
// state local. As 3 entradas finais (Checklists/Fotos/Configurações)
// ficam visuais-only no sidebar pra preservar o look-and-feel SaaS.
export const dashboardTabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'os', label: 'Ordens de serviço' },
  { id: 'preventivas', label: 'Preventivas' },
  { id: 'relatorios', label: 'Relatórios' },
  { id: 'alertas', label: 'Alertas' },
];

export const dashboardSidebarStaticItems = [
  { id: 'checklists', label: 'Checklists' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'config', label: 'Configurações' },
];

export const dashboardDefaultTabId = 'dashboard';

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

/**
 * Conteudo por aba do DashboardPreview interativo.
 *
 * `dashboard` mantem o layout overview (KPIs animaveis + alerts + chart
 * + tabela OS + strip equipamentos) — continua sendo o "vendedor" da
 * interface. Demais abas usam layout `kpis-list` (4 KPIs + lista
 * tabular curta) pra dar sensacao de SaaS real sem inflar o bundle.
 */
export const dashboardTabContent = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Visão geral do seu parque',
    layout: 'overview',
  },
  clientes: {
    title: 'Clientes',
    subtitle: 'Carteira de clientes e unidades',
    layout: 'kpis-list',
    kpis: [
      { id: 'total', label: 'Total de clientes', value: 86 },
      { id: 'unidades', label: 'Unidades ativas', value: 142 },
      { id: 'contratos', label: 'Contratos ativos', value: 64 },
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
        { col1: 'Padaria São Lucas', col2: '2', col3: '7', tone: 'blue', status: 'OS aberta' },
        { col1: 'Mercado Bom Preço', col2: '4', col3: '23', tone: 'green', status: 'Em dia' },
      ],
    },
  },
  equipamentos: {
    title: 'Equipamentos',
    subtitle: 'Parque cadastrado por tipo',
    layout: 'kpis-list',
    kpis: [
      { id: 'total', label: 'Total de equipamentos', value: 482 },
      { id: 'ativos', label: 'Ativos', value: 423 },
      { id: 'pendentes', label: 'Manutenção pendente', value: 31 },
      { id: 'vencidas', label: 'Preventiva vencida', value: 12 },
    ],
    list: {
      title: 'Distribuição por tipo',
      headers: ['Tipo', 'Total', 'Ativos', 'Status'],
      rows: [
        { col1: 'Split', col2: '186', col3: '178', tone: 'green', status: 'OK' },
        { col1: 'Câmara fria', col2: '58', col3: '52', tone: 'orange', status: 'Atenção' },
        { col1: 'Freezer comercial', col2: '71', col3: '68', tone: 'green', status: 'OK' },
        { col1: 'Condensadora', col2: '89', col3: '82', tone: 'green', status: 'OK' },
        { col1: 'Compressor', col2: '42', col3: '38', tone: 'red', status: 'Crítico' },
      ],
    },
  },
  os: {
    title: 'Ordens de serviço',
    subtitle: 'Pipeline de atendimentos',
    layout: 'kpis-list',
    kpis: [
      { id: 'abertas', label: 'OS abertas', value: 28 },
      { id: 'execucao', label: 'Em execução', value: 11 },
      { id: 'aguardando', label: 'Aguardando peça', value: 4 },
      { id: 'concluidas', label: 'Concluídas no mês', value: 142 },
    ],
    list: {
      title: 'OS recentes',
      headers: ['OS', 'Cliente', 'Tipo', 'Status'],
      rows: [
        {
          col1: '#OS-3421',
          col2: 'Climatize SA',
          col3: 'Preventiva',
          tone: 'green',
          status: 'Concluída',
        },
        {
          col1: '#OS-3420',
          col2: 'Frigorífico Norte',
          col3: 'Corretiva',
          tone: 'orange',
          status: 'Em execução',
        },
        {
          col1: '#OS-3419',
          col2: 'Padaria São Lucas',
          col3: 'Diagnóstico',
          tone: 'blue',
          status: 'Agendada',
        },
        {
          col1: '#OS-3418',
          col2: 'Mercado Bom Preço',
          col3: 'Preventiva',
          tone: 'red',
          status: 'Atrasada',
        },
      ],
    },
  },
  preventivas: {
    title: 'Preventivas',
    subtitle: 'Plano mensal de manutenção',
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
    subtitle: 'Itens críticos da operação',
    layout: 'kpis-list',
    kpis: [
      { id: 'preventiva-venc', label: 'Preventivas vencidas', value: 5 },
      { id: 'pmoc-venc', label: 'PMOC vencido', value: 2 },
      { id: 'os-atrasada', label: 'OS atrasadas', value: 3 },
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
          col1: 'OS atrasada',
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
  { href: '#planos', label: 'Planos' },
  { href: '#relatorios', label: 'Relatórios' },
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
