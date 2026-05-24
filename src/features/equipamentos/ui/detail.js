import { Utils as defaultUtils } from '../../../core/utils.js';
import { isCachedPlanPlusOrHigher as defaultIsCachedPlanPlusOrHigher } from '../../../core/plans/planCache.js';
import { formatDadosPlacaRows as defaultFormatDadosPlacaRows } from '../../../domain/dadosPlacaDisplay.js';
import { getEquipmentVisualMeta as defaultGetEquipmentVisualMeta } from '../../../ui/components/equipmentVisual.js';
import {
  _eqDetailSubtitle,
  _infoRowValueOrEmpty,
  _riskFactorChipHtml,
} from '../../../ui/views/equipamentos/utils/detail.js';

function resolveDetailDeps(deps = {}) {
  return {
    Utils: deps.Utils ?? defaultUtils,
    getSetores: deps.getSetores ?? (() => []),
    getEquipmentVisualMeta: deps.getEquipmentVisualMeta ?? defaultGetEquipmentVisualMeta,
    isCachedPlanPlusOrHigher: deps.isCachedPlanPlusOrHigher ?? defaultIsCachedPlanPlusOrHigher,
    formatDadosPlacaRows: deps.formatDadosPlacaRows ?? defaultFormatDadosPlacaRows,
    eqDetailSubtitle: deps.eqDetailSubtitle ?? _eqDetailSubtitle,
    infoRowValueOrEmpty: deps.infoRowValueOrEmpty ?? _infoRowValueOrEmpty,
    riskFactorChipHtml: deps.riskFactorChipHtml ?? _riskFactorChipHtml,
  };
}

export function renderViewEquipSetorInfoRow(eq, deps) {
  const { Utils, getSetores } = resolveDetailDeps(deps);
  const setores = getSetores();
  const setorObj = setores.find((s) => s.id === eq.setorId);
  const setorNome = setorObj ? setorObj.nome : 'Sem setor';
  const setorVisual = setorObj ? '' : 'info-row__value--muted';
  return `<div class="info-row info-row--setor">
      <span class="info-row__label">Setor</span>
      <span class="info-row__value ${setorVisual}">${Utils.escapeHtml(setorNome)}</span>
    </div>`;
}

export function renderViewEquipServiceTimeline(regs, deps) {
  const { Utils } = resolveDetailDeps(deps);
  const hiddenCount = Math.max(0, regs.length - 5);
  return regs.length === 0
    ? `<div class="eq-svc-empty">Nenhum serviço registrado neste equipamento.</div>`
    : `<div class="eq-svc-timeline">
        ${regs
          .slice(0, 5)
          .map(
            (r) => `
          <div class="eq-svc-item">
            <div class="eq-svc-item__dot"></div>
            <div class="eq-svc-item__content">
              <span class="eq-svc-item__tipo">${Utils.escapeHtml(r.tipo)}</span>
              <span class="eq-svc-item__data">${Utils.formatDatetime(r.data)}</span>
            </div>
          </div>`,
          )
          .join('')}
        ${
          hiddenCount > 0
            ? `<div class="eq-svc-more">+${hiddenCount} serviço${hiddenCount > 1 ? 's' : ''} anterior${hiddenCount > 1 ? 'es' : ''}</div>`
            : ''
        }
      </div>`;
}

export function renderViewEquipCoverBlock(model, deps) {
  const { Utils, getEquipmentVisualMeta } = resolveDetailDeps(deps);
  const { eq, safeId } = model;
  const visual = getEquipmentVisualMeta(eq);
  const firstPhotoUrl = visual.photoUrl;
  const photosCount = Array.isArray(eq.fotos)
    ? eq.fotos.filter((p) => p && (typeof p === 'string' ? p : p.url || p.path)).length
    : 0;
  const canEditPhotos = true;
  const photoCtaLabel = canEditPhotos
    ? photosCount === 0
      ? 'Adicionar foto'
      : 'Gerenciar fotos'
    : 'Adicionar foto';
  const photoCtaAction = 'open-eq-photos-editor';
  const photoCtaExtra = '';
  const photoCtaBadge = '';
  const photoCtaVariantCls = canEditPhotos ? '' : ' eq-detail-cover__cta--locked';
  const photoCameraIcon = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>
      <circle cx="12" cy="13" r="3.5"/>
    </svg>`;
  const photoLockIcon = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>`;
  const photoCtaIcon = canEditPhotos ? photoCameraIcon : photoLockIcon;
  const coverFallback = `<div class="eq-detail-cover__fallback eq-detail-cover__fallback--tone-${visual.tone}">
      <span class="eq-detail-cover__fallback-initials">${Utils.escapeHtml(visual.initials)}</span>
    </div>`;
  const coverInner = firstPhotoUrl
    ? `<img class="eq-detail-cover__img" src="${Utils.escapeAttr(firstPhotoUrl)}" alt="Foto de ${Utils.escapeAttr(eq.nome)}" loading="lazy" />
       ${coverFallback}
       <button type="button" class="eq-detail-cover__preview-hit" aria-label="Ampliar foto de ${Utils.escapeAttr(eq.nome)}"></button>
       <span class="eq-detail-cover__zoom-hint" aria-hidden="true">
         <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-3.5-3.5"/>
         </svg>
         ampliar
       </span>`
    : `${coverFallback}
       <button type="button" class="eq-detail-cover__cta eq-detail-cover__cta--center${photoCtaVariantCls}"
         data-action="${photoCtaAction}" data-id="${safeId}"${photoCtaExtra}
         aria-label="Adicionar foto">
         ${photoCtaIcon}
         <span>${photoCtaLabel}</span>
         ${photoCtaBadge}
       </button>`;
  const coverHasPhotoClass = firstPhotoUrl
    ? ' eq-detail-cover--has-photo'
    : ' eq-detail-cover--empty';
  const coverLockedClass = canEditPhotos ? '' : ' eq-detail-cover--locked';
  const coverActionsBlock = firstPhotoUrl
    ? `<div class="eq-detail-cover-actions">
        <button type="button" class="eq-detail-cover-action${photoCtaVariantCls}"
          data-action="${photoCtaAction}" data-id="${safeId}"${photoCtaExtra}
          aria-label="Gerenciar fotos">
          ${photoCtaIcon}
          <span>${photoCtaLabel}</span>
          ${photoCtaBadge}
        </button>
      </div>`
    : '';
  return {
    html: `
    <div class="eq-detail-cover${coverHasPhotoClass}${coverLockedClass}">
      ${coverInner}
    </div>
    ${coverActionsBlock}`,
    firstPhotoUrl,
  };
}

export function renderViewEquipDadosPlacaSections(eq, deps) {
  const { Utils, formatDadosPlacaRows } = resolveDetailDeps(deps);
  const dadosPlacaRows = formatDadosPlacaRows(eq.dadosPlaca);
  const dadosPlacaFixedRows = dadosPlacaRows.filter((r) => !r.extra);
  const dadosPlacaExtraRows = dadosPlacaRows.filter((r) => r.extra);

  const rowHtml = (row) => `
            <div class="info-row">
              <span class="info-row__label">${Utils.escapeHtml(row.label)}</span>
              <span class="info-row__value${row.mono ? ' info-row__value--mono' : ''}">${Utils.escapeHtml(row.value)}</span>
            </div>`;

  const dadosPlacaSectionHtml = dadosPlacaFixedRows.length
    ? `
      <div class="eq-tech-sheet__section">
        <div class="eq-tech-sheet__title">Dados da etiqueta</div>
        <div class="info-list info-list--spaced info-list--soft">
          ${dadosPlacaFixedRows.map(rowHtml).join('')}
        </div>
      </div>`
    : '';

  const dadosPlacaExtrasSectionHtml = dadosPlacaExtraRows.length
    ? `
      <div class="eq-tech-sheet__section">
        <div class="eq-tech-sheet__title">Outras informações da etiqueta</div>
        <div class="info-list info-list--spaced info-list--soft">
          ${dadosPlacaExtraRows.map(rowHtml).join('')}
        </div>
      </div>`
    : '';

  return { dadosPlacaSectionHtml, dadosPlacaExtrasSectionHtml };
}

export function renderViewEquipPmocContextBlock(model, deps) {
  const { Utils } = resolveDetailDeps(deps);
  const pmoc = model.pmocContext ?? {
    statusLabel: 'Sem registro',
    statusTone: 'muted',
    periodicidadeLabel: `${model.context?.periodicidadeDias || model.eq.periodicidadePreventivaDias} dias`,
    ultimaPreventivaLabel: 'Sem preventiva registrada',
    proximaPreventivaLabel: model.proximaPreventiva,
    recommendedAction: 'Registre o próximo serviço deste equipamento.',
    ctaLabel: 'Registrar serviço',
  };
  const safeId = model.safeId;
  const tone = pmoc.statusTone || 'muted';
  const ctaLabel = pmoc.ctaLabel || 'Registrar serviço';

  return `
      <section class="eq-pmoc-context eq-pmoc-context--${Utils.escapeAttr(tone)}" aria-label="PMOC e preventiva do equipamento">
        <div class="eq-pmoc-context__head">
          <div>
            <span class="eq-pmoc-context__eyebrow">PMOC / Preventiva</span>
            <h3 class="eq-pmoc-context__title">${Utils.escapeHtml(pmoc.statusLabel)}</h3>
          </div>
          <span class="eq-pmoc-context__status">${Utils.escapeHtml(pmoc.statusLabel)}</span>
        </div>
        <div class="eq-pmoc-context__grid">
          <div class="eq-pmoc-context__item">
            <span>Periodicidade</span>
            <b>${Utils.escapeHtml(pmoc.periodicidadeLabel)}</b>
          </div>
          <div class="eq-pmoc-context__item">
            <span>Última preventiva</span>
            <b>${Utils.escapeHtml(pmoc.ultimaPreventivaLabel)}</b>
          </div>
          <div class="eq-pmoc-context__item">
            <span>Próxima preventiva</span>
            <b>${Utils.escapeHtml(pmoc.proximaPreventivaLabel)}</b>
          </div>
        </div>
        <div class="eq-pmoc-context__footer">
          <p>${Utils.escapeHtml(pmoc.recommendedAction)}</p>
          <button type="button" class="btn btn--primary btn--sm eq-pmoc-context__cta" data-action="go-register-equip" data-id="${safeId}">
            ${Utils.escapeHtml(ctaLabel)}
          </button>
        </div>
      </section>`;
}

function renderFieldValue(value, deps) {
  const { Utils } = resolveDetailDeps(deps);
  const clean = value != null && String(value).trim() !== '' ? String(value).trim() : null;
  return clean
    ? `<b>${Utils.escapeHtml(clean)}</b>`
    : '<b class="eq-detail-basic__value--muted">Não informado</b>';
}

export function renderViewEquipBasicFields(model, deps) {
  const { Utils, getSetores } = resolveDetailDeps(deps);
  const { eq, proximaPreventiva } = model;
  const setores = getSetores();
  const setorObj = setores.find((s) => s.id === eq.setorId);
  const setorNome = setorObj ? setorObj.nome : 'Sem setor';
  const field = (label, value, modifier = '') => `
          <div class="eq-detail-basic${modifier ? ` eq-detail-basic--${modifier}` : ''}">
            <span>${Utils.escapeHtml(label)}</span>
            ${renderFieldValue(value, deps)}
          </div>`;

  return `
        <div class="eq-detail-basics-grid" aria-label="Identificação básica do equipamento">
          ${field('Local', eq.local)}
          ${field('TAG', eq.tag)}
          ${field('Setor', setorNome)}
          ${field('Tipo', eq.tipo)}
          ${field('Fluido', eq.fluido)}
          ${field('Modelo', eq.modelo, 'modelo')}
          ${field('Próxima preventiva', proximaPreventiva, 'proxima-preventiva')}
        </div>`;
}

export function renderViewEquipDetailHtml(model, deps) {
  const resolvedDeps = resolveDetailDeps(deps);
  const { Utils, eqDetailSubtitle, infoRowValueOrEmpty, riskFactorChipHtml } = resolvedDeps;
  const { eq, regs, score, cls, safeId, context, risk, proximaPreventiva, healthSummary } = model;
  const setorSelectHtml = renderViewEquipSetorInfoRow(eq, resolvedDeps);
  const svcTimeline = renderViewEquipServiceTimeline(regs, resolvedDeps);
  const coverBlock = renderViewEquipCoverBlock(model, resolvedDeps);
  const basicFieldsBlock = renderViewEquipBasicFields(model, resolvedDeps);
  const pmocContextBlock = renderViewEquipPmocContextBlock(model, resolvedDeps);
  const { dadosPlacaSectionHtml, dadosPlacaExtrasSectionHtml } = renderViewEquipDadosPlacaSections(
    eq,
    resolvedDeps,
  );
  const primaryCtaLabel = model.pmocContext?.ctaLabel || 'Registrar serviço';

  return {
    html: `
    <div class="eq-detail-view eq-detail-view--surface eq-detail-view--cp-h">
      <section class="eq-detail-field-panel" aria-label="Identificação e ações do equipamento">
        <aside class="eq-detail-media-panel" aria-label="Fotos do equipamento">
          ${coverBlock.html}
        </aside>

        <div class="eq-detail-work-header" aria-label="Resumo e acoes do equipamento">
          <div class="eq-detail-title-block">
            <div class="modal__title" id="eq-det-title">${Utils.escapeHtml(eq.nome)}</div>
            <div class="eq-detail-title-block__sub">${eqDetailSubtitle(eq)}</div>
          </div>

          ${basicFieldsBlock}

          <div class="eq-modal-footer eq-modal-footer--tri eq-modal-footer--workhead">
            <button class="btn btn--primary btn--sm eq-modal-footer__btn eq-modal-footer__btn--primary eq-modal-footer__btn--register"
                    data-action="go-register-equip" data-id="${safeId}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              ${Utils.escapeHtml(primaryCtaLabel)}
            </button>
            <button class="btn btn--outline btn--sm eq-modal-footer__btn eq-modal-footer__btn--edit"
                    data-action="edit-equip" data-id="${safeId}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </button>
            <div class="eq-modal-footer__more">
              <button class="eq-modal-footer__more-btn" type="button"
                data-action="toggle-eq-detail-menu" data-id="${safeId}"
                aria-haspopup="menu" aria-expanded="false" aria-controls="eq-detail-menu-${safeId}"
                aria-label="Mais ações para ${Utils.escapeAttr(eq.nome)}"
                title="Mais ações">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                </svg>
              </button>
              <div class="eq-modal-footer__menu" id="eq-detail-menu-${safeId}" role="menu" hidden>
                <button type="button" class="eq-modal-footer__menu-item eq-modal-footer__menu-item--danger"
                  role="menuitem" data-action="delete-equip" data-id="${safeId}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                  <span>Excluir equipamento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="eq-detail-support-panel" aria-label="PMOC, risco e histórico recente">
        ${pmocContextBlock}

        <section class="eq-detail-work-summary" aria-label="Resumo operacional do equipamento">
          <div class="eq-detail-hero eq-detail-hero--${cls}">
            <div class="eq-detail-hero__body">
              <span class="eq-detail-health-pill eq-detail-health-pill--${cls}" aria-label="Saude ${score}%">Saúde ${score}%</span>
              <div class="eq-hero-score__summary">${healthSummary}</div>
            </div>
          </div>

          <div class="eq-risk-panel eq-risk-panel--${risk.classification}">
            <div class="eq-risk-panel__header">
              <div>
                <div class="eq-risk-panel__label-row">
                  <span class="eq-risk-panel__label">Fatores de risco</span>
                  <button type="button" class="eq-risk-panel__help" data-action="open-modal"
                          data-id="modal-score-info" title="Como calculamos o score"
                          aria-label="Como calculamos o score de risco">?</button>
                </div>
              </div>
            </div>
            <div class="eq-risk-panel__factors">
              ${(risk.factors.length ? risk.factors : ['rotina estável'])
                .map((f) => riskFactorChipHtml(f, safeId))
                .join('')}
            </div>
          </div>
        </section>

        <div class="eq-svc-section">
          <div class="eq-svc-section__header">
            <span class="eq-svc-section__title">Histórico de serviços</span>
            <button class="btn ${regs.length === 0 ? 'btn--primary' : 'btn--outline'} btn--sm eq-svc-section__cta" data-action="go-register-equip" data-id="${safeId}">
              + Registrar ${regs.length === 0 ? 'primeiro ' : ''}serviço
            </button>
          </div>
          ${svcTimeline}
        </div>
      </section>

      <details class="eq-tech-sheet-wrap" id="eq-tech-sheet-${safeId}">
        <summary class="eq-tech-sheet-wrap__summary">
          <div class="eq-tech-sheet-wrap__summary-head">
            <span class="eq-tech-sheet-wrap__summary-title">Detalhes técnicos</span>
            <svg class="eq-tech-sheet-wrap__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div class="eq-tech-sheet-wrap__summary-preview">
            <span class="eq-tech-sheet-wrap__summary-chip">
              <b>${Utils.escapeHtml(`${context?.periodicidadeDias || eq.periodicidadePreventivaDias}`)}</b> dias
            </span>
            <span class="eq-tech-sheet-wrap__summary-chip">
              Próx.: <b>${Utils.escapeHtml(proximaPreventiva)}</b>
            </span>
            <span class="eq-tech-sheet-wrap__summary-hint">toque para ver detalhes</span>
          </div>
        </summary>
        <div class="eq-tech-sheet">
          <div class="eq-tech-sheet__section">
            <div class="eq-tech-sheet__title">Identificação</div>
            <div class="info-list info-list--spaced info-list--soft">
              <div class="info-row"><span class="info-row__label">TAG</span>${infoRowValueOrEmpty(eq.tag, 'Adicionar TAG', safeId, 'mono', 'tag')}</div>
              <div class="info-row"><span class="info-row__label">Tipo</span><span class="info-row__value">${Utils.escapeHtml(eq.tipo)}</span></div>
              <div class="info-row"><span class="info-row__label">Fluido</span>${infoRowValueOrEmpty(eq.fluido, 'Adicionar fluido', safeId, '', 'fluido')}</div>
              <div class="info-row info-row--model-full"><span class="info-row__label">Modelo</span>${infoRowValueOrEmpty(eq.modelo, 'Adicionar modelo', safeId, '', 'modelo')}</div>
              <div class="info-row"><span class="info-row__label">Local</span><span class="info-row__value">${Utils.escapeHtml(eq.local)}</span></div>
              ${setorSelectHtml}
            </div>
          </div>
          <div class="eq-tech-sheet__section">
            <div class="eq-tech-sheet__title">Operação</div>
            <div class="info-list info-list--spaced info-list--soft">
              <div class="info-row"><span class="info-row__label">Rotina preventiva</span><span class="info-row__value">${Utils.escapeHtml(`${context?.periodicidadeDias || eq.periodicidadePreventivaDias} dias`)}</span></div>
              <div class="info-row"><span class="info-row__label">Próxima preventiva</span><span class="info-row__value">${Utils.escapeHtml(proximaPreventiva)}</span></div>
            </div>
          </div>
          ${dadosPlacaSectionHtml}
          ${dadosPlacaExtrasSectionHtml}
        </div>
      </details>
    </div>`,
    firstPhotoUrl: coverBlock.firstPhotoUrl,
  };
}
