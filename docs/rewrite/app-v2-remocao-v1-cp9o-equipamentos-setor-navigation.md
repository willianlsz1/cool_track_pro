# app-v2 - Remocao v1 CP-9o: navegacao de setor

## Objetivo

Remover o helper de navegacao local de setor de `src/features/equipamentos/**`
e co-localiza-lo com a view legada de Equipamentos.

## Escopo executado

- `src/features/equipamentos/setor/setorNavigation.js` foi movido para
  `src/ui/views/equipamentos/setor/setorNavigation.js`.
- O teste correspondente foi movido para
  `src/__tests__/equipamentosSetorNavigation.test.js`.
- Imports e mocks da view/testes foram atualizados para o novo caminho.
- `legacyV1RemovalContracts.test.js` passou a proteger a ausencia do caminho
  antigo.

## Fora de escopo

- Nao foram alterados setor persist/CRUD, detalhe de equipamento, fotos,
  PDF/share, WhatsApp, storage real, auth, Supabase/RLS, PMOC real ou billing.

## Validacao esperada

```bash
npm test -- src/__tests__/equipamentosSetorNavigation.test.js src/__tests__/equipamentosSaveEquip.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Risco remanescente

`setorPersist.js` ainda permanecia em features neste checkpoint porque tocava
persistencia/Storage/toast/render. Ele foi tratado depois no CP-9r.
