# Remocao de billing/pricing - vestigios visiveis legados

## Escopo

Checkpoint complementar para remover textos e acoes publicas de billing,
pricing, checkout e portal de assinatura que ainda apareciam no app legado/v1
apos a remocao da rota de pricing, das Edge Functions Stripe e dos artefatos de
schema.

## Alterado

- Mensagens publicas de bloqueio comercial passaram a usar a frase neutra
  `Planos pagos foram removidos desta versao`.
- O modal legado de limite de clientes deixou de expor acao `pricing` e passou a
  retornar ao inicio.
- Os handlers globais `start-checkout` e `manage-subscription` foram removidos
  do binding de navegacao.
- O catalogo operacional removeu chips/textos de `checkout`, `pricing` e
  `billing`.
- Contratos internos legados que citavam `pricing` apenas como nome de acao
  foram renomeados para linguagem comercial neutra.

## Fora do escopo

- Quotas tecnicas de IA/PDF/WhatsApp.
- Storage real, Supabase/RLS, PDF/share e WhatsApp.
- Refatoracao ampla dos helpers legados `monetization`/`subscriptionPlans`.
- Remocao de documentos historicos em `docs/monetization` ou migrations
  antigas que registram o historico do produto.

## Validacao

- `npm test -- src/__tests__/subscriptionPlans.test.js src/__tests__/monetization.test.js src/__tests__/clientesAccess.test.js src/__tests__/clientesPaywallModal.test.js src/features/equipamentos/__tests__/crud/validate.test.js src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js src/__tests__/equipPhotosGate.test.js src/__tests__/equipPhotosEditor.test.js src/__tests__/registroLegacyChecklistRender.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
