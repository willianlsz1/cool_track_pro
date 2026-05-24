# app-v2 - CP-7c: contrato e2e sem pricing

## Objetivo

Remover o ultimo contrato e2e legado que ainda esperava navegacao para
`pricing` depois da retirada temporaria de billing/pricing do produto.

## Alteracoes

- `e2e/specs/relatorio-visual-smoke.spec.js` deixou de esperar
  `data-nav="pricing"` no nudge PMOC.
- O mesmo e2e passa a validar o estado neutro atual: botao desabilitado, sem
  `data-nav` e com texto de indisponibilidade.
- `e2e/specs/unicode-escapes.spec.js` deixou de citar o CTA comercial
  "Conheca o Pro" e passou a validar o texto neutro atual.
- `src/__tests__/billingPricingCleanupContracts.test.js` ganhou contrato para
  bloquear regressao de assert e2e navegando para `pricing`.

## Fora do escopo

- Implementacao real de billing, pricing, checkout, portal ou planos.
- Alteracoes em PDF/share, WhatsApp, PMOC real, storage, Supabase/RLS,
  assinatura real ou permissoes.
- Remocao de documentacao historica que cita billing/pricing como contexto de
  decisoes anteriores.

## Validacao

- RED inicial: `npm test -- src/__tests__/billingPricingCleanupContracts.test.js --run`
  falhou enquanto o e2e ainda esperava `data-nav="pricing"`.
- GREEN: o mesmo teste passou apos ajustar o contrato e2e.
