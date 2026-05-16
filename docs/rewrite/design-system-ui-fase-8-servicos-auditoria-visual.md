# Design System/UI fase 8 - auditoria visual Servicos

Data: 2026-05-16

## Objetivo

Auditar documentalmente a area de `Servicos` do app-v2 apos os checkpoints
funcionais de Registros, Relatorios e Orcamentos locais, antes de qualquer
refinamento visual de runtime.

Esta fase existe para impedir que a etapa de design repita problemas do v1 ou
misture risco visual com integracoes sensiveis.

## Escopo

- `Servicos > Registros`.
- `Servicos > Relatorios`.
- `Servicos > Orcamentos`.
- Navegacao de subvisoes de Servicos.
- Estados vazios, busca, filtros, cards, lista operacional, preview de relatorio
  e edicao local de orcamento.
- Mobile, desktop, rolagem, texto longo, foco e muitos itens como criterios de
  QA futura.

## Fora de escopo

- Alterar `src/`, CSS, tokens, primitives, componentes ou testes.
- Rodar QA visual em browser nesta fase.
- Implementar redesign amplo.
- Importar CSS, shell, templates ou navegacao do v1.
- Implementar PDF/share real, WhatsApp real, storage real, Supabase/RLS,
  migrations, billing real, assinatura, quotas ou pricing.
- Reabrir PMOC, router global, seguranca, React Doctor ou limpeza de imports.

## Evidencias revisadas

- `AGENTS.md`.
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md`.
- `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-equipamentos-design.md`.
- `docs/rewrite/servicos-registros-filtros-app-v2.md`.
- `docs/rewrite/relatorios-consolidados-locais-app-v2.md`.
- `docs/rewrite/orcamentos-mock-action-pos-fechamento-app-v2.md`.
- `docs/rewrite/orcamentos-fase-2-edicao-local-app-v2.md`.
- `docs/rewrite/orcamentos-fase-3-itens-locais-app-v2.md`.
- `src/app-v2/service/ServicesHome.tsx`.
- `src/app-v2/service/ServicesSubViewNav.tsx`.
- `src/app-v2/service/RecentServiceCard.tsx`.
- `src/app-v2/service/ServiceReportsHome.tsx`.
- `src/app-v2/service/ServiceReportsList.tsx`.
- `src/app-v2/service/ServiceReportPreview.tsx`.
- `src/app-v2/service/ServicesQuotesHome.tsx`.

## Diagnostico visual documental

### Subvisoes de Servicos

`ServicesSubViewNav` usa uma faixa horizontal com `tw-overflow-x-auto` e botoes
com `tw-shrink-0`. Como sao apenas tres subvisoes, a solucao tende a ser
controlada, mas precisa de QA mobile para confirmar que nao repete o problema
visual ja encontrado em Equipamentos.

Risco:

- botao parcial em viewport estreito;
- foco de teclado ou hover nao ficar evidente dentro da faixa rolavel;
- subvisao ativa competir visualmente com o titulo da tela.

### Registros

`ServicesHome` combina hero, indicador de registros recentes, estado em
andamento ou vazio, busca, cinco filtros e lista de cards. A area e
funcionalmente coerente, mas a densidade antes dos registros pode ficar alta em
mobile.

Risco:

- controles demais antes do primeiro card em 390px;
- grade de cinco filtros ficar longa e cansativa;
- texto longo de equipamento, cliente, tecnico ou resumo ser truncado sem
  contexto suficiente;
- estado sem resultado parecer base vazia ou erro;
- card com pecas, custos e proxima manutencao ficar alto demais em lista longa.

### Relatorios

`ServiceReportsHome` possui busca, tres filtros, KPIs, consolidado local, lista
operacional e preview imprimivel. O risco principal e a alternancia entre
consulta e preview: sao duas densidades visuais diferentes dentro da mesma
subvisao.

Risco:

- filtros e KPIs comprimirem o conteudo principal em mobile;
- grade de seis metricas do consolidado ficar densa em desktop medio;
- lista operacional depender demais da versao em tabela no desktop e virar
  pilha longa no mobile;
- preview imprimivel parecer PDF/share real, apesar de continuar local;
- botao `Imprimir relatorio` ser interpretado como exportacao PDF real.

### Orcamentos

`ServicesQuotesHome` cobre pipeline mockado, KPIs, cards e edicao local com
itens. Como orcamento real, envio, assinatura e billing estao fora de escopo, a
UI precisa comunicar claramente o carater local/mockado sem parecer produto
financeiro final.

Risco:

- cards de orcamento com status, cliente, equipamento, total e itens ficarem
  densos em mobile;
- formulario de edicao local crescer demais ao adicionar itens;
- linha de item com descricao longa e valor pode estourar ou comprimir;
- CTA `Editar orcamento` parecer edicao de orcamento real;
- erro de item local disputar atencao com os campos obrigatorios.

### Estados vazios e texto longo

As tres subvisoes possuem estados vazios ou sem resultado. Eles devem ser
distintos entre base vazia, filtro sem resultado e ausencia de orcamento ou
relatorio local.

Risco:

- mensagens diferentes parecerem o mesmo estado;
- orientacao de proxima acao ficar fraca quando nao ha item;
- texto tecnico longo cobrir botoes, badges ou campos;
- labels de filtros longas em select ficarem cortadas sem alternativa.

## Matriz de QA visual necessaria

A proxima fase deve validar no browser, no minimo:

| Cenario                                             | Viewport minimo              |
| --------------------------------------------------- | ---------------------------- |
| Registros com muitos itens e filtros padrao         | 390x844, 1366x768, 1920x1080 |
| Registros com filtro sem resultado                  | 390x844, 1366x768            |
| Registro com texto longo em equipamento e resumo    | 390x844, 1366x768            |
| Relatorios com busca, filtros, KPIs e consolidado   | 390x844, 1366x768, 1920x1080 |
| Relatorios com lista vazia por filtro               | 390x844, 1366x768            |
| Preview de relatorio imprimivel                     | 390x844, 1366x768            |
| Orcamentos com pipeline e cards                     | 390x844, 1366x768, 1920x1080 |
| Orcamento em edicao com itens locais                | 390x844, 1366x768            |
| Orcamento com item de descricao longa               | 390x844, 1366x768            |
| Navegacao por foco nos controles de subvisao/filtro | 390x844, 1366x768            |

Criterios:

- sem overflow horizontal de pagina;
- nenhum botao ou chip parcialmente escondido em mobile;
- texto longo nao deve cobrir botoes, badges, campos ou conteudo seguinte;
- filtros devem continuar usaveis sem esconder a lista principal;
- estados vazios devem diferenciar base vazia de filtro sem resultado;
- preview de relatorio nao deve sugerir PDF/share real;
- edicao de orcamento deve parecer local/mockada, nao billing real;
- bottom nav e rolagem devem permanecer previsiveis no mobile;
- foco de teclado deve ser visivel em inputs, selects, botoes e subvisoes.

## Decisoes

- A Fase 8 nao altera runtime.
- `Servicos` nao deve puxar CSS, tokens ou primitives antes de QA visual real.
- Registros, Relatorios e Orcamentos ja possuem cobertura funcional mock/local
  suficiente para uma auditoria visual.
- PMOC segue excluido deste ciclo e deve ser refeito em etapa propria futura.
- PDF/share real, WhatsApp real, storage real, Supabase/RLS, migrations, billing
  real e assinatura continuam bloqueados para etapas proprias.
- Qualquer ajuste visual futuro deve ser pequeno, baseado em screenshot e
  limitado a `Servicos`.

## Proximo checkpoint recomendado

Design System/UI fase 9: executar QA visual real de `Servicos` app-v2 em browser
com screenshots mobile 390, desktop 1366 e desktop 1920, cobrindo Registros,
Relatorios, Orcamentos, estados vazios, texto longo, preview de relatorio e
edicao local de orcamento; somente depois decidir se existe ajuste visual
pequeno; sem runtime funcional, storage real, Supabase/RLS, migrations, PMOC,
PDF/share real, WhatsApp real, billing real ou redesign amplo.
