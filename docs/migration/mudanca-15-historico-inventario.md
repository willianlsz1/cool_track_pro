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

## 14. CP-D - Mover helpers puros filtros/VM

- CP-D aplicado.
- Modulo criado: `src/features/historico/render/renderHelpers.js`.
- Teste criado: `src/features/historico/__tests__/render/renderHelpers.test.js`.
- `renderHist`, `deleteReg`, `setHistClienteFilter` e `clearHistClienteFilter` permaneceram em `src/ui/views/historico.js`.
- Helpers com DOM, React, skeleton, listeners, Toast, scroll, cache/sessionStorage ou URL permaneceram no adapter.
- Nenhum React page, handler, viewModel existente, Registro, Relatorio/PDF, Equipamentos, CSS ou schema foi alterado.
- Nenhuma mudanca funcional intencional.
- Contrato CP-B preservado.
- LOC `src/ui/views/historico.js`: 1814 -> 1758, delta -56.
- LOC `src/features/historico/render/renderHelpers.js`: criado com 78 LOC.

| Helper CP-C                           | Usa DOM/React/skeleton? | Usa storage/cache/URL? | Usa Toast/scroll/listeners? | Puro/baixo risco? | Movido neste CP? | Estrategia                                                              |
| ------------------------------------- | ----------------------- | ---------------------- | --------------------------- | ----------------- | ---------------- | ----------------------------------------------------------------------- |
| `buildHistoricoRenderState`           | Nao                     | Nao                    | Nao                         | Sim               | Sim              | Recebe `state` por parametro; cleanup de assinatura ficou no adapter    |
| `buildHistoricoRenderFilters`         | Sim                     | Sim                    | Nao                         | Nao               | Nao              | Mantido por ler DOM/cache local e filtros de sessao                     |
| `buildHistoricoRenderViewModel`       | Nao                     | Nao                    | Nao                         | Sim               | Sim              | Recebe VM, clienteFilter e callback PMOC por parametros explicitos      |
| `renderHistoricoFiltersIsland`        | Sim                     | Nao                    | Nao                         | Nao               | Nao              | Mantido por montar ilha React e bridge                                  |
| `buildHistoricoTimelineRenderContext` | Nao                     | Nao                    | Nao                         | Sim               | Sim              | Recebe callbacks de resumo/atencao e monta mapas/flags sem side effects |
| `renderHistoricoTimelineWithSkeleton` | Sim                     | Nao                    | Nao                         | Nao               | Nao              | Mantido por depender de `withSkeleton` e render React                   |
| `renderHistoricoTimelineIsland`       | Sim                     | Nao                    | Sim                         | Nao               | Nao              | Mantido por bridge React e pos-render                                   |
| `syncHistoricoAfterTimelineMount`     | Sim                     | Nao                    | Sim                         | Nao               | Nao              | Mantido por listeners, scroll, saved highlight e Toast                  |

Helpers movidos:

| Helper                                | Origem                      | Destino                                          | DI/parametros                                                          | Motivo de seguranca                          |
| ------------------------------------- | --------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------- |
| `buildHistoricoRenderState`           | `src/ui/views/historico.js` | `src/features/historico/render/renderHelpers.js` | `state`                                                                | Apenas normaliza arrays e preserva colecoes  |
| `buildHistoricoRenderViewModel`       | `src/ui/views/historico.js` | `src/features/historico/render/renderHelpers.js` | colecoes, filtros, `clienteFilter`, VM e callback PMOC                 | Prepara chamada ao VM sem DOM/storage/render |
| `buildHistoricoTimelineRenderContext` | `src/ui/views/historico.js` | `src/features/historico/render/renderHelpers.js` | colecoes, filtros, `isProMode`, `getTodaySummary`, `getAttentionItems` | Monta mapas, resumos e flags sem mutar UI    |

Validacao inicial do CP-D:

- `npm run test -- src/features/historico/__tests__/render/renderHelpers.test.js src/__tests__/historicoCardActions.contract.test.js --reporter=dot`: passou, 2 arquivos / 7 testes.

Lacunas remanescentes:

- `historico.js` segue acima de 1000 LOC e ainda concentra filtros DOM, bridges React, handlers, delete e side effects.
- `buildHistoricoRenderFilters` ainda mistura DOM/cache/sessionStorage; precisa de corte proprio se houver contrato suficiente.
- Card actions/edit/delete/PDF/WhatsApp ainda permanecem acoplados por handlers globais e atributos DOM.

Proximo CP recomendado: **CP-E - pre-split card actions**.

Justificativa: apos mover os helpers puros de render/VM, o maior acoplamento restante com risco direto ao usuario esta em actions por card e delegation no adapter. O contrato CP-B ja protege os atributos publicos, entao o proximo corte seguro e separar localmente essa responsabilidade sem mover handlers globais.

## 15. CP-E - Pre-split card actions

- CP-E aplicado.
- Card actions permaneceram em `src/ui/views/historico.js`.
- `deleteReg`, `renderHist`, `setHistClienteFilter` e `clearHistClienteFilter` permaneceram no adapter.
- Nenhum React page, handler global, viewModel, Registro, Relatorio/PDF, WhatsApp/share, Equipamentos, CSS ou schema foi alterado.
- Nenhuma mudanca funcional intencional.
- Contrato CP-B preservado.
- LOC `src/ui/views/historico.js`: 1758 -> 1773, delta +15.

| Ordem | Bloco card actions                  | Responsabilidade                                                                  | Dependencias                                             | Side effects                                       | Helper local                      |
| ----: | ----------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------- | --------------------------------- |
|     1 | Evento click/keydown no `#timeline` | Delegar menu kebab dos cards com gate `dataset.histBound`                         | DOM do card, `data-hist-action="toggle-card-menu"`       | Abre/fecha menu e altera `aria-expanded`           | `bindHistoricoCardMenuDelegation` |
|     2 | Fechar menus                        | Centralizar fechamento dos menus de card                                          | `.hist-item-actions__menu`, toggles                      | Muta `hidden` e `aria-expanded`                    | `closeHistoricoCardMenus`         |
|     3 | Toggle menu                         | Alternar o menu do card clicado e fechar os demais                                | Toggle, menu pai                                         | Muta DOM visual do menu                            | `toggleHistoricoCardMenu`         |
|     4 | Click de menu                       | Resolver target do click e tratar click fora do menu                              | `event.target.closest`                                   | `preventDefault` no toggle e fechamento de menus   | `handleHistoricoCardMenuClick`    |
|     5 | Escape                              | Fechar menu aberto e devolver foco ao toggle                                      | `keydown`, menu aberto                                   | Muta DOM e foco                                    | `handleHistoricoCardMenuKeydown`  |
|     6 | Foto/assinatura locais              | Isolar actions locais `hist-open-photo` e `hist-view-signature`                   | `Photos`, `SignatureViewerModal`, registros/equipamentos | Abre lightbox/viewer                               | `bindHistoricoCardLocalActions`   |
|     7 | Actions globais                     | Preservar `edit-reg`, `delete-reg`, `export-pdf`, `whatsapp-export` por atributos | Handlers globais, `data-id`, `data-registro-id`          | Navegacao, delete, PDF/WhatsApp fora deste adapter | Nao alterado                      |

Helpers locais criados/ajustados:

| Helper                            | Responsabilidade                                                 | Observacao                                           |
| --------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| `closeHistoricoCardMenus`         | Fecha todos os menus de card e reseta `aria-expanded`            | Extrai duplicacao do click fora/toggle               |
| `toggleHistoricoCardMenu`         | Alterna o menu do card clicado preservando fechamento dos demais | Mantem ordem visual existente                        |
| `handleHistoricoCardMenuClick`    | Resolve click no toggle ou fora do menu                          | Mantem `preventDefault` apenas no toggle             |
| `handleHistoricoCardMenuKeydown`  | Trata `Escape` no menu aberto                                    | Preserva foco de retorno no toggle                   |
| `bindHistoricoCardMenuDelegation` | Registra listeners delegados no container uma unica vez          | Preserva gate `dataset.histBound`                    |
| `bindHistoricoCardLocalActions`   | Agrupa actions locais de foto e assinatura                       | Nao toca actions globais de edit/delete/PDF/WhatsApp |

Contratos preservados:

- `edit-reg`, `delete-reg`, `export-pdf`, `whatsapp-export`, `data-id`, `data-registro-id` e `data-hist-action`.
- `deleteReg`, `renderHist`, `setHistClienteFilter` e `clearHistClienteFilter`.
- Vinculo com Registro, Relatorio/PDF e WhatsApp/share via handlers globais.
- Contrato CP-B de card actions.

Validacao inicial do CP-E:

- `npm run test -- src/__tests__/historicoCardActions.contract.test.js --reporter=dot`: passou, 1 arquivo / 3 testes.

Lacunas remanescentes:

- `historico.js` segue acima de 1000 LOC e ainda concentra filtros DOM, bridges React, delete e side effects.
- Actions globais continuam acopladas por atributos DOM e handlers externos; este CP apenas separou a delegacao local.
- Fluxos completos Historico -> Registro e Historico -> PDF/WhatsApp ainda merecem mapeamento dedicado antes de mover responsabilidades.

Proximo CP recomendado: **CP-F - mover helpers seguros de card actions**.

Justificativa: os helpers locais criados no CP-E separam responsabilidades sem mudar comportamento. O proximo corte seguro e classificar quais desses helpers sao apenas DOM/menu local e podem sair para modulo scoped, mantendo `deleteReg` e handlers globais no adapter.

## 16. CP-F - Mover helpers seguros de card actions

- CP-F aplicado.
- Modulo criado: `src/features/historico/actions/cardMenuHelpers.js`.
- Teste criado: `src/features/historico/__tests__/actions/cardMenuHelpers.test.js`.
- Helpers seguros de menu movidos: `closeHistoricoCardMenus` e `toggleHistoricoCardMenu`.
- `deleteReg`, `renderHist`, `setHistClienteFilter` e `clearHistClienteFilter` permaneceram no adapter `src/ui/views/historico.js`.
- Handlers com eventos/listeners/foco/modal permaneceram no adapter.
- Nenhum React page, handler global, viewModel, Registro, Relatorio/PDF, WhatsApp/share, Equipamentos, CSS ou schema foi alterado.
- Nenhuma mudanca funcional intencional.
- Contrato CP-B preservado.
- LOC `src/ui/views/historico.js`: 1773 -> 1758, delta -15.
- LOC `src/features/historico/actions/cardMenuHelpers.js`: criado com 35 LOC.

| Helper CP-E                       | Usa DOM direto?                     | Usa listeners/event/focus? | Usa modal/Photos/Signature? | Puro/baixo risco? | Movido neste CP? | Estrategia                                                                 |
| --------------------------------- | ----------------------------------- | -------------------------- | --------------------------- | ----------------- | ---------------- | -------------------------------------------------------------------------- |
| `closeHistoricoCardMenus`         | Sim, via container recebido         | Nao                        | Nao                         | Sim               | Sim              | Movido com DI por container e seletores opcionais                          |
| `toggleHistoricoCardMenu`         | Sim, via container/toggle recebidos | Nao                        | Nao                         | Sim               | Sim              | Movido mantendo fechamento previo dos demais menus e `aria-expanded`       |
| `handleHistoricoCardMenuClick`    | Sim                                 | Sim, usa event/closest     | Nao                         | Nao               | Nao              | Mantido no adapter por lidar com evento real e `preventDefault`            |
| `handleHistoricoCardMenuKeydown`  | Sim                                 | Sim, usa teclado/foco      | Nao                         | Nao               | Nao              | Mantido no adapter por gerenciar `Escape` e retorno de foco                |
| `bindHistoricoCardMenuDelegation` | Sim                                 | Sim, registra listeners    | Nao                         | Nao               | Nao              | Mantido no adapter por registrar listeners delegados e `dataset.histBound` |
| `bindHistoricoCardLocalActions`   | Sim                                 | Sim, registra listeners    | Sim                         | Nao               | Nao              | Mantido no adapter por abrir Photos/lightbox e SignatureViewerModal        |

Helpers movidos:

| Helper                    | Origem                      | Destino                                             | DI/parametros                              | Motivo de seguranca                                      |
| ------------------------- | --------------------------- | --------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| `closeHistoricoCardMenus` | `src/ui/views/historico.js` | `src/features/historico/actions/cardMenuHelpers.js` | `container`, seletores opcionais           | Apenas fecha menus e reseta `aria-expanded` no container |
| `toggleHistoricoCardMenu` | `src/ui/views/historico.js` | `src/features/historico/actions/cardMenuHelpers.js` | `container`, `toggle`, seletores opcionais | Apenas alterna estado visual de menu sem listeners       |

Helpers mantidos no adapter:

| Helper                            | Motivo para manter                                   | Risco                                   | Proximo tratamento sugerido                      |
| --------------------------------- | ---------------------------------------------------- | --------------------------------------- | ------------------------------------------------ |
| `handleHistoricoCardMenuClick`    | Depende de evento real, `closest` e `preventDefault` | Mudanca pode quebrar delegation do menu | So mover apos contrato especifico de evento/menu |
| `handleHistoricoCardMenuKeydown`  | Depende de teclado e foco real                       | Regressao de acessibilidade do menu     | Manter ate haver teste dedicado de teclado/foco  |
| `bindHistoricoCardMenuDelegation` | Registra listeners e usa `dataset.histBound`         | Duplicacao/perda de listeners           | Manter no adapter enquanto delegation for local  |
| `bindHistoricoCardLocalActions`   | Abre Photos/lightbox e SignatureViewerModal          | Quebra de foto/assinatura dos cards     | Mapear fluxos locais antes de qualquer extracao  |

Contratos preservados:

- `edit-reg`, `delete-reg`, `export-pdf`, `whatsapp-export`, `data-id`, `data-registro-id` e `data-hist-action`.
- Menu kebab dos cards, Photos/lightbox e modal de assinatura.
- `deleteReg`, `renderHist`, `setHistClienteFilter` e `clearHistClienteFilter`.
- Contrato CP-B de card actions.

Validacao inicial do CP-F:

- `npm run test -- src/features/historico/__tests__/actions/cardMenuHelpers.test.js src/__tests__/historicoCardActions.contract.test.js --reporter=dot`: passou, 2 arquivos / 7 testes.

Lacunas remanescentes:

- `historico.js` segue acima de 1000 LOC e ainda concentra filtros DOM, bridges React, delete e side effects.
- Eventos de menu, foco, Photos/lightbox e assinatura ainda permanecem no adapter por terem side effects fortes.
- Fluxos completos Historico -> Registro e Historico -> PDF/WhatsApp ainda merecem mapeamento dedicado antes de mover responsabilidades.

Proximo CP recomendado: **CP-G - mapear Historico -> Registro**.

Justificativa: o contrato de atributos e a extracao segura dos helpers de menu reduzem risco local dos cards. O proximo maior acoplamento com impacto direto no usuario esta no caminho de editar/excluir registro a partir do Historico; mapear esse fluxo antes de mexer nele da mais de 90% de confianca para o proximo corte.

## 17. CP-G - Mapear Historico -> Registro

- CP-G aplicado.
- Historico detalhado consolidado em `docs/rewrite/checkpoints-recentes-resumo.md`.
- Nenhum `src/` alterado.
- Nenhum teste alterado.
- Integracao Historico -> Registro mapeada em modo read-only.
- Fluxos mapeados: `edit-reg`, `delete-reg`, `deleteReg`, navegacao para Registro, `editRegistroId`, `loadRegistroForEdit`, `clearRegistro`, `saveRegistro`, state/storage, confirmacao, re-render, header e Toast.
- Riscos e lacunas mapeados.
- LOC principais no CP-G:
  - `src/ui/views/historico.js`: 1758
  - `src/ui/views/registro.js`: 2099
  - `src/ui/controller/handlers/navigationHandlers.js`: 477
  - `src/ui/controller/handlers/registroHandlers.js`: 126
  - `src/ui/controller/routes.js`: arquivo real usado no lugar de `src/ui/routes.js`

Resumo do fluxo `edit-reg`:

| Etapa          | Estado atual                                                                                     | Risco                                       |
| -------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Card Historico | `data-action="edit-reg"` e `data-id` saem da timeline/card                                       | Registro errado se id quebrar               |
| Handler global | `navigationHandlers.js` chama `goTo('registro', { editRegistroId: el.dataset.id })`              | Sem id abre fluxo incorreto                 |
| Rota Registro  | `routes.js` executa `initRegistro(params)` e depois `loadRegistroForEdit(params.editRegistroId)` | Ordem precisa ser preservada                |
| Registro       | `loadRegistroForEdit` grava edit mode, preenche campos/checklist e ajusta actions                | Fallback silencioso se registro nao existir |

Resumo do fluxo `delete-reg/deleteReg`:

| Etapa          | Estado atual                                                                                                                               | Risco                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Card Historico | `data-action="delete-reg"` e `data-id` saem da timeline/card                                                                               | Delete pode mirar registro errado           |
| Handler global | `registroHandlers.js` abre `CustomConfirm.show` e chama `deleteReg(el.dataset.id)` se confirmado                                           | Confirmacao sem contrato dedicado           |
| `deleteReg`    | Marca queue remota, remove registro do state, recalcula equipamento, remove assinatura local, re-renderiza, atualiza header e mostra Toast | Fluxo multi-side-effect sem contrato focado |
| Storage/state  | `Storage.markRegistroDeleted` enfileira delete remoto; `setState` persiste snapshot local                                                  | Divergencia local/remota se alterar ordem   |

Lacunas remanescentes:

- Falta contrato dedicado Historico -> Registro para `edit-reg` chamando `goTo('registro', { editRegistroId })` a partir do card.
- Falta contrato dedicado para `delete-reg` com confirmacao `true/false`.
- Falta contrato de `deleteReg` cobrindo `Storage.markRegistroDeleted`, `setState`, recalculo de equipamento, assinatura local, `renderHist`, `updateGlobalHeader` e Toast no mesmo fluxo.
- Falta caso com filtro ativo depois de delete.
- Falta fallback explicito para id ausente/registro inexistente.

Validacao inicial do CP-G:

- Documental/read-only ate a criacao dos docs; testes e `npm run check` devem ser registrados no relatorio final do CP.

Proximo CP recomendado: **CP-H - contrato Historico -> Registro edit/delete**.

Justificativa: ha mais de 90% de confianca de que o proximo corte seguro deve ser contrato, nao refatoracao. O fluxo edit/delete cruza `HistoricoTimeline.jsx`, handlers globais, router, Registro adapter, `deleteReg`, state/storage, confirmacao, header e Toast. Sem um contrato focado, qualquer pre-split de `deleteReg` ou action de edicao pode quebrar registro alvo, delete remoto/local ou re-render de forma silenciosa.

## 18. CP-H - Contrato Historico -> Registro edit/delete

- CP-H aplicado.
- Teste criado: `src/__tests__/historicoRegistroIntegration.contract.test.js`.
- Nenhum codigo de producao alterado.
- Nenhum comportamento alterado.
- Contrato integrado Historico -> Registro criado para `edit-reg`, `delete-reg`, `data-id`, `goTo('registro', { editRegistroId })`, rota Registro, `loadRegistroForEdit`, confirmacao, `deleteReg`, state/storage, re-render, header e Toast.
- Contrato CP-B preservado e reforcado.

Contratos cobertos:

| Contrato Historico -> Registro | Cobertura adicionada                                                                                        | Lacuna reduzida                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `edit-reg`                     | Handler global navega para Registro com `editRegistroId` exatamente igual ao `data-id`                      | Ponte card/action -> Registro  |
| Rota Registro                  | `registerAppRoutes` chama `initRegistro(params)` antes de `loadRegistroForEdit(params.editRegistroId)`      | Ordem init -> load             |
| `delete-reg` cancelado         | `CustomConfirm.show` com labels/tone atuais e cancelamento sem `deleteReg`, state, storage ou Toast         | Gate de confirmacao            |
| `delete-reg` confirmado        | Confirmacao chama `deleteReg` com o `data-id` correto                                                       | Ponte action -> delete         |
| `deleteReg`                    | Cobre `Storage.markRegistroDeleted`, `setState`, recalculo de equipamento, assinatura local, render e Toast | Orquestracao multi-side-effect |
| Fallback                       | Id ausente em `edit-reg` e cancelamento sem id em `delete-reg` nao quebram o fluxo atual                    | Fallback silencioso atual      |

Lacunas remanescentes:

- Caso de delete com filtro ativo ainda nao esta coberto.
- Fallback de `deleteReg` confirmado com id ausente continua preservado como comportamento atual, mas nao foi aprofundado para evitar mudar logica neste CP.
- Fluxo Historico -> PDF/WhatsApp por card ainda precisa de mapeamento dedicado.

Validacao inicial do CP-H:

- `npm run test -- src/__tests__/historicoRegistroIntegration.contract.test.js --reporter=dot`: passou, 1 arquivo / 5 testes.

Proximo CP recomendado: **CP-I - pre-split deleteReg**.

Justificativa: o fluxo Historico -> Registro edit/delete agora tem contrato focado. O maior bloco remanescente de risco dentro do adapter e `deleteReg`, que ainda concentra storage, state, recalculo de equipamento, limpeza de assinatura, render, header e Toast; com o contrato CP-H, ha base suficiente para um pre-split local e conservador antes de qualquer extracao.

## 19. CP-I - Pre-split deleteReg

- CP-I aplicado.
- `deleteReg` permaneceu exportado em `src/ui/views/historico.js`.
- Nenhum modulo novo foi criado.
- Nenhum teste foi alterado.
- Nenhuma mudanca funcional intencional.
- Contrato CP-H preservado.
- Contrato CP-B preservado.
- LOC `src/ui/views/historico.js`: 1758 -> 1800, delta +42.

Ordem real preservada:

| Ordem | Bloco atual deleteReg         | Responsabilidade                                     | Dependencias                                     | Side effects                            | Helper criado                                 |
| ----: | ----------------------------- | ---------------------------------------------------- | ------------------------------------------------ | --------------------------------------- | --------------------------------------------- |
|     1 | Assinatura publica            | Receber `id` e manter API `deleteReg(id)`            | Handler `delete-reg`, testes CP-H                | Nenhum novo                             | `deleteReg` mantido                           |
|     2 | Persistencia de delete        | Marcar registro como removido no storage/sync        | `Storage.markRegistroDeleted`                    | Queue/persistencia de exclusao          | `persistHistoricoRegistroDeletion`            |
|     3 | Localizar registro alvo       | Encontrar registro removido no state anterior        | `prev.registros`, `id`                           | Nenhum                                  | `findHistoricoDeletedRegistro`                |
|     4 | Remover registro do state     | Montar lista de registros sem o id recebido          | `prev.registros`, `id`                           | Nenhum direto                           | `buildHistoricoRegistrosAfterDelete`          |
|     5 | Fallback registro inexistente | Preservar retorno `{ ...prev, registros: regs }`     | State anterior                                   | Remove apenas por filtro, sem recalculo | `buildHistoricoDeleteStateMutation`           |
|     6 | Registro restante do equip.   | Obter ultimo registro restante do equipamento        | `regs`, `reg.equipId`, ordenacao por `data`      | Nenhum                                  | `findHistoricoLastRegistroForEquipment`       |
|     7 | Recalculo de status           | Recalcular status operacional do equipamento afetado | `getOperationalStatus`, `Utils.daysDiff`, `last` | Nenhum direto                           | `buildHistoricoEquipmentAfterDelete`          |
|     8 | Atualizar equipamentos        | Aplicar novo status somente no equipamento afetado   | `prev.equipamentos`, `reg.equipId`, `regs`       | Nenhum direto                           | `recalculateHistoricoEquipamentosAfterDelete` |
|     9 | Aplicar state                 | Chamar `setState` com a mutacao preservada           | `setState`, `buildHistoricoDeleteStateMutation`  | Atualiza state local                    | `applyHistoricoDeleteStateMutation`           |
|    10 | Limpar assinatura local       | Remover `cooltrack-sig-${id}`                        | `localStorage`                                   | Remove artefato de assinatura           | `cleanupHistoricoDeleteArtifacts`             |
|    11 | Refresh pos-delete            | Re-renderizar Historico e atualizar header global    | `renderHist`, `updateGlobalHeader`               | Atualiza DOM/React/header               | `refreshHistoricoAfterDelete`                 |
|    12 | Feedback                      | Mostrar Toast atual de remocao                       | `Toast.warning`                                  | Exibe notificacao atual                 | `notifyHistoricoDeleteSuccess`                |

Helpers locais criados:

| Helper                                        | Responsabilidade                                             | Observacao                                             |
| --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| `persistHistoricoRegistroDeletion`            | Encapsula `Storage.markRegistroDeleted(id)`                  | Mantem ordem antes do state                            |
| `findHistoricoDeletedRegistro`                | Localiza o registro alvo no state anterior                   | Preserva busca por igualdade de `id`                   |
| `buildHistoricoRegistrosAfterDelete`          | Monta lista de registros apos remocao                        | Preserva `filter((r) => r.id !== id)`                  |
| `findHistoricoLastRegistroForEquipment`       | Resolve ultimo registro restante do equipamento              | Preserva sort descendente por `data.localeCompare`     |
| `buildHistoricoEquipmentAfterDelete`          | Recalcula status/descricao do equipamento afetado            | Preserva fallback `unknown` para status anterior ou ok |
| `recalculateHistoricoEquipamentosAfterDelete` | Aplica recalculo somente no equipamento do registro removido | Mantem demais equipamentos intactos                    |
| `buildHistoricoDeleteStateMutation`           | Monta o proximo state para `setState`                        | Preserva fallback de registro inexistente              |
| `applyHistoricoDeleteStateMutation`           | Aplica mutacao via `setState`                                | Mantem side effect no adapter                          |
| `cleanupHistoricoDeleteArtifacts`             | Remove assinatura local vinculada ao id                      | Preserva chave `cooltrack-sig-${id}`                   |
| `refreshHistoricoAfterDelete`                 | Executa `renderHist` e `updateGlobalHeader`                  | Mantem ordem pos-delete                                |
| `notifyHistoricoDeleteSuccess`                | Exibe Toast de sucesso/remocao                               | Texto preservado                                       |

Contratos preservados:

- `deleteReg`, `delete-reg`, `data-id`, state/storage, recalculo de equipamento/status, re-render pos-delete, header/global refresh e Toast.
- Fallback atual para id ausente e registro inexistente.
- Contrato CP-H de Historico -> Registro.
- Contrato CP-B de card actions.

Validacao inicial do CP-I:

- `npm run test -- src/__tests__/historicoRegistroIntegration.contract.test.js --reporter=dot`: passou, 1 arquivo / 5 testes.

Lacunas remanescentes:

- `deleteReg` ainda permanece no adapter e ainda executa side effects locais, por escopo deste CP.
- Helpers de delete ainda nao foram classificados para extracao segura.
- Fluxo Historico -> PDF/WhatsApp por card ainda precisa de mapeamento dedicado.

Proximo CP recomendado: **CP-J - mover helpers seguros de deleteReg**.

Justificativa: o pre-split local deixou as responsabilidades do delete separadas e protegidas pelo contrato CP-H. O proximo corte seguro e classificar quais helpers de modelagem/state podem sair sem levar `Storage`, `setState`, `localStorage`, render, header ou Toast para fora do adapter.

## 20. CP-J - Mover helpers seguros de deleteReg

- CP-J aplicado.
- Modulo criado: `src/features/historico/delete/deleteHelpers.js`.
- Teste criado: `src/features/historico/__tests__/delete/deleteHelpers.test.js`.
- Helpers seguros de delete movidos para modulo scoped de Historico.
- `deleteReg`, `Storage`, `setState`, `localStorage`, `renderHist`, `updateGlobalHeader`, `Toast` e `handleError` permaneceram no adapter `src/ui/views/historico.js`.
- Nenhuma mudanca funcional intencional.
- Contrato CP-H preservado.
- Contrato CP-B preservado.
- LOC `src/ui/views/historico.js`: 1619 -> 1586, delta -33.
- LOC `src/features/historico/delete/deleteHelpers.js`: criado com 44 LOC.

Classificacao dos helpers CP-I:

| Helper CP-I                                   | Usa Storage/setState/localStorage? | Usa render/header/Toast? | Usa status/equipamento?                  | Puro/baixo risco? | Movido neste CP? | Estrategia                                                     |
| --------------------------------------------- | ---------------------------------- | ------------------------ | ---------------------------------------- | ----------------- | ---------------- | -------------------------------------------------------------- |
| `persistHistoricoRegistroDeletion`            | Sim, `Storage`                     | Nao                      | Nao                                      | Nao               | Nao              | Mantido no adapter por persistencia/queue de delete            |
| `findHistoricoDeletedRegistro`                | Nao                                | Nao                      | Nao                                      | Sim               | Sim              | Movido como busca pura em array                                |
| `buildHistoricoRegistrosAfterDelete`          | Nao                                | Nao                      | Nao                                      | Sim               | Sim              | Movido como filtro puro por id                                 |
| `findHistoricoLastRegistroForEquipment`       | Nao                                | Nao                      | Sim, por `equipId`                       | Sim               | Sim              | Movido como selecao pura do registro mais recente              |
| `buildHistoricoEquipmentAfterDelete`          | Nao                                | Nao                      | Sim, calcula status com callbacks        | Sim               | Sim              | Movido com DI explicita de `getOperationalStatus` e `daysDiff` |
| `recalculateHistoricoEquipamentosAfterDelete` | Nao                                | Nao                      | Sim, recalcula equipamento afetado       | Sim               | Sim              | Movido como transformacao pura de arrays com DI                |
| `buildHistoricoDeleteStateMutation`           | Nao                                | Nao                      | Sim, monta proximo state de equipamentos | Sim               | Sim              | Movido como builder puro de proximo state, sem `setState`      |
| `applyHistoricoDeleteStateMutation`           | Sim, `setState`                    | Nao                      | Sim                                      | Nao               | Nao              | Mantido no adapter por aplicar mutacao no state                |
| `cleanupHistoricoDeleteArtifacts`             | Sim, `localStorage`                | Nao                      | Nao                                      | Nao               | Nao              | Mantido no adapter por side effect de assinatura local         |
| `refreshHistoricoAfterDelete`                 | Nao                                | Sim, render/header       | Nao                                      | Nao               | Nao              | Mantido no adapter por re-render/header                        |
| `notifyHistoricoDeleteSuccess`                | Nao                                | Sim, `Toast`             | Nao                                      | Nao               | Nao              | Mantido no adapter por feedback visual                         |

Helpers movidos:

| Helper                                        | Origem                      | Destino                                          | DI/parametros                                        | Por que era seguro mover                              |
| --------------------------------------------- | --------------------------- | ------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------- |
| `findHistoricoDeletedRegistro`                | `src/ui/views/historico.js` | `src/features/historico/delete/deleteHelpers.js` | `registros`, `id`                                    | Busca pura sem state/storage                          |
| `buildHistoricoRegistrosAfterDelete`          | `src/ui/views/historico.js` | `src/features/historico/delete/deleteHelpers.js` | `registros`, `id`                                    | Filtro puro sem side effects                          |
| `findHistoricoLastRegistroForEquipment`       | `src/ui/views/historico.js` | `src/features/historico/delete/deleteHelpers.js` | `registros`, `equipId`                               | Seleciona ultimo registro sem tocar adapter           |
| `buildHistoricoEquipmentAfterDelete`          | `src/ui/views/historico.js` | `src/features/historico/delete/deleteHelpers.js` | `eq`, `last`, `{ getOperationalStatus, daysDiff }`   | Calculo isolado com dependencias explicitas           |
| `recalculateHistoricoEquipamentosAfterDelete` | `src/ui/views/historico.js` | `src/features/historico/delete/deleteHelpers.js` | `equipamentos`, `registros`, `deletedRegistro`, deps | Transforma arrays e altera apenas equipamento afetado |
| `buildHistoricoDeleteStateMutation`           | `src/ui/views/historico.js` | `src/features/historico/delete/deleteHelpers.js` | `prev`, `id`, deps                                   | Monta proximo state sem aplicar `setState`            |

Helpers mantidos no adapter:

| Helper                              | Motivo para manter                      | Risco se mover agora                   | Proximo tratamento sugerido                        |
| ----------------------------------- | --------------------------------------- | -------------------------------------- | -------------------------------------------------- |
| `persistHistoricoRegistroDeletion`  | Usa `Storage.markRegistroDeleted`       | Espalhar persistencia/queue de delete  | Manter ate haver contrato de persistencia dedicado |
| `applyHistoricoDeleteStateMutation` | Usa `setState`                          | Alterar ordem/aplicacao de state       | Manter como ponte adapter -> helper puro           |
| `cleanupHistoricoDeleteArtifacts`   | Usa `localStorage`                      | Quebrar limpeza de assinatura local    | Mapear assinatura/midia antes de extrair           |
| `refreshHistoricoAfterDelete`       | Usa `renderHist` e `updateGlobalHeader` | Regressao de refresh/header pos-delete | Manter no adapter                                  |
| `notifyHistoricoDeleteSuccess`      | Usa `Toast.warning`                     | Regressao de feedback visual           | Manter no adapter                                  |

Contratos preservados:

- `deleteReg`, `delete-reg`, `data-id`, state/storage, recalculo de equipamento/status, re-render pos-delete, header/global refresh e Toast.
- Fallback atual para id ausente e registro inexistente.
- Contrato CP-H de Historico -> Registro.
- Contrato CP-B de card actions.

Testes adicionados/rodados:

- `src/features/historico/__tests__/delete/deleteHelpers.test.js`: 7 testes cobrindo busca do registro, remocao por id, ultimo registro por equipamento, recalculo de status via DI, mutacao pura de state e ausencia de imports proibidos.
- `npm run test -- src/features/historico/__tests__/delete/deleteHelpers.test.js src/__tests__/historicoRegistroIntegration.contract.test.js --reporter=dot`: passou, 2 arquivos / 12 testes.

Lacunas remanescentes:

- `deleteReg` continua no adapter por concentrar side effects reais.
- Persistencia remota/local, assinatura, render/header e Toast seguem sem extracao por escopo e risco.
- Fluxo Historico -> PDF/WhatsApp por card ainda precisa de mapeamento dedicado.

Proximo CP recomendado: **CP-K - mapear Historico -> PDF/WhatsApp**.

Justificativa: os helpers seguros de delete ja foram extraidos e o contrato Historico -> Registro permanece protegido. O maior acoplamento funcional ainda sem mapa dedicado na Mudanca 15 e o caminho de exportacao por card para PDF/WhatsApp, que cruza atributos publicos, handlers e contratos do Relatorio/PDF.

## 21. CP-K - Mapear Historico -> PDF/WhatsApp

- CP-K aplicado.
- Historico detalhado consolidado em `docs/rewrite/checkpoints-recentes-resumo.md`.
- Nenhum `src/` alterado.
- Nenhum teste alterado.
- Integracao Historico -> PDF/WhatsApp mapeada em modo read-only.
- Fluxos mapeados: `export-pdf`, `whatsapp-export`, `data-registro-id`, `CardActions`, `reportExportHandlers`, `buildReportFilters`, `filters.registroId`, `PDFGenerator`, `shareReportPdf`, Web Share/upload/fallback e contratos da Mudanca 13.
- LOC principais no CP-K:
  - `src/ui/views/historico.js`: 1586
  - `src/react/pages/HistoricoTimeline.jsx`: 453
  - `src/react/components/CardActions.jsx`: 68
  - `src/ui/controller/handlers/reportExportHandlers.js`: 727
  - `src/domain/pdf/reportModel.js`: 76
  - `src/domain/pdf.js`: 177
  - `src/domain/pdf/shareReport.js`: 319

Resumo do fluxo `export-pdf`:

| Etapa          | Estado atual                                                                                        | Risco                                               |
| -------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Card Historico | `HistoricoTimeline.jsx` passa `item.id` para `<CardActions registroId={item.id} />`                 | Card sem id perde export por registro               |
| Action PDF     | `CardActions.jsx` renderiza `data-action="export-pdf"` e `data-registro-id={registroId}`            | Sem `data-registro-id`, handler usa filtros globais |
| Handler global | `reportExportHandlers.js` registra `on('export-pdf')` e chama `exportPdfFlow`                       | Handler e compartilhado com Relatorio               |
| Filtros        | `getReportFilters` le `triggerEl?.dataset?.registroId`; `buildReportFilters` normaliza `registroId` | `registroId` nao pode ser sobrescrito por filtros   |
| Dominio PDF    | `filterRegistrosForReport` prioriza `registroId`; `PDFGenerator` gera Blob/download                 | PDF errado se prioridade mudar                      |

Resumo do fluxo `whatsapp-export`:

| Etapa          | Estado atual                                                                                       | Risco                                        |
| -------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Card Historico | Mesmo `CardActions` renderiza `data-action="whatsapp-export"` e `data-registro-id={registroId}`    | Share pode mirar registro errado             |
| Handler global | `on('whatsapp-export')` chama `shareWhatsAppFlow` com filtros vindos do trigger                    | Handler mistura quota, PDF, share e feedback |
| PDF para share | `shareWhatsAppFlow` gera PDF Blob via `PDFGenerator.generateMaintenanceReport({ asBlob: true })`   | Divergencia entre PDF download e PDF share   |
| Texto/metadata | `WhatsAppExport.generateText(filters)` e `shareReportPdf` recebem `registroId` em filtros/metadata | Texto, PDF e metadata podem divergir         |
| Fallback share | `shareReportPdf` tenta Web Share, upload + `wa.me` e fallback download local se upload falhar      | Comportamento sensivel ao ambiente/navegador |

Riscos/lacunas mapeados:

- Falta contrato integrado Historico -> PDF/WhatsApp partindo de card real ate `generateMaintenanceReport`/`shareReportPdf`.
- Falta caso explicito de filtros globais ativos coexistindo com `data-registro-id` vindo do Historico.
- `reportExportHandlers.js` segue acima de 700 LOC e mistura DOM, quota, PDF, share, Toast, router e telemetria.
- `CardActions` e compartilhado por Historico e Relatorio; alteracao local pode quebrar ambos.
- Fallback Web Share/upload/download depende de ambiente e continua sensivel.

Validacao inicial do CP-K:

- Documental/read-only ate a criacao dos docs; testes e `npm run check` devem ser registrados no relatorio final do CP.

Proximo CP recomendado: **CP-L - contrato integrado Historico -> PDF/WhatsApp**.

Justificativa: ha mais de 90% de confianca de que o proximo passo seguro deve ser contrato, nao refatoracao. Os contratos atuais cobrem partes do fluxo, mas ainda falta a ponte integrada card Historico -> handler global -> `filters.registroId` -> PDF/WhatsApp com filtros globais ativos.

## 22. CP-L - Contrato integrado Historico -> PDF/WhatsApp

- CP-L aplicado.
- Teste criado: `src/__tests__/historicoPdfWhatsappIntegration.contract.test.js`.
- Contrato integrado Historico -> PDF/WhatsApp protegido sem alteracao de codigo de producao.
- Caminho PDF coberto: `HistoricoTimeline` -> `CardActions` -> `data-action="export-pdf"` -> handler global `reportExportHandlers` -> `buildReportFilters` -> `filters.registroId` -> `PDFGenerator.generateMaintenanceReport`.
- Caminho WhatsApp coberto: `HistoricoTimeline` -> `CardActions` -> `data-action="whatsapp-export"` -> handler global `reportExportHandlers` -> `buildReportFilters` -> `filters.registroId` -> `PDFGenerator.generateMaintenanceReport` -> `WhatsAppExport.generateText` -> `shareReportPdf`.
- Filtros globais ativos (`#rel-equip`, `#rel-de`, `#rel-ate`) cobertos junto com `data-registro-id` do card para garantir que `registroId` nao seja perdido.
- Simetria PDF vs WhatsApp coberta: ambos usam o mesmo `data-registro-id` do mesmo card.
- Fallback com dados opcionais ausentes coberto: card minimal continua renderizando `export-pdf` e `whatsapp-export` com `data-registro-id`.
- Nenhuma mudanca funcional intencional.
- Nenhum `src/` de producao alterado.
- Contrato CP-B preservado.
- Contratos da Mudanca 13 preservados.

Contratos adicionados/fortalecidos:

| Contrato Historico -> PDF/WhatsApp         | Lacuna antes                                           | Cobertura adicionada                                                                   |
| ------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `export-pdf` por card Historico            | Atributo e handler eram cobertos em testes separados   | Botao real de `HistoricoTimeline/CardActions` passa como `triggerEl` do handler global |
| `whatsapp-export` por card Historico       | Atributo e share eram cobertos em testes separados     | Botao real de `HistoricoTimeline/CardActions` passa como `triggerEl` do handler global |
| `data-registro-id` -> `filters.registroId` | Nao havia ponte integrada partindo do card renderizado | Teste verifica `registroId: "reg-1"` nas chamadas PDF e WhatsApp                       |
| Filtros ativos + registro do card          | Risco de filtros globais competirem com `registroId`   | Teste usa `#rel-equip`, `#rel-de`, `#rel-ate` ativos e preserva `registroId`           |
| Simetria PDF vs WhatsApp                   | Paridade coberta por partes, nao pelo mesmo card       | Teste confirma mesmo id em PDF e WhatsApp                                              |

Testes adicionados/rodados inicialmente:

- `src/__tests__/historicoPdfWhatsappIntegration.contract.test.js`: 3 testes cobrindo card -> PDF, card -> WhatsApp e fallback de dados opcionais ausentes.
- `npm run test -- src/__tests__/historicoPdfWhatsappIntegration.contract.test.js --reporter=dot`: passou, 1 arquivo / 3 testes.

Lacunas remanescentes:

- O teste usa mocks para quota/PDF/share e nao executa Web Share/upload real.
- Fallback de ausencia de `data-registro-id` permanece coberto indiretamente por handler/filtros existentes, nao por fluxo visual do Historico.
- `reportExportHandlers.js` segue concentrando DOM, quota, PDF, share, Toast, router e telemetria.
- Filtros do Historico ainda nao foram mapeados como tema proprio da Mudanca 15.

Proximo CP recomendado: **CP-M - pre-split export/share action no Historico**.

Justificativa: o contrato integrado reduziu a lacuna mais critica do fluxo PDF/WhatsApp por card. Com a ponte card -> handler -> `filters.registroId` protegida, o proximo corte seguro e separar localmente a orquestracao de actions export/share no adapter do Historico, sem mover handlers globais nem alterar `reportExportHandlers`.

## 23. CP-M - Pre-split export/share action no Historico

- CP-M aplicado como revisao de pre-split minimo.
- Decisao: nenhum helper novo foi criado em `src/ui/views/historico.js`, porque nao ha logica local real de `export-pdf`/`whatsapp-export` no adapter do Historico para separar.
- `src/ui/views/historico.js` permanece sem handlers locais para `export-pdf`, `whatsapp-export`, `data-registro-id`, `exportPdfFlow`, `shareWhatsAppFlow` ou `reportExportHandlers`.
- Ponte preservada: `HistoricoTimeline.jsx` passa `item.id` para `<CardActions registroId={item.id} />`; `CardActions.jsx` renderiza `data-action="export-pdf"` e `data-action="whatsapp-export"` com `data-registro-id`; `reportExportHandlers.js` consome o trigger global e monta `filters.registroId`.
- Nenhuma mudanca funcional intencional.
- Nenhum `src/` alterado.
- Contrato CP-L preservado.
- Contrato CP-B preservado.
- LOC `src/ui/views/historico.js`: 1586 -> 1586, delta 0.

Ordem real revisada:

| Ordem | Bloco export/share action | Responsabilidade                                            | Dependencias                                           | Side effects              | Decisao CP-M                  |
| ----: | ------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ | ------------------------- | ----------------------------- |
|     1 | Origem no card            | `HistoricoTimeline.jsx` renderiza item da timeline          | `item.id` vindo do view model                          | DOM React                 | Sem alteracao                 |
|     2 | `CardActions`             | Renderiza CTAs `export-pdf` e `whatsapp-export`             | `registroId` prop                                      | DOM attrs                 | Sem alteracao                 |
|     3 | `data-registro-id`        | Transporta id do registro alvo                              | `data-registro-id={registroId}`                        | Nenhum direto             | Sem alteracao                 |
|     4 | Adapter Historico         | Nao intercepta export/share                                 | Apenas handlers locais de foto/assinatura/menu/filtros | Nenhum para PDF/WhatsApp  | Nao criar helper artificial   |
|     5 | Handler global            | `reportExportHandlers` consome `data-action` global         | `core/events`, `triggerEl.dataset.registroId`          | Quota, PDF, share, Toast  | Fora do escopo; sem alteracao |
|     6 | Filtros do relatorio      | `buildReportFilters` preserva `filters.registroId`          | `#rel-*`, `triggerEl`                                  | Leitura DOM               | Protegido por CP-L            |
|     7 | PDF/WhatsApp              | `exportPdfFlow` e `shareWhatsAppFlow` usam o mesmo registro | `PDFGenerator`, `WhatsAppExport`, `shareReportPdf`     | Blob/download/share/quota | Protegido por CP-L            |

Contratos preservados:

- `export-pdf`, `whatsapp-export`, `data-registro-id`, `filters.registroId`, `CardActions`, `HistoricoTimeline`, `reportExportHandlers/buildReportFilters`, `exportPdfFlow` e `shareWhatsAppFlow`.
- Filtros ativos nao sobrescrevem `registroId`.
- Simetria PDF vs WhatsApp no mesmo card.
- Fallback com dados opcionais ausentes.

Testes rodados:

- `npm run test -- src/__tests__/historicoPdfWhatsappIntegration.contract.test.js --reporter=dot`
- `npm run test -- src/__tests__/historicoCardActions.contract.test.js src/__tests__/reportExportContracts.test.js src/__tests__/registroPdfWhatsappRegistroId.contract.test.js src/__tests__/reportExportHandlers.test.js src/__tests__/whatsappExport.test.js src/features/historico/__tests__/actions/cardMenuHelpers.test.js src/features/historico/__tests__/render/renderHelpers.test.js src/features/historico/__tests__/delete/deleteHelpers.test.js --reporter=dot`
- `npm run test -- src/__tests__ --reporter=dot`

Lacunas remanescentes:

- `reportExportHandlers.js` segue concentrando quota, PDF, share, Toast, router, preview e telemetria.
- Filtros do Historico ainda nao foram mapeados como tema proprio.
- Como nao existe logica local de export/share em `historico.js`, qualquer proximo pre-split nessa area deve mirar filtros ou handler global, nao o adapter do Historico.

Proximo CP recomendado: **CP-N - mapear filtros Historico**.

Justificativa: o caminho PDF/WhatsApp por card esta protegido por CP-L e nao possui logica local suficiente no adapter para novo corte seguro. O maior acoplamento restante dentro do Historico esta nos filtros DOM/cache/estado, que devem ser mapeados antes de qualquer pre-split.

## 24. CP-N - Mapeamento filtros Historico

- CP-N aplicado em modo read-only + documentacao.
- Historico detalhado consolidado em `docs/rewrite/checkpoints-recentes-resumo.md`.
- Nenhum `src/` alterado.
- Nenhum teste alterado.
- Filtros do Historico mapeados: DOM, cache local `_histFilterValues`, `sessionStorage`, URL/query params, React filters island, filters sheet, view model, timeline, reset/clear e interacao indireta com export/report.
- CP-M preservado: fluxo PDF/WhatsApp continua sem logica local no adapter do Historico.
- Contratos publicos mapeados: `#hist-busca`, `#hist-equip`, `#hist-setor`, `#hist-filters-trigger`, `#hist-filters-count`, `#hist-quickfilters-slot`, `#hist-active-chips-slot`, `data-hist-action`, `setHistClienteFilter`, `HISTORICO_PERIOD_OPTIONS`, `HISTORICO_TIPO_OPTIONS` e classes publicas.
- LOC principais confirmados:
  - `src/ui/views/historico.js`: 1586
  - `src/react/pages/HistoricoFilters.jsx`: 252
  - `src/react/pages/HistoricoTimeline.jsx`: 453
  - `src/ui/components/historicoFiltersSheet.js`: 251
  - `src/ui/viewModels/historicoViewModel.js`: 497
  - `src/ui/viewModels/historicoContracts.js`: 102

Resumo do fluxo de filtros:

| Etapa                | Responsabilidade                                                                 | Fonte real                                       | Risco principal                                    |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| URL inicial          | Hidratar `q`, `setor`, `equip`, `periodo`, `tipo` uma vez                        | `hydrateFiltersFromUrl` / `URLSearchParams`      | Deep link stale ou sobrescrito                     |
| DOM/cache            | Ler `#hist-busca`, `#hist-setor`, `#hist-equip` com fallback `_histFilterValues` | `getFilterValue`, `captureHistoricoFilterValues` | Cache local divergir do DOM                        |
| `sessionStorage`     | Persistir periodo/tipo e summary collapsed por sessao                            | `getExtraFilters`, `setExtraFilter`              | Filtro invisivel se storage/cache falhar           |
| React filters island | Renderizar header, busca, selects, quick filters e chips                         | `HistoricoFilters.jsx`                           | IDs/classes publicos quebrados                     |
| Sheet mobile         | Aplicar/resetar setor/equip/tipo em overlay legado                               | `HistoricoFiltersSheet.open`                     | Callbacks mexem em DOM/sessionStorage fora da ilha |
| View model           | Aplicar filtros e montar chips/lista/timeline data                               | `buildHistoricoViewModel`                        | Registro errado ou empty state indevido            |
| Timeline             | Renderizar lista filtrada e estados vazios                                       | `HistoricoTimeline.jsx`                          | Timeline stale apos filtro                         |

Testes/lacunas mapeados:

- Testes existentes: `historicoFiltersLegacyRender.test.js` (8), `historicoFiltersIsland.test.jsx` (7), `historicoFiltersSheet.test.js` (6), `historicoFiltersSheetIntegration.test.js` (4), `historicoFiltersSheetModel.test.js` (5), `historicoViewModel.test.js` (8), `historicoView.test.js` (27), `renderHelpers.test.js` (4).
- Lacunas remanescentes: contrato focado de URL/replaceState, fallback de `sessionStorage` indisponivel, contrato consolidado DOM/cache/sessionStorage/sheet/VM/timeline, navegacao real Clientes -> Historico com `setHistClienteFilter`, e filtro ativo do Historico combinado com export/report por card.

Riscos principais:

- Filtro errado por divergencia entre DOM/cache/view model.
- `_histFilterValues` e `sessionStorage` mantendo filtros invisiveis.
- `setHistClienteFilter` ficando preso apos navegacao/clear.
- Reset/clear parcial nao limpar a fonte real do filtro.
- URL hydrate/write sobrescrever estado do usuario.
- Timeline stale ou empty state indevido.
- Import circular se helpers de filtros forem movidos antes de separar DOM/cache.

Proximo CP recomendado: **CP-O - contrato consolidado filtros Historico**.

Justificativa: ha mais de 90% de confianca de que o proximo passo seguro deve ser contrato adicional. O fluxo de filtros mistura DOM, cache local, `sessionStorage`, URL, React island, sheet mobile e view model; pre-split antes de contrato consolidado teria risco alto de regressao silenciosa.

## 25. CP-O - Contrato consolidado filtros Historico

- CP-O aplicado.
- Teste criado: `src/__tests__/historicoFilters.contract.test.js`.
- Contrato consolidado de filtros protegido sem alteracao de codigo de producao.
- Caminhos cobertos: DOM publico (`#hist-busca`, `#hist-equip`, `#hist-setor`, `#hist-filters-trigger`, `#hist-filters-count`), `data-hist-action`, URL params, `sessionStorage`, cache `_histFilterValues`, `_clienteFilter` via `setHistClienteFilter`, sheet mobile, view model, timeline/cards, estado vazio e preservacao de `data-registro-id`.
- Nenhuma mudanca funcional intencional.
- Nenhum `src/` de producao alterado.
- Nenhum teste existente alterado.
- Contrato CP-L preservado: filtros ativos do Historico nao removem `data-registro-id` dos cards.

Contratos adicionados/fortalecidos:

| Contrato filtros Historico                      | Lacuna antes                                               | Cobertura adicionada                                                              |
| ----------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Roots DOM `#hist-busca/#hist-equip/#hist-setor` | Cobertura espalhada em testes legacy/island                | Teste consolidado valida roots no render de filtros                               |
| Trigger/count do sheet                          | Cobertura por componente, sem contrato consolidado         | Teste valida `#hist-filters-trigger` e `#hist-filters-count`                      |
| `data-hist-action` filtros/clear                | Cobertura fragmentada                                      | Teste valida quick filters de periodo/tipo e clear actions                        |
| URL params                                      | Lacuna focada de hydrate/write no contrato consolidado     | Teste hidrata `q`, `periodo`, `tipo`, `setor` e `equip` e verifica URL resultante |
| `sessionStorage`                                | Fallback indisponivel nao estava travado no contrato unico | Teste valida periodo/tipo e fallback com storage indisponivel                     |
| `_histFilterValues`                             | Cache de unmount/remount sem contrato dedicado consolidado | Teste preserva busca/setor/equip apos unmount/remount da ilha                     |
| `_clienteFilter` / `setHistClienteFilter`       | Integracao externa coberta por partes                      | Teste aplica cliente externo e limpa `clear-cliente-filter` sem estado invisivel  |
| Sheet mobile                                    | Sheet tinha testes proprios, mas nao amarrado ao contrato  | Teste aplica/reset sheet e verifica filtros/empty state                           |
| View model/timeline                             | Filtros e timeline cobertos em arquivos distintos          | Teste verifica itens renderizados e empty state apos filtros combinados           |
| Export/report por card                          | CP-L cobria report, mas nao dentro do contrato de filtros  | Teste confirma `data-registro-id` preservado em cards apos filtros/reset          |

Testes adicionados/rodados inicialmente:

- `src/__tests__/historicoFilters.contract.test.js`: 5 testes cobrindo roots DOM, actions publicas, URL/sessionStorage, cache `_histFilterValues`, fallback de storage indisponivel, `setHistClienteFilter`, sheet/reset, VM/timeline, estado vazio e preservacao de `data-registro-id`.
- `npm run test -- src/__tests__/historicoFilters.contract.test.js --reporter=dot`: passou, 1 arquivo / 5 testes.

Lacunas remanescentes:

- O teste usa mocks das ilhas React para focar o contrato do adapter; layout visual/pixel nao e exercitado.
- Navegacao real Clientes -> Historico ainda permanece fora do contrato consolidado.
- Web Share/PDF real nao e executado aqui; CP-L cobre a ponte Historico -> PDF/WhatsApp.
- `src/ui/views/historico.js` continua acima de 1000 LOC e concentra DOM/cache/sessionStorage/URL.

Proximo CP recomendado: **CP-P - pre-split filtros DOM/cache**.

Justificativa: o contrato consolidado agora protege as fontes mais sensiveis dos filtros. O proximo corte seguro e separar localmente DOM/cache/sessionStorage/URL dentro do adapter antes de qualquer movimentacao para feature modules.

## 26. CP-P - Pre-split filtros DOM/cache

- CP-P aplicado.
- Filtros DOM/cache/sessionStorage/URL permaneceram em `src/ui/views/historico.js`.
- Helpers locais criados para separar leitura DOM, cache `_histFilterValues`, escrita DOM, hydrate URL, sessao e clears.
- Nenhuma mudanca funcional intencional.
- Nenhum helper foi movido para feature.
- React pages, sheet, viewModels, Registro, Relatorio/PDF e Equipamentos nao foram alterados.
- Contrato CP-O preservado.
- LOC `src/ui/views/historico.js`: 1586 -> 1634, delta +48.

Ordem real preservada:

| Ordem | Bloco filtros DOM/cache | Responsabilidade                                                                 | Helper criado                                                                                                                     |
| ----: | ----------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
|     1 | URL inicial             | Ler `URLSearchParams` uma vez e aplicar em DOM/sessao                            | `readUrlFilters`, `applyHistoricoUrlFiltersToDom`, `applyHistoricoUrlFiltersToSession`, `hydrateFiltersFromUrl`                   |
|     2 | DOM/cache               | Ler `#hist-busca`, `#hist-setor`, `#hist-equip` com fallback `_histFilterValues` | `readHistoricoFilterDomValue`, `readHistoricoFilterDomValues`, `readHistoricoFilterCache`, `buildHistoricoDomCacheFilters`        |
|     3 | Cache                   | Atualizar `_histFilterValues` no render/unmount                                  | `writeHistoricoFilterCache`, `captureHistoricoFilterValues`                                                                       |
|     4 | Sessao                  | Ler/gravar periodo e tipo com fallback seguro                                    | `readHistoricoSessionFilters`, `writeHistoricoSessionFilter`, `getExtraFilters`, `setExtraFilter`, `clearHistoricoSessionFilters` |
|     5 | Consolidacao            | Montar filtros atuais para VM/render                                             | `buildHistoricoCurrentFilters`, `buildHistoricoRenderFilters`                                                                     |
|     6 | Sheet/clear handlers    | Aplicar/resetar DOM e sessionStorage sem mudar actions publicas                  | `setHistoricoDomFilterValue`, `clearHistoricoDomFilterValue`, `clearHistoricoMainFilterDomValues`                                 |
|     7 | Cliente externo         | Limpar `_clienteFilter` via API local existente                                  | `clearHistClienteFilter`                                                                                                          |
|     8 | VM/timeline/report      | Preservar timeline/cards e `data-registro-id`                                    | Sem alteracao de contrato                                                                                                         |

Contratos preservados:

- `#hist-busca`, `#hist-equip`, `#hist-setor`, `#hist-filters-trigger/count`.
- `data-hist-action` `hist-filter-*` e `hist-clear-*`.
- `setHistClienteFilter`, `_histFilterValues`, `_clienteFilter`.
- `sessionStorage`/URL params.
- Sheet mobile, view model/timeline e estado vazio.
- Export/report sem perder `data-registro-id`.

Testes rodados inicialmente:

- `npm run test -- src/__tests__/historicoFilters.contract.test.js --reporter=dot`: passou, 1 arquivo / 5 testes.

Lacunas remanescentes:

- Helpers continuam no adapter por escopo do CP.
- Filtros ainda dependem de DOM e `sessionStorage`; mover para feature exige classificar quais partes sao puras.
- `src/ui/views/historico.js` segue acima de 1000 LOC.

Proximo CP recomendado: **CP-Q - mover helpers puros de filtros**.

Justificativa: o pre-split separou responsabilidades locais sem alterar comportamento. O proximo passo seguro e classificar e mover somente helpers puros/baixo risco de filtros, mantendo DOM/sessionStorage/URL no adapter se houver duvida.

## 27. CP-Q - Mover helpers puros de filtros

- CP-Q aplicado.
- Modulo criado: `src/features/historico/filters/filterHelpers.js`.
- Teste criado: `src/features/historico/__tests__/filters/filterHelpers.test.js`.
- Apenas partes puras/baixo risco do fluxo de filtros foram movidas: normalizacao de cache, merge DOM/cache a partir de valores ja lidos, parsing de `URLSearchParams` recebido por parametro e montagem de filtros atuais para VM/cache.
- DOM, `sessionStorage`, URL real, cache local `_histFilterValues`, `_clienteFilter`, sheet mobile e side effects permaneceram em `src/ui/views/historico.js`.
- Nenhuma mudanca funcional intencional.
- React pages, sheet, viewModels, Registro, Relatorio/PDF e Equipamentos nao foram alterados.
- Contrato CP-O preservado.
- LOC `src/ui/views/historico.js`: 1634 -> 1621, delta -13.
- LOC `src/features/historico/filters/filterHelpers.js`: criado com 45 LOC.

Classificacao dos helpers CP-P:

| Helper CP-P                         | Usa DOM? | Usa cache local? | Usa sessionStorage/URL? | Movido neste CP? | Estrategia                                                                               |
| ----------------------------------- | -------- | ---------------- | ----------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `readHistoricoFilterDomValue`       | Sim      | Nao              | Nao                     | Nao              | Mantido no adapter por ler `document.getElementById`                                     |
| `readHistoricoFilterDomValues`      | Sim      | Nao              | Nao                     | Nao              | Mantido no adapter por compor leitura DOM                                                |
| `readHistoricoFilterCache`          | Nao      | Sim              | Nao                     | Nao              | Mantido no adapter por acessar `_histFilterValues`                                       |
| `writeHistoricoFilterCache`         | Nao      | Sim              | Nao                     | Parcial          | Side effect ficou no adapter; payload puro em `normalizeHistoricoFilterCache`            |
| `readHistoricoSessionFilters`       | Nao      | Nao              | Sim                     | Nao              | Mantido no adapter por acessar `sessionStorage` diretamente                              |
| `writeHistoricoSessionFilter`       | Nao      | Nao              | Sim                     | Nao              | Mantido no adapter por gravar `sessionStorage`                                           |
| `clearHistoricoSessionFilters`      | Nao      | Nao              | Sim                     | Nao              | Mantido no adapter por remover chaves de sessao                                          |
| `buildHistoricoCurrentFilters`      | Nao      | Sim              | Sim                     | Parcial          | Orquestracao ficou no adapter; montagem pura em `buildHistoricoCurrentFiltersFromValues` |
| `applyHistoricoUrlFiltersToDom`     | Sim      | Nao              | Nao                     | Nao              | Mantido no adapter por escrever DOM                                                      |
| `applyHistoricoUrlFiltersToSession` | Nao      | Nao              | Sim                     | Nao              | Mantido no adapter por gravar sessao                                                     |
| `setHistoricoDomFilterValue`        | Sim      | Nao              | Nao                     | Nao              | Mantido no adapter por escrever DOM                                                      |
| `clearHistoricoDomFilterValue`      | Sim      | Nao              | Nao                     | Nao              | Mantido no adapter por escrever DOM                                                      |
| `clearHistoricoMainFilterDomValues` | Sim      | Sim              | Sim                     | Nao              | Mantido no adapter por limpar DOM/cache/session via fluxo existente                      |

Helpers movidos/criados:

| Helper                                   | Destino                                           | Responsabilidade                                                     |
| ---------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| `normalizeHistoricoFilterCache`          | `src/features/historico/filters/filterHelpers.js` | Montar payload estavel para `_histFilterValues` sem acessar o cache  |
| `mergeHistoricoDomCacheFilters`          | `src/features/historico/filters/filterHelpers.js` | Preservar DOM como source-of-truth e usar cache quando DOM falta     |
| `parseHistoricoUrlFilters`               | `src/features/historico/filters/filterHelpers.js` | Ler params de objeto recebido, sem tocar `window/location`           |
| `buildHistoricoCurrentFiltersFromValues` | `src/features/historico/filters/filterHelpers.js` | Montar filtros de VM e payload de cache a partir de valores ja lidos |

Helpers mantidos no adapter:

- DOM: `readHistoricoFilterDomValue`, `readHistoricoFilterDomValues`, `setHistoricoDomFilterValue`, `clearHistoricoDomFilterValue`, `clearHistoricoMainFilterDomValues`.
- Cache local: `readHistoricoFilterCache`, side effect de `writeHistoricoFilterCache`.
- Sessao/URL real: `readHistoricoSessionFilters`, `writeHistoricoSessionFilter`, `clearHistoricoSessionFilters`, `readUrlFilters`, `writeFiltersToUrl`, `applyHistoricoUrlFiltersToSession`.
- Orquestracao: `buildHistoricoCurrentFilters`, `buildHistoricoRenderFilters`, `hydrateFiltersFromUrl`.

Contratos preservados:

- `#hist-busca`, `#hist-equip`, `#hist-setor`, `#hist-filters-trigger/count`.
- `data-hist-action` `hist-filter-*` e `hist-clear-*`.
- `setHistClienteFilter`, `_histFilterValues`, `_clienteFilter`.
- `sessionStorage`/URL params.
- Sheet mobile, view model/timeline e estado vazio.
- Export/report sem perder `data-registro-id`.
- Contrato CP-O.

Testes rodados inicialmente:

- `npm run test -- src/features/historico/__tests__/filters/filterHelpers.test.js src/__tests__/historicoFilters.contract.test.js --reporter=dot`: passou, 2 arquivos / 10 testes.

Lacunas remanescentes:

- Helpers com DOM/cache/session/URL real seguem no adapter.
- `src/ui/views/historico.js` segue acima de 1000 LOC, apesar da reducao parcial.
- Proximo movimento deve ser checkpoint ou mapeamento adicional antes de corte mais profundo.

Proximo CP recomendado: **CP-R - stability checkpoint e encerrar Mudanca 15**.

Justificativa: a Mudanca 15 ja acumulou contratos, mapeamentos e extracoes seguras para render, card actions, delete, PDF/WhatsApp e filtros. Um checkpoint reduz risco antes de qualquer pre-split mais profundo de filtros.

## 28. CP-R - Stability checkpoint e encerramento

- CP-R aplicado em modo documentacao + validacao.
- Documento criado: `docs/migration/mudanca-15-stability-checkpoint.md`.
- Nenhum `src/` alterado.
- Nenhum teste alterado.
- Estado final da Mudanca 15 consolidado: render/timeline, card actions, Historico -> Registro, `deleteReg`, Historico -> PDF/WhatsApp e filtros.
- Helpers feature-scoped finais confirmados:
  - `src/features/historico/render/renderHelpers.js`
  - `src/features/historico/actions/cardMenuHelpers.js`
  - `src/features/historico/delete/deleteHelpers.js`
  - `src/features/historico/filters/filterHelpers.js`
- Contratos principais confirmados:
  - `src/__tests__/historicoCardActions.contract.test.js`
  - `src/__tests__/historicoRegistroIntegration.contract.test.js`
  - `src/__tests__/historicoPdfWhatsappIntegration.contract.test.js`
  - `src/__tests__/historicoFilters.contract.test.js`
- LOC principais confirmados:
  - `src/ui/views/historico.js`: 1621
  - `src/react/pages/HistoricoTimeline.jsx`: 453
  - `src/react/pages/HistoricoFilters.jsx`: 252
  - `src/react/components/CardActions.jsx`: 68
  - `src/ui/components/historicoFiltersSheet.js`: 251
  - `src/ui/viewModels/historicoViewModel.js`: 497
  - `src/ui/viewModels/historicoContracts.js`: 102
  - `src/features/historico/render/renderHelpers.js`: 72
  - `src/features/historico/actions/cardMenuHelpers.js`: 28
  - `src/features/historico/delete/deleteHelpers.js`: 44
  - `src/features/historico/filters/filterHelpers.js`: 45
- Validacoes rodadas:
  - Bateria principal Historico: passou, 8 arquivos / 36 testes.
  - Bateria relacionada: passou, 12 arquivos / 91 testes.
  - `npm run test -- src/__tests__ --reporter=dot`: passou.
  - `npm run format`: passou.
  - `npm run check`: passou.
  - `npm run size`: falhou por ambiente, pois `size-limit` nao foi reconhecido localmente.
  - `npx playwright test -c e2e/playwright.config.js --reporter=list`: passou, 15 testes passed / 9 skipped.
- Riscos remanescentes documentados:
  - `src/ui/views/historico.js` ainda acima de 1000 LOC.
  - `renderHist`, `deleteReg` e `setHistClienteFilter` permanecem no adapter.
  - DOM/cache/sessionStorage/URL reais permanecem no adapter.
  - Bridges React, sheet mobile e integracoes Registro/PDF/WhatsApp seguem sensiveis a contratos.
  - Warnings de lint/build/chunk permanecem como baseline tecnico.
- Decisao final: **Encerrar Mudanca 15**.
- Proxima mudanca tecnica recomendada: **Mudanca 16 - Stability geral/E2E/cache**.

Justificativa: a Mudanca 15 concluiu inventario, contratos, mapeamentos, pre-splits e extracoes seguras do Historico. O proximo ganho deve ser estabilidade transversal, E2E, cache e warnings/chunks antes de novos cortes profundos.
