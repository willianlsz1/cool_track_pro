# Mudanca 20 - Relatorio final de PMOC contextual

## 1. Estado final

- Branch: `main`
- HEAD inicial da Mudanca 20: `b505601948ec4645edbc4f45b771e2349697cf33`
- HEAD local inicial real da CP-A: `45753b2a40268680239179c9bace1a6a11edadf9`
- HEAD final atual: `fa04e66cdc1c286ba1d16a60572c77d3c7f4e28f`
- Working tree esperado: limpo

## 2. Resumo executivo

A Mudanca 20 facilitou o uso pratico do PMOC sem criar um modulo administrativo pesado.

O resultado operacional da fase foi:

- O PMOC atual foi mapeado entre Cliente, Equipamento, Registro e Relatorio/PDF.
- O contrato contextual foi definido antes das mudancas funcionais.
- O detalhe do equipamento ganhou status PMOC/preventiva, periodicidade, ultima preventiva, proxima preventiva e recomendacao.
- O Registro passou a destacar o checklist PMOC quando o atendimento tem equipamento selecionado e tipo preventiva/PMOC.
- O relatorio comum e o PDF comum ganharam resumo PMOC/preventivo contextual quando aplicavel.
- O PDF PMOC formal permaneceu separado e Pro.
- Registro comum, WhatsApp/share, pos-save e cota `pdf_export` foram preservados.

Esta fase nao implementou O.S/chamados, redesign amplo, React Doctor, novas regras de cota PDF, alteracoes em Supabase/RLS/migrations ou mudancas de seguranca.

## 3. CPs concluidas

### CP-A - Mapeamento PMOC e facilitacao de uso

- Commit: `b505601948ec4645edbc4f45b771e2349697cf33`
- Documento criado: `docs/pmoc/mudanca-20-cp-a-mapeamento-pmoc-fluxo.md`
- Resultado:
  - Mapeou PMOC espalhado entre Cliente, Equipamento, Registro e Relatorio/PDF.
  - Identificou checklist util, mas pouco contextual no Registro.
  - Identificou divergencias de deteccao preventiva/PMOC.
  - Documentou a necessidade de separar PMOC basico/contextual de PMOC avancado/Pro.

### CP-B - Contrato de PMOC contextual

- Commit: `4894bea04066e2e8611979c2505fe7548f4993b6`
- Documento criado: `docs/pmoc/mudanca-20-cp-b-contrato-pmoc-contextual.md`
- Resultado:
  - Definiu estados oficiais:
    - `nao_aplicavel`
    - `sem_cronograma`
    - `sem_registro`
    - `em_dia`
    - `atencao`
    - `vencido`
  - Documentou compatibilidade com os estados legados `sem_dados` e `atrasado`.
  - Definiu a divisao Free/Plus/Pro:
    - Free/Plus podem ver orientacao basica, status, proxima preventiva e CTA de registro comum.
    - Pro mantem checklist completo, PDF PMOC formal, historico/cronograma estruturado e documento com termo/numeracao.

### CP-C - PMOC no equipamento

- Commit: `2f2b7629727af7e0135a4f13959f1540a5eaf0b9`
- Documento criado: `docs/pmoc/mudanca-20-cp-c-pmoc-no-equipamento.md`
- Resultado:
  - O detalhe do equipamento passou a mostrar bloco contextual PMOC/preventiva.
  - O bloco mostra status, periodicidade, ultima preventiva, proxima preventiva e recomendacao.
  - O CTA "Registrar preventiva" reaproveita o fluxo existente de Registro.
  - Foi criado o helper puro `src/domain/pmoc/serviceType.js`.

### CP-D - Checklist PMOC no Registro

- Commit: `2adf38ee187d52df8e87447a4d72039204e0654a`
- Documento criado: `docs/pmoc/mudanca-20-cp-d-checklist-pmoc-registro.md`
- Resultado:
  - Registro passou a usar o helper PMOC/preventiva para tornar o checklist mais descobrivel.
  - O destaque ocorre quando ha equipamento selecionado e tipo preventiva/PMOC.
  - Para Pro, o checklist e destacado e aberto.
  - Para Free/Plus, ha orientacao/upsell sem liberar checklist completo.
  - O contrato soft-required foi preservado: preventiva sem checklist recomenda, mas nao bloqueia salvamento.

### CP-E - PMOC no relatorio/PDF

- Commit: `fa04e66cdc1c286ba1d16a60572c77d3c7f4e28f`
- Documento criado: `docs/pmoc/mudanca-20-cp-e-pmoc-relatorio-pdf.md`
- Resultado:
  - Foi criado helper puro para montar resumo PMOC/preventivo contextual.
  - O relatorio comum mostra o bloco apenas quando o registro e preventiva/PMOC ou tem checklist PMOC preenchido.
  - O PDF comum inclui o mesmo resumo no card do servico quando aplicavel.
  - O PDF PMOC formal continua separado e Pro.

## 4. Validacoes consolidadas

As CPs da Mudanca 20 passaram por:

- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- testes focados por area

Validacoes principais executadas ao longo da fase:

- `pmocServiceType.test.js`
- `detailModel.test.js`
- `detail.test.js`
- `registroLegacyChecklistRender.test.js`
- `registroChecklistPmoc.contract.test.js`
- `pmocChecklist.test.js`
- `pmocReportContext.test.js`
- `relatorioCardsIsland.test.jsx`
- `pdfGenerator.mediaChecklist.contract.test.js`
- testes ampliados de PMOC/relatorio/PDF/export handlers

Warnings conhecidos preservados como backlog controlado:

- warnings Vite/chunk permanecem.
- 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` permanece.

## 5. Comportamento final esperado

O fluxo esperado apos a Mudanca 20 e:

- Tecnico abre um equipamento e ve status preventivo/PMOC.
- Tecnico ve periodicidade, ultima preventiva, proxima preventiva e recomendacao.
- Tecnico pode registrar preventiva pelo fluxo existente.
- No Registro, preventiva/PMOC com equipamento selecionado destaca o checklist.
- Free/Plus veem orientacao/upsell.
- Pro usa checklist completo.
- Preventiva sem checklist recomenda, mas nao bloqueia.
- Relatorio comum mostra resumo PMOC contextual quando aplicavel.
- PDF comum inclui o resumo contextual quando aplicavel.
- PDF PMOC formal continua separado e Pro.

## 6. Preservado fora do escopo

- Registro comum nao foi bloqueado.
- WhatsApp/share nao foi alterado.
- Pos-save nao foi alterado.
- Cota `pdf_export` nao foi alterada.
- PDF PMOC formal permaneceu separado e Pro.
- Checklist completo permaneceu Pro.
- Supabase/RLS/migrations nao foram alterados.
- `package.json` e `package-lock.json` nao foram alterados.
- Navegacao principal nao foi alterada.

## 7. Riscos remanescentes

- Detectores legados de PMOC/preventiva ainda nao foram unificados em alertas/historico.
- O bloco visual usa estilos existentes, sem refinamento visual amplo.
- PDF PMOC formal segue area sensivel e deve continuar isolado.
- PMOC formal continua separado e Pro.
- Checklist completo continua Pro.
- Cota `pdf_export` nao foi alterada.
- Warnings Vite/chunk permanecem.
- Warning ESLint conhecido em `src/domain/pdf/shareReport.js` permanece.

## 8. Proximas fases recomendadas

### Mudanca 21 - Design/copy/refinamento visual

Escopo provavel:

- refinamento visual do bloco PMOC;
- linguagem do PMOC para tecnico e cliente;
- cards, modais e estados vazios;
- densidade;
- copy comercial e nao comercial;
- possivel modal dedicado de upgrade.

### Mudanca futura - Alertas/historico PMOC

Escopo provavel:

- unificar detectores legados;
- alinhar alertas, historico e filtros com helper PMOC/preventiva;
- nao misturar com PDF PMOC formal.

### O.S/Chamados

Manter em backlog proprio.

### React Doctor

Manter como backlog tecnico separado.

## 9. Criterios de pronto

- Apenas documentacao criada/alterada nesta CP-F.
- Nenhuma mudanca funcional feita.
- Nenhuma alteracao em `src/`, testes, CSS, configs, Supabase/RLS, migrations, PDF/share runtime, cota `pdf_export`, WhatsApp/share, `package.json`, `package-lock.json`, React Doctor, redesign amplo ou O.S/chamados.
- Working tree limpo apos commit.
- Validacoes obrigatorias executadas.
