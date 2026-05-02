# CSS Legacy Inventory

Data da analise: 2026-05-01.

## Objetivo

Inventariar o CSS legado por prefixo depois do fechamento da migracao visual principal React + Tailwind. Este documento nao autoriza remocao direta de CSS. Ele separa classes claramente vivas, classes suspeitas, classes dinamicas e familias que precisam de screenshot/E2E antes de qualquer limpeza.

## Metodo

- Arquivos CSS listados com `git ls-files "src/assets/styles/**"`.
- Classes extraidas por seletor `.classe` em arquivos CSS.
- Uso cruzado por busca textual em arquivos versionados fora de `src/assets/styles`.
- Grupos verificados: `src/react`, `src/ui/views`, `src/ui/components`, `src/ui/shell/templates`, `src/ui/viewModels/*Contracts.js`, `src/__tests__`, `src/tests`, `e2e` e `docs`.
- `npm run lint:css:dead` foi testado como triagem auxiliar, mas falhou porque `purgecss` nao esta instalado neste checkout (`ERR_MODULE_NOT_FOUND`). A conclusao abaixo usa inventario local e nao depende desse script.

Limitacoes conhecidas:

- Busca textual nao prova obsolescencia quando a classe e montada por template string, `classList`, estado de componente, dados vindos de contrato ou HTML de modal.
- Classes usadas apenas por testes ainda podem representar contrato publico preservado.
- Classes em `components.css` podem ter side effects por seletor composto, responsivo, pseudo-classe ou media query.

## Arquivos CSS principais

| Arquivo                                                                                       | Classes distintas aproximadas | Observacao                                                           |
| --------------------------------------------------------------------------------------------- | ----------------------------: | -------------------------------------------------------------------- |
| `src/assets/styles/components.css`                                                            |                          1972 | Arquivo mais critico; 21130 linhas. Nao remover em lote.             |
| `src/assets/styles/theme-premium.css`                                                         |                           135 | Tema/plano/status; risco alto sem screenshot.                        |
| `src/assets/styles/desktop-fonts.css`                                                         |                           152 | Fontes/landing/shell; fora do escopo de limpeza por prefixo de tela. |
| `src/assets/styles/layout.css`                                                                |                            77 | Layout global e shell.                                               |
| `src/assets/styles/redesign.css`                                                              |                            64 | UI global/auth/redesign.                                             |
| `src/assets/styles/ux-polish.css`                                                             |                            53 | Ajustes transversais.                                                |
| `src/assets/styles/components/_setor-modal.css`                                               |                            78 | Modal legado de setores.                                             |
| `src/assets/styles/components/_setor-card.css`                                                |                            71 | Setores legados de Equipamentos.                                     |
| `src/assets/styles/components/_pmoc.css`                                                      |                            59 | PMOC legado deliberado.                                              |
| `src/assets/styles/components/_clientes.css`                                                  |                            48 | Clientes React preserva `cli-*`.                                     |
| `src/assets/styles/components/_orcamento-modal.css`                                           |                            29 | Modal/fluxo legado de orcamentos.                                    |
| `src/assets/styles/components/_checklist.css`                                                 |                            25 | Checklist do Registro ja React, mas preserva contratos.              |
| `src/assets/styles/components/_equip-hero.css`                                                |                            24 | Header/filtros de Equipamentos ja React, classes preservadas.        |
| Demais parciais (`_pricing`, `_tour`, `_push-optin`, `_install-app`, `_onboarding-checklist`) |                         8-120 | Fora do primeiro PR de remocao; validar por rota/feature.            |

## Resumo por prefixo

`Somente CSS` significa "nao encontrado por busca textual fora dos CSS". Nao significa seguro para remover.

| Prefixo                         | Classes CSS | Somente CSS | React | Views/adapters | Components | Shell | Contracts | Testes/E2E | Classificacao                                                                 |
| ------------------------------- | ----------: | ----------: | ----: | -------------: | ---------: | ----: | --------: | ---------: | ----------------------------------------------------------------------------- |
| `dash-*`                        |          80 |          33 |    37 |              3 |          1 |    37 |        41 |         42 | Vivo; suspeitas em subfamilias antigas do Dashboard.                          |
| `equip-*`                       |         201 |          84 |    94 |             77 |          2 |    31 |        20 |         32 | Vivo; alto risco por lista React, header React e legado de detalhe/setores.   |
| `setor-*`                       |         172 |          41 |     0 |             69 |          1 |    68 |         4 |         35 | Vivo como legado deliberado de setores/modal.                                 |
| `eq-*`                          |         216 |          82 |     0 |             79 |         22 |    44 |         0 |          9 | Vivo como legado de detalhe, fotos, nameplate, modais.                        |
| `hist-*`                        |         143 |          27 |    49 |             42 |         36 |    18 |        18 |         26 | Vivo; inclui filtros React e sheet mobile legado.                             |
| `timeline*`                     |          39 |          19 |    19 |              2 |          3 |     1 |         7 |          7 | Vivo; varios modificadores parecem dinamicos.                                 |
| `rel-*`                         |         147 |          25 |   115 |             11 |          0 |    30 |        51 |         52 | Vivo; Relatorio React preserva muitos contratos.                              |
| `registro-*`                    |         133 |          28 |    68 |             14 |         20 |    82 |        16 |         19 | Vivo; Registro mistura ilhas e fluxos legados.                                |
| `r-checklist*`                  |          19 |           3 |    15 |              1 |          0 |     1 |         6 |         12 | Vivo; tres status sao candidatos dinamicos.                                   |
| `cli-*`                         |         112 |          16 |    88 |             90 |          0 |     0 |         4 |         18 | Vivo; Clientes React + adapter ainda compartilham contratos.                  |
| `orc-*`                         |          49 |           6 |    32 |              0 |         11 |     0 |         0 |          9 | Vivo; `orc-status-pill--*` removido, `orc-timeline*` provado morto candidato. |
| `alert-*`                       |          19 |           0 |     8 |             19 |          0 |     0 |         1 |          2 | Claramente vivo.                                                              |
| `btn*`                          |          18 |           0 |     9 |             10 |          9 |    11 |         3 |          5 | Global; primeira microfamilia morta removida com prova.                       |
| `empty-state*`                  |           5 |           0 |     5 |              0 |          5 |     0 |         5 |          2 | Claramente vivo.                                                              |
| `pro-*`, `upgrade-*`, `nudge-*` |           8 |           0 |     2 |              6 |          5 |     2 |         0 |          0 | Claramente vivo; ligado a plano/paywall.                                      |

## Classes claramente vivas

- `alert-*`: usado por `AlertasPage.jsx`, `DashboardReadOnlyBlocks.jsx`, adapter legado de dashboard e testes.
- `empty-state*`: usado por React, `emptyState.js` e contratos do Dashboard.
- `pro-badge*` e `upgrade-nudge-card*`: usados por Relatorio, PMOC, upgrade nudge e Dashboard legado.
- `cli-*`: usado por `ClientesPage.jsx`, renderers legados de Clientes, contratos e testes.
- `rel-*`: usado por `RelatorioHero.jsx`, `RelatorioControls.jsx`, `RelatorioCards.jsx`, shell e contratos.
- `registro-*`, `r-checklist*`, `photo-thumb*`, `registro-sig-hint*`: usados pelas ilhas de Registro e fluxos legados de fotos/assinatura/salvamento.
- `equip-*`: usado por `EquipamentosHeader.jsx`, `EquipamentosListPage.jsx`, adapters de Equipamentos, shell e testes.
- `setor-*` e `eq-*`: usados por setores, detalhe/modal, fotos, nameplate e modais legados de Equipamentos.
- `hist-*` e `timeline*`: usados pelas ilhas de Historico, sheet mobile legado e testes de timeline/filtros.
- `orc-*`: usado por `OrcamentosPage.jsx` e componentes/modais de orcamento.
- `btn*`: classe global presente em React, shell, modais e componentes.

## Familias suspeitas por prefixo

Estas familias nao apareceram por busca textual fora dos CSS. Ainda precisam de verificacao manual, porque muitas podem ser variantes dinamicas.

### `dash-*`

Suspeitas: `dash-empty-shell*`, `dash-section*`, `dash-state-box*`, `dash__hero-orb*`, `dash__hero-pill*`, `dash__last-compact*`, `dash__quick-status*`.

Risco: medio. Dashboard tem varias ilhas React, mas shell e contratos ainda preservam containers; remover sem screenshot pode quebrar estados vazios, charts ou header.

### `equip-*`

Suspeitas: modificadores de card/status/risco como `equip-card--danger`, `equip-card__status--ok`, `equip-card__risk-chip--alto`, `equip-card__type-icon--fallback-t*`, `equip-filter--cyan`, `equip-hero-meta*`.

Risco: alto. Parte pode ser legado morto da lista antiga, mas setores/detalhe continuam usando renderers compartilhados e variantes podem vir de dados.

### `setor-*`

Suspeitas: `setor-card__health-fill--*`, `setor-card__status--*`, `setor-card__tone-pill--*`, `setor-color-btn*`, `setor-modal__input--error`.

Risco: alto. Setores e modal ainda sao legado deliberado; classes podem ser acionadas por validacao, drag/drop ou estado visual.

### `eq-*`

Suspeitas: `eq-detail-avatar*`, `eq-detail-gallery*`, `eq-detail-hero--*`, `eq-modal-health*`, `eq-risk-panel--*`, `eq-score-ring__*`.

Risco: alto. Detalhe, fotos, nameplate, CRUD e modais continuam legados.

### `hist-*` e `timeline*`

Suspeitas: `hist-pill--*`, `hist-quickfilter--*`, `hist-plan-limit-banner*`, `timeline__dot--*`, `timeline__item--*`, `timeline__saved-badge`.

Risco: medio. Timeline e filtros sao React, mas sheet mobile, delete, fotos e assinatura ainda sao legados; varios tons sao dinamicos.

Microfamilia provada em `docs/migration/css-hist-plan-limit-banner-proof.md`: `hist-plan-limit-banner*`.

Classificacao: `hist-plan-limit-banner`, `hist-plan-limit-banner__ic`, `hist-plan-limit-banner__icon`, `hist-plan-limit-banner__text`, `hist-plan-limit-banner__link` e `hist-plan-limit-banner__link:hover` estao mortos candidatos a remocao. As buscas encontraram apenas definicoes em `src/assets/styles/components.css` e docs; `HistoricoTimeline.jsx`, `HistoricoFilters.jsx`, `historicoViewModel.js`, `historicoFiltersSheet.js`, testes e E2E nao montam essa familia.

Risco: baixo se a remocao futura for limitada aos seletores `hist-plan-limit-banner*`. Nao remover `hist-summary-card__upsell-link`, `data-hist-action="hist-pricing-link"`, `hist-*` generico, `timeline*`, sheet mobile, assinatura viewer ou handlers de fotos/delete/PDF/navegacao.

### `rel-*`

Suspeitas: `rel-status--*`, `rel-tipo-icon--*`, `rel-record__prox-badge--*`, `rel-toolbar__btn-*`.

Risco: medio. Relatorio ainda tem PDF, WhatsApp, PMOC, quota e assinatura legados; cards React podem montar variantes por dados.

### `registro-*` e `r-checklist*`

Suspeitas: `registro-bloco--collapsible`, `registro-quick-*`, `registro-hero__orb*`, `r-checklist__status--ok|fail|na`.

Risco: medio/alto. Registro ainda preserva contratos de fluxos legados e usa status tri-state.

### `cli-*`

Suspeitas: `cli-card__alert--*`, `cli-card__icon--*`, `cli-kpi__sub--*`, `cli-pag__nav`.

Risco: medio. Clientes e PMOC usam dados dinamicos e testes de contrato.

### `orc-*`

Microfamilia provada em `docs/migration/css-orc-timeline-proof.md`: `orc-timeline*`.

Classificacao: `orc-timeline`, `orc-timeline__item`, `orc-timeline__dot`, `orc-timeline__label`, `orc-timeline__date` e o seletor composto `.orc-timeline__item.is-done .orc-timeline__dot` estao mortos candidatos a remocao. As buscas encontraram apenas definicoes em `src/assets/styles/components.css` e docs; `OrcamentosPage.jsx`, `orcamentosViewModel.js`, modal, assinatura, handlers, testes e E2E nao montam essa familia.

Risco: baixo se a remocao futura for limitada aos seletores `orc-timeline*`. Nao remover `timeline*` generico do Historico, `equip-card__timeline-*` de Equipamentos ou `is-done` transversal.

Microfamilia removida com prova em `docs/migration/css-orc-status-pill-proof.md`: `orc-status-pill--*`.

Classificacao: as seis variantes de classe `orc-status-pill--enviado`, `orc-status-pill--aprovado`, `orc-status-pill--visualizado`, `orc-status-pill--rascunho`, `orc-status-pill--recusado` e `orc-status-pill--expirado` foram removidas de `src/assets/styles/redesign.css`. O React atual usa `.orc-status-pill` base com estilos inline vindos de `ORCAMENTO_STATUS_META`, e nao monta `orc-status-pill--*`.

Risco residual: baixo. A remocao foi cirurgica e preservou os seletores `[data-status='...'] .orc-status-pill`; a classe base `.orc-status-pill` continua viva.

### `btn*`

Microfamilia removida com prova em `docs/migration/css-btn-obsolescence-proof.md`: `btn--full`, `btn--spaced-bottom`, `btn-ghost--report`.

Classificacao: removidas de `src/assets/styles/components.css` em PR pequeno. As mencoes restantes devem permanecer apenas como historico/prova em docs.

## Classes dinamicas que nao podem ser removidas por grep simples

- Modificadores por template: `alert-card--${tone}`, `eq-context-picker--${kind}`, `status-indicator--${tone}`, `app-sidebar__sync-dot--${dotVariant}`, `share-success-toast__action--${destination}`.
- Modificadores por `classList`: `photo-thumb--pending`, `photo-thumb--cover`, `eq-detail-cover--loaded`, `eq-detail-cover--fallback`, `equip-photo-block--locked`, `setor-modal__swatch--selected`, `timeline__item--saved`.
- Estados globais: `is-open`, `is-active`, `is-visible`, `is-loading`, `is-busy`, `is-focus-target`, `hidden`, `active`.
- Tons/status por dados: `hist-pill--*`, `rel-status--*`, `r-checklist__status--*`, `equip-card__status--*`, `setor-card__status--*`.
- Excecao provada como morta candidata: `hist-plan-limit-banner*` nao e gerado por React, viewModel, sheet mobile, adapter, testes ou E2E atuais de Historico.
- Excecao ja removida com prova: `orc-status-pill--*` nao e gerado por dados no DOM atual; Orcamentos usa `.orc-status-pill` base com `statusMeta` inline.
- Excecao provada como morta candidata: `orc-timeline*` nao e gerado por React, viewModel, modal, assinatura, handlers ou testes atuais de Orcamentos.
- Classes de plano/paywall: `upgrade-*`, `pro-badge*`, `usage-meter*`, `pricing-*`, `nameplate-cta[data-state]`.

## Classes usadas por ilhas React como contrato

| Area         | Classes/familias preservadas por React                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alertas      | `alert-card*`, `empty-state*`, `btn*`.                                                                                                                                 |
| Clientes     | `cli-*`, `empty-state*`, `btn*`.                                                                                                                                       |
| Equipamentos | `equip-hero*`, `equip-filter*`, `equip-search-row`, `equip-view-toggle*`, `equip-card*`, `empty-state*`.                                                               |
| Dashboard    | `dash__hero*`, `dash__kpi*`, `dash__card*`, `dash__section*`, `dash-alertas-list`, `dash-criticos-list`, `dash-recentes-grid`, `dash__continue-card*`, `empty-state*`. |
| Historico    | `hist-*`, `timeline*`, `empty-state*`.                                                                                                                                 |
| Relatorio    | `rel-hero*`, `rel-chip*`, `rel-record*`, `rel-empty*`, `rel-export-dd*`, `pro-badge*`.                                                                                 |
| Registro     | `registro-*`, `r-checklist*`, `photo-thumb*`, `registro-sig-hint*`.                                                                                                    |
| Orcamentos   | `orc-*`, `btn*`, modal/assinatura compartilhados.                                                                                                                      |

## Classes usadas por shell, adapters, handlers e testes

- Shell: `src/ui/shell/templates/views.js`, `modals.js` e `header.js` ainda declaram containers e classes publicas que as ilhas montam ou os handlers consultam.
- Adapters/views: `equipamentos.js`, `dashboard.js`, `historico.js`, `registro.js`, `relatorio.js` e renderers por pasta ainda emitem classes legadas para fluxos deliberados.
- Components legados: `equipmentPhotos.js`, `nameplateCapture.js`, `historicoFiltersSheet.js`, `overflowBanner.js`, `upgradeNudge.js`, `pmocModal.js`, `signature-*` e `registroEquipPicker.js` usam classes via DOM imperativo.
- Tests/E2E: muitos testes verificam classes como contrato (`dashboard*Island`, `equipamentos*`, `registro*`, `relatorio*`, `clientesReactIsland`, `react-islands-lifecycle`). Remover CSS sem ajustar contrato/teste pode esconder regressao visual.

## Classes que exigem screenshot/E2E antes de remocao

- Qualquer familia `equip-*`, `setor-*` ou `eq-*`, porque Equipamentos ainda tem setores, detalhe, fotos, nameplate, CRUD e paywall legados.
- Qualquer familia `registro-*`, `r-checklist*`, `photo-*` ou assinatura, porque salvamento/PDF/WhatsApp/assinatura real continuam legados.
- Qualquer familia `rel-*`, `pmoc*`, quota ou export, porque Relatorio ainda tem PMOC, PDF, WhatsApp e assinatura legados.
- `dash-*` ligada a charts/header/empty/onboarding, porque charts e header global seguem legados.
- `btn*`, `modal*`, `is-*`, `hidden`, `active`, `toast*`, `skeleton*`, porque sao transversais.

## Nao remover ainda

- `components.css` inteiro ou blocos grandes sem recorte por familia.
- Classes com modificadores de status/tono, mesmo quando parecem nao referenciadas textualmente.
- Classes usadas em `src/ui/viewModels/*Contracts.js`, `src/ui/shell/templates/*`, testes ou E2E.
- Classes de fluxos externos: fotos, nameplate, assinatura, PMOC, PDF/WhatsApp, quota, paywall, checkout, storage.
- Classes de modais globais, header, auth, landing, pricing e conta ate haver inventario proprio dessas telas.

## Proxima prova recomendada

Antes de qualquer nova prova, ha uma microfamilia pequena ja provada como candidata:

- `hist-plan-limit-banner*`

Escopo recomendado:

1. Remover apenas os seletores `hist-plan-limit-banner*` de `src/assets/styles/components.css`.
2. Preservar `hist-summary-card__upsell-link`, `data-hist-action="hist-pricing-link"`, `hist-*` generico, `timeline*`, sheet mobile, assinatura viewer e handlers de fotos/delete/PDF/navegacao.
3. Rodar smoke visual/E2E de Historico com estado vazio, registros e CTA atual de upsell/pricing do summary card, se aparecer.
4. Manter `npm run lint:css:dead` fora do caminho critico enquanto `purgecss` nao estiver disponivel no projeto.

Nao avancar a proxima remocao por `equip-*`, `eq-*`, `setor-*`, `registro-*`, `rel-*` ou `dash-*` sem prova propria; essas familias sao maiores, tem classes dinamicas e ainda compartilham contratos entre React e legado deliberado.
