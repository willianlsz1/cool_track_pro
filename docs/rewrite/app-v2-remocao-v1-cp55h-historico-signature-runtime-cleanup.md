# app-v2 - Remocao v1 CP55H - Historico signature runtime cleanup

## Objetivo

Remover sobras runtime de assinatura no Historico v1 depois de aposentar a
captura, visualizacao, storage e contratos visuais de assinatura.

## Escopo

- Remover `hasSignature` do view model do Historico.
- Remover `signature: null` do modelo legado da timeline.
- Remover cleanup de `cooltrack-sig-*` no delete de registro.
- Atualizar testes de contrato e integracao do Historico.

## Fora do escopo

- Campo persistido `registros.assinatura`.
- Normalizers, sync remoto e schema.
- Assinatura de orcamento.
- PDF/share, fotos, PMOC, billing, router e Supabase/RLS.

## Risco

Baixo. A UI de assinatura e o storage dedicado ja foram removidos em CPs
anteriores; este CP remove apenas residuos que nao possuem consumidor runtime.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/historicoRegistroIntegration.contract.test.js src/__tests__/historicoViewModel.test.js src/__tests__/historicoTimelineLegacyRender.test.js src/__tests__/historicoTimelineRenderer.test.js --run
npm run format
npm run build
npm run check
```
