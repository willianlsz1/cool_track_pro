# Remocao de billing/pricing - textos finais de runtime

## Objetivo

Fechar residuos de copy comercial em runtime legado depois da remocao de
billing, pricing, checkout, portal e Stripe.

## Alterado

- Mensagens de cota da analise de placa deixaram de citar Plus/Pro.
- CTAs bloqueados de fotos e placa passaram a exibir texto neutro de recurso
  indisponivel.
- Comentarios legados de fotos, assinatura e conta deixaram de descrever
  planos pagos, upgrade ou conversao comercial.
- `billingPricingCleanupContracts` passou a bloquear retorno desses textos em
  gates legados.

## Fora do escopo

- Renomear APIs tecnicas de compatibilidade como `PLAN_CODE_PLUS`,
  `PLAN_CODE_PRO`, `subscription_status` ou helpers de gate.
- Alterar migrations historicas, RLS, storage, PDF/share, WhatsApp, PMOC,
  assinatura real ou quotas tecnicas.
- Recriar billing/pricing.

## Validacao esperada

- `npm test -- src/__tests__/billingPricingCleanupContracts.test.js src/__tests__/publicPricingVestiges.test.js src/__tests__/subscriptionPlans.test.js src/__tests__/operationalPlan.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
