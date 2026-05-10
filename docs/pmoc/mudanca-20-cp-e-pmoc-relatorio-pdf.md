# Mudança 20 / CP-E — PMOC no relatório/PDF

## 1. Objetivo

Ajustar a presença contextual do PMOC no relatório técnico comum e no PDF comum quando o atendimento tiver contexto preventivo/PMOC, preservando o PDF PMOC formal como fluxo Pro separado.

## 2. Estado inicial

- Branch: `main`
- HEAD inicial confirmado localmente: `2adf38ee187d52df8e87447a4d72039204e0654a`
- Working tree inicial: limpo
- Base: CP-D já havia tornado o checklist PMOC mais descobrível no Registro sem bloquear salvamento.

## 3. Arquivos alterados

- `src/domain/pmoc/reportContext.js`
- `src/ui/views/relatorio.js`
- `src/react/pages/RelatorioCards.jsx`
- `src/domain/pdf/sections/services.js`
- `src/__tests__/pmocReportContext.test.js`
- `src/__tests__/relatorioCardsIsland.test.jsx`
- `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js`
- `docs/pmoc/mudanca-20-cp-e-pmoc-relatorio-pdf.md`

## 4. Comportamento anterior

- O relatório comum já mostrava registros, próximas manutenções, observações, assinatura e especificações do equipamento.
- O PDF comum já preservava checklist PMOC preenchido por meio da seção de checklist.
- O PDF PMOC formal continuava separado e Pro.
- Não havia um resumo contextual curto no card do relatório comum indicando que aquele atendimento era preventivo/PMOC.

## 5. Comportamento novo

- Foi criado o helper puro `buildContextualPmocReportSummary()`.
- O helper gera resumo apenas quando:
  - o tipo do serviço é preventiva/PMOC; ou
  - existe checklist PMOC preenchido.
- Serviço comum sem checklist não recebe seção nova.
- O card do relatório comum passa a mostrar um bloco curto `Resumo PMOC/preventivo` quando aplicável.
- O PDF comum passa a escrever o mesmo resumo no card do serviço quando aplicável.

## 6. O que aparece no relatório comum

Quando há contexto PMOC/preventivo, o relatório comum pode exibir:

- tipo do serviço;
- rotina preventiva do equipamento, se houver;
- próxima preventiva, se houver;
- resumo do checklist preenchido, se houver;
- indicação explícita de que o bloco não substitui o PMOC formal.

O bloco é contextual e curto. Ele não adiciona linguagem jurídica pesada e não transforma o relatório técnico comum em documento PMOC formal.

## 7. O que continua exclusivo do PDF PMOC formal

Continuam exclusivos do fluxo PMOC formal Pro:

- PDF PMOC formal anual;
- termo de responsabilidade técnica;
- numeração PMOC;
- cronograma/histórico estruturado;
- seções formais de plano, cadastro, anexos e termo.

Esta CP não alterou `src/domain/pdf/pmoc/*` nem `reportExportHandlers.js`.

## 8. Cota `pdf_export`

A cota `pdf_export` da Mudança 19 não foi alterada.

- PDF comum continua seguindo o runtime de cota já implementado.
- PMOC formal não passou a consumir `pdf_export`.
- Nenhum incremento de uso foi alterado.
- `src/core/usageLimits.js` não foi modificado.

## 9. WhatsApp/share

WhatsApp/share foi preservado.

- O fluxo de share continua usando o PDF comum existente.
- Não houve mudança no fluxo de telefone, Web Share, upload, fallback ou WhatsApp manual.
- `src/domain/pdf/shareReport.js` não foi modificado.

## 10. Testes alterados/adicionados

- `src/__tests__/pmocReportContext.test.js`
  - cobre geração do resumo contextual;
  - cobre ausência de seção para serviço comum;
  - cobre checklist preenchido como evidência de contexto.
- `src/__tests__/relatorioCardsIsland.test.jsx`
  - cobre renderização do bloco PMOC contextual no card;
  - cobre ausência do bloco em card sem contexto.
- `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js`
  - cobre presença do resumo contextual no PDF comum quando há preventiva/checklist.

## 11. Validação executada

- `npm run test -- src/__tests__/pmocReportContext.test.js src/__tests__/relatorioCardsIsland.test.jsx src/__tests__/pdfGenerator.mediaChecklist.contract.test.js`
  - passou, 14 testes.
- `npm run test -- src/__tests__/pmocReportContext.test.js src/__tests__/pmocServiceType.test.js src/__tests__/relatorioCardsIsland.test.jsx src/__tests__/relatorioLegacyCards.test.js src/__tests__/relatorioViewModel.test.js src/__tests__/pdfGenerator.mediaChecklist.contract.test.js src/__tests__/relatorioExportPmocLegacyHandlers.test.js src/__tests__/reportExportHandlers.test.js`
  - passou, 47 testes.
- `npm run format`
  - passou.
- `npm run build`
  - passou com warnings Vite/chunk conhecidos.
- `npm run check`
  - passou; manteve 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js`.
- `git diff --check`
  - passou.

## 12. Riscos remanescentes

- A presença visual usa estilos existentes e classes novas sem redesign amplo.
- O resumo contextual é curto; refinamento de copy/design fica para fase futura.
- Alertas/histórico ainda não foram unificados no helper PMOC/preventiva.
- O warning conhecido de ESLint em `src/domain/pdf/shareReport.js` permanece fora do escopo.
- Warnings Vite/chunk conhecidos permanecem como backlog controlado.

## 13. Próximo CP recomendado

CP-F — fechamento documental da Mudança 20, consolidando o comportamento final de PMOC contextual e registrando validações, riscos e próximos backlogs.
