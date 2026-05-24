# app-v2 - Remocao v1 CP-9w: persistence de save de Registro

## Objetivo

Remover os helpers de persistence de save de Registro de `src/features` e
co-localizar esse recorte com a view legada de Registro, preservando a aplicacao
de `setState` e os efeitos reais no adapter legado.

## Escopo executado

- Movido `src/features/registro/save/persistence.js` para
  `src/ui/views/registro/save/persistence.js`.
- Movido o teste correspondente para
  `src/__tests__/registroSavePersistenceHelpers.test.js`.
- Atualizados imports em `src/ui/views/registro.js` e no contrato PMOC.
- Adicionado contrato para impedir retorno do helper/teste em `src/features`.

## Fora de escopo

- Nao foram alterados fotos, assinatura, post-save, PDF/share, WhatsApp, storage
  real, auth, Supabase/RLS, billing ou pricing.
- Nao foram alterados IDs, `data-action`, `data-nav`, schemas ou payloads
  persistidos.

## Validacao esperada

```bash
npm test -- src/__tests__/registroSavePersistenceHelpers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroPostSaveLegacyFlow.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo risco

Restam `photos.js`, `signature.js`, `postSave.js` e `reportShare.js` em
`src/features/registro/save/**`. `photos.js` ainda e movivel em checkpoint
pequeno porque recebe upload/fallback por DI e nao importa storage/UI
diretamente; assinatura e saidas PDF/WhatsApp continuam mais sensiveis.
