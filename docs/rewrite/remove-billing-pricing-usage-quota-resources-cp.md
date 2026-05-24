# Remocao de billing/pricing - recursos de quota PDF/WhatsApp

## Objetivo

Remover os ultimos recursos tecnicos de quota ligados a PDF e WhatsApp dos
helpers de uso/plano enquanto billing e pricing ficam fora do produto.

## Arquivos alterados

- `src/core/usageLimits.js`
- `src/core/plans/subscriptionPlans.js`
- `src/core/plans/operationalPlan.js`
- `src/__tests__/usageLimits.test.js`
- `src/__tests__/operationalPlan.test.js`
- `src/__tests__/billingPricingCleanupContracts.test.js`

## O que mudou

- `usageLimits` deixou de exportar/aceitar `pdf_export` e `whatsapp_share`.
- Snapshots mensais ignoram linhas antigas desses recursos e retornam apenas o
  recurso operacional ainda usado: `nameplate_analysis`.
- O helper de plano operacional deixou de exportar feature PDF.
- Contratos de limpeza passam a bloquear retorno desses recursos no runtime.

## Fora do escopo

- Remover `usage_monthly`, `increment_monthly_usage()` ou colunas de plano do
  schema real. Isso exige etapa Supabase/RLS/migrations propria.
- Remover o fluxo de nameplate, que ainda consome quota operacional desbloqueada.
- PDF/share real, WhatsApp real, storage/fotos, PMOC, assinatura ou Cloudflare.

## Validacao

- `npm test -- src/__tests__/usageLimits.test.js src/__tests__/operationalPlan.test.js src/__tests__/subscriptionPlans.test.js src/__tests__/billingPricingCleanupContracts.test.js --run`
- Busca dirigida sem ocorrencias runtime para:
  `USAGE_RESOURCE_PDF_EXPORT`, `USAGE_RESOURCE_WHATSAPP_SHARE`,
  `FEATURE_PDF_EXPORT`, `PREMIUM_FEATURE_PDF_EXPORT`, `pdf_export`,
  `whatsapp_share`.

## Risco

Baixo/medio. O corte remove recursos comerciais sem uso runtime atual, mas toca
helpers compartilhados. O recurso `nameplate_analysis` foi preservado porque
ainda e usado pela tela de equipamentos.
