# Remocao de billing e pricing - runtime do app

## Objetivo

Remover a superficie de billing/pricing do runtime do app antes de continuar a
remocao dos vestigios do v1.

## Alterado

- Removida a rota `pricing` e a view `src/ui/views/pricing.js`.
- Removido o CSS dedicado de pricing da entrada de estilos.
- Helpers de plano agora operam como camada de compatibilidade nao comercial.
- Limites comerciais de clientes, equipamentos, PDF, WhatsApp e nameplate foram
  abertos enquanto billing estiver fora do produto.
- Conta, sidebar e privacidade deixam de consultar ou mencionar cobranca real.
- Checkout e portal continuam exportados apenas como stubs bloqueados para
  compatibilidade com imports antigos.

## Fora de escopo

- Supabase migrations, RLS e testes SQL de historico de billing.
- Remocao de tabelas ou colunas de historico de billing.
- Redesign de Conta, Dashboard, Relatorios ou Equipamentos.

## Risco residual

- O backend ainda contem artefatos historicos de schema/RLS de billing/Stripe e
  deve ser tratado em etapa propria, porque envolve banco e contratos
  sensiveis.
- Alguns nomes legados (`PLAN_CODE_*`, `operationalPlan.js`) permanecem como
  compatibilidade para evitar quebra ampla neste checkpoint.

## Validacao esperada

- Testes focados de planos, limites, rotas, clientes, monetizacao desativada e
  Conta.
- `npm run format`
- `npm run build`
- `npm run check`
