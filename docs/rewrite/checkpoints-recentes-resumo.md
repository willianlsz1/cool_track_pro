# Checkpoints recentes - resumo curto

## Billing/pricing

- Removidas superfícies públicas e runtime visível de billing, pricing, Stripe,
  checkout, upgrade e CTAs comerciais.
- Removidos resíduos técnicos de quota `pdf_export` e `whatsapp_share`.
- Neutralizados rótulos de exportação que ainda descreviam assinatura,
  PDF/WhatsApp como conteúdo atual.
- Consolidado e removido o histórico antigo de monetização PDF/cotas; billing e
  pricing serão redesenhados em etapa própria.
- Mantido apenas o uso operacional ainda ativo: `nameplate_analysis`.
- Mantidos fora do escopo: Supabase/RLS/migrations reais, storage, PDF/share,
  WhatsApp, assinatura, PMOC, favicon e assets públicos.

## Copy e encoding

- Corrigidos textos operacionais com português quebrado em helpers de plano.
- Corrigidas mensagens visíveis do app-v2 em formulários/detalhes de cliente e
  equipamento.
- Corrigidos textos visíveis corrompidos no Registro/checklist legado ainda
  ativo.

## Remoção v1

- Consolidado o histórico dos CPs individuais de remoção v1 neste resumo único.
- Já foram tratados: shell/rotas legadas, telas DOM v1, ilhas React antigas,
  CSS legado, billing/pricing, PDF/share v1, assinatura digital, fotos/storage,
  PMOC visual/copy e `twa-build`.
- Mantidos como etapa própria futura: Supabase/RLS/migrations reais, storage
  novo, PDF/share novo, WhatsApp novo, assinatura nova, PMOC novo e orçamento
  real app-v2-native.
- O favicon e os assets de marca preservados continuam fora da remoção ampla.

## Validação padrão

- Para CPs com código: testes focados, `npm run format`, `npm run build`,
  `npm run check`, `git diff --check`.
- Para CPs futuros: registrar aqui apenas resumo curto da frente de trabalho.
