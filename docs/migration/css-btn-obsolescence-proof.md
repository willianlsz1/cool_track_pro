# CSS Btn Microfamily Obsolescence Proof

Data da prova: 2026-05-01.

## Objetivo

Provar a obsolescencia das tres classes `btn*` suspeitas apontadas em `docs/migration/css-legacy-inventory.md`, sem remover CSS:

- `btn--full`
- `btn--spaced-bottom`
- `btn-ghost--report`

## Escopo verificado

Buscas executadas nos escopos pedidos:

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

## Resultado dos usos diretos

Comandos:

```bash
git grep -n "btn--full"
git grep -n "btn--spaced-bottom"
git grep -n "btn-ghost--report"
```

Resultado:

| Classe               | Matches fora de CSS/docs | Definicao CSS                                                | Classificacao             |
| -------------------- | -----------------------: | ------------------------------------------------------------ | ------------------------- |
| `btn--full`          |                        0 | `src/assets/styles/components.css:2063`                      | Morta candidata a remocao |
| `btn--spaced-bottom` |                        0 | `src/assets/styles/components.css:2076`                      | Morta candidata a remocao |
| `btn-ghost--report`  |                        0 | `src/assets/styles/components.css:15939`, `:15944`, `:15947` | Morta candidata a remocao |

Observacao: os matches em `docs/migration/react-tailwind-cleanup-plan.md` e neste inventario sao historicos/prova, nao uso de produto. Os matches em `src/assets/styles/components.css` sao apenas definicoes.

## Definicoes CSS encontradas

`src/assets/styles/components.css:2063`

```css
.btn--full {
  width: 100%;
}
```

`src/assets/styles/components.css:2076`

```css
.btn--spaced-bottom {
  margin-bottom: var(--space-2);
}
```

`src/assets/styles/components.css:15939`

```css
#view-historico .btn-ghost--report {
  white-space: nowrap;
  flex-shrink: 0;
}
@media (max-width: 379px) {
  #view-historico .btn-ghost--report span {
    display: none;
  }
  #view-historico .btn-ghost--report {
    padding: 7px 9px;
  }
}
```

## Padroes dinamicos verificados

Comandos:

```bash
git grep -n "btn--" -- src/react src/ui/views src/ui/components src/ui/shell/templates src/ui/viewModels src/core src/domain src/__tests__ src/tests e2e docs
git grep -n "btn-ghost" -- src/react src/ui/views src/ui/components src/ui/shell/templates src/ui/viewModels src/core src/domain src/__tests__ src/tests e2e docs
git grep -n -E "classList.*btn|btn.*classList" -- src/react src/ui/views src/ui/components src/ui/shell/templates src/ui/viewModels src/core src/domain src/__tests__ src/tests e2e docs
git grep -n -E "className.*btn|btn.*className" -- src/react src/ui/views src/ui/components src/ui/shell/templates src/ui/viewModels src/core src/domain src/__tests__ src/tests e2e docs
git grep -n -E "btn[^\\n]*(full|spaced|report)|(full|spaced|report)[^\\n]*btn" -- src/react src/ui/views src/ui/components src/ui/shell/templates src/ui/viewModels src/core src/domain src/__tests__ src/tests e2e docs
git grep -n -E "btn--\\$\\{|btn-ghost--\\$\\{|`[^`]*btn--|`[^`]*btn-ghost|\\[[^\\]]*btn--|\\[[^\\]]*btn-ghost" -- src/react src/ui/views src/ui/components src/ui/shell/templates src/ui/viewModels src/core src/domain src/__tests__ src/tests e2e docs
git grep -n -E "btn.*variant|variant.*btn|btn.*tone|tone.*btn|cta.*btn|btn.*cta" -- src/react src/ui/views src/ui/components src/ui/shell/templates src/ui/viewModels src/core src/domain
```

Conclusao dos padroes dinamicos:

- Builders atuais montam `btn--primary`, `btn--outline`, `btn--danger`, `btn--ghost`, `btn--sm`, `btn--auto`, `btn--centered`, `btn--fit-content` e `btn--editing`.
- Nao ha builder encontrado para `btn--full`, `btn--spaced-bottom` ou `btn-ghost--report`.
- Nao ha `classList` adicionando/removendo/toggle dessas tres classes.
- Nao ha `className` atribuindo essas tres classes.
- Nao ha array de classes ou template string usando sufixos `full`, `spaced` ou `report` para `btn`.

## Observacao sobre `lint:css:dead`

`npm run lint:css:dead` continua indisponivel neste checkout porque `scripts/dead-css-report.mjs` importa `purgecss`, que nao esta instalado. Nao foi adicionada dependencia neste PR.

## Decisao

As tres classes estao classificadas como mortas candidatas a remocao:

- `btn--full`: morta candidata a remocao.
- `btn--spaced-bottom`: morta candidata a remocao.
- `btn-ghost--report`: morta candidata a remocao.

## Proximo PR recomendado

Remover apenas essas tres definicoes CSS de `src/assets/styles/components.css`, com:

- screenshot/E2E de Historico mobile estreito para confirmar que a ausencia de `btn-ghost--report` nao altera fluxo atual, ja que o seletor CSS era especifico de `#view-historico`;
- smoke visual de modais/botoes principais em Registro, Relatorio, Equipamentos, Orcamentos e Clientes;
- validacoes completas (`format`, `check`, `test`, `build`, E2E lifecycle).
