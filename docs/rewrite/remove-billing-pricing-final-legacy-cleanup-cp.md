# Remocao de billing/pricing - limpeza final de ganchos legados

## Escopo

Fechar residuos de billing/pricing que ainda ficavam como ganchos mortos no
runtime legado, sem reintroduzir rota comercial, checkout, portal de cliente,
pricing ou plano pago.

## Alterado

- Removidos estilos orfaos:
  - `.app-sidebar__nav-item--upgrade`;
  - `.conta-hero__upgrade-cta`;
  - `.pmoc-info-modal__btn--upgrade`.
- Removidas fixtures antigas de teste que ainda montavam
  `dash-upgrade-inline-hint`.
- Ampliado `billingPricingCleanupContracts` para bloquear retorno desses
  seletores comerciais.

## Fora do escopo

- Billing real futuro.
- Regras tecnicas de quota ainda usadas por compatibilidade operacional.
- PDF/share, WhatsApp, storage, RLS, PMOC real, assinatura real ou migrations.
- Remocao de documentacao historica que cita billing/pricing como contexto de
  migracao.

## Validacao

- `npm test -- src/__tests__/billingPricingCleanupContracts.test.js --run`
