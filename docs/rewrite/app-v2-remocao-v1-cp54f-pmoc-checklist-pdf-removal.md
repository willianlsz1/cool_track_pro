# app-v2 remocao v1 - CP54F PMOC/checklist PDF removal

## Objetivo

Remover os geradores e helpers legados de PDF PMOC/checklist que restaram apos a
aposentadoria de PDF/share v1.

Este CP remove somente a camada PDF. O checklist operacional de registro,
templates PMOC, resumo de clientes/equipamentos e dados salvos em registros
permanecem fora deste corte.

## Escopo executado

- Removeu os helpers PDF compartilhados restantes:
  - `src/domain/pdf/constants.js`;
  - `src/domain/pdf/primitives.js`;
  - `src/domain/pdf/safeLinks.js`;
  - `src/domain/pdf/sanitizers.js`.
- Removeu as secoes PDF de checklist e upsell:
  - `src/domain/pdf/sections/checklist.js`;
  - `src/domain/pdf/sections/checklistHelpers.js`;
  - `src/domain/pdf/sections/upsell.js`.
- Removeu o gerador PMOC PDF legado:
  - `src/domain/pdf/pmoc/**`.
- Removeu testes dedicados ao PDF PMOC/checklist removido.
- Ajustou `registroChecklistPmoc.contract.test.js` para manter somente o
  contrato operacional do checklist, sem acoplar o registro ao PDF removido.
- Atualizou `legacyV1RemovalContracts.test.js` com contrato de ausencia.

## Evidencia de escopo

Busca de consumidores antes da remocao:

```bash
rg -n "generatePmocPdf|nextPmocNumber|drawPmoc|drawUpsellBlock|drawChecklist|pdf/pmoc|pdf/sections/checklist|pdf/sections/upsell|pdf/sanitizers|pdf/safeLinks" src
```

Resultado: consumidores restantes eram apenas arquivos PDF e testes dedicados.
O fluxo operacional PMOC/checklist usa `src/domain/pmoc/**`, `src/core/**` e
`src/ui/**`, nao `src/domain/pdf/**`.

## Fora de escopo

- Remover checklist operacional do Registro.
- Remover PMOC operacional de clientes/equipamentos.
- Remover assinatura, fotos/upload/storage ou Supabase.
- Recriar PDF/share no app-v2.
- Alterar `vendor-pdf`, `manualChunks`, Vite ou package files.

## Risco

Baixo para app-v2: o app-v2 continua sem importar `src/domain/pdf/**`.

Medio para paridade futura: PMOC formal em PDF deve ser redesenhado depois como
fluxo app-v2 nativo, sem reutilizar os geradores v1 removidos.

## Validacao executada

```bash
npm run format # passou
npm run check # passou
```

`npm run check` cobriu lint, typecheck, format check, suite Vitest completa e
build. O build manteve apenas o aviso conhecido de chunk grande.

Antes do commit, executar:

```bash
git diff --check
git diff --cached --check
```

## Proximo passo

Mapear assinatura, fotos/upload/storage e PMOC operacional restante em CPs
separados, sem misturar com recriacao de PDF/share real.
