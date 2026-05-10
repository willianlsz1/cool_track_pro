# Mudança 20 / CP-B — Contrato de PMOC contextual

## 1. Estado inicial

- Branch: `main`
- HEAD inicial confirmado localmente: `b505601948ec4645edbc4f45b771e2349697cf33`
- Working tree inicial: limpo
- Escopo: contrato técnico/produto, preferencialmente documental, sem mudança funcional.

Esta CP não altera `src/`, testes, CSS, configs, Supabase/RLS/migrations, Edge Functions, PDF/share runtime, monetização PDF/cotas, navegação ou dependências.

## 2. Objetivo do contrato

Esta CP define o contrato do PMOC contextual antes de qualquer alteração visual ou funcional.

O objetivo é separar claramente:

- PMOC básico/contextual: orientação operacional para o técnico em Cliente, Equipamento e Registro.
- PMOC avançado/Pro: checklist completo NBR 13971, PDF PMOC formal, cronograma/histórico estruturado e documento anual.

O PMOC contextual deve ajudar o técnico no campo, sem virar aba principal no mobile, sem se misturar com O.S/chamados e sem bloquear o registro comum.

## 3. Estados oficiais propostos

| Estado           | Significado                                                                            | Origem dos dados                                                                                  | Ação recomendada                                                                          |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `nao_aplicavel`  | Não há equipamento, contexto técnico ou dado mínimo para avaliar PMOC/preventiva.      | Ausência de `equipamentoId`, `clienteId` ou lista de equipamentos no contexto.                    | Não mostrar cobrança; orientar cadastro ou seleção de equipamento quando fizer sentido.   |
| `sem_cronograma` | Há contexto, mas não há periodicidade preventiva ou agenda suficiente.                 | `equipamento.periodicidadePreventivaDias` ausente/inválido e sem `registro.proxima` útil.         | Orientar definir periodicidade preventiva ou registrar primeira preventiva.               |
| `sem_registro`   | Há equipamento e periodicidade/cronograma, mas nenhuma preventiva/PMOC foi registrada. | Equipamento com periodicidade ou agenda, sem registros preventivos/PMOC vinculados.               | Sugerir registrar preventiva.                                                             |
| `em_dia`         | A próxima preventiva está futura e fora da janela de atenção.                          | `registro.proxima` futura ou cálculo por último registro + periodicidade.                         | Mostrar status positivo e manter CTA secundário para registrar serviço quando necessário. |
| `atencao`        | A próxima preventiva está próxima de vencer ou há dado incompleto que exige revisão.   | Próxima preventiva dentro da janela de atenção; ou cliente/equipamento com lacuna não crítica.    | Mostrar pendência leve e CTA para revisar/registrar preventiva.                           |
| `vencido`        | A preventiva está vencida.                                                             | `registro.proxima` passada ou cálculo por último registro + periodicidade menor que a data atual. | Priorizar CTA "Registrar preventiva".                                                     |

Compatibilidade com estados existentes:

- `src/core/pmocProgress.js` usa `sem_dados`, `em_dia`, `atencao` e `atrasado`.
- `src/core/clientePmoc.js` usa cliente em `sem_cronograma`, `em_dia`, `atencao` e `atrasado`, e equipamento em `sem_registro`, `em_dia` e `vencido`.
- O contrato contextual proposto deve tratar `sem_dados` como equivalente legado de `sem_cronograma` em telas que ainda consumam `pmocProgress`.
- O contrato contextual proposto deve tratar `atrasado` como equivalente agregado de `vencido` em resumo por cliente.

## 4. Fontes de verdade

Prioridade recomendada para status PMOC/preventiva:

1. Equipamento selecionado ou vinculado:
   - `equipamento.id`
   - `equipamento.clienteId` ou `equipamento.cliente_id`
   - `equipamento.periodicidadePreventivaDias`
2. Registros vinculados ao equipamento:
   - `registro.equipId` ou `registro.equip_id`
   - `registro.data`
   - `registro.tipo`
   - `registro.proxima`
   - `registro.checklist`
3. Sinal de preventiva/PMOC:
   - tipo de serviço preventiva/PMOC;
   - checklist PMOC preenchido;
   - próxima preventiva marcada no pós-save.
4. Contexto de cliente:
   - cliente atual;
   - equipamentos vinculados ao cliente;
   - setores apenas como agrupamento, não como pré-requisito.
5. PMOC formal:
   - ano-base;
   - cliente opcional;
   - perfil/plano Pro;
   - dados legais do técnico e documento formal.

Regras de precedência:

- `registro.proxima` deve prevalecer sobre cálculo automático quando estiver presente e válido.
- Na ausência de `registro.proxima`, usar último registro preventivo/PMOC + `periodicidadePreventivaDias`.
- Na ausência de registro, mas com periodicidade definida, o estado deve ser `sem_registro`.
- Na ausência de periodicidade e de agenda, o estado deve ser `sem_cronograma`.
- Checklist PMOC preenchido conta como evidência de execução PMOC, mas não deve ser a única fonte de próxima preventiva.
- Cliente deve agregar o pior estado operacional dos equipamentos: `vencido/atrasado` > `atencao` > `sem_registro/sem_cronograma` > `em_dia`.

## 5. Detecção de preventiva/PMOC

Helpers e critérios existentes:

- `src/ui/helpers/registroPure.js`
  - `isPreventivaTipo(tipoValue)` retorna verdadeiro quando o texto contém `preventiva`.
- `src/core/pmocProgress.js`
  - `isPmocExecutionType(tipo)` é local ao módulo.
  - Conta `preventiv`, `limpeza`, `higieniz` e `pmoc`, exceto quando contém `corretiv`.
- `src/domain/alerts.js`
  - `getPreventivaDueEquipmentIds()` exige `tipo === 'preventiva'`.
- `src/features/registro/checklist/pmocChecklist.js`
  - Recebe `isPreventivaTipo` por injeção para warning soft-required.

Divergência atual:

- Registro considera apenas texto contendo `preventiva`.
- Progresso PMOC considera preventiva, limpeza, higienização e PMOC.
- Alertas de preventiva em 7 dias consideram apenas tipo exatamente igual a `preventiva`.

Contrato proposto:

- Termos que contam como preventiva operacional:
  - `preventiva`;
  - `manutencao preventiva`;
  - `manutenção preventiva`;
  - `limpeza preventiva`;
  - `higienizacao`;
  - `higienização`.
- Termos que contam como PMOC:
  - `pmoc`;
  - `preventiva pmoc`;
  - `checklist pmoc`.
- PMOC deve contar como preventiva para status contextual.
- Corretiva não deve contar como preventiva/PMOC, mesmo que contenha texto incidental.
- Checklist PMOC preenchido deve reforçar evidência de PMOC, mas a classificação principal do serviço ainda deve vir de `registro.tipo`.

Helper futuro recomendado:

- `isPreventivaLikeServiceType(tipo)`
- `isPmocLikeServiceType(tipo)`
- `isPmocOrPreventivaServiceType(tipo)`

Decisão desta CP: não criar helper puro ainda. O helper deve entrar na CP-C ou CP-D junto com os primeiros usos reais e testes de regressão, para evitar contrato morto ou alteração funcional acidental.

## 6. Divisão Free/Plus/Pro

### Free/Plus

Podem ver orientação básica/contextual:

- status simples de preventiva/PMOC;
- última preventiva;
- próxima preventiva;
- periodicidade preventiva do equipamento;
- alerta de dados faltantes;
- ação para registrar serviço preventivo comum;
- indicação de que checklist completo e PMOC formal são Pro.

Não devem receber automaticamente:

- PDF PMOC formal;
- checklist NBR 13971 completo liberado;
- cronograma anual detalhado;
- histórico PMOC estruturado avançado;
- indicadores avançados por cliente/equipamento.

### Pro

Pode usar recursos avançados:

- checklist PMOC completo no Registro;
- PDF PMOC formal anual;
- painel avançado com cronograma mais completo;
- histórico PMOC estruturado;
- documento com termo de responsabilidade técnica e numeração;
- indicadores por cliente/equipamento quando implementados.

## 7. Contrato por contexto

### Cliente

Contrato contextual:

- mostrar resumo PMOC/preventiva agregado;
- listar equipamentos em `vencido`, `atencao`, `sem_registro` ou `sem_cronograma`;
- priorizar a próxima ação operacional por equipamento;
- manter ação para registrar serviço/preventiva;
- manter ação Pro para gerar PMOC formal.

Contrato de plano:

- Free/Plus podem ver status básico e orientação.
- Pro mantém documento formal e recursos avançados.

### Equipamento

Contrato contextual:

- exibir status PMOC/preventiva no detalhe do equipamento;
- exibir periodicidade preventiva;
- exibir última preventiva;
- exibir próxima preventiva;
- oferecer CTA "Registrar preventiva" quando houver contexto suficiente.

Regras:

- Equipamento pode existir sem cliente e sem setor.
- Setor não deve ser requisito para PMOC contextual.
- Sem periodicidade deve ser orientação de dado faltante, não erro.

### Registro

Contrato contextual:

- se tipo preventiva/PMOC e equipamento selecionado, checklist PMOC deve ficar mais descobrível;
- checklist deve continuar recolhido ou leve, sem bloquear registro comum;
- warning soft-required deve continuar como orientação, não validação bloqueante;
- o fluxo pós-save de próxima preventiva deve ser preservado.

Contrato de plano:

- Free/Plus podem ver orientação e upgrade para checklist completo.
- Pro pode preencher checklist completo.

### Relatório/PDF

Contrato contextual:

- preservar relatório técnico comum;
- preservar PMOC formal Pro separado;
- não misturar automaticamente relatório técnico com PMOC formal;
- não consumir `pdf_export` da Mudança 19 para PMOC formal sem CP dedicada e contrato explícito;
- preservar WhatsApp/share comum.

Contrato de plano:

- Free/Plus podem ver explicação/upsell do PMOC formal.
- Pro gera PMOC formal.

### Histórico/alertas

Contrato contextual:

- usar a mesma detecção de preventiva/PMOC que Cliente, Equipamento e Registro quando o helper for implementado;
- alertas devem considerar `registro.proxima` e os termos preventivos padronizados;
- histórico deve permitir reconhecer preventivas sem exigir módulo administrativo novo.

## 8. CPs futuras recomendadas

### CP-C — PMOC no equipamento

- Criar helper puro de detecção preventiva/PMOC se for usado imediatamente.
- Mostrar status contextual no detalhe do equipamento.
- Mostrar última preventiva, próxima preventiva e periodicidade.
- Adicionar CTA "Registrar preventiva" usando o entrypoint existente de Registro.
- Não alterar schema, PDF/share ou navegação.

### CP-D — Checklist PMOC no Registro

- Melhorar descoberta do checklist quando tipo preventiva/PMOC for selecionado.
- Preservar soft-required.
- Preservar registro comum.
- Manter checklist completo como Pro.

### CP-E — PMOC no relatório/PDF

- Ajustar presença contextual de PMOC no relatório quando aplicável.
- Preservar PDF técnico comum e cota PDF da Mudança 19.
- Preservar PMOC formal como Pro.

### CP-F — Fechamento documental

- Consolidar comportamento final da Mudança 20.
- Registrar validações, riscos e backlog.

## 9. Riscos e pontos de atenção

- Risco de quebrar PDF/relatório ao mexer em `reportExportHandlers.js`, `shareReport.js` ou `src/domain/pdf/pmoc/*`.
- Risco de bloquear registro comum se checklist PMOC virar obrigatório.
- Risco de manter divergência entre detectores de preventiva/PMOC.
- Risco de misturar PMOC básico/contextual com PMOC formal Pro.
- Risco de conflitar com a cota `pdf_export` da Mudança 19.
- Risco de transformar PMOC em módulo administrativo pesado.
- Risco de criar helper puro sem uso real, aumentando contrato morto.
- Risco de tratar setor ou cliente como requisito obrigatório para PMOC, quebrando o fluxo de técnico autônomo.

## 10. Critérios de pronto

- Documento de contrato criado.
- Nenhuma mudança funcional feita.
- Nenhum helper puro criado nesta CP.
- Nenhuma alteração em `src/`, testes, CSS, configs, Supabase/RLS/migrations, Edge Functions, PDF/share runtime, monetização, navegação ou dependências.
- Validações executadas:
  - `npm run format`
  - `npm run build`
  - `npm run check`
  - `git diff --check`
- Working tree limpo ao final, após commit documental.
