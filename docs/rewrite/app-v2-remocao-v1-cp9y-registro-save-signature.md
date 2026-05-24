# app-v2 - Remocao v1 CP-9y: assinatura de save de Registro

## Objetivo

Remover os helpers de assinatura de save de Registro de `src/features` e
co-localizar esse recorte com a view legada de Registro, preservando lazy import,
storage/fallback, Toast e tratamento de erro por injecao de dependencias.

## Escopo executado

- Movido `src/features/registro/save/signature.js` para
  `src/ui/views/registro/save/signature.js`.
- Movido o teste correspondente para
  `src/__tests__/registroSaveSignatureHelpers.test.js`.
- Atualizado o import em `src/ui/views/registro.js`.
- Adicionado contrato para impedir retorno do helper/teste em `src/features`.

## Fora de escopo

- Nao foram alterados post-save, PDF/share, WhatsApp, storage real, auth,
  Supabase/RLS, billing ou pricing.
- Nao foram alterados IDs, `data-action`, `data-nav`, schemas ou payloads
  persistidos.

## Validacao esperada

```bash
npm test -- src/__tests__/registroSaveSignatureHelpers.test.js src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/registroSignatureLegacyHandlers.test.jsx src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo risco

Proximo checkpoint recomendado: mover o cluster coeso `postSave.js` +
`reportShare.js`, porque ambos compartilham saidas pos-salvamento, PDF e
WhatsApp por DI. Manter testes de fallback/CTA antes de tocar em
`src/features/userData.js`.
