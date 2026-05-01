# Politica de congelamento do CSS legado

Data de aplicacao: 2026-05-01.

## Objetivo

Congelar formalmente o CSS legado principal depois da conclusao da migracao visual React + Tailwind. O congelamento reduz o risco de `components.css` continuar crescendo enquanto novas telas e blocos React passam a usar primitives compartilhadas e Tailwind com prefixo `tw-`.

Esta politica nao remove CSS e nao altera comportamento visual.

## Arquivos congelados

O arquivo principal congelado e:

- `src/assets/styles/components.css`

Os parciais em `src/assets/styles/components/*` tambem devem ser tratados como legado congelado quando forem usados por UI historica ou contratos visuais ainda preservados.

## Regra principal

Nao adicionar novas classes visuais em `src/assets/styles/components.css`.

Novas UIs React devem usar:

- componentes reutilizaveis em `src/react/components/ui`;
- ou Tailwind com prefixo `tw-`.

Classes legadas podem continuar no DOM como contrato publico enquanto uma tela/bloco ainda depender delas, mas isso nao autoriza adicionar novos estilos nesse arquivo.

## Alteracoes permitidas em `components.css`

Alteracoes em `components.css` so sao permitidas em PR proprio e com escopo explicito para:

- correcao de bug visual comprovado;
- correcao de seguranca comprovada;
- remocao de CSS morto comprovado;
- ajuste minimo documentado quando necessario para preservar contrato existente.

Qualquer mudanca fora desses casos deve ir para `src/react/components/ui`, Tailwind `tw-*` ou outro arquivo aprovado por plano proprio.

## Remocao de CSS legado

Familias grandes nao devem ser removidas por grep simples. Isso inclui, no minimo:

- `dash-*`
- `equip-*`
- `setor-*`
- `eq-*`
- `hist-*`
- `timeline*`
- `rel-*`
- `registro-*`
- `r-checklist*`
- `cli-*`
- `orc-*`
- `alert-*`
- `btn*`
- `empty-state*`
- `pro-*`, `upgrade-*` e `nudge-*`

Toda remocao de CSS precisa de:

1. prova de ausencia de uso real;
2. busca por geracao dinamica (`className`, `classList`, template strings e builders);
3. testes unitarios/island relevantes;
4. `npm run check`;
5. `npm run test`;
6. `npm run build`;
7. E2E da rota/bloco afetado quando aplicavel;
8. screenshot ou validacao visual quando afetar tela;
9. confirmacao de que a regra removida nao compartilha seletor composto com CSS vivo.

Se qualquer item falhar, a familia continua congelada.

## Fluxo recomendado

1. Criar ou evoluir primitives em `src/react/components/ui`.
2. Aplicar primitives em uma tela/bloco pequeno.
3. Preservar `data-*`, ids e classes legadas enquanto forem contrato publico.
4. Validar testes, build, E2E e screenshot.
5. Em PR separado, provar ausencia de uso da familia substituida.
6. Em outro PR pequeno, remover somente o CSS comprovadamente morto.

## Referencias

- `docs/migration/css-legacy-inventory.md`
- `docs/migration/css-refactor-accelerated-plan.md`
- `docs/migration/react-tailwind-cleanup-plan.md`
