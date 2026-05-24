# app-v2 - CP55C remocao da UI/modal de assinatura v1

## Objetivo

Remover a UI legada de captura e visualizacao de assinatura depois de CP55A
aposentar captura/salvamento em Registro e CP55B aposentar visualizacao em
Historico.

Este checkpoint nao recria assinatura no app-v2 e nao altera storage real,
router global ou campo persistido `registros.assinatura`.

## Escopo executado

- Removido o barrel legado:
  - `src/ui/components/signature.js`
- Removidos os modais/canvas de assinatura v1:
  - `src/ui/components/signature/signature-canvas.js`
  - `src/ui/components/signature/signature-modal.js`
  - `src/ui/components/signature/signature-viewer-modal.js`
- Removido o teste dedicado da UI/modal legado:
  - `src/__tests__/registroLegacySignatureRender.test.js`
- Atualizados testes de Registro/Historico para nao mockar o barrel removido.
- Atualizado contrato executavel de remocao v1 para garantir que esses arquivos
  nao voltem.

## Fora de escopo

- `src/ui/components/signature/signature-storage.js`.
- `src/core/signatureStorage.js`.
- Integracao de `flushPendingSignatures` em `src/core/storage.js`.
- Referencias de contagem de overlays de assinatura em `src/core/router.js`.
- Campo persistido `registros.assinatura`.
- Assinatura app-v2-native.

## Validacao focada

Executado:

```bash
npm test -- src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/registroSaveSignatureHelpers.test.js src/__tests__/registroSignatureHint.test.js src/__tests__/registroSignatureLegacyHandlers.test.jsx src/__tests__/historicoView.test.js src/__tests__/historicoTimelineLegacyRender.test.js src/__tests__/historicoFilters.contract.test.js src/__tests__/historicoFiltersLegacyRender.test.js src/__tests__/historicoFiltersSheetIntegration.test.js src/__tests__/historicoRegistroIntegration.contract.test.js src/__tests__/signatureResolver.test.js src/__tests__/router.test.js --run
```

Resultado:

- 12 arquivos de teste passaram.
- 103 testes passaram.

## Riscos remanescentes

- O storage legado de assinatura ainda existe para CP55D.
- O router ainda conhece IDs de overlays de assinatura; isso deve ser removido
  em CP dedicado de router ou junto do corte final de storage, sem misturar com
  UI/modal.
- Dados antigos ainda podem conter `registros.assinatura`, mas nao ha mais UI
  v1 para capturar ou visualizar assinatura.

## Proximo passo recomendado

Executar CP55D: remover storage legado de assinatura e sua integracao com
`src/core/storage.js`, com validacao dedicada de storage/cache/offline.
