# Mudanca 18 / CP-E - Orquestrador unico de Registrar servico

## Objetivo

Consolidar a intencao `Registrar servico` em um entrypoint unico, usado pelo CTA principal do Dashboard, pelo botao central da navegacao mobile e pelos fluxos que ja iniciavam registro a partir de um equipamento.

## Estado inicial

- Branch inicial: `main`
- HEAD inicial: `08d051fc91041cd6e78008590a00bc2992d966bf`
- Working tree inicial: limpo
- Base anterior: CP-D commitada em `refactor(flow): show client equipment directly`

## Arquivos alterados

- `src/ui/controller/serviceRegistrationEntry.js`
- `src/ui/controller/handlers/navigationHandlers.js`
- `src/ui/controller/routes.js`
- `src/ui/components/registroEquipPicker.js`
- `src/ui/shell/templates/nav.js`
- `src/ui/shell/templates/views.js`
- `src/ui/viewModels/dashboardContracts.js`
- `src/ui/viewModels/dashboardViewModel.js`
- `src/ui/views/equipamentos.js`
- `src/react/pages/DashboardHero.jsx`
- `src/features/equipamentos/crud/postActions.js`
- `src/features/equipamentos/crud/saveEquip.js`
- `src/__tests__/serviceRegistrationEntry.test.js`
- `src/__tests__/registroEquipPicker.test.js`
- `src/__tests__/shell.test.js`
- `src/__tests__/dashboardViewModel.test.js`
- `src/__tests__/dashboardHeroIsland.test.jsx`
- `src/__tests__/dashboardLegacyHero.test.js`
- `src/features/equipamentos/__tests__/crud/postActions.test.js`
- `src/features/equipamentos/__tests__/crud/saveEquip.test.js`
- `docs/flow/mudanca-18-cp-e-orquestrador-registrar-servico.md`

## Comportamento anterior

- O CTA principal do Dashboard e o botao central da nav usavam `data-nav="registro"` e abriam o formulario diretamente.
- Cards com equipamento usavam `go-register-equip` para navegar a `registro` com `equipId`.
- A criacao de equipamento com `postAction: register` tambem navegava diretamente para `registro` com `equipId`.
- O picker de equipamentos existia, mas nao era o entrypoint padrao quando o usuario iniciava registro sem equipamento em contexto.

## Comportamento novo

- `startServiceRegistration()` passa a ser o entrypoint unico para a intencao `Registrar servico`.
- Com `equipId` ou `equipamentoId`, o entrypoint navega para `registro` com o equipamento selecionado.
- Sem equipamento em contexto, o entrypoint navega para `registro` com `openEquipPicker: true`.
- A rota `registro` inicializa o formulario e abre programaticamente o picker quando recebe `openEquipPicker`.
- Se nao houver equipamentos cadastrados, o picker mostra o CTA `Cadastrar primeiro equipamento` com `data-post-action="register"`, reaproveitando o fluxo existente de cadastro e continuacao para Registro.

## Contratos novos de entrada em Registrar servico

- `data-action="start-service-registration"` representa a intencao de iniciar registro de servico sem equipamento pre-selecionado.
- `startServiceRegistration({ equipId })` representa entrada com equipamento em contexto.
- `go-register-equip` continua existindo para contratos publicos legados, mas delega para `startServiceRegistration({ equipId })`.
- `postAction: register` em cadastro de equipamento delega para o mesmo entrypoint quando recebe `equipId`.

## Testes alterados

- `serviceRegistrationEntry.test.js`
  - cobre entrada direta com equipamento;
  - cobre entrada sem equipamento com lista existente;
  - cobre entrada sem nenhum equipamento cadastrado.
- `registroEquipPicker.test.js`
  - cobre o CTA de cadastro com `postAction: register` quando a lista esta vazia.
- `shell.test.js`
  - cobre o botao central da nav usando `start-service-registration`.
- `dashboardViewModel.test.js`, `dashboardHeroIsland.test.jsx` e `dashboardLegacyHero.test.js`
  - cobrem o CTA principal do Dashboard usando a mesma acao.
- `postActions.test.js` e `saveEquip.test.js`
  - cobrem a continuacao do cadastro de equipamento para Registro via entrypoint unico.

## Validacao executada

- `npm run test -- src/__tests__/serviceRegistrationEntry.test.js src/__tests__/shell.test.js src/__tests__/dashboardViewModel.test.js src/__tests__/dashboardHeroIsland.test.jsx src/__tests__/dashboardLegacyHero.test.js src/features/equipamentos/__tests__/crud/postActions.test.js src/features/equipamentos/__tests__/crud/saveEquip.test.js`
  - primeiro: falhou no comportamento antigo esperado pelo novo contrato;
  - depois da implementacao: passou, 40 testes.
- `npm run test -- src/__tests__/registroEquipPicker.test.js src/__tests__/serviceRegistrationEntry.test.js src/__tests__/shell.test.js src/__tests__/dashboardViewModel.test.js src/__tests__/dashboardHeroIsland.test.jsx src/__tests__/dashboardLegacyHero.test.js src/features/equipamentos/__tests__/crud/postActions.test.js src/features/equipamentos/__tests__/crud/saveEquip.test.js`
  - passou, 42 testes.
- `npm run test -- src/__tests__/serviceRegistrationEntry.test.js src/__tests__/registroEquipPicker.test.js src/__tests__/shell.test.js src/__tests__/dashboardViewModel.test.js src/__tests__/dashboardHeroIsland.test.jsx src/__tests__/dashboardLegacyHero.test.js src/features/equipamentos/__tests__/crud/postActions.test.js src/features/equipamentos/__tests__/crud/saveEquip.test.js src/__tests__/equipamentosLegacySetorDetailHandlers.test.js src/__tests__/equipamentosReactHeaderLegacyHandlers.test.jsx src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js`
  - passou, 55 testes.

Validacao completa da CP-E deve incluir:

- `npm run format`
  - passou; nao alterou arquivos fora da CP-E.
- `npm run build`
  - passou com warnings Vite conhecidos de static/dynamic import e chunks grandes.
- `npm run check`
  - passou com 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings Vite conhecidos.
- `git diff --check`
  - passou.

## Riscos remanescentes

- `continue-draft` e edicao de registro existente continuam navegando diretamente para `registro`, pois nao representam inicio de novo atendimento.
- O picker reaproveita o modal de equipamento existente; a experiencia visual completa de onboarding/cadastro rapido fica para CP futura se necessario.
- O fluxo pos-save de PDF/WhatsApp foi preservado e nao foi revalidado em profundidade nesta CP para evitar mistura com PDF/share.

## Proximo CP recomendado

CP-F: onboarding contextual do tecnico, mantendo monetizacao de PDF/cotas e PMOC avancado para fases posteriores.
