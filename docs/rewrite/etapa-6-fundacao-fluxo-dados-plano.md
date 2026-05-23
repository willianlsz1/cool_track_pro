# Etapa 6 - Fundacao de fluxo e dados do app-v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para implementar este plano task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** fortalecer a fundacao do `src/app-v2/` ate 100% sem mexer na UI, garantindo contratos de dominio compartilhados, store mockada unica, acoes puras de fluxo, estado operacional consistente e testes focados de fluxo completo.

**Architecture:** a Etapa 6 deve consolidar o que ja existe em Home Hoje, Equipamentos, Registro de Servico e Central de Servicos sem alterar a aparencia. A fonte de dados passa a ser uma store mockada unica e as telas continuam recebendo view models prontos, sem storage real, Supabase, legado, PDF/share, WhatsApp, billing, PMOC, assinatura ou orcamento real.

**Tech Stack:** React, TypeScript, Tailwind CSS com prefixo `tw-`, Vitest.

---

## 1. Diagnostico atual

O `app-v2` ja possui:

- tipos centrais em `src/app-v2/domain/types.ts`;
- regra pura de prioridade da Home em `src/app-v2/domain/homePriority.ts`;
- view models testados para Home Hoje, Equipamentos, Registro de Servico e Central de Servicos;
- dados mockados por area;
- shell local em `src/app-v2/shell/AppV2Shell.tsx`;
- testes focados de view model e comportamento de navegacao.

Ainda falta para considerar a fundacao 100%:

- uma store mockada unica para evitar verdades diferentes por tela;
- acoes puras que representem o fluxo do tecnico;
- estado operacional derivado de uma unica fonte;
- testes de fluxo completo atravessando Home, Equipamento, Registro e Servicos;
- documentacao de progresso e riscos a cada checkpoint.

## 2. Percentual de fortalecimento

Estado inicial da Etapa 6: **60%**.

Justificativa:

- Home Hoje existe e tem prioridade testada;
- Equipamentos existe com lista, detalhe e view model;
- Registro de Servico existe com fluxo por etapas e view model;
- Central de Servicos existe com registros recentes e saidas futuras mockadas;
- porem os dados ainda sao mocks por area, as acoes de fluxo ainda vivem no shell/componentes e nao ha teste completo de jornada operacional.

100% nesta etapa significa:

1. Home Hoje, Equipamentos, Registro de Servico e Central de Servicos usam contratos de dominio compartilhados.
2. Todas essas areas leem de uma store mockada unica.
3. Fluxos principais sao executados por acoes puras testadas.
4. Estado operacional e derivado de uma unica fonte de dados.
5. Testes cobrem pelo menos os fluxos:
   - cadastrar equipamento sem primeiro servico gera proxima acao na Home;
   - iniciar servico move o estado para Registro em andamento;
   - concluir servico adiciona registro recente em Servicos;
   - concluir servico com status de atencao sugere orcamento futuro mockado;
   - agendar proximo compromisso faz a Home priorizar o compromisso correto.
6. `npm run format`, `npm run typecheck`, testes focados, `npm run build`, `npm run check` e `git diff --check` seguem verdes ou apenas com warnings conhecidos ja documentados.

## 3. Escopo permitido

Incluido:

- consolidar contratos de dominio do `app-v2`;
- criar store mockada unica em memoria;
- criar repository/adapters mockados do `app-v2`;
- criar acoes puras de fluxo;
- criar seletor de estado operacional;
- ajustar view models para receber dados da store mockada unica;
- criar testes de fluxo completo;
- atualizar docs desta etapa com progresso, riscos e percentual recalculado.

Fora do escopo:

- alterar UI visual;
- alterar CSS/tokens;
- reaproveitar CSS, UI, UX, templates ou navegacao do legado;
- mexer no app legado;
- Supabase;
- storage real;
- `localStorage`;
- PDF/share;
- WhatsApp real;
- billing;
- PMOC;
- assinatura;
- orcamento real;
- novas dependencias;
- rotas reais;
- migracao do legado para TypeScript.

## 4. Arquivos previstos

Criar:

- `src/app-v2/data/appV2MockData.ts` - seed unico com clientes, equipamentos, compromissos, registros e orcamentos mockados.
- `src/app-v2/data/appV2MockStore.ts` - estado em memoria e helpers puros para criar snapshots.
- `src/app-v2/data/appV2Actions.ts` - acoes puras do fluxo tecnico.
- `src/app-v2/data/appV2Selectors.ts` - seletores de estado operacional derivados da store.
- `src/app-v2/data/appV2Flow.test.ts` - testes de jornada completa.

Modificar, somente se necessario:

- `src/app-v2/domain/types.ts` - adicionar campos faltantes quando o fluxo exigir contrato compartilhado.
- `src/app-v2/domain/homePriority.ts` - receber estado consistente se o contrato atual ficar insuficiente.
- `src/app-v2/home/homeViewModel.ts` - consumir dados derivados da store, sem mudar visual.
- `src/app-v2/equipment/equipmentViewModel.ts` - consumir contratos compartilhados, sem mudar visual.
- `src/app-v2/service/serviceFlowViewModel.ts` - usar contratos compartilhados e acoes puras quando fizer sentido.
- `src/app-v2/service/servicesHomeViewModel.ts` - consumir registros/saidas derivados da store.
- `src/app-v2/shell/AppV2Shell.tsx` - trocar mocks locais pela store mockada unica, sem mudar layout.
- `docs/rewrite/etapa-0-plano-mestre.md` - registrar a Etapa 6.
- `docs/rewrite/etapa-6-fundacao-fluxo-dados-plano.md` - marcar progresso por checkpoint.

Nao modificar:

- `src/core/`;
- `src/domain/` legado;
- `src/ui/`;
- `src/features/`;
- `src/assets/styles/`;
- `index.html`;
- `vite.config.js`;
- storage keys;
- rotas legadas;
- contratos de PDF/relatorio;
- permissoes;
- billing;
- Supabase/RLS.

## 5. Checkpoints

### Checkpoint 6.1: Auditoria de contratos

**Meta:** confirmar quais campos pertencem ao dominio compartilhado e quais devem continuar locais.

**Files:**

- Modify: `docs/rewrite/etapa-6-fundacao-fluxo-dados-plano.md`
- Modify, only if needed: `src/app-v2/domain/types.ts`
- Test, only if code changes: focused affected tests

- [ ] Mapear campos usados por Home, Equipamentos, Registro e Servicos.
- [ ] Identificar duplicacoes ou tipos locais que deveriam virar contrato compartilhado.
- [ ] Nao mover tipos para dominio se forem apenas view model.
- [ ] Registrar decisao e percentual recalculado.
- [ ] Rodar validacao cabivel.

Expected: contrato compartilhado claro, sem mudanca visual.

### Checkpoint 6.2: Store mockada unica

**Meta:** substituir mocks por area por um seed unico do `app-v2`.

**Files:**

- Create: `src/app-v2/data/appV2MockData.ts`
- Create: `src/app-v2/data/appV2MockStore.ts`
- Modify: `src/app-v2/home/mockHomeData.ts`
- Modify: `src/app-v2/equipment/mockEquipmentData.ts`
- Modify: `src/app-v2/service/mockServiceData.ts`
- Modify: `src/app-v2/shell/AppV2Shell.tsx`
- Test: existing focused tests

- [ ] Escrever teste que prova que Home, Equipamento e Servicos usam o mesmo equipamento por id.
- [ ] Criar seed unico com dados atuais preservados.
- [ ] Fazer mocks por area reexportarem/derivarem do seed unico quando ainda forem necessarios.
- [ ] Atualizar o shell para montar input a partir da store mockada.
- [ ] Rodar testes focados e typecheck.
- [ ] Atualizar progresso e percentual.

Expected: uma unica fonte mockada, sem storage real.

### Checkpoint 6.3: Acoes puras de fluxo

**Meta:** tirar a semantica do fluxo de dentro do shell e criar funcoes puras testaveis.

**Files:**

- Create: `src/app-v2/data/appV2Actions.ts`
- Test: `src/app-v2/data/appV2Flow.test.ts`
- Modify: `src/app-v2/shell/AppV2Shell.tsx`
- Modify, if needed: `src/app-v2/service/serviceFlowViewModel.ts`

- [ ] Escrever teste para iniciar servico a partir de equipamento.
- [ ] Escrever teste para iniciar servico a partir de compromisso.
- [ ] Escrever teste para concluir servico e adicionar registro.
- [ ] Escrever teste para agendar proximo compromisso mockado.
- [ ] Implementar acoes puras sem React e sem storage.
- [ ] Adaptar shell para chamar acoes sem mudar UI.
- [ ] Rodar testes focados e typecheck.
- [ ] Atualizar progresso e percentual.

Expected: fluxo principal testavel sem renderizacao.

### Checkpoint 6.4: Estado operacional unico

**Meta:** criar seletores que respondem o que a Home, Equipamentos e Servicos devem mostrar a partir da mesma store.

**Files:**

- Create: `src/app-v2/data/appV2Selectors.ts`
- Test: `src/app-v2/data/appV2Flow.test.ts`
- Modify: `src/app-v2/home/homeViewModel.ts`
- Modify: `src/app-v2/service/servicesHomeViewModel.ts`
- Modify, if needed: `src/app-v2/equipment/equipmentViewModel.ts`

- [ ] Escrever teste para estado operacional sem servico em andamento.
- [ ] Escrever teste para estado com servico em andamento.
- [ ] Escrever teste para estado apos conclusao de servico.
- [ ] Implementar seletores puros.
- [ ] Ajustar view models para receber estado derivado, sem mudar markup visual.
- [ ] Rodar testes focados, typecheck e build.
- [ ] Atualizar progresso e percentual.

Expected: telas deixam de calcular verdades divergentes.

### Checkpoint 6.5: Testes de fluxo completo

**Meta:** cobrir jornadas reais do tecnico sem depender de UI.

**Files:**

- Modify: `src/app-v2/data/appV2Flow.test.ts`
- Modify: affected source files only if tests reveal gap real

- [ ] Testar equipamento novo sem primeiro servico aparecendo como proxima acao.
- [ ] Testar inicio de servico pela proxima acao.
- [ ] Testar conclusao de servico criando registro recente.
- [ ] Testar saida futura mockada de orcamento sugerido.
- [ ] Testar compromisso futuro voltando para Home quando agendado.
- [ ] Rodar suite focada completa do `app-v2`.
- [ ] Atualizar progresso e percentual.

Expected: fluxo tecnico principal protegido contra regressao logica.

### Checkpoint 6.6: Validacao final da Etapa 6

**Meta:** fechar a fundacao em 100% ou declarar exatamente o que falta.

**Files:**

- Modify: `docs/rewrite/etapa-6-fundacao-fluxo-dados-plano.md`
- Modify: `docs/rewrite/etapa-0-plano-mestre.md`

- [ ] Rodar:

```bash
npm run format
npm run typecheck
npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2Flow.test.ts
npm run build
npm run check
git diff --check
```

- [ ] Registrar resultado.
- [ ] Recalcular percentual.
- [ ] Se menor que 100%, documentar bloqueio e parar.

Expected: build, typecheck, check e testes verdes, com apenas warnings conhecidos ja documentados.

## 6. Riscos

- Store mockada pode virar arquitetura definitiva se nao ficar explicitamente marcada como mock.
- Acoes puras podem crescer demais se tentarem antecipar storage real.
- Reorganizar mocks pode quebrar testes por nomes/fixtures, mesmo sem mudar UI.
- Campos de dominio podem ser promovidos cedo demais se forem apenas necessidades de tela.
- Shell pode acumular responsabilidade se a store for integrada sem limite.

Mitigacao:

- cada checkpoint deve ser pequeno;
- toda mudanca de codigo deve ter teste focado;
- docs devem registrar decisoes e percentual ao final de cada checkpoint;
- se houver duvida sobre contrato publico ou integracao real, parar e pedir decisao humana.

## 7. Estado de execucao

Status: concluida.

Checkpoint atual: **6G - Validacao final executada**.

Percentual atual: **100%**.

Proxima menor acao segura: iniciar a proxima etapa sobre a fundacao validada, sem misturar UI com integracoes sensiveis.

Resultado 6B:

- campos atuais classificados em `docs/rewrite/fortalecimento-app-v2-status.md`;
- nenhuma alteracao em `src/app-v2/domain/types.ts` foi necessaria;
- `ServiceDraft` permanece como estado de fluxo, nao entidade de dominio persistida;
- `ServiceOutputStatus` permanece local da Central de Servicos ate existir etapa propria de relatorio, orcamento ou agenda real.

Resultado 6C:

- `src/app-v2/data/appV2MockData.ts` criado como seed unico;
- `src/app-v2/data/appV2MockStore.ts` criado para snapshots independentes;
- mocks de Home, Equipamentos e Servicos passaram a derivar da mesma fonte;
- `AppV2Shell` passou a montar input a partir de snapshot da store mockada;
- testes focados do app-v2 e typecheck passaram.

Resultado 6D:

- `src/app-v2/data/appV2Actions.ts` criado;
- `src/app-v2/data/appV2Flow.test.ts` cobre iniciar servico, iniciar por compromisso, concluir servico e agendar compromisso;
- `AppV2Shell` usa a acao pura de iniciar servico;
- testes focados e typecheck passaram.

Resultado 6E:

- `src/app-v2/data/appV2Selectors.ts` criado;
- seletores puros derivam inputs de Home, Equipamentos, Registro e Servicos a partir do mesmo snapshot;
- `selectAppV2OperationalState` cobre proxima acao, draft em andamento e ultimo registro;
- `AppV2Shell` usa seletores para montar inputs de Servicos;
- testes focados, typecheck e build passaram.

Resultado 6F:

- `src/app-v2/data/appV2Flow.test.ts` cobre a jornada equipamento -> servico -> registro -> central sem UI;
- `registerEquipment` foi adicionada como acao pura mockada;
- equipamento recem-cadastrado sem primeiro servico aparece como proxima acao;
- conclusao de servico cria registro recente e saida `orcamento_sugerido`;
- compromisso agendado volta para Home Hoje como proxima acao;
- teste focado de fluxo e typecheck passaram.

Resultado 6G:

- `npm run format` passou;
- `npm run typecheck` passou;
- testes focados do app-v2 passaram com 8 arquivos e 33 testes apos a revisao 6.1;
- `npm run build` passou com warnings Vite/chunk conhecidos do legado;
- `npm run check` passou com 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado;
- `git diff --check` passou;
- Etapa 6 fechada em 100% para o criterio tecnico definido.

Resultado 6.1:

- diff pendente revisado antes do commit;
- nenhuma alteracao fora de `docs/rewrite` e `src/app-v2` foi necessaria;
- teste de fluxo para `relatorio_pendente` foi adicionado para cobrir a terceira saida futura mockada;
- a fundacao segue em 100%;
- commit unico recomendado apos validacoes finais.
