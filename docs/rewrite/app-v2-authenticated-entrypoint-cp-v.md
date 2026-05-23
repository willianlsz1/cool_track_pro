# app-v2 - Authenticated entrypoint CP-V

## Objetivo

Criar um entrypoint local autenticado opt-in para app-v2, preservando o preview
default local/mockado e mantendo `AppV2Shell` e telas sem dependencias diretas
de auth, Supabase ou storage.

## Arquivos alterados

- `docs/rewrite/app-v2-authenticated-entrypoint-cp-v-plan.md`
- `src/app-v2/data/supabaseAppV2SessionReader.ts`
- `src/app-v2/data/supabaseAppV2SessionReader.test.ts`
- `src/app-v2/authenticatedBrowserOptions.ts`
- `src/app-v2/authenticatedBrowserOptions.test.ts`
- `src/app-v2/authenticated-preview.html`
- `src/app-v2/authenticatedPreview.tsx`
- `src/app-v2/index.test.tsx`
- `docs/rewrite/app-v2-authenticated-entrypoint-cp-v.md`
- `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`

## URL local

Com `npm run dev`, o harness autenticado opt-in deve ser aberto em:

```text
http://localhost:5173/src/app-v2/authenticated-preview.html
```

O preview local/mockado continua em:

```text
http://localhost:5173/src/app-v2/preview.html
```

## Contratos criados

### Session reader Supabase

`createSupabaseAppV2SessionReader` adapta `client.auth.getUser()` ao contrato
`AppV2SessionReader`:

```ts
export function createSupabaseAppV2SessionReader(
  client: SupabaseAppV2AuthClient,
): AppV2SessionReader;
```

Regras:

- `id` autenticado e normalizado;
- `email` e preservado quando existe;
- ausencia de usuario, `id` vazio, erro de auth ou rejeicao retornam `null`;
- o adapter nao importa `core/auth`, `core/supabase`, `@supabase`,
  `localStorage` ou `sessionStorage`.

### Factory browser autenticada

`createAuthenticatedAppV2BrowserOptions` compoe as opcoes para
`mountAuthenticatedAppV2` usando um client Supabase injetado:

```ts
export function createAuthenticatedAppV2BrowserOptions(
  client: AppV2AuthenticatedBrowserClient,
): AuthenticatedAppV2MountOptions;
```

Ela injeta:

- `sessionReader`;
- `clientesReader`;
- `clientesWriter`;
- `equipamentosWriter`.

Os readers/writers reutilizam os adapters Supabase app-v2 existentes.

### Entrypoint separado

`authenticatedPreview.tsx` e o unico ponto novo que importa
`../core/supabase.js` neste CP:

```ts
void mountAuthenticatedAppV2(root, createAuthenticatedAppV2BrowserOptions(supabase));
```

Esse import fica fora do shell e fora das telas.

## Fronteira preservada

Continuam sem imports diretos de Supabase/auth/storage:

- `src/app-v2/index.tsx`;
- `src/app-v2/preview.tsx`;
- `src/app-v2/shell/*`;
- telas do app-v2.

`src/app-v2/preview.tsx` continua chamando apenas:

```ts
mountAppV2(root);
```

## O que nao foi alterado

- Nenhum router ou deep link.
- Nenhuma migration, schema ou policy RLS.
- Nenhum storage real amplo.
- Nenhum billing.
- Nenhum PDF/share.
- Nenhum WhatsApp.
- Nenhum upload/storage de arquivos.
- Nenhuma assinatura, PMOC real ou orcamento real.
- Nenhum `package.json`, Vite, ESLint ou TypeScript config.
- Nenhuma mudanca no legado/v1.

## Validacao executada

Durante a CP:

```bash
npm test -- src/app-v2/data/supabaseAppV2SessionReader.test.ts --run
npm test -- src/app-v2/authenticatedBrowserOptions.test.ts --run
npm test -- src/app-v2/index.test.tsx --run
npm test -- src/app-v2/index.test.tsx src/app-v2/authenticatedBrowserOptions.test.ts src/app-v2/data/supabaseAppV2SessionReader.test.ts --run
```

Validacao final esperada/executada ao fechar a CP:

```bash
npm test -- src/app-v2/data/supabaseAppV2SessionReader.test.ts src/app-v2/authenticatedBrowserOptions.test.ts src/app-v2/authenticatedHarness.test.tsx src/app-v2/index.test.tsx src/app-v2/data/appV2AuthenticatedDataSource.test.ts src/app-v2/data/appV2DataSourceFactory.test.ts --run
npm run format
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

Antes de ampliar escrita real, executar uma CP dedicada de auditoria do harness
autenticado em browser:

- abrir a URL autenticada local;
- validar comportamento com sessao ausente e sessao real;
- confirmar fallback local quando nao ha sessao;
- confirmar leitura/escrita de clientes e equipamentos apenas sob usuario
  autenticado;
- manter router, storage amplo, PDF/share, WhatsApp, billing, upload e PMOC
  fora.
