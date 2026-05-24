# app-v2 - CP-2c shareReport sem dependencia de onboarding UI

## 1. Objetivo

Remover a dependencia de `src/domain/pdf/shareReport.js` sobre
`src/ui/components/onboarding/onboardingChecklist.js`, encerrando o warning
arquitetural conhecido de `domain` importando `ui`.

## 2. Mudanca

- `src/domain/pdf/shareReport.js` deixou de importar `OnboardingChecklist`.
- `downloadPdfLocally()` ficou limitado ao fallback de download local.
- A marcacao do passo `pdf` permanece nos handlers de UI que ja controlam os
  fluxos de relatorio:
  - download direto de PDF;
  - compartilhamento via WhatsApp/Web Share;
  - geracao de PMOC.
- O contrato de relatorio foi reforcado para garantir que `shareReport.js` nao
  volte a importar onboarding de UI.

## 3. Fora de escopo

- Alterar PDF/share, Supabase Storage, Web Share API, WhatsApp ou quotas.
- Mover `OnboardingChecklist` para outro modulo.
- Remover componentes ou testes legados de onboarding.
- Refatorar handlers de relatorio.

## 4. Risco

Risco baixo controlado. O efeito colateral de onboarding era especifico de UI e
ja e executado no fluxo chamador quando `shareReportPdf()` retorna sucesso. O
dominio deixa de conhecer onboarding sem alterar canais de compartilhamento.

## 5. Validacao esperada

```bash
npm test -- src/__tests__/shareReport.test.js src/__tests__/reportExportContracts.test.js src/__tests__/reportExportHandlers.test.js --run
rg -n "ui/components/onboarding|onboardingChecklist" src/domain
npm run format
npm run build
npm run check
```

## 6. Proximo passo

Com CP-2a, CP-2b e CP-2c fechados, revisar novamente o inventario CP-1 e
escolher o primeiro bloco seguro de remocao real do legado/v1.
