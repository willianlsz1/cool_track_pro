# app-v2 - CP50: remocao de view model PMOC legado sem consumidor

## Objetivo

Remover um view model legado de Relatorios que restava apenas como contrato
test-only, sem consumidor runtime ativo.

## Escopo

- Removido `src/ui/viewModels/relatorioCompanyPmocModel.js`.
- Removidos do teste apenas os asserts diretos desse model morto.
- Mantidos os testes que validam o comportamento runtime atual:
  - o slot legado `#rel-company-pmoc-slot` permanece vazio;
  - o PMOC Pro aparece no hero atual de Relatorios;
  - nao ha navegacao PMOC legada;
  - dados maliciosos permanecem inertes;
  - o adapter legado nao importa `createRoot`.
- Atualizado `legacyShellRetirementGate` para bloquear retorno do arquivo.

## Evidencia de nao uso

Busca antes da remocao:

```bash
rg -n "relatorioCompanyPmocModel|buildRelatorioCompanyPmoc|CompanyPmoc|companyPmoc" src index.html public e2e
```

O unico import de `buildRelatorioCompanyPmocModel` estava em
`src/__tests__/relatorioCompanyPmocContracts.test.js`. O runtime atual de
`src/ui/views/relatorio.js` manipula apenas o slot legado e o hero PMOC atual,
sem importar esse model.

## Fora de escopo

- PMOC real.
- PDF/share.
- WhatsApp.
- Billing.
- Router.
- Storage, Supabase/RLS ou migrations.
- Mudancas visuais em Relatorios ou app-v2.

## Validacao esperada

```bash
npm test -- src/__tests__/relatorioCompanyPmocContracts.test.js src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
