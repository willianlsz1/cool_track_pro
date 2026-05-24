# app-v2 - Remocao v1 CP-9x: fotos de save de Registro

## Objetivo

Remover os helpers de fotos de save de Registro de `src/features` e co-localizar
esse recorte com a view legada de Registro, preservando upload, fallback local,
Toast e tratamento de erro por injecao de dependencias.

## Escopo executado

- Movido `src/features/registro/save/photos.js` para
  `src/ui/views/registro/save/photos.js`.
- Movido o teste correspondente para
  `src/__tests__/registroSavePhotosHelpers.test.js`.
- Atualizado o import em `src/ui/views/registro.js`.
- Adicionado contrato para impedir retorno do helper/teste em `src/features`.
- Corrigido mojibake restrito ao helper/teste movido.

## Fora de escopo

- Nao foram alterados assinatura, post-save, PDF/share, WhatsApp, storage real,
  auth, Supabase/RLS, billing ou pricing.
- Nao foram alterados IDs, `data-action`, `data-nav`, schemas ou payloads
  persistidos.

## Validacao esperada

```bash
npm test -- src/__tests__/registroSavePhotosHelpers.test.js src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/regressions/photo-failure-path.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo risco

Restam `signature.js`, `postSave.js` e `reportShare.js`. `signature.js` pode ser
movido em checkpoint dedicado porque cruza assinatura, storage/fallback e lazy
import, mas os efeitos entram por DI e o helper nao importa UI/storage
diretamente.
