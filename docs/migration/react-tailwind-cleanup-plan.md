# Plano de limpeza React + Tailwind 90-100

## 1. Branch e commit analisados

- Data da analise: 2026-05-01.
- Branch: `main`.
- Commit analisado: `dbe8c9f` (`dbe8c9f (HEAD -> main, origin/main, origin/HEAD) Update validation workflow`).
- `git status --short`: vazio no inicio da analise.
- Checagem de conflito usada: `git grep -n -E "^(<<<<<<<|=======|>>>>>>>)($| )"`.
- Resultado da checagem de conflito: sem marcadores reais; o comando retorna exit code 1 quando nao encontra matches.

Ultimos commits vistos em `git log --oneline --decorate -10`:

- `dbe8c9f (HEAD -> main, origin/main, origin/HEAD) Update validation workflow`
- `bac9b9a Protect Registro PDF and WhatsApp legacy contracts`
- `c901a07 Migrate registro signature hint to React island`
- `62a4e16 Update repository instructions and validation workflow`
- `8fafd2a Update project validation instructions`
- `70fa966 Refactor track processing into smaller modules`
- `052d775 Harden Registro legacy signature preview rendering`
- `72fadde Protect Registro checklist handlers with item-id fallback`
- `3be6354 Migrate registro checklist to a React island`
- `9d545f2 Fix registro technician field contract and handlers`

## 2. Resumo executivo

A migracao esta de fato proxima de 90%, mas ainda nao esta pronta para apagar o legado em bloco. O React ja renderiza as principais superficies de `alertas`, `orcamentos`, `clientes`, lista flat de `equipamentos`, blocos principais do `dashboard`, filtros/timeline do `historico`, hero/controles/cards do `relatorio` e blocos principais do `registro`.

O legado restante se divide em tres grupos:

- Legado util: adapters que ainda leem estado, resolvem plano, chamam view models e conectam handlers legados a DOM emitido por React.
- Legado temporario: fallbacks de render, wrappers de root, handlers delegados e componentes visuais pequenos que existem porque nem todos os fluxos foram migrados.
- Codigo possivelmente morto: renders de fallback para roots que hoje sempre existem, seletores antigos e CSS que parece sobrar, mas que ainda precisa de prova por teste e QA visual antes de remocao.
- Limpeza ja iniciada: o probe temporario React e o seletor legado `#clientes-busca` foram removidos no PR de limpeza de 2026-05-01; Clientes preserva `#clientes-root` e `#cli-search-input`.

O caminho seguro para 100% nao e apagar `components.css` ou remover `data-action` de uma vez. O caminho e: provar cada contrato, remover fallback por fallback, migrar as ultimas superficies visuais pequenas, depois reduzir CSS e handlers globais com inventario automatizado.

## 3. Estado atual da migracao

Infraestrutura React/Tailwind:

- React 18, `@vitejs/plugin-react`, Vitest e Playwright estao configurados.
- `tailwind.config.cjs` limita `content` a `index.html` e `src/react/**/*.{js,jsx,ts,tsx}`.
- Tailwind usa prefixo `tw-` e `preflight: false`.
- `src/react/styles/tailwind.css` carrega apenas `@tailwind components` e `@tailwind utilities`.
- `createRoot` aparece nos entrypoints React, nao nos adapters legados das telas migradas.
- Nao ha `dangerouslySetInnerHTML` em producao; os matches encontrados estao em testes garantindo ausencia.

Roots/entrypoints React atuais:

| Area                       | Root                       | Entrypoint                                              | Componente                                  |
| -------------------------- | -------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| Alertas                    | `#view-alertas`            | `src/react/entrypoints/alertasIsland.jsx`               | `src/react/pages/AlertasPage.jsx`           |
| Orcamentos                 | `#view-orcamentos`         | `src/react/entrypoints/orcamentosIsland.jsx`            | `src/react/pages/OrcamentosPage.jsx`        |
| Clientes                   | `#clientes-root`           | `src/react/entrypoints/clientesIsland.jsx`              | `src/react/pages/ClientesPage.jsx`          |
| Equipamentos lista         | `#lista-equip`             | `src/react/entrypoints/equipamentosListIsland.jsx`      | `src/react/pages/EquipamentosListPage.jsx`  |
| Dashboard KPIs             | `#dash-kpis-root`          | `src/react/entrypoints/dashboardKpisIsland.jsx`         | `src/react/pages/DashboardKpis.jsx`         |
| Dashboard proxima acao     | `#dash-next-action-card`   | `src/react/entrypoints/dashboardNextActionIsland.jsx`   | `src/react/pages/DashboardNextAction.jsx`   |
| Dashboard ultimo servico   | `#dash-last-service`       | `src/react/entrypoints/dashboardLastServiceIsland.jsx`  | `src/react/pages/DashboardLastService.jsx`  |
| Dashboard resumo mensal    | `#dash-month-section`      | `src/react/entrypoints/dashboardMonthSummaryIsland.jsx` | `src/react/pages/DashboardMonthSummary.jsx` |
| Historico filtros          | `#hist-filters-root`       | `src/react/entrypoints/historicoFiltersIsland.jsx`      | `src/react/pages/HistoricoFilters.jsx`      |
| Historico timeline         | `#timeline`                | `src/react/entrypoints/historicoTimelineIsland.jsx`     | `src/react/pages/HistoricoTimeline.jsx`     |
| Relatorio hero             | `#rel-hero`                | `src/react/entrypoints/relatorioHeroIsland.jsx`         | `src/react/pages/RelatorioHero.jsx`         |
| Relatorio controles        | `#rel-controls-root`       | `src/react/entrypoints/relatorioControlsIsland.jsx`     | `src/react/pages/RelatorioControls.jsx`     |
| Relatorio cards            | `#relatorio-corpo`         | `src/react/entrypoints/relatorioCardsIsland.jsx`        | `src/react/pages/RelatorioCards.jsx`        |
| Registro header/campos     | `#registro-header-root`    | `src/react/entrypoints/registroHeaderIsland.jsx`        | `src/react/pages/RegistroHeader.jsx`        |
| Registro checklist         | `#r-checklist-body`        | `src/react/entrypoints/registroChecklistIsland.jsx`     | `src/react/pages/RegistroChecklist.jsx`     |
| Registro fotos             | `#registro-photos-root`    | `src/react/entrypoints/registroPhotosIsland.jsx`        | `src/react/pages/RegistroPhotos.jsx`        |
| Registro assinatura visual | `#registro-signature-hint` | `src/react/entrypoints/registroSignatureIsland.jsx`     | `src/react/pages/RegistroSignature.jsx`     |

Arquivos React maiores, para observar antes de crescer:

- `src/react/pages/ClientesPage.jsx`: 968 linhas, perto do limite de 1000.
- `src/react/pages/RelatorioCards.jsx`: 483 linhas.
- `src/react/pages/RelatorioControls.jsx`: 483 linhas.
- `src/react/pages/EquipamentosListPage.jsx`: 462 linhas.
- `src/react/pages/RegistroHeader.jsx`: 449 linhas.
- `src/react/pages/HistoricoTimeline.jsx`: 447 linhas.

## 4. Tabela por tela

| Tela                                   | React atual                                          | Legado ainda necessario                                                                                          | Legado possivelmente morto                                                                                                                           | Handlers ainda usados                                                                                       | CSS dependente                                                                          | Risco       | Proximo PR recomendado                                                                                 |
| -------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| Alertas                                | Tela inteira em `#view-alertas`.                     | Adapter le `state`, monta view model, skeleton e unmount.                                                        | `ensureAlertasShell()` removido; shell fixo e teste `alertasShellContracts.test.js` cobrem `#alertas-contextual` e `#lista-alertas`.                 | `data-action`, `data-id`, `data-nav` emitidos pelos cards/empty state.                                      | `alert-*`, `alertas-*`, `empty-state`, `btn`.                                           | Baixo.      | Revisar apenas handlers globais/data-action de Alertas antes de limpeza de CSS.                        |
| Orcamentos                             | Tela inteira em `#view-orcamentos`.                  | Adapter mantem filtros, debounce, CRUD, delete, toasts e status.                                                 | Pouco render morto; o principal legado e fluxo, nao HTML duplicado.                                                                                  | `data-action` de orcamentos, modal, assinatura, delete/share/download.                                      | `orc-*`, `btn`, modal de orcamento.                                                     | Medio.      | Trocar debounce com `setTimeout` por fluxo testavel ou manter ate migrar handlers.                     |
| Clientes                               | Tela inteira em `#clientes-root`.                    | Adapter mantem hidratacao, filtros, paginacao, delete, PMOC, modais e navegacao.                                 | Binding antigo de `routes.js` para `#clientes-busca` ja removido; revisar apenas outros fallbacks de render/handler.                                 | `data-cli-action`, `data-id`, `data-page`, `data-nav`.                                                      | `cli-*`, `_clientes.css`, `btn`, modais PMOC/cliente.                                   | Medio.      | Proteger e reduzir fallbacks restantes de Clientes antes de qualquer limpeza de CSS.                   |
| Equipamentos                           | Lista flat em `#lista-equip`.                        | Hero, filtros, contexto, setores, detalhe/modal, fotos, CRUD, nameplate, plano e storage.                        | Renders antigos de card/lista podem estar duplicados entre `equipmentCards.js` e React list, mas ainda usados em setores/detalhe.                    | `data-action`, `data-id`, `data-setor-id`, `data-cliente-id`, callbacks de fotos/PMOC.                      | `equip-*`, `setor-*`, `eq-*`, `_equip-hero.css`, `_setor-card.css`, `_setor-modal.css`. | Alto.       | Migrar hero/filtros/contexto de equipamentos para ilha separada; antes, proteger handlers dos filtros. |
| Dashboard                              | KPIs, proxima acao, ultimo servico e resumo mensal.  | Hero, empty/onboarding, overflow banner, charts, cards Pro, alertas mini, criticos, recentes, rascunho.          | Fallback de `_renderNextActionCard` removido; `_renderLastServiceCard` e `_renderMonthView` ainda podem ser removiveis com prova de root/view model. | `data-action`, `data-nav`, `data-id` para registro, modal, historico, clientes, rascunho e equipamentos.    | `dash-*`, `critical-*`, `recent-*`, `chart-*`, onboarding/overflow.                     | Alto.       | Remover fallback de ultimo servico ou resumo mensal em PR pequeno; depois migrar `dash-hero`.          |
| Historico                              | Filtros/busca e timeline.                            | Sheet mobile de filtros, URL sync, delete, fotos/lightbox, assinatura viewer, navegacao, summary toggle/session. | `syncSetorSelect()` e shell legacy dos filtros devem ser reavaliados apos `#hist-filters-root` estar sempre presente.                                | `data-hist-action`, `data-action`, `data-nav`, `data-reg-id`, `data-equip-id`, `data-photo-url`.            | `hist-*`, `timeline*`, `empty-state`, sheet mobile.                                     | Medio/alto. | Migrar sheet mobile de filtros ou remover shell/fallback dos filtros com prova E2E.                    |
| Relatorio                              | Hero, controles/filtros e cards.                     | PDF, WhatsApp, PMOC, quota, assinatura viewer, navegacao e company PMOC block.                                   | Fallbacks `renderModeSegment()` e `renderFilterChips()` removidos; controles dependem de `#rel-controls-root` e `RelatorioControls.jsx`.             | `data-action`, `data-rel-action`, `data-nav`, `data-id`, `data-view-mode`, `data-tier`.                     | `rel-*`, `servicos-toggle*`, `pmoc*`, quota/PDF.                                        | Medio.      | Migrar ou proteger `#rel-company-pmoc-slot`; depois revisar handlers de export/PMOC antes de CSS.      |
| Registro                               | Header/campos, checklist, fotos e assinatura visual. | Captura/modal de assinatura, salvamento/edicao, pos-save, PDF, WhatsApp, route guard, picker de equipamento.     | `_ensureProgressBar()` e parte de hero legacy podem virar no-op removivel; confirmar antes por testes.                                               | `data-action`, `data-r-action`, `data-item`, `data-status`, `data-unit`, `data-item-id`, `data-after-save`. | `registro-*`, `r-checklist*`, `photo-*`, `registro-sig-hint*`, modais.                  | Alto.       | Migrar rodape de acoes/painel pos-save visual, mantendo save/PDF/WhatsApp legados.                     |
| Pricing/Conta/Privacidade/Landing/Auth | Ainda legado fora do escopo principal.               | Render de pagina, modais, checkout/account/auth, landing.                                                        | Sem inventario suficiente para apagar.                                                                                                               | `data-action` locais.                                                                                       | `pricing-*`, `conta-*`, `privacy-*`, landing/auth.                                      | Medio.      | Decidir se entram no criterio de 100%; se sim, criar prep docs separados.                              |

## 5. Codigo legado removivel com seguranca baixa/media/alta

Concluido no PR de limpeza de 2026-05-01:

- `src/react/components/IntegrationProbe.jsx`, `src/react/entrypoints/integrationProbe.jsx` e `src/__tests__/reactIntegrationProbe.test.js` foram removidos; nao havia uso real de `#react-integration-root` em produto.
- O binding antigo em `src/ui/controller/routes.js` para `#clientes-busca` foi removido; Clientes usa `#cli-search-input` como contrato atual.
- `src/__tests__/reactCleanupContracts.test.js` cobre a ausencia do probe e do seletor antigo.
- `ensureAlertasShell()` foi removido de `src/ui/views/alertas.js`; `src/__tests__/alertasShellContracts.test.js` garante que o shell declara `#alertas-contextual` e `#lista-alertas`.
- `renderModeSegment()` e `renderFilterChips()` foram removidos de `src/ui/views/relatorio.js`; `src/__tests__/relatorioLegacyControls.test.js` garante que o adapter usa a ilha `relatorioControlsIsland` sem manter esses fallbacks manuais.
- O fallback manual de `_renderNextActionCard()` foi removido de `src/ui/views/dashboard.js`; `src/__tests__/dashboardLegacyNextAction.test.js` garante que o adapter delega a `dashboardNextActionIsland` sem escrever `#dash-next-title`, `#dash-next-sub` ou CTA manualmente.

Alta seguranca, apos teste pequeno:

- Nenhum item pendente nesta faixa apos a limpeza de Alertas.

Media seguranca, apos prova de root sempre presente e testes de lifecycle:

- Fallbacks DOM de dashboard para blocos ja migrados: partes de `_renderLastServiceCard` e `_renderMonthView` que so rodam quando nao existe root/model.
- Wrappers criados em runtime para `#hist-filters-root` e `#registro-header-root` podem ser simplificados se o shell passar a declarar os roots definitivos diretamente.
- Legacy tests de render dos blocos ja migrados podem mudar de "proteger render legado" para "proteger contrato historico" antes de serem removidos. Nao apagar sem substituir a cobertura.

Baixa seguranca por enquanto:

- Qualquer bloco de `src/assets/styles/components.css` sem auditoria visual.
- Renderers de equipamentos em `src/ui/views/equipamentos/*`, porque lista flat, setor grid e modal de detalhe compartilham classes e HTML.
- Fluxos de PDF, WhatsApp, PMOC, assinatura, fotos, salvamento, route guard, modais e storage.
- `data-action` globais usados por `navigationHandlers`, `registroHandlers`, `reportExportHandlers`, handlers de equipamento/cliente e modais.

## 6. Codigo que nao deve ser removido ainda

- Adapters de tela em `src/ui/views/*`: ainda sao o ponto que le estado, resolve plano, chama view models, monta ilhas e preserva lifecycle.
- `src/ui/controller/routes.js`: ainda centraliza `onEnter`/`onLeave` e desmontagem das ilhas.
- `src/ui/controller/handlers/*`: ainda consome os contratos `data-*` emitidos por React.
- `src/ui/components/photos.js`: mesmo com UI React, ainda e dono de upload, compressao, lightbox, quota local e callbacks.
- `src/ui/components/signature/*`: captura/viewer real seguem legados.
- `src/ui/components/pdfQuotaBadge.js`, `src/ui/controller/handlers/reportExportHandlers.js`, PMOC e WhatsApp: ainda sao fluxos legados protegidos.
- `src/ui/shell/templates/views.js`: ainda contem os containers publicos que as ilhas usam.
- CSS legado carregado por `index.html`, especialmente `components.css`, `layout.css`, `theme-premium.css`, `redesign.css` e parciais em `src/assets/styles/components/*`.

## 7. Plano de PRs pequenos para 90 -> 100

### PR 1: Remover probes e seletores obsoletos comprovados

- Status: concluido no PR de limpeza de 2026-05-01.
- Escopo: `integrationProbe` removido; binding antigo `#clientes-busca` removido de `routes.js`.
- Testes: `reactIntegrationProbe.test.js` removido; `reactCleanupContracts.test.js` criado; `clientesReactIsland.test.jsx`, `clientesRouteAccess.test.js` e `react-islands-lifecycle.spec.js` preservam o contrato atual.
- Risco: baixo.
- Criterio: nenhuma mudanca visual, nenhuma perda de busca em clientes; contrato atual `#cli-search-input`.

### PR 2: Limpar fallbacks de roots ja migrados

- Escopo: remover fallback DOM de alertas e fallbacks de dashboard/relatorio que so existem para ausencia de roots ja obrigatorios.
- Testes: islands de dashboard, relatorio, alertas e E2E lifecycle.
- Risco: medio, porque alguns testes antigos ainda podem importar os fallbacks como contrato.
- Criterio: adapters continuam sem `createRoot`, roots React continuam idempotentes.

### PR 3: Equipamentos hero/filtros/contexto como ilha React

- Escopo: migrar apenas `#equip-hero`, `#equip-filters` e `#equip-context-chip`, mantendo lista React, setor grid, detalhe, CRUD, fotos e modais legados.
- Testes: island nova, legacy handlers dos filtros, E2E equipamentos -> inicio -> equipamentos.
- Risco: medio/alto.
- Criterio: lista flat segue React; setor grid/detalhe nao muda.

### PR 4: Dashboard hero e secoes read-only restantes

- Escopo: migrar `#dash-hero`, empty state, alertas mini, criticos e recentes em ilhas pequenas ou uma ilha read-only por secao.
- Fora do escopo: charts, onboarding, overflow banner e header global.
- Testes: view model, islands, lifecycle E2E.
- Risco: medio.
- Criterio: charts/onboarding continuam legados.

### PR 5: Historico sheet mobile

- Escopo: migrar somente sheet mobile de filtros, preservando `data-hist-action` e filtros existentes.
- Fora do escopo: timeline, delete, fotos, assinatura e navegacao.
- Testes: island sheet, handlers legados, E2E mobile leve se viavel.
- Risco: medio.
- Criterio: filtros desktop/timeline seguem funcionando.

### PR 6: Relatorio PMOC/company slot e fallbacks finais

- Escopo: migrar `#rel-company-pmoc-slot` para React ou mover para `RelatorioControls` se o contrato permitir.
- Fora do escopo: PMOC real, quota, PDF, WhatsApp e assinatura.
- Testes: island/handlers PMOC legados e E2E relatorio.
- Risco: medio.
- Criterio: PMOC real continua legado.

### PR 7: Registro rodape visual e pos-save visual

- Escopo: migrar somente rodape visual de acoes e UI pos-save/CTAs, mantendo handlers de `save-registro`, `save-and-share-registro`, PDF e WhatsApp legados.
- Fora do escopo: salvamento, assinatura real, fotos, PDF, WhatsApp, route guard e storage.
- Testes: island, post-save legado, E2E save e save-and-share com mocks.
- Risco: alto.
- Criterio: payload completo preservado.

### PR 8: Reduzir `data-action` por tela ja 100% visual

- Escopo: para uma tela por vez, trocar handlers globais por callbacks de adapter quando a tela inteira estiver em React.
- Ordem sugerida: alertas, orcamentos, clientes, depois relatorio/registro.
- Testes: handlers existentes precisam virar testes de callbacks/adapters.
- Risco: medio.
- Criterio: `data-*` deixa de ser contrato interno apenas quando nao houver consumidor externo.

### PR 9: CSS legado fase 1

- Escopo: rodar inventario de CSS, separar classes vivas por tela e remover blocos comprovadamente mortos em PRs pequenos.
- Ferramentas: `npm run lint:css:dead` existe, mas depende de validacao manual e pode gerar falsos positivos com classes dinamicas.
- Testes: build, E2E das rotas afetadas e screenshots antes/depois.
- Risco: alto se feito em lote.
- Criterio: cada PR remove uma familia de classes com evidencia de uso zero.

### PR 10: Criterio final de 100%

- Escopo: consolidar docs, apagar testes legacy obsoletos substituidos por testes React/adapter, revisar imports dinamicos/estaticos e atualizar `docs/migration/react-tailwind-current-state.md`.
- Risco: baixo/medio.
- Criterio: nenhuma tela principal depende de HTML string para render visual principal; legado restante e infraestrutura externa deliberada.

## 8. Criterios para considerar uma tela 100% migrada

Uma tela deve ser considerada 100% migrada apenas quando todos estes pontos forem verdadeiros:

- Todo render visual principal da rota e feito por React.
- O adapter legado nao cria HTML dinamico para a superficie da tela; ele pode apenas montar React, ler estado e delegar side effects.
- `createRoot` fica apenas em `src/react/entrypoints/*`.
- A rota chama unmount no `onLeave`.
- O componente React nao acessa DOM, storage, router, backend, PDF, WhatsApp, assinatura ou modais diretamente.
- Contratos publicos remanescentes estao centralizados em `src/ui/viewModels/*Contracts.js`.
- Handlers legados restantes tem teste de contrato ou ja foram substituidos por callbacks testados.
- CSS usado pela tela esta inventariado; classes mortas foram removidas em PR proprio ou marcadas como intencionais.
- Existe teste unitario de island, teste de adapter/handler quando houver legado e E2E lifecycle.

## 9. Estrategia para reduzir CSS legado

- Nao remover CSS por grep simples: classes dinamicas como `equip-card--${tone}` e `rel-tipo--${tone}` geram falsos positivos.
- Usar `npm run lint:css:dead` como triagem, nao como prova final.
- Criar mapa por prefixo: `dash-*`, `equip-*`, `setor-*`, `hist-*`, `timeline*`, `rel-*`, `registro-*`, `r-checklist*`, `cli-*`, `orc-*`, `alert-*`.
- Para cada prefixo, confirmar uso em `src/react`, `src/ui/shell/templates`, `src/ui/views`, `src/ui/components` e E2E.
- Remover uma familia por PR com screenshot/Playwright da rota afetada.
- Manter `preflight: false` ate o CSS legado estar pequeno o suficiente para comparar reset visual.
- Preferir mover estilo de nova UI para classes Tailwind `tw-` ou CSS module-like por componente apenas depois de estabilizar contratos.

## 10. Estrategia para reduzir `data-action` e handlers globais

- Enquanto uma tela mistura React com fluxos legados, `data-action` e variantes (`data-r-action`, `data-rel-action`, `data-hist-action`, `data-cli-action`) sao contratos validos.
- O primeiro passo nao e remover atributos; e centralizar todos em contracts e cobrir handlers com testes.
- Apos uma tela ficar 100% visual em React, migrar handlers internos para callbacks injetados pelo adapter.
- Manter `data-nav` por mais tempo, pois a navegacao global ainda usa delegacao e e compartilhada entre rotas.
- Nao migrar PDF, WhatsApp, PMOC, assinatura, fotos, storage e salvamento junto com a remocao de handlers.

## 11. Riscos restantes

- `src/ui/views/equipamentos.js`, `dashboard.js`, `historico.js` e `registro.js` ainda passam de 1000 linhas.
- `src/assets/styles/components.css` tem 21130 linhas e importa parciais grandes; remover CSS sem QA visual e arriscado.
- `ClientesPage.jsx` tem 968 linhas, perto do limite de 1000; qualquer crescimento deve virar extracao de componentes.
- Muitos fluxos externos continuam legados por design: PDF, WhatsApp, PMOC, assinatura, fotos, storage/backend e route guard.
- Alguns fallbacks existem para resiliencia quando roots ainda nao foram reorganizados no shell; remover antes de garantir root pode quebrar rotas em cold start.
- O app ainda mistura imports estaticos e dinamicos; build pode continuar emitindo warnings de chunks/imports mistos ate uma limpeza de bundling propria.

## 12. Recomendacao objetiva do proximo PR

O proximo PR recomendado agora e o PR 2: limpar fallbacks de roots ja migrados.

Motivo: o PR 1 ja removeu o probe temporario e o seletor legado de Clientes. A proxima menor fatia util e provar roots sempre presentes e remover fallbacks de render que duplicam blocos ja migrados.

Nao iniciar por CSS. O CSS legado ainda e a maior fonte de risco e deve vir depois que os fallbacks e contratos por tela estiverem limpos.
