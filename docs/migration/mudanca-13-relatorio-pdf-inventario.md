# Mudanca 13 - Relatorio/PDF domain / Inventario inicial

## 1. Base

- Branch: main
- HEAD: bcd4024f055c33ddae1755fe2cd95e8d7dc65393
- Data: 2026-05-09
- Arquivos analisados: `src/ui/views/relatorio.js`, `src/ui/controller/handlers/reportExportHandlers.js`, `src/domain/pdf.js`, `src/domain/pdf/**`, `src/domain/whatsapp.js`, `src/domain/pdf/shareReport.js`, `src/ui/views/historico.js`, `src/react/pages/Relatorio*.jsx`, `src/react/entrypoints/relatorio*Island.jsx`, `src/ui/viewModels/relatorio*.js`, `src/features/registro/save/reportShare.js` e testes relacionados.
- Arquivo principal identificado: `src/ui/controller/handlers/reportExportHandlers.js` para orquestracao PDF/WhatsApp; `src/domain/pdf.js` para geracao PDF; `src/ui/views/relatorio.js` para composition root da tela.
- LOC dos arquivos principais: `relatorio.js` 838; `reportExportHandlers.js` 714; `domain/pdf.js` 155; `domain/pdf/shareReport.js` 320; `domain/whatsapp.js` 92; `historico.js` 1652; `domain/pdf/sections/cover.js` 677; `domain/pdf/sections/services.js` 526; `domain/pdf/sections/signatures.js` 276; `domain/pdf/sections/checklist.js` 192; `domain/pdf/reportModel.js` 86.

## 2. Objetivo

Mapear o estado real do fluxo de Relatorio/PDF/WhatsApp antes de refatorar, com foco em responsabilidades, contratos publicos, acoplamentos, riscos, testes existentes e sequencia segura de CPs para a Mudanca 13.

## 3. Escopo real Relatorio/PDF/WhatsApp

| Arquivo                                                                              |           LOC | Tipo                      | Responsabilidade aparente                                                                             | Exporta APIs publicas?                                                                      | Risco                                                                       |
| ------------------------------------------------------------------------------------ | ------------: | ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/ui/views/relatorio.js`                                                          |           838 | UI adapter                | Render da tela Relatorio, filtros, bridges React, cards, assinatura visual, PMOC hero e wiring local  | Sim: `renderRelatorio`, unmounts e helpers legados exportados                               | Alto: DOM, React islands, state, assinatura e filtros no mesmo adapter      |
| `src/ui/controller/handlers/reportExportHandlers.js`                                 |           714 | Controller handler        | Eventos `export-pdf`, `whatsapp-export`, quota, preview, download, share, PMOC formal e dropdown      | Sim: `buildReportFilters`, `exportPdfFlow`, `shareWhatsAppFlow`, `bindReportExportHandlers` | Alto: concentra UI, billing, dynamic imports, Toast, Router, PDF e WhatsApp |
| `src/domain/pdf.js`                                                                  |           155 | Domain orchestrator       | Gera relatorio PDF, filtra registros, monta contexto OS/cliente, delega sections, resolve assinaturas | Sim: `PDFGenerator`                                                                         | Alto: domain importa `ui/components/signature.js`                           |
| `src/domain/pdf/reportModel.js`                                                      |            86 | Domain helper             | Filtros por `registroId`/equipamento/periodo, nome de arquivo, OS local e cliente da capa             | Sim                                                                                         | Medio: `buildOsNumber` grava localStorage por default                       |
| `src/domain/pdf/shareReport.js`                                                      |           320 | Domain/share orchestrator | Web Share API, upload Supabase, signed URL, `wa.me`, fallback download                                | Sim                                                                                         | Alto: domain importa Supabase, errors e UI onboarding                       |
| `src/domain/whatsapp.js`                                                             |            92 | Domain legacy text share  | Texto resumido para WhatsApp e filtro por `registroId`/equipamento/periodo                            | Sim: `WhatsAppExport` e `__testables`                                                       | Medio: duplica logica de filtro fora de `reportModel`                       |
| `src/domain/pdf/sections/cover.js`                                                   |           677 | PDF section               | Capa, resumo executivo, conclusao, equipamentos, ficha tecnica, pendencias e checklist                | Sim: `drawCover`                                                                            | Alto: arquivo grande e layout denso                                         |
| `src/domain/pdf/sections/services.js`                                                |           526 | PDF section               | Cards de servico, fotos/evidencias, page breaks e custos                                              | Sim: `drawServices`                                                                         | Alto: layout manual, async photo resolver, risco visual                     |
| `src/domain/pdf/sections/signatures.js`                                              |           276 | PDF section               | Paginas de comprovante e assinatura                                                                   | Sim: `drawSignaturePages`                                                                   | Medio/alto: depende de resolver sync injetado e formatos legados            |
| `src/domain/pdf/sections/checklist.js`                                               |           192 | PDF section               | Checklist NBR/PMOC por registro, template, status, medida e observacao                                | Sim: `drawChecklist`                                                                        | Medio: depende de templates PMOC e contrato `registro.checklist`            |
| `src/domain/pdf/primitives.js` / `constants.js` / `sanitizers.js`                    |  90 / 41 / 46 | PDF infra                 | Primitivas, cores/tipografia e sanitizacao                                                            | Sim                                                                                         | Baixo/medio: compartilhado por secoes                                       |
| `src/domain/pdf/pmoc/**`                                                             |    1731 total | PDF PMOC formal           | Gerador PMOC, capa, cadastro, plano, cronograma, termo e anexos                                       | Sim                                                                                         | Alto: fluxo Pro separado, mas acionado pelo mesmo handler                   |
| `src/domain/pdf/orcamentoPdf.js`                                                     |           436 | PDF orcamento             | PDF de orcamento                                                                                      | Sim                                                                                         | Medio: dominio PDF adjacente; fora do fluxo principal Registro              |
| `src/react/pages/RelatorioCards.jsx`                                                 |           484 | React island              | Cards, CTAs, `data-registro-id`, assinatura visual                                                    | Sim via entrypoint                                                                          | Medio: preserva contratos DOM consumidos pelos handlers                     |
| `src/react/pages/RelatorioControls.jsx`                                              |           500 | React island              | Filtros, export dropdown, acoes PDF/WhatsApp/PMOC                                                     | Sim via entrypoint                                                                          | Medio: contratos `data-action` e IDs publicos                               |
| `src/react/pages/RelatorioHero.jsx`                                                  |           191 | React island              | Hero/KPIs/contexto e PMOC hero                                                                        | Sim via entrypoint                                                                          | Medio: contratos de PMOC e navegacao                                        |
| `src/ui/viewModels/relatorioViewModel.js`                                            |           337 | View model                | KPIs, filtros, narrativa, contexto cliente/setor/equipamento, proximas acoes                          | Sim                                                                                         | Baixo/medio: ja isolado de PDF/storage por teste                            |
| `src/ui/viewModels/relatorioContracts.js`                                            |           126 | Contract constants        | IDs, actions, classes, data attributes e nav targets                                                  | Sim                                                                                         | Baixo: ponto certo para travar DOM                                          |
| `src/ui/views/historico.js`                                                          |          1652 | UI adapter                | Historico e acoes por card, consumidor indireto de export/share                                       | Sim                                                                                         | Alto: arquivo grande, possivel origem de CTAs por registro                  |
| `src/features/registro/save/reportShare.js`                                          |            55 | Feature Registro          | Ponte pos-save para PDF/WhatsApp e fallback relatorio                                                 | Sim                                                                                         | Baixo/medio: protegido por CP-Q/CP-O/CP-RegistroId                          |
| `src/ui/components/pdfQuotaBadge.js` / `pdfSuccessToast.js` / `shareSuccessToast.js` | 131 / 78 / 62 | UI components             | Feedback de quota/sucesso                                                                             | Sim                                                                                         | Medio: usados dentro do handler central                                     |

## 4. Fluxos principais

| Fluxo                              | Entrada/trigger                             | Arquivos envolvidos                                                                                        | Dependencias                                                          | Side effects                                                                               | Testes existentes                                                                                              | Risco      |
| ---------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ---------- |
| Exportar PDF pela tela Relatorio   | `data-action="export-pdf"` toolbar/dropdown | `RelatorioControls.jsx`, `reportExportHandlers.js`, `domain/pdf.js`, PDF sections                          | Auth, billing, usage limits, dynamic import PDF, Toast, PdfQuotaBadge | Gera Blob, download via `<a>`, incrementa quota quando aplicavel, marca onboarding         | `reportExportHandlers.test.js`, `relatorioExportPmocLegacyHandlers.test.js`, `pdfGenerator.registroId.test.js` | Alto       |
| Exportar PDF por card/acao         | Botao de card com `data-registro-id`        | `RelatorioCards.jsx`, handlers, `reportModel.js`                                                           | DOM dataset, filtros legados, `filterRegistrosForReport`              | Curto-circuita por registroId e gera PDF de um registro                                    | `registroPdfWhatsappRegistroId.contract.test.js`, `reportModel.registroId.test.js`                             | Medio/alto |
| WhatsApp/export share              | `data-action="whatsapp-export"`             | `reportExportHandlers.js`, `domain/pdf.js`, `domain/whatsapp.js`, `shareReport.js`                         | Auth, usage, Web Share API, Supabase Storage, `window.open`           | Gera PDF Blob, pode abrir share sheet, upload ou fallback download, incrementa quota se ok | `reportExportHandlers.test.js`, `shareReport.test.js`, `whatsappExport.test.js`                                | Alto       |
| shareReport/upload/fallback        | Chamada de `shareReportPdf`                 | `domain/pdf/shareReport.js`                                                                                | Supabase, navigator.share, File, URL, document, errors, onboarding    | Upload Storage, signed URL, wa.me ou download local                                        | `shareReport.test.js`                                                                                          | Alto       |
| Filtro por `registroId`            | Pos-save, cards ou fallback relatorio       | `features/registro/save/reportShare.js`, `reportExportHandlers.js`, `reportModel.js`, `domain/whatsapp.js` | `filters.registroId`, `data-registro-id`, registros state             | Ignora filtros antigos quando registroId existe                                            | `registroPdfWhatsappRegistroId.contract.test.js`, `reportModel.registroId.test.js`, `whatsappExport.test.js`   | Medio      |
| Filtro cliente/equipamento/periodo | Selects `#rel-equip`, `#rel-de`, `#rel-ate` | `relatorio.js`, `relatorioViewModel.js`, `reportExportHandlers.js`, `reportModel.js`                       | DOM, state, view model, datas ISO                                     | Re-render da view, filtros de PDF/WhatsApp                                                 | `relatorioViewModel.test.js`, `relatorioView.test.js`                                                          | Medio      |
| Consumo de registros do Registro   | Pos-save toast e fallback                   | `features/registro/save/postSave.js`, `reportShare.js`, `reportExportHandlers.js`                          | `exportPdfFlow`, `shareWhatsAppFlow`, Router `goTo`                   | Pode abrir share direto ou navegar para Relatorio                                          | `registroPdfWhatsappLegacyContracts.test.js`, `registroPostSaveLegacyFlow.test.js`                             | Medio      |
| Consumo de fotos/evidencias        | PDF services                                | `domain/pdf/sections/services.js`, `core/photoStorage.js`                                                  | `registro.fotos`, resolver async, Image API                           | Desenha ate 4 fotos por registro; fallback "Foto indisponivel"                             | Cobertura indireta em tests de PDF/Registro; lacuna visual real                                                | Alto       |
| Consumo de assinatura              | PDF signatures e cards                      | `domain/pdf.js`, `sections/signatures.js`, `ui/components/signature.js`, `relatorio.js`                    | Storage/localStorage resolver, data URL sanitizado                    | Pre-resolve assinaturas, adiciona paginas de comprovante                                   | `signatureResolver.test.js`, `registroPdfWhatsappRegistroId.contract.test.js`, `relatorioLegacyCards.test.js`  | Alto       |
| Consumo Checklist/PMOC             | PDF checklist e PMOC formal                 | `sections/checklist.js`, `domain/pdf/pmoc/**`, `features/registro/checklist/pmocChecklist.js`              | `registro.checklist.tipo_template/items`, templates PMOC              | Desenha checklist marcado; PMOC formal gera PDF separado                                   | `registroChecklistPmoc.contract.test.js`, `pmocReport.test.js`, `checklistTemplates.test.js`                   | Medio      |
| Consumo Historico                  | Acoes por registro e navegacao              | `historico.js`, React/legacy historico tests, handlers globais                                             | data actions, record ids                                              | Export/share a partir de contexto historico quando presente                                | `historico*.test.*`, contratos RegistroId                                                                      | Medio/alto |
| Quota/gating/plano                 | PDF, WhatsApp e PMOC                        | `reportExportHandlers.js`, `usageLimits.js`, billing/plan modules, `planCache.js`                          | Auth, profile billing, usage snapshot                                 | Bloqueia, mostra Toast, navega pricing, incrementa usage                                   | `reportExportHandlers.test.js`, `usageLimits.test.js`, PMOC legacy tests                                       | Alto       |
| Comportamento sem dados            | PDF/WhatsApp sem registros filtrados        | `domain/pdf.js`, `domain/whatsapp.js`, handlers                                                            | `filterRegistrosForReport`, `WhatsAppExport.generateText`             | PDF ainda pode gerar capa; WhatsApp texto retorna null; handler avisa em falha de Blob     | Parcial em `whatsappExport.test.js`, lacuna PDF sem dados                                                      | Medio      |
| Erros/fallbacks                    | Excecoes em PDF/share/upload                | handlers, `shareReport.js`, `core/errors.js`                                                               | `handleError`, Toast, console, fallback download                      | Silencia/categoriza erros e preserva download local                                        | `shareReport.test.js`, `reportExportHandlers.test.js`                                                          | Medio/alto |

## 5. Contratos publicos

| Contrato publico                         | Origem                                                   | Usado por                                                                          | Teste existente                                                                                                                   | Risco se alterar                            |
| ---------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `data-action="export-pdf"`               | `RELATORIO_ACTIONS.exportPdf`, React controls/cards      | Delegacao global `on('export-pdf')`                                                | `relatorioControlsIsland.test.jsx`, `relatorioExportPmocLegacyHandlers.test.js`, `registroPdfWhatsappRegistroId.contract.test.js` | Export PDF para de disparar                 |
| `data-action="whatsapp-export"`          | `RELATORIO_ACTIONS.whatsappExport`, React controls/cards | Delegacao global `on('whatsapp-export')`                                           | Mesmos testes de controls/export                                                                                                  | WhatsApp/share para de disparar             |
| `data-registro-id`                       | Cards Relatorio/Historico                                | `getReportFilters({ triggerEl })`                                                  | `registroPdfWhatsappRegistroId.contract.test.js`                                                                                  | Filtro por registro unico quebra            |
| `filters.registroId`                     | Registro pos-save, handlers, domain                      | `buildReportFilters`, `PDFGenerator`, `WhatsAppExport`, `filterRegistrosForReport` | `registroPdfWhatsappRegistroId.contract.test.js`, `reportModel.registroId.test.js`, `whatsappExport.test.js`                      | PDF/WhatsApp podem pegar registros errados  |
| `filterRegistrosForReport`               | `src/domain/pdf/reportModel.js`                          | `PDFGenerator`, testes de Registro                                                 | `reportModel.registroId.test.js`                                                                                                  | Regressao em periodo/equip/registroId       |
| `exportPdfFlow`                          | `reportExportHandlers.js`                                | UI handlers e Registro post-save                                                   | `reportExportHandlers.test.js`, Registro contracts                                                                                | Pos-save PDF e tela Relatorio quebram       |
| `shareWhatsAppFlow`                      | `reportExportHandlers.js`                                | UI handlers e Registro post-save                                                   | `reportExportHandlers.test.js`, Registro contracts                                                                                | Share direto/fallback quebram               |
| `shareReportPdf`                         | `domain/pdf/shareReport.js`                              | `executeWhatsAppShare`                                                             | `shareReport.test.js`, `reportExportHandlers.test.js`                                                                             | Web Share/upload/fallback quebram           |
| Campos de registro usados no PDF         | `domain/pdf/sections/**`                                 | PDF cover/services/signatures/checklist                                            | Cobertura parcial por `pdfGenerator.registroId.test.js` e contracts                                                               | Campos ausentes podem sumir silenciosamente |
| `registro.fotos`                         | Registro persistence/photos                              | `drawServices`                                                                     | `photos.test.js`, cobertura indireta PDF                                                                                          | Fotos podem nao renderizar ou travar layout |
| `registro.assinatura`                    | Registro signature/storage                               | `domain/pdf.js`, `drawSignaturePages`, cards                                       | `signatureResolver.test.js`, relatorio cards tests                                                                                | Assinatura pode sumir do PDF                |
| `registro.checklist.tipo_template/items` | Registro Checklist CP-U                                  | `drawChecklist`, PMOC formal                                                       | `registroChecklistPmoc.contract.test.js`, `pmocReport.test.js`                                                                    | Checklist PMOC some ou muda sem aviso       |
| Classes/selectors dos cards/CTAs         | `relatorioContracts.js`, React pages                     | CSS, handlers e tests                                                              | `relatorioViewModel.test.js`, legacy/island tests                                                                                 | Regressao visual e de handlers              |
| Parametros de rota para Relatorio        | Router/Registro fallback                                 | `renderRelatorio(options)` e Registro `goTo`                                       | Registro reportShare/postSave tests                                                                                               | Fallback pos-save perde contexto            |
| Contratos Registro CP-O/CP-Q             | `features/registro/save/reportShare.js`                  | Registro post-save                                                                 | `registroPdfWhatsappRegistroId.contract.test.js`                                                                                  | Mudanca 12 regressa                         |
| Contratos Checklist CP-U                 | `registro.checklist`                                     | PDF checklist/PMOC                                                                 | `registroChecklistPmoc.contract.test.js`                                                                                          | PDF ignora PMOC preenchido                  |

## 6. Dependencias tecnicas

| Dependencia                             | Usada onde                                                  | Funcao                          | Acoplamento                   | Risco                                      | Estrategia sugerida                            |
| --------------------------------------- | ----------------------------------------------------------- | ------------------------------- | ----------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `core/state`                            | `relatorio.js`, `domain/pdf.js`, `domain/whatsapp.js`, PMOC | Fonte de registros/equipamentos | Alto no domain/pdf e WhatsApp | Testes precisam mockar state global        | Criar contratos antes de separar model puro    |
| `core/utils`                            | Relatorio UI, WhatsApp, PDF sections                        | Formatos, DOM helpers, datas    | Medio/alto                    | Mistura DOM e formatacao                   | Extrair apenas helpers puros se comprovado     |
| `core/toast` / `handleError`            | handlers/share                                              | Feedback e erros                | Alto no handler               | Fluxos podem virar silenciosos             | Manter no controller ate haver facade testada  |
| `core/router/goTo`                      | handlers/Registro fallback                                  | Pricing/fallback relatorio      | Medio                         | Navegacao indevida se quota falha          | Cobrir em contratos de handler                 |
| Auth/billing/usage/quota                | `reportExportHandlers.js`                                   | Gate PDF/WhatsApp               | Alto                          | Bloqueio indevido ou quota duplicada       | CP de contrato para budget antes de split      |
| `domain/pdf.js`                         | handlers, tests                                             | Orquestra relatorio PDF         | Alto                          | Importa UI de assinatura                   | Separar resolver por DI em CP futuro           |
| `domain/pdf/sections/**`                | `domain/pdf.js`                                             | Layout PDF                      | Medio/alto                    | Regressao visual silenciosa                | Pre-split com testes pequenos por section      |
| `domain/pdf/shareReport.js`             | WhatsApp flow                                               | Web Share, upload, fallback     | Alto                          | Domain toca UI onboarding e Supabase       | Mapeamento/pre-split share antes de mover      |
| `domain/whatsapp.js`                    | WhatsApp flow                                               | Texto canonico do share         | Medio                         | Duplica filtro de reportModel              | Unificar filtro apos contrato                  |
| `reportExportHandlers.js`               | App controller                                              | Eventos export/share/PMOC       | Alto                          | Arquivo concentra muitas responsabilidades | CP-B contratos, depois pre-split               |
| `relatorio.js`                          | Route Relatorio                                             | Render e bridges React          | Alto                          | Adapter com 838 LOC e state/DOM            | Nao mexer antes de handlers/domain             |
| `historico.js`                          | Historico                                                   | Cards e acoes por registro      | Alto                          | 1652 LOC, possivel consumidor de exports   | Mapear quando tocar card actions               |
| `features/registro/save/reportShare.js` | Registro pos-save                                           | Ponte para Relatorio            | Baixo/medio                   | Regressao em Mudanca 12                    | Preservar contratos CP-O/CP-Q                  |
| Signature resolver/storage              | PDF e Relatorio cards                                       | Data URL ou storage reference   | Alto                          | Domain depende de UI                       | DI/facade futura                               |
| Photo storage/resolver                  | PDF services                                                | Resolver fotos locais/remotas   | Medio/alto                    | Layout async e fallback                    | Contrato especifico para fotos no PDF          |
| PMOC/checklist templates                | PDF checklist/PMOC                                          | Labels, grupos, medidas         | Medio                         | Mudanca de template altera PDF             | Manter protegido por CP-U e adicionar PDF test |
| Supabase/local/offline                  | shareReport, photos/signature                               | Upload/signed URL/fallback      | Alto                          | Falhas variam por ambiente                 | Testar fallback sem rede                       |
| DOM/React cards                         | Relatorio pages/islands                                     | CTAs e dataset                  | Medio                         | Handlers globais dependem de data attrs    | Preservar `relatorioContracts.js`              |

## 7. Testes existentes e lacunas

| Teste                                                                  | O que cobre                                                             | O que nao cobre                                                | Importancia | Observacao                            |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- | ----------- | ------------------------------------- |
| `src/__tests__/reportExportHandlers.test.js`                           | Quota, PDF Blob, download, WhatsApp share, cancelamento e limite        | Contrato completo de PMOC/dropdown e todos os erros de preview | Alta        | Principal protecao antes de split     |
| `src/__tests__/shareReport.test.js`                                    | Nome seguro, mensagem, Web Share, upload, signed URL, fallback download | Integracao real Supabase/browser                               | Alta        | Bom para mover share helpers depois   |
| `src/__tests__/whatsappExport.test.js`                                 | Texto WhatsApp e prioridade de `registroId`                             | Paridade com `filterRegistrosForReport` em todos filtros       | Media       | Mostra duplicacao de filtro           |
| `src/__tests__/pdfGenerator.registroId.test.js`                        | PDFGenerator respeita registroId                                        | Layout visual/fotos/assinaturas/checklist detalhado            | Alta        | Contrato essencial CP-RegistroId      |
| `src/__tests__/reportModel.registroId.test.js`                         | `filterRegistrosForReport` prioriza registroId                          | Cliente/equip/periodo em matriz ampla                          | Alta        | Deve ser ampliado em CP-B             |
| `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`         | Ponte Registro -> PDF/WhatsApp, actions e data-registro-id              | Quota/share/upload                                             | Alta        | Protege Mudanca 12                    |
| `src/__tests__/registroPdfWhatsappLegacyContracts.test.js`             | Fluxos legados pos-save PDF/WhatsApp                                    | Domain PDF real                                                | Alta        | Cobre compatibilidade                 |
| `src/__tests__/relatorioExportPmocLegacyHandlers.test.js`              | React controls acionando handlers legados, PMOC e quota                 | Todos os erros de PMOC                                         | Alta        | Importante para handler split         |
| `src/__tests__/relatorioViewModel.test.js`                             | View model puro, contracts, sem imports proibidos                       | PDF/share                                                      | Media       | Base boa para separar model           |
| `src/__tests__/relatorioView.test.js` e legacy/island tests            | Render Relatorio, cards, controls, hero, assinatura visual              | PDF real                                                       | Media       | Protege DOM/React                     |
| `src/__tests__/relatorioCompanyPmocContracts.test.js`                  | PMOC no hero/slot e Pro gating visual                                   | PDF PMOC real                                                  | Media       | Protege UI PMOC                       |
| `src/__tests__/pmocReport.test.js`                                     | Geracao PMOC formal                                                     | Integracao UI handler completa                                 | Media       | Domain PMOC separado                  |
| `src/__tests__/pdfSanitizers.test.js`                                  | Sanitizacao PDF                                                         | Uso em todas sections                                          | Media       | Complementar                          |
| `src/__tests__/signatureResolver.test.js` / `signatureStorage.test.js` | Resolver/persistencia assinatura                                        | PDF final visual                                               | Alta        | Necessario para desacoplar domain/pdf |
| `src/__tests__/photoStorage.test.js`                                   | Storage de fotos                                                        | Render PDF visual com fotos                                    | Media       | Lacuna em PDF services                |
| `src/features/registro/__tests__/save/reportShare.test.js`             | Helpers Registro pos-save                                               | Handler Relatorio real                                         | Alta        | Preservar sem alterar                 |
| `src/__tests__/historico*.test.*`                                      | Historico e filtros/timeline                                            | Export/share a partir do Historico em matriz completa          | Media       | Historico ainda grande                |

Lacunas criticas antes de pre-split:

- Contrato dedicado para `reportExportHandlers` separando `buildReportFilters`, budget PDF, budget WhatsApp, preview opt-in e fallback.
- Matriz unica para paridade entre `filterRegistrosForReport` e `WhatsAppExport.generateText`.
- Teste pequeno de PDF sections consumindo `registro.fotos`, `registro.assinatura` e `registro.checklist` sem depender de snapshot gigante.
- Contrato de arquitetura para impedir imports UI dentro de `src/domain/pdf*`, ou documentar excecoes ate o CP de desacoplamento.
- Cobertura de comportamento sem dados para PDF vs WhatsApp, pois PDF pode gerar capa e WhatsApp retorna `null`.

## 8. Riscos de arquitetura

| Risco                                            | Evidencia                                                                                           | Impacto                                                   | Bloqueia proxima etapa?                             | Tratamento sugerido                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| Domain PDF importando UI                         | `src/domain/pdf.js` importa `../ui/components/signature.js`; `shareReport.js` importa onboarding UI | Camada domain nao e pura e pode criar ciclos/alertas lint | Nao bloqueia contrato; bloqueia mover domain sem DI | CP-B contrato; CP futuro de DI/facade                    |
| Handler concentrando quota, PDF, WhatsApp e PMOC | `reportExportHandlers.js` tem 714 LOC e multiplos flows                                             | Alto risco de regressao em split                          | Sim para refactor direto                            | Pre-split apos contrato                                  |
| Duplicacao de filtros                            | `reportModel.js` e `domain/whatsapp.js` filtram registros separadamente                             | Divergencia PDF/WhatsApp                                  | Nao                                                 | Contrato de paridade antes de unificar                   |
| Divergencia PDF vs WhatsApp sem dados            | PDFGenerator retorna PDF/capa ou null em erro; WhatsApp text retorna null sem registros             | UX inconsistente                                          | Nao                                                 | Documentar e testar antes de mudar                       |
| Fotos em layout manual                           | `services.js` resolve fotos async, mede card e flui paginas                                         | Regressao visual silenciosa                               | Nao                                                 | Testes focados e talvez visual posterior                 |
| Assinatura em formatos legados                   | `registro.assinatura` pode ser boolean/data URL/storage reference                                   | PDF pode perder comprovante                               | Nao                                                 | Contrato antes de desacoplar resolver                    |
| Checklist/PMOC acoplado a templates              | `sections/checklist.js` usa template para ordem/labels                                              | Mudanca em template altera PDF                            | Nao                                                 | Manter contratos CP-U e adicionar PDF section test       |
| Historico grande                                 | `historico.js` 1652 LOC                                                                             | Mudanca de actions pode quebrar export por card           | Nao para CP-B                                       | Mapear em CP futuro se tocar Historico                   |
| Dynamic import/chunk warnings                    | Handlers importam PDF/PMOC/modal dinamicamente                                                      | Build warnings podem mascarar regressao real              | Nao                                                 | Registrar baseline em checkpoints                        |
| Possivel import circular futuro                  | Feature/share/domain/UI ja cruzam limites                                                           | Refactor pode criar ciclo                                 | Sim para mover sem mapa                             | Usar contratos de arquitetura                            |
| Testes insuficientes para layout PDF             | Cobertura e mais funcional que visual                                                               | Quebra visual passa despercebida                          | Nao                                                 | Evitar snapshot gigante; criar testes de consumo e smoke |

## 9. Riscos principais

- PDF/domain: `domain/pdf.js` ainda acopla core state/profile e UI signature resolver.
- WhatsApp/share: `shareReport.js` mistura Web Share API, Supabase, download DOM, errors e onboarding.
- Quota/gating: `reportExportHandlers.js` decide Auth, billing, usage, Toast e Router em um unico arquivo.
- `registroId`: bem coberto, mas atravessa Registro, handlers, domain PDF e WhatsApp; regressao aqui seleciona registros errados.
- Fotos/evidencias: `drawServices` depende de `registro.fotos` e `resolvePhotoDataUrlForPdf`; risco visual alto.
- Assinatura: formatos legados e resolver async/sync tornam o desacoplamento sensivel.
- Checklist/PMOC: PDF checklist consome `tipo_template/items` e PMOC formal segue fluxo paralelo no mesmo handler.
- Historico: `historico.js` excede 1000 LOC e pode compartilhar CTAs/ids com Relatorio.
- Import circular: refactors devem impedir features/domain importando adapters.
- Regressao silenciosa: varios fallbacks retornam `false`/`null` ou apenas Toast.
- Warnings/chunks: dynamic imports sao intencionais para PDF pesado, mas devem seguir monitorados.

## 10. Sequencia recomendada da Mudanca 13

| Ordem | CP                                                 | Objetivo                                                                  | Escopo permitido                                              | Risco      | Criterio de aprovacao                                     |
| ----: | -------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
|     1 | CP-B - contratos adicionais relatorio/PDF          | Fortalecer contratos de handler, filtros, quota/share e consumo PDF       | Testes/docs apenas                                            | Baixo      | Contratos passam e nao alteram comportamento              |
|     2 | CP-C - mapear/pre-split reportExportHandlers       | Separar localmente budget, PDF, WhatsApp, PMOC e preview                  | `reportExportHandlers.js` + docs/testes se necessario         | Medio      | Contratos CP-B e suite Relatorio passam                   |
|     3 | CP-D - mover helpers puros de filtros/report model | Mover/centralizar helpers puros de filtro/model sem DOM/state             | `src/domain/pdf/reportModel.js` ou feature scoped se definido | Medio      | Paridade PDF/WhatsApp preservada                          |
|     4 | CP-E - mapear/pre-split share/WhatsApp             | Separar Web Share, upload, wa.me e fallback local                         | `shareReport.js` e `domain/whatsapp.js` com testes            | Medio/alto | Fallbacks e quota preservados                             |
|     5 | CP-F - mapear/pre-split domain/pdf                 | Separar orquestrador PDF de sections/resolvers                            | `domain/pdf.js` e sections, sem UI move amplo                 | Alto       | PDFGenerator e contracts passam                           |
|     6 | CP-G - desacoplar domain/pdf de UI                 | Injetar resolver de assinatura/onboarding ou mover dependencias de camada | Domain/UI pequenos e testados                                 | Alto       | Sem import UI em `src/domain/pdf*` ou excecao documentada |
|     7 | CP-H - mapear Relatorio/Historico card actions     | Mapear consumidores de card export/share em Relatorio e Historico         | Docs/testes                                                   | Medio      | CTAs e data attrs documentados                            |
|     8 | CP-I - checkpoint/stability Mudanca 13             | Consolidar validacoes e decidir proxima mudanca                           | Docs/validacao                                                | Baixo      | `npm run check` e contratos passam                        |

## 11. Proximo CP recomendado

Recomendado: **CP-B - contratos adicionais relatorio/PDF**.

Confianca: 90%+. O inventario mostra cobertura relevante ja existente, mas `reportExportHandlers.js` concentra os riscos mais altos e ainda nao ha contrato dedicado suficiente para separar budget PDF, budget WhatsApp, preview opt-in, fallback de share/upload e paridade de filtros PDF/WhatsApp em uma matriz unica. Fortalecer contratos antes do pre-split reduz o risco de regressao em quota, `registroId`, download/share e consumo de assinatura/fotos/checklist.

## 12. CP-B - Contratos adicionais Relatorio/PDF

- Status: aplicado.
- Teste criado: `src/__tests__/reportExportContracts.test.js`.
- Cobertura adicionada:
  - actions publicas `data-action="export-pdf"` e `data-action="whatsapp-export"`;
  - `data-registro-id` como fonte de filtro por registro;
  - paridade entre `filterRegistrosForReport` e `WhatsAppExport.generateText` para `filters.registroId`;
  - prioridade de `filters.registroId` sobre filtros amplos de equipamento/periodo;
  - `exportPdfFlow` mantendo quota/gating com recurso `pdf_export`;
  - `shareWhatsAppFlow` mantendo quota/gating com recurso `whatsapp_share`;
  - `shareReportPdf` recebendo `metadata.userId` e `metadata.registroId`;
  - fallback share/upload documentado por contrato estatico em `shareReport.js` e `shareReport.test.js`;
  - consumo PDF de `registro.fotos`, `registro.assinatura` e `registro.checklist.tipo_template/items`;
  - acoplamento conhecido `domain/pdf.js` -> `ui/components/signature.js` registrado como baseline de risco.
- Lacunas remanescentes:
  - validacao visual completa do PDF sem snapshot gigante;
  - integracao real Web Share/Supabase/browser;
  - cobertura de todos os caminhos de erro de preview/PMOC;
  - desacoplamento arquitetural de `domain/pdf.js` e `domain/pdf/shareReport.js` ainda pendente.
- Nenhum comportamento foi alterado; CP-B ficou restrito a teste e inventario.
- Proximo CP recomendado: **CP-C - pre-split reportExportHandlers**.

## 13. CP-C - Pre-split reportExportHandlers

- Status: aplicado.
- Arquivo alterado: `src/ui/controller/handlers/reportExportHandlers.js`.
- `reportExportHandlers.js` permaneceu no mesmo arquivo; nenhum fluxo foi movido para `domain`, `features` ou outro modulo.
- Helpers locais criados/ajustados:
  - `resolvePdfExportBudget`: encapsula a porta de quota/gating PDF preservando `ensureReportBudget`;
  - `generateReportPdfBlob`: centraliza o dynamic import de `domain/pdf.js` e a chamada a `PDFGenerator.generateMaintenanceReport`;
  - `confirmPdfExportPreview`: isola preview opt-in do PDF e cancelamento com telemetry;
  - `showPdfExportSuccess`: isola toast de sucesso e refresh de quota badge;
  - `markReportPdfOnboardingStep`: preserva o passo de onboarding sem quebrar o fluxo;
  - `buildWhatsAppLimitMessage`: isola mensagem de limite WhatsApp;
  - `resolveWhatsAppShareBudget`: encapsula Auth, tentativa, quota/gating e fallback pricing do WhatsApp;
  - `confirmWhatsAppSharePreview`: isola preview opt-in do WhatsApp;
  - `shareReportPdfWithWhatsApp`: centraliza dynamic import de `shareReportPdf` e metadata `userId`/`registroId`;
  - `commitWhatsAppShareUsage`: preserva incremento apenas para planos com limite finito;
  - `buildWhatsAppSuccessCopy` e `showWhatsAppShareSuccess`: isolam copy/canal e toast de sucesso.
- Responsabilidades separadas: quota PDF, geracao PDF Blob, preview PDF, download/sucesso PDF, quota WhatsApp, preview WhatsApp, share/fallback e sucesso WhatsApp.
- Nenhuma mudanca funcional intencional; ordem de quota, geracao, preview, download/share, commit e Toast preservada.
- Contratos CP-B preservados: `export-pdf`, `whatsapp-export`, `data-registro-id`, `filters.registroId`, quota PDF/WhatsApp, `shareReportPdf`, fallback share/upload, fotos, assinatura e checklist/PMOC.
- LOC `src/ui/controller/handlers/reportExportHandlers.js`: 655 -> 719 (+64).
- Proximo CP recomendado: **CP-D - mover helpers seguros de reportExportHandlers**.

## 14. CP-D - Mover helpers seguros de reportExportHandlers

- Status: aplicado.
- Helper seguro movido:
  - `buildWhatsAppSuccessCopy`: movido para `src/features/relatorio/export/reportExportHelpers.js`; helper puro de copy por canal, sem DOM, Toast, Router, quota, Auth, dynamic import, PDFGenerator, share/upload ou persistencia.
- Teste criado: `src/features/relatorio/__tests__/export/reportExportHelpers.test.js`.
- Helpers mantidos em `src/ui/controller/handlers/reportExportHandlers.js`:
  - `resolvePdfExportBudget`: mantido por usar `ensureReportBudget`, Auth/billing/usage, Toast e Router indiretamente;
  - `generateReportPdfBlob`: mantido por dynamic import e chamada direta ao `PDFGenerator`;
  - `confirmPdfExportPreview`: mantido por preview/modal/localStorage/ObjectURL;
  - `showPdfExportSuccess`: mantido por Toast e refresh de quota badge;
  - `markReportPdfOnboardingStep`: mantido por onboarding/telemetry defensivo;
  - `resolveWhatsAppShareBudget`: mantido por Auth, usage, quota, Toast e `goTo`;
  - `confirmWhatsAppSharePreview`: mantido por preview/modal/localStorage/ObjectURL;
  - `shareReportPdfWithWhatsApp`: mantido por dynamic import de `shareReportPdf` e fluxo de share/upload/fallback;
  - `commitWhatsAppShareUsage`: mantido por persistir uso mensal;
  - `showWhatsAppShareSuccess`: mantido por Toast/badge e composição de feedback visual.
- `exportPdfFlow`, `shareWhatsAppFlow` e o adapter `reportExportHandlers.js` permaneceram como orquestradores.
- Nenhuma mudanca funcional intencional; contratos CP-B preservados.
- LOC `src/ui/controller/handlers/reportExportHandlers.js`: 719 -> 709 (-10).
- LOC `src/features/relatorio/export/reportExportHelpers.js`: 9.
- Proximo CP recomendado: **CP-E - pre-split share/WhatsApp**.

## 15. CP-E - Pre-split share/WhatsApp

- Status: aplicado.
- Arquivo alterado: `src/domain/pdf/shareReport.js`.
- `shareReportPdf` permaneceu no mesmo arquivo e com a mesma assinatura publica.
- Helpers locais criados:
  - `buildShareReportContext`: normaliza `safeName`, `metadata`, `whatsappText`, `pdfBlob` e `supabaseClient` para o orquestrador;
  - `tryNativeShareReport`: encapsula a rota Web Share API preservando sucesso, cancelamento e queda para fallback em erro real;
  - `uploadShareReportAndOpenWhatsApp`: encapsula upload para Supabase Storage, montagem da mensagem e abertura do `wa.me`;
  - `downloadShareReportFallback`: encapsula `handleError` silencioso e download local final.
- Responsabilidades separadas: contexto, Web Share, upload/link WhatsApp e fallback de download.
- Nenhuma mudanca funcional intencional; ordem Web Share -> upload/wa.me -> download fallback preservada.
- Contratos CP-B preservados: `shareReportPdf`, metadata `userId`/`registroId`, fallback share/upload, Web Share, download fallback e `filters.registroId` via handler.
- `reportExportHandlers.js`, `shareWhatsAppFlow`, `domain/pdf.js`, `relatorio.js`, `historico.js`, Registro e Equipamentos nao foram alterados.
- LOC `src/domain/pdf/shareReport.js`: 299 -> 330 (+31).
- Proximo CP recomendado: **CP-F - mover helpers seguros de shareReport**.

## 16. CP-F - Mover helpers seguros de shareReport

- Status: aplicado.
- Helper seguro movido:
  - `buildShareReportContext`: movido para `src/domain/pdf/shareReportHelpers.js`; helper puro de montagem de contexto, com DI explicita para `buildSafeReportFileName`, sem import de `shareReport.js`, handlers, Supabase/storage, Web Share, DOM, Toast ou Router.
- Teste criado: `src/__tests__/shareReportHelpers.test.js`.
- Helpers mantidos em `src/domain/pdf/shareReport.js`:
  - `tryNativeShareReport`: mantido por usar Web Share API via `canSharePdfFile`/`sharePdfFileNative`;
  - `uploadShareReportAndOpenWhatsApp`: mantido por chamar upload Supabase/storage, montar mensagem e abrir `wa.me`;
  - `downloadShareReportFallback`: mantido por chamar `handleError` e download local com DOM/ObjectURL.
- `shareReportPdf` permaneceu no modulo atual e com a mesma assinatura publica; fluxo completo de share/WhatsApp nao foi movido.
- Nenhuma mudanca funcional intencional; ordem Web Share -> upload/wa.me -> download fallback preservada.
- Contratos CP-B preservados: `shareReportPdf`, metadata `userId`/`registroId`, fallback share/upload, Web Share, download fallback e `filters.registroId` via handler.
- `reportExportHandlers.js`, `shareWhatsAppFlow`, `exportPdfFlow`, `domain/pdf.js`, `relatorio.js`, `historico.js`, Registro e Equipamentos nao foram alterados.
- LOC `src/domain/pdf/shareReport.js`: 330 -> 319 (-11).
- LOC `src/domain/pdf/shareReportHelpers.js`: 20.
- Proximo CP recomendado: **CP-G - mapear/pre-split domain/pdf**.

## 17. CP-G - Mapear domain/pdf

- Status: aplicado.
- Documento criado: `docs/migration/mudanca-13-cp-g-domain-pdf-map.md`.
- CP documental/read-only: nenhum arquivo em `src/` foi alterado e nenhum teste foi alterado.
- Domain PDF mapeado:
  - `src/domain/pdf.js` como orquestrador de `PDFGenerator.generateMaintenanceReport`;
  - `src/domain/pdf/reportModel.js` como modelo/filtro e OS/localStorage;
  - `src/domain/pdf/sections/services.js` como render de servicos e fotos/evidencias;
  - `src/domain/pdf/sections/signatures.js` como render de comprovantes/assinaturas;
  - `src/domain/pdf/sections/checklist.js` e `src/domain/pdf/pmoc/*` como consumo PMOC/checklist;
  - `src/domain/pdf/shareReport.js` e `src/domain/pdf/shareReportHelpers.js` como fluxo share/WhatsApp/fallback.
- Acoplamentos registrados:
  - `domain/pdf.js` importa `ui/components/signature.js`;
  - sections de PDF dependem de storage/resolvers e dados legados de Registro;
  - `shareReport.js` ainda mistura Supabase, Web Share, DOM/download, onboarding e erro;
  - `reportExportHandlers.js` permanece como composition root para quota, preview, PDF e share.
- Riscos mapeados: fotos/evidencias, assinatura, checklist/PMOC, `filters.registroId`, layout visual, dados ausentes, import circular por inversao de camada e dynamic imports/chunks.
- LOC principais medidos:
  - `src/domain/pdf.js`: 138;
  - `src/domain/pdf/reportModel.js`: 76;
  - `src/domain/pdf/sections/services.js`: 461;
  - `src/domain/pdf/sections/checklist.js`: 174;
  - `src/domain/pdf/sections/cover.js`: 597;
  - `src/domain/pdf/sections/signatures.js`: 242;
  - `src/domain/pdf/shareReport.js`: 319;
  - `src/domain/pdf/shareReportHelpers.js`: 20;
  - `src/domain/pdf/pmoc/pmocReport.js`: 181;
  - `src/ui/controller/handlers/reportExportHandlers.js`: 709.
- Proximo CP recomendado: **CP-H - contrato adicional para domain/pdf consumo de fotos/assinatura/checklist**.

## 18. CP-H - Contrato domain/pdf para fotos, assinatura e checklist

- Status: aplicado.
- Teste criado: `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js`.
- Cobertura adicionada:
  - `PDFGenerator.generateMaintenanceReport` preserva `filters.registroId` quando o registro alvo tem fotos, assinatura e checklist;
  - `registro.fotos` com data URL e referencia legada/objeto e encaminhado para `resolvePhotoDataUrlForPdf`;
  - falha/ausencia de foto nao derruba a geracao e preserva fallback visual "Foto indisponivel";
  - `registro.assinatura` e encaminhado para o resolver de assinatura importado por `domain/pdf.js`;
  - falha/ausencia de assinatura nao derruba a geracao e preserva fallback visual de assinatura ausente;
  - `registro.checklist.tipo_template` e `registro.checklist.items` continuam aceitos pela section `drawChecklist`;
  - itens pendentes sem status nao entram no corpo renderizado do checklist;
  - ausencia de checklist no registro nao derruba a geracao.
- Baseline documentado:
  - acoplamento `domain/pdf.js` -> `ui/components/signature.js` permanece intencionalmente inalterado neste CP;
  - caminho de fallback de assinatura emite log conhecido quando assinatura marcada fica indisponivel;
  - suite pode emitir warning conhecido de GoTrue/Supabase em ambiente JSDOM ao carregar dependencias legadas.
- Nenhuma mudanca funcional intencional; nenhum arquivo de producao foi alterado.
- Lacunas remanescentes:
  - sem snapshot visual grande de PDF;
  - sem validacao pixel/layout real das sections;
  - desacoplamento de assinatura UI e resolvers de foto ainda pendente.
- Proximo CP recomendado: **CP-I - pre-split domain/pdf.js**.

## 19. CP-I - Pre-split domain/pdf.js

- Status: aplicado.
- Arquivo alterado: `src/domain/pdf.js`.
- `PDFGenerator` e `generateMaintenanceReport` permaneceram no mesmo arquivo e com a mesma assinatura publica.
- Helpers locais criados:
  - `buildPdfGenerationContext`: normaliza `options`, filtros, state, `Profile` e `planCode`;
  - `buildPdfDocumentModel`: aplica `filterRegistrosForReport`, monta OS, emissao, cliente e `reportContext`;
  - `buildPdfDocumentSurface`: cria `jsPDF` e dimensoes/margem usadas pelas sections;
  - `renderPdfCoverSection`: encapsula chamada a `drawCover` preservando argumentos;
  - `renderPdfServicesSection`: encapsula `doc.addPage` e `drawServices` preservando ordem;
  - `resolvePdfSignatureDataUrls`: pre-resolve assinaturas em `Map` com fallback silencioso;
  - `renderPdfSignatureSection`: encapsula `drawSignaturePages` e getter sync de assinatura;
  - `renderPdfFreePlanBranding`: encapsula upsell e watermark para plano Free;
  - `renderPdfFooter`: encapsula `stampFooterTotals`;
  - `finalizePdfDocument`: preserva retorno `{ fileName, blob }` quando `asBlob` e `doc.save` no fluxo normal;
  - `handlePdfGenerationFailure`: preserva log `[PDF v8]` e retorno `null`.
- Responsabilidades separadas: contexto, modelo/filtros, superficie PDF, cover, services/fotos, assinatura, free plan, footer, finalizacao e fallback.
- Nenhuma mudanca funcional intencional; ordem de cover -> services -> signatures -> upsell/watermark -> footer -> blob/save preservada.
- Contratos CP-H preservados: `registro.fotos`, `registro.assinatura`, `registro.checklist.tipo_template/items`, fallback de midia/assinatura e `filters.registroId`.
- Contratos CP-B preservados: `PDFGenerator`, `filterRegistrosForReport`, share/report export, `shareReportPdf` e fluxo PDF/WhatsApp via handlers.
- `domain/pdf/sections`, `shareReport`, `reportExportHandlers`, `relatorio.js`, `historico.js`, Registro e Equipamentos nao foram alterados.
- LOC `src/domain/pdf.js`: 138 -> 194 (+56).
- Testes rodados:
  - `pdfGenerator.mediaChecklist.contract.test.js`, `pdfGenerator.registroId.test.js`, `reportExportContracts.test.js`: 3 arquivos, 9 testes, passou;
  - bateria relacionada `reportExportHandlers`, `shareReport`, `shareReportHelpers`, `whatsappExport`, `reportModel.registroId`, `registroChecklistPmoc`, `pmocReport`, `reportExportHelpers`: 8 arquivos, 57 testes, passou.
- Warnings conhecidos observados: GoTrue/Supabase e log de assinatura indisponivel no fallback CP-H; JSDOM navigation no teste de handlers.
- Proximo CP recomendado: **CP-J - mover helpers seguros de domain/pdf.js**.
