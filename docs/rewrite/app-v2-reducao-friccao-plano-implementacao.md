# app-v2 Reducao de Friccao - Plano de Implementacao

> **Para /goal:** execute este plano fase por fase, sem pular validacoes. Cada
> fase deve ser pequena, revisavel e limitada ao app-v2. Nao abrir router,
> storage real, Supabase/RLS, PDF/share, WhatsApp, billing, PMOC, package/config
> ou legado/v1.

**Goal:** Reduzir friccao na jornada do usuario do app-v2, preservando a
paridade funcional operacional e preparando o fluxo correto de Orcamento
pre-servico.

**Arquitetura:** Manter `AppV2Shell` como orquestrador local atual, usando
view-models e actions puras quando houver regra de produto. UI fica em
componentes app-v2 existentes. Mudancas de estado continuam mock/local em
memoria.

**Tech Stack:** React, TypeScript, Tailwind com prefixo `tw-`, Vitest, Vite.

---

## 1. Contrato de produto aprovado

Fontes obrigatorias antes de implementar:

- `CONTEXT.md`
- `docs/rewrite/app-v2-jornada-usuario-friccao.md`
- `docs/app-v2-goal.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md`

Decisoes aprovadas:

- `Conta` mantem atalhos apenas como redundancia/transitoria.
- `Alertas` e subvisao de `Hoje`, nao quinta area principal.
- A Proxima acao continua sendo o CTA principal da Home operacional.
- **Criacao contextual de equipamento** deve explicar que salvar o Equipamento
  retoma o Registro de servico.
- Area principal: **Equipamentos**. Entidade individual: **Equipamento**.
- `Orcamentos` continua em `Servicos`.
- **Orcamento pre-servico** e o fluxo principal de Orcamentos.
- **Orcamento pos-diagnostico** e excecao contextual.
- **Ciclo de Orcamento:** `rascunho`, `enviado`, `aprovado`, `recusado`.

Anti-escopo global:

- Nao criar rotas/deep links.
- Nao alterar storage real, Supabase/RLS, PDF/share, WhatsApp, billing, PMOC.
- Nao editar `package.json`, Vite, ESLint ou TypeScript config.
- Nao alterar legado/v1.
- Nao transformar Conta em area operacional.

## 2. Fase A - Reducao de friccao imediata

### Objetivo

Entregar tres melhorias pequenas:

1. Entrada contextual de `Alertas` em `Hoje`.
2. Rotulo mobile `Equipamentos`.
3. Banner de criacao contextual de equipamento.

### Arquivos esperados

- Modificar: `src/app-v2/home/homeViewModel.ts`
- Modificar: `src/app-v2/home/HomeToday.tsx`
- Modificar: `src/app-v2/navigation/BottomNav.tsx`
- Modificar: `src/app-v2/equipment/EquipmentForm.tsx`
- Modificar: `src/app-v2/equipment/EquipmentList.tsx`
- Modificar: `src/app-v2/shell/AppV2Shell.tsx`
- Testar/modificar: `src/app-v2/home/homeViewModel.test.ts`
- Testar/modificar: `src/app-v2/shell/AppV2Shell.test.tsx`
- Testar/modificar: `src/app-v2/shell/AppV2Shell.navigation.test.tsx`

### Task A1 - CTA contextual para Alertas em Hoje

- [ ] Escrever teste em `homeViewModel.test.ts` para garantir que, com alertas
      ativos, o view model expose contagem/severidade para uma chamada
      secundaria de Alertas.
- [ ] Rodar:

```bash
npm test -- src/app-v2/home/homeViewModel.test.ts --run
```

Esperado: falhar antes da implementacao.

- [ ] Implementar no `HomeTodayViewModel` um bloco de triagem de alertas com:
  - total de alertas;
  - total critico;
  - label do CTA, por exemplo `Ver alertas`;
  - estado discreto quando nao houver alertas.
- [ ] Adicionar prop em `HomeToday`:

```ts
onOpenAlerts?: () => void;
```

- [ ] Renderizar em `HomeToday.tsx` um atalho secundario para Alertas:
  - com destaque quando houver alertas ativos;
  - sem substituir o CTA principal da Proxima acao;
  - sem criar nova area principal.
- [ ] Ligar em `AppV2Shell.tsx`:

```ts
onOpenAlerts={() => setHomeView('alerts')}
```

- [ ] Adicionar teste de shell: a partir de `Hoje`, clicar em `Ver alertas` abre
      `Alertas e Anormalidades` sem passar por `Conta`.
- [ ] Rodar:

```bash
npm test -- src/app-v2/home/homeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
```

### Task A2 - Padronizar rotulo mobile para Equipamentos

- [ ] Alterar `src/app-v2/navigation/BottomNav.tsx`:

```ts
{ id: 'equipamento', label: 'Equipamentos', desktopLabel: 'Equipamentos', marker: 'equipment' }
```

- [ ] Atualizar testes que esperam o texto singular, se houver.
- [ ] Rodar:

```bash
npm test -- src/app-v2/shell/AppV2Shell.navigation.test.tsx src/app-v2/shell/AppV2Shell.test.tsx --run
```

### Task A3 - Banner de criacao contextual de equipamento

- [ ] Adicionar prop opcional em `EquipmentForm.tsx`:

```ts
contextBanner?: {
  title: string;
  description: string;
};
```

- [ ] Renderizar o banner acima da secao "Etiqueta do equipamento", apenas
      quando a prop existir.
- [ ] Adicionar prop opcional em `EquipmentList.tsx` para repassar ao
      `EquipmentForm`:

```ts
contextBanner?: EquipmentFormProps['contextBanner'];
```

- [ ] Em `AppV2Shell.tsx`, quando `startServiceAfterEquipmentCreate` estiver
      ativo, passar banner para `EquipmentList`:

```ts
{
  title: 'Cadastro para continuar o registro',
  description:
    'Salve este equipamento para retomar o Registro de servico automaticamente.',
}
```

- [ ] Adicionar teste de shell cobrindo:
  - iniciar servico sem equipamentos;
  - ir para Equipamentos;
  - ver banner contextual;
  - salvar equipamento;
  - retornar ao fluxo de Registro de servico.
- [ ] Rodar:

```bash
npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run
```

### Validacao da Fase A

Rodar:

```bash
npm run format
npm run build
npm run check
```

Commit sugerido:

```bash
git add src/app-v2/home src/app-v2/navigation src/app-v2/equipment src/app-v2/shell
git commit -m "feat(app-v2): reduce immediate navigation friction"
```

## 3. Fase B - Orcamento pre-servico local

### Objetivo

Permitir criar rascunho de Orcamento antes da execucao do servico, vinculado a
Equipamento e Cliente quando disponiveis, sem envio real, billing ou storage.

### Arquivos esperados

- Modificar: `src/app-v2/domain/types.ts`
- Modificar: `src/app-v2/data/appV2Actions.ts`
- Modificar: `src/app-v2/data/appV2Flow.test.ts`
- Modificar: `src/app-v2/service/servicesQuotesViewModel.ts`
- Modificar: `src/app-v2/service/ServicesQuotesHome.tsx`
- Modificar/criar componente em `src/app-v2/service/` para formulario de novo
  Orcamento pre-servico, se o arquivo ficar grande.
- Modificar: `src/app-v2/shell/AppV2Shell.tsx`
- Testar/modificar: `src/app-v2/shell/AppV2ShellQuotes.test.tsx`

### Task B1 - Action pura para criar Orcamento pre-servico

- [ ] Escrever teste em `appV2Flow.test.ts` para nova action:

```ts
createPreServiceQuoteDraft(snapshot, {
  id: 'orcamento-local-2',
  equipmentId: 'eq-1',
  templateId: 'instalacao-split',
});
```

Expectativa:

- cria `Orcamento` com `status: 'rascunho'`;
- vincula `equipamentoId`;
- herda `clienteId` do Equipamento;
- nao exige `registroId`;
- nao toca billing, Supabase, PDF/share ou storage real.

- [ ] Implementar action pura em `appV2Actions.ts`, usando numero
      `ORC-YYYY-###`.
- [ ] Rodar:

```bash
npm test -- src/app-v2/data/appV2Flow.test.ts --run
```

### Task B2 - UI de criacao em Servicos > Orcamentos

- [ ] Ajustar `ServicesQuotesHome.tsx` para que `Novo orcamento local` abra
      criacao pre-servico, nao apenas edite o primeiro rascunho existente.
- [ ] Permitir selecionar Equipamento e derivar Cliente no rascunho.
- [ ] Reutilizar templates existentes em `quoteTemplates.ts`.
- [ ] Ao salvar/criar, inserir rascunho no estado local e abrir o editor desse
      rascunho ou voltar para a lista com o rascunho visivel.
- [ ] Manter status inicial `rascunho`.
- [ ] Nao implementar envio real nem aprovacao real.

### Task B3 - Shell e testes de criacao

- [ ] Adicionar handler em `AppV2Shell.tsx` para criar Orcamento pre-servico.
- [ ] Escrever teste em `AppV2ShellQuotes.test.tsx`:
  - abrir `Servicos > Orcamentos`;
  - clicar `Novo orcamento local`;
  - selecionar equipamento;
  - salvar rascunho;
  - verificar cliente/equipamento/numero/status;
  - garantir ausencia de `Billing`, `Supabase`, `WhatsApp`, `PDF`.
- [ ] Rodar:

```bash
npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2ShellQuotes.test.tsx --run
```

### Validacao da Fase B

Rodar:

```bash
npm run format
npm run build
npm run check
```

Commit sugerido:

```bash
git add src/app-v2/domain src/app-v2/data src/app-v2/service src/app-v2/shell
git commit -m "feat(app-v2): add local pre-service quote draft"
```

## 4. Fase C - CTAs contextuais

### Objetivo

Mostrar a acao dominante conforme o estado operacional, sem criar novas areas
principais nem rotas.

### Escopo

- `Servicos`: destacar continuar servico, registrar novo servico, revisar
  orcamento em aberto ou ver relatorio recente conforme estado.
- `Hoje`: mostrar rascunho de Orcamento em aberto apenas quando for relevante e
  sem competir com Proxima acao.
- `Fechamento de servico`: trocar CTA generico de Orcamento por acao contextual
  de **Orcamento pos-diagnostico**, somente quando fizer sentido no modelo.

### Arquivos esperados

- Modificar: `src/app-v2/service/servicesHomeViewModel.ts`
- Modificar: `src/app-v2/service/ServicesHome.tsx`
- Modificar: `src/app-v2/home/homeViewModel.ts`
- Modificar: `src/app-v2/home/HomeToday.tsx`
- Modificar: `src/app-v2/service/ServiceDone.tsx`
- Testar: view-models e shell relacionados.

### Tasks

- [ ] Criar testes de view model para priorizacao de CTA em `Servicos`.
- [ ] Implementar modelo de CTA dominante em `servicesHomeViewModel.ts`.
- [ ] Renderizar CTA em `ServicesHome.tsx`.
- [ ] Criar testes para rascunho de Orcamento em aberto em `homeViewModel.ts`.
- [ ] Renderizar chamada discreta em `HomeToday.tsx`.
- [ ] Revisar `ServiceDone.tsx` para que Orcamento pos-diagnostico nao pareca
      acao padrao apos qualquer servico concluido.
- [ ] Adicionar testes de shell para navegacao a partir dos CTAs.

### Validacao da Fase C

Rodar:

```bash
npm test -- src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run
npm run format
npm run build
npm run check
```

Commit sugerido:

```bash
git add src/app-v2/home src/app-v2/service src/app-v2/shell
git commit -m "feat(app-v2): add contextual operational ctas"
```

## 5. Fase D - Navegacao avancada documental

### Objetivo

Avaliar deep links/historico para subvisoes internas sem implementar router por
palpite.

### Escopo

- Documentar se `Hoje > Alertas`, `Servicos > Orcamentos` e detalhes de
  Equipamento precisam de URL propria.
- Classificar impacto em contratos publicos, testes e estado local.
- Decidir se router entra em etapa propria futura.

### Arquivos esperados

- Criar: `docs/rewrite/app-v2-navegacao-avancada-router-triagem.md`
- Nao alterar `src/` nesta fase sem aprovacao explicita.

### Tasks

- [ ] Mapear subvisoes que hoje vivem em estado local.
- [ ] Identificar ganhos reais de deep link e historico.
- [ ] Listar riscos: back button, estado em andamento, draft local, fluxo de
      servico e criacao contextual.
- [ ] Recomendar manter local ou abrir etapa tecnica de router.

### Validacao da Fase D

Rodar:

```bash
npm run format:check
git diff --check
```

Commit sugerido:

```bash
git add docs/rewrite/app-v2-navegacao-avancada-router-triagem.md
git commit -m "docs(app-v2): triage advanced navigation"
```

## 6. Plano de execucao recomendado para /goal

Use quatro goals pequenos, nao um goal gigante:

1. `/goal` Fase A:
   - "Implementar Fase A de reducao de friccao imediata do app-v2 conforme
     docs/rewrite/app-v2-reducao-friccao-plano-implementacao.md, sem tocar
     storage/router/areas sensiveis."
2. `/goal` Fase B:
   - "Implementar Orcamento pre-servico local do app-v2 conforme Fase B do
     plano, mantendo rascunho local e sem envio real, billing ou storage."
3. `/goal` Fase C:
   - "Implementar CTAs contextuais do app-v2 conforme Fase C do plano, sem criar
     novas areas principais nem rotas."
4. `/goal` Fase D:
   - "Criar triagem documental de navegacao avancada/router conforme Fase D do
     plano, sem alterar runtime."

## 7. Validacao final apos todas as fases

Ao final das fases A-C, rodar:

```bash
npm run format
npm run build
npm run check
```

Para fases documentais, rodar:

```bash
npm run format:check
git diff --check
```

Relatorio final deve incluir:

- Branch.
- HEAD inicial e final.
- Commits por fase.
- Arquivos alterados.
- Validacoes executadas.
- O que nao foi alterado.
- Riscos remanescentes.
- Proximo passo recomendado.
