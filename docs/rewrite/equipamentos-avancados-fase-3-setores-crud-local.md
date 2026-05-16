# Equipamentos avancados fase 3 - setores CRUD local simples

## Objetivo

Ampliar setores mock/local no app-v2 com criacao e edicao simples, preservando
isolamento de areas sensiveis.

## Escopo entregue

- Criada action pura `saveEquipmentSector`.
- Criado contrato `SaveEquipmentSectorDraft`.
- `AppV2Shell` passou a salvar setores no snapshot local.
- `EquipmentList` ganhou painel minimo de setores.
- A UI permite criar setor local.
- A UI permite editar nome, cliente, cor e responsavel do setor.
- Lista, filtro e exibicao de equipamentos passam a refletir os setores
  alterados localmente.
- Testes cobrem action e shell.

## Anti-escopo preservado

- Delecao de setor.
- Delecao de equipamento.
- Fotos, upload e storage real.
- Supabase/RLS e migrations.
- Billing real, assinatura real, quotas, pricing e gates reais.
- PMOC.
- PDF/share, WhatsApp real e relatorios reais.
- Router novo ou aba global nova.
- Redesign geral, tokens globais, CSS legado ou Tailwind config.

## Decisao tecnica

Setores continuam como dado local do app-v2. A fase nao replica o gate Pro do
v1, nao conecta storage e nao introduz persistencia real. O objetivo e validar o
valor operacional de organizar equipamentos por area antes de discutir delecao,
permissoes, planos, migrations ou integracoes reais.

## Validacao

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `saveEquipmentSector` e o botao `Novo setor` ainda nao existiam.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 45 testes.

## Riscos remanescentes

- Setores ainda nao tem delecao.
- Setores nao aplicam regra Pro real nesta etapa.
- Fotos continuam sem equivalente v2.
- Delecao de equipamento e setor continuam sem decisao de produto/dados.
- Persistencia real continua fora do escopo.

## Proximo checkpoint recomendado

Equipamentos avancados fase 4: revisar delecao de equipamento e setor como
contrato documental antes de qualquer UI, avaliando impactos em registros,
relatorios, orcamentos, filtros e historico local, ainda sem fotos, sem billing
real, sem assinatura real, sem storage real, sem Supabase/RLS, sem migrations,
sem PMOC e sem redesign geral.
