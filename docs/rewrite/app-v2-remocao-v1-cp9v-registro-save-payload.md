# app-v2 - Remocao v1 CP-9v: payload de save de Registro

## Objetivo

Remover o helper puro de payload de save de Registro de `src/features` e
co-localizar esse recorte com a view legada de Registro, sem tocar em
persistencia, fotos, assinatura, PDF/share, WhatsApp ou storage real.

## Escopo executado

- Movido `src/features/registro/save/payload.js` para
  `src/ui/views/registro/save/payload.js`.
- Movido o teste correspondente para
  `src/__tests__/registroSavePayloadHelpers.test.js`.
- Atualizado o import em `src/ui/views/registro.js`.
- Adicionado contrato para impedir retorno do helper/teste em `src/features`.
- Corrigido mojibake restrito ao helper/teste movido.

## Fora de escopo

- Nao foram alterados persistence, fotos, assinatura, post-save, PDF/share,
  WhatsApp, storage real, auth, Supabase/RLS, billing ou pricing.
- Nao foram alterados IDs, `data-action`, `data-nav`, schemas ou payloads
  persistidos.

## Validacao esperada

```bash
npm test -- src/__tests__/registroSavePayloadHelpers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroPostSaveLegacyFlow.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo risco

Restam em `src/features/registro/save/**`: `persistence.js`, `photos.js`,
`signature.js`, `postSave.js` e `reportShare.js`, alem dos testes
correspondentes. Esses arquivos devem continuar em subcheckpoints dedicados
porque tocam persistencia, upload/fallback de fotos, assinatura e saidas
PDF/WhatsApp.
