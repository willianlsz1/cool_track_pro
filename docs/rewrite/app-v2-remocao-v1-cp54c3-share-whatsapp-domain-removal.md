# app-v2 remocao v1 - CP54C3 share/WhatsApp domain removal

## Objetivo

Remover helpers legados de share de relatorio, WhatsApp e exportacao que ficaram
sem consumidor runtime depois dos cortes CP54C1 e CP54C2.

Este CP evita remover o gerador PDF comum e PMOC no mesmo corte, porque esses
arquivos ainda cruzam testes de assinatura, checklist e PMOC. Eles devem sair
em CP sensivel proprio.

## Escopo executado

- Removeu `src/domain/pdf/shareReport.js`.
- Removeu `src/domain/pdf/shareReportHelpers.js`.
- Removeu `src/domain/whatsapp.js`.
- Removeu `src/domain/reportExportHelpers.js`.
- Removeu os testes dedicados aos helpers removidos:
  - `src/__tests__/shareReport.test.js`;
  - `src/__tests__/shareReportHelpers.test.js`;
  - `src/__tests__/whatsappExport.test.js`;
  - `src/__tests__/reportExportHelpers.test.js`.
- Atualizou `legacyV1RemovalContracts.test.js` com contrato de ausencia para
  esses helpers.

## Fora de escopo

- Remover `src/domain/pdf.js`.
- Remover `src/domain/pdf/sections/**`.
- Remover `src/domain/pdf/pmoc/**`.
- Alterar PMOC, assinatura, fotos/upload/storage, Supabase ou billing.
- Alterar `vendor-pdf`, `manualChunks`, Vite ou package files.
- Recriar PDF/share no app-v2.

## Risco

Baixo para runtime app-v2: os helpers removidos nao eram importados pelo app-v2.

Medio para reaproveitamento futuro: share/WhatsApp devera ser refeito como
fluxo app-v2 nativo em etapa propria, sem depender dos helpers removidos.

## Validacao esperada

```bash
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Validacao executada

- `npm run format`: passou.
- `npm run check`: passou, incluindo lint, typecheck, format check, suite
  Vitest completa e build.
- `git diff --check`: passou.
- Busca por `shareReport`, `shareReportHelpers`, `WhatsAppExport`,
  `domain/whatsapp`, `reportExportHelpers`, `buildWhatsAppMessage` e
  `shareReportPdf`: sem ocorrencias runtime; restaram apenas contratos de
  ausencia e historico documental.

## Proximo passo

Abrir CP separado para decidir a remocao do gerador PDF comum
(`src/domain/pdf.js` e `src/domain/pdf/sections/**`) e outro CP para PMOC
(`src/domain/pdf/pmoc/**`), preservando a regra de nao misturar assinatura,
fotos, storage e PDF/share real no mesmo corte.
