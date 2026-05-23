# Equipamentos avancados fase 6 - contrato arquivamento equipamento

## Objetivo

Decidir o contrato de arquivamento versus delecao de equipamento no app-v2 antes
de qualquer action ou UI, avaliando impacto em registros, relatorios, orcamentos,
compromissos, filtros e historico.

## Escopo executado

- Revisado o comportamento destrutivo de delecao de equipamento do v1.
- Revisado o estado atual do app-v2 apos delecao local de setor.
- Separado arquivamento local de delecao destrutiva.
- Definido contrato recomendado para a proxima fase de runtime.
- Mantida decisao de nao implementar action/UI neste checkpoint.

## Evidencia considerada

### v1

Fonte: `src/features/equipamentos/ui/deleteEquip.js`.

O v1 remove o equipamento e tambem remove registros vinculados do estado. Antes
disso, registra a exclusao via `markEquipDeleted(id, linkedRegistros)`. Esse
comportamento e destrutivo para a experiencia local porque afeta historico,
relatorios, filtros e qualquer leitura baseada em `equipamentoId`.

### app-v2

Fontes principais:

- `src/app-v2/equipment/equipmentActions.ts`;
- `src/app-v2/equipment/equipmentViewModel.ts`;
- `src/app-v2/service/servicesHomeViewModel.ts`;
- `src/app-v2/service/servicesReportsViewModel.ts`;
- `src/app-v2/service/servicesQuotesViewModel.ts`;
- `src/app-v2/home/homeViewModel.ts`;
- `src/app-v2/data/appV2Actions.ts`.

O app-v2 ainda usa equipamento como entidade de referencia para:

- detalhe/lista de Equipamentos;
- registros de servico;
- relatorios locais;
- orcamentos locais;
- compromissos/proxima acao da Home;
- filtros de Servicos e Relatorios.

## Decisao de contrato

Para o app-v2, a proxima etapa de runtime deve implementar arquivamento local de
equipamento, nao delecao destrutiva.

Contrato recomendado:

- arquivar equipamento marca o equipamento como inativo/arquivado no snapshot
  local;
- registros vinculados permanecem intactos;
- relatorios vinculados permanecem intactos;
- orcamentos vinculados permanecem intactos;
- compromissos futuros do equipamento arquivado devem ser tratados em etapa
  focada, sem remocao silenciosa neste contrato inicial;
- listas operacionais podem ocultar arquivados por padrao;
- filtros e relatorios devem continuar conseguindo resolver nome/identidade do
  equipamento arquivado;
- detalhe do equipamento arquivado deve deixar claro que esta fora da operacao
  ativa;
- a operacao exige confirmacao explicita;
- reversao/desarquivamento pode ser etapa separada se nao couber com seguranca
  na primeira fatia.

Delecao destrutiva fica bloqueada para etapa futura propria porque exigiria
politica de retencao, auditoria, impacto em relatorios, impacto em orcamentos,
possivel remocao de compromissos e regras de persistencia real.

## Anti-escopo preservado

- Nenhuma action de arquivamento foi criada.
- Nenhuma UI de arquivamento foi criada.
- Nenhuma delecao destrutiva foi criada.
- Nenhum teste de runtime foi criado.
- Fotos, upload e storage real ficaram fora.
- Supabase/RLS e migrations ficaram fora.
- Billing real, assinatura real, quotas, pricing e gates reais ficaram fora.
- PMOC ficou fora.
- PDF/share, WhatsApp real e relatorios reais ficaram fora.
- Router novo, CSS legado, Tailwind config e redesign geral ficaram fora.

## Proxima fase recomendada

Equipamentos avancados fase 7: implementar somente arquivamento mock/local de
equipamento no app-v2, com confirmacao, preservando registros, relatorios,
orcamentos e compromissos, ocultando arquivados da lista operacional por padrao e
mantendo resolucao de historico, ainda sem fotos, sem billing real, sem
assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC e
sem redesign geral.

## Validacao documental

- `npm run format` passou.
- `npm run format:check` passou.
- `git diff --check` passou.
