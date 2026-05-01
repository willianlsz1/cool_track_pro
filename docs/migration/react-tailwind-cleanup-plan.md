# Plano de limpeza React + Tailwind pos-migracao

## 1. Branch e commit analisados

- Data da analise original: 2026-05-01.
- Atualizacao de fechamento: 2026-05-01.
- Branch: `main`.
- Commit analisado originalmente: `dbe8c9f` (`dbe8c9f (HEAD -> main, origin/main, origin/HEAD) Update validation workflow`).
- Commit observado no fechamento: `757cd5d` (`757cd5d (HEAD -> main, origin/main, origin/HEAD) Enforce repo validation workflow`).
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

A migracao visual principal React + Tailwind esta concluida. O React renderiza as superficies visuais principais de `alertas`, `orcamentos`, `clientes`, `equipamentos`, `dashboard`, `historico`, `relatorio` e `registro`.

O documento de status final fica em `docs/migration/react-tailwind-final-status.md`. Este plano continua existindo como guia de hardening e limpeza, nao como lista de migracoes visuais amplas pendentes.

O legado restante se divide em tres grupos:

- Legado deliberado: adapters, handlers globais, fluxos externos e infraestrutura que continuam fora de React por risco ou responsabilidade propria.
- Hardening: testes e provas adicionais para integracoes entre ilhas React e handlers legados.
- Codigo possivelmente morto: renders de fallback para roots que hoje sempre existem, seletores antigos e CSS que parece sobrar, mas que ainda precisa de prova por teste e QA visual antes de remocao.
- Limpeza ja iniciada: o probe temporario React e o seletor legado `#clientes-busca` foram removidos no PR de limpeza de 2026-05-01; Clientes preserva `#clientes-root` e `#cli-search-input`.

O caminho seguro daqui em diante nao e apagar `components.css` ou remover `data-action` de uma vez. O caminho e: provar cada contrato restante, tratar legados deliberados como excecoes documentadas, reduzir CSS por prefixo e substituir handlers globais por callbacks apenas quando uma tela estiver estavel e coberta.

## 3. Estado atual da migracao

Infraestrutura React/Tailwind:

- React 18, `@vitejs/plugin-react`, Vitest e Playwright estao configurados.
- `tailwind.config.cjs` limita `content` a `index.html` e `src/react/**/*.{js,jsx,ts,tsx}`.
- Tailwind usa prefixo `tw-` e `preflight: false`.
- `src/react/styles/tailwind.css` carrega apenas `@tailwind components` e `@tailwind utilities`.
- `createRoot` aparece nos entrypoints React, nao nos adapters legados das telas migradas.
- Nao ha `dangerouslySetInnerHTML` em producao; os matches encontrados estao em testes garantindo ausencia.

Roots/entrypoints React atuais:

| Area                       | Root                         | Entrypoint                                                | Componente                                    |
| -------------------------- | ---------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| Alertas                    | `#view-alertas`              | `src/react/entrypoints/alertasIsland.jsx`                 | `src/react/pages/AlertasPage.jsx`             |
| Orcamentos                 | `#view-orcamentos`           | `src/react/entrypoints/orcamentosIsland.jsx`              | `src/react/pages/OrcamentosPage.jsx`          |
| Clientes                   | `#clientes-root`             | `src/react/entrypoints/clientesIsland.jsx`                | `src/react/pages/ClientesPage.jsx`            |
| Equipamentos header        | `#equip-hero`                | `src/react/entrypoints/equipamentosHeaderIsland.jsx`      | `src/react/pages/EquipamentosHeader.jsx`      |
| Equipamentos lista         | `#lista-equip`               | `src/react/entrypoints/equipamentosListIsland.jsx`        | `src/react/pages/EquipamentosListPage.jsx`    |
| Dashboard KPIs             | `#dash-kpis-root`            | `src/react/entrypoints/dashboardKpisIsland.jsx`           | `src/react/pages/DashboardKpis.jsx`           |
| Dashboard proxima acao     | `#dash-next-action-card`     | `src/react/entrypoints/dashboardNextActionIsland.jsx`     | `src/react/pages/DashboardNextAction.jsx`     |
| Dashboard ultimo servico   | `#dash-last-service`         | `src/react/entrypoints/dashboardLastServiceIsland.jsx`    | `src/react/pages/DashboardLastService.jsx`    |
| Dashboard resumo mensal    | `#dash-month-section`        | `src/react/entrypoints/dashboardMonthSummaryIsland.jsx`   | `src/react/pages/DashboardMonthSummary.jsx`   |
| Dashboard read-only blocks | `#dash-readonly-blocks-root` | `src/react/entrypoints/dashboardReadOnlyBlocksIsland.jsx` | `src/react/pages/DashboardReadOnlyBlocks.jsx` |
| Dashboard Pro/rascunho     | `#dash-pro-ops-row`          | `src/react/entrypoints/dashboardProDraftIsland.jsx`       | `src/react/pages/DashboardProDraft.jsx`       |
| Dashboard onboarding       | `#dash-onboarding`           | `src/react/entrypoints/dashboardOnboardingIsland.jsx`     | `src/react/pages/DashboardOnboarding.jsx`     |
| Historico filtros          | `#hist-filters-root`         | `src/react/entrypoints/historicoFiltersIsland.jsx`        | `src/react/pages/HistoricoFilters.jsx`        |
| Historico timeline         | `#timeline`                  | `src/react/entrypoints/historicoTimelineIsland.jsx`       | `src/react/pages/HistoricoTimeline.jsx`       |
| Relatorio hero             | `#rel-hero`                  | `src/react/entrypoints/relatorioHeroIsland.jsx`           | `src/react/pages/RelatorioHero.jsx`           |
| Relatorio controles        | `#rel-controls-root`         | `src/react/entrypoints/relatorioControlsIsland.jsx`       | `src/react/pages/RelatorioControls.jsx`       |
| Relatorio cards            | `#relatorio-corpo`           | `src/react/entrypoints/relatorioCardsIsland.jsx`          | `src/react/pages/RelatorioCards.jsx`          |
| Registro header/campos     | `#registro-header-root`      | `src/react/entrypoints/registroHeaderIsland.jsx`          | `src/react/pages/RegistroHeader.jsx`          |
| Registro checklist         | `#r-checklist-body`          | `src/react/entrypoints/registroChecklistIsland.jsx`       | `src/react/pages/RegistroChecklist.jsx`       |
| Registro fotos             | `#registro-photos-root`      | `src/react/entrypoints/registroPhotosIsland.jsx`          | `src/react/pages/RegistroPhotos.jsx`          |
| Registro assinatura visual | `#registro-signature-hint`   | `src/react/entrypoints/registroSignatureIsland.jsx`       | `src/react/pages/RegistroSignature.jsx`       |

Arquivos React maiores, para observar antes de crescer:

- `src/react/pages/ClientesPage.jsx`: 968 linhas, perto do limite de 1000.
- `src/react/pages/RelatorioCards.jsx`: 483 linhas.
- `src/react/pages/RelatorioControls.jsx`: 483 linhas.
- `src/react/pages/EquipamentosListPage.jsx`: 462 linhas.
- `src/react/pages/RegistroHeader.jsx`: 449 linhas.
- `src/react/pages/HistoricoTimeline.jsx`: 447 linhas.

## 4. Tabela por tela

| Tela                                   | React atual                                                                                                                       | Legado ainda necessario                                                                                                                 | Legado possivelmente morto                                                                                                                                                                                                                                                       | Handlers ainda usados                                                                                            | CSS dependente                                                                          | Risco  | Proximo PR recomendado                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| Alertas                                | Tela inteira em `#view-alertas`.                                                                                                  | Adapter le `state`, monta view model, skeleton e unmount.                                                                               | `ensureAlertasShell()` removido; shell fixo e teste `alertasShellContracts.test.js` cobrem `#alertas-contextual` e `#lista-alertas`.                                                                                                                                             | `data-action`, `data-id`, `data-nav` emitidos pelos cards/empty state.                                           | `alert-*`, `alertas-*`, `empty-state`, `btn`.                                           | Baixo. | Revisar apenas handlers globais/data-action de Alertas antes de limpeza de CSS.                   |
| Orcamentos                             | Tela inteira em `#view-orcamentos`.                                                                                               | Adapter mantem filtros, debounce, CRUD, delete, toasts e status.                                                                        | Pouco render morto; o principal legado e fluxo, nao HTML duplicado.                                                                                                                                                                                                              | `data-action` de orcamentos, modal, assinatura, delete/share/download.                                           | `orc-*`, `btn`, modal de orcamento.                                                     | Medio. | Trocar debounce com `setTimeout` por fluxo testavel ou manter ate migrar handlers.                |
| Clientes                               | Tela inteira em `#clientes-root`.                                                                                                 | Adapter mantem hidratacao, filtros, paginacao, delete, PMOC, modais e navegacao.                                                        | Binding antigo de `routes.js` para `#clientes-busca` ja removido; revisar apenas outros fallbacks de render/handler.                                                                                                                                                             | `data-cli-action`, `data-id`, `data-page`, `data-nav`.                                                           | `cli-*`, `_clientes.css`, `btn`, modais PMOC/cliente.                                   | Medio. | Proteger e reduzir fallbacks restantes de Clientes antes de qualquer limpeza de CSS.              |
| Equipamentos                           | Header/filtros/contexto em `#equip-hero` com portals para `#equip-filters` e `#equip-context-chip`; lista flat em `#lista-equip`. | Setores, detalhe/modal, fotos, CRUD, nameplate, plano e storage seguem legados.                                                         | Renders antigos de hero/filtros/contexto ficam preservados apenas como contrato historico; renders antigos de card/lista podem estar duplicados entre `equipmentCards.js` e React list, mas ainda usados em setores/detalhe.                                                     | `data-action`, `data-id`, `data-setor-id`, `data-cliente-id`, callbacks de fotos/PMOC.                           | `equip-*`, `setor-*`, `eq-*`, `_equip-hero.css`, `_setor-card.css`, `_setor-modal.css`. | Alto.  | Proteger handlers legados acionados pelo header React antes de migrar setores ou detalhe.         |
| Dashboard                              | Hero, KPIs, proxima acao, ultimo servico, resumo mensal, read-only blocks, cards Pro/rascunho e onboarding/empty/overflow.        | Charts e header global.                                                                                                                 | Fallbacks dos blocos React (`_renderNextActionCard`, `_renderLastServiceCard`, `_renderMonthView`, `_renderProCards`, `_renderContinueDraftCard`) removidos; `#dash-empty`, `#dash-onboarding` e `#dash-overflow-banner` agora sao renderizados por `dashboardOnboardingIsland`. | `data-action`, `data-nav`, `data-id` para registro, modal, historico, clientes, rascunho, onboarding e upgrade.  | `dash-*`, `critical-*`, `recent-*`, `chart-*`, onboarding/overflow.                     | Medio. | Proteger/migrar charts ou header global em fatia separada, sem mexer em CSS.                      |
| Historico                              | Filtros/busca e timeline.                                                                                                         | Sheet mobile de filtros isolado em helper puro, URL sync, delete, fotos/lightbox, assinatura viewer, navegacao, summary toggle/session. | `syncSetorSelect()` e shell legacy dos filtros devem ser reavaliados apos `#hist-filters-root` estar sempre presente; sheet mobile e legado deliberado por depender de overlay dinamico, a11y e callbacks imperativos.                                                           | `data-hist-action`, `data-action`, `data-nav`, `data-reg-id`, `data-equip-id`, `data-photo-url`, `data-tipo-id`. | `hist-*`, `timeline*`, `empty-state`, sheet mobile.                                     | Medio. | Proteger handlers do sheet mobile em integracao e depois decidir se vira ilha React propria.      |
| Relatorio                              | Hero, controles/filtros e cards.                                                                                                  | PDF, WhatsApp, PMOC real, quota, assinatura viewer, navegacao e `#rel-company-pmoc-slot` como legado deliberado isolado por model puro. | Fallbacks `renderModeSegment()` e `renderFilterChips()` removidos; controles dependem de `#rel-controls-root` e `RelatorioControls.jsx`; `#rel-company-pmoc-slot` ficou em legado deliberado com `relatorioCompanyPmocModel.js` e teste de contrato.                             | `data-action`, `data-rel-action`, `data-nav`, `data-id`, `data-view-mode`, `data-tier`.                          | `rel-*`, `servicos-toggle*`, `pmoc*`, quota/PDF.                                        | Medio. | Revisar handlers PMOC/export finais e decidir se PMOC real vira excecao documentada antes de CSS. |
| Registro                               | Header/campos, checklist, fotos e assinatura visual.                                                                              | Captura/modal de assinatura, salvamento/edicao, pos-save, PDF, WhatsApp, route guard, picker de equipamento.                            | `_ensureProgressBar()` e parte de hero legacy podem virar no-op removivel; confirmar antes por testes.                                                                                                                                                                           | `data-action`, `data-r-action`, `data-item`, `data-status`, `data-unit`, `data-item-id`, `data-after-save`.      | `registro-*`, `r-checklist*`, `photo-*`, `registro-sig-hint*`, modais.                  | Alto.  | Migrar rodape de acoes/painel pos-save visual, mantendo save/PDF/WhatsApp legados.                |
| Pricing/Conta/Privacidade/Landing/Auth | Ainda legado fora do escopo principal.                                                                                            | Render de pagina, modais, checkout/account/auth, landing.                                                                               | Sem inventario suficiente para apagar.                                                                                                                                                                                                                                           | `data-action` locais.                                                                                            | `pricing-*`, `conta-*`, `privacy-*`, landing/auth.                                      | Medio. | Decidir se entram no criterio de 100%; se sim, criar prep docs separados.                         |

## 5. Codigo legado removivel com seguranca baixa/media/alta

Concluido no PR de limpeza de 2026-05-01:

- `src/react/components/IntegrationProbe.jsx`, `src/react/entrypoints/integrationProbe.jsx` e `src/__tests__/reactIntegrationProbe.test.js` foram removidos; nao havia uso real de `#react-integration-root` em produto.
- O binding antigo em `src/ui/controller/routes.js` para `#clientes-busca` foi removido; Clientes usa `#cli-search-input` como contrato atual.
- `src/__tests__/reactCleanupContracts.test.js` cobre a ausencia do probe e do seletor antigo.
- `ensureAlertasShell()` foi removido de `src/ui/views/alertas.js`; `src/__tests__/alertasShellContracts.test.js` garante que o shell declara `#alertas-contextual` e `#lista-alertas`.
- `renderModeSegment()` e `renderFilterChips()` foram removidos de `src/ui/views/relatorio.js`; `src/__tests__/relatorioLegacyControls.test.js` garante que o adapter usa a ilha `relatorioControlsIsland` sem manter esses fallbacks manuais.
- O fallback manual de `_renderNextActionCard()` foi removido de `src/ui/views/dashboard.js`; `src/__tests__/dashboardLegacyNextAction.test.js` garante que o adapter delega a `dashboardNextActionIsland` sem escrever `#dash-next-title`, `#dash-next-sub` ou CTA manualmente.
- O fallback manual de `_renderLastServiceCard()` foi removido de `src/ui/views/dashboard.js`; `src/__tests__/dashboardLegacyLastService.test.js` garante que o adapter delega a `dashboardLastServiceIsland` sem escrever `#dash-last-title`, `#dash-last-sub` ou `#dash-last-desc` manualmente.
- O fallback manual de `_renderMonthView()` foi removido de `src/ui/views/dashboard.js`; `src/__tests__/dashboardLegacyMonth.test.js` garante que o adapter delega a `dashboardMonthSummaryIsland` sem escrever `#dash-month-*` manualmente.
- `#dash-hero` foi migrado para `src/react/entrypoints/dashboardHeroIsland.jsx`; `src/__tests__/dashboardLegacyHero.test.js` agora protege o contrato historico enquanto `src/__tests__/dashboardHeroIsland.test.jsx` cobre a ilha.
- `#dash-alerts-section`, `#dash-critical-section`, `#dash-criticos-section` e `#dash-recentes-section` foram protegidos por `src/__tests__/dashboardLegacyReadOnlyBlocks.test.js`, incluindo XSS nos cards de alerta mini.
- `#dash-alerts-section`, `#dash-critical-section`, `#dash-criticos-section` e `#dash-recentes-section` foram migrados para `src/react/entrypoints/dashboardReadOnlyBlocksIsland.jsx`; `src/__tests__/dashboardReadOnlyBlocksIsland.test.jsx` cobre lifecycle, contratos e XSS.
- `#dash-pro-ops-row` e o card `.dash__continue-card` de rascunho foram migrados para `src/react/entrypoints/dashboardProDraftIsland.jsx`; `src/__tests__/dashboardProDraftIsland.test.jsx` cobre lifecycle, contratos e XSS.
- Os fallbacks mortos `_renderProCards()` e `_renderContinueDraftCard()` foram removidos de `src/ui/views/dashboard.js`; `src/__tests__/dashboardLegacyProDraftContracts.test.js` garante que o adapter mantem a ilha React sem esses renderizadores manuais.
- `#dash-empty`, `#dash-onboarding` e `#dash-overflow-banner` foram migrados para `src/react/entrypoints/dashboardOnboardingIsland.jsx`; `src/__tests__/dashboardOnboardingIsland.test.jsx` cobre lifecycle, contratos e XSS, enquanto `src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js` protege o adapter/contrato historico.

Alta seguranca, apos teste pequeno:

- Nenhum item pendente nesta faixa apos a limpeza de Alertas.

Media seguranca, apos prova de root sempre presente e testes de lifecycle:

- Nenhum fallback DOM pendente para os blocos do Dashboard ja migrados para React.
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

## 7. Plano de PRs pequenos pos-migracao

A partir do fechamento visual, os PRs abaixo deixam de ser "migracao principal" e passam a ser hardening, isolamento ou limpeza. Fluxos externos como PDF, WhatsApp, assinatura, fotos, PMOC, storage/backend, charts e header global continuam fora do React ate decisao explicita por fatia.

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

- Status: concluido com `src/react/entrypoints/equipamentosHeaderIsland.jsx` montando em `#equip-hero` e usando portals para `#equip-filters` e `#equip-context-chip`.
- Escopo: migrou apenas hero, filtros e contexto, mantendo lista React, setor grid, detalhe, CRUD, fotos e modais legados.
- Testes atuais: `equipamentosHeaderIsland.test.jsx`, `equipamentosLegacyHeroFiltersContext.test.js`, `equipamentosReactListIsland.test.jsx`, `equipamentosLegacyRender.test.js`, `equipamentosRouteLifecycle.test.js` e E2E lifecycle.
- Risco: medio/alto.
- Criterio: lista flat segue React; setor grid/detalhe nao muda.

### PR 4: Dashboard secoes read-only restantes

- Status: concluido com `#dash-readonly-blocks-root`.
- Escopo: alertas mini, criticos e recentes em uma ilha read-only; empty/onboarding/overflow ficaram para `PR 4c`.
- Fora do escopo: charts, onboarding, overflow banner e header global naquela fatia.
- Testes: island, contrato do adapter e lifecycle E2E.
- Risco: medio.
- Criterio: charts/onboarding continuavam legados naquele PR.

### PR 4b: Dashboard cards Pro e rascunho

- Status: concluido com `#dash-pro-ops-row` / `#dash-pro-draft-root`.
- Escopo: `#dash-pro-ops-row`, `#dash-critical-alerts-*`, `#dash-risk-clients-*` e `.dash__continue-card`.
- Fora do escopo: plano/paywall real, checkout, charts, onboarding, overflow banner e header global naquela fatia.
- Testes: `dashboardProDraftIsland.test.jsx`, `dashboardLegacyProDraftContracts.test.js` e E2E lifecycle.
- Risco: medio, porque handlers de `continue-draft`, `discard-draft`, `data-nav="pricing"` e `data-nav="clientes"` seguem legados.
- Criterio: manter `data-action`, `data-nav`, `data-id` e `data-tier` enquanto plano/paywall/checkout continuam fora da ilha.

### PR 4c: Dashboard empty/onboarding/overflow

- Status: concluido com `#dash-onboarding` como root da ilha e portals para `#dash-empty` e `#dash-overflow-banner`.
- Escopo atual: `#dash-empty`, `#dash-onboarding`, checklist/install prompt de onboarding e `#dash-overflow-banner`.
- Fora do escopo: charts, header global, plano/paywall real e checkout.
- Testes: `dashboardOnboardingIsland.test.jsx` e `dashboardLegacyOnboardingEmptyOverflow.test.js`.
- Risco: medio, porque `OnboardingChecklist` ainda fornece modelo com storage/telemetria e `OverflowBanner` ainda abre modal one-shot no fluxo legado real.
- Criterio: charts/header continuam legados; handlers de `open-modal`, `onboarding-dismiss` e `open-upgrade` seguem por `data-action`.

### PR 5: Historico sheet mobile

- Status: sheet mobile mantido como legado deliberado e isolado em `src/ui/components/historicoFiltersSheetModel.js`.
- Escopo atual: contratos `#hist-filters-sheet-overlay`, `#hist-filters-sheet-title`, `#hfs-setor`, `#hfs-equip`, `#hfs-close`, `#hfs-reset`, `#hfs-apply`, classes `hist-filters-sheet*`, `data-tipo-id` e dados de setor/equipamento/tipo agora saem de helper puro.
- Fora do escopo: timeline, delete, fotos, assinatura e navegacao.
- Testes: `historicoFiltersSheetModel.test.js`, `historicoFiltersSheet.test.js`, `historicoFiltersLegacyRender.test.js`, `historicoFiltersIsland.test.jsx`, `historicoTimelineIsland.test.jsx` e E2E lifecycle.
- Risco: medio; migrar agora para React exigiria tratar overlay dinamico no `body`, foco/a11y e animacao de fechamento no mesmo PR.
- Criterio: filtros desktop/timeline seguem funcionando; callbacks `initial`, `onApply` e `onReset` continuam legados.

### PR 6: Relatorio PMOC/company slot e fallbacks finais

- Status: `#rel-company-pmoc-slot` mantido como legado deliberado e isolado em `src/ui/viewModels/relatorioCompanyPmocModel.js`.
- Decisao: nao migrar para React neste PR; o bloco ainda esta diretamente acoplado ao contexto Pro/PMOC do adapter e renderiza apenas contratos visuais estaticos. A migracao para uma ilha separada adicionaria novo lifecycle/root sem reduzir PMOC real, PDF, WhatsApp, quota ou assinatura.
- Escopo atual: contratos `#rel-company-pmoc-slot`, `.rel-company-pmoc*`, `data-action="open-pmoc-modal"` e `data-nav="clientes"` ficam protegidos por `src/__tests__/relatorioCompanyPmocContracts.test.js`.
- Fora do escopo: PMOC real, quota, PDF, WhatsApp e assinatura.
- Testes: `relatorioCompanyPmocContracts.test.js`, handlers PMOC/export legados e E2E relatorio.
- Risco: baixo/medio; visual simples ficou testado, mas PMOC real continua legado por design.
- Criterio: PMOC real continua legado; futura migracao so deve acontecer se houver ganho claro de lifecycle/limpeza.

### PR 7: Registro rodape visual e pos-save visual

- Status: reclassificado como hardening opcional, nao bloqueia o fechamento visual principal.
- Escopo possivel: migrar somente rodape visual de acoes e UI pos-save/CTAs, mantendo handlers de `save-registro`, `save-and-share-registro`, PDF e WhatsApp legados.
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

- Status: inventario inicial criado em `docs/migration/css-legacy-inventory.md`; nenhuma classe foi removida nesta etapa.
- Escopo: separar classes vivas por tela, classes suspeitas e classes dinamicas antes de remover blocos comprovadamente mortos em PRs pequenos.
- Ferramentas: `npm run lint:css:dead` existe como triagem, mas atualmente falha sem `purgecss` instalado e ainda depende de validacao manual porque gera falsos positivos com classes dinamicas.
- Testes: build, E2E das rotas afetadas e screenshots antes/depois.
- Risco: alto se feito em lote.
- Criterio: cada PR remove uma familia de classes com evidencia de uso zero.

### PR 10: Criterio final de limpeza pos-fechamento

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

- Status do congelamento: `src/assets/styles/components.css` foi formalmente congelado em 2026-05-01. A politica fica em `docs/migration/css-freeze-policy.md`; novas UIs React devem usar `src/react/components/ui` ou Tailwind `tw-*`.
- Nao remover CSS por grep simples: classes dinamicas como `equip-card--${tone}` e `rel-tipo--${tone}` geram falsos positivos.
- Usar `npm run lint:css:dead` como triagem, nao como prova final; o inventario de 2026-05-01 registrou que o script precisa de `purgecss` para rodar neste checkout.
- Mapa inicial por prefixo: `docs/migration/css-legacy-inventory.md`.
- Prefixos ja inventariados: `dash-*`, `equip-*`, `setor-*`, `eq-*`, `hist-*`, `timeline*`, `rel-*`, `registro-*`, `r-checklist*`, `cli-*`, `orc-*`, `alert-*`, `btn*`, `empty-state*`, `pro-*`, `upgrade-*` e `nudge-*`.
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

O proximo PR recomendado e criar as primeiras primitives de design system em `src/react/components/ui`: `Button` e `Badge`, sem aplicar em telas ainda.

Motivo: o congelamento de `components.css` impede crescimento do CSS legado, mas a reducao acelerada depende de componentes reutilizaveis antes de remover familias grandes. `Button` e `Badge` sao os menores blocos transversais e permitem preparar Orcamentos sem tocar em PDF, assinatura, WhatsApp, storage/backend, modais ou handlers.

Escopo recomendado: criar `Button.jsx`, `Badge.jsx`, `index.js` e testes focados em variantes, `data-*`, `aria-*`, `disabled` e `className`. Nao aplicar os componentes em telas e nao remover CSS nesse PR.
