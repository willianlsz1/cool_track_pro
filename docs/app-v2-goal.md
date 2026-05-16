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

## Checkpoint atual - Historico de Servicos fase 1: busca local em Registros

Adicionar busca local simples em `Servicos > Registros` para reduzir a lacuna
de consulta do Historico v1 sem recriar a tela legada.

### Analise resumida

O v1 permite consultar historico por registros e contexto operacional. O
app-v2 ja lista registros recentes e permite editar/reabrir relatorio por
caminhos locais, mas ainda nao possui busca na subvisao `Registros`.

A menor fatia segura e filtrar registros recentes em memoria por equipamento,
cliente, tecnico, tipo e texto do registro, usando input simples e mensagem
local de estado vazio.

### Plano

- Criar testes RED no view model de Servicos para busca local.
- Criar teste shell para busca em `Servicos > Registros`.
- Implementar filtro puro em `buildServicesHomeViewModel`.
- Adicionar input simples no topo da lista de registros.
- Atualizar matriz de paridade.

### Anti-escopo

- Nao criar filtros avancados, periodo, ordenacao customizada ou tela de
  Historico legada.
- Nao criar router novo, storage real, Supabase/RLS, PDF/share, WhatsApp,
  billing, PMOC ou CSS legado.

### Validacao esperada

- Testes focados de view model e shell.
- Validacao geral ao final do ciclo.

### Resultado deste checkpoint

- `buildServicesHomeViewModel` filtra registros recentes por query local
  normalizada.
- `Servicos > Registros` ganhou input simples `Buscar registros`.
- A busca cobre equipamento, cliente, local, tipo, tecnico, texto do registro,
  pecas e custos.
- Estado sem resultado mostra mensagem local `Nenhum registro encontrado.`
- Nenhum router, storage real, historico legado, CSS legado ou integracao
  sensivel foi tocado.

### Validacao focada executada

- RED/GREEN:
  `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 28 testes.

### Proximo checkpoint recomendado

Clientes fase 2: exibir servicos relacionados no detalhe de Cliente usando
registros mockados existentes, sem PMOC, sem storage real, sem router novo e
sem criar design novo.

---

## Historico - Orçamentos mockados dentro de Serviços

Implementar a primeira fatia segura de paridade funcional de Orçamentos no
app-v2 usando UI mínima neutra já existente em Serviços.

### Decisão de produto aplicada

A UX funcional do v1 deve ser preservada como comportamento operacional, não
como layout, CSS ou componente visual legado. Quando o app-v2 resolver uma
capacidade útil com fluxo melhor, a matriz pode marcar `coberto por
substituição v2`.

Com isso, o prompt de próxima preventiva pós-salvamento fica coberto por
substituição v2: o app-v2 já captura `Próxima manutenção` dentro do fluxo de
Registro de Serviço e cria compromisso mockado no fechamento, sem reabrir o
prompt visual do v1.

### Análise resumida

O v1 possui módulo de Orçamentos com pipeline, status, vínculo com cliente,
equipamento ou registro e ações sensíveis de PDF, WhatsApp e assinatura. O
app-v2 já possui contrato `Orcamento` e `orcamentos` na store mockada, mas a
área Serviços ainda não expõe uma subvisão de Orçamentos.

A menor fatia segura é listar orçamentos mockados dentro de Serviços, com
estado vazio funcional e resumo de pipeline. Não haverá criação, edição,
assinatura, PDF, WhatsApp, storage real ou billing.

### Plano

- Atualizar a matriz com a decisão de substituição da próxima preventiva.
- Criar testes RED para view model de Orçamentos mockados.
- Criar teste shell garantindo a subvisão `Orçamentos` dentro de Serviços, sem
  virar aba global.
- Implementar view model pequeno e componentes mínimos reutilizando primitivas
  do app-v2.
- Atualizar documentação de paridade ao final.

### Anti-escopo

- Não criar orçamento real, edição real, assinatura, PDF/share, WhatsApp real,
  billing, cotas, Supabase/RLS, storage real, PMOC ou router novo obrigatório.
- Não copiar UI/CSS/template legado.
- Não criar CSS global, tema/tokens ou design final novo.
- Não implementar modal de orçamento, download, aprovação real ou envio.

### Validação esperada

- Testes focados de view model e shell.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Critério de conclusão

- Serviços possui subvisão `Orçamentos` com UI mínima neutra.
- Orçamentos mockados são listados com número, título, cliente/equipamento,
  status e total.
- Estado vazio orienta que orçamentos surgirão em etapa mock/local futura, sem
  prometer PDF/WhatsApp/assinatura real.
- Orçamentos não viram aba principal global.
- Matriz registra o fluxo como parcial/coberto apenas na fatia mock local.

### Resultado deste checkpoint

- `Servicos` ganhou subvisao `Orcamentos`, sem virar aba principal global.
- `servicesQuotesViewModel` lista orcamentos mockados com numero, titulo,
  cliente, equipamento, status e total.
- A subvisao exibe KPIs locais de ativos, aprovados e pipeline.
- `appV2MockData` passou a ter um orcamento mockado de exemplo vinculado a
  cliente, equipamento e registro.
- Nenhuma acao de criacao, edicao, PDF/share, WhatsApp, assinatura, billing,
  storage real, Supabase/RLS ou PMOC foi implementada.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque o view model nao existia e a subvisao `Orcamentos` nao estava
  disponivel.
- GREEN:
  `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 20 testes.

---

## Checkpoint atual - Edicao de Registro fase 2: equipamento e data

Completar a fatia segura da edicao mockada no app-v2 permitindo alterar
equipamento e data de um registro existente, sem criar design novo e
reaproveitando padroes ja presentes no app-v2.

### Analise resumida

A fase 1 ja reidrata o draft, salva por `id`, nao duplica historico e preserva
campos migrados. A lacuna restante aprovada e permitir alterar os dados basicos
do registro em modo edicao: equipamento e data.

O app-v2 ja tem um padrao de escolha de equipamento em
`ServiceEquipmentChoice`, usado quando o registro inicia sem contexto. Para a
fase 2, a mudanca segura e reutilizar esse mesmo componente no modo edicao, sem
novo picker visual. O campo de data pode reaproveitar o mesmo estilo de input
`type="date"` usado em `nextMaintenanceDate`, mantendo validacao local por
`validateServiceCompletion`.

### Plano

- Adicionar testes RED para editar equipamento e data de registro existente.
- Cobrir relatorio/reabertura refletindo novo equipamento e nova data.
- Reaproveitar `ServiceEquipmentChoice` para troca de equipamento em modo
  edicao.
- Inserir campo simples de data no fluxo atual, usando padrao visual ja
  existente.
- Preservar `id`, nao duplicar historico e manter campos ja migrados.
- Atualizar matriz de paridade e validacoes.

### Anti-escopo

- Nao criar design novo, CSS global, CSS legado ou tema/tokens novos.
- Nao criar calendario complexo, tela grande nova ou router obrigatorio.
- Nao implementar storage real, Supabase/RLS, PDF/share real, WhatsApp real,
  billing, assinatura, cotas, permissoes ou PMOC.
- Nao recomputar historico complexo de status se isso exigir regra nova grande.

### Validacao esperada

- Testes focados de action/view model.
- Testes de shell relacionados a edicao.
- Testes de relatorio/reabertura.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- Registro existente pode alterar equipamento e data no mock local.
- O `id` e preservado e o historico nao duplica.
- Relatorio/reabertura refletem novo equipamento e nova data.
- Diagnostico, acoes, pecas, custos, proxima manutencao e fallback legado
  continuam preservados.
- Equipamento inexistente e data ausente/invalida continuam bloqueados.

### Resultado deste checkpoint

- A edicao de registro existente permite alterar data no passo de contexto com
  input simples `type="date"`.
- A edicao permite alterar equipamento reaproveitando `ServiceEquipmentChoice`,
  o mesmo padrao visual do inicio sem contexto.
- Ao escolher outro equipamento, o draft volta ao fluxo de edicao sem router
  novo e sem picker visual novo.
- `updateServiceRecord` continua preservando `id`, sem duplicar historico, e
  grava equipamento/data editados.
- Relatorio imediato e reaberto refletem equipamento e data editados.
- Diagnostico, acoes, pecas, custos, proxima manutencao e fallback de
  `observacoes` continuam cobertos.

### Validacao executada

- RED relatorio:
  `npm test -- src/app-v2/service/serviceReportViewModel.test.ts --run`
  falhou porque o relatorio imediato ainda usava `today` em vez de
  `draft.serviceDate`.
- RED shell:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque o
  fluxo ainda nao tinha `input[name="service-date"]` nem troca de equipamento.
- GREEN relatorio:
  `npm test -- src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 10 testes.
- GREEN shell:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 17
  testes.
- GREEN focado app-v2:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 55 testes.

### Proximo checkpoint recomendado

Contrato documental de tecnico global no app-v2, sem storage real.

### Acao automatica

Continuando automaticamente para contrato documental de tecnico global, porque
a lacuna pode ser decomposta sem storage real, sem design novo e sem area
sensivel.

---

## Checkpoint atual - Contrato documental de tecnico global

Definir contrato seguro para a capacidade do v1 de adicionar tecnico informado
no Registro de Servico a uma lista global de tecnicos.

### Analise resumida

No v1, `buildRegistroCreateStateMutation` adiciona
`persistedPayload.tecnico` a `prev.tecnicos` quando o nome ainda nao existe. O
app-v2 ja exige tecnico no draft, mas ainda nao possui lista global mockada nem
contrato para evoluir essa paridade sem tocar storage real.

### Resultado deste checkpoint

- Criado `docs/rewrite/contrato-tecnico-global-app-v2.md`.
- Definido que a primeira paridade segura deve ser `tecnicos: string[]` no mock
  local.
- Definido que criacao e edicao de Registro de Servico podem acumular tecnico
  nao vazio no mock.
- Definido anti-escopo: UI nova, autocomplete, storage real, Supabase/RLS,
  permissoes, perfil, migracao, PDF/share e WhatsApp.

### Validacao esperada

- `npm run format:check`.
- `git diff --check`.

### Proximo checkpoint recomendado

Tecnico global fase 1 mockada: acumular tecnico informado em lista mockada no
app-v2 durante criacao e edicao de Registro de Servico, sem UI nova e sem
storage real.

### Acao automatica

Continuar automaticamente, porque a proxima fatia e app-v2/mock local, sem UI
nova e sem area sensivel.

---

## Checkpoint atual - Tecnico global fase 1 mockada

Acumular tecnico informado em lista mockada no app-v2 durante criacao e edicao
de Registro de Servico, sem UI nova e sem storage real.

### Resultado deste checkpoint

- `AppV2MockData` agora possui `tecnicos: string[]`.
- `createAppV2MockSnapshot` clona a lista de tecnicos.
- `completeService` adiciona tecnico novo ao mock local.
- `updateServiceRecord` adiciona tecnico editado ao mock local.
- A regra usa `trim`, ignora nome vazio e nao duplica nome existente.
- Nenhuma UI, autocomplete, storage real, Supabase/RLS, permissao, perfil,
  PDF/share ou WhatsApp foi alterado.

### Validacao executada

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `tecnicos` ainda era `undefined`.
- GREEN:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 20 testes.

### Proximo checkpoint recomendado

Definir contrato controlado para prompt de proxima preventiva pos-salvamento no
app-v2, sem implementar UX nova.

### Acao automatica

Continuando automaticamente apenas para a fatia documental segura antes do gate
de UX.

---

## Checkpoint atual - Contrato de proxima preventiva pos-salvamento

Documentar o contrato do prompt pos-salvamento sem implementar UX nova.

### Resultado deste checkpoint

- Criado
  `docs/rewrite/contrato-proxima-preventiva-pos-salvamento-app-v2.md`.
- Registrado que o app-v2 ja cria compromisso mockado quando
  `nextMaintenanceDate` e informado durante o fluxo.
- Registrado que prompt futuro deve evitar duplicidade e permitir confirmar,
  alterar ou recusar a proxima preventiva.
- Mantidos fora do escopo: UI nova, modal/drawer, storage real, notificacao,
  calendario real, recorrencia avancada, PDF/share, WhatsApp, billing,
  Supabase/RLS, permissoes e PMOC.

### Proximo checkpoint recomendado

Decisao humana de UX para prompt de proxima preventiva pos-salvamento, ou
aprovar explicitamente manter apenas o campo `Proxima manutencao` dentro do
fluxo como comportamento final do app-v2.

### Acao automatica

Bloqueado por gate humano: a proxima acao funcional exige decisao visual/UX.

---

## Historico - Edicao de Registro de Servico existente fase 1 mockada

Implementar a primeira fatia segura da edicao de registro existente no app-v2:

> contrato/action/view model para editar um registro salvo no mock local,
> preservando `id`, sem duplicar registro, com reidratacao de draft a partir do
> registro existente e sem design novo, CSS legado, storage real, router novo
> obrigatorio ou integracoes sensiveis.

### Analise resumida

No v1, `buildRegistroEditStateMutation` localiza o registro por `editingId`,
gera uma versao editada com `buildEditedRegistro`, substitui apenas o item
correspondente em `prev.registros` e reconcilia status dos equipamentos. O modo
edicao tambem reidrata campos do registro existente no formulario, incluindo
tipo `Outro`, tecnico, observacoes, pecas, custos e dados operacionais.

No app-v2, `completeService` cobre criacao/conclusao mockada e ja valida
equipamento/data. A lacuna segura agora e criar a fatia equivalente mockada:
reidratar `ServiceDraft` a partir de `RegistroServico` e atualizar um registro
existente sem duplicar. Ha 99% de certeza para atuar porque a mudanca fica em
app-v2, action pura, view model e testes. A conexao visual ao shell so deve
acontecer se couber no padrao atual sem novo desenho.

### Plano

- Adicionar testes RED para reidratacao de draft a partir de registro existente.
- Adicionar testes RED para editar registro existente no mock preservando `id`
  e sem duplicar.
- Cobrir campos migrados: equipamento, data, tipo, `Outro`, tecnico,
  diagnostico, acoes, observacoes/fallback legado, pecas, custos e proxima
  manutencao.
- Reutilizar a validacao de equipamento existente e data valida no modo edicao.
- Implementar helpers/actions pequenos em app-v2.
- Atualizar matriz de paridade e validacoes.

### Anti-escopo

- Nao criar design final novo nem CSS global.
- Nao copiar UI/CSS/template legado.
- Nao implementar storage real, Supabase/RLS, PDF/share real, WhatsApp real,
  billing, cotas, assinatura, PMOC, permissoes ou package/config.
- Nao implementar edicao visual completa se exigir decisao de UX.

### Validacao esperada

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts --run`.
- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/service/serviceReportViewModel.test.ts --run`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- Registro existente e atualizado por `id` sem duplicacao.
- Edicao preserva o `id`.
- Edicao preserva campos migrados do Registro de Servico.
- Reidratacao aceita registros antigos apenas com `observacoes`.
- Edicao bloqueia equipamento inexistente e data ausente/invalida.
- Fluxo valido atual de conclusao/relatorio continua passando.

### Resultado deste checkpoint

- `createServiceDraftFromRecord` reidrata o draft de edicao a partir de
  `RegistroServico`.
- Registros antigos apenas com `observacoes` continuam abrindo por fallback.
- `updateServiceRecord` atualiza o registro existente por `id`, preserva o
  `id` e nao duplica historico.
- A action de edicao reutiliza a validacao de equipamento existente e data
  valida.
- O shell ganhou conexao minima usando o fluxo visual existente: botao
  `Editar` em registro recente, draft reidratado e salvamento via
  `updateServiceRecord`.
- Nao houve router novo, storage real, CSS global, CSS legado ou integracao
  sensivel.

### Validacao executada

- RED/GREEN view model:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts --run`
  passou com 10 testes.
- GREEN action + view model:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts --run`
  passou com 27 testes.
- GREEN shell:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 16
  testes.
- GREEN fluxo app-v2:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 52 testes.
- `npm run format`: passou.
- `npm run build`: passou com warnings Vite conhecidos de import
  static/dynamic e chunk size.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite conhecidos no build.
- `npm run format:check`: passou dentro de `npm run check`.
- `git diff --check`: passou.

### Proximo checkpoint recomendado

Edicao de Registro fase 2: definir UX aprovada para alterar equipamento e data
dentro do fluxo de edicao, ou limitar explicitamente a fase 2 a uma fatia sem
UI nova.

### Gate

O ciclo automatico deve parar aqui: a proxima evolucao funcional relevante da
edicao exige decisao visual/UX para editar equipamento e data no fluxo, ou uma
nova fatia explicitamente limitada sem UI.

---

## Historico - Diagnostico e acoes separados

Implementar a proxima lacuna funcional segura do Registro de Servico:

> Separar diagnostico e acoes executadas no registro mockado e no relatorio
> local do app-v2, preservando `observacoes` como compatibilidade e sem tocar
> storage real, PDF/share, WhatsApp real, router ou contratos legados.

### Analise resumida

No v1, `obs` alimenta a descricao final do registro. No app-v2, o fluxo ja
captura `diagnosis` e `actionsDone` separados no draft, mas o registro mockado
salva ambos apenas concatenados em `observacoes`. Ao reabrir relatorio a partir
de registro, diagnostico e acoes voltam duplicados a partir de `observacoes`.

Ha 99% de certeza para atuar porque a mudanca fica restrita ao contrato
mockado do app-v2, action pura e view model de relatorio local. Nao ha storage
real, schema real, router, PDF/share, WhatsApp, billing, PMOC, permissoes,
package/config ou CSS legado envolvidos.

### Plano

- Adicionar testes RED em `appV2Flow.test.ts` garantindo que o registro mockado
  preserva diagnostico e acoes separadamente, mantendo `observacoes`.
- Adicionar teste RED em `serviceReportViewModel.test.ts` garantindo que
  relatorio reaberto usa diagnostico e acoes separados quando existirem.
- Adicionar campos opcionais ao tipo `RegistroServico` mockado do app-v2.
- Atualizar `completeService` para preencher os campos separados.
- Atualizar view model de relatorio para preferir campos separados e manter
  fallback por `observacoes`.
- Atualizar matriz de paridade e validacoes.

### Anti-escopo

- Nao alterar UI estrutural, CSS global, design visual ou shell legado.
- Nao alterar storage real, Supabase/RLS, PDF/share, WhatsApp real, billing,
  PMOC, assinatura, permissoes, router ou package/config.
- Nao migrar dados reais nem alterar contratos legados.

### Validacao esperada

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceReportViewModel.test.ts --run`.
- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- Registro mockado preserva diagnostico e acoes separadamente.
- `observacoes` continua preenchida como compatibilidade.
- Relatorio reaberto usa diagnostico e acoes separados quando existirem.
- Relatorio reaberto continua aceitando registros antigos apenas com
  `observacoes`.
- Matriz de paridade marca a lacuna como coberta.

### Resultado deste checkpoint

- `RegistroServico` mockado passou a aceitar `diagnostico` e
  `acoesExecutadas` opcionais.
- `completeService` grava diagnostico e acoes separadamente e mantem
  `observacoes` concatenada para compatibilidade.
- `buildServiceReportViewModelFromRecord` prefere os campos separados quando
  existirem.
- Registros antigos apenas com `observacoes` continuam abrindo relatorio por
  fallback.

### Validacao executada

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceReportViewModel.test.ts --run`
  falhou porque o registro nao possuia campos separados e o relatorio reaberto
  duplicava `observacoes`.
- GREEN focado:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 24 testes.
- GREEN de fluxo:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 39 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check`,
  `npm run format:check` e `git diff --check` passaram.

### Proximo checkpoint recomendado

Definir por decisao humana qual lacuna restante deve abrir proxima etapa:
tecnico global, edicao de registro existente, prompt de proxima preventiva ou
pos-salvamento PDF/WhatsApp real.

### Gate

O ciclo automatico deve parar aqui: as lacunas restantes envolvem contrato
novo, UX de prompt, fluxo maior de edicao ou areas sensiveis.

---

## Historico - Validacao amigavel de equipamento e data

Implementar a proxima lacuna funcional segura do Registro de Servico:

> Validacao amigavel de equipamento e data do Registro de Servico no app-v2,
> sem alterar router, storage real, contratos legados ou areas sensiveis.

### Analise resumida

No v1, o payload do Registro valida `equipId` contra equipamentos existentes e
exige `data` valida antes de persistir. No app-v2, a conclusao mockada ja
recebe `date` e `serviceDraft.equipmentId`, mas ainda nao bloqueia de forma
amigavel quando o equipamento desaparece do snapshot ou quando a data do
contrato mockado vem ausente/invalida.

Ha 99% de certeza para atuar porque a mudanca fica restrita ao app-v2:
action pura/mockada, shell do fluxo, testes focados e matriz de paridade. Nao
ha storage real, schema real, router, PDF/share, WhatsApp, billing, PMOC,
permissoes ou CSS legado envolvidos.

### Plano

- Adicionar testes RED em `appV2Flow.test.ts` para equipamento inexistente,
  data ausente/invalida e fluxo valido preservado.
- Adicionar teste RED no shell garantindo mensagem amigavel local quando a
  conclusao falha por equipamento invalido.
- Implementar validacao pura em `completeService`.
- Capturar erro no shell e passar mensagem local para o fluxo.
- Exibir mensagem local no app-v2 sem alterar estrutura visual ampla.
- Atualizar matriz de paridade e validacoes.

### Anti-escopo

- Nao criar novo campo visual de data neste checkpoint.
- Nao alterar router, storage real, Supabase/RLS, PDF/share, WhatsApp real,
  billing, PMOC, assinatura, permissoes ou package/config.
- Nao copiar UI, CSS, template ou shell legado.
- Nao implementar edicao de registro, tecnico global ou lista real de tecnicos.

### Validacao esperada

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- `completeService` bloqueia equipamento inexistente com mensagem amigavel.
- `completeService` bloqueia data ausente ou invalida com mensagem amigavel.
- O shell exibe a mensagem local no fluxo quando a conclusao falha.
- Fluxo valido de conclusao permanece preservado.
- Matriz de paridade marca validacao de equipamento/data como coberta.

### Resultado deste checkpoint

- `completeService` passou a chamar `validateServiceCompletion` antes de criar
  o registro mockado.
- `validateServiceCompletion` bloqueia equipamento inexistente e data ausente
  ou invalida em formato calendario simples `YYYY-MM-DD`.
- `ServiceFlow` valida antes de sair da revisao para a etapa final.
- `ServiceStepReview` exibe mensagem local amigavel quando a validacao falha.
- O shell usa a mesma validacao da action, preservando o fluxo valido atual.

### Validacao executada

- RED inicial:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `completeService` ainda nao bloqueava equipamento/data e o shell
  avancava para finalizado.
- GREEN focado:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 30 testes.

### Proximo checkpoint recomendado

Separar diagnostico e acoes executadas no registro mockado e no relatorio local
do app-v2, preservando `observacoes` como compatibilidade e sem tocar storage
real, PDF/share, WhatsApp real, router ou contratos legados.

---

## Historico - QA visual dos campos do Registro

Corrigir regressao visual observada no Registro de Servico do app-v2:

> labels e campos compactos da etapa de execucao nao podem se amontoar,
> sobrepor ou encostar visualmente uns nos outros em desktop ou mobile.

### Analise resumida

A captura enviada mostra a etapa de execucao com campos de custos e proxima
manutencao visualmente apertados. A causa confirmada esta no agrupamento de
campos compactos em grid: o teste inicial media apenas label contra o proprio
controle, mas nao media a distancia entre o controle anterior e o proximo label
quando o grid quebra para uma coluna no mobile.

Ha 99% de certeza para atuar porque a mudanca fica restrita ao app-v2:
componente visual do Registro de Servico e teste Playwright de layout no
preview. Nao ha regra de negocio, storage, integracao real, PDF/share,
WhatsApp, billing, PMOC, permissoes ou contrato legado envolvidos.

### Plano

- Criar teste Playwright RED no preview app-v2 medindo retangulos reais de
  label/input.
- Validar que labels de `Custo de pecas`, `Custo de mao de obra`,
  `Proxima manutencao` e `Status final` mantem respiro vertical minimo e nao
  sobrepoem seus controles.
- Validar em mobile que um grupo de campo nao invade visualmente o proximo
  label quando o grid de custos quebra para uma coluna.
- Validar em desktop que o Registro de Servico usa quase toda a superficie util
  do app-v2, sem ficar centralizado em uma coluna estreita.
- Ajustar apenas espacamento/estrutura local da etapa de execucao.
- Revalidar teste focado de shell, teste e2e novo, format, build, check e
  `git diff --check`.

### Anti-escopo

- Nao redesenhar o fluxo inteiro.
- Nao alterar regra de negocio do Registro de Servico.
- Nao tocar app legado.
- Nao alterar storage real, Supabase/RLS, PDF/share, WhatsApp real, billing,
  PMOC, assinatura, permissoes, package/config ou router.
- Nao mexer em calendario, recorrencia, notificacoes ou prompt legado.

### Validacao esperada

- TDD RED com Playwright antes da correcao visual.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run`.
- Playwright focado do novo teste visual.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- O teste automatizado falha antes da correcao por espacamento insuficiente ou
  sobreposicao.
- Labels compactos da etapa de execucao mantem respiro vertical minimo de 20px
  em relacao aos seus controles.
- Grupos de campo compactos mantem respiro vertical minimo de 20px entre o fim
  do controle anterior e o inicio do proximo label em mobile.
- Custos em duas colunas nao colidem entre si em desktop.
- O fluxo funcional existente permanece passando.

### Resultado deste checkpoint

- Criado teste Playwright focado em `e2e/specs/app-v2-service-layout.spec.js`.
- O teste mede `getBoundingClientRect()` real no preview app-v2 para travar
  respiro minimo entre labels e controles compactos.
- RED confirmado: `Custo de pecas` tinha 8px de respiro, abaixo do minimo de
  12px.
- `ServiceStepExecution` passou a usar `tw-gap-3` entre labels e controles da
  etapa de execucao.
- GREEN confirmado no Playwright: labels de custos, proxima manutencao e status
  final nao sobrepoem controles e mantem respiro minimo em desktop.
- A segunda validacao visual mostrou que o problema maior era estrutural:
  `ServiceFlow` limitava o fluxo a `tw-max-w-[980px]`, usando apenas 58,6% da
  largura util em desktop grande.
- O teste Playwright passou a travar aproveitamento minimo de 70% da superficie
  desktop e largura superior a 1180px.
- `ServiceFlow` deixou de sobrescrever o `PageShell` com 980px e voltou a usar
  o limite padrao do app-v2.
- A terceira validacao visual mostrou que ainda havia uma lacuna mobile: o
  respiro entre `Custo de pecas` e `Custo de mao de obra` era de 12px quando a
  grade quebrava para uma coluna.
- O teste Playwright agora trava respiro minimo de 20px entre grupos de campos
  compactos em mobile.
- `ServiceStepExecution` passou a usar `tw-gap-x-3 tw-gap-y-5` no grid de
  custos, preservando colunas no desktop e aumentando apenas o respiro vertical.
- A quarta validacao visual mostrou que 12px entre label e controle continuava
  parecendo colado na borda com foco ativo. O contrato Playwright agora exige
  20px entre label e controle.
- `ServiceStepExecution` passou a usar `tw-gap-5` em todos os labels da etapa
  de execucao e `tw-mt-5` antes dos botoes de status.
- A largura desktop tambem foi endurecida: o Registro de Servico agora deve usar
  mais de 90% da superficie util. `ServiceFlow` usa `tw-max-w-none` apenas nesse
  fluxo.

### Validacao executada

- TDD RED:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou primeiro por seletor ambiguo do teste; apos ajuste do seletor, falhou
  corretamente por `Custo de pecas` com 8px de respiro.
- GREEN focado:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 1 teste.
- `npm run format`: passou.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run`: passou com 1
  arquivo e 14 testes.
- Revalidacao Playwright apos format:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 1 teste.
- RED de largura:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou com ratio `0.5861244019138756`, abaixo do minimo `0.7`.
- GREEN de largura:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 1 teste apos remover o limite local de 980px.
- RED mobile entre grupos:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou com 12px entre `Custo de pecas` e `Custo de mao de obra`, abaixo do
  minimo de 20px.
- GREEN mobile/desktop:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 2 testes apos aumentar o gap vertical do grid de custos.
- RED de respiro label-controle:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou com 12px entre label e campo, abaixo do novo minimo de 20px.
- RED de largura desktop:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou com ratio `0.7655502392344498`, abaixo do minimo `0.9`.
- GREEN final visual:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 2 testes apos ampliar respiro interno e liberar largura total do
  `ServiceFlow`.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `npm run format:check`: passou.
- `git diff --check`: passou.

---

## Historico - Proxima manutencao

Implementar a proxima lacuna de paridade do Registro de Servico:

> Proxima manutencao deve virar campo opcional do Registro de Servico no
> app-v2, conectando-se ao agendamento mockado ja existente, sem calendario
> completo, sem recorrencia avancada e sem storage real.

### Analise resumida

No v1, `proxima` entra no payload e no registro persistido. O pos-salvamento
tambem pode acionar prompt de proxima preventiva. A capacidade operacional a
preservar neste checkpoint e registrar a data de proxima manutencao e refletir
isso no agendamento mockado do app-v2.

No v2 atual, `scheduleNextCommitment` ja existe como action mockada, mas o
Registro de Servico ainda nao coleta `proxima` nem cria compromisso ao concluir.

Ha 99% de certeza para implementar porque a mudanca fica restrita ao app-v2:
draft, action mockada, view models, UI de execucao, relatorio e testes. O
compromisso criado sera uma preventiva simples com `origem: "registro"`, sem
calendario completo, sem recorrencia avancada, sem storage real, sem
notificacoes e sem integracoes sensiveis.

### Plano

- Adicionar testes RED para `nextMaintenanceDate` no resumo tecnico.
- Adicionar testes RED para relatorio imediato e reaberto exibirem proxima
  manutencao.
- Adicionar teste RED em `completeService` para gravar `proximaData` e criar
  compromisso mockado.
- Adicionar teste RED no shell preenchendo a data sem abrir calendario real.
- Incluir `nextMaintenanceDate` opcional em `ServiceDraft`.
- Exibir campo opcional de data na etapa de execucao.
- Propagar a data para revisao, conclusao, relatorio imediato, registro
  mockado, relatorio reaberto e recentes.
- Atualizar a matriz de paridade para refletir `Registrar proxima manutencao`
  como coberto.

### Anti-escopo

- Nao implementar calendario completo.
- Nao implementar recorrencia avancada, notificacoes, lembretes reais ou push.
- Nao alterar storage real nem schema persistido real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver prompt WhatsApp/PDF/fallback neste checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel`,
  `servicesHomeViewModel`, `appV2Actions` e `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `nextMaintenanceDate`.
- A etapa de execucao exibe data opcional de proxima manutencao.
- O campo nao bloqueia conclusao quando vazio.
- Quando preenchido, o registro mockado recebe `proximaData`.
- Quando preenchido, a store mockada cria um compromisso preventiva com
  `origem: "registro"` para o mesmo equipamento.
- Revisao, conclusao, relatorio imediato, relatorio reaberto e recentes exibem
  a proxima manutencao.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `nextMaintenanceDate` opcional.
- `ServiceStepExecution` passou a exibir campo opcional `Proxima manutencao`.
- A revisao e a conclusao exibem a data quando informada e fallback quando
  vazia.
- `RegistroServico` do app-v2 recebe `proximaData` no mock local quando a data
  e preenchida.
- `completeService` cria compromisso mockado `preventiva` com
  `origem: "registro"` para o mesmo equipamento.
- Relatorio imediato, relatorio reaberto e registros recentes preservam a
  proxima manutencao.
- Matriz de paridade atualizada: `Registrar proxima manutencao` passou de
  `parcial` para `coberto`; o prompt legado de proxima preventiva ficou como
  `parcial`, coberto por compromisso mockado sem prompt legado.
- Proximo checkpoint recomendado: validacao amigavel de equipamento e data do
  Registro de Servico no app-v2, sem alterar router, storage real, contratos
  legados ou areas sensiveis.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou com 5 testes porque `nextMaintenanceDate`, `proximaData`, compromisso
  mockado e input `service-next-maintenance` ainda nao existiam.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 5 arquivos e 51 testes antes da validacao completa.

---

## Historico - Custos opcionais

Implementar a proxima lacuna de paridade do Registro de Servico:

> Custos de pecas e mao de obra devem virar campos opcionais do Registro de
> Servico no app-v2, sem orcamento real, sem billing e sem storage real.

### Analise resumida

No v1, `custoPecas` e `custoMaoObra` entram no payload e no registro criado,
separados de `pecas`, `proxima` e das saidas comerciais. A capacidade
operacional a preservar neste checkpoint e registrar os valores informados pelo
tecnico no atendimento, sem transformar isso em orcamento real, cobranca,
estoque, billing ou persistencia real.

No v2 atual, o draft ja cobre tecnico, tipo, diagnostico, acoes, pecas e
status final, mas nao preserva custos. Isso mantem a linha `Registrar custos`
como regressao na matriz.

Ha 99% de certeza para implementar porque a mudanca fica restrita ao app-v2,
com campos opcionais no draft, registro mockado, view models, UI da etapa de
execucao e relatorios. Nao ha schema real, storage real, PDF/share, WhatsApp
real, billing ou orcamento real envolvidos.

### Plano

- Adicionar testes RED para custos opcionais no resumo tecnico do fluxo.
- Adicionar testes RED para relatorio imediato e reaberto exibirem custos.
- Adicionar testes RED para `completeService` gravar `custoPecas` e
  `custoMaoObra` no registro mockado.
- Adicionar teste RED no shell preenchendo custos sem exigir orcamento.
- Incluir `partsCost` e `laborCost` opcionais em `ServiceDraft`.
- Exibir campos opcionais na etapa de execucao.
- Propagar custos para revisao, conclusao, relatorio imediato, registro
  mockado, registros recentes e busca de relatorios.
- Atualizar a matriz de paridade para refletir `Registrar custos` como coberto.

### Anti-escopo

- Nao gerar orcamento real.
- Nao somar total comercial, estoque, itens de orcamento, billing ou cobranca.
- Nao alterar storage real nem schema persistido real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao mexer em Supabase/RLS, PDF/share, WhatsApp real, PMOC, assinatura,
  permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver proxima manutencao neste checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel`,
  `servicesHomeViewModel`, `servicesReportsViewModel`, `appV2Actions` e
  `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `partsCost` e `laborCost`.
- A etapa de execucao exibe custos opcionais de pecas e mao de obra.
- Os campos nao bloqueiam conclusao quando vazios.
- Revisao, conclusao, relatorio imediato, registro mockado, registros recentes
  e relatorio reaberto exibem custos quando informados.
- Os valores ficam isolados no mock app-v2 como `custoPecas` e
  `custoMaoObra`, sem orcamento real, billing ou storage real.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `partsCost` e `laborCost` opcionais.
- `ServiceStepExecution` passou a exibir campos opcionais `Custo de pecas` e
  `Custo de mao de obra`.
- A revisao e a conclusao exibem custos quando informados, sem bloquear o
  fluxo quando vazios.
- `RegistroServico` do app-v2 ganhou `custoPecas` e `custoMaoObra` opcionais
  no mock local.
- Relatorio imediato, relatorio reaberto, registros recentes e busca de
  relatorios preservam custos informados.
- O card de registro recente exibe pecas/custos quando existirem.
- Matriz de paridade atualizada: `Registrar custos` passou de `regressao` para
  `coberto`.
- Proximo checkpoint recomendado: proxima manutencao deve virar campo opcional
  do Registro de Servico no app-v2, conectando-se ao agendamento mockado ja
  existente, sem calendario completo, sem recorrencia avancada e sem storage
  real.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou com 6 testes porque `partsCost`, `laborCost`, `custoPecas`,
  `custoMaoObra` e os inputs `service-parts-cost` e `service-labor-cost` ainda
  nao existiam.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 53 testes.
- `npm run format`: passou.
- Revalidacao focada apos format:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 53 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `npm run format:check`: passou.
- `git diff --check`: passou.

---

## Historico - Pecas usadas

Implementar a proxima lacuna de paridade do Registro de Servico:

> Pecas usadas devem virar campo opcional do Registro de Servico no app-v2, sem
> custos, sem orcamento real e sem storage real.

### Analise resumida

No v1, `pecas` entra no payload e no registro criado, separado de `custoPecas`
e `custoMaoObra`. A capacidade operacional a preservar neste checkpoint e
registrar quais pecas foram usadas no atendimento, sem abrir captura de custo,
orcamento real ou storage real.

No v2 atual, o draft possui tecnico, diagnostico, acoes e status, mas nao tem
campo para pecas. Isso faz o relatorio e o registro mockado perderem uma
informacao operacional que ja existia no v1.

Ha 99% de certeza para implementar esse checkpoint porque a mudanca fica
isolada ao draft, view models, UI da etapa de execucao, registro mockado e
relatorio app-v2. O campo sera opcional e textual, sem custos, sem orcamento,
sem storage real, sem PDF/share e sem WhatsApp real.

### Plano

- Adicionar teste RED no view model para `partsUsed` opcional no draft, revisao
  e conclusao.
- Adicionar teste RED no relatorio imediato e reaberto para exibir pecas usadas.
- Adicionar teste RED na action para gravar `pecas` no registro mockado apenas
  quando houver texto.
- Adicionar teste RED no shell para preencher pecas na etapa de execucao e
  manter o valor na conclusao/relatorio.
- Incluir `partsUsed` no `ServiceDraft`.
- Exibir campo opcional `Pecas usadas` na etapa de execucao.
- Propagar o texto para revisao, conclusao, relatorio imediato, registro
  mockado, registros recentes e relatorio reaberto.
- Atualizar a matriz de paridade para refletir a cobertura de `Registrar pecas`.

### Anti-escopo

- Nao alterar storage real nem schema persistido real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver custos, orcamento real, proxima manutencao, estoque ou cadastro
  de pecas neste checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel`,
  `servicesHomeViewModel`, `servicesReportsViewModel`, `appV2Actions` e
  `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `partsUsed`.
- A etapa de execucao exibe campo opcional para pecas usadas.
- O campo nao bloqueia a conclusao quando vazio.
- Revisao, conclusao, relatorio imediato, registro mockado e relatorio reaberto
  exibem pecas usadas quando informadas.
- O valor fica isolado no mock app-v2 como `pecas` opcional, sem custos e sem
  storage real.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `partsUsed` opcional.
- `ServiceStepExecution` passou a exibir campo opcional `Pecas usadas`.
- A revisao e a conclusao exibem pecas usadas quando informadas, sem bloquear o
  fluxo quando vazio.
- `RegistroServico` do app-v2 ganhou `pecas` opcional no mock local.
- Relatorio imediato, relatorio reaberto, registros recentes e busca de
  relatorios preservam pecas usadas.
- Matriz de paridade atualizada: `Registrar pecas` passou de `regressao` para
  `coberto`.
- Proximo checkpoint recomendado: custos de pecas e mao de obra como campos
  opcionais do Registro de Servico no app-v2, sem orcamento real, sem billing e
  sem storage real.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou com 6 testes porque `partsUsed`, `pecas` e
  `textarea[name="service-parts-used"]` ainda nao existiam.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 47 testes.
- `npm run format`: passou.
- Revalidacao focada apos format:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 47 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.

---

## Historico - Outro customizado

Implementar a proxima lacuna de paridade do Registro de Servico:

> Campo `Outro` deve permitir descricao customizada no Registro de Servico do
> app-v2, sem alterar storage real e sem copiar UI legado.

### Analise resumida

No v1, `normalizeRegistroServiceTypeValue` valida `tipo: "Outro"` com
`tipoCustom`, exige texto nao vazio e limita a descricao customizada a 40
caracteres. O valor persistivel vira `Outro · descricao`.

No v2 atual, o tipo `outro` existe como opcao, mas sem descricao customizada. A
revisao, a conclusao, o relatorio e o historico mostram apenas `Servico`, o que
perde informacao operacional do v1.

Ha 99% de certeza para implementar esse checkpoint porque a mudanca fica
isolada no contrato mockado do app-v2, sem storage real, sem UI legado e sem
alterar rotas, PDF/share, WhatsApp, billing, Supabase ou permissoes.

### Plano

- Adicionar teste RED no view model para `customKind` no draft e label
  `Outro · descricao`.
- Adicionar teste RED no relatorio imediato e reaberto para exibir a descricao
  customizada.
- Adicionar teste RED no shell para selecionar `Outro`, preencher descricao e
  concluir sem perder o label.
- Incluir `customKind` no `ServiceDraft`.
- Exibir campo local de descricao apenas quando `Outro` estiver selecionado.
- Bloquear `Continuar` em `Tipo` quando `Outro` estiver vazio ou acima de 40
  caracteres.
- Persistir a descricao somente no mock app-v2 como `tipoDescricao` opcional do
  registro concluido.
- Atualizar a matriz de paridade para refletir a cobertura desse item.

### Anti-escopo

- Nao alterar storage real nem schema persistido real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver custos, pecas ou proxima manutencao neste checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel`,
  `servicesHomeViewModel`, `servicesReportsViewModel`, `appV2Actions` e
  `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `customKind`.
- Selecionar `Outro` exibe campo de descricao customizada.
- O usuario nao avanca da etapa de tipo com `Outro` vazio ou acima de 40
  caracteres.
- Revisao, conclusao, relatorio imediato, registro mockado e relatorio reaberto
  exibem `Outro · descricao`.
- O tipo base continua `outro`; a descricao customizada fica isolada como dado
  mockado do app-v2.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `customKind`.
- `ServiceStepType` passou a exibir `Descricao do tipo` quando `Outro` e
  selecionado.
- `Continuar` na etapa de tipo fica bloqueado para `Outro` vazio ou acima de 40
  caracteres.
- Revisao, conclusao, relatorio imediato, registro mockado, registros recentes e
  relatorios reabertos exibem `Outro · descricao`.
- `RegistroServico` do app-v2 ganhou `tipoDescricao` opcional para preservar o
  label customizado no mock local.
- Matriz de paridade atualizada: `Validar tipo de servico` passou de `parcial`
  para `coberto`.
- Proximo checkpoint recomendado: pecas usadas devem virar campo opcional do
  Registro de Servico no app-v2, sem custos, sem orcamento real e sem storage
  real.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `customKind`, `tipoDescricao`, label `Outro · descricao` e input
  `service-kind-custom` ainda nao existiam.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 41 testes.
- `npm run format`: passou.
- Revalidacao focada apos format:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 41 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.
- `npm run format:check`: passou dentro de `npm run check`.

---

## Historico - Tecnico como dado operacional

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
