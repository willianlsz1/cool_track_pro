# app-v2 - Remocao v1 CP57A - Photo PDF resolver removal

## Objetivo

Remover do storage legado de fotos o resolver que existia apenas para converter
fotos em data URL para o PDF tecnico v1.

## Arquivos alterados

- `src/core/photoStorage.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Evidencia

`resolvePhotoDataUrlForPdf` e `blobToDataUrl` nao tinham consumidor runtime apos
a remocao do dominio PDF legado. As ocorrencias restantes eram documentais ou
internas ao proprio `photoStorage.js`.

## Fora de escopo

- Upload real de fotos.
- Fila offline de fotos.
- `registro-fotos`, policies, RLS ou migrations de storage.
- UI de fotos em Registro ou Equipamentos.
- Normalizacao de referencias de fotos.
- PDF/share app-v2-native.

## Validacao planejada

```bash
npm test -- src/__tests__/photoStorage.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
