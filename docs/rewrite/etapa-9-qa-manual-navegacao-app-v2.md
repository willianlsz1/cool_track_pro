# Etapa 9 - QA manual ampliado da navegacao app-v2

Status: executada.

Data: 2026-05-12.

Branch: `codex/rewrite-zero-react-parallel`.

HEAD inicial: `c27abf8170547309abb54688c0503832b0e3919f`.

## 1. Objetivo

Validar em navegador a integracao operacional feita na Etapa 8 antes de qualquer
refinamento visual.

Esta etapa verificou se o shell app-v2 navega e recalcula estado usando a store
mockada unica, os seletores e as acoes puras ja consolidadas.

## 2. Estado do working tree antes

Arquivos pendentes antes desta etapa:

- `src/app-v2/equipment/EquipmentDetail.tsx`;
- `src/app-v2/equipment/EquipmentList.tsx`;
- `src/app-v2/home/HomeToday.tsx`;
- `src/app-v2/home/homeViewModel.ts`;
- `src/app-v2/service/ServiceFlow.tsx`;
- `src/app-v2/shell/AppV2Shell.tsx`;
- `src/app-v2/shell/AppV2Shell.test.tsx`;
- `docs/rewrite/etapa-7-qa-funcional-app-v2.md`;
- `docs/rewrite/etapa-8-integracao-shell-store.md`.

Essas pendencias pertencem as Etapas 7 e 8 e estavam dentro do escopo esperado.

## 3. Base analisada

Documentos analisados:

- `docs/rewrite/etapa-6-fundacao-fluxo-dados-plano.md`;
- `docs/rewrite/fortalecimento-app-v2-status.md`;
- `docs/rewrite/etapa-7-qa-funcional-app-v2.md`;
- `docs/rewrite/etapa-8-integracao-shell-store.md`.

Arquivos relevantes revisados:

- `src/app-v2/shell/AppV2Shell.tsx`;
- `src/app-v2/service/ServiceFlow.tsx`;
- `src/app-v2/service/ServicesHome.tsx`;
- `src/app-v2/service/servicesHomeViewModel.ts`;
- `src/app-v2/home/HomeToday.tsx`;
- `src/app-v2/equipment/EquipmentList.tsx`;
- `src/app-v2/equipment/EquipmentDetail.tsx`;
- `src/app-v2/data/appV2Actions.ts`;
- `src/app-v2/data/appV2Selectors.ts`.

## 4. Ambiente de QA manual

Servidor local:

- `npm run dev -- --host 127.0.0.1 --port 5189`;
- URL validada: `http://127.0.0.1:5189/src/app-v2/preview.html`.

Ferramenta:

- Playwright headless via Node;
- viewport mobile `390x844`.

Observacao:

- a bottom nav auto-oculta ao rolar para baixo e reaparece ao voltar para o topo;
- o QA automatizado simulou esse comportamento com scroll para o topo antes de
  acionar a bottom nav.

## 5. Fluxos testados manualmente

### 5.1 Home -> Registro -> Central -> Home

Passos:

1. Abrir Home.
2. Acionar `Iniciar servico`.
3. Avancar pelo contexto.
4. Selecionar `Preventiva`.
5. Preencher diagnostico e acoes.
6. Revisar.
7. Concluir servico.
8. Voltar para Servicos.
9. Voltar para Hoje pela bottom nav.

Resultado:

- tela final exibiu `Servico concluido`;
- Central exibiu `SEM ANDAMENTO`;
- Central exibiu `Nenhum servico em andamento`;
- novo registro apareceu em `Registros recentes`;
- diagnostico e acoes preenchidos apareceram no registro;
- Home recalculou a proxima acao para `Corretiva hoje`;
- nao houve estado preso em `Pronto para revisao`.

### 5.2 Home -> Detalhe do equipamento -> Registro -> Detalhe -> Central

Passos:

1. Abrir Home.
2. Acionar `Ver equipamento`.
3. Confirmar detalhe do `Split 24.000 BTU`.
4. Iniciar servico pelo detalhe.
5. Concluir servico.
6. Acionar `Ver equipamento` na tela final.
7. Abrir Servicos pela bottom nav.

Resultado:

- detalhe abriu com equipamento e cliente corretos;
- depois da conclusao, detalhe passou a mostrar status `Operacional`;
- ultimo servico passou para `Preventiva em 10/05`;
- observacao do detalhe refletiu o registro criado no fluxo;
- Central exibiu o mesmo registro;
- Central nao manteve servico em andamento.

### 5.3 Bottom nav e estados pendentes

Passos:

1. Abrir Servicos pela bottom nav.
2. Verificar registros e saidas futuras mockadas.
3. Abrir Equipamento pela bottom nav.
4. Abrir Conta pela bottom nav.

Resultado:

- Servicos abriu com registros recentes;
- saidas futuras mockadas `Orcamento sugerido` e `Proximo compromisso`
  permaneceram visiveis;
- Equipamento abriu lista com busca e filtros;
- Conta abriu placeholder `Em breve`;
- nao houve tela presa nem acao sem efeito.

## 6. Checklist de QA manual

| Area                | Criterio                                                        | Status |
| ------------------- | --------------------------------------------------------------- | ------ |
| Home                | Abre com proxima acao operacional                               | OK     |
| Home                | Inicia Registro de Servico                                      | OK     |
| Home                | Recalcula proxima acao apos conclusao                           | OK     |
| Equipamentos        | Lista abre pela bottom nav                                      | OK     |
| Detalhe             | Abre pelo CTA `Ver equipamento`                                 | OK     |
| Detalhe             | Usa registro concluido para atualizar ultimo servico/observacao | OK     |
| Registro de Servico | Avanca contexto -> tipo -> execucao -> revisao -> finalizacao   | OK     |
| Central             | Exibe registro criado pelo fluxo                                | OK     |
| Central             | Nao mantem `Pronto para revisao` apos conclusao                 | OK     |
| Central             | Exibe `SEM ANDAMENTO` quando nao ha draft ativo                 | OK     |
| Saidas futuras      | Mantem labels mockados sem acionar integracoes reais            | OK     |
| Bottom nav          | Navega entre Hoje, Equipamento, Servicos e Conta                | OK     |
| Bottom nav          | Reaparece ao voltar ao topo apos auto-hide                      | OK     |

## 7. Inconsistencias encontradas

### 7.1 Texto de estado vazio da Central

Fato:

- a Central mostrava o bloco `SEM ANDAMENTO`, mas o titulo interno dizia
  `Nenhum servico recente`, mesmo quando havia registros recentes abaixo.

Risco:

- o tecnico poderia interpretar que nao existe historico recente, quando o
  correto e apenas nao existir servico em andamento.

Correcao feita:

- `servicesHomeViewModel` passou a usar `Nenhum servico em andamento`.
- O teste focado foi atualizado primeiro e falhou antes da correcao.
- Depois da correcao, o teste passou.

Arquivos:

- `src/app-v2/service/servicesHomeViewModel.ts`;
- `src/app-v2/service/servicesHomeViewModel.test.ts`.

### 7.2 Bottom nav auto-ocultavel

Fato:

- apos rolar conteudo longo, a bottom nav fica fora do viewport por design de
  auto-hide;
- ao voltar para o topo, ela reaparece e navega corretamente.

Decisao:

- nao alterar nesta etapa, porque isso e comportamento planejado desde etapas
  anteriores e nao bloqueou a navegacao quando usado com retorno ao topo.

## 8. Correcoes feitas

Correcao funcional/copy restrita ao app-v2:

- substituir `Nenhum servico recente` por `Nenhum servico em andamento` no estado
  vazio operacional da Central.

Nao houve:

- redesign;
- mudanca de layout;
- mudanca de CSS/tokens;
- mudanca em app legado;
- mudanca em dependencias;
- integracao real.

## 9. Validacoes executadas

Validadas nesta etapa:

- QA manual ampliado no navegador local com Playwright;
- teste focado de `servicesHomeViewModel` em ciclo red/green.

Validacoes finais esperadas apos este documento:

- `npm run format:check`;
- `npm run typecheck`;
- testes focados do app-v2;
- `npm run build`;
- `npm run check`;
- `git diff --check`;
- `git status --short -uall`.

## 10. Riscos remanescentes

- store e acoes continuam mockadas;
- `Relatorio`, `Orcamento` e `Proximo compromisso` continuam como saidas futuras
  mockadas;
- nenhuma validacao de storage real foi feita;
- nenhuma validacao de Supabase, PDF/share, WhatsApp, billing, PMOC, assinatura
  ou orcamento real foi feita;
- antes de refinamento visual, ainda e recomendavel consolidar commit unico para
  preservar a base validada.

## 11. Percentual

Fundacao pura app-v2: **100%**.

Prontidao funcional/manual do shell app-v2 apos Etapa 9: **98%**.

Justificativa:

- QA manual ampliado validou navegacao e fluxos principais;
- a lacuna da Etapa 7 permanece resolvida pela Etapa 8;
- a unica correcao da Etapa 9 foi uma frase funcional da Central;
- os 2% restantes representam falta de integracoes reais, que continuam fora de
  escopo.

## 12. Recomendacao de commit

Recomendacao objetiva: **criar um commit unico de consolidacao das Etapas 7, 8 e
9**.

Motivo:

- as alteracoes pendentes formam uma unidade coerente;
- o QA manual ampliado passou;
- os testes focados cobrem a lacuna corrigida;
- a documentacao registra o que foi validado e o que continua fora de escopo.

Mensagem sugerida:

```bash
git add docs/rewrite src/app-v2
git commit -m "feat(app-v2): consolidate shell mock flow QA"
```

## 13. Proximo passo recomendado

Depois do commit de consolidacao, seguir para uma etapa pequena de escolha:

1. **Etapa 10 - Preparar checklist de refinamento visual controlado**, ainda sem
   alterar CSS; ou
2. **Etapa 10 - QA manual assistido pelo usuario no navegador**, se quiser uma
   ultima revisao operacional antes de mexer em aparencia.
