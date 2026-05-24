# Remocao de billing e pricing - Edge Functions

## Objetivo

Remover a superficie implantavel de billing/Stripe do Supabase enquanto billing
e pricing ficam fora do produto.

## Alterado

- Removidas as entradas `create-checkout-session`, `create-portal-session` e
  `stripe-webhook` de `supabase/config.toml`.
- Removidos os arquivos das Edge Functions Stripe.
- Removido o guia operacional `supabase/functions/STRIPE_SETUP.md`.
- Removidos os testes JS que importavam helpers internos do webhook Stripe.
- Atualizado comentario da function `analyze-nameplate` para nao referenciar as
  funcoes removidas.

## Fora de escopo

- Migrations historicas de billing/plano/Stripe.
- Tabelas, colunas, triggers, RLS e testes SQL associados ao schema legado.
- Segredos remotos configurados no projeto Supabase.
- Remocao de docs historicos de seguranca e validacao.

## Risco residual

- O schema Supabase ainda contem artefatos historicos de plano, quota e Stripe.
- Ambientes remotos podem continuar com Edge Functions ja implantadas ate que a
  remocao operacional seja feita no projeto Supabase.
- A limpeza de schema/RLS deve ser outro checkpoint, com plano proprio e
  validacao SQL.

## Validacao esperada

- Scan por referencias runtime das funcoes removidas.
- `npm test -- src/__tests__/supabaseConfig.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
