# Fortalecimento app-v2 - Status

## Checkpoint 6A - Alinhamento da fundacao e criterio de 100%

Status: executado como checkpoint documental.

Data: 2026-05-11.

Escopo executado:

- leitura de `AGENTS.md`;
- leitura de `CONTEXT.md`;
- leitura de `docs/rewrite`;
- leitura seletiva de `src/app-v2` para entender estado atual;
- criacao deste documento de acompanhamento.

Escopo nao executado:

- nenhuma mudanca funcional;
- nenhuma mudanca de UI;
- nenhuma mudanca de CSS/tokens;
- nenhuma mudanca em testes;
- nenhuma mudanca em configs;
- nenhuma mudanca em `package.json` ou `package-lock.json`;
- nenhuma mudanca no app legado;
- nenhuma integracao com Supabase, storage real, PDF/share, WhatsApp, billing, PMOC, assinatura ou orcamento real.

## 1. Criterio de 100%

### Fato documentado

`docs/rewrite/etapa-6-fundacao-fluxo-dados-plano.md` define que o fortalecimento do `app-v2` so deve ser considerado 100% quando:

1. Home Hoje, Equipamentos, Registro de Servico e Central de Servicos usam contratos de dominio compartilhados.
2. Todas essas areas leem de uma store mockada unica.
3. Fluxos principais sao executados por acoes puras testadas.
4. Estado operacional e derivado de uma unica fonte de dados.
5. Testes cobrem fluxos completos sem depender de UI.
6. Validacoes seguem verdes, aceitando apenas warnings conhecidos ja documentados.

`AGENTS.md` tambem exige que o rewrite preserve isolamento do `app-v2`, nao importe CSS legado e trate storage, Supabase, billing, PDF/share, WhatsApp, upload/storage, assinatura e PMOC como areas de etapa propria.

### Inferencia

O criterio de 100% e tecnico, nao visual. Ele mede confiabilidade de fundacao: contratos, dados, acoes, estado derivado e testes. Como este checkpoint nao implementa nada funcional, ele melhora governanca e clareza, mas nao aumenta o percentual tecnico.

### Decisao pendente

Nenhuma decisao humana e obrigatoria para manter o criterio de 100% atual. A proxima decisao humana so sera necessaria se, durante a auditoria de contratos, surgir campo que possa ser dominio real ou apenas necessidade de tela.

### Risco

Chamar o app-v2 de 100% antes da store mockada unica e dos testes de fluxo completo recriaria o problema do legado: telas aparentemente prontas, mas com verdades divergentes por area.

### Proxima acao recomendada

Executar o Checkpoint 6B: auditoria de contratos do `app-v2`, ainda sem alterar UI.

## 2. Divergencia Tailwind vs CSS/tokens proprios

### Fato documentado

`CONTEXT.md`, `AGENTS.md`, `docs/rewrite/etapa-0-plano-mestre.md`, `docs/rewrite/etapa-0-stack-e-regras-agentes.md` e os planos das etapas 1 a 6 registram a stack do app-v2 como React, TypeScript, Tailwind CSS com prefixo `tw-` e Vite.

`docs/rewrite/etapa-0-stack-e-regras-agentes.md` tambem determina que, quando Tailwind for usado, agentes devem criar tokens/constantes de design antes de espalhar classes.

No codigo atual, `src/app-v2/styles/tokens.ts` exporta tokens como `appV2Tone`, mas esses tokens contem classes Tailwind com prefixo `tw-`. Componentes do `app-v2` tambem usam classes `tw-` diretamente.

### Inferencia

A formulacao "CSS/tokens proprios sem Tailwind por enquanto" nao e a fonte normativa atual do repo. O estado real e: **Tailwind com prefixo `tw-`, mediado por tokens proprios quando fizer sentido**.

### Decisao pendente

Nao ha decisao pendente se a intencao for seguir os documentos atuais. Se a intencao mudar para "sem Tailwind", isso exige nova etapa propria porque afetaria stack, componentes, validacao visual e possivelmente a estrategia de tokens.

### Risco

Tratar tokens como substituto de Tailwind agora causaria retrabalho e poderia quebrar a regra documentada de `tw-`. Tratar Tailwind como liberado sem tokens tambem aumenta duplicacao visual.

### Proxima acao recomendada

Manter a decisao atual: Tailwind `tw-` continua permitido e os tokens proprios continuam como camada de organizacao. A Etapa 6 nao deve alterar CSS, tokens ou estrategia visual.

## 3. Estado atual observado no app-v2

### Fato documentado

Arquivos observados:

- `src/app-v2/domain/types.ts`;
- `src/app-v2/domain/homePriority.ts`;
- `src/app-v2/home/homeViewModel.ts`;
- `src/app-v2/equipment/equipmentViewModel.ts`;
- `src/app-v2/service/serviceFlowViewModel.ts`;
- `src/app-v2/service/servicesHomeViewModel.ts`;
- `src/app-v2/home/mockHomeData.ts`;
- `src/app-v2/equipment/mockEquipmentData.ts`;
- `src/app-v2/service/mockServiceData.ts`;
- `src/app-v2/shell/AppV2Shell.tsx`;
- `src/app-v2/styles/tokens.ts`.

O app-v2 possui:

- tipos centrais para Cliente, Equipamento, CompromissoServico, RegistroServico e Orcamento;
- Home Hoje com prioridade pura via `pickNextHomeAction`;
- Equipamentos com view model de lista e detalhe;
- Registro de Servico com `ServiceDraft` e view models de contexto, tipo, revisao e conclusao;
- Central de Servicos com servico em andamento, registros recentes e saidas futuras mockadas;
- mocks por area;
- `mockServiceData.ts` derivando dados de `mockEquipmentData.ts`;
- `AppV2Shell` mantendo estado local de aba, equipamento selecionado, draft de servico e abertura do fluxo.

### Inferencia

A fundacao ja prova o fluxo basico, mas ainda nao tem uma unica fonte de verdade. Home e Equipamentos ainda podem divergir porque `mockHomeData.ts` e `mockEquipmentData.ts` sao independentes. Servicos ja reaproveita os mocks de Equipamentos, mas isso ainda nao e uma store mockada unica nem uma arquitetura de dados clara.

As acoes de fluxo ainda estao parcialmente no shell React: selecionar aba, abrir equipamento, iniciar servico e retomar servico. Isso funciona para prototipo, mas nao e 100% fortalecido porque nao pode ser testado como jornada pura sem renderizacao.

### Decisao pendente

Durante o proximo checkpoint, sera preciso decidir se `ServiceDraft` continua em `serviceFlowViewModel.ts` ou se vira contrato de estado operacional em `src/app-v2/data`. A recomendacao inicial e nao promover para dominio ainda, porque draft e estado de fluxo, nao entidade de negocio persistida.

### Risco

Promover cedo demais estados de UI para dominio pode engessar o app. Manter tudo no shell por tempo demais torna o fluxo dificil de testar.

### Proxima acao recomendada

Fazer auditoria de contratos antes de criar `src/app-v2/data`, listando campo por campo o que e dominio, view model, estado de fluxo ou mock.

## 4. Checkpoints tecnicos restantes ate 100%

### Fato documentado

`docs/rewrite/etapa-6-fundacao-fluxo-dados-plano.md` ja lista checkpoints de contrato, store mockada, acoes puras, estado operacional, testes de fluxo completo e validacao final.

### Inferencia

Para reduzir risco, os checkpoints devem ser executados nesta ordem:

1. **6B - Auditoria de contratos:** mapear campos usados por Home, Equipamentos, Registro e Servicos.
2. **6C - Store mockada unica:** criar seed unico e fazer mocks por area derivarem dele.
3. **6D - Acoes puras de fluxo:** iniciar servico, concluir servico e agendar compromisso sem React.
4. **6E - Estado operacional unico:** derivar Home, Equipamentos e Servicos da mesma fonte.
5. **6F - Testes de fluxo completo:** cobrir jornadas reais do tecnico sem UI.
6. **6G - Validacao final:** format, typecheck, testes focados, build, check e diff.

### Decisao pendente

Nenhuma decisao humana e obrigatoria para iniciar 6B. Decisao humana pode ser obrigatoria em 6C se houver conflito entre preservar dados mockados atuais ou limpar cenarios para uma fixture menor.

### Risco

Criar a store antes da auditoria pode cristalizar campos errados. Criar acoes antes da store pode duplicar formato de dados.

### Proxima acao recomendada

Executar somente 6B primeiro, com saida documental e, se necessario, uma proposta conservadora de alteracao em `domain/types.ts` para aprovacao antes de codigo.

## 5. Percentual atual

### Fato documentado

A Etapa 6 foi registrada com percentual inicial de 60%.

### Inferencia

O percentual tecnico atual permanece **60%**. Este checkpoint alinhou criterio, divergencia de stack e sequencia, mas nao implementou store unica, acoes puras, estado operacional unico ou testes de fluxo completo.

Distribuicao sugerida do percentual:

- 15% contratos de dominio iniciais: parcialmente concluido;
- 15% telas principais usando view models testados: parcialmente concluido;
- 15% fluxo de servico basico em memoria: parcialmente concluido;
- 15% documentacao e criterio de fortalecimento: concluido neste checkpoint;
- 15% store mockada unica: pendente;
- 15% acoes puras e estado operacional unico: pendente;
- 10% testes de fluxo completo e validacao final: pendente.

### Decisao pendente

Nenhuma. A recomendacao e manter 60% ate existir mudanca funcional validada.

### Risco

Subir percentual por documentacao pode mascarar a lacuna tecnica real.

### Proxima acao recomendada

Manter status em 60% e reavaliar apos 6B. Se 6B for apenas documental, o percentual provavelmente continua 60%. Se 6B ajustar contratos com testes verdes, pode subir para 65%.

## 6. Registro de decisoes do checkpoint

### Fato documentado

O app-v2 continua isolado e sem integracao real com legado, storage, Supabase, PDF/share, WhatsApp, billing, PMOC, assinatura ou orcamento real.

### Inferencia

O fortalecimento deve focar primeiro na consistencia interna do app-v2, nao em integracoes.

### Decisoes

1. O criterio de 100% fica mantido como criterio tecnico de fundacao, nao criterio visual.
2. Tailwind com prefixo `tw-` continua sendo a stack normativa.
3. Tokens proprios continuam validos como camada de organizacao sobre Tailwind.
4. "CSS/tokens proprios sem Tailwind por enquanto" fica registrado como leitura nao normativa para o estado atual.
5. A proxima etapa executavel e 6B - Auditoria de contratos.

### Riscos

- divergencia de mock por area;
- estado de fluxo ainda acoplado ao shell React;
- risco de promover view model para dominio cedo demais;
- risco de reabrir decisao de stack durante uma etapa que deve ser apenas fundacao de dados.

### Proxima acao recomendada

Executar 6B sem alterar UI: produzir matriz de campos por area, classificar cada campo como dominio, estado de fluxo, view model ou mock, e so entao propor qualquer mudanca de codigo.

## Checkpoint 6B - Auditoria de contratos

Status: executado como checkpoint documental.

Data: 2026-05-11.

Escopo executado:

- leitura seletiva dos tipos em `src/app-v2/domain/types.ts`;
- leitura seletiva dos view models de Home, Equipamentos, Registro de Servico e Central de Servicos;
- leitura seletiva dos mocks por area;
- classificacao dos campos atuais por responsabilidade.

Escopo nao executado:

- nenhuma mudanca em `src/app-v2/domain/types.ts`;
- nenhuma mudanca funcional;
- nenhuma mudanca em UI, CSS/tokens, testes, configs, app legado ou dependencias.

### Matriz de contratos

| Campo ou tipo                             | Uso atual                                      | Classificacao               | Decisao 6B                                                   |
| ----------------------------------------- | ---------------------------------------------- | --------------------------- | ------------------------------------------------------------ |
| `Cliente.id`                              | vinculo por `clienteId`                        | Dominio                     | Manter compartilhado                                         |
| `Cliente.nome`                            | linhas de cliente/local                        | Dominio                     | Manter compartilhado                                         |
| `Cliente.razaoSocial`                     | contrato futuro                                | Dominio opcional            | Manter opcional                                              |
| `Cliente.documento`                       | contrato futuro                                | Dominio opcional sensivel   | Manter opcional; nao usar em mock sem necessidade            |
| `Cliente.contato`                         | detalhe do equipamento                         | Dominio opcional            | Manter compartilhado                                         |
| `Cliente.endereco`                        | detalhe do equipamento                         | Dominio opcional            | Manter compartilhado                                         |
| `Equipamento.id`                          | chave de fluxo                                 | Dominio                     | Manter compartilhado                                         |
| `Equipamento.nome`                        | Home, lista, detalhe e Servicos                | Dominio                     | Manter compartilhado                                         |
| `Equipamento.local`                       | contexto operacional                           | Dominio                     | Manter compartilhado                                         |
| `Equipamento.status`                      | prioridade e status visual                     | Dominio                     | Manter compartilhado                                         |
| `Equipamento.clienteId`                   | vinculo equipamento-cliente                    | Dominio                     | Manter compartilhado                                         |
| `Equipamento.tag`                         | metadado tecnico                               | Dominio opcional            | Manter opcional                                              |
| `Equipamento.tipo`                        | contexto tecnico                               | Dominio opcional            | Manter opcional                                              |
| `Equipamento.criticidade`                 | filtros e prioridade de equipamento            | Dominio                     | Manter compartilhado                                         |
| `Equipamento.prioridadeOperacional`       | prioridade de atendimento                      | Dominio                     | Manter compartilhado                                         |
| `Equipamento.periodicidadePreventivaDias` | periodicidade futura                           | Dominio opcional            | Manter opcional                                              |
| `Equipamento.createdAt`                   | detectar equipamento novo sem primeiro servico | Dominio tecnico             | Manter opcional; pode ser usado em testes de fluxo           |
| `CompromissoServico.id`                   | chave de agenda                                | Dominio                     | Manter compartilhado                                         |
| `CompromissoServico.equipamentoId`        | vinculo com equipamento                        | Dominio                     | Manter compartilhado                                         |
| `CompromissoServico.tipo`                 | preventiva/corretiva                           | Dominio                     | Manter compartilhado                                         |
| `CompromissoServico.status`               | agenda ativa/concluida                         | Dominio                     | Manter compartilhado                                         |
| `CompromissoServico.dataAlvo`             | prioridade da Home                             | Dominio                     | Manter compartilhado                                         |
| `CompromissoServico.prioridade`           | ordenacao futura                               | Dominio opcional            | Manter opcional                                              |
| `CompromissoServico.origem`               | manual/registro/periodicidade                  | Dominio                     | Manter compartilhado                                         |
| `RegistroServico.id`                      | chave de historico                             | Dominio                     | Manter compartilhado                                         |
| `RegistroServico.equipamentoId`           | vinculo com equipamento                        | Dominio                     | Manter compartilhado                                         |
| `RegistroServico.data`                    | ordenacao de historico                         | Dominio                     | Manter compartilhado                                         |
| `RegistroServico.tipo`                    | classificacao do servico                       | Dominio                     | Manter compartilhado                                         |
| `RegistroServico.status`                  | status final do equipamento                    | Dominio                     | Manter compartilhado                                         |
| `RegistroServico.tecnico`                 | autoria operacional                            | Dominio                     | Manter compartilhado                                         |
| `RegistroServico.observacoes`             | resumo tecnico simples                         | Dominio opcional            | Manter opcional                                              |
| `RegistroServico.proximaData`             | sugestao mockada de proximo compromisso        | Dominio opcional temporario | Manter por enquanto; revisar quando houver agenda real       |
| `Orcamento`                               | contrato inicial sem uso real                  | Dominio futuro              | Manter sem implementar orcamento real                        |
| `ServiceDraft`                            | estado de registro em andamento                | Estado de fluxo             | Nao promover para dominio persistido agora                   |
| `HomeTodayViewModel`                      | dados prontos para render                      | View model                  | Nao promover para dominio                                    |
| `EquipmentListViewModel`                  | dados prontos para lista                       | View model                  | Nao promover para dominio                                    |
| `EquipmentDetailViewModel`                | dados prontos para detalhe                     | View model                  | Nao promover para dominio                                    |
| `ServicesHomeViewModel`                   | dados prontos para Central de Servicos         | View model                  | Nao promover para dominio                                    |
| `ServiceOutputStatus`                     | saida futura mockada                           | View model / fluxo futuro   | Manter local ate existir etapa de relatorio/orcamento/agenda |

### Fato documentado

Os tipos centrais atuais ja cobrem as entidades minimas do fluxo tecnico principal. Os view models usam esses contratos sem importar UI ou CSS. Os mocks por area, porem, ainda podem divergir porque Home tem dados proprios e Equipamentos/Servicos compartilham outro conjunto.

### Inferencia

Nao ha necessidade de alterar `domain/types.ts` no 6B. A lacuna principal nao e campo faltante; e fonte de dados duplicada e acoes de fluxo ainda acopladas ao shell React.

### Decisao pendente

`RegistroServico.proximaData` esta servindo como atalho para "proximo compromisso sugerido". Ele pode continuar no mock por enquanto, mas deve ser revisado em etapa propria quando agenda real existir. Nao bloqueia 6C.

### Risco

Se `ServiceOutputStatus` for promovido agora para dominio, podemos confundir saida visual mockada com contrato real de PDF, orcamento ou agenda.

### Proxima acao recomendada

Executar 6C: criar store mockada unica e fazer os mocks por area derivarem dela, preservando os dados atuais e sem alterar UI visual.

### Percentual recalculado

Percentual tecnico apos 6B: **62%**.

Justificativa: a auditoria confirmou que os contratos atuais sao suficientes para avancar sem mudanca especulativa em dominio. O percentual ainda sobe pouco porque nenhuma lacuna funcional foi fechada em codigo.

## Checkpoint 6C - Store mockada unica

Status: executado.

Data: 2026-05-11.

Escopo executado:

- criacao de `src/app-v2/data/appV2MockData.ts`;
- criacao de `src/app-v2/data/appV2MockStore.ts`;
- criacao de teste focado `src/app-v2/data/appV2MockStore.test.ts`;
- mocks de Home, Equipamentos e Servicos passaram a derivar da mesma fonte;
- `AppV2Shell` passou a montar o input a partir de snapshot da store mockada.

Escopo nao executado:

- nenhuma persistencia real;
- nenhum `localStorage`;
- nenhuma integracao com legado;
- nenhuma mudanca visual;
- nenhuma acao real de PDF/share, WhatsApp, billing, PMOC, assinatura ou orcamento.

### Fato documentado

`appV2MockData` concentra `today`, clientes, equipamentos, compromissos, registros e orcamentos mockados. Os arquivos `mockHomeData.ts`, `mockEquipmentData.ts` e `mockServiceData.ts` preservam seus exports atuais, mas agora apontam para a mesma fonte mockada.

### Inferencia

A principal divergencia entre mocks por area foi reduzida. Ainda nao existe fluxo puro de escrita; por enquanto a store e uma fonte de seed/snapshot em memoria para fortalecer leitura e testes.

### Decisao pendente

Nenhuma decisao humana obrigatoria. A store mockada deve continuar explicitamente mockada e nao deve virar storage real por acidente.

### Risco

Como os mocks agora compartilham a mesma fonte, uma alteracao futura no seed pode afetar todas as areas ao mesmo tempo. Isso e desejado para consistencia, mas exige testes focados.

### Proxima acao recomendada

Executar 6D: criar acoes puras de fluxo em `src/app-v2/data/appV2Actions.ts`, com testes red/green antes de adaptar qualquer uso.

### Percentual recalculado

Percentual tecnico apos 6C: **70%**.

Justificativa: a store mockada unica removeu a maior fonte de divergencia entre Home, Equipamentos e Servicos, com testes focados e typecheck verdes.

## Checkpoint 6D - Acoes puras de fluxo

Status: executado.

Data: 2026-05-11.

Escopo executado:

- criacao de `src/app-v2/data/appV2Actions.ts`;
- extensao de `src/app-v2/data/appV2Flow.test.ts`;
- acao pura para iniciar servico por equipamento;
- acao pura para iniciar servico por compromisso explicito;
- acao pura para concluir servico e adicionar registro recente;
- acao pura para agendar proximo compromisso mockado;
- `AppV2Shell` passou a usar a acao pura de iniciar servico.

Escopo nao executado:

- nenhuma persistencia real;
- nenhuma mudanca visual;
- nenhuma assinatura;
- nenhum relatorio real;
- nenhum WhatsApp real;
- nenhum orcamento real.

### Fato documentado

As acoes de fluxo operam sobre snapshots em memoria e retornam novos objetos. O fluxo de conclusao cria um `RegistroServico`, atualiza o compromisso vinculado para `concluido`, atualiza o status do equipamento e limpa o draft.

### Inferencia

O fluxo principal comeca a sair do shell React e passa a ser testavel sem renderizacao. Ainda falta um seletor unico para garantir que Home, Equipamentos e Servicos leiam o mesmo estado derivado.

### Decisao pendente

Nenhuma decisao humana obrigatoria. `ServiceDraft` segue como estado de fluxo importado do modulo de servico; se esse acoplamento crescer, uma etapa futura pode mover o tipo para `data`, mas isso nao e necessario agora.

### Risco

`appV2Actions.ts` ainda pode crescer se tentar antecipar storage real. O limite atual deve continuar sendo fluxo mockado em memoria.

### Proxima acao recomendada

Executar 6E: criar seletores de estado operacional unico e adaptar chamadas para consumir estado derivado quando isso reduzir divergencia sem alterar UI.

### Percentual recalculado

Percentual tecnico apos 6D: **80%**.

Justificativa: fluxos principais agora existem como acoes puras testadas, mas o estado operacional unificado e os testes de jornada completa ainda nao estao fechados.

## Checkpoint 6E - Estado operacional unico

Status: executado.

Data: 2026-05-11.

Escopo executado:

- criacao de `src/app-v2/data/appV2Selectors.ts`;
- seletores para Home Hoje, Equipamentos, Registro de Servico e Central de Servicos;
- seletor `selectAppV2OperationalState` com proxima acao, draft em andamento e ultimo registro;
- `AppV2Shell` passou a derivar inputs de Servico e Central via seletores.

Escopo nao executado:

- nenhuma mudanca visual;
- nenhuma rota real;
- nenhuma persistencia;
- nenhuma integracao externa.

### Fato documentado

Os seletores operam sobre o mesmo snapshot mockado e retornam inputs estruturais para os view models existentes. O shell usa esses seletores para evitar montar manualmente formatos diferentes.

### Inferencia

Home, Equipamentos, Registro e Servicos agora podem ser alimentados por um estado operacional comum. Ainda faltam testes que simulem jornadas completas do tecnico usando essas acoes e seletores em sequencia.

### Decisao pendente

Nenhuma decisao humana obrigatoria.

### Risco

Os componentes `HomeToday`, `EquipmentList` e `EquipmentDetail` ainda importam mocks por compatibilidade interna. Como esses mocks ja derivam da store unica, o risco e controlado, mas uma etapa futura pode receber dados por props para reduzir dependencia global de mock.

### Proxima acao recomendada

Executar 6F: completar testes de fluxo ponta a ponta sem UI, cobrindo equipamento sem primeiro servico, inicio, conclusao, saida futura e compromisso agendado.

### Percentual recalculado

Percentual tecnico apos 6E: **90%**.

Justificativa: a fundacao agora tem store unica, acoes puras e estado operacional derivado. O restante e cobertura de jornada completa e validacao final.

## Checkpoint 6F - Testes de fluxo completo

Status: executado.

Data: 2026-05-11.

Escopo executado:

- extensao de `src/app-v2/data/appV2Flow.test.ts`;
- cobertura da jornada equipamento primeiro sem UI;
- acao pura `registerEquipment` para cadastrar equipamento no snapshot mockado;
- teste de equipamento recem-cadastrado sem primeiro servico aparecendo como proxima acao;
- teste de inicio e conclusao de servico a partir do equipamento;
- teste de saida operacional `orcamento_sugerido` na Central de Servicos;
- teste de compromisso agendado voltando para Home Hoje como proxima acao.

Escopo nao executado:

- nenhuma mudanca visual;
- nenhum formulario real de cadastro;
- nenhum orcamento real;
- nenhuma agenda real;
- nenhuma persistencia;
- nenhuma integracao externa.

### Fato documentado

O fluxo equipamento -> servico -> registro -> central agora e testado sem renderizacao. A jornada usa a store mockada unica, as acoes puras e os seletores operacionais para provar que o estado gerado por uma area e consumido por outra.

### Inferencia

A fundacao logica do app-v2 esta pronta para sustentar prototipos de tela sem recriar regra dentro dos componentes. O restante para 100% e validacao completa e registro final.

### Decisao pendente

Nenhuma decisao humana obrigatoria.

### Risco

`registerEquipment` e intencionalmente mockado. Ele nao deve ser tratado como contrato de storage, formulario final ou persistencia real.

### Proxima acao recomendada

Executar 6G: formatar, rodar typecheck, testes focados, build, check e `git diff --check`; depois fechar o percentual em 100% ou registrar bloqueio objetivo.

### Percentual recalculado

Percentual tecnico apos 6F: **97%**.

Justificativa: contratos, store mockada, acoes puras, seletores e jornada completa estao cobertos. Falta apenas validacao final do conjunto e atualizacao de fechamento.

## Checkpoint 6G - Validacao final e fechamento

Status: executado.

Data: 2026-05-11.

Escopo executado:

- formatacao do repositorio;
- typecheck;
- testes focados do app-v2;
- build de producao;
- check completo do repositorio;
- validacao de whitespace com `git diff --check`;
- recalculo final do percentual de fortalecimento.

Escopo nao executado:

- nenhuma mudanca visual;
- nenhuma integracao real;
- nenhum app legado alterado por objetivo funcional;
- nenhum storage real;
- nenhum PDF/share;
- nenhum WhatsApp;
- nenhum billing;
- nenhuma assinatura;
- nenhum orcamento real.

### Fato documentado

Comandos executados e resultado:

- `npm run format`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2MockStore.test.ts src/app-v2/data/appV2Flow.test.ts`: passou com 8 arquivos e 33 testes apos a revisao 6.1.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou; manteve 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.
- `git diff --check`: passou.

### Inferencia

A fundacao tecnica do app-v2 atingiu o criterio de 100% definido para a Etapa 6: Home Hoje, Equipamentos, Registro de Servico e Central de Servicos compartilham contratos, store mockada unica, acoes puras, estado operacional e testes de fluxo completo.

### Decisao pendente

Nenhuma decisao humana obrigatoria para encerrar a Etapa 6.

### Risco

A store e as acoes continuam mockadas. Elas protegem a logica de fluxo, mas ainda nao substituem uma etapa propria de storage real, Supabase, orcamento real, relatorio, WhatsApp ou agenda real.

### Proxima acao recomendada

Iniciar a proxima etapa com foco em UI/prototipo ou refinamento de aba especifica sobre a fundacao validada, mantendo as regras da Etapa 6 como contrato de base.

### Percentual recalculado

Percentual tecnico apos 6G: **100%**.

Justificativa: todos os criterios da Etapa 6 foram atendidos e validados sem mudar UI visual, CSS, app legado ou integracoes sensiveis.

## Etapa 6.1 - Revisao, QA e consolidacao

Status: executado.

Data: 2026-05-11.

Escopo executado:

- revisao do working tree pendente;
- revisao do diff de `docs/rewrite` e `src/app-v2`;
- verificacao de isolamento contra UI visual, CSS/tokens, app legado e areas sensiveis;
- revisao da store mockada unica, acoes puras, seletores operacionais e testes;
- correcao pequena de cobertura: teste explicito para saida mockada `relatorio_pendente`;
- validacoes finais antes de commit.

Escopo nao executado:

- nenhuma mudanca visual;
- nenhuma mudanca de CSS/tokens;
- nenhuma mudanca no app legado;
- nenhuma mudanca em `package.json` ou `package-lock.json`;
- nenhuma integracao com Supabase, storage real, PDF/share, WhatsApp, billing, PMOC, assinatura ou orcamento real.

### Fato documentado

A revisao confirmou que:

- `src/app-v2/data/appV2MockData.ts` concentra a massa mockada;
- `mockHomeData.ts`, `mockEquipmentData.ts` e `mockServiceData.ts` preservam exports antigos apenas como compatibilidade e apontam para a mesma fonte;
- `appV2Actions.ts` contem acoes puras de fluxo, sem React e sem storage;
- `appV2Selectors.ts` deriva inputs operacionais de uma unica fonte;
- `appV2Flow.test.ts` cobre equipamento -> servico -> registro -> central, incluindo `relatorio_pendente`, `orcamento_sugerido` e compromisso agendado.

### Inferencia

A fundacao pode ser commitada como base tecnica consolidada antes de qualquer etapa visual.

### Decisao pendente

Nenhuma decisao humana obrigatoria.

### Risco

A store continua sendo mockada. Proximas etapas nao devem tratar `registerEquipment`, `scheduleNextCommitment` ou os outputs mockados como persistencia real.

### Proxima acao recomendada

Criar commit unico da Etapa 6/6.1 e, depois, iniciar uma Etapa 7 separada para QA funcional/manual ou refinamento visual controlado.

### Percentual recalculado

Percentual tecnico apos 6.1: **100%**.

Justificativa: a revisao nao mudou o escopo do percentual; apenas consolidou a base, fechou lacuna de teste e preparou o commit.
