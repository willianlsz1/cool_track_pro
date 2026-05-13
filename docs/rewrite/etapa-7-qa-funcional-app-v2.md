# Etapa 7 - QA funcional/manual da fundacao app-v2

Status: executada como checkpoint de QA funcional e documental.

Data: 2026-05-12.

Branch: `codex/rewrite-zero-react-parallel`.

HEAD inicial: `c27abf8170547309abb54688c0503832b0e3919f`.

## 1. Escopo

Objetivo: validar manualmente a coerencia funcional da fundacao mockada do
`app-v2` antes de qualquer refinamento visual.

Incluido:

- leitura de `AGENTS.md`, `CONTEXT.md` e `docs/rewrite`;
- leitura seletiva de `src/app-v2`;
- verificacao da navegacao entre Home, Equipamentos, Registro de Servico e
  Central de Servicos;
- verificacao das acoes puras, seletores e mocks contra a experiencia manual;
- criacao deste relatorio de QA funcional/manual.

Fora do escopo:

- redesign;
- mudanca visual;
- CSS/tokens/tema;
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

## 2. Base analisada

Documentos analisados:

- `AGENTS.md`;
- `CONTEXT.md`;
- `docs/rewrite/etapa-0-plano-mestre.md`;
- `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`;
- `docs/rewrite/etapa-0-stack-e-regras-agentes.md`;
- `docs/rewrite/etapa-6-fundacao-fluxo-dados-plano.md`;
- `docs/rewrite/fortalecimento-app-v2-status.md`;
- planos e designs das etapas 2 a 5 em `docs/rewrite`.

Arquivos funcionais relevantes do `app-v2`:

- `src/app-v2/data/appV2MockData.ts`;
- `src/app-v2/data/appV2MockStore.ts`;
- `src/app-v2/data/appV2Actions.ts`;
- `src/app-v2/data/appV2Selectors.ts`;
- `src/app-v2/data/appV2Flow.test.ts`;
- `src/app-v2/shell/AppV2Shell.tsx`;
- `src/app-v2/home/*`;
- `src/app-v2/equipment/*`;
- `src/app-v2/service/*`.

## 3. Fluxos mapeados

### Home

Fato documentado:

- a Home exibe a proxima acao operacional;
- a fila curta vem do estado mockado;
- o fluxo pode iniciar um servico a partir da proxima acao;
- a regra pura de prioridade permanece coberta por teste.

Inferencia:

- a Home cumpre o papel principal da v2: ao abrir o app, o tecnico entende a
  proxima acao em poucos segundos.

### Equipamentos

Fato documentado:

- Equipamentos possui lista, detalhe e vinculo com cliente/local;
- a fonte mockada esta consolidada em `src/app-v2/data`;
- o fluxo pode iniciar servico a partir de equipamento.

Inferencia:

- Equipamentos funciona como contexto operacional do ativo, nao como tela
  principal de cliente.

### Registro de Servico

Fato documentado:

- o fluxo manual passa por contexto, tipo, execucao, revisao e conclusao;
- a tela de finalizacao mostra saidas futuras como indisponiveis nesta etapa;
- as acoes puras de fluxo existem fora do React.

Inferencia:

- o fluxo esta bom para validar fundacao, mas ainda nao deve ser confundido com
  persistencia, relatorio real, agenda real ou orcamento real.

### Central de Servicos

Fato documentado:

- a Central exibe servico em andamento, registros recentes e saidas futuras
  mockadas;
- existem estados mockados como `relatorio_pendente`, `orcamento_sugerido` e
  proximo compromisso;
- os testes puros cobrem equipamento -> servico -> registro -> central.

Inferencia:

- a Central tem o contrato certo para receber o resultado do fluxo, mas o shell
  executavel ainda nao aplica a acao pura de conclusao no estado exibido.

## 4. QA manual executado

Ambiente:

- servidor local Vite em `http://127.0.0.1:5177/src/app-v2/preview.html`;
- viewport mobile usado no QA automatizado/manual: `390x844`;
- ferramenta: Playwright em modo headless via Node.

Passos executados:

1. Abrir preview do app-v2.
2. Confirmar Home com proxima acao, fila curta e bottom nav.
3. Acionar `Iniciar servico` pela Home.
4. Confirmar contexto do equipamento e cliente/local.
5. Selecionar tipo `Preventiva`.
6. Preencher diagnostico e acoes executadas.
7. Revisar dados do servico.
8. Concluir servico.
9. Confirmar tela `Servico concluido`.
10. Voltar para `Servicos`.

Resultado:

- Home carregou com acao principal e fila curta.
- Inicio do servico pela Home abriu o Registro de Servico.
- Etapas de contexto, tipo, execucao, revisao e conclusao funcionaram.
- Tela final exibiu o resumo do servico concluido.
- Saidas futuras permaneceram explicitamente indisponiveis nesta etapa.
- Ao voltar para Servicos, a Central ainda exibiu o mesmo servico como
  `EM ANDAMENTO` / `Pronto para revisao`.

## 5. Checklist funcional/manual

| Area                     | Criterio manual                                           | Status   |
| ------------------------ | --------------------------------------------------------- | -------- |
| Home                     | Exibe a proxima acao operacional ao abrir o app           | OK       |
| Home                     | Permite iniciar servico pela acao principal               | OK       |
| Home                     | Exibe fila curta coerente com compromissos mockados       | OK       |
| Equipamentos             | Mantem cliente/local como contexto do equipamento         | OK       |
| Registro de Servico      | Abre com equipamento e cliente/local corretos             | OK       |
| Registro de Servico      | Passa por contexto, tipo, execucao, revisao e conclusao   | OK       |
| Registro de Servico      | Nao promete relatorio, WhatsApp, orcamento ou agenda real | OK       |
| Central de Servicos      | Exibe registros recentes mockados                         | OK       |
| Central de Servicos      | Exibe saidas futuras mockadas                             | OK       |
| Central de Servicos      | Recebe conclusao manual como novo registro visivel        | Pendente |
| Estado operacional shell | Limpa servico em andamento apos conclusao manual          | Pendente |
| Estado operacional shell | Recalcula Home/Equipamentos/Servicos apos acao manual     | Pendente |

## 6. Inconsistencias encontradas

### 6.1 Conclusao manual nao atualiza a Central

Fato documentado:

- as acoes puras em `appV2Actions.ts` conseguem concluir servico, criar
  registro recente e atualizar o estado em testes sem UI;
- no QA manual, apos concluir o servico e voltar para Servicos, a Central ainda
  mostra o servico como em andamento.

Inferencia:

- o shell executavel ainda nao aplica `completeService` ao snapshot que alimenta
  a Central no momento da conclusao manual;
- a fundacao pura esta coberta, mas a ponte shell -> store mockada ainda precisa
  ser fechada antes de refinamento visual.

Decisao:

- nao corrigir nesta etapa, porque a correcao envolve estado operacional do
  shell e deve ser checkpoint tecnico proprio, com teste focado.

Risco:

- se avancar para UI agora, o app pode parecer melhor visualmente enquanto a
  jornada manual ainda preserva estado antigo.

### 6.2 Snapshot inicial ainda tem papel forte no shell

Fato documentado:

- `AppV2Shell` deriva partes da experiencia a partir do snapshot mockado;
- acoes puras existem, mas nem todas as transicoes manuais aplicam essas acoes ao
  estado usado pelas telas.

Inferencia:

- a Etapa 6 fechou a fundacao pura; a Etapa 7 mostra que falta consolidar a
  integracao runtime do shell com essa fundacao.

Risco:

- novas telas podem voltar a inventar estado local se esse ponto nao for tratado
  antes de refinamento visual.

## 7. Correcoes feitas

Nenhuma correcao funcional foi feita.

Motivo: as inconsistencias encontradas sao pequenas no produto mockado, mas
tocam a integracao de estado do shell. Pela regra desta etapa, quando houver
duvida entre corrigir agora ou documentar, a preferencia e documentar.

## 8. Validacoes planejadas

Executar apos este documento:

- `npm run format:check`;
- `npm run typecheck`;
- testes focados do app-v2;
- `npm run build`;
- `npm run check`;
- `git diff --check`;
- `git status --short -uall`.

## 9. Riscos remanescentes

- a fundacao pura esta validada, mas a conclusao manual ainda nao atualiza a
  Central no runtime;
- Home, Equipamentos e Servicos ainda devem ser revalidados depois que o shell
  passar a aplicar todas as acoes puras ao snapshot em memoria;
- `relatorio_pendente`, `orcamento_sugerido` e proximo compromisso continuam
  mockados e nao devem ser tratados como integracao real;
- qualquer mudanca futura em storage, Supabase, PDF/share, WhatsApp, billing,
  PMOC, assinatura ou orcamento real continua exigindo etapa propria.

## 10. Percentual e recomendacao

Percentual da fundacao pura apos Etapa 6/6.1: **100%**.

Percentual de prontidao funcional/manual do shell app-v2 apos Etapa 7: **85%**.

Justificativa:

- contratos, store mockada, acoes puras, seletores e testes de fluxo continuam
  consolidados;
- o QA manual confirmou a jornada ate a conclusao;
- a lacuna restante esta na aplicacao runtime da conclusao ao estado exibido pela
  Central.

Proxima acao recomendada:

**Etapa 8 - Integracao operacional do shell app-v2 com a store mockada unica.**

Escopo recomendado:

- fazer `AppV2Shell` manter snapshot operacional em memoria;
- aplicar `startServiceFromEquipment` e `completeService` no mesmo estado;
- apos concluir servico, limpar servico em andamento e fazer a Central exibir o
  novo registro recente;
- recalcular Home/Equipamentos/Servicos por seletores;
- manter tudo mockado, sem storage real e sem mudanca visual.

Nao recomendado:

- iniciar refinamento visual antes de fechar essa ponte runtime;
- alterar CSS/tokens;
- adicionar dependencia;
- conectar storage real ou integracoes externas.
