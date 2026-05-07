import { Utils } from '../../core/utils.js';

const VIEW_ID = 'view-configuracoes';

function renderSection(title, items) {
  return `
    <section class="cfg-page__section" aria-label="${Utils.escapeAttr(title)}">
      <h2 class="cfg-page__section-title">${Utils.escapeHtml(title)}</h2>
      <div class="cfg-page__list">
        ${items
          .map(
            (item) => `
          <button type="button" class="cfg-page__item" ${item.dataAttr}>
            <span class="cfg-page__item-label">${Utils.escapeHtml(item.label)}</span>
          </button>
        `,
          )
          .join('')}
      </div>
    </section>
  `;
}

export function renderConfiguracoes() {
  const root = Utils.getEl(VIEW_ID);
  if (!root) return;

  root.innerHTML = `
    <section class="cfg-page" aria-labelledby="cfg-title">
      <header class="cfg-page__header">
        <h1 id="cfg-title" class="cfg-page__title">Configurações</h1>
        <p class="cfg-page__subtitle">Acesse atalhos, preferências da conta e recursos de ajuda do CoolTrackPro.</p>
      </header>

      ${renderSection('Ações rápidas', [
        { label: 'Registrar serviço', dataAttr: 'data-nav="registro"' },
        { label: 'Novo orçamento', dataAttr: 'data-action="go-orcamentos"' },
        { label: 'Gerar PMOC', dataAttr: 'data-action="open-pmoc-modal"' },
      ])}

      ${renderSection('Gestão', [
        { label: 'Clientes', dataAttr: 'id="cfg-go-clientes" data-nav="clientes"' },
        { label: 'Orçamentos', dataAttr: 'data-action="go-orcamentos"' },
        { label: 'Alertas', dataAttr: 'data-action="go-alertas"' },
      ])}

      ${renderSection('Conta', [{ label: 'Meu perfil', dataAttr: 'data-action="open-profile"' }])}

      ${renderSection('Ajuda', [
        { label: 'Ver tutorial', dataAttr: 'data-action="help-open-tutorial"' },
        { label: 'Como funciona o score', dataAttr: 'data-action="help-score-info"' },
        { label: 'Suporte', dataAttr: 'data-action="help-support"' },
        { label: 'Enviar feedback', dataAttr: 'data-action="help-feedback"' },
      ])}
    </section>
  `;
}
