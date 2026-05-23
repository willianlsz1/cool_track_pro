# Worktree, arquitetura app-v2 e prontidao para design

Data: 2026-05-16

## Objetivo

Organizar o worktree atual, excluir apenas o que for comprovadamente
desnecessario, aplicar uma leitura de arquitetura do `src/app-v2/` e decidir se
o projeto ja pode entrar em uma etapa de design.

## Escopo revisado

- Worktree local atual.
- Documentos recentes em `docs/rewrite/`.
- Codigo e testes em `src/app-v2/`.
- Evidencias de QA visual do app-v2 em `docs/rewrite/qa-*`.

## Fora de escopo

- Alterar codigo do app-v2.
- Alterar app legado/v1.
- Refazer PMOC.
- Refazer migrations Supabase.
- Conectar storage real, Supabase/RLS, billing, assinatura, PDF/share,
  WhatsApp, upload/storage, PMOC real ou orcamento real.
- Limpar warnings legados, React Doctor ou bundle/PDF.

## Organizacao do worktree

Nao foi excluido nenhum arquivo.

Motivo: a triagem nao encontrou arquivo descartavel com pelo menos 99% de
certeza. Os itens nao rastreados e alterados se agrupam como trabalho ativo,
artefato de auditoria, documentacao de fase, evidencia de QA visual ou codigo e
teste novo do app-v2.

Classificacao:

| Grupo                                          | Decisao | Motivo                                                                   |
| ---------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `docs/rewrite/*fase-*.md`                      | Manter  | Relatorios de fases recentes e rastreio de decisoes.                     |
| `docs/rewrite/reauditoria-*.md`                | Manter  | Evidencia de reauditoria e recalculo de paridade.                        |
| `docs/rewrite/qa-design-system-ui-*`           | Manter  | Evidencias visuais e metricas citadas pelos relatorios de design system. |
| `docs/rewrite/auditoria-ux-funcional-v1-v2.md` | Manter  | Documento central da auditoria UX funcional.                             |
| `docs/rewrite/matriz-paridade-v1-v2.md`        | Manter  | Matriz viva de paridade v1/v2.                                           |
| `src/app-v2/account/*`                         | Manter  | Area Conta local do app-v2 com view-model e testes.                      |
| `src/app-v2/shell/*Account*.test.tsx`          | Manter  | Cobertura da area Conta no shell do app-v2.                              |
| Alteracoes em `src/app-v2/equipment/*`         | Manter  | Evolucao funcional local de Equipamentos.                                |
| Alteracoes em `src/app-v2/service/*`           | Manter  | Evolucao funcional local de Servicos.                                    |
| Alteracoes em `src/app-v2/data/*`              | Manter  | Store mockada unica e acoes puras do app-v2.                             |

Proxima organizacao recomendada do worktree:

1. Separar um commit documental de auditoria, matriz, fases e evidencias QA.
2. Separar um commit funcional do app-v2 com Conta, Equipamentos, Servicos e
   testes relacionados.
3. Depois dos commits, recalcular a matriz de paridade em uma passada limpa.

## Proximo passo executado: manifesto de split

O worktree ainda nao foi staged nem commitado nesta passada. A organizacao foi
aprofundada como manifesto de split para evitar agrupar mudancas documentais,
evidencias visuais e codigo funcional em um unico checkpoint dificil de revisar.

Split recomendado:

| Checkpoint               | Conteudo                                               | Arquivos/grupos                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A - Auditoria e matriz   | Documentos centrais de paridade v1/v2 e objetivo atual | `docs/app-v2-goal.md`, `docs/rewrite/auditoria-ux-funcional-v1-v2.md`, `docs/rewrite/matriz-paridade-v1-v2.md`, `docs/rewrite/reauditoria-*.md`                 |
| B - Relatorios de fase   | Historico das fases locais executadas                  | `docs/rewrite/configuracoes-conta-fase-*.md`, `docs/rewrite/equipamentos-avancados-fase-*.md`, `docs/rewrite/design-system-ui-fase-*.md`                        |
| C - Evidencias QA visual | Screenshots e metricas usadas pelos relatorios         | `docs/rewrite/qa-design-system-ui-fase-*/*`                                                                                                                     |
| D - Runtime app-v2       | Codigo funcional do app-v2                             | `src/app-v2/account/*`, `src/app-v2/data/*`, `src/app-v2/domain/*`, `src/app-v2/equipment/*`, `src/app-v2/home/*`, `src/app-v2/service/*`, `src/app-v2/shell/*` |

Ordem recomendada:

1. Validar e commitar A+B+C como checkpoint documental/QA.
2. Validar e commitar D como checkpoint funcional.
3. Recalcular matriz e auditoria em commit documental final.

Arquivos que continuam sem autorizacao para exclusao:

- Evidencias PNG/JSON de QA visual, porque documentam responsividade, texto
  longo, empty states e estados especificos.
- Relatorios de fase, porque registram criterios e decisoes de escopo.
- Testes novos do shell e da area Conta, porque fecham comportamento do app-v2.

## Leitura arquitetural do app-v2

Arquivos mais concentrados por linha no app-v2:

| Arquivo                                         | Linhas | Observacao                                        |
| ----------------------------------------------- | -----: | ------------------------------------------------- |
| `src/app-v2/shell/AppV2Shell.test.tsx`          |    828 | Cobertura ampla de shell e fluxos cruzados.       |
| `src/app-v2/data/appV2Flow.test.ts`             |    637 | Cobertura ampla de estado, servicos e fluxo.      |
| `src/app-v2/shell/AppV2Shell.tsx`               |    545 | Orquestracao de abas, estado local e fluxos.      |
| `src/app-v2/equipment/equipmentActions.test.ts` |    505 | Cobertura crescente de Equipamentos.              |
| `src/app-v2/equipment/EquipmentList.tsx`        |    439 | UI de lista, filtros e subfluxos de Equipamentos. |
| `src/app-v2/equipment/equipmentViewModel.ts`    |    419 | View-model com agregacoes de Equipamentos.        |

Nenhum arquivo do app-v2 ultrapassa o limite de 1000 linhas, mas a profundidade
ainda esta irregular: algumas areas ja tem view-model e acoes puras, enquanto o
shell ainda concentra muita coordenacao entre areas.

## Oportunidades de aprofundamento

1. Shell do app-v2

- Module: `src/app-v2/shell/AppV2Shell.tsx`.
- Interface: hoje e implicitamente formada por props de telas, callbacks e
  `useState` locais.
- Implementation: mistura selecao de abas, selecao de entidades, abertura de
  fluxos, edicao de servico, criacao de equipamento e preferencias locais.
- Depth: media; entrega comportamento, mas ainda e mais coordenador procedural
  do que modulo profundo.
- Seam: extrair coordenacao por area sem mudar rotas, selectors ou contratos
  publicos.
- Adapter: futuros controladores locais por area podem adaptar store mockada
  para telas sem expor a forma interna do shell.
- Leverage: reduz risco antes de design, porque mudancas visuais nao precisariam
  atravessar tantos callbacks cruzados.
- Locality: melhora ao aproximar estado e handlers da area que os consome.

2. Equipamentos avancados

- Module: `src/app-v2/equipment/*`.
- Interface: componentes `EquipmentList`, `EquipmentDetail`, `ClientList`,
  `ClientDetail`, view-models e acoes puras.
- Implementation: ja ha separacao razoavel entre view-model, actions e UI, mas
  filtros, setores, clientes, arquivamento, anexos e inicio de servico ainda
  espalham decisao entre lista, detalhe, shell e store.
- Depth: media-alta nas acoes puras; media na composicao de tela.
- Seam: consolidar a area como "base instalada local" antes de design pesado.
- Adapter: manter adaptador local de mock/store, sem storage real.
- Leverage: design de Equipamentos fica mais previsivel se a area tiver um
  ponto unico para subvisoes e decisoes de disponibilidade.
- Locality: melhoraria colocando regras de disponibilidade, filtros e resumo de
  cliente mais perto dos view-models.

3. Servicos, registros, relatorios e orcamentos locais

- Module: `src/app-v2/service/*` e `src/app-v2/data/appV2Actions.ts`.
- Interface: `ServicesHome`, subvisoes, view-models de registros, relatorios,
  orcamentos e fluxo de atendimento.
- Implementation: a area ja esta dividida por subvisao, mas `ServicesHome`
  ainda escolhe subview, mantem filtros e encaminha callbacks de edicao e
  orcamento.
- Depth: boa nos view-models; media no modulo de composicao.
- Seam: transformar a navegacao interna de Servicos em fronteira estavel antes
  de refinamento visual.
- Adapter: manter dados mockados locais e bloquear orcamento real/PDF/share.
- Leverage: evita que a etapa de design acople layout a detalhes de estado e
  filtro.
- Locality: melhora ao deixar cada subvisao carregar sua propria coordenacao
  local.

4. Acoes e store mockada unica

- Module: `src/app-v2/data/appV2Actions.ts` e `appV2MockStore.ts`.
- Interface: funcoes puras como completar servico, editar registro, gerar
  orcamento local e atualizar draft.
- Implementation: cumpre o contrato de store mockada unica, mas cresce como
  catalogo de transicoes heterogeneas.
- Depth: boa para a fase atual, porque centraliza regra pura e teste.
- Seam: agrupar transicoes por dominio quando a area passar de mock local para
  adaptador planejado.
- Adapter: sera necessario antes de qualquer Supabase/RLS/migrations.
- Leverage: alto, pois reduz duplicacao entre telas e futuros adaptadores.
- Locality: hoje e parcialmente centralizada; pode melhorar sem mudar schemas.

5. Testes de fluxo e shell

- Module: `AppV2Shell.test.tsx`, `appV2Flow.test.ts` e testes por area.
- Interface: testes validam comportamento por UI e por funcoes puras.
- Implementation: cobertura e boa, mas os testes maiores acumulam muitos
  contratos de areas diferentes.
- Depth: alta como rede de seguranca; media como documentacao local por area.
- Seam: criar harnesses por area quando houver proxima alteracao funcional.
- Adapter: testes devem continuar passando por store mockada, sem storage real.
- Leverage: reduz custo de regressao antes de design responsivo amplo.
- Locality: melhora quando cada area prova seus fluxos sem depender sempre do
  shell inteiro.

## Aprofundamento escolhido: Shell do app-v2

O primeiro candidato a aprofundar e o Shell do app-v2. Ele tem o maior ganho
antes de design porque e o ponto onde abas, selecao de entidades, fluxo de
servico, criacao de equipamento, Conta e navegacao interna se encontram.

Arquivos envolvidos:

- `src/app-v2/shell/AppV2Shell.tsx`
- `src/app-v2/shell/AppV2Shell.test.tsx`
- `src/app-v2/shell/AppV2ShellAccount.test.tsx`
- `src/app-v2/shell/AppV2ShellEquipmentAttachments.test.tsx`
- `src/app-v2/data/appV2Actions.ts`
- `src/app-v2/data/appV2Selectors.ts`
- `src/app-v2/equipment/*`
- `src/app-v2/service/*`
- `src/app-v2/account/*`

Problema:

- Module: `AppV2Shell` e um Module funcional, mas ainda raso para a quantidade
  de comportamento que concentra.
- Interface: telas chamadoras precisam conhecer muitos callbacks especificos
  de navegacao, selecao, edicao, salvamento e abertura de fluxo.
- Implementation: o arquivo mistura coordenacao de abas, estado visual,
  transicoes da store mockada, callbacks de area e retorno de mensagens de erro.
- Depth: media. O Module entrega valor, mas sua Interface cresce quase junto
  com a Implementation.
- Seam: a Seam real ainda esta dentro do proprio Shell, nao em um Module por
  area.
- Adapter: nao ha Adapter novo a criar agora; a store mockada segue como Adapter
  local unico para esta fase.
- Leverage: aprofundar o Shell reduz o custo de mexer em design porque cada
  tela receberia menos callbacks cruzados.
- Locality: bugs de navegacao e estado ficariam concentrados por area, em vez
  de espalhados no Shell principal.

Delecao test:

- Se `AppV2Shell` fosse deletado hoje, a complexidade reapareceria em varias
  telas: Home, Equipamentos, Servicos e Conta.
- Portanto o Module e necessario, mas precisa ficar mais profundo: manter a
  orquestracao principal e mover decisoes repetidas por area para Modules mais
  locais.

Plano arquitetural recomendado para a proxima etapa:

1. Criar uma etapa documental curta chamada `shell-orchestration-app-v2`.
2. Mapear callbacks do Shell por area sem alterar codigo.
3. Separar candidatos de extração por menor risco:
   - navegacao de Conta;
   - selecao e abertura de Equipamentos/Clientes;
   - abertura e fechamento de fluxo de Servicos;
   - salvamentos que preservam `serviceDraft`.
4. Implementar no maximo um recorte por checkpoint, com testes focados antes e
   depois.
5. Nao alterar rotas, selectors, schemas, store real, Supabase, PMOC,
   PDF/share, billing ou integracoes reais.

Criterio de pronto para essa etapa:

- `AppV2Shell.tsx` manter comportamento atual.
- Testes existentes do shell passarem sem relaxamento.
- Nenhum contrato publico legado ser tocado.
- Nenhuma dependencia nova.
- Nenhum arquivo passar de 1000 linhas.

Decisao:

Ainda nao ha 99% de certeza para uma refatoracao direta nesta passada porque o
worktree funcional ja esta grande e nao commitado. O proximo passo seguro e
fechar o split documental/funcional e so entao executar um recorte pequeno de
`shell-orchestration-app-v2`.

## Execucao: shell-orchestration-app-v2

Recorte executado no app-v2:

- Criado o Module `src/app-v2/shell/appV2ShellState.ts`.
- Criado o teste `src/app-v2/shell/appV2ShellState.test.ts`.
- `AppV2Shell.tsx` deixou de conter helpers puros de:
  - geracao de ids locais de Equipamento, Cliente e Setor;
  - fechamento de `ServiceDraft`;
  - preservacao de `serviceDraft` ativo ao aplicar snapshots locais.

Resultado arquitetural:

- Module: `appV2ShellState`.
- Interface: funcoes pequenas para transicoes puras do Shell.
- Implementation: ids locais, conclusao de servico e merge de snapshot com
  draft ativo ficam fora da renderizacao.
- Depth: aumentou porque o Shell recebe comportamento operacional por uma
  Interface menor.
- Seam: o estado local do Shell agora tem uma Seam testavel sem renderizar UI.
- Adapter: a store mockada unica continua sendo o Adapter local da etapa.
- Leverage: alteracoes visuais futuras podem mexer no layout do Shell sem
  arrastar os detalhes de transicao de estado.
- Locality: bugs de id local, fechamento de servico e preservacao de draft
  ficam concentrados em um Module testavel.

Feedback loop `diagnose` usado:

- Loop antes do recorte:
  `npm run test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellAccount.test.tsx src/app-v2/shell/AppV2ShellEquipmentAttachments.test.tsx src/app-v2/data/appV2Flow.test.ts`
  passou com 69 testes.
- Loop depois do recorte:
  `npm run test -- src/app-v2/shell/appV2ShellState.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellAccount.test.tsx src/app-v2/shell/AppV2ShellEquipmentAttachments.test.tsx src/app-v2/data/appV2Flow.test.ts`
  passou com 72 testes.

Linha de base apos o recorte:

| Arquivo                                    | Linhas |
| ------------------------------------------ | -----: |
| `src/app-v2/shell/AppV2Shell.tsx`          |    477 |
| `src/app-v2/shell/appV2ShellState.ts`      |     55 |
| `src/app-v2/shell/appV2ShellState.test.ts` |     41 |

Varredura sensivel do app-v2:

- Nao foram encontrados imports de `src/ui`, `src/core`, `redesign.css`,
  Supabase ou storage real em `src/app-v2/`.
- Ocorrencias de PMOC, PDF e WhatsApp em `src/app-v2/` aparecem como testes de
  ausencia ou textos de nao integracao real.
- PMOC e pricing nao sao bloqueadores para design do app-v2 nesta etapa, porque
  serao refeitos em etapas proprias e nao fazem parte da arquitetura atual do
  nucleo app-v2.

Analise de melhoria remanescente:

- Equipamentos, Servicos, Conta e Home ja possuem Modules por area, view-models
  e testes focados suficientes para iniciar design sem refatoracao
  bloqueante.
- `EquipmentList.tsx`, `ServicesHome.tsx` e `ServicesQuotesHome.tsx` ainda
  podem ser refinados depois por localidade de UI, mas isso e melhoria
  incremental, nao bloqueio arquitetural para design.
- Os testes maiores (`AppV2Shell.test.tsx` e `appV2Flow.test.ts`) continuam
  grandes, mas funcionam como rede de seguranca de migracao. Dividi-los agora
  nao agrega o mesmo Leverage que estabilizar design.

## Decisao sobre design

Nao recomendo entrar ainda em design visual amplo como etapa principal.

Podemos entrar em uma etapa preparatoria de design, focada em regras, criterios,
inventario visual e backlog de componentes, mas a etapa de design de produto
deve esperar tres fechamentos:

1. Worktree atual separado em commits coesos.
2. Matriz de paridade v1/v2 recalculada depois da organizacao.
3. Pelo menos uma rodada curta de aprofundamento arquitetural nos pontos Shell,
   Servicos e Equipamentos, sem tocar em PMOC, Supabase, migrations, billing,
   PDF/share ou integracoes reais.

Conclusao atualizada apos `shell-orchestration-app-v2`: nao ha bloqueador
arquitetural restante no app-v2 para iniciar a etapa de design. O design pode
comecar como etapa propria, mantendo fora do escopo PMOC real, pricing real,
Supabase/RLS/migrations, billing, PDF/share, WhatsApp real e storage real.
