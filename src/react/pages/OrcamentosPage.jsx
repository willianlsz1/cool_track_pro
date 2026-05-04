import {
  ORCAMENTO_ACTIONS,
  ORCAMENTO_STATUS_META,
} from '../../ui/viewModels/orcamentosViewModel.js';
import { Badge, Button } from '../components/ui/index.js';

function DownloadIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function Header({ kpis }) {
  const safeKpis = kpis || {};
  return (
    <div className="orc-header">
      <div className="orc-header__title-row">
        <h1 className="orc-header__title">Orçamentos</h1>
        <Button
          variant="primary"
          size="sm"
          className="btn btn--primary btn--sm"
          data-action={ORCAMENTO_ACTIONS.openModal}
          data-mode="create"
        >
          <PlusIcon />
          Novo orçamento
        </Button>
      </div>
      <div className="orc-kpis">
        <div className="orc-kpi">
          <div className="orc-kpi__value">{safeKpis.totalAtivos || 0}</div>
          <div className="orc-kpi__label">Em aberto</div>
        </div>
        <div className="orc-kpi">
          <div className="orc-kpi__value" style={{ color: '#10b981' }}>
            {safeKpis.totalAprovados || 0}
          </div>
          <div className="orc-kpi__label">Aprovados</div>
        </div>
        <div className="orc-kpi">
          <div className="orc-kpi__value" style={{ color: '#00c8e8' }}>
            {safeKpis.valorPipelineLabel || 'R$ 0,00'}
          </div>
          <div className="orc-kpi__label">Pipeline</div>
        </div>
      </div>
    </div>
  );
}

function Filters({ viewModel, onSearchInput }) {
  const statusFilters = Array.isArray(viewModel.statusFilters) ? viewModel.statusFilters : [];
  return (
    <div className="orc-toolbar">
      <div className="orc-search">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          id="orc-busca"
          className="orc-search__input"
          placeholder="Buscar por cliente, número ou título..."
          defaultValue={viewModel.filters?.busca || ''}
          onInput={(event) => onSearchInput?.(event.currentTarget.value)}
        />
      </div>
      <div className="orc-filter-chips" role="group" aria-label="Filtrar por status">
        {statusFilters.map((status) => (
          <Button
            variant="ghost"
            size="sm"
            className={['orc-chip', status.isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
            data-action={ORCAMENTO_ACTIONS.setStatusFilter}
            data-status={status.id}
            key={status.id}
          >
            {status.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ emptyState }) {
  const action = emptyState?.action || ORCAMENTO_ACTIONS.openModal;
  const mode = emptyState?.mode || 'create';
  return (
    <div className="orc-empty">
      <div className="orc-empty__art" aria-hidden="true">
        <DocumentIcon />
      </div>
      <h2 className="orc-empty__title">Nenhum orçamento ainda</h2>
      <p className="orc-empty__sub">
        Crie orçamentos profissionais de instalação e envie pelo WhatsApp em segundos.
      </p>
      <Button
        variant="primary"
        size="md"
        className="btn btn--primary orc-empty__cta"
        data-action={action}
        data-mode={mode}
      >
        + Novo orçamento
      </Button>
    </div>
  );
}

function StatusPill({ status, statusMeta }) {
  const meta = statusMeta || ORCAMENTO_STATUS_META.rascunho;
  return (
    <Badge
      tone="neutral"
      size="sm"
      className="orc-status-pill"
      data-status={status || 'rascunho'}
      style={{
        color: meta.color,
        background: meta.bg,
        border: '1px solid ' + meta.color + '33',
      }}
    >
      {meta.label}
    </Badge>
  );
}

function SignedInfo({ signed }) {
  if (!signed) return null;
  return (
    <div className="orc-card__signed">
      <CheckIcon />
      Assinado digitalmente por <strong>{signed.nome}</strong> em {signed.dateLabel}
    </div>
  );
}

function CardAction({ action }) {
  const id = action.id || '';
  if (action.kind === 'edit') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="btn btn--ghost btn--sm"
        data-action={action.action}
        data-mode={action.mode}
        data-id={id}
      >
        {action.label}
      </Button>
    );
  }
  if (action.kind === 'sendSignature') {
    return (
      <button
        type="button"
        className="btn btn--primary btn--sm"
        data-action={action.action}
        data-id={id}
        title={action.title}
      >
        {action.label}
      </button>
    );
  }
  if (action.kind === 'share') {
    return (
      <Button
        variant="outline"
        size="sm"
        className="btn btn--outline btn--sm"
        data-action={action.action}
        data-id={id}
      >
        {action.label}
      </Button>
    );
  }
  if (action.kind === 'download') {
    return (
      <Button
        variant="outline"
        size="sm"
        className="btn btn--outline btn--sm orc-card__download"
        data-action={action.action}
        data-id={id}
        title={action.title}
      >
        <DownloadIcon />
        {action.label}
      </Button>
    );
  }
  if (action.kind === 'markApproved') {
    return (
      <Button
        variant="outline"
        size="sm"
        className="btn btn--outline btn--sm"
        data-action={action.action}
        data-id={id}
      >
        {action.label}
      </Button>
    );
  }
  if (action.kind === 'delete') {
    return (
      <button
        type="button"
        className="orc-card__kebab"
        data-action={action.action}
        data-id={id}
        aria-label={action.ariaLabel}
        title={action.title}
      >
        <DeleteIcon />
      </button>
    );
  }
  return null;
}

function OrcamentoCard({ card }) {
  const actions = Array.isArray(card.actions) ? card.actions : [];
  return (
    <article className="orc-card" data-id={card.id || ''}>
      <header className="orc-card__head">
        <div>
          <Badge tone="neutral" size="sm" className="orc-card__numero">
            {card.numero}
          </Badge>
          <StatusPill status={card.status} statusMeta={card.statusMeta} />
        </div>
        <div className="orc-card__total">{card.totalLabel}</div>
      </header>
      <div className="orc-card__body">
        <h3 className="orc-card__title">{card.titleLabel}</h3>
        <div className="orc-card__cliente">
          <UserIcon />
          {card.clienteLine}
        </div>
        <div className="orc-card__meta">
          <span>{card.clienteVinculoLabel}</span>
          <span>{card.equipamentoVinculoLabel}</span>
          <span>Status: {card.statusLabel}</span>
        </div>
        <div className="orc-card__meta">
          <span>{card.createdLabel}</span>
          {card.validityLabel ? (
            <span className="orc-card__validity">{card.validityLabel}</span>
          ) : null}
        </div>
        <SignedInfo signed={card.signed} />
      </div>
      <footer className="orc-card__actions">
        {actions.map((action) => (
          <CardAction action={action} key={`${action.kind}:${action.action}:${action.id || ''}`} />
        ))}
      </footer>
    </article>
  );
}

export function OrcamentosPage({ viewModel, onSearchInput }) {
  const safeViewModel = viewModel || {};
  const cards = Array.isArray(safeViewModel.cards) ? safeViewModel.cards : [];

  return (
    <div className="tw-w-full orc-page" data-react-orcamentos-page="true">
      <Header kpis={safeViewModel.kpis} />
      {safeViewModel.isEmpty ? (
        <EmptyState emptyState={safeViewModel.emptyState} />
      ) : (
        <>
          <Filters viewModel={safeViewModel} onSearchInput={onSearchInput} />
          <div className="orc-cards">
            {safeViewModel.isFilterEmpty ? (
              <div className="orc-empty-filter">{safeViewModel.filterEmptyMessage}</div>
            ) : (
              cards.map((card) => <OrcamentoCard card={card} key={card.id || card.numero} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}
