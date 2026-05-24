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

## PMOC legado

- Consolidado e removido o histórico antigo de PMOC contextual/Pro.
- PMOC antigo não deve ser reutilizado como arquitetura do app-v2.
- PMOC novo fica como etapa própria futura, com contrato, storage e PDF/share
  redesenhados do zero.

## Fluxo/produto legado

- Consolidado e removido o histórico antigo da Mudança 18.
- A referência útil preservada é conceitual: reduzir fricção para o técnico,
  priorizar registro de serviço, clientes/equipamentos e navegação por intenção.
- Regras antigas de plano, pricing, PDF/share, PMOC e onboarding legado não
  devem ser copiadas para o app-v2 sem etapa própria.

## Design legado

- Consolidado e removido o histórico antigo da Mudança 21.
- O rewrite app-v2 não continua a numeração nem os padrões visuais dessa trilha.
- A referência válida para UI atual é o Design System do app-v2 em
  `docs/rewrite/`, não os CPs visuais legados.

## Validação padrão

- Para CPs com código: testes focados, `npm run format`, `npm run build`,
  `npm run check`, `git diff --check`.
- Para CPs futuros: registrar aqui apenas resumo curto da frente de trabalho.
