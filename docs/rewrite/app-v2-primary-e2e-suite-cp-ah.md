# app-v2 - CP-AH - E2E do PR de corte principal

## Objetivo

Alinhar o workflow E2E do PR de corte principal ao app-v2 como root sem tocar no
runtime do produto, no legado/v1, PDF/share, WhatsApp, billing, storage,
Supabase/RLS, `manualChunks` ou dependencias.

## Diagnostico

Depois da CP-AB, `/` monta `src/app-v2/main.tsx`. O workflow E2E ainda executava
todas as specs historicas, incluindo specs criadas para o shell legado em `/`.
No PR de corte, isso gerou falhas esperadas de escopo: os testes legados
procuravam `#main-content`, rotas `data-route`, modais e ilhas React do v1 que
nao existem no root app-v2.

Tambem havia uma falha real em `app-v2-service-layout.spec.js`: o teste tentava
clicar em um botao cujo accessible name comecava por `Preventiva`, mas o card
atual comeca por `Limpeza preventiva`.

## Mudanca

- O workflow `.github/workflows/e2e.yml` passou a rodar, neste checkpoint, as
  specs E2E relevantes para o root app-v2:
  - `app-v2-primary-entrypoint.spec.js`
  - `app-v2-authenticated-primary.spec.js`
  - `app-v2-service-layout.spec.js`
- `app-v2-service-layout.spec.js` passou a selecionar o card por
  `Limpeza preventiva`, que corresponde ao accessible name atual.
- `ServiceStepExecution` aumentou o respiro entre label e campo nos grupos de
  execucao para cumprir a regra visual ja coberta pelo E2E.

## Fora de escopo

- Migrar todas as specs legadas para app-v2.
- Remover specs legadas.
- Alterar runtime v1 ou app-v2.
- Redesenhar o fluxo de servico.
- Alterar `package.json` ou `package-lock.json`.
- Tocar em PDF/share, WhatsApp, billing, upload/storage, PMOC ou Supabase/RLS.

## Validacao esperada

- `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-primary-entrypoint.spec.js e2e/specs/app-v2-authenticated-primary.spec.js e2e/specs/app-v2-service-layout.spec.js`
- `npm run format`
- `npm run build`
- `npm run check`
- `npm run size`
- `git diff --check`

## Risco remanescente

As specs legadas continuam existindo como referencia do v1, mas nao sao mais o
gate adequado para o PR em que `/` passa a ser app-v2. A migracao ou arquivamento
formal dessas specs deve ser tratada em uma etapa propria de harness E2E.
