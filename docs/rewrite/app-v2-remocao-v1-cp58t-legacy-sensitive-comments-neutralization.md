# app-v2 - CP-58T: neutralizacao de comentarios sensiveis legados

## Objetivo

Remover referencias internas soltas a PDF, WhatsApp e assinatura em comentarios
de arquivos legados/helper que nao implementam essas integracoes, reduzindo
vestigios do v1 sem alterar runtime sensivel.

## Arquivos alterados

- `src/core/utils.js`
- `src/domain/dadosPlacaDisplay.js`
- `src/domain/dadosPlacaInsights.js`
- `src/ui/views/registro.js`
- `src/ui/views/registro/save/postSave.js`
- `src/ui/views/dashboard.js`
- `src/ui/views/historico.js`
- `src/ui/components/onboarding/onboardingBanner.js`
- `src/ui/components/onboarding/firstTimeExperience.css`
- `src/ui/views/equipamentos/placaData.js`
- `src/ui/components/pushOptInCard.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## O que mudou

- Comentarios foram reescritos para termos neutros como renderizadores,
  consumidores, saidas externas ou etapa propria.
- O teste de remocao v1 passou a bloquear retorno desses termos nos arquivos
  neutralizados.

## Fora do escopo

- `usageLimits`, `operationalPlan` e `subscriptionPlans`, porque ainda exigem
  etapa dedicada de billing/pricing.
- Storage/fotos, PMOC, Supabase/RLS e migrations.
- Qualquer runtime real de PDF/share ou WhatsApp.
- Favicons e assets de icone.

## Risco

Baixo. Mudanca comentario/documentacao interna e teste de contrato. Nao altera
execucao, persistencia, schemas, UI visivel ou integracoes.
