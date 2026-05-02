# CSS orc-timeline Obsolescence Proof

Data da prova: 2026-05-01.
Remocao aplicada: 2026-05-01.

## Objetivo

Provar se a microfamilia CSS `orc-timeline*` esta viva, morta ou inconclusiva antes de qualquer remocao de CSS, e registrar a remocao cirurgica aplicada apos a prova.

Escopo da prova original: documentacao apenas. No PR seguinte, apenas os seletores `orc-timeline*` foram removidos de `src/assets/styles/components.css`.

## Buscas executadas

```bash
git grep -n "orc-timeline"
git grep -n "timeline" -- src/react src/ui/views src/ui/components src/ui/shell/templates src/ui/viewModels src/__tests__ src/tests e2e docs
git grep -n "orc-" -- src/react/pages/OrcamentosPage.jsx src/ui/viewModels/orcamentosViewModel.js src/__tests__ src/tests e2e docs
git grep -n -E 'orc-timeline.*\$\{|`[^`]*orc-timeline|orc-timeline.*status|status.*orc-timeline'
git grep -n -E "className.*orc-timeline|orc-timeline.*className"
git grep -n -E "classList.*orc-timeline|orc-timeline.*classList"
git grep -n -E "orc.*timeline|timeline.*orc|orcTimeline|timelineOrc" -- src e2e docs
git grep -n "is-done" -- src/react src/ui src/__tests__ e2e docs
```

Observacao: a primeira tentativa do grep dinamico com backtick em aspas duplas no PowerShell falhou por escaping do shell. O mesmo padrao foi rerodado com aspas simples e resultado valido.

## Definicoes CSS encontradas

Arquivo: `src/assets/styles/components.css`.

| Seletor completo                                 | Linha aproximada | Classe da microfamilia      |
| ------------------------------------------------ | ---------------: | --------------------------- |
| `.orc-timeline`                                  |            22476 | `orc-timeline`              |
| `.orc-timeline__item`                            |            22482 | `orc-timeline__item`        |
| `.orc-timeline__dot`                             |            22491 | `orc-timeline__dot`         |
| `.orc-timeline__item.is-done .orc-timeline__dot` |            22497 | `orc-timeline__item`, `dot` |
| `.orc-timeline__label`                           |            22500 | `orc-timeline__label`       |
| `.orc-timeline__date`                            |            22507 | `orc-timeline__date`        |

O seletor composto usava a classe transversal `is-done`, mas a busca por `is-done` mostrou usos vivos em onboarding/nameplate, nao em Orcamentos. Portanto `is-done` nao fez parte da remocao; apenas o seletor composto da familia `orc-timeline*` foi removido.

## Resultado dos greps

`git grep -n "orc-timeline"` encontrou:

- definicoes CSS em `src/assets/styles/components.css`;
- documentos de inventario/plano/provas;
- nenhum uso em `src/react`, `src/ui`, `src/core`, `src/domain`, testes ou E2E.

`git grep -n "timeline" -- ...` encontrou:

- timeline viva do Historico (`#timeline`, `.timeline`, `.timeline__item`, ilha React e E2E);
- timeline inline de Equipamentos (`equip-card__timeline-*`);
- documentos de migracao;
- nenhuma referencia de timeline em `OrcamentosPage.jsx` ou `orcamentosViewModel.js`.

`git grep -n "orc-" -- OrcamentosPage/viewModel/testes/docs` encontrou:

- classes vivas de Orcamentos como `orc-page`, `orc-header`, `orc-toolbar`, `orc-card`, `orc-status-pill`, `orc-empty`, `orc-filter-chips`;
- acoes `ORCAMENTO_ACTIONS`;
- nenhum `orc-timeline*`.

Buscas dinamicas:

- `orc-timeline.*\$\{|...|status.*orc-timeline`: encontrou apenas documentos/CSS, nenhum builder de produto.
- `className.*orc-timeline|orc-timeline.*className`: sem resultado.
- `classList.*orc-timeline|orc-timeline.*classList`: sem resultado.
- `orc.*timeline|timeline.*orc|orcTimeline|timelineOrc`: apenas documentos e CSS.

## Cruzamento com Orcamentos

### `src/react/pages/OrcamentosPage.jsx`

- Renderiza cards com `<article className="orc-card" data-id={...}>`.
- Renderiza status com `className="orc-status-pill"` e estilos inline vindos de `statusMeta`.
- Renderiza filtros, KPIs, empty state, assinatura digital aprovada e acoes do card.
- Nao renderiza `orc-timeline`, `orc-timeline__item`, `orc-timeline__dot`, `orc-timeline__label` ou `orc-timeline__date`.

### `src/ui/viewModels/orcamentosViewModel.js`

- Monta `ORCAMENTO_STATUS_META`, filtros, KPIs, cards e acoes.
- Nao monta timeline, historico de status, eventos de orcamento ou classes CSS.
- Nao retorna qualquer dado com nome `timeline` para a pagina React.

### Modal, assinatura e handlers

- `src/ui/components/orcamentoModal.js` altera payload/status de orcamento, sem `orc-timeline*`.
- `src/ui/components/orcamentoSignaturePage.js` tem fluxo publico de assinatura, mas usa familia propria `osp-*`.
- `src/ui/controller/handlers/orcamentoHandlers.js` trata filtros/status/PDF/WhatsApp/assinatura, sem `orc-timeline*`.

### Testes e E2E

- `src/__tests__/orcamentosReactIsland.test.jsx` protege `orc-card`, `orc-status-pill` e `data-action` de orcamentos, sem timeline.
- `src/__tests__/orcamentosViewModel.test.js` cobre status/filtros/cards, sem timeline.
- `src/__tests__/orcamentosView.security.test.js` cobre render seguro de Orcamentos, sem timeline.
- E2E de lifecycle cobre a ilha de Orcamentos, mas nao valida `orc-timeline*`.

## Classificacao

| Classe                                          | Classificacao                      | Evidencia                                                                                           |
| ----------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `orc-timeline`                                  | Morta removida                     | Apenas definicao CSS/docs; nenhum DOM atual monta a timeline de Orcamentos.                         |
| `orc-timeline__item`                            | Morta removida                     | Apenas definicao CSS/docs; nenhum React/viewModel/modal gera itens de timeline.                     |
| `orc-timeline__dot`                             | Morta removida                     | Apenas definicao CSS/docs; nenhum uso em className/classList/template.                              |
| `orc-timeline__label`                           | Morta removida                     | Apenas definicao CSS/docs; nenhum uso em produto/testes/E2E.                                        |
| `orc-timeline__date`                            | Morta removida                     | Apenas definicao CSS/docs; nenhum uso em produto/testes/E2E.                                        |
| `orc-timeline__item.is-done .orc-timeline__dot` | Morta removida do seletor composto | A parte `orc-timeline*` estava morta; `is-done` e transversal e foi preservada em outros seletores. |

Classificacao da familia: morta removida, com risco baixo porque a remocao foi limitada aos seletores `orc-timeline*` em `src/assets/styles/components.css`.

## Remocao aplicada

Seletores removidos de `src/assets/styles/components.css`:

- `.orc-timeline`
- `.orc-timeline__item`
- `.orc-timeline__dot`
- `.orc-timeline__item.is-done .orc-timeline__dot`
- `.orc-timeline__label`
- `.orc-timeline__date`

Preservado: `timeline*` generico do Historico, classes de timeline de Equipamentos quando existirem, e a classe transversal `is-done`.

## Ressalvas

- Nao remover `timeline*` generico: a timeline do Historico esta viva e coberta por React/E2E.
- Nao remover classes de timeline de Equipamentos: `equip-card__timeline-*` esta fora desta prova.
- Nao remover `is-done` genericamente: ha usos vivos em onboarding/nameplate.
- Esta prova nao executou screenshot especifico de Orcamentos; o proximo PR de remocao deve rodar smoke visual/E2E da rota.

## Decisao recomendada

Remocao concluida. O proximo PR recomendado deve escolher outra microfamilia pequena ja provada ou criar nova prova antes de qualquer remocao, mantendo a regra de nao apagar familias grandes por grep simples.

Validacao aplicada/recomendada para remocoes semelhantes:

1. Greps antes/depois confirmando que `orc-timeline*` ficou apenas em docs historicos/prova.
2. `npm run format`, `npm run check`, `npm run test`, `npm run build`.
3. `npm run test:e2e -- e2e/specs/react-islands-lifecycle.spec.js`.
4. Smoke visual de Orcamentos com lista vazia e com cards/status principais, confirmando que cards, filtros, status pill, assinatura e acoes continuam sem regressao.
