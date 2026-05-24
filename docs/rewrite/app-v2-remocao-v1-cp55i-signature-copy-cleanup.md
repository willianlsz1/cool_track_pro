# app-v2 - Remocao v1 CP55I - Signature copy cleanup

## Objetivo

Remover textos e CSS morto que ainda prometiam assinatura em superficies legadas
de onboarding, tour e PMOC depois da aposentadoria dos fluxos de assinatura v1.

## Escopo

- Atualizar copy do tour de primeiro uso para nao citar assinatura.
- Atualizar checklist de onboarding para nao prometer assinatura do cliente.
- Atualizar modal informativo de PMOC para nao listar assinatura como saida do
  relatorio tecnico.
- Remover classes CSS `ftx-signature-*` sem uso.
- Travar a ausencia em contrato de remocao v1.

## Fora do escopo

- PMOC real.
- PDF/share.
- Storage/sync/schema de `registros.assinatura`.
- Assinatura de orcamento.
- Billing, planos e feature flags.
- App-v2 report preview, que usa campos de assinatura apenas como placeholder
  visual de relatorio.

## Risco

Baixo. As mudancas sao copy/CSS morto em superficies legadas e nao alteram
persistencia, contratos de dados, router, Supabase/RLS ou app-v2.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
```
