# Mudanca 15 / CP-K - Mapeamento Historico -> PDF/WhatsApp

## 1. Base

- Branch: `main`
- HEAD: `bc6454648847473c248f858401f9f885c914a108`
- Data: 2026-05-09
- Arquivos analisados:
  - `src/ui/views/historico.js`
  - `src/react/pages/HistoricoTimeline.jsx`
  - `src/react/components/CardActions.jsx`
  - `src/ui/controller/handlers/reportExportHandlers.js`
  - `src/domain/pdf/reportModel.js`
  - `src/domain/pdf.js`
  - `src/domain/pdf/shareReport.js`
  - testes relacionados em `src/__tests__` e `src/features/historico/__tests__`
- LOC dos arquivos principais:
  - `src/ui/views/historico.js`: 1586
  - `src/react/pages/HistoricoTimeline.jsx`: 453
  - `src/react/components/CardActions.jsx`: 68
  - `src/ui/controller/handlers/reportExportHandlers.js`: 727
  - `src/domain/pdf/reportModel.js`: 76
  - `src/domain/pdf.js`: 177
  - `src/domain/pdf/shareReport.js`: 319

## 2. Objetivo

Mapear em modo read-only a integracao Historico -> PDF/WhatsApp antes de qualquer pre-split ou extracao, identificando a origem dos `data-action`, o transporte de `data-registro-id`, a conversao para `filters.registroId`, o uso por `PDFGenerator` e `shareReportPdf`, os contratos existentes e os riscos remanescentes.

## 3. Fluxo export-pdf

| Etapa export-pdf         | Responsabilidade                                                 | Arquivos envolvidos                                                                                                                         | Dependencias                                                   | Side effects                                     | Risco                                                          |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| Origem no card Historico | Renderizar a action publica `export-pdf` para o registro do card | `HistoricoTimeline.jsx`, `CardActions.jsx`                                                                                                  | `item.id`, `CardActions registroId`                            | Nenhum direto; gera DOM/React                    | Alto se `registroId` errado ou ausente                         |
| `data-registro-id`       | Transportar o id do registro no botao do card                    | `CardActions.jsx`                                                                                                                           | Prop `registroId`                                              | Nenhum direto                                    | Alto: perder o atributo faz cair em filtros globais            |
| Handler global           | Consumir click por `data-action="export-pdf"`                    | `reportExportHandlers.js`, `core/events.js`                                                                                                 | `on('export-pdf')`, `triggerEl`                                | Captura evento global, chama async flow          | Medio: handler atende Historico e Relatorio                    |
| `buildReportFilters`     | Normalizar filtros e preservar `registroId`                      | `reportExportHandlers.js`                                                                                                                   | `triggerEl?.dataset?.registroId`, campos `#rel-*`              | Leitura DOM dos filtros globais                  | Alto se `registroId` for sobrescrito por filtro ativo          |
| `filters.registroId`     | Priorizar registro exato sobre filtros de equipamento/data       | `reportModel.js`, `generatorHelpers.js`                                                                                                     | `filterRegistrosForReport`                                     | Nenhum direto                                    | Alto: PDF pode sair com registro errado                        |
| Quota/gating PDF         | Validar usuario/plano/limite antes de gerar PDF                  | `reportExportHandlers.js`                                                                                                                   | `Auth`, `fetchMyProfileBilling`, usage limits, `Toast`, `goTo` | Telemetria, Toast, navegacao pricing             | Medio: bloqueio incorreto ou bypass de quota                   |
| `exportPdfFlow`          | Orquestrar loading, geracao e download                           | `reportExportHandlers.js`                                                                                                                   | `runAsyncAction`, `executePdfExport`                           | `data-busy`, download via Blob, Toast de sucesso | Medio: loading/cancelamento/download                           |
| `PDFGenerator`           | Gerar PDF com `asBlob` e contexto do plano                       | `domain/pdf.js`                                                                                                                             | `generateMaintenanceReport`, `buildPdfDocumentModel`           | Cria jsPDF, paginas e Blob                       | Alto: regressao visual/documento                               |
| Fallback/erro            | Tratar falha de geracao ou handler                               | `reportExportHandlers.js`, `domain/pdf.js`                                                                                                  | `Toast.error`, `handleError`                                   | Feedback ao usuario/log                          | Medio: falha silenciosa se erro for engolido                   |
| Testes existentes        | Travar atributos e prioridade do `registroId`                    | `historicoCardActions.contract.test.js`, `reportExportContracts.test.js`, `reportExportHandlers.test.js`, `pdfGenerator.registroId.test.js` | Vitest/mocks                                                   | Nenhum em runtime                                | Lacuna: clique real Historico -> handler -> PDF em teste unico |

## 4. Fluxo whatsapp-export

| Etapa whatsapp-export    | Responsabilidade                                                                 | Arquivos envolvidos                                                                                                                         | Dependencias                                                  | Side effects                                                 | Risco                                                    |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| Origem no card Historico | Renderizar a action publica `whatsapp-export` para o registro do card            | `HistoricoTimeline.jsx`, `CardActions.jsx`                                                                                                  | `item.id`, `CardActions registroId`                           | Nenhum direto; gera DOM/React                                | Alto se card enviar registro errado                      |
| `data-registro-id`       | Transportar o id do registro ate o handler global                                | `CardActions.jsx`                                                                                                                           | Prop `registroId`                                             | Nenhum direto                                                | Alto: sem atributo cai em filtros globais                |
| Handler global           | Consumir click por `data-action="whatsapp-export"`                               | `reportExportHandlers.js`, `core/events.js`                                                                                                 | `on('whatsapp-export')`, `triggerEl`                          | Chama flow async e `handleError` se falhar                   | Medio: handler compartilhado por Relatorio/Historico     |
| `buildReportFilters`     | Normalizar filtros e preservar `registroId`                                      | `reportExportHandlers.js`                                                                                                                   | `triggerEl?.dataset?.registroId`, campos `#rel-*`             | Leitura DOM                                                  | Alto se filtro ativo sobrescrever `registroId`           |
| `filters.registroId`     | Filtrar PDF e texto WhatsApp pelo registro exato                                 | `reportModel.js`, `domain/whatsapp.js`                                                                                                      | `filterRegistrosForReport`, `WhatsAppExport.generateText`     | Nenhum direto                                                | Alto: PDF/texto podem divergir                           |
| Quota/gating WhatsApp    | Validar usuario/plano/limite antes de gerar/share                                | `reportExportHandlers.js`                                                                                                                   | `Auth`, usage limits, `Toast`, `goTo`                         | Telemetria, Toast, navegacao pricing                         | Medio: consumo de quota indevido                         |
| `shareWhatsAppFlow`      | Orquestrar loading, PDF blob, texto e share                                      | `reportExportHandlers.js`                                                                                                                   | `runAsyncAction`, `generateReportPdfBlob`, `shareReportPdf`   | `data-busy`, Toast info/sucesso                              | Alto: pode consumir quota no momento errado              |
| `PDFGenerator`           | Gerar PDF como Blob para o share                                                 | `domain/pdf.js`                                                                                                                             | `generateMaintenanceReport({ asBlob: true })`                 | Cria jsPDF/Blob                                              | Alto: divergencia PDF vs fluxo download                  |
| `shareReportPdf`         | Escolher Web Share ou upload + `wa.me`; fallback download local se upload falhar | `domain/pdf/shareReport.js`                                                                                                                 | Web Share API, Supabase Storage, `window.open`, Blob download | Abre share sheet, faz upload, abre WhatsApp ou baixa arquivo | Alto: fallback/share/upload sao sensiveis ao ambiente    |
| Cancelamento/falha       | Nao consumir quota em cancelamento; avisar em falha real                         | `reportExportHandlers.js`, `shareReport.js`                                                                                                 | `shareResult.ok`, `shareResult.cancelled`                     | Toast warning ou nenhum feedback em cancelamento             | Medio: regressao silenciosa de quota                     |
| Testes existentes        | Travar `registroId`, metadata e fallback basico                                  | `reportExportContracts.test.js`, `reportExportHandlers.test.js`, `whatsappExport.test.js`, `registroPdfWhatsappRegistroId.contract.test.js` | Vitest/mocks                                                  | Nenhum em runtime                                            | Lacuna: clique real Historico -> shareReportPdf completo |

## 5. Contratos publicos

| Contrato Historico -> PDF/WhatsApp | Origem                                              | Consumidor                                                  | Teste existente                                                                           | Risco se alterar                          |
| ---------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- |
| `data-action="export-pdf"`         | `CardActions.jsx`                                   | `reportExportHandlers.bindPdfExport`                        | `historicoCardActions.contract.test.js`, `reportExportContracts.test.js`                  | PDF por card deixa de disparar            |
| `data-action="whatsapp-export"`    | `CardActions.jsx`                                   | `reportExportHandlers.bindWhatsAppExport`                   | `historicoCardActions.contract.test.js`, `reportExportContracts.test.js`                  | WhatsApp por card deixa de disparar       |
| `data-registro-id`                 | `CardActions.jsx`                                   | `getReportFilters`                                          | `historicoCardActions.contract.test.js`, `registroPdfWhatsappRegistroId.contract.test.js` | Export/share pode usar filtros globais    |
| `registroId` prop                  | `HistoricoTimeline.jsx`                             | `CardActions`                                               | `historicoCardActions.contract.test.js`                                                   | Card pode renderizar sem actions          |
| `filters.registroId`               | `buildReportFilters`                                | `PDFGenerator`, `WhatsAppExport`, `shareReportPdf metadata` | `reportExportContracts.test.js`, `registroPdfWhatsappRegistroId.contract.test.js`         | Registro errado no PDF/texto/upload       |
| `buildReportFilters`               | `reportExportHandlers.js`                           | `exportPdfFlow`, `shareWhatsAppFlow`                        | `reportExportHandlers.test.js`, `reportExportContracts.test.js`                           | Divergencia entre PDF e WhatsApp          |
| `exportPdfFlow`                    | `reportExportHandlers.js`                           | Handler global e pos-save Registro                          | `reportExportContracts.test.js`, `reportExportHandlers.test.js`                           | Bypass de quota/download ou filtro errado |
| `shareWhatsAppFlow`                | `reportExportHandlers.js`                           | Handler global e pos-save Registro                          | `reportExportContracts.test.js`, `registroPdfWhatsappRegistroId.contract.test.js`         | Share errado ou quota incorreta           |
| `shareReportPdf`                   | `domain/pdf/shareReport.js`                         | `shareWhatsAppFlow`                                         | `shareReport.test.js`, `reportExportHandlers.test.js`                                     | Falha em Web Share/upload/fallback        |
| Contratos Mudanca 13               | `domain/pdf.js`, `reportModel.js`, `shareReport.js` | PDF/WhatsApp/export handlers                                | `pdfGenerator.registroId.test.js`, `reportExportContracts.test.js`                        | Regressao em filtro por registro          |
| Contrato CP-B Historico            | `HistoricoTimeline.jsx`, `CardActions.jsx`          | Handlers globais                                            | `historicoCardActions.contract.test.js`                                                   | Quebra de actions por card                |

## 6. Dependencias tecnicas

| Dependencia                | Usada onde                                    | Funcao                                   | Acoplamento                          | Risco                                            | Estrategia sugerida                           |
| -------------------------- | --------------------------------------------- | ---------------------------------------- | ------------------------------------ | ------------------------------------------------ | --------------------------------------------- |
| `CardActions`              | `HistoricoTimeline.jsx`, `RelatorioCards.jsx` | Renderizar CTAs PDF/WhatsApp             | Medio: componente compartilhado      | Mudanca afeta Historico e Relatorio              | Contrato integrado antes de alterar           |
| `HistoricoTimeline`        | Historico React island                        | Passar `item.id` para `CardActions`      | Medio: depende do view model         | Card sem id perde actions                        | Manter `item.id` como contrato publico        |
| `reportExportHandlers`     | Controller global                             | Bindar actions e orquestrar export/share | Alto: mistura DOM, quota, PDF, share | Pre-split sem contrato pode quebrar ambos fluxos | CP-L de contrato integrado                    |
| `reportModel`              | PDF generator/helpers/tests                   | Priorizar `registroId` sobre filtros     | Baixo, funcao pura                   | Erro troca registro exportado                    | Manter teste unitario e contrato              |
| `PDFGenerator`             | `exportPdfFlow`, `shareWhatsAppFlow`          | Gerar PDF/download/blob                  | Alto: side effects de jsPDF e layout | Regressao visual/documental                      | Nao mexer sem bateria PDF                     |
| `shareReport`              | `shareWhatsAppFlow`                           | Web Share/upload/fallback download       | Alto: depende de navegador/Supabase  | Falha ambiental ou quota indevida                | Mapear fallback em contrato separado se mexer |
| Quota/gating               | `reportExportHandlers.js`                     | Bloquear/permitir export/share           | Medio-alto                           | Consumo indevido ou bloqueio falso               | Isolar somente apos testes                    |
| `Router/Toast/handleError` | `reportExportHandlers.js`                     | Feedback, pricing e erro                 | Medio                                | Falha silenciosa ou navegacao errada             | Manter no handler ate pre-split seguro        |
| Registro data model        | Registro pos-save e Historico cards           | Fornecer `registroId`                    | Medio                                | Pos-save e Historico divergem                    | Reusar contratos de `registroId`              |
| Filtros ativos `#rel-*`    | `getReportFilters`                            | Fallback toolbar Relatorio               | Medio                                | Podem competir com `data-registro-id`            | Garantir prioridade `registroId`              |

## 7. Testes existentes e lacunas

| Teste                                            | O que cobre                                                                                             | O que nao cobre                           | Importancia | Observacao                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------- | ------------------------------------ |
| `historicoCardActions.contract.test.js`          | `edit/delete/export/whatsapp`, `data-id`, `data-registro-id`, uso de `CardActions`                      | Handler global real com clique de usuario | Alta        | Contrato CP-B do Historico           |
| `reportExportContracts.test.js`                  | Actions publicas, prioridade `filters.registroId`, handlers lendo `data-registro-id`, metadata WhatsApp | Render real do Historico antes do handler | Alta        | Cobre paridade PDF/WhatsApp          |
| `registroPdfWhatsappRegistroId.contract.test.js` | Pos-save Registro, fallback Relatorio, `buildReportFilters`, `filterRegistrosForReport`, `CardActions`  | Origem direta no Historico                | Alta        | Protege contrato Mudanca 13/Registro |
| `reportExportHandlers.test.js`                   | Quota, PDF blob, share, cancelamento, falhas e handlers                                                 | Caso especifico vindo de card Historico   | Alta        | Bom para handler isolado             |
| `whatsappExport.test.js`                         | Texto WhatsApp e prioridade de `registroId`                                                             | `shareReportPdf` e upload/fallback        | Media       | Cobre texto, nao share PDF           |
| `pdfGenerator.registroId.test.js`                | `PDFGenerator` prioriza `registroId`                                                                    | Layout visual/pixel-perfect               | Alta        | Contrato de dominio PDF              |
| `shareReport.test.js`                            | Orquestrador de share/upload/fallback                                                                   | Ponte desde Historico                     | Media       | Relevante para fallback final        |

Lacunas criticas:

- Falta contrato integrado Historico -> PDF/WhatsApp que renderize card, acione handler global e verifique `generateMaintenanceReport`/`shareReportPdf` com o mesmo `registroId`.
- Falta caso explicito de filtros ativos da aba Relatorio coexistindo com `data-registro-id` vindo do Historico.
- Falta teste de divergencia PDF vs WhatsApp no mesmo card do Historico.
- Fallback Web Share/upload/download e quota sao cobertos em partes, mas nao amarrados a origem Historico.

## 8. Riscos principais

- Exportar registro errado se `data-registro-id` sumir ou virar `data-id`.
- Compartilhar registro errado se `filters.registroId` for sobrescrito por `#rel-equip`, `#rel-de` ou `#rel-ate`.
- Perda de `data-registro-id` em `CardActions` afeta Historico e Relatorio.
- `filters.registroId` precisa continuar tendo prioridade em `filterRegistrosForReport`.
- Quota/gating de PDF e WhatsApp tem regras diferentes e side effects de Toast/telemetria/navegacao.
- Fallback share/upload/download depende de navegador, Supabase Storage e Blob.
- PDF e WhatsApp podem divergir se um caminho filtrar por `registroId` e outro por filtros globais.
- Import circular e provavel se helper extraido de Historico importar handler global ou vice-versa.
- Regressao silenciosa possivel porque a maior parte do contrato e por atributos DOM e mocks de handlers.

## 9. Opcoes de proximo CP

| Opcao de proximo CP                                  | Beneficio                                                                      | Risco                                        | Pre-requisitos                                                 | Recomendacao          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- | -------------------------------------------------------------- | --------------------- |
| CP-L - contrato integrado Historico -> PDF/WhatsApp  | Amarra card real, `data-registro-id`, handlers, PDF e share antes de refatorar | Medio: mocks grandes de controller/PDF/share | Reusar mocks de `reportExportContracts` e fixture de Historico | Recomendado           |
| CP-L - pre-split export/share action no Historico    | Reduz acoplamento local de actions                                             | Alto sem contrato integrado                  | Contrato integrado primeiro                                    | Nao recomendado agora |
| CP-L - pre-split handler global reportExportHandlers | Reduz arquivo grande e side effects misturados                                 | Alto: quota/share/PDF no mesmo handler       | Contratos mais fortes e mapa de handler                        | Nao recomendado agora |
| CP-L - stability checkpoint                          | Fecha mudanca com risco mapeado                                                | Baixo                                        | Aceitar manter acoplamento PDF/WhatsApp sem contrato extra     | Prematuro             |
| CP-L - mapear filtros Historico                      | Ajuda futuro pre-split de filtros                                              | Medio                                        | Fluxo PDF/WhatsApp ainda sem contrato integrado                | Pode vir depois       |

## 10. Recomendacao final

Proximo CP recomendado: **CP-L - contrato integrado Historico -> PDF/WhatsApp**.

Justificativa: ha mais de 90% de confianca de que o proximo passo seguro deve ser contrato, nao refatoracao. A cadeia cruza `HistoricoTimeline`, `CardActions`, eventos globais, `reportExportHandlers`, quota/gating, `PDFGenerator`, `WhatsAppExport` e `shareReportPdf`. Os testes atuais cobrem partes boas do contrato, mas ainda falta uma ponte integrada partindo do card do Historico para garantir que `data-registro-id` chega como `filters.registroId` em PDF e WhatsApp mesmo com filtros globais ativos.

## 11. Complemento CP-L

- Contrato criado em `src/__tests__/historicoPdfWhatsappIntegration.contract.test.js`.
- Lacuna reduzida: card real de `HistoricoTimeline/CardActions` agora e usado como `triggerEl` do handler global para `export-pdf` e `whatsapp-export`.
- O contrato confirma que filtros globais ativos nao removem `filters.registroId` vindo de `data-registro-id`.
- O contrato confirma simetria entre PDF e WhatsApp para o mesmo card.
- O proximo corte ficou mais seguro para pre-split local de export/share action no Historico, mantendo `reportExportHandlers` intacto.
