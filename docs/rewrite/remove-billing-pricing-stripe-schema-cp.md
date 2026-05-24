# Remocao de billing e pricing - schema Stripe

## Objetivo

Remover artefatos Stripe do estado final do schema Supabase apos a remocao do
runtime de billing/pricing e das Edge Functions comerciais.

## Alterado

- Adicionada migration `20260524010000_remove_stripe_billing_schema.sql`.
- A migration remove `stripe_customer_id` e `stripe_subscription_id` de
  `public.profiles`.
- A migration remove `public.stripe_webhook_events`.
- `protect_profile_fields()` e `protect_profile_insert()` foram redefinidas sem
  referencias a campos Stripe.
- Testes SQL do webhook Stripe foram removidos.
- O teste SQL de hardening de profile/usage foi atualizado para o contrato sem
  Stripe.
- `supabase/dashboard-queries.sql` deixou de expor consultas de billing/Stripe.

## Mantido por compatibilidade

- `plan`, `plan_code` e `subscription_status` em `public.profiles`.
- `usage_monthly` e `increment_monthly_usage()`.
- Helpers de plano usados por triggers de foto, assinatura e nameplate.

Esses itens nao representam checkout/pricing ativo neste checkpoint. Eles ainda
sustentam compatibilidade operacional e quotas nao comerciais.

## Validacao

- `npm run format`
- `npm run check`
- `supabase db lint --local --fail-on error`

## Risco residual

- Migrations historicas antigas ainda mencionam Stripe porque o historico de
  replay cria e depois remove os artefatos no estado final.
- Ambientes remotos que ja tinham Edge Functions Stripe implantadas ainda
  precisam de limpeza operacional no Supabase Dashboard/CLI.
