# Equipamentos avancados fase 1 - contrato local

## Objetivo

Mapear setores, fotos e delecao do v1 contra o app-v2 antes de qualquer UI ou
mudanca de runtime. A fase define o que pode virar contrato mock/local no
app-v2 e o que deve permanecer em etapa propria por risco tecnico.

## Evidencia v1

### Setores

No v1, setores ficam acoplados a Equipamentos e Clientes:

- `src/features/equipamentos/setor/setorPersist.js` cria, edita, remove,
  atribui e move equipamentos entre setores;
- `src/ui/views/equipamentos.js` orquestra contexto de cliente/setor,
  navegacao de drill-down, modal e renderizacao;
- setor possui, no minimo, `id`, `nome`, `cor`, `descricao`, `responsavel` e
  `clienteId`;
- equipamento recebe `setorId`;
- excluir setor remove o setor e move equipamentos para `Sem setor`;
- a feature e protegida por regra de plano Pro no runtime.

### Fotos

No v1, fotos de equipamento sao uma area sensivel:

- `src/ui/views/equipamentos/fotos.js` controla gate Plus/Pro, editor dedicado,
  estado existente/pendente e upload;
- `uploadPendingPhotos` usa storage real;
- `normalizePhotoList` normaliza referencias persistidas;
- detalhe de equipamento usa primeira foto como capa;
- falhas de upload geram fallback/estado local;
- ha telemetria e navegacao para pricing.

### Delecao

No v1, delecao de equipamento e destrutiva:

- `src/ui/views/equipamentos/ui/deleteEquip.js` coleta registros vinculados;
- `markEquipDeleted` enfileira remocao;
- o estado remove o equipamento e tambem registros relacionados;
- a UI fecha modal, atualiza lista/global header e mostra feedback.

## Estado atual do app-v2

O app-v2 cobre apenas o contrato operacional basico:

- `Equipamento` em `src/app-v2/domain/types.ts` nao tem `setorId` nem `fotos`;
- `saveEquipment` em `src/app-v2/equipment/equipmentActions.ts` cria/edita
  nome, local, status, cliente, tag, tipo, criticidade, prioridade e
  periodicidade;
- `EquipmentForm` nao possui setor, fotos ou delecao;
- `EquipmentDetail` mostra dados operacionais, cliente vinculado e CTAs
  existentes;
- nao ha storage real, upload, billing, Supabase/RLS ou migrations no app-v2.

## Decisao de escopo

### Permitido em fase futura mock/local

Setores podem entrar primeiro como contrato mock/local, desde que:

- adicionem apenas `setorId` em equipamento e uma lista mockada de setores no
  snapshot local;
- usem campos simples: `id`, `nome`, `clienteId`, `cor`, `descricao` e
  `responsavel`;
- permitam filtrar/visualizar por setor sem nova rota global;
- mantenham `Sem setor` como estado explicito;
- nao conectem billing real, assinatura real, Supabase/RLS, storage real ou
  migrations;
- nao tentem reproduzir todo o drill-down/modal do v1.

### Bloqueado para etapa propria

Fotos nao entram no mesmo checkpoint de setores, porque exigem:

- upload/storage real ou simulacao cuidadosa de referencias;
- regras de plano Plus/Pro;
- fallback de upload;
- ciclo de editor/lightbox;
- possivel revisao de Supabase/storage/migrations.

Delecao de equipamento tambem nao entra junto com setores, porque:

- pode remover registros vinculados;
- precisa regra clara de historico;
- precisa decisao entre soft delete, remover vinculo, arquivar ou bloquear;
- pode afetar relatorios, historico, orcamentos e fluxo de servico.

## Contrato recomendado para a fase 2

Equipamentos avancados fase 2 deve implementar somente setores mock/local:

- criar tipo `SetorEquipamento` no app-v2;
- adicionar `setores` ao snapshot mockado;
- adicionar `setorId?: string` em `Equipamento`;
- exibir setor no detalhe e na lista de equipamentos;
- permitir escolher setor no formulario de criar/editar equipamento;
- adicionar filtro local por setor em `Equipamentos`;
- cobrir `Sem setor` como opcao visivel;
- testar action, view model e shell.

## Anti-escopo da fase 2

- Fotos, upload, storage real, Supabase/RLS e migrations.
- Billing, assinatura, quota, pricing e gates reais.
- Delecao de equipamento.
- Delecao de setor.
- Router novo ou aba global nova.
- PMOC.
- PDF/share, WhatsApp real e relatorios reais.
- Redesign geral ou CSS legado.

## Riscos

- Setores no v1 sao Pro; no app-v2 a primeira fatia deve ser mock/local sem
  afirmar paridade de monetizacao.
- Delecao do v1 remove registros vinculados; portar sem decisao pode quebrar
  historico e relatorios.
- Fotos dependem de storage e plano; misturar com setores repetiria o erro do
  v1 de acoplar cadastro, monetizacao, upload e detalhe em um unico fluxo.

## Proximo checkpoint recomendado

Equipamentos avancados fase 2: implementar setores mock/local basicos no
app-v2, sem fotos, sem delecao, sem billing real, sem assinatura real, sem
storage real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.
