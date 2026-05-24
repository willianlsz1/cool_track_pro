# app-v2 - CP26 remocao do barrel legado de clientes renderers

## Objetivo

Remover um barrel legado redundante da view de Clientes sem alterar o DOM ou os
contratos publicos da tela.

## Diagnostico

Comando usado:

```bash
rg -n "./renderers\\.js|renderers\\.js|renderCard|renderFilters|renderEmptyState|renderPagination" src/ui/views/clientes src/__tests__ docs/rewrite e2e index.html vite.config.js
```

Resultado:

- `src/ui/views/clientes/renderers.js` apenas reexportava `cardRenderer`,
  `filtersRenderer`, `paginationRenderer` e `emptyStateRenderer`.
- O unico consumidor runtime era `src/ui/views/clientes/pageRenderer.js`.
- Testes focados ja importavam os renderers reais diretamente, nao o barrel.

## Arquivos alterados

- Removido: `src/ui/views/clientes/renderers.js`
- Atualizado: `src/ui/views/clientes/pageRenderer.js`
- Atualizado: `src/__tests__/legacyShellRetirementGate.test.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora de escopo

- Renderers reais de Clientes.
- Contratos `data-action`, IDs, classes publicas, storage, auth, Supabase/RLS,
  PDF/share, WhatsApp, PMOC, assinatura e orcamento real.

## Validacao esperada

- `npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/clientesRenderer.test.js src/__tests__/clientesRenderer.contract.test.js src/__tests__/clientesCardRenderer.test.js src/__tests__/clientesSummaryRenderer.test.js --run`
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
