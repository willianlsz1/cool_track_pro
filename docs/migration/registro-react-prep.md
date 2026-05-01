# Preparacao da tela Registro para React

Esta etapa nao migra `registro` para React. A rota continua 100% legada e renderizada por
`src/ui/views/registro.js`.

O objetivo deste PR e criar uma base segura para futuras ilhas React: contratos publicos
centralizados, view model/form model puro para dados read-only do formulario e testes cobrindo o
novo contrato.

## Estrutura atual

- `src/ui/shell/templates/views.js`: HTML estrutural da rota `#view-registro`, hero, formulario,
  fotos, checklist, assinatura e botoes principais.
- `src/ui/views/registro.js`: adapter legado. Le DOM/estado, aplica contexto de rota, gerencia
  checklist, fotos, assinatura, validacao, salvamento, edicao, PDF/WhatsApp pos-salvamento e
  navegacao.
- `src/ui/controller/handlers/registroHandlers.js`: delega `data-action` do Registro para os fluxos
  legados.
- `src/ui/composables/registroContext.js`: resolve contexto cliente/setor/equipamento de forma pura.
- `src/ui/viewModels/registroContracts.js`: ids, acoes, atributos e classes publicas que futuras
  ilhas devem preservar.
- `src/ui/viewModels/registroViewModel.js`: form model puro para modo novo/edicao, equipamento
  selecionado, progresso, checklist, contexto, validacao pura e acoes como dados.

## Containers e ids publicos

Contratos centralizados em `src/ui/viewModels/registroContracts.js`.

- `#view-registro`: container da rota.
- `#registro-hero`, `#registro-hero-sub`, `#registro-hero-pill-text`, `#registro-hero-meter` e
  `#form-progress-count`: hero e progresso do formulario.
- `#r-equip-trigger`, `#r-equip-name`, `#r-equip-meta` e `#r-equip`: seletor de equipamento.
- `#registro-datetime-wrap`, `#r-data-now-btn`, `#r-data-now-label`, `#r-data-edit-btn` e
  `#r-data`: UX de data/hora.
- `#r-tipo`, `#r-tipo-custom-wrap`, `#r-tipo-custom`, `#r-obs` e `#r-tecnico`: campos principais do
  servico.
- `#registro-context-card`, `#registro-context-cliente`, `#registro-context-setor`,
  `#registro-context-equip`, `#registro-context-hint`, `#registro-cliente-details` e
  `#registro-cliente-context-summary`: contexto de cliente/setor/equipamento.
- `#r-cliente-nome`, `#r-cliente-documento`, `#r-cliente-contato` e `#r-local-atendimento`: dados do
  cliente no registro.
- `#r-pecas`, `#r-custo-pecas` e `#r-custo-mao-obra`: materiais e custos.
- `#photo-drop-zone`, `#photo-drop-text`, `#input-fotos`, `#input-fotos-camera` e `#photo-preview`:
  fotos legadas.
- `#registro-impact-title`, `#registro-impact-subtitle`, `#registro-impact-hint`, `#r-prioridade`,
  `#r-status` e `#r-proxima`: impacto operacional e retorno.
- `#r-checklist-details`, `#r-checklist-pri`, `#r-checklist-summary` e `#r-checklist-body`:
  checklist PMOC legado.
- `#registro-signature-hint` e `#tour-signature-anchor`: captura de assinatura/upsell legado.

## Classes publicas principais

A futura ilha deve preservar as classes usadas pelo CSS legado e handlers:

- `registro-hero`, `registro-hero__pill`, `registro-hero__meter`
- `registro-quick`, `registro-quick__tile`
- `registro-field`, `registro-field__label`, `registro-field__input`, `registro-field__select`
- `registro-details`, `registro-details__body`
- `registro-actions`
- `registro-context-card`
- `registro-photo-quick`
- `registro-sig-hint`
- `r-checklist__body`, `r-checklist__row`, `r-checklist__status`,
  `r-checklist__measure-input`, `r-checklist__obs`

## Acoes e atributos publicos

`data-action` preservados:

- `save-registro`
- `save-and-share-registro`
- `clear-registro`
- `quick-service-template`
- `r-checklist-set`
- `r-checklist-measure`
- `r-checklist-obs`
- `signature-upsell-cta`

`data-r-action` preservado:

- `open-equip-picker`

Atributos `data-*` relevantes:

- `data-action`
- `data-r-action`
- `data-template`
- `data-color`
- `data-item`
- `data-item-id`
- `data-status`
- `data-unit`
- `data-state`

## View model criado

`src/ui/viewModels/registroViewModel.js` e puro:

- nao acessa DOM;
- nao importa React;
- nao acessa router;
- nao acessa storage/backend;
- nao acessa PDF ou WhatsApp;
- nao acessa assinatura, fotos ou modais;
- nao dispara side effects.

Ele prepara:

- modo `create` ou `edit`;
- dados normalizados do formulario;
- tipo resolvido quando `r-tipo` e `Outro`;
- equipamento selecionado e contexto cliente/setor;
- progresso dos campos obrigatorios;
- validacao pura reaproveitando `validateRegistroPayload`;
- resumo do checklist recebido pelo adapter;
- disponibilidade de assinatura como flag recebida;
- acoes publicas como dados.

`src/ui/views/registro.js` continua sendo o adapter legado: le DOM/estado/plano, chama
`buildRegistroViewModel` como snapshot read-only, renderiza HTML atual e mantem checklist, fotos,
assinatura, salvamento, edicao, PDF, WhatsApp, route guard e navegacao fora do view model.

## O que ficou legado

- Render completo da tela no template legado.
- Barra de progresso visual e hero.
- Picker de equipamento e contexto visual.
- Checklist PMOC, templates, medicoes e observacoes.
- Upload/preview de fotos.
- Assinatura, upsell e captura no fluxo de salvamento.
- Validacoes de usuario, foco, toasts e confirmacao de saida.
- Salvamento novo/edicao, upload pendente e reconciliacao de status.
- PDF/WhatsApp pos-salvamento.
- Route guard e navegacao pos-salvamento.
- CSS legado `registro-*`, `r-checklist*`, `btn*` e `form-*`.

## Bloqueios para futura ilha React

- `src/ui/views/registro.js` ainda tem mais de 1000 linhas e mistura adapter, render auxiliar,
  checklist, validacao, fotos, assinatura, salvamento e navegacao.
- O checklist tem side effects de DOM e deve ser protegido por teste legado antes de migrar.
- Fotos, assinatura, PDF, WhatsApp e salvamento dependem de modais, uploads, storage e fluxos
  externos.
- O route guard de edicao e a navegacao pos-salvamento nao devem entrar nas primeiras ilhas.
- Existem contratos globais por ids e `data-action`; qualquer ilha deve manter esses atributos para
  os handlers legados.
- Ha risco atual de ids acentuados antigos em alguns arrays internos do adapter (`r-tecnico` e
  `r-proxima` devem continuar sendo os ids publicos reais). Nao foi corrigido neste PR para nao
  alterar comportamento.
- O CSS legado concentra o visual. Tailwind deve entrar somente com prefixo `tw-` e sem habilitar
  preflight.

## Primeira fatia recomendada

Antes de migrar qualquer React, criar um PR pequeno para proteger o render/adapter legado do header,
hero e campos principais do Registro, cobrindo:

- estado inicial de novo registro;
- modo edicao;
- equipamento ausente/selecionado;
- ids `#view-registro`, `#registro-hero`, `#r-equip`, `#r-data`, `#r-tipo`, `#r-obs` e
  `#r-tecnico`;
- acoes `save-registro`, `save-and-share-registro`, `clear-registro` e `quick-service-template`;
- XSS/HTML injection nos textos dinamicos.

Depois desse teste, a primeira ilha React deve ser pequena e read-only, preferencialmente o bloco de
hero/progresso ou o bloco de contexto do equipamento. Checklist, fotos, assinatura, PDF, WhatsApp,
salvamento e navegacao devem permanecer legados ate terem testes especificos.

## Riscos

- Qualquer mudanca no Registro tem alto risco porque a tela concentra criacao, edicao, upload,
  assinatura, PDF/WhatsApp e navegacao.
- Handlers legados dependem de ids globais e delegacao por `data-action`.
- O checklist PMOC mistura dados, DOM e eventos.
- Upload de fotos e assinatura tem side effects e nao devem ser exercitados por ilhas iniciais.
- O view model ainda e read-only; ele nao substitui validacao, salvamento ou render legado.
- Mudancas futuras devem manter um PR de preparacao/teste separado do PR de migracao.
