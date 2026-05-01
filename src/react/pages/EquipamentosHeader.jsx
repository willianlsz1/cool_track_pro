import { createPortal } from 'react-dom';

import { EQUIPAMENTOS_ACTIONS } from '../../ui/viewModels/equipamentosContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function Hero({ hero }) {
  const items = asArray(hero?.items);

  return (
    <>
      <span className="equip-hero__orb equip-hero__orb--tl" aria-hidden="true"></span>
      <span className="equip-hero__orb equip-hero__orb--br" aria-hidden="true"></span>
      <div className="equip-hero__head">
        <h1 className="equip-hero__title" id="equip-hero-title">
          {hero?.title || 'Atenção agora'}
        </h1>
        <p className="equip-hero__sub" id="equip-hero-sub">
          {hero?.subtitle || ''}
        </p>
        <div className="equip-hero__cta" id="equip-hero-sem-setor-cta" hidden></div>
      </div>
      <div className="equip-hero__kpis" id="equip-hero-kpis" role="list">
        {items.map((item) => (
          <article className="equip-hero__kpi" key={item.id || item.name}>
            <strong>{item.name || 'Equipamento'}</strong>
            <button
              type="button"
              className="equip-hero__cta-btn equip-hero__cta-btn--action"
              data-action={EQUIPAMENTOS_ACTIONS.goRegisterEquip}
              data-id={item.id || undefined}
            >
              Registrar serviço
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

function Filters({ filters }) {
  const chips = asArray(filters?.chips);

  return (
    <>
      {chips.map((chip) => (
        <button
          type="button"
          className={classNames(
            'equip-filter',
            chip.active && 'equip-filter--active',
            chip.empty && 'equip-filter--empty',
            chip.count > 0 && chip.id !== 'todos' && chip.tone && `equip-filter--${chip.tone}`,
          )}
          data-action={EQUIPAMENTOS_ACTIONS.quickFilter}
          data-id={chip.id || undefined}
          aria-pressed={chip.active ? 'true' : 'false'}
          aria-label={`${chip.label || ''}: ${chip.count || 0}`}
          key={chip.id || chip.label}
        >
          <span className="equip-filter__label">{chip.label || ''}</span>
          <span className="equip-filter__count" aria-hidden="true">
            {chip.count || 0}
          </span>
        </button>
      ))}
    </>
  );
}

function ContextChip({ context }) {
  if (!context?.visible) return null;

  return (
    <div className="equip-breadcrumb">
      <span className="equip-breadcrumb__item equip-breadcrumb__item--current">
        {context.label || ''}
      </span>
      <button
        type="button"
        className="equip-breadcrumb__item"
        data-action={EQUIPAMENTOS_ACTIONS.clearClienteFilter}
      >
        Limpar filtro
      </button>
    </div>
  );
}

export function EquipamentosHeader({ viewModel, filtersRoot = null, contextRoot = null }) {
  const safeViewModel = viewModel || {};

  return (
    <>
      <Hero hero={safeViewModel.hero || {}} />
      {filtersRoot
        ? createPortal(<Filters filters={safeViewModel.filters || {}} />, filtersRoot)
        : null}
      {contextRoot
        ? createPortal(<ContextChip context={safeViewModel.context || {}} />, contextRoot)
        : null}
    </>
  );
}
