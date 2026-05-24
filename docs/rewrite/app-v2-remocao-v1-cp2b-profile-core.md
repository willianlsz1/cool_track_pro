# app-v2 - CP-2b contrato Profile em core

## 1. Objetivo

Remover a dependencia direta de `src/domain/**` sobre
`src/features/profile.js`, que pertence ao legado/v1, antes da remocao futura de
`src/features/**`.

## 2. Mudanca

- Criado `src/core/profile.js` com a implementacao de `Profile`.
- `src/features/profile.js` passou a ser re-export temporario para manter
  compatibilidade com o v1.
- `src/domain/pdf.js` passou a importar `Profile` de `src/core/profile.js`.
- `src/domain/whatsapp.js` passou a importar `Profile` de `src/core/profile.js`.
- Testes focados de `Profile`, PDF e WhatsApp foram ajustados para mockar o
  novo contrato quando testam `domain`.

## 3. Fora de escopo

- Remover `src/features/profile.js`.
- Atualizar todos os consumidores v1 de `Profile`.
- Alterar user storage, auth, assinatura, PDF/share, WhatsApp real ou billing.
- Remover testes legados que ainda mockam `src/features/profile.js`.

## 4. Risco

Risco medio controlado. `Profile` usa `userStorage` e `localStorage`, portanto
foi movido para `core`, nao para `domain`. O re-export em `features` preserva os
imports legados enquanto o v1 ainda existe.

## 5. Validacao esperada

```bash
npm test -- src/__tests__/profile.userScope.test.js src/__tests__/whatsappExport.test.js src/__tests__/pdfGenerator.registroId.test.js src/__tests__/pdfGenerator.mediaChecklist.contract.test.js src/__tests__/reportExportContracts.test.js --run
rg -n "../features/profile|../../features/profile|features/profile" src/domain src/core src/__tests__/profile.userScope.test.js
npm run format
npm run build
npm run check
```

## 6. Proximo passo

Executar CP-2c: remover a dependencia de `src/domain/pdf/shareReport.js` sobre
`src/ui/components/onboarding/onboardingChecklist.js`.
