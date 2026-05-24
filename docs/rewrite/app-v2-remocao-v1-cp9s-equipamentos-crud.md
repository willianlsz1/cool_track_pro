# app-v2 - Remocao v1 CP-9s: CRUD de Equipamentos

## Objetivo

Remover o CRUD de Equipamentos de `src/features/equipamentos/**` e co-localizar
esse grupo com a view legada de Equipamentos, sem alterar comportamento de
salvamento, storage real, rotas ou contratos publicos.

## Escopo executado

- Movidos `validate`, `payload`, `persist`, `postSave`, `postActions` e
  `saveEquip` para `src/ui/views/equipamentos/crud/**`.
- Movidos os testes unitarios correspondentes para `src/__tests__`.
- Atualizados os imports da view de Equipamentos e do contrato estatico de
  selectors.
- Adicionado contrato para impedir retorno de `src/features/equipamentos/crud`.

## Fora de escopo

- Nao foram alterados storage real, PDF/share, WhatsApp, auth, Supabase/RLS,
  PMOC real, billing, pricing ou regras comerciais.
- Nao foram alterados IDs, `data-action`, `data-nav`, schemas ou payloads
  persistidos.

## Validacao esperada

```bash
npm test -- src/__tests__/equipamentosCrudValidate.test.js src/__tests__/equipamentosCrudPayload.test.js src/__tests__/equipamentosCrudPersist.test.js src/__tests__/equipamentosCrudPostSave.test.js src/__tests__/equipamentosCrudPostActions.test.js src/__tests__/equipamentosCrudSaveEquip.test.js src/__tests__/contracts/selectors.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/equipamentosSaveEquip.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo risco

`src/features/equipamentos/**` nao possui mais arquivos rastreados. Os proximos
vestigios de `src/features` ficam em `src/features/registro/**` e
`src/features/userData.js`, que devem ser tratados em checkpoints proprios por
cruzarem registro, PMOC, fotos, assinatura, relatorio e share.
