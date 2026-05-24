# app-v2 - CP-7b: remocao do e2e legado de paywall

## Objetivo

Remover o spec e2e legado de fotos/nameplate/paywall que estava skipado e ainda
referenciava checkout, Stripe e rota `pricing` apos a remocao de billing/pricing
do app.

## Escopo

- Removido `e2e/specs/equipamentos-legacy-photos-nameplate-paywall.spec.js`.
- Atualizado `billingPricingCleanupContracts.test.js` para impedir retorno desse
  spec comercial obsoleto.

## Fora de escopo

- Nenhuma mudanca em upload/storage real, analyze-nameplate, Supabase functions,
  billing backend, PDF/share, auth, PMOC ou app-v2 runtime.
- Nenhuma alteracao de configuracao Playwright.

## Validacao

- `npm test -- src/__tests__/billingPricingCleanupContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
