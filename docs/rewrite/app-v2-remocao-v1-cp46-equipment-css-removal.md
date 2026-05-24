# app-v2 - CP46: remocao de CSS legado de equipamentos

## Objetivo

Remover assets CSS legados da Mudanca 21 / CP-H e CP-I que pertenciam ao visual
do v1 e nao participam do runtime principal app-v2.

## Escopo

- Removido `src/assets/styles/equipment-detail-cp-h.css`.
- Removido `src/assets/styles/equipment-list-cp-i.css`.
- Removido `src/__tests__/equipamentosCpIAssets.test.js`, que preservava esses
  assets por contrato antigo.
- Ampliado `legacyV1RemovalContracts` para bloquear o retorno desses arquivos e
  garantir que o `index.html` nao volte a carrega-los.

## Evidencia

Antes da remocao, as unicas referencias diretas aos arquivos estavam em:

- `src/__tests__/equipamentosCpIAssets.test.js`;
- `src/app-v2/primaryCutover.test.ts`, apenas como contrato negativo;
- comentarios/termos de historico dos proprios CSS.

Nao havia import ou carregamento em `index.html`, `src/app-v2`, `public`,
`e2e`, `vite.config.js` ou `package.json`.

## Fora de escopo

- `components.css` e `redesign.css`.
- Fluxos v1 de equipamentos ainda existentes como baseline congelado.
- Router, storage, Supabase/RLS, PDF/share, WhatsApp, upload/storage, billing,
  PMOC, orcamento real ou assinatura.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/billingPricingCleanupContracts.test.js src/__tests__/legacyShellRetirementGate.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx src/app-v2/primaryCutover.test.ts --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
