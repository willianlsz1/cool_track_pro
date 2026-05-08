# Mudança 11 / CP-H.6 - Mapeamento de renderFlatList/list branch

## 1. Base

- Branch: `main`
- HEAD: `ed248991dcc5c49166be494f2ee45f2cbb040a42`
- Data: 2026-05-08
- Adapter analisado: `src/ui/views/equipamentos.js`
- LOC atual de src/ui/views/equipamentos.js: 1321

## 2. Objetivo

Mapear em modo read-only o bloco de lista flat de Equipamentos ainda preso no adapter legado, incluindo `renderFlatList`, `_setToolbar`, root/header/list bridges, selectors e dependências usadas por `renderEquip`. Este CP não move funções nem altera `src/`.

## 3. Estado pós CP-H.5

Já foram extraídos para módulos feature-scoped os fluxos de detail model, detail HTML, detail controller, `viewEquip`, `renderEquip`, `openEditEquip` e `deleteEquip`. O adapter ainda compõe dependências por DI e preserva exports legados. O bloco de lista flat permanece no adapter porque ainda acopla state, view model legado, skeleton, bridge React, fallback de imagem e roots DOM.

## 4. Mapeamento de renderFlatList

| Bloco de renderFlatList                                                | Responsabilidade                                                                                    | Dependências                                                                   | Side effects                                             | Risco | Pode mover?                             | Observação                                                                  |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- | ----- | --------------------------------------- | --------------------------------------------------------------------------- |
| Assinatura `renderFlatList(filtro = '', options = {}, setorId = null)` | Entrada pública interna usada por `renderEquip` para lista free, quick filter e drill-down de setor | Chamado via DI por `src/features/equipamentos/ui/renderEquip.js`               | Retorna `undefined`, `null` ou Promise do mount          | Médio | Sim, com DI                             | Precisa preservar exatamente parâmetros e retorno.                          |
| Snapshot de state                                                      | Lê `equipamentos`, `registros`, `clientes`, `setores`                                               | `getState`                                                                     | Nenhum DOM direto                                        | Médio | Sim, com DI                             | Não deve mover regra de state para React.                                   |
| Eval context                                                           | Cria contexto de prioridade, risco, manutenção e idle                                               | `_createEquipRenderEvalContext`                                                | Pode capturar helpers de manutenção e registros          | Médio | Sim, injetado ou importado se sem ciclo | Melhor injetar no primeiro corte para evitar ciclo com adapter.             |
| Filtro por cliente                                                     | Normaliza `options.clienteId` e `options.clienteNome`                                               | `options` vindas de `renderEquip`                                              | Afeta view model e empty state                           | Alto  | Sim                                     | Essencial para fluxo Cliente -> Equipamentos.                               |
| Build do view model legado                                             | Monta lista ordenada, empty copy, quick move, idle/active                                           | `buildEquipamentosViewModel`, `getPreventivaDueEquipmentIds`, evalCtx          | Nenhum DOM direto                                        | Alto  | Sim, com DI                             | É o núcleo funcional da lista; testar quick filter e setor.                 |
| Root `#lista-equip`                                                    | Localiza container da lista                                                                         | `Utils.getEl('lista-equip')`                                                   | Early return se ausente                                  | Alto  | Sim, com DI de root getter              | Preservar comportamento silencioso quando root não existe.                  |
| Idle cluster                                                           | Decide cluster de equipamentos idle                                                                 | `_resolveIdleClusterCollapsed`, `viewModel.idleItems`, `viewModel.activeItems` | Nenhum DOM direto                                        | Médio | Sim                                     | Depende de histerese/counter externo; preservar estado.                     |
| React list view model                                                  | Converte cards e empty state para ilha React                                                        | `buildReactListViewModel`, `isCachedPlanPro`                                   | Nenhum DOM direto                                        | Alto  | Sim                                     | Gera dados que resultam em classes, `data-action`, `data-id` e empty state. |
| Skeleton/loading                                                       | Envolve mount com skeleton de equipamento                                                           | `withSkeleton`, `viewModel.skeletonCount`                                      | Altera temporariamente `#lista-equip`                    | Alto  | Sim, mas com DI                         | Risco de flicker/regressão visual silenciosa.                               |
| Mount React list                                                       | Monta ilha React em `#lista-equip`                                                                  | `mountEquipamentosList`                                                        | Dynamic import via bridge, React mount, generation guard | Alto  | Sim                                     | Bridge já está em feature; manter `onMounted`.                              |
| Fallback de imagens                                                    | Reaplica fallback após mount                                                                        | `_bindEquipCardImageFallbacks(el)`                                             | Binds/fallbacks no DOM da lista                          | Alto  | Sim, DI                                 | Não alterar comportamento de fotos/card icons.                              |

## 5. Mapeamento de \_setToolbar

| Bloco de \_setToolbar                            | Responsabilidade                                | Dependências                                                                                   | Side effects                                     | Risco | Pode mover junto da lista?       |
| ------------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----- | -------------------------------- |
| Assinatura `{ title, extraBtn, hideDefaultCta }` | API interna compartilhada por render/list/setor | Chamado por `renderEquip` e `configureSetorUI`                                                 | Nenhum se roots ausentes                         | Médio | Não no mesmo CP inicial          |
| `equip-page-title`                               | Define título da página                         | `Utils.getEl`, `textContent`                                                                   | Muta DOM                                         | Médio | Separar ou injetar               |
| `equip-page-subtitle`                            | Limpa subtítulo                                 | `Utils.getEl`, `textContent`                                                                   | Muta DOM                                         | Médio | Separar ou injetar               |
| `equip-toolbar-actions`                          | Atualiza botões da toolbar                      | `Utils.getEl`, `innerHTML`                                                                     | Muta DOM com HTML                                | Alto  | Evitar mover junto sem pre-split |
| CTA default                                      | Gera `+ Novo equipamento`                       | Classes `btn`, `btn--primary`, `btn--sm`; `data-action="open-modal"`, `data-id="modal-add-eq"` | Contrato de handler delegado                     | Alto  | Só com teste de selector         |
| `extraBtn`                                       | Injeta botões de quick filter, setor e voltar   | HTML gerado por `renderEquip`/setor                                                            | Pode carregar `data-setor-id`, `data-cliente-id` | Alto  | Melhor mapear/pre-split antes    |
| `hideDefaultCta`                                 | Suprime CTA default em drill-down/setor         | Chamadores de `renderEquip` e setor                                                            | Afeta affordance principal                       | Médio | Separar da lista                 |

## 6. Mapeamento de roots/bridges

| Item de root/bridge        | Responsabilidade                                | Dependências                                                                                        | Usado por                                                 | Risco | Recomendação                                                         |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----- | -------------------------------------------------------------------- |
| `mountEquipamentosHeader`  | Adaptar roots DOM para header bridge            | `Utils.getEl('equip-hero')`, `equip-filters`, `equip-context-chip`, `mountEquipamentosHeaderBridge` | `renderEquip` via DI                                      | Médio | Pode mover depois da lista ou junto de um módulo controller pequeno. |
| `mountEquipamentosList`    | Montar ilha React de lista com generation guard | `listBridge`, dynamic import React, `bridgeState`                                                   | `renderFlatList`                                          | Alto  | Já está feature-scoped; manter como dependência.                     |
| `unmountEquipamentosList`  | Desmontar lista se root estiver montado         | `document.getElementById('lista-equip')`, bridge cache                                              | `configureSetorUI`, testes de bridge                      | Médio | Não mover neste CP; já é feature-scoped.                             |
| `headerBridge`             | Dynamic import da ilha header                   | `react/entrypoints/equipamentosHeaderIsland.jsx`, `bridgeState`                                     | `mountEquipamentosHeader`                                 | Médio | Sem ação imediata.                                                   |
| `listBridge`               | Dynamic import da ilha lista                    | `react/entrypoints/equipamentosListIsland.jsx`, `bridgeState`                                       | `renderFlatList`                                          | Alto  | Contrato já coberto por `listBridge.test.js`.                        |
| `bridgeState`              | Cache e generation counters de header/list      | Estado module-level                                                                                 | Bridges header/list                                       | Médio | Preservar para evitar renders stale.                                 |
| Root legado `#lista-equip` | Container da lista e skeleton                   | DOM legado                                                                                          | `renderFlatList`, `unmountEquipamentosList`, React island | Alto  | Root deve continuar único.                                           |
| Root legado `#equip-hero`  | Container do header React                       | DOM legado                                                                                          | `mountEquipamentosHeader`                                 | Médio | Evitar misturar com list branch no próximo CP.                       |

## 7. Testes existentes relacionados

- `src/__tests__/equipamentosLegacyRender.test.js`: cobre render legado, empty state, lista e contratos básicos do adapter.
- `src/__tests__/equipamentosView.hero.test.js`: cobre KPIs, filtros/hero e parte do contexto de render.
- `src/__tests__/equipamentosReactListIsland.test.jsx`: cobre mount no `#lista-equip`, classes de card, `data-action`, `data-id`, empty state, quick move e XSS sem `innerHTML` React.
- `src/features/equipamentos/__tests__/bridges/listBridge.test.js`: cobre dynamic import memoizado, generation guard, mount, unmount e fallback async.
- `src/features/equipamentos/__tests__/bridges/headerBridge.test.js`: cobre bridge do header e generation guard.
- `src/features/equipamentos/__tests__/ui/renderEquip.test.js`: cobre ordem do orquestrador, quick filter, Pro/setores, toolbar de setor e chamada a `renderFlatList`.
- `src/features/equipamentos/__tests__/utils/viewModels.test.js`: cobre empty state e view model agregado, mas ainda evidencia imports para `ui/views/equipamentos/constants.js` e `helpers.js`.
- `src/__tests__/contracts/selectors.test.js`: snapshot estático de `data-action`, `data-id` e contratos de selectors em equipamentos.
- `src/features/equipamentos/__tests__/setor/setorUI.test.js` e `src/__tests__/setorModal.*.test.js`: relevantes porque `_setToolbar` também é dependência de setor UI.

## 8. Riscos principais

- DOM/root: `renderFlatList` tem early return silencioso quando `#lista-equip` não existe; mover sem preservar isso quebra rotas parciais.
- Bridge React: `mountEquipamentosList` é assíncrono e protegido por generation guard; mudanças de ordem podem criar render stale.
- Skeleton/empty state: `withSkeleton` altera o root antes do mount e depende de `viewModel.skeletonCount`.
- Toolbar: `_setToolbar` usa `innerHTML` e contratos de `data-action`/`data-id`; mover junto da lista mistura responsabilidades.
- Setor: `_setToolbar` é usado indiretamente por setor UI e por drill-down de setor; extrair junto pode ampliar escopo.
- Quick filter: `renderEquip` passa `statusFilter` e setor `__sem_setor__` para `renderFlatList`; contrato precisa de teste.
- Selectors/data-action/data-id/classes: parte nasce em React, parte em toolbar HTML, parte em view models; snapshot estático deve acompanhar arquivo novo se houver move.
- Import circular: há acoplamento existente de `src/features/equipamentos/utils/viewModels.js` para `src/ui/views/equipamentos/constants.js` e `helpers.js`. Não é ciclo direto com o adapter root, mas é risco para mover lista sem antes estabilizar esses imports.
- Regressão visual silenciosa: lista, skeleton e fallback de imagem podem continuar passando testes unitários e falhar visualmente.

## 9. Opções de próximo CP

| Opção de próximo CP                                      | Benefício                                      | Risco       | Pré-requisitos                          | Recomendação                                              |
| -------------------------------------------------------- | ---------------------------------------------- | ----------- | --------------------------------------- | --------------------------------------------------------- |
| CP-H.7 - pre-split in-place de renderFlatList            | Separa responsabilidades sem mexer em DI amplo | Baixo/médio | Testes focados de lista e render        | Recomendado                                               |
| CP-H.7 - mover renderFlatList/list branch direto         | Reduz adapter mais rápido                      | Alto        | Resolver acoplamentos e selectors antes | Não recomendado agora                                     |
| CP-H.7 - mover \_setToolbar junto da lista               | Reduz mais DOM no adapter                      | Alto        | Separar uso por setor e render          | Não recomendado                                           |
| CP-H.7 - separar toolbar antes da lista                  | Isola `innerHTML` e contratos de CTA           | Médio       | Mapear usos por setor/UI                | Alternativa válida, mas menos alinhada ao branch de lista |
| CP-H.7 - mapear/limpar modal/form helpers antes da lista | Reduz riscos de form remanescentes             | Médio       | Novo mapeamento                         | Adiar                                                     |
| CP-H.7 - mapear fachada/shim mínima                      | Ajuda composição final                         | Médio/alto  | Mais blocos movidos                     | Adiar para pós-lista                                      |
| Stability checkpoint pós-Mudança 11                      | Congela comportamento antes de novos moves     | Baixo       | Rodar suíte ampla/e2e se possível       | Útil após o próximo pre-split                             |

## 10. Recomendação final

Recomendo exatamente **CP-H.7 - pre-split in-place de renderFlatList**.

Justificativa: há mais de 90% de confiança para separar localmente `renderFlatList` em helpers pequenos sem mover arquivo: snapshot/contexto, build do view model, resolução do root, idle cluster, build do React view model e mount com skeleton/fallback. Isso reduz o risco antes de uma extração real e evita misturar `_setToolbar`, setor e header no mesmo CP.
