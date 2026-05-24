# app-v2 remocao v1 - CP-8i registro visual e2e

## Objetivo

Remover o E2E visual legado de Registro que ainda dependia do shell/router v1
apos a promocao do app-v2 como entrada principal.

## Arquivo removido

- `e2e/specs/registro-visual-smoke.spec.js`

## Evidencia

O spec removido navegava pela aplicacao v1 e validava contratos DOM visuais do
Registro legado:

- `#main-content`
- `body[data-route="inicio"]`
- import dinamico de `/src/core/router.js`
- rota interna `registro`
- `#view-registro`
- `#registro-header-root`
- `#registro-hero`
- `#r-equip`
- `#r-checklist-body`
- `#registro-photos-root`
- `#registro-signature-hint`
- `data-react-registro-header-mounted`
- `data-react-registro-checklist-mounted`
- `data-react-registro-photos-mounted`
- `data-react-registro-signature-mounted`

Esses contratos pertencem ao runtime legado em `src/ui/` e nao ao app-v2 em
`src/app-v2/`.

## Cobertura preservada

O checkpoint nao removeu testes unitarios ou de contrato do Registro legado
ainda presente na base congelada. Permanecem testes focados para campos,
checklist, assinatura, fotos, save, pos-save e PDF/WhatsApp, incluindo:

- `src/__tests__/registroLegacyHeaderRender.test.js`
- `src/__tests__/registroLegacyFieldHandlers.test.js`
- `src/__tests__/registroLegacyChecklistRender.test.js`
- `src/__tests__/registroChecklistHandlers.test.js`
- `src/__tests__/registroLegacySignatureRender.test.js`
- `src/__tests__/registroSignatureLegacyHandlers.test.jsx`
- `src/__tests__/registroSaveSignatureHandlers.test.js`
- `src/__tests__/registroPostSaveLegacyFlow.test.js`
- `src/__tests__/registroPdfWhatsappLegacyContracts.test.js`
- `src/features/registro/__tests__/`

Tambem foi adicionada trava em
`src/__tests__/legacyV1RemovalContracts.test.js` para impedir retorno acidental
do spec E2E removido.

## Fora de escopo

Nao foram alterados:

- runtime de Registro em `src/ui/`;
- app-v2;
- salvar registro;
- checklist PMOC;
- assinatura;
- fotos/upload/storage;
- PDF/share;
- WhatsApp;
- Supabase/RLS;
- billing/pricing.

## Validacao esperada

- RED: `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
  falha antes da remocao porque o arquivo ainda existe.
- GREEN: `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
  passa apos a remocao.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
