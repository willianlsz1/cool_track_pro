# Etapa 1 - Base tecnica do app-v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** preparar a fundacao tecnica do `src/app-v2/` sem redesenhar telas finais nem alterar comportamento do app legado.

**Architecture:** o app-v2 nasce isolado, com tipos de dominio, contratos pequenos e adapters explicitos. O legado continua funcionando como baseline; qualquer dado reaproveitado passa por adapter planejado.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS com prefixo `tw-`, Vitest.

---

## 0. Estado de execucao

Status: executada.

Resultado:

- TypeScript configurado com `tsconfig.json`;
- `npm run typecheck` criado;
- `npm run check` passou a executar typecheck;
- `src/app-v2/` criado sem conexao com o shell legado;
- tipos centrais criados;
- regra pura inicial da Home operacional criada com teste focado;
- Tailwind passou a reconhecer `src/app-v2/**/*.{ts,tsx}`;
- nenhuma UI final foi implementada.

## 1. Diagnostico

O repo ja possui:

- Vite configurado em `vite.config.js`;
- React e React DOM em `package.json`;
- Tailwind em `tailwind.config.cjs`;
- prefixo Tailwind `tw-`;
- `preflight` desativado;
- Vitest configurado via Vite;
- testes JavaScript e JSX existentes.

O repo ainda nao possui:

- `typescript` em `devDependencies`;
- `@types/react`;
- `@types/react-dom`;
- `tsconfig.json`;
- comando dedicado de typecheck;
- `src/app-v2/`;
- contrato TypeScript para `Equipamento`, `Cliente`, `CompromissoServico`, `RegistroServico` e `Orcamento`.

Conclusao: a Etapa 1 deve ser tecnica e pequena. Ela pode mexer em configs e dependencias somente porque esta etapa existe para isso. Nao deve construir UI final.

## 2. Escopo

Incluido:

- configurar TypeScript para o app-v2;
- criar `src/app-v2/`;
- criar contratos de dominio iniciais;
- criar fixtures ou factories pequenas para testes;
- criar primeiro teste de contrato;
- preparar Tailwind para reconhecer arquivos do app-v2;
- adicionar comando de typecheck;
- validar build, lint, typecheck e testes.

Fora do escopo:

- Home operacional visual;
- mockups;
- prototipos navegaveis;
- rotas reais do app;
- storage offline;
- Supabase/RLS;
- billing;
- PDF/share;
- WhatsApp real;
- PMOC;
- conversao do legado para TypeScript;
- copia de CSS, shell, templates ou componentes legados.

## 3. Arquivos afetados previstos

Criar:

- `tsconfig.json` - configuracao TypeScript do projeto com foco no app-v2.
- `src/app-v2/domain/types.ts` - tipos centrais do novo app.
- `src/app-v2/domain/homePriority.ts` - regra pura inicial para ordenar a Home operacional.
- `src/app-v2/domain/homePriority.test.ts` - teste focado da regra de prioridade.
- `src/app-v2/index.tsx` - ponto de entrada interno ainda nao conectado ao app legado.
- `src/app-v2/styles/tokens.ts` - tokens pequenos de UI para evitar espalhar valores soltos.

Modificar:

- `package.json` - adicionar dependencias TypeScript e comando de typecheck.
- `package-lock.json` - atualizar lockfile depois de instalar dependencias aprovadas.
- `tailwind.config.cjs` - incluir `./src/app-v2/**/*.{ts,tsx}` em `content`.
- `eslint.config.js` - incluir suporte minimo a arquivos `.ts` e `.tsx` se necessario.
- `docs/rewrite/etapa-0-plano-mestre.md` - registrar que a Etapa 1 foi aberta.
- `docs/rewrite/etapa-0-stack-e-regras-agentes.md` - registrar comando de typecheck quando definido.

Nao modificar:

- `src/core/`;
- `src/domain/` legado;
- `src/ui/`;
- `src/features/`;
- `src/assets/styles/`;
- `vite.config.js`, salvo se a validacao provar necessidade;
- contratos publicos legados como `data-action`, `data-nav`, rotas e storage keys.

## 4. Plano de execucao

### Task 1: Preparar TypeScript

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tsconfig.json`

- [ ] **Step 1: instalar dependencias de tipo**

Run:

```bash
npm install -D typescript @types/react @types/react-dom
```

Expected: `package.json` e `package-lock.json` atualizados sem trocar major de dependencias existentes.

- [ ] **Step 2: adicionar comando de typecheck**

Em `package.json`, adicionar:

```json
"typecheck": "tsc --noEmit"
```

Expected: script disponivel via `npm run typecheck`.

- [ ] **Step 3: criar tsconfig**

Criar `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": true,
    "checkJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals"]
  },
  "include": ["src/app-v2/**/*.ts", "src/app-v2/**/*.tsx"]
}
```

Expected: legado JavaScript nao entra em checagem estrita.

- [ ] **Step 4: validar typecheck vazio**

Run:

```bash
npm run typecheck
```

Expected: PASS, mesmo antes de criar codigo app-v2.

### Task 2: Criar contratos de dominio do app-v2

**Files:**

- Create: `src/app-v2/domain/types.ts`

- [ ] **Step 1: criar tipos centrais**

Criar `src/app-v2/domain/types.ts`:

```ts
export type EquipmentStatus = 'ok' | 'warn' | 'danger';
export type EquipmentCriticality = 'baixa' | 'media' | 'alta' | 'critica';
export type OperationalPriority = 'baixa' | 'normal' | 'alta';

export type ServiceCommitmentKind = 'preventiva' | 'corretiva';
export type ServiceCommitmentStatus = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';

export type ServiceRecordKind = 'preventiva' | 'corretiva' | 'instalacao' | 'visita' | 'outro';
export type ServiceRecordStatus = EquipmentStatus;

export type QuoteStatus =
  | 'rascunho'
  | 'enviado'
  | 'aguardando_assinatura'
  | 'aprovado'
  | 'recusado'
  | 'expirado';

export interface Cliente {
  id: string;
  nome: string;
  razaoSocial?: string;
  documento?: string;
  contato?: string;
  endereco?: string;
}

export interface Equipamento {
  id: string;
  nome: string;
  local: string;
  status: EquipmentStatus;
  clienteId?: string;
  tag?: string;
  tipo?: string;
  criticidade?: EquipmentCriticality;
  prioridadeOperacional?: OperationalPriority;
  periodicidadePreventivaDias?: number;
  createdAt?: string;
}

export interface CompromissoServico {
  id: string;
  equipamentoId: string;
  tipo: ServiceCommitmentKind;
  status: ServiceCommitmentStatus;
  dataAlvo: string;
  prioridade?: OperationalPriority;
  origem: 'manual' | 'registro' | 'periodicidade';
}

export interface RegistroServico {
  id: string;
  equipamentoId: string;
  data: string;
  tipo: ServiceRecordKind;
  status: ServiceRecordStatus;
  tecnico: string;
  observacoes?: string;
  proximaData?: string;
}

export interface Orcamento {
  id: string;
  numero: string;
  status: QuoteStatus;
  clienteId?: string;
  equipamentoId?: string;
  registroId?: string;
  titulo: string;
  total: number;
}
```

Expected: contratos pequenos, sem depender do legado.

### Task 3: Criar primeira regra pura da Home operacional

**Files:**

- Create: `src/app-v2/domain/homePriority.ts`
- Create: `src/app-v2/domain/homePriority.test.ts`

- [ ] **Step 1: escrever teste de prioridade**

Criar `src/app-v2/domain/homePriority.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { pickNextHomeAction } from './homePriority';
import type { CompromissoServico, Equipamento, RegistroServico } from './types';

const today = '2026-05-10';

const equipamento: Equipamento = {
  id: 'eq-1',
  nome: 'Split sala tecnica',
  local: 'Sala tecnica',
  status: 'ok',
};

describe('pickNextHomeAction', () => {
  it('prioriza compromisso vencido antes de equipamento novo sem servico', () => {
    const compromissos: CompromissoServico[] = [
      {
        id: 'comp-1',
        equipamentoId: 'eq-1',
        tipo: 'preventiva',
        status: 'agendado',
        dataAlvo: '2026-05-09',
        origem: 'manual',
      },
    ];

    const result = pickNextHomeAction({
      today,
      equipamentos: [equipamento],
      compromissos,
      registros: [],
    });

    expect(result).toEqual({
      kind: 'compromisso_vencido',
      equipamentoId: 'eq-1',
      compromissoId: 'comp-1',
      cta: 'Iniciar servico',
    });
  });

  it('sugere primeiro servico para equipamento sem historico quando nao ha compromisso urgente', () => {
    const registros: RegistroServico[] = [];

    const result = pickNextHomeAction({
      today,
      equipamentos: [equipamento],
      compromissos: [],
      registros,
    });

    expect(result).toEqual({
      kind: 'equipamento_sem_primeiro_servico',
      equipamentoId: 'eq-1',
      cta: 'Registrar primeiro servico',
    });
  });
});
```

Expected: teste falha inicialmente porque `homePriority.ts` ainda nao existe.

- [ ] **Step 2: implementar regra minima**

Criar `src/app-v2/domain/homePriority.ts`:

```ts
import type { CompromissoServico, Equipamento, RegistroServico } from './types';

export type HomeAction =
  | {
      kind: 'compromisso_vencido' | 'compromisso_hoje';
      equipamentoId: string;
      compromissoId: string;
      cta: 'Iniciar servico';
    }
  | {
      kind: 'equipamento_sem_primeiro_servico';
      equipamentoId: string;
      cta: 'Registrar primeiro servico';
    }
  | {
      kind: 'sem_acao';
      cta: 'Buscar equipamento';
    };

interface PickNextHomeActionInput {
  today: string;
  equipamentos: Equipamento[];
  compromissos: CompromissoServico[];
  registros: RegistroServico[];
}

export function pickNextHomeAction(input: PickNextHomeActionInput): HomeAction {
  const activeCommitments = input.compromissos
    .filter((compromisso) => compromisso.status === 'agendado')
    .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo));

  const dueCommitment = activeCommitments.find(
    (compromisso) => compromisso.dataAlvo <= input.today,
  );

  if (dueCommitment) {
    return {
      kind: dueCommitment.dataAlvo < input.today ? 'compromisso_vencido' : 'compromisso_hoje',
      equipamentoId: dueCommitment.equipamentoId,
      compromissoId: dueCommitment.id,
      cta: 'Iniciar servico',
    };
  }

  const equipmentWithService = new Set(input.registros.map((registro) => registro.equipamentoId));
  const equipmentWithoutService = input.equipamentos.find(
    (equipamento) => !equipmentWithService.has(equipamento.id),
  );

  if (equipmentWithoutService) {
    return {
      kind: 'equipamento_sem_primeiro_servico',
      equipamentoId: equipmentWithoutService.id,
      cta: 'Registrar primeiro servico',
    };
  }

  return {
    kind: 'sem_acao',
    cta: 'Buscar equipamento',
  };
}
```

Expected: regra pura, testavel, sem UI e sem storage.

- [ ] **Step 3: rodar teste focado**

Run:

```bash
npm run test -- src/app-v2/domain/homePriority.test.ts
```

Expected: PASS.

### Task 4: Preparar entrada isolada do app-v2

**Files:**

- Create: `src/app-v2/index.tsx`
- Create: `src/app-v2/styles/tokens.ts`

- [ ] **Step 1: criar tokens iniciais**

Criar `src/app-v2/styles/tokens.ts`:

```ts
export const appV2Tone = {
  surface: 'tw-bg-white',
  page: 'tw-bg-slate-50',
  text: 'tw-text-slate-950',
  mutedText: 'tw-text-slate-600',
  border: 'tw-border-slate-200',
  action: 'tw-bg-blue-600 tw-text-white',
  warning: 'tw-bg-amber-50 tw-text-amber-900 tw-border-amber-200',
  danger: 'tw-bg-red-50 tw-text-red-900 tw-border-red-200',
} as const;
```

Expected: tokens simples, sem tema visual definitivo.

- [ ] **Step 2: criar entrada nao conectada**

Criar `src/app-v2/index.tsx`:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';

export function mountAppV2(root: HTMLElement) {
  createRoot(root).render(
    <React.StrictMode>
      <div />
    </React.StrictMode>,
  );
}
```

Expected: entrada existe, mas nao altera `index.html`, router ou shell legado.

### Task 5: Ajustar Tailwind para app-v2

**Files:**

- Modify: `tailwind.config.cjs`

- [ ] **Step 1: incluir app-v2 no content**

Alterar:

```js
content: ['./index.html', './src/react/**/*.{js,jsx,ts,tsx}'],
```

Para:

```js
content: ['./index.html', './src/react/**/*.{js,jsx,ts,tsx}', './src/app-v2/**/*.{ts,tsx}'],
```

Expected: Tailwind enxerga classes `tw-` do app-v2 sem ativar preflight.

### Task 6: Validar entrega da Etapa 1

**Files:**

- Modify: `docs/rewrite/etapa-0-plano-mestre.md`
- Modify: `docs/rewrite/etapa-0-stack-e-regras-agentes.md`

- [ ] **Step 1: documentar resultado da Etapa 1**

Registrar que a etapa tecnica abriu `src/app-v2/`, adicionou TypeScript e definiu `npm run typecheck`.

- [ ] **Step 2: rodar validacao completa**

Run:

```bash
npm run format
npm run typecheck
npm run test -- src/app-v2/domain/homePriority.test.ts
npm run build
npm run check
git diff --check
```

Expected:

- format PASS;
- typecheck PASS;
- teste focado PASS;
- build PASS;
- check PASS ou somente warnings ja documentados;
- diff sem whitespace error.

## 5. Riscos

- TypeScript pode exigir ajuste em ESLint se o lint passar a tentar parsear `.ts` sem suporte adequado.
- `npm install` pode alterar mais linhas no lockfile do que o esperado.
- Tailwind pode nao gerar classes se `content` ficar incompleto.
- Conectar `mountAppV2` ao shell legado nesta etapa criaria risco de regressao visual; por isso fica fora.
- A regra `pickNextHomeAction` e propositalmente inicial; ela nao resolve ainda servico incompleto, ultimo equipamento atendido ou criticos.

## 6. Criterio de pronto

A Etapa 1 termina quando:

1. TypeScript esta configurado e restrito ao app-v2.
2. `src/app-v2/` existe com contratos pequenos.
3. Ha uma regra pura testada para a Home operacional.
4. Tailwind reconhece o app-v2 mantendo `tw-` e `preflight: false`.
5. Nenhum fluxo legado foi conectado ou alterado.
6. Validacao completa foi executada e reportada.

## 7. Proxima etapa depois desta

Depois da Etapa 1, a Etapa 2 pode iniciar prototipos e mockups da Home operacional `Hoje`, usando dados mockados e a regra pura criada aqui como base.
