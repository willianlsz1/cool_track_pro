# app-v2 - Remocao v1 CP-9n: render e setor de Equipamentos

## Objetivo

Remover mais um recorte local de `src/features/equipamentos/**` sem alterar
runtime sensivel, storage, PDF/share, WhatsApp, PMOC, autenticacao ou contratos
publicos.

## Escopo executado

- `src/features/equipamentos/ui/renderEquip.js` foi co-localizado em
  `src/ui/views/equipamentos/ui/renderEquip.js`.
- `src/features/equipamentos/setor/setorUI.js` e
  `src/features/equipamentos/setor/setorState.js` foram co-localizados em
  `src/ui/views/equipamentos/setor/**`.
- Testes focados foram movidos para `src/__tests__`:
  - `equipamentosRenderEquip.test.js`;
  - `equipamentosSetorUI.test.js`;
  - `equipamentosSetorState.test.js`.
- Contratos estaticos foram atualizados para apontar para os novos caminhos.

## Fora de escopo

- Nao foram alterados `setorPersist`, `setorNavigation`, CRUD de equipamento,
  detalhe de equipamento, fotos, PDF/share, WhatsApp, storage real, auth,
  Supabase/RLS, PMOC real ou billing.

## Validacao esperada

```bash
npm test -- src/__tests__/equipamentosRenderEquip.test.js src/__tests__/equipamentosSetorUI.test.js src/__tests__/equipamentosSetorState.test.js src/__tests__/equipamentosSaveEquip.test.js src/__tests__/contracts/selectors.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Risco remanescente

`src/features/equipamentos/**` ainda existe para CRUD, setor persist/navigation e
detalhe de equipamento. A remocao completa deve continuar por recortes pequenos,
preservando testes focados antes de cada move.
