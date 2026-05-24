# app-v2 - CP55E remocao de IDs de assinatura no router

## Objetivo

Remover conhecimento explicito do router sobre os modais legados de assinatura,
que ja nao existem depois dos CPs de captura, visualizacao, UI/modal e storage.

## Escopo alterado

- `src/core/router.js` deixou de contar IDs `modal-signature-overlay` e
  `modal-signature-viewer-overlay`.
- A contagem de camadas bloqueantes agora usa a registry generica
  `registerBlockingLayer`.
- `src/__tests__/router.test.js` passou a cobrir camada bloqueante customizada
  generica em vez de modais de assinatura.
- `src/__tests__/legacyV1RemovalContracts.test.js` trava que o router nao
  conhece mais os IDs legados de assinatura.

## Fora do escopo

- Surface inerte de assinatura no Registro.
- Campo persistido `registros.assinatura`.
- `src/core/orcamentos.js` e assinatura de orcamento.
- Fotos, PDF/share, WhatsApp, PMOC, billing, schema, migrations ou RLS.

## Validacao esperada

- `npm test -- src/__tests__/router.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
