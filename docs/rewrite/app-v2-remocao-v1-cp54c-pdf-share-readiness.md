# app-v2 - CP54C readiness de PDF/share/WhatsApp v1

## 1. Objetivo

Mapear o corte seguro para remover PDF/share/WhatsApp legados do runtime v1,
sem reaproveitar esses arquivos no app-v2 e sem misturar assinatura, fotos,
storage ou PMOC real no mesmo checkpoint.

Este CP e documental/readiness. Ele nao remove runtime, nao altera storage,
nao altera Supabase/RLS, nao altera contratos reais de PDF e nao cria uma
implementacao app-v2-native.

## 2. Estado atual confirmado

- Branch: `codex/remove-v1-dashboard-last-service-react-cp3f`.
- HEAD inicial do CP: `e03c626`.
- Worktree inicial: limpo, `ahead 1` por push bloqueado por credencial GitHub.
- `src/app-v2/**` segue sem importar `src/ui/controller/handlers/reportExportHandlers.js`
  ou `src/domain/pdf/**`.
- A view DOM v1 de Relatorio ja foi removida no CP54B1.
- O contrato de exportacao PDF/WhatsApp ainda existe por Historico e Registro
  legados.

## 3. Cadeia legacy ainda ativa

### 3.1 Handler central

Arquivo principal:

- `src/ui/controller/handlers/reportExportHandlers.js`

Responsabilidades ainda concentradas ali:

- registra eventos `export-pdf` e `whatsapp-export`;
- exporta `exportPdfFlow` e `shareWhatsAppFlow`;
- usa `src/domain/pdf.js`;
- usa `src/domain/pdf/shareReport.js`;
- usa `src/domain/pdf/pmoc/pmocReport.js`;
- usa `src/domain/whatsapp.js`;
- resolve assinatura por `src/ui/components/signature.js`;
- mostra feedback por `PdfSuccessToast`, `ShareSuccessToast` e `PdfQuotaBadge`;
- ainda carrega preview modal `modal-pdf-preview` do template v1.

Conclusao: apagar este handler diretamente quebraria Registro/Historico
legados e testes de contrato. O proximo corte deve aposentar primeiro os
consumidores v1 que ainda disparam PDF/WhatsApp.

### 3.2 Consumidores runtime

Consumidores confirmados:

- `src/ui/views/historico/timelineRenderer.js`
  - renderiza `data-action="export-pdf"`;
  - renderiza `data-action="whatsapp-export"`.
- `src/ui/views/registro.js`
  - importa `exportPdfFlow` e `shareWhatsAppFlow`;
  - injeta esses fluxos no pos-salvamento.
- `src/ui/views/registro/save/postSave.js`
  - executa WhatsApp imediato no pos-save;
  - monta CTA de PDF/WhatsApp por DI.
- `src/ui/views/registro/save/reportShare.js`
  - monta filtros e fallback para `goTo('relatorio')`.
- `src/ui/components/postSaveRegistroToast.js`
  - mostra CTAs PDF/WhatsApp no toast legado;
  - ainda possui fallback para `goTo('relatorio')`.
- `src/ui/views/equipamentos/crud/postActions.js`
  - ainda chama `goTo('relatorio')` apos salvar equipamento.
- `src/ui/shell/templates/modals.js`
  - ainda contem `modal-pdf-preview` usado pelo handler.

### 3.3 Testes que ainda protegem o legado

Grupos de teste afetados:

- `src/__tests__/reportExportHandlers.test.js`;
- `src/__tests__/reportExportContracts.test.js`;
- `src/__tests__/historicoPdfWhatsappIntegration.contract.test.js`;
- `src/__tests__/historicoCardActions.contract.test.js`;
- `src/__tests__/criticalFlow.contract.test.js`;
- `src/__tests__/registroPdfWhatsappLegacyContracts.test.js`;
- `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`;
- `src/__tests__/registroPostSaveLegacyFlow.test.js`;
- `src/__tests__/registroSavePostSaveHelpers.test.js`;
- `src/__tests__/registroSaveReportShareHelpers.test.js`;
- testes de Registro que fazem mock de `reportExportHandlers.js`;
- testes diretos de `PdfSuccessToast`, `ShareSuccessToast` e `PdfQuotaBadge`.

Conclusao: a remocao deve atualizar ou aposentar esses testes no mesmo CP em
que o runtime correspondente sair. Manter teste legacy apontando para arquivo
removido criaria falso negativo.

## 4. Bloqueios para delecao direta

1. `reportExportHandlers.js` ainda mistura PDF, WhatsApp, PMOC, assinatura,
   quota e feedback visual.
2. `src/domain/pdf/**` ainda contem gerador tecnico, seções, safe links,
   assinatura, checklist e PMOC.
3. `src/domain/whatsapp.js` ainda e usado pelo fluxo legacy de compartilhamento.
4. Registro e Historico legados ainda exibem CTAs PDF/WhatsApp.
5. O modal de preview PDF ainda vive no template v1.
6. As areas de assinatura, fotos, storage e PMOC foram declaradas como
   reconstrucoes app-v2-native futuras, entao nao devem ser salvas por
   adaptacao do handler legado.

## 5. Corte recomendado

### CP54C1 - Aposentar CTAs PDF/WhatsApp em Historico e Registro v1

Escopo sugerido:

- remover botoes `export-pdf` e `whatsapp-export` da timeline v1;
- remover CTAs PDF/WhatsApp do toast pos-save legado;
- remover fallback `goTo('relatorio')` ligado a PDF/WhatsApp;
- ajustar testes de Historico/Registro que esperam esses CTAs;
- manter apenas estados informativos, sem criar PDF/share app-v2-native.

Validacao focada:

```bash
npm test -- src/__tests__/historicoCardActions.contract.test.js src/__tests__/historicoFilters.contract.test.js src/__tests__/registroSavePostSaveHelpers.test.js src/__tests__/registroSaveReportShareHelpers.test.js --run
```

### CP54C2 - Remover handler e componentes de feedback legacy

Escopo sugerido:

- remover `src/ui/controller/handlers/reportExportHandlers.js`;
- remover `src/ui/components/pdfSuccessToast.js`;
- remover `src/ui/components/shareSuccessToast.js`;
- remover `src/ui/components/pdfQuotaBadge.js`;
- remover `modal-pdf-preview` de `src/ui/shell/templates/modals.js`;
- aposentar testes diretos desses arquivos;
- atualizar gate `legacyV1RemovalContracts.test.js`.

Validacao focada:

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/reportExportContracts.test.js src/__tests__/reportExportHandlers.test.js --run
```

Observacao: os testes `reportExport*` devem ser removidos ou convertidos para
contrato de ausencia no mesmo CP, porque o runtime legado deixara de existir.

### CP54C3 - Remover dominio PDF/share/WhatsApp legado

Escopo sugerido:

- remover `src/domain/pdf.js`;
- remover `src/domain/pdf/shareReport.js`;
- remover `src/domain/pdf/shareReportHelpers.js`;
- remover `src/domain/pdf/reportModel.js` se nao houver consumidor restante;
- remover `src/domain/whatsapp.js` se nao houver consumidor restante;
- remover testes de PDF/share/WhatsApp legados;
- preservar somente documentos de planejamento app-v2-native.

Controle obrigatorio:

- antes de apagar `src/domain/pdf/**`, rodar `rg` para separar arquivos
  tecnicos de PDF simples, PMOC, orcamento, assinatura e safe links;
- se PMOC ainda depender de `src/domain/pdf/pmoc/**`, mover essa remocao para
  CP54F, nao para CP54C;
- nao mexer em `vendor-pdf` ou `manualChunks` neste CP.

## 6. Fora do escopo

- Implementar PDF app-v2-native.
- Implementar WhatsApp app-v2-native.
- Reaproveitar `src/domain/pdf/**` no app-v2.
- Recriar assinatura, fotos, storage/upload ou PMOC.
- Alterar Supabase/RLS, migrations, auth, billing ou pricing.
- Mexer em `manualChunks`, Vite, `package.json` ou dependencias.

## 7. Criterio de pronto do CP54C completo

O CP54C so estara concluido quando:

- nenhum arquivo runtime importar `src/ui/controller/handlers/reportExportHandlers.js`;
- nenhum arquivo runtime renderizar `data-action="export-pdf"` ou
  `data-action="whatsapp-export"`;
- `src/app-v2/**` continuar sem importar `src/domain/pdf/**`,
  `src/domain/whatsapp.js` ou runtime legado;
- handlers, toasts, badge e modal PDF legacy forem removidos;
- dominio PDF/share/WhatsApp legado for removido ou explicitamente reclassificado
  para outro CP sensivel com justificativa;
- build/check passarem ou falhas forem documentadas como bloqueio real.

## 8. Proximo passo imediato

Executar CP54C1. Esse corte remove a superficie clicavel legacy antes de apagar
o handler central, reduzindo risco de quebrar Registro/Historico em metade do
caminho.
