# app-v2 - Remocao v1 CP-8d - Unicode e2e legado skipado

## Objetivo

Remover o E2E legado de unicode/acentuacao que permanecia skipado depois da
promocao do app-v2 para entrada principal.

## Arquivos alterados

- `e2e/specs/unicode-escapes.spec.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`

## Evidencia

O spec removido estava marcado como `test.skip` e dependia de contratos do app
legado/v1:

- `#main-content`
- `body[data-route="inicio"]`
- `src/core/router.js`
- rotas internas `relatorio` e `historico`
- views DOM legadas `#view-relatorio` e `#view-historico`

O proprio arquivo documentava falha anterior de CI ligada a timing de boot,
hidratacao ou diferenca de encoding.

## Alteracao

- Removido `e2e/specs/unicode-escapes.spec.js`.
- Adicionado contrato em `legacyV1RemovalContracts.test.js` para impedir retorno
  do E2E legado skipado.

## Fora de escopo

Este checkpoint nao altera:

- runtime de encoding/copy;
- app-v2;
- Registro, Relatorio, Historico ou Orcamentos;
- PDF/share;
- WhatsApp;
- storage real;
- Supabase/RLS;
- billing ou pricing.

## Validacao esperada

1. RED:
   `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
   deve falhar enquanto o spec legado existir.
2. GREEN:
   o mesmo teste deve passar depois da remocao.
3. Validacao geral:
   `npm run format`, `npm run build`, `npm run check` e `git diff --check`.
