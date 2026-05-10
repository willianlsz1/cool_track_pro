# Mudança 19 — Relatório final de monetização PDF/cotas

## 1. Estado final

- Branch: `main`
- HEAD inicial da Mudança 19: `815a345c4010a05f91c3ecd57253df2e321f5a9e`
- HEAD final operacional atual: `3088f6f99b54920917fbafb3c650b7b0efa19b7e`
- Working tree esperado: limpo

## 2. Resumo executivo

A Mudança 19 implementou a monetização de PDF por cota mensal sem alterar o papel do WhatsApp/share como fluxo separado. O contrato final deixa o plano Free com 1 PDF/mês, o Plus com 50 PDFs/mês e o Pro com PDFs ilimitados ou sem limitação relevante, conforme o padrão atual do produto.

A fase também ativou o bloqueio de cota no fluxo real de exportação, alinhou mensagens de upgrade, ajustou pricing/catálogo/textos comerciais e preservou a marca d'água Free dentro da cota. O relatório técnico continua separado de orçamento/financeiro, e PDF sem cliente continua permitido.

## 3. CPs concluídas

### CP-A — Planejamento PDF/cotas

- Commit: `5ca928ae2aadfd4b8d45d23cf875a514c1a82bf7`
- Resultado:
  - Mapeou o estado de PDF ilimitado.
  - Identificou o uso de `usage_monthly` e `ensureReportBudget()`.
  - Documentou riscos de offline, reset mensal UTC, duplicidade de incremento, PDF sem cliente e WhatsApp sem telefone.

### CP-B — Contrato puro de cota PDF

- Commit: `35819e40b1ebd40321600e2251a5d97010cc88a9`
- Resultado:
  - Adicionou o contrato planejado de PDF:
    - Free: 1 PDF/mês.
    - Plus: 50 PDFs/mês.
    - Pro: `Infinity`.
  - Adicionou helpers puros:
    - `getPdfExportMonthlyQuotaForPlan(planCode)`
    - `hasFinitePdfExportMonthlyQuota(planCode)`
    - `isPdfExportMonthlyQuotaUnlimited(planCode)`

### CP-C — Runtime de cota PDF

- Commit: `10d685eb225a40cc9bbc220cbd1af225e917ba3a`
- Resultado:
  - Ativou `pdf_export` no runtime.
  - Bloqueou Free e Plus ao atingir a cota.
  - Fez o uso de PDF incrementar apenas após exportação bem-sucedida.
  - Preservou PDF sem cliente, marca d'água Free, WhatsApp/share e pós-save.

### CP-D — UX/paywall da cota PDF

- Commit: `2da83178b76089a46e2b8fb82a8c10a49add5101`
- Resultado:
  - Free bloqueado recebe mensagem de limite de 1 PDF/mês.
  - Free bloqueado navega para pricing com `{ highlightPlan: 'plus', reason: 'pdf_quota_free' }`.
  - Plus bloqueado recebe mensagem de limite de 50 PDFs/mês.
  - Plus bloqueado navega para pricing com `{ highlightPlan: 'pro', reason: 'pdf_quota_plus' }`.

### CP-E — Alinhamento pricing/catálogo/textos

- Commit: `3088f6f99b54920917fbafb3c650b7b0efa19b7e`
- Resultado:
  - Free comunica 1 PDF/mês.
  - Plus comunica 50 PDFs/mês.
  - Pro comunica PDFs ilimitados ou sem limitação relevante.
  - Landing React e upsell do dashboard foram alinhados ao mesmo contrato.

## 4. Validações consolidadas

As CPs da Mudança 19 passaram por:

- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- testes focados por área

Validações principais executadas ao longo da fase:

- `usageLimits.test.js`
- `reportExportHandlers.test.js`
- `reportExportContracts.test.js`
- `historicoPdfWhatsappIntegration.contract.test.js`
- `pricing.test.js`
- `subscriptionPlans.test.js`
- `upgradeNudge.test.js`
- `landingPageReact.test.jsx`

Warnings conhecidos preservados como backlog controlado:

- warnings Vite/chunk permanecem.
- 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` permanece.

## 5. Comportamento final esperado

- Free gera até 1 PDF/mês.
- Free bloqueado é orientado para Plus.
- Plus gera até 50 PDFs/mês.
- Plus bloqueado é orientado para Pro.
- Pro não sofre bloqueio por cota PDF.
- PDF sem cliente é permitido.
- Marca d'água Free segue dentro da cota.
- WhatsApp/share não consome `pdf_export`.
- Uso de PDF só incrementa após exportação bem-sucedida.
- Falhas antes da exportação não consomem cota.

## 6. Riscos remanescentes

- UX ainda usa `Toast.warning()` e rota pricing, sem modal dedicado.
- Contagem depende de `usage_monthly`/RPC existente.
- Reset mensal segue UTC.
- Fallback em erro de leitura permanece conforme contrato atual.
- Textos não comerciais fora de pricing/catálogo podem ser revisados em fase futura de copy/design.
- Warnings Vite/chunk permanecem.
- Warning ESLint conhecido em `src/domain/pdf/shareReport.js` permanece.

## 7. Próximas fases recomendadas

### Mudança 20 — PMOC contextual/avançado

Escopo provável:

- PMOC contextual por cliente/equipamento.
- Checklist recolhido.
- Selo Pro para recursos avançados.
- Sem misturar com redesign amplo.

### Mudança 21 — Design/copy/refinamento visual

Escopo provável:

- Revisar textos não comerciais.
- Paleta.
- Densidade.
- Cards.
- Modais.
- Estados vazios.
- Possível modal dedicado de upgrade.

### O.S/Chamados

Manter em backlog próprio, sem misturar com PMOC nem redesign.

### React Doctor

Manter como backlog técnico separado, sem iniciar automaticamente.

## 8. Critérios de pronto

- Apenas documentação criada/alterada nesta CP-F.
- Nenhuma mudança funcional feita.
- Working tree limpo ao final.
- Validações obrigatórias executadas e aprovadas.
