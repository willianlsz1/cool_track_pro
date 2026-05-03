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

## Atualizacao PR 1 - Auditoria React/Tailwind cleanup (2026-05-03)

Esta atualizacao executa o PR 1 do plano `docs/migration/css-cleanup-react-tailwind-plan.md`.
O escopo foi somente inventario e documentacao: nenhum CSS, JSX, handler, rota, storage, regra de negocio ou visual foi alterado.

### Arquivos CSS auditados

| Arquivo                                     | Tipo atual                             | Responsabilidade atual                                                                                        | Areas afetadas                                                                                                                | Riscos principais                                                                                   | Classificacao                                                                          |
| ------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/assets/styles/tokens.css`              | Global/tokens                          | Fonte de tokens internos, aliases de compatibilidade e tokens semanticos.                                     | Todo o app autenticado e compatibilidade com CSS antigo.                                                                      | Alterar valores muda visual transversalmente; nao deve receber seletor de tela.                     | Manter.                                                                                |
| `src/assets/styles/layout.css`              | Layout global                          | Shell autenticado, header, sidebar, grid e responsividade base.                                               | Shell, sidebar, topbar, navegacao e conteudo principal.                                                                       | Contratos de navegacao, mobile menu, sticky/scroll e `data-nav`.                                    | Manter e consolidar.                                                                   |
| `src/assets/styles/components.css`          | Componentes legados/globais            | Maior arquivo de UI legado; botoes, cards, modais, views imperativas e varios fluxos antigos.                 | Dashboard, Clientes, Equipamentos, Historico, Relatorios, Alertas, Orcamentos, Registro, modais, paywall, PMOC, PDF/WhatsApp. | Alto acoplamento por cascata, classes dinamicas e contratos de testes; nao remover em lote.         | Consolidar em etapas.                                                                  |
| `src/assets/styles/redesign.css`            | Override global tardio/compatibilidade | Camada acumulada de refinamento visual interno por PRs.                                                       | App interno autenticado inteiro, com blocos por tela e controles compartilhados.                                              | Carrega depois de tokens/layout/components; muitos `!important`; alta chance de efeitos colaterais. | Reduzir, migrar e documentar excecoes.                                                 |
| `src/assets/styles/clientes-premium.css`    | Scoped/ponte visual                    | Polish visual de Clientes sobre contratos `cli-*`.                                                            | Clientes, filtros, KPIs, cards e estados de Clientes.                                                                         | Pode mascarar regras antigas de `components.css`; risco em PMOC/status/data-actions.                | Migrar para React/Tailwind quando Clientes migrar para componentes base.               |
| `src/assets/styles/internal-top-polish.css` | Scoped/override restrito               | Top polish de Relatorios e Historico criado para evitar mais regras soltas em `redesign.css`.                 | Topos, action bars, filtros, tabs e chips de Relatorios/Historico.                                                            | Carrega depois de `clientes-premium.css`; depende de contratos atuais de filtros e relatorio.       | Manter temporariamente; migrar para `PageHeader`, `ActionBar`, `Tabs` e filtros React. |
| `src/assets/styles/base.css`                | Global/base                            | Reset/base visual e utilitarios iniciais.                                                                     | App inteiro.                                                                                                                  | Baixo risco relativo, mas qualquer mudanca afeta todos os layouts.                                  | Manter.                                                                                |
| `src/assets/styles/desktop-fonts.css`       | Global/support                         | Ajustes de fonte/desktop e alguns legados historicos.                                                         | Shell, historico e areas antigas que ainda dependem da folha.                                                                 | Comentarios antigos e possiveis regras residuais; precisa prova antes de remover.                   | Consolidar depois de inventario especifico.                                            |
| `src/assets/styles/theme-premium.css`       | Global/theme legado                    | Tema premium/plano/status anterior com tokens e compatibilidade.                                              | Shell, planos, badges, status e algumas views legadas.                                                                        | Pode conter tokens antigos ainda vivos por alias; alto risco visual sem screenshot.                 | Consolidar com tokens/layout.                                                          |
| `src/assets/styles/ux-polish.css`           | Global/polish                          | Ajustes transversais de UX, foco e pequenos refinamentos.                                                     | Multiplas telas.                                                                                                              | Seletores amplos podem conflitar com `redesign.css`.                                                | Consolidar apos componentes base.                                                      |
| `src/assets/styles/components/_*.css`       | Scoped legado por feature              | Parciais de checklist, clientes, equipamentos, setor, PMOC, pricing, tour, push/install e modal de orcamento. | Fluxos especificos, muitos ainda imperativos.                                                                                 | Classes dinamicas, modais legados, PMOC, fotos, assinatura, setor e paywall.                        | Manter temporariamente; migrar por tela/feature.                                       |
| `src/react/styles/tailwind.css`             | Tailwind entrypoint                    | Entrada de Tailwind/utilities para React.                                                                     | Landing e ilhas React conforme build.                                                                                         | Tailwind nao substitui tokens globais; precisa componentes base para reduzir CSS global.            | Manter.                                                                                |

### Observacoes de carga e cascata

- `index.html` carrega, nesta ordem: `base.css`, `components.css`, `layout.css`, `desktop-fonts.css`, `theme-premium.css`, `ux-polish.css`, `tokens.css`, `redesign.css`, `clientes-premium.css`, `internal-top-polish.css`.
- `tokens.css` entra depois dos temas antigos para sobrescrever variaveis, mas `redesign.css`, `clientes-premium.css` e `internal-top-polish.css` ainda vencem muitas regras por ordem de carga e `!important`.
- `redesign.css` e uma camada tardia de compatibilidade. O destino desejado e reduzir o arquivo para excecoes documentadas e mover visual especifico para componentes React/Tailwind ou CSS scoped com criterio de remocao.

### Blocos criticos em `redesign.css`

| Bloco / area                                                                                                         | Estado atual                                                                                 | Classificacao           | Destino sugerido                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| Variaveis legadas locais e ajustes iniciais de Orcamentos (`.orc-kpi`, `.orc-status-pill`, `.orc-chip`, `.orc-card`) | Ainda fornece compatibilidade visual de Orcamentos e status.                                 | Consolidar/migrar.      | `OrcamentosPage` + `Card`, `StatusPill`, `Badge` React/Tailwind.                                 |
| Botoes globais (`.btn--primary`, `.btn--outline`, `.btn--ghost`)                                                     | Padroniza operacao azul e secundarios escuros.                                               | Migrar gradualmente.    | `Button` base; sobras em `components.css` para views imperativas.                                |
| Body, foco e scrollbar                                                                                               | Ajuste transversal do app autenticado.                                                       | Manter/consolidar.      | `layout.css` ou tokens globais de foco/scroll.                                                   |
| Sidebar, locks, badges e pill de plano                                                                               | Mistura spacing, item ativo, lock e tier pill.                                               | Consolidar.             | `layout.css` e componentes de shell; manter apenas contratos dinamicos.                          |
| Historico pills e quickfilters                                                                                       | Padroniza status/tabs do Historico.                                                          | Migrar.                 | `HistoricoFilters`, `Tabs`, `StatusPill` e `Chip`.                                               |
| Dashboard quick/legacy e PR 4                                                                                        | Refresca Dashboard real e onboarding.                                                        | Migrar.                 | `Dashboard*` React pages usando `Card`, `Button`, `StatusPill`.                                  |
| Mockup/internal shell alignment antigo                                                                               | Ajustes transversais de app/header/cards/modal.                                              | Consolidar com cuidado. | Separar shell em `layout.css`, controles em componentes base, modais em `Modal`.                 |
| PR 3 Shared controls                                                                                                 | Botoes, inputs, selects, cards, tabelas, empty states e modais compartilhados.               | Migrar/consolidar.      | `Button`, `Input`, `Select`, `Card`, `Table`, `EmptyState`, `Modal`.                             |
| PR 5 Equipamentos                                                                                                    | Paleta escura de Equipamentos, cards, filtros, setores e detalhe.                            | Migrar.                 | `EquipamentosHeader`, `EquipamentosListPage`, componentes de setor/detalhe quando forem seguros. |
| System visual polish / modais                                                                                        | Overlay, modal, inputs e cards operacionais.                                                 | Excecao temporaria.     | `Modal` base; manter fallback para modais imperativos.                                           |
| PR 6 Relatorios                                                                                                      | Hero, filtros, cards, export, assinatura e status.                                           | Migrar.                 | `RelatorioHero`, `RelatorioControls`, `RelatorioCards` + componentes base.                       |
| PR 6 Alertas                                                                                                         | Cards, contexto e empty state de alertas.                                                    | Migrar.                 | `AlertasPage` + `Card`, `StatusPill`, `EmptyState`.                                              |
| PR 6 Orcamentos                                                                                                      | Header, toolbar, KPIs, cards e empty state.                                                  | Migrar.                 | `OrcamentosPage` + `PageHeader`, `ActionBar`, `Card`, `StatusPill`.                              |
| PR 6 Shell/page headers/action bars                                                                                  | Padroniza headers e acoes superiores.                                                        | Consolidar/migrar.      | `layout.css` para shell; `PageHeader` e `ActionBar` React para telas.                            |
| PR 7 Charts, filters, chips and pills                                                                                | Padroniza charts, filtros, tabs, chips, pills e progress bars.                               | Migrar.                 | `Tabs`, `Chip`, `StatusPill`, tema de charts e filtros React.                                    |
| PR 8 Overflow, spacing and visual cleanup                                                                            | Contencao de texto, min-width, glow, contraste e spacing fino.                               | Manter ate migracao.    | Reaplicar localmente nos componentes; remover com prova por tela.                                |
| PR 9 Shell/sidebar/page headers                                                                                      | Remove ruido visual e refina shell.                                                          | Consolidar.             | `layout.css` e templates de shell.                                                               |
| PR 10 Modais/scroll/resumos/terminologia                                                                             | Corrige scroll de detalhe/modal, cards verdes e Orcamentos.                                  | Migrar parcial.         | `Modal`, `StatusPill`, `ProgressBar`, `OrcamentosPage`.                                          |
| PR 11 Relatorios/Historico top polish                                                                                | Parte foi isolada em `internal-top-polish.css`; `redesign.css` ainda tem base compartilhada. | Migrar.                 | `internal-top-polish.css` temporario, depois `PageHeader`, `ActionBar`, `Tabs`, `Chip`.          |

### Hits de residuos e candidatos futuros

Busca executada em arquivos versionados fora de `node_modules`, `dist`, `coverage` e `.git`.
Nenhum item foi removido nesta auditoria.

| Padrao                   | Classificacao                               | Observacao                                                                                                                                                |
| ------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Ver demonstração`       | Valido/ausente                              | Zero hits no checkout auditado.                                                                                                                           |
| `Ver demonstracao`       | Historico/teste                             | Hits em docs de migracao e teste da landing React; nao indica runtime do botao removido.                                                                  |
| `demo`                   | Misturado; precisa investigacao por familia | Hits em docs, legais, testes, limites de plano, Equipamentos e CSS. Nem todo `demo` e visual antigo; remover somente com prova.                           |
| `guest`                  | Valido                                      | Usado em auth/limites/quotas/dev wipe e testes. Nao tratar como residuo visual automaticamente.                                                           |
| `#e8b94a`                | Candidato futuro com excecoes premium       | Ainda aparece em CSS legado/upsell/pricing/dev plan toggle/testes. Deve ser reduzido fora de Pro/premium, mas nao nesta PR.                               |
| `yellow`                 | Historico/teste                             | Poucos hits em docs/teste de auth; nao remover sem revisar contexto.                                                                                      |
| `gold`                   | Valido com restricao                        | Usado em tokens, layout, redesign e componentes ligados a premium/Pro; revisar usos fora de premium em PR especifico.                                     |
| `#ffffff`                | Valido/precisa investigacao                 | Usado em tokens, superficies, landing preview, auth e legais. Nao e prova de CSS antigo.                                                                  |
| `#f5f7fb`                | Valido/precisa investigacao                 | Presente em Clientes, landing preview e assinatura de Orcamentos; pode ser excecao de superficies claras/preview.                                         |
| `#eef2f9`                | Valido/historico                            | Presente em docs e landing preview; nao indica app interno escuro por si so.                                                                              |
| `useReactLandingPage`    | Historico                                   | Hit apenas em docs de migracao da landing.                                                                                                                |
| `VITE_REACT_LANDING`     | Historico                                   | Hit apenas em docs de migracao da landing.                                                                                                                |
| `landingPage`            | Misturado valido/historico                  | Docs historicos e nomes atuais da landing React/testes/entrypoint. Nao ha evidencia de import legacy removido por este grep.                              |
| `app-sidebar__plan-card` | Candidato futuro                            | Hits em `components.css`, docs de consolidacao e teste de identidade visual. Como o card foi removido do markup, pode virar microprova de remocao futura. |
| `lp-`                    | Misturado; precisa investigacao             | Prefixo aparece em shell/header/navigation/dashboard e testes, alem de docs. Pode ser contrato atual de shortcuts/links, nao remover por grep amplo.      |

### Oportunidades de migracao React/Tailwind

| Area               | Estado React atual                                                                                        | CSS envolvido                                                                                          | Riscos de contrato                                                                | Prioridade sugerida         |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------- |
| Dashboard          | Varias ilhas em `src/react/pages/Dashboard*.jsx`; ainda convive com `src/ui/views/dashboard.js`.          | `redesign.css`, `components.css`, possiveis regras `dash-*`.                                           | Onboarding, empty states, charts, `data-action` de CTAs e contratos de dashboard. | Alta apos componentes base. |
| Clientes           | `src/react/pages/ClientesPage.jsx` ativo, com renderers/adapter legados ainda relevantes.                 | `clientes-premium.css`, `components/_clientes.css`, `components.css`, `redesign.css`.                  | PMOC, filtros, acoes de card, `data-action`, paywall/status.                      | Alta.                       |
| Equipamentos       | `EquipamentosHeader.jsx` e `EquipamentosListPage.jsx`; detalhe/setores/fotos ainda tem legado imperativo. | `components/_equip-hero.css`, `_setor-card.css`, `_setor-modal.css`, `components.css`, `redesign.css`. | Setores, detalhe, nameplate, fotos, movimentacao, locks e modais.                 | Media/alta, por partes.     |
| Relatorios         | `RelatorioHero.jsx`, `RelatorioControls.jsx`, `RelatorioCards.jsx`.                                       | `internal-top-polish.css`, `redesign.css`, `components.css`.                                           | PDF, WhatsApp/share, assinatura, PMOC, quota/paywall e export handlers.           | Media.                      |
| Historico/Servicos | `HistoricoFilters.jsx` e `HistoricoTimeline.jsx` convivem com sheet mobile e handlers legados.            | `internal-top-polish.css`, `components.css`, `desktop-fonts.css`, `redesign.css`.                      | Fotos, assinatura viewer, delete, PDF/navegacao e filtros ativos.                 | Media.                      |
| Alertas            | `AlertasPage.jsx` com cards e empty state.                                                                | `redesign.css`, `components.css`.                                                                      | Severidade/status e navegacao a equipamentos/servicos.                            | Media/baixa.                |
| Orcamentos         | `OrcamentosPage.jsx` com cards/KPIs; modais/assinatura/acoes externas ainda sensiveis.                    | `redesign.css`, `components/_orcamento-modal.css`, `components.css`.                                   | PDF/share, assinatura, confirmar/aprovar, paywall/pricing e `data-action`.        | Media.                      |
| Modais principais  | Muitos ainda sao imperativos ou mistos.                                                                   | `components.css`, `components/_*.css`, `redesign.css`.                                                 | Scroll/focus, submit, validacao, handlers e IDs.                                  | Depois de `Modal` base.     |

### Excecoes que devem permanecer por enquanto

- `!important` em `redesign.css` e folhas scoped: necessario enquanto `components.css` e `theme-premium.css` continuam carregando antes com regras antigas e especificidade alta.
- Classes dinamicas montadas por dados, template string ou `classList`: `hist-pill--*`, `rel-status--*`, `equip-card__status--*`, `setor-card__status--*`, `r-checklist__status--*`, `is-*`, `hidden`, `active`.
- Views imperativas e fluxos legados: Registro, fotos, assinatura, nameplate, Setores, PMOC, PDF/WhatsApp, quota/paywall, checkout e modais de Orcamentos/Equipamentos.
- Docs historicos em `docs/` podem manter referencias a flags/landing legacy quando documentam migracoes passadas; nao remover sem confirmar que o texto engana o estado atual.
- `guest` e `demo` nao sao automaticamente residuos visuais: parte dos usos representa planos, limites, dados legais, testes ou ambiente dev.

### Proximos PRs recomendados

1. Criar componentes base React/Tailwind (`Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Tabs`, `Table`, `ActionBar`, `PageHeader`, `EmptyState`, `StatusPill`) preservando `data-*` e `type`.
2. Migrar primeiro Dashboard e Clientes, porque ja concentram ilhas React e sao areas de alto impacto visual.
3. Migrar Equipamentos por partes, separando lista/header de detalhe/setores/fotos.
4. Migrar Relatorios/Historico mantendo export, assinatura, WhatsApp/PDF e filtros sob testes focados.
5. Remover CSS morto apenas por microfamilia com prova dedicada, repetindo o padrao dos documentos de prova ja existentes.

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

| Prefixo                         | Classes CSS | Somente CSS | React | Views/adapters | Components | Shell | Contracts | Testes/E2E | Classificacao                                                               |
| ------------------------------- | ----------: | ----------: | ----: | -------------: | ---------: | ----: | --------: | ---------: | --------------------------------------------------------------------------- |
| `dash-*`                        |          80 |          33 |    37 |              3 |          1 |    37 |        41 |         42 | Vivo; suspeitas em subfamilias antigas do Dashboard.                        |
| `equip-*`                       |         201 |          84 |    94 |             77 |          2 |    31 |        20 |         32 | Vivo; alto risco por lista React, header React e legado de detalhe/setores. |
| `setor-*`                       |         172 |          41 |     0 |             69 |          1 |    68 |         4 |         35 | Vivo como legado deliberado de setores/modal.                               |
| `eq-*`                          |         216 |          82 |     0 |             79 |         22 |    44 |         0 |          9 | Vivo como legado de detalhe, fotos, nameplate, modais.                      |
| `hist-*`                        |         143 |          27 |    49 |             42 |         36 |    18 |        18 |         26 | Vivo; inclui filtros React e sheet mobile legado.                           |
| `timeline*`                     |          39 |          19 |    19 |              2 |          3 |     1 |         7 |          7 | Vivo; varios modificadores parecem dinamicos.                               |
| `rel-*`                         |         147 |          25 |   115 |             11 |          0 |    30 |        51 |         52 | Vivo; Relatorio React preserva muitos contratos.                            |
| `registro-*`                    |         133 |          28 |    68 |             14 |         20 |    82 |        16 |         19 | Vivo; Registro mistura ilhas e fluxos legados.                              |
| `r-checklist*`                  |          19 |           3 |    15 |              1 |          0 |     1 |         6 |         12 | Vivo; tres status sao candidatos dinamicos.                                 |
| `cli-*`                         |         112 |          16 |    88 |             90 |          0 |     0 |         4 |         18 | Vivo; Clientes React + adapter ainda compartilham contratos.                |
| `orc-*`                         |          49 |           6 |    32 |              0 |         11 |     0 |         0 |          9 | Vivo; `orc-status-pill--*` e `orc-timeline*` removidos com prova.           |
| `alert-*`                       |          19 |           0 |     8 |             19 |          0 |     0 |         1 |          2 | Claramente vivo.                                                            |
| `btn*`                          |          18 |           0 |     9 |             10 |          9 |    11 |         3 |          5 | Global; primeira microfamilia morta removida com prova.                     |
| `empty-state*`                  |           5 |           0 |     5 |              0 |          5 |     0 |         5 |          2 | Claramente vivo.                                                            |
| `pro-*`, `upgrade-*`, `nudge-*` |           8 |           0 |     2 |              6 |          5 |     2 |         0 |          0 | Claramente vivo; ligado a plano/paywall.                                    |

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

Suspeitas restantes: `hist-pill--*`, `hist-quickfilter--*`, `timeline__dot--*`, `timeline__item--*`.

Risco: medio. Timeline e filtros sao React, mas sheet mobile, delete, fotos e assinatura ainda sao legados; varios tons sao dinamicos.

Microfamilia removida com prova em `docs/migration/css-hist-plan-limit-banner-proof.md`: `hist-plan-limit-banner*`.

Classificacao: `hist-plan-limit-banner`, `hist-plan-limit-banner__ic`, `hist-plan-limit-banner__icon`, `hist-plan-limit-banner__text`, `hist-plan-limit-banner__link` e `hist-plan-limit-banner__link:hover` foram removidos de `src/assets/styles/components.css`. As buscas encontraram apenas definicoes CSS e docs; `HistoricoTimeline.jsx`, `HistoricoFilters.jsx`, `historicoViewModel.js`, `historicoFiltersSheet.js`, testes e E2E nao montam essa familia.

Risco residual: baixo. A remocao foi limitada aos seletores `hist-plan-limit-banner*` e ao comentario obsoleto adjacente; `hist-summary-card__upsell-link`, `data-hist-action="hist-pricing-link"`, `hist-*` generico, `timeline*`, sheet mobile, assinatura viewer e handlers de fotos/delete/PDF/navegacao foram preservados.

Microfamilia removida com prova em `docs/migration/css-timeline-saved-badge-proof.md`: `timeline__saved-badge`.

Classificacao: `timeline__saved-badge` aparecia apenas em `src/assets/styles/desktop-fonts.css` e docs. Nao ha uso em `src/react`, `src/ui`, testes ou E2E; os greps de `className`, `classList` e geracao dinamica tambem nao encontraram uso. Nao confundir com `timeline__item--saved`, que continua vivo via `savedHighlight.js`.

Remocao aplicada: removido apenas o seletor `.timeline__saved-badge` de `src/assets/styles/desktop-fonts.css`.

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

Microfamilia removida com prova em `docs/migration/css-orc-timeline-proof.md`: `orc-timeline*`.

Classificacao: `orc-timeline`, `orc-timeline__item`, `orc-timeline__dot`, `orc-timeline__label`, `orc-timeline__date` e o seletor composto `.orc-timeline__item.is-done .orc-timeline__dot` foram removidos de `src/assets/styles/components.css`. As buscas encontraram apenas definicoes CSS e docs; `OrcamentosPage.jsx`, `orcamentosViewModel.js`, modal, assinatura, handlers, testes e E2E nao montam essa familia.

Risco residual: baixo. A remocao foi limitada aos seletores `orc-timeline*`; `timeline*` generico do Historico, `equip-card__timeline-*` de Equipamentos e `is-done` transversal foram preservados.

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
- Excecao ja removida com prova: `hist-plan-limit-banner*` nao e gerado por React, viewModel, sheet mobile, adapter, testes ou E2E atuais de Historico.
- Excecao ja removida com prova: `timeline__saved-badge` nao e gerado por React, adapter, shell, testes ou E2E atuais de Historico; `timeline__item--saved` segue vivo e separado.
- Excecao ja removida com prova: `orc-status-pill--*` nao e gerado por dados no DOM atual; Orcamentos usa `.orc-status-pill` base com `statusMeta` inline.
- Excecao ja removida com prova: `orc-timeline*` nao e gerado por React, viewModel, modal, assinatura, handlers ou testes atuais de Orcamentos.
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

Microfamilia removida nesta fase:

- `hist-plan-limit-banner*` removido com prova em `docs/migration/css-hist-plan-limit-banner-proof.md`
- `timeline__saved-badge` removido com prova em `docs/migration/css-timeline-saved-badge-proof.md`

Escopo recomendado para a proxima prova:

1. Escolher outra microfamilia pequena e criar prova dedicada antes de remover CSS.
2. Preservar `hist-summary-card__upsell-link`, `data-hist-action="hist-pricing-link"`, `hist-*` generico, `timeline*`, sheet mobile, assinatura viewer e handlers de fotos/delete/PDF/navegacao.
3. Rodar smoke visual/E2E de Historico com estado vazio, registros e CTA atual de upsell/pricing do summary card, se aparecer.
4. Manter `npm run lint:css:dead` fora do caminho critico enquanto `purgecss` nao estiver disponivel no projeto.

Nao avancar a proxima remocao por `equip-*`, `eq-*`, `setor-*`, `registro-*`, `rel-*` ou `dash-*` sem prova propria; essas familias sao maiores, tem classes dinamicas e ainda compartilham contratos entre React e legado deliberado.
