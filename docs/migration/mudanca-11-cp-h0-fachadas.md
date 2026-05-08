# Mudanca 11 / CP-H.0 - Mapeamento de limpeza e fachadas

## 1. Base

- Branch: `main`
- HEAD: `ab707725d8473b91ed343b9fe88853e307d8e10b`
- Data: 2026-05-08
- Adapter analisado: `src/ui/views/equipamentos.js`
- LOC atual de `src/ui/views/equipamentos.js`: 1440

## 2. Estado pos CP-G.6

A Mudanca 11 ja extraiu os principais blocos de Equipamentos para `src/features/equipamentos/`: estado leve, setor, CRUD de save, render plan/list/header bridges, detail model/html/controller, `viewEquip` e `renderEquip`. O adapter legado continua como ponto publico de composicao: importa dependencias antigas e novas, chama os `configure*`, reexporta APIs publicas e mantem blocos ainda acoplados ao DOM legado.

Hoje `renderEquip` e `viewEquip` estao feature-scoped, mas ainda recebem por DI dependencias que permanecem no adapter, principalmente `renderFlatList`, `_setToolbar`, `populateSetorSelect`, `mountEquipamentosHeader` e `_resolveViewEquipTarget`.

## 3. Itens restantes no adapter

| Item restante no adapter         | Tipo                        | Responsabilidade                                                     | Usado por                                       | Pode mover?                  | Risco | CP sugerido                                 |
| -------------------------------- | --------------------------- | -------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------- | ----- | ------------------------------------------- |
| `renderEquip`                    | reexport/import configurado | API publica de render, implementada em feature                       | routes, theme handlers, tests, render plan      | Ja movido                    | Baixo | Nenhum                                      |
| `viewEquip`                      | reexport/import configurado | API publica de detail, implementada em feature                       | historico, handlers, tests                      | Ja movido                    | Baixo | Nenhum                                      |
| `saveEquip`                      | reexport/import configurado | API publica de salvar equipamento, implementada em feature           | handlers, tests                                 | Ja movido parcialmente       | Medio | CP-H.2 validar fachada de CRUD              |
| `deleteEquip`                    | funcao exportada            | Soft delete local/remoto, fecha modal, re-render, header, toast      | equipment handlers                              | Sim, apos mapear fluxo       | Alto  | CP-H.1 mapear `deleteEquip`/`openEditEquip` |
| `openEditEquip`                  | funcao exportada            | Preenche modal de edicao, dados de placa, billing/gates, modal/focus | equipment handlers                              | Sim, mas com pre-split       | Alto  | CP-H.1 mapear `deleteEquip`/`openEditEquip` |
| `renderFlatList`                 | helper local                | Monta view model da lista, skeleton e React list bridge              | `configureRenderEquip`                          | Sim                          | Alto  | CP-H.2 mover list branch                    |
| `_setToolbar`                    | helper DOM local            | Atualiza titulo/subtitulo/CTA da toolbar                             | `configureRenderEquip`, `configureSetorUI`      | Sim, com cuidado             | Medio | CP-H.2 mover list/toolbar                   |
| `mountEquipamentosHeader`        | helper local                | Resolve roots legados e chama header bridge                          | `configureRenderEquip`                          | Sim                          | Medio | CP-H.2 ou CP-H.3                            |
| `_resolveViewEquipTarget`        | helper local                | Resolve equipamento por `findEquip` para `viewEquip`                 | `configureViewEquip`                            | Sim                          | Baixo | CP-H.3 limpeza de DI                        |
| `populateSetorSelect`            | funcao exportada            | Popula select de setor no modal de equipamento                       | `renderEquip`, `openEditEquip`, save/edit flows | Sim, mas junto de modal/form | Alto  | CP-H.1 mapear modal/form                    |
| `syncComponenteVisibility`       | funcao exportada            | Mostra/esconde componente por tipo                                   | modal equip/save/edit                           | Sim                          | Medio | CP-H.1 mapear modal/form                    |
| `clearEditingState`              | funcao exportada            | Reseta estado visual do modal de equipamento                         | handlers/modal/save                             | Sim                          | Alto  | CP-H.1 mapear modal/form                    |
| `applyEquipModalExperience`      | funcao exportada            | Ajusta labels/CTAs conforme plano/contexto                           | open modal handlers                             | Sim                          | Alto  | CP-H.1 mapear modal/form                    |
| `clearForcedEquipContext`        | funcao exportada            | Remove contexto travado do modal                                     | handlers/modal                                  | Sim                          | Medio | CP-H.1 mapear modal/form                    |
| `lockEquipContext`               | funcao exportada            | Trava cliente/setor no modal                                         | handlers/modal                                  | Sim                          | Medio | CP-H.1 mapear modal/form                    |
| `setActiveQuickFilter`           | funcao exportada            | Navega contexto de quick filter                                      | hero/tests/handlers                             | Talvez                       | Medio | CP-H.2 ou CP-H.3                            |
| `_setSaveBtnLabel`               | helper local                | Label do botao de setor                                              | setor modal                                     | Ja deveria ficar com setor   | Medio | CP-H.3 setor modal cleanup                  |
| `_setSetorNomeValidationState`   | helper local                | Estado visual de validacao do setor                                  | setor persist/config                            | Ja deveria ficar com setor   | Medio | CP-H.3 setor modal cleanup                  |
| `_syncSetorSaveButtonState`      | helper local                | Habilita/desabilita save de setor                                    | setor modal                                     | Ja deveria ficar com setor   | Medio | CP-H.3 setor modal cleanup                  |
| `clearSetorEditingState`         | funcao exportada            | Reseta modal de setor                                                | setor persist/handlers                          | Ja mapeado em setor          | Medio | CP-H.3 setor modal cleanup                  |
| `openEditSetor`                  | funcao exportada            | Preenche e abre modal de setor                                       | handlers                                        | Ja mapeado em setor          | Medio | CP-H.3 setor modal cleanup                  |
| `_syncSetorModalPreview`         | helper local                | Preview visual do modal de setor                                     | color picker                                    | Ja deveria ficar com setor   | Medio | CP-H.3 setor modal cleanup                  |
| `_syncSetorModalCounters`        | helper local                | Contadores do modal de setor                                         | color picker                                    | Ja deveria ficar com setor   | Baixo | CP-H.3 setor modal cleanup                  |
| `initSetorColorPicker`           | funcao exportada            | Bind/preview do color picker de setor                                | handlers/modal                                  | Ja mapeado em setor          | Medio | CP-H.3 setor modal cleanup                  |
| `_focusEditField`                | helper local                | Expande accordions, scroll/focus e highlight                         | `openEditEquip`                                 | Sim, junto de edit modal     | Alto  | CP-H.1 mapear edit                          |
| `_getSaveEquipPostActionContext` | helper local                | Interpreta postAction do save                                        | `configureSaveEquip`                            | Sim                          | Medio | CP-H.2 CRUD facade                          |
| `_closeSaveEquipModal`           | helper local                | Fecha modal add-eq com tratamento de erro                            | `configureSaveEquip`                            | Sim                          | Medio | CP-H.2 CRUD facade                          |
| `_resetSaveEquipForm`            | helper local                | Limpa campos, dados placa e estado visual                            | `configureSaveEquip`                            | Sim                          | Alto  | CP-H.1 mapear modal/form                    |
| `_refreshSaveEquipViews`         | helper local                | Atualiza dashboard, renderEquip e header apos save                   | `configureSaveEquip`                            | Sim                          | Medio | CP-H.2 CRUD facade                          |
| `populateEquipSelects`           | funcao exportada            | Popula selects de equipamento e tecnico                              | handlers/routes                                 | Sim                          | Medio | CP-H.3 form/selects cleanup                 |
| `configureRenderEquip` call      | composicao                  | Injeta deps do render feature                                        | adapter startup                                 | Nao mover ainda              | Medio | Adiar                                       |
| `configureViewEquip` call        | composicao                  | Injeta deps do detail feature                                        | adapter startup                                 | Nao mover ainda              | Baixo | Adiar                                       |
| `configureSaveEquip` call        | composicao                  | Injeta deps CRUD save                                                | adapter startup                                 | Nao mover ainda              | Medio | Adiar                                       |
| `configureSetor*` calls          | composicao                  | Injeta deps de setor                                                 | adapter startup                                 | Nao mover ainda              | Medio | Adiar                                       |
| `configureEquipPhotos` call      | composicao                  | Injeta `viewEquip` em fotos                                          | adapter startup                                 | Nao mover ainda              | Medio | Adiar                                       |

## 4. Modulos feature ja extraidos

| Modulo feature                                       | Responsabilidade                  | Depende de adapter? | Entrada via DI? | Teste existente                 | Observacao                                            |
| ---------------------------------------------------- | --------------------------------- | ------------------: | --------------: | ------------------------------- | ----------------------------------------------------- |
| `src/features/equipamentos/ui/renderEquip.js`        | Orquestrador do render            |         Nao importa |             Sim | `ui/renderEquip.test.js`        | Recebe `renderFlatList`, toolbar e DOM helpers via DI |
| `src/features/equipamentos/ui/viewEquip.js`          | Orquestrador do detail            |         Nao importa |             Sim | `ui/viewEquip.test.js`          | Usa defaults para model/html/controller               |
| `src/features/equipamentos/ui/detailController.js`   | Mount/bind/modal do detail        |         Nao importa |             Sim | `ui/detailController.test.js`   | Mantem Modal/Photos por DI/defaults                   |
| `src/features/equipamentos/ui/detail.js`             | HTML do detail                    |         Nao importa |         Parcial | `ui/detail.test.js`             | Contratos de selectors incluem esse modulo            |
| `src/features/equipamentos/ui/detailModel.js`        | Model do detail                   |         Nao importa |      Parametros | `ui/detailModel.test.js`        | Puro/orquestracao de dados                            |
| `src/features/equipamentos/crud/saveEquip.js`        | Orquestrador do save              |         Nao importa |             Sim | `crud/saveEquip.test.js`        | Adapter ainda fornece muitos callbacks                |
| `src/features/equipamentos/crud/postActions.js`      | Pos-acoes do save                 |         Nao importa |      Parametros | `crud/postActions.test.js`      | Baixo acoplamento                                     |
| `src/features/equipamentos/crud/postSave.js`         | Sucesso pos-save                  |         Nao importa |      Parametros | `crud/postSave.test.js`         | Baixo acoplamento                                     |
| `src/features/equipamentos/crud/persist.js`          | Mutacoes de estado de save        |         Nao importa |      Parametros | `crud/persist.test.js`          | Puro sobre state callbacks                            |
| `src/features/equipamentos/crud/payload.js`          | Coleta/build payload              |         Nao importa |      Parametros | `crud/payload.test.js`          | Ainda depende de DOM via callbacks externos           |
| `src/features/equipamentos/crud/validate.js`         | Validacao e plan limit            |         Nao importa |      Parametros | `crud/validate.test.js`         | Baixo risco                                           |
| `src/features/equipamentos/setor/setorUI.js`         | Grid/empty state de setores       |         Nao importa |             Sim | `setor/setorUI.test.js`         | Recebe toolbar/list unmount via DI                    |
| `src/features/equipamentos/setor/setorNavigation.js` | Navegacao contexto setor          |         Nao importa |             Sim | `setor/setorNavigation.test.js` | Baixo risco                                           |
| `src/features/equipamentos/setor/setorPersist.js`    | CRUD/persist de setor             |         Nao importa |             Sim | `setor/setorPersist.test.js`    | Ainda chama `renderEquip` via DI                      |
| `src/features/equipamentos/setor/setorState.js`      | Estado de setor                   |         Nao importa |             Nao | `setor/setorState.test.js`      | Isolado                                               |
| `src/features/equipamentos/bridges/renderPlan.js`    | Invalidacao/refresh do plano      |         Nao importa |             Sim | `bridges/renderPlan.test.js`    | Recebe `renderEquip` em configure                     |
| `src/features/equipamentos/bridges/headerBridge.js`  | Bridge React header               |         Nao importa |             Nao | `bridges/headerBridge.test.js`  | Usa dynamic import React                              |
| `src/features/equipamentos/bridges/listBridge.js`    | Bridge React list                 |         Nao importa |             Nao | `bridges/listBridge.test.js`    | Usa dynamic import React                              |
| `src/features/equipamentos/state/bridgeState.js`     | Estado dos bridges                |         Nao importa |             Nao | `state/bridgeState.test.js`     | Isolado                                               |
| `src/features/equipamentos/state/editingState.js`    | Estado de edicao/contexto forcado |         Nao importa |             Nao | `state/editingState.test.js`    | Adapter ainda consome                                 |
| `src/features/equipamentos/state/renderPlanState.js` | Token/needsRefresh render plan    |         Nao importa |             Nao | `state/renderPlanState.test.js` | Isolado                                               |
| `src/features/equipamentos/utils/detail.js`          | Helpers de detail                 |         Nao importa |             Nao | `utils/detail.test.js`          | Puro                                                  |
| `src/features/equipamentos/utils/viewModels.js`      | Helpers/list view model           |         Nao importa |             Nao | `utils/viewModels.test.js`      | Usado por adapter e render                            |
| `src/features/equipamentos/nameplate/dadosPlaca.js`  | Coleta dados placa no save        |         Nao importa |      Parametros | `nameplate/dadosPlaca.test.js`  | Pequeno e isolado                                     |

## 5. Dependencias e DI

Dependencias que ainda passam pelo adapter:

- `renderEquip`: `Utils`, `_resolveEquipCtx`, `_stripRenderInternalOptions`, `isCachedPlanPro`, render plan state/bridge, `populateSetorSelect`, `getState`, `getPreventivaDueEquipmentIds`, `buildEquipamentosHeaderViewModel`, `computeEquipKpis`, `mountEquipamentosHeader`, `_setToolbar`, `renderFlatList`, `renderSetorGrid`, `renderSetorGridForCliente`, `findSetor`.
- `viewEquip`: `_resolveViewEquipTarget`, detail model/html/controller, `regsForEquip`, maintenance/risk helpers, `Utils`, `getState().setores`.
- `saveEquip`: payload/validation/persist/post-save callbacks, DOM reads, modal close/reset, refresh dashboard/render/header, Toast, Router, telemetry, state, dados placa and plan limits.
- `setor`: `Utils`, `emptyStateHtml`, `getState`, `setorCardHtml`, `_setToolbar`, `unmountEquipamentosList`, state/navigation callbacks, persistence callbacks.
- `fotos`: `viewEquip`.

Essa DI ainda e util: o adapter e a fronteira entre UI legada, DOM global, modal global, router e feature modules. Mover essa composicao agora para uma fachada central pode apenas deslocar o acoplamento.

## 6. Riscos de import circular

Evidencias por grep:

- `src/features/equipamentos` nao importa `src/ui/views/equipamentos.js`. O grep de `from ... ui/views/equipamentos` em `src/features/equipamentos` retornou vazio.
- O adapter e importado por `src/ui/controller/routes.js`, `src/ui/controller/helpers/themeInitHelpers.js`, `src/ui/controller/handlers/navigationHandlers.js` e `src/ui/controller/handlers/equipmentHandlers.js`.
- `src/ui/views/historico.js` usa import dinamico do adapter para chamar `viewEquip`.

Riscos:

- Criar uma fachada que importe o adapter causaria ciclo e deve ser proibido.
- Criar uma fachada que apenas reexporte tudo de `features/equipamentos` viraria barrel disfarçado e nao reduziria acoplamento.
- Mover `renderFlatList` sem seus helpers de view model/bridge pode gerar DI excessiva ou duplicar logica.
- Mover `deleteEquip` antes de mapear modal/storage/header pode misturar CRUD com refresh UI.
- Mover `openEditEquip` antes de pre-split e arriscado: concentra billing async, modal DOM, dados de placa, focus e gates.

## 7. Avaliacao de fachada/shim

| Estrategia                              | Beneficio                                      | Risco                                                     | Recomendacao        |
| --------------------------------------- | ---------------------------------------------- | --------------------------------------------------------- | ------------------- |
| Criar fachada agora                     | Poderia reduzir imports futuros do adapter     | Alto risco de virar barrel ou nova camada acoplada demais | Nao fazer agora     |
| Adiar fachada e mover mais um bloco     | Reduz acoplamento real antes de compor fachada | Requer mapeamento fino dos blocos restantes               | Recomendado         |
| Criar modulo de configure centralizado  | Concentraria `configure*` fora do adapter      | Pode esconder dependencias DOM e criar ciclo indireto     | Adiar               |
| Manter adapter como composicao final    | Evita ciclo e preserva API publica             | Adapter segue grande por mais tempo                       | Manter por enquanto |
| Stability checkpoint antes de continuar | Valida que Mudanca 11 estabilizou              | Nao reduz LOC agora                                       | Bom apos CP-H.1/H.2 |

## 8. Proximos CPs recomendados

| Ordem | CP                                        | Objetivo                                            | Escopo permitido                                          | Risco | Criterio de aprovacao                               |
| ----: | ----------------------------------------- | --------------------------------------------------- | --------------------------------------------------------- | ----- | --------------------------------------------------- |
|     1 | CP-H.1 - mapear deleteEquip/openEditEquip | Mapear e pre-splitar edit/delete sem mover ainda    | Documentar e, se autorizado, helperizar localmente        | Medio | Fluxos edit/delete mapeados e testes focados verdes |
|     2 | CP-H.2 - mover renderFlatList/list branch | Extrair lista flat e toolbar para feature-scoped    | `renderFlatList`, `_setToolbar` se coeso, testes de lista | Alto  | Render legacy/list/header/selectors verdes          |
|     3 | CP-H.3 - limpar modal/form de equipamento | Extrair helpers de modal/form/dados placa restantes | `clearEditingState`, context lock, form reset, focus      | Alto  | Save/edit/photos/nameplate tests verdes             |
|     4 | CP-H.4 - avaliar fachada/shim minima      | Criar fachada somente se ainda houver ganho real    | Sem barrel, sem import do adapter                         | Medio | Sem ciclos e API publica preservada                 |
|     5 | Stability checkpoint pos-Mudanca 11       | Rodar suite ampla e consolidar inventario final     | Validacao/documentacao                                    | Baixo | `npm run check` verde e working tree limpa          |

## 9. Recomendacao final

Proximo CP recomendado: **CP-H.1 - mapear deleteEquip/openEditEquip**.

Justificativa: `openEditEquip` e `deleteEquip` sao os maiores exports publicos ainda implementados no adapter e carregam risco alto. Mapear/pre-splitar antes de mover reduz a chance de misturar modal, storage, billing, dados de placa, focus e refresh global em uma extracao grande demais. A confianca e maior que 90% porque os greps mostram que `renderFlatList` ainda prende o render, mas `openEditEquip`/`deleteEquip` sao gargalos publicos mais perigosos para qualquer fachada futura.
