# Mudanca 15 / CP-N - Mapeamento filtros Historico

## 1. Base

- Branch: `main`
- HEAD: `a4dc1e3806340634163668ab115d9e4913fd1f23`
- Data: 2026-05-09
- Arquivos analisados: `src/ui/views/historico.js`, `src/react/pages/HistoricoFilters.jsx`, `src/react/pages/HistoricoTimeline.jsx`, `src/ui/components/historicoFiltersSheet.js`, `src/ui/components/historicoFiltersSheetModel.js`, `src/ui/viewModels/historicoViewModel.js`, `src/ui/viewModels/historicoContracts.js`, testes de filtros do Historico.
- LOC dos arquivos principais:
  - `src/ui/views/historico.js`: 1586
  - `src/react/pages/HistoricoFilters.jsx`: 252
  - `src/react/pages/HistoricoTimeline.jsx`: 453
  - `src/ui/components/historicoFiltersSheet.js`: 251
  - `src/ui/viewModels/historicoViewModel.js`: 497
  - `src/ui/viewModels/historicoContracts.js`: 102

## 2. Objetivo

Mapear o fluxo de filtros do Historico antes de qualquer pre-split, cobrindo DOM, cache local do adapter, `sessionStorage`, URL/query params, React filters island, sheet mobile, view model, timeline e interacao indireta com export/report filters.

## 3. Fluxo de filtros principais

| Etapa filtros Historico | Responsabilidade                                                                                | Arquivos envolvidos                                                                         | Dependencias                                                         | Side effects                                                       | Risco                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Hidratar URL inicial    | Ler `q`, `setor`, `equip`, `periodo`, `tipo` uma vez e aplicar em DOM/sessionStorage            | `historico.js`                                                                              | `URLSearchParams`, `window.location`, `sessionStorage`, IDs publicos | Muta inputs/selects e `sessionStorage`; flag `_urlFiltersHydrated` | Medio: deep link pode ficar stale ou competir com DOM                   |
| Cache local de filtros  | Preservar busca/setor/equip durante unmount/remount da ilha                                     | `historico.js`                                                                              | `_histFilterValues`, `getFilterValue`, DOM opcional                  | Atualiza variavel local no adapter                                 | Medio: cache local pode divergir do DOM se a ordem mudar                |
| Busca textual           | Ler `#hist-busca`, debounce e re-renderizar                                                     | `historico.js`, `HistoricoFilters.jsx`                                                      | DOM, `_histSearchRenderTimer`, `renderHist`                          | `setTimeout` 280ms, `renderHist`, URL update posterior             | Medio: debounce e re-render podem deixar timeline stale temporariamente |
| Filtro por setor        | Ler `#hist-setor`, limpar equipamento ao mudar setor, re-renderizar                             | `historico.js`, `HistoricoFilters.jsx`, `historicoFiltersSheet.js`                          | DOM, `syncSetorSelect`, state setores/equipamentos                   | Muta select, ressincroniza opcoes, `renderHist`                    | Alto: setor/equipamento sao acoplados                                   |
| Filtro por equipamento  | Ler `#hist-equip` e aplicar no view model                                                       | `historico.js`, `HistoricoFilters.jsx`, `historicoViewModel.js`                             | DOM, state equipamentos                                              | `renderHist`, URL update                                           | Medio: id errado filtra registros errados                               |
| Filtro por cliente      | Estado publico via `setHistClienteFilter` e chip `clear-cliente-filter`                         | `historico.js`, `historicoViewModel.js`                                                     | `_clienteFilter`, rotas/Clientes, equipamentos.clienteId             | Muta variavel local, `renderHist`                                  | Alto: pode ocultar registros sem sinal se stale                         |
| Periodo                 | Quick filter `hist-filter-period`; valor em `sessionStorage`                                    | `historico.js`, `HistoricoFilters.jsx`, `historicoViewModel.js`                             | `HIST_PERIOD_KEY`, `HISTORICO_PERIOD_OPTIONS`                        | Muta `sessionStorage`, `renderHist`, URL update                    | Medio: fallback `tudo` precisa ser preservado                           |
| Tipo                    | Quick filter/sheet `hist-filter-tipo`; valor em `sessionStorage`                                | `historico.js`, `HistoricoFilters.jsx`, `historicoFiltersSheet.js`, `historicoViewModel.js` | `HIST_TIPO_KEY`, `HISTORICO_TIPO_OPTIONS`                            | Muta `sessionStorage`, `renderHist`, URL update                    | Medio: matching textual pode divergir do chip ativo                     |
| React filters island    | Renderizar header, busca, selects, quick filters, chips e count                                 | `historico.js`, `HistoricoFilters.jsx`, entrypoint React                                    | `buildHistoricoFiltersReactViewModel`, bridge dinamica               | Monta/atualiza React root                                          | Medio: root/slots publicos sao contratos de testes e handlers           |
| Filters sheet           | Abrir sheet mobile, aplicar/resetar setor/equip/tipo                                            | `historico.js`, `historicoFiltersSheet.js`, `historicoFiltersSheetModel.js`                 | DOM dinamico, modal a11y, callbacks `onApply`/`onReset`              | Cria overlay, listeners, focus trap, muta selects/sessionStorage   | Alto: aplica filtros fora da ilha React                                 |
| View model              | Filtrar lista por setor, equipamento, cliente, periodo, tipo e busca                            | `historicoViewModel.js`, `renderHelpers.js`                                                 | Arrays de state, filtros normalizados, lookup por id                 | Sem side effect direto                                             | Alto: fonte central do resultado da timeline                            |
| Timeline                | Receber lista filtrada, cards, empty state e flags                                              | `historico.js`, `HistoricoTimeline.jsx`, `renderHelpers.js`                                 | `historicoVm.list`, `activeChips`, `hasFilters`                      | Render React, skeleton, scroll restore                             | Medio: filtros e timeline podem sair de sincronia                       |
| Reset/clear             | Limpar chips individuais e `hist-clear-all`                                                     | `historico.js`, `HistoricoFilters.jsx`, `historicoContracts.js`                             | `data-hist-action`, DOM, `sessionStorage`                            | Muta DOM/sessionStorage/\_clienteFilter e re-renderiza             | Alto: clear parcial errado deixa filtro invisivel ativo                 |
| Export/report           | Nao ha leitura direta de filtros do Historico pelo report flow; CP-L cobre `registroId` do card | `CardActions.jsx`, `reportExportHandlers.js`                                                | `data-registro-id`, filtros globais de Relatorio                     | Fora do adapter Historico                                          | Baixo neste CP; risco indireto se filtros alterarem card errado         |

## 4. Contratos publicos de filtros

| Contrato filtro Historico                                            | Origem                                         | Consumidor                                              | Teste existente                                                                    | Risco se alterar                          |
| -------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| `#hist-busca`                                                        | `HISTORICO_PUBLIC_IDS`, `HistoricoFilters.jsx` | `historico.js`, testes, usuarios                        | `historicoFiltersLegacyRender.test.js`, `historicoFiltersIsland.test.jsx`          | Busca deixa de filtrar ou debounce quebra |
| `#hist-equip`                                                        | `HISTORICO_PUBLIC_IDS`, React filters          | Adapter, sheet, view model                              | `historicoFiltersLegacyRender.test.js`, `historicoFiltersSheetIntegration.test.js` | Timeline mira equipamento errado          |
| `#hist-setor`                                                        | `HISTORICO_PUBLIC_IDS`, React filters          | Adapter, sheet, view model                              | `historicoFiltersLegacyRender.test.js`, `historicoFiltersSheet.test.js`            | Setor/equipamento divergem                |
| `#hist-filters-trigger` / `#hist-filters-count`                      | React filters                                  | `attachFilterHandlers`, UI mobile                       | `historicoFiltersLegacyRender.test.js`, `historicoFiltersIsland.test.jsx`          | Sheet nao abre ou badge fica errado       |
| `#hist-quickfilters-slot`                                            | `HISTORICO_PUBLIC_IDS`                         | `attachFilterHandlers` busca roots externos ao timeline | `historicoFiltersLegacyRender.test.js`                                             | Quick filters sem listener                |
| `#hist-active-chips-slot`                                            | `HISTORICO_PUBLIC_IDS`                         | Chips/clear handlers                                    | `historicoFiltersLegacyRender.test.js`, `historicoFiltersIsland.test.jsx`          | Clear actions somem                       |
| `data-hist-action="hist-filter-period"`                              | `HISTORICO_ACTIONS`                            | Adapter                                                 | `historicoFiltersLegacyRender.test.js`, `historicoFiltersIsland.test.jsx`          | Periodo nao aplica                        |
| `data-hist-action="hist-filter-tipo"`                                | `HISTORICO_ACTIONS`                            | Adapter                                                 | `historicoFiltersLegacyRender.test.js`, `historicoFiltersSheetIntegration.test.js` | Tipo nao aplica                           |
| `data-hist-action="hist-clear-*"`                                    | `HISTORICO_ACTIONS`                            | Adapter                                                 | `historicoFiltersLegacyRender.test.js`, `historicoViewModel.test.js`               | Filtro invisivel permanece ativo          |
| `data-hist-action="clear-cliente-filter"`                            | `HISTORICO_ACTIONS`                            | Adapter e fluxo Clientes -> Historico                   | `historicoFiltersLegacyRender.test.js`, `historicoViewModel.test.js`               | Cliente fica preso no Historico           |
| `setHistClienteFilter`                                               | `historico.js` export publico                  | Rotas/Clientes                                          | `historicoFiltersLegacyRender.test.js`, `historicoViewModel.test.js`               | Integracao Clientes -> Historico quebra   |
| `HISTORICO_PERIOD_OPTIONS`                                           | `historicoContracts.js`                        | React filters, VM, testes                               | `historicoViewModel.test.js`, `historicoFiltersIsland.test.jsx`                    | Periodo e chips divergem                  |
| `HISTORICO_TIPO_OPTIONS`                                             | `historicoContracts.js`                        | React filters, sheet, VM                                | `historicoViewModel.test.js`, `historicoFiltersSheetModel.test.js`                 | Tipo visual e filtro real divergem        |
| Classes `hist-quickfilter`, `hist-active-chip`, `hist-sticky-header` | React filters/contracts                        | CSS/testes/handlers                                     | `historicoFiltersLegacyRender.test.js`, `historicoFiltersIsland.test.jsx`          | Regressao visual ou selectors quebrados   |

## 5. Dependencias tecnicas

| Dependencia                                   | Usada onde                       | Funcao                                              | Acoplamento               | Risco | Estrategia sugerida                                         |
| --------------------------------------------- | -------------------------------- | --------------------------------------------------- | ------------------------- | ----- | ----------------------------------------------------------- |
| DOM / `document.getElementById`               | `historico.js`, sheet            | Ler e escrever filtros publicos                     | Alto                      | Alto  | Criar contrato antes de pre-split DOM/cache                 |
| `Utils.getEl` / `Utils.getVal`                | `attachFilterHandlers`, clears   | Acesso aos IDs legados                              | Medio                     | Medio | Isolar wrappers sem trocar IDs                              |
| `sessionStorage`                              | Periodo, tipo, summary collapsed | Persistencia por sessao                             | Medio                     | Medio | Testar fallback indisponivel antes de mover                 |
| URL / `URLSearchParams`                       | Hydrate/write filtros            | Deep link e replaceState                            | Medio                     | Medio | Mapear com contrato especifico de URL                       |
| `_histFilterValues`                           | `historico.js`                   | Cache durante unmount da ilha                       | Medio                     | Alto  | Pre-split cuidadoso; nao mover junto com DOM inicialmente   |
| `_clienteFilter`                              | `historico.js`                   | Filtro de cliente vindo de rota externa             | Alto                      | Alto  | Contrato dedicado `setHistClienteFilter` + clear            |
| State registros/equipamentos/clientes/setores | `renderHist`, VM, sheet          | Base dos filtros e opcoes                           | Medio                     | Alto  | Manter VM pura; adapter so orquestra                        |
| `HistoricoFilters.jsx`                        | React island                     | UI de filtros/header/chips                          | Medio                     | Medio | Preservar props/viewModel e ids                             |
| `historicoFiltersSheet.js`                    | Sheet mobile                     | Filtros avancados                                   | Alto                      | Alto  | Pre-split separado depois de contrato                       |
| `historicoViewModel.js`                       | Dominio UI puro                  | Aplica filtros e monta chips/cards                  | Baixo/medio               | Alto  | Preferir testes puros antes de mexer                        |
| `renderHelpers.js`                            | Feature render                   | Passa filtros para VM/timeline context              | Baixo                     | Medio | Ja extraido; manter sem DOM/storage                         |
| `renderHist`                                  | Adapter                          | Orquestra URL, state, filtros, VM, React e timeline | Alto                      | Alto  | Proximo corte deve ser contrato, nao mover direto           |
| Timeline                                      | `HistoricoTimeline.jsx`          | Exibe lista filtrada/cards                          | Medio                     | Medio | Verificar stale/empty state nos testes                      |
| Report/export                                 | `reportExportHandlers`           | Export por card via `data-registro-id`              | Baixo no filtro Historico | Medio | CP-L cobre registro; futuro teste pode combinar filtro+card |

## 6. Testes existentes e lacunas

| Teste                                      | O que cobre                                                                                 | O que nao cobre                                | Importancia | Observacao                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------- | ----------------------------------------- |
| `historicoFiltersLegacyRender.test.js`     | Render legado, busca, periodo, tipo, setor/equip, sheet, cliente, unmount/remount, escaping | URL/replaceState e sessionStorage indisponivel | Alta        | Principal contrato do adapter             |
| `historicoFiltersIsland.test.jsx`          | React island, ids/classes, chips, badge, escaping, isolamento de fluxos externos            | Eventos reais do adapter depois do mount       | Alta        | Protege UI React de filtros               |
| `historicoFiltersSheet.test.js`            | DOM publico do sheet, apply/reset/close, escape, independencia React                        | Integracao completa com `renderHist`           | Media/alta  | Testa componente legado isolado           |
| `historicoFiltersSheetIntegration.test.js` | Trigger React -> sheet -> apply/reset -> re-render                                          | URL/params e storage fallback                  | Alta        | Cobre acoplamento mais arriscado do sheet |
| `historicoFiltersSheetModel.test.js`       | Modelo puro do sheet, contratos e isolamento                                                | DOM real/focus trap                            | Media       | Boa base para futura extracao             |
| `historicoViewModel.test.js`               | Filtros principais, chips, cliente, contratos publicos, pureza                              | DOM/cache/sessionStorage/URL                   | Alta        | Protege regra de filtragem                |
| `historicoView.test.js`                    | Helpers e safety runtime de `renderHist`                                                    | Fluxo completo de filtros/URL                  | Media       | Complementar                              |
| `renderHelpers.test.js`                    | Helpers extraidos, passagem de filtros para VM/context                                      | DOM/cache/sessionStorage                       | Media       | Garante feature helper sem side effects   |

Lacunas criticas:

- Nao ha contrato dedicado para `hydrateFiltersFromUrl` e `writeFiltersToUrl`.
- Fallback de `sessionStorage` indisponivel existe no codigo, mas nao aparece como contrato focado de filtros.
- `setHistClienteFilter` e `clear-cliente-filter` sao cobertos, mas ainda nao ha teste especifico para navegacao real Clientes -> Historico.
- Nao ha contrato unico consolidando DOM/cache/sessionStorage/URL/sheet/VM/timeline no mesmo arquivo.
- Interacao filtro ativo do Historico + export/report por card fica protegida pelo card id (CP-L), mas nao por um teste de filtros do Historico especificamente.

## 7. Riscos principais

- Filtro errado: `buildHistoricoViewModel` e DOM podem divergir se ids/nomes mudarem.
- Cache/sessionStorage: `_histFilterValues` e `sessionStorage` podem manter filtros invisiveis.
- `setHistClienteFilter`: filtro externo pode ficar preso se clear/navegacao falhar.
- Reset/clear: clear parcial pode limpar chip visual sem limpar fonte real.
- URL/params: hydrate roda uma vez; ordem errada pode ignorar deep link ou sobrescrever estado do usuario.
- Estado vazio: filtros stale podem mostrar empty state indevido.
- Timeline stale: debounce de busca e renders async das ilhas podem exibir lista anterior por curto periodo.
- Filtros interferindo com export/report: risco indireto se o filtro muda o card renderizado; CP-L protege `registroId`.
- Import circular: mover helpers que importem adapter/React/DOM pode criar ciclos.
- Regressao silenciosa: muitos contratos sao atributos DOM e listeners delegados.

## 8. Opcoes de proximo CP

| Opcao de proximo CP                           | Beneficio                                              | Risco | Pre-requisitos                         | Recomendacao          |
| --------------------------------------------- | ------------------------------------------------------ | ----- | -------------------------------------- | --------------------- |
| CP-O - contrato consolidado filtros Historico | Trava URL/sessionStorage/cache/sheet/VM antes de mexer | Baixo | Mapa CP-N e testes existentes          | Recomendada           |
| CP-O - pre-split filtros DOM/cache            | Reduz tamanho de `historico.js`                        | Alto  | Contrato consolidado ausente           | Nao recomendado agora |
| CP-O - mover helpers puros de filtros         | Pode melhorar testabilidade se helper puro existir     | Medio | Primeiro separar DOM/cache localmente  | Aguardar              |
| CP-O - stability checkpoint                   | Encerra cedo a mudanca                                 | Medio | Filtros ainda sem contrato consolidado | Prematuro             |
| CP-O - encerrar Mudanca 15                    | Reduz escopo                                           | Alto  | Riscos de filtros ainda nao travados   | Nao recomendado       |

## 9. Recomendacao final

Proximo CP recomendado: **CP-O - contrato consolidado filtros Historico**.

Justificativa: ha mais de 90% de confianca de que o proximo passo deve ser contrato adicional, nao pre-split. O mapa mostra que filtros combinam DOM, cache local, `sessionStorage`, URL, React island, sheet mobile e view model. Mexer nesse fluxo antes de um contrato consolidado aumentaria o risco de filtro invisivel, timeline stale ou clear incompleto.

## 10. Complemento CP-O

- CP-O aplicado apos este mapa.
- Teste criado: `src/__tests__/historicoFilters.contract.test.js`.
- Lacunas reduzidas: contrato consolidado para DOM roots, `data-hist-action`, URL params, `sessionStorage`, cache `_histFilterValues`, `setHistClienteFilter`, sheet mobile, view model/timeline, empty state e preservacao de `data-registro-id`.
- Nenhum codigo de producao foi alterado.
- Proximo corte ficou mais seguro: **CP-P - pre-split filtros DOM/cache**.
