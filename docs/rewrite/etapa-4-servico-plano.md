# Etapa 4 - Registro de Serviço Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** construir o fluxo básico de Registro de serviço no `src/app-v2/`, com etapas curtas, dados mockados e conclusão local.

**Architecture:** a Etapa 4 deve criar uma área isolada em `src/app-v2/service/`, com view models puros, mock data local e componentes React pequenos. A navegação deve continuar em estado local dentro de `AppV2Shell`, sem rotas reais, storage, Supabase ou integração com o legado.

**Tech Stack:** React, TypeScript, Tailwind CSS com prefixo `tw-`, Vitest.

---

## 1. Escopo

Incluído:

- iniciar registro pela Home;
- iniciar registro pelo detalhe do Equipamento;
- fluxo por etapas curto;
- seleção de tipo de serviço;
- preenchimento de diagnóstico e ações executadas;
- seleção de status final do equipamento;
- fechamento com resumo mockado;
- área `Serviços` mínima para estado vazio ou serviço em andamento;
- testes focados para view models.

Fora do escopo:

- storage;
- Supabase;
- rotas reais;
- shell legado;
- fotos/upload;
- assinatura;
- PDF/share;
- WhatsApp;
- orçamento real;
- agendamento real;
- PMOC;
- nova dependência.

## 2. Arquivos previstos

Criar:

- `src/app-v2/service/mockServiceData.ts` - fixtures da área Serviço.
- `src/app-v2/service/serviceFlowViewModel.ts` - contexto, etapas, resumo e conclusão.
- `src/app-v2/service/serviceFlowViewModel.test.ts` - testes de contexto, etapas e resumo.
- `src/app-v2/service/ServiceFlow.tsx` - tela principal do fluxo.
- `src/app-v2/service/ServiceStepContext.tsx` - etapa de contexto.
- `src/app-v2/service/ServiceStepType.tsx` - etapa de tipo.
- `src/app-v2/service/ServiceStepExecution.tsx` - etapa de execução.
- `src/app-v2/service/ServiceStepReview.tsx` - etapa de fechamento.
- `src/app-v2/service/ServiceDone.tsx` - conclusão mockada.
- `src/app-v2/service/ServicesHome.tsx` - área `Serviços` mínima.

Modificar:

- `src/app-v2/shell/AppV2Shell.tsx` - adicionar estado local do fluxo de serviço.
- `src/app-v2/equipment/EquipmentDetail.tsx` - expor callback de iniciar serviço.
- `src/app-v2/home/HomeToday.tsx` - permitir CTA principal iniciar serviço quando houver equipamento.
- `src/app-v2/home/NextActionCard.tsx` - usar callback primário.
- `src/app-v2/domain/types.ts` - somente se a modelagem exigir campo opcional novo claramente justificado.
- `docs/rewrite/etapa-4-servico-design.md` - registrar resultado ao final.
- `docs/rewrite/etapa-4-servico-plano.md` - marcar execução.

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

## 3. Modelo de estado local recomendado

Criar tipo local em `serviceFlowViewModel.ts` ou arquivo coeso equivalente:

```ts
export type ServiceFlowStep = 'context' | 'type' | 'execution' | 'review' | 'done';

export interface ServiceDraft {
  equipmentId: string;
  commitmentId?: string;
  kind?: ServiceRecordKind;
  diagnosis: string;
  actionsDone: string;
  finalStatus: ServiceRecordStatus;
}
```

Regra:

- `AppV2Shell` mantém `serviceDraft` apenas em memória.
- Nada deve ser persistido fora do estado React nesta etapa.

## 4. Tarefas

### Task 1: View model do fluxo de serviço

**Files:**

- Create: `src/app-v2/service/mockServiceData.ts`
- Create: `src/app-v2/service/serviceFlowViewModel.ts`
- Create: `src/app-v2/service/serviceFlowViewModel.test.ts`

- [x] Escrever teste para montar contexto do registro a partir de um equipamento.
- [x] Escrever teste para pré-selecionar tipo quando houver compromisso preventiva/corretiva.
- [x] Escrever teste para montar resumo final com diagnóstico, ações e status.
- [x] Implementar fixtures locais com português brasileiro correto.
- [x] Implementar view model sem UI e sem storage.
- [x] Rodar:

```bash
npm run test -- src/app-v2/service/serviceFlowViewModel.test.ts
```

Expected: PASS.

### Task 2: Shell local para Registro de serviço

**Files:**

- Modify: `src/app-v2/shell/AppV2Shell.tsx`
- Modify: `src/app-v2/equipment/EquipmentDetail.tsx`
- Modify: `src/app-v2/home/HomeToday.tsx`
- Modify: `src/app-v2/home/NextActionCard.tsx`

- [x] Criar estado local para `activeTab = 'servicos'` com registro em andamento.
- [x] Criar função `startServiceFromEquipment(equipmentId, commitmentId?)`.
- [x] Fazer CTA principal da Home iniciar serviço quando houver equipamento.
- [x] Fazer botão principal do detalhe iniciar serviço.
- [x] Manter ação secundária da Home como abrir equipamento.
- [x] Rodar:

```bash
npm run typecheck
```

Expected: PASS.

### Task 3: Componentes das etapas

**Files:**

- Create: `src/app-v2/service/ServiceFlow.tsx`
- Create: `src/app-v2/service/ServiceStepContext.tsx`
- Create: `src/app-v2/service/ServiceStepType.tsx`
- Create: `src/app-v2/service/ServiceStepExecution.tsx`
- Create: `src/app-v2/service/ServiceStepReview.tsx`

- [x] Criar `ServiceFlow` controlando etapa atual.
- [x] Criar etapa Contexto com equipamento, cliente/local e motivo.
- [x] Criar etapa Tipo com opções preventiva, corretiva, instalação, visita e outro.
- [x] Criar etapa Execução com diagnóstico, ações executadas e status final.
- [x] Criar etapa Fechamento com resumo antes de concluir.
- [x] Garantir botões `Voltar` e `Continuar` sem quebrar layout mobile.
- [x] Rodar:

```bash
npm run typecheck
npm run build
```

Expected: PASS.

### Task 4: Conclusão mockada

**Files:**

- Create: `src/app-v2/service/ServiceDone.tsx`
- Modify: `src/app-v2/service/ServiceFlow.tsx`
- Modify: `src/app-v2/service/serviceFlowViewModel.ts`
- Modify: `src/app-v2/service/serviceFlowViewModel.test.ts`

- [x] Escrever teste para montar conclusão com resumo técnico.
- [x] Implementar tela **Serviço concluído**.
- [x] Mostrar saídas futuras como mock/desabilitadas: Relatório, Orçamento, Próximo compromisso.
- [x] Não chamar PDF, WhatsApp, orçamento ou agendamento real.
- [x] Permitir voltar para Equipamento ou Serviços.
- [x] Rodar:

```bash
npm run test -- src/app-v2/service/serviceFlowViewModel.test.ts
npm run typecheck
```

Expected: PASS.

### Task 5: Área Serviços mínima

**Files:**

- Create: `src/app-v2/service/ServicesHome.tsx`
- Modify: `src/app-v2/shell/AppV2Shell.tsx`

- [x] Substituir placeholder de `Serviços` por tela mínima.
- [x] Mostrar estado vazio quando não houver serviço em andamento.
- [x] Mostrar serviço em andamento quando existir draft local.
- [x] Permitir retomar o registro em andamento.
- [x] Manter histórico, relatórios e orçamentos fora do escopo.
- [x] Rodar:

```bash
npm run typecheck
npm run build
```

Expected: PASS.

### Task 6: QA visual

**Files:**

- No source file changes unless QA finds issue.

- [x] Iniciar dev server.
- [x] Abrir `http://localhost:<porta>/src/app-v2/preview.html`.
- [x] Verificar mobile e desktop estreito.
- [x] Confirmar:
  - Home inicia registro pelo CTA principal;
  - Equipamento inicia registro pelo botão principal;
  - etapas são curtas e legíveis;
  - botão voltar não perde contexto;
  - conclusão mostra saídas futuras sem executar nada real;
  - `Serviços` não parece dashboard nem histórico completo;
  - bottom nav não cobre conteúdo crítico.

### Task 7: Validação final

**Files:**

- Modify: `docs/rewrite/etapa-4-servico-design.md`
- Modify: `docs/rewrite/etapa-4-servico-plano.md`

- [x] Registrar resultado da execução.
- [x] Rodar:

```bash
npm run format
npm run typecheck
npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts
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

- Fluxo de Registro de serviço implementado em `src/app-v2/service/`.
- Entrada pela Home e pelo detalhe do Equipamento ligada ao `AppV2Shell`.
- Aba `Serviços` mínima criada para estado vazio e registro local em andamento.
- Integrações reais com legado, storage, PDF/share, WhatsApp, orçamento e agendamento não foram criadas.

## 5. Riscos

- O fluxo pode virar formulário longo se novas seções entrarem antes da hora.
- Sem storage, o draft em andamento some ao recarregar a página.
- Botões de saída futura podem parecer funcionais se não forem claramente mockados.
- A área `Serviços` pode crescer demais se histórico e relatórios entrarem nesta etapa.

## 6. Critério de pronto

1. Home inicia Registro de serviço.
2. Detalhe do Equipamento inicia Registro de serviço.
3. Registro abre com equipamento e cliente/local contextualizados.
4. Técnico escolhe tipo, preenche execução e revisa antes de concluir.
5. Conclusão mockada aparece com resumo técnico.
6. Área `Serviços` tem estado mínimo útil.
7. Nenhuma integração real com legado/storage/PDF/WhatsApp/orçamento foi criada.
8. Validação completa foi executada.
