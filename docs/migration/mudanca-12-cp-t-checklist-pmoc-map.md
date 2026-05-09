# Mudanca 12 / CP-T - Mapeamento Checklist/PMOC

## 1. Base

- Branch: main
- HEAD: f921961ba1e805b66f79c5c599c89d25a45e6b9e
- Data: 2026-05-09
- Adapter analisado: `src/ui/views/registro.js`
- LOC atual de `src/ui/views/registro.js`: 1752

## 2. Objetivo

Mapear em modo read-only o fluxo Checklist/PMOC dentro de Registro antes de qualquer pre-split ou extracao, identificando ordem real, contratos, dependencias, riscos, testes existentes e o proximo corte seguro.

## 3. Escopo real Checklist/PMOC

| Arquivo                                                                                    |    LOC | Responsabilidade no fluxo Checklist/PMOC                                                                                           | Exporta API publica?                                                                                             | Risco                       |
| ------------------------------------------------------------------------------------------ | -----: | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `src/ui/views/registro.js`                                                                 |   1752 | Mantem `_currentChecklist`, gate Pro, render/mount, handlers publicos, snapshot para save, reset/edit load e warning soft-required | Sim: `renderChecklist`, setters, `getCurrentChecklist`, `resetChecklist`, `loadChecklistForEdit`, `saveRegistro` | Alto                        |
| `src/react/pages/RegistroChecklist.jsx`                                                    |    139 | Renderiza grupos, linhas, botoes status, textarea obs e input de medicao com contratos `data-*`                                    | Sim: componente React                                                                                            | Alto para contratos DOM     |
| `src/react/entrypoints/registroChecklistIsland.jsx`                                        |     43 | Monta/desmonta a ilha React em `#r-checklist-body` com `createRoot` e dataset de mount                                             | Sim: mount/unmount                                                                                               | Medio                       |
| `src/ui/viewModels/registroViewModel.js`                                                   |    274 | Resume checklist no view model e fornece actions para a ilha                                                                       | Sim                                                                                                              | Medio                       |
| `src/ui/viewModels/registroContracts.js`                                                   |    147 | Congela IDs, actions, classes e roots publicos do checklist                                                                        | Sim                                                                                                              | Alto se divergir do DOM     |
| `src/ui/controller/handlers/registroHandlers.js`                                           |    126 | Liga `r-checklist-set` e inputs `r-checklist-obs`/`r-checklist-measure` aos setters do adapter                                     | Sim: `bindRegistroHandlers`                                                                                      | Alto                        |
| `src/domain/pmoc/checklistTemplates.js`                                                    |   1115 | Templates NBR 13971, `buildEmptyChecklist`, `validateChecklist`, `summarizeChecklist`, `formatMeasure`                             | Sim                                                                                                              | Alto para formato salvo/PDF |
| `src/domain/pdf/sections/checklist.js`                                                     |    179 | Renderiza checklists salvos no PDF, somente itens marcados, usando labels/ordem do template                                        | Sim: `drawChecklist`                                                                                             | Alto                        |
| `src/features/registro/save/persistence.js`                                                |    135 | Preserva/adiciona `checklist` em edit/create via DI `getCurrentChecklist` e record final                                           | Sim                                                                                                              | Alto para save              |
| `src/ui/views/relatorio.js`                                                                |    751 | Consome PMOC por cliente e aciona relatorio/PDF que inclui checklist quando filtrado                                               | Sim                                                                                                              | Medio/alto                  |
| `src/ui/views/historico.js`                                                                |   1490 | Consome preventivas/PMOC em insights e status de cliente; nao edita checklist                                                      | Sim                                                                                                              | Medio                       |
| Testes `registroChecklist*`, `checklistTemplates`, `pmoc*`, `persistence`, `pdf/relatorio` | varios | Cobrem ilha, handlers, render legado, templates, persistence e PDF/PMOC relacionado                                                | Nao                                                                                                              | Alto valor de regressao     |

## 4. Ordem real do fluxo

| Ordem | Bloco atual Checklist/PMOC | Responsabilidade                                                                              | Dependencias                                                     | Side effects                                                   | Risco      |
| ----: | -------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
|     1 | Inicializacao de Registro  | `initRegistro` monta header e binds; `r-equip` change chama `renderChecklist`                 | DOM, `PlanCache`, header bridge                                  | Binds DOM e mount React                                        | Medio      |
|     2 | Estado local               | `_currentChecklist` guarda snapshot em edicao/preenchimento                                   | Adapter legado                                                   | Estado em memoria pode vazar se reset falhar                   | Alto       |
|     3 | Gate Pro                   | `_ensurePmocChecklistAccess` bloqueia nao-Pro, esconde wrapper, desmonta ilha e mostra upsell | `PlanCache.isCachedPlanPro`, Toast/Router via CTA                | Unmount, DOM hidden, upsell, `goTo('pricing')` quando redirect | Alto       |
|     4 | Template                   | `renderChecklist` resolve equipamento e chama `getChecklistTemplate(equip.tipo)`              | `findEquip`, `Utils.getVal`, templates PMOC                      | Cria ou preserva `_currentChecklist` se `tipo_template` igual  | Alto       |
|     5 | Montagem da ilha           | `buildRegistroChecklistReactProps` agrupa itens e mistura template com snapshot               | `_currentChecklist`, view model, React bridge                    | Mount async com generation guard                               | Medio/alto |
|     6 | Render React               | `RegistroChecklist` emite botoes, textarea e input medicao                                    | `REGISTRO_ACTIONS`, props                                        | Nenhum state proprio; contratos DOM                            | Alto       |
|     7 | Handlers delegados         | `registroHandlers` delega click/input para setters                                            | `data-action`, `data-item-id`, `data-status`, `data-unit`        | Mutacao do snapshot via adapter                                | Alto       |
|     8 | Status/obs/medicao         | Setters atualizam item, classes/aria e resumo                                                 | `_currentChecklist`, DOM row, `CSS.escape`, `summarizeChecklist` | Mutacao local, DOM in-place, sem re-render para preservar foco | Alto       |
|     9 | Quick templates/tipo       | `applyQuickTemplate` e change de `r-tipo` atualizam tipo e badge preventiva                   | DOM, Profile, Toast, `_refreshChecklistPriBadge`                 | Tipo muda sem recriar template; resumo reflete tipo atual      | Medio      |
|    10 | Snapshot para save         | `getCurrentChecklist` retorna null se nenhum item tem status                                  | `_currentChecklist`                                              | Nenhum, mas define se `registro.checklist` existe              | Alto       |
|    11 | Warning soft-required      | `warnRegistroChecklistPayloadGaps` avisa preventiva sem checklist ou obrigatorios pendentes   | `isPreventivaTipo`, `validateChecklist`, `Toast`                 | Toast warning; nao bloqueia save                               | Alto       |
|    12 | Save create/edit           | Create passa `checklist: getCurrentChecklist()`; edit usa DI `getCurrentChecklist`            | payload CP-D, persistence CP-K                                   | Checklist entra no record ou preserva existente em edit        | Alto       |
|    13 | Reset                      | `clearRegistro` chama `resetChecklist`                                                        | DOM, React bridge                                                | Zera `_currentChecklist`, limpa body, esconde wrapper/upsell   | Alto       |
|    14 | Edicao                     | `loadRegistroForEdit` chama `loadChecklistForEdit` ou `renderChecklist`                       | registro salvo, DOM, template                                    | Deep clone do checklist e render                               | Alto       |
|    15 | PDF/relatorio              | PDF filtra registros com `checklist.items`, usa template para labels e desenha marcados       | `domain/pdf/sections/checklist.js`, `getTemplateByKey`           | PDF omite itens pendentes silenciosamente                      | Alto       |
|    16 | Historico/PMOC cliente     | Historico e relatorio usam preventivas/PMOC de cliente                                        | `clientePmoc`, `pmocProgress`, registros                         | Insights/status PMOC                                           | Medio      |
|    17 | Proxima preventiva         | Pos-save chama prompt separado para proxima preventiva                                        | postSave CP-M, prompt                                            | Atualiza registro salvo depois do save                         | Medio      |

## 5. Contratos publicos

| Contrato Checklist/PMOC                                                                   | Origem                                      | Usado por                           | Coberto por teste? | Risco se alterar             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------- | ------------------ | ---------------------------- |
| `#r-checklist-body`                                                                       | `registroContracts`, shell template, island | React mount, tests, adapter         | Sim                | Ilha nao monta               |
| `#r-checklist-details`, `#r-checklist-summary`, `#r-checklist-upsell`, `#r-checklist-pri` | Adapter/shell                               | Gate, resumo, badge preventiva      | Sim parcial        | Gate/resumo visual quebra    |
| `data-action="r-checklist-set"`                                                           | `REGISTRO_ACTIONS`, React page              | Handler click status                | Sim                | Status nao altera            |
| `data-action="r-checklist-obs"`                                                           | `REGISTRO_ACTIONS`, React page              | Handler input textarea              | Sim                | Obs nao persiste             |
| `data-action="r-checklist-measure"`                                                       | `REGISTRO_ACTIONS`, React page              | Handler input medicao               | Sim                | Medicoes PMOC somem          |
| `data-item`, `data-item-id`, `data-status`, `data-unit`                                   | React page                                  | Handlers legados e testes           | Sim                | Mutacao mira item errado     |
| Classes `r-checklist__*`                                                                  | React page/contracts/CSS                    | Layout, tests, DOM update in-place  | Sim                | Regressao visual/handler     |
| `data-action="quick-service-template"`                                                    | Header/handlers                             | Prefill tipo/obs e resumo checklist | Sim                | Template rapido quebra       |
| Shape `registro.checklist`                                                                | Templates/save/persistence/PDF              | Storage, edit, PDF checklist        | Sim parcial        | PDF/edit/save perdem PMOC    |
| `tipo_template`, `version`, `items[].status/obs/measure`                                  | `checklistTemplates`                        | `validateChecklist`, PDF, edit load | Sim                | Validacao/PDF inconsistentes |
| Root React `registroChecklist`                                                            | `REGISTRO_REACT_ROOTS`                      | Contratos CP-B                      | Sim                | Lifecycle/mount quebram      |

## 6. Dependencias tecnicas

| Dependencia            | Usada onde                  | Funcao                                        | Acoplamento | Risco                              | Estrategia sugerida             |
| ---------------------- | --------------------------- | --------------------------------------------- | ----------- | ---------------------------------- | ------------------------------- |
| React checklist island | Adapter e React entrypoint  | Render seguro do checklist                    | Medio       | Ciclo/lifecycle                    | Manter bridge isolada           |
| `registroViewModel`    | Adapter/React props         | Actions e resumo de checklist                 | Medio       | Divergencia de modelo              | Testar contrato antes de mover  |
| `registroContracts`    | React/handlers/tests        | IDs/actions/classes                           | Alto        | Quebra selectors                   | Nao alterar sem contrato        |
| `PlanCache`            | Adapter                     | Gate Pro e assinatura Plus                    | Alto        | Plano errado libera/bloqueia PMOC  | DI se extrair                   |
| `validateChecklist`    | Warning e dominio PMOC      | Completeness soft-required                    | Medio       | Warning incorreto                  | Mover so com testes de mensagem |
| `getCurrentChecklist`  | Save/persistence/view model | Snapshot atual                                | Alto        | Checklist nulo ou vazamento        | Criar contrato especifico       |
| `saveRegistro`         | Adapter                     | Orquestra snapshot/warning/save               | Alto        | Mudanca funcional silenciosa       | Nao mover agora                 |
| Persistence CP-K       | Feature save                | Preserva checklist em edit/create             | Alto        | Perda de checklist                 | Teste ja cobre parcialmente     |
| Payload CP-D           | Save                        | Define payload persistivel antes do checklist | Medio       | Ordem save muda                    | Manter ordem                    |
| postSave/reportShare   | Pos-save                    | Prompt preventiva e share/PDF                 | Medio       | Ordem Toast/share                  | Nao misturar com checklist      |
| PDF/relatorio          | PDF e relatorio             | Desenhar checklist/PMOC                       | Alto        | Relatorio incompleto               | Contrato antes de pre-split     |
| Historico              | Historico/PMOC cliente      | Insights preventivas                          | Medio       | Status PMOC incorreto              | Rodar testes relacionados       |
| Toast                  | Warning soft-required/gate  | UX nao bloqueante                             | Medio       | Save passa a bloquear sem querer   | Testar soft-required            |
| Utils/DOM              | Adapter                     | Ler campos, achar roots, atualizar classes    | Alto        | DOM quebrado                       | Isolar boundary DOM             |
| Core/state/storage     | Save/persistence/sync       | Persistir `checklist`                         | Alto        | Coluna ausente/fallback silencioso | Mapear storage antes de schema  |
| Equipamentos/status    | Render/save                 | Tipo do equipamento e status operacional      | Alto        | Template errado                    | Evitar import circular          |

## 7. Testes existentes e lacunas

| Teste                                       | O que cobre                                                     | O que nao cobre                  | Importancia | Observacao          |
| ------------------------------------------- | --------------------------------------------------------------- | -------------------------------- | ----------- | ------------------- |
| `registroChecklistIsland.test.jsx`          | Render React, actions/classes, XSS, createRoot fora do adapter  | Save completo                    | Alta        | Protege ilha        |
| `registroChecklistHandlers.test.js`         | Handlers legados status/obs/measure, quick template, seguranca  | PDF final                        | Alta        | Protege delegacao   |
| `registroLegacyChecklistRender.test.js`     | Gate nao-Pro, render inicial, toggle, edit load, quick template | Todos cenarios de save           | Alta        | Protege adapter     |
| `checklistTemplates.test.js`                | Templates, `buildEmptyChecklist`, validate/summarize/measure    | Integração com DOM               | Alta        | Dominio PMOC        |
| `registroSaveSignatureHandlers.test.js`     | Save com checklist/fotos/assinatura                             | Matriz completa de warnings PMOC | Alta        | Cobre caminho amplo |
| `persistence.test.js`                       | Create/edit preservam checklist                                 | Warning/gate/DOM                 | Alta        | CP-K                |
| `pmocReport.test.js`                        | Relatorio PMOC/PDF relacionado                                  | Fluxo Registro completo          | Media/alta  | Consumo downstream  |
| `relatorioExportPmocLegacyHandlers.test.js` | Export PMOC via relatorio                                       | Checklist editado no form        | Media       | Downstream          |
| `registroProximaPreventivaPrompt.test.js`   | Prompt pos-save preventiva                                      | Checklist em si                  | Media       | Fluxo adjacente     |

Lacunas criticas:

- Falta contrato dedicado e pequeno para o comportamento soft-required: preventiva sem checklist ou com obrigatorios pendentes deve avisar e continuar salvando.
- Falta contrato especifico do shape `registro.checklist` de ponta a ponta entre handler, `getCurrentChecklist`, persistence e PDF.
- Gate Pro do checklist existe em testes de render, mas nao como contrato isolado de plano/CTA.
- PDF cobre consumo, mas nao ha contrato focado que prove que itens pendentes continuam omitidos e itens marcados usam labels do template.

## 8. Riscos principais

- `_currentChecklist` e estado interno: risco de vazamento entre registro, edit e clear.
- React island: contratos `data-*` e classes sao usados por handlers legados e CSS.
- Handlers delegados: `r-checklist-obs` e `r-checklist-measure` dependem de listener manual em `document`.
- PlanCache/gating: PMOC formal e checklist preenchivel sao Pro; extracao descuidada pode liberar/bloquear plano errado.
- Payload/saveRegistro: `getCurrentChecklist` retorna `null` quando vazio; mudar isso altera formato salvo.
- Warning soft-required: nao bloqueia save; transformar em erro seria mudanca funcional.
- Persistence CP-K: edit preserva checklist antigo quando nao ha checklist atual; create usa snapshot atual.
- PDF/relatorio: PDF omite itens pendentes e busca labels no template; shape errado gera relatorio incompleto.
- Historico: PMOC/preventivas aparecem em insights/status e podem divergir se tipo/checklist mudar.
- Preventiva/proxima preventiva: fluxo adjacente de prompt nao deve ser misturado com checklist.
- Selectors/data-actions/classes: CP-B cobre contratos, mas qualquer renome quebra handlers.
- Import circular: feature de Registro nao deve importar adapter; checklist extraido nao deve importar views/handlers/React pages diretamente.
- Regressao silenciosa: varios caminhos retornam cedo sem erro quando root/equip/template/gate nao existe.

## 9. Opcoes de proximo CP

| Opcao de proximo CP                                          | Beneficio                                                | Risco                                   | Pre-requisitos          | Recomendacao          |
| ------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------- | ----------------------- | --------------------- |
| CP-U - criar/fortalecer contrato especifico Checklist/PMOC   | Protege soft-required, shape salvo e gate antes de mexer | Baixo                                   | Mapa CP-T               | Recomendado           |
| CP-U - pre-split checklist/PMOC in-place                     | Prepara extracao no adapter                              | Medio/alto sem contrato dedicado        | Contrato especifico     | Depois                |
| CP-U - mover helpers puros Checklist/PMOC direto             | Reduz adapter rapidamente                                | Alto sem travar contratos de shape/gate | Contrato e pre-split    | Nao agora             |
| CP-U - mapear initRegistro/clearRegistro/loadRegistroForEdit | Ajuda lifecycle amplo                                    | Deixa checklist sem contrato novo       | CP-T                    | Alternativa posterior |
| CP-U - mapear relatorio/PDF domain                           | Ataca consumo downstream                                 | Menos imediato que contrato Registro    | CP-N/O/T                | Posterior             |
| CP-U - stability final e encerrar Mudanca 12                 | Encerramento rapido                                      | Risco residual em checklist alto        | Contrato/checklist      | Prematuro             |
| CP-U - mover saveRegistro como orquestrador                  | Reduz god-object                                         | Muito alto                              | Varios cortes pendentes | Nao recomendado       |

## 10. Recomendacao final

Recomendo exatamente **CP-U - criar/fortalecer contrato especifico Checklist/PMOC**.

Justificativa: o fluxo ja esta mapeado, mas o proximo corte seguro ainda depende de proteger explicitamente os pontos que podem mudar comportamento sem quebrar testes amplos: warning soft-required nao bloqueante, shape `registro.checklist`, gate Pro/CTA, snapshot nulo quando vazio e consumo PDF de itens marcados. Esse contrato reduz risco antes de qualquer pre-split in-place.
