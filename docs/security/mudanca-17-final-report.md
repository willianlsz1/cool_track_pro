# Mudanca 17 - Relatorio final de security hardening

Data: 2026-05-09

## Resumo executivo final

A Mudanca 17 fica encerrada como hardening de seguranca operacional. Os
achados high e os principais riscos medium priorizados foram tratados em CPs
pequenos, validados e documentados. Os riscos remanescentes foram registrados
como backlog controlado ou limitacoes arquiteturais conhecidas.

Este fechamento nao significa seguranca perfeita. A seguranca continua como
manutencao continua do produto, com novas validacoes a cada mudanca de fluxo,
storage, permissoes, billing, PDF/share, autenticacao ou infraestrutura.

Status final recomendado:

- Seguranca / Mudanca 17: 100% como hardening operacional concluido.
- Proxima fase: Mudanca 18 / CP-A - Planejamento das mudancas de fluxo.
- A proxima fase deve iniciar read-only, sem redesign e sem alteracao de
  codigo antes de novo diagnostico.

## Base analisada

- Branch base: `main`
- Base estavel de referencia da Mudanca 16:
  `5d07464beb9686cdcea6459752ed1a57c6263cd4`
- HEAD de referencia apos CP-I: `176cca130af5367a1d0e2445aa3ff898cdc19549`
- Documento principal de triagem:
  `docs/security/mudanca-17-codex-security-triage.md`
- Origem inicial dos achados: Codex Security CSV triado no CP-A.

## Consolidacao dos CPs

| CP   | Foco                                         | Resultado                                                                                                                           | Status                         |
| ---- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| CP-A | Triagem Codex Security                       | 75 achados classificados: 4 high, 21 medium, 6 low e 44 informational                                                               | Concluido                      |
| CP-B | Billing profile e `usage_monthly`/quotas     | Escrita client-side em billing sensivel e quotas bloqueada; `service_role` e RPC preservados; teste TAP e script manual criados     | Concluido/validado             |
| CP-C | Entitlement Stripe apos pagamento confirmado | `checkout.session.completed` nao promove plano pago; `invoice.paid` virou caminho seguro; estados pendentes/falhos tratados         | Concluido                      |
| CP-D | Chave Supabase frontend                      | Contrato explicito `VITE_SUPABASE_ANON_KEY`; rejeicao defensiva de JWT `service_role` no frontend                                   | Concluido                      |
| CP-E | Gate server-side para assinatura digital     | Free nao persiste assinatura nem escreve `assinatura.png`; Plus/Pro e `service_role` preservados; teste TAP e script manual criados | Concluido                      |
| CP-F | Dados locais, logout e troca de usuario      | Caches sensiveis escopados/limpos, fila de fotos com `userId`, reload em troca de usuario autenticado                               | Concluido, commitado e enviado |
| CP-G | Superficies publicas anti-abuso              | `analytics_events`, feedback e `registro-fotos` endurecidos; payloads e ownership reforcados                                        | Concluido, commitado e enviado |
| CP-H | XSS, tokens e links PDF                      | Escaping em `/conta`, redaction em observability, links PDF/PMOC restritos a URLs absolutas `http/https`                            | Concluido, commitado e enviado |
| CP-I | Lifecycle de exclusao de conta               | Storage antes de DB/Auth, falha fechada, usuario alvo apenas pelo JWT validado, lifecycle destrutivo isolado                        | Concluido, commitado e enviado |
| CP-J | Fechamento documental                        | Consolidacao final, riscos remanescentes e transicao para Mudanca 18 registrados                                                    | Concluido neste relatorio      |

## Commits relevantes conhecidos

| CP   | Commit                                     | Mensagem                                           |
| ---- | ------------------------------------------ | -------------------------------------------------- |
| CP-F | `551c8bf8c5df45e22295c760ba1c3d04724cb671` | `fix(security): harden local user data isolation`  |
| CP-G | `b499210bcaab054649de11f557854d9725af5dc0` | `fix(security): harden public abuse surfaces`      |
| CP-H | `ce0607444a8ddc96a1c62dcbad6504fe8391aef9` | `fix(security): harden xss tokens and pdf links`   |
| CP-I | `176cca130af5367a1d0e2445aa3ff898cdc19549` | `fix(security): harden account deletion lifecycle` |

Os CPs anteriores tambem compoem a fase, mas seus hashes nao foram
reconsolidados neste fechamento documental.

## Achados high tratados

| Achado high                                            | CP   | Mitigacao                                                                                                               |
| ------------------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| Users can self-modify billing profile fields           | CP-B | Campos sensiveis de billing/plano foram protegidos contra escrita direta por usuario comum.                             |
| Stripe webhook grants Pro before payment is confirmed  | CP-C | Plano pago deixou de ser liberado por `checkout.session.completed`; promocao passou a depender de pagamento confirmado. |
| Frontend build can expose privileged Supabase key      | CP-D | Frontend passou a exigir anon key explicita e rejeitar defensivamente JWT com role `service_role`.                      |
| Client-only signature paywall permits free Storage use | CP-E | Assinatura digital passou a ter gate server-side em banco/storage, preservando fotos normais.                           |

## Principais medium tratados

- Dados locais, logout, troca de usuario e caches com PII foram endurecidos no
  CP-F.
- Filas IndexedDB de fotos pendentes passaram a carregar `userId` e ignorar
  pendencias de outro usuario no CP-F.
- Analytics, feedback e uploads controlados pelo cliente foram endurecidos no
  CP-G.
- XSS persistente em dados de perfil, tokens em observability e links PDF/PMOC
  foram mitigados no CP-H.
- Lifecycle de exclusao de conta deixou de retornar sucesso falso em falhas
  criticas no CP-I.

## Validacoes executadas ao longo da fase

As validacoes foram executadas por CP conforme o escopo de cada mudanca:

- `npm run format`
- `npm run build`
- `npm run check`
- testes focados JS quando codigo frontend/core foi alterado;
- testes SQL/RLS oficiais em formato TAP/pg_prove quando migrations/policies
  foram alteradas;
- scripts manuais SQL Editor quando a validacao manual no Supabase era util;
- `git diff --check` nos CPs finais com commit/push.

Validacoes SQL/RLS oficiais dependem de ambiente com Docker/Supabase local ou
CI. Quando o ambiente local nao estava disponivel, a fase manteve teste oficial
versionado e script manual equivalente quando aplicavel.

## Riscos remanescentes aceitos

Os itens abaixo ficam como backlog controlado ou limitacao conhecida. Eles nao
foram corrigidos no CP-J porque o objetivo deste CP e documental.

- Warnings Vite static+dynamic/chunk size continuam como backlog tecnico
  controlado.
- Warning ESLint conhecido em `src/domain/pdf/shareReport.js` continua para CP
  futuro dedicado.
- Validacao SQL/RLS oficial com `supabase test db` depende de Docker/Supabase
  local ou CI.
- RLS e check constraints nao implementam rate limit real por IP/sessao; abuso
  volumetrico exigiria Edge Function, backend dedicado, WAF ou mecanismo
  equivalente.
- PDF/WhatsApp limits ainda usam `localStorage` e ficam para CP futuro de
  produto/billing.
- URL do browser no fluxo recovery nao foi limpa para evitar regressao no
  callback Supabase; a mitigacao atual redige tokens em observability/logs.
- Account deletion ainda nao tem atomicidade distribuida entre Storage, SQL
  sequencial e Auth; falha fechada pode exigir reexecucao ou suporte
  operacional.
- `registros.assinatura` tem contrato legado ambiguo entre boolean e
  referencia Storage como objeto/string.
- Ambientes de deploy e GitHub Secrets precisam manter
  `VITE_SUPABASE_ANON_KEY` corretamente configurado.

## Backlog futuro separado

Nao misturar estes itens com o fechamento da Mudanca 17:

- CP dedicado para warnings Vite static+dynamic/chunk size.
- CP dedicado para `src/domain/pdf/shareReport.js`.
- CP futuro para rate limit real de superficies publicas.
- CP futuro para contrato/schema de `registros.assinatura`.
- CP futuro de produto/billing para limites PDF/WhatsApp server-side.
- React Doctor.
- Design/redesign.
- Mudancas de fluxo do sistema.

## Proxima fase recomendada

Proxima fase: Mudanca 18 - Mudancas de fluxo do sistema.

Proximo CP recomendado:

- Mudanca 18 / CP-A - Planejamento das mudancas de fluxo.

Esse CP deve ser inicialmente read-only/planejamento. Escopo esperado:

1. Revalidar base com `git status`, diff e testes.
2. Atualizar contratos de Clientes para rota sempre acessivel.
3. Remover hard paywall de entrada e limitar criacao no Free.
4. Definir Free = 1 cliente.
5. Ajustar shell/nav mobile e desktop.
6. Desacoplar Cliente -> Setores.
7. Implementar orquestrador unico de Registrar servico.
8. Depois tratar onboarding.
9. Depois tratar monetizacao de PDF/cotas.
10. Nao misturar com redesign amplo.

## Declaracao de fechamento

A Mudanca 17 esta encerrada como hardening de seguranca operacional. Os achados
high e os principais riscos medium priorizados foram tratados em CPs pequenos,
validados e documentados. Riscos remanescentes foram registrados como backlog
controlado ou limitacoes arquiteturais conhecidas.
