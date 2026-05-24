# app-v2 - CP-58N copia PMOC no checklist de Registro

## Objetivo

Remover a copia visivel PMOC restante na superficie de checklist do Registro
legado, sem alterar o runtime estrutural de checklist, templates, storage,
Supabase/RLS, PDF/share, WhatsApp, assinatura, fotos ou PMOC app-v2-native.

## Evidencia

- O Registro ainda exibia `Checklist PMOC preenchivel`, `PMOC formal`,
  `prioridade para PMOC` e evento `pmoc_checklist_upsell_clicked`.
- O helper pequeno `pmocChecklist.js` continha mensagem de recomendacao PMOC
  formal para preventiva.
- O template grande `src/domain/pmoc/checklistTemplates.js` permanece como
  runtime legado sensivel e passa de 1000 linhas; renomear/remover esse bloco
  exige CP proprio.

## Escopo alterado

- Copia visivel do Registro passa a falar em checklist preventivo/NBR.
- Evento de upsell passa para `preventive_checklist_upsell_clicked`.
- Testes de Registro foram alinhados para a nova nomenclatura.
- Contrato de remocao v1 impede retorno da copia PMOC visivel nessa superficie.

## Fora do escopo

- Renomear paths, imports ou arquivos `pmoc`.
- Remover `src/domain/pmoc/checklistTemplates.js`.
- Alterar payload `registro.checklist`.
- Recriar PMOC app-v2-native.
- Supabase/RLS, migrations, storage, PDF/share, WhatsApp, billing, assinatura
  ou fotos.

## Risco

Baixo para runtime, porque o CP altera apenas copia/evento e expectativas de
teste. O risco residual e de nomenclatura interna: ainda existem paths e
helpers `pmoc`, que devem sair em etapa estrutural separada.

## Validacao esperada

- `npm test -- src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroLifecycle.contract.test.js src/__tests__/registroPmocChecklistHelpers.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
