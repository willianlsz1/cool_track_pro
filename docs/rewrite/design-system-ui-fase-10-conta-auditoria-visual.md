# Design System/UI fase 10 - auditoria visual Conta

Data: 2026-05-16

## Objetivo

Auditar documentalmente a area `Conta` do app-v2 antes de qualquer QA visual em
browser ou ajuste visual de runtime.

Esta fase cobre atalhos locais, preferencias em memoria, lembrete local, ajuda,
estados locais, texto longo, foco, mobile/desktop e densidade compacta.

## Escopo

- Revisar o contrato visual e funcional local de `Conta`.
- Identificar riscos visuais antes de alterar codigo.
- Definir matriz minima de QA visual futura.
- Separar explicitamente integracoes sensiveis e perfil real.
- Atualizar documentos de acompanhamento.

## Fora de escopo

- Alterar `src/`, runtime, CSS, tokens, primitives ou componentes.
- Criar perfil real, billing real, assinatura, plano, quota ou feature paga.
- Persistir preferencias em storage real, localStorage ou Supabase.
- Alterar Supabase/RLS, schemas, migrations ou permissoes.
- Iniciar PMOC.
- Implementar PDF/share, WhatsApp, suporte externo ou feedback real.
- Router novo, security hardening, React Doctor ou redesign amplo.

## Evidencias revisadas

- `AGENTS.md`
- `docs/app-v2-goal.md`
- `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-servicos-design.md`
- `docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`
- `docs/rewrite/configuracoes-conta-fase-2-ui-local.md`
- `docs/rewrite/configuracoes-conta-fase-3-preferencias-visiveis.md`
- `docs/rewrite/configuracoes-conta-fase-4-microcopy-estados-locais.md`
- `docs/rewrite/configuracoes-conta-fase-5-a11y-responsividade-local.md`
- `docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md`
- `src/app-v2/account/AccountHome.tsx`
- `src/app-v2/account/accountViewModel.ts`
- `src/app-v2/account/accountViewModel.test.ts`
- `src/app-v2/shell/AppV2ShellAccount.test.tsx`

## Estado atual de Conta

`Conta` deixou de ser placeholder no criterio mock/local. A area hoje renderiza:

- cabecalho `Conta` com subtitulo `Painel local`;
- resumo de preferencias locais;
- estado local `Sem pendencias locais`;
- limite explicito `Somente local`;
- grupo de atalhos operacionais para registro, Clientes, Orcamentos e alertas;
- preferencias de densidade, tela inicial e lembrete visual;
- ajuda local com orientacao curta.

As preferencias sao aplicadas somente em memoria. Isso deve continuar claro na
UI e na documentacao ate existir etapa propria de persistencia.

## Riscos visuais identificados

| Risco                        | Evidencia estatica                                      | Decisao para QA futuro                                      |
| ---------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| Densidade compacta em mobile | `layoutClassName` alterna `tw-gap-5` para `tw-gap-3`.   | Capturar `Conta` confortavel e compacta em mobile 390.      |
| Atalhos com texto longo      | botoes usam `tw-min-w-0` e `tw-break-words`.            | Forcar cenario de texto longo em atalhos e ajuda.           |
| Controles de preferencias    | selects ocupam `tw-w-full` em grid `md:tw-grid-cols-3`. | Medir overflow em mobile e desktop 1366/1920.               |
| Lembrete local condicional   | banner aparece apenas quando `reminderEnabled` liga.    | Capturar estado sem lembrete e com lembrete ativo.          |
| Termos sensiveis proximos    | Conta encosta em perfil, billing e assinatura.          | Verificar que a UI nao promete perfil real ou plano pago.   |
| Hierarquia por cards         | muitos `SectionCard` em sequencia.                      | Confirmar leitura sem excesso de blocos em mobile estreito. |
| Foco de teclado              | selects, botoes e atalhos usam foco de primitives.      | Incluir foco em botao/atalho ou select no QA real.          |

## Matriz minima de QA visual futura

| Viewport     | Cenarios obrigatorios                                                                  |
| ------------ | -------------------------------------------------------------------------------------- |
| mobile 390   | default confortavel, compacta, lembrete ativo, foco em atalho, texto longo local.      |
| desktop 1366 | default confortavel, compacta, lembrete ativo, grid de preferencias e atalhos.         |
| desktop 1920 | default confortavel, compacta, texto longo local e leitura de secoes sem espichamento. |

Metricas obrigatorias:

- overflow horizontal de pagina;
- elementos visiveis fora da viewport;
- texto visivel quebrando ou truncando de forma incoerente;
- bottom nav sem cobrir acao no mobile;
- sidebar desktop preservada;
- foco visivel em controles interativos.

## Decisoes

- Nao ha ajuste visual autorizado nesta fase.
- `Conta` deve passar por QA visual real antes de qualquer refinamento.
- A proxima fase pode corrigir somente achado visual pequeno com evidencia
  objetiva.
- Perfil real, persistencia, billing, assinatura, Supabase/RLS, migrations, PMOC,
  PDF/share, WhatsApp e suporte real permanecem bloqueados para etapas proprias.

## Proximo checkpoint recomendado

Design System/UI fase 11: executar QA visual real de `Conta` app-v2 em browser
com screenshots mobile 390, desktop 1366 e desktop 1920, cobrindo estado default,
densidade compacta, lembrete ativo, foco em controle, texto longo local e
preferencias; somente depois decidir se existe ajuste visual pequeno; sem
runtime funcional novo, sem storage real, sem localStorage, sem Supabase/RLS, sem
migrations, sem PMOC, sem billing real, sem assinatura, sem PDF/share, sem
WhatsApp, sem perfil real e sem redesign amplo.

## Validacao

- Auditoria documental feita sobre documentos e componentes atuais.
- Nao houve alteracao de runtime.
- `npm run format` passou.
- `npm run format:check` passou.
- `git diff --check` passou.
