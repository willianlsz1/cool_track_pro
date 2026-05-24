# app-v2 - Remocao v1 CP-3s - Equipamentos lista React

## Objetivo

Remover a ilha React legada da lista flat de Equipamentos sem alterar o fluxo
principal do app-v2 e sem tocar em storage, router, PDF/share, WhatsApp,
Supabase/RLS, billing ou pricing.

## Alteracoes

- `src/features/equipamentos/bridges/listBridge.js` deixou de importar
  dinamicamente `src/react/entrypoints/equipamentosListIsland.jsx`.
- Criado `src/features/equipamentos/ui/listRenderer.js` como renderer DOM local
  para a lista de equipamentos.
- Removidos:
  - `src/react/entrypoints/equipamentosListIsland.jsx`
  - `src/react/pages/EquipamentosListPage.jsx`
  - teste React dedicado da ilha antiga.
- O teste da ilha foi convertido para `src/__tests__/equipamentosListRenderer.test.js`.
- Testes de bridge e contratos foram atualizados para o marcador DOM
  `data-equipamentos-list-mounted`.

## Contratos preservados

- `#lista-equip`
- `data-action="view-equip"`
- `data-action="open-eq-photos-editor"`
- `data-action="go-register-equip"`
- `data-action="quick-move-equip-batch"`
- `data-action="toggle-idle-cluster"`
- classes publicas dos cards de equipamento usadas pelo legado.

## Fora de escopo

- Remover o restante de `src/react`.
- Renomear todos os testes com `React` no nome quando ainda cobrem outras ilhas.
- Refatorar `buildReactListViewModel`, que ainda fica como nome historico do
  view model da lista.
- Alterar rotas, storage real, Supabase/RLS, PDF/share, WhatsApp, PMOC,
  billing, pricing ou CSS legado.

## Validacao

Executada validacao focada:

```bash
npm test -- src/features/equipamentos/__tests__/bridges/listBridge.test.js src/__tests__/equipamentosListRenderer.test.js src/features/equipamentos/__tests__/state/bridgeState.test.js src/features/equipamentos/__tests__/ui/renderFlatList.test.js src/__tests__/equipamentosLegacyHeroFiltersContext.test.js src/__tests__/equipamentosHeaderBridge.test.js src/__tests__/equipamentosLegacyHeaderHandlers.test.js src/__tests__/equipamentosLegacySetorDetailHandlers.test.js src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js --run
```

Validacao final planejada:

```bash
npm run format
npm run build
npm run check
git diff --check
```

## Riscos remanescentes

- O renderer DOM ainda usa `innerHTML` internamente, com escape centralizado de
  conteudo dinamico e teste de XSS para o caminho principal.
- Ainda existem ilhas React legadas em Clientes, Historico e Registro.
