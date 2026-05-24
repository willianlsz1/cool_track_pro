# Mudança 20 / CP-A — Mapeamento PMOC e facilitação de uso

## 1. Estado inicial

- Branch: `main`
- HEAD confirmado localmente: `45753b2a40268680239179c9bace1a6a11edadf9`
- Working tree inicial: limpo
- Escopo: read-only/planejamento, sem mudança funcional.

Observação: o prompt informava HEAD `1bbf1dd317e2fcdc35a7aa16d576053807fc5b73`, mas a checagem local confirmou `45753b2a40268680239179c9bace1a6a11edadf9` como base real desta CP-A.

## 2. Onde PMOC existe hoje

### Documentos

- `docs/PMOC_ROADMAP.md`
  - Roadmap antigo/legado do PMOC.
  - Define PMOC formal como Pro-only.
  - Descreve fases de cliente, checklist, registro PMOC, PDF formal e dropdown de exportação.
- `docs/flow/mudanca-18-final-report.md`
  - Mantém PMOC avançado fora da Mudança 18.
- `docs/rewrite/checkpoints-recentes-resumo.md`
  - Consolida que billing/pricing e a monetização PDF/cotas antigas foram
    removidos.
  - Mantém PDF/share novo, WhatsApp novo e PMOC novo como etapas próprias.

### Core/domain

- `src/core/pmocProgress.js`
  - Calcula resumo PMOC por cliente.
  - Usa equipamentos vinculados ao cliente, registros do ano e tipos de serviço preventivos/PMOC.
  - Classifica status em `sem_dados`, `em_dia`, `atencao` ou `atrasado`.
  - Expõe última atualização e próxima manutenção.
- `src/core/clientePmoc.js`
  - Calcula detalhes PMOC para o painel de cliente.
  - Usa periodicidade preventiva do equipamento, último registro e próxima manutenção.
  - Classifica equipamentos como `sem_registro`, `em_dia` ou `vencido`.
- `src/domain/pmoc/checklistTemplates.js`
  - Catálogo de checklist NBR 13971 por tipo de equipamento.
  - Possui fallback genérico para tipos sem template específico.
  - Expõe `getChecklistTemplate`, `buildEmptyChecklist`, `validateChecklist` e `summarizeChecklist`.
- `src/domain/pdf/pmoc/*`
  - Gera o PDF PMOC formal.
  - Usa `generatePmocPdf()`, numeração local sequencial e seções de capa, cadastro, cronograma, plano, termo e anexos.

### Cliente

- `src/ui/views/clientes.js`
  - Importa `ClientePmocPanel`.
  - Trata `data-cli-action="pmoc-focus"` e `data-cli-action="open-pmoc-panel"`.
- `src/ui/viewModels/clientesViewModel.js`
  - Injeta `pmocSummary` no índice de clientes.
- `src/ui/components/clientePmocPanel.js`
  - Renderiza painel/modal PMOC do cliente.
  - Mostra status geral, realizadas/previstas, próxima manutenção, última atualização e equipamentos.
  - Permite registrar serviço para equipamento vencido ou sem registro.
  - Oferece ação para gerar documento PMOC.
- `src/__tests__/clientesView.pmoc.test.js`
  - Cobre resumo PMOC no card do cliente e abertura do painel.
- `src/__tests__/clientePmoc.test.js`
  - Cobre status geral e resumo operacional do painel.

### Equipamento

- `src/ui/views/equipamentos.js`
  - Modal de equipamento possui periodicidade preventiva (`eq-periodicidade`).
  - Ação pós-save pode abrir PMOC (`postAction = pmoc`) em alguns contextos.
  - KPIs e filtros usam IDs de preventiva vencendo/vencida.
- `src/features/equipamentos/crud/payload.js`
  - Coleta `periodicidadePreventivaDias`.
- `src/features/equipamentos/crud/persist.js`
  - Persiste `periodicidadePreventivaDias`.
- `src/features/equipamentos/ui/detail.js`
  - Mostra rotina preventiva e próxima preventiva no detalhe do equipamento.
- `src/features/equipamentos/ui/detailModel.js`
  - Monta os dados de próxima preventiva para o detalhe.
- `src/domain/alerts.js`
  - Calcula equipamentos com preventiva por vencer, mas filtra tipo exatamente como `preventiva`.

### Registro

- `src/ui/shell/templates/views.js`
  - Contém a seção `Checklist PMOC preenchível (NBR 13971)`.
  - Exibe selo "Recomendado p/ PMOC" quando o tipo é preventiva.
  - Exibe upsell para checklist PMOC em planos sem acesso.
- `src/ui/views/registro.js`
  - Renderiza checklist por equipamento selecionado.
  - Gating do checklist completo é Pro.
  - Checklist é soft-required para preventiva: avisa, mas não bloqueia o salvamento.
  - Salva checklist preenchido no payload do registro.
  - Após salvar, abre prompt de próxima preventiva.
- `src/features/registro/checklist/pmocChecklist.js`
  - Helpers puros para view model, coleta, clone, medida e warning soft-required.
- `src/ui/components/registroProximaPreventivaPrompt.js`
  - Pergunta quando o técnico volta ao equipamento: 30, 60, 90 dias ou sem retorno.
- `src/features/registro/save/postSave.js`
  - Chama prompt de próxima preventiva após save e após share direto.
- `src/__tests__/registroChecklistPmoc.contract.test.js`
  - Trava contratos públicos do checklist PMOC, soft-required e uso no PDF.
- `src/features/registro/__tests__/checklist/pmocChecklist.test.js`
  - Cobre helpers puros do checklist.
- `src/__tests__/registroProximaPreventivaPrompt.test.js`
  - Cobre o prompt de próxima preventiva.

### Relatório/PDF

- `src/ui/views/relatorio.js`
  - Calcula `pmocSummary` quando há contexto de cliente e plano Pro.
  - Integra PMOC ao view model do relatório.
- `src/ui/viewModels/relatorioViewModel.js`
  - Calcula próximas ações por `registro.proxima`.
  - Sinaliza atenção PMOC quando o resumo está em `atencao` ou `atrasado`.
- `src/ui/viewModels/relatorioContracts.js`
  - Define IDs e ações PMOC do relatório: `rel-dd-pmoc-main`, `rel-dd-pmoc-info`, `rel-dd-pmoc-nudge`, `open-pmoc-modal`, `open-pmoc-info`.
- `src/ui/controller/handlers/reportExportHandlers.js`
  - `bindPmocFormal()` registra `open-pmoc-modal` e `open-pmoc-info`.
  - Lazy-load de `PmocModal`, `generatePmocPdf`, perfil, estado e plano.
  - PMOC formal é Pro; em offline preserva cache de plano.
  - PMOC não foi misturado à cota `pdf_export` da Mudança 19.
- `src/ui/components/pmocModal.js`
  - Modal para gerar PMOC formal.
  - Free/Plus veem estado bloqueado com CTA para Pro.
  - Pro escolhe ano-base e cliente opcional.
- `src/ui/components/pmocInfoModal.js`
  - Explica PMOC, base legal e diferença entre relatório técnico e PMOC formal.
- `src/domain/pdf/pmoc/pmocReport.js`
  - Gera PDF formal e incrementa numeração local PMOC quando gera.
- Testes:
  - `src/__tests__/pmocReport.test.js`
  - `src/__tests__/pmocProgress.test.js`
  - `src/__tests__/pmocPdfLinks.security.test.js`
  - `src/__tests__/relatorioCompanyPmocContracts.test.js`
  - `src/__tests__/relatorioExportPmocLegacyHandlers.test.js`
  - `e2e/specs/relatorio-export-pmoc.spec.js`
  - `e2e/specs/relatorio-visual-smoke.spec.js`

### Navegação

- PMOC não é aba principal no mobile.
- PMOC aparece no menu de ajuda/header:
  - `data-action="open-pmoc-modal"`
  - `data-action="open-pmoc-info"`
- PMOC também aparece em Configurações como item de ajuda/atalho.
- Relatório tem dropdown/ações PMOC.
- Cliente tem painel PMOC contextual.

## 3. Fluxo atual do PMOC

Hoje o fluxo real do técnico é indireto:

1. Cadastra cliente em Clientes.
2. Cadastra equipamento e, opcionalmente, vincula ao cliente.
3. Define periodicidade preventiva do equipamento no cadastro/edição.
4. Registra serviço pelo fluxo normal de Registro.
5. Se o equipamento está selecionado e o plano é Pro, pode abrir o checklist PMOC recolhido.
6. Se o tipo do serviço é preventiva, o checklist é recomendado, mas não bloqueia.
7. Após salvar, o app pergunta quando o técnico volta ao equipamento.
8. A resposta grava `registro.proxima`.
9. Cliente e Relatório passam a calcular status/agenda a partir de equipamentos, registros, periodicidade e próxima preventiva.
10. O PMOC formal é gerado pelo modal/ação Pro, normalmente via Relatório, header/help ou painel do cliente.

Esse fluxo funciona tecnicamente, mas exige que o técnico descubra o PMOC por múltiplos pontos espalhados.

## 4. PMOC em Cliente, Equipamento, Registro e Relatório

### Cliente

- Cliente é o contexto mais completo hoje.
- O card recebe `pmocSummary`.
- O painel PMOC do cliente mostra:
  - status geral;
  - serviços realizados/previstos;
  - próxima manutenção;
  - última atualização;
  - equipamentos sem registro, vencidos ou em dia;
  - ação para registrar serviço;
  - ação para gerar documento PMOC.
- Fricção: o usuário precisa perceber/acionar o resumo PMOC do card; não há uma orientação inicial clara explicando "use isto para preventiva do cliente".

### Equipamento

- Equipamento já tem periodicidade preventiva.
- Detalhe mostra rotina preventiva e próxima preventiva.
- Há filtros/KPIs de preventivas.
- Fricção: PMOC não é apresentado como ação contextual de primeiro nível no detalhe do equipamento. O técnico vê rotina/próxima, mas o caminho para "registrar preventiva PMOC agora" não é tão explícito quanto o fluxo de campo pede.

### Registro

- Registro contém o checklist PMOC recolhido.
- Checklist depende de equipamento selecionado.
- Checklist completo é Pro.
- Preventiva sem checklist gera warning soft-required, mas salva.
- Próxima preventiva é definida depois do save por prompt.
- Fricção: PMOC aparece dentro do Registro, mas como seção avançada/recolhida. Para o técnico, o vínculo entre "vou fazer preventiva" e "preencher checklist PMOC" pode passar despercebido.

### Relatório/PDF

- Relatório mostra PMOC formal em contexto Pro.
- Dropdown/ações permitem abrir modal PMOC.
- PDF PMOC formal já existe e é separado do relatório técnico comum.
- PMOC formal é Pro e não deve consumir a cota `pdf_export` do relatório comum sem CP própria.
- Fricção: o PMOC formal é forte como documento final, mas a descoberta pelo técnico pode ficar tarde demais, só no momento de relatório.

### Histórico

- Histórico usa tipos e próximas preventivas como filtros/ações em alguns pontos.
- Registros com `proxima` alimentam próximas ações.
- Fricção: não há uma trilha PMOC estruturada por equipamento/cliente tão explícita quanto "histórico PMOC" ou "preventivas deste cliente".

### Planos/monetização

- PMOC formal aparece como diferencial Pro.
- Checklist PMOC completo no Registro é tratado como Pro.
- Free/Plus podem ver orientação e upsell, mas não devem liberar o recurso formal completo sem contrato.
- Fricção: a divisão entre orientação PMOC básica e PMOC formal Pro ainda não está consolidada em contrato de produto.

## 5. Fricções encontradas

- PMOC existe em vários lugares, mas não há um contrato único de "PMOC contextual".
- O ponto mais acionável para o técnico é o equipamento, mas o PMOC ainda aparece mais forte em Cliente/Relatório.
- O checklist PMOC no Registro é útil, mas fica recolhido e Pro-gated; pode parecer recurso escondido.
- A escolha "serviço preventivo" não conduz claramente para "checklist PMOC recomendado".
- O prompt de próxima preventiva aparece após salvar, mas não é apresentado como parte de um ciclo PMOC.
- O status PMOC por cliente depende de dados corretos de equipamento, periodicidade e registros; se esses dados faltam, o usuário recebe "sem cronograma" ou "atenção", mas ainda precisa entender o que fazer.
- `getPreventivaDueEquipmentIds()` filtra tipo exatamente como `preventiva`, enquanto outros pontos aceitam textos como manutenção preventiva, limpeza, higienização ou PMOC. Isso pode gerar divergência de indicadores.
- O PMOC formal Pro está relativamente maduro, mas o PMOC operacional básico ainda não é guiado.
- A geração PMOC via header/help pode ser descoberta antes de o usuário ter contexto de cliente/equipamento, gerando documento genérico ou bloqueio Pro sem orientar o próximo passo de campo.
- O roadmap antigo fala em módulo mais amplo, mas a direção atual pede facilitar o PMOC existente antes de ampliar.

## 6. Oportunidades de facilitação

- Transformar PMOC em orientação contextual, não em aba principal.
- No equipamento, destacar:
  - status preventivo simples;
  - última preventiva;
  - próxima preventiva;
  - ação "Registrar preventiva".
- No cliente, manter o painel PMOC, mas deixar mais clara a próxima ação operacional.
- No Registro, quando o tipo for preventiva e houver equipamento, abrir/realçar o checklist de forma leve, sem bloquear registro comum.
- Em Free/Plus, mostrar orientação PMOC básica e selo Pro para checklist completo/PMOC formal.
- Em Pro, reduzir passos para gerar PMOC formal a partir do contexto do cliente/equipamento.
- Padronizar a detecção de preventiva/PMOC entre alertas, progresso PMOC e Registro.
- Manter PMOC fora da bottom nav e fora de O.S/chamados.

## 7. Separação entre PMOC básico e PMOC avançado/Pro

### PMOC básico/contextual

Pode aparecer como orientação operacional sem liberar o PMOC formal:

- status preventivo simples em cliente/equipamento;
- última preventiva;
- próxima preventiva;
- periodicidade do equipamento;
- ação para registrar serviço preventivo;
- checklist recolhido como orientação, com upgrade para checklist completo quando aplicável;
- avisos leves de dados faltantes: sem periodicidade, sem primeiro registro, sem cliente vinculado.

### PMOC avançado/Pro

Deve continuar como recurso pago/Pro:

- PDF PMOC formal anual;
- checklist completo NBR 13971 preenchível;
- histórico PMOC estruturado;
- recorrência/cronograma anual detalhado;
- indicadores por cliente/equipamento;
- documento com termo de responsabilidade técnica e numeração.

## 8. Plano recomendado de CPs futuras

### CP-B — Contrato de PMOC contextual

- Definir estados oficiais: sem cronograma, em dia, atenção, atrasado/vencido.
- Definir fontes de verdade para preventiva: tipo de serviço, `registro.proxima`, periodicidade do equipamento e checklist.
- Definir o que Free/Plus podem ver como orientação.
- Definir o que continua Pro.
- Corrigir apenas documentação/contrato, ou helpers puros se houver CP de implementação.

### CP-C — PMOC no equipamento

- Mostrar status PMOC/preventiva no detalhe do equipamento.
- Mostrar última preventiva e próxima preventiva com CTA contextual.
- Adicionar ação "Registrar preventiva" usando `startServiceRegistration({ equipId })`.
- Evitar alteração de schema.
- Preservar fluxo global de Equipamentos.

### CP-D — Checklist PMOC no Registro

- Melhorar descoberta do checklist quando o tipo for preventiva.
- Manter checklist recolhido e não bloqueante para registro comum.
- Mostrar selo Pro para checklist completo.
- Preservar validação soft-required.
- Não alterar pós-save/PDF/WhatsApp.

### CP-E — PMOC no relatório/PDF

- Ajustar presença contextual da seção PMOC quando aplicável.
- Preservar PDF técnico comum.
- Preservar cota PDF da Mudança 19.
- Não misturar PMOC formal com monetização de PDF comum sem contrato explícito.

### CP-F — Fechamento documental da Mudança 20

- Consolidar decisões.
- Documentar comportamento final.
- Registrar validações e riscos remanescentes.

## 9. Riscos e pontos de atenção

- Risco de quebrar PDF/relatório ao mexer em `reportExportHandlers.js`, `shareReport.js` ou `src/domain/pdf/pmoc/*`.
- Risco de misturar PMOC com O.S/chamados, criando escopo administrativo maior que a fase.
- Risco de transformar PMOC em módulo pesado e pouco útil para técnico autônomo.
- Risco de bloquear registro comum com checklist obrigatório; o contrato atual é soft-required.
- Risco de conflitar com a monetização PDF/cotas da Mudança 19.
- Risco de alterar plano Pro sem contrato claro entre PMOC básico e avançado.
- Risco de divergência entre detectores de preventiva (`isPreventivaTipo`, `isPmocExecutionType` e `getPreventivaDueEquipmentIds`).
- Risco de depender demais de cliente/setor; equipamento deve continuar podendo existir e ser atendido sem setor.

## 10. Critérios de pronto da CP-A

- Nenhuma mudança funcional feita.
- Apenas este documento criado.
- Nenhuma alteração em `src/`, testes, CSS, configs, Supabase/RLS/migrations, Edge Functions, PDF/share runtime, monetização ou dependências.
- Validações executadas:
  - `npm run format`
  - `npm run build`
  - `npm run check`
  - `git diff --check`
- Working tree limpo ao final, após commit documental.
