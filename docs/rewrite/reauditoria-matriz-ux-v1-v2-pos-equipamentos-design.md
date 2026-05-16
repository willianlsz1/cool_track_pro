# Reauditoria matriz UX v1-v2 pos Equipamentos visual

Data: 2026-05-16

## Objetivo

Reauditar a matriz UX v1-v2 apos o fechamento visual local de Equipamentos e
definir o proximo fluxo do app-v2 por lacuna ainda relevante e nao sensivel.

Esta etapa e documental. Ela nao altera runtime, CSS, contratos publicos,
storage real, Supabase/RLS, migrations, billing, PMOC, PDF/share, WhatsApp,
seguranca ou React Doctor.

## Evidencias revisadas

- `AGENTS.md`
- `docs/app-v2-goal.md`
- `docs/rewrite/auditoria-ux-funcional-v1-v2.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`
- `docs/rewrite/design-system-ui-fase-5-equipamentos-auditoria-visual.md`
- `docs/rewrite/design-system-ui-fase-6-equipamentos-qa-visual.md`
- `docs/rewrite/design-system-ui-fase-7-equipamentos-filtros-mobile.md`
- `docs/rewrite/qa-design-system-ui-fase-7-equipamentos-filtros/metrics.json`

## Anti-escopo

- Nao implementar codigo.
- Nao alterar Design System, tokens, CSS, Tailwind ou componentes.
- Nao iniciar PMOC. PMOC deve ser excluido deste ciclo e refeito em etapa
  propria futura.
- Nao alterar Supabase/RLS, schemas ou migrations. Migrations podem precisar ser
  refeitas em etapa propria, mas nao pertencem a esta reauditoria UX.
- Nao conectar storage real, upload real, billing real, assinatura, PDF/share,
  WhatsApp, seguranca ou React Doctor.

## Estado apos Equipamentos visual

Equipamentos fechou o ciclo visual local para lista, filtros, estado vazio,
texto longo e detalhe com anexos placeholder. A area permanece `parcial` na
matriz funcional porque as lacunas restantes sao sensiveis ou exigem etapa
propria:

- delecao destrutiva de equipamento;
- upload/storage real de fotos;
- gates reais de plano;
- persistencia real;
- Supabase/RLS/migrations;
- billing/assinatura.

Por isso, a estimativa geral permanece **76%**. A fase visual reduz risco de UX
local, mas nao muda o peso funcional da matriz.

## Candidatos ao proximo fluxo

| Prioridade | Fluxo                               | Decisao                                                                             |
| ---------- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| 1          | Design System/UI de `Servicos`      | Proximo fluxo recomendado, iniciando por auditoria visual documental.               |
| 2          | Acoes pos-salvamento do v1          | Ja ha orcamento mockado pos-fechamento e proxima preventiva por substituicao v2.    |
| 3          | Historico recente de servicos       | Filtros locais ja possuem checkpoint proprio; usar como evidencia visual.           |
| 4          | Orcamentos mock/local               | Pipeline, edicao e itens locais ja possuem checkpoints; usar como evidencia visual. |
| 5          | Relatorios consolidados locais      | Filtros e consolidado local ja possuem checkpoint; manter PDF/share fora.           |
| 6          | Equipamentos delecao/upload/storage | Bloqueado para etapa sensivel propria.                                              |
| 7          | PMOC                                | Excluido deste ciclo; refazer em nova etapa propria.                                |
| 8          | Supabase/RLS/migrations             | Etapa propria futura; possivel refazer migrations se necessario.                    |

## Decisao

O proximo checkpoint recomendado e:

> Design System/UI fase 8: auditoria visual documental de `Servicos` no
> app-v2, cobrindo Registros, Relatorios e Orcamentos locais apos os
> checkpoints funcionais ja existentes, sem alterar runtime, sem PDF/share real,
> WhatsApp real, storage real, Supabase/RLS, migrations, PMOC, billing real,
> assinatura, router novo ou redesign amplo.

## Riscos remanescentes

- A auditoria visual de `Servicos` pode encostar em Relatorios e Orcamentos; a
  proxima fase deve ser documental antes de qualquer CSS/runtime.
- Relatorios podem aproximar PDF/share; PDF/share deve continuar fora do escopo
  ate etapa dedicada.
- Supabase/RLS e migrations podem precisar ser refeitos, mas isso depende de
  decisao tecnica propria e nao de UX mock/local.

## Validacao

- `npm run format:check` passou apos `npm run format`.
- `git diff --check` passou.
