import { buildSetorGridForClienteModel } from './setorState.js';

let deps = {
  Utils: null,
  emptyStateHtml: null,
  getState: null,
  setorCardHtml: null,
  setToolbar: null,
  unmountEquipamentosList: null,
};

export function configureSetorUI(nextDeps = {}) {
  deps = { ...deps, ...nextDeps };
}

/**
 * Markup do "+ Novo setor" em modo locked.
 * Visual cinza, disabled de verdade (não dispara o handler open-setor-modal)
 * e com um cadeado para deixar explicito que o recurso esta indisponivel.
 */
export function _lockedSetorBtnHtml() {
  return `
    <button
      type="button"
      class="btn btn--outline btn--sm btn--locked"
      disabled
      aria-disabled="true"
      title="Setores indisponiveis neste perfil"
    >
      <span aria-hidden="true">🔒</span>
      + Novo setor
      <span class="btn__pro-pill" aria-hidden="true">Indisponivel</span>
    </button>
  `;
}

/** Renderiza a grade de setores. */
export function renderSetorGrid() {
  const el = deps.Utils.getEl('lista-equip');
  if (!el) return;
  deps.unmountEquipamentosList();

  const { setores, equipamentos } = deps.getState();
  const searchBar = deps.Utils.getEl('equip-search-bar');
  if (searchBar) searchBar.style.display = 'none'; // grade não usa busca

  deps.setToolbar({
    title: 'Setores',
    extraBtn: `<button class="btn btn--outline btn--sm" data-action="open-setor-modal">+ Novo setor</button>`,
  });

  if (!setores.length) {
    el.innerHTML = deps.emptyStateHtml({
      icon: '🗂️',
      title: 'Nenhum setor criado',
      description: 'Crie setores para organizar seus equipamentos por local ou área de trabalho.',
      cta: {
        label: '+ Criar primeiro setor',
        action: 'open-setor-modal',
        tone: 'primary',
        size: 'sm',
        autoWidth: true,
      },
    });
    return;
  }

  const setorCards = setores.map((s) => {
    const eqs = equipamentos.filter((e) => e.setorId === s.id);
    return deps.setorCardHtml(s, eqs);
  });

  // Órfãos ("Sem setor") são surfaçados pelo tile do equip-hero; o drill-down
  // abre via data-id="sem-setor" → __sem_setor__. Nada aqui no grid.
  el.innerHTML = `<div class="setor-grid">${setorCards.join('')}</div>`;
}

/**
 * Renderiza grade de setores filtrada por cliente. Vinda de
 * /clientes -> "Ver equipamentos". Mostra so os setores DAQUELE cliente.
 */
export function renderSetorGridForCliente(clienteId, clienteNome) {
  const el = deps.Utils.getEl('lista-equip');
  if (!el) return;
  deps.unmountEquipamentosList();

  const { setores, equipamentos } = deps.getState();
  const safeNome = clienteNome || 'cliente';

  _prepareSetorGridForClienteShell({ clienteId, safeNome });

  const model = buildSetorGridForClienteModel({ setores, equipamentos, clienteId });
  el.innerHTML = _renderSetorGridForClienteHtml({ ...model, clienteId, safeNome });
}

export function _prepareSetorGridForClienteShell({ clienteId, safeNome }) {
  // Esconde search bar + view toggle em contexto cliente (irrelevantes na
  // grade de setores enxuta).
  const searchBar = deps.Utils.getEl('equip-search-bar');
  if (searchBar) searchBar.style.display = 'none';
  const viewToggle = document.querySelector('.equip-view-toggle');
  if (viewToggle) viewToggle.style.display = 'none';

  // Toolbar enxuto: SEM "+ Novo equipamento" (acessado via drill-down do setor).
  // Apenas: + Novo setor (primario) + Limpar cliente (ghost discreto).
  deps.setToolbar({
    title: `Setores de ${safeNome}`,
    extraBtn: `
      <button class="btn btn--primary btn--sm" data-action="open-setor-modal" data-cliente-id="${deps.Utils.escapeAttr(clienteId)}">+ Novo setor</button>
      <button class="btn btn--ghost btn--sm" data-action="equip-clear-cliente-filter" title="Voltar pra grade global">x Limpar cliente</button>
    `,
    hideDefaultCta: true,
  });
}

export function _renderSetorGridForClienteHtml({
  setoresDoCliente,
  equipamentos,
  equipsSemSetor,
  clienteId,
  safeNome,
}) {
  // Hero convidativo + (opcional) banner Sem setor: mostrado quando o cliente
  // ainda não tem nenhum setor real cadastrado.
  if (!setoresDoCliente.length) {
    return _renderSetorGridForClienteEmptyHtml({ equipsSemSetor, clienteId, safeNome });
  }

  const setorCards = setoresDoCliente.map((s) => {
    const eqs = (equipamentos || []).filter(
      (e) => e.setorId === s.id && (!e.clienteId || e.clienteId === clienteId),
    );
    return deps.setorCardHtml(s, eqs);
  });

  let semSetorTile = '';
  if (equipsSemSetor.length) {
    semSetorTile = `
      <article class="setor-card setor-card--sem-setor" data-action="open-setor" data-id="__sem_setor__">
        <div class="setor-card__head">
          <div class="setor-card__title">
            <h3 class="setor-card__name">Sem setor</h3>
            <p class="setor-card__sub">${equipsSemSetor.length} equipamento${equipsSemSetor.length !== 1 ? 's' : ''} sem setor vinculado</p>
          </div>
        </div>
      </article>`;
  }

  return `<div class="setor-grid">${setorCards.join('')}${semSetorTile}</div>`;
}

export function _renderSetorGridForClienteEmptyHtml({ equipsSemSetor, clienteId, safeNome }) {
  const semSetorBanner = equipsSemSetor.length
    ? `
        <div class="setor-cliente-empty__sem-banner">
          <div class="setor-cliente-empty__sem-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="setor-cliente-empty__sem-body">
            <strong>${equipsSemSetor.length} equipamento${equipsSemSetor.length !== 1 ? 's' : ''} sem setor vinculado</strong>
            <p>Apos criar o primeiro setor, você pode vincular os equipamentos existentes a ele.</p>
          </div>
          <button type="button" class="setor-cliente-empty__sem-link"
            data-action="open-setor" data-id="__sem_setor__">
            Ver equipamento${equipsSemSetor.length !== 1 ? 's' : ''}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18"/>
            </svg>
          </button>
        </div>`
    : '';

  return `
      <section class="setor-cliente-empty" aria-label="Cliente sem setores ainda">
        <div class="setor-cliente-empty__hero">
          <div class="setor-cliente-empty__art" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/>
              <path d="M21 7H3l1.5-3a1 1 0 0 1 .9-.5h13.2a1 1 0 0 1 .9.5L21 7z"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
          </div>
          <h2 class="setor-cliente-empty__title">Setores sao opcionais para ${deps.Utils.escapeHtml(safeNome)}</h2>
          <p class="setor-cliente-empty__sub">Voce pode manter equipamentos direto no cliente e criar setores depois.</p>
          <p class="setor-cliente-empty__sub">
            Setores agrupam equipamentos por area, andar ou bloco. Ajuda a organizar
            grandes carteiras (matriz, filial, sala tecnica) e manter o atendimento claro.
          </p>
          <button type="button" class="setor-cliente-empty__cta"
            data-action="open-setor-modal" data-cliente-id="${deps.Utils.escapeAttr(clienteId)}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>+ Novo setor</span>
          </button>
          <div class="setor-cliente-empty__hints">
            <div class="setor-cliente-empty__hint">
              <span class="setor-cliente-empty__hint-num">1</span>
              <span>Cadastre equipamentos direto no cliente quando ele for simples</span>
            </div>
            <div class="setor-cliente-empty__hint">
              <span class="setor-cliente-empty__hint-num">2</span>
              <span>Use setores apenas para clientes com areas ou blocos</span>
            </div>
            <div class="setor-cliente-empty__hint">
              <span class="setor-cliente-empty__hint-num">3</span>
              <span>Registre manutencoes e gere relatorios tecnicos</span>
            </div>
          </div>
        </div>
        ${semSetorBanner}
      </section>`;
}
