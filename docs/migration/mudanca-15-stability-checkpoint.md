# Mudanca 15 / CP-R - Stability checkpoint Historico

## 1. Base

- Branch: `main`
- HEAD: `e389d78e7a88264831cde1bba47c67374d36266d`
- Data: `2026-05-09`
- Arquivos analisados:
  - `src/ui/views/historico.js`
  - `src/react/pages/HistoricoTimeline.jsx`
  - `src/react/pages/HistoricoFilters.jsx`
  - `src/react/components/CardActions.jsx`
  - `src/ui/components/historicoFiltersSheet.js`
  - `src/ui/viewModels/historicoViewModel.js`
  - `src/ui/viewModels/historicoContracts.js`
  - `src/features/historico/render/renderHelpers.js`
  - `src/features/historico/actions/cardMenuHelpers.js`
  - `src/features/historico/delete/deleteHelpers.js`
  - `src/features/historico/filters/filterHelpers.js`
  - contratos e documentos da Mudanca 15 em `src/__tests__`, `src/features/historico/__tests__` e `docs/migration`
- LOC principais:
  - `src/ui/views/historico.js`: 1621
  - `src/react/pages/HistoricoTimeline.jsx`: 453
  - `src/react/pages/HistoricoFilters.jsx`: 252
  - `src/react/components/CardActions.jsx`: 68
  - `src/ui/components/historicoFiltersSheet.js`: 251
  - `src/ui/viewModels/historicoViewModel.js`: 497
  - `src/ui/viewModels/historicoContracts.js`: 102
  - `src/features/historico/render/renderHelpers.js`: 72
  - `src/features/historico/actions/cardMenuHelpers.js`: 28
  - `src/features/historico/delete/deleteHelpers.js`: 44
  - `src/features/historico/filters/filterHelpers.js`: 45

## 2. Objetivo

Consolidar o estado final da Mudanca 15 / Historico, validar contratos e arquitetura, registrar riscos remanescentes e formalizar a decisao de encerramento da mudanca sem alterar codigo de producao ou testes.

## 3. Estado final dos blocos trabalhados

| Bloco/fluxo               | Estado final                                                  | Arquivo principal                                     | Teste existente                                                                                      | Risco atual | Observacao                                                                                        |
| ------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| Inventario Historico      | Atualizado de CP-A ate CP-R                                   | `docs/migration/mudanca-15-historico-inventario.md`   | N/A                                                                                                  | Baixo       | Fonte de rastreabilidade da mudanca                                                               |
| Contratos card actions    | Contrato CP-B preservado                                      | `src/__tests__/historicoCardActions.contract.test.js` | `historicoCardActions.contract.test.js`                                                              | Baixo       | Protege `edit-reg`, `delete-reg`, `export-pdf`, `whatsapp-export`, `data-id` e `data-registro-id` |
| Render/timeline           | Pre-split local e helpers puros extraidos                     | `src/ui/views/historico.js`                           | `historicoTimelineIsland.test.jsx`, `historicoTimelineLegacyRender.test.js`, `historicoView.test.js` | Medio       | Adapter ainda orquestra render e bridge React                                                     |
| renderHelpers             | Extraido para feature-scoped                                  | `src/features/historico/render/renderHelpers.js`      | `renderHelpers.test.js`                                                                              | Baixo       | Sem import do adapter                                                                             |
| Card menu/actions         | Pre-split local e helpers seguros extraidos                   | `src/features/historico/actions/cardMenuHelpers.js`   | `cardMenuHelpers.test.js`                                                                            | Medio       | Binders, eventos e efeitos ficaram no adapter                                                     |
| Historico -> Registro     | Mapeado e protegido por contrato                              | `src/ui/views/historico.js`                           | `historicoRegistroIntegration.contract.test.js`                                                      | Medio       | Integracao segue via adapter, rota e Registro                                                     |
| deleteReg                 | Pre-split local com helpers puros extraidos                   | `src/features/historico/delete/deleteHelpers.js`      | `deleteHelpers.test.js`, `historicoRegistroIntegration.contract.test.js`                             | Medio       | Storage, setState, render, header e Toast ficaram no adapter                                      |
| Historico -> PDF/WhatsApp | Mapeado e protegido por contrato                              | `src/ui/views/historico.js`                           | `historicoPdfWhatsappIntegration.contract.test.js`                                                   | Medio       | Fluxo segue via `reportExportHandlers` e filtros                                                  |
| Filtros Historico         | Mapeados, contratados, pre-split local e helper puro extraido | `src/ui/views/historico.js`                           | `historicoFilters.contract.test.js`, `filterHelpers.test.js`                                         | Medio       | DOM, cache, sessao e URL reais seguem no adapter                                                  |
| filterHelpers             | Extraido para feature-scoped                                  | `src/features/historico/filters/filterHelpers.js`     | `filterHelpers.test.js`                                                                              | Baixo       | Apenas normalizacao, merge e parsing por parametro                                                |
| HistoricoTimeline.jsx     | Preservado sem alteracao nesta mudanca final                  | `src/react/pages/HistoricoTimeline.jsx`               | `historicoTimelineIsland.test.jsx`                                                                   | Medio       | Sem teste pixel-perfect                                                                           |
| HistoricoFilters.jsx      | Preservado sem alteracao nesta mudanca final                  | `src/react/pages/HistoricoFilters.jsx`                | `historicoFiltersIsland.test.jsx`                                                                    | Medio       | Bridge e contratos publicos continuam sensiveis                                                   |
| historicoFiltersSheet.js  | Preservado sem alteracao nesta mudanca final                  | `src/ui/components/historicoFiltersSheet.js`          | `historicoFiltersSheet.test.js`, `historicoFiltersSheetIntegration.test.js`                          | Medio       | Sheet mobile ainda depende de callbacks do adapter                                                |
| historicoViewModel.js     | Preservado e coberto por testes existentes                    | `src/ui/viewModels/historicoViewModel.js`             | `historicoViewModel.test.js`                                                                         | Baixo       | Continua sendo a fronteira de dados da timeline                                                   |
| Adapter Historico         | Permanece como orquestrador publico                           | `src/ui/views/historico.js`                           | Contratos CP-B, CP-H, CP-L, CP-O e testes relacionados                                               | Medio/alto  | Ainda tem 1621 LOC e varios side effects                                                          |

## 4. Itens restantes com risco

| Item restante                 | Tipo                     | Responsabilidade                                   | Motivo para permanecer                           | Risco       | Recomendacao futura                                                |
| ----------------------------- | ------------------------ | -------------------------------------------------- | ------------------------------------------------ | ----------- | ------------------------------------------------------------------ |
| `historico.js` adapter        | Adapter/orquestracao     | Public APIs, DOM, bridges, state e side effects    | Escopo da Mudanca 15 evitou mover efeitos fortes | Medio/alto  | Tratar em mudanca futura com contrato dedicado por fluxo           |
| `renderHist`                  | API publica/render       | Orquestrar filtros, VM, timeline e ilhas           | API publica e acoplamento com DOM/React          | Medio       | Manter no adapter ate haver corte com contrato proprio             |
| `deleteReg`                   | API publica/side effects | Deletar registro, state, storage, render e Toast   | Usa efeitos fortes e contratos externos          | Medio       | So mover efeitos apos novo mapeamento de state/storage             |
| `setHistClienteFilter`        | API publica              | Aplicar filtro externo de cliente                  | Integra Clientes/rotas ao Historico              | Medio       | Criar contrato de navegacao Clientes -> Historico antes de alterar |
| `buildHistoricoRenderFilters` | Orquestracao local       | Consolidar filtros atuais para render              | Le DOM/cache/session/cliente externo             | Medio       | Separar apenas depois de novo pre-split de fontes de filtro        |
| Helpers DOM/cache/session/URL | Infra local              | Ler/escrever DOM, sessao, URL e cache              | Side effects e variaveis locais do adapter       | Medio       | Manter no adapter ou encapsular em boundary explicito              |
| React bridges                 | Bridge UI                | Montar filtros/timeline React sobre adapter legado | Ciclo de vida e roots React sensiveis            | Medio       | Validar em E2E antes de qualquer extracao                          |
| Filters sheet                 | UI mobile                | Aplicar/resetar filtros via callbacks              | Mistura sheet legado, DOM e sessionStorage       | Medio       | Mapear se houver mudanca mobile                                    |
| Handlers globais              | Controller               | Navegacao, relatorio, Registro e share             | Fora do escopo da Mudanca 15                     | Medio       | Tratar em mudancas especificas de handlers                         |
| Integracao Registro           | Fluxo externo            | Edit/delete e Registro lifecycle                   | Mantida via adapter/rotas                        | Medio       | Preservar contrato CP-H em proximos cortes                         |
| Integracao PDF/WhatsApp       | Fluxo externo            | Export/share por registro                          | Mantida via `reportExportHandlers`               | Medio       | Preservar contrato CP-L em proximos cortes                         |
| Filtros externos por cliente  | Estado cruzado           | `_clienteFilter` e clear externo                   | Fonte externa ao Historico                       | Medio       | Criar contrato de rota/origem externa antes de mover               |
| Layout/timeline               | UI                       | Visual, empty states e cards                       | Testes focam contratos, nao pixel-perfect        | Medio       | Cobrir com smoke visual se houver alteracao visual                 |
| Warnings/chunks               | Baseline/build           | Lint warnings e chunk warnings Vite                | Nao bloqueiam build atual                        | Baixo/medio | Tratar em Mudanca 16 de estabilidade/performance                   |

## 5. Validacao de arquitetura

| Verificacao                                      | Resultado | Evidencia                                                                                | Bloqueia encerramento? |
| ------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------- | ---------------------- |
| `renderHist` permanece no adapter                | OK        | `src/ui/views/historico.js` mantem exportacao publica                                    | Nao                    |
| `deleteReg` permanece no adapter                 | OK        | `src/ui/views/historico.js` mantem exportacao publica                                    | Nao                    |
| `setHistClienteFilter` permanece no adapter      | OK        | `src/ui/views/historico.js` mantem exportacao publica                                    | Nao                    |
| Helpers puros estao em `features/historico`      | OK        | `renderHelpers.js`, `cardMenuHelpers.js`, `deleteHelpers.js`, `filterHelpers.js` existem | Nao                    |
| Helpers com side effects permaneceram no adapter | OK        | DOM, storage, setState, render, header, Toast e sessionStorage continuam no adapter      | Nao                    |
| `features/historico` nao importa adapter         | OK        | Busca por import de `ui/views/historico` nao encontrou import de producao                | Nao                    |
| Contratos CP-B/CP-H/CP-L/CP-O passam             | OK        | Bateria principal Historico passou                                                       | Nao                    |
| Sem barrel `index.js` novo                       | OK        | Diff do CP-R e estrutura feature nao adicionam barrel                                    | Nao                    |
| Sem `test.skip` novo                             | OK        | CP-R nao altera testes                                                                   | Nao                    |
| Diff do CP-R e apenas documentacao               | OK        | Validado por `git diff --name-status` antes do commit                                    | Nao                    |
| Riscos remanescentes documentados                | OK        | Secoes 4 e 8 deste checkpoint                                                            | Nao                    |

## 6. Validacao de testes/build

| Validacao                   | Resultado           | Observacao                                                                                 |
| --------------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| Bateria principal Historico | Passou              | 8 arquivos / 36 testes                                                                     |
| Bateria relacionada         | Passou              | 12 arquivos / 91 testes                                                                    |
| Suite `src/__tests__`       | Passou              | Comando retornou exit 0; output grande com warnings conhecidos                             |
| `npm run format`            | Passou              | Prettier reportou arquivos unchanged antes da documentacao final                           |
| `npm run check`             | Passou              | Lint 0 erros / 30 warnings, format check, testes e build passaram                          |
| `npm run size`              | Falhou por ambiente | Script existe, mas `size-limit` nao foi reconhecido localmente                             |
| Playwright                  | Passou              | 15 passed / 9 skipped em `npx playwright test -c e2e/playwright.config.js --reporter=list` |

## 7. Warnings conhecidos

- Lint baseline: 30 warnings, sem erros. Inclui unused vars, restricted imports existentes e `renderSummaryCard` sem uso em `src/ui/views/historico.js`.
- Vite/build: avisos de imports dinamicos/estaticos no mesmo chunk e chunks acima de 500 kB.
- Testes JSDOM: `Not implemented: navigation (except hash changes)` em testes existentes.
- Supabase/Auth: `Multiple GoTrueClient instances detected` em testes existentes.
- React: warnings de `act(...)` em testes de acessibilidade/landing existentes.
- Logs de erro/telemetria: mensagens esperadas por testes de fluxos negativos.
- Nenhum warning novo foi atribuido ao CP-R, que alterou apenas documentacao.

## 8. Riscos remanescentes

- `src/ui/views/historico.js` ainda esta acima de 1000 LOC.
- `renderHist`, `deleteReg` e `setHistClienteFilter` permanecem no adapter.
- DOM/cache/sessionStorage/URL reais permanecem no adapter de Historico.
- Bridges React/timeline continuam sensiveis a ciclo de vida e duplicacao de roots.
- Sheet mobile ainda depende de callbacks e side effects do adapter.
- Integracoes Registro/PDF/WhatsApp seguem via handlers/adapters.
- Layout/timeline nao tem teste pixel-perfect.
- Filtros externos por cliente ainda dependem de `_clienteFilter`.
- Warnings de lint/build/chunk continuam como baseline tecnico.

## 9. Decisao final

**Encerrar Mudanca 15.**

Proxima mudanca tecnica recomendada: **Mudanca 16 - Stability geral/E2E/cache**.

Justificativa: a Mudanca 15 ja consolidou inventario, contratos, mapeamentos, pre-splits e extracoes seguras para Historico. O proximo ganho tecnico esta em validar estabilidade transversal, E2E, cache e warnings/chunks antes de novos cortes profundos.
