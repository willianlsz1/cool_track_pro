# app-v2 - CP-3y: remocao do e2e de React islands legado

## Objetivo

Remover o smoke e2e `react-islands-lifecycle.spec.js`, que validava ilhas React
do shell v1 depois que `src/react` ja foi removido.

## Escopo

- Removido `e2e/specs/react-islands-lifecycle.spec.js`.
- Atualizado `reactCleanupContracts.test.js` para impedir retorno desse spec
  obsoleto junto aos demais contratos de limpeza React.

## Fora de escopo

- Nenhuma alteracao em runtime v1 restante.
- Nenhuma alteracao em app-v2, PDF/share, storage, auth, Supabase/RLS,
  WhatsApp, PMOC, orcamento real ou configuracao Playwright.

## Validacao

- `npm test -- src/__tests__/reactCleanupContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
