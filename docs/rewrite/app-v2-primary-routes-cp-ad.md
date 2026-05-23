# app-v2 - Primary routes CP-AD

## Objetivo

Adicionar suporte minimo de URL para o app-v2 quando ele roda como entrada
principal do produto, sem implementar router completo, subrotas, IDs publicos
ou historico de wizard.

Esta CP reduz a friccao de producao: uma URL publicada como `/equipamentos`,
`/servicos` ou `/conta` agora abre a area esperada em vez de sempre cair em
`Hoje`.

## Escopo revisado antes da execucao

Arquivos de runtime:

- `src/app-v2/navigation/appV2Routes.ts`
- `src/app-v2/shell/AppV2Shell.tsx`

Arquivos de teste:

- `src/app-v2/navigation/appV2Routes.test.ts`
- `src/app-v2/shell/AppV2Shell.navigation.test.tsx`
- `src/app-v2/shell/AppV2Shell.test.tsx`
- `src/app-v2/shell/AppV2ShellDataPort.test.tsx`
- `src/app-v2/shell/AppV2Shell.testUtils.tsx`
- `e2e/specs/app-v2-primary-entrypoint.spec.js`

Arquivos documentais:

- `docs/rewrite/app-v2-primary-routes-cp-ad.md`
- `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`
- `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`

## Contrato implementado

Rotas publicas principais:

| URL             | Area app-v2    |
| --------------- | -------------- |
| `/`             | `Hoje`         |
| `/equipamentos` | `Equipamentos` |
| `/servicos`     | `Servicos`     |
| `/conta`        | `Conta`        |

Regras:

- caminho desconhecido faz fallback para `Hoje`;
- rotas principais atualizam `history.pushState` quando o usuario troca de
  area;
- `popstate` sincroniza o shell de volta para a area principal correta;
- a URL inicial decide a area principal renderizada;
- apenas areas principais entram no contrato desta CP.

## Fora de escopo

Nao foram implementados:

- rotas para `Hoje > Alertas`;
- rotas para `Equipamentos > Clientes`;
- rotas com IDs de equipamento, cliente, registro ou orcamento;
- rotas para `Servicos > Relatorios` ou `Servicos > Orcamentos`;
- deep link para etapas do fluxo de registro;
- persistencia de `serviceDraft` em URL;
- alteracao de storage, Supabase/RLS, billing, PDF/share, WhatsApp, upload,
  PMOC ou orcamento real.

## Validacao executada

Testes focados:

```bash
npm test -- src/app-v2/navigation/appV2Routes.test.ts src/app-v2/shell/AppV2Shell.navigation.test.tsx --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
```

Resultado:

- `src/app-v2/navigation/appV2Routes.test.ts`: 11 testes passaram;
- `src/app-v2/shell/AppV2Shell.navigation.test.tsx`: 9 testes passaram;
- `src/app-v2/shell/AppV2Shell.test.tsx`: 37 testes passaram;
- `src/app-v2/shell/AppV2ShellDataPort.test.tsx`: 25 testes passaram.

## Riscos remanescentes

- subrotas continuam sem contrato publico;
- `/servicos/orcamentos` e `/equipamentos/:id` ainda caem no fallback de `Hoje`;
- refresh no meio do fluxo de registro ainda nao recupera draft;
- URL externa do Cloudflare Pages preview continua pendente para validar o
  comportamento publicado.
