# Preparacao da tela Relatorio para React

Esta etapa nao migra `relatorio` para React. A rota continua 100% legada e renderizada por
`src/ui/views/relatorio.js`.

O objetivo deste PR e criar uma base segura para futuras ilhas React: contratos publicos
centralizados, view model puro para dados read-only/filtros e testes cobrindo o novo contrato.

## Estrutura atual

- `src/ui/shell/templates/views.js`: HTML estrutural da rota `#view-relatorio`, toolbar de exportacao,
  filtros avancados e `#relatorio-corpo`.
- `src/ui/views/relatorio.js`: adapter legado. Le estado/DOM, consulta plano, PMOC e assinatura,
  renderiza HTML por `innerHTML`, preserva handlers e chama `buildRelatorioViewModel`.
- `src/ui/viewModels/relatorioContracts.js`: ids, acoes, atributos e classes publicas que uma futura
  ilha deve preservar.
- `src/ui/viewModels/relatorioViewModel.js`: view model puro para filtros, lista filtrada, KPIs,
  narrativa, proximas acoes, contexto Pro e flags read-only.
- `src/ui/controller/handlers/reportExportHandlers.js`: fluxo legado de PDF/WhatsApp/quota.
- `src/ui/components/signature.js`: preview/modal de assinatura usado pelo card legado.
- `src/core/pmocProgress.js`: resumo PMOC usado apenas pelo adapter legado.

## Containers e ids publicos

Contratos centralizados em `src/ui/viewModels/relatorioContracts.js`.

- `#view-relatorio`: container da rota.
- `#rel-main-title` e `#rel-main-subtitle`: titulo/subtitulo atualizados pelo adapter.
- `#rel-mode-segment-slot`: slot do contexto de relatorios Pro.
- `#rel-hero` e `#rel-hero-title`: hero/KPIs do relatorio.
- `#rel-filters`: container dos filtros.
- `#rel-filters-chips`: chips de periodo/equipamento/mais filtros.
- `#rel-filters-advanced`: bloco legado com selects/inputs.
- `#rel-equip`, `#rel-de`, `#rel-ate`: filtros publicos usados por PDF, WhatsApp e render.
- `#rel-company-pmoc-slot`: bloco PMOC Pro.
- `#relatorio-corpo`: root/corpo do relatorio legado.
- `#pdf-quota-slot`: badge de quota de PDF.
- `#rel-export-dd`, `#btn-export-dd-toggle`, `#rel-export-dd-menu`: menu de exportacao.
- `#rel-dd-pmoc-main`, `#rel-dd-pmoc-info`, `#rel-dd-pmoc-nudge`: itens PMOC legados.

## Classes publicas principais

A futura ilha deve preservar as classes usadas pelo CSS legado e handlers:

- `servicos-toggle`, `servicos-toggle__btn`
- `rel-toolbar`, `rel-toolbar__actions`, `rel-toolbar__btn`, `rel-toolbar__quota-slot`
- `rel-export-dd`, `rel-export-dd__menu`, `rel-export-dd__item`
- `rel-title`, `rel-subtitle`
- `rel-hero`, `rel-hero__brand`, `rel-hero__title`, `rel-hero__meta`, `rel-hero__narrative`,
  `rel-hero__kpis`
- `rel-kpi`, `rel-kpi__row`, `rel-kpi__icon`, `rel-kpi__value`, `rel-kpi__label`
- `rel-segmented`, `rel-segmented__opt`
- `rel-mode-segment`, `rel-mode-segment__item`
- `rel-filters`, `rel-filters__chips`, `rel-filters__advanced`
- `rel-chip`, `rel-chip__clear`
- `rel-company-pmoc`
- `rel-proximas__item`, `rel-corretivas-banner`
- `rel-records`, `rel-record`, `rel-record__head`, `rel-record__title`, `rel-record__meta`,
  `rel-record__toggle`, `rel-record__details`, `rel-record__section`
- `rel-spec`, `rel-status`, `rel-tipo-icon`, `rel-sigthumb`
- `rel-empty`, `rel-empty__cta`

## Acoes e atributos publicos

`data-action` preservados:

- `whatsapp-export`
- `export-pdf`
- `toggle-export-dd`
- `open-pmoc-modal`
- `open-pmoc-info`
- `rel-toggle-advanced`
- `rel-clear-filters`
- `rel-view-signature`

`data-rel-action` preservados:

- `rel-toggle-card`

Navegacoes por contrato:

- `data-nav="historico"`
- `data-nav="relatorio"`
- `data-nav="registro"`
- `data-nav="clientes"`
- `data-nav="pricing"`

Atributos `data-*` relevantes:

- `data-action`
- `data-rel-action`
- `data-nav`
- `data-id`
- `data-view-mode`
- `data-tier`

## View model criado

`src/ui/viewModels/relatorioViewModel.js` e puro:

- nao acessa DOM;
- nao importa React;
- nao acessa router;
- nao acessa storage/backend;
- nao acessa PDF;
- nao acessa assinatura;
- nao dispara side effects.

Ele prepara:

- lista ordenada e filtrada por equipamento/data;
- labels de filtros ativos;
- modo de visualizacao normalizado;
- contexto Pro por cliente/setor/equipamento;
- flags PMOC read-only recebidas do adapter;
- KPIs do periodo;
- narrativa deterministica do periodo;
- contador/banner de corretivas;
- proximas acoes recomendadas;
- contratos de acoes como dados.

`src/ui/views/relatorio.js` continua sendo o adapter legado: le DOM/estado/plano, chama
`buildRelatorioViewModel`, renderiza HTML legado, preserva handlers e mantem PDF, WhatsApp, assinatura,
PMOC, quota e navegacao fora do view model.

## O que ficou legado

- Toolbar de PDF/WhatsApp/dropdown PMOC.
- Badge de quota de PDF.
- Render do hero, filtros/chips, PMOC, proximas acoes, banner de corretivas, cards e empty state por
  template string/`innerHTML`.
- Persistencia de modo compacto/detalhado em `localStorage`.
- Handlers de filtros, segmentado, cards expansivos e assinatura.
- Preview/modal de assinatura.
- Integracao com PMOC formal.
- Fluxos de PDF, WhatsApp, quota e navegacao.
- CSS legado `rel-*`, `servicos-toggle*`, `btn*`, `form-*` e `pro-badge`.

## Bloqueios para futura ilha React

- O adapter ainda mistura render, handlers, assinatura, PMOC, quota e filtros no mesmo arquivo.
- O render dos cards chama `findEquip` e `formatDadosPlacaRows` dentro do loop.
- Assinatura depende de `getSignatureForRecord` e `SignatureViewerModal`.
- PDF/WhatsApp dependem dos ids `#rel-equip`, `#rel-de` e `#rel-ate`.
- PMOC altera visibilidade de itens de menu e exibe CTA Pro.
- O modo compacto/detalhado ainda persiste em `localStorage`.
- O CSS legado concentra todo o visual `rel-*`; Tailwind deve entrar somente com prefixo `tw-` e sem
  preflight.

## Primeira fatia recomendada

Antes de migrar React, criar um PR pequeno para proteger o render legado do bloco `#rel-hero`, cobrindo:

- estado vazio;
- relatorio com dados;
- ids `#rel-hero` e `#rel-hero-title`;
- classes `rel-hero*` e `rel-kpi*`;
- modo compacto/detalhado por `data-view-mode`;
- narrativa, custo total, tipo mais comum e proximo vencimento;
- XSS/HTML injection nos textos dinamicos.

Depois desse teste, a primeira ilha React deve ser somente o hero/KPIs dentro de `#rel-hero`, mantendo
filtros, cards, PDF, WhatsApp, assinatura, PMOC, quota e navegacao no legado.

## Riscos

- PDF/WhatsApp ainda dependem de ids globais e estado dos inputs legados.
- Assinatura e PMOC tem side effects e nao devem entrar nas primeiras ilhas.
- Cards de registros ainda concentram detalhes de equipamento, custos, placa, assinatura e proxima
  manutencao.
- Imports dinamicos/handlers externos podem depender de `data-action`/`data-nav`.
- Mudancas futuras nos filtros podem quebrar exportacao se os ids publicos forem alterados.
- O arquivo `relatorio.js` foi reduzido para ficar abaixo de 1000 linhas, mas ainda tem render legado
  amplo e deve ser fatiado por bloco antes de qualquer migracao maior.
