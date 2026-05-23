# Reauditoria matriz UX v1-v2 pos Conta visual

Data: 2026-05-16

## Objetivo

Reauditar documentalmente a matriz UX v1-v2 apos o fechamento visual de
`Conta`, confirmar quanto a fase visual alterou ou nao a estimativa geral e
escolher o proximo checkpoint seguro do app-v2.

## Escopo

- Revisar o estado documentado da matriz UX v1-v2.
- Revisar a auditoria funcional v1-v2.
- Considerar o fechamento visual recente de Home Hoje, Equipamentos, Servicos e
  Conta.
- Separar lacunas funcionais reais de lacunas visuais ja fechadas no recorte
  local.
- Definir o proximo checkpoint sem tocar areas sensiveis.

## Fora de escopo

- Alterar `src/`, runtime, CSS, tokens, primitives ou componentes.
- Reabrir Home Hoje, Equipamentos, Servicos ou Conta sem novo achado objetivo.
- PMOC.
- Supabase/RLS.
- Migrations.
- Storage real, localStorage ou persistencia real.
- Billing real, assinatura, quotas, pricing ou feature paga.
- PDF/share real.
- WhatsApp real.
- Perfil real.
- Router global, seguranca, React Doctor ou redesign amplo.

## Evidencias revisadas

- `docs/app-v2-goal.md`.
- `docs/rewrite/matriz-paridade-v1-v2.md`.
- `docs/rewrite/auditoria-ux-funcional-v1-v2.md`.
- `docs/rewrite/design-system-ui-fase-10-conta-auditoria-visual.md`.
- `docs/rewrite/design-system-ui-fase-11-conta-qa-visual.md`.
- `docs/rewrite/qa-design-system-ui-fase-11-conta/metrics.json`.
- Relatorios recentes de Home Hoje, Equipamentos e Servicos dentro de
  `docs/rewrite/`.

## Estado apos Conta visual

O ciclo visual recente das areas principais do app-v2 fica assim:

| Area app-v2  | Estado visual no recorte atual                                              |
| ------------ | --------------------------------------------------------------------------- |
| Home Hoje    | Checklist, QA visual e fechamento local concluidos.                         |
| Equipamentos | Auditoria, QA visual e ajuste de filtros mobile concluidos.                 |
| Servicos     | Auditoria e QA visual concluidos para Registros, Relatorios e Orcamentos.   |
| Conta        | Auditoria e QA visual concluidos para estados locais, preferencias e ajuda. |

`Conta` foi validada em 13 cenarios entre mobile 390, desktop 1366 e desktop
1920, sem overflow horizontal de pagina, sem elementos visiveis fora da viewport
e sem termos sensiveis visiveis.

## Impacto na estimativa UX v1-v2

A estimativa geral permanece **76%**.

Motivo: a fase visual fechou riscos de layout, responsividade e leitura, mas nao
criou nova paridade funcional. As lacunas restantes continuam concentradas em
capacidades sensiveis ou em etapas proprias, como persistencia real, Supabase,
RLS, migrations, billing/assinatura, PMOC, PDF/share, WhatsApp, perfil real e
security hardening.

PMOC permanece excluido deste ciclo e deve ser refeito em nova etapa propria.
Supabase/RLS e migrations tambem permanecem em etapa propria futura; algumas
migrations podem ser refeitas se necessario, mas essa decisao nao pertence a
esta reauditoria UX/documental.

## Candidatos ao proximo checkpoint

| Candidato                                                     | Decisao           | Motivo                                                                  |
| ------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------- |
| Reabrir Home Hoje                                             | Nao recomendado   | Ciclo visual local ja fechado; sem novo achado objetivo.                |
| Reabrir Equipamentos                                          | Nao recomendado   | Ciclo visual local ja fechado; lacunas restantes sao sensiveis.         |
| Reabrir Servicos                                              | Nao recomendado   | Ciclo visual local ja fechado; PDF/share, WhatsApp e PMOC sao proprios. |
| Reabrir Conta                                                 | Nao recomendado   | QA visual recente nao encontrou achado bloqueante.                      |
| Iniciar PMOC                                                  | Bloqueado         | PMOC deve ser excluido deste ciclo e refeito em nova etapa.             |
| Iniciar Supabase/RLS/migrations                               | Bloqueado         | Exige etapa propria de dados, seguranca e contratos.                    |
| Iniciar billing, assinatura, perfil real, PDF/share, WhatsApp | Bloqueado         | Sao areas sensiveis com criterios proprios.                             |
| Fechamento documental da primeira passada visual              | Recomendado agora | Consolida evidencias e evita repetir ciclo visual sem criterio novo.    |

## Decisao

O proximo checkpoint seguro e:

> Design System/UI fase 12: fechamento documental da primeira passada visual do
> app-v2, consolidando Home Hoje, Equipamentos, Servicos e Conta, evidencias de
> QA, criterios aceitos, limites do que nao foi coberto e gates para nao
> reabrir visual sem novo achado objetivo; sem alterar runtime, sem CSS, sem
> tokens, sem componentes, sem storage real, sem Supabase/RLS, sem migrations,
> sem PMOC, sem billing real, sem assinatura, sem PDF/share, sem WhatsApp, sem
> perfil real, sem security hardening e sem React Doctor.

## Riscos remanescentes

- A primeira passada visual nao significa UX v2 100% migrada.
- A estimativa funcional permanece **76%** ate que lacunas funcionais reais
  sejam tratadas em etapas proprias.
- Areas sensiveis podem exigir refazer contratos, migrations ou adaptadores no
  futuro.
- Reabrir visual sem achado objetivo tende a gerar retrabalho e repetir erros do
  v1.

## Validacao

- `npm run format:check` falhou antes da formatacao em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-conta-design.md`.
- `git diff --check` passou antes da formatacao.
- `npm run format` passou e formatou o novo relatorio.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou apos a formatacao.
