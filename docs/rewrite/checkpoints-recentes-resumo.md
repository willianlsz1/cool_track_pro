# Checkpoints recentes - resumo curto

## Billing/pricing

- Removidas superfícies públicas e runtime visível de billing, pricing, Stripe,
  checkout, upgrade e CTAs comerciais.
- Removidos resíduos técnicos de quota `pdf_export` e `whatsapp_share`.
- Mantido apenas o uso operacional ainda ativo: `nameplate_analysis`.
- Mantidos fora do escopo: Supabase/RLS/migrations reais, storage, PDF/share,
  WhatsApp, assinatura, PMOC, favicon e assets públicos.

## Copy e encoding

- Corrigidos textos operacionais com português quebrado em helpers de plano.
- Corrigidas mensagens visíveis do app-v2 em formulários/detalhes de cliente e
  equipamento.

## Validação padrão

- Para CPs com código: testes focados, `npm run format`, `npm run build`,
  `npm run check`, `git diff --check`.
- Para CPs futuros: registrar aqui apenas resumo curto da frente de trabalho.
