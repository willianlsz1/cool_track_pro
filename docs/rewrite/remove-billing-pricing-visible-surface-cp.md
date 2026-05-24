# Remocao de billing e pricing - superficie visivel complementar

## Escopo

Fechar vestigios visiveis de billing/pricing que ainda apareciam no runtime
legado apos a remocao de rotas, Edge Functions e schema Stripe.

## Alterado

- Removido o handler global `open-upgrade`.
- Removidos contratos publicos legados de `open-upgrade`,
  `data-upgrade-source` e `data-highlight-plan`.
- Modal de conta e pagina Conta passaram a exibir status operacional neutro.
- PMOC bloqueado deixou de exibir badge/CTA comercial.
- Assinatura, fotos, nameplate, PDF quota, sidebar e shell passaram a usar
  mensagem neutra de recurso indisponivel.
- Overflow de limites deixou de renderizar CTA comercial desabilitado.
- Testes focados foram atualizados para bloquear retorno da superficie
  comercial visivel.

## Fora do escopo

- Helpers tecnicos de plano usados por compatibilidade operacional.
- Migrations historicas de billing/Stripe.
- Quotas tecnicas, PDF/share, WhatsApp, storage, RLS, PMOC real e assinatura
  real.

## Validacao

- `npm test -- src/__tests__/contaView.test.js src/__tests__/registroSignatureHint.test.js src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js src/__tests__/equipPhotosGate.test.js src/__tests__/equipPhotosEditor.test.js src/__tests__/reportExportHandlers.test.js src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/relatorioNavigationLegacyContracts.test.js src/__tests__/globalHeaderContracts.test.js --run`
