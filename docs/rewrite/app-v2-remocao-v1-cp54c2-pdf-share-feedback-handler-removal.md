# app-v2 remocao v1 - CP54C2 PDF/share feedback handler removal

## Objetivo

Remover a superficie runtime legada que ainda sustentava PDF/share v1 depois
que CP54C1 aposentou os CTAs de Historico e Registro.

Este CP nao recria PDF/share no app-v2 e nao altera dominio PDF, WhatsApp,
PMOC, assinatura, fotos, storage, vendor-pdf, manualChunks ou configuracao de
build.

## Escopo executado

- Removeu `src/ui/controller/handlers/reportExportHandlers.js`.
- Removeu `src/ui/components/pdfSuccessToast.js`.
- Removeu `src/ui/components/shareSuccessToast.js`.
- Removeu `src/ui/components/pdfQuotaBadge.js`.
- Removeu o modal `modal-pdf-preview` de `src/ui/shell/templates/modals.js`.
- Removeu testes dedicados ao fluxo legado removido:
  - `src/__tests__/reportExportHandlers.test.js`;
  - `src/__tests__/reportExportContracts.test.js`;
  - `src/__tests__/pdfQuotaBadge.test.js`;
  - `src/__tests__/pdfSuccessToast.test.js`;
  - `src/__tests__/shareSuccessToast.test.js`.
- Limpou mocks residuais de `reportExportHandlers.js` em testes de Registro,
  fotos e assinatura que ja nao dependiam desse fluxo apos CP54C1.
- Atualizou `legacyV1RemovalContracts.test.js` com contrato de ausencia para o
  handler, componentes, testes e modal removidos.

## Fora de escopo

- Remover `src/domain/pdf/**`.
- Remover `src/domain/whatsapp.js`.
- Remover `vendor-pdf` ou alterar `manualChunks`.
- Recriar PDF/share no app-v2.
- Alterar PMOC, assinatura, fotos/upload/storage ou Supabase.
- Alterar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.

## Risco

Baixo para app-v2: os arquivos removidos pertenciam ao runtime v1 e nao eram
importados pelo app-v2.

Medio para v1: o fluxo legado de PDF/share deixa de existir. Esse e o objetivo
do corte, porque o v1 esta congelado e o produto principal ja deve entrar pelo
app-v2.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/historicoCardActions.contract.test.js src/__tests__/historicoFilters.contract.test.js src/__tests__/registroSavePostSaveHelpers.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Validacao executada

- `npm run format`: passou.
- `npm run build`: passou com warning conhecido de chunk acima de 500 kB.
- `npm run lint`: passou.
- `npm run typecheck`: passou.
- `npm run format:check`: passou.
- `npm run check`: passou, incluindo a suite Vitest completa, `format:check` e
  `build`.
- `git diff --check`: passou.
- Busca runtime por `reportExportHandlers.js`, `modal-pdf-preview`,
  `PdfSuccessToast`, `ShareSuccessToast`, `PdfQuotaBadge`, `export-pdf` e
  `whatsapp-export`: sem ocorrencias em runtime; restaram apenas contratos de
  ausencia e historico documental.

Observacao: a execucao isolada dos testes focados via `npm test -- ... --run`
falhou no startup do Vitest com `spawn EPERM` ao iniciar o servico do esbuild.
A mesma suite passou dentro de `npm run check`, entao a validacao ampla foi
usada como evidencia autoritativa.

## Proximo passo

CP54C3 deve tratar o dominio PDF/share/WhatsApp legado como etapa sensivel
separada, decidindo remocao ou isolamento sem misturar PMOC, assinatura, fotos,
storage, vendor-pdf ou configuracao de build.
