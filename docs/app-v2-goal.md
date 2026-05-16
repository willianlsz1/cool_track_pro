# app-v2 goal - Servicos > Relatorios

## Proximo checkpoint planejado

Planejar a subvisao `Servicos > Relatorios` do app-v2, usando a referencia
visual aprovada para orientar densidade, KPIs, busca e lista de relatorios, sem
transformar Relatorios em aba principal global.

Este registro e apenas planejamento. Nao houve implementacao de codigo nesta
etapa de grill.

## Contexto do working tree

- Branch: `codex/rewrite-zero-react-parallel`.
- Working tree ja estava sujo com o checkpoint anterior de relatorio simples de
  Registro de Servico.
- `CONTEXT.md` foi atualizado durante o grill para registrar:
  - `Relatorios` como subvisao de `Servicos`;
  - acesso a relatorio a partir de `Registro de servico` concluido;
  - `Agendamento de proximo compromisso` como passo simples do fechamento.
- O checkpoint de implementacao futuro deve preservar as alteracoes atuais e
  nao misturar silently design, print, relatorios e agendamento sem plano.

## Decisoes aprovadas para o proximo checkpoint

- `Relatorios` sera subvisao dentro de `Servicos`, nao aba principal global.
- Cada `Registro de servico` concluido podera abrir/reabrir seu relatorio.
- `Servicos > Relatorios` usara como referencia a imagem aprovada:
  - KPIs no topo;
  - busca;
  - lista/tabela de relatorios;
  - acoes por registro.
- A lista de relatorios nasce dos `Registro de servico` concluidos.
- Status dos relatorios sera simples e local:
  - `Pronto`;
  - `Pendente de revisao`;
  - `Atencao`.
- KPIs aprovados:
  - `Relatorios prontos`;
  - `Com atencao`;
  - `Pendentes`;
  - `Este mes`.
- Busca aprovada:
  - atendimento/ID;
  - cliente;
  - equipamento;
  - tipo de servico.
- Acao principal por item:
  - `Ver relatorio`.
- `Ver relatorio` abre uma subvisao dedicada dentro de
  `Servicos > Relatorios`, com `Voltar para relatorios`.
- Na tela normal, a subvisao mostra cabecalho, acoes e preview.
- No print, somente o documento do relatorio deve ser impresso.
- `Agendamento de proximo compromisso` sera passo simples do fechamento,
  criando nova preventiva/corretiva do mesmo equipamento, nao agenda completa.

## Escopo permitido do proximo checkpoint

- Criar ou ajustar view model puro para `Servicos > Relatorios`.
- Derivar relatorios a partir de registros concluidos e dados mockados
  existentes.
- Criar subvisoes internas de `Servicos` para `Registros`, `Relatorios` e,
  se necessario, manter `Orcamentos` como placeholder controlado.
- Implementar lista/tabela responsiva de relatorios.
- Implementar busca local por ID, cliente, equipamento e tipo de servico.
- Abrir preview de relatorio a partir de registro concluido.
- Corrigir impressao escopada para imprimir apenas o documento do relatorio.
- Adicionar testes focados para modelo, busca, acesso ao relatorio e print
  escopado quando viavel em teste observavel.
- Fazer segunda passada de design somente nesta area.

## Anti-escopo do proximo checkpoint

- Nova aba principal global para Relatorios.
- Agenda completa, calendario, recorrencia avancada ou edicao completa de
  compromissos.
- Assinatura real.
- Envio real por WhatsApp.
- Download binario robusto.
- Storage real, Supabase, billing, autenticacao, permissoes reais ou backend.
- Rotas reais.
- PMOC, Modelo B HVAC ou Modelo C mensal.
- Uso de `src/domain/pdf/shareReport.js` ou modulos legados de PDF/share.
- Redesign amplo do shell, Home, Equipamentos, Clientes ou Conta.
- Edicao de `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.

## Checklist planejado

- [ ] Preservar explicitamente o estado atual antes de implementar.
- [ ] Criar modelo puro de `Servicos > Relatorios`.
- [ ] Criar subvisao `Relatorios` dentro de `Servicos`.
- [ ] Implementar KPIs aprovados.
- [ ] Implementar busca local aprovada.
- [ ] Implementar lista de relatorios derivada de registros concluidos.
- [ ] Implementar acao `Ver relatorio`.
- [ ] Implementar subvisao dedicada de preview com `Voltar para relatorios`.
- [ ] Corrigir impressao escopada para imprimir somente o documento.
- [ ] Adicionar ou ajustar testes focados.
- [ ] Executar QA desktop/mobile.
- [ ] Validar isolamento app-v2.
- [ ] Atualizar este arquivo com resultado real.

## Riscos a controlar

- A tela virar dashboard administrativo demais e perder foco operacional.
- Status visual prometer assinatura, WhatsApp ou PMOC antes de esses fluxos
  existirem.
- O preview de relatorio continuar acoplado ao fluxo recem-concluido e nao
  reabrir corretamente a partir de registros historicos.
- `window.print()` continuar imprimindo shell/nav/botoes se o escopo de print
  nao for testado.
- `Servicos` crescer demais em um unico componente.

## Validacao esperada no checkpoint futuro

- `npm run format`.
- `npm run format:check`.
- `npm run typecheck`.
- Testes focados app-v2 afetados.
- `npm run build`.
- `npm run check`, aceitando apenas warnings conhecidos ja documentados.
- `git diff --check`.
- Busca textual confirmando que `src/app-v2` nao referencia `src/ui`,
  `src/core`, storage real, Supabase, billing, WhatsApp, PMOC ou
  `src/domain/pdf/shareReport.js`.

---

# Historico - Relatorio simples de Registro de Servico

## Checkpoint atual

Criar uma primeira versao simples, isolada e testavel de relatorio imprimivel
de Registro de Servico no app-v2, preservando o checkpoint visual recem
commitado.

## Preservacao do estado anterior

O checkpoint visual de Registro de Servico foi preservado por commit separado
antes deste checkpoint.

- Branch: `codex/rewrite-zero-react-parallel`.
- HEAD base deste checkpoint: `49425640b48e30a9729e84b81b2d4b2862178d93`.
- Commit preservado: `4942564 feat(app-v2): refine service registration flow`.
- Working tree inicial: limpo.
- Checkpoint preservado no commit: refinamento visual do Registro de Servico,
  primitivas internas do fluxo, estado disabled de `ActionButton`, testes do
  shell e atualizacao de `docs/app-v2-goal.md`.
- Validacoes conhecidas antes deste checkpoint: testes focados app-v2 com 10
  arquivos e 42 testes passando, build/check passando com warnings conhecidos,
  isolamento app-v2 validado e QA desktop/mobile sem overflow.

## Escopo permitido do checkpoint atual

- Criar modelo puro para relatorio simples de Registro de Servico.
- Adicionar acao de relatorio somente no fluxo concluido.
- Renderizar uma previa imprimivel dentro do app-v2.
- Usar `window.print()` como mecanismo simples de salvar/imprimir pelo browser.
- Reusar primitivas visuais existentes do app-v2.
- Adicionar testes de modelo e comportamento observavel no shell.
- Validar QA desktop/mobile da previa.

## Anti-escopo do checkpoint atual

- Relatorio regulatorio, checklist normativo, WhatsApp, compartilhamento real,
  billing, Supabase, storage real, rotas reais, autenticacao, permissoes reais,
  backend, e-mail, assinatura digital, anexos, fotos reais ou nova area
  funcional.
- Imports do legado, `src/domain/pdf/shareReport.js` ou qualquer modulo legado
  de exportacao/compartilhamento.
- Mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.

## Checklist de progresso atual

- [x] Preservar checkpoint visual anterior por commit separado.
- [x] Registrar plano real do checkpoint.
- [x] Criar modelo puro de relatorio.
- [x] Criar previa imprimivel no fluxo concluido.
- [x] Adicionar ou ajustar testes focados.
- [x] Executar QA desktop/mobile.
- [x] Validar isolamento do app-v2.
- [x] Validar limite de 1000 linhas por arquivo.
- [x] Executar comandos de validacao.
- [x] Registrar resultado final.

## Decisoes tomadas no checkpoint atual

- Estrategia escolhida: previa imprimivel no app-v2 com `window.print()`.
- Nao sera implementado download binario neste checkpoint.
- O relatorio nasce do estado concluido do fluxo e usa apenas draft + mock
  atual.
- O modelo de relatorio fica puro e testavel; a UI apenas renderiza e dispara
  impressao.

## Arquivos alterados no checkpoint atual

- `docs/app-v2-goal.md`.
- `src/app-v2/service/ServiceDone.tsx`.
- `src/app-v2/service/ServiceFlow.tsx`.
- `src/app-v2/service/ServiceReportPreview.tsx`.
- `src/app-v2/service/serviceFlowViewModel.test.ts`.
- `src/app-v2/service/serviceFlowViewModel.ts`.
- `src/app-v2/service/serviceReportViewModel.test.ts`.
- `src/app-v2/service/serviceReportViewModel.ts`.
- `src/app-v2/shell/AppV2Shell.test.tsx`.

## Testes adicionados ou ajustados no checkpoint atual

- `serviceReportViewModel.test.ts`: cobre montagem do relatorio simples com
  cabecalho, cliente, equipamento, servico, execucao, assinaturas visuais,
  fallback e ausencia de blocos regulatorios/PMOC.
- `serviceFlowViewModel.test.ts`: atualizado porque `Relatorio` deixou de ser
  saida indisponivel e virou acao real no estado concluido.
- `AppV2Shell.test.tsx`: cobre ausencia da acao antes da conclusao, abertura da
  previa no estado concluido, assinaturas visuais, ausencia de PMOC e chamada de
  `window.print()`.

## Comandos executados no checkpoint atual

- `npm run format`: passou.
- `npm run format:check`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx`: RED falhou pelo titulo/blocos/assinaturas ainda ausentes; GREEN passou com 2 arquivos e 10 testes.
- `npm run test -- src/app-v2`: passou com 11 arquivos e 45 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `sessionStorage`, `supabase`, `billing`, `WhatsApp`, `whatsapp`, `PMOC`,
  `pmoc`, `src/domain/pdf/shareReport.js` e `shareReport`: sem referencias
  proibidas.
- Limite de tamanho: maior arquivo em `src/app-v2` e
  `equipmentViewModel.ts` com 328 linhas.
- QA Browser desktop 1920x1080 e mobile 390x844 no preview app-v2: passou sem
  overflow horizontal.

## Resultado do checkpoint atual

Concluido sem commit final nesta rodada. O app-v2 agora tem uma base simples de
relatorio de Registro de Servico por previa imprimivel, sem download binario,
sem import do legado e sem integracoes reais.

### Estrategia escolhida

- Modelo puro em `serviceReportViewModel.ts` com blocos de cabecalho, cliente,
  equipamento, servico, execucao e assinaturas visuais.
- Previa visual em `ServiceReportPreview.tsx`.
- Acao `Ver relatorio` exibida somente no estado concluido.
- Impressao/salvamento via browser com `window.print()`.

### QA desktop/mobile

- Desktop 1920x1080: a acao aparece depois da conclusao, a previa renderiza
  cliente/equipamento/status e nao ha overflow horizontal. Sidebar desktop
  visivel; bottom nav oculto. A acao de imprimir/salvar esta acessivel.
- Mobile 390x844: a previa e legivel, a acao de imprimir permanece acessivel e
  nao ha overflow horizontal. Bottom nav visivel; sidebar oculta.
- O relatorio contem identificacao, data, status, tipo, cliente, equipamento,
  local, diagnostico e acoes executadas.
- O relatorio nao mostra PMOC e nao aciona WhatsApp/share.

### Backlog final do checkpoint atual

- Evoluir detalhe de Cliente para servicos relacionados.
- Melhorar dados mockados de historico por cliente/equipamento.
- Criar etapa futura para exportacao/download mais robusto, se a previa
  imprimivel deixar de ser suficiente.
- Modulo regulatorio/contextual apenas depois que Registro de Servico, Clientes
  e relatorio simples estiverem estabilizados.

---

# Historico - Registro de Servico visual

## Checkpoint atual

Refinar visualmente o fluxo de Registro de Servico do app-v2, preservando o
contrato visual minimo, Clientes dentro de Equipamentos e o isolamento do
app-v2.

## Preservacao do estado anterior

O estado anterior foi preservado por commit antes deste checkpoint.

- Branch: `codex/rewrite-zero-react-parallel`.
- HEAD base deste checkpoint: `8181e6446362e0fce9247078efbe91f0c8ebca93`.
- Working tree inicial: limpo.
- Checkpoints preservados no commit: contrato visual minimo, Clientes dentro de
  Equipamentos, `docs/app-v2-goal.md` e `CONTEXT.md`.
- Validacoes conhecidas antes deste checkpoint: testes focados app-v2 com 10
  arquivos e 42 testes passando, build/check passando com warnings conhecidos,
  isolamento app-v2 validado e QA desktop/mobile sem overflow.

## Escopo permitido do checkpoint atual

- Refinar a apresentacao visual do Registro de Servico existente.
- Melhorar hierarquia de titulo, status, progresso, contexto de equipamento,
  contexto de cliente/local, acoes e resumo.
- Reusar `PageShell`, `SectionCard`, `StatusBadge`, `ListRow` e `ActionButton`.
- Criar componentes internos pequenos em `src/app-v2/service/` apenas para
  organizar o fluxo.
- Ajustar `serviceFlowViewModel` somente para dados derivados visuais ja
  existentes.
- Adicionar ou ajustar testes observaveis do Registro de Servico.
- Executar QA desktop/mobile do fluxo.

## Anti-escopo do checkpoint atual

- PMOC, PDF/share, WhatsApp, billing, Supabase, storage real, rotas reais,
  autenticacao, permissoes reais ou backend.
- Persistencia real ou criacao real de servico fora do mock atual.
- Edicao avancada de servico, cliente ou equipamento.
- Nova aba principal ou nova area funcional.
- Imports do legado ou mudancas no app legado.
- Mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.

## Checklist de progresso atual

- [x] Registrar estado inicial preservado por commit.
- [x] Refinar componentes visuais do Registro de Servico.
- [x] Ajustar view model apenas se necessario para contexto visual.
- [x] Adicionar ou ajustar testes focados.
- [x] Executar QA desktop/mobile.
- [x] Validar isolamento do app-v2.
- [x] Validar limite de 1000 linhas por arquivo.
- [x] Executar comandos de validacao.
- [x] Registrar resultado final.

## Decisoes tomadas no checkpoint atual

- O fluxo continua com as mesmas etapas funcionais: contexto, tipo, execucao,
  revisao e conclusao.
- O refinamento e visual/estrutural; nao cria PMOC, PDF, WhatsApp ou
  persistencia real.
- O contexto de cliente aparece apenas quando derivado do `clienteId` ja
  existente no mock.
- `serviceFlowViewModel` nao precisou de alteracao; os dados derivados atuais
  foram suficientes para o refinamento.
- As saidas futuras do resumo permanecem indisponiveis/desabilitadas; nao foi
  implementado PDF, WhatsApp, orcamento ou agenda real.

## Arquivos alterados no checkpoint atual

- `docs/app-v2-goal.md`.
- `src/app-v2/service/ServiceDone.tsx`.
- `src/app-v2/service/ServiceFlow.tsx`.
- `src/app-v2/service/ServiceFlowPrimitives.tsx`.
- `src/app-v2/service/ServiceStepContext.tsx`.
- `src/app-v2/service/ServiceStepExecution.tsx`.
- `src/app-v2/service/ServiceStepReview.tsx`.
- `src/app-v2/service/ServiceStepType.tsx`.
- `src/app-v2/shell/AppV2Shell.test.tsx`.
- `src/app-v2/ui/primitives.tsx`.

## Testes adicionados ou ajustados no checkpoint atual

- `AppV2Shell.test.tsx`: reforcou cobertura observavel do Registro de Servico
  validando abertura do fluxo, contexto de equipamento/cliente, estado em
  andamento, resumo e conclusao.
- Testes focados do app-v2 preservados: 10 arquivos, 42 testes passando.

## Comandos executados no checkpoint atual

- `npm run format`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2MockStore.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx`: passou com 10 arquivos e 42 testes.
- `npm run format:check`: passou.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `supabase`, `billing`, `PDF`, `pdf`, `share`, `WhatsApp`, `whatsapp`,
  `PMOC` e `pmoc`: sem referencias proibidas.
- Limite de tamanho: maior arquivo em `src/app-v2` e
  `equipmentViewModel.ts` com 328 linhas.
- QA Playwright desktop 1920x1080 e mobile 390x844 no preview app-v2: passou
  sem overflow horizontal no inicio, contexto do fluxo e resumo concluido.

## Resultado do checkpoint atual

Concluido. O Registro de Servico ficou visualmente mais organizado sem mudar a
regra de negocio: cabecalho do fluxo, progresso, contexto do equipamento,
contexto do cliente/local, etapas, acoes e resumo final foram refinados com as
primitivas do app-v2.

### QA desktop/mobile

- Desktop 1920x1080: fluxo abriu a partir de `Iniciar servico`, exibiu
  equipamento/cliente, manteve acoes acessiveis e concluiu sem overflow
  horizontal.
- Mobile 390x844: bottom nav permaneceu acessivel, o fluxo concluiu sem
  overflow horizontal e as acoes principais continuaram disponiveis.
- Estados de iniciar, executar, revisar e concluir ficaram claros visualmente.
- Contexto de equipamento e cliente/local ficou compreensivel sem criar
  integracao nova.

### Backlog final do checkpoint atual

- PDF simples de Registro de Servico em checkpoint proprio, ainda sem PMOC.
- Evoluir detalhe de Cliente para servicos relacionados em checkpoint proprio.
- PMOC contextual somente depois que app-v2, Registro de Servico e PDFs simples
  estiverem estabilizados.

---

# Historico - Clientes em Equipamentos

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
