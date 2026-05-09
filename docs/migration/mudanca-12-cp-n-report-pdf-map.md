# Mudança 12 / CP-N - Mapeamento de relatório/PDF/WhatsApp

## 1. Base

- Branch: `main`
- HEAD: `8a11c30cec8c4ab4c30f8f2f7cedeb4b6f7dd9e0`
- Data: 2026-05-09
- Adapter analisado: `src/ui/views/registro.js`
- LOC atual de `src/ui/views/registro.js`: 1983
- Observação de reconciliação de LOC CP-L/CP-M: CP-L registrou `1773 -> 1800`; CP-M registrou `2040 -> 1983`. Para este checkpoint, o valor válido é o LOC real medido no workspace: 1983. A divergência anterior deve ser tratada como inconsistência documental/histórica, não como estado de código.

## 2. Objetivo

Mapear o fluxo real de relatório/PDF/WhatsApp ligado ao Registro antes de qualquer pre-split ou extração, preservando `saveRegistro`, `postSave` CP-M, filtros por `registroId`, quota, PDF, WhatsApp, histórico e contratos públicos.

## 3. Escopo real de relatório/PDF/WhatsApp

| Arquivo                                                                                               |    LOC | Responsabilidade no fluxo relatório/PDF/WhatsApp                                                        | Exporta API pública?                                                                        | Risco                                                     |
| ----------------------------------------------------------------------------------------------------- | -----: | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `src/ui/views/registro.js`                                                                            |   1983 | Orquestra save, passa `exportPdfFlow`/`shareWhatsAppFlow` para post-save e preserva `andShare`          | Sim: `saveRegistro`, `clearRegistro`, `initRegistro`                                        | Alto: adapter legado ainda coordena state/media/post-save |
| `src/features/registro/save/postSave.js`                                                              |     87 | Helpers feature-scoped de post-save com DI para Toast, PDF, WhatsApp, rota e prompt                     | Sim: helpers exportados                                                                     | Médio: efeitos injetados precisam manter ordem            |
| `src/ui/controller/handlers/registroHandlers.js`                                                      |    126 | Liga `save-registro`, `save-and-share-registro` e `save-and-share-other-registro` ao save legado        | Não diretamente; registra handlers                                                          | Alto: contrato de data-action                             |
| `src/ui/controller/handlers/reportExportHandlers.js`                                                  |    714 | Handler central de `export-pdf` e `whatsapp-export`, orçamento/quota, PDF blob, preview, download/share | Sim: `buildReportFilters`, `exportPdfFlow`, `shareWhatsAppFlow`, `bindReportExportHandlers` | Alto: Auth, quota, dynamic imports, DOM e fallbacks       |
| `src/ui/views/relatorio.js`                                                                           |    838 | View relatório, filtros, bridges React, cards, assinatura e wiring de actions                           | Sim: `renderRelatorio`, unmounts, helpers                                                   | Alto: DOM/React bridge e filtros                          |
| `src/ui/views/historico.js`                                                                           |   1652 | Histórico usa `CardActions` por registro, preview de fotos/assinatura e navegação para relatório        | Sim: `renderHist`, filtros, ações                                                           | Médio/alto: cards e data-actions compartilhados           |
| `src/react/components/CardActions.jsx`                                                                |     72 | Botões por registro para `export-pdf` e `whatsapp-export` com `data-registro-id`                        | Sim: componente React                                                                       | Alto: contrato de `registroId`                            |
| `src/ui/components/postSaveRegistroToast.js`                                                          |    197 | Toast rico pós-save com CTAs PDF/WhatsApp e fallback para relatório                                     | Sim: `PostSaveRegistroToast.show`                                                           | Médio/alto: callbacks de destino                          |
| `src/domain/pdf.js`                                                                                   |    155 | Orquestra geração do PDF, filtra registros e resolve assinaturas                                        | Sim: `PDFGenerator`                                                                         | Alto: importa UI signature e state/profile                |
| `src/domain/pdf/reportModel.js`                                                                       |     86 | Filtro por `registroId`/equip/período, nome do arquivo, OS e bloco cliente                              | Sim                                                                                         | Alto: `registroId` curto-circuita filtros                 |
| `src/domain/pdf/shareReport.js`                                                                       |    320 | Web Share API, upload Supabase, link WhatsApp e fallback download                                       | Sim                                                                                         | Alto: share externo/storage/fallback                      |
| `src/domain/pdf/sections/services.js`                                                                 |    526 | Renderiza serviços e fotos no PDF                                                                       | Sim                                                                                         | Alto: layout e fotos                                      |
| `src/domain/pdf/sections/signatures.js`                                                               |    276 | Renderiza páginas de assinatura no PDF                                                                  | Sim                                                                                         | Alto: assinatura ausente/corrompida                       |
| `src/react/pages/RelatorioCards.jsx`                                                                  |    516 | Cards React do relatório, inclui `CardActions` e assinatura                                             | Sim                                                                                         | Médio: selectors/action contracts                         |
| `src/react/pages/RelatorioControls.jsx`                                                               |    521 | Toolbar relatório, botões PDF/WhatsApp, quota slot e filtros                                            | Sim                                                                                         | Médio/alto: data-actions e IDs públicos                   |
| Testes `registroPdfWhatsappLegacyContracts`, `postSave`, `relatorio*`, `pdf*`, `share*`, `historico*` | vários | Cobrem contratos principais de Registro/relatório/share                                                 | Não                                                                                         | Médio: cobertura espalhada                                |

## 4. Ordem real do fluxo

| Ordem | Bloco atual relatório/PDF/WhatsApp       | Responsabilidade                                                                               | Dependências                                                          | Side effects                             | Risco                 |
| ----: | ---------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------- | --------------------- |
|     1 | `save-and-share-registro`                | Handler chama `saveRegistro({ andShare: true })`                                               | `registroHandlers.js`, `saveRegistro`                                 | Loading state, client fork opcional      | Alto                  |
|     2 | `save-and-share-other-registro`          | Força escolha de cliente antes de salvar/compartilhar                                          | `RegistroClienteForkSheet`, `saveRegistro`                            | Modal/sheet, dados cliente               | Alto                  |
|     3 | `andShare` no create                     | Após state/media/signature, chama fluxo direto de share                                        | `runRegistroCreatePostSaveEffects`, `postSave.js`                     | Toast, WhatsApp ou fallback rota         | Alto                  |
|     4 | `runRegistroDirectShareAfterSave`        | Toast, `shareWhatsAppFlow`, fallback `goTo('relatorio')`, prompt preventiva                    | DI: `Toast`, `shareWhatsAppFlow`, `goTo`, prompt                      | Share externo, navegação, prompt         | Alto                  |
|     5 | `notifyRegistroCreateSaved`              | Toast rico com CTAs PDF/WhatsApp                                                               | `PostSaveRegistroToast`, `exportPdfFlow`, `shareWhatsAppFlow`, `goTo` | Toast, callbacks e fallback rota         | Médio/alto            |
|     6 | `CardActions` em histórico/relatório     | Emite `data-action="export-pdf"` ou `whatsapp-export` com `data-registro-id`                   | React cards, global event handlers                                    | Export/share por card                    | Alto                  |
|     7 | `getReportFilters`                       | Lê filtros da toolbar ou `triggerEl.dataset.registroId`                                        | DOM `#rel-equip`, `#rel-de`, `#rel-ate`, `data-registro-id`           | Nenhum persistente                       | Alto se selector muda |
|     8 | `buildReportFilters`                     | Normaliza `registroId`, `filtEq`, `de`, `ate`                                                  | `reportExportHandlers.js`                                             | Nenhum                                   | Médio                 |
|     9 | `exportPdfFlow`                          | Opcionalmente envolve botão em loading, chama `executePdfExport`                               | `runAsyncAction`                                                      | Loading state                            | Médio                 |
|    10 | `executePdfExport`                       | Auth/quota, dynamic import PDF, blob, preview opt-in, download, toast sucesso                  | Auth, usage, PDFGenerator, DOM, PdfSuccessToast                       | Download, quota, toast, onboarding       | Alto                  |
|    11 | `shareWhatsAppFlow`                      | Opcionalmente envolve botão em loading, chama `executeWhatsAppShare`                           | `runAsyncAction`                                                      | Loading state                            | Médio                 |
|    12 | `executeWhatsAppShare`                   | Auth/quota, gera PDF blob, preview opt-in, chama `shareReportPdf`, incrementa quota            | Auth, usage, PDFGenerator, shareReport, Toast                         | Web Share/upload/wa link/download, toast | Alto                  |
|    13 | `PDFGenerator.generateMaintenanceReport` | Filtra registros, monta capa, serviços, fotos, assinaturas e watermark Free                    | state, Profile, PDF sections, signature resolver                      | PDF/Blob, local OS counter               | Alto                  |
|    14 | `filterRegistrosForReport`               | Se `registroId` existe, ignora filtros equip/período e filtra por id                           | `reportModel.js`                                                      | Nenhum                                   | Alto                  |
|    15 | Histórico/relatório consumo              | Cards exibem ações, fotos e assinatura; relatório renderiza filtros e cards                    | `historico.js`, `relatorio.js`, React islands                         | DOM/React render                         | Médio/alto            |
|    16 | Erros/fallbacks                          | Falha PDF/share mostra Toast ou navega para relatório; cancelamento de share não consome quota | `handleError`, `Toast`, `goTo`, share result                          | Feedback/navegação                       | Alto                  |

## 5. Contratos públicos

| Contrato                                                                | Origem                             | Usado por                                         | Coberto por teste?                                       | Risco se alterar                |
| ----------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------- | -------------------------------------------------------- | ------------------------------- |
| `data-action="save-registro"`                                           | Registro                           | `registroHandlers.js`                             | Sim, contracts/save                                      | Quebra salvar                   |
| `data-action="save-and-share-registro"`                                 | Registro                           | `registroHandlers.js`                             | Sim, Registro PDF/WhatsApp                               | Quebra share direto             |
| `data-action="save-and-share-other-registro"`                           | Registro                           | `registroHandlers.js`                             | Sim, client fork                                         | Quebra destinatário alternativo |
| `data-action="export-pdf"`                                              | `RelatorioControls`, `CardActions` | `bindPdfExport`                                   | Sim, relatorio/report tests                              | PDF não dispara                 |
| `data-action="whatsapp-export"`                                         | `RelatorioControls`, `CardActions` | `bindWhatsAppExport`                              | Sim, share/whatsapp tests                                | WhatsApp não dispara            |
| `data-registro-id`                                                      | `CardActions`                      | `getReportFilters`                                | Sim, `registroPdfWhatsappLegacyContracts`, report model  | Exporta relatório errado        |
| Route `goTo('relatorio', { equipId, intent, registroId })`              | post-save/Toast fallback           | Relatório e report handlers                       | Sim, post-save tests                                     | Fallback perde contexto         |
| `filters.registroId`                                                    | post-save/report handlers          | PDFGenerator/reportModel/share metadata           | Sim, `pdfGenerator.registroId`, `reportModel.registroId` | PDF inclui registros errados    |
| `registro.fotos`                                                        | save/photos/PDF services           | `drawServices`                                    | Parcial, photo/PDF tests                                 | PDF sem evidências              |
| `registro.assinatura`                                                   | save/signature/PDF signatures      | `resolveSignatureForRecord`, `drawSignaturePages` | Sim, signature tests; parcial PDF                        | Assinatura some do PDF          |
| `clienteNome`, `clienteDocumento`, `localAtendimento`, `clienteContato` | Registro payload                   | `extractClientBlock`, PDF capa/share              | Sim, Registro save; parcial PDF                          | Cliente errado no PDF           |
| `#btn-export-pdf`, `#btn-whatsapp`, `#pdf-quota-slot`                   | RelatorioControls                  | UI/handlers/quota badge                           | Sim, relatorio contracts                                 | Toolbar/quota quebra            |
| `PostSaveRegistroToast.show({ onAction, onFallback })`                  | post-save toast                    | Registro postSave CP-M                            | Sim, postSave tests                                      | CTA não gera PDF/share          |

## 6. Dependências técnicas

| Dependência                  | Usada onde                     | Função                         | Acoplamento                                     | Risco                             | Estratégia sugerida                        |
| ---------------------------- | ------------------------------ | ------------------------------ | ----------------------------------------------- | --------------------------------- | ------------------------------------------ |
| `reportExportHandlers.js`    | handlers globais e postSave DI | Centraliza PDF/WhatsApp        | Alto: Auth, quota, DOM, dynamic imports         | Regressão silenciosa de share/PDF | Mapear e testar contratos antes de extrair |
| `relatorio.js`               | rota relatório                 | UI de filtros/cards/assinatura | Alto: DOM + React bridges                       | Filtros/roots quebrados           | CP específico se mexer em view             |
| `domain/pdf.js`              | export/share                   | Geração PDF                    | Alto: domain importa state/profile/UI signature | Ciclo/camada invertida            | Pre-split com DI planejada                 |
| `domain/pdf/reportModel.js`  | PDFGenerator                   | Filtro `registroId` e cliente  | Baixo/médio                                     | Relatório errado                  | Contrato específico de `registroId`        |
| `domain/pdf/shareReport.js`  | WhatsApp flow                  | Web Share/upload/link/download | Alto: Supabase/browser APIs                     | Falha offline/share               | Testar fallback antes de mover             |
| `PostSaveRegistroToast`      | Registro post-save             | CTAs e fallback                | Médio                                           | CTA sem feedback                  | Manter DI e contrato                       |
| `Toast`                      | handlers/postSave              | Feedback usuário               | Médio                                           | Mensagens regressivas             | Não alterar neste CP                       |
| `goTo`/Router                | fallback e pricing             | Navegação                      | Médio/alto                                      | Perde `registroId`/intent         | Testes de rota/fallback                    |
| Auth/usage/PlanCache/billing | report handlers                | Quota/gating                   | Alto                                            | Consumo errado ou bypass          | Isolar só após contrato                    |
| `resolveSignatureForRecord`  | `domain/pdf.js`                | Assinatura para PDF            | Alto: UI import no domain                       | Import circular/camada reversa    | CP próprio para assinatura/PDF             |
| Fotos/PDF services           | `drawServices`                 | Evidências no PDF              | Médio/alto                                      | Layout/perda de fotos             | Manter coberto por regressions             |
| Histórico                    | cards/actions                  | Export por registro            | Médio                                           | Botões sem `registroId`           | Contrato `CardActions`                     |
| Equipamentos/clientes        | filtros/capa                   | Nome, local, cliente           | Médio                                           | PDF com contexto errado           | Testes de relatório por `registroId`       |
| DOM/React                    | RelatorioControls/Cards        | selectors e data-actions       | Médio/alto                                      | Handler não acha botões           | Contracts antes de refatorar               |

## 7. Testes existentes e lacunas

| Teste                                                          | O que cobre                                                                                | O que não cobre                       | Importância | Observação                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------- | ----------- | -------------------------------------- |
| `src/features/registro/__tests__/save/postSave.test.js`        | DI de post-save, CTA/fallback PDF/WhatsApp                                                 | Integração real com quota/PDF         | Alta        | Criado no CP-M                         |
| `src/__tests__/registroPdfWhatsappLegacyContracts.test.js`     | Registro salva e compartilha com payload/filters                                           | Todos canais de share                 | Alta        | Teste central para CPs                 |
| `src/__tests__/registroPostSaveLegacyFlow.test.js`             | Toast pós-save e fallback                                                                  | Quota completa                        | Alta        | Cobre fluxo legado                     |
| `src/__tests__/pdfGenerator.registroId.test.js`                | PDF com filtro por `registroId`                                                            | UI/handlers                           | Alta        | Contrato crítico                       |
| `src/__tests__/reportModel.registroId.test.js`                 | `filterRegistrosForReport`                                                                 | PDF render                            | Alta        | Baixo custo, alta proteção             |
| `src/__tests__/reportExportHandlers.test.js`                   | Handlers export/share defensivos                                                           | Todos planos reais                    | Alta        | Tem stderr jsdom baseline              |
| `src/__tests__/shareReport.test.js`                            | Web Share/upload/fallback download                                                         | Integração Supabase real              | Alta        | Cobre domínio share                    |
| `src/__tests__/whatsappExport.test.js`                         | Texto WhatsApp                                                                             | PDF blob/upload                       | Média       | Complementar                           |
| `src/__tests__/postSaveRegistroToast.test.js`                  | Toast rico e callbacks                                                                     | Integração com save                   | Média/alta  | Componente isolado                     |
| `src/__tests__/relatorio*.test.*`                              | View/controls/cards/handlers relatório                                                     | Fluxo save completo                   | Alta        | Vários contratos DOM                   |
| `src/__tests__/historico*.test.*`                              | Histórico/cards/timeline                                                                   | Export real completo                  | Média       | Importante para `CardActions`          |
| `src/__tests__/signature*.test.js`                             | Resolver/storage/flush assinatura                                                          | PDF visual completo                   | Média/alta  | Necessário para PDF assinatura         |
| `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js` | Contrato dedicado de `registroId` em save-and-share, CTAs, fallback, filtros e DOM actions | Matriz completa de quota por plano    | Alta        | Criado no CP-O                         |
| Lacuna                                                         | Quota/gating por PDF vs WhatsApp em todos planos                                           | Consumo incorreto pode passar parcial | Alta        | Candidato a contrato antes de extração |

## 8. Riscos principais

- Filtro por `registroId`: é o contrato mais crítico; `filterRegistrosForReport` curto-circuita os demais filtros.
- PDF/relatório: `domain/pdf.js` ainda importa `core/state`, `features/profile` e UI signature, gerando acoplamento de camadas.
- WhatsApp/share: envolve Web Share API, upload Supabase, link `wa.me` e fallback de download.
- Quota/gating: PDF e WhatsApp usam recursos de quota diferentes e caminhos de commit diferentes.
- Assinatura: PDF pré-resolve assinatura via `resolveSignatureForRecord`; falhas são silenciosamente tratadas como ausência.
- Fotos/evidências: `drawServices` limita e renderiza fotos; layout pode quebrar com payload grande.
- Histórico: `CardActions` emite `data-registro-id`; remover esse atributo exporta o relatório errado.
- Toast/Router: fallback post-save depende de `intent`, `equipId` e `registroId`.
- Selectors/data-actions/classes: `export-pdf`, `whatsapp-export`, toolbar e cards são contratos públicos.
- Import circular: extrações ingênuas podem piorar o acoplamento domain -> ui.
- Regressão silenciosa: muitos fallbacks retornam `false` ou navegam sem quebrar testes unitários isolados.

## 9. Opções de próximo CP

| Opção de próximo CP                                                    | Benefício                                                       | Risco                                       | Pré-requisitos                       | Recomendação            |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------- | ------------------------------------ | ----------------------- |
| CP-O - pre-split relatório/PDF em Registro                             | Preparar extração do uso de `exportPdfFlow`/`shareWhatsAppFlow` | Pode mexer em efeitos sensíveis cedo demais | Contratos de `registroId` sólidos    | Não recomendado agora   |
| CP-O - mover helpers seguros de relatório/PDF                          | Reduz acoplamento se houver helpers puros                       | Pode criar DI grande demais                 | Mapeamento de pureza mais específico | Não recomendado agora   |
| CP-O - criar teste/contrato específico de `registroId` em PDF/WhatsApp | Congela contrato mais crítico antes de mexer                    | Baixo                                       | Usar testes existentes como base     | Recomendado             |
| CP-O - mapear/mover wrappers restantes do `saveRegistro`               | Continua redução do adapter                                     | Pode ignorar risco maior de relatório       | CP-N concluído                       | Não recomendado agora   |
| CP-O - stability checkpoint intermediário                              | Consolida estado                                                | Menos avanço técnico                        | CP-M validado                        | Útil depois do contrato |
| CP-O - encerrar etapa `saveRegistro` e iniciar outro bloco             | Evita mexer em PDF                                              | Pode deixar risco alto sem proteção         | Checkpoint amplo                     | Não recomendado agora   |

## 10. Recomendação final

**CP-O - teste/contrato específico de `registroId` em PDF/WhatsApp.** Aplicado em 2026-05-09 via `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`.

Confiança: 90%+. Antes de qualquer pre-split em relatório/PDF, o contrato de `registroId` precisa ficar ainda mais explícito cobrindo post-save, `CardActions`, `buildReportFilters`, `exportPdfFlow`/`shareWhatsAppFlow` e fallback para rota relatório. Esse é o corte de menor risco com maior proteção contra regressão silenciosa.

Complemento CP-O: com o contrato dedicado criado, o próximo corte seguro passa a ser **CP-P - pre-split relatorio/PDF em Registro**, mantendo efeitos no adapter e sem alterar comportamento.
