# Preparacao da tela equipamentos para React

Esta etapa nao migra `equipamentos` para React. A tela continua renderizada por HTML legado em
`src/ui/views/equipamentos.js`, com cards e grids em `src/ui/views/equipamentos/*`.

O objetivo deste PR e deixar uma base testavel para a futura ilha: contratos publicos
centralizados e um view model puro para a lista flat de equipamentos.

## Estrutura atual

- `src/ui/views/equipamentos.js`: adapter legado da rota, leitura de estado, plano, contexto de rota, DOM, toolbar, lista flat, CRUD de equipamentos, setores e modais.
- `src/ui/views/equipamentos/hero.js`: hero, KPIs e quick filters.
- `src/ui/views/equipamentos/equipmentCards.js`: HTML dos cards, idle cluster e avaliadores cacheados.
- `src/ui/views/equipamentos/setores.js`: HTML dos cards de setor.
- `src/ui/views/equipamentos/fotos.js`: gates e editor legado de fotos.
- `src/ui/views/equipamentos/contextState.js`: contexto de rota de equipamentos.
- `src/ui/views/equipamentos/placaData.js`: dados de etiqueta/nameplate.

## Containers publicos

Contratos centralizados em `src/ui/viewModels/equipamentosContracts.js`.

- `#view-equipamentos`: container da rota.
- `#lista-equip`: root legado da lista/render principal.
- `#equip-hero`: hero de atencao.
- `#equip-filters`: quick filters.
- `#equip-search-bar`: wrapper da busca.
- `#equip-busca`: input de busca.
- `#equip-toolbar-actions`: acoes da toolbar.
- `#equip-context-chip`: chip de contexto cliente/setor.
- `#quick-move-target-setor`: select do batch move.

## Acoes publicas

`data-action` preservados para handlers legados:

- `view-equip`
- `edit-equip`
- `delete-equip`
- `go-register-equip`
- `open-modal`
- `open-setor`
- `back-to-setores`
- `open-setor-modal`
- `edit-setor`
- `delete-setor`
- `toggle-setor-menu`
- `equip-quickfilter`
- `equip-clear-cliente-filter`
- `eq-add-for-cliente`
- `quick-move-equip-batch`
- `toggle-idle-cluster`
- `equip-set-view-mode`
- `open-eq-photos-editor`
- `save-eq-photos`
- `toggle-eq-detail-menu`
- `equip-unlock-context`
- `eq-photos-upsell-cta`

## Atributos publicos

- `data-action`
- `data-id`
- `data-source`
- `data-testid`
- `data-setor-id`
- `data-cliente-id`
- `data-equip-ids`
- `data-mode`
- `data-focus-field`
- `data-after-save`
- `data-expanded`
- `data-tier`

## Classes publicas do CSS legado

A futura ilha deve preservar as classes usadas pelo CSS e pelos handlers, principalmente:

- `equip-card`, `equip-card__type-icon`, `equip-card__primary-cta`
- `equip-idle-cluster`
- `equip-hero`
- `equip-filter`
- `equip-search-row`
- `equip-view-toggle`
- `quick-move-banner`
- `setor-card`, `setor-grid`, `setor-card__menu`
- `empty-state`

## View model criado

`src/ui/viewModels/equipamentosViewModel.js` e puro:

- nao acessa DOM;
- nao importa React;
- nao acessa router;
- nao acessa storage/backend;
- nao abre modais;
- nao faz side effects.

Ele prepara:

- lista filtrada por busca, setor, cliente e status;
- ordenacao por prioridade de acao, prioridade e risco via callbacks recebidos;
- empty state contextual;
- particionamento `idleItems` / `activeItems`;
- metadados de quick move para contexto cliente + sem setor;
- dados tolerantes a entradas ausentes ou invalidas.

`src/ui/views/equipamentos.js` continua sendo o adapter legado: le estado, cria `evalCtx`,
chama `buildEquipamentosViewModel` e renderiza HTML legado com `equipCardHtml`,
`emptyStateHtml` e handlers atuais.

## Filtros preparados

- Busca em equipamento, local, TAG, cliente e setor.
- `sem-setor` via `setorId: "__sem_setor__"`.
- `em-atencao`.
- `criticos`.
- `preventiva-7d`.
- `preventiva-30d`.
- `preventiva-vencida`.
- Filtro por `clienteId` vindo de Clientes -> Ver equipamentos.

## Testes

`src/__tests__/equipamentosViewModel.test.js` cobre:

- estado vazio;
- lista com equipamentos;
- filtros principais;
- status/labels via contratos;
- acoes principais preservadas;
- dados ausentes/invalidos;
- seguranca contra HTML injection no limite do view model: textos permanecem dados, sem gerar HTML.

## Bloqueios antes da ilha React

- `src/ui/views/equipamentos.js` ainda tem mais de 2500 linhas e mistura rota, estado, DOM, plano, CRUD, setores, fotos e modais.
- `equipCardHtml` ainda gera HTML por template string e consulta avaliadores legados.
- `renderEquipHero` e `renderEquipFilters` manipulam DOM diretamente.
- Setores e fotos possuem fluxos Pro, modais e handlers proprios; nao devem entrar na primeira ilha.
- Nameplate capture e dados de etiqueta ainda dependem de DOM/modal.
- CRUD de equipamento, exclusao, batch move e PMOC devem continuar fora da primeira ilha.
- O CSS legado esta concentrado em classes `equip-*`, `setor-*` e `quick-move-*`.

## Recomendacao para a futura ilha

O proximo PR de migracao nao deve migrar a tela inteira. A abordagem segura e:

1. criar uma ilha React apenas para a lista flat em `#lista-equip`;
2. manter hero, filtros, setores, fotos, modais, CRUD e paywall no legado;
3. receber `buildEquipamentosViewModel` pronto por props;
4. preservar `data-action`, `data-id`, classes `equip-*` e empty states;
5. adicionar teste de ilha antes de substituir qualquer HTML legado.
