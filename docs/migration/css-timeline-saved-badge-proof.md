# Prova CSS: `timeline__saved-badge`

Data da analise: 2026-05-01.
Remocao aplicada: 2026-05-01.

## Objetivo

Provar se a microfamilia CSS pequena `timeline__saved-badge` esta viva, morta ou inconclusiva antes de qualquer remocao de CSS.

Resultado: comprovadamente morta. A classe aparecia apenas em CSS de producao e docs; nao ha render em React, adapter legado, shell, testes ou E2E. O seletor foi removido cirurgicamente de `src/assets/styles/desktop-fonts.css`.

## Motivo da escolha

`timeline__saved-badge` estava marcada como suspeita em `docs/migration/css-legacy-inventory.md`, pertence apenas ao fluxo Historico/timeline, tem nome especifico e nao colide com as familias vivas `timeline__item--saved`, `timeline__dot--*` ou `hist-*`.

## Comandos de busca

### `git grep -n "timeline__saved-badge"`

Matches:

- `docs/migration/css-legacy-inventory.md`
- `src/assets/styles/desktop-fonts.css:261`

Classificacao:

- CSS de producao: `src/assets/styles/desktop-fonts.css:261`
- Codigo fonte: nenhum
- Testes/E2E: nenhum
- Docs/provas: `docs/migration/css-legacy-inventory.md`

### `git grep -n "saved-badge"`

Matches:

- `docs/migration/css-legacy-inventory.md`
- `src/assets/styles/desktop-fonts.css:261`

Classificacao: mesma do grep principal. Nao ha outra familia `saved-badge` no codigo.

### `git grep -n "timeline__saved-badge" -- src/react src/ui e2e src/__tests__ src/tests`

Sem resultados.

### `git grep -n "saved-badge" -- src/react src/ui e2e src/__tests__ src/tests`

Sem resultados.

### `git grep -n -E "timeline__saved-badge.*status|status.*timeline__saved-badge|timeline__saved-badge.*saved|saved.*timeline__saved-badge"`

Sem resultados.

### `git grep -n -E "className.*saved-badge|saved-badge.*className|classList.*saved-badge|saved-badge.*classList"`

Sem resultados.

### `git grep -n -E "timeline.*saved|saved.*timeline" -- src/react src/ui e2e src/__tests__ src/tests docs src/assets/styles`

Matches relevantes:

- `src/assets/styles/desktop-fonts.css:261`: `.timeline__saved-badge`
- `src/assets/styles/components.css:14709`: `.timeline__item--saved`
- `src/ui/components/onboarding/savedHighlight.js`: adiciona/remove `timeline__item--saved`
- docs do inventario e prova de `orc-timeline*`

Conclusao do cruzamento: `timeline__item--saved` esta viva e nao deve ser confundida com `timeline__saved-badge`. A classe auditada `timeline__saved-badge` nao e gerada pelo highlight salvo atual.

## Definicao CSS encontrada

Arquivo: `src/assets/styles/desktop-fonts.css`

Seletor:

```css
.timeline__saved-badge {
  font-size: 11px;
}
```

Contexto: ajuste tipografico dentro de `desktop-fonts.css`. Nao ha seletor base correspondente em `components.css`, `theme-premium.css`, React, adapters, shell, testes ou E2E.

## Classificacao

| Classe                  | Status                | Evidencia                                                                 |
| ----------------------- | --------------------- | ------------------------------------------------------------------------- |
| `timeline__saved-badge` | Comprovadamente morta | Apenas CSS/docs; sem render, `className`, `classList`, teste ou contrato. |

## Remocao aplicada

Seletor removido:

```css
.timeline__saved-badge {
  font-size: 11px;
}
```

Arquivo alterado: `src/assets/styles/desktop-fonts.css`.

Prova depois da remocao: `git grep -n "timeline__saved-badge"` e `git grep -n "saved-badge"` devem retornar apenas docs/provas historicas.

## Preservacoes

- `timeline__item--saved` continua vivo e fora do escopo desta prova.
- `timeline__dot--*` e `timeline__item--*` continuam fora do escopo desta prova.
- `hist-*`, sheet mobile do Historico e contratos `data-hist-action`, `data-reg-id`, `data-equip-id`, `data-photo-url` e `data-tipo-id` nao foram alterados.
- Apenas `.timeline__saved-badge` foi removido; nenhum outro seletor `timeline*` foi alterado.

## Recomendacao

Remocao aplicada. Proxima etapa recomendada: escolher outra microfamilia pequena do inventario e criar prova dedicada antes de qualquer remocao.

Validacoes recomendadas para o PR de remocao:

- `git grep -n "timeline__saved-badge"`
- `git grep -n "timeline__item--saved"`
- `npm run format`
- `npm run check`
- `npm run test`
- `npm run build`
- smoke visual/E2E de Historico se a remocao for combinada com qualquer mudanca fora de docs/CSS.
