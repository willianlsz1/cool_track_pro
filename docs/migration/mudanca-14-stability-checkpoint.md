# Mudança 14 / CP-H - Stability checkpoint Cover PDF

## 1. Base

- Branch: `main`
- HEAD: `403d5e9eababbe5858a63f6c5e430bd1d35d845a`
- Data: 2026-05-09
- Arquivos analisados:
  - `src/domain/pdf/sections/cover.js`
  - `src/domain/pdf/sections/coverHelpers.js`
  - `src/domain/pdf/sections/checklist.js`
  - `src/domain/pdf/sections/checklistHelpers.js`
  - `src/domain/pdf.js`
  - `src/__tests__/pdfCover.contract.test.js`
  - `src/__tests__/pdfCover.helpers.test.js`
  - `src/__tests__/pdfCoverChecklistCursor.contract.test.js`
  - `docs/migration/mudanca-14-cover-pdf-inventario.md`
  - `docs/rewrite/checkpoints-recentes-resumo.md`
- LOC principais:
  - `src/domain/pdf/sections/cover.js`: 581
  - `src/domain/pdf/sections/coverHelpers.js`: 199
  - `src/domain/pdf/sections/checklist.js`: 191
  - `src/domain/pdf/sections/checklistHelpers.js`: 38
  - `src/domain/pdf.js`: 208
  - `src/domain/pdf/sections/services.js`: 554
  - `src/domain/pdf/sections/signatures.js`: 311

## 2. Objetivo

Consolidar o estado final da Mudança 14 / Cover PDF após inventário, contrato específico, pre-split, extração de helpers puros, mapeamento do acoplamento com checklist, contrato de cursor e adapter local.

Este checkpoint não altera código de produção, testes ou comportamento. A decisão final é encerrar a Mudança 14.

## 3. Estado final dos blocos trabalhados

| Bloco/fluxo                                   | Estado final                               | Arquivo principal                                        | Teste existente                                            | Risco atual | Observação                                                           |
| --------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------- | ----------- | -------------------------------------------------------------------- |
| Inventário Cover PDF                          | Criado e atualizado até CP-H               | `docs/migration/mudanca-14-cover-pdf-inventario.md`      | N/A                                                        | Baixo       | Registra sequência CP-A..CP-H                                        |
| Contrato Cover PDF                            | Protegido por teste dedicado               | `src/__tests__/pdfCover.contract.test.js`                | 4 testes                                                   | Baixo       | Cobre dados críticos, fallback, ficha técnica e integração checklist |
| `cover.js` pre-split                          | Fluxo interno separado em helpers locais   | `src/domain/pdf/sections/cover.js`                       | `pdfCover.contract.test.js`                                | Médio       | Ainda contém render visual e side effects jsPDF                      |
| `coverHelpers`                                | Helpers puros extraídos                    | `src/domain/pdf/sections/coverHelpers.js`                | `pdfCover.helpers.test.js`                                 | Baixo       | Não importa `cover.js`, jsPDF, `autoTable` ou `drawChecklist`        |
| Contrato cover -> checklist/cursor            | Protegido por teste dedicado               | `src/__tests__/pdfCoverChecklistCursor.contract.test.js` | 4 testes                                                   | Baixo       | Trava `startY`, retorno de cursor, fallback e paginação simulada     |
| Adapter local cover -> checklist              | Criado dentro de `cover.js`                | `src/domain/pdf/sections/cover.js`                       | `pdfCoverChecklistCursor.contract.test.js`                 | Médio       | Acoplamento permanece, mas está centralizado                         |
| `drawCover`                                   | Permanece API pública da section           | `src/domain/pdf/sections/cover.js`                       | `pdfCover.contract.test.js`                                | Médio       | Orquestra render visual da capa                                      |
| `drawChecklist`                               | Permanece na section checklist             | `src/domain/pdf/sections/checklist.js`                   | `pdfChecklist.helpers.test.js`, contrato mídia/checklist   | Médio       | Pode mutar página/cursor                                             |
| Ficha técnica                                 | Mantida no render visual da capa           | `src/domain/pdf/sections/cover.js`                       | `pdfCover.contract.test.js`, `pdfCover.helpers.test.js`    | Médio       | Usa dados de placa e `autoTable`                                     |
| Pendências                                    | Mantidas após checklist                    | `src/domain/pdf/sections/cover.js`                       | `pdfCoverChecklistCursor.contract.test.js`                 | Médio       | Depende do cursor retornado pelo checklist                           |
| Resumo/tabela/equipamentos                    | Modelagem em helper e render em `cover.js` | `cover.js`, `coverHelpers.js`                            | `pdfCover.contract.test.js`, `pdfCover.helpers.test.js`    | Médio       | `autoTable` segue no render                                          |
| Fallback cliente/equipamento/registros vazios | Preservado                                 | `cover.js`, `coverHelpers.js`                            | `pdfCover.contract.test.js`, `pdfCover.helpers.test.js`    | Baixo       | Sem mudança funcional                                                |
| Relação com PDFGenerator                      | Sem alteração                              | `src/domain/pdf.js`                                      | contratos PDF existentes                                   | Baixo       | `drawCover` segue chamado pelo fluxo atual                           |
| Relação com checklist/PMOC                    | Adapter local e contrato de cursor         | `cover.js`, `checklist.js`                               | `pdfCoverChecklistCursor.contract.test.js`, contratos PMOC | Médio       | Acoplamento section-to-section ainda existe                          |
| Relação com demais sections                   | Inalterada                                 | `services.js`, `signatures.js`                           | contratos Relatório/PDF                                    | Baixo       | Nenhuma outra section foi alterada na Mudança 14                     |

## 4. Itens restantes com risco

| Item restante                  | Tipo                      | Responsabilidade                     | Motivo para permanecer                | Risco | Recomendação futura                                                  |
| ------------------------------ | ------------------------- | ------------------------------------ | ------------------------------------- | ----- | -------------------------------------------------------------------- |
| `drawCover`                    | Orquestrador visual       | Monta a capa completa                | API pública da section                | Médio | Manter estável; só alterar com contrato visual adicional             |
| Render visual em `cover.js`    | Side effect jsPDF         | Texto, cards, tabelas, fundo, cursor | Render visual não é helper puro       | Médio | Evitar nova extração sem necessidade clara                           |
| `autoTable`                    | Infra/render              | Equipamentos e ficha técnica         | Muta `doc.lastAutoTable`              | Médio | Cobrir cenários críticos, não mover para helper puro                 |
| Adapter `drawChecklist` local  | Integração entre sections | Chamar checklist e preservar cursor  | Acoplamento ainda necessário          | Médio | Revisitar só se o gerador passar a orquestrar checklist fora da capa |
| Ficha técnica                  | Conteúdo técnico          | Dados de placa/extras                | Layout depende de tabela              | Médio | Adicionar teste visual ou contrato granular se houver mudança        |
| Pendências                     | Render pós-checklist      | Ações recomendadas                   | Depende de cursor retornado           | Médio | Manter contrato CP-F antes de qualquer ajuste                        |
| Masthead/branding              | Visual/texto              | Identidade da capa                   | Sensível a regressão visual           | Médio | Evitar mudança sem validação visual                                  |
| Layout sem pixel test          | Cobertura                 | Valida contratos, não pixels         | Pixel-perfect é frágil no jsPDF atual | Médio | Avaliar render smoke PDF em mudança futura                           |
| Paginação/cursor               | Layout                    | Mantém fluxo entre blocos            | jsPDF e `autoTable` têm side effects  | Médio | Preservar contratos de cursor                                        |
| Dados ausentes/fallback        | Robustez                  | Cliente/equipamento/registros vazios | Entradas podem vir incompletas        | Baixo | Manter testes de fallback                                            |
| Acoplamento cover -> checklist | Arquitetura               | Checklist dentro da capa             | Isolado, mas não removido             | Médio | Só remover em mudança de arquitetura do PDF                          |

## 5. Validação de arquitetura

| Verificação                                                  | Resultado | Evidência                                                                                       | Bloqueia encerramento? |
| ------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| `drawCover` permanece no módulo atual                        | OK        | `src/domain/pdf/sections/cover.js` exporta `drawCover`                                          | Não                    |
| Helpers puros estão em `coverHelpers.js`                     | OK        | `coverHelpers.js` contém modelagem de período, título, resumo, equipamentos, ficha e pendências | Não                    |
| `coverHelpers` não importa `cover.js`                        | OK        | Imports atuais não incluem `./cover.js`                                                         | Não                    |
| `coverHelpers` não importa jsPDF/`autoTable`/`drawChecklist` | OK        | Imports são `Utils`, constantes, sanitizers e dados de placa                                    | Não                    |
| Adapter local preserva `drawChecklist`                       | OK        | `runCoverChecklistSection` chama `drawChecklist` com os mesmos argumentos explícitos            | Não                    |
| Contrato CP-B passa                                          | OK        | `pdfCover.contract.test.js` passou                                                              | Não                    |
| Contrato CP-F passa                                          | OK        | `pdfCoverChecklistCursor.contract.test.js` passou                                               | Não                    |
| Sem barrel `index.js` novo                                   | OK        | Nenhum arquivo novo de barrel no diff                                                           | Não                    |
| Sem `test.skip` novo                                         | OK        | Nenhum teste alterado neste CP                                                                  | Não                    |
| Diff do CP apenas documentação                               | OK        | Diff restrito aos docs permitidos                                                               | Não                    |
| Riscos remanescentes documentados                            | OK        | Seções 4 e 8 deste checkpoint                                                                   | Não                    |

## 6. Validação de testes/build

| Validação             | Resultado                  | Observação                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bateria Cover PDF     | Passou                     | `npm run test -- src/__tests__/pdfCover.contract.test.js src/__tests__/pdfCover.helpers.test.js src/__tests__/pdfCoverChecklistCursor.contract.test.js --reporter=dot`: 3 arquivos / 16 testes                                                                                                                                                                                                                                |
| Bateria relacionada   | Passou                     | `npm run test -- src/__tests__/pdfGenerator.mediaChecklist.contract.test.js src/__tests__/pdfGenerator.registroId.test.js src/__tests__/pdfGenerator.helpers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/pmocReport.test.js src/__tests__/pdfSanitizers.test.js src/__tests__/reportExportContracts.test.js src/__tests__/pdfChecklist.helpers.test.js --reporter=dot`: 8 arquivos / 32 testes |
| Suíte `src/__tests__` | Passou                     | `npm run test -- src/__tests__ --reporter=dot`                                                                                                                                                                                                                                                                                                                                                                                |
| `npm run format`      | Passou                     | Prettier executado; arquivos permanecem formatados                                                                                                                                                                                                                                                                                                                                                                            |
| `npm run check`       | Passou                     | Lint/format/test/build passaram com warnings baseline                                                                                                                                                                                                                                                                                                                                                                         |
| `npm run size`        | Não executável no ambiente | Falhou por `size-limit` não reconhecido                                                                                                                                                                                                                                                                                                                                                                                       |
| Playwright            | Passou                     | `npx playwright test -c e2e/playwright.config.js --reporter=list`: 15 passed / 9 skipped                                                                                                                                                                                                                                                                                                                                      |

## 7. Warnings conhecidos

- 30 warnings de lint baseline em `npm run check`, incluindo unused vars e restrições arquiteturais já existentes.
- Warnings Vite/dynamic import/chunk baseline durante build.
- Warnings JSDOM/Supabase/React act durante testes completos:
  - múltiplas instâncias `GoTrueClient` no mesmo contexto;
  - navegação não implementada no JSDOM;
  - update React fora de `act` em `AnimatedCounter`;
  - logs esperados de telemetria/erros simulados.
- Warnings novos identificados neste CP: nenhum.

## 8. Riscos remanescentes

- Render visual da capa ainda não tem teste pixel-perfect.
- `autoTable` e `doc.lastAutoTable` seguem como side effects relevantes para layout.
- Paginação/cursor dependem de integração jsPDF, `autoTable` e `drawChecklist`.
- `drawChecklist` ainda é acoplado à capa por adapter local.
- Ficha técnica e pendências seguem sensíveis a alteração de layout.
- Checklist/PMOC dentro da capa continua sendo uma decisão arquitetural atual.
- Fallbacks de dados ausentes estão cobertos por contrato, mas ainda dependem de entradas reais do gerador.
- `cover.js` ainda contém render visual com mutação de `doc`.
- Relatório/Histórico/PDF visual geral continuam fora do escopo da Mudança 14.

## 9. Decisão final

**Encerrar Mudança 14.**

Próxima mudança técnica recomendada: **Mudança 15 - Histórico**.

Justificativa: a Cover PDF já atingiu o objetivo de redução de risco com inventário, contratos, helpers puros e adapter local. O próximo ganho técnico maior está fora da capa: Histórico ainda concentra fluxo visual/ações/integrações e deve ser mapeado antes de qualquer refatoração.
