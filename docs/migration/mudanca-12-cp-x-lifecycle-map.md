# Mudança 12 / CP-X - Mapeamento lifecycle Registro

## 1. Base

- Branch: `main`
- HEAD: `e044683692a53984238aa91b7bf174db89687704`
- Data: 2026-05-09
- Adapter analisado: `src/ui/views/registro.js`
- LOC atual de `src/ui/views/registro.js`: 1748

## 2. Objetivo

Mapear em modo read-only os fluxos publicos de lifecycle do adapter Registro (`initRegistro`, `clearRegistro` e `loadRegistroForEdit`) antes de qualquer pre-split ou extracao.

## 3. initRegistro

| Etapa initRegistro                     | Responsabilidade                               | Dependencias                                                                         | Side effects                                        | Risco       | Pode mover?                  | Observacao                                                    |
| -------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- | ----------- | ---------------------------- | ------------------------------------------------------------- |
| Assinatura `initRegistro(params = {})` | Entrada publica da rota Registro               | `params.equipId`, `params.equipamentoId`, `params.editRegistroId`                    | Nenhum retorno relevante; aborta se root nao existe | Medio       | Nao como bloco               | API publica usada por routes e testes                         |
| Root DOM `view-registro`               | Localizar tela e abortar sem root              | `Utils.getEl`                                                                        | Leitura DOM                                         | Medio       | Talvez helper pequeno        | Falha silenciosa e intencional se a view nao existe           |
| Equipamento por rota                   | Aplicar `equipId` inicial                      | `Utils.setVal('r-equip')`, params                                                    | Mutacao DOM                                         | Alto        | Nao neste estado             | Ordem importa para contexto/checklist                         |
| Params/contexto inicial                | Atualizar `_currentRouteParams` e contexto     | `_refreshRegistroContext`, `resolveRegistroContext`, state                           | Mutacao de contexto visual                          | Alto        | Nao                          | Executa antes e depois dos binds/defaults                     |
| Skeleton + header React                | Montar header dentro de `withSkeleton`         | `withSkeleton`, `mountRegistroHeader`, bridge React                                  | Mount React async, generation guard                 | Alto        | Nao                          | Root/header e props dependem do adapter                       |
| Progress/binds de campos               | Criar barra e listeners idempotentes           | `_ensureProgressBar`, `_bindRegistroHeaderFieldHandlers`, `_fields`                  | DOM, listeners, dataset guards                      | Alto        | Pre-split local primeiro     | Inclui equip/tipo/custom e checklist side effects             |
| Smart contact mask                     | Bind unico no contato                          | `bindSmartContactMaskInput`, DOM                                                     | Listener em input                                   | Medio       | Talvez wrapper DI            | Depende de root `dataset.bound`                               |
| Tipo/materiais/impacto                 | Sincronizar custom tipo, details e progresso   | `_syncTipoCustomVisibility`, `_syncMateriaisDetailsState`, `_syncImpactDetailsState` | Mutacao DOM, details open/aria                      | Medio/alto  | Pre-split local              | Coberto por testes de materiais/impacto                       |
| Photos render                          | Renderizar fotos legadas                       | `Photos.render`                                                                      | Mutacao DOM/componente legado                       | Alto        | Nao                          | Estado de fotos ja tem feature save, mas render segue adapter |
| Default data                           | Preencher `r-data` quando vazio                | `Utils.getVal`, `Utils.setVal`, `Utils.nowDatetime`                                  | Mutacao DOM                                         | Medio       | Talvez helper puro + wrapper | Ordem antes do bind datetime                                  |
| Datetime UX local                      | Bind botoes hoje/editar/label                  | `document.getElementById`, `showPicker`, focus                                       | Listeners, focus, label, aria                       | Medio/alto  | Nao direto                   | Funcao aninhada; bom alvo de pre-split                        |
| Tecnico default                        | Preencher tecnico se vazio                     | `Profile.getDefaultTecnico`, DOM                                                     | Mutacao DOM                                         | Medio       | Com DI depois                | Acoplado a Profile                                            |
| Reset editing em create                | Sair de modo edicao se nao ha `editRegistroId` | `resetEditingState`, sessionStorage, route guard                                     | Limpa storage/guard/dataset                         | Alto        | Nao sem contrato             | Interage com `loadRegistroForEdit`                            |
| View model read-only                   | Recalcular read-only props/contexto            | `_buildRegistroReadOnlyViewModel`                                                    | Atualiza context/share actions                      | Medio       | Talvez helper depois         | Chamada nao usa retorno diretamente                           |
| Prioridade default                     | Preencher prioridade media                     | DOM                                                                                  | Mutacao DOM                                         | Baixo/medio | Sim, se isolado              | Simples, mas ordem importa                                    |
| Assinatura hint                        | Montar assinatura/hint                         | `applySignatureHint`, `mountRegistroSignature`, bridge React                         | Mount React async                                   | Alto        | Nao                          | Bridge e plano/assinatura permanecem adapter                  |

## 4. clearRegistro

| Etapa clearRegistro                               | Responsabilidade                 | Dependencias                                                                         | Side effects                              | Risco      | Pode mover?         | Observacao                                          |
| ------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------- | ---------- | ------------------- | --------------------------------------------------- |
| Assinatura `clearRegistro(preserveEquip = false)` | API publica de reset             | Handler `clear-registro`, post-save, guards internos                                 | Retorno vazio                             | Alto       | Nao como bloco      | Usado por handler e fluxos internos                 |
| Lista `toClear`                                   | Definir campos a limpar          | IDs publicos do formulario                                                           | Nenhum ate chamar clear                   | Medio      | Sim, helper puro    | Preservar `preserveEquip`                           |
| Limpeza de campos                                 | Limpar valores DOM               | `Utils.clearVals`                                                                    | Mutacao DOM                               | Alto       | Wrapper local       | IDs publicos sensiveis                              |
| Reset edit mode                                   | Sair de edicao                   | `resetEditingState`, sessionStorage, route guard                                     | Remove `EDITING_KEY`, limpa guard/dataset | Alto       | Nao sem contrato    | Protegido por regressao `clear-registro-edit-state` |
| Defaults status/prioridade/data                   | Reaplicar defaults               | `Utils.setVal`, `Utils.nowDatetime`                                                  | Mutacao DOM                               | Medio      | Talvez helper local | Ordem antes de refresh visual                       |
| Fotos                                             | Limpar evidencias                | `Photos.clear`                                                                       | Mutacao storage/DOM/componente            | Alto       | Nao                 | Fotos CP-F e render legado preservados              |
| Assinatura                                        | Limpar draft e remount           | `clearRegistroSignatureAfterSave`, `mountRegistroSignature`                          | Limpa draft e remonta bridge              | Alto       | Nao                 | Assinatura CP-I preservada                          |
| Tipo/materiais/impacto                            | Recolher custom/details          | `_syncTipoCustomVisibility`, `_syncMateriaisDetailsState`, `_syncImpactDetailsState` | Mutacao DOM/details                       | Medio/alto | Pre-split local     | Coberto por materias toggle                         |
| Progress meter                                    | Recalcular hero meter            | `_updateProgressBar`                                                                 | Mutacao DOM                               | Medio      | Talvez helper       | Deve manter markup                                  |
| Quick template chips                              | Reset visual dos chips           | `document.querySelectorAll`, classes/aria                                            | Mutacao DOM                               | Medio      | Nao direto          | Selectors/classes publicos                          |
| Checklist/PMOC                                    | Resetar state/render/upsell      | `resetChecklist`, `_currentChecklist`, unmount React                                 | State, DOM, bridge React                  | Alto       | Nao                 | Contrato CP-U preserva nao vazamento                |
| Tecnico default                                   | Repreencher tecnico              | `Profile.getDefaultTecnico`                                                          | Mutacao DOM                               | Medio      | Com DI depois       | Relacao com Profile                                 |
| Ultimo cliente                                    | Reaplicar cliente recente        | `_loadLastClient`, localStorage                                                      | Leitura storage + DOM                     | Medio/alto | Nao agora           | Comportamento UX silencioso                         |
| Botao salvar                                      | Resetar label/classe             | DOM, `[data-action="save-registro"]`                                                 | Mutacao label/classe                      | Medio      | Talvez helper local | Preserva SVG interno                                |
| Hero/title                                        | Resetar textos de modo novo      | `HERO_PILL_TEXT_ID`, `.section-title`                                                | Mutacao DOM                               | Medio      | Talvez helper local | Contrato visual                                     |
| Contexto final                                    | Atualizar contexto/share actions | `_refreshRegistroContext`                                                            | Mutacao visual/share actions              | Alto       | Nao                 | Fecha o reset                                       |

## 5. loadRegistroForEdit

| Etapa loadRegistroForEdit            | Responsabilidade                                        | Dependencias                                                                                       | Side effects                                 | Risco      | Pode mover?         | Observacao                                       |
| ------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------- | ------------------- | ------------------------------------------------ |
| Assinatura `loadRegistroForEdit(id)` | API publica de entrada em edicao                        | Route params, testes, historico/handlers indiretamente                                             | Retorno vazio                                | Alto       | Nao como bloco      | Chamado pela rota apos `initRegistro`            |
| Resolver registro                    | Buscar registro por id                                  | `getState().registros`                                                                             | Leitura state; aborta se ausente             | Medio      | Talvez helper puro  | Falha silenciosa se nao encontra                 |
| Marcar edicao                        | Gravar `EDITING_KEY` e dataset                          | `sessionStorage`, `view-registro`                                                                  | Storage + DOM dataset                        | Alto       | Nao sem contrato    | Base para save edit/clear                        |
| Route guard                          | Bloquear saida sem confirmar                            | `setRouteGuard`, `_confirmLeaveEditingGuard`                                                       | Side effect global de roteamento             | Alto       | Nao                 | Limpado por `resetEditingState`                  |
| Campos principais                    | Preencher equip/data/tipo/obs/tecnico/status/prioridade | `Utils.setVal`, DOM                                                                                | Mutacao DOM                                  | Alto       | Pre-split local     | Ordem do tipo custom importa                     |
| Tipo `Outro`                         | Separar prefixo salvo                                   | `TIPO_OUTRO_PREFIX`, `_syncTipoCustomVisibility`                                                   | Mutacao DOM/visibility                       | Medio      | Sim apos contrato   | Risco de payload final                           |
| Materiais/impacto                    | Restaurar details conforme valores                      | `_hasImpactValues`, `_syncImpactDetailsState`, `_hasMateriaisValues`, `_syncMateriaisDetailsState` | Mutacao DOM/details                          | Medio/alto | Pre-split local     | Coberto por testes                               |
| Cliente/contexto                     | Preencher cliente/local/contato                         | DOM, campos payload                                                                                | Mutacao DOM                                  | Medio      | Talvez helper       | Afeta PDF/WhatsApp                               |
| Checklist/PMOC                       | Restaurar checklist ou render vazio por equipamento     | `loadChecklistForEdit`, `renderChecklist`                                                          | State `_currentChecklist`, DOM, bridge React | Alto       | Nao                 | Contrato CP-U                                    |
| Botao salvar                         | Alterar label/classe para edicao                        | DOM, `[data-action="save-registro"]`                                                               | Mutacao DOM/classes                          | Medio      | Talvez helper local | Preserva SVG interno                             |
| Hero/title                           | Alterar textos para modo edicao                         | `HERO_PILL_TEXT_ID`, `.section-title`                                                              | Mutacao DOM                                  | Medio      | Talvez helper local | Testado por header legacy                        |
| Contexto final                       | Atualizar contexto/share actions                        | `_refreshRegistroContext`                                                                          | Mutacao visual/share actions                 | Alto       | Nao                 | Deve ocorrer apos preencher campos               |
| Registro ausente                     | Abortar silenciosamente                                 | `if (!r) return`                                                                                   | Nenhum                                       | Medio      | Preservar           | Lacuna: contrato dedicado pequeno poderia travar |

## 6. Helpers compartilhados de lifecycle

| Helper lifecycle compartilhado                        | Usado por                     | Responsabilidade                     | Dependencias                                  | Side effects               | Risco      | Próximo tratamento            |
| ----------------------------------------------------- | ----------------------------- | ------------------------------------ | --------------------------------------------- | -------------------------- | ---------- | ----------------------------- |
| `mountRegistroHeader` / `unmountRegistroHeader`       | rota, `initRegistro`, onLeave | Bridge React do header               | dynamic import, root DOM, view model          | Mount/unmount React        | Alto       | Manter ate mapa de bridges    |
| `mountRegistroChecklist` / `unmountRegistroChecklist` | checklist render, rota        | Bridge React checklist               | dynamic import, `_currentChecklist`, root DOM | Mount/unmount React        | Alto       | Manter no adapter             |
| `unmountRegistroPhotos`                               | rota                          | Limpar preview fotos                 | `Photos.clearPreview`                         | Mutacao DOM/componente     | Medio/alto | Mapear com lifecycle photos   |
| `mountRegistroSignature` / `unmountRegistroSignature` | init/clear/rota               | Bridge React assinatura              | dynamic import, root DOM, draft               | Mount/unmount React        | Alto       | Manter no adapter             |
| `resetEditingState`                                   | init/clear/save edit          | Limpar modo edicao                   | sessionStorage, route guard, dataset          | Storage/global route/DOM   | Alto       | Criar contrato antes          |
| `_bindRegistroHeaderFieldHandlers`                    | init                          | Binds idempotentes de campos         | DOM, `_fields`, checklist/contexto            | Listeners/dataset          | Alto       | Pre-split init                |
| `_syncTipoCustomVisibility`                           | init/load/clear/save          | Mostrar/ocultar tipo custom          | DOM, focus opcional                           | DOM/focus                  | Medio      | Pre-split local               |
| `_syncMateriaisDetailsState`                          | init/clear/load               | Details materiais                    | DOM/details/aria                              | Mutacao DOM                | Medio      | Pode virar helper com DI      |
| `_syncImpactDetailsState`                             | init/clear/load               | Details impacto                      | DOM/details/aria                              | Mutacao DOM                | Medio      | Pode virar helper com DI      |
| `_updateProgressBar`                                  | init/clear/binds              | Hero meter/progresso                 | DOM, fields                                   | Mutacao DOM                | Medio      | Pre-split init/clear          |
| `resetChecklist` / `loadChecklistForEdit`             | clear/load                    | Reset/restore PMOC                   | state checklist, render bridge                | State/DOM/React            | Alto       | Manter por enquanto           |
| `applySignatureHint`                                  | init                          | Montar assinatura                    | signature bridge                              | Mount React                | Alto       | Manter por enquanto           |
| `_refreshRegistroContext`                             | init/clear/load/save          | Contexto cliente/equip/share actions | state, DOM, view model                        | Mutacao DOM/share actions  | Alto       | Mapear separadamente se mover |
| `_loadLastClient`                                     | clear                         | Reaplicar ultimo cliente             | localStorage                                  | Storage read + DOM callers | Medio      | DI em CP futuro               |

## 7. Testes existentes e lacunas

| Teste                                                             | O que cobre                                                         | O que não cobre                       | Importância | Observação                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------- | ----------- | ------------------------------------- |
| `src/__tests__/registroRouteLifecycle.test.js`                    | Ordem rota: `initRegistro`, `loadRegistroForEdit`, unmounts onLeave | Internos de cada funcao               | Alta        | Contrato de rota principal            |
| `src/__tests__/registroLegacyHeaderRender.test.js`                | init novo/edit, hero, campos, contexto, XSS                         | Todos os resets de clear              | Alta        | Bom guard para pre-split init/load    |
| `src/__tests__/regressions/clear-registro-edit-state.test.js`     | `clearRegistro`, save edit e `pagehide` limpam edit state           | Reset visual completo                 | Alta        | Essencial para CP de clear            |
| `src/__tests__/registroMateriaisToggle.test.js`                   | init/load de materiais e save com materiais                         | Clear completo                        | Media/alta  | Protege details                       |
| `src/__tests__/registroChecklistHandlers.test.js`                 | Binds/action checklist e resumo                                     | Lifecycle completo de init/clear/load | Alta        | Complementa CP-U                      |
| `src/__tests__/registroLegacyChecklistRender.test.js`             | render/gate checklist no adapter                                    | Load edit com checklist completo      | Alta        | Cobertura de gate Pro                 |
| `src/__tests__/registroChecklistPmoc.contract.test.js`            | contrato PMOC, warning, persistence, PDF                            | lifecycle init/clear/edit dedicado    | Alta        | CP-U preservado                       |
| `src/__tests__/registroLegacySignatureRender.test.js`             | assinatura/hint por plano                                           | clear/remount completo                | Alta        | Cobre parte de init                   |
| `src/__tests__/registroSaveSignatureHandlers.test.js`             | save com assinatura/checklist/fotos                                 | init/clear isolados                   | Alta        | Fluxo integrado                       |
| `src/__tests__/registroPostSaveLegacyFlow.test.js`                | post-save e edit                                                    | internals de lifecycle                | Alta        | Pega regressao transversal            |
| `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`    | registroId PDF/WhatsApp                                             | lifecycle                             | Alta        | CP-O preservado                       |
| `src/features/registro/__tests__/checklist/pmocChecklist.test.js` | helpers puros CP-W                                                  | adapter lifecycle                     | Media       | Garante ausencia de import do adapter |

Lacunas criticas antes de pre-split: contrato dedicado para `initRegistro/clearRegistro/loadRegistroForEdit` em um unico arquivo; caso de `loadRegistroForEdit` com id ausente; reset completo de fotos/assinatura/checklist em clear; ordem relativa `initRegistro -> loadRegistroForEdit`; e idempotencia de binds depois de reentradas na rota.

Complemento CP-Y: `src/__tests__/registroLifecycle.contract.test.js` foi criado para reduzir a lacuna principal. O contrato cobre root ausente em `initRegistro`, defaults/roots/actions publicos, `clearRegistro(true)` preservando equipamento e limpando edit mode/sessionStorage/guard, reset de fotos/assinatura/checklist, `loadRegistroForEdit` preenchendo campos e restaurando Checklist/PMOC, fallback silencioso para registro ausente e sequencia `initRegistro -> clearRegistro -> loadRegistroForEdit`.

## 8. Riscos principais

- DOM/global roots: `view-registro`, `registro-header-root`, `r-checklist-body`, signature root e query selectors publicos.
- Bridges React: header, checklist, photos preview e signature usam dynamic import/generation guard.
- Reset visual: labels, hero, chips, details e progress bar podem ficar stale.
- Modo edicao: `sessionStorage[EDITING_KEY]`, `data-edit-mode` e route guard precisam limpar em save/clear/pagehide.
- Fotos/evidencias: clear/render/save sao separados entre componente legado e feature save.
- Assinatura: draft local, hint e remount sao acoplados ao lifecycle.
- Checklist/PMOC: `_currentChecklist`, gate Pro e render React seguem no adapter.
- Profile/sessionStorage: tecnico default, ultimo cliente e editing id tem side effects silenciosos.
- Toast/focus: tipo custom/datetime/guard usam foco/confirmacao.
- Import circular: features nao devem importar `src/ui/views/registro.js`.
- Regressao silenciosa: varios caminhos abortam sem erro se root/registro/equipamento nao existe.

## 9. Opções de próximo CP

| Opção de próximo CP                                   | Benefício                                     | Risco      | Pré-requisitos                        | Recomendação          |
| ----------------------------------------------------- | --------------------------------------------- | ---------- | ------------------------------------- | --------------------- |
| CP-Y - contrato lifecycle init/clear/edit             | Trava ordem e efeitos publicos antes de mexer | Baixo      | Usar mocks/DOM focados                | Recomendado           |
| CP-Y - pre-split clearRegistro                        | Reduz funcao de reset e prepara extracao      | Medio/alto | Contrato clear dedicado               | Aguardar contrato     |
| CP-Y - pre-split loadRegistroForEdit                  | Separa preenchimento edit                     | Medio/alto | Contrato edit dedicado                | Aguardar contrato     |
| CP-Y - pre-split initRegistro                         | Separa entrada/mount/binds/defaults           | Alto       | Contrato init dedicado                | Aguardar contrato     |
| CP-Y - mover helpers seguros Checklist/PMOC restantes | Reduz adapter pontualmente                    | Alto       | DI de DOM/state/gate clara            | Nao recomendado agora |
| CP-Y - stability final e encerrar Mudança 12          | Fecha etapa                                   | Medio      | Aceitar riscos lifecycle              | Prematuro             |
| CP-Y - mover saveRegistro como orquestrador           | Reduz god-object                              | Muito alto | Lifecycle e DOM/state ainda acoplados | Nao recomendado       |

## 10. Recomendação final

**CP-Y - contrato lifecycle init/clear/edit.**

Confianca: 90%+. O lifecycle ainda concentra DOM, bridges React, Profile, sessionStorage, route guard, reset visual, fotos, assinatura e checklist. Antes de qualquer pre-split de `clearRegistro`, `loadRegistroForEdit` ou `initRegistro`, o corte mais seguro e criar um contrato dedicado que trave a ordem publica e os efeitos minimos desses tres fluxos.

Atualizacao pos CP-Y: com o contrato dedicado criado, o proximo corte mais seguro passa a ser **CP-Z - pre-split clearRegistro**, mantendo tudo no adapter e preservando comportamento.
