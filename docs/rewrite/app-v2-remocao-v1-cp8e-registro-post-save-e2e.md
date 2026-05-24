# app-v2 - Remocao v1 CP-8e - Registro post-save e2e skipado

## Objetivo

Remover o E2E legado de pos-salvamento de Registro que permanecia totalmente
skipado depois da promocao do app-v2 para entrada principal.

## Arquivos alterados

- `e2e/specs/registro-post-save.spec.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`

## Evidencia

O spec removido continha apenas testes `test.skip` e dependia de contratos do
app legado/v1:

- `#main-content`
- `body[data-route="inicio"]`
- `src/core/router.js`
- `#view-registro`
- roots de ilhas React legadas de Registro
- mock direto de `src/ui/controller/handlers/reportExportHandlers.js`

O proprio arquivo documentava falha anterior de CI associada a boot/lazy bridge
do shell legado.

## Cobertura preservada

Este checkpoint nao remove os testes unitarios/de integracao existentes que
cobrem contratos sensiveis de Registro, PDF e WhatsApp. Ele remove apenas o E2E
skipado, que nao rodava na suite.

## Alteracao

- Removido `e2e/specs/registro-post-save.spec.js`.
- Adicionado contrato em `legacyV1RemovalContracts.test.js` para impedir retorno
  do E2E legado skipado.

## Fora de escopo

Este checkpoint nao altera:

- runtime de Registro;
- fluxo real de salvar registro;
- PDF/share;
- WhatsApp;
- storage real;
- Supabase/RLS;
- app-v2;
- billing ou pricing.

## Validacao esperada

1. RED:
   `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
   deve falhar enquanto o spec legado existir.
2. GREEN:
   o mesmo teste deve passar depois da remocao.
3. Validacao geral:
   `npm run format`, `npm run build`, `npm run check` e `git diff --check`.
