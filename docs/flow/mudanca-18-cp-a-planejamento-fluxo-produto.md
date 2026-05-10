# Mudança 18 / CP-A — Planejamento de fluxo/produto

## 1. Estado inicial

- Branch: `main`
- HEAD inicial: `35782aed792b2da258fec3cfa2e04e2e723210af`
- Working tree inicial: limpo (`git status --short` sem saída)
- Escopo executado: análise read-only do código e criação deste documento em `docs/flow/`.

## 2. Diagnóstico atual de navegação

### Mobile bottom nav

O bottom nav é renderizado em `src/ui/shell/templates/nav.js`. Hoje ele possui:

- `Painel` (`data-nav="inicio"`)
- `Registrar` (`data-nav="registro"`)
- `Equip.` (`data-nav="equipamentos"`)
- `Serviços` (`data-nav="historico"`)
- `Clientes` apenas quando `shouldShowClientesInMobileNav(planCode)` retorna `true`.

O critério atual é estrito: `Clientes` só entra no mobile quando `planCode === 'pro'`.

Além do render inicial, `src/ui/shell.js` pode recriar o bottom nav em `_rerenderMobileNav()`, comparando a presença de `#nav-clientes` com o plano atual.

### Desktop/sidebar

A sidebar atual fica em `src/ui/shell/templates/sidebar.js` e ainda usa os grupos:

- `OPERAÇÃO`: Painel, Registrar serviço, Serviços.
- `GESTÃO`: Equipamentos, Clientes, Orçamentos.
- `SISTEMA`: Relatórios, Alertas.
- Rodapé: card de plano, Conta, Configurações.

O grupo `GESTÃO` conflita com a direção de produto decidida para a Mudança 18, que deve evitar linguagem de gestão empresarial e priorizar intenção de uso do técnico autônomo.

### Rotas

As rotas são registradas em `src/ui/controller/routes.js`.

- `inicio` renderiza Dashboard.
- `equipamentos` chama `populateEquipSelects()` e `renderEquip('', params)`.
- `registro` chama `populateEquipSelects()`, `initRegistro(params)` e carrega o `registroEquipPicker`.
- `historico` aceita `clienteId`/`clienteNome` para filtro vindo de Clientes.
- `clientes` possui gate próprio antes de `renderClientes()`.
- `relatorio`, `orcamentos`, `alertas`, `conta`, `configuracoes`, `pricing` continuam independentes.

### Dependências de `navigationMode`

`src/ui/shell/navigationMode.js` define dois modos persistidos em `localStorage`:

- `rapido`
- `empresa`

`NAV_LAYOUT_BY_MODE` muda quais rotas são primárias no mobile/sidebar. O modo `empresa` promove `clientes`; o modo `rapido` deixa `clientes` secundário.

`src/ui/shell.js` aplica esse layout em `_applyNavigationMode()`, mas rebaixa `clientes` quando `getClientesAccessSnapshot().canAccess` é falso. Também alterna o item de ajuda do header entre ir para Clientes e upsell.

No Dashboard, `src/ui/views/dashboard.js` e `src/ui/viewModels/dashboardViewModel.js` usam `navigationMode === 'empresa'` junto com `hasPro` para mostrar contexto de cliente/setor em cards e CTAs secundários.

## 3. Diagnóstico atual de Clientes

### Onde Clientes é bloqueado hoje

O bloqueio principal está em `src/ui/controller/routes.js`:

- a rota `clientes` chama `getClientesAccessSnapshot()`;
- se o plano ainda não está resolvido, mostra loading e chama `resolveClientesAccess()`;
- se a decisão não resolve por erro de refresh, mantém loading para evitar falso paywall em usuário Pro;
- se `decision.canAccess` é falso, abre `ClientesPaywallModal.open()` e não chama `renderClientes()`;
- só com `canAccess === true` chama `renderClientes()` e `updateHeader()`.

O bloqueio de decisão fica em `src/core/plans/clientesAccess.js`:

- `canAccessClientes(planCode)` retorna `true` somente para `pro`;
- Free e Plus não acessam a rota quando a decisão está resolvida.

### Onde Clientes é ocultado na navegação

O mobile oculta Clientes em `src/ui/shell/templates/nav.js`, pois `shouldShowClientesInMobileNav(planCode)` só aceita `pro`.

A sidebar sempre tem o botão `sidenav-clientes`, mas `src/ui/shell.js`:

- alterna cadeado/estilo locked quando não há acesso;
- usa `_applyNavigationMode()` para ocultar ou tornar secundário conforme plano e modo;
- oculta `header-help-go-clientes` e mostra `header-help-clientes-upsell` para não-Pro.

### Onde Free/Plus/Pro define acesso a Clientes

Há dois pontos:

- `src/core/plans/subscriptionPlans.js`: `FEATURE_CLIENTES` tem plano mínimo `pro` em `FEATURE_MIN_PLAN`.
- `src/core/plans/clientesAccess.js`: gate dedicado da rota Clientes permite somente `pro`.

Hoje não há limite de quantidade de clientes no catálogo de planos. `PLAN_CATALOG.limits` possui `equipamentos` e `registros`, mas não `clientes`.

### Onde o limite de clientes deveria entrar

Para CP-B, o limite deve ser introduzido de forma pequena e explícita:

- adicionar `clientes` em `PLAN_CATALOG.limits`, com `free: 1` e limites pagos conforme decisão de produto;
- criar helper puro dedicado, ou estender `planLimits`, para avaliar criação de cliente antes de abrir/salvar segundo cliente;
- manter a rota Clientes renderizável no Free;
- trocar o hard paywall da rota por paywall/upgrade no ato de criar o segundo cliente Free;
- preservar a resolução defensiva de plano para não mostrar paywall prematuro quando a billing hydration falhar.

### Testes existentes relacionados

- `src/__tests__/clientesRouteAccess.test.js` documenta o comportamento antigo: paywall fora da view quando acesso negado e render somente com Pro.
- `src/__tests__/clientesAccess.test.js` documenta que cache Free pendente não bloqueia imediatamente, Pro resolve acesso e erro de refresh mantém estado pendente.
- `src/__tests__/shell.test.js` documenta Clientes oculto no mobile para Free/Plus e visível no Pro.

## 4. Diagnóstico Cliente → Setores → Equipamentos

O fluxo atual parte de Clientes para Equipamentos assim:

- `src/ui/views/clientes.js` usa `_navigateVerEquipamentos(id)` para `goTo('equipamentos', { equipCtx: { clienteId, clienteNome } })`.
- `src/features/equipamentos/ui/renderEquip.js` resolve `equipCtx`.
- Se o plano é Pro e não há setor ativo, `renderEquipSetorGridBranch()` renderiza grade de setores.
- Com `clienteId`, esse branch chama `renderSetorGridForCliente(clienteId, clienteNome)`.
- `src/features/equipamentos/setor/setorState.js` monta o modelo do cliente com setores diretos (`setor.clienteId`) e setores derivados por equipamentos (`equipamento.setorId`).
- Equipamentos sem setor são calculados como `equipsSemSetor`.

O ponto que impede o cliente simples de mostrar equipamentos direto está em `src/features/equipamentos/setor/setorUI.js`:

- quando o cliente não tem setores, `_renderSetorGridForClienteEmptyHtml()` prioriza a criação do primeiro setor;
- se existem equipamentos sem setor, eles aparecem em banner/atalho para `__sem_setor__`, mas não como a experiência principal;
- a toolbar do contexto cliente usa `+ Novo setor` como ação primária e `Limpar cliente` como secundária;
- a lista flat filtrada por cliente já existe em `renderFlatList()`, mas o branch Pro com cliente passa primeiro pela grade de setores.

Portanto, CP-D não precisa inventar vínculo novo entre equipamento e cliente. O vínculo já existe por `equipamento.clienteId`; o ajuste é de orquestração/render: cliente com zero setores deve usar lista de equipamentos do cliente como primeira tela, e setores devem virar agrupamento sob demanda.

Equipamento sem setor já é permitido:

- `src/ui/shell/templates/modals.js` possui `<option value="">Sem setor</option>`;
- `src/features/equipamentos/crud/payload.js` aceita `setorId` nulo;
- `renderFlatList()` aceita `clienteId` e `setorId`;
- `__sem_setor__` já é usado como contexto especial.

## 5. Diagnóstico de Registrar Serviço

### Fluxo atual

A rota `registro` em `src/ui/controller/routes.js`:

- popula selects de equipamento;
- chama `initRegistro(params)`;
- se `params.editRegistroId` existe, carrega edição;
- importa `registroEquipPicker.js`.

`populateEquipSelects()` em `src/ui/views/equipamentos.js` popula `#r-equip`, `#hist-equip` e `#rel-equip` a partir de `state.equipamentos`.

`initRegistro()` em `src/ui/views/registro.js` usa `resolveRegistroInitEquipId(params)` para pré-selecionar `params.equipId` ou `params.equipamentoId`.

### Dependência de equipamento

O registro já exige equipamento no save:

- `readRegistroFormValues()` lê `equipId` de `#r-equip`;
- `validateRegistroPayload()` em `src/core/inputValidation.js` retorna erro se não houver equipamento;
- se houver `equipId` inexistente em `existingEquipamentos`, retorna erro de equipamento inválido.

Ou seja, a exigência existe no fim do fluxo, não no início.

### Seleção/criação de equipamento

Já existe um picker fullscreen em `src/ui/components/registroEquipPicker.js`:

- busca por nome, TAG, setor e cliente;
- seleciona equipamento gravando no select oculto `#r-equip`;
- se não há equipamentos, mostra CTA `+ Cadastrar primeiro equipamento`, que abre `modal-add-eq`.

Já existe também um post-action de cadastro de equipamento para abrir Registro:

- `src/ui/views/equipamentos.js` usa `dataset.postAction = 'register'` no botão `Cadastrar e registrar serviço`;
- `src/features/equipamentos/crud/postActions.js` chama `goTo('registro', { equipId })` quando `openRegistro` é verdadeiro.

### CTA do Dashboard e botão central

O CTA principal do Dashboard aponta para `data-nav="registro"` em `src/ui/shell/templates/views.js` e no view model do Dashboard.

Os cards de ação do Dashboard usam `data-action="go-register-equip"` quando existe equipamento de contexto. O handler em `src/ui/controller/handlers/navigationHandlers.js` navega para `goTo('registro', { equipId })`.

O botão central do bottom nav é apenas `data-nav="registro"`, sem orquestração. Portanto, hoje há dois comportamentos:

- Dashboard hero/bottom nav sem contexto: abre a tela de Registro e deixa o usuário escolher equipamento dentro do formulário.
- Cards ou fluxos com equipamento: entram em Registro já com `equipId`.

### Ponto parecido com orquestrador

Não há orquestrador único de Registrar Serviço ainda. Existem peças reaproveitáveis:

- `registroEquipPicker` para escolha rápida;
- `go-register-equip` para entrada com equipamento;
- `postAction: register` após criar equipamento;
- validação obrigatória de equipamento no save;
- `runRegistroDirectShareAfterSave()`/`notifyRegistroCreateSaved()` para PDF/WhatsApp pós-save.

CP-E deve consolidar esses pontos em um único entrypoint de intenção: "Registrar serviço".

## 6. Contratos/testes que precisarão mudar

- `src/__tests__/clientesRouteAccess.test.js`: deixar de esperar paywall na entrada da rota Clientes para Free; passar a esperar render da view quando rota está resolvida e bloqueio somente em criação acima do limite.
- `src/__tests__/clientesAccess.test.js`: trocar acesso binário Pro-only por acesso à rota para Free/Plus/Pro, preservando hidratação defensiva de plano para limites/CTA.
- `src/__tests__/shell.test.js`: mobile deve passar a renderizar `Clientes` conforme nova ordem `Painel | Clientes | Registrar | Equip. | Serviços`; remover expectativa de ocultação no Free/Plus.
- `src/__tests__/navigationMode.test.js`: revisar ou remover contratos de `rapido`/`empresa`, pois a direção nova não usa modos permanentes.
- Testes de Dashboard (`dashboardViewModel.test.js`, `dashboardLegacyHero.test.js`, `dashboardHeroIsland.test.jsx`, `dashboard.premium.test.js` e correlatos): remover dependência de `navigationMode === empresa` para mostrar contexto útil de cliente/equipamento quando o produto deixar de ter modo empresa.
- `src/features/equipamentos/__tests__/ui/renderEquip.test.js`: alterar o branch Pro filtrado por cliente para permitir lista direta quando cliente não tem setores, e agrupamento quando tem.
- `src/features/equipamentos/__tests__/setor/*`: manter cobertura de setor como recurso sob demanda, com `Sem setor` como seção/pendência leve.
- `src/__tests__/registro*` e `src/features/registro/__tests__/*`: adicionar contratos para entrada única de Registro, escolha rápida de equipamento, criação rápida e pós-save.
- `src/features/equipamentos/__tests__/crud/postActions.test.js`: preservar ou adaptar `postAction: register` como parte do orquestrador.
- `src/__tests__/usageLimits.test.js` e `src/__tests__/reportExportHandlers.test.js`: não devem ser alterados em CP-B a CP-E, exceto se uma CP futura de monetização PDF/cotas for aberta.

## 7. Plano recomendado em CPs pequenas

### CP-B Clientes Free com limite de 1 cliente

Arquivos prováveis:

- `src/core/plans/subscriptionPlans.js`
- `src/core/plans/clientesAccess.js`
- `src/core/planLimits.js` ou helper novo de limite de clientes
- `src/ui/controller/routes.js`
- `src/ui/components/clienteModal.js`
- `src/ui/controller/handlers/clienteHandlers.js`
- `src/ui/views/clientes.js`
- `src/react/pages/ClientesPage.jsx`
- testes de Clientes e shell

Plano:

1. Trocar o gate da rota Clientes para permitir render em Free/Plus/Pro quando a decisão de plano estiver resolvida.
2. Adicionar limite de clientes no catálogo/decisão de plano.
3. Bloquear apenas a criação do segundo cliente Free.
4. Abrir paywall/upgrade com Plus como CTA principal no bloqueio de criação.
5. Atualizar testes de rota, acesso e shell.
6. Validar `npm run format`, testes focados de Clientes, `npm run build`, `npm run check`.

### CP-C Navegação mobile/desktop

Arquivos prováveis:

- `src/ui/shell/templates/nav.js`
- `src/ui/shell/templates/sidebar.js`
- `src/ui/shell.js`
- `src/ui/shell/navigationMode.js`
- `src/ui/controller/handlers/navigationHandlers.js`
- testes de shell/navigation/dashboard

Plano:

1. Remover dependência de modo permanente para decidir destinos primários.
2. Mobile: `Painel | Clientes | Registrar | Equip. | Serviços`.
3. Desktop/sidebar: agrupar por intenção:
   - Principal: Painel, Registrar serviço.
   - Organização: Clientes, Equipamentos.
   - Histórico: Serviços, Relatórios.
   - Secundário/Sistema: Alertas, Orçamentos, Conta, Configurações, Planos.
4. Evitar o rótulo `Gestão`.
5. Manter `data-nav` e IDs públicos quando possível.
6. Atualizar testes de shell/navigationMode.

### CP-D Cliente com equipamentos direto e setores sob demanda

Arquivos prováveis:

- `src/features/equipamentos/ui/renderEquip.js`
- `src/features/equipamentos/setor/setorUI.js`
- `src/features/equipamentos/setor/setorState.js`
- `src/features/equipamentos/ui/renderFlatList.js`
- `src/ui/views/clientes.js`
- `src/react/pages/ClientesPage.jsx`
- testes de equipamentos/setores/clientes

Plano:

1. Para `equipCtx.clienteId`, renderizar equipamentos do cliente diretamente quando não houver setores.
2. Se houver setores, renderizar agrupamento por setor.
3. Mostrar seção `Sem setor` quando houver equipamentos do cliente sem setor.
4. Se houver setores e também equipamentos sem setor, tratar `Sem setor` como pendência leve, não erro.
5. Tornar `+ Novo setor` ação secundária.
6. Preservar equipamento sem setor como estado válido.

### CP-E Orquestrador único de Registrar serviço

Arquivos prováveis:

- `src/ui/controller/routes.js`
- `src/ui/controller/handlers/navigationHandlers.js`
- `src/ui/shell/templates/nav.js`
- `src/ui/views/dashboard.js`
- `src/ui/viewModels/dashboardViewModel.js`
- `src/react/pages/DashboardHero.jsx`
- `src/ui/views/registro.js`
- `src/ui/components/registroEquipPicker.js`
- `src/features/equipamentos/crud/postActions.js`
- testes de Registro, Dashboard e Equipamentos post-actions

Plano:

1. Criar um entrypoint único para intenção `Registrar serviço`.
2. Fazer CTA do Dashboard e botão central da nav chamarem a mesma intenção.
3. Se houver `equipId` de contexto, abrir Registro já com equipamento.
4. Se não houver contexto, abrir escolha rápida de equipamento.
5. Se não houver equipamento, oferecer criação rápida de equipamento.
6. Após criar equipamento rápido, continuar para Registro com `equipId`.
7. Após salvar, manter fluxo PDF/WhatsApp existente.

### CP-F Onboarding

Executar só depois de CP-B a CP-E, pois o onboarding deve ensinar os dois pontos de partida flexíveis já implementados:

- Atender agora / Registrar serviço.
- Organizar clientes.

### CP-G Monetização PDF/cotas

Executar somente depois. Não misturar com a Mudança 18 CP-B a CP-E. Hoje PDF/WhatsApp já possuem contratos e testes próprios; qualquer mudança deve ser CP dedicada.

## 8. Riscos e pontos de atenção

- Navegação: alterar ordem/visibilidade pode quebrar IDs públicos, `data-nav`, estado ativo e testes de shell.
- Rotas: remover hard paywall de Clientes sem preservar hidratação defensiva pode gerar falso bloqueio ou render prematuro em sessão com plano desatualizado.
- Plano Free: limite de 1 cliente precisa ficar no ato de criação, não no acesso à rota.
- Testes legados: vários testes documentam Pro-only, modo empresa e Clientes oculto; precisam mudar junto com cada CP.
- Registro: o save já exige equipamento, mas a entrada sem contexto ainda abre o formulário; CP-E deve evitar duplicar picker/orquestração.
- Histórico/relatórios: rotas recebem `clienteId`, `equipId` e `registroId`; preservar esses contratos.
- Cliente/equipamento: `clienteId` em equipamento já existe e deve continuar válido mesmo sem setor.
- Setores: Pro/setores é área sensível por contrato de PMOC; CP-D deve limitar-se a render/orquestração, sem schema/migration.
- PDF/share: apenas ler nesta fase; não mexer em `src/domain/pdf/*` nem fluxo de exportação fora de CP específica.

## 9. Critérios de pronto para CP-A

- Nenhuma mudança funcional foi feita.
- Nenhum arquivo em `src/`, testes, CSS, configs, migrations, Supabase/Edge Functions, `package.json` ou `package-lock.json` foi editado.
- Apenas documento de planejamento foi criado/alterado: `docs/flow/mudanca-18-cp-a-planejamento-fluxo-produto.md`.
- Comandos executados até a criação do documento:
  - `git status --short`: sem saída.
  - `git branch --show-current`: `main`.
  - `git rev-parse HEAD`: `35782aed792b2da258fec3cfa2e04e2e723210af`.
  - leituras read-only com `rg`, `Get-Content` e `Select-String`.
- Validação executada:
  - `npm run format`: passou; Prettier reportou o documento como `unchanged` e não alterou arquivos fora do escopo.
  - `git status --short` após format: apenas `?? docs/flow/`.
  - `npm run build`: passou; manteve warnings Vite static+dynamic import e chunks grandes já tratados como backlog técnico controlado.
  - `npm run check`: passou; `lint` manteve 1 warning arquitetural conhecido em `src/domain/pdf/shareReport.js`, `format:check` passou, testes passaram e o build final passou com os mesmos warnings Vite conhecidos.
- Resultado da CP-A: nenhuma mudança funcional; apenas este documento foi criado.
