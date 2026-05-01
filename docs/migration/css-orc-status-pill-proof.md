# CSS orc-status-pill Obsolescence Proof

Data da prova: 2026-05-01.

## Objetivo

Provar se a microfamilia CSS `orc-status-pill--*` esta viva, morta ou inconclusiva antes de qualquer remocao de CSS.

Escopo desta prova: documentacao apenas. Nenhum CSS foi removido.

## Buscas executadas

Greps diretos pedidos:

```bash
git grep -n "orc-status-pill--"
git grep -n "orc-status-pill"
git grep -n "status-pill"
git grep -n "ORCAMENTO_STATUS"
git grep -n "ORCAMENTO_STATUS_META"
```

Buscas dinamicas pedidas:

```bash
git grep -n -E "orc-status-pill--\\$\\{|`[^`]*orc-status-pill|orc-status-pill.*status|status.*orc-status-pill"
git grep -n -E "className.*orc-status-pill|orc-status-pill.*className"
git grep -n -E "classList.*orc-status-pill|orc-status-pill.*classList"
```

Busca adicional de contratos relacionados:

```bash
git grep -n "ORCAMENTO_ACTIONS" src/react src/ui/viewModels src/__tests__ e2e docs
git grep -n "data-status" src/react src/ui src/__tests__ e2e docs
```

## Definicoes CSS encontradas

Arquivo: `src/assets/styles/redesign.css`.

Variantes da microfamilia:

| Variante                       | Linha aproximada | Seletor completo encontrado     |
| ------------------------------ | ---------------: | ------------------------------- |
| `orc-status-pill--enviado`     |              173 | `.orc-status-pill--enviado`     |
| `orc-status-pill--aprovado`    |              178 | `.orc-status-pill--aprovado`    |
| `orc-status-pill--visualizado` |              183 | `.orc-status-pill--visualizado` |
| `orc-status-pill--rascunho`    |              188 | `.orc-status-pill--rascunho`    |
| `orc-status-pill--recusado`    |              193 | `.orc-status-pill--recusado`    |
| `orc-status-pill--expirado`    |              198 | `.orc-status-pill--expirado`    |

As variantes estao agrupadas com seletores de atributo:

```css
.orc-status-pill--enviado,
[data-status='enviado'] .orc-status-pill { ... }
```

O mesmo padrao existe para `aprovado`, `visualizado`, `rascunho`, `recusado` e `expirado`.

Bases ainda vivas:

- `src/assets/styles/redesign.css:152` define `.orc-status-pill`.
- `src/assets/styles/components.css:22427` define `.orc-status-pill`.
- `src/assets/styles/redesign.css:676` e media query em `:682` tambem ajustam `.orc-status-pill`.

## Usos reais encontrados

### Uso React atual

`src/react/pages/OrcamentosPage.jsx` usa apenas a classe base:

- `StatusPill` em `:229`.
- `className="orc-status-pill"` em `:233`.
- O card em `:341` renderiza `<article className="orc-card" data-id={...}>`, sem `data-status`.

O status visual atual vem de dados prontos do view model:

- `src/ui/viewModels/orcamentosViewModel.js:13` define `ORCAMENTO_STATUS_META`.
- `src/ui/viewModels/orcamentosViewModel.js:206` escolhe `statusMeta`.
- `src/ui/viewModels/orcamentosViewModel.js:217` envia `statusMeta` para o card.
- `StatusPill` aplica `color`, `background` e `border` inline a partir de `statusMeta`.

### Uso de `data-status`

`src/react/pages/OrcamentosPage.jsx:194` usa `data-status={status.id}` nos chips de filtro, nao em um ancestral de `.orc-status-pill`.

Nao foi encontrado card de orcamento com `data-status` envolvendo `.orc-status-pill`. Portanto os seletores `[data-status='...'] .orc-status-pill` de `redesign.css` nao parecem atuar no DOM atual de Orcamentos.

### Testes

`src/__tests__/orcamentosReactIsland.test.jsx:111` valida somente `.orc-status-pill` base com texto `Enviado`. Nenhum teste valida `orc-status-pill--*`.

## Resultado dos greps

`git grep -n "orc-status-pill--"` encontrou:

- documentos de inventario/plano;
- definicoes em `src/assets/styles/redesign.css`;
- nenhum uso em React, views, components, shell, viewModels, core, domain, tests ou E2E.

`git grep -n "orc-status-pill"` encontrou:

- `.orc-status-pill` base em CSS;
- teste da ilha React;
- `className="orc-status-pill"` em `OrcamentosPage.jsx`;
- definicoes `orc-status-pill--*` em `redesign.css`;
- nenhum uso das variantes como classes de produto.

`git grep -n "status-pill"` encontrou outras familias nao relacionadas:

- `setor-modal__preview-status-pill`;
- `auth-phone__status-pill`.

Essas familias nao fazem parte desta microprova.

Buscas dinamicas:

- `className.*orc-status-pill|orc-status-pill.*className`: encontrou apenas `className="orc-status-pill"` em `OrcamentosPage.jsx`.
- `classList.*orc-status-pill|orc-status-pill.*classList`: sem resultado.
- Busca de template strings/status encontrou apenas documentos e os seletores `[data-status='...'] .orc-status-pill` em CSS.

## Cruzamento com contratos de Orcamentos

`ORCAMENTO_STATUS_META` atual possui:

- `rascunho`
- `enviado`
- `aguardando_assinatura`
- `aprovado`
- `recusado`
- `expirado`

`ORCAMENTO_STATUS_FILTERS` atual possui:

- `todos`
- `rascunho`
- `enviado`
- `aprovado`
- `recusado`
- `expirado`

Observacoes:

- `aguardando_assinatura` e status real no view model, mas nao possui variante `orc-status-pill--aguardando_assinatura` em CSS.
- `visualizado` possui variante CSS, mas nao aparece em `ORCAMENTO_STATUS_META` nem em `ORCAMENTO_STATUS_FILTERS`.
- A ilha React nao monta `orc-status-pill--${status}` e nao monta `data-status` no card.

## Classificacao

| Classe                         | Classificacao             | Evidencia                                                         |
| ------------------------------ | ------------------------- | ----------------------------------------------------------------- |
| `orc-status-pill--enviado`     | Morta candidata a remocao | Apenas definicao CSS/docs; status vivo usa `statusMeta` inline.   |
| `orc-status-pill--aprovado`    | Morta candidata a remocao | Apenas definicao CSS/docs; status vivo usa `statusMeta` inline.   |
| `orc-status-pill--visualizado` | Morta candidata a remocao | Apenas definicao CSS/docs; status nem existe no view model atual. |
| `orc-status-pill--rascunho`    | Morta candidata a remocao | Apenas definicao CSS/docs; status vivo usa `statusMeta` inline.   |
| `orc-status-pill--recusado`    | Morta candidata a remocao | Apenas definicao CSS/docs; status vivo usa `statusMeta` inline.   |
| `orc-status-pill--expirado`    | Morta candidata a remocao | Apenas definicao CSS/docs; status vivo usa `statusMeta` inline.   |

Classificacao da familia: morta candidata a remocao, com ressalva de remocao cirurgica.

## Ressalvas

- As variantes estao agrupadas no CSS com seletores `[data-status='...'] .orc-status-pill`.
- Esta prova classifica apenas as classes `orc-status-pill--*`.
- Remover o bloco inteiro alteraria tambem seletores por atributo; isso deve ser evitado sem prova propria.
- A classe base `.orc-status-pill` esta viva e nao deve ser removida.

## Decisao recomendada

Proximo PR pode remover apenas os seletores de classe `orc-status-pill--*` de `src/assets/styles/redesign.css`, preservando os seletores `[data-status='...'] .orc-status-pill` e as regras base `.orc-status-pill`.

Antes da remocao, rodar um teste/E2E pequeno ou screenshot de Orcamentos com cards nos status `rascunho`, `enviado`, `aprovado`, `recusado` e `expirado`, confirmando que o visual continua vindo de `statusMeta` inline.
