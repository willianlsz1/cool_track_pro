# Equipamentos avancados fase 8 - contrato desarquivamento e compromissos

## Objetivo

Decidir o contrato local de desarquivamento e tratamento de compromissos de
equipamento arquivado antes de qualquer persistencia real.

## Escopo executado

- Revisado o contrato entregue na fase 7.
- Revisado o uso de compromissos na Home, alertas, fila e proxima acao.
- Revisado o uso de equipamento como referencia em Servicos e Relatorios.
- Definido contrato recomendado para a proxima fatia de runtime local.
- Mantida decisao de nao implementar runtime neste checkpoint documental.

## Evidencia considerada

### Fase 7

Fonte:
`docs/rewrite/equipamentos-avancados-fase-7-arquivamento-equipamento-local.md`.

A fase 7 marcou equipamento com `archivedAt`, ocultou arquivados da lista
operacional de Equipamentos e preservou registros, relatorios, orcamentos e
compromissos. O risco remanescente registrado foi que compromissos futuros ainda
permanecem preservados sem cancelamento automatico.

### Home e fila operacional

Fontes:

- `src/app-v2/domain/homePriority.ts`;
- `src/app-v2/domain/homeAlerts.ts`;
- `src/app-v2/home/homeViewModel.ts`.

A Home calcula proxima acao, alertas, fila e contadores a partir de
compromissos `agendado`. Sem contrato adicional, um compromisso agendado de
equipamento arquivado pode continuar aparecendo como trabalho ativo.

### Servicos e historico

Fontes:

- `src/app-v2/data/appV2Actions.ts`;
- `src/app-v2/service/serviceFlowViewModel.ts`;
- `src/app-v2/service/servicesReportsViewModel.ts`;
- `src/app-v2/service/servicesQuotesViewModel.ts`.

Registros, relatorios e orcamentos dependem de `equipamentoId` para resolver
nome, cliente e contexto historico. Portanto arquivar ou desarquivar nao deve
remover a entidade, nem quebrar a resolucao de historico.

## Decisao de contrato

Para o app-v2 local, equipamento arquivado deve sair da operacao ativa sem
perder historico.

Contrato recomendado para a proxima fase de runtime:

- arquivar equipamento continua preservando a entidade e `equipamentoId`;
- registros, relatorios e orcamentos vinculados permanecem intactos;
- compromissos vinculados nao devem ser removidos;
- compromissos `agendado` do equipamento arquivado devem deixar de alimentar
  Home, fila e proxima acao;
- a forma local mais segura e converter compromissos `agendado` vinculados ao
  equipamento arquivado para `cancelado`, preservando o registro do compromisso;
- compromissos ja `concluido` permanecem como historico;
- compromissos `cancelado` permanecem cancelados;
- desarquivar equipamento remove `archivedAt` e devolve o equipamento para a
  lista operacional;
- desarquivar nao reabre automaticamente compromissos cancelados durante o
  arquivamento;
- apos desarquivar, nova agenda deve nascer por fluxo explicito de agendamento
  ou novo registro de servico;
- iniciar servico para equipamento arquivado deve continuar bloqueado em fluxos
  operacionais;
- Servicos, Relatorios e Orcamentos podem continuar resolvendo historico de
  equipamento arquivado pelo mesmo `equipamentoId`.

## Anti-escopo preservado

- Nenhuma action de desarquivamento foi criada.
- Nenhuma UI de desarquivamento foi criada.
- Nenhuma alteracao de Home, fila, Servicos ou Relatorios foi feita.
- Nenhuma delecao destrutiva foi criada.
- Nenhum campo novo de auditoria real foi criado.
- Fotos, upload e storage real ficaram fora.
- Supabase/RLS e migrations ficaram fora.
- Billing real, assinatura real, quotas, pricing e gates reais ficaram fora.
- PMOC ficou fora.
- PDF/share, WhatsApp real e relatorios reais ficaram fora.
- Router novo, CSS legado, Tailwind config e redesign geral ficaram fora.

## Riscos remanescentes

- A fase 7 ainda preserva compromissos `agendado` no runtime atual.
- A Home ainda precisa ser protegida por runtime/testes na proxima fase.
- Desarquivamento ainda nao existe no runtime.
- Nao ha metadado local de motivo/data de cancelamento de compromisso.
- Persistencia real exigira etapa propria para auditoria, RLS e migrations.

## Proximo checkpoint recomendado

Equipamentos avancados fase 9: implementar somente runtime mock/local do
contrato da fase 8, cancelando compromissos `agendado` ao arquivar equipamento,
criando `unarchiveEquipment`, impedindo que arquivados alimentem Home/fila e
mantendo historico em Servicos/Relatorios, ainda sem fotos, sem billing real,
sem assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem
PMOC e sem redesign geral.

## Validacao documental

- `npm run format:check` passou.
- `git diff --check` passou.
