# CoolTrackPro — Codebase Inventory (Etapa 1)

## Escopo e restrições desta etapa

- Diagnóstico somente (sem alteração funcional).
- Preservação explícita de handlers, `data-action`, `data-nav`, `id` e contratos de DOM.
- Inventário para orientar refatorações seguras em PRs pequenos.

## 1) Mapa geral da arquitetura

### 1.1 Entrypoints e bootstrap

- `src/app.js`: inicialização principal da aplicação web legada/híbrida.
- `src/ui/controller.js`: orquestração de rotas, eventos e handlers.
- `src/ui/shell.js`: montagem do shell (header/nav/sidebar/views/modais).
- Ilhas React em `src/react/entrypoints/*` para blocos incrementais dentro do app.

### 1.2 Estrutura principal por camadas

- **UI Shell / Templates**: `src/ui/shell/templates/*` e `src/ui/shell/*`.
- **Views legadas**: `src/ui/views/*` (dashboard, registro, historico, relatorio, equipamentos, clientes etc).
- **ViewModels / contratos**: `src/ui/viewModels/*`.
- **Handlers / delegação**: `src/ui/controller/handlers/*` + `src/core/events.js`.
- **Domínio puro**: `src/domain/*` (prioridade, risco, pdf, whatsapp, nameplate etc).
- **Core / infraestrutura**: `src/core/*` (router, auth, storage, supabase, telemetry, notificações).
- **Storage**: `src/core/storage/*` + wrappers em `src/core/storage.js`, `src/core/userStorage.js`.
- **React pages/components**: `src/react/pages/*`, `src/react/components/*`.
- **CSS**: `src/assets/styles/*` (base/layout/redesign/theme/components + parciais).
- **Testes**:
  - Unit/integration front-end: `src/__tests__/*`.
  - E2E: `e2e/specs/*`.
  - Banco/políticas: `supabase/tests/*.sql`.

## 2) Arquivos grandes (priorização por risco)

> Critério de tamanho: contagem de linhas local (`wc` via script Python).

| Arquivo                                     | Linhas | Responsabilidade                              | Risco          | Dependências conhecidas                             |
| ------------------------------------------- | -----: | --------------------------------------------- | -------------- | --------------------------------------------------- |
| `src/assets/styles/components.css`          |  22426 | CSS agregado legado (alto acoplamento visual) | **Alto**       | templates shell, views legadas, testes visuais      |
| `src/ui/views/equipamentos.js`              |   2751 | Render/fluxos de equipamentos                 | **Alto**       | router, handlers, storage, core/equipment rules     |
| `src/ui/views/registro.js`                  |   1754 | Fluxo de registro técnico                     | **Alto**       | viewModels registro, assinatura, fotos, pdf         |
| `src/ui/views/historico.js`                 |   1652 | Lista/timeline e filtros histórico            | **Alto**       | historicoViewModel, filtros, contratos de navegação |
| `src/ui/views/dashboard.js`                 |   1469 | Dashboard legado + blocos de estado           | **Alto**       | dashboardViewModel, charts, métricas                |
| `src/ui/components/authscreen.js`           |   1240 | Autenticação/entrada                          | **Médio-Alto** | core/auth, storage/session, shell init              |
| `src/ui/components/nameplateCapture.js`     |   1222 | Captura/análise de placa                      | **Médio-Alto** | domain/nameplate, limites de plano, upload          |
| `src/assets/styles/theme-premium.css`       |   1182 | Tema premium/upsell                           | **Médio**      | classes premium + paywall UI                        |
| `src/assets/styles/components/_pricing.css` |   1156 | Estilos pricing/paywall                       | **Médio**      | pricing view, clientes paywall                      |
| `src/ui/shell/templates/modals.js`          |   1154 | HTML de modais globais                        | **Alto**       | handlers globais, ids/data-action                   |
| `src/assets/styles/layout.css`              |   1144 | layout responsivo global                      | **Alto**       | todas as views                                      |
| `src/domain/pmoc/checklistTemplates.js`     |   1115 | templates de checklist PMOC                   | **Médio**      | registro/relatório PMOC/pdf                         |
| `src/assets/styles/redesign.css`            |   1055 | camada de redesign coexistente                | **Médio-Alto** | telas migradas + não migradas                       |
| `src/react/pages/ClientesPage.jsx`          |   1051 | tela clientes React                           | **Médio-Alto** | islands, viewModel clientes, contratos de shell     |

### Observação de risco

- **Alto**: qualquer alteração sem testes de contrato pode quebrar DOM legada, handlers delegados e smoke e2e.
- **Médio**: áreas mais encapsuláveis, porém com dependências indiretas (planos, storage, autenticação).
- **Baixo**: utilitários puros pequenos e módulos isolados (não priorizados nesta etapa).

## 3) Contratos críticos a não quebrar

### 3.1 Contratos DOM e delegação

- Atributos `data-action` e `data-nav` são pilares da delegação global (`src/core/events.js`) e templates de shell/views.
- IDs de navegação e atalhos (ex.: `nav-*`, `sidenav-*`, IDs de CTA em dashboard/header).
- Estrutura de modais em `src/ui/shell/templates/modals.js` (IDs usados por handlers e testes).

### 3.2 Rotas e navegação

- Rotas/controlador em `src/ui/controller/routes.js` e `src/core/router.js`.
- Contratos de header/nav/sidebar em `src/ui/shell/headerContracts.js` e templates.

### 3.3 Storage, schemas e estado

- Chaves/normalização/sync em `src/core/storage/constants.js`, `storageNormalizers.js`, `storageMigrations.js`.
- Contratos de dados em viewModels (`*Contracts.js`) e schemas implícitos usados em testes.

### 3.4 Eventos globais

- Delegação de click e ações centralizadas (`src/core/events.js`).
- Eventos de app/telemetria/pwa (`src/core/telemetry*.js`, `src/core/swUpdate.js`, `src/core/onlineStatus.js`).

### 3.5 CSS legado usado por JS/testes

- Classes alvo em testes de contrato e visual smoke (unit + e2e).
- Classe/estrutura do shell e views legadas devem ser tratadas como API pública interna.

## 4) Candidatos a código morto (sem remoção nesta etapa)

### Confirmado

- **Nenhum confirmado** sem análise de cobertura + referência cruzada completa.

### Provável

- Ícones em `public/icons-backup-pre-redesign/*`: forte indicativo de backup histórico (não confirmar sem validar manifest/build scripts).
- Parte de CSS em agregados grandes (`components.css`, `redesign.css`) potencialmente órfã em telas já migradas para React.

### Incerto

- Helpers paralelos em áreas de clientes/equipamentos (há múltiplos renderers/helpers; pode haver duplicação funcional intencional por migração incremental).
- Templates/modais legados que pareçam redundantes podem estar cobertos por testes de contrato e fluxos condicionais de plano.
- Módulos de compatibilidade React x legado podem parecer não usados por import estático, mas serem acionados por entrypoints dinâmicos.

## 5) Pontos de acoplamento principais

- `src/ui/controller.js` integra shell, views, handlers, router e estado global.
- `src/ui/views/*` grandes concentram regra de apresentação + coordenação de domínio/infra.
- `src/assets/styles/components.css` + `layout.css` impactam transversalmente quase todas as telas.
- Camada de migração React convive com legado, aumentando risco de regressão entre contratos visuais/DOM.

## 6) Sequência recomendada de PRs (refatoração segura)

1. **PR 1 — Inventário e contratos**: consolidar/expandir este diagnóstico com matriz de contratos por tela.
2. **PR 2 — Extração de helpers puros**: começar por funções sem efeito colateral em `domain` e helpers de views menores.
3. **PR 3 — Extração de renderizadores**: separar render de lógica de fluxo em views grandes (sem mudar contratos DOM).
4. **PR 4 — Consolidação de CSS duplicado**: reduzir redundância com prova via testes visuais/smoke.
5. **PR 5 — Remoção de código morto confirmado**: somente itens com comprovação objetiva (referências + cobertura + smoke).
6. **PR 6 — Reforço de regressão de contratos críticos**: testes focados em `data-action`, `data-nav`, ids, rotas e storage keys.

## 7) Riscos e mitigação

- **Risco alto**: quebra de contratos DOM em handlers delegados.
  - Mitigar: snapshot/contract tests por view + smoke e2e de navegação.
- **Risco alto**: regressão visual por CSS global.
  - Mitigar: testes visuais existentes + prova incremental por arquivo.
- **Risco médio**: inconsistência de estado offline/sync.
  - Mitigar: testes de storage integração e fluxos de autenticação/sync.

## 8) Próximos passos imediatos

- Congelar baseline de contratos críticos por tela (tabela por rota).
- Priorizar `equipamentos.js` e `registro.js` para futuras extrações internas em fatias pequenas.
- Planejar limpeza de CSS orientada por evidência (`scripts/dead-css-report.mjs` + testes visuais).

## 9) Matriz de contratos críticos por tela (PR 1.1)

| Tela (rota/view)                | Arquivo principal                                                     | Principais `data-nav`                          | Principais `data-action`                                                                                                                                   | IDs críticos (amostra)                                                                                                       | Modais relacionados                                                   | Testes existentes (amostra)                                                                                                                                                  | Risco          |
| ------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| dashboard (`inicio`)            | `src/ui/views/dashboard.js` + shell `src/ui/shell/templates/views.js` | `registro`, `historico`                        | `open-modal` (`modal-add-eq`)                                                                                                                              | `#dash`, `#dash-hero`, `#dash-hero-cta`, `#dash-kpis-root`, `#dash-next-action-card`                                         | `modal-add-eq`, `modal-score-info`                                    | `dashboardLegacyHero.test.js`, `dashboardLegacyKpis.test.js`, `dashboardLegacyChartsContracts.test.js`, `dashboardHeroIsland.test.jsx`, `dashboardKpisIsland.test.jsx`       | **Alto**       |
| equipamentos (`equipamentos`)   | `src/ui/views/equipamentos.js`                                        | `relatorio` (atalhos contextuais)              | `open-modal`, `open-setor-modal`, `open-setor`, `edit-equip`, `go-register-equip`, `toggle-eq-detail-menu`, `equip-quickfilter`                            | `#lista-equip`, `#eq-det-title`, `#eq-detail-menu-*`, `#eq-tech-sheet-*`                                                     | `modal-add-eq`, `modal-score-info`, modais de setor/contexto no shell | `equipamentosLegacyRender.test.js`, `equipamentosLegacySetorDetailHandlers.test.js`, `equipamentosLegacyPhotosNameplatePaywall.test.js`, `equipamentos-visual-smoke.spec.js` | **Alto**       |
| registro (`registro`)           | `src/ui/views/registro.js`                                            | (navegação indireta via shell/CTA pós-save)    | `save-registro`, `quick-service-template`                                                                                                                  | contratos de checklist por `data-item-id`, slots/roots de ilhas de header/checklist/fotos/assinatura                         | assinatura, fotos e fluxo de cadastro via `modal-add-eq`              | `registroLegacyChecklistRender.test.js`, `registroChecklistHandlers.test.js`, `registroPdfWhatsappLegacyContracts.test.js`, `registro-post-save.spec.js`                     | **Alto**       |
| historico (`historico`)         | `src/ui/views/historico.js`                                           | `relatorio`                                    | `hist-filter-equip` (via `data-hist-action`)                                                                                                               | `#hist-summary-content` e containers de timeline/filtros                                                                     | filtros mobile (sheet) + modais globais de shell                      | `historicoFiltersLegacyRender.test.js`, `historicoTimelineLegacyRender.test.js`, `historicoFiltersSheetIntegration.test.js`, `historico-functional-smoke.spec.js`            | **Alto**       |
| relatorio (`relatorio`)         | `src/ui/views/relatorio.js`                                           | navegação secundária dinâmica (`secondaryNav`) | `rel-toggle-advanced`, `rel-clear-filters`, `rel-view-signature`, ação primária dinâmica                                                                   | `#rel-equip` (select), slots hero/controls/cards                                                                             | assinatura e modais de exportação/ajuda do shell                      | `relatorioLegacyControls.test.js`, `relatorioCardsLegacyHandlers.test.js`, `relatorioCompanyPmocContracts.test.js`, `relatorio-visual-smoke.spec.js`                         | **Alto**       |
| clientes (`clientes`)           | `src/ui/views/clientes.js`                                            | `clientes` (entry por nav/sidebar)             | `data-cli-action` (menu/card actions por constantes)                                                                                                       | `#view-clientes` + ids dos cards/menu contextual                                                                             | `ClientesPaywallModal` + modais de cliente/PMOC                       | `clientesViewModel.test.js`, `clientesView.security.test.js`, `clientesRouteAccess.test.js`, `clientesReactIsland.test.jsx`                                                  | **Médio-Alto** |
| orçamentos (`orcamentos`)       | `src/ui/views/orcamentos.js`                                          | `orcamentos`                                   | handlers de orçamento ligados por delegação (assinatura, export, CRUD)                                                                                     | containers de listagem/editor de orçamento (contrato legado + ilha React)                                                    | `orcamentoModal`, `orcamentoSignaturePage`                            | `orcamentosView.security.test.js`, `orcamentosViewModel.test.js`, `orcamentosReactIsland.test.jsx`, `orcamentos-visual-smoke.spec.js`                                        | **Médio-Alto** |
| alertas (`alertas`)             | `src/ui/views/alertas.js`                                             | `alertas`                                      | ações de item/estado vazio (delegação via handlers globais)                                                                                                | `#sidenav-alerta-badge` (shell) + containers da view                                                                         | modais de detalhe/feedback relacionados a alertas                     | `alertasView.emptyState.test.js`, `alertasView.security.test.js`, `alertasShellContracts.test.js`, `alertasReactIsland.test.jsx`                                             | **Médio**      |
| pricing (`pricing`)             | `src/ui/views/pricing.js`                                             | `pricing`                                      | `manage-subscription`, `start-checkout`                                                                                                                    | `#pricing-title`, `#pricing-card-free`, `#pricing-card-plus`, `#pricing-card-pro`, `#btn-checkout-plus`, `#btn-checkout-pro` | checkout/portal (integração com funções Supabase/Stripe)              | `pricing.test.js`                                                                                                                                                            | **Médio**      |
| configuracoes (`configuracoes`) | `src/ui/views/configuracoes.js`                                       | `registro`, `clientes`                         | `go-orcamentos`, `go-alertas`, `open-profile`, `toggle-theme`, `help-open-tutorial`, `help-score-info`, `help-support`, `help-feedback`, `open-pmoc-modal` | `#cfg-title`, `#cfg-go-clientes`                                                                                             | depende de modais/help menu globais do shell/header                   | cobertura indireta em `shell.test.js`, `globalHeaderContracts.test.js`, `navigation-and-modal.spec.js`                                                                       | **Médio**      |

### Notas de confiança da matriz

- `data-nav` de topo e IDs de navegação foram confirmados em `src/ui/shell/templates/nav.js`, `sidebar.js` e `src/ui/controller/routes.js`.
- Em telas com ações dinâmicas (ex.: clientes/orçamentos/relatório), a matriz lista **contratos principais** e não exaustivos.
- Onde há coexistência legado + React islands, considerar os contratos de DOM como API pública interna até concluir testes de regressão específicos.

## 10) Matriz detalhada por subfluxo (PR 1.2)

> Escopo desta seção: fluxos de maior risco (equipamentos, registro, clientes, relatório, orçamentos), sem alteração funcional.

### 10.1 Equipamentos (`src/ui/views/equipamentos.js` + `equipmentHandlers.js`)

| Subfluxo              | Contratos críticos                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| criar                 | `data-action="save-equip"`, modal `#modal-add-eq`, botão `#eq-save-primary`, contexto opcional com `data-post-action`.               |
| editar                | `data-action="edit-equip"` + `data-id`; estado interno `_editingEquipId`; reuso do mesmo modal add/edit.                             |
| excluir               | `data-action="delete-equip"` + `data-id`, confirmação obrigatória (`CustomConfirm`) antes de `deleteEquip`.                          |
| abrir modal           | `data-action="open-modal" data-id="modal-add-eq"`, `open-setor-modal`, `open-setor`; contratos de `data-cliente-id`/`data-setor-id`. |
| salvar                | `saveEquip()` e `saveSetor()` via handlers; estados de CTA (`eq-save-primary/secondary/tertiary`).                                   |
| compartilhar/exportar | não é fluxo primário da tela; saída típica é navegação para `registro`/`relatorio` por `data-action` contextual.                     |
| navegar               | `data-nav="equipamentos"` (shell) + CTAs `go-register-equip` / `data-nav` secundário.                                                |
| estado vazio          | empty state em `#lista-equip`; CTA para abrir `modal-add-eq`; filtros rápidos (`equip-quickfilter`).                                 |
| paywall/limite        | gating em fotos/nameplate e clientes/setores pro-plan; dependências em testes de paywall e contratos legacy.                         |

### 10.2 Registro (`src/ui/views/registro.js` + `registroHandlers.js`)

| Subfluxo              | Contratos críticos                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| criar                 | entrada por rota `registro`; init por `initRegistro()`; formulário + checklist + fotos + assinatura montados por contratos legados/ilhas. |
| editar                | `EDITING_KEY` em `sessionStorage`; `loadRegistroForEdit`; guard de saída com confirmação de descarte.                                     |
| excluir               | exclusão de registro via `data-action="delete-reg"` com confirmação em handler.                                                           |
| abrir modal           | assinatura (hint/actions), modais de confirmação de descarte e fluxos de contexto/equipamento.                                            |
| salvar                | `data-action="save-registro"`; persistência checklist (`data-item-id`) + assinatura + fotos; caminho `save-and-share-registro`.           |
| compartilhar/exportar | PDF/WhatsApp via `reportExportHandlers` pós-save (inclui gating/telemetria e toasts).                                                     |
| navegar               | navegação por shell + CTAs pós-save; risco de perder edição se quebrar guard/estado de edição.                                            |
| estado vazio          | hero com `data-state` (`empty/partial/complete`) e fallbacks de checklist/fotos.                                                          |
| paywall/limite        | limites por plano em export/recursos ligados a assinatura/fotos, validados por handlers e testes de contrato.                             |

### 10.3 Clientes (`src/ui/views/clientes.js` + `clienteHandlers.js`)

| Subfluxo              | Contratos críticos                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| criar                 | `data-action="open-cliente-modal" data-mode="create"`; suporte a `data-after-save="select-in-eq-modal"`.        |
| editar                | `data-action="edit-cliente" data-id`; abertura por menu de card (`cliente-card-menu`) e por card action direta. |
| excluir               | `data-action="delete-cliente" data-id` + confirmação e `deleteCliente`.                                         |
| abrir modal           | modal de cliente + menu kebab com `data-id` e fechamento por clique externo.                                    |
| salvar                | persistência no modal de cliente; reidratação de lista e possível callback para modal de equipamento.           |
| compartilhar/exportar | não há export principal na tela; saída comum é navegar para serviços/relatórios do cliente.                     |
| navegar               | rota `clientes` + integração com filtros cruzados (ex.: cliente -> histórico).                                  |
| estado vazio          | renderizadores de empty state, paginação e filtros devem manter ids/classes públicos.                           |
| paywall/limite        | gate de acesso em `routes.js` (`resolveClientesAccess` + `ClientesPaywallModal`).                               |

### 10.4 Relatório (`src/ui/views/relatorio.js` + `reportExportHandlers.js`)

| Subfluxo              | Contratos críticos                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| criar                 | não cria entidade própria; monta visão agregada por filtros (`#rel-equip` etc.).                           |
| editar                | aplica/limpa filtros (`rel-clear-filters`, `rel-toggle-advanced`) e expansão de cards.                     |
| excluir               | não aplicável diretamente (sem delete primário na tela).                                                   |
| abrir modal           | preview PDF (`#modal-pdf-preview`), viewer de assinatura (`rel-view-signature`) e modais de quota/confirm. |
| salvar                | não há save de entidade; há commit de consumo/quota em export flows quando aplicável.                      |
| compartilhar/exportar | export PDF/WhatsApp: `exportPdfFlow`/`shareWhatsAppFlow`, quota e mensagens por plano.                     |
| navegar               | botões secundários por `data-nav` dinâmico (`secondaryNav`) + retorno entre views.                         |
| estado vazio          | estado sem dados depende de filtros e cards colapsáveis; contratos de placeholders devem permanecer.       |
| paywall/limite        | regras de quota mensal e plano nos handlers (`buildPdfLimitMessage`, `hasReachedMonthlyLimit`).            |

### 10.5 Orçamentos (`src/ui/views/orcamentos.js` + `orcamentoHandlers.js`)

| Subfluxo              | Contratos críticos                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| criar                 | `data-action` de abrir modal com `data-mode="create"`; persistência via fluxo do modal.                          |
| editar                | `data-mode="edit" data-id`; reuso do modal com hidratação do orçamento alvo.                                     |
| excluir               | `deleteOrcamentoFlow(id)` com confirmação (`CustomConfirm`) antes de remover.                                    |
| abrir modal           | modal de orçamento e modal/página de assinatura (`orcamentoSignaturePage`).                                      |
| salvar                | salvar rascunho/aprovação/assinatura conforme status; contratos de status e token de assinatura.                 |
| compartilhar/exportar | gerar PDF, baixar PDF, compartilhar WhatsApp, enviar para assinatura digital (`share_token`).                    |
| navegar               | rota `orcamentos`, ações de card para abrir/editar/status; integração com onboarding step de PDF.                |
| estado vazio          | empty state da listagem precisa manter CTA de criação e classes públicas testadas.                               |
| paywall/limite        | disponível em todos os planos (Free com limite mensal de uso específico do produto), sem bloqueio total da rota. |

### 10.6 Observações de risco para refatoração

- Maior risco imediato: fluxos que combinam **delegação global por `data-action`** + **modal compartilhado** + **estado de edição** (equipamentos/registro/orçamentos).
- Risco médio-alto: fluxos com gating de plano/quota em runtime (clientes/relatório/orçamentos).
- Recomendação antes de refatorar: criar matriz de testes de regressão por subfluxo (happy path + bloqueios de plano + estado vazio + navegação cruzada).
