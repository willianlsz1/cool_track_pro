# Equipamentos avancados fase 12 - reauditoria de paridade

## Objetivo

Reauditar a area de Equipamentos apos anexos placeholder locais, atualizar o
estado de paridade UX v1-v2 e decidir se o restante deve ir para design,
backlog sensivel ou etapas proprias.

## Escopo executado

- Revisada a matriz principal de UX funcional v1-v2.
- Revisado o historico de Equipamentos avancados fases 1 a 11.
- Reclassificado o estado de `Equipamentos: setores/fotos/delecao`.
- Separado o que ja esta coberto no criterio mock/local do que permanece fora
  por integracao sensivel.
- Mantida a fase como documental, sem alteracao de runtime.

## Evidencia considerada

Fontes app-v2:

- `src/app-v2/domain/types.ts`;
- `src/app-v2/equipment/equipmentActions.ts`;
- `src/app-v2/equipment/equipmentViewModel.ts`;
- `src/app-v2/equipment/EquipmentCard.tsx`;
- `src/app-v2/equipment/EquipmentDetail.tsx`;
- `src/app-v2/shell/AppV2ShellEquipmentAttachments.test.tsx`;
- `docs/rewrite/equipamentos-avancados-fase-1-contrato-local.md`;
- `docs/rewrite/equipamentos-avancados-fase-11-anexos-placeholder-local.md`.

Fontes de acompanhamento:

- `docs/rewrite/auditoria-ux-funcional-v1-v2.md`;
- `docs/rewrite/matriz-paridade-v1-v2.md`;
- `docs/app-v2-goal.md`.

## Resultado da reauditoria

### Equipamentos no criterio mock/local

O app-v2 cobre agora, sem storage real:

- lista, busca e filtros basicos;
- detalhe com cliente, setor, status, ultima visita e proxima preventiva;
- criar/editar equipamento com campos operacionais basicos;
- setores mock/local com vinculo, filtro, criacao, edicao e remocao local;
- arquivamento e desarquivamento local sem perda de historico;
- cancelamento local de compromissos `agendado` ao arquivar;
- anexos/fotos placeholder locais, com limite de 3 itens e exibicao no
  card/detalhe;
- preservacao de anexos ao editar, arquivar e desarquivar.

### O que continua fora do criterio principal

Permanece fora por ser sensivel ou exigir etapa propria:

- upload real de fotos/anexos;
- camera, compressao, lightbox, download e fila offline;
- storage real, bucket, signed URL, permissoes e retencao;
- Supabase/RLS e migrations;
- gates reais de plano, billing, assinatura, quota e pricing;
- PMOC;
- PDF/share e WhatsApp real;
- delecao destrutiva de equipamento;
- redesign geral e refinamento visual amplo.

## Estado de paridade atualizado

Na matriz principal, `Equipamentos: setores/fotos/delecao` continua `parcial`,
mas o significado muda:

- antes da fase 11, fotos/anexos estavam fora do runtime;
- depois da fase 11, fotos/anexos placeholder locais estao cobertos;
- a parcialidade restante vem de upload/storage real, gates reais e delecao
  destrutiva, que nao devem entrar na etapa de UX funcional mock/local.

Por isso, a porcentagem geral estimada permanece **76%** no calculo principal
atual. A reauditoria nao aumenta o numero por dois motivos:

1. o item de Equipamentos continua `parcial` pelo metodo de peso atual;
2. as lacunas restantes sao majoritariamente sensiveis ou precisam de decisao
   propria, nao de migracao funcional simples.

## Decisao

Para o criterio de UX funcional mock/local, a area de Equipamentos esta
suficientemente avancada para parar de puxar novas fatias funcionais pequenas
automaticamente.

O restante deve ser separado assim:

- **Design**: refinamento visual de lista, card, detalhe, estados vazios,
  densidade, mobile/desktop e anexos locais.
- **Backlog sensivel**: upload/storage real, Supabase/RLS, migrations,
  permissoes, billing/gates reais, PDF/share e WhatsApp.
- **Etapa propria futura**: delecao destrutiva de equipamento, caso o produto
  confirme que ela deve existir no app-v2.
- **PMOC**: excluido deste ciclo; deve ser refeito em nova etapa propria.

## Anti-escopo preservado

Nao foram implementados:

- codigo runtime;
- storage real;
- Supabase/RLS ou migrations;
- PMOC;
- PDF/share;
- billing, assinatura, quotas ou gates reais;
- upload real;
- WhatsApp real;
- redesign geral.

## Validacao documental

- `npm run format:check` passou.
- `git diff --check` passou.

## Proximo checkpoint recomendado

Design System/UI fase 5: auditoria visual documental de Equipamentos app-v2
apos a cobertura mock/local, cobrindo lista, card, detalhe, estados vazios,
anexos locais, mobile/desktop, rolagem e texto longo, sem alterar runtime, sem
storage real, sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share, sem
billing real e sem redesign amplo.
