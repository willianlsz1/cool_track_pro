# Remoção de billing/pricing - correção de copy operacional

## Objetivo

Corrigir textos operacionais remanescentes com português sem acento ou encoding
corrompido em helpers ligados ao antigo modulo comercial, sem reativar billing,
pricing, paywall ou limites comerciais.

## Arquivos alterados

- `src/core/plans/subscriptionPlans.js`
- `src/ui/components/overflowBanner.js`
- `src/__tests__/subscriptionPlans.test.js`
- `src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js`

## O que mudou

- Corrigida copy visível do plano operacional: `serviço`, `Área`, `versão` e
  `módulo` passaram para português correto.
- Corrigidos comentários e textos do `OverflowBanner` com mojibake e português
  sem acento.
- Testes que verificam contratos textuais foram atualizados para a copy correta.

## Fora do escopo

- Recriar billing/pricing.
- Alterar limites, paywall, Supabase/RLS, storage, PDF/share, WhatsApp, PMOC,
  assinatura, favicon ou assets públicos.

## Validacao

- Testes focados dos contratos alterados.
- Validação completa do projeto antes do commit.
