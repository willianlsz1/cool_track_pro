function EmptyState({ emptyState }) {
  if (!emptyState) return null;
  const cta = emptyState.cta;
  const ctaClassName = [
    'btn',
    cta?.tone === 'outline' ? 'btn--outline' : 'btn--primary',
    'engaging-empty-state__cta',
  ].join(' ');

  return (
    <section className="engaging-empty-state" aria-label={emptyState.ariaLabel || undefined}>
      <div className="engaging-empty-state__icon">{emptyState.icon}</div>
      <h3 className="engaging-empty-state__title">{emptyState.title}</h3>
      {emptyState.description ? (
        <p className="engaging-empty-state__description">{emptyState.description}</p>
      ) : null}
      {cta ? (
        <button type="button" className={ctaClassName} data-nav={cta.nav || undefined}>
          {cta.label}
        </button>
      ) : null}
    </section>
  );
}

function ContextBanner({ banner }) {
  if (!banner) return null;

  return (
    <section className="alertas-context-banner" role="status" aria-live="polite">
      <span className="alertas-context-banner__icon" aria-hidden="true">
        {banner.icon}
      </span>
      <div className="alertas-context-banner__text">{banner.text}</div>
      <button type="button" className="alertas-context-banner__cta" data-action={banner.action}>
        {banner.ctaLabel}
      </button>
    </section>
  );
}

function AlertCard({ card }) {
  const className = ['alert-card', card.tone ? `alert-card--${card.tone}` : '']
    .filter(Boolean)
    .join(' ');
  const clienteAttrs =
    card.kind === 'cliente' ? { 'data-cliente-nome': card.clienteNome || '' } : {};

  return (
    <div
      className={className}
      data-action={card.action}
      data-id={card.dataId || ''}
      role="listitem"
      tabIndex={0}
      {...clienteAttrs}
    >
      <span className="alert-card__icon">{card.icon}</span>
      <div>
        <div className="alert-card__title">{card.title}</div>
        <div className="alert-card__sub">{card.subtitle}</div>
        <div className="alert-card__equip">{card.equipmentLabel}</div>
      </div>
    </div>
  );
}

export function AlertasPage({ viewModel }) {
  const safeViewModel = viewModel || {};
  const cards = Array.isArray(safeViewModel.cards) ? safeViewModel.cards : [];

  return (
    <div className="tw-w-full" data-react-alertas-page="true">
      <div className="section-title">Alertas e Anormalidades registradas</div>
      <div id="alertas-contextual">
        <ContextBanner banner={safeViewModel.contextBanner} />
      </div>
      <div id="lista-alertas" role="list">
        {cards.length ? (
          cards.map((card) => <AlertCard key={card.key} card={card} />)
        ) : (
          <EmptyState emptyState={safeViewModel.emptyState} />
        )}
      </div>
    </div>
  );
}
