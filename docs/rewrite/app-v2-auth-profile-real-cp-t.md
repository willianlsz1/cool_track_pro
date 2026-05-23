# app-v2 - Auth/Profile real CP-T

## Objetivo

Criar uma fronteira segura para o app-v2 receber usuario autenticado real sem
fazer `AppV2Shell`, telas React ou preview default importarem auth, Supabase,
storage, router, billing, PDF/share, WhatsApp, upload ou PMOC.

Esta CP nao ativa login real no preview. Ela prepara o contrato para uma etapa
futura injetar sessao real por fora do shell.

## Arquivos alterados

- `src/app-v2/data/appV2SessionReader.ts`
- `src/app-v2/data/appV2AuthenticatedDataSource.ts`
- `src/app-v2/data/appV2AuthenticatedDataSource.test.ts`
- `src/app-v2/index.test.tsx`
- `docs/rewrite/app-v2-auth-profile-real-cp-t.md`
- `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`

## Contratos criados

`AppV2SessionReader` define a unica entrada de sessao permitida nesta fronteira:

```ts
export interface AppV2SessionUser {
  id: string;
  email?: string | null;
}

export interface AppV2SessionReader {
  getCurrentUser(): Promise<AppV2SessionUser | null>;
}
```

`createAuthenticatedAppV2DataSource` recebe esse reader por injecao, normaliza
`user.id` e delega para `createAppV2DataSource`.

Com usuario autenticado:

- monta `session: { userId }`;
- permite que os readers/writers ja existentes sejam ativados pela data source.

Sem usuario, com `id` vazio ou com erro no reader:

- retorna data source local;
- preserva `reason: 'missing-session'`;
- nao chama readers reais.

## Fronteira preservada

O shell continua consumindo apenas `AppV2DataPort`.

O bridge autenticado nao importa:

- `core/auth`;
- `core/supabase`;
- `@supabase`;
- `localStorage`;
- `sessionStorage`.

`src/app-v2/index.tsx` e `src/app-v2/preview.tsx` tambem ganharam guarda de teste
para impedir imports diretos de auth/Supabase. O preview default permanece:

```ts
mountAppV2(root);
```

Isso mantem o harness local por padrao e evita repetir o acoplamento do v1, onde
UI, sessao e storage poderiam evoluir juntos sem contrato claro.

## O que nao foi alterado

- Nenhuma migration ou RLS nova.
- Nenhuma conexao direta de Supabase no shell ou nas telas.
- Nenhum router/deep link.
- Nenhum billing, assinatura ou quota.
- Nenhum PDF/share, WhatsApp, upload/storage ou PMOC real.
- Nenhum arquivo de configuracao (`package.json`, Vite, ESLint ou TypeScript).
- Nenhuma mudanca no legado/v1.

## Validacao executada

Durante a CP:

```bash
npm test -- src/app-v2/data/appV2AuthenticatedDataSource.test.ts --run
npm test -- src/app-v2/index.test.tsx src/app-v2/data/appV2AuthenticatedDataSource.test.ts --run
npm run format:check
npm run build
npm run check
git diff --check
```

Resultado esperado/observado:

- testes focados passam;
- build passa;
- check passa com o warning conhecido em `src/domain/pdf/shareReport.js`;
- warnings Vite static/dynamic e chunk size permanecem backlog tecnico
  controlado.

## Proximo CP recomendado

Criar uma CP dedicada para **wiring autenticado opt-in do harness**, se for
necessario testar dados reais no app-v2 localmente.

Essa CP futura deve:

- continuar sem ativar auth real no preview default;
- criar um entrypoint ou configuracao explicitamente opt-in;
- injetar `AppV2SessionReader` por fora do shell;
- validar que componentes React seguem sem imports diretos de Supabase/auth;
- nao misturar router, storage real amplo, billing, PDF/share, WhatsApp, upload
  ou PMOC.
