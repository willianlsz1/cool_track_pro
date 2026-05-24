# app-v2 - Remocao v1 CP-9p: detalhe de Equipamentos

## Objetivo

Remover o grupo de detalhe de equipamento de `src/features/equipamentos/**` e
co-localiza-lo com a view legada de Equipamentos, sem alterar comportamento.

## Escopo executado

- Movidos para `src/ui/views/equipamentos/ui/**`:
  - `detail.js`;
  - `detailController.js`;
  - `detailModel.js`;
  - `viewEquip.js`.
- Testes correspondentes foram movidos para `src/__tests__`:
  - `equipamentosDetail.test.js`;
  - `equipamentosDetailController.test.js`;
  - `equipamentosDetailModel.test.js`;
  - `equipamentosViewEquip.test.js`.
- Imports da view, contrato de seletores e contrato de remocao v1 foram
  atualizados.

## Fora de escopo

- Nao foram alterados delete/open-edit/CRUD, setor persist, fotos/storage real,
  PDF/share, WhatsApp, auth, Supabase/RLS, PMOC real ou billing.

## Validacao esperada

```bash
npm test -- src/__tests__/equipamentosDetail.test.js src/__tests__/equipamentosDetailController.test.js src/__tests__/equipamentosDetailModel.test.js src/__tests__/equipamentosViewEquip.test.js src/__tests__/contracts/selectors.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Risco remanescente

Ainda restam em `src/features/equipamentos/**` os recortes com mutacao e
persistencia: CRUD, `setorPersist`, delete e open-edit. Esses devem continuar em
checkpoints proprios.
