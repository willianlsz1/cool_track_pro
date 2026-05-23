# Equipamentos avancados fase 7 - arquivamento equipamento local

## Objetivo

Implementar somente arquivamento mock/local de equipamento no app-v2, com
confirmacao, preservando registros, relatorios, orcamentos e compromissos,
ocultando arquivados da lista operacional por padrao e mantendo resolucao de
historico.

## Escopo entregue

- Criada action pura `archiveEquipment`.
- `Equipamento` ganhou metadado opcional `archivedAt`.
- Arquivamento marca o equipamento no snapshot local sem remover a entidade.
- Registros permanecem vinculados ao mesmo `equipamentoId`.
- Compromissos permanecem vinculados ao mesmo `equipamentoId`.
- Orcamentos permanecem vinculados ao mesmo `equipamentoId`.
- Lista operacional de Equipamentos oculta arquivados por padrao.
- Detalhe do equipamento arquivado continua acessivel quando ja aberto e mostra
  estado arquivado.
- Botao de arquivamento no detalhe exige confirmacao.
- Servicos e Relatorios continuam resolvendo o nome do equipamento arquivado.

## Anti-escopo preservado

- Delecao destrutiva de equipamento.
- Remocao de registros, relatorios, orcamentos ou compromissos.
- Desarquivamento.
- Fotos, upload e storage real.
- Supabase/RLS e migrations.
- Billing real, assinatura real, quotas, pricing e gates reais.
- PMOC.
- PDF/share, WhatsApp real e relatorios reais.
- Router novo ou aba global nova.
- Redesign geral, tokens globais, CSS legado ou Tailwind config.

## Decisao tecnica

O app-v2 nao copia a delecao destrutiva do v1. O arquivamento local preserva a
identidade do equipamento para historico e relatorios, enquanto remove o item da
lista operacional padrao. A delecao destrutiva segue bloqueada para etapa futura
com politica propria de retencao/auditoria.

## Validacao

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `archiveEquipment`, metadados de arquivamento e botao
  `Arquivar equipamento` ainda nao existiam.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 61 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## Riscos remanescentes

- Desarquivamento ainda nao foi implementado.
- Compromissos futuros de equipamento arquivado ainda permanecem preservados, sem
  cancelamento automatico.
- Fotos continuam sem equivalente v2.
- Persistencia real continua fora do escopo.
- Regras de auditoria/historico para delecao real exigem etapa propria.

## Proximo checkpoint recomendado

Equipamentos avancados fase 8: decidir contrato local de desarquivamento e/ou
tratamento de compromissos futuros de equipamento arquivado antes de qualquer
persistencia real, ainda sem fotos, sem billing real, sem assinatura real, sem
storage real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.
