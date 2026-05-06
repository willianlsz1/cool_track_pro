import { EQUIPAMENTOS_ACTIONS } from '../../ui/viewModels/equipamentosContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function attrText(value) {
  return String(value || '').replace(/[<>]/g, '');
}

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

function CameraIcon() {
  return (
    <SvgIcon width={18} height={18} strokeWidth={2}>
      <path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </SvgIcon>
  );
}

function BoxIcon() {
  return (
    <SvgIcon width={18} height={18}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    </SvgIcon>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="equip-card__primary-cta-arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function EmptyState({ emptyState }) {
  if (!emptyState) return null;

  const cta = emptyState.cta;
  const ctaClassName = cta
    ? classNames(
        'btn',
        cta.tone === 'outline' ? 'btn--outline' : 'btn--primary',
        cta.size === 'sm' && 'btn--sm',
        cta.autoWidth && 'btn--auto',
        cta.centered && 'btn--centered',
      )
    : '';

  return (
    <>
      <div className="empty-state">
        <div className="empty-state__icon">{emptyState.icon || '-'}</div>
        <div className="empty-state__title">{emptyState.title}</div>
        {emptyState.description ? (
          <div className="empty-state__sub">{emptyState.description}</div>
        ) : null}
        {cta ? (
          <div className="empty-state__cta">
            <button
              type="button"
              className={ctaClassName}
              data-action={cta.action || undefined}
              data-id={cta.id || undefined}
              data-nav={cta.nav || undefined}
              data-testid={cta.testid || undefined}
            >
              {cta.label || 'Continuar'}
            </button>
          </div>
        ) : null}
      </div>
      {emptyState.proHint ? (
        <>
          <p className="empty-state__hint">
            Use Clientes quando quiser organizar por empresa e setor.
          </p>
          <button type="button" className="btn btn--outline btn--sm" data-nav="clientes">
            Cadastrar cliente primeiro
          </button>
        </>
      ) : null}
    </>
  );
}

function QuickMoveBanner({ quickMove, total }) {
  if (!quickMove) return null;

  const setoresDoCliente = asArray(quickMove.setoresDoCliente);
  const setoresOrfaos = asArray(quickMove.setoresOrfaos);
  const equipIds = asArray(quickMove.equipIds).join(',');
  const count = Number(total) || asArray(quickMove.equipIds).length;

  if (!equipIds || (!setoresDoCliente.length && !setoresOrfaos.length)) return null;

  return (
    <div className="quick-move-banner" data-equip-ids={equipIds}>
      <div className="quick-move-banner__icon" aria-hidden="true">
        <BoxIcon />
      </div>
      <div className="quick-move-banner__body">
        <strong>
          Organizar {count} equipamento{count !== 1 ? 's' : ''} sem setor
        </strong>
        <p>
          Escolha um setor para mover todos de uma vez. Ou edite cada equipamento individualmente.
        </p>
      </div>
      <div className="quick-move-banner__action">
        <select
          className="quick-move-banner__select"
          id="quick-move-target-setor"
          aria-label="Setor de destino"
        >
          <option value="">Selecione um setor...</option>
          {setoresDoCliente.length ? (
            <optgroup label="Setores deste cliente">
              {setoresDoCliente.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </optgroup>
          ) : null}
          {setoresOrfaos.length ? (
            <optgroup label="Setores sem cliente (sera vinculado)">
              {setoresOrfaos.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome} (sem cliente - sera vinculado)
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
        <button
          type="button"
          className="quick-move-banner__btn"
          data-action={EQUIPAMENTOS_ACTIONS.quickMoveEquipBatch}
        >
          Mover todos
        </button>
      </div>
    </div>
  );
}

function ComponentPill({ pill }) {
  if (!pill) return null;
  return (
    <span
      className={classNames(
        'equip-card__componente-pill',
        `equip-card__componente-pill--${pill.tint}`,
      )}
    >
      {pill.label}
    </span>
  );
}

function EquipmentIcon({ card }) {
  const visual = card.visual || {};
  const toneClass = `equip-card__type-icon--fallback-t${visual.tone || 1}`;
  const fallback = <span className="equip-card__fallback-initials">{visual.initials || 'EQ'}</span>;

  if (visual.photoUrl) {
    return (
      <div
        className={classNames(
          'equip-card__type-icon equip-card__type-icon--lg equip-card__type-icon--photo',
          toneClass,
        )}
        aria-hidden="true"
      >
        <img src={visual.photoUrl} alt="" loading="lazy" />
        {fallback}
      </div>
    );
  }

  const openPhotosAttrs = visual.photoUrl
    ? {}
    : {
        role: 'button',
        tabIndex: 0,
        'data-action': EQUIPAMENTOS_ACTIONS.openPhotosEditor,
        'data-id': card.id,
        'aria-label': attrText(`Adicionar foto ao equipamento ${card.name || ''}`),
      };

  return (
    <div
      className={classNames(
        'equip-card__type-icon equip-card__type-icon--lg equip-card__type-icon--fallback equip-card__type-icon--empty',
        toneClass,
      )}
      {...openPhotosAttrs}
    >
      {fallback}
      <span className="equip-card__type-icon-overlay" aria-hidden="true">
        <CameraIcon />
      </span>
    </div>
  );
}

function HeaderRight({ card }) {
  if (card.isIdle) {
    return (
      <span
        className={classNames(
          'equip-card__tone-pill',
          `equip-card__tone-pill--${card.statusClass || 'ok'}`,
        )}
      >
        <span className="equip-card__tone-pill-dot" aria-hidden="true"></span>
        {card.statusLabel || 'Estavel'}
      </span>
    );
  }

  return (
    <div className="equip-card__score-block">
      <span
        className={classNames(
          'equip-card__score-value',
          `equip-card__score-value--${card.healthClass || 'ok'}`,
        )}
      >
        {Number(card.score) || 0}%
      </span>
      <span className="equip-card__score-label">Eficiencia</span>
    </div>
  );
}

function CardHeader({ card }) {
  return (
    <div className="equip-card__header">
      <EquipmentIcon card={card} />
      <div className="equip-card__meta">
        <div className={classNames('equip-card__name', card.nameClass)}>{card.name}</div>
        <div className="equip-card__tag">
          {asArray(card.tagParts).map((part, index) => (
            <span key={`${card.id}-tag-${index}`}>
              {index > 0 ? ' · ' : ''}
              {part}
            </span>
          ))}
          <ComponentPill pill={card.componentPill} />
        </div>
        <div className="equip-card__subtitle">{card.subtitle || 'Local nao informado'}</div>
      </div>
      <HeaderRight card={card} />
    </div>
  );
}

function IdleCardBody({ card }) {
  return (
    <div className="equip-card__onboard">
      <div className="equip-card__onboard-text">
        <div className="equip-card__onboard-label">PRIMEIRO SERVICO</div>
        <div className="equip-card__onboard-title">Crie a linha de base</div>
        <div className="equip-card__onboard-sub">O primeiro registro define o historico</div>
      </div>
      <button
        type="button"
        className="equip-card__onboard-cta"
        data-action={EQUIPAMENTOS_ACTIONS.goRegisterEquip}
        data-id={card.id}
      >
        {card.ctaLabel || 'Comecar'} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

function RiskChips({ card }) {
  const risk = card.risk || {};
  const factors = asArray(risk.factors);

  return (
    <div className="equip-card__chips">
      <span
        className={classNames(
          'equip-card__risk-chip',
          `equip-card__risk-chip--${risk.classification || 'baixo'}`,
        )}
      >
        {risk.label || 'Baixo'} · {Number(risk.score) || 0}
      </span>
      {asArray(card.riskTrends).map((trend) => (
        <span
          key={trend.label}
          className={classNames('equip-card__risk-trend', trend.className)}
          title={trend.title || undefined}
          aria-label={trend.ariaLabel || undefined}
        >
          {trend.label}
          {trend.word ? <span className="equip-card__risk-trend-word">{trend.word}</span> : null}
        </span>
      ))}
      {factors.slice(0, 3).map((factor, index) => {
        const label = typeof factor === 'string' ? factor : factor.label;
        const tone = typeof factor === 'string' ? 'neutral' : factor.tone || 'neutral';
        return (
          <span
            key={`${card.id}-factor-${index}`}
            className={classNames('equip-card__chip-ctx', `equip-card__chip-ctx--${tone}`)}
          >
            {label}
          </span>
        );
      })}
      {card.timeline ? (
        <span className="equip-card__timeline-inline">
          Ult. <b>{card.timeline.lastLabel || '-'}</b>
          <span className="equip-card__timeline-sep" aria-hidden="true"></span>
          Prox.{' '}
          <b className={`equip-card__timeline-inline-next--${card.timeline.nextTone || 'neutral'}`}>
            {card.timeline.nextLabel || 'sem agenda'}
          </b>
        </span>
      ) : null}
    </div>
  );
}

function ActiveCardBody({ card }) {
  const score = Math.max(0, Math.min(100, Number(card.score) || 0));

  return (
    <>
      <div className="equip-card__health-bar-full">
        <div
          className={classNames(
            'equip-card__health-fill',
            `equip-card__health-fill--${card.healthClass || 'ok'}`,
          )}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <RiskChips card={card} />
      <div className="equip-card__primary">
        <div className="equip-card__primary-text">
          <div className="equip-card__primary-label">{card.primaryLabel || 'PROXIMA ACAO'}</div>
          <div className="equip-card__primary-title">{card.primaryTitle || card.ctaLabel}</div>
          {card.primaryMeta ? (
            <div className="equip-card__primary-meta">{card.primaryMeta}</div>
          ) : null}
        </div>
        <button
          type="button"
          className="equip-card__primary-cta"
          data-action={EQUIPAMENTOS_ACTIONS.goRegisterEquip}
          data-id={card.id}
          aria-label={card.ctaLabel || 'Registrar serviço'}
        >
          <ArrowIcon />
        </button>
      </div>
    </>
  );
}

function EquipmentCard({ card }) {
  const statusClass = card.statusClass || 'ok';
  const className = classNames(
    'equip-card',
    `equip-card--${statusClass}`,
    card.isIdle && 'equip-card--idle',
  );

  return (
    <div
      className={className}
      data-action={EQUIPAMENTOS_ACTIONS.viewEquip}
      data-id={card.id}
      data-testid={card.testId || `equip-card-${card.id}`}
      role="listitem"
      tabIndex={0}
      aria-label={attrText(card.ariaLabel || card.name)}
    >
      <CardHeader card={card} />
      {card.isIdle ? <IdleCardBody card={card} /> : <ActiveCardBody card={card} />}
    </div>
  );
}

function IdleCluster({ cards }) {
  const count = cards.length;
  if (!count) return null;
  const label = `${count} equipamento${count === 1 ? '' : 's'} novo${count === 1 ? '' : 's'} aguardando linha de base`;

  return (
    <div className="equip-idle-cluster" data-expanded="false" role="group" aria-label={label}>
      <button
        type="button"
        className="equip-idle-cluster__summary"
        data-action={EQUIPAMENTOS_ACTIONS.toggleIdleCluster}
        aria-expanded="false"
      >
        <div className="equip-idle-cluster__icon" aria-hidden="true">
          +
        </div>
        <div className="equip-idle-cluster__text">
          <div className="equip-idle-cluster__title">
            <b>{count}</b> equipamento{count === 1 ? '' : 's'} novo{count === 1 ? '' : 's'}
          </div>
          <div className="equip-idle-cluster__sub">aguardando linha de base</div>
        </div>
        <span className="equip-idle-cluster__cta">
          <span className="equip-idle-cluster__cta-text">Ver todos</span>
          <span className="equip-idle-cluster__cta-caret" aria-hidden="true">
            ▾
          </span>
        </span>
      </button>
      <div className="equip-idle-cluster__cards" role="list">
        {cards.map((card) => (
          <EquipmentCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

export function EquipamentosListPage({ viewModel }) {
  const safeViewModel = viewModel || {};
  const cards = asArray(safeViewModel.cards);
  const idleCards = asArray(safeViewModel.idleCards);
  const activeCards = asArray(safeViewModel.activeCards);
  const renderedCards = safeViewModel.clusterActive ? activeCards : cards;

  return (
    <div className="equip-list-react" data-testid="equipamentos-list">
      {cards.length ? (
        <>
          <h2 className="section-title" style={{ margin: '8px 0 10px' }}>
            {safeViewModel.listTitle || 'Todos os equipamentos'}
          </h2>
          <QuickMoveBanner quickMove={safeViewModel.quickMove} total={cards.length} />
          {safeViewModel.clusterActive ? <IdleCluster cards={idleCards} /> : null}
          {renderedCards.map((card) => (
            <EquipmentCard key={card.id} card={card} />
          ))}
        </>
      ) : (
        <EmptyState emptyState={safeViewModel.emptyState} />
      )}
    </div>
  );
}
