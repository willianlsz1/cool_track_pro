# Equipamentos avancados fase 4 - delecao contrato local

## Objetivo

Revisar delecao de equipamento e setor antes de qualquer UI ou action no
app-v2, documentando impactos, riscos e contrato recomendado para uma etapa
futura.

## Escopo executado

- Mapeada delecao de equipamento no v1.
- Mapeada delecao de setor no v1.
- Comparado comportamento v1 com o contrato atual do app-v2.
- Separado o que pode ser mock/local futuro do que exige etapa propria.
- Mantida decisao de nao implementar delecao neste checkpoint.

## Evidencia v1

### Delecao de equipamento

Fonte: `src/ui/views/equipamentos/ui/deleteEquip.js`.

Comportamento observado:

- coleta registros vinculados ao equipamento;
- chama `markEquipDeleted(id, linkedRegistros)`;
- remove o equipamento de `state.equipamentos`;
- remove registros vinculados de `state.registros`;
- fecha modal de detalhe;
- re-renderiza Equipamentos e header global;
- exibe toast de sucesso.

Risco principal: a remocao nao afeta somente o card de equipamento. Ela tambem
muda historico/registro e pode afetar relatorios, orcamentos, filtros e qualquer
view que referencie registros por equipamento.

### Delecao de setor

Fonte: `src/features/equipamentos/setor/setorPersist.js`.

Comportamento observado:

- bloqueia `__sem_setor__`;
- exige gate Pro via `ensureProForSetores({ action: 'delete' })`;
- remove setor de `state.setores`;
- limpa `setorId` dos equipamentos vinculados ao setor;
- tenta enfileirar delecao remota via `Storage.markSetorDeleted(id)`;
- se o setor ativo era a rota atual, limpa contexto de rota;
- exibe toast informando que equipamentos foram movidos para "Sem setor".

Risco principal: delecao de setor tem comportamento menos destrutivo que delecao
de equipamento, mas ainda altera agrupamento, filtros, contexto de cliente e
estado de navegacao.

## Estado atual app-v2

Fontes:

- `src/app-v2/equipment/equipmentActions.ts`;
- `src/app-v2/equipment/EquipmentList.tsx`;
- `src/app-v2/shell/AppV2Shell.tsx`;
- `src/app-v2/service/servicesHomeViewModel.ts`;
- `src/app-v2/service/servicesReportsViewModel.ts`;
- `src/app-v2/service/servicesQuotesViewModel.ts`.

Estado observado:

- app-v2 tem `saveEquipment` para criar/editar equipamento;
- app-v2 tem `saveEquipmentSector` para criar/editar setor;
- nao ha action de delecao de equipamento no app-v2;
- nao ha action de delecao de setor no app-v2;
- registros, relatorios e orcamentos mockados ainda referenciam equipamentos;
- filtros de servicos e relatorios usam `equipamentoId`;
- setores sao usados em lista, detalhe e filtro de Equipamentos.

## Decisao de contrato

### Setor

Setor pode ser a primeira delecao mock/local futura, desde que preserve o mesmo
principio do v1:

- deletar setor remove o setor do snapshot;
- equipamentos vinculados ficam sem setor;
- nenhum equipamento e removido;
- nenhum registro, relatorio ou orcamento e removido;
- filtro de setor ativo deve voltar para `all` ou `__sem_setor__`;
- operacao deve ter confirmacao clara;
- sem storage real, sem gate Pro real, sem billing e sem Supabase/RLS nesta
  etapa mock/local.

### Equipamento

Delecao de equipamento nao deve ser implementada junto com delecao de setor.
Ela exige etapa propria porque ha duas politicas possiveis:

1. delecao destrutiva local, removendo equipamento e registros vinculados;
2. arquivamento local, preservando historico, relatorios e orcamentos.

O app-v2 deve decidir a politica antes de qualquer UI. A recomendacao atual e
nao copiar automaticamente a delecao destrutiva do v1. Para o v2, arquivamento
local tende a ser mais seguro para preservar historico e relatorios, mas isso
ainda precisa de checkpoint proprio com testes.

## Anti-escopo preservado

- Nenhuma action de delecao foi criada.
- Nenhuma UI de delecao foi criada.
- Nenhum teste de runtime foi criado.
- Nenhum schema, migration, Supabase/RLS ou storage real foi alterado.
- Nenhuma regra de billing, assinatura, quota ou gate real foi alterada.
- Fotos/upload continuaram fora.
- PMOC continuou fora.
- PDF/share, WhatsApp e relatorios reais continuaram fora.
- Router, CSS, design geral e React Doctor continuaram fora.

## Riscos remanescentes

- Setor ainda nao tem delecao no app-v2.
- Equipamento ainda nao tem delecao nem arquivamento no app-v2.
- Politica de retencao de registros vinculados ainda nao foi decidida.
- Orfandade de relatorios/orcamentos ainda precisa de teste antes de qualquer
  action destrutiva.
- Persistencia real exigira etapa propria depois do contrato mock/local.

## Proximo checkpoint recomendado

Equipamentos avancados fase 5: implementar somente delecao mock/local de setor
no app-v2, com confirmacao, limpando `setorId` dos equipamentos e preservando
equipamentos, registros, relatorios e orcamentos, ainda sem delecao de
equipamento, sem fotos, sem billing real, sem assinatura real, sem storage real,
sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.
