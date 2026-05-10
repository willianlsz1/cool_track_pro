# Mudanca 19 / CP-C - Runtime da cota mensal de PDF

## Objetivo

Ativar no fluxo real de exportacao PDF o contrato de cota planejado na CP-B, bloqueando o plano Free apos 1 PDF por mes e mantendo Plus com 50 PDFs por mes e Pro sem limitacao relevante.

## Estado inicial

- Branch: main
- HEAD inicial: 35819e40b1ebd40321600e2251a5d97010cc88a9
- Working tree inicial: limpo

## Arquivos alterados

- `src/core/usageLimits.js`
- `src/ui/controller/handlers/reportExportHandlers.js`
- `src/__tests__/usageLimits.test.js`
- `src/__tests__/reportExportHandlers.test.js`
- `docs/monetization/mudanca-19-cp-c-pdf-quota-runtime.md`

## Comportamento anterior

- `getMonthlyLimitForPlan()` ainda retornava `Infinity` para `pdf_export` no Free, Plus e Pro.
- O contrato planejado de PDF existia em helpers puros, mas nao bloqueava o fluxo real.
- Free recebia marca d'agua, mas nao consumia cota de PDF.

## Comportamento novo

- Free: 1 PDF por mes.
- Plus: 50 PDFs por mes.
- Pro: `Infinity`.
- `getMonthlyLimitForPlan(planCode, pdf_export)` agora resolve o limite usando o contrato dedicado de PDF criado na CP-B.
- O fluxo real de exportacao PDF passa a bloquear quando `hasReachedMonthlyLimit()` indica cota atingida.
- O bloqueio usa o mecanismo existente de `Toast.warning()` e navega para `pricing`.

## Como a cota e verificada

O handler de exportacao chama `ensureReportBudget()`, que:

1. resolve usuario e plano efetivo;
2. carrega `usage_monthly` com `getMonthlyUsageSnapshot()`;
3. le o limite mensal via `getMonthlyLimitForPlan()`;
4. aplica `hasReachedMonthlyLimit()`;
5. bloqueia antes de gerar PDF quando a cota ja foi atingida.

## Quando o uso e incrementado

O uso de `pdf_export` so e incrementado depois de exportacao bem-sucedida:

- o orcamento e validado antes;
- o PDF e gerado como Blob;
- o preview/export e confirmado;
- o download e disparado;
- entao `budget.commit()` chama `incrementMonthlyUsage()`.

Se a geracao falha antes da exportacao, o uso nao e incrementado.

## Preservado

- Marca d'agua do Free dentro da cota.
- PDF sem cliente associado.
- WhatsApp/share com cota propria (`whatsapp_share`), sem consumir `pdf_export`.
- WhatsApp sem telefone, por continuar no fluxo existente de share.
- Pos-save e edicao de registro.
- Pro sem limitacao relevante.
- Sem mudancas em PDF/share, Supabase, migrations, seguranca, CSS ou dependencias.

## Testes alterados/adicionados

- `usageLimits.test.js`
  - Free PDF = 1.
  - Plus PDF = 50.
  - Pro PDF = `Infinity`.
  - helper/runtime distinguem cota finita e ilimitada.

- `reportExportHandlers.test.js`
  - Free dentro da cota exporta e incrementa uso.
  - Free com 1 PDF usado e bloqueado.
  - Plus dentro de 50 exporta e incrementa uso.
  - Plus com 50 usados e bloqueado.
  - falha de geracao antes da exportacao nao incrementa uso.

## Validacao executada

- `npm run test -- src/__tests__/usageLimits.test.js src/__tests__/reportExportHandlers.test.js`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

## Riscos remanescentes

- A contagem depende de `usage_monthly` e do RPC existente; o fallback atual preserva disponibilidade quando ha erro de leitura.
- A UX de paywall/upgrade ainda e minima e deve ser refinada na CP-D.
- O reset mensal segue o contrato UTC existente.
- Testes de ambiente JSDOM ainda exibem warning conhecido de navegacao quando o fluxo aciona download por anchor.

## Proximo CP recomendado

Mudanca 19 / CP-D - UX de paywall/upgrade e mensagens para cota de PDF, mantendo a logica de bloqueio ja ativada nesta CP.
