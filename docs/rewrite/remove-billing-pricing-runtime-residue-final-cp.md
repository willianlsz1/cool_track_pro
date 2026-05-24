# Remocao de billing/pricing - fechamento de residuos runtime

## Objetivo

Fechar residuos explicitos de billing, pricing, checkout e Stripe em modulos de
runtime antes de retomar a remocao de vestigios do v1.

## Alterado

- Comentarios de runtime deixaram de referenciar upgrade, billing/pricing ou
  copy comercial antiga.
- `billingPricingCleanupContracts` passou a varrer modulos executaveis em
  `src/core`, `src/domain`, `src/features` e `src/ui`.
- O contrato bloqueia retorno de termos comerciais ativos como `billing`,
  `pricing`, `checkout`, `stripe`, `start-checkout`, `manage-subscription` e
  `open-upgrade`.

## Mantido fora do escopo

- Migrations historicas Supabase que criam e depois removem artefatos Stripe.
- Colunas e helpers tecnicos de plano ainda usados por compatibilidade
  operacional.
- Fotos, assinatura, nameplate, PDF/share, WhatsApp, PMOC, storage, RLS e
  schema futuro.
- Documentacao historica que explica checkpoints anteriores.

## Validacao

- `npm test -- src/__tests__/billingPricingCleanupContracts.test.js --run`
