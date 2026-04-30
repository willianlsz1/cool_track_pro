# Preparacao da tela clientes para React

Esta etapa nao migra `clientes` para React. A tela continua renderizada por HTML legado em
`src/ui/views/clientes.js`, mas a preparacao de dados agora passa por
`buildClientesViewModel`.

## Containers publicos

- `#view-clientes`: container da rota.
- `#clientes-root`: raiz renderizada pela view legada. A futura ilha React deve montar apenas aqui ou dentro dele, mantendo a rota intacta.

## Inputs e filtros

- `#cli-search-input`: busca por nome, razao social, CNPJ, endereco e contato.
- `#cli-status-filter`: status `todos`, `ativo`, `sem_manutencao`, `precisa_atencao`.
- `#cli-city-filter`: cidade derivada do endereco.
- `#cli-sort`: `mais_ativos`, `recente`, `antigo`, `nome`, `equips`.
- `#cli-page-size`: tamanhos publicos `6`, `12`, `24`.

## Contratos de acoes

Contratos centralizados em `src/ui/viewModels/clientesContracts.js`.

`data-action` consumido por handlers globais:

- `open-cliente-modal` com `data-mode="create"` ou `data-mode="edit"` e `data-id`.
- `edit-cliente`, `delete-cliente`, `cliente-card-menu` ainda existem em handlers legados e nao devem ser removidos em refactors futuros.

`data-cli-action` consumido pelo adapter da tela:

- `goto-page`, com `data-page`.
- `prev-page`.
- `next-page`.
- `clear-filters`.
- `toggle-summary`.
- `filter-pending`.
- `edit`, com `data-id`.
- `alert`, com `data-id`.
- `delete`, com `data-id`.
- `card-menu`, com `data-id`.
- `ver-equipamentos`, com `data-id`.
- `ver-servicos` (`ver-servi\u00e7os` no DOM), com `data-id`.
- `pmoc-focus`, com `data-id`.
- `open-pmoc-panel`, com `data-id`.

## Classes publicas do CSS legado

A futura ilha deve preservar as classes `cli-*` usadas pelo CSS atual, principalmente:

- `cli-page`, `cli-page__header`, `cli-page__title`, `cli-page__sub`, `cli-page__cta`.
- `cli-filters`, `cli-search`, `cli-search__input`, `cli-select`, `cli-select__input`.
- `cli-context`, `cli-alert`, `cli-summary`, `cli-kpis`, `cli-kpi`.
- `cli-grid`, `cli-card`, `cli-card__head`, `cli-card__name`, `cli-card__pill`, `cli-card__menu`, `cli-card__action`.
- `cli-empty`, `cli-empty--filter`, `cli-pag`, `cli-pag__page`, `cli-pag__btn`.
- `cli-pmoc`.

## Paywall e Pro

A regra de acesso Pro continua fora da view, em `src/ui/controller/routes.js`, usando
`getClientesAccessSnapshot`, `resolveClientesAccess` e `ClientesPaywallModal.open`.
A futura ilha React nao deve decidir acesso nem abrir paywall.

## Navegacao legada

- `ver-equipamentos` chama `goTo('equipamentos', { equipCtx: { clienteId, clienteNome } })`.
- `ver-servicos` chama `goTo('historico', { clienteId, clienteNome })`.
- PMOC abre `ClientePmocPanel.open`.
- Alertas abrem `ClienteAlertModal.open`.
- Criacao/edicao continuam em `ClienteModal`.

## Estados vazios

- Sem clientes: mostra `renderEmptyState()` com CTA `open-cliente-modal`.
- Com clientes mas sem resultado de filtro: mostra `renderEmptyFilter(searchTerm)` com `clear-filters`.

## Preparado para React

- `buildClientesViewModel` nao acessa DOM, React, router, storage ou backend.
- Contratos de ids, filtros, status, sort, page size e acoes foram centralizados.
- A view principal le estado, monta o view model e delega renderizacao aos renderers legados.
- Testes cobrem estado vazio, lista, filtros/status, contratos, paywall, navegacao legada e XSS.

## Bloqueios antes da ilha React

- O menu kebab ainda manipula DOM no adapter legado.
- O foco da busca e restaurado apos re-render pelo adapter.
- `renderSummary` ainda consulta `window.matchMedia` para colapso mobile.
- Modal de cliente, alerta, PMOC, exclusao e navegacao devem ficar fora da primeira ilha React.
- A renderizacao ainda usa `innerHTML`; a ilha React deve substituir esse ponto com JSX sem `dangerouslySetInnerHTML`.
