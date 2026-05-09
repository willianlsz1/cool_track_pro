# Mudanca 15 / CP-G - Mapeamento Historico -> Registro

## 1. Base

- Branch: `main`
- HEAD: `c2645e3f6fafa721b6da840e7143d9aa68cc406a`
- Data: 2026-05-09
- Arquivos analisados:
  - `src/ui/views/historico.js`
  - `src/ui/views/registro.js`
  - `src/ui/controller/handlers/navigationHandlers.js`
  - `src/ui/controller/handlers/registroHandlers.js`
  - `src/ui/controller/routes.js`
  - `src/__tests__/historicoCardActions.contract.test.js`
  - `src/__tests__/historicoTimelineIsland.test.jsx`
  - `src/__tests__/historicoTimelineLegacyRender.test.js`
  - `src/__tests__/registroLifecycle.contract.test.js`
  - `src/__tests__/regressions/clear-registro-edit-state.test.js`
  - `src/__tests__/regressions/edit-preserves-photos.test.js`
- LOC dos arquivos principais:
  - `src/ui/views/historico.js`: 1758
  - `src/ui/views/registro.js`: 2099
  - `src/ui/controller/handlers/navigationHandlers.js`: 477
  - `src/ui/controller/handlers/registroHandlers.js`: 126
  - `src/ui/controller/routes.js`: arquivo real usado no lugar de `src/ui/routes.js`

## 2. Objetivo

Mapear em modo read-only a integracao Historico -> Registro antes de qualquer pre-split, cobrindo os caminhos de `edit-reg`, `delete-reg`, `deleteReg`, navegacao para edicao, state/storage, confirmacao, re-render e efeitos colaterais.

## 3. Fluxo edit-reg

| Etapa edit-reg       | Responsabilidade                                                                      | Arquivos envolvidos                                              | Dependencias                                     | Side effects                                      | Risco                                                         |
| -------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------- |
| Origem do card       | Renderizar action publica `data-action="edit-reg"` com `data-id` do registro          | `HistoricoTimeline.jsx`, `historicoViewModel.js`, `historico.js` | View model da timeline, registro renderizado     | DOM publico do card                               | Alto: id errado abre registro errado                          |
| Delegation global    | Capturar clique por `data-action` e chamar handler registrado                         | `core/events.js`, `navigationHandlers.js`                        | Delegator global `on`                            | Encaminha evento para handler                     | Medio: handler depende do atributo estar no elemento clicavel |
| Handler edit-reg     | Ler `el.dataset.id` e chamar `goTo('registro', { editRegistroId })`                   | `navigationHandlers.js`                                          | `goTo`                                           | Navegacao para rota Registro                      | Alto: sem id, rota abre modo novo em vez de edicao            |
| Rota Registro        | Executar `initRegistro(params)` e depois `loadRegistroForEdit(params.editRegistroId)` | `src/ui/controller/routes.js`, `registro.js`                     | Router, `populateEquipSelects`, Registro adapter | Inicializa DOM/ilhas e aplica modo edicao         | Alto: ordem init -> load precisa ser preservada               |
| Resolver alvo        | Buscar registro por id com `resolveRegistroEditTarget(registros, id)`                 | `registro.js`, `features/registro/lifecycle/helpers.js`          | `getState`, registros atuais                     | Sem side effect se nao encontrar                  | Medio: fallback silencioso pode mascarar id invalido          |
| Entrar modo edicao   | Gravar `cooltrack-editing-id`, marcar `dataset.editMode`, instalar route guard        | `registro.js`                                                    | `sessionStorage`, `setRouteGuard`                | Estado de edicao ativo                            | Alto: vazamento de edicao afeta proximo save                  |
| Preencher formulario | Aplicar equip/data/tipo/obs/status/cliente/checklist e actions                        | `registro.js`                                                    | Utils DOM, checklist PMOC, assinatura/fotos      | Muta campos e estado local do Registro            | Alto: perda de checklist/fotos/assinatura em edicao           |
| Save posterior       | `saveRegistro` detecta `editingId` e aplica mutation de edicao                        | `registro.js`, `features/registro/save/*`                        | `setState`, `buildRegistroEditStateMutation`     | Atualiza registro existente e navega/limpa estado | Alto: save pode virar criacao se editing id sumir             |
| Fallback ausente     | Se registro nao existe, `loadRegistroForEdit` retorna sem erro                        | `registro.js`                                                    | `getState`                                       | Registro fica inicializado sem preencher edicao   | Medio: falha silenciosa sem feedback direto                   |
| Cobertura atual      | Atributos e consumidor fonte cobertos; destino Registro coberto por lifecycle         | Testes de Historico e Registro                                   | Vitest/JSDOM                                     | N/A                                               | Lacuna: nao ha contrato clique real -> goTo -> load completo  |

## 4. Fluxo delete-reg/deleteReg

| Etapa delete-reg/deleteReg | Responsabilidade                                                                                                    | Arquivos envolvidos                                              | Dependencias                                  | Side effects                                       | Risco                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| Origem do card             | Renderizar action publica `data-action="delete-reg"` com `data-id` do registro                                      | `HistoricoTimeline.jsx`, `historicoViewModel.js`, `historico.js` | View model da timeline                        | DOM publico do card                                | Alto: id errado exclui registro errado                                      |
| Delegation global          | Capturar clique por `data-action` e chamar handler registrado                                                       | `core/events.js`, `registroHandlers.js`                          | Delegator global `on`                         | Encaminha evento para handler                      | Medio                                                                       |
| Handler delete-reg         | Abrir confirmacao com tom danger e labels atuais                                                                    | `registroHandlers.js`                                            | `CustomConfirm.show`                          | Modal de confirmacao                               | Alto: sem confirmacao ha delete acidental                                   |
| Gate de confirmacao        | Chamar `deleteReg(el.dataset.id)` apenas quando `ok` for verdadeiro                                                 | `registroHandlers.js`, `historico.js`                            | `deleteReg`, Promise.resolve                  | Remove se confirmado                               | Alto: id ausente ainda chega ao `deleteReg` se confirmado                   |
| Queue de delecao remota    | Marcar registro deletado para sync posterior                                                                        | `historico.js`, `core/storage.js`, `core/storage/syncState.js`   | `Storage.markRegistroDeleted`, `localStorage` | Queue em `cooltrack-sync-deletions-v1`, dirty sync | Alto: sem queue, remoto pode ressuscitar registro                           |
| Mutacao local              | Remover registro de `prev.registros` via `setState`                                                                 | `historico.js`, `core/state.js`                                  | `setState`, `Storage.save`                    | Persist local e emit listeners                     | Alto: remove do Historico e afeta relatorios                                |
| Recalculo equipamento      | Recalcular status do equipamento pelo ultimo registro restante                                                      | `historico.js`, `core/equipmentRules.js`                         | `getOperationalStatus`, `Utils.daysDiff`      | Atualiza `equipamentos` no state                   | Medio/alto: status operacional pode ficar incorreto                         |
| Assinatura local           | Remover `localStorage` da assinatura do registro                                                                    | `historico.js`                                                   | `localStorage.removeItem`                     | Limpa `cooltrack-sig-${id}`                        | Medio: assinatura orfa se falhar                                            |
| Re-render Historico        | Chamar `renderHist()` e `updateGlobalHeader()`                                                                      | `historico.js`                                                   | Render adapter, header composable             | Atualiza timeline, filtros ativos e header         | Alto: filtro ativo pode deixar estado vazio inesperado                      |
| Feedback                   | Mostrar `Toast.warning('Registro removido do histórico.')`                                                          | `historico.js`                                                   | Toast                                         | Feedback ao usuario                                | Baixo                                                                       |
| Erro de confirmacao/delete | Capturar erro e chamar `handleError`                                                                                | `registroHandlers.js`                                            | `ErrorCodes`, `handleError`                   | Toast/log de erro                                  | Medio: contexto depende de `el.dataset.id`                                  |
| Cobertura atual            | Atributos e fonte do handler cobertos; `Storage.markRegistroDeleted` coberto em storage; render legacy mocka delete | Testes de Historico/Storage                                      | Vitest/JSDOM                                  | N/A                                                | Lacuna: nao ha contrato dedicado do clique confirmado ate mutation completa |

## 5. Contratos publicos

| Contrato Historico -> Registro | Origem                                  | Consumidor                           | Teste existente                                               | Risco se alterar                               |
| ------------------------------ | --------------------------------------- | ------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------- |
| `data-action="edit-reg"`       | `HistoricoTimeline.jsx`                 | `navigationHandlers.js`              | `historicoCardActions.contract.test.js`, timeline tests       | Edição via card quebra                         |
| `data-action="delete-reg"`     | `HistoricoTimeline.jsx`                 | `registroHandlers.js`                | `historicoCardActions.contract.test.js`, timeline tests       | Exclusao via card quebra                       |
| `data-id`                      | Timeline/card                           | Edit/delete/signature/menu handlers  | `historicoCardActions.contract.test.js`                       | Registro alvo errado                           |
| `deleteReg` exportado          | `historico.js`                          | `registroHandlers.js`, testes legacy | Cobertura indireta em `historicoTimelineLegacyRender.test.js` | Delete deixa de atualizar state/storage/header |
| `loadRegistroForEdit`          | `registro.js`                           | `routes.js`                          | `registroLifecycle.contract.test.js`                          | Edicao nao preenche form                       |
| `editRegistroId`               | `navigationHandlers.js` e router params | Rota Registro                        | Contrato fonte em `historicoCardActions.contract.test.js`     | Registro abre em modo novo                     |
| `cooltrack-editing-id`         | `registro.js`                           | `saveRegistro`, clear/reset          | `registroLifecycle.contract.test.js`, regressions             | Save edita/cria errado                         |
| Confirmacao delete             | `registroHandlers.js`                   | Usuario e `deleteReg`                | Sem contrato dedicado do Historico                            | Delete acidental ou bloqueado                  |
| Re-render pos-delete           | `historico.js`                          | Timeline/header                      | Cobertura parcial por mocks legacy                            | Lista stale ou header stale                    |
| Fallback id/registro ausente   | `registro.js`, `deleteReg`              | Fluxos edit/delete                   | Parcial                                                       | Falha silenciosa dificil de diagnosticar       |

## 6. Dependencias tecnicas

| Dependencia            | Usada onde                                        | Funcao                                      | Acoplamento | Risco      | Estrategia sugerida                                      |
| ---------------------- | ------------------------------------------------- | ------------------------------------------- | ----------- | ---------- | -------------------------------------------------------- |
| `core/state`           | `historico.js`, `registro.js`                     | Ler/mutar registros e equipamentos          | Forte       | Alto       | Contratar mutation antes de mover delete                 |
| `Storage`              | `historico.js`, `core/state.js`                   | Queue de delete e persist local             | Forte       | Alto       | Verificar `markRegistroDeleted` + `setState` no contrato |
| `Router/goTo`          | `navigationHandlers.js`, Registro post-save       | Navegacao com params                        | Forte       | Alto       | Tratar `editRegistroId` como contrato publico            |
| Registro adapter       | `registro.js`, `routes.js`, `registroHandlers.js` | Init, edit load, clear/save                 | Forte       | Alto       | Mapear antes de extrair edit/delete                      |
| Historico adapter      | `historico.js`                                    | Render, `deleteReg`, filtros e side effects | Forte       | Alto       | Manter orquestrador ate contratos dedicados              |
| `Toast/handleError`    | `historico.js`, `registroHandlers.js`             | Feedback e erro                             | Medio       | Medio      | Preservar mensagens e contexto                           |
| `CustomConfirm`        | `registroHandlers.js`                             | Gate de exclusao                            | Medio       | Alto       | Criar contrato para confirm true/false                   |
| `getOperationalStatus` | `historico.js`                                    | Recalculo pos-delete                        | Medio       | Medio/alto | Cobrir status de equipamento em delete                   |
| Filtros/render         | `historico.js`, render helpers                    | Re-render depois de delete                  | Medio       | Medio      | Testar delete com filtros ativos                         |

## 7. Testes existentes e lacunas

| Teste                                                         | O que cobre                                                       | O que nao cobre                       | Importancia | Observacao                              |
| ------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------- | ----------- | --------------------------------------- |
| `src/__tests__/historicoCardActions.contract.test.js`         | `edit-reg`, `delete-reg`, `data-id`, fonte dos handlers           | Clique real com `goTo`/confirm/delete | Alta        | Contrato CP-B preservado                |
| `src/__tests__/historicoTimelineIsland.test.jsx`              | Actions e atributos no card React, delegation basica              | Handler global real e state/storage   | Alta        | Garante DOM publico                     |
| `src/__tests__/historicoTimelineLegacyRender.test.js`         | Render legado, mocks de Storage/router, atributos publicos        | Fluxo confirmado de delete completo   | Alta        | Nao testa `deleteReg` via click real    |
| `src/__tests__/historicoView.test.js`                         | Helpers e render Historico                                        | Integracao Registro completa          | Media/alta  | Cobertura ampla, nao focada no fluxo    |
| `src/__tests__/registroLifecycle.contract.test.js`            | `initRegistro`, `loadRegistroForEdit`, `clearRegistro`, save edit | Origem Historico `edit-reg`           | Alta        | Cobre destino, nao fonte                |
| `src/__tests__/regressions/clear-registro-edit-state.test.js` | Limpeza de estado de edicao                                       | Entrada via card Historico            | Alta        | Protege vazamento de edit mode          |
| `src/__tests__/regressions/edit-preserves-photos.test.js`     | Edicao preserva fotos                                             | Origem Historico                      | Alta        | Protege payload de edicao               |
| `src/__tests__/storage.integration.test.js`                   | `Storage.markRegistroDeleted` e sync queue                        | `deleteReg` do Historico completo     | Alta        | Cobre storage, nao orquestracao do card |

Lacunas criticas:

- Falta contrato dedicado Historico -> Registro para `edit-reg` chamando `goTo('registro', { editRegistroId })` a partir do card.
- Falta contrato dedicado para `delete-reg` com confirmacao `true/false`.
- Falta contrato de `deleteReg` cobrindo `Storage.markRegistroDeleted`, `setState`, recalculo de equipamento, assinatura local, `renderHist`, `updateGlobalHeader` e Toast no mesmo fluxo.
- Falta caso com filtro ativo depois de delete.
- Falta fallback explicito para id ausente/registro inexistente.

## 8. Riscos principais

- Registro errado em edicao por quebra de `data-id` ou `editRegistroId`.
- Delete errado por `data-id` incorreto ou handler global apontando para outro elemento.
- State/storage inconsistentes se `Storage.markRegistroDeleted` e `setState` divergirem.
- Re-render pos-delete pode esconder regressao quando filtro ativo resulta em estado vazio.
- Confirmacao/fallback ainda nao tem contrato focado.
- Import circular: `registroHandlers.js` importa `deleteReg` de `historico.js`, enquanto routes importam Historico e Registro.
- Regressao silenciosa porque varios contratos estao espalhados entre timeline, handlers, Registro lifecycle e Storage.

## 9. Opcoes de proximo CP

| Opcao de proximo CP                               | Beneficio                                                      | Risco                      | Pre-requisitos                                         | Recomendacao                                    |
| ------------------------------------------------- | -------------------------------------------------------------- | -------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| CP-H - contrato Historico -> Registro edit/delete | Trava clique/handler/confirm/delete antes de mexer em producao | Baixo/medio                | Mocks pequenos de router, confirm, state/storage       | Recomendado                                     |
| CP-H - pre-split deleteReg                        | Reduz tamanho do adapter e isola delete                        | Alto sem contrato dedicado | Contrato edit/delete primeiro                          | Nao recomendado agora                           |
| CP-H - pre-split edit action                      | Reduz acoplamento da action de edicao                          | Medio/alto                 | Contrato de `goTo`/`editRegistroId`                    | Nao recomendado agora                           |
| CP-H - mapear Historico -> PDF/WhatsApp           | Mapeia outro risco de card actions                             | Baixo                      | Pode ser feito depois do contrato Registro             | Alternativa, mas Registro tem maior risco atual |
| CP-H - stability checkpoint                       | Consolida estado atual                                         | Baixo                      | Encerrar so apos contrato Registro ou decisao de parar | Prematuro                                       |

## 10. Recomendacao final

Proximo CP recomendado: **CP-H - contrato Historico -> Registro edit/delete**.

Justificativa: ha mais de 90% de confianca de que o proximo corte seguro deve ser contrato, nao refatoracao. O fluxo edit/delete cruza `HistoricoTimeline.jsx`, handlers globais, router, Registro adapter, `deleteReg`, state/storage, confirmacao, header e Toast. Sem um contrato focado, qualquer pre-split de `deleteReg` ou action de edicao pode quebrar registro alvo, delete remoto/local ou re-render de forma silenciosa.

## Complemento CP-H

- Contrato criado em `src/__tests__/historicoRegistroIntegration.contract.test.js`.
- Lacunas reduzidas: `edit-reg` ate `goTo('registro', { editRegistroId })`, rota Registro com `loadRegistroForEdit`, `delete-reg` com confirmacao cancelada/confirmada e `deleteReg` cobrindo storage, state, recalculo de equipamento, assinatura local, re-render, header e Toast.
- Nenhuma mudanca funcional foi aplicada.
- Proximo corte ficou mais seguro para **CP-I - pre-split deleteReg**, mantendo `deleteReg` no adapter e quebrando apenas responsabilidades locais.
