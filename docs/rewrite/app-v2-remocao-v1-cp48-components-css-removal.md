# app-v2 - CP48: remocao do components.css legado

## Objetivo

Remover a ultima superficie CSS legada em `src/assets/styles/` que nao participa
do runtime principal app-v2.

## Escopo

- Removido `src/assets/styles/components.css`.
- Removidos os parciais em `src/assets/styles/components/`.
- Removido `src/__tests__/setorModal.styles.test.js`, que preservava contrato
  visual de CSS legado.
- Ajustados contratos de billing/pricing, authscreen e remocao v1 para exigir a
  ausencia dos arquivos em vez de ler CSS legado.
- Atualizado comentario obsoleto em `src/ui/views/relatorio.js`.

## Evidencia

Antes da remocao, `rg` encontrou referencias diretas aos arquivos apenas em:

- `billingPricingCleanupContracts`;
- `authscreen.redesign.test`;
- `legacyV1RemovalContracts`;
- `setorModal.styles.test`;
- comentarios/`@import` internos do proprio `components.css`.

Nao havia import ou carregamento em `index.html`, `src/app-v2`, `public`,
`e2e`, `vite.config.js` ou `package.json`.

## Fora de escopo

- CSS localizado em `src/app-v2/styles/`.
- CSS localizado junto a componente legado ainda em uso, como
  `src/ui/components/onboarding/firstTimeExperience.css`.
- Fluxos v1 ainda existentes como baseline congelado.
- Router, storage, Supabase/RLS, PDF/share, WhatsApp, upload/storage, billing,
  PMOC, orcamento real ou assinatura.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/billingPricingCleanupContracts.test.js src/__tests__/authscreen.redesign.test.js --run
npm test -- src/app-v2/primaryCutover.test.ts --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
