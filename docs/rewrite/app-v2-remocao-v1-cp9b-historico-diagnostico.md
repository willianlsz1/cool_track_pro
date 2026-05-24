# app-v2 remocao v1 - CP-9b diagnostico do Historico v1

## Objetivo

Validar se a superficie v1 de Historico poderia ser removida como primeiro lote
de runtime apos a triagem de `src/features`.

Resultado: nao remover neste checkpoint. O diagnostico mostrou acoplamento maior
que o esperado e interseccao com areas sensiveis.

Este checkpoint e documental. Ele nao altera runtime, app-v2, storage,
Supabase/RLS, PDF/share, WhatsApp, PMOC, billing/pricing, CSS ou schema.

## Evidencia encontrada

Consumidores runtime diretos:

- `src/ui/controller/routes.js` importa `renderHist`,
  `setHistClienteFilter` e `clearHistClienteFilter`.
- `src/ui/controller/routes.js` registra a rota `historico`.
- `src/ui/controller/helpers/themeInitHelpers.js` importa `renderHist` e liga
  eventos em `hist-busca`, `hist-setor` e `hist-equip`.
- `src/ui/controller/handlers/registroHandlers.js` importa `deleteReg` de
  `src/ui/views/historico.js`.
- `src/ui/views/clientes.js` navega para `goTo('historico', { clienteId })`.
- `src/features/registro/save/postSave.js` navega para `goTo('historico')`.
- `src/ui/shell.js`, `src/ui/shell/navigationMode.js`,
  `src/ui/shell/templates/nav.js` e `src/ui/shell/templates/sidebar.js`
  ainda citam `historico` como destino de navegacao legado.
- `src/ui/shell/templates/views.js` ainda contem `#view-historico`.

Superficies que tornam a remocao sensivel:

- `src/ui/views/historico/timelineRenderer.js` renderiza acoes
  `data-action="export-pdf"` e `data-action="whatsapp-export"`.
- Testes de `historicoPdfWhatsappIntegration`, `reportExportContracts` e
  `registroPdfWhatsappRegistroId` leem contratos do timeline.
- `historicoRegistroIntegration` cobre integracao entre historico e registro.
- `criticalFlow.contract` usa o renderer de timeline como parte do fluxo
  operacional critico.

Testes diretamente ligados ao Historico v1:

- `historicoView.test.js`
- `historicoFilters.contract.test.js`
- `historicoFiltersLegacyRender.test.js`
- `historicoTimelineLegacyRender.test.js`
- `historicoTimelineRenderer.test.js`
- `historicoFiltersRenderer.test.js`
- `historicoCardActions.contract.test.js`
- `historicoRegistroIntegration.contract.test.js`
- `historicoPdfWhatsappIntegration.contract.test.js`
- `src/features/historico/**/__tests__`

## Decisao

Nao executar a remocao de Historico v1 como CP-9b.

A remocao direta tocaria ao mesmo tempo:

- router legado;
- shell legado;
- dashboard/clientes/registro;
- renderers de timeline/filtros;
- contratos de PDF/WhatsApp por registro;
- testes de fluxo critico.

Isso violaria a regra de nao misturar remocao estrutural com PDF/share,
WhatsApp, registro e fluxo critico.

## Proximo caminho seguro

Antes de deletar Historico v1, criar um CP dedicado para separar contratos
compartilhados do timeline:

1. Identificar quais contratos de timeline ainda sao usados por testes de
   PDF/WhatsApp/registro.
2. Mover contratos puros necessarios para modulo neutro ou cobri-los por testes
   do app-v2.
3. So depois remover a view/rota `historico` e os helpers
   `src/features/historico/**`.

Alternativa de curto prazo: procurar outro lote v1 menos acoplado que nao toque
PDF/share, WhatsApp, registro, storage, assinatura, PMOC ou router amplo.

## Validacao esperada

- `npm run format:check`
- `git diff --check`
- `git diff --cached --check`
