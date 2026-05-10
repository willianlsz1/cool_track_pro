# Etapa 3 - Equipamento Implementation Plan

**Goal:** construir o protótipo navegável da área Equipamento no `src/app-v2/`, com lista, busca, filtros simples e detalhe mockado.

**Architecture:** a Etapa 3 cria uma área isolada em `src/app-v2/equipment/`, usando mock data local e view models puros. A navegação entre Home, lista e detalhe usa estado local React no preview, sem rotas reais e sem integração com o legado.

**Tech Stack:** React, TypeScript, Tailwind CSS com prefixo `tw-`, Vitest.

## 1. Escopo

Incluído:

- tela de lista de equipamentos;
- busca local;
- filtros locais;
- detalhe do equipamento;
- ações mockadas;
- navegação local via estado React;
- testes focados para view models.

Fora do escopo:

- storage;
- Supabase;
- rotas reais;
- shell legado;
- cadastro real;
- edição real;
- exclusão;
- fotos/upload;
- PDF/share;
- WhatsApp;
- orçamento real;
- PMOC;
- nova dependência.

## 2. Arquivos

Criados:

- `src/app-v2/equipment/mockEquipmentData.ts`;
- `src/app-v2/equipment/equipmentViewModel.ts`;
- `src/app-v2/equipment/equipmentViewModel.test.ts`;
- `src/app-v2/equipment/EquipmentList.tsx`;
- `src/app-v2/equipment/EquipmentCard.tsx`;
- `src/app-v2/equipment/EquipmentDetail.tsx`;
- `src/app-v2/shell/AppV2Shell.tsx`.

Modificados:

- `src/app-v2/domain/homePriority.ts`;
- `src/app-v2/domain/homePriority.test.ts`;
- `src/app-v2/home/HomeToday.tsx`;
- `src/app-v2/home/NextActionCard.tsx`;
- `src/app-v2/home/ShortQueue.tsx`;
- `src/app-v2/home/homeViewModel.ts`;
- `src/app-v2/home/homeViewModel.test.ts`;
- `src/app-v2/home/mockHomeData.ts`;
- `src/app-v2/navigation/BottomNav.tsx`;
- `src/app-v2/index.tsx`;
- `docs/rewrite/etapa-3-equipamento-design.md`;
- `docs/rewrite/etapa-3-equipamento-plano.md`.

Não modificados:

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

### Task 1: View model de Equipamento

- [x] Escrever teste para listar equipamentos com cliente/local/status.
- [x] Escrever teste para busca por nome, cliente, local e tag.
- [x] Escrever teste para filtro "Atenção".
- [x] Escrever teste para equipamento sem primeiro serviço.
- [x] Implementar fixtures locais com português brasileiro correto.
- [x] Implementar view model sem UI e sem storage.
- [x] Rodar `npm run test -- src/app-v2/equipment/equipmentViewModel.test.ts`.

Resultado: PASS.

### Task 2: Shell local app-v2

- [x] Criar tipo local `AppV2Tab = 'hoje' | 'equipamento' | 'servicos' | 'conta'`.
- [x] Fazer `BottomNav` receber `activeTab` e `onSelectTab`.
- [x] Criar `AppV2Shell` com estado local.
- [x] Manter `Serviços` e `Conta` como placeholders mínimos.
- [x] Rodar `npm run typecheck`.

Resultado: PASS.

### Task 3: Lista de Equipamentos

- [x] Criar lista mobile-first com título, busca e filtros.
- [x] Criar cards compactos com nome, cliente/local, tipo/tag, status e próxima ação.
- [x] Conectar busca e filtros em estado local.
- [x] Fazer clique no card abrir detalhe local.
- [x] Não usar rota real nem storage.
- [x] Rodar `npm run typecheck` e `npm run build`.

Resultado: PASS.

### Task 4: Detalhe do Equipamento

- [x] Escrever teste para montar detalhe com cliente, status e resumo técnico.
- [x] Implementar view model de detalhe.
- [x] Criar tela de detalhe com cabeçalho, contexto, próxima ação e resumo técnico.
- [x] Adicionar botão de voltar para lista.
- [x] Manter ações "Iniciar serviço", "Agendar preventiva" e "Ver cliente" mockadas.
- [x] Rodar `npm run test -- src/app-v2/equipment/equipmentViewModel.test.ts` e `npm run typecheck`.

Resultado: PASS.

### Task 5: Integração com Home Hoje

- [x] Fazer "Ver equipamento" abrir detalhe correspondente quando houver equipamento.
- [x] Fazer clique na fila abrir detalhe correspondente.
- [x] Fazer bottom nav abrir lista de Equipamento.
- [x] Manter Home sem atalhos rápidos.
- [x] Rodar `npm run typecheck` e `npm run build`.

Resultado: PASS.

### Task 6: QA visual

- [x] Iniciar dev server.
- [x] Abrir `http://127.0.0.1:5174/src/app-v2/preview.html`.
- [x] Verificar mobile.
- [x] Verificar desktop estreito/largo.
- [x] Confirmar textos com acentuação correta.
- [x] Confirmar lista como área operacional, não dashboard.
- [x] Confirmar cards clicáveis e legíveis.
- [x] Confirmar detalhe com Cliente como contexto.
- [x] Confirmar bottom nav visível e sem cobrir fluxo crítico.
- [x] Confirmar navegação local de volta.

Resultado: PASS.

### Task 7: Validação final

- [x] Registrar resultado da execução.
- [x] Rodar validação final completa.

Comandos finais previstos:

```bash
npm run format
npm run typecheck
npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts
npm run build
npm run check
git diff --check
```

## 4. Riscos

- A lista pode ficar densa demais quando dados reais entrarem.
- Mock data ainda pode esconder lacunas de contrato real.
- A navegação local ainda não representa a estratégia final de rotas.
- CTAs de serviço ainda serão mockados até a etapa de Serviços.

## 5. Critério de pronto

1. Bottom nav abre a área Equipamento no preview.
2. Lista mostra equipamentos com contexto de cliente/local.
3. Busca e filtros funcionam com mock data.
4. Detalhe do equipamento abre por clique.
5. Home consegue abrir detalhe de equipamento por CTA/fila.
6. Cliente aparece como contexto/vínculo, não como porta principal.
7. Nenhuma integração real com legado/storage foi criada.
8. Validação completa foi executada.
