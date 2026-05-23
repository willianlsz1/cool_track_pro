# Etapa 2 - Plano de implementacao da Home Hoje

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** construir um prototipo navegavel da Home operacional `Hoje` em `src/app-v2/`, com dados mockados e sem conectar ao legado.

**Architecture:** a Home sera composta por componentes pequenos, fixtures locais e funcoes puras de view model. O ponto de entrada `mountAppV2` passara a renderizar o prototipo isolado.

**Tech Stack:** React, TypeScript, Tailwind CSS com prefixo `tw-`, Vitest.

---

## 1. Escopo

Incluido:

- Home `Hoje` mobile-first;
- Proxima acao dominante;
- fila curta com 3 linhas clicaveis;
- bottom nav auto-ocultavel;
- estados mockados;
- testes focados para view model e comportamento da bottom nav quando viavel.

Fora do escopo:

- rotas reais;
- storage;
- Supabase;
- PDF/share;
- WhatsApp;
- Orcamento;
- PMOC;
- componentes legados;
- CSS legado;
- nova dependencia.

## 2. Arquivos previstos

Criar:

- `src/app-v2/home/mockHomeData.ts` - dados mockados da Home.
- `src/app-v2/home/homeViewModel.ts` - monta dados prontos para render.
- `src/app-v2/home/homeViewModel.test.ts` - testa estados principais da Home.
- `src/app-v2/home/HomeToday.tsx` - componente principal da Home.
- `src/app-v2/home/NextActionCard.tsx` - card dominante.
- `src/app-v2/home/ShortQueue.tsx` - fila curta.
- `src/app-v2/navigation/BottomNav.tsx` - bottom nav auto-ocultavel.
- `src/app-v2/navigation/useAutoHideNav.ts` - hook isolado para esconder/mostrar nav.
- `src/app-v2/navigation/useAutoHideNav.test.ts` - teste do calculo/hook se extraido de forma pura.

Modificar:

- `src/app-v2/index.tsx` - renderizar `HomeToday`.
- `src/app-v2/styles/tokens.ts` - trocar tokens para azul/branco com contraste forte.
- `docs/rewrite/etapa-2-home-hoje-design.md` - marcar estado executado ao final.

Nao modificar:

- `src/core/`;
- `src/domain/` legado;
- `src/ui/`;
- `src/features/`;
- `src/assets/styles/`;
- `index.html`;
- `vite.config.js`;
- storage keys;
- rotas legadas.

## 3. Tarefas

### Task 1: View model e mock data

**Files:**

- Create: `src/app-v2/home/mockHomeData.ts`
- Create: `src/app-v2/home/homeViewModel.ts`
- Create: `src/app-v2/home/homeViewModel.test.ts`

- [x] Escrever teste para estado de preventiva vencida.
- [x] Escrever teste para estado sem urgencias.
- [x] Implementar fixtures locais.
- [x] Implementar view model sem UI e sem storage.
- [x] Rodar:

```bash
npm run test -- src/app-v2/home/homeViewModel.test.ts
```

Expected: PASS.

### Task 2: Tokens visuais da Etapa 2

**Files:**

- Modify: `src/app-v2/styles/tokens.ts`

- [x] Atualizar tokens para:
  - fundo claro;
  - superficies brancas;
  - texto azul-marinho forte;
  - azul principal;
  - azul claro;
  - estados danger/warning/success.
- [x] Evitar cinza claro para texto funcional.
- [x] Rodar:

```bash
npm run typecheck
```

Expected: PASS.

### Task 3: Componentes da Home

**Files:**

- Create: `src/app-v2/home/HomeToday.tsx`
- Create: `src/app-v2/home/NextActionCard.tsx`
- Create: `src/app-v2/home/ShortQueue.tsx`
- Modify: `src/app-v2/index.tsx`

- [x] Criar `NextActionCard` com CTA principal e acao secundaria textual.
- [x] Criar `ShortQueue` com ate 3 linhas clicaveis e link "Ver todos".
- [x] Criar `HomeToday` usando mock data e view model.
- [x] Atualizar `mountAppV2` para renderizar `HomeToday`.
- [x] Nao conectar a rota real nem ao app legado.
- [x] Rodar:

```bash
npm run typecheck
npm run build
```

Expected: PASS.

### Task 4: Bottom nav auto-ocultavel

**Files:**

- Create: `src/app-v2/navigation/BottomNav.tsx`
- Create: `src/app-v2/navigation/useAutoHideNav.ts`
- Create: `src/app-v2/navigation/useAutoHideNav.test.ts`
- Modify: `src/app-v2/home/HomeToday.tsx`

- [x] Extrair logica de direcao de scroll para funcao testavel.
- [x] Escrever teste da regra: desce esconde, sobe mostra, topo mostra.
- [x] Criar bottom nav com Hoje, Equipamento, Servicos, Conta.
- [x] Integrar na Home sem navegar de verdade.
- [x] Rodar:

```bash
npm run test -- src/app-v2/navigation/useAutoHideNav.test.ts
```

Expected: PASS.

### Task 5: Visual QA local

**Files:**

- No source file changes unless QA finds issue.

- [x] Iniciar dev server.
- [x] Abrir prototipo no browser.
- [x] Verificar mobile e desktop estreito.
- [x] Confirmar:
  - texto legivel;
  - sem cinza fraco em texto importante;
  - card principal domina;
  - fila nao compete;
  - bottom nav nao cobre conteudo importante.

### Task 6: Validacao final

**Files:**

- Modify: `docs/rewrite/etapa-2-home-hoje-design.md`
- Modify: `docs/rewrite/etapa-2-home-hoje-plano.md`

- [x] Registrar resultado da execucao.
- [x] Rodar:

```bash
npm run format
npm run typecheck
npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts
npm run build
npm run check
git diff --check
```

Expected:

- format PASS;
- typecheck PASS;
- testes focados PASS;
- build PASS;
- check PASS ou somente warnings ja conhecidos;
- diff sem whitespace error.

## 4. Riscos

- A Home pode voltar a parecer dashboard se forem adicionadas metricas.
- A bottom nav auto-ocultavel pode gerar desconforto se esconder agressivamente.
- O uso de mock data pode mascarar lacunas de contrato real.
- O prototipo nao valida ainda fluxo de Equipamento ou Servico.

## 5. Criterio de pronto

1. Home `Hoje` renderiza no app-v2.
2. Nao ha integracao com legado.
3. Nao ha atalhos duplicando bottom nav.
4. Proxima acao domina a tela.
5. Fila tem 3 itens e "Ver todos".
6. Bottom nav auto-ocultavel funciona no prototipo.
7. Validacao completa foi executada.
