# app-v2 - Primary cutover matrix CP-Z

## Objetivo

Definir, com base no estado atual do repositório, quais fluxos precisam estar
verdes para o app-v2 substituir o v1 como entrada principal do produto.

Esta CP é documental. Ela não altera runtime, `index.html`, router, storage real,
Supabase/RLS, PDF/share, WhatsApp, billing, upload, PMOC, v1 ou configs.

## Estado verificado

- Branch: `codex/rewrite-zero-react-parallel`
- HEAD inicial da CP: `b940f262bc7fa7b5f2010c2788ef25f7f41af0d0`
- Working tree inicial: limpo
- Entrada principal atual: CP-AB trocou `index.html` para `/src/app-v2/main.tsx`
- App-v2 atual: disponível via `src/app-v2/preview.html` e
  `src/app-v2/authenticated-preview.html`

## Fontes revisadas

- `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`
- `docs/rewrite/auditoria-ux-funcional-v1-v2.md`
- `docs/rewrite/reauditoria-funcional-pos-fechamento-visual.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`
- `src/app.js`
- `src/app-v2/index.tsx`
- `src/app-v2/preview.html`
- `src/app-v2/authenticated-preview.html`
- `.github/workflows/ci.yml`
- `.github/workflows/e2e.yml`
- `vite.config.js`

## Critérios de corte

Classificação usada nesta matriz:

- **Obrigatório para trocar:** sem isso, v2 não deve substituir v1.
- **Pode ficar fora do primeiro corte:** aceitável somente se aprovado
  explicitamente como limitação da primeira versão principal.
- **Etapa sensível própria:** não deve ser misturado com a troca de entrada.

## Matriz por fluxo

| Fluxo                    | Estado app-v2 atual                                                       | Decisão para corte                                 | Evidência atual                                                         | Próxima evidência necessária                                  |
| ------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| Entrada principal `/`    | CP-AB trocou para `/src/app-v2/main.tsx`                                  | Concluído para corte local                         | `docs/rewrite/app-v2-primary-cutover-cp-ab.md`                          | Cloudflare Pages preview com smoke                            |
| Bootstrap v2 produção    | Criado em `src/app-v2/main.tsx` e usado por `index.html`                  | Concluído para corte local                         | `docs/rewrite/app-v2-primary-bootstrap-cp-aa.md`, CP-AB                 | Validar em Cloudflare Pages preview                           |
| Preview local v2         | Funciona em `src/app-v2/preview.html`                                     | Suporte, não corte                                 | CP-W browser audit                                                      | Manter como harness local                                     |
| Preview autenticado      | Funciona em `authenticated-preview.html` sem erros de console             | Suporte, não corte                                 | CP-W browser audit                                                      | CP-Y com sessão real                                          |
| Login/sessão             | Fronteira e harness existem, sessão real não validada no browser          | Obrigatório para trocar                            | CP-T, CP-U, CP-V, CP-W                                                  | CP-Y com conta de teste autenticada                           |
| Fallback sem sessão      | Coberto por testes de harness/data source e browser local no bootstrap v2 | Obrigatório para trocar                            | `authenticatedHarness.test.tsx`, `appV2AuthenticatedDataSource.test.ts` | Cloudflare Pages preview                                      |
| Home Hoje                | Implementada no app-v2                                                    | Obrigatório para trocar                            | QA visual e testes app-v2 existentes                                    | Smoke em `/` após bootstrap v2                                |
| Alertas                  | Implementado como subfluxo app-v2                                         | Obrigatório para trocar                            | CP de alertas e navegação app-v2                                        | Smoke em `/` após bootstrap v2                                |
| Clientes                 | Fluxo local e adapters reais progressivos existem                         | Obrigatório para trocar                            | CP-G/CP-H e fases de clientes                                           | CP-Y criando/editando cliente sob usuário real                |
| Equipamentos             | Fluxo local e adapters reais progressivos existem                         | Obrigatório para trocar                            | CP-I/CP-J/CP-K e fases avançadas locais                                 | CP-Y criando/editando equipamento sob usuário real            |
| Registro de serviço      | Fluxo principal mock/local está forte                                     | Obrigatório para trocar                            | Auditoria indica alta cobertura do registro                             | Validar no bootstrap v2 com dados reais mínimos               |
| Registros/histórico      | Filtros locais foram tratados em ciclos posteriores                       | Obrigatório para trocar no recorte operacional     | `servicos-registros-filtros-app-v2.md`                                  | Smoke local de filtro/lista no bootstrap v2                   |
| Relatórios locais        | Relatório local e consolidado local foram tratados                        | Obrigatório se substituir v1 operacionalmente      | `relatorios-consolidados-locais-app-v2.md`                              | Smoke local no bootstrap v2                                   |
| Orçamentos locais        | Ciclo local foi tratado; orçamento real segue fora                        | Obrigatório no recorte local, real pode ficar fora | docs de orçamentos fases 2/3 e CP-R                                     | Decisão explícita sobre orçamento real fora do primeiro corte |
| Conta/configurações      | Conta local fechada visualmente; perfil real fora                         | Obrigatório no recorte local                       | fases Conta 1-6 e QA visual                                             | Decisão explícita sobre perfil real mínimo                    |
| Router/deep links        | Não promovido                                                             | Obrigatório para produção pública mínima           | CP-X classifica como bloqueio                                           | CP dedicada para refresh, histórico e URLs                    |
| PDF/share                | Fora do app-v2 real                                                       | Etapa sensível própria                             | AGENTS e matriz                                                         | Decidir se fica fora do primeiro corte ou executar CP própria |
| WhatsApp real            | Fora do app-v2 real                                                       | Etapa sensível própria                             | AGENTS e matriz                                                         | Decidir se fica fora do primeiro corte ou executar CP própria |
| Billing/features pagas   | Fora do app-v2 real                                                       | Etapa sensível própria                             | AGENTS e matriz                                                         | Decidir se root v2 exige plano no primeiro corte              |
| Upload/storage fotos     | Placeholder local, sem upload real                                        | Etapa sensível própria                             | fases de anexos/equipamentos                                            | Decidir se fica fora do primeiro corte                        |
| PMOC real                | Fora                                                                      | Etapa sensível própria                             | AGENTS e matriz                                                         | Manter fora ou abrir CP própria                               |
| Cloudflare Pages preview | Não validado para v2 como root                                            | Obrigatório para trocar                            | CI/Cloudflare mapeado em CP-X                                           | Preview publicado com smoke                                   |
| Rollback                 | Documentado em CP-AB                                                      | Obrigatório para trocar                            | `docs/rewrite/app-v2-primary-cutover-cp-ab.md`                          | Validar reversão se necessário                                |

## Primeiro corte recomendado

O primeiro corte v2 como versão principal deve ser **operacional mínimo**, não
paridade total com todas as integrações sensíveis do v1.

Incluído no primeiro corte:

- login/sessão real;
- fallback sem sessão;
- Hoje;
- Alertas;
- Clientes;
- Equipamentos;
- Registro de serviço;
- Registros/histórico local;
- Relatórios locais;
- Orçamentos locais;
- Conta local;
- mobile e desktop;
- smoke Cloudflare Pages preview;
- rollback explícito.

Fora do primeiro corte, se aprovado explicitamente:

- PDF/share real;
- WhatsApp real;
- billing/features pagas;
- upload/storage real de fotos;
- PMOC real;
- assinatura digital real;
- orçamento real com aceite/envio externo.

## Bloqueadores após a troca local do `index.html`

1. Validar sessão Supabase real no browser.
2. Validar escrita real mínima de cliente e equipamento sob usuário autenticado.
3. Definir comportamento de router/deep link para `/`.
4. Validar fluxo operacional mínimo em mobile e desktop.
5. Publicar Cloudflare Pages preview da branch com v2 como root.
6. Aprovar explicitamente as áreas fora do primeiro corte.

## Próxima CP recomendada

Se houver sessão de teste disponível: executar CP-Y, validação real do
`authenticated-preview.html`.

CP-AB executou a troca local do `index.html` e validou `/` no browser local. O
próximo checkpoint recomendado é publicar/validar Cloudflare Pages preview da
branch antes da promoção final.

## Validação desta CP

Validação documental esperada:

```bash
npm run format:check
git diff --check
```

Como não há mudança de runtime, `npm run build` e `npm run check` não são
obrigatórios para esta CP, mas continuam obrigatórios quando CP-AA ou CP-AB
alterarem código.
