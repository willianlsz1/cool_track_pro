import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../../viewModels/relatorioContracts.js';

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
  emptyAria: 'Sem dados para relatorio',
  emptyTitle: 'Sem registros no periodo selecionado',
  emptyDesc: 'Registre um servico e veja seu relatorio profissional pronto para envio em segundos.',
  emptyBrand: 'CoolTrack Pro - Relatorio de Servico',
  technician: 'Tecnico',
  maintenancePreview: 'Manutencao Prev.',
  service: 'Servico',
  done: 'Concluido',
  inspection: 'Inspecao eletrica',
  noNote: 'Sem observacao',
  drainCheck: 'Verificacao dreno',
  emptyCta: 'Registrar servico para gerar relatorio',
  previewAria: 'Preview de relatorio',
  periodSuffix: 'no periodo',
  preventiveHint:
    'Volume alto de corretivas pode indicar oportunidade de reforcar o plano preventivo.',
  nextActionsTitle: 'Proximas acoes recomendadas',
  signatureOtherDevice:
    'Assinatura coletada em outro dispositivo - armazenada localmente por padrao',
  noSignatureTitle: 'Cliente nao assinou este registro',
  signatureOtherDeviceLabel: 'Assinatura em outro dispositivo',
  noSignatureLabel: 'Sem assinatura',
  signatureAlt: 'Assinatura registrada',
  serviceTotal: 'Total do servico',
  equipmentSpecs: 'Especificacoes do equipamento',
  partsMaterials: 'Pecas / Materiais',
  costs: 'Custos',
  parts: 'Pecas',
  labor: 'Mao de obra',
  nextMaintenance: 'Proxima manutencao',
  pmocContext: 'PMOC/preventivo',
  notes: 'Observacoes',
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

function escapeHtml(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getSafeSignatureUrl(value) {
  const url = text(value).trim();
  if (/^data:image\/(?:png|jpe?g|gif|webp|bmp|avif);base64,/i.test(url)) return url;
  return '';
}

function iconHtml(name, size = 14) {
  const attrs = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  switch (name) {
    case 'shieldCheck':
      return `<svg ${attrs}><path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z"></path><path d="M9 12l2 2 4-4"></path></svg>`;
    case 'droplets':
      return `<svg ${attrs}><path d="M8 4c1.2 2.5 4 6 4 9a4 4 0 1 1-8 0c0-3 2.8-6.5 4-9z"></path><path d="M16 10c.9 1.9 3 4.6 3 7a3 3 0 1 1-6 0c0-2.4 2.1-5.1 3-7z"></path></svg>`;
    case 'zap':
      return `<svg ${attrs}><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"></path></svg>`;
    case 'wrench':
      return `<svg ${attrs}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3z"></path></svg>`;
    case 'flask':
      return `<svg ${attrs}><path d="M10 3h4"></path><path d="M11 3v6l-5 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-5-9V3"></path><path d="M7 14h10"></path></svg>`;
    case 'calendarClock':
      return `<svg ${attrs}><rect x="3" y="5" width="14" height="14" rx="2"></rect><path d="M3 9h14M8 3v4M14 3v4"></path><circle cx="18" cy="18" r="4"></circle><path d="M18 16.5V18l1 1"></path></svg>`;
    case 'chevronDown':
      return `<svg ${attrs}><path d="M6 9l6 6 6-6"></path></svg>`;
    case 'arrowRight':
      return `<svg ${attrs}><path d="M9 6l6 6-6 6"></path></svg>`;
    case 'user':
      return `<svg ${attrs}><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>`;
    case 'edit2':
      return `<svg ${attrs}><path d="M14 4l6 6-12 12H2v-6L14 4z"></path></svg>`;
    case 'snowflake':
      return `<svg ${attrs}><path d="M12 2v20M2 12h20"></path><path d="M5 5l14 14M19 5L5 19"></path><path d="M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2M5 12l-2-2M5 12l-2 2M19 12l2-2M19 12l2 2"></path></svg>`;
    case 'tool':
    default:
      return `<svg ${attrs}><path d="M20 7a4 4 0 0 1-5 5l-7 7-3-3 7-7a4 4 0 0 1 5-5l-2.5 2.5 1.5 1.5L19 8l1-1z"></path></svg>`;
  }
}

function downloadIconHtml() {
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12"></path><path d="M7 11l5 5 5-5"></path><path d="M4 20h16"></path></svg>';
}

function whatsAppIconHtml() {
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.768.967-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>';
}

function cardActionsHtml(registroId) {
  const id = text(registroId);
  if (!id) return '';
  return `
    <div class="card-actions" role="group" aria-label="Acoes deste servico">
      <button type="button" class="card-actions__btn card-actions__btn--pdf"
        data-action="export-pdf" data-registro-id="${escapeHtml(id)}"
        aria-label="Baixar PDF deste servico">
        <span class="card-actions__icon">${downloadIconHtml()}</span>
        <span>Baixar PDF</span>
      </button>
      <button type="button" class="card-actions__btn card-actions__btn--whatsapp"
        data-action="whatsapp-export" data-registro-id="${escapeHtml(id)}"
        aria-label="Enviar este servico pro cliente via WhatsApp">
        <span class="card-actions__icon">${whatsAppIconHtml()}</span>
        <span>Enviar pro cliente</span>
      </button>
    </div>
  `;
}

function emptyStateHtml(today) {
  return `
    <section class="rel-empty" aria-label="${COPY.emptyAria}">
      <div class="rel-empty__icon">${iconHtml('snowflake', 32)}</div>
      <h3 class="rel-empty__title">${COPY.emptyTitle}</h3>
      <p class="rel-empty__desc">${COPY.emptyDesc}</p>
      <div class="rel-empty__preview" role="presentation">
        <div class="rel-empty__preview-brand">
          <span class="rel-empty__preview-flake">${iconHtml('snowflake', 14)}</span>
          <span>${COPY.emptyBrand}</span>
        </div>
        <div class="rel-empty__preview-meta">
          <div><span>${COPY.technician}</span><strong>Seu nome</strong></div>
          <div><span>Data</span><strong>${escapeHtml(today)}</strong></div>
          <div><span>Equipamento</span><strong>Split Loja Centro</strong></div>
          <div><span>Tipo</span><strong>${COPY.maintenancePreview}</strong></div>
        </div>
        <table class="rel-empty__preview-table" aria-label="${COPY.previewAria}">
          <thead><tr><th>${COPY.service}</th><th>Status</th><th>Obs.</th></tr></thead>
          <tbody>
            <tr><td>Limpeza de filtros</td><td>${COPY.done}</td><td>Fluxo ok</td></tr>
            <tr><td>${COPY.inspection}</td><td>${COPY.done}</td><td>${COPY.noNote}</td></tr>
            <tr><td>${COPY.drainCheck}</td><td>${COPY.done}</td><td>${COPY.noNote}</td></tr>
          </tbody>
        </table>
      </div>
      <button type="button" class="rel-empty__cta" data-nav="${RELATORIO_NAV_TARGETS.registro}">
        ${COPY.emptyCta} ${iconHtml('arrowRight', 14)}
      </button>
    </section>
  `;
}

function corretivasBannerHtml(banner) {
  if (!banner) return '';
  const count = Number(banner.count) || 0;
  const total = Number(banner.total) || 0;
  const pct = Number.isFinite(Number(banner.pct))
    ? Number(banner.pct)
    : total > 0
      ? Math.round((count / total) * 100)
      : 0;

  return `
    <section class="rel-corretivas-banner" role="status" aria-live="polite">
      <span class="rel-corretivas-banner__icon" aria-hidden="true">${iconHtml('wrench', 18)}</span>
      <div class="rel-corretivas-banner__text">
        <strong>${count} ${count === 1 ? 'corretiva' : 'corretivas'} ${COPY.periodSuffix} (${pct}%)</strong>
        <span>${COPY.preventiveHint}</span>
      </div>
    </section>
  `;
}

function proximasAcoesHtml(items) {
  const list = asArray(items);
  if (!list.length) return '';

  return `
    <section class="rel-proximas" aria-labelledby="rel-proximas-title">
      <header class="rel-proximas__head">
        <span class="rel-proximas__icon" aria-hidden="true">${iconHtml('calendarClock', 14)}</span>
        <h3 id="rel-proximas-title" class="rel-proximas__title">${COPY.nextActionsTitle}</h3>
        <span class="rel-proximas__count" aria-hidden="true">${list.length}</span>
      </header>
      <ul class="rel-proximas__list" role="list">
        ${list
          .map(
            (item) => `
              <li class="rel-proximas__item">
                <span class="rel-proximas__equip" title="${escapeHtml(item?.equipNome)}">${escapeHtml(item?.equipNome)}</span>
                <span class="rel-proximas__date">${escapeHtml(item?.dateText)}</span>
                <span class="${classNames('rel-proximas__label', `rel-proximas__label--${text(item?.tone, 'warn')}`)}">${escapeHtml(item?.label)}</span>
              </li>
            `,
          )
          .join('')}
      </ul>
    </section>
  `;
}

function signatureThumbHtml(signature) {
  const data = signature || {};
  if (data.state !== 'available') {
    if (data.state === 'unavailable') {
      return `<span class="rel-sigthumb rel-sigthumb--unavailable" title="${COPY.signatureOtherDevice}">${iconHtml('edit2', 12)} ${COPY.signatureOtherDeviceLabel}</span>`;
    }
    return `<span class="rel-sigthumb rel-sigthumb--none" title="${COPY.noSignatureTitle}">${iconHtml('edit2', 12)} ${COPY.noSignatureLabel}</span>`;
  }

  const safeUrl = getSafeSignatureUrl(data.dataUrl);
  if (!safeUrl) {
    return `<span class="rel-sigthumb rel-sigthumb--unavailable" title="${COPY.signatureOtherDevice}">${iconHtml('edit2', 12)} ${COPY.signatureOtherDeviceLabel}</span>`;
  }

  return `
    <button type="button" class="rel-sigthumb rel-sigthumb--btn"
      data-action="${RELATORIO_ACTIONS.viewSignature}"
      data-id="${escapeHtml(data.recordId)}"
      aria-label="Ver assinatura de ${escapeHtml(text(data.clienteNome, 'cliente'))} em tamanho grande">
      <img src="${escapeHtml(safeUrl)}" alt="${COPY.signatureAlt}" />
    </button>
  `;
}

function equipmentSpecsHtml(specs) {
  return `
    <div class="rel-record__specs">
      ${asArray(specs)
        .map(
          (spec) => `
            <div class="rel-spec">
              <div class="rel-spec__label">${escapeHtml(spec?.label)}</div>
              <div class="${classNames('rel-spec__value', spec?.mono && 'rel-spec__value--mono')}">${escapeHtml(spec?.value)}</div>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function pmocContextHtml(context) {
  const data = context || {};
  if (!data.visible) return '';
  const badges = asArray(data.badges);
  const items = asArray(data.items);

  return `
    <section class="rel-record__section rel-record__pmoc">
      <div class="rel-record__section-title">${escapeHtml(data.title || COPY.pmocContext)}</div>
      ${data.description ? `<p class="rel-record__pmoc-desc">${escapeHtml(data.description)}</p>` : ''}
      ${
        badges.length
          ? `<div class="rel-record__pmoc-badges">${badges.map((badge) => `<span class="rel-record__pmoc-badge">${escapeHtml(badge)}</span>`).join('')}</div>`
          : ''
      }
      ${items.length ? equipmentSpecsHtml(items) : ''}
    </section>
  `;
}

function recordCardHtml(record) {
  const item = record || {};
  const id = text(item.id);
  const escapedId = escapeHtml(id);
  const expanded = Boolean(item.expanded);
  const detailsId = `rec-${id}-details`;
  const titleId = `rec-${id}-title`;
  const cost = item.cost || null;
  const isCostZero = !cost;

  return `
    <article class="${classNames('rel-record', expanded && 'is-expanded')}"
      data-id="${escapedId}" aria-labelledby="${escapeHtml(titleId)}">
      <div class="rel-record__head">
        <span class="${classNames('rel-tipo-icon', `rel-tipo-icon--${text(item.tipoTone, 'muted')}`)}">
          ${iconHtml(text(item.tipoIcon, 'tool'), 14)}
        </span>
        <div id="${escapeHtml(titleId)}" class="rel-record__title">${escapeHtml(text(item.title, 'Outro'))}</div>
        <span class="${classNames('rel-status', `rel-status--${text(item.statusTone, 'ok')}`)}"
          aria-label="Status: ${escapeHtml(text(item.statusLabel, COPY.done))}">
          ${escapeHtml(text(item.statusLabel, COPY.done))}
        </span>
      </div>
      <div class="rel-record__meta">
        <span>${escapeHtml(item.dateText)}</span>
        <span class="rel-record__sep">&middot;</span>
        <span>${escapeHtml(item.relativeText)}</span>
      </div>
      <div class="rel-record__divider" role="presentation"></div>
      <div class="${classNames('rel-record__body', isCostZero && 'is-cost-zero')}">
        <div class="rel-record__summary">
          <div class="rel-record__summary-line">
            ${
              !item.singleEquipFilter
                ? `<span class="rel-record__equip-name">${escapeHtml(text(item.equipName, '-'))}</span><span class="rel-record__sep">&middot;</span><span class="rel-record__equip-tag">${escapeHtml(text(item.equipTag, '-'))}</span><span class="rel-record__sep">&middot;</span>`
                : ''
            }
            <span class="rel-record__tech">
              <span class="rel-record__tech-ic">${iconHtml('user', 12)}</span>
              ${escapeHtml(text(item.technician, '-'))}
            </span>
          </div>
          <div class="rel-record__signature">${signatureThumbHtml(item.signature)}</div>
        </div>
        ${
          cost
            ? `<div class="rel-record__cost"><div class="rel-record__cost-value">${escapeHtml(cost.totalText)}</div><div class="rel-record__cost-label">${COPY.serviceTotal}</div></div>`
            : ''
        }
      </div>
      ${cardActionsHtml(id)}
      <button type="button" class="rel-record__toggle"
        data-rel-action="${RELATORIO_ACTIONS.toggleCard}"
        data-id="${escapedId}"
        aria-expanded="${String(expanded)}"
        aria-controls="${escapeHtml(detailsId)}">
        <span>${expanded ? 'Ocultar detalhes' : 'Ver detalhes'}</span>
        <span class="rel-record__toggle-chev" aria-hidden="true">${iconHtml('chevronDown', 12)}</span>
      </button>
      <div id="${escapeHtml(detailsId)}" class="rel-record__details" ${expanded ? '' : 'hidden'}>
        <section class="rel-record__section">
          <div class="rel-record__section-title">${COPY.equipmentSpecs}</div>
          ${equipmentSpecsHtml(item.equipmentSpecs)}
        </section>
        ${
          item.pecas
            ? `<section class="rel-record__section"><div class="rel-record__section-title">${COPY.partsMaterials}</div><div class="rel-record__pecas">${escapeHtml(item.pecas)}</div></section>`
            : ''
        }
        ${
          cost
            ? `<section class="rel-record__section">
                <div class="rel-record__section-title">${COPY.costs}</div>
                <div class="rel-record__cost-breakdown">
                  <span class="rel-cost-row__label">${COPY.parts}</span>
                  <span class="rel-cost-row__value">${escapeHtml(cost.partsText)}</span>
                  <span class="rel-cost-row__label">${COPY.labor}</span>
                  <span class="rel-cost-row__value">${escapeHtml(cost.laborText)}</span>
                  <span class="rel-cost-row__rule" aria-hidden="true"></span>
                  <span class="rel-cost-row__label rel-cost-row__label--total">Total</span>
                  <span class="rel-cost-row__value rel-cost-row__value--total">${escapeHtml(cost.totalText)}</span>
                </div>
              </section>`
            : ''
        }
        ${
          item.proxima
            ? `<section class="rel-record__section">
                <div class="rel-record__section-title">${COPY.nextMaintenance}</div>
                <div class="rel-record__prox">
                  <span class="rel-record__prox-date">${escapeHtml(item.proxima.dateText)}</span>
                  <span class="${classNames('rel-record__prox-badge', `rel-record__prox-badge--${text(item.proxima.tone, 'default')}`)}">${escapeHtml(item.proxima.label)}</span>
                </div>
              </section>`
            : ''
        }
        ${pmocContextHtml(item.pmocContext)}
        ${
          item.obs
            ? `<section class="rel-record__section"><div class="rel-record__section-title">${COPY.notes}</div><div class="rel-record__obs">${escapeHtml(item.obs)}</div></section>`
            : ''
        }
      </div>
    </article>
  `;
}

function renderCardsHtml(cards) {
  const data = { ...DEFAULT_CARDS, ...(cards || {}) };
  const records = asArray(data.records);

  if (data.isEmpty || records.length === 0) {
    return emptyStateHtml(data.today);
  }

  return [
    data.showCorretivasBanner ? corretivasBannerHtml(data.corretivasBanner) : '',
    proximasAcoesHtml(data.proximasAcoes),
    records.map(recordCardHtml).join(''),
  ].join('');
}

export function renderRelatorioCards(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.body),
  props = {},
) {
  if (!root) return null;
  const cards = { ...DEFAULT_CARDS, ...(props.cards || {}) };
  root.dataset.relatorioCardsMounted = 'true';
  root.dataset.viewMode = cards.viewMode || RELATORIO_VIEW_MODES.compact;
  root.classList.add('rel-records');
  root.innerHTML = renderCardsHtml(cards);
  return root;
}

export function unmountRelatorioCardsDom(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.body),
) {
  if (!root?.dataset.relatorioCardsMounted) return null;
  root.replaceChildren();
  delete root.dataset.relatorioCardsMounted;
  delete root.dataset.viewMode;
  return null;
}
