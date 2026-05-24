import { HISTORICO_ACTIONS, HISTORICO_NAV_TARGETS } from '../../viewModels/historicoContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function escapeHtml(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
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

function svgIcon(children, { width = 11, height = 11, strokeWidth = 1.75, fill = 'none' } = {}) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${children}</svg>`;
}

function calendarIcon(width = 11, height = 11) {
  return svgIcon(
    '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"></path>',
    { width, height },
  );
}

function userIcon() {
  return svgIcon('<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>');
}

function boxIcon() {
  return svgIcon(
    '<path d="M21 8 12 3 3 8l9 5 9-5Z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path>',
  );
}

function kebabIcon() {
  return svgIcon(
    '<circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle>',
    { width: 16, height: 16, strokeWidth: 2 },
  );
}

function editIcon() {
  return svgIcon(
    '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"></path>',
    { width: 14, height: 14 },
  );
}

function deleteIcon() {
  return svgIcon(
    '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"></path>',
    { width: 14, height: 14 },
  );
}

function metaIcon(icon) {
  if (icon === 'user') return userIcon();
  if (icon === 'box') return boxIcon();
  if (icon === 'calendar') return calendarIcon();
  return '';
}

function renderEmptyCta(cta) {
  if (!cta) return '';
  return `<button type="button" class="${classNames(
    'btn',
    cta.tone === 'outline' ? 'btn--outline' : 'btn--primary',
    cta.size === 'sm' && 'btn--sm',
    cta.autoWidth && 'btn--auto',
    cta.centered && 'btn--centered',
  )}"${cta.action ? ` data-action="${escapeAttr(cta.action)}"` : ''}${
    cta.histAction ? ` data-hist-action="${escapeAttr(cta.histAction)}"` : ''
  }${cta.id ? ` data-id="${escapeAttr(cta.id)}"` : ''}${
    cta.nav ? ` data-nav="${escapeAttr(cta.nav)}"` : ''
  }${cta.testid ? ` data-testid="${escapeAttr(cta.testid)}"` : ''}>${escapeHtml(
    cta.label || 'Continuar',
  )}</button>`;
}

function renderEmptyState(emptyState) {
  if (!emptyState) return '';
  const button = renderEmptyCta(emptyState.cta);
  if (emptyState.variant === 'engaging') {
    return `<section class="engaging-empty-state" ${
      emptyState.ariaLabel ? `aria-label="${escapeAttr(emptyState.ariaLabel)}"` : ''
    }>
      <div class="engaging-empty-state__icon">${escapeHtml(emptyState.icon || '-')}</div>
      <h3 class="engaging-empty-state__title">${escapeHtml(emptyState.title)}</h3>
      ${emptyState.description ? `<p class="engaging-empty-state__description">${escapeHtml(emptyState.description)}</p>` : ''}
      ${button}
      ${
        emptyState.microcopy
          ? `<div class="engaging-empty-state__microcopy">${escapeHtml(emptyState.microcopy)}</div>`
          : ''
      }
    </section>`;
  }
  return `<div class="empty-state">
    <div class="empty-state__icon">${escapeHtml(emptyState.icon || '-')}</div>
    <div class="empty-state__title">${escapeHtml(emptyState.title)}</div>
    ${emptyState.description ? `<div class="empty-state__sub">${escapeHtml(emptyState.description)}</div>` : ''}
    ${button ? `<div class="empty-state__cta">${button}</div>` : ''}
  </div>`;
}

function renderOperationSummary(summary) {
  const model = summary || { totalServicosHoje: 0, totalEquipHoje: 0 };
  const totalServicosHoje = Number(model.totalServicosHoje) || 0;
  const totalEquipHoje = Number(model.totalEquipHoje) || 0;
  if (totalServicosHoje > 0) {
    return `<section class="hist-op-summary" aria-label="Resumo de hoje">
      <div class="hist-op-summary__head">Hoje</div>
      <div class="hist-op-summary__kpis">
        <div class="hist-op-summary__kpi"><strong>${totalServicosHoje}</strong><span>servicos realizados</span></div>
        <div class="hist-op-summary__kpi"><strong>${totalEquipHoje}</strong><span>equipamentos atendidos</span></div>
      </div>
    </section>`;
  }
  return `<section class="hist-op-summary" aria-label="Resumo de hoje">
    <div class="hist-op-summary__head">Hoje</div>
    <div class="hist-op-summary__empty">
      <strong>Nada registrado ainda hoje.</strong>
      <p>Toque no <span class="hist-op-summary__empty-fab">+</span> da barra pra comecar.</p>
    </div>
  </section>`;
}

function renderAttentionSection(items) {
  const rows = asArray(items);
  if (!rows.length) return '';
  return `<section class="hist-attention" aria-label="Itens em atencao">
    <div class="hist-attention__head">Atencao</div>
    ${rows
      .map(
        (item) => `<article class="${classNames(
          'hist-attention__item',
          item.tone === 'danger' && 'hist-attention__item--danger',
        )}">
          <div class="hist-attention__content"><strong>${escapeHtml(
            item.title || 'Item',
          )}</strong><span>${escapeHtml(item.reason || 'Exige atencao')}</span></div>
          <button type="button" class="hist-attention__cta"${
            item.equipId
              ? ` data-hist-action="${HISTORICO_ACTIONS.filterEquip}" data-equip-id="${escapeAttr(
                  item.equipId,
                )}"`
              : ` data-nav="${HISTORICO_NAV_TARGETS.equipamentos}"`
          }>${escapeHtml(item.ctaLabel || 'Resolver')}</button>
        </article>`,
      )
      .join('')}
  </section>`;
}

function renderHeadPills(pills) {
  return asArray(pills)
    .map(
      (pill) =>
        `<span class="${classNames(
          'hist-pill',
          `hist-pill--${text(pill?.color, 'cyan')}`,
        )}"${pill?.title ? ` title="${escapeAttr(pill.title)}"` : ''}>${escapeHtml(
          pill?.label,
        )}</span>`,
    )
    .join('');
}

function renderMeta(chunks) {
  const meta = asArray(chunks);
  if (!meta.length) return '';
  return `<div class="timeline__item__meta">${meta
    .map((chunk, index) => {
      const textContent = chunk.highlight
        ? `<span class="${escapeAttr(chunk.highlightClassName || '')}">${escapeHtml(
            chunk.highlight,
          )}</span>`
        : `<span class="${escapeAttr(chunk.textClassName || '')}">${escapeHtml(chunk.text)}</span>`;
      return `<span>${
        index > 0 ? '<span class="meta-sep" aria-hidden="true">.</span>' : ''
      }<span class="${classNames('meta-chunk', chunk.className)}"${
        chunk.title ? ` title="${escapeAttr(chunk.title)}"` : ''
      }>${metaIcon(chunk.icon)}${chunk.prefix ? escapeHtml(chunk.prefix) : ''}${textContent}${
        chunk.details ? `<span class="meta-details"> ${escapeHtml(chunk.details)}</span>` : ''
      }</span></span>`;
    })
    .join('')}</div>`;
}

function renderPhotoStrip(item) {
  const urls = asArray(item.photoUrls).map(safeMediaUrl).filter(Boolean);
  if (!urls.length) return '';
  return `<div class="timeline__item__photos" aria-label="Fotos do servico">
    ${urls
      .slice(0, 3)
      .map(
        (url, index) =>
          `<button type="button" class="timeline__item__photos-thumb" data-hist-action="${
            HISTORICO_ACTIONS.openPhoto
          }" data-photo-url="${escapeAttr(url)}" aria-label="Abrir foto ${
            index + 1
          }"><img src="${escapeAttr(url)}" alt="Foto ${index + 1} do servico" loading="lazy"></button>`,
      )
      .join('')}
    ${
      Number(item.extraPhotoCount) > 0
        ? `<span class="timeline__item__photos-more" aria-label="Mais ${Number(
            item.extraPhotoCount,
          )} fotos">+${Number(item.extraPhotoCount)}</span>`
        : ''
    }
  </div>`;
}

function renderTimelineItem(item) {
  const status = text(item.status, 'ok');
  return `<article class="${classNames(
    'timeline__item',
    item.isLatest && 'timeline__item--latest',
    (status === 'warn' || status === 'danger') && `timeline__item--${status}`,
  )}" role="listitem" data-reg-id="${escapeAttr(item.id)}">
    <span class="${classNames(
      'timeline__dot',
      status !== 'ok' && `timeline__dot--${status}`,
    )}" aria-hidden="true"></span>
    <div class="timeline__item__main">
      <div class="timeline__item__header">
        <span class="timeline__item__date">${escapeHtml(item.headerDateLabel)}</span>
        <div class="timeline__item__header-spacer"></div>
        ${renderHeadPills(item.headPills)}
      </div>
      <h3 class="timeline__item__service">${escapeHtml(item.serviceTitle || 'Servico')}</h3>
      <div class="timeline__item__equipment">
        <span>${escapeHtml(item.equipmentName || '-')}</span>
        ${
          item.setorName || item.equipTag
            ? '<span class="timeline__item__equipment-sep" aria-hidden="true">.</span>'
            : ''
        }
        ${item.setorName ? `<span class="timeline__item__equipment-tag">${escapeHtml(item.setorName)}</span>` : ''}
        ${item.setorTag ? `<span class="hist-pill hist-pill--neutral">${escapeHtml(item.setorTag)}</span>` : ''}
      </div>
      ${item.context ? `<div class="timeline__item__context">${escapeHtml(item.context)}</div>` : ''}
      ${item.obs ? `<p class="timeline__item__obs">${escapeHtml(item.obs)}</p>` : ''}
      ${renderMeta(item.meta)}
      ${renderPhotoStrip(item)}
      ${
        item.showFilterEquip
          ? `<button type="button" class="timeline__item__focus-equip" data-hist-action="${
              HISTORICO_ACTIONS.filterEquip
            }" data-equip-id="${escapeAttr(
              item.equipId,
            )}" aria-label="Ver todos os servicos deste equipamento">Ver tudo deste equipamento -&gt;</button>`
          : ''
      }
    </div>
    <div class="hist-item-actions">
      <div class="hist-item-actions__menu" role="menu" hidden>
        <button type="button" role="menuitem" class="hist-item-actions__menuitem" data-action="${
          HISTORICO_ACTIONS.editReg
        }" data-id="${escapeAttr(item.id)}" title="Editar" aria-label="Editar registro">${editIcon()}</button>
        <button type="button" role="menuitem" class="hist-item-actions__menuitem hist-item-actions__menuitem--danger" data-action="${
          HISTORICO_ACTIONS.deleteReg
        }" data-id="${escapeAttr(item.id)}" title="Excluir" aria-label="Excluir registro">${deleteIcon()}</button>
      </div>
      <button type="button" class="hist-item-actions__kebab" data-hist-action="${
        HISTORICO_ACTIONS.toggleCardMenu
      }" data-id="${escapeAttr(
        item.id,
      )}" aria-label="Acoes do registro" aria-haspopup="menu" aria-expanded="false">${kebabIcon()}</button>
    </div>
  </article>`;
}

function renderTimelineList(groups) {
  const safeGroups = asArray(groups);
  if (!safeGroups.length) return '';
  return `<div class="timeline">${safeGroups
    .map(
      (group) => `<div class="timeline__group">
        <div class="hist-day-group" role="presentation">
          <div class="hist-day-group__label">${calendarIcon()}<span>${escapeHtml(
            group.label,
          )}</span><span class="hist-day-group__count">${escapeHtml(group.countLabel)}</span></div>
        </div>
        ${asArray(group.items).map(renderTimelineItem).join('')}
      </div>`,
    )
    .join('')}</div>`;
}

function renderTimelineHtml(viewModel = {}) {
  const groups = asArray(viewModel.groups);
  return `${renderOperationSummary(viewModel.operationSummary)}
    ${renderAttentionSection(viewModel.attentionItems)}
    ${groups.length ? renderTimelineList(groups) : renderEmptyState(viewModel.emptyState)}`;
}

export function mountHistoricoTimelineDom(root = document.getElementById('timeline'), props = {}) {
  if (!root) return null;
  root.innerHTML = renderTimelineHtml(props.viewModel || {});
  root.dataset.historicoTimelineMounted = 'true';
  return root;
}

export function unmountHistoricoTimelineDom(root = document.getElementById('timeline')) {
  if (!root) return;
  root.innerHTML = '';
  delete root.dataset.historicoTimelineMounted;
}
