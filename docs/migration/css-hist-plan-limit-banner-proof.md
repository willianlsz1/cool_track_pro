# Prova CSS: `hist-plan-limit-banner*`

Data da analise: 2026-05-01.
Remocao aplicada: 2026-05-02.

## Objetivo

Provar se a microfamilia CSS `hist-plan-limit-banner*` esta viva, morta ou inconclusiva antes de qualquer remocao de CSS, e registrar a remocao cirurgica aplicada apos a prova.

Resultado: morta removida, com baixo risco porque a remocao foi cirurgica e limitada aos seletores listados abaixo.

## Escopo verificado

Buscas feitas nos grupos pedidos:

- `src/react`
- `src/ui/views`
- `src/ui/components`
- `src/ui/shell/templates`
- `src/ui/viewModels`
- `src/core`
- `src/domain`
- `src/__tests__`
- `src/tests`
- `e2e`
- `docs`

Tambem foi feito cruzamento manual com:

- `src/react/pages/HistoricoTimeline.jsx`
- `src/react/pages/HistoricoFilters.jsx`
- `src/ui/viewModels/historicoViewModel.js`
- `src/ui/components/historicoFiltersSheet.js`
- testes de Historico
- E2E de lifecycle de Historico

## Greps obrigatorios

### `git grep -n "hist-plan-limit-banner"`

Encontrou apenas docs e definicoes CSS:

- `docs/migration/css-legacy-inventory.md`
- `src/assets/styles/components.css:13283`
- `src/assets/styles/components.css:14103`
- `src/assets/styles/components.css:14115`
- `src/assets/styles/components.css:14116`
- `src/assets/styles/components.css:14120`
- `src/assets/styles/components.css:14124`
- `src/assets/styles/components.css:14136`

### `git grep -n "plan-limit"`

Mesmo resultado relevante: apenas docs e definicoes CSS da microfamilia.

### `git grep -n "limit-banner"`

Mesmo resultado relevante: apenas docs e definicoes CSS da microfamilia.

### `git grep -n "hist-" -- ...`

Confirmou que Historico ainda usa muitas classes `hist-*` vivas nos filtros React, timeline React, sheet mobile legado, assinatura viewer e testes. Nenhum resultado fora de CSS/docs monta `hist-plan-limit-banner*`.

## Greps de geracao dinamica

### `git grep -n -E 'hist-plan-limit-banner.*\$\{|`[^`]*hist-plan-limit-banner|plan-limit.*hist|hist.\*plan-limit'`

Resultado relevante: apenas docs e definicoes CSS.

### `git grep -n -E "className.*hist-plan-limit-banner|hist-plan-limit-banner.*className"`

Sem resultados.

### `git grep -n -E "classList.*hist-plan-limit-banner|hist-plan-limit-banner.*classList"`

Sem resultados.

### Busca complementar por plano/limite no Historico

`git grep -n -E "historicoDias|historico.*limit|limit.*historico" -- ...` encontrou teste documentando que o plano Free nao define `historicoDias` e que o historico e ilimitado no tempo.

Esse resultado enfraquece a hipotese de uso atual do banner antigo de limite Free/30d.

## Definicoes CSS encontradas

Arquivo original: `src/assets/styles/components.css`.

Seletores:

- `#view-historico .hist-plan-limit-banner`
- `#view-historico .hist-plan-limit-banner__ic`
- `#view-historico .hist-plan-limit-banner__icon`
- `#view-historico .hist-plan-limit-banner__text`
- `#view-historico .hist-plan-limit-banner__link`
- `#view-historico .hist-plan-limit-banner__link:hover`

Comentario adjacente:

- `Plan limit banner (Free, 30d cutoff)`

## Remocao aplicada

Foram removidos de `src/assets/styles/components.css`:

- `#view-historico .hist-plan-limit-banner`
- `#view-historico .hist-plan-limit-banner__ic`
- `#view-historico .hist-plan-limit-banner__icon`
- `#view-historico .hist-plan-limit-banner__text`
- `#view-historico .hist-plan-limit-banner__link`
- `#view-historico .hist-plan-limit-banner__link:hover`
- comentario obsoleto `Plan limit banner (Free, 30d cutoff)`
- mencao obsoleta `.hist-plan-limit-banner (Free)` no mapa estrutural comentado do Historico

Preservado: `hist-*` generico, `timeline*`, sheet mobile de filtros, assinatura viewer, `hist-summary-card__upsell-link`, `data-hist-action="hist-pricing-link"` e demais contratos `data-*` do Historico.

## Cruzamento com Historico atual

Arquivos centrais verificados:

- `HistoricoTimeline.jsx`: nao renderiza `hist-plan-limit-banner*`.
- `HistoricoFilters.jsx`: nao renderiza `hist-plan-limit-banner*`.
- `historicoViewModel.js`: nao produz modelo para banner de limite.
- `historicoFiltersSheet.js`: nao usa banner de limite.
- `historico.js`: nao monta `hist-plan-limit-banner*`; o CTA de pricing atual e `hist-summary-card__upsell-link` com `data-hist-action="hist-pricing-link"`.
- testes/E2E: nao ha contrato atual para `hist-plan-limit-banner*`.

## Classificacao

| Classe                               | Classificacao  | Evidencia                                                                   |
| ------------------------------------ | -------------- | --------------------------------------------------------------------------- |
| `hist-plan-limit-banner`             | Morta removida | Apenas CSS/docs; sem render React, adapter, shell, teste ou E2E.            |
| `hist-plan-limit-banner__ic`         | Morta removida | Apenas CSS/docs; sem template, `className`, `classList` ou builder.         |
| `hist-plan-limit-banner__icon`       | Morta removida | Apenas CSS/docs; sem template, `className`, `classList` ou builder.         |
| `hist-plan-limit-banner__text`       | Morta removida | Apenas CSS/docs; sem template, `className`, `classList` ou builder.         |
| `hist-plan-limit-banner__link`       | Morta removida | Apenas CSS/docs; CTA atual de pricing usa `hist-summary-card__upsell-link`. |
| `hist-plan-limit-banner__link:hover` | Morta removida | Pseudo-classe ligada ao seletor morto.                                      |

## Risco

Baixo. A remocao ja foi aplicada apenas aos seletores acima.

Nao remover junto:

- `hist-summary-card__upsell-link`
- `data-hist-action="hist-pricing-link"`
- `hist-*` generico
- `timeline*`
- sheet mobile de filtros
- assinatura viewer
- handlers de fotos/delete/PDF/navegacao

## Decisao recomendada

Remocao concluida. O proximo PR deve escolher outra microfamilia pequena ja provada ou criar uma nova prova antes de remover CSS, sem apagar familias grandes por grep simples.

Antes/depois de remocoes semelhantes, rodar:

- `git grep -n "hist-plan-limit-banner"`
- `git grep -n "plan-limit"`
- `git grep -n "limit-banner"`

Validacao visual recomendada:

- Historico em estado vazio.
- Historico com registros.
- CTA atual de upsell/pricing do summary card, se aparecer.
- E2E lifecycle de Historico.
