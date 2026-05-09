# Mudança 14 / CP-E - Mapeamento cover -> checklist

## 1. Base

- Branch: `main`
- HEAD: `3ccc14f588143910b0fa9a24f355c428fcbb3715`
- Data: 2026-05-09
- Arquivos analisados:
  - `src/domain/pdf/sections/cover.js`
  - `src/domain/pdf/sections/coverHelpers.js`
  - `src/domain/pdf/sections/checklist.js`
  - `src/domain/pdf/sections/checklistHelpers.js`
  - `src/domain/pdf.js`
  - `src/__tests__/pdfCover.contract.test.js`
  - `src/__tests__/pdfCover.helpers.test.js`
  - `src/__tests__/pdfChecklist.helpers.test.js`
  - `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js`
  - `src/__tests__/registroChecklistPmoc.contract.test.js`
- LOC dos arquivos principais:
  - `src/domain/pdf/sections/cover.js`: 554
  - `src/domain/pdf/sections/coverHelpers.js`: 199
  - `src/domain/pdf/sections/checklist.js`: 191
  - `src/domain/pdf/sections/checklistHelpers.js`: 38
  - `src/domain/pdf.js`: 208
  - `src/__tests__/pdfCover.contract.test.js`: 272
  - `src/__tests__/pdfCover.helpers.test.js`: 211
  - `src/__tests__/pdfChecklist.helpers.test.js`: 85
  - `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js`: 302
  - `src/__tests__/registroChecklistPmoc.contract.test.js`: 565

## 2. Objetivo

Mapear em modo read-only o acoplamento atual entre a capa do PDF e a seção de checklist/PMOC, especialmente a passagem de `filtered`, `equipamentos`, `startY`, retorno de cursor e efeitos de paginação, antes de qualquer alteração em `cover.js` ou `checklist.js`.

## 3. Ordem real do acoplamento

| Ordem | Bloco cover -> checklist                                                                  | Responsabilidade                                                                                 | Dependências                                                                             | Side effects                                                                       | Risco                                                                         |
| ----- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1     | `drawCover(...)` monta o contexto da capa                                                 | Receber `doc`, dimensões, profile, filtros, registros, equipamentos e `context`                  | `buildCoverContext`, `coverHelpers.js`                                                   | Nenhum side effect próprio nesta etapa                                             | Baixo; API posicional precisa permanecer estável                              |
| 2     | Render da capa antes do checklist                                                         | Renderizar fundo, masthead, título, info blocks, resumo, equipamentos, conclusão e ficha técnica | `fillPage`, primitives, `autoTable`, `doc.lastAutoTable`                                 | Muta `doc`, pode adicionar página na ficha técnica                                 | Médio; o `y` entregue ao checklist depende de todo o layout anterior          |
| 3     | `renderCoverChecklist(coverContext, y)`                                                   | Encapsular a chamada atual da capa para o checklist                                              | `doc`, `pageWidth`, `pageHeight`, `margin`, `filtered`, `equipamentos`                   | Nenhum além de delegar para `drawChecklist`                                        | Alto; é o ponto único do acoplamento entre sections                           |
| 4     | Chamada de `drawChecklist(doc, pageWidth, pageHeight, margin, y, filtered, equipamentos)` | Renderizar checklist/PMOC dentro do fluxo da capa                                                | `checklist.js`, `checklistHelpers.js`, `autoTable`, templates PMOC                       | Muta `doc`, usa `autoTable`, pode chamar `doc.addPage`                             | Alto; cursor e página corrente passam a ser responsabilidade compartilhada    |
| 5     | Registros filtrados enviados                                                              | Preservar exatamente os registros já filtrados pelo relatório                                    | `filtered` vindo de `drawCover`/`domain/pdf.js`                                          | Sem mutação esperada nos dados                                                     | Alto; alterar isso quebra `filters.registroId` e mídia/checklist por registro |
| 6     | `checklist.tipo_template/items`                                                           | `drawChecklist` lê `registro.checklist.tipo_template` e `registro.checklist.items`               | `getTemplateByKey`, `buildChecklistGroups`, `summarizeChecklistItems`                    | Itens com `status == null` ficam fora dos grupos                                   | Alto; é contrato de Checklist/PMOC preservado desde Mudança 12/13             |
| 7     | `startY` enviado ao checklist                                                             | Informar o cursor final da capa antes da seção Checklist                                         | `y` retornado por `drawFichaTecnica`                                                     | `drawChecklist` cria layout com `startY + 6`                                       | Alto; pequenos deslocamentos mudam ordem visual e espaço das pendências       |
| 8     | Retorno de `drawChecklist`                                                                | Devolver `layout.y` final para a capa                                                            | `createChecklistLayoutState`, `ensureChecklistPageSpace`, `doc.lastAutoTable`            | Retorna `startY` quando não há checklist; retorna cursor avançado quando renderiza | Alto; `drawPendencias` consome esse valor imediatamente                       |
| 9     | Impacto no bloco de pendências                                                            | Renderizar pendências depois do checklist usando o cursor retornado                              | `drawPendencias`, `buildCoverPendenciasModel`                                            | Pode não renderizar se `y > pageHeight - 50`                                       | Alto; quebra de cursor pode ocultar ou deslocar pendências silenciosamente    |
| 10    | Impacto em paginação                                                                      | Permitir que checklist adicione página quando necessário                                         | `ensureChecklistPageSpace`, `doc.addPage`, `layout.y = margin`                           | A página corrente do `doc` muda antes das pendências                               | Alto; pendências podem renderizar na nova página após checklist               |
| 11    | Fallback sem checklist                                                                    | Retornar `startY` quando nenhum registro tem `checklist.items`                                   | `getRegistrosWithChecklist(filtered)`                                                    | Não renderiza seção e não altera cursor                                            | Médio; fallback é silencioso e a capa continua com pendências no mesmo `y`    |
| 12    | Relação com contrato CP-B                                                                 | Teste da capa mocka `drawChecklist` e trava argumentos/payload                                   | `pdfCover.contract.test.js`                                                              | Sem render real do checklist nesse teste                                           | Médio; protege integração de argumentos, mas não cursor real                  |
| 13    | Relação com contrato Checklist/PMOC                                                       | Testes de checklist/PMOC validam itens, template e render mínimo                                 | `pdfGenerator.mediaChecklist.contract.test.js`, `registroChecklistPmoc.contract.test.js` | Cobrem o checklist fora do fluxo real da capa                                      | Médio; falta contrato específico para o cursor cover -> checklist             |
| 14    | Comportamento silencioso                                                                  | Falta de checklist ou falta de espaço não lança erro                                             | `drawChecklist`, `drawPendencias`                                                        | Render pode ser omitido por falta de espaço                                        | Médio/alto; regressão visual pode passar sem exceção                          |

## 4. Contrato de cursor/layout

| Contrato de layout                         | Origem                                                                         | Consumidor                                            | Teste existente                                                                      | Risco se alterar                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Valor inicial de `y` enviado ao checklist  | `drawCover` após `drawFichaTecnica`                                            | `drawChecklist` como `startY`                         | `pdfCover.contract.test.js` usa `expect.any(Number)`                                 | Alto; não há trava do valor exato ou da relação com ficha técnica   |
| Offset inicial do checklist                | `createChecklistLayoutState(startY)` retorna `{ y: startY + 6 }`               | `renderChecklistSectionHeader`                        | `pdfChecklist.helpers.test.js` cobre helper isolado                                  | Médio; offset alterado muda espaçamento visual dentro da capa       |
| Retorno sem checklist                      | `drawChecklist` retorna `startY` quando não há registros com `checklist.items` | `drawCover` passa o retorno para `drawPendencias`     | Fallback da capa cobre chamada com listas vazias, mas mocka checklist                | Médio; contrato real ainda não é validado integrado                 |
| Retorno com checklist renderizado          | `drawChecklist` retorna `layout.y` depois de headers, summary e tabelas        | `drawPendencias`                                      | `pdfGenerator.mediaChecklist.contract.test.js` valida `nextY > 40` em chamada direta | Alto; não valida impacto do retorno na capa                         |
| Pendências dependem do retorno             | `drawCover` chama `drawPendencias(..., y)` após `renderCoverChecklist`         | `drawPendencias` decide render ou fallback por espaço | Sem teste específico de cursor após checklist                                        | Alto; erro de cursor pode ocultar pendências sem quebrar teste      |
| Página nova durante checklist              | `ensureChecklistPageSpace` chama `doc.addPage()` e zera `layout.y = margin`    | `drawPendencias` continua na página corrente do `doc` | Sem teste específico cover -> checklist com quebra                                   | Alto; pendências podem migrar para página adicionada pelo checklist |
| `autoTable` no checklist                   | `renderChecklistGroupTable` usa `autoTable` e `doc.lastAutoTable?.finalY`      | `layout.y` retornado ao cover                         | Testes diretos de checklist verificam `autoTable`                                    | Médio; mock de capa não cobre `doc.lastAutoTable` real              |
| Dependência de `margin/pageHeight`         | `drawCover` repassa dimensões e margem para `drawChecklist`                    | `ensureChecklistPageSpace`                            | CP-B valida argumentos por mock                                                      | Alto; margem incorreta muda paginação do checklist e das pendências |
| Fallback por falta de espaço em pendências | `drawPendencias` retorna cedo se `y > pageHeight - 50`                         | Fluxo visual final da capa                            | Sem teste específico                                                                 | Médio/alto; falha silenciosa é comportamento aceito, mas sensível   |

## 5. Testes existentes e lacunas

| Teste                                                        | O que cobre                                                                                                                                       | O que não cobre                                                                                  | Importância                        | Observação                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------- |
| `src/__tests__/pdfCover.contract.test.js`                    | Contrato da capa, chamada de `drawChecklist`, argumentos, `filtered`, `equipamentos`, payload `checklist.tipo_template/items` e fallbacks básicos | Valor exato de `startY`, retorno real de `drawChecklist`, paginação real e impacto em pendências | Alta                               | Usa mock de `drawChecklist`, adequado para contrato de integração leve           |
| `src/__tests__/pdfCover.helpers.test.js`                     | Helpers puros de cover e ausência de imports proibidos                                                                                            | Render visual e acoplamento com checklist                                                        | Média                              | Protege CP-D, não cobre cursor                                                   |
| `src/__tests__/pdfChecklist.helpers.test.js`                 | Helpers puros de checklist, filtro de registros com checklist, offset inicial e agrupamento                                                       | Render real de `drawChecklist` dentro da capa                                                    | Média                              | Ajuda a entender cursor, mas não cobre integração                                |
| `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js` | Fluxo do gerador com mídia/checklist e chamada direta de `drawChecklist` com PMOC                                                                 | Relação `drawCover` -> `drawChecklist` -> `drawPendencias`                                       | Alta                               | Cobre contratos CP-H/CP-B relacionados, não substitui contrato de cursor da capa |
| `src/__tests__/registroChecklistPmoc.contract.test.js`       | Contrato PMOC em Registro, `tipo_template` e itens                                                                                                | Layout PDF da capa e cursor                                                                      | Alta para dados, baixa para layout | Garante origem dos dados, não renderização da capa                               |

Lacunas críticas:

- Não há teste que use `drawCover` com `drawChecklist` real e verifique o cursor retornado.
- Não há teste que trave que pendências são renderizadas depois do checklist usando o `y` retornado.
- Não há teste específico para `drawChecklist` adicionando página dentro do fluxo da capa.
- Não há teste que combine `doc.lastAutoTable` da ficha técnica com `doc.lastAutoTable` do checklist no mesmo fluxo.
- Não há teste visual/pixel-perfect; o risco é aceitável por enquanto, mas precisa ser compensado por contratos de cursor.

## 6. Riscos principais

- `cursor/y`: `drawCover` entrega cursor para `drawChecklist` e usa o retorno para pendências; qualquer alteração muda espaçamento e ordem visual.
- Paginação: `drawChecklist` pode chamar `doc.addPage`, e o restante da capa continua na página corrente do `doc`.
- `drawChecklist` adicionando página: pendências podem renderizar em página nova, ou deixar de renderizar por fallback de espaço.
- PMOC/checklist ausente: fallback silencioso retorna `startY`; a capa não sabe se a seção foi omitida.
- Pendências após checklist: são sensíveis ao retorno de cursor e podem sumir silenciosamente quando `y > pageHeight - 50`.
- `autoTable/doc.lastAutoTable`: ficha técnica e checklist usam `autoTable`; o cursor depende do `finalY` mais recente em cada bloco.
- Regressão visual silenciosa: a maioria dos contratos valida chamadas/dados, não posição visual final.

## 7. Opções de próximo CP

| Opção de próximo CP                                        | Benefício                                                  | Risco                                                          | Pré-requisitos                               | Recomendação          |
| ---------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------- | --------------------- |
| CP-F - criar contrato específico cover -> checklist/cursor | Trava o ponto de maior risco antes de mexer no acoplamento | Baixo/médio; exige mock de doc mais cuidadoso                  | Mapeamento CP-E e teste CP-B existentes      | Recomendado           |
| CP-F - desacoplar `renderCoverChecklist` com adapter local | Reduz acoplamento direto entre sections                    | Alto sem contrato de cursor real                               | Contrato cover -> checklist/cursor           | Adiar                 |
| CP-F - mover `renderCoverChecklist` para helper visual     | Baixa LOC em `cover.js`                                    | Benefício baixo; ainda move side effect e cursor compartilhado | Contrato de cursor e decisão de arquitetura  | Não recomendado agora |
| CP-F - stability checkpoint                                | Consolida estado sem risco técnico                         | Pode encerrar com risco de cursor sem teste                    | Contrato cursor ou decisão de aceitar lacuna | Prematuro             |
| CP-F - encerrar Mudança 14                                 | Evita novos cortes                                         | Mantém acoplamento sensível sem contrato específico            | Estabilidade e aceitação explícita da lacuna | Não recomendado       |

## 8. Recomendação final

Próximo CP recomendado: **CP-F - criar contrato cover -> checklist/cursor**.

Justificativa: há mais de 90% de confiança de que o risco principal restante não é a existência do import em si, mas o contrato implícito de `startY`, retorno de `drawChecklist`, paginação e uso do cursor por `drawPendencias`. Antes de desacoplar, mover ou simplificar `renderCoverChecklist`, o comportamento atual precisa estar travado por teste específico.
