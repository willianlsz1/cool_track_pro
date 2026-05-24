# CP-57K - Remocao de mocks test-only do componente legado de fotos

## Objetivo

Remover mocks de teste que ainda apontavam para `src/ui/components/photos.js`
depois que o componente legado de fotos foi aposentado.

## Escopo

- Testes em `src/__tests__` com `vi.mock(...ui/components/photos.js...)`.
- Contrato de remocao em `src/__tests__/legacyV1RemovalContracts.test.js`.

## Alteracoes

- Removidos mocks test-only de `ui/components/photos.js`.
- Ampliado o contrato para impedir retorno de mocks para
  `ui/components/photos.js`, junto dos mocks ja bloqueados de `photoStorage.js`
  e `uploadPendingPhotos`.

## Fora de escopo

- Runtime de fotos.
- Storage real, bucket, policies, migrations ou Supabase/RLS.
- Recriacao app-v2-native de fotos.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/contextualOnboardingHandlers.test.js src/__tests__/equipamentosLegacyHeaderHandlers.test.js src/__tests__/equipamentosLegacyHeroFiltersContext.test.js src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js src/__tests__/equipamentosLegacyRender.test.js src/__tests__/equipamentosLegacySetorDetailHandlers.test.js src/__tests__/equipamentosSaveEquip.test.js src/__tests__/historicoFilters.contract.test.js src/__tests__/historicoFiltersLegacyRender.test.js src/__tests__/historicoFiltersSheetIntegration.test.js src/__tests__/historicoRegistroIntegration.contract.test.js src/__tests__/historicoTimelineLegacyRender.test.js src/__tests__/historicoView.test.js src/__tests__/registroChecklistHandlers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/registroLegacyFieldHandlers.test.js src/__tests__/registroLegacyHeaderRender.test.js src/__tests__/registroLifecycle.contract.test.js src/__tests__/registroMateriaisToggle.test.js src/__tests__/registroProximaPreventivaPrompt.test.js src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/regressions/clear-registro-edit-state.test.js src/__tests__/regressions/edit-preserves-photos.test.js src/__tests__/exploratory/signature-payload.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
