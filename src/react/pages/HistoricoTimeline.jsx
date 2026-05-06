import {
  HISTORICO_ACTIONS,
  HISTORICO_NAV_TARGETS,
} from '../../ui/viewModels/historicoContracts.js';
import { CardActions } from '../components/CardActions.jsx';

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

function safeMediaUrl(value) {
  const url = text(value).trim();
  if (!url) return '';
  if (/^data:image\/(?:png|jpe?g|gif|webp|bmp|avif);base64,/i.test(url)) return url;
  if (/^(https?:|blob:)/i.test(url)) return url;
  if (/^(\/(?!\/)|\.\/|\.\.\/)/.test(url)) return url;
  return '';
}

function SvgIcon({ children, width = 11, height = 11, strokeWidth = 1.75 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CalendarIcon({ width = 11, height = 11 }) {
  return (
    <SvgIcon width={width} height={height}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
    </SvgIcon>
  );
}

function UserIcon() {
  return (
    <SvgIcon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </SvgIcon>
  );
}

function BoxIcon() {
  return (
    <SvgIcon>
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </SvgIcon>
  );
}

function SignatureIcon() {
  return (
    <SvgIcon width={12} height={12}>
      <path d="m12 19 7-7 3 3-7 7-3-3Z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18Z" />
      <path d="m2 2 7.5 7.5" />
      <circle cx="11" cy="11" r="2" />
    </SvgIcon>
  );
}

function KebabIcon() {
  return (
    <SvgIcon width={16} height={16} strokeWidth={2}>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </SvgIcon>
  );
}

function EditIcon() {
  return (
    <SvgIcon width={14} height={14}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </SvgIcon>
  );
}

function DeleteIcon() {
  return (
    <SvgIcon width={14} height={14}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </SvgIcon>
  );
}

function MetaIcon({ icon }) {
  if (icon === 'user') return <UserIcon />;
  if (icon === 'box') return <BoxIcon />;
  if (icon === 'calendar') return <CalendarIcon />;
  return null;
}

function EmptyState({ emptyState }) {
  if (!emptyState) return null;

  const cta = emptyState.cta;
  const buttonClassName = cta
    ? classNames(
        'btn',
        cta.tone === 'outline' ? 'btn--outline' : 'btn--primary',
        cta.size === 'sm' && 'btn--sm',
        cta.autoWidth && 'btn--auto',
        cta.centered && 'btn--centered',
        emptyState.variant === 'engaging' && 'engaging-empty-state__cta',
      )
    : '';

  const button = cta ? (
    <button
      type="button"
      className={buttonClassName}
      data-action={cta.action || undefined}
      data-hist-action={cta.histAction || undefined}
      data-id={cta.id || undefined}
      data-nav={cta.nav || undefined}
      data-testid={cta.testid || undefined}
    >
      {text(cta.label, 'Continuar')}
    </button>
  ) : null;

  if (emptyState.variant === 'engaging') {
    return (
      <section className="engaging-empty-state" aria-label={emptyState.ariaLabel || undefined}>
        <div className="engaging-empty-state__icon">{text(emptyState.icon, '-')}</div>
        <h3 className="engaging-empty-state__title">{text(emptyState.title)}</h3>
        {emptyState.description ? (
          <p className="engaging-empty-state__description">{text(emptyState.description)}</p>
        ) : null}
        {button}
        {emptyState.microcopy ? (
          <div className="engaging-empty-state__microcopy">{text(emptyState.microcopy)}</div>
        ) : null}
      </section>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-state__icon">{text(emptyState.icon, '-')}</div>
      <div className="empty-state__title">{text(emptyState.title)}</div>
      {emptyState.description ? (
        <div className="empty-state__sub">{text(emptyState.description)}</div>
      ) : null}
      {button ? <div className="empty-state__cta">{button}</div> : null}
    </div>
  );
}

function OperationSummary({ summary }) {
  const model = summary || { totalServicosHoje: 0, totalEquipHoje: 0 };
  const totalServicosHoje = Number(model.totalServicosHoje) || 0;
  const totalEquipHoje = Number(model.totalEquipHoje) || 0;

  return (
    <section className="hist-op-summary" aria-label="Resumo de hoje">
      <div className="hist-op-summary__head">Hoje</div>
      {totalServicosHoje > 0 ? (
        <div className="hist-op-summary__kpis">
          <div className="hist-op-summary__kpi">
            <strong>{totalServicosHoje}</strong>
            <span>serviços realizados</span>
          </div>
          <div className="hist-op-summary__kpi">
            <strong>{totalEquipHoje}</strong>
            <span>equipamentos atendidos</span>
          </div>
        </div>
      ) : (
        <div className="hist-op-summary__empty">
          <strong>Nada registrado ainda hoje.</strong>
          <p>
            Toque no <span className="hist-op-summary__empty-fab">+</span> da barra pra começar.
          </p>
        </div>
      )}
    </section>
  );
}

function AttentionSection({ items }) {
  const rows = asArray(items);
  if (!rows.length) return null;

  return (
    <section className="hist-attention" aria-label="Itens em atenção">
      <div className="hist-attention__head">Atenção</div>
      {rows.map((item, index) => (
        <article
          key={item.id || `${item.title}-${index}`}
          className={classNames(
            'hist-attention__item',
            item.tone === 'danger' && 'hist-attention__item--danger',
          )}
        >
          <div className="hist-attention__content">
            <strong>{text(item.title, 'Item')}</strong>
            <span>{text(item.reason, 'Exige atenção')}</span>
          </div>
          <button
            type="button"
            className="hist-attention__cta"
            data-hist-action={item.equipId ? HISTORICO_ACTIONS.filterEquip : undefined}
            data-equip-id={item.equipId || undefined}
            data-nav={item.equipId ? undefined : HISTORICO_NAV_TARGETS.equipamentos}
          >
            {text(item.ctaLabel, 'Resolver')}
          </button>
        </article>
      ))}
    </section>
  );
}

function DayGroupHeader({ group }) {
  return (
    <div className="hist-day-group" role="presentation">
      <div className="hist-day-group__label">
        <CalendarIcon />
        <span>{text(group.label)}</span>
        <span className="hist-day-group__count">{text(group.countLabel)}</span>
      </div>
    </div>
  );
}

function HeadPills({ pills }) {
  return asArray(pills).map((pill, index) => (
    <span
      key={pill.id || `${pill.label}-${index}`}
      className={classNames('hist-pill', `hist-pill--${text(pill.color, 'cyan')}`)}
      title={pill.title || undefined}
    >
      {text(pill.label)}
    </span>
  ));
}

function MetaChunk({ chunk }) {
  return (
    <span className={classNames('meta-chunk', chunk.className)} title={chunk.title || undefined}>
      <MetaIcon icon={chunk.icon} />
      {chunk.prefix ? <>{text(chunk.prefix)}</> : null}
      {chunk.highlight ? (
        <span className={chunk.highlightClassName || undefined}>{text(chunk.highlight)}</span>
      ) : (
        <span className={chunk.textClassName || undefined}>{text(chunk.text)}</span>
      )}
      {chunk.details ? <span className="meta-details"> {text(chunk.details)}</span> : null}
    </span>
  );
}

function TimelineMeta({ chunks }) {
  const meta = asArray(chunks);
  if (!meta.length) return null;

  return (
    <div className="timeline__item__meta">
      {meta.map((chunk, index) => (
        <span key={chunk.id || `${chunk.text}-${index}`}>
          {index > 0 ? (
            <span className="meta-sep" aria-hidden="true">
              {'·'}
            </span>
          ) : null}
          <MetaChunk chunk={chunk} />
        </span>
      ))}
    </div>
  );
}

function PhotoStrip({ item }) {
  const urls = asArray(item.photoUrls).map(safeMediaUrl).filter(Boolean);
  if (!urls.length) return null;

  return (
    <div className="timeline__item__photos" aria-label="Fotos do serviço">
      {urls.slice(0, 3).map((url, index) => (
        <button
          key={`${item.id}-photo-${index}`}
          type="button"
          className="timeline__item__photos-thumb"
          data-hist-action={HISTORICO_ACTIONS.openPhoto}
          data-photo-url={url}
          aria-label={`Abrir foto ${index + 1}`}
        >
          <img src={url} alt={`Foto ${index + 1} do serviço`} loading="lazy" />
        </button>
      ))}
      {Number(item.extraPhotoCount) > 0 ? (
        <span
          className="timeline__item__photos-more"
          aria-label={`Mais ${item.extraPhotoCount} fotos`}
        >
          +{Number(item.extraPhotoCount)}
        </span>
      ) : null}
    </div>
  );
}

function SignaturePreview({ item }) {
  const url = safeMediaUrl(item.signature?.url);
  if (!url) return null;

  return (
    <button
      type="button"
      className="hist-signature-preview"
      data-hist-action={HISTORICO_ACTIONS.viewSignature}
      data-id={item.id}
      aria-label={item.signature?.ariaLabel || 'Ver assinatura do cliente em tamanho grande'}
    >
      <span className="hist-signature-preview__canvas">
        <img src={url} alt={item.signature?.alt || 'Assinatura registrada pelo cliente'} />
      </span>
      <span className="hist-signature-preview__label">
        <span className="hist-signature-preview__label-ic" aria-hidden="true">
          <SignatureIcon />
        </span>
        <span>
          <b>Assinado pelo cliente</b>
        </span>
        <span className="hist-signature-preview__zoom" aria-hidden="true">
          toque pra ampliar
        </span>
      </span>
    </button>
  );
}

function TimelineItem({ item }) {
  const status = text(item.status, 'ok');

  return (
    <article
      className={classNames(
        'timeline__item',
        item.isLatest && 'timeline__item--latest',
        (status === 'warn' || status === 'danger') && `timeline__item--${status}`,
      )}
      role="listitem"
      data-reg-id={item.id}
    >
      <span
        className={classNames('timeline__dot', status !== 'ok' && `timeline__dot--${status}`)}
        aria-hidden="true"
      ></span>
      <div className="timeline__item__main">
        <div className="timeline__item__header">
          <span className="timeline__item__date">{text(item.headerDateLabel)}</span>
          <div className="timeline__item__header-spacer"></div>
          <HeadPills pills={item.headPills} />
        </div>
        <h3 className="timeline__item__service">{text(item.serviceTitle, 'Servico')}</h3>
        <div className="timeline__item__equipment">
          <span>{text(item.equipmentName, '—')}</span>
          {item.setorName || item.equipTag ? (
            <span className="timeline__item__equipment-sep" aria-hidden="true">
              {'·'}
            </span>
          ) : null}
          {item.setorName ? (
            <span className="timeline__item__equipment-tag">{text(item.setorName)}</span>
          ) : null}
          {item.setorTag ? (
            <span className="hist-pill hist-pill--neutral">{text(item.setorTag)}</span>
          ) : null}
        </div>
        {item.context ? <div className="timeline__item__context">{text(item.context)}</div> : null}
        {item.obs ? <p className="timeline__item__obs">{text(item.obs)}</p> : null}
        <TimelineMeta chunks={item.meta} />
        <PhotoStrip item={item} />
        <SignaturePreview item={item} />
        {item.showFilterEquip ? (
          <button
            type="button"
            className="timeline__item__focus-equip"
            data-hist-action={HISTORICO_ACTIONS.filterEquip}
            data-equip-id={item.equipId}
            aria-label="Ver todos os serviços deste equipamento"
          >
            Ver tudo deste equipamento {'→'}
          </button>
        ) : null}
        <CardActions registroId={item.id} />
      </div>
      <div className="hist-item-actions">
        <div className="hist-item-actions__menu" role="menu" hidden>
          <button
            type="button"
            role="menuitem"
            className="hist-item-actions__menuitem"
            data-action={HISTORICO_ACTIONS.editReg}
            data-id={item.id}
            title="Editar"
            aria-label="Editar registro"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            role="menuitem"
            className="hist-item-actions__menuitem hist-item-actions__menuitem--danger"
            data-action={HISTORICO_ACTIONS.deleteReg}
            data-id={item.id}
            title="Excluir"
            aria-label="Excluir registro"
          >
            <DeleteIcon />
          </button>
        </div>
        <button
          type="button"
          className="hist-item-actions__kebab"
          data-hist-action={HISTORICO_ACTIONS.toggleCardMenu}
          data-id={item.id}
          aria-label="Acoes do registro"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <KebabIcon />
        </button>
      </div>
    </article>
  );
}

function TimelineList({ groups }) {
  const safeGroups = asArray(groups);
  if (!safeGroups.length) return null;

  return (
    <div className="timeline">
      {safeGroups.map((group) => (
        <div className="timeline__group" key={group.id || group.label}>
          <DayGroupHeader group={group} />
          {asArray(group.items).map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function HistoricoTimeline({ viewModel = {} }) {
  const groups = asArray(viewModel.groups);

  return (
    <>
      <OperationSummary summary={viewModel.operationSummary} />
      <AttentionSection items={viewModel.attentionItems} />
      {groups.length ? (
        <TimelineList groups={groups} />
      ) : (
        <EmptyState emptyState={viewModel.emptyState} />
      )}
    </>
  );
}
