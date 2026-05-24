# CP-3n - Remocao da ilha React do header de equipamentos

## Objetivo

Remover a ilha React legada `equipamentosHeaderIsland` do shell v1 sem alterar
contratos publicos ainda cobertos por testes de equipamentos.

## Alteracoes

- `src/features/equipamentos/bridges/headerBridge.js` passou a renderizar o
  header por DOM direto e seguro.
- Removidos:
  - `src/react/entrypoints/equipamentosHeaderIsland.jsx`
  - `src/react/pages/EquipamentosHeader.jsx`
  - `src/__tests__/equipamentosHeaderIsland.test.jsx`
- Adicionado `src/__tests__/equipamentosHeaderBridge.test.js` para preservar
  contratos do header sem depender de React.
- Atualizados testes de handlers legados para montar o header pela bridge DOM.

## Contratos preservados

- Roots publicos:
  - `#equip-hero`
  - `#equip-filters`
  - `#equip-context-chip`
- Acoes publicas:
  - `go-register-equip`
  - `equip-quickfilter`
  - `equip-clear-cliente-filter`
- Classes publicas do hero, filtros e breadcrumb.
- Texto dinamico inserido via `textContent`/atributos, sem `innerHTML`.

## Fora de escopo

- Remocao da lista React de equipamentos.
- Remocao de views/controllers v1.
- Alteracoes em app-v2, storage, PDF/share, billing, Supabase/RLS ou router.

## Validacao esperada

```bash
npm test -- src/__tests__/equipamentosHeaderBridge.test.js src/__tests__/equipamentosLegacyHeaderHandlers.test.js src/features/equipamentos/__tests__/bridges/headerBridge.test.js src/features/equipamentos/__tests__/ui/headerMount.test.js --run
rg -n "equipamentosHeaderIsland|EquipamentosHeader|mountEquipamentosHeaderReact|unmountEquipamentosHeaderReact|reactEquipamentosHeaderMounted|data-react-equipamentos-header" src\ui src\features src\react index.html public -S
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
