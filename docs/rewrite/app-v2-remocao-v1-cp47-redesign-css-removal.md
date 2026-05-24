# app-v2 - CP47: remocao do redesign.css legado

## Objetivo

Remover `src/assets/styles/redesign.css`, folha global do redesenho v1 que nao
e carregada pelo entrypoint principal app-v2.

## Escopo

- Removido `src/assets/styles/redesign.css`.
- Ajustados contratos que antes liam o arquivo apenas para verificar ausencia
  de classes antigas.
- Reforcado `legacyV1RemovalContracts` para bloquear retorno do arquivo e seu
  carregamento em `index.html`.

## Evidencia

Antes da remocao, `rg` encontrou referencias diretas ao arquivo apenas em:

- contratos negativos de app-v2/entrypoint;
- `billingPricingCleanupContracts`, que lia a folha para conferir ausencia de
  hooks comerciais;
- `legacyV1RemovalContracts`, que lia a folha para conferir ausencia de
  configuracoes legadas;
- comentario em `tour.test.js`.

Nao havia import ou carregamento em `index.html`, `src/app-v2`, `public`,
`vite.config.js` ou `package.json`.

## Fora de escopo

- `components.css` e parciais em `src/assets/styles/components/`.
- Fluxos v1 ainda existentes como baseline congelado.
- Router, storage, Supabase/RLS, PDF/share, WhatsApp, upload/storage, billing,
  PMOC, orcamento real ou assinatura.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/billingPricingCleanupContracts.test.js src/__tests__/tour.test.js --run
npm test -- src/app-v2/primaryCutover.test.ts --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
