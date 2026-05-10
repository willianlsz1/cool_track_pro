# Mudança 20 / CP-D — Checklist PMOC no Registro

## 1. Objetivo

Melhorar a descoberta do checklist PMOC dentro do Registro quando o técnico estiver registrando uma preventiva ou PMOC, sem transformar o checklist em obrigação dura e sem alterar PDF, WhatsApp, pós-save ou cota `pdf_export`.

## 2. Estado inicial

- Branch: `main`
- HEAD inicial confirmado localmente: `2f2b7629727af7e0135a4f13959f1540a5eaf0b9`
- Working tree inicial: limpo
- Base: CP-C já havia criado `src/domain/pmoc/serviceType.js` e exibido PMOC contextual no detalhe do equipamento.

## 3. Arquivos alterados

- `src/ui/views/registro.js`
- `src/ui/shell/templates/views.js`
- `src/__tests__/registroLegacyChecklistRender.test.js`
- `docs/pmoc/mudanca-20-cp-d-checklist-pmoc-registro.md`

## 4. Comportamento anterior

- O checklist PMOC já existia no Registro e era renderizado por equipamento selecionado.
- O checklist completo era liberado apenas para Pro.
- Free/Plus recebiam upsell para Pro.
- Preventiva sem checklist gerava warning soft-required, mas não bloqueava salvamento.
- O destaque do checklist dependia do detector legado `isPreventivaTipo`, que não cobria PMOC nem alguns termos preventivos mapeados na CP-B/CP-C.
- A seção permanecia discreta mesmo quando o tipo indicava PMOC/preventiva.

## 5. Comportamento novo

- Quando há equipamento selecionado e o tipo efetivo do serviço é preventiva/PMOC, o Registro marca o checklist como recomendado.
- Para usuários Pro, a seção do checklist abre automaticamente nesse contexto e recebe `data-pmoc-recommended="true"`.
- Para tipo comum/corretivo, a seção permanece recolhida/discreta e recebe `data-pmoc-recommended="false"`.
- Para tipo `Outro`, o campo livre passa a ser considerado na descoberta do checklist, permitindo casos como `Checklist PMOC`.
- O resumo do checklist usa o tipo efetivo do serviço, incluindo o texto livre quando `Outro` está selecionado.

## 6. Como o checklist é destacado

- O selo `Recomendado p/ PMOC` passa a usar `isPreventivaOrPmocServiceType()`.
- A seção `<details id="r-checklist-details">` abre automaticamente apenas quando:
  - há equipamento selecionado;
  - o tipo efetivo do serviço é preventiva/PMOC;
  - o usuário tem acesso Pro ao checklist completo.
- Free/Plus continuam sem acesso ao checklist completo, mas o upsell recebe o contexto `data-pmoc-recommended="true"` e texto curto: `Recomendado para preventiva/PMOC.`

## 7. Tratamento por plano

- Free/Plus:
  - veem orientação básica e upsell Pro quando o contexto é preventiva/PMOC;
  - não recebem checklist completo;
  - continuam podendo salvar o registro comum.
- Pro:
  - mantém checklist completo;
  - recebe seção aberta/destacada quando o tipo é preventiva/PMOC;
  - mantém o fluxo atual de preenchimento.

## 8. Soft-required preservado

- Preventiva/PMOC sem checklist continua gerando warning de recomendação.
- O warning continua não bloqueante.
- O salvamento do registro comum não foi transformado em validação obrigatória.

## 9. Preservado

- Registro comum.
- Pós-save.
- Prompt de próxima preventiva.
- PDF comum.
- PDF PMOC formal.
- WhatsApp/share.
- Cota `pdf_export` da Mudança 19.
- Supabase/RLS/migrations.
- Segurança.
- Navegação principal.
- Dependências e `package.json`.

## 10. Testes alterados/adicionados

- `src/__tests__/registroLegacyChecklistRender.test.js`
  - PMOC/preventiva com equipamento abre e destaca checklist para Pro.
  - Tipo comum mantém checklist discreto.
  - Free/Plus recebem upsell contextual sem liberar checklist completo.
- `src/__tests__/pmocServiceType.test.js`
  - Reexecutado porque o helper da CP-C passou a ser usado no Registro.

## 11. Validação executada

- `npm run test -- src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/pmocServiceType.test.js`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

## 12. Riscos remanescentes

- Alertas e histórico ainda não usam o helper unificado de PMOC/preventiva.
- O realce visual usa classes/contratos existentes; refinamento visual amplo fica para fase de design.
- PMOC no relatório/PDF permanece para CP-E.
- O warning conhecido de ESLint em `src/domain/pdf/shareReport.js` permanece fora do escopo.
- Warnings Vite/chunk conhecidos permanecem como backlog controlado.

## 13. Próximo CP recomendado

CP-E — PMOC no relatório/PDF, preservando relatório técnico comum, PDF PMOC formal Pro e a cota `pdf_export` da Mudança 19.
