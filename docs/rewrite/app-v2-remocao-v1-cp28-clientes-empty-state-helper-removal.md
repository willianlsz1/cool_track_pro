# app-v2 - CP28 remocao do helper legado de empty state de Clientes

## Objetivo

Remover um helper legado pequeno da tela de Clientes sem alterar DOM publico,
acoes, filtros ou paginacao.

## Diagnostico

Comandos usados:

```bash
rg -n --fixed-strings "emptyStateRenderer.js" src docs/rewrite
rg -n "renderEmptyState|renderEmptyFilter" src/ui/views/clientes src/__tests__ docs/rewrite
```

Resultado:

- `src/ui/views/clientes/emptyStateRenderer.js` tinha apenas um consumidor:
  `src/ui/views/clientes/pageRenderer.js`.
- Os estados vazios dependem apenas de `Utils.escapeHtml`, `CLIENTES_ACTIONS` e
  icones locais de Clientes.

## Arquivos alterados

- Removido: `src/ui/views/clientes/emptyStateRenderer.js`
- Atualizado: `src/ui/views/clientes/pageRenderer.js`
- Atualizado: `src/__tests__/legacyShellRetirementGate.test.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora de escopo

- Renderers de card, filtros, paginacao, summary e view model de Clientes.
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
