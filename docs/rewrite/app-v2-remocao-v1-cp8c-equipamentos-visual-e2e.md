# app-v2 - Remocao v1 CP-8c - Equipamentos visual e2e legado

## Objetivo

Remover o smoke visual legado de Equipamentos depois da promocao do app-v2 para
entrada principal.

## Arquivos alterados

- `e2e/specs/equipamentos-visual-smoke.spec.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`

## Evidencia

O spec removido estava marcado como `test.skip` e dependia de contratos do app
legado/v1:

- `#main-content`
- `body[data-route="inicio"]`
- `src/core/router.js`
- `#view-equipamentos`
- `#lista-equip`
- `#modal-eq-det`
- atributos de montagem das ilhas React legadas

O proprio arquivo documentava falha anterior de CI por ausencia de
`data-react-equipamentos-list-mounted`.

## Alteracao

- Removido `e2e/specs/equipamentos-visual-smoke.spec.js`.
- Adicionado contrato em `legacyV1RemovalContracts.test.js` para impedir retorno
  do smoke visual legado de Equipamentos.

## Fora de escopo

Este checkpoint nao altera:

- runtime de Equipamentos;
- app-v2;
- storage real;
- Supabase/RLS;
- PDF/share;
- WhatsApp;
- Registro, Relatorio ou Orcamentos;
- PMOC real;
- billing ou pricing.

## Validacao esperada

1. RED:
   `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
   deve falhar enquanto o spec legado existir.
2. GREEN:
   o mesmo teste deve passar depois da remocao.
3. Validacao geral:
   `npm run format`, `npm run build`, `npm run check` e `git diff --check`.
