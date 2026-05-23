# app-v2 Auth/Profile Real - CP-T Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma fronteira segura para o app-v2 receber usuario autenticado
real e ativar a `AppV2DataSource` somente por injecao explicita no harness, sem
fazer o `AppV2Shell` importar auth, Supabase, storage, router, billing,
PDF/share, WhatsApp ou upload.

**Architecture:** O app-v2 continua consumindo apenas `AppV2DataPort`. A sessao
real fica em um bridge/adaptador pequeno, fora do shell, que le o usuario atual
por dependencia injetada e monta uma data source ja existente. O preview default
permanece local; qualquer ativacao real deve ser opt-in e testada por contrato.

**Tech Stack:** React, TypeScript, Vite, Vitest, `AppV2DataPort`,
`createAppV2DataSource`, Supabase/Auth legado somente via adapter injetado.

---

## 1. Escopo

Permitido neste CP:

- criar contrato de session reader do app-v2;
- criar bridge de montagem que transforma usuario autenticado em
  `AppV2DataSourceSession`;
- permitir `mountAppV2` receber uma `dataSourceFactory` ou `dataPort` ja
  montada por fora;
- testar que o shell e a factory continuam sem imports diretos de Supabase,
  auth, `localStorage` ou `sessionStorage`;
- manter preview default local.

Fora do escopo:

- login UI novo;
- router/deep links;
- migrations/RLS novas;
- billing/assinatura;
- PDF/share/WhatsApp;
- upload/storage real;
- PMOC real;
- mudancas em `package.json`, Vite, ESLint ou TypeScript config;
- alteracoes no app legado/v1 alem de leitura de contrato.

## 2. Arquivos Planejados

- Create: `src/app-v2/data/appV2SessionReader.ts`
  - Contrato pequeno para obter usuario atual sem acoplar app-v2 ao auth real.
- Create: `src/app-v2/data/appV2AuthenticatedDataSource.ts`
  - Compoe `sessionReader`, readers/writers ja existentes e
    `createAppV2DataSource`.
- Test: `src/app-v2/data/appV2AuthenticatedDataSource.test.ts`
  - Cobre sessao ausente, sessao presente, erro de auth e ausencia de imports
    proibidos.
- Modify: `src/app-v2/index.tsx`
  - Aceita opcionalmente uma promise/factory de `AppV2DataPort` ou data source
    ja resolvida sem mudar o comportamento default.
- Test: `src/app-v2/index.test.tsx`
  - Cobre mount local default e injecao controlada.
- Modify: `src/app-v2/preview.tsx`
  - Deve permanecer `mountAppV2(root)` sem ativacao real neste CP, salvo se
    houver flag local explicitamente testada em CP separado.
- Modify: `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`
  - Registrar CP-T como planejado/concluido apos execucao.

## 3. Contratos

```ts
export interface AppV2SessionUser {
  id: string;
  email?: string | null;
}

export interface AppV2SessionReader {
  getCurrentUser(): Promise<AppV2SessionUser | null>;
}
```

```ts
export interface CreateAuthenticatedAppV2DataSourceInput {
  sessionReader: AppV2SessionReader;
  initialSnapshot?: AppV2MockSnapshot;
  clientesReader?: AppV2ClientesReader;
  clientesWriter?: AppV2ClientesWriter;
  equipamentosWriter?: AppV2EquipamentosWriter;
}
```

Regra: o bridge retorna `createAppV2DataSource({ session: { userId:
user.id }, ... })` quando ha usuario; caso contrario retorna data source local
com `reason: 'missing-session'`.

## 4. Tarefas

### Task 1: Session Reader Contract

**Files:**

- Create: `src/app-v2/data/appV2SessionReader.ts`
- Test: `src/app-v2/data/appV2AuthenticatedDataSource.test.ts`

- [ ] **Step 1: Criar teste de contrato sem implementacao**

Criar `src/app-v2/data/appV2AuthenticatedDataSource.test.ts` com:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { createAuthenticatedAppV2DataSource } from './appV2AuthenticatedDataSource';
import { createAppV2MockSnapshot } from './appV2MockStore';

describe('createAuthenticatedAppV2DataSource', () => {
  it('usa modo local quando nao ha usuario autenticado', async () => {
    const snapshot = createAppV2MockSnapshot();
    const dataSource = await createAuthenticatedAppV2DataSource({
      initialSnapshot: snapshot,
      sessionReader: { getCurrentUser: vi.fn().mockResolvedValue(null) },
      clientesReader: vi.fn().mockResolvedValue([{ id: 'cliente-real-1', nome: 'Real' }]),
    });

    expect(dataSource.mode).toBe('local');
    expect(dataSource.reason).toBe('missing-session');
    await expect(dataSource.dataPort.loadSnapshot()).resolves.toMatchObject({
      clientes: snapshot.clientes,
    });
  });

  it('usa userId autenticado para compor a data source existente', async () => {
    const clientesReader = vi.fn().mockResolvedValue([{ id: 'cliente-real-1', nome: 'Real' }]);
    const dataSource = await createAuthenticatedAppV2DataSource({
      initialSnapshot: createAppV2MockSnapshot(),
      sessionReader: {
        getCurrentUser: vi.fn().mockResolvedValue({ id: ' user-real-1 ', email: 'a@b.com' }),
      },
      clientesReader,
    });

    expect(dataSource.mode).toBe('clientes-readonly');
    await dataSource.dataPort.loadSnapshot();
    expect(clientesReader).toHaveBeenCalledWith('user-real-1');
  });

  it('falha de auth retorna local sem ativar readers reais', async () => {
    const clientesReader = vi.fn().mockResolvedValue([]);
    const dataSource = await createAuthenticatedAppV2DataSource({
      sessionReader: { getCurrentUser: vi.fn().mockRejectedValue(new Error('auth offline')) },
      clientesReader,
    });

    expect(dataSource.mode).toBe('local');
    expect(dataSource.reason).toBe('missing-session');
    expect(clientesReader).not.toHaveBeenCalled();
  });

  it('nao importa Supabase, auth ou storage diretamente no bridge app-v2', () => {
    const source = readFileSync(resolve(__dirname, 'appV2AuthenticatedDataSource.ts'), 'utf8');

    expect(source).not.toContain('core/supabase');
    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('@supabase');
  });
});
```

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
npm test -- src/app-v2/data/appV2AuthenticatedDataSource.test.ts --run
```

Expected: falha porque `appV2AuthenticatedDataSource.ts` ainda nao existe.

- [ ] **Step 3: Criar contrato e bridge**

Criar `src/app-v2/data/appV2SessionReader.ts`:

```ts
export interface AppV2SessionUser {
  id: string;
  email?: string | null;
}

export interface AppV2SessionReader {
  getCurrentUser(): Promise<AppV2SessionUser | null>;
}
```

Criar `src/app-v2/data/appV2AuthenticatedDataSource.ts`:

```ts
import type { AppV2ClientesReader } from './appV2ClientesReadOnlyDataAdapter';
import type { AppV2ClientesWriter } from './appV2ClientesWriteDataAdapter';
import { createAppV2DataSource, type AppV2DataSource } from './appV2DataSourceFactory';
import type { AppV2EquipamentosWriter } from './appV2EquipamentosWriteDataAdapter';
import type { AppV2MockSnapshot } from './appV2MockStore';
import type { AppV2SessionReader } from './appV2SessionReader';

export interface CreateAuthenticatedAppV2DataSourceInput {
  initialSnapshot?: AppV2MockSnapshot;
  sessionReader: AppV2SessionReader;
  clientesReader?: AppV2ClientesReader;
  clientesWriter?: AppV2ClientesWriter;
  equipamentosWriter?: AppV2EquipamentosWriter;
}

export async function createAuthenticatedAppV2DataSource({
  initialSnapshot,
  sessionReader,
  clientesReader,
  clientesWriter,
  equipamentosWriter,
}: CreateAuthenticatedAppV2DataSourceInput): Promise<AppV2DataSource> {
  const user = await getUserOrNull(sessionReader);
  const userId = String(user?.id ?? '').trim();

  return createAppV2DataSource({
    initialSnapshot,
    session: userId ? { userId } : null,
    clientesReader,
    clientesWriter,
    equipamentosWriter,
  });
}

async function getUserOrNull(sessionReader: AppV2SessionReader) {
  try {
    return await sessionReader.getCurrentUser();
  } catch (_error) {
    return null;
  }
}
```

- [ ] **Step 4: Rodar teste e confirmar passagem**

Run:

```bash
npm test -- src/app-v2/data/appV2AuthenticatedDataSource.test.ts --run
```

Expected: passa.

### Task 2: Mount Boundary

**Files:**

- Modify: `src/app-v2/index.tsx`
- Test: `src/app-v2/index.test.tsx`

- [ ] **Step 1: Adicionar teste para injecao sem alterar preview default**

Adicionar caso em `src/app-v2/index.test.tsx`:

```ts
it('monta app-v2 com dataPort injetada por opcao sem criar auth no shell', async () => {
  const dataPort = createMemoryAppV2DataAdapter(
    createAppV2MockSnapshot({ clientes: [{ id: 'cliente-injetado', nome: 'Cliente injetado' }] }),
  );
  const root = document.createElement('div');

  const handle = mountAppV2(root, { dataPort });

  expect(await screen.findByText('Cliente injetado')).toBeInTheDocument();
  handle.unmount();
});
```

Se o teste atual ja cobre `dataPort`, manter o arquivo sem mudanca funcional e
adicionar apenas um teste de ausencia de imports proibidos:

```ts
it('mantem mount do app-v2 sem importar auth ou Supabase', () => {
  const source = readFileSync(resolve(__dirname, 'index.tsx'), 'utf8');

  expect(source).not.toContain('core/auth');
  expect(source).not.toContain('core/supabase');
  expect(source).not.toContain('@supabase');
});
```

- [ ] **Step 2: Rodar teste focado**

Run:

```bash
npm test -- src/app-v2/index.test.tsx --run
```

Expected: passa.

### Task 3: Preview Default Remains Local

**Files:**

- Modify: `src/app-v2/preview.tsx` only if adding a guard test requires it.
- Test: `src/app-v2/index.test.tsx` or new preview contract test.

- [ ] **Step 1: Adicionar teste read-only de contrato do preview**

Adicionar teste que leia `preview.tsx` e confirme:

```ts
expect(source).toContain('mountAppV2(root)');
expect(source).not.toContain('createAuthenticatedAppV2DataSource');
expect(source).not.toContain('core/auth');
expect(source).not.toContain('core/supabase');
expect(source).not.toContain('@supabase');
```

- [ ] **Step 2: Rodar teste**

Run:

```bash
npm test -- src/app-v2/index.test.tsx src/app-v2/data/appV2AuthenticatedDataSource.test.ts --run
```

Expected: passa.

### Task 4: Documentation

**Files:**

- Modify: `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`
- Create: `docs/rewrite/app-v2-auth-profile-real-cp-t.md`

- [ ] **Step 1: Criar relatorio CP-T**

Criar `docs/rewrite/app-v2-auth-profile-real-cp-t.md` registrando:

- objetivo;
- arquivos alterados;
- contratos criados;
- porque o shell continua sem auth/Supabase;
- que preview default continua local;
- validacoes executadas;
- proximo CP recomendado.

- [ ] **Step 2: Atualizar mapa central**

Adicionar `Status CP-T` no mapa central com:

- session reader criado;
- bridge autenticado criado;
- data source real segue opt-in;
- sem router, storage real amplo, PDF/share, billing, WhatsApp, upload ou PMOC.

### Task 5: Validacao Final

- [ ] **Step 1: Rodar testes focados**

Run:

```bash
npm test -- src/app-v2/data/appV2AuthenticatedDataSource.test.ts src/app-v2/data/appV2DataSourceFactory.test.ts src/app-v2/index.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
```

Expected: todos passam.

- [ ] **Step 2: Rodar validacao obrigatoria**

Run:

```bash
npm run format:check
npm run build
npm run check
git diff --check
```

Expected:

- comandos passam;
- warning conhecido em `src/domain/pdf/shareReport.js` pode permanecer;
- warnings Vite static/dynamic e chunks grandes podem permanecer;
- nenhum componente React do app-v2 importa auth, Supabase ou storage.

- [ ] **Step 3: Commit pequeno**

Run:

```bash
git add src/app-v2/data src/app-v2/index.tsx src/app-v2/index.test.tsx docs/rewrite
git commit -m "feat(app-v2): add authenticated data source boundary"
git push -u origin codex/rewrite-zero-react-parallel
```

## 5. Riscos e Decisoes

- A ativacao real no preview continua fora deste CP para evitar misturar auth
  real com UX/harness.
- O bridge engole erro de session reader e cai para local. Isso e intencional
  para preservar preview/harness; fluxos comerciais reais devem ganhar uma CP
  posterior com UX explicita de sessao expirada.
- `AppV2Shell` nao deve receber `sessionReader`; ele recebe apenas `dataPort`.
- Qualquer uso direto de `Auth`, `supabase`, `localStorage` ou
  `sessionStorage` dentro de `src/app-v2/shell`, `src/app-v2/equipment`,
  `src/app-v2/service`, `src/app-v2/home` ou `src/app-v2/account` bloqueia o CP.

## 6. Self-Review

- Spec coverage: cobre fronteira de auth/perfil real, composicao com data source
  existente, fallback local e preview default local.
- Placeholder scan: sem `TBD` ou passos genericos sem comando.
- Type consistency: `AppV2SessionReader` alimenta `createAppV2DataSource` via
  `session.userId`; o shell permanece dependente apenas de `AppV2DataPort`.
