# Mudança 15 - Histórico / Inventário inicial

## 1. Base

- Branch: `main`
- HEAD: `f67b48835a577748d567407f2891338710c4e2cc`
- Data: 2026-05-09
- Arquivos analisados:
  - `src/ui/views/historico.js`
  - `src/react/pages/HistoricoTimeline.jsx`
  - `src/react/pages/HistoricoFilters.jsx`
  - `src/react/entrypoints/historicoTimelineIsland.jsx`
  - `src/react/entrypoints/historicoFiltersIsland.jsx`
  - `src/react/components/CardActions.jsx`
  - `src/ui/viewModels/historicoContracts.js`
  - `src/ui/viewModels/historicoViewModel.js`
  - `src/ui/components/historicoFiltersSheet.js`
  - `src/ui/components/historicoFiltersSheetModel.js`
  - `src/ui/controller/handlers/navigationHandlers.js`
  - `src/ui/controller/handlers/registroHandlers.js`
  - `src/ui/controller/handlers/reportExportHandlers.js`
  - `src/ui/controller/routes.js`
  - testes relacionados em `src/__tests__`
- Arquivo principal identificado: `src/ui/views/historico.js`
- LOC dos arquivos principais:
  - `src/ui/views/historico.js`: 1490
  - `src/react/pages/HistoricoTimeline.jsx`: 453
  - `src/react/pages/HistoricoFilters.jsx`: 252
  - `src/ui/viewModels/historicoContracts.js`: 102
  - `src/ui/viewModels/historicoViewModel.js`: 497
  - `src/ui/components/historicoFiltersSheet.js`: 251
  - `src/ui/components/historicoFiltersSheetModel.js`: 100
  - `src/react/components/CardActions.jsx`: 68
  - `src/react/entrypoints/historicoTimelineIsland.jsx`: 38
  - `src/react/entrypoints/historicoFiltersIsland.jsx`: 36
  - `src/ui/views/registro.js`: 1828
  - `src/ui/controller/handlers/reportExportHandlers.js`: 727
  - `src/domain/pdf.js`: 177

## 2. Objetivo

Mapear o fluxo de Histórico antes de qualquer refatoração, registrando responsabilidades, card actions, integração com Registro, integração com Relatório/PDF/WhatsApp, filtros, contratos públicos, dependências, riscos e sequência segura para a Mudança 15.

## 3. Escopo real Histórico

| Arquivo                                              |    LOC | Tipo                          | Responsabilidade aparente                                                                                                                                                 | Exporta API pública?                                                                       | Risco                                                                                          |
| ---------------------------------------------------- | -----: | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `src/ui/views/historico.js`                          |   1490 | Adapter/view legado           | Orquestra render do Histórico, hidrata filtros da URL, monta view models, carrega ilhas React, anexa handlers, abre fotos/assinaturas, remove registros e atualiza header | Sim: `renderHist`, `deleteReg`, `setHistClienteFilter`, `clearHistClienteFilter`, unmounts | Alto: acima de 1000 LOC, mistura DOM, state, routing, storage, handlers e render orchestration |
| `src/react/pages/HistoricoTimeline.jsx`              |    453 | React island/page             | Renderiza timeline, summary/attention, cards, mídia, assinatura, menu de ações e `CardActions` por registro                                                               | Sim: `HistoricoTimeline`                                                                   | Alto: contratos DOM dos cards e actions são consumidos por handlers legados globais            |
| `src/react/pages/HistoricoFilters.jsx`               |    252 | React island/page             | Renderiza header sticky, busca, selects, quick filters e chips ativos                                                                                                     | Sim: `HistoricoFilters`                                                                    | Médio: IDs e `data-hist-action` são contratos públicos                                         |
| `src/react/entrypoints/historicoTimelineIsland.jsx`  |     38 | React bridge                  | Monta/desmonta ilha da timeline em `#timeline` com `createRoot`                                                                                                           | Sim: mount/unmount                                                                         | Médio: lifecycle precisa não duplicar roots/listeners                                          |
| `src/react/entrypoints/historicoFiltersIsland.jsx`   |     36 | React bridge                  | Monta/desmonta ilha dos filtros em `#hist-filters-root`                                                                                                                   | Sim: mount/unmount                                                                         | Médio: lifecycle e dataset de mount são contratos                                              |
| `src/react/components/CardActions.jsx`               |     68 | React component compartilhado | Renderiza CTAs `export-pdf` e `whatsapp-export` com `data-registro-id`                                                                                                    | Sim: `CardActions`                                                                         | Alto: integra Histórico/Relatório com handlers globais de export                               |
| `src/ui/viewModels/historicoContracts.js`            |    102 | Contratos                     | Centraliza IDs, actions, attrs, classes, opções de período/tipo e targets                                                                                                 | Sim                                                                                        | Alto: alteração quebra testes/selectors/handlers                                               |
| `src/ui/viewModels/historicoViewModel.js`            |    497 | View model puro               | Filtra registros, monta cards, métricas, chips, grupos, estados vazios e ações                                                                                            | Sim                                                                                        | Médio: lógica crítica já testada, mas acoplada aos contratos dos cards                         |
| `src/ui/components/historicoFiltersSheet.js`         |    251 | UI component legado           | Modal/bottom sheet de filtros secundários com DOM dinâmico e callbacks                                                                                                    | Sim: `HistoricoFiltersSheet`                                                               | Médio: usa `innerHTML`, modal/a11y e handlers locais                                           |
| `src/ui/components/historicoFiltersSheetModel.js`    |    100 | Model/helper puro             | Normaliza estado inicial e opções do sheet                                                                                                                                | Sim                                                                                        | Baixo: isolado e testado                                                                       |
| `src/ui/controller/handlers/navigationHandlers.js`   |    N/A | Handler global                | Consome `data-action="edit-reg"` e navega para Registro com `editRegistroId`                                                                                              | Não diretamente                                                                            | Alto: editar depende de `data-id` nos cards                                                    |
| `src/ui/controller/handlers/registroHandlers.js`     |    N/A | Handler global                | Consome `data-action="delete-reg"`, confirma e chama `deleteReg`                                                                                                          | Não diretamente                                                                            | Alto: exclusão depende de `deleteReg`, storage e state                                         |
| `src/ui/controller/handlers/reportExportHandlers.js` |    727 | Handler global                | Consome `export-pdf`/`whatsapp-export` e `data-registro-id` para PDF/WhatsApp                                                                                             | Sim: flows/bind                                                                            | Alto: quota, preview, signature resolver, share e PDF dependem do trigger                      |
| `src/ui/controller/routes.js`                        |    N/A | Router adapter                | Registra rota `historico`, limpa filtros por cliente, carrega Registro para edição                                                                                        | Sim: `registerAppRoutes`                                                                   | Médio: integração Histórico -> Registro passa por rota                                         |
| Testes `historico*`                                  | Vários | Contratos/regressão           | Cobrem view model, timeline, filtros, sheet, segurança e ilhas                                                                                                            | Não                                                                                        | Médio: cobertura boa para render/filtros; lacunas em fluxo end-to-end de card actions          |

## 4. Fluxos principais

| Fluxo                                      | Entrada/trigger                                                            | Arquivos envolvidos                                                                         | Dependências                                                                                | Side effects                                                                              | Testes existentes                                                                                                     | Risco |
| ------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----- |
| Entrada/init da tela Histórico             | Rota `historico` chama `renderHist`                                        | `routes.js`, `historico.js`                                                                 | `getState`, `updateHeader`, URL/sessionStorage, React bridges                               | Lê state, hidrata filtros, substitui/monta DOM                                            | `historicoView.test.js`, `historicoTimelineLegacyRender.test.js`, `historicoFiltersLegacyRender.test.js`              | Médio |
| Renderização timeline/lista                | `renderHist` monta `timelineViewModel` e ilha React                        | `historico.js`, `HistoricoTimeline.jsx`, `historicoViewModel.js`                            | Registros, equipamentos, setores, clientes, signatures/photos                               | Monta React em `#timeline`, preserva scroll, aplica toast de destaque                     | `historicoTimelineIsland.test.jsx`, `historicoTimelineLegacyRender.test.js`                                           | Alto  |
| Filtros cliente/equipamento/status/período | Busca/selects/quick filters/sheet/url                                      | `historico.js`, `HistoricoFilters.jsx`, `historicoFiltersSheet.js`, `historicoViewModel.js` | URLSearchParams, sessionStorage, DOM ids, sheet callbacks                                   | Atualiza URL/sessionStorage/DOM, re-renderiza                                             | `historicoFiltersLegacyRender.test.js`, `historicoFiltersIsland.test.jsx`, `historicoFiltersSheetIntegration.test.js` | Alto  |
| Cards de serviço                           | View model cria `items`; React renderiza cards                             | `historicoViewModel.js`, `HistoricoTimeline.jsx`                                            | `HISTORICO_ACTIONS`, equipamento/setor/cliente, fotos, assinatura                           | Exibe dados, attrs e ações                                                                | `historicoViewModel.test.js`, `historicoTimelineIsland.test.jsx`                                                      | Alto  |
| Abrir/visualizar registro                  | Não há ação "ver" dedicada; card expõe detalhes e mídia                    | `HistoricoTimeline.jsx`, `historico.js`                                                     | Fotos/assinatura/lightbox/modal                                                             | Abre foto ou assinatura; não navega para view read-only de Registro                       | `historicoTimelineIsland.test.jsx`, `historicoTimelineLegacyRender.test.js`                                           | Médio |
| Editar registro                            | `data-action="edit-reg"` com `data-id`                                     | `HistoricoTimeline.jsx`, `navigationHandlers.js`, `routes.js`, `registro.js`                | Router `goTo`, `loadRegistroForEdit`                                                        | Navega para Registro e carrega edição                                                     | Testes indiretos de actions e `loadRegistroForEdit`; sem contrato dedicado Histórico -> Registro                      | Alto  |
| Excluir/remover registro                   | `data-action="delete-reg"` com `data-id`                                   | `HistoricoTimeline.jsx`, `registroHandlers.js`, `historico.js`                              | `CustomConfirm`, `Storage`, `setState`, `getOperationalStatus`, `updateGlobalHeader`, Toast | Marca exclusão, remove registro, recalcula status do equipamento, remove assinatura local | Contratos de action; lacuna de fluxo delete completo no Histórico                                                     | Alto  |
| Exportar PDF por card                      | `CardActions` emite `data-action="export-pdf"` e `data-registro-id`        | `CardActions.jsx`, `reportExportHandlers.js`, `domain/pdf.js`                               | Quota, PDFGenerator, resolver assinatura, filtros                                           | Gera/download PDF filtrado por registro                                                   | `reportExportContracts.test.js`, `registroPdfWhatsappRegistroId.contract.test.js`                                     | Alto  |
| Compartilhar WhatsApp por card             | `CardActions` emite `data-action="whatsapp-export"` e `data-registro-id`   | `CardActions.jsx`, `reportExportHandlers.js`, `shareReport.js`                              | Quota WhatsApp, PDF blob, Web Share/upload/download                                         | Gera PDF e compartilha/link/download fallback                                             | `reportExportContracts.test.js`, `registroPdfWhatsappRegistroId.contract.test.js`                                     | Alto  |
| Integração com Registro                    | Edit via rota e delete via handler                                         | `navigationHandlers.js`, `registroHandlers.js`, `registro.js`, `historico.js`               | Router, state, storage, form lifecycle                                                      | Navegação, edição, persistência e exclusão                                                | `registroLifecycle.contract.test.js`, `registroRouteLifecycle.test.js`, contratos de selectors                        | Alto  |
| Integração com Relatório/PDF               | `CardActions` e filtros `registroId`                                       | `CardActions.jsx`, `reportExportHandlers.js`, `domain/pdf.js`, `reportModel.js`             | `data-registro-id`, `buildReportFilters`                                                    | PDF/WhatsApp usam registro-alvo                                                           | `reportExportContracts.test.js`                                                                                       | Alto  |
| Fotos/evidências                           | Botões `hist-open-photo` com URL segura                                    | `HistoricoTimeline.jsx`, `historico.js`, `Photos`                                           | `getSafeMediaUrl`, lightbox                                                                 | Abre lightbox                                                                             | `historicoTimelineIsland.test.jsx`                                                                                    | Médio |
| Assinatura                                 | Botão `hist-view-signature` quando há assinatura                           | `HistoricoTimeline.jsx`, `historico.js`, `signature.js`                                     | `cleanupOrphanSignatures`, `SignatureViewerModal`                                           | Limpa órfãs e abre modal                                                                  | `historicoTimelineIsland.test.jsx`, testes de assinatura do Registro                                                  | Médio |
| Checklist/PMOC                             | Dados aparecem indiretamente nos registros e PDF                           | `historico.js`, `CardActions.jsx`, `domain/pdf`                                             | `registro.checklist`, PDF/checklist contracts                                               | Não renderiza PMOC completo no Histórico; export por card preserva dados                  | Contratos PDF/checklist; lacuna no Histórico específico                                                               | Médio |
| Estado vazio                               | Sem registros válidos ou filtro sem resultado                              | `historicoViewModel.js`, `HistoricoTimeline.jsx`                                            | `hasFilters`, empty state model                                                             | Renderiza empty state/CTA                                                                 | `historicoTimelineIsland.test.jsx`, `historicoTimelineLegacyRender.test.js`                                           | Médio |
| Fallback silencioso                        | URL/sessionStorage/import/assinatura/foto                                  | `historico.js`, `HistoricoTimeline.jsx`                                                     | try/catch, null checks, safe media URL                                                      | Ignora falhas não críticas                                                                | Testes de segurança/fallback parcial                                                                                  | Médio |
| Toast/handleError                          | Toast direto em `renderHist`/`deleteReg`; handleError nos handlers globais | `historico.js`, `registroHandlers.js`, `reportExportHandlers.js`                            | Toast, handleError                                                                          | Feedback ao usuário e logs                                                                | Parcial                                                                                                               | Médio |
| Selectors públicos                         | IDs, classes e data attrs                                                  | `historicoContracts.js`, React pages                                                        | Testes e handlers legados                                                                   | Quebra handlers se renomear                                                               | `historicoViewModel.test.js`, render tests                                                                            | Alto  |

## 5. Contratos públicos

| Contrato público                                  | Origem                                          | Usado por                                  | Teste existente                                                                   | Risco se alterar                   |
| ------------------------------------------------- | ----------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------- |
| `renderHist`                                      | `src/ui/views/historico.js`                     | Router e testes                            | `historicoView.test.js`, render tests                                             | Tela deixa de renderizar           |
| `deleteReg`                                       | `src/ui/views/historico.js`                     | `registroHandlers.js`                      | Cobertura indireta; lacuna de contrato dedicado                                   | Exclusão quebra ou corrompe status |
| `setHistClienteFilter` / `clearHistClienteFilter` | `historico.js`                                  | Rotas Clientes/Histórico                   | `clientesRouteAccess.test.js`, `routes.test.js`, filtros legacy                   | Filtro por cliente quebra          |
| `#timeline`                                       | `historicoContracts.js`, `HistoricoTimeline`    | React bridge e testes                      | `historicoTimelineIsland.test.jsx`                                                | Ilha não monta                     |
| `#hist-filters-root`                              | `historico.js`                                  | React bridge de filtros                    | `historicoFiltersIsland.test.jsx`                                                 | Header/filtros não montam          |
| `#hist-busca`, `#hist-setor`, `#hist-equip`       | `HistoricoFilters.jsx`                          | `attachFilterHandlers`, URL/sessionStorage | `historicoFiltersLegacyRender.test.js`                                            | Filtros param de funcionar         |
| `data-hist-action`                                | `historicoContracts.js`, React pages            | `attachFilterHandlers`                     | `historicoViewModel.test.js`, island tests                                        | Handlers legados perdem alvo       |
| `data-action="edit-reg"`                          | `HistoricoTimeline.jsx`                         | `navigationHandlers.js`                    | Timeline tests                                                                    | Edição via card quebra             |
| `data-action="delete-reg"`                        | `HistoricoTimeline.jsx`                         | `registroHandlers.js`                      | Timeline tests                                                                    | Exclusão via card quebra           |
| `data-action="export-pdf"`                        | `CardActions.jsx`                               | `reportExportHandlers.js`                  | `reportExportContracts.test.js`, timeline tests                                   | PDF por card quebra                |
| `data-action="whatsapp-export"`                   | `CardActions.jsx`                               | `reportExportHandlers.js`                  | `reportExportContracts.test.js`, timeline tests                                   | WhatsApp por card quebra           |
| `data-registro-id`                                | `CardActions.jsx`                               | `getReportFilters` / export flows          | `reportExportContracts.test.js`, `registroPdfWhatsappRegistroId.contract.test.js` | Export usa filtro errado           |
| `data-id`                                         | `HistoricoTimeline.jsx`                         | Edit/delete/signature/toggle handlers      | Timeline tests                                                                    | Registro-alvo perde identidade     |
| `data-reg-id`                                     | `HistoricoTimeline.jsx`                         | Selectors de card/timeline                 | Timeline tests                                                                    | Selectors e testes quebram         |
| Classes `timeline__item`, `hist-*`, `empty-state` | `HistoricoTimeline.jsx`, `HistoricoFilters.jsx` | CSS/testes                                 | render/island tests                                                               | Regressão visual/selector          |
| `HISTORICO_ACTIONS`                               | `historicoContracts.js`                         | React pages e tests                        | `historicoViewModel.test.js`                                                      | Contratos divergentes              |
| `HISTORICO_PUBLIC_IDS/CLASSES/DATA_ATTRIBUTES`    | `historicoContracts.js`                         | Testes/arquitetura                         | `historicoViewModel.test.js`                                                      | Mudança silenciosa de API DOM      |

## 6. Dependências técnicas

| Dependência             | Usada onde                                        | Função                                                    | Acoplamento     | Risco | Estratégia sugerida                                         |
| ----------------------- | ------------------------------------------------- | --------------------------------------------------------- | --------------- | ----- | ----------------------------------------------------------- |
| `core/state`            | `historico.js`, rotas/handlers                    | Lê registros/equipamentos/clientes e muta state no delete | Forte           | Alto  | Isolar mutações antes de refatorar delete                   |
| `core/storage`          | `historico.js`                                    | Marca registro deletado                                   | Forte no delete | Alto  | Criar contrato antes de mover                               |
| `core/utils`            | `historico.js`, components                        | Formatação, escape, datas, DOM helpers                    | Forte           | Médio | Extrair helpers puros só com testes                         |
| `Toast`                 | `historico.js`, handlers                          | Feedback de sucesso/remoção/erro                          | Médio           | Médio | Manter efeitos no adapter                                   |
| `Router/goTo`           | `historico.js`, `navigationHandlers.js`, routes   | Navegação para pricing/equipamentos/registro              | Forte           | Alto  | Mapear antes de mover card actions                          |
| `Registro`              | `routes.js`, `registro.js`, `registroHandlers.js` | Editar registro e excluir                                 | Forte           | Alto  | Próximo CP deve travar card actions                         |
| `Report/PDF handlers`   | `CardActions.jsx`, `reportExportHandlers.js`      | PDF/WhatsApp por registro                                 | Forte           | Alto  | Preservar `data-registro-id`; ampliar contrato de Histórico |
| React islands           | `historico.js`, entrypoints, pages                | Render moderno dentro de adapter legado                   | Médio           | Alto  | Não misturar bridge com view model                          |
| `historicoViewModel`    | `historico.js`, tests                             | Filtragem e modelagem pura                                | Médio           | Médio | Boa candidata para próximos helpers/contratos               |
| `historicoFiltersSheet` | `historico.js`                                    | Sheet mobile/desktop para filtros                         | Médio           | Médio | Manter render DOM separado do model                         |
| Photo data              | `HistoricoTimeline.jsx`, `historico.js`           | Thumbs e lightbox                                         | Médio           | Médio | Preservar safe URL                                          |
| Signature data          | `historico.js`, `HistoricoTimeline.jsx`           | Limpeza órfã e modal de assinatura                        | Médio           | Médio | Evitar tocar junto com filtros                              |
| Checklist/PMOC          | Dados de registros e export PDF                   | Mantidos para PDF por card                                | Indireto        | Médio | Validar em contratos PDF se mexer nos cards                 |
| CSS/classes             | React pages e components                          | Layout visual                                             | Forte           | Alto  | Evitar renomear classes em CPs de lógica                    |

## 7. Testes existentes e lacunas

| Teste                                                          | O que cobre                                                                                        | O que não cobre                                  | Importância | Observação                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------- | ---------------------------------- |
| `src/__tests__/historicoView.test.js`                          | Helpers de insights, recorrência, status, resumo do dia, acesso por plano e safety de `renderHist` | Card actions completos e integração Registro/PDF | Alta        | 27 testes                          |
| `src/__tests__/historicoViewModel.test.js`                     | Filtros, ordenação, cards, contratos públicos e pureza do view model                               | Side effects DOM/Router/Storage                  | Alta        | 8 testes                           |
| `src/__tests__/historicoTimelineLegacyRender.test.js`          | Render legado da timeline, classes, attrs, actions e segurança                                     | Fluxo real dos handlers globais                  | Alta        | 4 testes                           |
| `src/__tests__/historicoTimelineIsland.test.jsx`               | Montagem React, root lifecycle, attrs, mídia, assinatura e segurança                               | Integração com router/export/delete real         | Alta        | 8 testes                           |
| `src/__tests__/historicoFiltersLegacyRender.test.js`           | Header, busca, filtros, chips, cliente filter, sheet e escape                                      | Fluxo end-to-end com URL real em browser         | Alta        | 8 testes                           |
| `src/__tests__/historicoFiltersIsland.test.jsx`                | Ilha de filtros, ids/classes/actions, update/unmount e segurança                                   | Sheet callbacks reais                            | Média       | 7 testes                           |
| `src/__tests__/historicoFiltersSheet.test.js`                  | UI do sheet, reset/apply, fechamento                                                               | Integração com `renderHist`                      | Média       | 6 testes                           |
| `src/__tests__/historicoFiltersSheetIntegration.test.js`       | Integra sheet com adapter do Histórico                                                             | Card actions/PDF/Registro                        | Alta        | 4 testes                           |
| `src/__tests__/historicoFiltersSheetModel.test.js`             | Modelo puro do sheet, contratos e isolamento                                                       | DOM visual do sheet                              | Média       | 5 testes                           |
| `src/__tests__/reportExportContracts.test.js`                  | `export-pdf`/`whatsapp-export`, `data-registro-id`, quota e share                                  | Especificidade visual dos cards do Histórico     | Alta        | Garante contrato do handler global |
| `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js` | `registroId` em fluxos Registro/PDF/WhatsApp                                                       | Origem via Histórico em si                       | Alta        | Complementar                       |
| Testes de Registro lifecycle                                   | `loadRegistroForEdit`, edição e persistência                                                       | Trigger `edit-reg` do Histórico completo         | Alta        | Cobrem destino, não origem         |

Lacunas críticas antes de pre-split:

- Falta contrato dedicado Histórico/card actions garantindo `edit-reg`, `delete-reg`, `export-pdf`, `whatsapp-export`, `data-id` e `data-registro-id` no mesmo cenário.
- Falta contrato end-to-end leve do Histórico -> Registro para `edit-reg` com `goTo('registro', { editRegistroId })`.
- Falta contrato Histórico -> delete cobrindo `Storage.markRegistroDeleted`, recalculo de status e `updateGlobalHeader` a partir de card action.
- Filtros têm boa cobertura, mas `historico.js` ainda concentra handlers e timers, tornando pre-split arriscado sem um contrato de action delegation.
- Checklist/PMOC é preservado indiretamente pelo PDF, mas não há teste específico de Histórico garantindo que card action exporta registro com checklist.

## 8. Riscos de arquitetura

| Risco                                        | Evidência                                                                                        | Impacto                                              | Bloqueia próxima etapa?   | Tratamento sugerido                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------- | ------------------------------------------- |
| `historico.js` grande                        | 1490 LOC                                                                                         | Difícil revisar e separar sem regressão              | Sim para pre-split direto | Criar contrato card actions antes           |
| Mistura UI/render/handlers                   | `renderHist`, bridges, attach handlers e delete no mesmo arquivo                                 | Mudança pequena pode quebrar filtros/actions         | Sim                       | Separar só após contratos                   |
| Actions por card frágeis                     | `data-action`, `data-hist-action`, `data-id`, `data-registro-id` cruzam React e handlers legados | Edit/delete/PDF/WhatsApp podem mirar registro errado | Sim                       | CP-B de contrato específico                 |
| Integração com Registro                      | `edit-reg` em `navigationHandlers`, delete em `registroHandlers`, `loadRegistroForEdit` em rota  | Acoplamento distribuído                              | Sim                       | Mapear/contratar antes de mover             |
| Integração com PDF/WhatsApp                  | `CardActions` usa handlers globais e `data-registro-id`                                          | Regressão pode exportar relatório errado             | Sim                       | Incluir no contrato de card actions         |
| Filtros duplicados/parciais                  | URL/sessionStorage/DOM/viewModel/sheet                                                           | Estado de filtro pode divergir                       | Não imediato              | Pre-split posterior focado em filtros       |
| `data-registro-id` frágil                    | Export depende do atributo em botões do `CardActions`                                            | Alto impacto no cliente/PDF                          | Sim                       | Tratar como contrato público                |
| Estados vazios                               | Empty state em view model e React                                                                | Regressão visual e CTA errado                        | Não                       | Manter coberto nos testes existentes        |
| Import circular                              | Histórico importa componentes/rotas; handlers importam `deleteReg`                               | Extração descuidada pode criar ciclo                 | Sim                       | Mapear dependências antes de mover handlers |
| Testes insuficientes para actions integradas | Há testes separados, mas sem contrato consolidado do card                                        | Regressão silenciosa em action delegation            | Sim                       | Próximo CP deve criar teste                 |
| Layout/card visual                           | Classes `timeline__*`, `card-actions`, `hist-*` são CSS contracts                                | Renomear quebra UI                                   | Não para doc              | Evitar mudanças visuais nos próximos CPs    |

## 9. Riscos principais

- Cards/actions: contratos espalhados entre React cards, `CardActions`, handlers globais e testes de relatório.
- Filtros: URL, sessionStorage, DOM e view model coexistem e podem divergir.
- Registro: edição e exclusão passam por handlers/rotas fora do arquivo principal.
- PDF/WhatsApp: `data-registro-id` é essencial para filtrar o registro certo.
- Fotos/assinatura/checklist: mídias aparecem no Histórico; checklist/PMOC depende do export por card.
- `data-registro-id`: contrato crítico e frágil por ser atributo DOM.
- Estado vazio: render e CTA têm contratos visuais próprios.
- Import circular: risco ao mover `deleteReg` ou action handlers sem planejar dependências.
- Regressão silenciosa: card actions podem continuar renderizando, mas disparar handler errado.

## 10. Sequência recomendada da Mudança 15

| Ordem | CP                                                       | Objetivo                                                       | Escopo permitido          | Risco       | Critério de aprovação                                                                                  |
| ----: | -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
|     1 | CP-B - contratos adicionais Histórico/card actions       | Travar actions, attrs e integração mínima com handlers globais | Testes + inventário       | Baixo/médio | Testes cobrem `edit-reg`, `delete-reg`, `export-pdf`, `whatsapp-export`, `data-id`, `data-registro-id` |
|     2 | CP-C - pre-split render/timeline                         | Quebrar `historico.js` localmente sem mover módulos            | `historico.js` + docs     | Médio       | Contratos passam sem mudança visual                                                                    |
|     3 | CP-D - mover helpers puros de filtros/view model         | Extrair apenas modelagem pura segura                           | Novo helper/testes + docs | Médio       | Helpers isolados de DOM/React/router/storage                                                           |
|     4 | CP-E - pre-split card actions                            | Separar localmente action binding/delegation                   | `historico.js` + docs     | Alto        | Contrato CP-B passa                                                                                    |
|     5 | CP-F - mapear integração Histórico -> Registro           | Read-only do fluxo edit/delete/route                           | docs                      | Baixo       | Riscos de ciclo e storage documentados                                                                 |
|     6 | CP-G - mapear integração Histórico -> PDF/WhatsApp       | Read-only do fluxo export/share por card                       | docs                      | Baixo       | Contrato `registroId` confirmado                                                                       |
|     7 | CP-H - mover helpers seguros ou adapter local de actions | Só se CP-E/F/G derem confiança                                 | Código restrito + testes  | Alto        | Sem alteração em selectors/behavior                                                                    |
|     8 | CP-I - stability checkpoint                              | Consolidar Mudança 15                                          | docs + validação          | Baixo       | Testes/check passam e riscos remanescentes documentados                                                |

## 11. Próximo CP recomendado

Próximo CP recomendado: **CP-B - contratos adicionais Histórico/card actions**.

Justificativa: há mais de 90% de confiança de que o próximo corte seguro é reforçar contratos antes de qualquer pre-split. O maior risco atual não é filtro ou layout isolado, mas a malha de actions por card que cruza `HistoricoTimeline.jsx`, `CardActions.jsx`, `navigationHandlers.js`, `registroHandlers.js` e `reportExportHandlers.js`. Sem esse contrato consolidado, qualquer refatoração em `historico.js` pode quebrar edição, exclusão, PDF ou WhatsApp de forma silenciosa.

## 12. CP-B - Contratos Historico/card actions

- CP-B aplicado.
- Teste criado: `src/__tests__/historicoCardActions.contract.test.js`.
- Nenhum codigo de producao foi alterado.
- Nenhum comportamento foi alterado.
- Contratos travados: `edit-reg`, `delete-reg`, `export-pdf`, `whatsapp-export`, `data-id`, `data-registro-id`, `data-reg-id` e `card-actions`.
- Lacuna reduzida: antes havia cobertura espalhada entre timeline, Registro e Relatorio/PDF; agora ha um contrato dedicado do card do Historico conectando as actions no mesmo cenario.

| Contrato Historico/card action  | Origem                                      | Consumidor                                 | Lacuna antes                                                                            | Cobertura adicionada                                               |
| ------------------------------- | ------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `data-action="edit-reg"`        | `HistoricoTimeline.jsx`                     | `navigationHandlers.js`                    | Coberto em testes de timeline, mas sem contrato dedicado junto ao card actions completo | DOM do card e consumidor fonte com `editRegistroId: el.dataset.id` |
| `data-action="delete-reg"`      | `HistoricoTimeline.jsx`                     | `registroHandlers.js`                      | Coberto em testes de timeline, mas sem contrato dedicado junto ao card actions completo | DOM do card e consumidor fonte com `deleteReg(el.dataset.id)`      |
| `data-action="export-pdf"`      | `CardActions.jsx`                           | `reportExportHandlers.js`                  | Coberto em relatorio, mas sem origem explicita pelo card do Historico                   | DOM do card com `data-registro-id` igual ao id renderizado         |
| `data-action="whatsapp-export"` | `CardActions.jsx`                           | `reportExportHandlers.js`                  | Coberto em relatorio, mas sem origem explicita pelo card do Historico                   | DOM do card com `data-registro-id` igual ao id renderizado         |
| `data-id`                       | `HistoricoTimeline.jsx`                     | Edit/delete/toggle/signature handlers      | Cobertura parcial por timeline                                                          | Contrato dedicado para edit/delete com mesmo registro do card      |
| `data-registro-id`              | `CardActions.jsx`                           | `getReportFilters` e flows de PDF/WhatsApp | Cobertura em contratos de export; lacuna no card do Historico                           | Contrato dedicado para PDF/WhatsApp no card do Historico           |
| Fallback sem dados opcionais    | `HistoricoTimeline.jsx` + `CardActions.jsx` | Handlers globais                           | Faltava garantir actions sem fotos/assinatura/checklist                                 | Card minimo preserva edit/delete/PDF/WhatsApp                      |

Validacao inicial do CP-B:

- `npm run test -- src/__tests__/historicoCardActions.contract.test.js --reporter=dot`: passou, 1 arquivo / 3 testes.

Lacunas remanescentes:

- Fluxo end-to-end real de delete ainda nao cobre `Storage.markRegistroDeleted`, recalculo operacional e `updateGlobalHeader` a partir do clique do card.
- Fluxo end-to-end real de edit ainda nao cobre a navegacao completa ate o preenchimento do Registro, apenas o contrato de action/id.
- PDF/WhatsApp seguem cobertos por contrato de atributo e handlers; nao ha E2E visual/browser do compartilhamento a partir do card.

Proximo CP recomendado: **CP-C - pre-split render/timeline**.

Justificativa: com o contrato dedicado de actions dos cards criado, o proximo corte seguro e reduzir o tamanho e a mistura de responsabilidades do render/timeline sem mover integracoes de Registro/PDF/WhatsApp.

## 13. CP-C - Pre-split render/timeline

- CP-C aplicado.
- `renderHist` permaneceu em `src/ui/views/historico.js`.
- `deleteReg`, `setHistClienteFilter` e `clearHistClienteFilter` permaneceram no mesmo modulo.
- Nenhum React page, handler, viewModel, contrato, CSS ou schema foi alterado.
- Nenhuma mudanca funcional intencional.
- Contrato CP-B preservado.
- LOC `src/ui/views/historico.js`: 1652 -> 1814, delta +162.

| Bloco render/timeline | Responsabilidade separada                                                        | Helper local criado                                             |
| --------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| State/base de render  | Le `getState`, normaliza arrays e limpa assinaturas orfas                        | `buildHistoricoRenderState`                                     |
| Filtros atuais        | Le DOM/cache/session, normaliza `busca`, `filtEq`, `filtSetor`, `period`, `tipo` | `buildHistoricoRenderFilters`                                   |
| View model principal  | Chama `buildHistoricoViewModel` e preserva `clienteFilter`/PMOC                  | `buildHistoricoRenderViewModel`                                 |
| Ilha de filtros       | Prepara/monta `HistoricoFilters` com generation guard                            | `renderHistoricoFiltersIsland`, `mountHistoricoFiltersIsland`   |
| Contexto da timeline  | Monta mapas, resumo do dia, itens de atencao e `hasFilters`                      | `buildHistoricoTimelineRenderContext`                           |
| Pos-mount timeline    | Reanexa handlers, restaura scroll e aplica saved highlight/toast                 | `syncHistoricoAfterTimelineMount`                               |
| Ilha timeline         | Centraliza chamada a `mountHistoricoTimelineReact` com generation guard          | `renderHistoricoTimelineIsland`, `mountHistoricoTimelineIsland` |
| Skeleton timeline     | Mantem `withSkeleton` e contagem baseada em `list.length`                        | `renderHistoricoTimelineWithSkeleton`                           |

Contratos preservados:

- `renderHist`, `deleteReg`, `setHistClienteFilter` e `clearHistClienteFilter`.
- Roots publicos `#timeline` e `#hist-filters-root`.
- Filtros publicos `hist-busca`, `hist-setor`, `hist-equip`, periodo e tipo.
- Timeline/cards, estados vazios e filtros ativos.
- `edit-reg`, `delete-reg`, `export-pdf`, `whatsapp-export`, `data-id` e `data-registro-id`.

Validacao inicial do CP-C:

- `npm run test -- src/__tests__/historicoCardActions.contract.test.js --reporter=dot`: passou, 1 arquivo / 3 testes.
- `npm run test -- src/__tests__/historicoCardActions.contract.test.js src/__tests__/historicoTimelineIsland.test.jsx src/__tests__/historicoTimelineLegacyRender.test.js src/__tests__/historicoView.test.js src/__tests__/historicoViewModel.test.js src/__tests__/historicoFiltersLegacyRender.test.js src/__tests__/historicoFiltersIsland.test.jsx src/__tests__/reportExportContracts.test.js src/__tests__/registroPdfWhatsappRegistroId.contract.test.js --reporter=dot`: passou, 9 arquivos / 75 testes.

Lacunas remanescentes:

- `historico.js` segue acima de 1000 LOC e ainda concentra handlers, filtros, delete e side effects de DOM.
- Os helpers criados ainda estao no mesmo arquivo; proximo corte deve decidir se ha helpers puros seguros para mover.
- Fluxos completos de edit/delete seguem cobertos por contratos parciais, nao por E2E do clique ate Registro/storage.

Proximo CP recomendado: **CP-D - mover helpers puros filtros/VM**.

Justificativa: apos o pre-split local, existem helpers de leitura/modelagem que podem ser classificados com mais seguranca antes de qualquer mexida em card actions ou integracao Registro/PDF.
