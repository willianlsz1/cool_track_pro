import { Utils } from '../../../core/utils.js';
<<<<<<< HEAD
import { CLIENTES_ACTIONS } from '../../viewModels/clientesContracts.js';
=======
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
import { ICON_PLUS, ICON_USERS } from './constants.js';

export function renderEmptyState() {
  return `
    <section class="cli-empty" aria-label="Nenhum cliente">
      <div class="cli-empty__art" aria-hidden="true">${ICON_USERS}</div>
      <h3 class="cli-empty__title">Nenhum cliente cadastrado</h3>
      <p class="cli-empty__sub">
        Cadastre clientes pra organizar os equipamentos por carteira e gerar
        relatórios PMOC formais.
      </p>
      <button type="button" class="cli-empty__cta"
<<<<<<< HEAD
        data-action="${CLIENTES_ACTIONS.openModal}" data-mode="create">
=======
        data-action="open-cliente-modal" data-mode="create">
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
        ${ICON_PLUS}<span>Cadastrar primeiro cliente</span>
      </button>
    </section>`;
}

export function renderEmptyFilter(searchTerm) {
  const term = Utils.escapeHtml(searchTerm || '');
  const hint = term ? `para "${term}"` : 'com os filtros atuais';
  return `
    <div class="cli-empty cli-empty--filter">
      <p class="cli-empty__sub">Nenhum cliente encontrado ${hint}.</p>
      <button type="button" class="cli-empty__cta cli-empty__cta--ghost"
<<<<<<< HEAD
        data-cli-action="${CLIENTES_ACTIONS.clearFilters}">Limpar filtros</button>
=======
        data-cli-action="clear-filters">Limpar filtros</button>
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
    </div>`;
}
