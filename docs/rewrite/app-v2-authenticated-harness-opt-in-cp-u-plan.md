# app-v2 Authenticated Harness Opt-in CP-U Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um helper opt-in para montar o app-v2 com data source
autenticada injetada, preservando `preview.tsx` local por padrao.

**Architecture:** O helper fica fora do `AppV2Shell` e resolve
`createAuthenticatedAppV2DataSource` antes de chamar `mountAppV2` com
`dataPort`. O shell continua recebendo apenas `AppV2DataPort`; auth/Supabase
real seguem fora e entram somente por dependencias injetadas.

**Tech Stack:** React, TypeScript, Vite, Vitest, `AppV2DataPort`,
`AppV2SessionReader`, `createAuthenticatedAppV2DataSource`.

---

## 1. Escopo

Permitido neste CP:

- criar helper de harness opt-in para montagem autenticada;
- aceitar `AppV2SessionReader` e readers/writers existentes por injecao;
- retornar metadados da data source para debug de harness;
- testar que o helper chama o session reader e monta usando o `dataPort`
  resolvido;
- testar que `preview.tsx` continua local e nao importa o helper opt-in;
- documentar a CP no mapa central.

Fora do escopo:

- importar `core/auth`, `core/supabase`, `@supabase`, `localStorage` ou
  `sessionStorage`;
- ativar auth real no preview default;
- criar novo router ou deep links;
- criar migrations/RLS;
- alterar storage real amplo;
- billing, PDF/share, WhatsApp, upload/storage, PMOC ou Orcamento real;
- editar `package.json`, Vite, ESLint ou TypeScript config;
- alterar legado/v1.

## 2. Arquivos planejados

- Create: `src/app-v2/authenticatedHarness.ts`
  - Responsavel por resolver a data source autenticada e chamar `mountAppV2`.
- Test: `src/app-v2/authenticatedHarness.test.tsx`
  - Cobre montagem opt-in, fallback local sem sessao e ausencia de imports
    proibidos.
- Modify: `src/app-v2/index.test.tsx`
  - Fortalece a guarda para confirmar que preview default nao importa o helper.
- Create: `docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u.md`
  - Relatorio de fechamento da CP-U.
- Modify: `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`
  - Registra Status CP-U.

## 3. Contrato proposto

```ts
import type { AppV2DataSource } from './data/appV2DataSourceFactory';
import type { CreateAuthenticatedAppV2DataSourceInput } from './data/appV2AuthenticatedDataSource';
import type { AppV2MountHandle } from './index';

export interface AuthenticatedAppV2MountHandle extends AppV2MountHandle {
  dataSource: AppV2DataSource;
}

export type AuthenticatedAppV2MountOptions = CreateAuthenticatedAppV2DataSourceInput;

export async function mountAuthenticatedAppV2(
  root: HTMLElement,
  options: AuthenticatedAppV2MountOptions,
): Promise<AuthenticatedAppV2MountHandle>;
```

Regra: `mountAuthenticatedAppV2` e opt-in. Nenhum entrypoint default deve
importar ou chamar esse helper.

## 4. Tarefas

### Task 1: Plano CP-U

**Files:**

- Create:
  `docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u-plan.md`

- [ ] **Step 1: Criar este plano**

Run:

```bash
npm run format:check
git diff --check
```

Expected: comandos passam.

- [ ] **Step 2: Commit do plano**

Run:

```bash
git add docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u-plan.md
git commit -m "docs(app-v2): plan authenticated harness opt-in"
git push origin codex/rewrite-zero-react-parallel
```

Expected: commit e push concluidos.

### Task 2: Helper de harness opt-in

**Files:**

- Create: `src/app-v2/authenticatedHarness.test.tsx`
- Create: `src/app-v2/authenticatedHarness.ts`

- [ ] **Step 1: Escrever teste RED**

Criar `src/app-v2/authenticatedHarness.test.tsx`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AppV2MountHandle } from './index';
import { createAppV2MockSnapshot } from './data/appV2MockStore';
import { mountAuthenticatedAppV2 } from './authenticatedHarness';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let mountedApp: AppV2MountHandle | null = null;

afterEach(async () => {
  if (mountedApp) {
    await act(async () => {
      mountedApp?.unmount();
    });
  }

  mountedApp = null;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('mountAuthenticatedAppV2', () => {
  it('monta o app-v2 por data source autenticada opt-in', async () => {
    const root = document.createElement('div');
    const clientesReader = vi
      .fn()
      .mockResolvedValue([{ id: 'cliente-real-1', nome: 'Cliente Real' }]);

    document.body.appendChild(root);

    await act(async () => {
      mountedApp = await mountAuthenticatedAppV2(root, {
        initialSnapshot: createAppV2MockSnapshot(),
        sessionReader: {
          getCurrentUser: vi.fn().mockResolvedValue({ id: ' user-real-1 ' }),
        },
        clientesReader,
      });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mountedApp?.dataSource.mode).toBe('clientes-readonly');
    expect(clientesReader).toHaveBeenCalledWith('user-real-1');
    expect(root.textContent).toContain('Hoje');
  });

  it('preserva fallback local quando o harness opt-in nao encontra sessao', async () => {
    const root = document.createElement('div');
    const clientesReader = vi
      .fn()
      .mockResolvedValue([{ id: 'cliente-real-1', nome: 'Cliente Real' }]);

    document.body.appendChild(root);

    await act(async () => {
      mountedApp = await mountAuthenticatedAppV2(root, {
        initialSnapshot: createAppV2MockSnapshot(),
        sessionReader: { getCurrentUser: vi.fn().mockResolvedValue(null) },
        clientesReader,
      });
    });

    expect(mountedApp?.dataSource.mode).toBe('local');
    expect(mountedApp?.dataSource.reason).toBe('missing-session');
    expect(clientesReader).not.toHaveBeenCalled();
    expect(root.textContent).toContain('Hoje');
  });

  it('mantem helper opt-in sem importar auth, Supabase ou storage diretamente', () => {
    const source = readFileSync(resolve(__dirname, 'authenticatedHarness.ts'), 'utf8');

    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('@supabase');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
  });
});
```

- [ ] **Step 2: Rodar RED**

Run:

```bash
npm test -- src/app-v2/authenticatedHarness.test.tsx --run
```

Expected: falha porque `authenticatedHarness.ts` ainda nao existe.

- [ ] **Step 3: Implementar helper minimo**

Criar `src/app-v2/authenticatedHarness.ts`:

```ts
import {
  createAuthenticatedAppV2DataSource,
  type CreateAuthenticatedAppV2DataSourceInput,
} from './data/appV2AuthenticatedDataSource';
import type { AppV2DataSource } from './data/appV2DataSourceFactory';
import { mountAppV2, type AppV2MountHandle } from './index';

export interface AuthenticatedAppV2MountHandle extends AppV2MountHandle {
  dataSource: AppV2DataSource;
}

export type AuthenticatedAppV2MountOptions = CreateAuthenticatedAppV2DataSourceInput;

export async function mountAuthenticatedAppV2(
  root: HTMLElement,
  options: AuthenticatedAppV2MountOptions,
): Promise<AuthenticatedAppV2MountHandle> {
  const dataSource = await createAuthenticatedAppV2DataSource(options);
  const mountHandle = mountAppV2(root, { dataPort: dataSource.dataPort });

  return {
    dataSource,
    unmount: mountHandle.unmount,
  };
}
```

- [ ] **Step 4: Rodar GREEN**

Run:

```bash
npm test -- src/app-v2/authenticatedHarness.test.tsx --run
```

Expected: passa.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/app-v2/authenticatedHarness.ts src/app-v2/authenticatedHarness.test.tsx
git commit -m "feat(app-v2): add authenticated harness opt-in"
git push origin codex/rewrite-zero-react-parallel
```

### Task 3: Guardas de preview default

**Files:**

- Modify: `src/app-v2/index.test.tsx`

- [ ] **Step 1: Escrever teste de guarda**

Atualizar o teste `mantem preview default local sem ativar data source
autenticado` para tambem verificar:

```ts
expect(source).not.toContain('mountAuthenticatedAppV2');
expect(source).not.toContain('authenticatedHarness');
```

- [ ] **Step 2: Rodar teste focado**

Run:

```bash
npm test -- src/app-v2/index.test.tsx src/app-v2/authenticatedHarness.test.tsx --run
```

Expected: passa.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/app-v2/index.test.tsx
git commit -m "test(app-v2): keep authenticated harness out of preview"
git push origin codex/rewrite-zero-react-parallel
```

### Task 4: Documentacao de fechamento

**Files:**

- Create: `docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u.md`
- Modify: `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`

- [ ] **Step 1: Criar relatorio CP-U**

Criar `docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u.md` registrando:

- objetivo;
- arquivos alterados;
- contrato criado;
- como o opt-in funciona;
- o que continuou fora do escopo;
- validacoes executadas;
- proximo CP recomendado.

- [ ] **Step 2: Atualizar mapa central**

Adicionar `Status CP-U` no mapa central com:

- helper `mountAuthenticatedAppV2` criado;
- montagem autenticada continua opt-in;
- preview default segue local;
- sem auth/Supabase direto no shell/telas;
- sem router, storage real amplo, PDF/share, WhatsApp, billing, upload ou PMOC.

- [ ] **Step 3: Validar docs**

Run:

```bash
npm run format:check
git diff --check
```

Expected: passa.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u.md docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md
git commit -m "docs(app-v2): close authenticated harness opt-in"
git push origin codex/rewrite-zero-react-parallel
```

### Task 5: Validacao final

- [ ] **Step 1: Rodar testes focados**

Run:

```bash
npm test -- src/app-v2/authenticatedHarness.test.tsx src/app-v2/index.test.tsx src/app-v2/data/appV2AuthenticatedDataSource.test.ts src/app-v2/data/appV2DataSourceFactory.test.ts src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
```

Expected: todos passam.

- [ ] **Step 2: Rodar validacao obrigatoria**

Run, em sequencia:

```bash
npm run format:check
npm run build
npm run check
git diff --check
```

Expected:

- comandos passam;
- warning conhecido em `src/domain/pdf/shareReport.js` pode permanecer;
- warnings Vite static/dynamic e chunk size podem permanecer;
- nenhum componente React do app-v2 importa auth, Supabase ou storage.

## 5. Riscos e decisoes

- `mountAuthenticatedAppV2` retorna uma Promise porque o `sessionReader` e a
  data source autenticada sao assincronos.
- O helper retorna `dataSource` para diagnostico do harness, mas o shell recebe
  somente `dataPort`.
- Auth real ainda nao e ligado neste CP; uma CP futura pode criar um entrypoint
  local explicitamente opt-in que injete o session reader real.
- O preview default continua como contrato local. Qualquer mudanca em
  `preview.tsx` para chamar o helper bloqueia esta CP.

## 6. Self-review

- Spec coverage: o plano cobre helper opt-in, preview local, injecao externa de
  sessao e proibicao de imports diretos.
- Placeholder scan: sem `TBD`, `TODO` ou passos genericos sem comando.
- Type consistency: `AuthenticatedAppV2MountOptions` reutiliza
  `CreateAuthenticatedAppV2DataSourceInput`; o retorno combina
  `AppV2MountHandle` com `AppV2DataSource`.
