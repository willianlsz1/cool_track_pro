# app-v2 - Remocao v1 CP29: helper de paginacao de Clientes

## Objetivo

Remover o helper legado pequeno `src/ui/views/clientes/paginationRenderer.js`,
mantendo a renderizacao de paginacao no unico consumidor runtime:
`src/ui/views/clientes/pageRenderer.js`.

## Diagnostico

`paginationRenderer.js` tinha apenas um consumidor ativo:

- `src/ui/views/clientes/pageRenderer.js`

O helper nao cruzava areas sensiveis como router, storage, auth, billing,
PDF/share, WhatsApp, PMOC real, Supabase/RLS ou orcamento real.

Durante a leitura, foram encontrados textos corrompidos por mojibake no mesmo
bloco de renderizacao de Clientes. A correcao ficou limitada aos textos tocados
neste checkpoint.

## Alteracoes

- Removido `src/ui/views/clientes/paginationRenderer.js`.
- Co-localizada `renderPagination` em
  `src/ui/views/clientes/pageRenderer.js`.
- Corrigidos textos corrompidos na pagina de Clientes e nos labels de
  paginacao.
- Atualizado o gate `legacyShellRetirementGate.test.js` para proteger a
  remocao.
- Atualizado o plano de vestigios v1 com CP29 e contagem de `src/ui`.

## Fora de escopo

- Nenhuma alteracao em app-v2.
- Nenhuma alteracao em contratos publicos de Clientes.
- Nenhuma alteracao em router, storage, auth, billing, PDF/share, WhatsApp,
  PMOC real, Supabase/RLS ou orcamento real.

## Validacao

Validacao planejada:

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/clientesRenderer.test.js src/__tests__/clientesRenderer.contract.test.js src/__tests__/clientesCardRenderer.test.js src/__tests__/clientesSummaryRenderer.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
