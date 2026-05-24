# app-v2 - CP55D remocao do storage legado de assinatura

## Objetivo

Remover o storage legado de assinatura depois que captura, salvamento,
visualizacao e UI/modal de assinatura foram aposentados nos CPs anteriores.

Este CP nao recria assinatura no app-v2. Assinatura app-v2-native deve ser
planejada em etapa propria.

## Escopo alterado

- `src/core/signatureStorage.js` removido.
- `src/ui/components/signature/signature-storage.js` removido.
- Flush automatico de assinaturas pendentes removido de
  `src/core/storage.js`.
- Testes dedicados de storage, flush e resolver de assinatura removidos.
- Contrato offline ajustado para nao depender de fila de assinatura legada.
- Contrato de remocao v1 atualizado para travar a ausencia do storage legado.

## Fora do escopo

- Schema, migrations, RLS ou policies Supabase.
- Campo persistido `registros.assinatura`.
- Router global e overlays antigos.
- Fotos, upload/storage de fotos, PDF/share, WhatsApp, billing e PMOC.
- Nova assinatura app-v2-native.

## Risco

Medio. A area toca storage/sync legado. O risco foi reduzido porque os CPs
anteriores ja neutralizaram captura, payload, visualizacao e UI/modal de
assinatura, e este CP remove somente a infraestrutura de assinatura sem tocar
fotos ou sync geral.

## Validacao esperada

- `npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/registroSaveSignatureHelpers.test.js src/__tests__/storageCacheOffline.contract.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
