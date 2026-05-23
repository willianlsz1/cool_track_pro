# Equipamentos - setores painel operacional

Data: 2026-05-17

## Objetivo

Evoluir a experiencia de Setores no app-v2 para deixar de ser apenas um
cadastro lateral e passar a funcionar como agrupador operacional de
Equipamentos dentro da area Equipamentos.

A melhoria deve preservar a paridade funcional util do v1 sem copiar UI, CSS,
modal Pro, paleta por setor ou estrutura visual legada.

## Decisoes de dominio aprovadas

- **Setor** agrupa Equipamentos por area fisica ou funcional.
- Setor pode existir sem Cliente para uso local ou modelo, mas o fluxo principal
  deve incentivar Cliente vinculado.
- Setor nao vira area global nova.
- Ao abrir um Setor, o app-v2 deve mostrar um **Painel de Setor** dentro da area
  Equipamentos.
- Criar Equipamento a partir do Painel de Setor preenche automaticamente
  `setorId`.
- Se o Setor tiver Cliente vinculado, criar Equipamento a partir dele tambem
  preenche automaticamente `clienteId`.
- Trocar o Cliente no formulario de Equipamento nao altera automaticamente o
  Cliente do Setor.
- Cor do Setor deixa de ser informacao principal na UI. O campo pode permanecer
  no contrato local por compatibilidade, mas nao deve orientar o fluxo visual.

## Escopo da primeira fatia

- Melhorar o bloco de Setores em `Equipamentos`.
- Remover `Cor` do formulario visual de Setor.
- Manter campos principais:
  - Nome do setor;
  - Cliente;
  - Descricao opcional;
  - Responsavel opcional.
- Exibir Setores como itens operacionais, nao como lista administrativa crua.
- Cada Setor deve mostrar:
  - nome;
  - Cliente vinculado ou "Sem cliente fixo";
  - quantidade de Equipamentos;
  - quantidade em atencao/critico;
  - proximo compromisso relevante quando disponivel.
- Permitir abrir Painel de Setor dentro da area Equipamentos.
- Painel de Setor deve permitir:
  - ver Equipamentos daquele Setor;
  - adicionar Equipamento neste Setor;
  - editar Setor;
  - voltar para a lista geral de Setores/Equipamentos.
- Criacao contextual de Equipamento deve preencher Setor e Cliente conforme a
  regra aprovada.

## Fora de escopo

- Storage real, Supabase/RLS, migrations ou persistencia real.
- Billing real, assinatura real, gate Pro, quotas ou pricing.
- Router global novo ou area global nova de Setores.
- Drag and drop.
- Mover Equipamentos em lote.
- Responsaveis multiplos.
- Upload/fotos reais.
- PMOC.
- PDF/share, WhatsApp real ou relatorios reais.
- Delecao destrutiva de Equipamento.
- Remocao estrutural do campo `cor` em tipos, mocks ou historico local.
- Copiar CSS, modal, templates ou paleta visual do v1.

## Arquivos provaveis

- `src/app-v2/equipment/EquipmentList.tsx`
- `src/app-v2/equipment/EquipmentForm.tsx`
- `src/app-v2/equipment/equipmentViewModel.ts`
- `src/app-v2/equipment/equipmentViewModel.test.ts`
- `src/app-v2/equipment/equipmentActions.ts`
- `src/app-v2/equipment/equipmentActions.test.ts`
- `src/app-v2/shell/AppV2Shell.tsx`
- `src/app-v2/shell/AppV2Shell.test.tsx`
- `src/app-v2/domain/types.ts`

Novos componentes so devem ser criados se reduzirem duplicacao real ou isolarem
responsabilidade clara, por exemplo `SectorPanel` ou helper de view model.

## Comportamento esperado

1. Usuario abre Equipamentos e ve Setores como agrupadores operacionais.
2. Usuario abre um Setor e visualiza resumo + equipamentos daquele Setor.
3. Usuario clica em `Adicionar equipamento neste setor`.
4. Formulario de Equipamento abre com Setor preenchido.
5. Se o Setor tiver Cliente, o Cliente tambem vem preenchido.
6. Usuario pode trocar o Cliente do Equipamento sem alterar o Setor.
7. Ao salvar, Equipamento aparece vinculado ao Setor e ao Cliente escolhido.
8. Remover Setor continua preservando Equipamentos e historico, movendo
   Equipamentos para "Sem setor" conforme contrato ja implementado.

## Criterios de teste

- Criar Equipamento a partir de Setor com Cliente preenche `setorId` e
  `clienteId`.
- Criar Equipamento a partir de Setor sem Cliente preenche somente `setorId`.
- Trocar Cliente no formulario de Equipamento nao altera Cliente do Setor.
- Painel de Setor lista apenas Equipamentos vinculados ao Setor aberto.
- Resumo do Setor conta Equipamentos e status a partir do snapshot local.
- Remover Setor preserva Equipamentos, registros, relatorios e orcamentos.
- UI nao exibe `Cor` como campo principal de Setor.
- Filtros/lista existentes de Equipamentos continuam funcionando.

## Validacao recomendada

Para a fatia de implementacao:

```bash
npm run format
npm run build
npm run check
npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
git diff --check
```

Se a mudanca tocar layout de formulario ou painel, validar visualmente desktop
largo, notebook e mobile estreito, com atencao a labels, gaps, overflow e texto
longo.

## Riscos

- Transformar Setores em modulo administrativo grande demais.
- Reabrir padroes visuais do v1 ao tentar copiar o modal Pro.
- Confundir Cliente do Setor com Cliente do Equipamento.
- Quebrar fluxos existentes de filtro por Setor, edicao de Equipamento ou
  remocao segura de Setor.
- Espalhar regras de contagem/status no componente em vez de concentrar em view
  model/helper puro.

## Proximo passo recomendado

Implementar a primeira fatia em codigo, com prioridade para view model e testes
antes de UI:

1. Criar resumo operacional de Setor no view model.
2. Adicionar estado local para abrir Painel de Setor.
3. Ajustar formulario visual de Setor removendo Cor.
4. Criar acao de `Adicionar equipamento neste setor` reaproveitando
   `EquipmentForm`.
5. Cobrir o fluxo em testes focados.
