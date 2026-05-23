# app-v2 - Triagem de navegacao avancada e router

## 1. Objetivo

Avaliar se as subvisoes internas do app-v2 precisam de deep links, historico
navegavel ou URLs proprias, sem implementar router nesta etapa.

Esta fase fecha a etapa documental do plano de reducao de friccao. Ela nao
altera `src/`, runtime, storage, Supabase/RLS, billing, PDF/share, WhatsApp,
PMOC, contratos publicos ou legado/v1.

## 2. Fontes analisadas

- `CONTEXT.md`
- `docs/app-v2-goal.md`
- `docs/rewrite/app-v2-jornada-usuario-friccao.md`
- `docs/rewrite/app-v2-reducao-friccao-plano-implementacao.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md`
- `src/app-v2/shell/AppV2Shell.tsx`
- `src/app-v2/data/appV2Selectors.ts`

## 3. Estado atual da navegacao

O app-v2 usa `AppV2Shell` como orquestrador local da experiencia. A navegacao
principal e controlada por estado React, nao por rotas de URL.

Areas principais:

1. `Hoje`
2. `Equipamentos`
3. `Servicos`
4. `Conta`

Estados internos que funcionam como subrotas locais:

| Area         | Estado local atual                                       | Experiencia visivel                             |
| ------------ | -------------------------------------------------------- | ----------------------------------------------- |
| Hoje         | `homeView`                                               | `Hoje > Visao geral` e `Hoje > Alertas`         |
| Equipamentos | `equipmentSubView`                                       | `Equipamentos > Equipamentos` e `Clientes`      |
| Equipamentos | `selectedEquipmentId`                                    | Detalhe de Equipamento                          |
| Equipamentos | `selectedClientId`                                       | Detalhe de Cliente                              |
| Equipamentos | `startServiceAfterEquipmentCreate`                       | Criacao contextual de Equipamento               |
| Equipamentos | `equipmentFormClientId`                                  | Criacao de Equipamento vinculada a Cliente      |
| Servicos     | `isServiceEquipmentChoiceOpen`                           | Escolha de Equipamento para Registro de Servico |
| Servicos     | `isServiceFlowOpen` + `serviceDraft`                     | Fluxo de Registro de Servico                    |
| Servicos     | `editingServiceId`                                       | Edicao mockada de Registro existente            |
| Servicos     | `servicesInitialView` e estado interno de `ServicesHome` | `Registros`, `Relatorios` e `Orcamentos`        |
| Conta        | `accountPreferences`                                     | Preferencias locais e atalhos redundantes       |

## 4. Subvisoes candidatas a URL propria

### 4.1 `Hoje > Alertas`

Ganho potencial:

- Permitir abrir diretamente a triagem de anormalidades.
- Facilitar retorno historico para a lista de alertas depois de abrir um
  Equipamento.

Risco:

- `Alertas` foi aprovado como subvisao de `Hoje`, nao como quinta area
  principal.
- Criar URL propria agora pode parecer promocao de `Alertas` para area global.
- A Proxima acao da Home deve continuar sendo o caminho operacional principal.

Decisao recomendada:

- Manter como estado local por enquanto.
- Se houver etapa futura de router, representar como subestado de `Hoje`, nao
  como area principal.

### 4.2 `Servicos > Orcamentos`

Ganho potencial:

- Abrir rascunhos em aberto diretamente.
- Compartilhar internamente um caminho para revisar Orcamento local.
- Melhorar retorno apos criar Orcamento pre-servico ou pos-diagnostico.

Risco:

- `Orcamentos` continua aprovado como subvisao de `Servicos`.
- O ciclo de Orcamento ainda esta local/mock. Deep link antes de persistencia
  real pode criar expectativa falsa de recuperacao apos refresh.
- IDs de Orcamento locais nao sao contrato publico persistido.

Decisao recomendada:

- Manter acesso contextual por CTA em `Hoje`, `Servicos` e fechamento de
  servico.
- Nao criar URL propria ate existir decisao de persistencia/contrato de
  Orcamento.

### 4.3 Detalhe de Equipamento

Ganho potencial:

- Permitir acesso direto a um Equipamento especifico.
- Melhorar retorno da triagem de Alertas, Clientes e Registros para o ativo.
- Facilitar suporte e revisao operacional em escritorio.

Risco:

- O app-v2 ainda usa snapshot mockado/local.
- O ID do Equipamento existe no mock, mas ainda nao deve virar contrato publico
  de rota.
- Deep link para detalhe precisa definir fallback quando o Equipamento nao
  existir, estiver arquivado ou depender de dados reais futuros.

Decisao recomendada:

- Tratar como candidato mais forte para etapa futura, mas nao implementar nesta
  fase.
- Antes de router, documentar contrato de ID, fallback e comportamento para
  arquivados.

### 4.4 Detalhe de Cliente

Ganho potencial:

- Permitir acesso direto a carteira de Cliente e seus Equipamentos.
- Apoiar escritorio/gestao sem transformar Cliente em area global.

Risco:

- Cliente esta aprovado como subvisao forte dentro de `Equipamentos`.
- URL propria pode sugerir que Cliente e area principal, contrariando o contrato
  atual.
- Serviços relacionados e PMOC contextual de Cliente ainda sao backlog futuro.

Decisao recomendada:

- Manter local.
- Reavaliar quando o detalhe de Cliente concentrar servicos relacionados ou
  PMOC contextual em etapa propria.

### 4.5 Fluxo de Registro de Servico

Ganho potencial:

- Back button poderia voltar entre etapas.
- Recuperacao de contexto em edicao de Registro poderia ficar mais clara.

Risco:

- O fluxo usa `serviceDraft` em memoria.
- Deep link para etapa do fluxo pode abrir sem draft valido.
- Back button dentro de fluxo em andamento pode conflitar com cancelar, voltar
  para Servicos, trocar Equipamento e criacao contextual de Equipamento.
- Persistir draft ou estado de wizard encosta em storage, contrato de payload e
  comportamento de recuperacao.

Decisao recomendada:

- Nao criar deep link para etapas do Registro nesta fase.
- Se houver router futuro, o fluxo deve primeiro ter decisao separada para
  estado em andamento, descarte, recuperacao e fallback.

## 5. Impacto em contratos publicos

Implementar router/deep links afetaria contratos que hoje permanecem privados
ao shell local:

- nomes de rotas;
- parametros de URL;
- IDs de Equipamento, Cliente, Registro e Orcamento;
- comportamento de back button;
- fallback quando o recurso nao existe;
- preservacao ou descarte de `serviceDraft`;
- relacao entre subvisao e area principal;
- testes de navegacao;
- expectativa de refresh/deep link em dados mockados.

Pelo `AGENTS.md`, esses pontos sao contratos publicos ou areas sensiveis de
navegacao. Nao devem ser alterados sem etapa propria e testes dedicados.

## 6. Riscos principais

| Risco                                    | Impacto provavel                                             | Mitigacao recomendada                                      |
| ---------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Back button fechar fluxo errado          | Perda de contexto em Registro ou criacao contextual          | Especificar pilha de historico antes de implementar router |
| Deep link para dados locais inexistentes | Tela quebrada, vazio ambiguo ou expectativa falsa de storage | Definir fallback e contrato de IDs                         |
| Promover subvisao a area principal       | Quebra da decisao de quatro areas fixas                      | Manter rotas aninhadas sob area principal                  |
| Draft local em URL                       | Usuario espera recuperacao apos refresh                      | Nao expor draft em URL sem decisao de persistencia         |
| Misturar router com UX visual            | Regressao ampla e dificil de revisar                         | Fazer etapa tecnica isolada, sem redesign                  |
| Duplicar estado entre URL e React state  | Bugs de sincronizacao e testes frageis                       | Criar camada unica de navegacao antes de ligar UI          |

## 7. Recomendacao

Nao implementar router, deep links ou historico navegavel agora.

A fase A-C ja reduziu friccao com CTAs contextuais e subvisoes locais sem tocar
areas sensiveis. O ganho incremental de URL neste momento e menor que o risco
de criar contratos publicos prematuros sobre dados mockados e estado em memoria.

Recomendacao tecnica:

1. Manter `AppV2Shell` como orquestrador local no curto prazo.
2. Continuar usando CTAs contextuais para reduzir friccao.
3. Abrir etapa tecnica futura de router apenas quando houver uma necessidade
   concreta de deep link, suporte, refresh ou historico navegavel.
4. Se a etapa futura for aberta, comecar por contrato documental de navegacao,
   nao por codigo.

## 8. Ordem sugerida para etapa futura

Se o router virar prioridade, a etapa deve ser separada e seguir esta ordem:

1. Definir mapa canonico de rotas aninhadas sem criar quinta area principal.
2. Definir contrato de fallback para IDs inexistentes.
3. Definir comportamento de back button em:
   - `Hoje > Alertas`;
   - detalhe de Equipamento;
   - detalhe de Cliente;
   - `Servicos > Orcamentos`;
   - fluxo de Registro em andamento.
4. Decidir se `serviceDraft` pode ser recuperado, descartado ou bloqueado em
   refresh.
5. Criar testes de navegacao antes de alterar runtime.
6. Implementar em fatia pequena, sem storage real, PDF/share, WhatsApp, billing,
   Supabase/RLS, PMOC ou redesign.

## 9. Decisao final desta fase

Fase D concluida como triagem documental.

Decisao:

- `Hoje > Alertas`: manter subvisao local.
- `Servicos > Orcamentos`: manter subvisao local com CTAs contextuais.
- Detalhe de Equipamento: candidato forte para etapa futura, sem implementacao
  agora.
- Detalhe de Cliente: manter local ate detalhe ganhar mais responsabilidades.
- Fluxo de Registro: nao expor etapas em URL enquanto o draft for local.
- Router/deep links: abrir somente em etapa tecnica futura dedicada.

## 10. Validacao esperada

Por ser fase documental:

```bash
npm run format:check
git diff --check
```
