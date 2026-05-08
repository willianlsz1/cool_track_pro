# Mudanca 11 - Stability checkpoint pos-extrações de Equipamentos

## 1. Base

- Branch: `main`
- HEAD: `51a47b7dd6ca16cf6b963d0ad58aa58bf659569e`
- Data: 2026-05-08
- Adapter analisado: `src/ui/views/equipamentos.js`
- LOC atual de `src/ui/views/equipamentos.js`: 1241

## 2. Objetivo

Validar a estabilidade da Mudanca 11 apos as extrações principais de Equipamentos, consolidar o estado real do adapter e decidir se a Mudanca 11 pode ser encerrada ou se ainda exige um CP tecnico antes da Mudanca 12.

## 3. Estado atual dos blocos extraidos

| Bloco/fluxo                                          | Estado atual        | Arquivo principal                                   | Teste existente                                                    | Risco atual | Observacao                                                         |
| ---------------------------------------------------- | ------------------- | --------------------------------------------------- | ------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------ |
| `renderEquip`                                        | Movido              | `src/features/equipamentos/ui/renderEquip.js`       | `src/features/equipamentos/__tests__/ui/renderEquip.test.js`       | Baixo       | Orquestrador preservado via DI no adapter.                         |
| `renderFlatList`                                     | Movido              | `src/features/equipamentos/ui/renderFlatList.js`    | `src/features/equipamentos/__tests__/ui/renderFlatList.test.js`    | Baixo/medio | Depende de bridge/lista, view models e roots legados via DI.       |
| `mountEquipamentosHeader`                            | Movido              | `src/features/equipamentos/ui/headerMount.js`       | `src/features/equipamentos/__tests__/ui/headerMount.test.js`       | Baixo       | Wrapper de roots legados para `headerBridge`.                      |
| toolbar / `setToolbar`                               | Movido              | `src/features/equipamentos/ui/toolbar.js`           | `src/features/equipamentos/__tests__/ui/toolbar.test.js`           | Baixo       | HTML/CTA e uso por render/setor preservados.                       |
| `viewEquip`                                          | Movido              | `src/features/equipamentos/ui/viewEquip.js`         | `src/features/equipamentos/__tests__/ui/viewEquip.test.js`         | Baixo       | Orquestrador de detalhe preservado.                                |
| detail model                                         | Movido              | `src/features/equipamentos/ui/detailModel.js`       | `src/features/equipamentos/__tests__/ui/detailModel.test.js`       | Baixo       | Modelo isolado.                                                    |
| detail HTML                                          | Movido              | `src/features/equipamentos/ui/detail.js`            | `src/features/equipamentos/__tests__/ui/detail.test.js`            | Baixo       | Contratos HTML/selectors preservados.                              |
| detail controller                                    | Movido              | `src/features/equipamentos/ui/detailController.js`  | `src/features/equipamentos/__tests__/ui/detailController.test.js`  | Baixo       | Mount/bind/modal extraidos.                                        |
| `openEditEquip`                                      | Movido              | `src/features/equipamentos/ui/openEditEquip.js`     | `src/features/equipamentos/__tests__/ui/openEditEquip.test.js`     | Medio       | Fluxo de modal/form ainda depende de helpers do adapter por DI.    |
| `deleteEquip`                                        | Movido              | `src/features/equipamentos/ui/deleteEquip.js`       | `src/features/equipamentos/__tests__/ui/deleteEquip.test.js`       | Baixo/medio | Fluxo storage/state/refresh preservado por DI.                     |
| `saveEquip`                                          | Movido para CRUD    | `src/features/equipamentos/crud/saveEquip.js`       | `src/features/equipamentos/__tests__/crud/saveEquip.test.js`       | Medio       | Adapter ainda fornece contexto e helpers de form/refresh.          |
| CRUD payload/validate/persist/post-save/post-actions | Movido              | `src/features/equipamentos/crud/*.js`               | `src/features/equipamentos/__tests__/crud/*.test.js`               | Baixo       | Cobertura modular existente.                                       |
| setor UI/navigation/persist/state                    | Movido              | `src/features/equipamentos/setor/*.js`              | `src/features/equipamentos/__tests__/setor/*.test.js`              | Medio       | Setor ainda usa DI do adapter para toolbar/list/DOM.               |
| bridges renderPlan/list/header                       | Movido              | `src/features/equipamentos/bridges/*.js`            | `src/features/equipamentos/__tests__/bridges/*.test.js`            | Baixo/medio | Mantem React islands e generation guards.                          |
| states editing/renderPlan/bridge                     | Movido              | `src/features/equipamentos/state/*.js`              | `src/features/equipamentos/__tests__/state/*.test.js`              | Baixo       | Estado local modularizado.                                         |
| nameplate/dadosPlaca                                 | Movido              | `src/features/equipamentos/nameplate/dadosPlaca.js` | `src/features/equipamentos/__tests__/nameplate/dadosPlaca.test.js` | Baixo       | Coleta de payload isolada.                                         |
| utils/viewModels                                     | Movido parcialmente | `src/features/equipamentos/utils/viewModels.js`     | `src/features/equipamentos/__tests__/utils/viewModels.test.js`     | Medio       | Ainda importa `ui/views/equipamentos/constants.js` e `helpers.js`. |
| Adapter                                              | Composicao/ponte    | `src/ui/views/equipamentos.js`                      | testes legados de Equipamentos                                     | Medio       | Ainda concentra configure calls e helpers de modal/form/setor.     |

## 4. Itens restantes no adapter

| Item restante no adapter       | Tipo                      | Responsabilidade                                       | Motivo para permanecer                                        | Risco      | Recomendacao                                                 |
| ------------------------------ | ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| `saveEquip`                    | import/config/export      | Preservar API publica e configurar CRUD                | Orquestrador ja extraido, mas contexto de form ainda e legado | Medio      | Manter ate estabilizar modal/form helpers.                   |
| `populateSetorSelect`          | export/helper DOM         | Popular select de setor no modal de equipamento        | Usado por render/edit/save e acoplado a contexto visual       | Medio      | CP futuro especifico para modal/form ou setor form.          |
| `populateEquipSelects`         | export/helper DOM         | Popular selects de equipamentos em Registro/uso legado | API publica consumida fora da feature                         | Medio      | Mapear antes de mover.                                       |
| `syncComponenteVisibility`     | export/helper DOM         | Alternar campos de componente/tipo                     | Acoplado ao formulario legado                                 | Medio      | Mover junto com modal/form helpers.                          |
| `clearEditingState`            | export/helper estado/form | Limpar estado de edicao e form                         | Usado por fluxos legados e save                               | Medio      | Mover apos mapear modal/form.                                |
| `applyEquipModalExperience`    | export/helper UI          | Ajustar labels/CTA/action tray do modal                | Alto acoplamento DOM/CTA                                      | Medio/alto | CP especifico de modal/form helpers.                         |
| `clearForcedEquipContext`      | export/helper contexto    | Limpar contexto travado cliente/setor                  | Acoplado a form e contexto visual                             | Medio      | Mover com contexto/modal.                                    |
| `lockEquipContext`             | export/helper contexto    | Travar cliente/setor no modal                          | Acoplado a DOM e contexto                                     | Medio      | Mover com contexto/modal.                                    |
| Helpers de modal/form          | privados/exportados       | Labels, foco, reset, close, refresh, validacao         | Ainda misturam UI legada e fluxos CRUD                        | Medio/alto | Mapear em CP-H.12 se continuar Mudanca 11.                   |
| Helpers de setor restantes     | exports e privados        | Modal de setor, preview, validacao, color picker       | Setor ainda nao totalmente limpo do adapter                   | Medio      | Tratar em mudanca/setor especifica ou CP posterior.          |
| Helpers de refresh/save        | privados                  | Fechar modal, resetar form e atualizar views           | Dependem de `renderEquip`, header e toast                     | Medio      | Extrair com cuidado apos checkpoint.                         |
| `configure*` calls             | composicao                | Injetar dependencias nos modulos feature               | Adapter ainda e composition root legado                       | Baixo      | Manter por enquanto; fachada so se reduzir acoplamento real. |
| Imports core/domain/ui legados | imports                   | Fonte de dependencias para features e helpers          | Necessarios enquanto adapter e composition root               | Medio      | Reduzir gradualmente, sem criar barrel.                      |
| Exports publicos restantes     | exports                   | Preservar API externa de handlers/rotas/testes         | Contrato legado ainda depende do adapter                      | Medio      | Preservar ate Mudanca 12/limpeza planejada.                  |

## 5. Validacao de arquitetura

| Verificacao                                | Resultado       | Evidencia                                                                                                                 | Bloqueia encerramento?        |
| ------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Features nao importam adapter principal    | OK              | Grep nao encontrou import real para `src/ui/views/equipamentos.js`; apenas comentarios historicos.                        | Nao                           |
| Adapter segue como composicao/ponte legada | OK              | `configure*` centralizados em `src/ui/views/equipamentos.js`.                                                             | Nao                           |
| Exports publicos preservados               | OK              | Testes legados e focused suite passam.                                                                                    | Nao                           |
| Barrel `index.js` novo                     | OK              | Nenhum `index.js` em `src/features/equipamentos`.                                                                         | Nao                           |
| `test.skip` novo                           | OK com baseline | Existem skips antigos em `a11y/views.test.js`, `probe.test.js`, `tour.test.js`; nenhum arquivo alterado neste checkpoint. | Nao                           |
| Sem alteracao em package/schema/CSS        | OK              | Diff restrito aos docs neste CP.                                                                                          | Nao                           |
| Acoplamento `constants.js/helpers.js`      | Existe          | `utils/viewModels.js` importa `../../../ui/views/equipamentos/constants.js` e `helpers.js`.                               | Nao, mas deve ser acompanhado |
| Warnings atuais                            | Baseline        | `npm run check` reporta 32 warnings de lint e avisos de chunk/dynamic import.                                             | Nao                           |
| Adapter LOC atual                          | 1241            | Contagem via `Get-Content ... .Count`.                                                                                    | Nao                           |
| Rotas/handlers importam APIs publicas      | OK              | `npm run check` e testes legados passam.                                                                                  | Nao                           |

## 6. Validacao de testes/build

| Validacao                          | Resultado  | Observacao                                                                                        |
| ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| Teste focado amplo de Equipamentos | Passou     | 37 arquivos, 288 testes. Logs esperados de erro em `storage.integration.test.js` cobrem fallback. |
| `npm run format`                   | Passou     | Prettier aplicado.                                                                                |
| `npm run check`                    | Passou     | Lint, format:check, suite completa e build passaram.                                              |
| `npm run size`                     | Nao rodado | Opcional; checkpoint ja validou suite completa/build via `npm run check`.                         |
| Playwright                         | Nao rodado | Opcional; nao necessario para este checkpoint documental.                                         |

## 7. Warnings conhecidos

- `npm run check` manteve 32 warnings de lint: unused vars/imports e restricoes arquiteturais ja existentes.
- Build manteve avisos Vite de dynamic import tambem importado estaticamente e chunks acima de 500 kB.
- Nao foi identificado warning novo associado ao checkpoint.

## 8. Riscos remanescentes

- `src/features/equipamentos/utils/viewModels.js` ainda depende de `src/ui/views/equipamentos/constants.js` e `helpers.js`.
- Helpers de modal/form ainda permanecem no adapter: `syncComponenteVisibility`, `clearEditingState`, `applyEquipModalExperience`, `clearForcedEquipContext`, `lockEquipContext`, foco/reset/close/refresh.
- `populateSetorSelect` e `populateEquipSelects` ainda sao pontos de DOM legado e API publica.
- O adapter continua como composition root com muitos `configure*`; isso e aceitavel agora, mas limita uma fachada limpa.
- Setor ainda tem partes de modal/preview/validacao no adapter.

## 9. Recomendacao final

**Encerrar Mudanca 11 e seguir para Mudanca 12 / Registro.**

Justificativa: as extrações principais de Equipamentos passaram no teste focado amplo, `npm run format` e `npm run check`. Os riscos restantes estao mapeados, nao bloqueiam runtime e sao melhor tratados como nova mudanca tecnica especifica, sem alongar a Mudanca 11 com escopo residual.
