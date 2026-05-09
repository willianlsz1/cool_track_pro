# Mudanca 12 - Registro / Inventario inicial

## 1. Base

- Branch: main
- HEAD: e10ce0f12648461e770b764251162bd501a51f9a
- Data: 2026-05-08
- Arquivos analisados: `src/ui/views/registro.js`, `src/ui/controller/handlers/registroHandlers.js`, `src/ui/viewModels/registro*.js`, `src/ui/components/registro*.js`, `src/ui/components/signature*.js`, `src/core/photoStorage.js`, `src/core/signatureStorage.js`, `src/domain/registroStatus.js`, `src/domain/pdf/sections/services.js`, `src/domain/pdf/sections/signatures.js`, `src/ui/views/historico.js`, `src/ui/views/relatorio.js`, ilhas React de Registro e testes relacionados.
- Arquivo principal identificado: `src/ui/views/registro.js`
- LOC do arquivo principal: 1997

## 2. Objetivo

Mapear profundamente o fluxo de Registro antes de qualquer refatoracao, identificando responsabilidades, contratos publicos, dependencias, riscos, cobertura existente e uma sequencia segura de CPs para extrair/refatorar Registro sem mudanca funcional.

## 3. Escopo real de Registro

| Arquivo                                                                                                       |    LOC | Tipo                       | Responsabilidade aparente                                                                                                                                                 | Exporta APIs publicas?                                                                                           | Risco                                                                             |
| ------------------------------------------------------------------------------------------------------------- | -----: | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/ui/views/registro.js`                                                                                    |   1997 | view/orquestrador legado   | Inicializacao, header/checklist/signature bridges, formulario, save/edit/reset, quick templates, PMOC, fotos, assinatura, cliente/equipamento/contexto, post-save, guards | Sim: `initRegistro`, `saveRegistro`, `clearRegistro`, `loadRegistroForEdit`, checklist/signature/unmount helpers | Alto: god-object, mistura DOM/state/storage/React islands/negocio                 |
| `src/ui/controller/handlers/registroHandlers.js`                                                              |    126 | controller/handlers        | Liga `data-action` aos fluxos publicos de Registro e delete historico                                                                                                     | Sim: `bindRegistroHandlers`                                                                                      | Medio: depende diretamente de exports da view e historico                         |
| `src/ui/composables/registroContext.js`                                                                       |     98 | composable/contexto        | Resolve contexto cliente/setor/equipamento para formulario                                                                                                                | Sim                                                                                                              | Medio: acopla Registro a Clientes/Equipamentos/Setores                            |
| `src/ui/helpers/registroPure.js`                                                                              |    n/a | helper puro                | Normalizacao simples e deteccao de preventiva                                                                                                                             | Sim                                                                                                              | Baixo: candidato bom para manter/expandir helpers puros                           |
| `src/ui/viewModels/registroContracts.js`                                                                      |    121 | contratos/selectors        | IDs, actions, classes e atributos publicos de Registro                                                                                                                    | Sim                                                                                                              | Alto se divergente do DOM real; deve virar baseline de CP-B                       |
| `src/ui/viewModels/registroViewModel.js`                                                                      |    300 | view model                 | Normaliza form, progresso, validacao, contexto, actions e checklist model                                                                                                 | Sim                                                                                                              | Medio: usa `validateRegistroPayload` e contexto; bom candidato a extracao testada |
| `src/ui/viewModels/registroPhotosModel.js`                                                                    |     32 | view model fotos           | Sanitizacao de src e itens de preview                                                                                                                                     | Sim                                                                                                              | Baixo/medio: seguranca de URL/data URL                                            |
| `src/ui/viewModels/registroSignatureModel.js`                                                                 |     46 | view model assinatura      | Contratos/actions de assinatura e modelo do hint                                                                                                                          | Sim                                                                                                              | Medio: gating Plus e sanitizacao de assinatura                                    |
| `src/react/entrypoints/registroHeaderIsland.jsx`                                                              |     44 | bridge React               | Monta/desmonta ilha React do header                                                                                                                                       | Sim                                                                                                              | Medio: root/generation guard no legado                                            |
| `src/react/pages/RegistroHeader.jsx`                                                                          |    472 | React UI                   | Hero, progresso, acoes rapidas, campos principais, contexto, dados cliente                                                                                                | Sim                                                                                                              | Alto: muitos selectors/classes e campos obrigatorios                              |
| `src/react/entrypoints/registroChecklistIsland.jsx`                                                           |     44 | bridge React               | Monta/desmonta checklist React                                                                                                                                            | Sim                                                                                                              | Medio: depende de actions e `data-item-id`                                        |
| `src/react/pages/RegistroChecklist.jsx`                                                                       |    154 | React UI                   | Linhas/status/obs/medidas do checklist PMOC                                                                                                                               | Sim                                                                                                              | Alto: PMOC e selectors de input delegados                                         |
| `src/react/entrypoints/registroPhotosIsland.jsx`                                                              |     44 | bridge React               | Monta/desmonta fotos React                                                                                                                                                | Sim                                                                                                              | Medio: tambem convive com `Photos` legado                                         |
| `src/react/pages/RegistroPhotos.jsx`                                                                          |    123 | React UI                   | Drop zone, camera, thumbnails e actions de fotos                                                                                                                          | Sim                                                                                                              | Alto: contratos de input/preview/fallback                                         |
| `src/react/entrypoints/registroSignatureIsland.jsx`                                                           |     55 | bridge React               | Monta/desmonta assinatura React                                                                                                                                           | Sim                                                                                                              | Medio: gating e root `registro-signature-hint`                                    |
| `src/react/pages/RegistroSignature.jsx`                                                                       |    162 | React UI                   | Hint, preview e CTAs de assinatura                                                                                                                                        | Sim                                                                                                              | Alto: plano Plus, preview seguro, actions                                         |
| `src/ui/components/photos.js`                                                                                 |    221 | componente legado          | Estado/preview/lightbox de fotos pendentes                                                                                                                                | Sim                                                                                                              | Alto: fonte de `Photos.pending` consumida por save                                |
| `src/core/photoStorage.js`                                                                                    |    547 | storage/sync               | Upload, fila offline, signed URLs, PDF data URL                                                                                                                           | Sim                                                                                                              | Alto: Supabase/offline/fallback e PDF                                             |
| `src/ui/components/signature.js`                                                                              |     13 | fachada componente         | Reexporta modal/storage/viewer de assinatura                                                                                                                              | Sim                                                                                                              | Medio: dynamic import no save                                                     |
| `src/ui/components/signature/signature-modal.js`                                                              |    212 | modal                      | Captura assinatura                                                                                                                                                        | Sim                                                                                                              | Alto: UX/modal/canvas                                                             |
| `src/ui/components/signature/signature-viewer-modal.js`                                                       |    206 | modal                      | Visualizacao de assinatura                                                                                                                                                | Sim                                                                                                              | Medio: historico/relatorio                                                        |
| `src/ui/components/signature/signature-storage.js`                                                            |    230 | adapter storage assinatura | Salva/resolve/limpa assinaturas por registro                                                                                                                              | Sim                                                                                                              | Alto: ponte com core storage                                                      |
| `src/core/signatureStorage.js`                                                                                |    301 | storage/sync               | Upload/fila offline de assinatura                                                                                                                                         | Sim                                                                                                              | Alto: Supabase/offline/fallback                                                   |
| `src/domain/registroStatus.js`                                                                                |     51 | dominio                    | Recalcula status de equipamentos apos edicao de registro                                                                                                                  | Sim                                                                                                              | Medio: acopla edicao a Equipamentos                                               |
| `src/domain/pdf/sections/services.js`                                                                         |    526 | PDF                        | Renderiza cards de servico com fotos                                                                                                                                      | Sim                                                                                                              | Alto: layout PDF, fotos e sanitizacao                                             |
| `src/domain/pdf/sections/signatures.js`                                                                       |    276 | PDF                        | Renderiza paginas de assinatura                                                                                                                                           | Sim                                                                                                              | Alto: assinatura ausente/corrompida e PDF                                         |
| `src/ui/components/postSaveRegistroToast.js`                                                                  |    197 | componente                 | Toast rico pos-save com PDF/WhatsApp                                                                                                                                      | Sim                                                                                                              | Medio: integra relatorio/share                                                    |
| `src/ui/components/postSaveRegistroCompletion.js`                                                             |    134 | componente                 | Conclusao pos-save                                                                                                                                                        | Sim                                                                                                              | Medio: fluxo pos-save                                                             |
| `src/ui/components/registroClienteForkSheet.js`                                                               |    106 | modal/sheet                | Escolha de destinatario/cliente para share                                                                                                                                | Sim                                                                                                              | Medio: contato e fallback                                                         |
| `src/ui/components/registroProximaPreventivaPrompt.js`                                                        |     93 | modal/sheet                | Pergunta proxima preventiva apos save                                                                                                                                     | Sim                                                                                                              | Medio: atualiza registro salvo                                                    |
| `src/ui/components/registroEquipPicker.js`                                                                    |    317 | componente legado          | Picker de equipamento e labels                                                                                                                                            | Sim                                                                                                              | Medio: seletor oculto `r-equip`                                                   |
| `src/ui/views/historico.js`                                                                                   |   1652 | view relacionada           | Listagem/historico, assinatura/fotos, delete registro, filtros                                                                                                            | Sim                                                                                                              | Alto: consome registros salvos e edicao                                           |
| `src/ui/views/relatorio.js`                                                                                   |    838 | view relacionada           | Relatorio/PDF/WhatsApp, filtros por registro/equip                                                                                                                        | Sim                                                                                                              | Alto: consumo de registroId e dados salvos                                        |
| Testes `src/__tests__/registro*.test.*`                                                                       | varios | testes                     | Contratos legados/React, save, assinatura, fotos, checklist, rotas                                                                                                        | Nao                                                                                                              | Alto valor para regressao                                                         |
| Testes `src/__tests__/relatorio*.test.*`, `pdfGenerator.registroId.test.js`, `reportModel.registroId.test.js` | varios | testes                     | Relatorio/PDF/WhatsApp com registro                                                                                                                                       | Nao                                                                                                              | Medio/alto: validar CPs de relatorio                                              |
| Testes `src/__tests__/photoStorage.test.js`, `signatureStorage.test.js`, `signatureFlush.test.js`             | varios | testes storage             | Fila/upload/fallback foto/assinatura                                                                                                                                      | Nao                                                                                                              | Alto para CPs de storage/media                                                    |

## 4. Fluxos principais

| Fluxo                     | Entrada/trigger                                                        | Arquivos envolvidos                                                                                  | Dependencias                                                                                                         | Side effects                                                                                                                        | Testes existentes                                                                                                                 | Risco                                              |
| ------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Abrir tela/formulario     | Router chama `initRegistro(params)`                                    | `registro.js`, `RegistroHeader.jsx`, header bridge, `registroContext.js`                             | `Utils`, `getState`, `withSkeleton`, `Profile`, `Photos`, router params                                              | Monta header React, aplica defaults, bind de campos, render fotos/assinatura/checklist/contexto                                     | `registroRouteLifecycle`, `registroLegacyHeaderRender`, `registroHeaderIsland`, `registroReactFieldHandlers`                      | Alto: muitos DOM ids e binds idempotentes          |
| Criar registro            | `data-action="save-registro"` ou `save-and-share-registro`             | `registroHandlers.js`, `registro.js`, `inputValidation`, `photoStorage`, assinatura, post-save toast | `getState`, `setState`, `findEquip`, `Profile`, `PlanCache`, `validateRegistroPayload`, `validateOperationalPayload` | Cria id, valida, upload/fallback fotos, assinatura opcional, atualiza state, equipamento, toast, relatorio/share, prompt preventiva | `registroPostSaveLegacyFlow`, `registroSaveSignatureHandlers`, `registroPdfWhatsappLegacyContracts`, `postSaveRegistroToast`      | Alto: fluxo central com storage/state/media/share  |
| Editar registro           | `loadRegistroForEdit(id)` e posterior `saveRegistro` com `EDITING_KEY` | `registro.js`, historico/handlers que chamam edit                                                    | `sessionStorage`, `setRouteGuard`, `setState`, `reconcileEquipmentStatusesAfterRegistroEdit`                         | Preenche form, altera CTA/hero, guarda rota, salva update e recalcula status de equipamentos                                        | `registroLegacyHeaderRender`, `clear-registro-edit-state`, `edit-preserves-photos`                                                | Alto: risco de perder fotos/checklist/status       |
| Salvar registro editado   | `saveRegistro` com `sessionStorage[EDITING_KEY]`                       | `registro.js`, `registroStatus.js`                                                                   | `setState`, `getCurrentChecklist`, `Profile`, `Toast`, `goTo`                                                        | Atualiza item existente, preserva checklist, recalcula equipamentos, limpa form, navega historico                                   | `registroPostSaveLegacyFlow`, regressions edit state/photos                                                                       | Alto                                               |
| Limpar/resetar formulario | `data-action="clear-registro"` -> `clearRegistro`                      | `registroHandlers.js`, `registro.js`, `Photos`, assinatura/checklist                                 | `Utils`, `Profile`, `Photos.clear`, `resetChecklist`, `mountRegistroSignature`                                       | Limpa campos, restaura defaults, limpa fotos/draft signature/checklist, reseta labels/hero                                          | `registroPostSaveLegacyFlow`, `clear-registro-edit-state`, `registroMateriaisToggle`                                              | Medio/alto: estado residual em session/local/draft |
| Quick templates           | `data-action="quick-service-template"`                                 | `registroHandlers.js`, `registro.js`, `RegistroHeader.jsx`                                           | `QUICK_TEMPLATE_MAP`, `Utils`, `Toast`, `Profile`                                                                    | Preenche tipo/obs/prioridade/data/status/tecnico, marca chip, foco/scroll                                                           | `registroChecklistHandlers`, `registroReactFieldHandlers`, legacy header/checklist                                                | Medio: nao sobrescrever texto manual               |
| Fotos/evidencias          | Inputs `input-fotos`, `input-fotos-camera`, preview/actions            | `registro.js`, `Photos`, `RegistroPhotos.jsx`, `registroPhotosModel`, `photoStorage`                 | `Photos.pending`, sanitizacao, Supabase/offline queue                                                                | Preview, upload, fallback local, `fotos_pendentes`, PDF data URL                                                                    | `registroLegacyPhotosRender`, `registroPhotosIsland`, `photoStorage`, regressions photo-failure                                   | Alto                                               |
| Assinatura                | Hint React actions e save com Plus+                                    | `registro.js`, `RegistroSignature.jsx`, signature components/storage, `core/signatureStorage`        | `PlanCache`, dynamic import, `SignatureModal`, `saveSignatureForRecord`, safe data URL                               | Captura/preview/remove, upload ou fila local, PDF signature pages                                                                   | `registroLegacySignatureRender`, `registroSignatureIsland`, `registroSaveSignatureHandlers`, `signatureStorage`, `signatureFlush` | Alto                                               |
| Gerar relatorio/PDF       | Post-save toast, save-and-share, tela relatorio                        | `registro.js`, `postSaveRegistroToast`, `reportExportHandlers`, `relatorio.js`, PDF sections         | `exportPdfFlow`, `shareWhatsAppFlow`, filtros `equipId/registroId`, quota                                            | Gera PDF/WhatsApp, navega fallback para relatorio                                                                                   | `registroPdfWhatsappLegacyContracts`, `pdfGenerator.registroId`, `reportModel.registroId`, relatorio tests                        | Alto                                               |
| Vinculo cliente           | Contexto e campos cliente                                              | `registroContext.js`, `registro.js`, `RegistroHeader.jsx`, cliente fork sheet                        | Clientes/setores/equipamentos state, localStorage ultimo cliente                                                     | Prefill, detalhes de contexto, share para outro destinatario                                                                        | `registroClientFork`, `registroContext`, header tests                                                                             | Medio/alto                                         |
| Vinculo equipamento       | `r-equip`, picker, params `equipId`                                    | `registro.js`, `registroEquipPicker`, `RegistroHeader.jsx`, Equipamentos state                       | `findEquip`, `getState`, preventivas/PMOC                                                                            | Preenche select, contexto, checklist template, status equipamento no save                                                           | `registroReactFieldHandlers`, header/checklist tests                                                                              | Alto: acoplamento com Equipamentos recem-extraido  |
| Vinculo tecnico           | Campo `r-tecnico`/Profile                                              | `registro.js`, `Profile`, datalist                                                                   | `Profile.getDefaultTecnico`, `saveLastTecnico`                                                                       | Prefill, perfil default, lista `tecnicos` no state                                                                                  | save/header tests                                                                                                                 | Medio                                              |
| PMOC/preventiva/checklist | Tipo/equipamento/checklist actions                                     | `registro.js`, checklist templates, `RegistroChecklist.jsx`                                          | `PlanCache`, `getChecklistTemplate`, `validateChecklist`, `summarizeChecklist`                                       | Render checklist, gates/upsell, warnings soft-required, salvar `checklist`                                                          | `registroChecklistHandlers`, `registroChecklistIsland`, `registroLegacyChecklistRender`, PMOC tests                               | Alto                                               |
| Historico/listagem        | `renderHist`, filtros, timeline, delete                                | `historico.js`, historico React islands, signature/photos                                            | `getState`, `Storage.markRegistroDeleted`, `Photos`, `SignatureViewerModal`                                          | Lista registros, abre fotos/assinatura, remove registro e recalcula equipamento                                                     | historico tests, `registroRouteLifecycle`                                                                                         | Medio/alto                                         |
| Validacoes obrigatorias   | Save e view model                                                      | `registro.js`, `registroViewModel.js`, `inputValidation.js`, equipment rules                         | `validateRegistroPayload`, `validateOperationalPayload`, `validateChecklist`                                         | Toast warnings/errors, bloqueios de save, progresso                                                                                 | `registroViewModel`, save flow tests                                                                                              | Alto                                               |
| Offline/storage/local     | Save fotos/assinatura e persistencia state                             | `core/storage.js`, `photoStorage.js`, `signatureStorage.js`, state                                   | Supabase, localStorage, queues                                                                                       | Queue deletions/uploads, signed URLs, fallback local                                                                                | storage/signature/photo tests                                                                                                     | Alto                                               |
| Toast/Modal/Router        | Handlers e save                                                        | `registroHandlers.js`, `registro.js`, modal/toast/router                                             | `Toast`, `CustomConfirm`, `goTo`, route guard                                                                        | Feedback, confirm, navegacao, guard de edicao                                                                                       | save/post-save/route tests                                                                                                        | Medio                                              |

## 5. Dependencias tecnicas

| Dependencia                                                           | Usada onde                                   | Funcao no fluxo                                            | Acoplamento | Risco                                     | Estrategia sugerida                                          |
| --------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------- | ----------- | ----------------------------------------- | ------------------------------------------------------------ |
| `core/state` (`getState`, `setState`, `findEquip`, `lastRegForEquip`) | `registro.js`, historico/relatorio           | Fonte de equipamentos/registros/clientes/setores e mutacao | Alto        | Regressao de persistencia/status          | Isolar leitura/mutacao em helpers antes de mover save        |
| `core/storage`/sync                                                   | historico delete, state persist indireto     | Persistencia e delecoes remotas                            | Medio       | Queue/delecao divergente                  | Mapear antes de mexer delete/historico                       |
| `core/utils`                                                          | `registro.js`, historico/relatorio           | DOM helpers, UID, datas, formatacao                        | Alto        | Side effects DOM espalhados               | Injetar em modulos extraidos; preservar IDs                  |
| `core/modal`/`CustomConfirm`                                          | handlers delete e modais relacionados        | Confirmacoes                                               | Medio       | Fluxo async/erro                          | Manter handlers finos ate contratos cobrirem                 |
| `core/toast`                                                          | save/reset/quick/media/errors                | Feedback usuario                                           | Medio       | Texto/ordem de feedback                   | Testar mensagens criticas em contratos                       |
| Router/navigation                                                     | `goTo`, route guard                          | Navegacao pos-save/edit/relatorio                          | Alto        | Guard preso ou navegacao errada           | Pre-split do lifecycle/guard                                 |
| Clientes                                                              | contexto, cliente fork, PMOC empresa         | Prefill e destinatario                                     | Medio/alto  | Cliente errado no share/PDF               | Criar testes de contexto antes de extrair                    |
| Equipamentos                                                          | `r-equip`, status, checklist, contexto       | Vinculo do servico e status operacional                    | Alto        | Regressao com Mudanca 11                  | Preferir DI; evitar import circular com feature equipamentos |
| Historico                                                             | edicao/delete/listagem                       | Consome registro salvo e permite editar/remover            | Medio/alto  | Estado de edicao/delecao                  | CP separado para historico se necessario                     |
| Relatorios/PDF                                                        | post-save e tela relatorio                   | PDF/WhatsApp por `registroId`                              | Alto        | PDF sem fotos/assinatura ou filtro errado | CP especifico para relatorio/PDF                             |
| Assinatura                                                            | hint/save/PDF/historico                      | Captura, storage, preview, PDF                             | Alto        | Data URL invalida/offline                 | CP separado para assinatura                                  |
| Fotos/evidencias                                                      | preview/save/PDF/historico                   | Upload/fallback/listagem                                   | Alto        | Perda de fotos/offline                    | CP separado para fotos                                       |
| PMOC/preventiva                                                       | checklist e relatorio PMOC                   | Checklist e proxima preventiva                             | Alto        | Compliance/regra de plano                 | CP separado ou manter no save ate tests                      |
| Supabase                                                              | photo/signature storage                      | Upload/signed URLs                                         | Alto        | Ambiente/offline                          | Nao misturar com UI; preservar fallback                      |
| DOM global                                                            | `document`, `sessionStorage`, `localStorage` | Roots, inputs, guard, ultimo cliente                       | Alto        | Regressao silenciosa                      | Contratos/selectors CP-B primeiro                            |
| React islands                                                         | header/checklist/photos/signature            | UI incremental                                             | Alto        | Generation guard/root errado              | Mover mounts um por vez                                      |
| CSS/classes criticas                                                  | React pages e legacy DOM                     | Layout e selectors                                         | Alto        | Regressao visual                          | Congelar classes em contratos                                |

## 6. DOM, selectors, classes e data-actions

| Selector/data-action/classe                                                                                                                                                                   | Usado em                            | Responsabilidade                       | Teste cobrindo                                     | Risco se alterar               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------- | -------------------------------------------------- | ------------------------------ |
| `#view-registro`                                                                                                                                                                              | `initRegistro`, React islands/tests | Root da tela                           | header/checklist/signature island, route lifecycle | Tela nao monta                 |
| `#registro-header-root`                                                                                                                                                                       | `registro.js` header bridge         | Root da ilha header                    | legacy/header island tests                         | Header some ou duplica         |
| `#registro-hero`, `#registro-hero-sub`, `#registro-hero-pill-text`, `#registro-hero-meter`, `#form-progress-count`                                                                            | header/progresso                    | Hero e progresso                       | header/viewModel tests                             | Progresso/edicao incorretos    |
| `#r-equip`, `#r-equip-trigger`, `#r-equip-name`, `#r-equip-meta`                                                                                                                              | form/picker/contexto/checklist      | Equipamento selecionado                | header/react field/checklist tests                 | Salvar no equipamento errado   |
| `#r-data`, `#registro-datetime-wrap`, `#r-data-now-btn`, `#r-data-edit-btn`, `#r-data-now-label`                                                                                              | form datetime                       | Data do servico                        | header/react field tests                           | Data default/picker quebrado   |
| `#r-tipo`, `#r-tipo-custom`, `#r-tipo-custom-wrap`                                                                                                                                            | tipo/outro/checklist                | Tipo de servico                        | field/checklist/save tests                         | Validacao e prefill quebrados  |
| `#r-obs`, `#r-tecnico`                                                                                                                                                                        | obrigatorios                        | Observacao/tecnico                     | header/save/viewModel tests                        | Save bloqueado ou payload ruim |
| `#r-status`, `#r-prioridade`, `#r-proxima`                                                                                                                                                    | impacto/preventiva                  | Status, prioridade, proxima preventiva | materiais/proxima/status tests                     | PMOC/status equipamento errado |
| `#r-pecas`, `#r-custo-pecas`, `#r-custo-mao-obra`, `#registro-materiais-details`                                                                                                              | materiais/custos                    | Materiais e custo                      | `registroMateriaisToggle`                          | Perda de dados financeiros     |
| `#registro-impact-details`, `#registro-impact-subtitle`, `#registro-impact-hint`                                                                                                              | impacto                             | UX status/prioridade                   | cobertura indireta                                 | Regressao visual/contextual    |
| `#registro-context-card`, `#registro-context-cliente`, `#registro-context-setor`, `#registro-context-equip`, `#registro-context-hint`                                                         | contexto                            | Cliente/setor/equipamento              | `registroContext`, header tests                    | Contexto errado                |
| `#registro-cliente-details`, `#registro-cliente-context-summary`                                                                                                                              | cliente                             | Dados opcionais do cliente             | client fork/header tests                           | Share/PDF sem cliente          |
| `#r-cliente-nome`, `#r-cliente-documento`, `#r-cliente-contato`, `#r-local-atendimento`                                                                                                       | cliente payload                     | Dados do cliente                       | client fork/save tests                             | Dados errados no relatorio     |
| `#photo-drop-zone`, `#photo-drop-text`, `#input-fotos`, `#input-fotos-camera`, `#photo-preview`                                                                                               | fotos                               | Inputs e preview                       | photo legacy/island tests                          | Upload/preview quebrado        |
| `#registro-signature-hint`                                                                                                                                                                    | assinatura                          | Root do hint/preview                   | signature legacy/island tests                      | Assinatura some                |
| `#r-checklist-details`, `#r-checklist-pri`, `#r-checklist-summary`, `#r-checklist-body`, `#r-checklist-upsell`                                                                                | checklist PMOC                      | Root/status/upsell                     | checklist tests                                    | Checklist nao salva            |
| `data-action="save-registro"`                                                                                                                                                                 | handlers/save                       | Salvar                                 | save/post-save tests                               | Fluxo central quebra           |
| `data-action="save-and-share-registro"`                                                                                                                                                       | handlers/save/share                 | Salvar e WhatsApp                      | pdf/whatsapp tests                                 | Share nao dispara              |
| `data-action="save-and-share-other-registro"`                                                                                                                                                 | handlers/client fork                | Outro destinatario                     | client fork/pdf tests                              | Cliente fork quebra            |
| `data-action="clear-registro"`                                                                                                                                                                | handlers/reset                      | Limpar                                 | post-save/reset tests                              | Estado sujo                    |
| `data-action="quick-service-template"` + `data-template`                                                                                                                                      | quick tiles                         | Prefill rapido                         | header/checklist/field tests                       | Template nao aplica            |
| `data-action="r-checklist-set"`, `r-checklist-obs`, `r-checklist-measure`                                                                                                                     | checklist                           | Status/obs/medidas                     | checklist tests                                    | PMOC incompleto                |
| `data-action="registro-signature-capture/open/remove"`                                                                                                                                        | assinatura                          | Capturar/abrir/remover                 | signature tests                                    | Assinatura nao opera           |
| `data-r-action="registro-photo-open/remove"`                                                                                                                                                  | fotos React                         | Abrir/remover foto                     | photos island/legacy tests                         | Preview/remocao quebra         |
| Classes `registro-hero*`, `registro-field*`, `registro-quick*`, `registro-details*`, `registro-actions`, `registro-context-card`, `registro-photo-quick`, `registro-sig-hint`, `r-checklist*` | React/CSS/tests                     | Aparencia e contratos                  | contratos em tests                                 | Regressao visual/selectors     |

## 7. Testes existentes e lacunas

| Teste                                                                                           | O que cobre                                       | O que nao cobre                | Importancia | Observacao                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------ | ----------- | ------------------------------- |
| `src/__tests__/registroViewModel.test.js`                                                       | Contratos IDs/actions, progresso, validacao, VM   | Side effects DOM/save          | Alta        | Base para CP-B/C                |
| `src/__tests__/registroLegacyHeaderRender.test.js`                                              | Header legado, campos, actions, edit load         | Storage/fotos/assinatura       | Alta        | Protege selectors principais    |
| `src/__tests__/registroHeaderIsland.test.jsx`                                                   | Ilha React header e campos                        | Save completo                  | Alta        | Protege HTML/classes do header  |
| `src/__tests__/registroReactFieldHandlers.test.js`                                              | Binds, quick template, tipo custom, XSS em campos | Upload/PDF                     | Alta        | Protege eventos DOM             |
| `src/__tests__/registroChecklistHandlers.test.js`                                               | Handlers e checklist PMOC                         | PDF final PMOC completo        | Alta        | CPs de checklist                |
| `src/__tests__/registroChecklistIsland.test.jsx`                                                | Render React do checklist                         | State completo de save         | Alta        | Protege selectors `r-checklist` |
| `src/__tests__/registroLegacyChecklistRender.test.js`                                           | Render/binds legado checklist                     | Storage                        | Alta        | Forte contra regressao PMOC     |
| `src/__tests__/registroLegacyPhotosRender.test.js`                                              | Render fotos e actions                            | Upload real                    | Alta        | Complementar a photoStorage     |
| `src/__tests__/registroPhotosIsland.test.jsx`                                                   | Ilha React fotos                                  | `Photos.pending` completo      | Alta        | Protege `input-fotos`/preview   |
| `src/__tests__/photoStorage.test.js`                                                            | Upload/fila/fallback fotos                        | UI Registro                    | Alta        | Rodar em CP de fotos/storage    |
| `src/__tests__/registroLegacySignatureRender.test.js`                                           | Hint/contratos assinatura                         | Upload real                    | Alta        | Protege root/actions            |
| `src/__tests__/registroSignatureIsland.test.jsx`                                                | Ilha React assinatura                             | Modal/storage completo         | Alta        | Protege classes/actions         |
| `src/__tests__/registroSaveSignatureHandlers.test.js`                                           | Save com assinatura/checklist/fotos               | Alguns cenarios de erro de PDF | Alta        | Essencial em CP-F/E             |
| `src/__tests__/signatureStorage.test.js`, `signatureFlush.test.js`, `signatureResolver.test.js` | Storage/fila/resolve assinatura                   | UI                             | Alta        | CP assinatura                   |
| `src/__tests__/registroPostSaveLegacyFlow.test.js`                                              | Save, reset, toast e fluxos pos-save              | Todos os erros Supabase        | Alta        | Teste amplo de regressao        |
| `src/__tests__/postSaveRegistroToast.test.js`                                                   | Toast rico e CTAs                                 | Router completo                | Media       | CP post-save/relatorio          |
| `src/__tests__/registroPdfWhatsappLegacyContracts.test.js`                                      | PDF/WhatsApp pos-save e contratos                 | Layout PDF visual              | Alta        | CP-G                            |
| `src/__tests__/pdfGenerator.registroId.test.js`, `reportModel.registroId.test.js`               | Filtro por registroId                             | UI completa                    | Alta        | CP relatorio                    |
| `src/__tests__/registroClientFork.test.js`                                                      | Cliente fork/share outro destinatario             | Todos contextos cliente/setor  | Media/alta  | CP cliente/contexto             |
| `src/__tests__/registroContext.test.js`                                                         | Resolve contexto                                  | DOM                            | Media/alta  | Extracao segura de contexto     |
| `src/__tests__/registroProximaPreventivaPrompt.test.js`                                         | Prompt proxima preventiva                         | PMOC relatorio                 | Media       | CP PMOC                         |
| `src/__tests__/registroMateriaisToggle.test.js`                                                 | Details materiais/impacto                         | PDF/custos final               | Media       | CP modal/form helpers           |
| `src/__tests__/registroRouteLifecycle.test.js`                                                  | Lifecycle/route guard                             | Save media                     | Alta        | CP reset/lifecycle              |
| `src/__tests__/regressions/clear-registro-edit-state.test.js`                                   | Estado edit limpo                                 | Outros flows                   | Alta        | Mantem bugfix historico         |
| `src/__tests__/regressions/edit-preserves-photos.test.js`                                       | Edicao preserva fotos                             | Assinatura/checklist           | Alta        | CP save/edit                    |
| `src/__tests__/regressions/photo-failure-path.test.js`                                          | Caminho de falha de foto                          | Assinatura                     | Alta        | CP fotos                        |
| Historico tests                                                                                 | Timeline/filtros/cards de registros               | Save Registro                  | Media       | Rodar em CP que toque historico |
| Relatorio tests                                                                                 | Cards/controls/hero/export/PMOC                   | UI Registro save               | Media/alta  | Rodar em CP-G                   |

Lacunas criticas:

- CP-B cobre um teste de contrato dedicado para `REGISTRO_PUBLIC_IDS`, `REGISTRO_ACTIONS`, `REGISTRO_PUBLIC_CLASSES`, `REGISTRO_REACT_ROOTS`, atributos delegados e DOM real das ilhas React/legado.
- CP-C separou localmente leitura de formulario, normalizacao de tipo, payload e validacoes de `saveRegistro`; side effects de storage/media/post-save ainda permanecem no orquestrador legado.
- Fluxos offline de fotos/assinatura sao bem cobertos em storage, mas menos conectados ao DOM completo de Registro.
- Relatorio/PDF tem cobertura funcional, mas nao visual; qualquer mudanca de payload deve preservar filtros e `registroId`.
- Acoplamento com Equipamentos via `findEquip`, status e `r-equip` exige smoke tests da Mudanca 11 em CPs que toquem save/contexto.

## 8. Riscos principais

- Storage/state: `saveRegistro` muta `registros`, `equipamentos`, `tecnicos` e depende de persistencia indireta de `setState`.
- Vinculo cliente/equipamento: contexto vem de clientes/setores/equipamentos, e `r-equip` alimenta checklist, status, PDF e WhatsApp.
- Fotos/evidencias: `Photos.pending`, sanitizacao, upload Supabase, fila offline e PDF usam formatos diferentes.
- Assinatura: gating Plus, modal dinamico, data URL segura, fila offline e PDF/historico compartilham o mesmo dado.
- Relatorio/PDF: post-save chama PDF/WhatsApp diretamente e usa fallback para a tela relatorio com `registroId`.
- PMOC/preventiva: checklist tem gate de plano, warning soft-required e impacto em relatorios PMOC.
- DOM global: muitos `document.getElementById`, `querySelector`, `sessionStorage` e `localStorage`.
- CSS/selectors: classes de React pages sao tambem contratos visuais/testes; nao alterar em refatoracao.
- Regressao silenciosa: varios helpers falham silenciosamente quando roots/modulos nao existem.
- Import circular: Registro importa Equipamentos via core/state; futuras extracoes para `src/features/registro` devem evitar depender de views legadas.
- Acoplamento com Equipamentos recem-refatorado: status operacional e `findEquip` podem criar ciclos se Registro importar feature de Equipamentos diretamente.
- Divergencia de nomes: dominio mistura Registro, servico, historico, relatorio, PMOC, fotos/evidencias e assinatura; nomear CPs por fluxo, nao por termo solto.

## 9. Sequencia recomendada da Mudanca 12

| Ordem | CP                                              | Objetivo                                                                                          | Escopo permitido                                                                       | Risco       | Criterio de aprovacao                                          |
| ----: | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
|     1 | CP-B - contratos/selectors de Registro          | Consolidar e testar IDs, `data-action`, classes e roots publicos antes de mover codigo            | Docs/testes de contrato; sem producao salvo ajuste de contrato existente se inevitavel | Baixo/medio | Teste de contrato passa e vira suite obrigatoria da Mudanca 12 |
|     2 | CP-C - pre-split in-place de payload/validacao  | Separar leitura de formulario, normalizacao de tipo, payload e validacoes dentro de `registro.js` | Apenas `registro.js` e testes focados                                                  | Medio       | `saveRegistro` preserva comportamento com helpers locais       |
|     3 | CP-D - mover helpers puros de payload/validacao | Extrair helpers puros para modulo feature-scoped sem side effects                                 | Novo modulo/testes; DI/import seguro                                                   | Medio       | Sem mudanca no save; contratos e save tests passam             |
|     4 | CP-E - fotos/evidencias                         | Pre-split e depois mover orquestracao de fotos do save/render, sem alterar `Photos`/storage       | Um bloco por CP se necessario                                                          | Alto        | Fila/upload/fallback e previews preservados                    |
|     5 | CP-F - assinatura                               | Pre-split e mover orquestracao de assinatura/hint/modal/storage                                   | Um bloco por CP se necessario                                                          | Alto        | Gating Plus, modal, fallback e PDF preservados                 |
|     6 | CP-G - salvar registro como orquestrador        | Pre-split e mover `saveRegistro` mantendo ordem state/storage/toast/router                        | `saveRegistro` e helpers exclusivos                                                    | Alto        | Save/create/edit/post-save passam com suites amplas            |
|     7 | CP-H - relatorio/PDF e post-save                | Mapear/extrair ponte post-save PDF/WhatsApp e contratos `registroId`                              | Relatorio/post-save apenas                                                             | Alto        | PDF/WhatsApp/relatorio tests passam                            |
|     8 | CP-I - stability checkpoint de Registro         | Validar suite ampla, LOC, arquitetura e riscos remanescentes                                      | Docs/validacao                                                                         | Baixo       | Decisao clara para encerrar Mudanca 12 ou CP adicional         |

## 10. CP-B - Contratos/selectors de Registro

Status: aplicado em 2026-05-08.

- Contratos/selectors congelados em `src/ui/viewModels/registroContracts.js`.
- Teste dedicado criado em `src/__tests__/contracts/registroSelectors.test.js`.
- IDs cobertos: `view-registro`, `registro-header-root`, `r-equip`, `r-data`, `r-tipo`, `r-tipo-custom`, `r-obs`, `r-tecnico`, `photo-preview`, `input-fotos`, `registro-signature-hint`, `r-checklist-body`.
- Actions cobertas: `save-registro`, `save-and-share-registro`, `save-and-share-other-registro`, `clear-registro`, `quick-service-template`, `r-checklist-set`, `registro-signature-capture`, `registro-signature-open`, `registro-signature-remove`.
- Classes/atributos cobertos: `registro-hero`, `registro-quick`, `registro-field`, `registro-actions`, `registro-context-card`, `registro-photo-quick`, `registro-sig-hint`, `r-checklist__*`, `data-action`, `data-r-action`, `data-template`, `data-color`, `data-item-id`, `data-status`, `data-unit`, `data-state`.
- Roots React cobertos: header, checklist, fotos e assinatura.
- Lacuna registrada: `data-mode`, `data-value` e `data-field` nao apareceram como contratos reais de Registro no mapeamento estatico deste CP.

## 11. CP-C - Pre-split payload e validacao de saveRegistro

Status: aplicado em 2026-05-08.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Helpers locais criados: `getRegistroFormElements`, `readRegistroFormValues`, `normalizeRegistroServiceType`, `buildRegistroPayloadDraft`, `buildRegistroSaveContext`, `validateRegistroPayloadDraft`, `validateRegistroOperationalFields`, `buildRegistroPersistPayload`, `warnRegistroChecklistPayloadGaps`.
- Responsabilidades separadas: leitura de DOM, tipo `Outro`, draft de payload, validacao de payload, validacao operacional, payload persistivel e warning PMOC/checklist.
- Nenhuma mudanca funcional intencional; post-save, fotos/evidencias, assinatura, storage/state, PDF/WhatsApp, handlers e contratos CP-B preservados.
- LOC `src/ui/views/registro.js`: 1997 -> 2109.
- Testes rodados: contratos CP-B; testes focados de save/payload/post-save/PDF/checklist; `npm run format`; `npm run check`.

## 12. CP-D - Mover helpers puros de payload/validacao

Status: aplicado em 2026-05-08.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Modulo criado: `src/features/registro/save/payload.js`.
- Teste criado: `src/features/registro/__tests__/save/payload.test.js`.
- Helpers puros movidos: `buildRegistroPayloadDraft`, `buildRegistroPersistPayload`.
- Regras puras extraidas/movidas: `normalizeRegistroServiceTypeValue`, `validateRegistroPayloadDraftData`, `validateRegistroOperationalFieldsData`.
- Helpers mantidos no adapter: `getRegistroFormElements` e `readRegistroFormValues` por DOM/`Utils`; `normalizeRegistroServiceType`, `validateRegistroPayloadDraft` e `validateRegistroOperationalFields` por Toast/focus; `buildRegistroSaveContext` por `getState`; `warnRegistroChecklistPayloadGaps` por checklist/Toast.
- Nenhuma mudanca funcional intencional; leitura de DOM, Toast/focus, fotos/evidencias, assinatura, checklist/PMOC, storage/state, PDF/WhatsApp, handlers, React pages e contratos CP-B preservados.
- LOC `src/ui/views/registro.js`: 1883 -> 1837.
- Testes rodados: payload feature + contratos CP-B; suite `src/__tests__`; `npm run format`; `npm run check`.

## 13. CP-E - Pre-split fotos/evidencias em saveRegistro

Status: aplicado em 2026-05-08.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Fotos/evidencias permaneceram no adapter legado; nenhum modulo feature novo foi criado.
- Helpers locais criados: `normalizeRegistroPhotoItems`, `getRegistroPhotoState`, `persistRegistroPhotosForSave`, `buildRegistroPhotoPayload`.
- Ordem preservada: origem `Photos.pending` antes da assinatura; upload/fallback depois da assinatura; payload de `fotos`/`fotos_pendentes` antes de `setState`; limpeza via `clearRegistro`.
- Nenhuma mudanca funcional intencional; `photoStorage`, fila offline, sanitizacao, preview, React pages, handlers, assinatura, relatorio/PDF, checklist/PMOC, contratos CP-B e payload CP-D preservados.
- Reconciliação de LOC: CP-C registrou `1997 -> 2109`; CP-D registrou `1883 -> 1837`; LOC real antes do CP-E confirmado por pre-check: `1837`.
- LOC `src/ui/views/registro.js`: 1837 -> 1857.
- Testes rodados: contratos CP-B + payload CP-D; suite `src/__tests__`; `npm run format`; `npm run check`.

## 14. CP-F - Mover helpers de fotos/evidencias

Status: aplicado em 2026-05-08.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Modulo criado: `src/features/registro/save/photos.js`.
- Teste criado: `src/features/registro/__tests__/save/photos.test.js`.
- Helpers movidos: `normalizeRegistroPhotoItems`, `getRegistroPhotoState`, `persistRegistroPhotosForSave`, `buildRegistroPhotoPayload`.
- DI explicita usada para `Photos`, `isSafeRegistroPhotoSrc`, `uploadPendingPhotos`, `Toast`, `handleError` e `ErrorCodes`.
- Nenhum helper de fotos/evidencias permaneceu no adapter; o fluxo segue orquestrado por `saveRegistro`.
- Ordem preservada: captura de `Photos.pending`; assinatura na mesma posicao relativa; upload/fallback; coleta de `fotos_pendentes`; payload `fotos`/`fotos_pendentes`; limpeza via `clearRegistro`.
- Nenhuma mudanca funcional intencional; `photoStorage`, fila offline, fallback, sanitizacao, preview, React pages, handlers, assinatura, relatorio/PDF, checklist/PMOC, contratos CP-B e payload CP-D preservados.
- LOC `src/ui/views/registro.js`: 1857 -> 1828.
- Testes rodados: photos feature + payload feature + contratos CP-B; suite `src/__tests__`; `npm run format`; `npm run check`.

## 15. CP-G - Mapear fluxo de assinatura

Status: aplicado em 2026-05-08.

- Documento criado: `docs/migration/mudanca-12-cp-g-signature-map.md`.
- Nenhum arquivo em `src/` foi alterado; nenhum teste foi alterado.
- Fluxo de assinatura mapeado: hint React, handlers legacy, `SignatureModal`, gating Plus+, data URL segura, upload/cache/fila offline, payload `assinatura`, reset, PDF/relatorio/historico.
- Contratos mapeados: `#registro-signature-hint`, `data-action="registro-signature-capture"`, `data-action="registro-signature-open"`, `data-action="registro-signature-remove"`, `signature-upsell-cta`, `data-r-action`, classes `registro-sig-*`, cache `cooltrack-sig-*`, queue `cooltrack-sig-pending-upload`, modal capture/viewer.
- Riscos registrados: comentario de `SignatureModal.CANCELED` diverge do comportamento real do `saveRegistro`, validadores de data URL duplicados, payload boolean/reference, queue offline, PDF/historico e import circular.
- Validacoes rodadas: contratos CP-B + payload CP-D + photos CP-F; `npm run check`.

## 16. CP-H - Pre-split assinatura in-place

Status: aplicado em 2026-05-08.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Assinatura permaneceu no adapter legado; nenhum modulo feature novo foi criado.
- Helpers locais criados: `getRegistroSignatureState`, `loadRegistroSignatureSaveModule`, `captureRegistroSignatureIfNeeded`, `persistRegistroSignatureForSave`, `buildRegistroSignaturePayload`, `clearRegistroSignatureAfterSave`.
- Responsabilidades separadas: gate Plus+, import dinamico, captura via `SignatureModal`, validacao data URL, upload/fallback via `saveSignatureForRecord`, payload `assinatura` e limpeza do draft.
- Comportamento real de `SignatureModal.CANCELED` preservado: save continua sem assinatura e mostra Toast informativo.
- Ordem preservada: captura de `Photos.pending`; fluxo de assinatura; upload/fallback de fotos CP-F; payload `assinatura`; limpeza via `clearRegistro`.
- Nenhuma mudanca funcional intencional; `SignatureModal`, `SignatureViewerModal`, `signatureStorage`, fila offline, React pages, handlers, fotos CP-F, payload CP-D, relatorio/PDF, historico e contratos CP-B preservados.
- LOC `src/ui/views/registro.js`: 1828 -> 1861.
- Testes rodados: contratos CP-B + payload CP-D + photos CP-F; testes focados de assinatura/save/storage/PDF/historico; `npm run format`; `npm run check`.

## 17. CP-I - Mover helpers de assinatura

Status: aplicado em 2026-05-09.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Modulo criado: `src/features/registro/save/signature.js`.
- Teste criado: `src/features/registro/__tests__/save/signature.test.js`.
- Helpers movidos: `getRegistroSignatureState`, `loadRegistroSignatureSaveModule`, `captureRegistroSignatureIfNeeded`, `persistRegistroSignatureForSave`, `buildRegistroSignaturePayload`, `clearRegistroSignatureAfterSave`.
- DI explicita usada para gate de plano, loader dinamico, `SignatureModal`, `saveSignatureForRecord`, `Toast`, `handleError`, `ErrorCodes`, validador de data URL, limpeza de draft e remount do hint.
- Nenhum helper de assinatura permaneceu no adapter; o fluxo segue orquestrado por `saveRegistro` e pelos handlers legados.
- Comportamento real de `SignatureModal.CANCELED` preservado: save continua sem assinatura e mostra Toast informativo.
- Ordem preservada: hint/init e handlers intactos; save create apos `photoState`; import dinamico; captura `SignatureModal`; persistencia `saveSignatureForRecord`; fotos CP-F depois da assinatura; payload `assinatura`; limpeza via `clearRegistro`.
- Nenhuma mudanca funcional intencional; `SignatureModal`, `SignatureViewerModal`, `signatureStorage`, fila offline, React pages, handlers, fotos CP-F, payload CP-D, relatorio/PDF, historico e contratos CP-B preservados.
- LOC `src/ui/views/registro.js`: 1861 -> 1814.
- Testes rodados: signature feature + photos feature + payload feature + contratos CP-B; testes focados de assinatura/save/storage/PDF/historico; `npm run format`; `npm run check`.

## 18. CP-J - Pre-split persistencia/state de saveRegistro

Status: aplicado em 2026-05-09.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Persistencia/state permaneceu no adapter legado; nenhum modulo feature novo foi criado.
- Helpers locais criados: `persistRegistroTechnicianProfile`, `getRegistroEditingId`, `buildEditedRegistro`, `buildRegistroEditStateMutation`, `applyRegistroEditStateMutation`, `saveRegistroLastClient`, `runRegistroEditPostSaveEffects`, `resolveRegistroCreateId`, `buildRegistroCreateRecord`, `buildRegistroCreateStateMutation`, `applyRegistroCreateStateMutation`, `runRegistroCreatePostSaveEffects`.
- Responsabilidades separadas: persistencia do tecnico/perfil, leitura do modo edicao, mutacao de registros/equipamentos em edicao, geracao de id de criacao, record final de criacao, mutacao de `tecnicos`/`registros`/`equipamentos` e efeitos pos-save/share.
- Nenhuma mudanca funcional intencional; contratos CP-B, payload CP-D, fotos CP-F, assinatura CP-I, storage/fila offline, React pages, handlers, relatorio/PDF, historico e Equipamentos preservados.
- Ordem preservada: leitura/validacao/payload; profile side effect; edit branch; create id; `photoState`; assinatura CP-I; fotos CP-F; status operacional; `setState`; highlight/cliente/clear; share ou toast pos-save; prompt de preventiva.
- LOC `src/ui/views/registro.js`: 1814 -> 1890.
- Testes rodados: contratos CP-B + payload CP-D + photos CP-F + signature CP-I; testes focados de Registro/save/create/edit/state/storage/PDF/historico; `npm run format`; `npm run check`.

## 19. CP-K - Mover helpers seguros de persistencia/state

Status: aplicado em 2026-05-09.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Modulo criado: `src/features/registro/save/persistence.js`.
- Teste criado: `src/features/registro/__tests__/save/persistence.test.js`.
- Helpers movidos: `buildEditedRegistro`, `buildRegistroEditStateMutation`, `resolveRegistroCreateId`, `buildRegistroCreateRecord`, `buildRegistroCreateStateMutation`.
- DI explicita usada para `getCurrentChecklist`, `reconcileEquipmentStatusesAfterRegistroEdit`, `uid`, `assinaturaPayload` e `checklist`.
- Helpers mantidos no adapter por side effects fortes: `persistRegistroTechnicianProfile`, `getRegistroEditingId`, `applyRegistroEditStateMutation`, `saveRegistroLastClient`, `runRegistroEditPostSaveEffects`, `applyRegistroCreateStateMutation`, `runRegistroCreatePostSaveEffects`.
- Ordem preservada: guard/client fork; payload validado; tecnico/profile; modo edit; mutacao edit; pos-save edit; modo create; fotos CP-F; assinatura CP-I; mutacao create; pos-save create.
- Nenhuma mudanca funcional intencional; contratos CP-B, payload CP-D, fotos CP-F, assinatura CP-I, storage/fila offline, React pages, handlers, relatorio/PDF, historico e Equipamentos preservados.
- LOC `src/ui/views/registro.js`: 1890 -> 1773.
- Testes rodados: persistence feature + signature feature + photos feature + payload feature + contratos CP-B; testes focados de Registro/save/create/edit/state/storage/PDF/historico; `npm run format`; `npm run check`.

## 20. CP-L - Pre-split post-save/share

Status: aplicado em 2026-05-09.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Post-save/share permaneceu no adapter legado; nenhum modulo feature novo foi criado.
- Helpers locais criados: `persistRegistroLastClientAfterSave`, `applyRegistroSavedHighlight`, `resetRegistroEditAfterSave`, `resetRegistroCreateAfterSave`, `notifyRegistroEditSaved`, `runRegistroEditNavigationAfterSave`, `runRegistroPreventivaPromptAfterSave`, `runRegistroDirectShareAfterSave`, `notifyRegistroCreateSaved`.
- Responsabilidades separadas: cliente recente, highlight, reset edit/create, Toast de edicao, navegacao de edicao, prompt preventiva, share direto WhatsApp e toast rico pos-save com CTAs PDF/WhatsApp.
- Ordem preservada: post-save edit (`lastClient -> resetEditingState -> clearRegistro -> Toast -> historico`); post-save create (`highlight -> lastClient -> clearRegistro -> andShare direto` ou `prompt -> PostSaveRegistroToast/fallback`).
- Nenhuma mudanca funcional intencional; contratos CP-B, payload CP-D, fotos CP-F, assinatura CP-I, persistence CP-K, storage/fila offline, React pages, handlers, relatorio/PDF, historico e Equipamentos preservados.
- LOC `src/ui/views/registro.js`: 1773 -> 1800.
- Testes rodados: persistence feature + signature feature + photos feature + payload feature + contratos CP-B; testes focados de Registro/save/post-save/share/PDF/historico; `npm run format`; `npm run check`.

## 21. CP-M - Mover helpers seguros de post-save/share

Status: aplicado em 2026-05-09.

- `saveRegistro` permaneceu em `src/ui/views/registro.js`.
- Modulo criado: `src/features/registro/save/postSave.js`.
- Teste criado: `src/features/registro/__tests__/save/postSave.test.js`.
- Helpers movidos: `persistRegistroLastClientAfterSave`, `applyRegistroSavedHighlight`, `resetRegistroEditAfterSave`, `resetRegistroCreateAfterSave`, `notifyRegistroEditSaved`, `runRegistroEditNavigationAfterSave`, `runRegistroPreventivaPromptAfterSave`, `runRegistroDirectShareAfterSave`, `notifyRegistroCreateSaved`.
- DI explicita usada para `saveRegistroLastClient`, `SavedHighlight`, `resetEditingState`, `clearRegistro`, `Toast`, `goTo`, `shareWhatsAppFlow`, `PostSaveRegistroToast`, `exportPdfFlow` e `_showProximaPreventivaPrompt`.
- Nenhum helper amplo de post-save/share foi movido como fluxo completo; `runRegistroEditPostSaveEffects` e `runRegistroCreatePostSaveEffects` permaneceram no adapter como orquestradores.
- Ordem preservada: post-save edit (`lastClient -> resetEditingState -> clearRegistro -> Toast -> historico`); post-save create (`highlight -> lastClient -> clearRegistro -> andShare direto` ou `prompt -> PostSaveRegistroToast/fallback`).
- Nenhuma mudanca funcional intencional; contratos CP-B, payload CP-D, fotos CP-F, assinatura CP-I, persistence CP-K, storage/fila offline, React pages, handlers, relatorio/PDF, historico e Equipamentos preservados.
- LOC `src/ui/views/registro.js`: 2040 -> 1983.
- Testes rodados: postSave feature + persistence feature + signature feature + photos feature + payload feature + contratos CP-B; testes focados de Registro/save/post-save/share/PDF/historico; `npm run format`; `npm run check`.

## 22. CP-N - Mapear relatório/PDF/WhatsApp

Status: aplicado em 2026-05-09.

- Documento criado: `docs/migration/mudanca-12-cp-n-report-pdf-map.md`.
- Nenhum arquivo em `src/` foi alterado; nenhum teste foi alterado.
- Fluxo relatório/PDF/WhatsApp mapeado de ponta a ponta: `save-and-share-registro`, `save-and-share-other-registro`, `andShare`, `postSave` CP-M, `exportPdfFlow`, `shareWhatsAppFlow`, `CardActions`, view relatório, histórico, `PDFGenerator`, `filterRegistrosForReport`, fotos, assinatura e quota.
- Contratos mapeados: `data-action="save-and-share-registro"`, `data-action="save-and-share-other-registro"`, `data-action="export-pdf"`, `data-action="whatsapp-export"`, `data-registro-id`, rota `goTo('relatorio', { equipId, intent, registroId })`, `filters.registroId`, campos de cliente, fotos e assinatura usados pelo PDF.
- Riscos mapeados: filtro por `registroId`, acoplamento `domain/pdf.js` -> `ui/components/signature.js`, quota/gating PDF vs WhatsApp, Web Share/upload/fallback, fotos, assinatura, histórico, Toast/Router e regressão silenciosa.
- Reconciliação de LOC: CP-L registrou `1773 -> 1800`; CP-M registrou `2040 -> 1983`; LOC real medido no CP-N para `src/ui/views/registro.js`: 1983.
- Validações rodadas: postSave feature + persistence feature + signature feature + photos feature + payload feature + contratos CP-B; `npm run check`.

## 23. CP-O - Contrato registroId em PDF/WhatsApp

Status: aplicado em 2026-05-09.

- Teste criado: `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`.
- Contrato protegido: `registroId` preservado do Registro para PDF/WhatsApp nos caminhos de save-and-share direto, CTAs do toast pos-save, fallback para `goTo('relatorio', ...)`, `buildReportFilters` e `filterRegistrosForReport`.
- Actions/DOM congelados por contrato: `save-and-share-registro`, `save-and-share-other-registro`, `export-pdf`, `whatsapp-export` e `data-registro-id`.
- Nenhuma mudanca funcional intencional; nenhum arquivo de producao em `src/` foi alterado.
- Lacunas remanescentes: quota/gating PDF vs WhatsApp por plano continua coberta por testes relacionados, mas ainda nao tem um contrato unico dedicado por matriz de planos.
- Validacoes rodadas: contrato `registroId`; postSave feature + persistence feature + signature feature + photos feature + payload feature + contratos CP-B; testes relacionados de Registro/relatorio/PDF/WhatsApp/historico; `npm run format`; `npm run check`.

## 24. CP-P - Pre-split relatorio/PDF/WhatsApp em Registro

Status: aplicado em 2026-05-09.

- `saveRegistro` permaneceu inalterado em `src/ui/views/registro.js`.
- Pre-split realizado dentro de `src/features/registro/save/postSave.js`; nenhum fluxo foi movido para novo modulo.
- Helpers locais criados: `buildRegistroReportFilters`, `buildRegistroReportRoute`, `notifyRegistroShareStarted`, `runRegistroWhatsappShare`, `runRegistroReportFallback`, `runRegistroPdfAction`, `runRegistroWhatsappAction`, `buildRegistroPostSaveToastActions`.
- Responsabilidades separadas: filtros `registroId`/`equipId`, rota fallback para relatorio, Toast inicial de share, chamada `shareWhatsAppFlow`, fallback `goTo('relatorio', ...)`, callback PDF, callback WhatsApp e acoes do `PostSaveRegistroToast`.
- Contrato CP-O preservado: `registroId` segue nos filtros de PDF/WhatsApp, no fallback de relatorio e nos CTAs do toast pos-save.
- Nenhuma mudanca funcional intencional; `reportExportHandlers.js`, `relatorio.js`, `historico.js`, `domain/pdf.js`, React pages, handlers, payload CP-D, fotos CP-F, assinatura CP-I, persistence CP-K e contratos CP-B preservados.
- LOC `src/features/registro/save/postSave.js`: 79 -> 121.
- LOC `src/ui/views/registro.js`: 1752 -> 1752.
- Testes rodados: contrato `registroId` + postSave feature; persistence feature + signature feature + photos feature + payload feature + contratos CP-B; testes relacionados de Registro/relatorio/PDF/WhatsApp/historico; `npm run format`; `npm run check`.

## 25. CP-Q - Mover helpers seguros de relatorio/PDF/WhatsApp

Status: aplicado em 2026-05-09.

- `postSave.js` permaneceu como orquestrador do post-save/share.
- Modulo criado: `src/features/registro/save/reportShare.js`.
- Teste criado: `src/features/registro/__tests__/save/reportShare.test.js`.
- Helpers movidos: `buildRegistroReportFilters`, `buildRegistroReportRoute`, `notifyRegistroShareStarted`, `runRegistroWhatsappShare`, `runRegistroReportFallback`, `runRegistroPdfAction`, `runRegistroWhatsappAction`, `buildRegistroPostSaveToastActions`.
- DI explicita usada para `Toast`, `shareWhatsAppFlow`, `goTo` e `exportPdfFlow`.
- Exports/orquestradores mantidos em `postSave.js`: `runRegistroDirectShareAfterSave` e `notifyRegistroCreateSaved`, para preservar a ordem do fluxo post-save e evitar concentrar orquestracao ampla no modulo de helpers.
- Contrato CP-O preservado: `registroId` segue nos filtros de PDF/WhatsApp, no fallback para relatorio e nos CTAs do `PostSaveRegistroToast`.
- Nenhuma mudanca funcional intencional; `saveRegistro`, `reportExportHandlers.js`, `relatorio.js`, `historico.js`, `domain/pdf.js`, React pages, handlers, payload CP-D, fotos CP-F, assinatura CP-I, persistence CP-K e contratos CP-B preservados.
- LOC `src/features/registro/save/postSave.js`: 121 -> 78.
- LOC `src/features/registro/save/reportShare.js`: criado com 55 linhas.
- LOC `src/ui/views/registro.js`: 1752 -> 1752.
- Testes rodados: reportShare feature + postSave feature + contrato `registroId`; persistence feature + signature feature + photos feature + payload feature + contratos CP-B; testes relacionados de Registro/relatorio/PDF/WhatsApp/historico; `npm run format`; `npm run check`.

## 26. CP-R - Stability checkpoint intermediario de Registro

Status: aplicado em 2026-05-09.

- Documento criado: `docs/migration/mudanca-12-stability-checkpoint-intermediario.md`.
- Nenhum arquivo em `src/` foi alterado; nenhum teste foi alterado.
- Estado consolidado: contratos CP-B, contrato CP-O, payload CP-D, fotos CP-F, assinatura CP-I, persistence CP-K, postSave CP-M e reportShare CP-Q permanecem presentes e cobertos por testes proprios.
- Arquitetura validada: `src/features/registro` nao importa o adapter principal `src/ui/views/registro.js`; `saveRegistro` continua no adapter legado; modulos save seguem com DI e sem imports diretos de DOM/React pages/handlers.
- LOC atual `src/ui/views/registro.js`: 1752.
- Validacoes rodadas: bateria feature/contratos; suite ampla `npm run test -- src/__tests__ --reporter=dot`; `npm run format`; `npm run check`.
- `npm run size` foi tentado, mas falhou por ambiente porque `size-limit` nao esta disponivel no PATH local; nenhuma dependencia foi instalada.
- Warnings remanescentes registrados: 32 warnings de lint baseline, warnings Vite de dynamic import/chunk e stderr de testes JSDOM/Supabase/React `act(...)` ja observados na suite.
- Riscos remanescentes: `saveRegistro` ainda orquestra o fluxo central; wrappers DOM/form, Toast/focus, setState, Profile/sessionStorage, checklist/PMOC, relatorio/PDF domain, historico e bridges das ilhas React ainda exigem cortes cuidadosos.

## 27. CP-S - Mapear wrappers restantes do saveRegistro

Status: aplicado em 2026-05-09.

- Documento criado: `docs/migration/mudanca-12-cp-s-save-wrappers-map.md`.
- Nenhum arquivo em `src/` foi alterado; nenhum teste foi alterado.
- Wrappers restantes do `saveRegistro` mapeados e classificados: DOM/form, validacao/Toast/focus, Profile/sessionStorage, `setState`, post-save orquestrador e checklist/PMOC.
- APIs publicas restantes do adapter mapeadas: `initRegistro`, `saveRegistro`, `clearRegistro`, `loadRegistroForEdit`, quick templates, handlers de assinatura/hint, handlers de checklist e unmounts das ilhas React.
- Checklist/PMOC classificado como maior candidato residual: estado `_currentChecklist`, coleta para payload, warning soft-required, gating de plano, React island, templates, relacao com save e consumo por PDF/relatorio.
- Arquitetura confirmada: `src/features/registro` nao importa o adapter principal; contratos CP-B e CP-O permanecem presentes; modulos feature save seguem com testes proprios; `saveRegistro` permanece no adapter.
- LOC atual `src/ui/views/registro.js`: 1752.
- Validacoes previstas para este CP: diff restrito aos docs; bateria feature/contratos; `npm run format`; `npm run check`.

## 28. CP-T - Mapear Checklist/PMOC de Registro

Status: aplicado em 2026-05-09.

- Documento criado: `docs/migration/mudanca-12-cp-t-checklist-pmoc-map.md`.
- Nenhum arquivo em `src/` foi alterado; nenhum teste foi alterado.
- Checklist/PMOC mapeado: estado `_currentChecklist`, gate Pro, templates NBR 13971, ilha React, handlers delegados, snapshot para save, warning soft-required, create/edit, reset, edit load, PDF/relatorio, historico e prompt de proxima preventiva.
- Contratos mapeados: `#r-checklist-body`, `#r-checklist-details`, `#r-checklist-summary`, `#r-checklist-upsell`, `data-action="r-checklist-set"`, `data-action="r-checklist-obs"`, `data-action="r-checklist-measure"`, `data-item-id`, `data-status`, `data-unit`, classes `r-checklist__*` e shape `registro.checklist`.
- Riscos mapeados: vazamento de `_currentChecklist`, gate Pro, handlers delegados, warning soft-required nao bloqueante, shape salvo, persistence CP-K, PDF/relatorio, historico, selectors/classes e import circular.
- LOC atual `src/ui/views/registro.js`: 1752.
- Validacoes previstas para este CP: diff restrito aos docs; bateria feature/contratos; `npm run format`; `npm run check`.

## 29. CP-U - Contrato Checklist/PMOC

Status: aplicado em 2026-05-09.

- Teste criado: `src/__tests__/registroChecklistPmoc.contract.test.js`.
- Contratos protegidos: `#r-checklist-body`, `data-action="r-checklist-set"`, `data-action="r-checklist-obs"`, `data-action="r-checklist-measure"`, `data-item-id`, `data-status`, `data-unit`, classes `r-checklist__*`, shape `registro.checklist.tipo_template/items`, `validateChecklist`, persistence CP-K e consumo PDF de checklist.
- Warning soft-required travado como nao bloqueante: preventiva sem checklist e preventiva com obrigatorios pendentes disparam `Toast.warning`, mas continuam salvando.
- Persistence CP-K preservada: create e edit mantem checklist atual ou existente no formato esperado.
- Consumo PDF/relatorio protegido em contrato focado: `drawChecklist` consome `tipo_template`, usa labels do template e inclui apenas itens marcados.
- Nenhuma mudanca funcional intencional; nenhum arquivo de producao em `src/` foi alterado.
- Lacunas remanescentes: gate Pro/CTA segue coberto por testes legados de render, mas nao foi duplicado no contrato dedicado; matriz completa de PDF/relatorio por plano permanece fora deste CP.
- Validacoes rodadas: contrato Checklist/PMOC; bateria feature/contratos; testes relacionados Checklist/PMOC/Registro/PDF; `npm run format`; `npm run check`.

## 30. CP-V - Pre-split Checklist/PMOC in-place

Status: aplicado em 2026-05-09.

- Checklist/PMOC permaneceu em `src/ui/views/registro.js`; nenhum modulo feature novo foi criado.
- Helpers locais criados/ajustados: `getRegistroChecklistState`, `setRegistroChecklistState`, `clearRegistroChecklistState`, `cloneRegistroChecklistState`, `buildRegistroChecklistViewModel`, `getRegistroChecklistElements`, `resolveRegistroChecklistTemplate`, `ensureRegistroChecklistStateForTemplate`, `getRegistroChecklistItem`, `updateRegistroChecklistStatusDom`, `applyRegistroChecklistItemStatus`, `applyRegistroChecklistItemObs`, `parseRegistroChecklistMeasure`, `applyRegistroChecklistItemMeasure`, `collectRegistroChecklistForSave`, `buildRegistroChecklistSoftRequiredWarning`, `warnRegistroChecklistSoftRequiredGaps`, `resetRegistroChecklistAfterClear` e `restoreRegistroChecklistForEdit`.
- Responsabilidades separadas: acesso ao estado `_currentChecklist`, view model da ilha React, resolucao de template, reuse/reset de template, updates de status/obs/medicao, coleta para `saveRegistro`, warning soft-required, reset em `clearRegistro` e restore em `loadRegistroForEdit`.
- Nenhuma mudanca funcional intencional; contratos CP-B, CP-O e CP-U preservados; warning soft-required continua nao bloqueante; persistence CP-K, payload CP-D, PDF/relatorio, historico, React pages, handlers, templates PMOC, fotos, assinatura e Equipamentos preservados.
- LOC `src/ui/views/registro.js`: 1752 -> 1823.
- Testes rodados: contrato Checklist/PMOC; bateria feature/contratos; testes relacionados Checklist/PMOC/Registro/PDF; `npm run format`; `npm run check`.

## 31. CP-W - Mover helpers seguros Checklist/PMOC

Status: aplicado em 2026-05-09.

- Checklist/PMOC principal permaneceu em `src/ui/views/registro.js`; `saveRegistro`, estado `_currentChecklist`, gate Pro/PlanCache, DOM e bridge React permaneceram no adapter.
- Modulo criado: `src/features/registro/checklist/pmocChecklist.js`.
- Teste criado: `src/features/registro/__tests__/checklist/pmocChecklist.test.js`.
- Helpers seguros movidos: `buildRegistroChecklistViewModel`, `resolveRegistroChecklistTemplate`, `collectRegistroChecklistForSave`, `buildRegistroChecklistSoftRequiredWarning`, `cloneRegistroChecklistForEdit` e `parseRegistroChecklistMeasure`.
- DI explicita usada para `getChecklistTemplate`, `isPreventivaTipo`, `validateChecklist` e snapshot de checklist; o modulo nao importa adapter, DOM, React pages, handlers, Toast, PlanCache, PDF/relatorio ou historico.
- Helpers mantidos no adapter por estado/side effects: `getRegistroChecklistState`, `setRegistroChecklistState`, `clearRegistroChecklistState`, `ensureRegistroChecklistStateForTemplate`, `applyRegistroChecklistItemStatus`, `applyRegistroChecklistItemObs`, `applyRegistroChecklistItemMeasure`, `resetRegistroChecklistAfterClear`, `restoreRegistroChecklistForEdit`, render/mount/unmount e gate Pro.
- Nenhuma mudanca funcional intencional; contratos CP-B, CP-O e CP-U preservados; warning soft-required continua nao bloqueante; persistence CP-K, payload CP-D, PDF/relatorio, historico, React pages, handlers, templates PMOC, fotos, assinatura e Equipamentos preservados.
- LOC `src/ui/views/registro.js`: 1823 -> 1748.
- LOC `src/features/registro/checklist/pmocChecklist.js`: criado com 83 linhas.
- Testes rodados: checklist feature + contrato Checklist/PMOC; bateria feature/contratos; testes relacionados Checklist/PMOC/Registro/PDF; suite ampla `npm run test -- src/__tests__ --reporter=dot`; `npm run format`; `npm run check`.

## 32. CP-X - Mapear lifecycle Registro

Status: aplicado em 2026-05-09.

- Documento criado: `docs/migration/mudanca-12-cp-x-lifecycle-map.md`.
- Nenhum arquivo em `src/` foi alterado; nenhum teste foi alterado.
- Fluxos publicos mapeados: `initRegistro`, `clearRegistro` e `loadRegistroForEdit`.
- `initRegistro` mapeado: entrada de rota, root DOM, params/equipamento, contexto, skeleton/header React, binds idempotentes, datetime UX, defaults, Profile, fotos, assinatura, checklist/PMOC e estado inicial.
- `clearRegistro` mapeado: limpeza de campos DOM, reset de edicao/sessionStorage/route guard, defaults, fotos, assinatura, tipo/materiais/impacto, progress meter, quick chips, checklist/PMOC, ultimo cliente, labels e contexto.
- `loadRegistroForEdit` mapeado: resolucao de registro, `EDITING_KEY`, dataset edit mode, route guard, preenchimento de campos, tipo `Outro`, materiais/impacto, cliente, checklist/PMOC, labels de edicao e contexto.
- Riscos e lacunas mapeados: DOM/global roots, bridges React, reset visual, modo edicao, fotos/evidencias, assinatura, Checklist/PMOC, Profile/sessionStorage, Toast/focus, import circular e regressao silenciosa.
- LOC atual `src/ui/views/registro.js`: 1748.
- Validacoes previstas para este CP: diff restrito aos docs; bateria feature/contratos; `npm run check`.

## 33. Proximo CP recomendado

## 33. CP-Y - Contrato lifecycle init/clear/edit

Status: aplicado em 2026-05-09.

- Teste criado: `src/__tests__/registroLifecycle.contract.test.js`.
- Contratos protegidos: `initRegistro`, `clearRegistro`, `loadRegistroForEdit`, roots/ilhas principais, defaults minimos, modo edicao/sessionStorage/route guard, reset de fotos, reset de assinatura, reset de Checklist/PMOC, restauracao de edicao e fallback silencioso para registro ausente.
- `initRegistro` coberto com root ausente sem throw e view real com roots/actions/defaults preservados.
- `clearRegistro` coberto preservando equipamento com `preserveEquip=true`, limpando modo edicao e resetando fotos, assinatura e Checklist/PMOC.
- `loadRegistroForEdit` coberto preenchendo campos principais, ativando edit mode, setando route guard e restaurando Checklist/PMOC.
- Sequencia `initRegistro -> clearRegistro -> loadRegistroForEdit` coberta contra estado impossivel em roots publicos.
- Nenhuma mudanca funcional intencional; nenhum arquivo de producao em `src/` foi alterado.
- Lacunas remanescentes: ordem interna completa dos binds de `initRegistro`, reset visual detalhado de todos os chips/details e restauracao visual de fotos/assinatura seguem cobertos por testes legados relacionados, nao duplicados no contrato dedicado.
- Validacoes previstas para este CP: contrato lifecycle; bateria feature/contratos; testes relacionados lifecycle/Registro; `npm run format`; `npm run check`.

## 34. CP-Z - Pre-split clearRegistro

Status: aplicado em 2026-05-09.

- `clearRegistro` permaneceu em `src/ui/views/registro.js`; nenhum modulo feature novo foi criado.
- Helpers locais criados: `getClearRegistroFieldIds`, `resetRegistroBaseFieldsAfterClear`, `resetRegistroDefaultFieldsAfterClear`, `resetRegistroMediaAfterClear`, `resetRegistroSignatureAfterClear`, `resetRegistroDetailsAfterClear`, `resetRegistroProgressAfterClear`, `resetRegistroQuickTemplateChipsAfterClear`, `resetRegistroChecklistAfterClearClick`, `resetRegistroTechnicianDefaultAfterClear`, `restoreRegistroLastClientAfterClear`, `resetRegistroSaveButtonAfterClear`, `resetRegistroHeroAfterClear` e `finalizeClearRegistroAfterReset`.
- Responsabilidades separadas: campos base e `preserveEquip`, modo edicao, defaults, fotos/evidencias, assinatura, details/progresso, quick templates, Checklist/PMOC, tecnico padrao, ultimo cliente, botao de save, hero e refresh de contexto.
- Nenhuma mudanca funcional intencional; contratos CP-Y, CP-B, CP-O e CP-U preservados.
- `initRegistro`, `loadRegistroForEdit`, `saveRegistro`, React pages, handlers, features extraidas, relatorio/PDF, historico, Equipamentos, CSS, schema e package files preservados.
- LOC `src/ui/views/registro.js`: 1748 -> 1788.
- Validacoes previstas para este CP: contrato lifecycle; bateria feature/contratos; testes relacionados clear/lifecycle/Registro; `npm run format`; `npm run check`.

## 35. CP-AA - Pre-split loadRegistroForEdit

Status: aplicado em 2026-05-09.

- `loadRegistroForEdit` permaneceu em `src/ui/views/registro.js`; nenhum modulo feature novo foi criado.
- Helpers locais criados: `resolveRegistroEditTarget`, `enterRegistroEditMode`, `fillRegistroEditBaseFields`, `fillRegistroEditTypeFields`, `fillRegistroEditOperationalFields`, `fillRegistroEditClientFields`, `restoreRegistroEditChecklist`, `syncRegistroEditActionState` e `syncRegistroEditHeroContext`.
- Responsabilidades separadas: resolucao/fallback silencioso, modo edicao/sessionStorage/route guard, campos equipamento/data, tipo customizado, campos operacionais, cliente, Checklist/PMOC, botao de save e hero/contexto.
- Nenhuma mudanca funcional intencional; contratos CP-Y, CP-B, CP-O e CP-U preservados.
- `initRegistro`, `clearRegistro`, `saveRegistro`, React pages, handlers, features extraidas, relatorio/PDF, historico, Equipamentos, CSS, schema e package files preservados.
- LOC `src/ui/views/registro.js`: 1788 -> 1815.
- Validacoes previstas para este CP: contrato lifecycle; bateria feature/contratos; testes relacionados edit/lifecycle/Registro; `npm run format`; `npm run check`.

## 36. CP-AB - Pre-split initRegistro

Status: aplicado em 2026-05-09.

- `initRegistro` permaneceu em `src/ui/views/registro.js`; nenhum modulo feature novo foi criado.
- Helpers locais criados: `resolveRegistroInitRoot`, `resolveRegistroInitEquipId`, `syncRegistroInitRouteContext`, `mountRegistroInitHeader`, `bindRegistroInitFormOnce`, `syncRegistroInitDetailsState`, `renderRegistroInitHeroAndPhotos`, `applyRegistroInitDateDefault`, `bindRegistroInitDatetimeUX`, `applyRegistroInitTechnicianDefault`, `resetRegistroInitEditingIfCreate`, `applyRegistroInitPriorityDefault`, `applyRegistroInitSignatureHint` e `runRegistroInitAfterHeaderMounted`.
- Responsabilidades separadas: root/fallback silencioso, resolucao de equipamento inicial, contexto/params de rota, mount do header React, binds idempotentes, details/progresso, hero/fotos, defaults de data/tecnico/prioridade, datetime UX, reset de edicao para create, read-only view model e hint de assinatura.
- Nenhuma mudanca funcional intencional; contratos CP-Y, CP-B, CP-O e CP-U preservados.
- `clearRegistro`, `loadRegistroForEdit`, `saveRegistro`, React pages, handlers, features extraidas, relatorio/PDF, historico, Equipamentos, CSS, schema e package files preservados.
- LOC `src/ui/views/registro.js`: 1815 -> 1848.
- Validacoes previstas para este CP: contrato lifecycle; bateria feature/contratos; testes relacionados init/lifecycle/Registro; suite ampla `src/__tests__`; `npm run format`; `npm run check`.

## 37. Proximo CP recomendado

**CP-AC - mover helpers seguros de lifecycle.**

Confianca: 90%+. A triade lifecycle (`initRegistro`, `clearRegistro`, `loadRegistroForEdit`) ja esta separada localmente e protegida por contrato. O proximo corte seguro e classificar e mover apenas helpers puros/baixo risco, mantendo DOM, bridges React, guards, storage e orquestradores no adapter.
