# Mudanca 19 / CP-A - Planejamento de monetizacao PDF/cotas

## 1. Estado inicial

- Branch: `main`
- HEAD inicial: `815a345c4010a05f91c3ecd57253df2e321f5a9e`
- Working tree inicial: limpo (`git status --short` sem saida)
- Escopo executado: analise read-only de PDF, WhatsApp, planos, usage/cotas, exportacao e testes. Nenhuma mudanca funcional foi feita.

## 2. Diagnostico atual dos planos e limites

### Planos e feature gate

Os planos canonicos ficam em `src/core/plans/subscriptionPlans.js`.

- `FEATURE_PDF_EXPORT` existe e tem plano minimo `free`.
- `assertFeature(profile, FEATURE_PDF_EXPORT)` permite PDF em todos os planos.
- O comentario atual ainda documenta a decisao anterior: PDF liberado para todos, com cotas mensais diferenciadas e marca d'agua no Free.
- Na pratica, a cota de PDF hoje esta ilimitada para todos os planos em `src/core/usageLimits.js`.

O catalogo `PLAN_CATALOG` define limites de entidades e texto comercial:

- Free:
  - `clientes: 1`
  - `equipamentos: 3`
  - `registros: Infinity`
  - perks incluem "Relatorios em PDF com marca d'agua" e "5 envios de relatorio via WhatsApp/mes".
- Plus:
  - `clientes: 50`
  - `equipamentos: 15`
  - `registros: Infinity`
  - perks incluem PDF profissional sem marca d'agua e 60 envios via WhatsApp/mes.
- Pro:
  - `clientes`, `equipamentos` e `registros` sem limitacao relevante.
  - perks incluem PDF e WhatsApp ilimitados.

### Limites mensais atuais

Os limites mensais ficam em `src/core/usageLimits.js`, no objeto interno `MONTHLY_LIMITS`.

Estado atual:

- `pdf_export`
  - Free: `Infinity`
  - Plus: `Infinity`
  - Pro: `Infinity`
- `whatsapp_share`
  - Free: `5`
  - Plus: `60`
  - Pro: `Infinity`
- `nameplate_analysis`
  - Free: `1`
  - Plus: `30`
  - Pro: `200`

Portanto, o problema conhecido esta confirmado: PDF esta efetivamente ilimitado para todos os planos. No Free, a diferenciacao atual e a marca d'agua, nao o bloqueio por cota.

### Pontos que precisarao mudar futuramente

Para implementar Free com 1 PDF/mes, a mudanca minima futura deve tocar:

- `src/core/usageLimits.js`: mudar `MONTHLY_LIMITS.free.pdf_export` de `Infinity` para `1`.
- `src/core/plans/subscriptionPlans.js`: alinhar comentarios/perks/account chips ao novo contrato.
- Possivelmente `src/ui/components/usageMeter.js`: hoje "relatorios" ali contam registros do mes, nao PDFs exportados; nao deve virar fonte de verdade para cota de PDF sem CP dedicada.
- `src/ui/components/pdfQuotaBadge.js` e `src/ui/components/pdfSuccessToast.js`: a infraestrutura ja existe para limite finito.
- `src/ui/controller/handlers/reportExportHandlers.js`: confirmar mensagem, CTA, incremento e bloqueio no fluxo real.

## 3. Diagnostico atual do fluxo PDF/WhatsApp

### Entradas publicas

As entradas publicas principais sao:

- `data-action="export-pdf"`
- `data-action="whatsapp-export"`

Elas aparecem na tela Relatorios, em cards de Historico/Relatorio e no pos-save de Registro.

O binding fica em `src/ui/controller/handlers/reportExportHandlers.js`:

- `bindPdfExport()` registra `on('export-pdf', ...)`.
- `bindWhatsAppExport()` registra `on('whatsapp-export', ...)`.
- `bindReportExportHandlers()` registra PDF, WhatsApp e PMOC formal.

### Fluxo de exportacao PDF

O fluxo `export-pdf` passa por:

1. `getReportFilters()`
   - Le filtros da view Relatorios (`#rel-equip`, `#rel-de`, `#rel-ate`).
   - Preserva `triggerEl.dataset.registroId` quando a acao vem de card.
2. `exportPdfFlow()`
   - Normaliza filtros via `buildReportFilters()`.
   - Usa `runAsyncAction()` quando ha botao/trigger.
3. `executePdfExport()`
   - Chama `resolvePdfExportBudget()`.
   - Gera PDF como Blob via `generateReportPdfBlob(filters, planCode)`.
   - Opcionalmente mostra preview se `localStorage.cooltrack-pdf-preview === 'true'`.
   - Faz download local com `<a download>`.
   - Chama `budget.commit()`.
   - Mostra `PdfSuccessToast`.
   - Atualiza `PdfQuotaBadge`.
   - Marca passo `pdf` no onboarding legado.

O budget do PDF fica em `ensureReportBudget()`:

- Exige usuario autenticado via `Auth.getUser()`.
- Busca billing/profile com `fetchMyProfileBilling()`.
- Resolve plano com `getEffectivePlan(profile)`.
- Busca uso mensal com `getMonthlyUsageSnapshot(user.id)`.
- Consulta limite com `getMonthlyLimitForPlan(planCode, 'pdf_export')`.
- Bloqueia com `hasReachedMonthlyLimit()`.
- Se bloqueado, emite telemetria, mostra `Toast.warning()` e navega para `pricing`.
- O `commit()` incrementa somente se o limite for finito.

Como o limite atual de PDF e `Infinity` em todos os planos, `commit()` nao chama `incrementMonthlyUsage()` para PDF hoje.

### Geracao do PDF e marca d'agua Free

A geracao fica em `src/domain/pdf.js`:

- `PDFGenerator.generateMaintenanceReport(options, context)` monta contexto, capa, servicos, assinatura, branding Free e footer.
- O `planCode` vem do handler e e passado no contexto do PDF.
- `renderPdfFreePlanBranding()` aplica comportamento Free quando `planCode === 'free'`.
- Para Free, o PDF recebe:
  - `drawUpsellBlock()`
  - `drawWatermarkAllPages()`

O bloco de upsell fica em `src/domain/pdf/sections/upsell.js`.

Ponto importante: o PDF pode ser gerado sem cliente associado. `extractClientBlock()` em `src/domain/pdf/reportModel.js` retorna `null` se o registro nao tiver dados de cliente, e a capa deve seguir sem bloco de cliente.

### Fluxo WhatsApp/share

O fluxo `whatsapp-export` passa por:

1. `shareWhatsAppFlow()`
2. `executeWhatsAppShare()`
3. `resolveWhatsAppShareBudget()`
4. `generateReportPdfBlob(filters, planCode)`
5. `WhatsAppExport.generateText(filters)` para prefixo textual quando houver registros
6. `shareReportPdfWithWhatsApp()`
7. `shareReportPdf()` em `src/domain/pdf/shareReport.js`

`shareReportPdf()` decide o canal:

- Web Share API com arquivo, quando `navigator.share`/`navigator.canShare({ files })` estao disponiveis.
- Upload para Supabase Storage bucket `relatorios` + signed URL + `wa.me`.
- Fallback final para download local quando upload/share online falha.

Cancelamento do Web Share retorna `{ ok: false, cancelled: true }` e nao consome cota.

O incremento de `whatsapp_share` ocorre somente quando `shareResult.ok` e verdadeiro e o limite do plano e finito.

WhatsApp sem telefone cadastrado nao e bloqueado hoje. O app usa compartilhamento generico:

- Web Share deixa o tecnico escolher o destino.
- Fallback `wa.me/?text=...` abre mensagem sem telefone especifico.

Nao existe acoplamento automatico entre relatorio tecnico e financeiro/orcamento nesse fluxo.

## 4. Diagnostico de usage/cotas

### Fonte de dados mensal

`src/core/usageLimits.js` centraliza os recursos mensais:

- `USAGE_RESOURCE_PDF_EXPORT = 'pdf_export'`
- `USAGE_RESOURCE_WHATSAPP_SHARE = 'whatsapp_share'`
- `USAGE_RESOURCE_NAMEPLATE_ANALYSIS = 'nameplate_analysis'`

O snapshot vem de Supabase:

- tabela: `usage_monthly`
- colunas lidas: `resource`, `used_count`
- filtro por `user_id`
- filtro por `month_start`

`normalizeMonthStart()` usa o primeiro dia do mes em UTC (`YYYY-MM-01`). Isso define o reset mensal implicitamente: cada mes grava/lida uma linha diferente por `month_start`.

### Incremento

O incremento passa por RPC:

- funcao: `increment_monthly_usage`
- parametros:
  - `p_user_id`
  - `p_resource`
  - `p_month_start`
  - `p_delta`

As migrations e documentos de seguranca indicam que, apos a Mudanca 17, escrita direta em `usage_monthly` foi bloqueada para usuarios e o caminho esperado e a RPC `public.increment_monthly_usage()`.

### Offline e fallback

O comportamento atual de `usageLimits` e permissivo em erro:

- `getMonthlyUsageSnapshot()` retorna contadores zerados quando a query falha.
- `incrementMonthlyUsage()` retorna `0` quando a RPC falha.

Esse comportamento evita quebrar o fluxo principal, mas e ponto sensivel para monetizacao:

- se a rede falhar, o app pode considerar `pdf_export = 0`;
- no modelo atual, isso nao importa porque PDF e ilimitado;
- com Free = 1 PDF/mes, essa estrategia pode permitir bypass comercial offline;
- bloquear totalmente offline tambem pode quebrar o valor de campo do app.

Para a implementacao futura, a decisao de produto/tecnica precisa escolher entre:

- bloquear PDF Free quando nao conseguir validar cota remota;
- permitir um fallback local defensivo e sincronizar depois;
- manter WhatsApp/share generico sem consumir PDF se a acao nao for download direto;
- registrar risco comercial de bypass se a contagem remota falhar.

### UI de limite ja existente

Ja existem componentes preparados para limite finito:

- `PdfQuotaBadge`
  - mostra `X/Y PDFs este mes`.
  - aplica tons warning/danger.
  - hoje fica escondido porque `pdf_export` e `Infinity`.
- `PdfSuccessToast`
  - mostra contador quando recebe limite finito.
  - hoje recebe apenas `fileName` para PDF nos planos ilimitados.
- `ShareSuccessToast`
  - mostra contador de WhatsApp quando limite e finito.

## 5. Testes/contratos atuais que precisarao mudar

### `src/__tests__/usageLimits.test.js`

Comportamento antigo atual:

- espera `getMonthlyLimitForPlan('free', 'pdf_export') === Infinity`;
- espera `plus` e `pro` com PDF infinito;
- espera que Free com `usedCount: 200` nao atinja limite de PDF.

Comportamento novo esperado:

- Free PDF deve ter limite `1`;
- Free com `usedCount: 0` ainda pode gerar;
- Free com `usedCount: 1` deve estar bloqueado;
- Plus/Pro devem preservar limites altos ou infinitos conforme decisao da CP-B.

### `src/__tests__/reportExportHandlers.test.js`

Comportamento antigo atual:

- "allows Free users under the monthly PDF quota" na pratica usa limite infinito e confirma que PDF Free nao incrementa `pdf_export`.
- "blocks Free users once they hit the monthly PDF quota" existe, mas depende de mock artificial de `hasReachedMonthlyLimit`.
- Pro nao incrementa quota.
- WhatsApp consome `whatsapp_share` somente quando share ok.

Comportamento novo esperado:

- Free com uso `0/1` gera PDF, chama `incrementMonthlyUsage('u1', 'pdf_export')` e mostra contador `1/1`.
- Free com uso `1/1` bloqueia antes de gerar PDF, mostra upgrade/paywall e nao chama generator.
- Pro continua sem incremento se permanecer ilimitado.
- Plus deve seguir regra definida na CP-B futura.
- Cancelamento de preview nao deve consumir cota.

### `src/__tests__/pdfQuotaBadge.test.js`

Comportamento atual:

- ja possui cobertura para renderizar badge quando o mock retorna limite finito.
- tambem cobre esconder para guest e Pro.

Mudanca provavel:

- adicionar/ajustar caso realista de Free com limite `1`.
- garantir que o badge aparece na view Relatorios quando Free tem cota finita.

### `src/__tests__/pdfSuccessToast.test.js`

Comportamento atual:

- ja cobre contador para limite finito.

Mudanca provavel:

- preservar e talvez adicionar caso `1/1` com mensagem de cota esgotada.

### `src/__tests__/usageMeter.test.js`

Comportamento antigo atual:

- espera que relatorios no Free sejam ilimitados e aparecam apenas como "com marca d'agua".
- `getUsageState()` nao trata relatorios como limite finito porque `PLAN_CATALOG.free.limits.registros` e `Infinity`.

Ponto de atencao:

- Esse medidor conta registros do mes, nao PDFs exportados. Nao deve ser atualizado para "PDFs" por atalho sem uma decisao especifica de UX.
- Se a linguagem comercial mudar, os textos do teste podem precisar ser ajustados.

### `src/__tests__/shareReport.test.js`

Comportamento atual:

- cobre Web Share, upload + `wa.me`, cancelamento e fallback download.

Mudanca provavel:

- nao precisa mudar para cota PDF se a cota ficar no handler antes do share.
- deve ser preservado para garantir WhatsApp sem telefone e fallback.

### Testes de Registro/pos-save

Arquivos relevantes:

- `src/features/registro/__tests__/save/reportShare.test.js`
- `src/features/registro/__tests__/save/postSave.test.js`
- `src/__tests__/registroPdfWhatsappLegacyContracts.test.js`
- `src/__tests__/registroPostSaveLegacyFlow.test.js`

Comportamento a preservar:

- pos-save chama `shareWhatsAppFlow`/`exportPdfFlow` com `registroId`;
- fallback para Relatorios permanece;
- bloqueio de PDF Free nao deve quebrar salvamento do registro;
- WhatsApp continua destino principal.

### Testes de contratos Relatorio/Historico

Arquivos relevantes:

- `src/__tests__/reportExportContracts.test.js`
- `src/__tests__/historicoPdfWhatsappIntegration.contract.test.js`
- `src/__tests__/relatorioExportPmocLegacyHandlers.test.js`
- `src/__tests__/criticalFlow.contract.test.js`

Comportamento a preservar:

- `data-action="export-pdf"` e `data-action="whatsapp-export"`;
- `data-registro-id`;
- prioridade de `filters.registroId`;
- PDF e WhatsApp usando o mesmo registro.

## 6. Proposta de implementacao futura em CPs pequenas

### CP-B - Catalogo de limites PDF por plano e helper puro de decisao

Objetivo:

- Alterar o contrato de `usageLimits` para Free com 1 PDF/mes.
- Criar ou consolidar helper puro para decisao de PDF:
  - plano;
  - uso atual;
  - limite;
  - permitido/bloqueado;
  - CTA recomendado.

Escopo sugerido:

- `src/core/usageLimits.js`
- testes de `usageLimits`
- talvez `src/core/plans/subscriptionPlans.js` apenas para texto/comentario/perks

Nao tocar ainda em UI complexa de exportacao alem do minimo de contrato.

### CP-C - Bloqueio Free apos 1 PDF/mes no fluxo de exportacao

Objetivo:

- Aplicar o helper no `export-pdf`.
- Bloquear antes de gerar Blob quando Free ja usou 1 PDF.
- Incrementar `pdf_export` somente depois de download confirmado/disparado.
- Preservar Pro/Plus conforme limite definido.

Escopo sugerido:

- `src/ui/controller/handlers/reportExportHandlers.js`
- `src/ui/components/pdfQuotaBadge.js`
- `src/ui/components/pdfSuccessToast.js`
- testes focados de `reportExportHandlers`, badge e toast

Decisoes importantes:

- Se WhatsApp deve ou nao consumir tambem `pdf_export`.
- Recomendacao inicial: manter WhatsApp consumindo `whatsapp_share`, e aplicar `pdf_export` apenas ao botao de download PDF, porque a direcao de produto diz WhatsApp como destino principal e PDF/download como fallback.

### CP-D - UX de paywall/upgrade e mensagens

Objetivo:

- Melhorar feedback quando Free atinge `1/1`.
- CTA principal deve apontar para Plus.
- Mensagem deve explicar limite sem sugerir que o registro foi perdido.
- Garantir que o usuario ainda pode usar WhatsApp quando aplicavel.

Escopo sugerido:

- Toast/paywall/upgrade existente.
- `pricing` com `highlightPlan: 'plus'`, se o roteador suportar params.
- Evitar redesign amplo.

### CP-E - Testes ampliados e documentacao final

Objetivo:

- Consolidar testes focados.
- Revalidar fluxos de Registro pos-save, Relatorio, Historico e share.
- Criar relatorio final da Mudanca 19.

Escopo sugerido:

- documentacao em `docs/monetization/`;
- testes de regressao focados;
- nenhuma alteracao de PMOC avancado.

### Separar PMOC avancado

PMOC contextual/avancado deve ficar fora da Mudanca 19 de PDF/cotas. PMOC formal ja passa pelo mesmo handler de relatorio, mas alterar seu produto/plano deve ser CP propria para evitar misturar monetizacao de PDF comum com feature Pro de PMOC.

## 7. Riscos e pontos de atencao

- Offline: hoje falha ao ler `usage_monthly` retorna uso zerado. Com Free = 1 PDF/mes isso pode permitir bypass se nao houver politica explicita.
- Contagem local vs remota: `usage_monthly` e remoto; `UsageMeter` conta registros locais e nao serve como fonte de verdade de PDF.
- Reset mensal: e implicito por `month_start = YYYY-MM-01` em UTC. Precisa confirmar que a UX fala "mes" de forma aceitavel para usuarios no Brasil.
- Duplicidade de incremento: PDF direto e WhatsApp geram PDF Blob. Se ambos incrementarem `pdf_export`, o tecnico pode gastar duas cotas por um atendimento. A recomendacao inicial e separar `pdf_export` de `whatsapp_share`.
- WhatsApp sem telefone: deve continuar permitido via Web Share ou `wa.me/?text=...` sem numero.
- PDF sem cliente: deve continuar permitido; `extractClientBlock()` ja trata cliente ausente como opcional.
- Marca d'agua Free: hoje e aplicada em `domain/pdf.js`. A cota Free nao deve remover automaticamente a marca d'agua sem decisao de produto.
- Regressao no pos-save: bloqueio de PDF nao pode bloquear salvamento do registro nem a sugestao de envio via WhatsApp.
- Share/upload fallback: `shareReportPdf()` pode cair para download local se upload falhar; isso precisa continuar funcionando sem consumir cota indevida em cancelamentos.
- Billing/RLS: `usage_monthly` foi endurecida na Mudanca 17. Mudanca 19 nao deve reabrir escrita direta client-side.
- Handler concentrado: `reportExportHandlers.js` concentra PDF, WhatsApp, PMOC, quota, preview e feedback. Mudancas devem ser pequenas e cobertas por testes.
- Texto comercial: `pricing`, `accountChips`, landing e `upgradeNudge` ainda citam PDFs sem marca/ilimitados em pontos diversos; atualizar linguagem deve ser CP controlada para evitar drift.

## 8. Criterios de pronto para CP-A

- Nenhuma mudanca funcional foi feita.
- Nenhum arquivo em `src/`, testes, CSS, configs, migrations, Supabase/Edge Functions, `package.json` ou `package-lock.json` foi alterado.
- Apenas este documento de planejamento foi criado em `docs/monetization/`.
- Comandos executados nesta CP-A:
  - `git status --short`: working tree inicial limpo.
  - `git branch --show-current`: `main`.
  - `git rev-parse HEAD`: `815a345c4010a05f91c3ecd57253df2e321f5a9e`.
  - `npm run format`: passou; apos o comando, `git status --short` mostrou apenas o novo documento em `docs/monetization/`.
  - `npm run build`: passou com warnings Vite conhecidos de import estatico/dinamico e tamanho de chunks.
  - `npm run check`: passou; manteve 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` e os mesmos warnings Vite conhecidos no build.
  - `git diff --check`: passou sem apontamentos.
