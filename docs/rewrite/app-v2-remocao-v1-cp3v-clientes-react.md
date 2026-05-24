# app-v2 remocao v1 - CP-3v clientes React

## Objetivo

Remover a ilha React da tela legada de Clientes mantendo os contratos DOM usados
por filtros, paginacao, cards, menu de acoes, PMOC, navegacao para equipamentos,
historico, orcamentos e registro.

## Alteracoes

- Substituido `src/react/entrypoints/clientesIsland.jsx` por renderer DOM em
  `src/ui/views/clientes/pageRenderer.js`.
- Removido `src/react/pages/ClientesPage.jsx`.
- `src/ui/views/clientes.js` agora monta Clientes por import local estatico.
- Teste da ilha foi convertido para `clientesRenderer.contract.test.js`.
- Textos corrompidos nos renderers DOM de Clientes foram normalizados.

## Contratos preservados

- Root publico: `#clientes-root`.
- Classes publicas principais: `cli-page`, `cli-page__header`, `cli-summary`,
  `cli-filters`, `cli-grid`, `cli-card`, `cli-card__action`, `cli-empty` e
  `cli-pag`.
- IDs publicos:
  - `cli-search-input`
  - `cli-status-filter`
  - `cli-city-filter`
  - `cli-sort`
  - `cli-page-size`
- Atributos publicos:
  - `data-action="open-cliente-modal"`
  - `data-cli-action="ver-equipamentos"`
  - `data-cli-action="ver-servicos"`
  - `data-cli-action="open-pmoc-panel"`
  - `data-cli-action="novo-orcamento"`
  - `data-cli-action="novo-servico"`
  - `data-cli-action="card-menu"`
  - `data-cli-action="clear-filters"`

## Fora de escopo

- PMOC real.
- Storage, router, Supabase/RLS, billing e pricing.
- Redesign visual de Clientes.
- Registro/checklist.

## Validacao

- RED inicial: `npm test -- src\__tests__\clientesRenderer.test.js --run`
  falhou porque `pageRenderer.js` ainda nao existia.
- Foco executado apos implementacao:
  `npm test -- src\__tests__\clientesRenderer.test.js src\__tests__\clientesRenderer.contract.test.js src\__tests__\clientesView.security.test.js src\__tests__\clientesView.pmoc.test.js src\__tests__\clientesSummaryRenderer.test.js --run`.

## Riscos remanescentes

- O renderer usa `innerHTML` controlado localmente; conteudo dinamico passa por
  escaping e testes cobrem texto malicioso.
- PMOC, modal real de cliente e navegacao real nao foram reimplementados; apenas
  os contratos DOM consumidos pelos handlers existentes foram preservados.
