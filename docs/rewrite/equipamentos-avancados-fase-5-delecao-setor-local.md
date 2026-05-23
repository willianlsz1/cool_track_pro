# Equipamentos avancados fase 5 - delecao setor local

## Objetivo

Implementar somente delecao mock/local de setor no app-v2, com confirmacao,
limpando `setorId` dos equipamentos e preservando equipamentos, registros,
relatorios e orcamentos.

## Escopo entregue

- Criada action pura `deleteEquipmentSector`.
- Delecao de `__sem_setor__` foi bloqueada.
- Delecao de setor remove apenas o setor do snapshot.
- Equipamentos vinculados ao setor removido permanecem no snapshot sem
  `setorId`.
- Registros permanecem no snapshot.
- Orcamentos permanecem no snapshot.
- `AppV2Shell` ganhou handler local para delecao de setor.
- `EquipmentList` ganhou fluxo de confirmacao antes de remover setor.
- Filtro ativo de setor volta para `all` quando o setor filtrado e removido.

## Anti-escopo preservado

- Delecao de equipamento.
- Arquivamento de equipamento.
- Fotos, upload e storage real.
- Supabase/RLS e migrations.
- Billing real, assinatura real, quotas, pricing e gates reais.
- PMOC.
- PDF/share, WhatsApp real e relatorios reais.
- Router novo ou aba global nova.
- Redesign geral, tokens globais, CSS legado ou Tailwind config.

## Decisao tecnica

A delecao de setor segue o comportamento seguro mapeado na fase 4: remover o
agrupamento e mover equipamentos para "Sem setor", sem apagar historico. O
app-v2 nao replica neste checkpoint qualquer comportamento destrutivo de
delecao de equipamento do v1.

## Validacao

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `deleteEquipmentSector` e o botao `Remover setor Recepcao`
  ainda nao existiam.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 48 testes.
- Validacao focada ampliada:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 56 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## Riscos remanescentes

- Delecao ou arquivamento de equipamento ainda nao foi decidido no app-v2.
- Setores nao aplicam regra Pro real nesta etapa.
- Persistencia real continua fora do escopo.
- Fotos continuam sem equivalente v2.
- Regras de auditoria/historico para delecao real exigem etapa propria.

## Proximo checkpoint recomendado

Equipamentos avancados fase 6: decidir contrato de arquivamento versus delecao
de equipamento no app-v2 antes de qualquer action ou UI, avaliando impacto em
registros, relatorios, orcamentos, compromissos, filtros e historico, ainda sem
fotos, sem billing real, sem assinatura real, sem storage real, sem
Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.
