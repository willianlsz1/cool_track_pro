# app-v2 - Remocao v1 CP56D - Orcamento signature retirement

## Objetivo

Aposentar a assinatura digital legada de orcamentos sem reutilizar o fluxo v1 no
app-v2.

Este CP remove apenas a superficie de assinatura por token/RPC. Ele nao recria
PDF/share, WhatsApp, billing/features, assinatura app-v2-native ou orcamento
real.

## Arquivos alterados

- `src/core/orcamentos.js`
- `src/domain/orcamentoFollowUp.js`
- `src/__tests__/orcamentoFollowUp.test.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `supabase/migrations/20260524200000_retire_orcamento_signature.sql`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Contrato aposentado

- Helpers JS:
  - `generateShareToken`
  - `buildShareUrl`
  - `fetchOrcamentoByToken`
  - `signOrcamentoByToken`
- Status legado:
  - `aguardando_assinatura`
- Schema legado:
  - `share_token`
  - `share_token_expires_at`
  - `assinatura_cliente_dataurl`
  - `assinado_em`
  - `assinado_nome`
  - `assinado_user_agent`
- RPCs publicas:
  - `public.get_orcamento_by_token(uuid)`
  - `public.sign_orcamento_by_token(uuid, text, text, text)`

## Decisoes

- Orcamentos com status `aguardando_assinatura` sao migrados para `enviado`
  antes de revalidar o `CHECK`.
- `visualizadoEm` continua podendo mapear `enviado` para `visualizado` no
  follow-up.
- O fluxo futuro de aprovacao/orcamento app-v2-native deve ser planejado em CP
  proprio, sem adaptar o token/RPC legado.

## Fora de escopo

- Billing/features e `FEATURE_DIGITAL_SIGNATURE`.
- PDF/share, WhatsApp e links publicos.
- Storage/upload/fotos.
- PMOC.
- Redesign de Orcamentos app-v2.
