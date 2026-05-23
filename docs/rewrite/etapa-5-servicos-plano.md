# Etapa 5 - Central de Serviços Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** evoluir a aba `Serviços` no `src/app-v2/` para uma central operacional mínima com serviço em andamento, registros recentes mockados e saídas futuras desabilitadas.

**Architecture:** a Etapa 5 deve permanecer isolada em `src/app-v2/service/`, com view models puros, mocks locais e componentes React pequenos. Não conectar storage, Supabase, legado, PDF/share, WhatsApp, orçamento real ou agendamento real.

**Tech Stack:** React, TypeScript, Tailwind CSS com prefixo `tw-`, Vitest.

---

## 1. Escopo

Incluído:

- estado vazio mais útil em `Serviços`;
- destaque de serviço em andamento;
- registros recentes mockados;
- status final do registro;
- saída futura mockada por registro;
- CTA para retomar registro em andamento;
- testes focados para view models.

Fora do escopo:

- storage;
- Supabase;
- rotas reais;
- shell legado;
- PDF/share;
- WhatsApp;
- orçamento real;
- agendamento real;
- histórico completo;
- filtros complexos;
- busca avançada;
- PMOC;
- fotos;
- assinatura;
- nova dependência.

## 2. Arquivos previstos

Criar:

- `src/app-v2/service/servicesHomeViewModel.ts` - view model da central de Serviços.
- `src/app-v2/service/servicesHomeViewModel.test.ts` - testes de andamento, recentes e saídas futuras.
- `src/app-v2/service/ServiceInProgressCard.tsx` - card de serviço em andamento.
- `src/app-v2/service/RecentServiceCard.tsx` - card compacto de registro recente.
- `src/app-v2/service/ServiceOutputPill.tsx` - indicação de saída futura mockada.

Modificar:

- `src/app-v2/service/mockServiceData.ts` - incluir registros recentes e saídas mockadas se necessário.
- `src/app-v2/service/ServicesHome.tsx` - substituir render atual por central mínima.
- `docs/rewrite/etapa-5-servicos-design.md` - registrar resultado ao final.
- `docs/rewrite/etapa-5-servicos-plano.md` - marcar execução.

Não modificar:

- `src/core/`;
- `src/domain/` legado;
- `src/ui/`;
- `src/features/`;
- `src/assets/styles/`;
- `index.html`;
- `vite.config.js`;
- storage keys;
- rotas legadas;
- PDF/share;
- WhatsApp;
- orçamento legado.

## 3. Modelo local recomendado

Criar tipos locais em `servicesHomeViewModel.ts`:

```ts
export type ServiceOutputStatus =
  | 'relatorio_pendente'
  | 'orcamento_sugerido'
  | 'proximo_compromisso_sugerido'
  | 'sem_pendencia';

export interface RecentServiceViewModel {
  id: string;
  equipmentName: string;
  customerLine: string;
  kindLabel: string;
  dateLabel: string;
  statusLabel: string;
  summary: string;
  outputStatus: ServiceOutputStatus;
}
```

Regra:

- a saída futura é apenas visual;
- nenhum item deve chamar função real de PDF, WhatsApp, orçamento ou agenda;
- não alterar `domain/types.ts` se a modelagem local bastar.

## 4. Tarefas

### Task 1: View model da central de Serviços

**Files:**

- Create: `src/app-v2/service/servicesHomeViewModel.ts`
- Create: `src/app-v2/service/servicesHomeViewModel.test.ts`
- Modify: `src/app-v2/service/mockServiceData.ts`

- [x] Escrever teste para estado vazio sem draft e sem registros.
- [x] Escrever teste para serviço em andamento a partir de `ServiceDraft`.
- [x] Escrever teste para registros recentes com equipamento e cliente/local.
- [x] Escrever teste para mapear saídas futuras mockadas.
- [x] Implementar mocks locais com português brasileiro correto.
- [x] Implementar view model sem UI e sem storage.
- [x] Rodar:

```bash
npm run test -- src/app-v2/service/servicesHomeViewModel.test.ts
```

Expected: PASS.

### Task 2: Componentes compactos de Serviços

**Files:**

- Create: `src/app-v2/service/ServiceInProgressCard.tsx`
- Create: `src/app-v2/service/RecentServiceCard.tsx`
- Create: `src/app-v2/service/ServiceOutputPill.tsx`
- Modify: `src/app-v2/service/ServicesHome.tsx`

- [x] Criar card de serviço em andamento com CTA `Retomar registro`.
- [x] Criar card de registro recente compacto.
- [x] Criar pill de saída futura mockada.
- [x] Substituir render atual de `ServicesHome` pelo view model.
- [x] Garantir que estado vazio continue claro.
- [x] Rodar:

```bash
npm run typecheck
```

Expected: PASS.

### Task 3: QA visual da aba Serviços

**Files:**

- No source file changes unless QA finds issue.

- [x] Iniciar dev server.
- [x] Abrir `http://localhost:<porta>/src/app-v2/preview.html`.
- [x] Verificar mobile e desktop estreito.
- [x] Confirmar:
  - `Serviços` abre sem parecer dashboard;
  - serviço em andamento aparece no topo quando existe;
  - registros recentes são legíveis;
  - saídas futuras parecem desabilitadas/mockadas;
  - bottom nav não cobre conteúdo crítico;
  - nenhum botão executa PDF, WhatsApp, orçamento ou agendamento real.

### Task 4: Validação final

**Files:**

- Modify: `docs/rewrite/etapa-5-servicos-design.md`
- Modify: `docs/rewrite/etapa-5-servicos-plano.md`

- [x] Registrar resultado da execução.
- [x] Rodar:

```bash
npm run format
npm run typecheck
npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts
npm run build
npm run check
git diff --check
```

Expected:

- format PASS;
- typecheck PASS;
- testes focados PASS;
- build PASS;
- check PASS ou somente warnings já conhecidos;
- diff sem whitespace error.

Resultado da execução:

- Central de Serviços implementada com view model puro em `src/app-v2/service/servicesHomeViewModel.ts`.
- `ServicesHome` passou a renderizar serviço em andamento, registros recentes e saídas futuras mockadas.
- Saídas futuras permanecem visuais, sem PDF, WhatsApp, orçamento ou agendamento real.

## 5. Riscos

- A central de Serviços pode duplicar a Home se o topo virar agenda.
- Saídas futuras podem parecer funcionais se forem botões fortes.
- Registros recentes mockados podem induzir contrato de storage prematuro.
- A tela pode ficar densa demais no mobile se entrar filtro antes da hora.

## 6. Critério de pronto

1. `Serviços` mostra estado vazio útil.
2. `Serviços` mostra serviço em andamento quando há draft local.
3. `Serviços` mostra registros recentes mockados.
4. Cada registro tem contexto de equipamento e cliente/local.
5. Saídas futuras ficam claras e desabilitadas.
6. Nenhuma integração real com legado/storage/PDF/WhatsApp/orçamento/agendamento foi criada.
7. View model tem testes focados.
8. Validação completa foi executada.
