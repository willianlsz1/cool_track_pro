# Dashboard React Prep

## 1. Estrutura atual da tela

A rota `inicio` ainda e 100% legada. O HTML estrutural nasce em `src/ui/shell/templates/views.js`, dentro de `#view-inicio`, e o adapter principal continua em `src/ui/views/dashboard.js`.

Blocos principais:

- Hero operacional: `#dash-hero`, `#dash-hero-greeting`, `#dash-hero-summary`, CTAs `#dash-hero-cta` e `#dash-hero-cta-secondary`.
- Empty state: `#dash-empty`, preenchido por `emptyStateHtml`.
- Onboarding e prompts: `#dash-onboarding`, `#dash-overflow-banner`.
- KPIs: `#dash-kpi-ativos`, `#dash-kpi-ef`, `#dash-kpi-anom`, `#dash-kpi-mes` e seus elementos auxiliares.
- Proxima acao e ultimo servico: `#dash-next-action-card`, `#dash-last-service`.
- Cards Pro/empresa: `#dash-pro-ops-row`, `#dash-critical-alerts-*`, `#dash-risk-clients-*`.
- Mes em campo/operacao: `#dash-month-section`.
- Secoes secundarias: `#dash-critical-section`, `#dash-alerts-section`, `#dash-criticos-section`, `#dash-recentes-section`.
- Charts: `#chart-status-pie`, `#chart-trend-line`, `#chart-tipos-doughnut`.

## 2. Containers e ids publicos

Contratos centralizados em `src/ui/viewModels/dashboardContracts.js`:

- View/root: `#view-inicio`, `#dash`.
- Hero: `#dash-hero`, `#dash-hero-greeting`, `#dash-hero-summary`, `#dash-hero-cta`, `#dash-hero-cta-secondary`.
- Empty/onboarding: `#dash-empty`, `#dash-onboarding`, `#dash-overflow-banner`.
- KPIs: `#dash-kpi-ativos`, `#dash-kpi-ef`, `#dash-kpi-anom`, `#dash-kpi-mes`, sparks e subtitles.
- Cards: `#dash-next-action-card`, `#dash-last-service`, `#dash-pro-ops-row`.
- Mes/secoes: `#dash-month-*`, `#dash-critical-*`, `#dash-alerts-section`, `#dash-criticos-section`, `#dash-recentes-section`.
- Charts: `#chart-status-pie`, `#chart-trend-line`, `#chart-tipos-doughnut`.

## 3. Classes publicas principais

Contratos documentados em `DASHBOARD_PUBLIC_CLASSES`:

- `dash`, `dash--quick`.
- `dash__hero`, `dash__hero--quick`, `dash__hero-greeting`, `dash__hero-summary`, `dash__hero-cta`.
- `dash__empty`.
- `dash__kpi-grid`, `dash__kpi`, `dash__kpi-label`, `dash__kpi-value`, `dash__kpi-sub`.
- `dash__card`, `dash__card--next-action`, `dash__card--last-service`, `dash__card-cta`.
- `dash__section`, `dash__section-header`, `dash__section-label`, `dash__section-count`.
- `dash__analise`, `dash__accordion`, `dash__accordion-item`.
- `dash__continue-card`, `alert-card`, `critical-now-item`, `recent-card`.

## 4. Acoes e handlers existentes

Acoes preservadas:

- `data-action="open-modal"` com `data-id="modal-add-eq"`.
- `data-action="go-register-equip"` com `data-id` de equipamento.
- `data-action="view-equip"`.
- `data-action="continue-draft"`.
- `data-action="discard-draft"`.

Navegacoes por contrato:

- `data-nav="registro"`.
- `data-nav="historico"`.
- `data-nav="clientes"`.
- `data-nav="pricing"` em nudges de plano.

## 5. O que foi extraido para view model

Criado `src/ui/viewModels/dashboardViewModel.js`.

O view model e puro e cobre apenas dados read-only:

- tier visual (`free`, `plus`, `pro`) e modo empresa.
- resumo do hero.
- empty state do dashboard vazio.
- KPIs principais: ativos, eficiencia, anomalias, servicos do mes.
- tendencia mensal e dados de sparkline como array de numeros, sem SVG/HTML.
- resumo de alertas.
- proxima acao.
- ultimo servico.
- visao do mes em campo/operacao.

O adapter legado passou a consumir esse modelo nos blocos read-only acima. A renderizacao continua legada e os elementos continuam recebendo `textContent`, `dataset` e `innerHTML` exatamente onde ja recebiam antes.

## 6. O que ficou legado

Continuam fora do view model nesta etapa:

- Charts e lifecycle de `Charts.refreshAll()`.
- Header global e indicadores de sync.
- `OnboardingBanner`, `OnboardingChecklist`, `InstallAppPrompt`.
- `OverflowBanner` e modal de limite.
- Continue draft card, porque le `sessionStorage` e insere HTML.
- Cards mini de equipamentos com ocorrencia.
- Secoes de alertas e recentes que ainda geram HTML via template string.
- Cards Pro/empresa com PMOC de cliente.

## 7. Bloqueios para futura ilha React

- `src/ui/views/dashboard.js` permanece grande e acoplado, acima do limite arquitetural desejado de 1000 linhas.
- Existem varios pontos de `innerHTML` legados para SVG, empty state, alertas, recentes, cards mini e banners.
- Charts dependem de canvas e import dinamico; devem ficar fora de uma primeira ilha.
- Onboarding e overflow possuem side effects e devem ser isolados antes de migrar.
- Header global nao pertence ao dashboard e nao deve entrar na ilha.
- Pro cards misturam leitura de plano, PMOC e HTML de botoes.
- Parte dos calculos ainda depende de `getState`, `findEquip`, `findSetor` e `regsForEquip` no adapter.

## 8. Recomendacao de primeira fatia migravel

Primeira fatia segura: migrar apenas o bloco de KPIs do dashboard para uma ilha React controlada, depois de um PR especifico de adapter/render legado.

Escopo recomendado para o proximo PR:

- Cobrir o render legado dos KPIs com teste focado.
- Garantir preservacao de ids `dash-kpi-*`, classes `dash__kpi*` e `data-tone`.
- Nao tocar em hero, charts, onboarding, overflow, header, cards Pro ou secoes secundarias.

Depois disso, a migracao React dos KPIs pode receber `viewModel.kpis` pronto por props e montar somente em um container pequeno a ser definido em PR proprio.
