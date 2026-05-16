# app-v2 goal - Clientes em Equipamentos

## Checkpoint atual

Criar a subvisao de Clientes dentro da area Equipamentos no app-v2,
preservando o baseline visual aprovado e sem transformar Clientes em aba
principal global.

## Preservacao do checkpoint anterior

O checkpoint visual/QA anterior permanece nao commitado neste working tree. A
tarefa atual sera aplicada explicitamente sobre essa base, sem misturar
silenciosamente baseline visual e nova subvisao. Um commit separado podera ser
feito depois se o usuario autorizar.

## Escopo permitido do checkpoint atual

- Criar Clientes como subvisao forte dentro de Equipamentos.
- Renderizar lista de clientes mockados usando contratos e dados existentes.
- Exibir detalhe de cliente quando isso couber sem fluxo complexo.
- Mostrar equipamentos vinculados ao cliente quando houver `clienteId` no mock.
- Alternar entre as visoes Equipamentos e Clientes sem sair da area
  Equipamentos.
- Reusar `PageShell`, `SectionCard`, `StatusBadge`, `ListRow` e `ActionButton`.
- Adicionar view model pequeno dentro de `src/app-v2/`.
- Adicionar testes observaveis da subvisao Clientes e preservar testes atuais.

## Anti-escopo do checkpoint atual

- Nova aba principal global de Clientes.
- Storage real, Supabase, PDF/share, WhatsApp, billing, PMOC, rotas reais,
  persistencia real, autenticacao ou permissoes reais.
- Criacao, edicao avancada ou exclusao real de cliente.
- Refinamento visual dedicado do fluxo de Registro de Servico.
- Mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Mudancas no app legado.

## Checklist de progresso atual

- [x] Registrar preservacao do checkpoint visual anterior.
- [x] Resolver decisao de navegacao Clientes com o usuario.
- [x] Implementar subvisao Clientes dentro de Equipamentos.
- [x] Adicionar testes focados da subvisao.
- [x] Atualizar QA desktop/mobile.
- [x] Validar isolamento do app-v2.
- [x] Validar limite de 1000 linhas por arquivo.
- [x] Executar comandos de validacao.
- [x] Registrar resultado final.

## Decisoes tomadas no checkpoint atual

- Clientes nao vira quinta area principal do app-v2.
- Clientes sera uma subvisao forte dentro de Equipamentos, com detalhe proprio.
- A area Equipamentos representa a base instalada/ativos atendidos; Clientes
  aparece como visao irma de Equipamentos dentro dessa area.
- O detalhe futuro de Cliente podera concentrar dados do cliente, equipamentos
  vinculados, servicos relacionados e PMOC futuro, sem implementar PMOC neste
  checkpoint.
- O vinculo operacional continua nascendo do Equipamento para o Cliente.

## Arquivos alterados no checkpoint atual

- `CONTEXT.md`.
- `docs/app-v2-goal.md`.
- `src/app-v2/equipment/ClientDetail.tsx`.
- `src/app-v2/equipment/ClientList.tsx`.
- `src/app-v2/equipment/EquipmentDetail.tsx`.
- `src/app-v2/equipment/EquipmentList.tsx`.
- `src/app-v2/equipment/EquipmentSubViewNav.tsx`.
- `src/app-v2/equipment/equipmentClientsViewModel.test.ts`.
- `src/app-v2/equipment/equipmentClientsViewModel.ts`.
- `src/app-v2/equipment/equipmentViewModel.ts`.
- `src/app-v2/shell/AppV2Shell.test.tsx`.
- `src/app-v2/shell/AppV2Shell.tsx`.

O working tree tambem preserva mudancas nao commitadas do checkpoint visual
anterior, registradas no historico abaixo.

## Testes adicionados no checkpoint atual

- `equipmentClientsViewModel.test.ts`: lista de clientes, contagem/status
  agregados e detalhe com equipamentos vinculados por `clienteId`.
- `AppV2Shell.test.tsx`: acesso a Clientes por Equipamentos, retorno para
  Equipamentos, abertura de detalhe de Cliente, equipamentos vinculados e
  garantia de que Clientes nao aparece como area principal.

## Comandos executados no checkpoint atual

- `npm run format`: passou.
- `npm run format:check`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2MockStore.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx`: passou com 10 arquivos e 42 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `supabase`, `billing`, `PDF`, `pdf`, `share`, `WhatsApp`, `whatsapp`, `PMOC`
  e `pmoc`: sem referencias proibidas.
- Limite de tamanho: maior arquivo em `src/app-v2` e
  `equipmentViewModel.ts` com 382 linhas.
- QA Playwright desktop 1920x1080 e mobile 390x844: passou sem overflow
  horizontal.

## Resultado do checkpoint atual

Concluido. Clientes foi criada como subvisao forte dentro de Equipamentos, sem
nova aba principal global, usando apenas dados mockados e contratos existentes.
A lista de clientes renderiza a partir de `clientes`, o detalhe de cliente abre
sem fluxo complexo e os equipamentos vinculados aparecem pela relacao
`clienteId`.

### QA desktop/mobile

- Desktop: sidebar fixa permanece visivel, bottom nav fica oculta, Clientes abre
  dentro de Equipamentos e o detalhe do cliente nao gera overflow horizontal.
- Mobile: sidebar fica oculta, bottom nav permanece fixa, Clientes abre dentro
  de Equipamentos e o detalhe do cliente nao gera overflow horizontal.
- Clientes nao aparece como quinta area principal.
- Estados vazios/fallbacks simples foram mantidos para lista de clientes e
  equipamentos vinculados, sem criar CRUD ou integracao real.

### Backlog final do checkpoint atual

- Refinar visualmente Registro de Servico em checkpoint dedicado.
- Evoluir, em etapa futura, o detalhe de Cliente para incluir servicos
  relacionados e PMOC contextual quando o modulo PMOC for escopo permitido.
- Avaliar se a area Equipamentos deve ganhar componente controlador proprio
  quando houver mais subvisoes, para reduzir estado no shell.
- Manter storage real, Supabase, PDF/share, WhatsApp, billing, PMOC e rotas
  reais fora do app-v2 ate etapas dedicadas.

---

# Historico - QA baseline e contrato visual minimo

## Objetivo atual

Fechar a primeira passada visual do app-v2 antes de qualquer feature nova,
criando uma fundacao visual reutilizavel, validando shell, navegacao e fluxos
principais, e registrando o que fica aprovado ou em backlog.

## Escopo permitido

- QA baseline de Home, Equipamentos, Servicos e Conta em desktop e mobile.
- Criar primitivas visuais minimas dentro de `src/app-v2/`.
- Reduzir repeticao visual clara de classes Tailwind.
- Adicionar smoke tests observaveis do shell e dos fluxos principais existentes.
- Corrigir apenas problemas pequenos de consistencia visual, responsividade ou
  uso das primitivas criadas neste checkpoint.
- Validar isolamento do app-v2 contra legado e integracoes reais.

## Anti-escopo

- Clientes como subvisao funcional nova.
- Storage real, Supabase, PDF/share, WhatsApp, billing, PMOC ou rotas reais.
- Mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Refatoracao ampla do shell, dominio, store ou view models.
- Design system completo.
- Mudancas no app legado.

## Checklist de progresso

- [x] Registrar plano efetivo do checkpoint.
- [x] Criar contrato visual minimo.
- [x] Aplicar primitivas onde reduzir repeticao sem mudar fluxo.
- [x] Adicionar smoke tests do shell.
- [x] Validar testes focados do app-v2.
- [x] Validar isolamento por busca textual.
- [x] Validar limite de 1000 linhas por arquivo.
- [x] Executar QA baseline desktop/mobile.
- [x] Registrar resultado final.

## Decisoes tomadas

- As primitivas devem viver dentro de `src/app-v2/ui/`.
- O checkpoint usa Tailwind com prefixo `tw-`, mantendo os tokens existentes.
- As primitivas serao pequenas e aplicadas somente onde diminuirem repeticao
  obvia.
- A visao de Clientes em Equipamentos permanece backlog.
- `PageShell`, `SectionCard`, `StatusBadge`, `ListRow` e `ActionButton` formam
  o contrato visual minimo deste checkpoint.
- O shell permaneceu como orquestrador do estado mockado; nao houve extracao
  adicional porque o arquivo continuou legivel e abaixo do limite.

## Itens concluidos

- Plano aprovado pelo usuario.
- Registro inicial do goal criado.
- Primitivas visuais minimas criadas em `src/app-v2/ui/primitives.tsx`.
- Home, Equipamentos, Servicos e Conta passaram a usar primitivas onde havia
  repeticao clara de pagina, card, badge, lista ou botao.
- Smoke tests do shell ampliados para navegacao principal, sidebar/bottom nav,
  abertura de detalhe, inicio, retomada e conclusao de servico.
- QA baseline executado para Home, Equipamentos, detalhe de Equipamento,
  Servicos e Conta em desktop e mobile.

## Backlog final

- Criar a subvisao de Clientes dentro de Equipamentos em checkpoint futuro.
- Revisar a experiencia do fluxo de Registro de Servico com o mesmo contrato
  visual, sem mudar regras de negocio.
- Avaliar, em etapa propria, se formatos repetidos de data/tom em view models
  justificam utilitario pequeno.
- Manter storage real, Supabase, PDF/share, WhatsApp, billing, PMOC e rotas
  reais fora do app-v2 ate etapas dedicadas.
- Warnings Vite/chunk e o warning conhecido em `src/domain/pdf/shareReport.js`
  permanecem backlog controlado fora deste checkpoint.

## Comandos de teste executados

- `npm run format`: passou.
- `npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2MockStore.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx`: passou com 9 arquivos e 38 testes.
- `npm run typecheck`: passou.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `supabase`, `billing`, `PDF`, `pdf`, `share`, `WhatsApp`, `whatsapp`, `PMOC`
  e `pmoc`: sem referencias proibidas.
- Limite de tamanho: maior arquivo em `src/app-v2` continua
  `equipmentViewModel.ts` com 380 linhas.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- QA browser/app-v2: passou em desktop 1920x1080 e mobile 390x844, sem overflow
  horizontal, com sidebar desktop fixa de 248px e bottom nav apenas mobile.

## Resultado final

Concluido. A primeira passada visual do app-v2 fica fechada como baseline
aprovado para Home, Equipamentos, Servicos e Conta. O contrato visual minimo foi
criado e aplicado sem feature nova, sem mudanca em contratos de dominio, sem
integracao real e sem imports proibidos para legado ou areas sensiveis.

## QA baseline

### Aprovado

- Home: hierarquia operacional, proxima acao, fila curta e cards laterais
  mantidos sem overflow.
- Equipamentos: lista, controles existentes e detalhe continuam operacionais em
  desktop e mobile.
- Servicos: central, estado vazio, servico em andamento, retomada e conclusao
  permanecem funcionando.
- Conta: placeholder visual mantido sem acoes novas.
- Shell: sidebar desktop de 248px e bottom nav mobile preservados.

### Ajustado

- Criadas primitivas visuais minimas para reduzir repeticao de Tailwind.
- Aplicados `PageShell`, `SectionCard`, `StatusBadge`, `ListRow` e
  `ActionButton` em telas e cards existentes.
- Smoke tests do shell ampliados para o baseline de navegacao e fluxo.

### Riscos remanescentes

- Registro de Servico ainda usa parte dos cards locais antigos; fica para
  refinamento visual dedicado.
- View models ainda concentram formatacao de data/tom, mas sem duplicacao
  suficiente para justificar refactor neste checkpoint.
- Store e acoes continuam mockadas por design; nao representam persistencia
  real.
