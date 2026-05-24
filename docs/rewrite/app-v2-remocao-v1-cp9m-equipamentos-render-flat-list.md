# app-v2 remocao v1 - CP-9m equipamentos render flat list

## Objetivo

Remover `src/features/equipamentos/ui/renderFlatList.js` por co-localizacao com
a view legada de Equipamentos, preservando a assinatura e a injecao de
dependencias do orquestrador da lista flat.

## Mudanca realizada

- `src/features/equipamentos/ui/renderFlatList.js` foi movido para
  `src/ui/views/equipamentos/ui/renderFlatList.js`.
- O adapter `src/ui/views/equipamentos.js` passou a importar
  `configureRenderFlatList` e `renderFlatList` do novo local.
- O teste foi movido para `src/__tests__/equipamentosRenderFlatList.test.js`.
- `legacyV1RemovalContracts.test.js` passou a proteger a ausencia do arquivo
  antigo em `src/features`.

## Fora de escopo

- Nao alterar assinatura, filtros, quick filters, status de preventiva,
  skeleton, bridge DOM, fallback de imagens ou ordem de chamada.
- Nao mover `renderEquip`, `viewEquip`, `detail*`, `openEditEquip` ou
  `deleteEquip`.
- Nao alterar CRUD, storage, setores, fotos, PDF/share, WhatsApp, PMOC,
  Supabase/RLS ou billing/pricing.

## Risco

Medio. O helper coordena view model, skeleton e bridge DOM da lista de
Equipamentos. O risco foi limitado por manter DI e assinatura e por validar a
ordem de chamadas em teste focado.

## Validacao esperada

- `npm test -- src/__tests__/equipamentosRenderFlatList.test.js src/features/equipamentos/__tests__/ui/renderEquip.test.js src/__tests__/equipamentosLegacyRender.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
