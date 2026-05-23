# Reauditoria funcional pos-fechamento visual

Data: 2026-05-16

## Objetivo

Reauditar documentalmente a matriz UX v1-v2 apos o fechamento da primeira
passada visual do app-v2 e escolher a proxima lacuna nao sensivel por evidencia,
sem implementar runtime nesta etapa.

## Escopo

- Revisar os candidatos listados no fechamento visual:
  - Historico/filtros;
  - Relatorios locais;
  - Orcamentos mock/action;
  - Clientes filtros/relatorio local.
- Confirmar se cada candidato esta aberto, parcialmente coberto ou ja executado
  no worktree atual.
- Separar lacuna funcional de lacuna sensivel.
- Definir o proximo checkpoint seguro.

## Fora de escopo

- Alterar `src/`, runtime, CSS, tokens, primitives ou componentes.
- Recalcular porcentagem oficial nesta etapa sem auditoria completa dos itens.
- Iniciar PMOC.
- Iniciar Supabase/RLS, migrations, storage real ou persistencia real.
- Iniciar billing real, assinatura, quotas, pricing ou feature paga.
- Iniciar PDF/share real ou WhatsApp real.
- Iniciar perfil real, security hardening, React Doctor ou redesign amplo.

## Evidencias revisadas

- `docs/app-v2-goal.md`.
- `docs/rewrite/matriz-paridade-v1-v2.md`.
- `docs/rewrite/auditoria-ux-funcional-v1-v2.md`.
- `docs/rewrite/design-system-ui-fase-12-fechamento-primeira-passada.md`.
- `docs/rewrite/servicos-registros-filtros-app-v2.md`.
- `docs/rewrite/relatorios-consolidados-locais-app-v2.md`.
- `docs/rewrite/orcamentos-mock-action-pos-fechamento-app-v2.md`.
- `docs/rewrite/orcamentos-fase-2-edicao-local-app-v2.md`.
- `docs/rewrite/orcamentos-fase-3-itens-locais-app-v2.md`.
- `docs/rewrite/clientes-fase-5-consulta-relatorio-local.md`.

## Estado dos candidatos

| Candidato                            | Evidencia atual                                                                                    | Decisao nesta reauditoria                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Historico/filtros                    | `servicos-registros-filtros-app-v2.md` e matriz registram filtros por periodo, cliente e status.   | Nao escolher runtime novo; candidato ja teve fatia executada.  |
| Relatorios locais                    | `relatorios-consolidados-locais-app-v2.md` e matriz registram filtros e resumo consolidado local.  | Nao escolher runtime novo; candidato ja teve fatia executada.  |
| Orcamentos mock/action               | Fases de orcamento registram criacao pos-fechamento, edicao e itens locais simples.                | Nao escolher runtime novo; candidato ja teve ciclo local.      |
| Clientes filtros/relatorio local     | `clientes-fase-5-consulta-relatorio-local.md` registra consulta, filtros e resumo por Cliente.     | Nao escolher runtime novo; candidato ja teve fatia executada.  |
| Recalculo documental da matriz geral | A auditoria ainda preserva a estimativa de 76% em varias atualizacoes sem nova auditoria completa. | Recomendado como proximo checkpoint antes de novas alteracoes. |

## Diagnostico

Os quatro candidatos citados pela fase 12 nao devem ser tratados como lacunas
novas neste ponto. O worktree atual ja contem documentos e historico de matriz
indicando que essas fatias foram executadas em ciclos anteriores.

A auditoria funcional ainda repete a estimativa geral de **76%** porque varias
atualizacoes reduziram lacunas locais sem recalcular oficialmente os 38 itens
ponderados. Continuar puxando runtime novo antes de normalizar a matriz cria
risco de repetir erro do v1: acumular evolucao sem uma fonte de verdade
atualizada.

## Decisao

O proximo checkpoint seguro nao e implementar uma nova fatia funcional.

O proximo checkpoint seguro e:

> Recalculo documental completo da matriz UX v1-v2 apos fechamento visual e
> candidatos nao sensiveis ja executados, revisando os 38 itens ponderados,
> atualizando status e percentual geral quando houver evidencia documental e de
> testes, sem alterar runtime e mantendo PMOC, Supabase/RLS, migrations, storage
> real, billing real, assinatura, PDF/share, WhatsApp, perfil real, security
> hardening e React Doctor em etapas proprias.

## Criterios para o proximo checkpoint

O recalculo documental deve:

- partir dos 38 itens ponderados ja usados pela auditoria funcional;
- atualizar somente itens com evidencia clara no codigo, testes ou documentos;
- diferenciar `coberto`, `coberto por substituicao v2`, `parcial`, `fora desta
etapa` e `pendente integracao sensivel`;
- nao contar PMOC, storage real, Supabase/RLS, migrations, billing, assinatura,
  PDF/share, WhatsApp, perfil real ou security hardening como lacuna de UX local
  resolvida;
- registrar incertezas em vez de forcar percentual artificial;
- terminar com proxima lacuna nao sensivel ou backlog sensivel claramente
  separado.

## Riscos remanescentes

- A porcentagem de **76%** pode estar conservadora ou desatualizada, mas nao deve
  ser alterada sem recalculo item a item.
- Parte da evidencia esta em arquivos nao commitados; o recalculo deve tratar o
  worktree atual como fonte, mas registrar essa condicao.
- PMOC continua excluido e deve ser refeito em nova etapa propria.
- Supabase/RLS e migrations podem precisar ser refeitos futuramente, mas isso
  pertence a etapa propria de dados/seguranca.

## Validacao

- `npm run format:check` falhou antes da formatacao em
  `docs/rewrite/reauditoria-funcional-pos-fechamento-visual.md`.
- `git diff --check` passou antes da formatacao.
- `npm run format` passou e formatou o novo relatorio.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou apos a formatacao.
