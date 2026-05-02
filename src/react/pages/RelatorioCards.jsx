import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_VIEW_MODES,
} from '../../ui/viewModels/relatorioContracts.js';

const DEFAULT_CARDS = Object.freeze({
  today: '',
  viewMode: RELATORIO_VIEW_MODES.compact,
  isEmpty: true,
  showCorretivasBanner: false,
  corretivasBanner: null,
  proximasAcoes: [],
  records: [],
});

const COPY = Object.freeze({
  emptyAria: 'Sem dados para relatório',
  emptyTitle: 'Sem registros no período selecionado',
  emptyDesc: 'Registre um serviço e veja seu relatório profissional pronto para envio em segundos.',
  emptyBrand: 'CoolTrack Pro · Relatório de Serviço',
  technician: 'Técnico',
  maintenancePreview: 'Manutenção Prev.',
  service: 'Serviço',
  done: 'Concluído',
  inspection: 'Inspeção elétrica',
  noNote: 'Sem observação',
  drainCheck: 'Verificação dreno',
  emptyCta: 'Registrar serviço para gerar relatório',
  previewAria: 'Preview de relatório',
  periodSuffix: 'no período',
  preventiveHint:
    'Volume alto de corretivas pode indicar oportunidade de reforçar o plano preventivo.',
  nextActionsTitle: 'Próximas ações recomendadas',
  signatureOtherDevice:
    'Assinatura coletada em outro dispositivo — armazenada localmente por padrão',
  noSignatureTitle: 'Cliente não assinou este registro',
  signatureOtherDeviceLabel: 'Assinatura em outro dispositivo',
  noSignatureLabel: 'Sem assinatura',
  signatureAlt: 'Assinatura registrada',
  serviceTotal: 'Total do serviço',
  equipmentSpecs: 'Especificações do equipamento',
  partsMaterials: 'Peças / Materiais',
  costs: 'Custos',
  parts: 'Peças',
  labor: 'Mão de obra',
  nextMaintenance: 'Próxima manutenção',
  notes: 'Observações',
});

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

function getSafeSignatureUrl(value) {
  const url = text(value).trim();
  if (/^data:image\/(?:png|jpe?g|gif|webp|bmp|avif);base64,/i.test(url)) return url;
  return '';
}

function Icon({ name, size = 14 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.6',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'shieldCheck':
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'droplets':
      return (
        <svg {...common}>
          <path d="M8 4c1.2 2.5 4 6 4 9a4 4 0 1 1-8 0c0-3 2.8-6.5 4-9z" />
          <path d="M16 10c.9 1.9 3 4.6 3 7a3 3 0 1 1-6 0c0-2.4 2.1-5.1 3-7z" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...common}>
          <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
        </svg>
      );
    case 'wrench':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3z" />
        </svg>
      );
    case 'flask':
      return (
        <svg {...common}>
          <path d="M10 3h4" />
          <path d="M11 3v6l-5 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-5-9V3" />
          <path d="M7 14h10" />
        </svg>
      );
    case 'calendarClock':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="14" height="14" rx="2" />
          <path d="M3 9h14M8 3v4M14 3v4" />
          <circle cx="18" cy="18" r="4" />
          <path d="M18 16.5V18l1 1" />
        </svg>
      );
    case 'chevronDown':
      return (
        <svg {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case 'arrowRight':
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common} width={size} height={size}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'edit2':
      return (
        <svg {...common}>
          <path d="M14 4l6 6-12 12H2v-6L14 4z" />
        </svg>
      );
    case 'snowflake':
      return (
        <svg {...common}>
          <path d="M12 2v20M2 12h20" />
          <path d="M5 5l14 14M19 5L5 19" />
          <path d="M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2M5 12l-2-2M5 12l-2 2M19 12l2-2M19 12l2 2" />
        </svg>
      );
    case 'tool':
    default:
      return (
        <svg {...common}>
          <path d="M20 7a4 4 0 0 1-5 5l-7 7-3-3 7-7a4 4 0 0 1 5-5l-2.5 2.5 1.5 1.5L19 8l1-1z" />
        </svg>
      );
  }
}

function EmptyState({ today }) {
  return (
    <section className="rel-empty" aria-label={COPY.emptyAria}>
      <div className="rel-empty__icon">
        <Icon name="snowflake" size={32} />
      </div>
      <h3 className="rel-empty__title">{COPY.emptyTitle}</h3>
      <p className="rel-empty__desc">{COPY.emptyDesc}</p>
      <div className="rel-empty__preview" role="presentation">
        <div className="rel-empty__preview-brand">
          <span className="rel-empty__preview-flake">
            <Icon name="snowflake" size={14} />
          </span>
          <span>{COPY.emptyBrand}</span>
        </div>
        <div className="rel-empty__preview-meta">
          <div>
            <span>{COPY.technician}</span>
            <strong>Seu nome</strong>
          </div>
          <div>
            <span>Data</span>
            <strong>{text(today)}</strong>
          </div>
          <div>
            <span>Equipamento</span>
            <strong>Split Loja Centro</strong>
          </div>
          <div>
            <span>Tipo</span>
            <strong>{COPY.maintenancePreview}</strong>
          </div>
        </div>
        <table className="rel-empty__preview-table" aria-label={COPY.previewAria}>
          <thead>
            <tr>
              <th>{COPY.service}</th>
              <th>Status</th>
              <th>Obs.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Limpeza de filtros</td>
              <td>{COPY.done}</td>
              <td>Fluxo ok</td>
            </tr>
            <tr>
              <td>{COPY.inspection}</td>
              <td>{COPY.done}</td>
              <td>{COPY.noNote}</td>
            </tr>
            <tr>
              <td>{COPY.drainCheck}</td>
              <td>{COPY.done}</td>
              <td>{COPY.noNote}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" className="rel-empty__cta" data-nav={RELATORIO_NAV_TARGETS.registro}>
        {COPY.emptyCta} <Icon name="arrowRight" size={14} />
      </button>
    </section>
  );
}

function CorretivasBanner({ banner }) {
  if (!banner) return null;
  const count = Number(banner.count) || 0;
  const total = Number(banner.total) || 0;
  const pct = Number.isFinite(Number(banner.pct))
    ? Number(banner.pct)
    : total > 0
      ? Math.round((count / total) * 100)
      : 0;

  return (
    <section className="rel-corretivas-banner" role="status" aria-live="polite">
      <span className="rel-corretivas-banner__icon" aria-hidden="true">
        <Icon name="wrench" size={18} />
      </span>
      <div className="rel-corretivas-banner__text">
        <strong>
          {count} {count === 1 ? 'corretiva' : 'corretivas'} {COPY.periodSuffix} ({pct}%)
        </strong>
        <span>{COPY.preventiveHint}</span>
      </div>
    </section>
  );
}

function ProximasAcoes({ items }) {
  const list = asArray(items);
  if (!list.length) return null;

  return (
    <section className="rel-proximas" aria-labelledby="rel-proximas-title">
      <header className="rel-proximas__head">
        <span className="rel-proximas__icon" aria-hidden="true">
          <Icon name="calendarClock" size={14} />
        </span>
        <h3 id="rel-proximas-title" className="rel-proximas__title">
          {COPY.nextActionsTitle}
        </h3>
        <span className="rel-proximas__count" aria-hidden="true">
          {list.length}
        </span>
      </header>
      <ul className="rel-proximas__list" role="list">
        {list.map((item, index) => (
          <li className="rel-proximas__item" key={`${text(item?.equipNome)}-${index}`}>
            <span className="rel-proximas__equip" title={text(item?.equipNome)}>
              {text(item?.equipNome)}
            </span>
            <span className="rel-proximas__date">{text(item?.dateText)}</span>
            <span
              className={classNames(
                'rel-proximas__label',
                `rel-proximas__label--${text(item?.tone, 'warn')}`,
              )}
            >
              {text(item?.label)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SignatureThumb({ signature }) {
  const data = signature || {};
  if (data.state !== 'available') {
    if (data.state === 'unavailable') {
      return (
        <span className="rel-sigthumb rel-sigthumb--unavailable" title={COPY.signatureOtherDevice}>
          <Icon name="edit2" size={12} /> {COPY.signatureOtherDeviceLabel}
        </span>
      );
    }

    return (
      <span className="rel-sigthumb rel-sigthumb--none" title={COPY.noSignatureTitle}>
        <Icon name="edit2" size={12} /> {COPY.noSignatureLabel}
      </span>
    );
  }

  const safeUrl = getSafeSignatureUrl(data.dataUrl);
  if (!safeUrl) {
    return (
      <span className="rel-sigthumb rel-sigthumb--unavailable" title={COPY.signatureOtherDevice}>
        <Icon name="edit2" size={12} /> {COPY.signatureOtherDeviceLabel}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="rel-sigthumb rel-sigthumb--btn"
      data-action={RELATORIO_ACTIONS.viewSignature}
      data-id={text(data.recordId)}
      aria-label={`Ver assinatura de ${text(data.clienteNome, 'cliente')} em tamanho grande`}
    >
      <img src={safeUrl} alt={COPY.signatureAlt} />
    </button>
  );
}

function EquipmentSpecs({ specs }) {
  return (
    <div className="rel-record__specs">
      {asArray(specs).map((spec, index) => (
        <div className="rel-spec" key={`${text(spec?.label)}-${index}`}>
          <div className="rel-spec__label">{text(spec?.label)}</div>
          <div className={classNames('rel-spec__value', spec?.mono && 'rel-spec__value--mono')}>
            {text(spec?.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecordCard({ record }) {
  const item = record || {};
  const expanded = Boolean(item.expanded);
  const detailsId = `rec-${text(item.id)}-details`;
  const titleId = `rec-${text(item.id)}-title`;
  const cost = item.cost || null;
  const isCostZero = !cost;

  return (
    <article
      className={classNames('rel-record', expanded && 'is-expanded')}
      data-id={text(item.id)}
      aria-labelledby={titleId}
    >
      <div className="rel-record__head">
        <span
          className={classNames('rel-tipo-icon', `rel-tipo-icon--${text(item.tipoTone, 'muted')}`)}
        >
          <Icon name={text(item.tipoIcon, 'tool')} size={14} />
        </span>
        <div id={titleId} className="rel-record__title">
          {text(item.title, 'Outro')}
        </div>
        <span
          className={classNames('rel-status', `rel-status--${text(item.statusTone, 'ok')}`)}
          aria-label={`Status: ${text(item.statusLabel, COPY.done)}`}
        >
          {text(item.statusLabel, COPY.done)}
        </span>
      </div>
      <div className="rel-record__meta">
        <span>{text(item.dateText)}</span>
        <span className="rel-record__sep">{'·'}</span>
        <span>{text(item.relativeText)}</span>
      </div>

      <div className="rel-record__divider" role="presentation"></div>

      <div className={classNames('rel-record__body', isCostZero && 'is-cost-zero')}>
        <div className="rel-record__summary">
          <div className="rel-record__summary-line">
            {!item.singleEquipFilter ? (
              <>
                <span className="rel-record__equip-name">{text(item.equipName, '-')}</span>
                <span className="rel-record__sep">{'·'}</span>
                <span className="rel-record__equip-tag">{text(item.equipTag, '-')}</span>
                <span className="rel-record__sep">{'·'}</span>
              </>
            ) : null}
            <span className="rel-record__tech">
              <span className="rel-record__tech-ic">
                <Icon name="user" size={12} />
              </span>
              {text(item.technician, '-')}
            </span>
          </div>
          <div className="rel-record__signature">
            <SignatureThumb signature={item.signature} />
          </div>
        </div>
        {cost ? (
          <div className="rel-record__cost">
            <div className="rel-record__cost-value">{text(cost.totalText)}</div>
            <div className="rel-record__cost-label">{COPY.serviceTotal}</div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="rel-record__toggle"
        data-rel-action={RELATORIO_ACTIONS.toggleCard}
        data-id={text(item.id)}
        aria-expanded={String(expanded)}
        aria-controls={detailsId}
      >
        <span>{expanded ? 'Ocultar detalhes' : 'Ver detalhes'}</span>
        <span className="rel-record__toggle-chev" aria-hidden="true">
          <Icon name="chevronDown" size={12} />
        </span>
      </button>

      <div id={detailsId} className="rel-record__details" hidden={!expanded}>
        <section className="rel-record__section">
          <div className="rel-record__section-title">{COPY.equipmentSpecs}</div>
          <EquipmentSpecs specs={item.equipmentSpecs} />
        </section>

        {item.pecas ? (
          <section className="rel-record__section">
            <div className="rel-record__section-title">{COPY.partsMaterials}</div>
            <div className="rel-record__pecas">{text(item.pecas)}</div>
          </section>
        ) : null}

        {cost ? (
          <section className="rel-record__section">
            <div className="rel-record__section-title">{COPY.costs}</div>
            <div className="rel-record__cost-breakdown">
              <span className="rel-cost-row__label">{COPY.parts}</span>
              <span className="rel-cost-row__value">{text(cost.partsText)}</span>
              <span className="rel-cost-row__label">{COPY.labor}</span>
              <span className="rel-cost-row__value">{text(cost.laborText)}</span>
              <span className="rel-cost-row__rule" aria-hidden="true"></span>
              <span className="rel-cost-row__label rel-cost-row__label--total">Total</span>
              <span className="rel-cost-row__value rel-cost-row__value--total">
                {text(cost.totalText)}
              </span>
            </div>
          </section>
        ) : null}

        {item.proxima ? (
          <section className="rel-record__section">
            <div className="rel-record__section-title">{COPY.nextMaintenance}</div>
            <div className="rel-record__prox">
              <span className="rel-record__prox-date">{text(item.proxima.dateText)}</span>
              <span
                className={classNames(
                  'rel-record__prox-badge',
                  `rel-record__prox-badge--${text(item.proxima.tone, 'default')}`,
                )}
              >
                {text(item.proxima.label)}
              </span>
            </div>
          </section>
        ) : null}

        {item.obs ? (
          <section className="rel-record__section">
            <div className="rel-record__section-title">{COPY.notes}</div>
            <div className="rel-record__obs">{text(item.obs)}</div>
          </section>
        ) : null}
      </div>
    </article>
  );
}

export function RelatorioCards({ cards = DEFAULT_CARDS }) {
  const data = { ...DEFAULT_CARDS, ...(cards || {}) };
  const records = asArray(data.records);

  if (data.isEmpty || records.length === 0) {
    return <EmptyState today={data.today} />;
  }

  return (
    <>
      {data.showCorretivasBanner ? <CorretivasBanner banner={data.corretivasBanner} /> : null}
      <ProximasAcoes items={data.proximasAcoes} />
      {records.map((record, index) => (
        <RecordCard record={record} key={text(record?.id, `record-${index}`)} />
      ))}
    </>
  );
}
