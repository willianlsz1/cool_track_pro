# Equipamentos avancados fase 2 - setores mock/local

## Objetivo

Implementar a primeira fatia segura de setores no app-v2, limitada a contrato
mock/local e UI minima em Equipamentos.

## Escopo entregue

- Criado `SetorEquipamento` no contrato do app-v2.
- Adicionado `setores` ao snapshot mockado.
- Adicionado `setorId?: string` em `Equipamento`.
- `saveEquipment` passou a aceitar e preservar `setorId`.
- `EquipmentForm` passou a permitir escolher setor.
- `EquipmentList` passou a exibir setor e filtrar por setor.
- `EquipmentDetail` passou a exibir setor no resumo.
- Testes cobrem action, view model e shell.

## Anti-escopo preservado

- Fotos e upload.
- Storage real, Supabase/RLS e migrations.
- Billing real, assinatura real, quotas, pricing e gates reais.
- Delecao de equipamento.
- Delecao de setor.
- Router novo ou aba global nova.
- PMOC.
- PDF/share, WhatsApp real e relatorios reais.
- Redesign geral ou CSS legado.

## Decisao tecnica

Setores entram primeiro como dado local do app-v2. O v2 nao replica o fluxo Pro
do v1 neste checkpoint e nao afirma paridade de monetizacao. A escolha foi
intencional para validar valor operacional sem acoplar cadastro, plano, upload,
storage e delecao.

## Validacao

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `setorId`, `sectorLabel`, filtro de setor e select de setor
  ainda nao existiam.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 49 testes.

## Riscos remanescentes

- Setores ainda nao tem CRUD proprio no app-v2.
- Setores nao aplicam regra Pro real nesta etapa.
- Fotos continuam sem equivalente v2.
- Delecao de equipamento e setor continuam sem decisao de produto/dados.

## Proximo checkpoint recomendado

Equipamentos avancados fase 3: ampliar setores mock/local com criacao/edicao
simples de setor no app-v2, ainda sem delecao, sem fotos, sem billing real, sem
assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC e
sem redesign geral.
