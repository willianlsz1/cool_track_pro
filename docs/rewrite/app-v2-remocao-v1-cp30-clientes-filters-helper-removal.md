# app-v2 - Remocao v1 CP30: helper de filtros de Clientes

## Objetivo

Remover o helper legado pequeno `src/ui/views/clientes/filtersRenderer.js`,
mantendo a renderizacao dos filtros no unico consumidor runtime:
`src/ui/views/clientes/pageRenderer.js`.

## Diagnostico

`filtersRenderer.js` tinha apenas um consumidor runtime ativo:

- `src/ui/views/clientes/pageRenderer.js`

Havia um teste de contrato lendo o arquivo diretamente para garantir que a busca
de Clientes usa `CLIENTES_PUBLIC_IDS.searchInput`, nao `#clientes-busca`. Esse
teste foi redirecionado para `pageRenderer.js`, onde o contrato passou a viver.

O helper nao cruzava router, storage, auth, billing, PDF/share, WhatsApp, PMOC
real, Supabase/RLS ou orcamento real.

## Alteracoes

- Removido `src/ui/views/clientes/filtersRenderer.js`.
- Co-localizada `renderFilters` em `src/ui/views/clientes/pageRenderer.js`.
- Corrigido mojibake no placeholder de busca de Clientes.
- Atualizados os testes de contrato/gate para proteger a remocao.
- Atualizado o plano de vestigios v1 com CP30 e contagem de `src/ui`.

## Fora de escopo

- Nenhuma alteracao em app-v2.
- Nenhuma alteracao em contratos publicos de Clientes.
- Nenhuma alteracao em router, storage, auth, billing, PDF/share, WhatsApp,
  PMOC real, Supabase/RLS ou orcamento real.

## Validacao

Validacao planejada:

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/reactCleanupContracts.test.js src/__tests__/clientesRenderer.test.js src/__tests__/clientesRenderer.contract.test.js src/__tests__/clientesCardRenderer.test.js src/__tests__/clientesSummaryRenderer.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
