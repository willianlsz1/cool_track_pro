# app-v2 - Authenticated harness opt-in CP-U

## Objetivo

Criar uma montagem autenticada opt-in para o harness do app-v2, preservando o
preview default local e mantendo `AppV2Shell` isolado de auth, Supabase, storage,
router, billing, PDF/share, WhatsApp, upload e PMOC.

## Arquivos alterados

- `docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u-plan.md`
- `src/app-v2/authenticatedHarness.ts`
- `src/app-v2/authenticatedHarness.test.tsx`
- `src/app-v2/index.test.tsx`
- `docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u.md`
- `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`

## Contrato criado

`mountAuthenticatedAppV2` resolve a data source autenticada por injecao e monta
o app-v2 com o `dataPort` resultante:

```ts
export async function mountAuthenticatedAppV2(
  root: HTMLElement,
  options: AuthenticatedAppV2MountOptions,
): Promise<AuthenticatedAppV2MountHandle>;
```

O retorno combina o handle de montagem com a `dataSource` resolvida, para
diagnostico do harness:

```ts
export interface AuthenticatedAppV2MountHandle extends AppV2MountHandle {
  dataSource: AppV2DataSource;
}
```

## Como o opt-in funciona

1. O chamador cria/injeta `AppV2SessionReader` e readers/writers reais quando
   quiser testar dados autenticados.
2. `mountAuthenticatedAppV2` chama `createAuthenticatedAppV2DataSource`.
3. A data source decide entre modo autenticado e fallback local.
4. O shell recebe somente `dataPort`.

Sem sessao, `id` vazio ou erro no reader, o comportamento continua local com
`reason: 'missing-session'`.

## Fronteira preservada

O helper opt-in nao importa:

- `core/auth`;
- `core/supabase`;
- `@supabase`;
- `localStorage`;
- `sessionStorage`.

`src/app-v2/preview.tsx` continua chamando apenas:

```ts
mountAppV2(root);
```

`src/app-v2/index.test.tsx` agora bloqueia regressao para impedir que o preview
default importe `mountAuthenticatedAppV2` ou `authenticatedHarness`.

## O que nao foi alterado

- Nenhuma ativacao real no preview default.
- Nenhuma conexao direta de Supabase no shell ou nas telas.
- Nenhuma migration/RLS nova.
- Nenhum router/deep link.
- Nenhum storage real amplo.
- Nenhum billing, PDF/share, WhatsApp, upload/storage, PMOC ou Orcamento real.
- Nenhum arquivo de configuracao (`package.json`, Vite, ESLint ou TypeScript).
- Nenhuma mudanca no legado/v1.

## Validacao executada

Durante a CP:

```bash
npm test -- src/app-v2/authenticatedHarness.test.tsx --run
npm test -- src/app-v2/index.test.tsx src/app-v2/authenticatedHarness.test.tsx --run
```

Validacao final recomendada/executada ao fechar a CP:

```bash
npm test -- src/app-v2/authenticatedHarness.test.tsx src/app-v2/index.test.tsx src/app-v2/data/appV2AuthenticatedDataSource.test.ts src/app-v2/data/appV2DataSourceFactory.test.ts src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format:check
npm run build
npm run check
git diff --check
```

Resultado esperado:

- testes focados passam;
- build passa;
- check passa com o warning conhecido em `src/domain/pdf/shareReport.js`;
- warnings Vite static/dynamic e chunk size permanecem backlog tecnico
  controlado.

## Proximo CP recomendado

Criar uma CP dedicada para **entrypoint local autenticado opt-in**, se for
necessario abrir uma URL/harness separado para dados reais.

Essa CP futura deve:

- manter `preview.tsx` como contrato local;
- criar um entrypoint separado ou uma flag explicita testada;
- injetar session reader real por fora do shell;
- continuar bloqueando imports diretos de auth/Supabase nas telas;
- nao misturar router, storage real amplo, PDF/share, WhatsApp, billing, upload
  ou PMOC.
