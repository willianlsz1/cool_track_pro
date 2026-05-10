import { Utils as defaultUtils } from '../../../core/utils.js';
import { isCachedPlanPlusOrHigher as defaultIsCachedPlanPlusOrHigher } from '../../../core/plans/planCache.js';
import { formatDadosPlacaRows as defaultFormatDadosPlacaRows } from '../../../domain/dadosPlacaDisplay.js';
import { getEquipmentVisualMeta as defaultGetEquipmentVisualMeta } from '../../../ui/components/equipmentVisual.js';
import { _eqDetailSubtitle, _infoRowValueOrEmpty, _riskFactorChipHtml } from '../utils/detail.js';

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
        ${regs.length > 5 ? `<div class="eq-svc-more">+${regs.length - 5} serviços anteriores</div>` : ''}
      </div>`;
}

export function renderViewEquipCoverBlock(model, deps) {
  const { Utils, getEquipmentVisualMeta, isCachedPlanPlusOrHigher } = resolveDetailDeps(deps);
  const { eq, safeId } = model;
  const visual = getEquipmentVisualMeta(eq);
  const firstPhotoUrl = visual.photoUrl;
  const photosCount = Array.isArray(eq.fotos)
    ? eq.fotos.filter((p) => p && (typeof p === 'string' ? p : p.url || p.path)).length
    : 0;
  const canEditPhotos = isCachedPlanPlusOrHigher();
  const photoCtaLabel = canEditPhotos
    ? photosCount === 0
      ? 'Adicionar foto'
      : 'Gerenciar fotos'
    : 'Desbloquear com Plus';
  const photoCtaAction = canEditPhotos ? 'open-eq-photos-editor' : 'open-upgrade';
  const photoCtaExtra = canEditPhotos
    ? ''
    : ' data-upgrade-source="equip_detail_photos" data-highlight-plan="plus"';
  const photoCtaBadge = canEditPhotos
    ? ''
    : '<span class="plus-badge plus-badge--inline" aria-hidden="true">PLUS</span>';
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
       <!-- Pill "ampliar" (V7): sinaliza explicitamente que clicar abre
            a foto em fullscreen. Antes só o cursor zoom-in dava a dica;
            usuário mobile/touch nem via cursor, então a pill resolve. -->
       <span class="eq-detail-cover__zoom-hint" aria-hidden="true">
         <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-3.5-3.5"/>
         </svg>
         ampliar
       </span>`
    : `${coverFallback}
       <button type="button" class="eq-detail-cover__cta eq-detail-cover__cta--center${photoCtaVariantCls}"
         data-action="${photoCtaAction}" data-id="${safeId}"${photoCtaExtra}
         aria-label="${canEditPhotos ? 'Adicionar foto' : 'Fotos bloqueadas — desbloqueie com o plano Plus'}">
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
          aria-label="${canEditPhotos ? 'Gerenciar fotos' : 'Fotos bloqueadas — desbloqueie com o plano Plus'}">
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
  const pmoc = model.pmocContext;
  if (!pmoc) return '';

  const safeId = model.safeId;
  const tone = pmoc.statusTone || 'muted';

  return `
      <section class="eq-pmoc-context eq-pmoc-context--${Utils.escapeAttr(tone)}" aria-label="PMOC e preventiva do equipamento">
        <div class="eq-pmoc-context__head">
          <div>
            <span class="eq-pmoc-context__eyebrow">PMOC / Preventiva</span>
            <h3 class="eq-pmoc-context__title">Preventiva do equipamento</h3>
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
          <button type="button" class="btn btn--primary btn--sm" data-action="go-register-equip" data-id="${safeId}">
            ${Utils.escapeHtml(pmoc.ctaLabel || 'Registrar preventiva')}
          </button>
        </div>
      </section>`;
}

export function renderViewEquipDetailHtml(model, deps) {
  const resolvedDeps = resolveDetailDeps(deps);
  const { Utils, eqDetailSubtitle, infoRowValueOrEmpty, riskFactorChipHtml } = resolvedDeps;
  const {
    eq,
    regs,
    score,
    cls,
    safeId,
    context,
    risk,
    proximaPreventiva,
    healthSummary,
    ringR,
    ringC,
    ringOffset,
  } = model;
  const setorSelectHtml = renderViewEquipSetorInfoRow(eq, resolvedDeps);
  const svcTimeline = renderViewEquipServiceTimeline(regs, resolvedDeps);
  const coverBlock = renderViewEquipCoverBlock(model, resolvedDeps);
  const pmocContextBlock = renderViewEquipPmocContextBlock(model, resolvedDeps);
  const { dadosPlacaSectionHtml, dadosPlacaExtrasSectionHtml } = renderViewEquipDadosPlacaSections(
    eq,
    resolvedDeps,
  );

  return {
    html: `
    <div class="eq-detail-view">

      ${coverBlock.html}

      <!--
        Title block consolidado (V7 refino UX): nome em h1 + subtítulo
        muted "Local · TAG". Antes a TAG só aparecia dentro do accordion
        e o local mostrava como info-row separado, exigindo scroll ou
        expansão pra info que o técnico precisa de cara. Agora tudo
        identificador essencial fica visível logo após a foto.
      -->
      <div class="eq-detail-title-block">
        <div class="modal__title" id="eq-det-title">${Utils.escapeHtml(eq.nome)}</div>
        <div class="eq-detail-title-block__sub">${eqDetailSubtitle(eq)}</div>
      </div>

      <!-- ── Hero: score + status. Ring usa linearGradient cyan→success
           (V7) pra dar identidade visual ao score saudável. Tones --warn
           e --danger continuam usando cor sólida via classe-modifier. -->
      <div class="eq-detail-hero eq-detail-hero--${cls}">
        <div class="eq-detail-hero__body">
          <div class="eq-hero-score">
            <div class="eq-score-ring-wrap">
              <svg class="eq-score-ring" viewBox="0 0 72 72" aria-hidden="true">
                <defs>
                  <linearGradient id="eq-score-grad-${safeId}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#00c8e8"/>
                    <stop offset="100%" stop-color="#00c853"/>
                  </linearGradient>
                </defs>
                <circle class="eq-score-ring__track" cx="36" cy="36" r="${ringR}"/>
                <circle class="eq-score-ring__fill eq-score-ring__fill--${cls}" cx="36" cy="36" r="${ringR}"
                  stroke-dasharray="${ringC}" stroke-dashoffset="${ringOffset}"
                  ${cls === 'ok' ? `stroke="url(#eq-score-grad-${safeId})"` : ''}/>
              </svg>
              <div class="eq-score-ring__num eq-score-ring__num--${cls}" aria-label="Score ${score}%">${score}%</div>
            </div>
            <div class="eq-hero-score__info">
              <div class="eq-hero-score__summary">${healthSummary}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- V4: galeria/lightbox saíram daqui. Fotos agora são editadas via
           modal-eq-photos aberto pelo avatar CTA. -->

      <!-- ── Painel de risco (V3: sem fórmula exposta) ──
           A fórmula do score saiu deste painel; agora existe apenas um
           botão "?" pequeno no cabeçalho que abre o modal explicativo
           (modal-score-info) com as faixas e fatores.
           O resumo/explicação do risco foi removido também, ficando só:
           label + botão ajuda + classificação+score + chip + factors. -->
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

      ${pmocContextBlock}

      <!-- ── Ficha técnica (V6: accordion colapsável) ──
           Todos os detalhes técnicos (Identificação, Operação, Dados da
           etiqueta) ficam dentro de um único <details> fechado por default.
           Reduz scroll do modal em ~60% — o técnico no campo quase sempre
           quer só ver a foto + registrar serviço, não reler a ficha toda.
           Summary mostra preview curto dos 2 campos mais essenciais
           (Rotina + Próxima preventiva) pra não precisar expandir em 90% dos
           casos. Click no summary expande tudo. -->
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
              <div class="info-row"><span class="info-row__label">Modelo</span>${infoRowValueOrEmpty(eq.modelo, 'Adicionar modelo', safeId, '', 'modelo')}</div>
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

      <!-- ── Histórico de serviços ── -->
      <div class="eq-svc-section">
        <div class="eq-svc-section__header">
          <span class="eq-svc-section__title">Histórico do equipamento</span>
          <button class="btn ${regs.length === 0 ? 'btn--primary' : 'btn--outline'} btn--sm eq-svc-section__cta" data-action="go-register-equip" data-id="${safeId}">
            + Registrar ${regs.length === 0 ? 'primeiro ' : ''}serviço
          </button>
        </div>
        ${svcTimeline}
      </div>

      <!-- ── Footer (V3: 3-ações) ──
           Hierarquia nova:
           · "Registrar serviço" (primary, 60% da largura) — ação mais frequente
           · "Editar" (outline, flex 1) — ação rotineira secundária
           · "Excluir" (danger icon 36×36) — ação irreversível reduzida
           Antes só tinha Editar + Excluir; a primary "Registrar" estava escondida
           no header da seção de histórico (fora do modal). Promovê-la aqui
           alinha a UI com o fluxo real: abrir detalhes → registrar serviço. -->
      <div class="eq-modal-footer eq-modal-footer--tri">
        <button class="btn btn--primary btn--sm eq-modal-footer__btn eq-modal-footer__btn--primary eq-modal-footer__btn--register"
                data-action="go-register-equip" data-id="${safeId}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Registrar serviço
        </button>
        <button class="btn btn--outline btn--sm eq-modal-footer__btn eq-modal-footer__btn--edit"
                data-action="edit-equip" data-id="${safeId}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editar
        </button>
        <!--
          Kebab "Mais ações" substitui a lixeira vermelha que ficava direto
          no footer. Risco de click acidental era real (botão destrutivo a 1
          toque de distância da ação mais comum). Agora a exclusão fica
          atrás de ⋯ → "Excluir" — padrão consistente com o setor-card V3.
        -->
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

    </div>`,
    firstPhotoUrl: coverBlock.firstPhotoUrl,
  };
}
