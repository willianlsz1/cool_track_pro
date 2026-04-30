import {
  CLIENTES_ACTIONS,
  CLIENTES_PAGE_SIZE_OPTIONS,
  CLIENTES_PUBLIC_IDS,
  CLIENTES_SORT_OPTIONS,
  CLIENTES_STATUS_OPTIONS,
} from '../../ui/viewModels/clientesContracts.js';
import { resolveIndustry } from '../../ui/views/clientes/constants.js';
import {
  formatRelativeDate,
  lastServiceClass,
  pmocStatusClass,
} from '../../ui/views/clientes/helpers.js';

function SvgIcon({
  children,
  width = 14,
  height = 14,
  viewBox = '0 0 24 24',
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 1.8,
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function PlusIcon({ size = 14 }) {
  return (
    <SvgIcon width={size} height={size} strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </SvgIcon>
  );
}

function SearchIcon() {
  return (
    <SvgIcon width={14} height={14}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </SvgIcon>
  );
}

function FilterIcon() {
  return (
    <SvgIcon width={16} height={16}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </SvgIcon>
  );
}

function UsersIcon({ size = 20 }) {
  return (
    <SvgIcon width={size} height={size} strokeWidth={1.7}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgIcon>
  );
}

function MonitorIcon({ size = 20 }) {
  return (
    <SvgIcon width={size} height={size} strokeWidth={1.7}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </SvgIcon>
  );
}

function WrenchIcon() {
  return (
    <SvgIcon width={20} height={20} strokeWidth={1.7}>
      <path d="m14.7 6.3 3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 0 3 3l6.91-6.91a6 6 0 0 0 7.94-7.94l-3.77 3.77-3-3Z" />
    </SvgIcon>
  );
}

function CalendarIcon() {
  return (
    <SvgIcon width={20} height={20} strokeWidth={1.7}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </SvgIcon>
  );
}

function AlertIcon() {
  return (
    <SvgIcon width={18} height={18}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </SvgIcon>
  );
}

function PinIcon() {
  return (
    <SvgIcon width={13} height={13}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </SvgIcon>
  );
}

function ClockIcon() {
  return (
    <SvgIcon width={13} height={13}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

function FileIcon() {
  return (
    <SvgIcon width={13} height={13}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </SvgIcon>
  );
}

function BellIcon() {
  return (
    <SvgIcon width={13} height={13}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </SvgIcon>
  );
}

function PenIcon() {
  return (
    <SvgIcon width={13} height={13}>
      <path d="M14 4l6 6-11 11H3v-6L14 4z" />
    </SvgIcon>
  );
}

function TrashIcon() {
  return (
    <SvgIcon width={13} height={13}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="m6 6 1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </SvgIcon>
  );
}

function ChevronRightIcon({ size = 14 }) {
  return (
    <SvgIcon width={size} height={size} strokeWidth={2}>
      <polyline points="9 6 15 12 9 18" />
    </SvgIcon>
  );
}

function ChevronLeftIcon() {
  return (
    <SvgIcon width={14} height={14} strokeWidth={2}>
      <polyline points="15 6 9 12 15 18" />
    </SvgIcon>
  );
}

function ChevronDownIcon() {
  return (
    <SvgIcon width={14} height={14} strokeWidth={2}>
      <polyline points="6 9 12 15 18 9" />
    </SvgIcon>
  );
}

function KebabIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function IndustryIcon({ name }) {
  if (name === 'cart') {
    return (
      <SvgIcon width={24} height={24} strokeWidth={1.7}>
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M3 4h2l2.7 11.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6.5" />
      </SvgIcon>
    );
  }
  if (name === 'fork') {
    return (
      <SvgIcon width={24} height={24} strokeWidth={1.7}>
        <path d="M7 2v8a3 3 0 0 0 6 0V2M10 14v8M17 2c-2 0-3 2-3 5 0 2 1 3 2 3.5V22" />
      </SvgIcon>
    );
  }
  if (name === 'cross') {
    return (
      <SvgIcon width={24} height={24} strokeWidth={1.7}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M12 8v8M8 12h8" />
      </SvgIcon>
    );
  }
  if (name === 'factory') {
    return (
      <SvgIcon width={24} height={24} strokeWidth={1.7}>
        <path d="M3 21V11l5 3V11l5 3V11l5 3v7H3z" />
        <path d="M7 17h.01M11 17h.01M15 17h.01" />
      </SvgIcon>
    );
  }
  if (name === 'school') {
    return (
      <SvgIcon width={24} height={24} strokeWidth={1.7}>
        <path d="M2 9l10-5 10 5-10 5L2 9z" />
        <path d="M6 11v5a6 6 0 0 0 12 0v-5" />
      </SvgIcon>
    );
  }
  if (name === 'dumbbell') {
    return (
      <SvgIcon width={24} height={24} strokeWidth={1.7}>
        <path d="M6 8v8M3 10v4M21 10v4M18 8v8M6 12h12" />
      </SvgIcon>
    );
  }
  if (name === 'fuel') {
    return (
      <SvgIcon width={24} height={24} strokeWidth={1.7}>
        <path d="M3 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h11M14 13l3-3v7a1.5 1.5 0 0 0 3 0V8l-3-3" />
      </SvgIcon>
    );
  }
  if (name === 'shop') {
    return (
      <SvgIcon width={24} height={24} strokeWidth={1.7}>
        <path d="M3 9l1.5-5h15L21 9M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 14h6" />
      </SvgIcon>
    );
  }
  return (
    <SvgIcon width={24} height={24} strokeWidth={1.7}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
      <path d="M10 21v-4h4v4" />
    </SvgIcon>
  );
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeAttributeLabel(value) {
  return safeString(value).replace(/[<>]/g, '');
}

function formatCnpjOrCpf(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  return raw || '';
}

function getIndexed(viewModel, clienteId) {
  const indexed = viewModel?.indexed;
  if (indexed && typeof indexed.get === 'function') return indexed.get(clienteId) || {};
  if (indexed && typeof indexed === 'object') return indexed[clienteId] || {};
  return {};
}

function statusPill(status) {
  if (status === 'ativo') {
    return <span className="cli-card__pill cli-card__pill--ok">Ativo</span>;
  }
  if (status === 'sem_manutencao') {
    return <span className="cli-card__pill cli-card__pill--warn">Sem manutenção</span>;
  }
  return <span className="cli-card__pill cli-card__pill--danger">Precisa atenção</span>;
}

function buildAlertBadge(clienteId, clienteAlerts) {
  const alert = clienteAlerts?.[clienteId];
  if (!alert || alert.daysRemaining === null || alert.daysRemaining === undefined) return null;

  const days = Number(alert.daysRemaining);
  if (!Number.isFinite(days)) return null;

  const overdue = days < 0;
  const soon = days >= 0 && days <= 7;
  const tone = overdue ? 'danger' : soon ? 'warn' : 'info';
  const label = overdue
    ? `${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''} em atraso`
    : days === 0
      ? 'Alerta hoje'
      : `Alerta em ${days} dia${days !== 1 ? 's' : ''}`;

  return { tone, label };
}

function buildKpis({ clientes, equipamentos, registros, indexed, nowMs }) {
  const totalClientes = clientes.length;
  const indexedValues =
    indexed && typeof indexed.values === 'function' ? Array.from(indexed.values()) : [];
  const ativos = indexedValues.filter((data) => data.status === 'ativo').length;
  const ativosPercent = totalClientes ? Math.round((ativos / totalClientes) * 100) : 0;
  const equipsClientes = equipamentos.filter((equipamento) => Boolean(equipamento.clienteId));
  const totalEquips = equipsClientes.length;

  const startMonth = new Date(nowMs);
  startMonth.setDate(1);
  startMonth.setHours(0, 0, 0, 0);
  const startMonthMs = startMonth.getTime();

  const equipsThisMonth = equipsClientes.filter((equipamento) => {
    const timestamp = equipamento.criadoEm || equipamento.createdAt || 0;
    return new Date(timestamp).getTime() >= startMonthMs;
  }).length;

  const equipIdsComCliente = new Set(equipsClientes.map((equipamento) => equipamento.id));
  const servicosMes = registros.filter((registro) => {
    if (!registro.equipId || !equipIdsComCliente.has(registro.equipId)) return false;
    const timestamp = registro.data ? new Date(registro.data).getTime() : 0;
    return timestamp >= startMonthMs;
  }).length;

  const startPrevMonth = new Date(startMonth);
  startPrevMonth.setMonth(startPrevMonth.getMonth() - 1);
  const startPrevMonthMs = startPrevMonth.getTime();
  const servicosPrevMonth = registros.filter((registro) => {
    if (!registro.equipId || !equipIdsComCliente.has(registro.equipId)) return false;
    const timestamp = registro.data ? new Date(registro.data).getTime() : 0;
    return timestamp >= startPrevMonthMs && timestamp < startMonthMs;
  }).length;

  let trendLabel = '—';
  let trendTone = 'neutral';
  if (servicosPrevMonth === 0 && servicosMes > 0) {
    trendLabel = 'novo este mês';
    trendTone = 'up';
  } else if (servicosPrevMonth > 0) {
    const delta = Math.round(((servicosMes - servicosPrevMonth) / servicosPrevMonth) * 100);
    trendLabel = `${delta >= 0 ? '+' : ''}${delta}% vs mês anterior`;
    trendTone = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
  }

  const pendentes = indexedValues.filter((data) => data.status !== 'ativo').length;

  return {
    ativos,
    ativosPercent,
    totalEquips,
    equipsThisMonth,
    servicosMes,
    trendLabel,
    trendTone,
    pendentes,
  };
}

function Header() {
  return (
    <header className="cli-page__header">
      <div>
        <h1 className="cli-page__title">Meus clientes</h1>
        <p className="cli-page__sub">
          Cadastre e gerencie seus clientes, organize equipamentos por carteira e gere relatórios
          PMOC formais.
        </p>
      </div>
      <button
        type="button"
        className="cli-page__cta"
        data-action={CLIENTES_ACTIONS.openModal}
        data-mode="create"
      >
        <PlusIcon />
        <span>Novo cliente</span>
      </button>
    </header>
  );
}

function EmptyState() {
  return (
    <section className="cli-empty" aria-label="Nenhum cliente">
      <div className="cli-empty__art" aria-hidden="true">
        <UsersIcon />
      </div>
      <h3 className="cli-empty__title">Nenhum cliente cadastrado</h3>
      <p className="cli-empty__sub">
        Cadastre clientes pra organizar os equipamentos por carteira e gerar relatórios PMOC
        formais.
      </p>
      <button
        type="button"
        className="cli-empty__cta"
        data-action={CLIENTES_ACTIONS.openModal}
        data-mode="create"
      >
        <PlusIcon />
        <span>Cadastrar primeiro cliente</span>
      </button>
    </section>
  );
}

function EmptyFilter({ searchTerm }) {
  const term = safeString(searchTerm);
  const hint = term ? `para "${term}"` : 'com os filtros atuais';
  return (
    <div className="cli-empty cli-empty--filter">
      <p className="cli-empty__sub">Nenhum cliente encontrado {hint}.</p>
      <button
        type="button"
        className="cli-empty__cta cli-empty__cta--ghost"
        data-cli-action={CLIENTES_ACTIONS.clearFilters}
      >
        Limpar filtros
      </button>
    </div>
  );
}

function Filters({ viewModel }) {
  const filters = viewModel.filters || {};
  const cityOptions = [
    'todas',
    ...Array.from(new Set(asArray(viewModel.cities)))
      .filter(Boolean)
      .sort(),
  ];
  const filterKey = [
    filters.searchTerm,
    filters.statusFilter,
    filters.cityFilter,
    filters.sortBy,
  ].join(':');

  return (
    <div className="cli-filters">
      <label className="cli-search">
        <span className="cli-search__icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          key={`search:${filterKey}`}
          type="search"
          className="cli-search__input"
          id={CLIENTES_PUBLIC_IDS.searchInput}
          placeholder="Buscar por nome, CNPJ, endereço..."
          aria-label="Buscar cliente"
          defaultValue={safeString(filters.searchTerm)}
        />
      </label>
      <label className="cli-select">
        <span className="cli-select__label">Status</span>
        <select
          key={`status:${filterKey}`}
          id={CLIENTES_PUBLIC_IDS.statusFilter}
          className="cli-select__input"
          aria-label="Filtrar por status"
          defaultValue={safeString(filters.statusFilter, 'todos')}
        >
          {CLIENTES_STATUS_OPTIONS.map((option) => (
            <option value={option.id} key={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="cli-select">
        <span className="cli-select__label">Cidade</span>
        <select
          key={`city:${filterKey}`}
          id={CLIENTES_PUBLIC_IDS.cityFilter}
          className="cli-select__input"
          aria-label="Filtrar por cidade"
          defaultValue={safeString(filters.cityFilter, 'todas')}
        >
          {cityOptions.map((city) => (
            <option value={city} key={city}>
              {city === 'todas' ? 'Todas' : city}
            </option>
          ))}
        </select>
      </label>
      <label className="cli-select">
        <span className="cli-select__label">Ordenar por</span>
        <select
          key={`sort:${filterKey}`}
          id={CLIENTES_PUBLIC_IDS.sort}
          className="cli-select__input"
          aria-label="Ordenar lista"
          defaultValue={safeString(filters.sortBy, 'mais_ativos')}
        >
          {CLIENTES_SORT_OPTIONS.map((option) => (
            <option value={option.id} key={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="cli-filters__reset"
        data-cli-action={CLIENTES_ACTIONS.clearFilters}
        aria-label="Limpar filtros"
        title="Limpar filtros"
      >
        <FilterIcon />
      </button>
    </div>
  );
}

function ActiveContext({ filters }) {
  const chips = [];
  const searchTerm = safeString(filters?.searchTerm).trim();
  const statusFilter = safeString(filters?.statusFilter, 'todos');
  const cityFilter = safeString(filters?.cityFilter, 'todas');

  if (searchTerm) chips.push(['Busca', searchTerm]);
  if (statusFilter !== 'todos') chips.push(['Status', statusFilter.replaceAll('_', ' ')]);
  if (cityFilter !== 'todas') chips.push(['Cidade', cityFilter]);
  if (!chips.length) return null;

  return (
    <div className="cli-context" role="status" aria-label="Filtros ativos">
      <span className="cli-context__label">Contexto ativo</span>
      <div className="cli-context__chips">
        {chips.map(([label, value]) => (
          <span className="cli-context__chip" key={`${label}:${value}`}>
            {label}: <b>{value}</b>
          </span>
        ))}
      </div>
      <button
        type="button"
        className="cli-context__clear"
        data-cli-action={CLIENTES_ACTIONS.clearFilters}
      >
        Limpar
      </button>
    </div>
  );
}

function AlertStrip({ indexed }) {
  const values =
    indexed && typeof indexed.values === 'function' ? Array.from(indexed.values()) : [];
  const stale = values.filter(
    (data) =>
      data.lastServiceTs > 0 &&
      (data.status === 'sem_manutencao' || data.status === 'precisa_atencao'),
  ).length;
  if (!stale) return null;

  return (
    <div className="cli-alert" role="status">
      <span className="cli-alert__icon" aria-hidden="true">
        <AlertIcon />
      </span>
      <div className="cli-alert__body">
        <div className="cli-alert__title">
          {stale} cliente{stale !== 1 ? 's' : ''} sem manutenção há mais de 60 dias
        </div>
        <div className="cli-alert__desc">
          Mantenha a regularidade e evite falhas nos equipamentos.
        </div>
      </div>
      <button
        type="button"
        className="cli-alert__cta"
        data-cli-action={CLIENTES_ACTIONS.filterPending}
      >
        Ver clientes
        <span aria-hidden="true">
          <ChevronRightIcon />
        </span>
      </button>
    </div>
  );
}

function KpiCard({ className, icon, label, value, sub, subTone }) {
  return (
    <article className={className}>
      <span className="cli-kpi__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="cli-kpi__body">
        <div className="cli-kpi__label">{label}</div>
        <div className="cli-kpi__value">{value}</div>
        <div
          className={['cli-kpi__sub', subTone ? `cli-kpi__sub--${subTone}` : '']
            .filter(Boolean)
            .join(' ')}
        >
          {sub}
        </div>
      </div>
    </article>
  );
}

function Summary({ viewModel, isCollapsed, nowMs }) {
  const clientes = asArray(viewModel.clientes);
  const equipamentos = asArray(viewModel.equipamentos);
  const registros = asArray(viewModel.registros);
  const kpis = buildKpis({
    clientes,
    equipamentos,
    registros,
    indexed: viewModel.indexed,
    nowMs,
  });

  return (
    <section
      className={['cli-summary', isCollapsed ? 'is-collapsed' : ''].filter(Boolean).join(' ')}
      aria-label="Resumo da carteira"
    >
      <button
        type="button"
        className="cli-summary__toggle"
        data-cli-action={CLIENTES_ACTIONS.toggleSummary}
        aria-expanded={isCollapsed ? 'false' : 'true'}
      >
        <span className="cli-summary__title">Resumo</span>
        <span className="cli-summary__hint">KPIs da carteira</span>
        <span className="cli-summary__chev" aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </button>
      <div className="cli-summary__content">
        <div className="cli-kpis">
          <KpiCard
            className="cli-kpi cli-kpi--users"
            icon={<UsersIcon />}
            label="Clientes ativos"
            value={kpis.ativos}
            sub={`${kpis.ativosPercent}% ativos`}
            subTone="ok"
          />
          <KpiCard
            className="cli-kpi cli-kpi--equips"
            icon={<MonitorIcon />}
            label="Equipamentos"
            value={kpis.totalEquips}
            sub={
              kpis.equipsThisMonth > 0 ? `+${kpis.equipsThisMonth} este mês` : 'sem novos este mês'
            }
          />
          <KpiCard
            className="cli-kpi cli-kpi--services"
            icon={<WrenchIcon />}
            label="Serviços este mês"
            value={kpis.servicosMes}
            sub={kpis.trendLabel}
            subTone={kpis.trendTone}
          />
          <KpiCard
            className="cli-kpi cli-kpi--pending"
            icon={<CalendarIcon />}
            label="Manutenções pendentes"
            value={kpis.pendentes}
            sub={kpis.pendentes > 0 ? 'Requerem atenção' : 'Tudo em dia'}
            subTone={kpis.pendentes > 0 ? 'warn' : 'ok'}
          />
        </div>
      </div>
    </section>
  );
}

function CardMenu({ clienteId, hasAlert }) {
  return (
    <div className="cli-card__menu" id={`cli-card-menu-${clienteId}`} role="menu" hidden>
      <button
        type="button"
        className="cli-card__menu-item"
        data-cli-action={CLIENTES_ACTIONS.alert}
        data-id={clienteId}
        role="menuitem"
      >
        <BellIcon />
        <span>{hasAlert ? 'Alterar alerta' : 'Definir alerta'}</span>
      </button>
      <button
        type="button"
        className="cli-card__menu-item"
        data-cli-action={CLIENTES_ACTIONS.edit}
        data-id={clienteId}
        role="menuitem"
      >
        <PenIcon />
        <span>Editar cliente</span>
      </button>
      <button
        type="button"
        className="cli-card__menu-item cli-card__menu-item--danger"
        data-cli-action={CLIENTES_ACTIONS.delete}
        data-id={clienteId}
        role="menuitem"
      >
        <TrashIcon />
        <span>Apagar cliente</span>
      </button>
    </div>
  );
}

function ClienteCard({ cliente, data, clienteAlerts, nowMs }) {
  const clienteId = safeString(cliente.id);
  const nome = safeString(cliente.nome, 'Cliente') || 'Cliente';
  const accessibleName = safeAttributeLabel(nome);
  const razao = safeString(cliente.razaoSocial);
  const cnpj = cliente.cnpj ? formatCnpjOrCpf(cliente.cnpj) : '';
  const subline = [razao, cnpj].filter(Boolean).join('  ·  ');
  const industry = resolveIndustry(cliente);
  const endereco = cliente.endereco ? safeString(cliente.endereco) : 'Endereço não informado';
  const displayCity = safeString(data.displayCity);
  const equipsLabel = Number(data.equipsCount || 0);
  const servicesLabel = Number(data.servicesCount || 0);
  const lastLabel = formatRelativeDate(data.lastServiceTs, nowMs);
  const lastClass = lastServiceClass(data.sinceLast);
  const pmoc = data.pmocSummary || {};
  const pmocOverdueCount = Number(data.pmocOverdueCount || 0);
  const pmocOverdueLabel = `${pmocOverdueCount} manutenção${pmocOverdueCount !== 1 ? 'es' : ''} atrasada${pmocOverdueCount !== 1 ? 's' : ''}`;
  const alertBadge = buildAlertBadge(clienteId, clienteAlerts);

  return (
    <article
      className="cli-card"
      data-id={clienteId}
      role="listitem"
      tabIndex={0}
      aria-label={`Cliente ${accessibleName}`}
    >
      <header className="cli-card__head">
        <span className={`cli-card__icon cli-card__icon--${industry.tint}`} aria-hidden="true">
          <IndustryIcon name={industry.name} />
        </span>
        <div className="cli-card__title-wrap">
          <h3 className="cli-card__name">{nome}</h3>
          {subline ? <div className="cli-card__sub">{subline}</div> : null}
        </div>
        {statusPill(data.status)}
        <CardMenu clienteId={clienteId} hasAlert={Boolean(clienteAlerts?.[clienteId])} />
      </header>

      {alertBadge ? (
        <div className={`cli-card__alert cli-card__alert--${alertBadge.tone}`}>
          <span aria-hidden="true">
            <BellIcon />
          </span>
          <span>{alertBadge.label}</span>
        </div>
      ) : null}

      <div className="cli-card__address">
        <span className="cli-card__address-icon" aria-hidden="true">
          <PinIcon />
        </span>
        <span>
          {endereco}
          {displayCity ? (
            <>
              <br />
              {displayCity}
            </>
          ) : null}
        </span>
      </div>

      <div className="cli-card__stats">
        <div className="cli-stat">
          <div className="cli-stat__value">{equipsLabel}</div>
          <div className="cli-stat__label">Equipamentos</div>
        </div>
        <div className="cli-stat">
          <div className="cli-stat__value">{servicesLabel}</div>
          <div className="cli-stat__label">Serviços</div>
        </div>
        <div className="cli-stat">
          <div className={`cli-stat__value ${lastClass}`}>{lastLabel}</div>
          <div className="cli-stat__label">Última manutenção</div>
        </div>
      </div>

      {pmocOverdueCount > 0 ? (
        <div
          className="cli-pmoc"
          data-cli-action={CLIENTES_ACTIONS.pmocFocus}
          data-id={clienteId}
          role="button"
          tabIndex={0}
          aria-label={`Abrir equipamentos com filtro PMOC do cliente ${accessibleName}`}
        >
          <span className="cli-pmoc__label">PMOC</span>
          <span className="cli-pmoc__status">⚠️ {pmocOverdueLabel}</span>
        </div>
      ) : null}

      <section
        className="cli-pmoc"
        aria-label="Resumo PMOC"
        role="button"
        tabIndex={0}
        data-cli-action={CLIENTES_ACTIONS.openPmocPanel}
        data-id={clienteId}
      >
        <div className="cli-pmoc__head">
          <strong>{safeString(pmoc.activeLabel, 'PMOC inativo')}</strong>
          <span className={`cli-pmoc__chip ${pmocStatusClass(pmoc.status)}`}>
            {safeString(pmoc.statusLabel, 'Sem cronograma')}
          </span>
        </div>
        <div className="cli-pmoc__meta">
          <span>Última atualização: {safeString(pmoc.lastUpdateLabel, 'Sem atualização')}</span>
          <span>
            {Number(pmoc.doneCount || 0)} de {Number(pmoc.plannedCount || 0)} manutenções realizadas
          </span>
          <span>
            Próxima manutenção: {safeString(pmoc.nextMaintenanceLabel, 'Sem manutenção prevista')}
          </span>
          <span>{safeString(pmoc.statusHelp, 'Sem cronograma ativo para este cliente.')}</span>
        </div>
      </section>

      <footer className="cli-card__actions">
        <button
          type="button"
          className="cli-card__action cli-card__action--primary"
          data-cli-action={CLIENTES_ACTIONS.verEquipamentos}
          data-id={clienteId}
        >
          <MonitorIcon size={13} />
          <span>Ver equipamentos</span>
        </button>
        <button
          type="button"
          className="cli-card__action cli-card__action--secondary"
          data-cli-action={CLIENTES_ACTIONS.verServicos}
          data-id={clienteId}
        >
          <ClockIcon />
          <span>Ver serviços</span>
        </button>
        <button
          type="button"
          className="cli-card__action cli-card__action--pmoc"
          data-cli-action={CLIENTES_ACTIONS.openPmocPanel}
          data-id={clienteId}
        >
          <FileIcon />
          <span>PMOC</span>
        </button>
        <button
          type="button"
          className="cli-card__action cli-card__action--ghost cli-card__action--options"
          data-cli-action={CLIENTES_ACTIONS.cardMenu}
          data-id={clienteId}
          aria-label={`Mais opções para ${accessibleName}`}
          title="Opções"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <KebabIcon />
          <span className="cli-card__options-label">Opções</span>
        </button>
      </footer>
    </article>
  );
}

function CardsGrid({ viewModel, clienteAlerts, nowMs }) {
  const pageItems = asArray(viewModel.pageItems);
  if (!pageItems.length) {
    return <EmptyFilter searchTerm={viewModel.filters?.searchTerm} />;
  }

  return (
    <div className="cli-grid" role="list">
      {pageItems.map((cliente) => (
        <ClienteCard
          cliente={cliente}
          data={getIndexed(viewModel, cliente.id)}
          clienteAlerts={clienteAlerts}
          nowMs={nowMs}
          key={cliente.id}
        />
      ))}
    </div>
  );
}

function Pagination({ pagination }) {
  const safePagination = pagination || {};
  const filteredCount = Number(safePagination.filteredCount || 0);
  const pageSize = Number(safePagination.pageSize || 6);
  const currentPage = Number(safePagination.currentPage || 1);
  const totalPages = Math.max(
    1,
    Number(safePagination.totalPages || Math.ceil(filteredCount / pageSize)),
  );
  if (filteredCount === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(filteredCount, currentPage * pageSize);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="cli-pag" role="navigation" aria-label="Paginação">
      <div className="cli-pag__info">
        Mostrando {from}-{to} de {filteredCount}
      </div>
      <div className="cli-pag__controls">
        <button
          type="button"
          className="cli-pag__btn"
          data-cli-action={CLIENTES_ACTIONS.prevPage}
          aria-label="Pagina anterior"
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon />
        </button>
        <div className="cli-pag__pages">
          {pages.map((page) => (
            <button
              type="button"
              className={['cli-pag__page', page === currentPage ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')}
              data-cli-action={CLIENTES_ACTIONS.gotoPage}
              data-page={page}
              aria-label={`Pagina ${page}`}
              aria-current={page === currentPage ? 'page' : 'false'}
              key={page}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="cli-pag__btn"
          data-cli-action={CLIENTES_ACTIONS.nextPage}
          aria-label="Próxima pagina"
          disabled={currentPage >= totalPages}
        >
          <ChevronRightIcon />
        </button>
      </div>
      <label className="cli-select cli-pag__size">
        <span className="cli-select__label">Por página</span>
        <select
          key={`page-size:${pageSize}`}
          id={CLIENTES_PUBLIC_IDS.pageSize}
          className="cli-select__input"
          aria-label="Itens por página"
          defaultValue={pageSize}
        >
          {CLIENTES_PAGE_SIZE_OPTIONS.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function ClientesPage({
  viewModel,
  clienteAlerts = {},
  isSummaryCollapsed = false,
  nowMs = Date.now(),
}) {
  const safeViewModel = viewModel || {};

  return (
    <div className="tw-w-full cli-page" data-react-clientes-page="true">
      <Header />
      {safeViewModel.isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <Filters viewModel={safeViewModel} />
          <ActiveContext filters={safeViewModel.filters} />
          <AlertStrip indexed={safeViewModel.indexed} />
          <Summary viewModel={safeViewModel} isCollapsed={isSummaryCollapsed} nowMs={nowMs} />
          <CardsGrid viewModel={safeViewModel} clienteAlerts={clienteAlerts} nowMs={nowMs} />
          <Pagination pagination={safeViewModel.pagination} />
        </>
      )}
    </div>
  );
}
