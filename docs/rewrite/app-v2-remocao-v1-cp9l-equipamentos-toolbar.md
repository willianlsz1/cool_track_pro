# app-v2 remocao v1 - CP-9l equipamentos toolbar

## Objetivo

Remover `src/features/equipamentos/ui/toolbar.js` por co-localizacao com a view
legada de Equipamentos, preservando o contrato visual e os `data-action`
existentes.

## Mudanca realizada

- `src/features/equipamentos/ui/toolbar.js` foi movido para
  `src/ui/views/equipamentos/ui/toolbar.js`.
- O adapter `src/ui/views/equipamentos.js` passou a importar `configureToolbar`
  e `setToolbar` do novo local.
- O teste foi movido para `src/__tests__/equipamentosToolbar.test.js`.
- `legacyV1RemovalContracts.test.js` passou a proteger a ausencia do arquivo
  antigo em `src/features`.

## Fora de escopo

- Nao alterar CTA, `data-action`, `data-id`, `data-source`, classes, layout ou
  comportamento de toolbar.
- Nao mover `renderEquip`, `renderFlatList`, `viewEquip`, `detail*`,
  `openEditEquip` ou `deleteEquip`.
- Nao alterar CRUD, storage, setores, fotos, PDF/share, WhatsApp, PMOC,
  Supabase/RLS ou billing/pricing.

## Risco

Baixo/medio. O helper usa `innerHTML` para montar acoes da toolbar, mas este
checkpoint nao muda o HTML renderizado nem os contratos publicos.

## Validacao esperada

- `npm test -- src/__tests__/equipamentosToolbar.test.js src/features/equipamentos/__tests__/ui/renderEquip.test.js src/features/equipamentos/__tests__/setor/setorUI.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
