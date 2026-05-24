# app-v2 - Remocao v1 CP56E - Digital signature feature flag removal

## Objetivo

Remover o ultimo vestigio comercial da assinatura digital legada:
`FEATURE_DIGITAL_SIGNATURE` / `digital_signature`.

## Arquivos alterados

- `src/core/plans/subscriptionPlans.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Decisao

O app-v2 nao deve reutilizar a assinatura digital v1 nem manter uma feature flag
comercial para ela. A assinatura real, se voltar, deve ser redesenhada em etapa
propria app-v2-native.

## Fora de escopo

- Pricing/billing publico.
- Stripe/schema/migrations.
- PDF/share, WhatsApp e links publicos.
- Assinatura digital real.
