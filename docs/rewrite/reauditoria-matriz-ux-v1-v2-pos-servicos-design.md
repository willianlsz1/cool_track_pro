# Reauditoria matriz UX v1-v2 pos Servicos visual

Data: 2026-05-16

## Objetivo

Reauditar a matriz UX v1-v2 apos o fechamento visual local de `Servicos` e
definir o proximo fluxo do app-v2 por lacuna ainda relevante e nao sensivel.

Esta etapa e documental. Ela nao altera runtime, CSS, contratos publicos,
storage real, Supabase/RLS, migrations, billing, PMOC, PDF/share, WhatsApp,
seguranca ou React Doctor.

## Evidencias revisadas

- `AGENTS.md`
- `docs/app-v2-goal.md`
- `docs/rewrite/auditoria-ux-funcional-v1-v2.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`
- `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-equipamentos-design.md`
- `docs/rewrite/design-system-ui-fase-8-servicos-auditoria-visual.md`
- `docs/rewrite/design-system-ui-fase-9-servicos-qa-visual.md`
- `docs/rewrite/qa-design-system-ui-fase-9-servicos/metrics.json`
- `docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`
- `docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`

## Anti-escopo

- Nao implementar codigo.
- Nao alterar Design System, tokens, CSS, Tailwind ou componentes.
- Nao iniciar PMOC. PMOC deve ser excluido deste ciclo e refeito em etapa
  propria futura.
- Nao alterar Supabase/RLS, schemas ou migrations. Migrations podem precisar ser
  refeitas em etapa propria, mas nao pertencem a esta reauditoria UX.
- Nao conectar storage real, upload real, billing real, assinatura, PDF/share,
  WhatsApp, seguranca ou React Doctor.

## Estado apos Servicos visual

`Servicos` fechou o ciclo visual local para Registros, Relatorios e Orcamentos
nos cenarios cobertos pela fase 9:

- registros default, filtro sem resultado e texto tecnico;
- relatorios dashboard, filtro sem resultado e preview local;
- orcamentos pipeline, edicao local e item longo;
- mobile 390, desktop 1366 e desktop 1920;
- 27 cenarios sem overflow horizontal de pagina e sem elemento visivel fora da
  viewport apos ajuste pontual em `ServicesHome`.

A area permanece parcialmente limitada na matriz funcional apenas pelas saidas
reais ou sensiveis, principalmente PDF/share real, WhatsApp real, storage real,
Supabase/RLS, migrations e integracoes de assinatura/billing. Essas lacunas nao
devem puxar o proximo checkpoint de UX mock/local.

Por isso, a estimativa geral permanece **76%**. A fase visual reduz risco de UX
local, mas nao muda o peso funcional da matriz.

## Candidatos ao proximo fluxo

| Prioridade | Fluxo                                  | Decisao                                                                               |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------------------- |
| 1          | Design System/UI de `Conta`            | Proximo fluxo recomendado, iniciando por auditoria visual documental.                 |
| 2          | Home Hoje                              | Ciclo visual ja encerrado nas fases 2 a 4; nao reabrir sem novo achado objetivo.      |
| 3          | Equipamentos                           | Ciclo visual ja encerrado nas fases 5 a 7; lacunas restantes sao sensiveis/proprias.  |
| 4          | Servicos                               | Ciclo visual ja encerrado nas fases 8 e 9 para Registros, Relatorios e Orcamentos.    |
| 5          | Clientes dentro de Equipamentos        | Funcionalmente coberto como subvisao; deve entrar em QA visual junto de Equipamentos. |
| 6          | PDF/share, WhatsApp e relatorios reais | Bloqueado para etapa sensivel propria.                                                |
| 7          | PMOC                                   | Excluido deste ciclo; refazer em nova etapa propria.                                  |
| 8          | Supabase/RLS/migrations                | Etapa propria futura; possivel refazer migrations se necessario.                      |

## Decisao

O proximo checkpoint recomendado e:

> Design System/UI fase 10: auditoria visual documental de `Conta` no app-v2,
> cobrindo atalhos locais, preferencias em memoria, lembrete local, ajuda,
> estados locais, texto longo, foco, mobile/desktop e densidade compacta,
> sem alterar runtime, sem storage real, sem Supabase/RLS, sem migrations, sem
> PMOC, sem billing real, sem assinatura, sem PDF/share, sem WhatsApp, sem
> perfil real e sem redesign amplo.

## Riscos remanescentes

- `Conta` toca termos de perfil, billing e assinatura; a proxima fase deve
  manter esses itens como bloqueios de etapa propria, nao como recursos locais.
- Preferencias de `Conta` sao em memoria; nao devem ser confundidas com
  persistencia real.
- A densidade compacta pode revelar problema visual em mobile, mas qualquer
  ajuste deve depender de evidencia objetiva em QA posterior.

## Validacao

- Reauditoria documental feita sobre artefatos atuais do app-v2.
- Nao houve alteracao de runtime.
- `npm run format` passou.
- `npm run format:check` passou.
- `git diff --check` passou.
