# Estado atual da migracao React + Tailwind

## 1. Branch e commit analisados

- Data da analise: 2026-04-30.
- Branch: `main`.
- Commit analisado: `1431de0897e5013d5e9dfef92849d351e8dce0c7` (`1431de0`).
- HEAD: `1431de0 (HEAD -> main, origin/main, origin/HEAD) Resolve clientes merge conflicts`.
- `git status --short`: vazio no inicio da analise.

Ultimos commits relevantes vistos em `git log --oneline --decorate -10`:

- `1431de0 Resolve clientes merge conflicts`
- `88d6ef0 Resolve clientes PMOC merge conflicts`
- `f52e14e update: update the commit message`
- `11952c9 Migrate orcamentos to a controlled React island`
- `aa5925e fix(equipamentos): remove no-undef de validateSetorNome (#202)`
- `88cdd49 refactor: extrai modulos coesos da view de equipamentos (#199)`
- `70b43b3 Refactor /clientes into modular renderers and data model; add unit tests (#193)`

Conflitos residuais:

- O comando amplo `git grep '<<<<<<<\|=======\|>>>>>>>'` retornou varias linhas com `=======`, mas os matches sao separadores decorativos em comentarios, SQL, CSS, scripts e `LICENSE`.
- A checagem mais precisa `git grep -n -E '^(<<<<<<<|=======|>>>>>>>)($| )'` retornou vazio. Nao ha marcador real de conflito no checkout atual.

## 2. Resumo executivo

O checkout atual ja tem React e Tailwind instalados e configurados, mas a migracao ainda e por ilhas controladas. As telas efetivamente montadas por React hoje sao `alertas` e `orcamentos`. `clientes` esta preparada para React por contrato, view model e renderers modulares, mas ainda renderiza HTML legado via `innerHTML`. As demais telas analisadas nao tem ponte React ativa.

Tailwind esta configurado de forma conservadora: prefixo `tw-`, `preflight` desativado e conteudo limitado a `index.html` e `src/react/**/*`. O CSS legado continua sendo a base visual carregada diretamente por `index.html`; as ilhas React ainda dependem de classes legadas como `btn`, `alert-card`, `orc-*` e `cli-*`.

O maior risco tecnico nao esta na infraestrutura React, e sim no legado ao redor: views grandes acima de 1000 linhas, CSS concentrado em `components.css`, ids globais, handlers delegados, imports dinamicos misturados com imports estaticos e dependencias transversais entre views.

## 3. Estado da infraestrutura React/Tailwind

Arquivos de infraestrutura encontrados:

- `package.json`: possui `react`, `react-dom`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest` e scripts `format`, `check`, `test`, `build`.
- `vite.config.js`: usa `react()` no array de plugins; tambem define manual chunks para vendors e configuracao Vitest com `jsdom`.
- `tailwind.config.cjs`: `content` restrito a `./index.html` e `./src/react/**/*.{js,jsx,ts,tsx}`, `prefix: 'tw-'`, `corePlugins.preflight: false`.
- `postcss.config.cjs`: carrega `tailwindcss` e `autoprefixer`.
- `eslint.config.js`: JSX habilitado para `*.jsx`; regras de arquitetura ainda como `warn`, nao `error`.
- `src/react/README.md`: documenta roots explicitos, `createRoot`, nao montar em `#app`, usar `tw-` e nao depender de preflight.
- `src/react/styles/tailwind.css`: inclui apenas `@tailwind components;` e `@tailwind utilities;`, sem `@tailwind base`.

Estrutura React atual:

- `src/react/entrypoints/alertasIsland.jsx`
- `src/react/entrypoints/orcamentosIsland.jsx`
- `src/react/entrypoints/integrationProbe.jsx`
- `src/react/pages/AlertasPage.jsx`
- `src/react/pages/OrcamentosPage.jsx`
- `src/react/components/IntegrationProbe.jsx`
- `src/react/shared/.gitkeep`

Uso real de `createRoot`:

- `mountAlertasReact()` monta em `#view-alertas`.
- `mountOrcamentosReact()` monta em `#view-orcamentos`.
- `mountReactIntegrationProbe()` monta em `#react-integration-root` se esse root existir.

Uso real de Tailwind:

- `src/react/components/IntegrationProbe.jsx`: `tw-sr-only`.
- `src/react/pages/AlertasPage.jsx`: `tw-w-full`.
- `src/react/pages/OrcamentosPage.jsx`: `tw-w-full`.
- Nao ha classes Tailwind sem prefixo nos arquivos React analisados.

CSS legado:

- `index.html` continua carregando `base.css`, `components.css`, `layout.css`, `desktop-fonts.css`, `theme-premium.css`, `ux-polish.css`, `landing.css`, `tokens.css` e `redesign.css`.
- `components.css` tem cerca de 21130 linhas e concentra estilos de varias telas.
- Risco de colisao global foi reduzido por `tw-` e `preflight: false`, mas as ilhas React ainda dependem do CSS legado para a maior parte do visual.

## 4. Telas ja migradas para React

- `alertas`: ilha React controlada montada por `src/ui/views/alertas.js` em `#view-alertas`.
- `orcamentos`: ilha React controlada montada por `src/ui/views/orcamentos.js` em `#view-orcamentos`.

Observacao: `integrationProbe` existe como infraestrutura de smoke/probe, mas nao e tela de produto.

## 5. Telas preparadas mas ainda legadas

- `clientes`: preparada por `buildClientesViewModel`, `clientesContracts.js`, renderers modulares em `src/ui/views/clientes/*` e documento `docs/migration/clientes-react-prep.md`. Ainda nao ha `src/react/pages/ClientesPage.jsx`, entrypoint, bridge nem montagem React.

## 6. Telas ainda legadas ou com risco alto

- `dashboard` (`inicio`): 100% legado, renderizado por `renderDashboard()`.
- `equipamentos`: sem React, parcialmente modularizada, mas ainda com top-level muito grande e alto acoplamento.
- `historico`: 100% legado, muitos handlers e filtros no DOM.
- `registro`: 100% legado, alto risco por formulario, fotos, assinatura, PDF/WhatsApp e route guard.
- `relatorio`: 100% legado, alto risco por PDF, PMOC, assinatura e filtros.

## 7. Mapa por tela

Categorias:

- A: Migrada para React como ilha controlada.
- B: Preparada para React, mas ainda renderizada pelo legado.
- C: Parcialmente preparada, mas com bloqueios.
- D: 100% legada.
- E: Nao migrar agora por risco alto.

| Tela         | Status | Arquivos principais                                                                                                                                                                | View model?  | Bridge React? | Testes?                                                    | Risco                                                                             | Proximo PR recomendado                                            |
| ------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Alertas      | A      | `src/ui/views/alertas.js`, `src/ui/viewModels/alertasViewModel.js`, `src/react/entrypoints/alertasIsland.jsx`, `src/react/pages/AlertasPage.jsx`                                   | Sim          | Sim           | Sim: island, view model, security, empty state             | Medio: depende de ids e classes legadas                                           | Apenas hardening se houver bug; nao repetir migracao              |
| Orcamentos   | A      | `src/ui/views/orcamentos.js`, `src/ui/viewModels/orcamentosViewModel.js`, `src/react/entrypoints/orcamentosIsland.jsx`, `src/react/pages/OrcamentosPage.jsx`                       | Sim          | Sim           | Sim: island, view model, security                          | Medio/alto: CRUD, PDF, assinatura e debounce com `setTimeout` no adapter          | Manter estavel; corrigir debounce em PR proprio se virar problema |
| Clientes     | B      | `src/ui/views/clientes.js`, `src/ui/views/clientes/*`, `src/ui/viewModels/clientesViewModel.js`, `src/ui/viewModels/clientesContracts.js`, `docs/migration/clientes-react-prep.md` | Sim          | Nao           | Sim: view model, renderers, rota/paywall, PMOC, security   | Medio: handlers, menu kebab, PMOC, modal, ids publicos                            | Migrar `clientes` para ilha React preservando contratos           |
| Equipamentos | C      | `src/ui/views/equipamentos.js`, `src/ui/views/equipamentos/*`                                                                                                                      | Nao dedicado | Nao           | Sim, mas focados em hero, fotos, setores e regras          | Alto: 2493 linhas, CRUD, fotos, setores, plano, storage e imports dinamicos       | Preparar view model/list model antes de qualquer React            |
| Dashboard    | D      | `src/ui/views/dashboard.js`, `src/ui/shell/templates/views.js`                                                                                                                     | Nao          | Nao           | Sim: regras e premium                                      | Alto: 1294 linhas, charts, onboarding, alertas, header global                     | Preparar view model read-only; nao migrar charts no mesmo PR      |
| Historico    | E      | `src/ui/views/historico.js`                                                                                                                                                        | Nao          | Nao           | Sim: helpers de historico                                  | Alto: 1582 linhas, filtros, menus, fotos, assinatura, delete                      | Nao migrar agora; primeiro extrair modelo puro de lista/filtros   |
| Registro     | E      | `src/ui/views/registro.js`                                                                                                                                                         | Nao          | Nao           | Parcial: contexto, status, toasts, validacoes relacionadas | Muito alto: 1371 linhas, formulario, fotos, assinatura, PDF/WhatsApp, route guard | Nao migrar agora; separar regra de formulario e side effects      |
| Relatorio    | E      | `src/ui/views/relatorio.js`                                                                                                                                                        | Nao          | Nao           | Sim: helpers e security                                    | Muito alto: 1030 linhas, PDF, PMOC, assinatura, filtros                           | Nao migrar agora; extrair view model de relatorio antes           |

## 8. Detalhe por tela

### Alertas

- Container principal: `#view-alertas`.
- Bridge: `loadAlertasBridge()` faz dynamic import de `../../react/entrypoints/alertasIsland.jsx`.
- View model: `buildAlertasViewModel()` e puro o bastante para testes; recebe equipamentos, alertas de manutencao, alertas de cliente e contagem de preventivas.
- Contratos preservados: `#alertas-contextual`, `#lista-alertas`, `data-action`, `data-id`, `data-cliente-nome`, classes `alert-card*`, `alertas-context-banner*` e `engaging-empty-state*`.
- Handlers/side effects: le `getState()`, `Alerts.getAll()`, `getAllClienteAlerts()`, usa `withSkeleton()` e monta React de forma assincrona com controle por `renderGeneration`.
- Riscos: DOM shell ainda e criado com `innerHTML`, embora sem conteudo dinamico; React depende do CSS legado.

### Orcamentos

- Container principal: `#view-orcamentos`.
- Bridge: `loadOrcamentosBridge()` faz dynamic import de `../../react/entrypoints/orcamentosIsland.jsx`.
- View model: `buildOrcamentosViewModel()` concentra filtros, KPIs, cards, status e acoes.
- Contratos preservados: `#orc-busca`, `data-action` de `ORCAMENTO_ACTIONS`, `data-id`, `data-mode`, classes `orc-*` e `btn*`.
- Handlers/side effects: `loadOrcamentos()`, `deleteOrcamento()`, `upsertOrcamento()`, `markExpiredLocally()`, `CustomConfirm`, `Toast`, re-render via filtros.
- Riscos: adapter usa `setTimeout` para debounce de busca; tela cruza CRUD, PDF, WhatsApp e assinatura por handlers externos. Nao misturar esse fluxo com refactor visual.

### Clientes

- Container principal: `#view-clientes`; root atual: `#clientes-root`.
- Bridge: nao existe.
- View model: `buildClientesViewModel()` com filtros normalizados, paginacao, cidades, PMOC summary injetavel e index de clientes.
- Contratos: `CLIENTES_PUBLIC_IDS`, `CLIENTES_ACTIONS`, `CLIENTES_DEFAULT_FILTERS`, `CLIENTES_STATUS_OPTIONS`, `CLIENTES_SORT_OPTIONS`, `CLIENTES_PAGE_SIZE_OPTIONS`.
- Handlers/side effects: `loadClientes()`, `ClienteModal`, `ClienteAlertModal`, `ClientePmocPanel`, `CustomConfirm`, `Toast`, `goTo()`, handlers delegados de input/change/click/keydown.
- Estado seguro: renderers foram extraidos em `src/ui/views/clientes/*`; ha testes de view model, renderers, rota/paywall, PMOC e XSS.
- Riscos: ainda usa `innerHTML`; menu kebab manipula DOM; foco da busca e restaurado manualmente; `renderSummary()` depende de `window.matchMedia`; `routes.js` ainda contem seletores antigos `#view-clientes .view-content` e `#clientes-busca`, enquanto a tela atual usa `#clientes-root` e `#cli-search-input`.

### Equipamentos

- Container principal: `#view-equipamentos`; lista em `#lista-equip`.
- Bridge: nao existe.
- View model: nao ha view model dedicado; existem modulos menores para hero, cards, setores, fotos, contexto e placa.
- Handlers/side effects: storage, modal, plano, fotos, setores, nameplate capture, CRUD, upload, dashboard header, navegação e imports dinamicos.
- Riscos: `src/ui/views/equipamentos.js` tem 2493 linhas; importa `updateHeader`/`getHealthClass` de `dashboard.js`; mistura renderizacao, regra de negocio, DOM e infraestrutura.
- Recomendacao: preparar uma camada de modelo de lista/hero antes de qualquer componente React.

### Dashboard

- Container principal: `#view-inicio`; root visual `#dash`.
- Bridge: nao existe.
- View model: nao ha view model dedicado.
- Handlers/side effects: KPIs por DOM id, alertas, onboarding, plano, charts via import dinamico, header global.
- Riscos: 1294 linhas; depende de muitos ids globais; atualiza varios blocos por `innerHTML`.
- Recomendacao: separar calculos read-only e contratos de ids antes de pensar em ilha React.

### Historico

- Container principal: `#view-historico`; lista em `#timeline`.
- Bridge: nao existe.
- View model: nao ha view model dedicado, mas ha helpers testados como `getHistInsights`, `getRecurringEquips`, `getProximaStatus`, `getTodaySummary`, `getAttentionItems`.
- Handlers/side effects: filtros, menu de card, fotos, assinatura, delete, navegacao para relatorio/equipamento e filtros por cliente.
- Riscos: 1582 linhas; muitos listeners reanexados apos render; mistura filtros, HTML e side effects.
- Recomendacao: nao migrar agora; extrair primeiro modelo de lista/filtros.

### Registro

- Container principal: `#view-registro`.
- Bridge: nao existe.
- View model: nao ha view model dedicado.
- Handlers/side effects: formulario completo, checklist, validacoes, fotos, assinatura, PDF/WhatsApp, route guard, salvamento e edicao.
- Riscos: 1371 linhas; fluxo critico e com muitos ids publicos; qualquer migracao pode alterar comportamento de campo.
- Recomendacao: nao migrar agora; primeiro separar regra de formulario, progresso e checklist.

### Relatorio

- Container principal: `#view-relatorio`; corpo em ids internos como `relatorio-corpo`.
- Bridge: nao existe.
- View model: nao ha view model dedicado, mas ha helpers testados de narrativa, corretivas e proximas acoes.
- Handlers/side effects: filtros, modo de visualizacao, assinatura, PMOC, quota de PDF e render de blocos por `innerHTML`.
- Riscos: 1030 linhas; fluxo ligado a PDF e assinatura.
- Recomendacao: nao migrar agora; preparar view model e contratos primeiro.

## 9. View models, contratos e ids publicos

View models atuais:

- `src/ui/viewModels/alertasViewModel.js`: view model para ilha React de alertas.
- `src/ui/viewModels/orcamentosViewModel.js`: view model e constantes `ORCAMENTO_ACTIONS`, `ORCAMENTO_STATUS_META`, `ORCAMENTO_STATUS_FILTERS`.
- `src/ui/viewModels/clientesViewModel.js`: view model de clientes preparado para futura ilha.
- `src/ui/viewModels/clientesContracts.js`: ids, acoes e opcoes publicas de clientes.

Contratos publicos importantes:

- Alertas: `#view-alertas`, `#alertas-contextual`, `#lista-alertas`, `data-action`, `data-id`, `data-cliente-nome`.
- Orcamentos: `#view-orcamentos`, `#orc-busca`, `data-action`, `data-id`, `data-mode`, `ORCAMENTO_ACTIONS`.
- Clientes: `#view-clientes`, `#clientes-root`, `#cli-search-input`, `#cli-status-filter`, `#cli-city-filter`, `#cli-sort`, `#cli-page-size`, `data-cli-action`, `data-id`, `CLIENTES_ACTIONS`.
- Equipamentos, dashboard, historico, registro e relatorio ainda dependem amplamente de ids globais definidos em `src/ui/shell/templates/views.js` e selecionados diretamente nas views.

## 10. Testes relacionados e lacunas

Testes React island existentes:

- `src/__tests__/alertasReactIsland.test.jsx`
- `src/__tests__/orcamentosReactIsland.test.jsx`
- `src/__tests__/reactIntegrationProbe.test.js`

Testes de view model existentes:

- `src/__tests__/alertasViewModel.test.js`
- `src/__tests__/orcamentosViewModel.test.js`
- `src/__tests__/clientesViewModel.test.js`

Testes de security/XSS existentes:

- `src/__tests__/alertasView.security.test.js`
- `src/__tests__/orcamentosView.security.test.js`
- `src/__tests__/clientesView.security.test.js`
- `src/__tests__/clientesSummaryRenderer.test.js`
- `src/__tests__/emptyState.security.test.js`
- `src/__tests__/relatorioView.security.test.js`
- `src/__tests__/utils.test.js`
- `src/__tests__/tour.test.js`
- `src/__tests__/upgradeNudge.test.js`

Outros testes relevantes para proximas migracoes:

- Clientes: `clientesCardRenderer.test.js`, `clientesDataModel.test.js`, `clientesRouteAccess.test.js`, `clientesView.pmoc.test.js`.
- Equipamentos: `equipamentosView.hero.test.js`, `equipPhotosEditor.test.js`, `equipPhotosGate.test.js`, `setorModal.premium.test.js`, `setorModal.styles.test.js`.
- Dashboard: `dashboard.rules.test.js`, `dashboard.premium.test.js`.
- Historico: `historicoView.test.js`.
- Relatorio: `relatorioView.test.js`.
- Registro: cobertura indireta por `registroContext.test.js`, `registroStatus.test.js`, `postSaveRegistroToast.test.js`, `postSaveRegistroCompletion.test.js`, `reportExportHandlers.test.js`.

Lacunas antes da proxima migracao:

- Nao ha teste de ilha React para `clientes`.
- Nao ha teste especifico garantindo que uma futura `ClientesPage` preserve todos os `data-cli-action`, ids e classes `cli-*`.
- Nao ha view model dedicado para dashboard, equipamentos, historico, registro ou relatorio.
- Nao ha contrato centralizado para ids/actions de dashboard, equipamentos, historico, registro ou relatorio.
- Fluxos de PDF, assinatura, paywall, storage e CRUD devem permanecer fora dos PRs de migracao React ate haver testes especificos para cada contrato.

## 11. Arquivos em estado seguro vs risco

Estado mais seguro para evoluir:

- `src/react/README.md`
- `src/react/styles/tailwind.css`
- `src/react/entrypoints/alertasIsland.jsx`
- `src/react/entrypoints/orcamentosIsland.jsx`
- `src/react/pages/AlertasPage.jsx`
- `src/react/pages/OrcamentosPage.jsx`
- `src/ui/viewModels/alertasViewModel.js`
- `src/ui/viewModels/orcamentosViewModel.js`
- `src/ui/viewModels/clientesViewModel.js`
- `src/ui/viewModels/clientesContracts.js`
- `src/ui/views/clientes/*`
- Testes React/view model/security listados acima

Arquivos com acoplamento, divida tecnica ou risco:

- `src/ui/views/equipamentos.js`: 2493 linhas, mistura DOM, CRUD, plano, fotos, setores e modais.
- `src/ui/views/dashboard.js`: 1294 linhas, charts, onboarding, header e DOM global.
- `src/ui/views/historico.js`: 1582 linhas, filtros, menus e delete no mesmo arquivo.
- `src/ui/views/registro.js`: 1371 linhas, formulario critico, fotos, assinatura, PDF/WhatsApp e route guard.
- `src/ui/views/relatorio.js`: 1030 linhas, PDF, PMOC, assinatura e filtros.
- `src/assets/styles/components.css`: 21130 linhas, CSS legado concentrado.
- `src/ui/controller/routes.js`: mistura imports estaticos e dinamicos; contem seletores legados de clientes que nao batem com a estrutura atual.
- `src/ui/views/orcamentos.js`: usa `setTimeout` como debounce no adapter legado.

## 12. Plano de PRs pequenos

### PR 1: Migrar `clientes` para ilha React controlada

- Objetivo: substituir o `innerHTML` de `clientes` por uma ilha React em `#clientes-root`, usando o `buildClientesViewModel` e preservando handlers legados.
- Escopo permitido: criar `ClientesPage.jsx`, `clientesIsland.jsx`, testes de island, adaptar `src/ui/views/clientes.js` para montar/desmontar a ilha.
- Escopo proibido: alterar paywall, `ClienteModal`, `ClienteAlertModal`, `ClientePmocPanel`, CRUD, rotas, regras Pro, storage ou visual.
- Arquivos provaveis: `src/react/pages/ClientesPage.jsx`, `src/react/entrypoints/clientesIsland.jsx`, `src/ui/views/clientes.js`, `src/__tests__/clientesReactIsland.test.jsx`.
- Testes necessarios: novo teste de island preservando `#clientes-root`, ids `cli-*`, classes `cli-*`, `data-cli-action`; manter `clientesViewModel.test.js`, `clientesView.security.test.js`, `clientesRouteAccess.test.js`.
- Criterio de aceite: `clientes` renderiza via React, handlers legados continuam recebendo os mesmos `data-cli-action`, sem `dangerouslySetInnerHTML`, sem mudanca visual intencional.

### PR 2: Preparar `dashboard` com view model read-only

- Objetivo: extrair calculos e contratos read-only do dashboard antes de qualquer React.
- Escopo permitido: criar view model puro para KPIs, alertas resumidos e proxima acao; adicionar testes.
- Escopo proibido: migrar UI para React, mexer em charts, onboarding, plano, header, rotas ou CSS.
- Arquivos provaveis: `src/ui/viewModels/dashboardViewModel.js`, `src/__tests__/dashboardViewModel.test.js`, pequenas chamadas em `src/ui/views/dashboard.js` se estritamente necessario.
- Testes necessarios: regras de KPIs, alertas, proxima acao, ausencia de DOM/React no view model.
- Criterio de aceite: dashboard continua legado, mas calculos principais ficam testaveis fora da view.

### PR 3: Preparar `equipamentos` lista/hero para React futuro

- Objetivo: reduzir risco da tela `equipamentos` extraindo contrato de lista/hero sem criar componente React.
- Escopo permitido: centralizar ids/actions da lista, consolidar modelo de cards/hero ja existente, adicionar testes focados.
- Escopo proibido: migrar modal, CRUD, fotos, setores, paywall, storage, nameplate ou visual.
- Arquivos provaveis: `src/ui/viewModels/equipamentosViewModel.js`, `src/ui/views/equipamentos/hero.js`, `src/ui/views/equipamentos/equipmentCards.js`, testes novos/atualizados.
- Testes necessarios: cards, quick filters, hero, contratos de `data-action` e ids publicos.
- Criterio de aceite: nenhuma tela React nova; menos logica fica presa em `equipamentos.js`; comportamento visual igual.

### PR 4: Migrar `dashboard` parcialmente como ilha read-only

- Objetivo: montar uma ilha React apenas para blocos read-only ja cobertos pelo view model do PR 2.
- Escopo permitido: React para KPIs/alertas/proxima acao se os contratos estiverem testados.
- Escopo proibido: charts, onboarding, plano, header global, storage, rotas e CSS novo sem necessidade.
- Arquivos provaveis: `src/react/pages/DashboardPage.jsx`, `src/react/entrypoints/dashboardIsland.jsx`, `src/ui/views/dashboard.js`, testes de island.
- Testes necessarios: island preservando ids/classes consumidos por CSS e handlers; security para conteudo dinamico; testes existentes de dashboard.
- Criterio de aceite: apenas blocos read-only migram; dashboard continua funcional se handlers globais permanecerem legados.

### PR 5: Preparar `historico` lista/filtros

- Objetivo: criar modelo puro de lista e filtros de historico antes de qualquer React.
- Escopo permitido: extrair filtros, chips ativos, agrupamento/lista e contratos de `data-hist-action`.
- Escopo proibido: migrar para React, alterar delete, fotos, assinatura, PDF, relatorio, storage ou navegacao.
- Arquivos provaveis: `src/ui/viewModels/historicoViewModel.js`, `src/ui/views/historico.js`, `src/__tests__/historicoViewModel.test.js`.
- Testes necessarios: filtros, chips, ordenacao, estados vazios, ausencia de DOM/React no view model.
- Criterio de aceite: `historico` permanece legado, mas pronto para uma migracao futura menor.

## 13. Regras para proximos PRs

- Um PR prepara uma tela; outro PR migra uma tela.
- Nao misturar correcao de conflito com migracao.
- Nao misturar PDF, modal, CRUD, storage, assinatura, paywall ou backend com React.
- Manter handlers legados ate haver teste especifico do contrato.
- Usar Tailwind apenas com prefixo `tw-`.
- Nao habilitar `preflight` sem PR proprio.
- Nao montar React em `#app`.
- Preservar ids publicos, classes publicas e atributos `data-*` enquanto o CSS/handlers legados dependerem deles.
- Se tocar em arquivo acima de 1000 linhas, o PR deve justificar escopo pequeno e evitar refactor oportunista.
- Qualquer nova ilha deve ter teste de mount, re-render, unmount e security quando renderizar conteudo dinamico.

## 14. Riscos atuais

- Branches e commits misturados no historico recente (`main`, branches de recuperacao e commits de conflito).
- O grep amplo de conflito gera falsos positivos por separadores `=======`; usar checagem ancorada para conflito real.
- Chunks grandes e imports dinamicos/estaticos mistos, especialmente em routes, app bootstrap, PDF, charts e views.
- Views grandes: `equipamentos.js`, `dashboard.js`, `historico.js`, `registro.js`, `relatorio.js`.
- Dependencia de ids globais definidos em `src/ui/shell/templates/views.js`.
- CSS legado concentrado em `components.css`.
- React atual ainda usa classes legadas, entao a migracao ainda nao desacopla visual.
- `clientes` tem preparacao boa, mas o adapter de rota ainda tem seletores antigos.
- `orcamentos` ja esta em React, mas o adapter tem debounce com `setTimeout` e fluxos externos de CRUD/PDF/assinatura.

## 15. Recomendacao objetiva

O proximo PR imediatamente apos este mapeamento deve ser o PR 1: migrar `clientes` para uma ilha React controlada em `#clientes-root`.

Justificativa: `clientes` e a tela com melhor preparacao atual. Ja tem view model, contratos, renderers modulares, documento de preparacao e testes relevantes. O PR deve ser estritamente de migracao da renderizacao para React, mantendo paywall, modais, PMOC, delete, navegacao, storage e handlers legados fora do escopo.
