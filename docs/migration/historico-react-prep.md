# Preparacao da tela Historico para React

Esta etapa nao migra `historico` para React. A rota continua 100% legada e renderizada por
`src/ui/views/historico.js`.

O objetivo deste PR e criar uma base testavel para futura migracao em ilhas: contratos publicos
centralizados, um view model puro para a lista/estado read-only e documentacao dos bloqueios.

## Estrutura atual

- `src/ui/shell/templates/views.js`: HTML estrutural da rota `#view-historico`, filtros e `#timeline`.
- `src/ui/views/historico.js`: adapter legado com leitura de estado, URL/session filters, render por
  `innerHTML`, handlers, fotos, assinatura, delete e navegacao.
- `src/ui/components/historicoFiltersSheet.js`: sheet mobile de filtros.
- `src/ui/components/photos.js`: lightbox de fotos usado por `hist-open-photo`.
- `src/ui/components/signature.js`: limpeza, resolucao e modal de assinatura.
- `src/core/storage.js`, `src/core/state.js`, `src/core/router.js`: delete, estado e navegacao legados.

## Containers e ids publicos

Contratos centralizados em `src/ui/viewModels/historicoContracts.js`.

- `#view-historico`: container da rota.
- `#hist-sticky-header`: header sticky com busca/filtros.
- `#hist-count`: contador de registros.
- `#hist-busca`: busca textual.
- `#hist-filters-trigger` e `#hist-filters-count`: abertura e badge do sheet de filtros.
- `#hist-setor`: select legado de setor.
- `#hist-equip`: select legado de equipamento.
- `#hist-quickfilters-slot`: root legado dos filtros rapidos.
- `#hist-active-chips-slot`: root legado dos chips ativos.
- `#hist-chrono-label`: label "mais recente primeiro".
- `#timeline`: root/lista legado do historico.
- `#hist-summary-content`: conteudo colapsavel do summary card legado, ainda nao renderizado na lista atual.

## Classes publicas principais

A futura ilha deve preservar as classes usadas pelo CSS legado e handlers:

- `servicos-toggle`
- `hist-sticky-header`, `hist-title`, `hist-count`
- `hist-search-row`, `hist-input`, `hist-filters-trigger`, `hist-select`
- `hist-quickfilters`, `hist-quickfilter`
- `hist-active-chips`, `hist-active-chip`
- `hist-op-summary`, `hist-attention`
- `hist-day-group`
- `timeline`, `timeline__item`, `timeline__item--latest`, `timeline__dot`
- `timeline__item__service`, `timeline__item__equipment`, `timeline__item__photos`
- `hist-signature-preview`
- `hist-item-actions`
- `empty-state`

## Acoes e atributos publicos

`data-hist-action` preservados:

- `open-filters-sheet`
- `hist-filter-period`
- `hist-filter-tipo`
- `hist-clear-period`
- `hist-clear-tipo`
- `hist-clear-setor`
- `hist-clear-equip`
- `hist-clear-busca`
- `clear-cliente-filter`
- `hist-clear-all`
- `hist-filter-equip`
- `hist-open-photo`
- `hist-view-signature`
- `toggle-card-menu`
- `toggle-summary`
- `hist-pricing-link`

`data-action` preservados:

- `edit-reg`
- `delete-reg`

Navegacoes por contrato:

- `data-nav="historico"`
- `data-nav="relatorio"`
- `data-nav="registro"`
- `data-nav="equipamentos"`

Atributos `data-*` relevantes:

- `data-hist-action`
- `data-action`
- `data-nav`
- `data-id`
- `data-reg-id`
- `data-equip-id`
- `data-photo-url`
- `data-period`
- `data-tipo-id`

## View model criado

`src/ui/viewModels/historicoViewModel.js` e puro:

- nao acessa DOM;
- nao importa React;
- nao acessa router;
- nao acessa storage/backend;
- nao abre modais;
- nao dispara side effects.

Ele prepara:

- lista valida e ordenada por data desc;
- filtros por busca, setor, equipamento, cliente, periodo e tipo;
- grupos de data (`hoje`, `ontem`, `semana`, `mes`, `antigos`);
- chips/filtros ativos como dados;
- metadados de cards, custos, status, tipo e acoes publicas;
- estado vazio filtrado ou geral;
- resumo de hoje;
- insights e recorrencia;
- itens de atencao read-only, com callback opcional para PMOC.

`src/ui/views/historico.js` continua sendo o adapter legado: le estado/DOM, chama
`buildHistoricoViewModel`, renderiza HTML legado, preserva handlers e mantem delete/fotos/assinatura/PDF
fora do view model.

## O que ficou legado

- Render completo do `#timeline` por template string e `innerHTML`.
- Header sticky, busca, selects e sheet mobile de filtros.
- Handlers de quick filters, chips, menu kebab e navegacao.
- Fotos e lightbox.
- Assinatura e `SignatureViewerModal`.
- Delete de registro e recalculo de status do equipamento.
- Navegacao para equipamento/relatorio/registro.
- Empty state HTML e skeleton.
- Dependencia de `findEquip`, `getState`, `setState`, `Storage`, `Toast`, `goTo`, `Photos` e assinatura.

## Bloqueios para futura ilha React

- `src/ui/views/historico.js` ainda esta acima de 1000 linhas e mistura adapter, render e handlers.
- `renderTimelineItem` ainda consulta `findEquip` e renderiza fotos/assinatura/menu no mesmo bloco.
- Handlers sao reanexados por delegacao parcial em `attachFilterHandlers`.
- Foto, assinatura, delete e navegacao tem side effects e nao devem entrar na primeira ilha.
- O filtro mobile depende de `HistoricoFiltersSheet` e selects ocultos.
- CSS legado concentra classes `hist-*`, `timeline*` e `meta-*`.
- Ainda ha pontos de `innerHTML` no adapter legado; a futura ilha deve renderizar textos como JSX.

## Primeira fatia recomendada

Antes de migrar qualquer React, criar um PR pequeno para proteger o render legado da lista em
`#timeline`, cobrindo:

- estado vazio;
- lista com registros;
- grupos por data;
- `.timeline__item`;
- `data-reg-id`, `data-action`, `data-id`, `data-hist-action`, `data-equip-id`;
- fotos e assinatura apenas como contratos DOM, sem alterar comportamento;
- XSS/HTML injection no HTML legado.

Depois desse teste, a primeira ilha React deve ser somente a lista de itens dentro de `#timeline`,
mantendo header, filtros, fotos, assinatura, delete, PDF e navegacao no legado.

## Riscos

- Mudancas futuras podem quebrar contratos globais porque handlers ainda dependem de atributos `data-*`.
- A tela usa imports dinamicos para navegar/abrir equipamento a partir do historico.
- Delete altera storage/state e recalcula status do equipamento.
- Fotos e assinatura dependem de modais e armazenamento local.
- O CSS legado e amplo; a futura ilha deve preservar classes antes de introduzir Tailwind com `tw-`.
