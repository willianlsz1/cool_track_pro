# Equipamentos avancados fase 9 - runtime desarquivamento e compromissos

## Objetivo

Implementar somente runtime mock/local do contrato da fase 8, cancelando
compromissos `agendado` ao arquivar equipamento, criando `unarchiveEquipment`,
impedindo que arquivados alimentem Home/fila e mantendo historico em
Servicos/Relatorios.

## Escopo entregue

- `archiveEquipment` passou a converter compromissos `agendado` do equipamento
  arquivado para `cancelado`.
- `archiveEquipment` continua preservando equipamento, registros, orcamentos e
  compromissos.
- Criada action pura `unarchiveEquipment`.
- Desarquivamento remove `archivedAt` sem reabrir compromissos cancelados.
- Detalhe de equipamento arquivado exibe acao local `Desarquivar equipamento`.
- Home, alertas, fila e proxima acao ignoram equipamentos arquivados.
- Escolha operacional de equipamento para Servicos oculta arquivados.
- `startServiceFromEquipment` bloqueia inicio direto de servico para
  equipamento arquivado.
- Historico em Servicos/Relatorios permanece resolvendo `equipamentoId`.

## Anti-escopo preservado

- Delecao destrutiva de equipamento.
- Reabertura automatica de compromissos cancelados.
- Motivo/data real de cancelamento de compromisso.
- Fotos, upload e storage real.
- Supabase/RLS e migrations.
- Billing real, assinatura real, quotas, pricing e gates reais.
- PMOC.
- PDF/share, WhatsApp real e relatorios reais.
- Router novo ou aba global nova.
- Redesign geral, tokens globais, CSS legado ou Tailwind config.

## Decisao tecnica

O cancelamento local usa o status existente `cancelado` para compromissos
`agendado`, evitando schema novo nesta etapa. Desarquivar devolve o equipamento
para a operacao, mas nao reativa agenda antiga automaticamente; uma nova agenda
deve nascer por fluxo explicito.

## Validacao

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/domain/homePriority.test.ts src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque compromissos ainda permaneciam `agendado`, `unarchiveEquipment`
  nao existia, Home/alertas ainda consideravam arquivados e o detalhe nao
  exibia `Desarquivar equipamento`.
- RED adicional:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `startServiceFromEquipment` ainda aceitava equipamento arquivado e
  `selectServiceFlowInput` ainda listava arquivados.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/domain/homePriority.test.ts src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 92 testes.
- Validacao geral:
  `npm run format`, `npm run build` e `npm run check` passaram. Manteve 1
  warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings
  Vite/chunk conhecidos.

## Riscos remanescentes

- Fotos continuam sem equivalente v2.
- Cancelamento de compromisso ainda nao registra motivo/data de auditoria.
- Persistencia real continua fora do escopo.
- Supabase/RLS e migrations seguem exigindo etapa propria.
- Delecao destrutiva continua bloqueada.

## Proximo checkpoint recomendado

Equipamentos avancados fase 10: decidir contrato local para fotos/anexos de
equipamento sem upload/storage real, separando placeholder/mock local,
permissoes, limites e futura persistencia, ainda sem billing real, sem
assinatura real, sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share e sem
redesign geral.
