# app-v2 - CP-AL - checklist go/no-go do primeiro corte

## Objetivo

Consolidar o estado atual para decidir quando o app-v2 pode substituir o v1
como versao principal no Cloudflare Pages.

Esta CP e documental. Ela nao aprova o corte por si so e nao altera runtime,
router, storage real, Supabase/RLS, PDF/share, WhatsApp, billing,
upload/storage, PMOC ou v1.

## Estado verificado

- Branch: `codex/rewrite-zero-react-parallel`
- HEAD analisado: `d8a38efeaa48bc8b2c005afc4a9ffd388d67fa3d`
- PR: `https://github.com/Willianlsz1/Cool_Track_Pro/pull/287`
- PR status: draft
- Merge state: `CLEAN`
- Checks externos verdes:
  - `test-and-build`
  - `Playwright`
  - `pgTAP`
  - `size-limit`
  - `Cloudflare Pages`
  - `Supabase Preview`
  - `netlify/cooltrackpro/deploy-preview`

## Gates tecnicos fechados

| Gate                              | Estado | Evidencia                                                       |
| --------------------------------- | ------ | --------------------------------------------------------------- |
| `index.html` usa bootstrap app-v2 | Verde  | CP-AB                                                           |
| Build/test/check do PR            | Verde  | PR #287 em `d8a38ef`                                            |
| Bundle size                       | Verde  | check `size-limit` no PR #287                                   |
| E2E app-v2                        | Verde  | check `Playwright` no PR #287                                   |
| Cloudflare Pages deploy           | Verde  | preview `https://fb80e025.cool-track-pro.pages.dev`             |
| Rotas principais externas         | Verde  | CP-AJ e CP-AK                                                   |
| Mobile/desktop externo            | Verde  | CP-AK: 12 combinacoes sem overflow e com navegacao visivel      |
| Fallback de preview sem env       | Verde  | CP-AI evita tela vazia quando env Supabase nao esta configurada |
| Rollback documental               | Verde  | CP-AB                                                           |

## Gates ainda abertos

| Gate                                    | Estado   | O que falta                                        |
| --------------------------------------- | -------- | -------------------------------------------------- |
| Sessao Supabase real no browser         | Aberto   | Conta de teste para executar CP-Y                  |
| Escrita real minima cliente/equipamento | Aberto   | CP-Y com usuario autenticado real                  |
| Isolamento real entre usuarios          | Aberto   | CP-Y ou etapa RLS dedicada com dois usuarios reais |
| Aprovacao das areas fora do corte       | Pendente | Decisao explicita do usuario/produto               |
| PR pronto para merge                    | Pendente | Remover draft somente depois dos gates acima       |

## Decisao pendente sobre areas fora do primeiro corte

Para o primeiro corte operacional minimo, a recomendacao tecnica atual e deixar
as areas abaixo fora da versao principal inicial, mantendo-as como etapas
sensiveis proprias:

| Area fora do corte inicial      | Motivo tecnico                                                 | Condicao para entrar depois                                 |
| ------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| PDF/share real                  | Depende de persistencia real, quotas, seguranca e contratos    | CP dedicada de PDF/share com testes e validacao de download |
| WhatsApp real                   | Depende de payload persistido, quota e fluxo de erro           | CP dedicada de share/cotas                                  |
| Billing/features pagas          | Gate client-side seria burlavel sem server-side                | CP dedicada com Stripe/Supabase e testes de entitlement     |
| Upload/storage real de fotos    | Exige ownership, storage policies, limites e fallback          | CP dedicada de storage/upload                               |
| PMOC real                       | Fluxo regulatorio deve ficar isolado                           | CP dedicada depois de persistencia e PDF                    |
| Assinatura digital real         | Exige contrato legal/storage/PDF                               | CP dedicada de assinatura                                   |
| Orcamento real com aceite/envio | Exige ciclo real de proposta, aceite, PDF/share e persistencia | CP dedicada apos persistencia/billing/share                 |

## Checklist de aprovacao final

Antes de transformar o app-v2 na versao principal final:

- [ ] Executar CP-Y com conta Supabase real de teste.
- [ ] Confirmar leitura real de cliente/equipamento sob usuario autenticado.
- [ ] Confirmar escrita real minima de cliente.
- [ ] Confirmar escrita real minima de equipamento vinculado ao cliente.
- [ ] Confirmar que dados de outro usuario nao aparecem.
- [ ] Aprovar explicitamente que PDF/share real fica fora do primeiro corte.
- [ ] Aprovar explicitamente que WhatsApp real fica fora do primeiro corte.
- [ ] Aprovar explicitamente que billing/features pagas ficam fora do primeiro
      corte.
- [ ] Aprovar explicitamente que upload/storage real fica fora do primeiro
      corte.
- [ ] Aprovar explicitamente que PMOC real fica fora do primeiro corte.
- [ ] Aprovar explicitamente que assinatura digital real fica fora do primeiro
      corte.
- [ ] Aprovar explicitamente que orcamento real com aceite/envio externo fica
      fora do primeiro corte.
- [ ] Tirar PR #287 de draft.
- [ ] Fazer merge/promocao com rollback documentado.

## Proximo passo

O proximo passo executavel e CP-Y. Para isso, e necessario fornecer ou criar uma
conta Supabase real de teste no projeto usado por `.env.local`.
