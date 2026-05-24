# Mudança 13 / CP-S - Stability checkpoint Relatório/PDF

## 1. Base

- Branch: `main`
- HEAD: `362946519866f671fe7ab538df8d1960ce5f8117`
- Data: 2026-05-09
- Arquivos analisados: `src/ui/controller/handlers/reportExportHandlers.js`, `src/domain/pdf.js`, `src/domain/pdf/**`, `src/ui/views/relatorio.js`, `src/ui/views/historico.js`, `src/__tests__/**`, `src/features/relatorio/**`, `docs/migration/mudanca-13-relatorio-pdf-inventario.md` e historico consolidado em `docs/rewrite/checkpoints-recentes-resumo.md`.
- LOC principais:
  - `src/ui/controller/handlers/reportExportHandlers.js`: 727
  - `src/domain/pdf.js`: 177
  - `src/domain/pdf/shareReport.js`: 319
  - `src/domain/pdf/shareReportHelpers.js`: 20
  - `src/domain/pdf/generatorHelpers.js`: 14
  - `src/domain/pdf/sections/services.js`: 485
  - `src/domain/pdf/sections/servicesHelpers.js`: 20
  - `src/domain/pdf/sections/checklist.js`: 167
  - `src/domain/pdf/sections/checklistHelpers.js`: 33
  - `src/domain/pdf/sections/signatures.js`: 277
  - `src/domain/pdf/sections/signatureHelpers.js`: 34
  - `src/ui/views/relatorio.js`: 751
  - `src/ui/views/historico.js`: 1490

## 2. Objetivo

Consolidar o estado da Mudança 13 / Relatório/PDF após contratos, pre-splits, extrações seguras e remoção do import direto de assinatura UI em `src/domain/pdf.js`, registrando validações, riscos remanescentes e decisão do próximo passo.

## 3. Estado atual dos blocos trabalhados

| Bloco/fluxo                         | Estado atual                                    | Arquivo principal                                            | Teste existente                                                                   | Risco atual | Observação                                                                              |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| Contratos export PDF/WhatsApp       | Preservados e ampliados                         | `src/__tests__/reportExportContracts.test.js`                | `reportExportContracts.test.js`                                                   | Baixo       | Bloqueia regressões de actions, quota, `registroId`, upload/fallback e DI de assinatura |
| reportExportHandlers                | Pre-split com helpers locais e DI de assinatura | `src/ui/controller/handlers/reportExportHandlers.js`         | `reportExportHandlers.test.js`, `relatorioExportPmocLegacyHandlers.test.js`       | Médio       | Ainda concentra quota, preview, PMOC e share                                            |
| Helper export                       | Movido para módulo dedicado                     | `src/features/relatorio/export/reportExportHelpers.js`       | `reportExportHelpers.test.js`                                                     | Baixo       | Helpers seguros de copy/metadata                                                        |
| shareReport                         | Pre-split in-place                              | `src/domain/pdf/shareReport.js`                              | `shareReport.test.js`                                                             | Médio/alto  | Ainda contém Web Share, upload, download e onboarding                                   |
| shareReportHelpers                  | Helper seguro extraído                          | `src/domain/pdf/shareReportHelpers.js`                       | `shareReportHelpers.test.js`                                                      | Baixo       | Sem Supabase, Web Share ou DOM                                                          |
| domain/pdf.js                       | Pre-split e DI aplicada                         | `src/domain/pdf.js`                                          | `pdfGenerator.mediaChecklist.contract.test.js`, `pdfGenerator.registroId.test.js` | Médio       | Ainda lê state/Profile e instancia/muta jsPDF                                           |
| generatorHelpers                    | Helper seguro extraído                          | `src/domain/pdf/generatorHelpers.js`                         | `pdfGenerator.helpers.test.js`                                                    | Baixo       | Modelo/filtros/OS preservados                                                           |
| services section                    | Pre-split in-place                              | `src/domain/pdf/sections/services.js`                        | `pdfGenerator.mediaChecklist.contract.test.js`, `photoStorage.test.js`            | Médio/alto  | Render visual e fotos seguem no arquivo                                                 |
| servicesHelpers                     | Helpers seguros extraídos                       | `src/domain/pdf/sections/servicesHelpers.js`                 | `pdfServices.helpers.test.js`                                                     | Baixo       | Cálculo de cursor/quebra sem jsPDF                                                      |
| checklist section                   | Pre-split in-place                              | `src/domain/pdf/sections/checklist.js`                       | `registroChecklistPmoc.contract.test.js`, `pmocReport.test.js`                    | Médio       | Render visual e `autoTable` seguem no arquivo                                           |
| checklistHelpers                    | Helpers seguros extraídos                       | `src/domain/pdf/sections/checklistHelpers.js`                | `pdfChecklist.helpers.test.js`                                                    | Baixo       | Filtro, layout inicial, grupos e resumo puros                                           |
| signatures section                  | Pre-split in-place                              | `src/domain/pdf/sections/signatures.js`                      | `pdfGenerator.mediaChecklist.contract.test.js`, `signatureResolver.test.js`       | Médio       | Render visual e comprovantes seguem no arquivo                                          |
| signatureHelpers                    | Helper seguro extraído                          | `src/domain/pdf/sections/signatureHelpers.js`                | `pdfSignature.helpers.test.js`                                                    | Baixo       | Modelagem de registro assinado por DI                                                   |
| Assinatura via DI                   | Aplicada                                        | `src/domain/pdf.js`, `reportExportHandlers.js`               | `reportExportContracts.test.js`, `pdfGenerator.mediaChecklist.contract.test.js`   | Baixo       | `domain/pdf.js` não importa mais `ui/components/signature.js`                           |
| domain/pdf -> UI signature removido | Concluído                                       | `src/domain/pdf.js`                                          | `reportExportContracts.test.js`                                                   | Baixo       | Import UI restante em `domain/pdf/**` é `shareReport.js` -> onboarding                  |
| Registro -> PDF mídia/checklist     | Contrato criado                                 | `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js` | Mesmo arquivo                                                                     | Médio       | Garante fotos, assinatura, checklist e fallback, sem snapshot visual                    |
| reportModel/registroId              | Helper e contrato preservados                   | `src/domain/pdf/reportModel.js`                              | `reportModel.registroId.test.js`, `pdfGenerator.registroId.test.js`               | Baixo       | `filters.registroId` protegido                                                          |
| PMOC formal                         | Mapeado e coberto parcialmente                  | `src/domain/pdf/pmoc/pmocReport.js`                          | `pmocReport.test.js`                                                              | Médio/alto  | Fluxo formal ainda não foi pre-split nesta mudança                                      |
| Histórico/relatório UI              | Consumidores preservados                        | `src/ui/views/relatorio.js`, `src/ui/views/historico.js`     | `relatorio*.test.js`, `historico*.test.js`                                        | Médio       | Arquivos ainda grandes, mas fora dos cortes CP-S                                        |

## 4. Itens restantes com risco

| Item restante                                 | Tipo                      | Responsabilidade                                           | Motivo para permanecer                                        | Risco      | Recomendação futura                                             |
| --------------------------------------------- | ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- | ---------- | --------------------------------------------------------------- |
| `reportExportHandlers` com quota/preview/PMOC | Orquestrador UI           | Export PDF, WhatsApp, quota, preview, PMOC                 | Precisa preservar contracts de UI/action                      | Médio      | Mapear novo corte apenas se houver necessidade clara            |
| `exportPdfFlow` / `shareWhatsAppFlow`         | Fluxos UI                 | Encadear geração, quota, toast, share                      | Fluxos já protegidos por contrato e sensíveis a copy/fallback | Médio      | Evitar mover sem contrato adicional de UI                       |
| `domain/pdf.js` como orquestrador             | Domain/PDF                | State, modelo, jsPDF, sections, blob/save                  | Mantém API pública `PDFGenerator`                             | Médio      | Próximo corte pode isolar cover ou checkpoint final             |
| `getState` / `Profile` em `domain/pdf.js`     | Acoplamento state/profile | Carregar registros/equipamentos/profile                    | Mover exigiria contrato amplo de chamada                      | Médio      | Avaliar DI em mudança futura, não neste checkpoint              |
| jsPDF/render side effects                     | Infra/render              | Instanciar e mutar documento                               | Intrínseco ao gerador atual                                   | Médio      | Manter helpers puros separados                                  |
| `shareReport` com Web Share/upload/download   | Domain/share              | Web Share, Supabase Storage, WhatsApp link, fallback local | Side effects altos foram mantidos por segurança               | Médio/alto | Cortes futuros só com contratos de upload/fallback              |
| Services visual/render                        | Section PDF               | Cards, fotos, fallback visual, paginação                   | Layout manual sensível                                        | Médio/alto | Só mover render com verificação visual ou contratos mais fortes |
| Checklist visual/render                       | Section PDF               | `autoTable`, status, PMOC checklist                        | Render e paginação sensíveis                                  | Médio      | Manter helpers puros extraídos                                  |
| Signatures visual/render                      | Section PDF               | Comprovantes, cláusula, imagem/fallback                    | Layout legal e assinatura sensíveis                           | Médio      | Manter render local                                             |
| Cover section grande                          | Section PDF               | Capa, resumo, conclusão, ficha técnica                     | Ainda não trabalhada na Mudança 13                            | Alto       | Candidato técnico se Mudança 13 continuar                       |
| `historico.js`                                | UI legado                 | Histórico, cards/actions, timeline                         | Arquivo grande e fora do escopo Relatório/PDF                 | Médio/alto | Mapear em mudança separada                                      |
| `relatorio.js`                                | UI legado                 | Composition root da tela Relatório                         | Reduziu LOC antes, mas ainda é consumidor sensível            | Médio      | Evitar mexer sem objetivo de UI                                 |
| PMOC report formal                            | Gerador PDF formal        | Documento PMOC legal com seções próprias                   | Fluxo separado, Pro e com layout legal                        | Médio/alto | Mapear/pre-split em mudança futura                              |

## 5. Validação de arquitetura

| Verificação                                               | Resultado         | Evidência                                                                                                      | Bloqueia encerramento?  |
| --------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `domain/pdf.js` não importa mais UI signature             | OK                | grep não encontrou `ui/components/signature` em `src/domain/pdf.js`; contrato CP-R valida ausência             | Não                     |
| Sections de `domain/pdf` não importam adapter UI indevido | OK                | grep não encontrou UI/components nas sections                                                                  | Não                     |
| `shareReport` ainda tem side effects documentados         | OK com risco      | `src/domain/pdf/shareReport.js` importa Supabase, errors e onboarding UI                                       | Não, risco documentado  |
| `reportExportHandlers` segue adapter/orquestrador         | OK                | Handler injeta resolver e mantém quota/preview/share                                                           | Não                     |
| Contratos CP-B/CP-H passam                                | OK                | Bateria contratos/helpers Relatório/PDF passou com 16 arquivos e 88 testes                                     | Não                     |
| Helper modules têm testes próprios                        | OK                | `shareReportHelpers`, `generatorHelpers`, `servicesHelpers`, `checklistHelpers`, `signatureHelpers` têm testes | Não                     |
| Sem barrel `index.js` novo                                | OK                | Diff inicial limpo; nenhum arquivo novo em `src/`                                                              | Não                     |
| Sem `test.skip` novo                                      | OK                | CP documental sem alteração em testes                                                                          | Não                     |
| Sem alteração package/schema/CSS                          | OK                | Diff inicial limpo; escopo permitido apenas docs                                                               | Não                     |
| Warnings são baseline ou novos                            | Baseline esperado | CP-R tinha 31 warnings de lint e warnings Vite/jsdom/Supabase/React act                                        | Não se validação passar |
| Diff do CP é apenas documentação                          | OK                | Diff restrito aos dois docs permitidos antes do commit                                                         | Não                     |
| Riscos remanescentes estão documentados                   | OK                | Seções 4, 7 e 8 deste documento                                                                                | Não                     |

## 6. Validação de testes/build

| Validação                               | Resultado  | Observação                                                                                                    |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Bateria contratos/helpers Relatório/PDF | OK         | 16 arquivos e 88 testes passaram com `--reporter=dot`                                                         |
| Suíte `src/__tests__`                   | OK         | Comando concluiu com exit 0; saída extensa foi truncada pelo terminal                                         |
| `npm run format`                        | OK         | Prettier executado no repo                                                                                    |
| `npm run check`                         | OK         | `lint`, `format:check`, `test` e `build` passaram; lint manteve 31 warnings e 0 erros                         |
| `npm run size`                          | Falhou     | Opcional; script existe, mas `size-limit` não foi encontrado no ambiente local; nenhuma dependência instalada |
| Playwright                              | Não rodado | Opcional; não executado neste CP documental após `test`, `format`, `check` e `size` opcional                  |

## 7. Warnings conhecidos

- Lint baseline do CP-R: 31 warnings, 0 erros. Inclui unused vars em arquivos antigos e restrições arquiteturais já conhecidas (`core` importando `domain`, `shareReport` importando onboarding UI, component importando view).
- Warnings Vite/dynamic import/chunk: imports dinâmicos que também são estáticos e chunks maiores que 500 kB.
- Warnings JSDOM/Supabase/React act: navegação não implementada no jsdom, múltiplas instâncias GoTrueClient em testes e `AnimatedCounter` fora de `act`.
- `npm run size` não executou por ausência do binário `size-limit` no ambiente local; registrado como limitação opcional, sem instalação de dependências.

## 8. Riscos remanescentes

- `reportExportHandlers` ainda concentra quota, preview, PMOC, download e share.
- `domain/pdf.js` ainda lê `getState`/`Profile` e instancia/muta jsPDF.
- `shareReport` ainda mistura Web Share, upload Supabase, link WhatsApp e download fallback.
- Sections ainda têm render visual pesado e pouca validação pixel-level.
- `cover.js` permanece grande e denso.
- `relatorio.js` e `historico.js` seguem grandes, embora preservados neste checkpoint.
- PMOC formal ainda não foi mapeado/pre-split no mesmo nível dos PDF sections principais.
- Layout visual do PDF é protegido por contratos funcionais, mas não por screenshot/pixel tests.
- Warnings de dynamic import/chunks permanecem como dívida operacional.

## 9. Decisão recomendada

**Encerrar Mudança 13** após este checkpoint, se as validações CP-S passarem.

Justificativa: a Mudança 13 já protegeu contratos críticos, reduziu acoplamento no gerador PDF, extraiu helpers seguros e removeu o import direto de UI signature em `domain/pdf.js`. Os riscos restantes são reais, mas pertencem a cortes maiores e mais específicos. A próxima mudança técnica recomendada é mapear/pre-split a `cover` section ou PMOC formal em uma mudança separada, com contratos próprios.
