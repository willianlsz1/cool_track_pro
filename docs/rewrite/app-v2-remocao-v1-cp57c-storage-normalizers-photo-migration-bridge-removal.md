# app-v2 - Remocao v1 CP57C - Storage normalizers photo bridge removal

## Objetivo

Remover de `src/core/storage/normalizers.js` a exportacao duplicada
`migrateLegacyPhotosInState`, que nao tinha consumidor runtime.

## Arquivos alterados

- `src/core/storage/normalizers.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Decisao

O caminho ativo de migracao de fotos legadas continua em
`src/core/storage/storageMigrations.js`, importado por `src/core/storage.js`.
Manter outra funcao com o mesmo nome em `normalizers.js` aumentava o acoplamento
com `photoStorage.js` sem uso real.

## Fora de escopo

- Upload real de fotos.
- Fila offline de fotos.
- `src/core/storage/storageMigrations.js`.
- `src/core/photoStorage.js`.
- UI de fotos em Registro, Equipamentos ou Historico.
- Bucket `registro-fotos`, policies, RLS ou migrations.

## Validacao planejada

```bash
npm test -- src/__tests__/storage.integration.test.js src/__tests__/photoStorage.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
