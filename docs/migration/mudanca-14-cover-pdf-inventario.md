# Mudança 14 - Cover PDF / Inventário inicial

## 1. Base

- Branch: `main`.
- HEAD: `b1c481093c6f5f0eb1a3a4be27a56665bc478afb`.
- Data: 2026-05-09.
- Arquivos analisados: `src/domain/pdf/sections/cover.js`, `src/domain/pdf.js`, `src/domain/pdf/reportModel.js`, `src/domain/pdf/generatorHelpers.js`, `src/domain/pdf/constants.js`, `src/domain/pdf/primitives.js`, `src/domain/pdf/sections/checklist.js`, testes PDF/Relatório/PMOC relacionados.
- Arquivo principal identificado: `src/domain/pdf/sections/cover.js`.
- LOC dos arquivos principais: `cover.js` 677; `domain/pdf.js` 208; `services.js` 554; `checklist.js` 191; `signatures.js` 311.

## 2. Objetivo

Mapear profundamente a capa do PDF de manutenção antes de qualquer refatoração, identificando a ordem real de `drawCover`, contratos de dados/layout, dependências técnicas, testes existentes, lacunas e sequência segura para a Mudança 14.

## 3. Escopo real Cover PDF

| Arquivo                                                      | LOC | Tipo                           | Responsabilidade aparente                                                                                                                           | Exporta API pública? | Risco                                                                                            |
| ------------------------------------------------------------ | --: | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| `src/domain/pdf/sections/cover.js`                           | 677 | PDF section                    | Capa do relatório: masthead, título/OS, técnico/cliente, resumo executivo, tabela de equipamentos, conclusão, ficha técnica, checklist e pendências | Sim: `drawCover`     | Alto: arquivo denso, render visual manual, `autoTable`, paginação parcial e chamada de checklist |
| `src/domain/pdf.js`                                          | 208 | Orquestrador PDF               | Monta contexto, filtra registros, cria jsPDF e chama `drawCover` antes de services/signatures                                                       | Sim: `PDFGenerator`  | Médio: state/Profile/jsPDF, mas já sem import UI signature                                       |
| `src/domain/pdf/reportModel.js`                              |  86 | Model/helper                   | Filtra registros, monta filename, OS e bloco de cliente usado pela capa                                                                             | Sim                  | Médio: `buildOsNumber` persiste contador local por padrão                                        |
| `src/domain/pdf/generatorHelpers.js`                         |  14 | Helper puro                    | Monta `filtered`, `osNumber`, `emitido` e `reportContext.cliente` repassado ao cover                                                                | Sim                  | Baixo                                                                                            |
| `src/domain/pdf/constants.js`                                |  41 | Infra PDF                      | Paleta, tipografia e labels/status usados pela capa                                                                                                 | Sim                  | Médio: mudança visual global                                                                     |
| `src/domain/pdf/primitives.js`                               |  90 | Infra PDF                      | `fillPage`, `fillRect`, `roundRect`, `txt`, `accentLine`, watermark                                                                                 | Sim                  | Médio: compartilhado por várias sections                                                         |
| `src/domain/pdf/sections/checklist.js`                       | 191 | PDF section chamada pela cover | Renderiza checklist/PMOC dentro do fluxo da capa                                                                                                    | Sim: `drawChecklist` | Médio: `cover.js` acopla seção checklist e cursor                                                |
| `src/domain/dadosPlacaDisplay.js`                            | 102 | Domain formatter               | Formata dados de placa para ficha técnica da capa                                                                                                   | Sim                  | Médio: shape de dados de equipamento afeta PDF                                                   |
| `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js` | 224 | Contrato PDF                   | Mocka `drawCover` e valida que o filtro/registro com mídia/checklist chega ao cover                                                                 | Não                  | Médio: cobre consumo, não layout                                                                 |
| `src/__tests__/pdfGenerator.registroId.test.js`              |  88 | Contrato PDF                   | Garante prioridade de `registroId` no gerador                                                                                                       | Não                  | Médio: cobertura indireta da entrada da capa                                                     |
| `src/__tests__/pdfGenerator.helpers.test.js`                 |  67 | Teste helper                   | Cobre modelo de documento, OS, emissão e cliente                                                                                                    | Não                  | Baixo                                                                                            |
| `src/__tests__/pmocReport.test.js`                           |  64 | PMOC formal                    | Cobre numeração PMOC formal, não a cover de manutenção                                                                                              | Não                  | Baixo para cover                                                                                 |

## 4. Ordem real do drawCover

| Ordem | Bloco atual drawCover                                                                                                                       | Responsabilidade                                                                        | Dependências                                                        | Side effects                                             | Risco                                              |
| ----: | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
|     1 | Assinatura pública `drawCover(doc, pageWidth, pageHeight, margin, profile, _filtEq, de, ate, filtered, equipamentos, _drawFooter, context)` | Recebe superfície jsPDF, dados filtrados, equipamentos, profile e contexto de relatório | `domain/pdf.js`, `generatorHelpers`                                 | Nenhum retorno; muta `doc`                               | Alto: API posicional extensa                       |
|     2 | `fillPage`                                                                                                                                  | Pinta fundo da primeira página                                                          | `primitives.js`, cores PDF                                          | `doc.rect`/fill                                          | Baixo                                              |
|     3 | `drawMasthead`                                                                                                                              | Branding CoolTrack e identidade do prestador                                            | `profile`, `C`, `txt`, `fillRect`                                   | Texto/faixas no topo                                     | Médio: branding e dados do prestador               |
|     4 | `periodoTexto`                                                                                                                              | Monta período exibido no título                                                         | `de`, `ate`, `Utils.formatDate`                                     | Nenhum                                                   | Médio: datas/fallback textual                      |
|     5 | `drawTitleBlock`                                                                                                                            | Título, badge OS, emitido, cliente, técnico e período                                   | `context.osNumber`, `context.emitido`, `context.cliente`, `profile` | Texto, badge, linha                                      | Alto: textos visíveis e layout compacto            |
|     6 | `drawInfoBlocks`                                                                                                                            | Blocos técnico e cliente/local                                                          | `profile`, `context.cliente`, PMOC legal fields                     | Retângulos/textos                                        | Alto: cliente/equipamento podem ter dados ausentes |
|     7 | `drawResumoExecutivo`                                                                                                                       | Cards de serviços, equipamentos e status geral                                          | `filtered`, `equipamentos`, `STATUS_CLIENTE`, contadores            | Cards/textos                                             | Alto: resumo é sinal principal da capa             |
|     8 | `drawEquipamentosTable`                                                                                                                     | Tabela de equipamentos atendidos                                                        | `autoTable`, `Utils.formatDate`, `STATUS_CLIENTE`, equipamentos     | `autoTable`, `doc.circle`, `doc.lastAutoTable`           | Alto: layout e status visual sensíveis             |
|     9 | `drawConclusao`                                                                                                                             | Conclusão textual por status agregado                                                   | `formatStatusConclusion`, contadores                                | Card/texto                                               | Médio: texto de conclusão visível                  |
|    10 | `drawFichaTecnica`                                                                                                                          | Dados de placa e extras por equipamento                                                 | `formatDadosPlacaRows`, `autoTable`                                 | Pode `doc.addPage`; usa cursor local                     | Alto: paginação e dados técnicos                   |
|    11 | `drawChecklist`                                                                                                                             | Checklist/PMOC dentro do fluxo da capa                                                  | `sections/checklist.js`, registros/equipamentos                     | Pode renderizar tabelas/páginas                          | Alto: acoplamento section-to-section               |
|    12 | `drawPendencias`                                                                                                                            | Ações recomendadas por status/proxima preventiva                                        | `listPendencias`, `Utils.daysDiff`, equipamentos                    | Renderiza cards; pode não renderizar por falta de espaço | Médio/alto: fallback silencioso por espaço         |
|    13 | Retorno final                                                                                                                               | Não retorna cursor explícito                                                            | N/A                                                                 | Consumidor não recebe posição final                      | Médio: dificulta testes e extrações                |

## 5. Contratos e dados consumidos

| Contrato/dado cover                   | Origem                                                 | Consumidor                                              | Teste existente                                                                   | Risco se alterar                                |
| ------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| `filtered` registros                  | `filterRegistrosForReport` via `buildPdfDocumentModel` | Resumo, tabela, conclusão, ficha, checklist, pendências | `pdfGenerator.mediaChecklist.contract.test.js`, `pdfGenerator.registroId.test.js` | Selecionar registros errados muda todo PDF      |
| `filters.registroId`                  | UI/handlers/Registro -> `domain/pdf.js`                | `filtered` passado ao cover                             | `reportExportContracts`, `pdfGenerator.registroId`                                | Alto: capa pode mostrar dados de outro registro |
| `profile.nome/empresa/telefone/email` | `Profile.get()`                                        | Masthead, técnico, footer indireto                      | Parcial em testes do gerador/helper                                               | Médio: identidade do prestador                  |
| `profile.cnpj/inscricao_*`            | Profile                                                | Bloco técnico com dados legais PMOC                     | Sem teste específico de cover                                                     | Médio: dados legais podem sumir                 |
| `context.cliente`                     | `extractClientBlock(filtered)`                         | Título e bloco cliente/local                            | `pdfGenerator.helpers.test.js`                                                    | Alto: capa formal perde destinatário            |
| `context.osNumber`                    | `buildOsNumber`                                        | Badge OS                                                | `pdfGenerator.helpers.test.js`                                                    | Médio: identificação do documento               |
| `context.emitido`                     | `buildPdfDocumentModel`                                | Linha de metadados                                      | `pdfGenerator.helpers.test.js`                                                    | Baixo/médio                                     |
| `de`/`ate`                            | filtros de relatório                                   | `periodoTexto`                                          | Contratos de filtro, indireto                                                     | Médio: período visível incorreto                |
| Equipamentos                          | state/equipamentos                                     | tabela, ficha técnica, pendências                       | Indireto em contratos PDF                                                         | Alto: nomes/tags/status/ficha técnica           |
| `equipamento.dadosPlaca`              | Registro/Equipamentos                                  | ficha técnica                                           | Testes de dadosPlaca, sem cover específico                                        | Médio/alto: ficha técnica sem cobertura visual  |
| `registro.status`                     | Registro                                               | resumo, tabela, conclusão, pendências                   | Contratos de PDF e maintenance                                                    | Alto: status visual e conclusão                 |
| `registro.proxima`                    | Registro                                               | tabela e pendências                                     | Indireto                                                                          | Médio: ação recomendada incorreta               |
| `registro.checklist`                  | Registro                                               | `drawChecklist` chamado pela cover                      | `pdfGenerator.mediaChecklist`, `registroChecklistPmoc.contract`                   | Alto: PMOC/checklist dentro da capa             |
| Branding/textos visíveis              | `cover.js`, constants                                  | Masthead, seções, labels                                | Sem teste textual específico da cover                                             | Alto: regressão visual/textual passa fácil      |
| Dados ausentes                        | fallbacks locais                                       | cliente/local, tabela, ficha                            | Parcial em contratos gerais                                                       | Médio: fallback silencioso pode ocultar lacuna  |

## 6. Dependências técnicas

| Dependência                                | Usada onde                                   | Função                           | Acoplamento                    | Risco      | Estratégia sugerida                                           |
| ------------------------------------------ | -------------------------------------------- | -------------------------------- | ------------------------------ | ---------- | ------------------------------------------------------------- |
| `jsPDF/doc`                                | Todos os renderizadores                      | Mutação visual do PDF            | Forte e esperado               | Alto       | Não mover render antes de contratos                           |
| `jspdf-autotable`                          | Equipamentos e ficha técnica                 | Tabelas e cursor `lastAutoTable` | Forte                          | Alto       | Contrato específico para chamadas/linhas                      |
| `PDF_COLORS`, `PDF_TYPO`, `STATUS_CLIENTE` | Masthead, cards, tabela, conclusão           | Identidade visual e status       | Compartilhado                  | Médio      | Evitar mudança visual neste ciclo                             |
| `primitives.js`                            | `fillPage`, `txt`, `roundRect`, `accentLine` | Abstração de desenho             | Compartilhado por sections     | Médio      | Manter como baseline                                          |
| `Utils.formatDate`, `Utils.daysDiff`       | Datas e pendências                           | Formatação/período/proxima       | Core util                      | Médio      | Testar datas antes de refatorar                               |
| `formatStatusConclusion`                   | Conclusão                                    | Texto por status agregado        | Domain sanitizer/model         | Médio      | Contrato textual pequeno                                      |
| `sanitizePublicText`                       | Cliente                                      | Sanitização de dados públicos    | Domain sanitizer               | Médio      | Testar HTML/injeção em cover model                            |
| `formatDadosPlacaRows`                     | Ficha técnica                                | Normalização de dados de placa   | Domain dadosPlaca              | Médio/alto | Contrato de ficha técnica                                     |
| `drawChecklist`                            | Final da capa                                | Checklist/PMOC                   | Acoplamento section-to-section | Alto       | Mapear se deve permanecer ou virar passo explícito do gerador |
| `domain/pdf.js`                            | Chamada de `drawCover`                       | Orquestração e contexto          | API posicional                 | Médio      | Pre-split in-place antes de mover helpers                     |
| `reportModel/generatorHelpers`             | Cliente, OS, filtros                         | Modelo da capa                   | Baixo/médio                    | Médio      | Manter coberto por helpers tests                              |

## 7. Testes existentes e lacunas

| Teste                                          | O que cobre                                                                     | O que não cobre                                                         | Importância      | Observação                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------- | ---------------------------------------------------- |
| `pdfGenerator.mediaChecklist.contract.test.js` | `filtered` com fotos/assinatura/checklist chega ao `drawCover`; fluxo gera Blob | Layout real da capa, textos, tabela, ficha técnica                      | Alta             | Mocka `drawCover`                                    |
| `pdfGenerator.registroId.test.js`              | Prioridade de `registroId` no gerador                                           | Argumentos completos da capa e layout                                   | Alta             | Protege seleção de dados                             |
| `pdfGenerator.helpers.test.js`                 | OS, emissão, cliente e filtro no model                                          | Render da capa                                                          | Alta             | Boa base para contrato de cover model                |
| `reportExportContracts.test.js`                | Ações export/share, quota, fallback e filtros                                   | Layout da capa                                                          | Alta             | Cobertura indireta                                   |
| `registroChecklistPmoc.contract.test.js`       | Checklist/PMOC no Registro                                                      | Render da cover/checklist PDF                                           | Alta             | Complementar                                         |
| `pdfChecklist.helpers.test.js`                 | Helpers puros de checklist PDF                                                  | Integração chamada pela cover                                           | Média            | Não valida posição na capa                           |
| `pmocReport.test.js`                           | Numeração PMOC formal                                                           | Cover de manutenção                                                     | Baixa para cover | Fluxo PMOC separado                                  |
| `pdfSanitizers.test.js`                        | Sanitização PDF                                                                 | Uso específico na capa                                                  | Média            | Pode sustentar contrato textual                      |
| Lacuna                                         | Sem teste dedicado para `drawCover` real                                        | Masthead, cards, autoTable, ficha técnica, pendências, fallback ausente | Alta             | Recomenda CP-B de contrato                           |
| Lacuna                                         | Sem validação visual/pixel                                                      | Quebra visual pode passar                                               | Alta             | Evitar snapshot gigante; usar spies de doc/autoTable |

## 8. Riscos principais

- Layout visual: `drawCover` mistura seções, cards, tabela, ficha técnica, checklist e pendências em um único arquivo.
- Dados ausentes: cliente/equipamento/profile têm fallbacks silenciosos e podem ocultar regressões.
- Checklist/PMOC: `cover.js` chama `drawChecklist` diretamente, criando acoplamento entre sections.
- Cliente/equipamento: `context.cliente`, equipamentos filtrados e dados de placa determinam o valor formal do PDF.
- Branding: masthead e textos visíveis carregam identidade CoolTrack/prestador.
- Paginação: ficha técnica pode chamar `doc.addPage`; pendências podem não renderizar se não houver espaço.
- Regressão silenciosa: `drawCover` não retorna cursor nem modelo, o que dificulta asserts granulares.
- Cobertura visual limitada: testes atuais protegem dados e fluxo, mas não a renderização real da capa.

## 9. Sequência recomendada da Mudança 14

| Opção de próximo CP                           | Benefício                                                                | Risco      | Pré-requisitos                                        | Recomendação                   |
| --------------------------------------------- | ------------------------------------------------------------------------ | ---------- | ----------------------------------------------------- | ------------------------------ |
| CP-B - contrato específico da cover section   | Trava dados/textos/chamadas essenciais antes de refatorar                | Baixo      | Usar mocks de `doc`/`autoTable`, sem snapshot gigante | Recomendado                    |
| CP-C - pre-split cover.js in-place            | Separa modelagem/render localmente                                       | Médio      | CP-B passando                                         | Sim, depois do contrato        |
| CP-D - mover helpers puros de cover           | Reduz acoplamento e melhora testabilidade                                | Médio      | Helpers puros criados no CP-C                         | Sim, se houver helpers seguros |
| CP-E - revisar acoplamento cover -> checklist | Decide se checklist deve seguir dentro da cover ou virar step do gerador | Médio/alto | Contratos de cover/checklist                          | Avaliar após CP-C/D            |
| CP-F - stability checkpoint Mudança 14        | Consolida validações e decide próxima mudança                            | Baixo      | CPs técnicos concluídos                               | Recomendado ao final           |

## 10. Próximo CP recomendado

Recomendado: **CP-B - contrato específico da cover section**.

Justificativa: há mais de 90% de confiança de que `cover.js` precisa de refatoração, mas o risco principal é visual/dados formais. Antes de qualquer pre-split, um contrato dedicado deve travar os argumentos de `drawCover`, os textos/dados críticos renderizados, chamadas a `autoTable`, ficha técnica, fallback de cliente/equipamento e o acoplamento atual com `drawChecklist`, sem snapshot gigante e sem alterar produção.

## 11. CP-B - Contrato específico da Cover section PDF

- Status: aplicado.
- Teste criado: `src/__tests__/pdfCover.contract.test.js`.
- Mudança funcional: nenhuma.
- Arquivos de produção alterados: nenhum.
- `cover.js` alterado: não.

| Contrato Cover PDF                 | Origem                                | Consumidor                                  | Teste existente                             | Lacuna antes                                | Cobertura adicionada                                                      |
| ---------------------------------- | ------------------------------------- | ------------------------------------------- | ------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| `drawCover`                        | `src/domain/pdf/sections/cover.js`    | `domain/pdf.js`                             | Indireto via contratos do gerador           | Sem contrato dedicado da section real       | `pdfCover.contract.test.js` chama `drawCover` real com `doc` mockado      |
| Masthead/branding                  | `profile`, constants e textos fixos   | `drawMasthead`                              | Sem cobertura específica                    | Branding poderia sumir sem falha direta     | Assert de `COOLTRACK` e prestador                                         |
| Título/OS/emissão                  | `context.osNumber`, `context.emitido` | `drawTitleBlock`                            | `pdfGenerator.helpers.test.js` cobre modelo | Sem render real da capa                     | Assert de `OS 2026-0509-001` e dados visíveis                             |
| Cliente                            | `context.cliente`                     | `drawTitleBlock`, `drawInfoBlocks`          | Modelo do gerador                           | Sem fallback/render da cover                | Assert de cliente real e fallback sem cliente                             |
| Técnico                            | `profile.nome`                        | Masthead/title/info blocks                  | Parcial em gerador                          | Sem render real                             | Assert de técnico no texto renderizado                                    |
| Período/data                       | `de`/`ate`                            | `periodoTexto` da cover                     | Filtros indiretos                           | Sem texto de período na cover               | Assert de datas formatadas no texto renderizado                           |
| Equipamentos                       | `equipamentos` + `filtered`           | Resumo/tabela/ficha/pendências              | Indireto                                    | Tabela real não protegida                   | Assert de `autoTable` com tag/nome                                        |
| Status/resumo                      | `registro.status`                     | `drawResumoExecutivo`, tabela, conclusão    | Sanitizers e contratos indiretos            | Cards/resumo sem contrato                   | Assert de `RESUMO EXECUTIVO` e dados de contagem                          |
| Registros filtrados                | `filtered`                            | Toda a capa                                 | `pdfGenerator.registroId`, CP-H             | Section real não validava shape             | Teste passa `filtered` real para tabela/checklist                         |
| Ficha técnica/dados de placa       | `equipamento.dadosPlaca`              | `drawFichaTecnica` / `formatDadosPlacaRows` | Testes de `dadosPlaca`, não cover           | Chamada `autoTable` da ficha sem cobertura  | Assert de `SN-12345`, `12.000 BTU` e extra `R410A`                        |
| Checklist/PMOC via `drawChecklist` | `registro.checklist`                  | `drawCover` -> `drawChecklist`              | CP-H e checklist helpers                    | Acoplamento cover -> checklist sem contrato | Spy garante chamada com `tipo_template` e `items`                         |
| Pendências                         | `status`/`proxima`                    | `drawPendencias`                            | Indireto                                    | Sem prova de entrada pendente               | Caso danger/proxima renderiza equipamento pendente sem quebrar            |
| Fallback cliente/equipamento       | Dados ausentes                        | Info blocks/tabelas/pendências              | Parcial                                     | Fallback silencioso sem teste dedicado      | Testes cobrem cliente ausente, registros vazios e equipamento inexistente |
| `autoTable`                        | `jspdf-autotable`                     | Tabela/ficha                                | Mocks indiretos                             | Chamada da cover sem contrato               | Spy pequeno trava payload mínimo sem snapshot gigante                     |
| Textos visíveis principais         | Strings de `cover.js`                 | Leitor do PDF                               | Sem teste específico                        | Regressão textual silenciosa                | Assert de títulos/seções principais                                       |

Cobertura adicionada:

- `drawCover` real executa sem exceção com dados completos e com dados mínimos.
- Masthead, OS, cliente, técnico, período, resumo e seções principais ficam protegidos por texto capturado no `doc`.
- Tabela de equipamentos e ficha técnica ficam protegidas por chamadas a `autoTable`.
- Integração atual `cover.js` -> `drawChecklist` fica protegida sem duplicar o teste completo de checklist.
- Fallbacks para cliente ausente, registros vazios e equipamento inexistente ficam protegidos.

Lacunas remanescentes:

- Não há teste pixel-perfect do layout da capa.
- Paginação visual real de ficha técnica/pendências continua coberta apenas por contrato de não quebra e chamadas mínimas.
- `cover.js` ainda concentra render visual, modelagem local, `autoTable`, ficha técnica, checklist e pendências no mesmo arquivo.

Próximo CP recomendado: **CP-C - pre-split cover.js**.

Justificativa: o contrato dedicado agora protege os dados e chamadas mais sensíveis da capa. O próximo passo seguro é separar responsabilidades in-place dentro de `cover.js`, sem mover helpers ainda e sem mudar layout.

## 12. CP-C - Pre-split in-place de `cover.js`

- Status: aplicado.
- Arquivo de produção alterado: `src/domain/pdf/sections/cover.js`.
- `cover.js` permaneceu no mesmo arquivo.
- `drawCover` permaneceu como API pública da section.
- Mudança funcional intencional: nenhuma.
- Contrato CP-B preservado.
- LOC `cover.js`: 677 -> 748 (+71).

| Ordem | Bloco atual drawCover               | Responsabilidade                                                               | Dependências                                       | Side effects                                        | Helper criado                               |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------- |
| 1     | Assinatura pública `drawCover(...)` | Receber `doc`, dimensões, profile, filtros, registros, equipamentos e contexto | `domain/pdf.js`                                    | Mantém API posicional; muta `doc` por render        | `buildCoverContext`                         |
| 2     | Entrada/contexto                    | Consolidar dados e período sem renderizar                                      | `Utils.formatDate`, `context.cliente`              | Nenhum                                              | `buildCoverContext`, `buildCoverPeriodText` |
| 3     | Fundo                               | Pintar fundo da página                                                         | `fillPage`                                         | Muta `doc`                                          | `renderCoverBackground`                     |
| 4     | Masthead/branding                   | Renderizar marca CoolTrack e prestador                                         | `profile`, primitives                              | Muta `doc`                                          | Mantido em `drawMasthead`                   |
| 5     | Título/OS/emissão                   | Montar e renderizar OS, emissão, cliente, técnico e período                    | `context`, `profile`, `sanitizePublicText`         | Muta `doc`, mede texto                              | `buildCoverTitleModel`                      |
| 6     | Info blocks                         | Montar linhas de técnico/cliente e renderizar blocos                           | `profile`, `context.cliente`                       | Muta `doc`                                          | `buildCoverInfoBlocksModel`                 |
| 7     | Resumo executivo                    | Montar cards de serviços/equipamentos/status e renderizar                      | `filtered`, `equipamentos`, `STATUS_CLIENTE`       | Muta `doc`                                          | `buildCoverResumoModel`                     |
| 8     | Tabela de equipamentos              | Montar linhas e chamar `autoTable`                                             | `filtered`, `equipamentos`, `Utils.formatDate`     | `autoTable`, `doc.lastAutoTable`, círculo de status | `buildCoverEquipamentosRows`                |
| 9     | Conclusão                           | Montar texto de conclusão e renderizar card                                    | `formatStatusConclusion`                           | Muta `doc`                                          | `buildCoverConclusaoModel`                  |
| 10    | Ficha técnica                       | Montar blocos de dados de placa e renderizar tabelas                           | `formatDadosPlacaRows`, `autoTable`                | `autoTable`, pode chamar `doc.addPage`              | `buildCoverFichaTecnicaBlocks`              |
| 11    | Checklist/PMOC                      | Preservar chamada atual para `drawChecklist`                                   | `sections/checklist.js`                            | Muta `doc`, retorna cursor                          | `renderCoverChecklist`                      |
| 12    | Pendências                          | Montar ações recomendadas e renderizar cards                                   | `Utils.daysDiff`, `Utils.formatDate`, equipamentos | Muta `doc`, fallback silencioso por espaço          | `buildCoverPendenciasModel`                 |
| 13    | Retorno final                       | Não retorna cursor explícito                                                   | N/A                                                | Estado final fica no `doc`                          | Sem alteração                               |

Helpers locais criados:

| Helper                         | Arquivo                            | Responsabilidade                                      | Observação                                               |
| ------------------------------ | ---------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| `buildCoverPeriodText`         | `src/domain/pdf/sections/cover.js` | Monta texto visível de período a partir de `de`/`ate` | Preserva `Utils.formatDate` e fallbacks `início`/`atual` |
| `buildCoverContext`            | `src/domain/pdf/sections/cover.js` | Consolida argumentos do `drawCover` em contexto local | Não muda API pública                                     |
| `buildCoverTitleModel`         | `src/domain/pdf/sections/cover.js` | Monta OS, emissão, cliente, técnico e período         | Render segue em `drawTitleBlock`                         |
| `buildCoverInfoBlocksModel`    | `src/domain/pdf/sections/cover.js` | Monta linhas de técnico/cliente e altura dos blocos   | Preserva fallback de cliente ausente                     |
| `buildCoverResumoModel`        | `src/domain/pdf/sections/cover.js` | Monta totais, status geral e cor do resumo            | Render visual inalterado                                 |
| `buildCoverEquipamentosRows`   | `src/domain/pdf/sections/cover.js` | Monta linhas da tabela de equipamentos                | `autoTable` permanece no mesmo arquivo                   |
| `buildCoverConclusaoModel`     | `src/domain/pdf/sections/cover.js` | Monta conclusão textual por status                    | Usa `formatStatusConclusion` como antes                  |
| `buildCoverFichaTecnicaBlocks` | `src/domain/pdf/sections/cover.js` | Monta blocos fixos/extras de dados de placa           | `autoTable` e paginação permanecem no render             |
| `buildCoverPendenciasModel`    | `src/domain/pdf/sections/cover.js` | Monta ações recomendadas por status/proxima           | Render visual permanece em `drawPendencias`              |
| `renderCoverBackground`        | `src/domain/pdf/sections/cover.js` | Encapsula `fillPage` da capa                          | Side effect mantido local                                |
| `renderCoverChecklist`         | `src/domain/pdf/sections/cover.js` | Encapsula chamada atual de `drawChecklist`            | Argumentos preservados                                   |

Validação registrada:

- `npm run test -- src/__tests__/pdfCover.contract.test.js --reporter=dot`: passou, 1 arquivo / 4 testes.

Lacunas remanescentes:

- Helpers continuam no mesmo arquivo; extração para módulo separado deve ocorrer apenas se forem puros/baixo risco.
- Render visual ainda depende de `doc`, `autoTable`, primitives e cursor manual.
- Acoplamento `cover.js` -> `drawChecklist` permanece intencionalmente inalterado.

Próximo CP recomendado: **CP-D - mover helpers puros de cover**.

Justificativa: após o pre-split in-place, há helpers claramente puros ou de baixo risco (`buildCoverTitleModel`, `buildCoverResumoModel`, `buildCoverEquipamentosRows`, `buildCoverConclusaoModel`, `buildCoverFichaTecnicaBlocks`, `buildCoverPendenciasModel`) que podem ser avaliados para extração com contrato próprio, mantendo `drawCover` e render visual no arquivo atual.
