# app-v2 Authenticated Entrypoint CP-V Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma URL/harness local autenticado opt-in para app-v2, mantendo
`preview.tsx` como preview local/mockado padrao.

**Architecture:** A CP-V adiciona uma entrada separada para browser que compoe
`mountAuthenticatedAppV2` com dependencias Supabase injetadas. `AppV2Shell`,
telas e `preview.tsx` continuam sem imports diretos de auth/Supabase/storage; o
acoplamento real fica limitado ao entrypoint opt-in e a adapters testaveis.

**Tech Stack:** React, TypeScript, Vite, Vitest, Supabase client existente,
`AppV2SessionReader`, `mountAuthenticatedAppV2`, adapters app-v2 de clientes e
equipamentos.

---

## 1. Escopo

Permitido neste CP:

- criar adapter de sessao Supabase para `AppV2SessionReader`;
- criar factory de opcoes browser para `mountAuthenticatedAppV2`;
- criar HTML/TSX separados para abrir o harness autenticado opt-in;
- usar os readers/writers Supabase app-v2 ja existentes;
- importar `src/core/supabase.js` somente no entrypoint/factory opt-in;
- testar que o preview default continua local;
- documentar a CP no mapa central.

Fora do escopo:

- alterar `src/app-v2/preview.tsx` para usar auth;
- conectar auth/Supabase direto em `AppV2Shell` ou telas;
- criar router/deep link;
- criar migrations, policies RLS ou schemas;
- ampliar storage real;
- billing, PDF/share, WhatsApp, upload/storage, assinatura, PMOC ou orcamento
  real;
- editar `package.json`, Vite, ESLint ou TypeScript config;
- alterar legado/v1.

## 2. Arquivos planejados

- Create: `src/app-v2/data/supabaseAppV2SessionReader.ts`
  - Converte Supabase `auth.getUser()` no contrato `AppV2SessionReader`.
- Test: `src/app-v2/data/supabaseAppV2SessionReader.test.ts`
  - Cobre usuario autenticado, ausencia de usuario, erro de auth e ausencia de
    imports proibidos.
- Create: `src/app-v2/authenticatedBrowserOptions.ts`
  - Monta `AuthenticatedAppV2MountOptions` usando client Supabase injetado e
    readers/writers app-v2 existentes.
- Test: `src/app-v2/authenticatedBrowserOptions.test.ts`
  - Cobre composicao das dependencias e fronteira de imports.
- Create: `src/app-v2/authenticatedPreview.tsx`
  - Entry point browser separado que chama `mountAuthenticatedAppV2`.
- Create: `src/app-v2/authenticated-preview.html`
  - HTML dedicado para Vite servir o harness autenticado.
- Modify: `src/app-v2/index.test.tsx`
  - Fortalece guardas do preview default e do shell.
- Create: `docs/rewrite/app-v2-authenticated-entrypoint-cp-v.md`
  - Relatorio de fechamento da CP-V.
- Modify: `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`
  - Registra Status CP-V.

## 3. Contratos propostos

### `supabaseAppV2SessionReader.ts`

```ts
import type { AppV2SessionReader, AppV2SessionUser } from './appV2SessionReader';

export interface SupabaseAppV2AuthClient {
  auth: {
    getUser(): Promise<{
      data?: {
        user?: {
          id?: string | null;
          email?: string | null;
        } | null;
      } | null;
      error?: { message?: string } | null;
    }>;
  };
}

export function createSupabaseAppV2SessionReader(
  client: SupabaseAppV2AuthClient,
): AppV2SessionReader;
```

Regras:

- `id` vazio retorna `null`;
- erro de auth retorna `null`;
- `email` e preservado quando vier do Supabase;
- o arquivo nao importa `core/supabase`, `core/auth`, `@supabase`,
  `localStorage` ou `sessionStorage`.

### `authenticatedBrowserOptions.ts`

```ts
import type { AuthenticatedAppV2MountOptions } from './authenticatedHarness';

export interface AppV2AuthenticatedBrowserClient
  extends
    SupabaseAppV2AuthClient,
    AppV2ClientesSupabaseClient,
    SupabaseAppV2ClientsWriteClient,
    SupabaseAppV2EquipmentsWriteClient {}

export function createAuthenticatedAppV2BrowserOptions(
  client: AppV2AuthenticatedBrowserClient,
): AuthenticatedAppV2MountOptions;
```

Regras:

- compoe `sessionReader`, `clientesReader`, `clientesWriter` e
  `equipamentosWriter`;
- readers/writers chamam os adapters Supabase app-v2 existentes;
- nao cria store nova, nao cria mock divergente e nao toca no shell.

### `authenticatedPreview.tsx`

```ts
import { supabase } from '../core/supabase.js';
import { createAuthenticatedAppV2BrowserOptions } from './authenticatedBrowserOptions';
import { mountAuthenticatedAppV2 } from './authenticatedHarness';

const root = document.getElementById('app-v2-authenticated-preview');

if (root) {
  void mountAuthenticatedAppV2(root, createAuthenticatedAppV2BrowserOptions(supabase));
}
```

## 4. Tarefas

### Task 1: Plano CP-V

**Files:**

- Create: `docs/rewrite/app-v2-authenticated-entrypoint-cp-v-plan.md`

- [ ] **Step 1: Criar este plano**

Run:

```bash
npm run format:check
git diff --check
```

Expected: comandos passam.

- [ ] **Step 2: Commit e push do plano**

Run:

```bash
git add docs/rewrite/app-v2-authenticated-entrypoint-cp-v-plan.md
git commit -m "docs(app-v2): plan authenticated entrypoint"
git push origin codex/rewrite-zero-react-parallel
```

Expected: commit e push concluidos.

### Task 2: Session reader Supabase

**Files:**

- Create: `src/app-v2/data/supabaseAppV2SessionReader.test.ts`
- Create: `src/app-v2/data/supabaseAppV2SessionReader.ts`

- [ ] **Step 1: Escrever teste RED**

Criar teste cobrindo:

- `getCurrentUser()` retorna `{ id, email }` quando Supabase retorna usuario;
- `id` com espacos e normalizado;
- ausencia de usuario retorna `null`;
- erro de auth retorna `null`;
- arquivo nao importa auth/Supabase/storage diretamente.

Run:

```bash
npm test -- src/app-v2/data/supabaseAppV2SessionReader.test.ts --run
```

Expected: falha porque o modulo ainda nao existe.

- [ ] **Step 2: Implementar adapter minimo**

Criar `createSupabaseAppV2SessionReader(client)` conforme contrato da secao 3.

- [ ] **Step 3: Rodar GREEN**

Run:

```bash
npm test -- src/app-v2/data/supabaseAppV2SessionReader.test.ts --run
```

Expected: passa.

- [ ] **Step 4: Commit e push**

Run:

```bash
git add src/app-v2/data/supabaseAppV2SessionReader.ts src/app-v2/data/supabaseAppV2SessionReader.test.ts
git commit -m "feat(app-v2): add supabase session reader"
git push origin codex/rewrite-zero-react-parallel
```

### Task 3: Factory browser autenticada

**Files:**

- Create: `src/app-v2/authenticatedBrowserOptions.test.ts`
- Create: `src/app-v2/authenticatedBrowserOptions.ts`

- [ ] **Step 1: Escrever teste RED**

Criar teste cobrindo:

- factory retorna `sessionReader`, `clientesReader`, `clientesWriter` e
  `equipamentosWriter`;
- `clientesReader` chama `loadAppV2ClientesFromSupabase`;
- `clientesWriter` chama `saveAppV2ClienteToSupabase`;
- `equipamentosWriter` chama `saveAppV2EquipamentoToSupabase`;
- arquivo nao importa `core/auth`, `localStorage` ou `sessionStorage`.

Run:

```bash
npm test -- src/app-v2/authenticatedBrowserOptions.test.ts --run
```

Expected: falha porque o modulo ainda nao existe.

- [ ] **Step 2: Implementar factory minima**

Criar `createAuthenticatedAppV2BrowserOptions(client)` compondo os adapters
existentes.

- [ ] **Step 3: Rodar GREEN**

Run:

```bash
npm test -- src/app-v2/authenticatedBrowserOptions.test.ts --run
```

Expected: passa.

- [ ] **Step 4: Commit e push**

Run:

```bash
git add src/app-v2/authenticatedBrowserOptions.ts src/app-v2/authenticatedBrowserOptions.test.ts
git commit -m "feat(app-v2): compose authenticated browser options"
git push origin codex/rewrite-zero-react-parallel
```

### Task 4: Entry point autenticado opt-in

**Files:**

- Create: `src/app-v2/authenticatedPreview.tsx`
- Create: `src/app-v2/authenticated-preview.html`
- Modify: `src/app-v2/index.test.tsx`

- [ ] **Step 1: Escrever guardas RED/GREEN**

Atualizar `src/app-v2/index.test.tsx` para verificar:

- `preview.tsx` continua chamando `mountAppV2(root)`;
- `preview.tsx` nao importa `authenticatedPreview`,
  `authenticatedBrowserOptions` ou `mountAuthenticatedAppV2`;
- `authenticatedPreview.tsx` existe como entrypoint separado;
- `authenticated-preview.html` carrega `./authenticatedPreview.tsx`;
- `authenticatedPreview.tsx` usa o root `app-v2-authenticated-preview`.

- [ ] **Step 2: Rodar RED**

Run:

```bash
npm test -- src/app-v2/index.test.tsx --run
```

Expected: falha porque os arquivos de entrypoint ainda nao existem.

- [ ] **Step 3: Criar entrypoint**

Criar `authenticated-preview.html` e `authenticatedPreview.tsx` conforme
contratos da secao 3.

- [ ] **Step 4: Rodar GREEN**

Run:

```bash
npm test -- src/app-v2/index.test.tsx --run
```

Expected: passa.

- [ ] **Step 5: Commit e push**

Run:

```bash
git add src/app-v2/authenticatedPreview.tsx src/app-v2/authenticated-preview.html src/app-v2/index.test.tsx
git commit -m "feat(app-v2): add authenticated preview entrypoint"
git push origin codex/rewrite-zero-react-parallel
```

### Task 5: Documentacao e validacao final

**Files:**

- Create: `docs/rewrite/app-v2-authenticated-entrypoint-cp-v.md`
- Modify: `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`

- [ ] **Step 1: Criar relatorio CP-V**

Registrar objetivo, arquivos alterados, URL esperada, fronteiras, validacoes e
o que ficou fora.

- [ ] **Step 2: Atualizar mapa central**

Adicionar `Status CP-V` com:

- entrypoint autenticado separado criado;
- preview default local preservado;
- shell/telas sem auth/Supabase direto;
- sem router, RLS/migrations, storage amplo, PDF/share, WhatsApp, billing,
  upload ou PMOC.

- [ ] **Step 3: Rodar validacao focada**

Run:

```bash
npm test -- src/app-v2/data/supabaseAppV2SessionReader.test.ts src/app-v2/authenticatedBrowserOptions.test.ts src/app-v2/authenticatedHarness.test.tsx src/app-v2/index.test.tsx src/app-v2/data/appV2AuthenticatedDataSource.test.ts src/app-v2/data/appV2DataSourceFactory.test.ts --run
```

Expected: todos passam.

- [ ] **Step 4: Rodar validacao obrigatoria**

Run:

```bash
npm run format
npm run build
npm run check
git diff --check
```

Expected:

- comandos passam;
- warning conhecido em `src/domain/pdf/shareReport.js` pode permanecer;
- warnings Vite static/dynamic e chunk size podem permanecer.

- [ ] **Step 5: Commit e push docs**

Run:

```bash
git add docs/rewrite/app-v2-authenticated-entrypoint-cp-v.md docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md
git commit -m "docs(app-v2): close authenticated entrypoint"
git push origin codex/rewrite-zero-react-parallel
```

## 5. Riscos e decisoes

- Esta CP introduz uma entrada real opt-in, mas nao torna o app-v2 autenticado
  por padrao.
- O import de `src/core/supabase.js` fica restrito ao entrypoint/factory
  browser; `AppV2Shell` e telas continuam desacoplados.
- A URL local esperada sera
  `http://localhost:5173/src/app-v2/authenticated-preview.html`.
- A rota curta `/preview` permanece fora do escopo porque mexeria em Vite ou
  router.
- RLS/migrations continuam fora; esta CP so usa contratos existentes.

## 6. Self-review

- Spec coverage: cobre URL/harness separado, sessao real por injecao, preview
  local preservado e guardas contra acoplamento.
- Placeholder scan: sem `TBD`, `TODO` ou passos sem comando.
- Type consistency: `AuthenticatedAppV2MountOptions` continua vindo do helper
  CP-U; o session reader implementa `AppV2SessionReader`.
