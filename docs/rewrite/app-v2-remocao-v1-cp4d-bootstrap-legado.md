# app-v2 - CP-4d: remocao do bootstrap legado

## Objetivo

Remover `src/app.js`, antigo bootstrap do app v1, depois que `index.html` passou
a montar apenas `src/app-v2/main.tsx`.

## Escopo

- Removido o arquivo `src/app.js`.
- Atualizado contrato de remocao v1 para impedir retorno do bootstrap legado.
- Atualizado comentario de `public/sw-register.js` para nao apontar mais para
  `app.js`.
- Ajustado teste de limpeza React para validar a ausencia do bootstrap legado
  sem ler arquivo removido.

## Fora de escopo

- Nenhuma remocao de `src/ui/**`, `src/features/**`, PDF/share, storage,
  autenticacao, Supabase/RLS, WhatsApp, PMOC ou orcamento real.
- Nenhuma alteracao de `package.json`, Vite, ESLint ou TypeScript.

## Validacao

- `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm test -- src/__tests__/reactCleanupContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
