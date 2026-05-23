# Etapa 8 - Integracao operacional do shell app-v2 com a store mockada

Status: executada.

Data: 2026-05-12.

Branch: `codex/rewrite-zero-react-parallel`.

HEAD inicial: `c27abf8170547309abb54688c0503832b0e3919f`.

## 1. Objetivo

Fechar a lacuna encontrada na Etapa 7: o `AppV2Shell` ja usava partes da
fundacao mockada, mas a conclusao manual do Registro de Servico ainda nao era
aplicada ao estado exibido pela Central de Servicos.

A Etapa 8 integrou o shell ao snapshot mockado unico em runtime, sem mudar UI
visual, CSS/tokens, app legado ou integracoes reais.

## 2. Base analisada

Documentos analisados:

- `AGENTS.md`;
- `CONTEXT.md`;
- `docs/rewrite/etapa-0-plano-mestre.md`;
- `docs/rewrite/etapa-6-fundacao-fluxo-dados-plano.md`;
- `docs/rewrite/fortalecimento-app-v2-status.md`;
- `docs/rewrite/etapa-7-qa-funcional-app-v2.md`.

Arquivos de codigo analisados:

- `src/app-v2/shell/AppV2Shell.tsx`;
- `src/app-v2/data/appV2Actions.ts`;
- `src/app-v2/data/appV2Selectors.ts`;
- `src/app-v2/data/appV2MockStore.ts`;
- `src/app-v2/home/HomeToday.tsx`;
- `src/app-v2/equipment/EquipmentList.tsx`;
- `src/app-v2/equipment/EquipmentDetail.tsx`;
- `src/app-v2/service/ServiceFlow.tsx`;
- `src/app-v2/service/ServicesHome.tsx`.

## 3. Como o shell estava antes

Fato documentado:

- `AppV2Shell` criava um snapshot mockado fora do componente;
- `serviceFlowInput` e `servicesHomeInput` eram derivados uma vez, em escopo de
  modulo;
- iniciar servico chamava a acao pura `startServiceFromEquipment`;
- concluir servico apenas avancava o `ServiceFlow` para a etapa `done`;
- ao voltar para Servicos, a Central ainda recebia o draft como servico em
  andamento.

Inferencia:

- a fundacao pura estava correta, mas o runtime do shell ainda era parcialmente
  demonstrativo.

## 4. Como ficou

Mudancas executadas:

- `AppV2Shell` passou a manter um `AppV2FlowState` em estado React;
- Home, Equipamentos, Registro e Central passaram a receber inputs derivados de
  `selectAppV2OperationalState(appState)`;
- iniciar servico atualiza o mesmo estado mockado usado pelas telas;
- alteracoes de draft durante o Registro atualizam `appState.serviceDraft`;
- ao sair da tela final do servico, o shell chama `completeService`;
- a Central deixa de mostrar servico em andamento e passa a listar o novo
  registro recente;
- `HomeToday`, `EquipmentList` e `EquipmentDetail` preservam compatibilidade com
  mocks internos, mas aceitam input operacional vindo do shell.

Nao foi alterado:

- layout;
- CSS/tokens;
- app legado;
- `package.json` ou `package-lock.json`;
- Supabase;
- storage real;
- `localStorage`;
- PDF/share;
- WhatsApp;
- billing;
- PMOC;
- assinatura;
- orcamento real;
- relatorio real.

## 5. Arquivos alterados

Codigo:

- `src/app-v2/shell/AppV2Shell.tsx`;
- `src/app-v2/shell/AppV2Shell.test.tsx`;
- `src/app-v2/service/ServiceFlow.tsx`;
- `src/app-v2/home/HomeToday.tsx`;
- `src/app-v2/home/homeViewModel.ts`;
- `src/app-v2/equipment/EquipmentList.tsx`;
- `src/app-v2/equipment/EquipmentDetail.tsx`.

Documentacao:

- `docs/rewrite/etapa-8-integracao-shell-store.md`.

Tambem permanece no working tree, vindo da etapa anterior:

- `docs/rewrite/etapa-7-qa-funcional-app-v2.md`.

## 6. Fluxos validados

Fluxo coberto por teste focado:

1. abrir o shell app-v2;
2. iniciar servico pela Home;
3. passar por contexto;
4. selecionar tipo de servico;
5. preencher diagnostico e acoes executadas;
6. revisar;
7. concluir servico;
8. voltar para Servicos;
9. confirmar que a Central nao mostra mais `EM ANDAMENTO`;
10. confirmar que o novo registro aparece com diagnostico e acoes do fluxo.

Estados cobertos:

- selecao de equipamento pela proxima acao;
- servico em andamento;
- conclusao mockada;
- criacao de registro recente;
- Central recalculada a partir do mesmo snapshot;
- preservacao das saidas futuras mockadas existentes.

## 7. Teste TDD

Foi criado primeiro o teste:

- `src/app-v2/shell/AppV2Shell.test.tsx`.

Resultado antes da correcao:

- falhou porque, apos `Voltar para Servicos`, o shell ainda exibia
  `Pronto para revisao`.

Resultado apos a correcao:

- passou, provando que a Central passou a consumir o estado mockado atualizado.

## 8. Riscos remanescentes

- a store continua sendo mockada e nao deve ser tratada como storage real;
- os registros criados pelo shell usam id deterministico de mock;
- a conclusao e aplicada ao sair da tela final, nao ao clicar em saidas futuras;
- relatorio, WhatsApp, orcamento, PMOC, assinatura, billing, Supabase e storage
  real continuam fora do escopo;
- proximas etapas visuais devem continuar consumindo seletores e acoes, sem
  recriar mocks por tela.

## 9. Percentual

Fundacao pura app-v2: **100%**.

Prontidao funcional/manual do shell app-v2 apos Etapa 8: **95%**.

Justificativa:

- a lacuna principal da Etapa 7 foi fechada;
- o shell agora usa o mesmo estado mockado para iniciar e concluir servico;
- Home, Equipamentos e Central recebem dados derivados do snapshot operacional;
- ainda faltam QA manual amplo em navegador e futuras etapas proprias para saidas
  reais.

## 10. Proximo passo recomendado

Executar **Etapa 9 - QA manual ampliado da navegacao app-v2** antes de qualquer
refinamento visual.

Escopo recomendado:

- validar manualmente Home -> Registro -> Central depois da Etapa 8;
- validar Home -> Ver equipamento -> iniciar servico -> ver equipamento;
- validar bottom nav apos conclusao;
- validar que nao existem mocks divergentes visiveis em Home, Equipamentos e
  Servicos;
- manter tudo sem CSS/tokens e sem integracoes reais.
