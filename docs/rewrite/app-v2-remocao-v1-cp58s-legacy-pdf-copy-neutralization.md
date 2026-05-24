# app-v2 - CP-58S: neutralizacao de copia PDF em onboarding legado

## Objetivo

Remover promessas visiveis/documentais de PDF ainda presentes em textos legados
de onboarding, perfil e registro, sem alterar runtime de PDF/share ou contratos
publicos.

## Arquivos alterados

- `src/ui/components/onboarding/onboardingChecklist.js`
- `src/ui/components/onboarding/profileModal.js`
- `src/ui/components/clienteModal.js`
- `src/ui/shell/templates/views.js`
- `src/core/inputValidation.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## O que mudou

- O checklist de primeiros passos deixou de prometer geracao/baixar PDF.
- Hints de perfil, cliente e registro passaram a falar de relatorios,
  historico ou uso interno.
- Comentarios de validacao/registro foram neutralizados para contexto do
  atendimento.
- O teste de remocao v1 bloqueia retorno dessas copias sensiveis.

## Fora do escopo

- Renomear IDs internos antigos, como `pdf`, para preservar compatibilidade de
  dados locais legados.
- PDF/share real.
- WhatsApp real, assinatura, fotos/upload, storage, PMOC, Supabase/RLS,
  migrations ou billing/pricing.

## Risco

Baixo. Mudanca de texto/comentario e teste de contrato. Nao altera persistencia,
router, schemas, runtime de exportacao ou integracoes.
