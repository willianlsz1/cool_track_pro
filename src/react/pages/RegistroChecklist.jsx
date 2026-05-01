import { REGISTRO_ACTIONS } from '../../ui/viewModels/registroContracts.js';

const STATUS_OPTIONS = Object.freeze([
  { status: 'ok', label: '✓', title: 'Conforme' },
  { status: 'fail', label: '✗', title: 'Não conforme' },
  { status: 'na', label: '⊘', title: 'Não aplicável' },
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function resolveAction(actions, key, fallback) {
  return text(actions?.[key]?.action, fallback);
}

function normalizeStatus(value) {
  return STATUS_OPTIONS.some((option) => option.status === value) ? value : null;
}

function ChecklistStatusButtons({ item, actions }) {
  const activeStatus = normalizeStatus(item?.status);
  const itemId = text(item?.id);
  const action = resolveAction(actions, 'checklistSet', REGISTRO_ACTIONS.checklistSet);

  return (
    <div className="r-checklist__statuses" role="group" aria-label={`Status: ${text(item?.label)}`}>
      {STATUS_OPTIONS.map((option) => {
        const isActive = activeStatus === option.status;
        return (
          <button
            type="button"
            className={classNames(
              'r-checklist__status',
              `r-checklist__status--${option.status}`,
              isActive && 'is-active',
            )}
            data-action={action}
            data-item={itemId}
            data-item-id={itemId}
            data-status={option.status}
            aria-pressed={String(isActive)}
            title={option.title}
            key={option.status}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ChecklistMeasure({ item, actions }) {
  if (!item?.measurable) return null;

  const unit = text(item?.unit);
  const value =
    item?.measureValue === null || item?.measureValue === undefined ? '' : item.measureValue;
  const action = resolveAction(actions, 'checklistMeasure', REGISTRO_ACTIONS.checklistMeasure);

  return (
    <label className="r-checklist__measure">
      <input
        type="number"
        step="any"
        inputMode="decimal"
        className="r-checklist__measure-input"
        data-action={action}
        data-item={text(item?.id)}
        data-item-id={text(item?.id)}
        data-unit={unit}
        defaultValue={value}
        placeholder="valor"
        aria-label={`Medição em ${unit}`}
      />
      <span className="r-checklist__measure-unit" aria-hidden="true">
        {unit}
      </span>
    </label>
  );
}

function ChecklistRow({ item, actions }) {
  const itemId = text(item?.id);
  const label = text(item?.label);
  const obsAction = resolveAction(actions, 'checklistObs', REGISTRO_ACTIONS.checklistObs);

  return (
    <div
      className={classNames('r-checklist__row', item?.measurable && 'r-checklist__row--measurable')}
      data-item-id={itemId}
    >
      <div className="r-checklist__label">
        {label}
        {item?.mandatory ? (
          <span className="r-checklist__req" title="Obrigatório p/ PMOC formal">
            *
          </span>
        ) : null}
      </div>
      <ChecklistStatusButtons item={item} actions={actions} />
      <ChecklistMeasure item={item} actions={actions} />
      <textarea
        className="r-checklist__obs"
        data-action={obsAction}
        data-item={itemId}
        data-item-id={itemId}
        rows="1"
        maxLength="200"
        placeholder="Observação (opcional)"
        defaultValue={text(item?.obs)}
      ></textarea>
    </div>
  );
}

function ChecklistGroup({ group, actions }) {
  return (
    <div className="r-checklist__group">
      <div className="r-checklist__group-label">{text(group?.label)}</div>
      {asArray(group?.items).map((item) => (
        <ChecklistRow item={item} actions={actions} key={text(item?.id)} />
      ))}
    </div>
  );
}

export function RegistroChecklist({ checklist = {}, actions = {} }) {
  return (
    <>
      <div className="r-checklist__intro">
        <strong>{text(checklist?.label)}</strong>
        <span className="r-checklist__legend">
          <span className="r-checklist__legend-item">✓ conforme</span>
          <span className="r-checklist__legend-item">✗ não-conforme</span>
          <span className="r-checklist__legend-item">⊘ N/A</span>
        </span>
      </div>
      {asArray(checklist?.groups).map((group) => (
        <ChecklistGroup group={group} actions={actions} key={text(group?.label)} />
      ))}
    </>
  );
}
