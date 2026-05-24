# app-v2 remocao v1 - CP-9k equipamentos header mount

## Objetivo

Remover `src/features/equipamentos/ui/headerMount.js` por co-localizacao com a
view legada de Equipamentos, sem alterar o contrato de montagem do header.

## Mudanca realizada

- `src/features/equipamentos/ui/headerMount.js` foi movido para
  `src/ui/views/equipamentos/ui/headerMount.js`.
- O adapter `src/ui/views/equipamentos.js` passou a importar o wrapper do novo
  local.
- O teste foi movido para `src/__tests__/equipamentosHeaderMount.test.js`.
- `legacyV1RemovalContracts.test.js` passou a proteger a ausencia do arquivo
  antigo em `src/features`.

## Fora de escopo

- Nao mover `renderEquip`, `renderFlatList`, `toolbar`, `viewEquip`,
  `detail*`, `openEditEquip` ou `deleteEquip`.
- Nao alterar CRUD, storage, setores, fotos, PDF/share, WhatsApp, PMOC,
  Supabase/RLS ou billing/pricing.
- Nao alterar layout, selectors, `data-action`, router ou contratos publicos.

## Risco

Baixo. O arquivo movido e um wrapper pequeno que injeta roots DOM na bridge de
header ja co-localizada em `src/ui/views/equipamentos/bridges`.

## Validacao esperada

- `npm test -- src/__tests__/equipamentosHeaderMount.test.js src/__tests__/equipamentosView.hero.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
