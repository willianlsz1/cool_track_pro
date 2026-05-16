# app-v2 goal - Paridade Registro de Servico

## Diretriz superior

Implementacoes futuras do app-v2 devem seguir
`docs/rewrite/plano-paridade-funcional-v1-v2.md`.

O objetivo do app-v2 nao e ser uma versao enxuta do v1. O objetivo e preservar
paridade funcional operacional com o app legado, mantendo visual, shell,
componentes e arquitetura novos no app-v2.

Antes de novos checkpoints de codigo, preencher ou atualizar a matriz de
paridade do fluxo afetado e separar paridade obrigatoria, melhoria permitida,
backlog e areas sensiveis.

## Checkpoint atual - Tecnico como dado operacional

Implementar a proxima lacuna de paridade do Registro de Servico:

> Tecnico deve virar dado operacional do Registro de Servico no app-v2, sem
> storage real e sem lista global de tecnicos.

### Analise resumida

No v1, o Registro de Servico exige `tecnico` no fluxo padrao e salva esse dado
no registro.

No v2 atual, o shell injeta `Tecnico app-v2` no momento da conclusao. Isso
mantem o mock funcionando, mas nao torna o tecnico parte do draft, da revisao ou
do relatorio imediato.

Ha 99% de certeza para implementar um campo local de tecnico dentro do fluxo
app-v2, porque a mudanca fica isolada em `src/app-v2/`, usa a store mockada
existente e nao altera storage real, lista global de tecnicos ou contratos
sensiveis.

### Plano

- Adicionar teste RED no view model do fluxo para tecnico no draft, revisao e
  conclusao.
- Adicionar teste RED no relatorio para usar o tecnico informado no draft.
- Adicionar teste RED no shell para preencher tecnico, concluir o servico e
  garantir que o historico/relatorio nao usem valor fixo.
- Incluir `technician` no `ServiceDraft`.
- Adicionar campo local `Tecnico responsavel` na etapa de execucao.
- Bloquear avancar para revisao enquanto tecnico, diagnostico e acoes estiverem
  vazios.
- Usar `draft.technician` na conclusao e no relatorio imediato.
- Atualizar a matriz de paridade para refletir a cobertura desse item.

### Anti-escopo

- Nao criar lista global de tecnicos.
- Nao adicionar tecnico novo em storage real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao conectar storage real.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver custos, pecas, `Outro` customizado ou proxima manutencao neste
  checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel` e
  `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `technician`.
- A etapa de execucao permite informar tecnico responsavel.
- O usuario nao avanca para revisao sem tecnico, diagnostico e acoes.
- A revisao, conclusao, relatorio imediato e registro mockado usam o tecnico
  informado, nao um valor fixo do shell.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `technician`.
- A etapa de execucao ganhou campo local `Tecnico responsavel`.
- O botao `Revisar` agora depende de tecnico, diagnostico e acoes preenchidos.
- A revisao, a conclusao, o relatorio imediato e a lista de registros recentes
  mostram o tecnico informado.
- `AppV2Shell` deixou de injetar `Tecnico app-v2` ao concluir o registro.
- Matriz de paridade atualizada: `Validar tecnico obrigatorio` passou de
  `regressao` para `coberto`.
- Proximo checkpoint recomendado: campo `Outro` deve permitir descricao
  customizada no Registro de Servico do app-v2, sem alterar storage real e sem
  copiar UI legado.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `ServiceDraft` nao tinha `technician`, a revisao/conclusao nao
  exibiam tecnico, o relatorio imediato usava `Nao informado` e a UI nao tinha
  input `service-technician`.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 4 arquivos e 22 testes.
- `npm run format`: passou.
- Revalidacao focada apos format:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 4 arquivos e 22 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.
- `npm run format:check`: passou.
- `git diff --check`: passou.

---

## Historico - Paridade Registro de Servico

Iniciar checkpoint de paridade funcional v1 -> v2 para **Registro de Servico**.

Este checkpoint e documental. Nao implementa codigo porque a comparacao mostrou
lacunas amplas demais para uma alteracao segura com 99% de certeza.

### Capacidade v1 a preservar

O Registro de Servico v1 permite:

- abrir registro direto por equipamento;
- abrir registro sem equipamento e acionar escolha de equipamento;
- orientar criacao de equipamento quando nao ha equipamentos;
- validar equipamento, data, tipo, tecnico, status, proxima manutencao e custos;
- persistir observacoes, pecas, custos, cliente/local e assinatura/checklist
  quando aplicavel;
- atualizar status do equipamento depois do registro;
- adicionar tecnico novo quando necessario;
- manter historico automaticamente;
- oferecer pos-salvamento com PDF/WhatsApp/toast/fallback para relatorio;
- acionar prompt de proxima preventiva depois de salvar.

### Equivalente v2 atual

O app-v2 cobre parcialmente:

- abertura direta por equipamento via `startServiceFromEquipment`;
- fluxo por etapas com contexto, tipo, execucao, revisao e conclusao;
- conclusao mockada via `completeService`;
- atualizacao de status do equipamento;
- insercao de registro mockado no historico;
- preview simples de relatorio no estado concluido;
- subvisao `Servicos > Relatorios` em working tree atual.

### Lacunas

- Inicio sem equipamento ainda cai em fallback para primeiro equipamento mockado,
  nao em escolha operacional.
- Estado sem equipamentos nao orienta criacao antes do registro.
- Tecnico nao e campo do fluxo; o shell injeta valor fixo.
- `Outro` nao possui descricao customizada.
- `pecas`, `custoPecas`, `custoMaoObra` e `proxima` nao existem no draft v2.
- Agendamento de proximo compromisso existe como action, mas nao esta integrado
  ao fechamento do Registro de Servico.
- Pos-salvamento WhatsApp/PDF/fallback permanece area sensivel e nao deve ser
  misturado neste checkpoint.

### Melhoria permitida

- Criar matriz de paridade do fluxo.
- Classificar lacunas entre paridade obrigatoria, melhoria permitida, backlog e
  area sensivel.
- Recomendar o primeiro checkpoint pequeno de codigo sem tocar areas sensiveis.

### Anti-escopo

- Nao alterar `src/` neste checkpoint documental.
- Nao copiar UI, CSS, template, shell ou picker legado.
- Nao conectar storage real.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.

### Arquivos afetados

- `docs/app-v2-goal.md`.
- `docs/rewrite/matriz-paridade-v1-v2.md`.

### Validacao esperada

- `npm run format:check`.
- `git diff --check`.

### Resultado deste checkpoint

- Implementado estado de escolha de equipamento para inicio sem contexto.
- Implementado estado vazio orientando ir para Equipamentos quando nao ha
  equipamentos.
- Abertura direta por equipamento foi preservada.
- Matriz de paridade atualizada: as capacidades "abrir registro sem equipamento
  com seletor/picker" e "orientar criacao de equipamento quando nao ha
  equipamentos" passaram de `regressao` para `coberto`.
- Proximo checkpoint recomendado: tecnico deve virar dado operacional do
  Registro de Servico no app-v2, sem storage real e sem lista global de
  tecnicos.

### Validacao executada

- TDD RED: `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou
  porque `Iniciar registro` ainda abria direto o primeiro equipamento em vez de
  mostrar escolha/estado vazio.
- GREEN: `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 1
  arquivo e 10 testes.
- `npm run format`: passou.
- `git diff --check`: passou.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.

---

## Historico - Servicos > Relatorios

### Checkpoint

Implementar `Servicos > Relatorios` como subvisao interna de `Servicos`,
derivada dos Registros de Servico concluidos, com KPIs, busca, lista
responsiva, preview reabrivel e impressao escopada ao documento do relatorio.

## Preservacao do estado anterior

O checkpoint anterior de relatorio simples de Registro de Servico foi preservado
por commit separado antes de iniciar esta implementacao.

- Branch: `codex/rewrite-zero-react-parallel`.
- Commit de preservacao: `7600c6b674a92e289dca384612d7d2ce3c1da9a5`
  (`feat(app-v2): add simple service report preview`).
- HEAD base deste checkpoint: `7600c6b674a92e289dca384612d7d2ce3c1da9a5`.
- Working tree apos preservacao: limpo.
- Working tree final: sujo apenas com este checkpoint de `Servicos >
Relatorios` e atualizacao deste documento.
- Validacoes conhecidas do checkpoint anterior: `npm run format`, `npm run
format:check`, `npm run typecheck`, testes app-v2, `npm run build`, `npm run
check`, `git diff --check`, isolamento textual e QA desktop/mobile passaram;
  `npm run check` manteve apenas warning conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.

## Escopo executado

- `Relatorios` criado como subvisao dentro de `Servicos`, sem aparecer na
  sidebar desktop nem na bottom nav mobile.
- Lista de relatorios derivada dos registros mockados concluidos ja existentes.
- KPIs implementados:
  - `Relatorios prontos`;
  - `Com atencao`;
  - `Pendentes`;
  - `Este mes`.
- Busca local implementada por atendimento/ID, cliente, equipamento e tipo de
  servico.
- Cada item possui acao `Ver relatorio`.
- `Ver relatorio` abre preview dedicado dentro de `Servicos > Relatorios` com
  `Voltar para relatorios`.
- Preview historico usa o mesmo modelo puro do relatorio simples e reabre
  relatorios a partir do registro concluido.
- Impressao escopada por wrapper `data-app-v2-print-scope="service-report"` e
  CSS de print local do app-v2.

## Anti-escopo preservado

- Relatorios nao virou aba principal global.
- Nao foi implementada agenda completa, calendario, recorrencia avancada ou
  edicao completa de compromissos.
- Nao foi implementado PMOC, Modelo B HVAC, Modelo C mensal, relatorio mensal,
  checklist regulatorio, assinatura real, WhatsApp/share real, download binario
  robusto, storage real, Supabase, billing, backend, rotas reais, autenticacao
  ou permissoes reais.
- Nao houve uso de `src/domain/pdf/shareReport.js` nem modulos legados de
  PDF/share.
- Nao houve mudanca em `package.json`, `package-lock.json`, Vite, ESLint ou
  TypeScript.

## Checklist de progresso atual

- [x] Preservar explicitamente o estado anterior por commit separado.
- [x] Criar modelo puro de `Servicos > Relatorios`.
- [x] Criar subvisao `Relatorios` dentro de `Servicos`.
- [x] Implementar KPIs aprovados.
- [x] Implementar busca local aprovada.
- [x] Implementar lista derivada de registros concluidos.
- [x] Implementar acao `Ver relatorio`.
- [x] Implementar preview dedicado com `Voltar para relatorios`.
- [x] Escopar impressao para imprimir somente o documento.
- [x] Adicionar ou ajustar testes focados.
- [x] Executar QA desktop/mobile.
- [x] Validar isolamento app-v2.
- [x] Atualizar este arquivo com resultado real.

## Decisoes tomadas

- A subnavegacao de `Servicos` fica limitada a `Registros` e `Relatorios` neste
  checkpoint; `Orcamentos` nao foi criado porque nao era necessario para a
  navegacao controlada.
- A lista de relatorios usa status local derivado:
  - status `warn`/`danger` vira `Atencao`;
  - registro sem observacoes vira `Pendente de revisao`;
  - demais registros viram `Pronto`.
- A impressao continua usando `window.print()`, mas o CSS de print esconde shell,
  botoes e navegacao, deixando visivel apenas o documento marcado.
- O agendamento simples de proximo compromisso permaneceu em backlog; nao era
  necessario para integrar relatorios.

## Arquivos alterados neste checkpoint

- `docs/app-v2-goal.md`.
- `src/app-v2/index.tsx`.
- `src/app-v2/service/ServiceReportPreview.tsx`.
- `src/app-v2/service/ServiceReportsHome.tsx`.
- `src/app-v2/service/ServiceReportsKpis.tsx`.
- `src/app-v2/service/ServiceReportsList.tsx`.
- `src/app-v2/service/ServicesHome.tsx`.
- `src/app-v2/service/ServicesSubViewNav.tsx`.
- `src/app-v2/service/serviceReportViewModel.test.ts`.
- `src/app-v2/service/serviceReportViewModel.ts`.
- `src/app-v2/service/servicesReportsViewModel.test.ts`.
- `src/app-v2/service/servicesReportsViewModel.ts`.
- `src/app-v2/shell/AppV2Shell.test.tsx`.
- `src/app-v2/styles/print.css`.

## Componentes e modelos criados ou ajustados

- Criado `servicesReportsViewModel.ts`: deriva itens, busca, fallback e KPIs.
- Ajustado `serviceReportViewModel.ts`: adiciona
  `buildServiceReportViewModelFromRecord` para reabrir relatorio historico.
- Criado `ServiceReportsHome.tsx`: subvisao de lista e preview dedicado.
- Criados `ServiceReportsKpis.tsx`, `ServiceReportsList.tsx` e
  `ServicesSubViewNav.tsx`.
- Ajustado `ServiceReportPreview.tsx`: marca area imprimivel e regioes ocultas
  no print.
- Ajustado `ServicesHome.tsx`: orquestra subvisoes `Registros` e `Relatorios`
  sem crescer o shell global.

## Testes adicionados ou ajustados

- `servicesReportsViewModel.test.ts`: cobre derivacao dos relatorios, KPIs,
  busca por ID/cliente/equipamento/tipo, fallback e ausencia de escopo
  regulatorio/legado.
- `serviceReportViewModel.test.ts`: cobre reabertura do relatorio a partir de
  registro concluido.
- `AppV2Shell.test.tsx`: cobre subvisao dentro de `Servicos`, ausencia de aba
  global, busca, preview dedicado, volta para lista, print scoped por atributo e
  regressao de iniciar/retomar/concluir servico.

## Comandos executados neste checkpoint

- `npm run format`: passou.
- `npm run format:check`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx`:
  passou com 3 arquivos e 16 testes.
- `npm run test -- src/app-v2`: passou com 12 arquivos e 51 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `sessionStorage`, `supabase`, `billing`, `WhatsApp`, `whatsapp`, `PMOC`,
  `pmoc`, `src/domain/pdf/shareReport.js` e `shareReport`: sem referencias
  proibidas apos ajuste do teste.

## QA desktop/mobile

- Desktop 1920x1080: `Relatorios` aparece como subvisao dentro de `Servicos`,
  nao aparece na navegacao global, KPIs ficam no topo, busca filtra por
  `camara`, lista fica legivel, `Ver relatorio` abre preview dedicado e nao ha
  overflow horizontal.
- Mobile 390x844: bottom nav permanece preservada, `Relatorios` continua apenas
  dentro de `Servicos`, KPIs/lista ficam acessiveis, `Ver relatorio` abre o
  preview e nao ha overflow horizontal.
- Ajuste feito durante QA: adicionado `tw-box-border` ao campo de busca para
  remover overflow horizontal mobile de 18px.
- Preview dedicado: contem cliente, equipamento, status e execucao; botao
  `Voltar para relatorios` funciona; acao de imprimir fica acessivel.
- Print scoped: o documento possui `data-app-v2-print-scope="service-report"` e
  a UI operacional possui `data-app-v2-print-hidden="true"`, evitando shell,
  nav, filtros, lista e botoes no print.
- A tela manteve densidade operacional, sem virar dashboard administrativo
  pesado.

## Resultado do checkpoint atual

Concluido em working tree sujo, sem commit final deste checkpoint. O app-v2 tem
agora uma subvisao operacional `Servicos > Relatorios`, local e testavel,
derivada dos Registros de Servico concluidos, com KPIs, busca, lista, preview
reabrivel e impressao escopada.

- Isolamento app-v2 confirmado.
- `Relatorios` nao virou aba principal global.
- PMOC, Modelo B HVAC e Modelo C mensal ficaram fora.
- WhatsApp/share real, storage real, Supabase, billing e rotas reais ficaram
  fora.
- PDF/share legado nao foi usado.
- Maior arquivo app-v2 apos a tarefa: `src/app-v2/equipment/equipmentViewModel.ts`
  com 328 linhas.

## Backlog final

- Evoluir detalhe de Cliente para servicos relacionados.
- Melhorar dados mockados de historico por cliente/equipamento.
- Implementar agendamento simples de proximo compromisso em checkpoint proprio,
  se ainda fizer sentido.
- Criar exportacao/download mais robusto em checkpoint proprio, se a previa
  imprimivel deixar de ser suficiente.
- Criar Modelo B - Registro Tecnico HVAC em checkpoint proprio.
- Criar Modelo C - Relatorio mensal em checkpoint proprio.
- PMOC contextual somente depois que Servicos, Relatorios, Clientes e PDF
  simples estiverem estaveis.

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
