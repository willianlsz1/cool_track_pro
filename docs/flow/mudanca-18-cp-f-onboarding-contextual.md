# Mudanca 18 / CP-F - Onboarding contextual nao bloqueante

## Objetivo

Adicionar um onboarding curto e contextual para orientar o tecnico entre os dois pontos de partida principais do CoolTrack Pro:

- registrar um servico;
- organizar clientes/equipamentos.

O onboarding nao cria modo permanente, nao altera `navigationMode`, nao muda planos/limites e nao bloqueia a navegacao.

## Estado inicial

- Branch inicial: `main`
- HEAD inicial: `8124bd391ec8af5dcf57133641447911f7691b68`
- Working tree inicial: limpo
- Base anterior: CP-E commitada em `refactor(flow): unify service registration entrypoint`

## Arquivos alterados

- `src/app.js`
- `src/ui/components/onboarding/contextualOnboarding.js`
- `src/ui/views/dashboard.js`
- `src/react/pages/DashboardOnboarding.jsx`
- `src/ui/controller/handlers/navigationHandlers.js`
- `src/ui/viewModels/dashboardContracts.js`
- `src/__tests__/contextualOnboarding.test.js`
- `src/__tests__/contextualOnboardingHandlers.test.js`
- `src/__tests__/dashboardOnboardingIsland.test.jsx`
- `docs/flow/mudanca-18-cp-f-onboarding-contextual.md`

## Comportamento anterior

- O app tinha checklist de primeiros passos no Dashboard.
- O tour modal e o FirstTimeExperience permaneciam desativados para novos usuarios.
- Nao havia uma escolha inicial curta entre `Registrar servico` e `Organizar clientes`.

## Comportamento novo

- Ao montar o Dashboard pela primeira vez no escopo do usuario, o modelo de onboarding contextual fica visivel.
- O card aparece dentro do bloco de onboarding do Dashboard, como regiao nao bloqueante, sem overlay modal.
- A acao `Quero registrar um servico` chama o entrypoint unico `startServiceRegistration()`.
- A acao `Quero organizar meus clientes` navega para `clientes`.
- `Pular` e o botao de fechar dispensam o card.
- O card nao volta a aparecer quando o estado ja esta `seen`, `skipped` ou `completed`.

## Contrato do onboarding

- Chave de storage: `contextual-onboarding-v1`, salva via `userStorage`.
- Chave persistida efetiva: `ct:<userId>:contextual-onboarding-v1`.
- Estados persistidos:
  - `seen`: o usuario ja visualizou o onboarding;
  - `skipped`: o usuario pulou ou fechou;
  - `completed`: o usuario escolheu uma acao inicial.
- A escolha `register-service` inicia Registro pelo entrypoint unico da CP-E.
- A escolha `organize-clients` navega para Clientes e respeita as regras da CP-B.
- Nenhum estado alimenta `navigationMode`.

## Testes alterados/adicionados

- `contextualOnboarding.test.js`
  - cobre exibicao uma unica vez por usuario;
  - cobre storage escopado por usuario;
  - cobre estados `skipped` e `completed`;
  - garante que `navigationMode` e dados de plano nao sao alterados.
- `contextualOnboardingHandlers.test.js`
  - cobre acao para `startServiceRegistration()`;
  - cobre navegacao para `clientes`;
  - cobre pular sem tocar em `navigationMode`.
- `dashboardOnboardingIsland.test.jsx`
  - cobre renderizacao do card contextual como bloco nao bloqueante no Dashboard.

## Validacao executada

- `npm run test -- src/__tests__/contextualOnboarding.test.js src/__tests__/contextualOnboardingHandlers.test.js src/__tests__/dashboardOnboardingIsland.test.jsx`
  - primeiro: confirmou vermelho com modulo/contratos ainda ausentes;
  - depois da implementacao: passou, 13 testes.
- `npm run test -- src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/contextualOnboarding.test.js src/__tests__/contextualOnboardingHandlers.test.js src/__tests__/dashboardOnboardingIsland.test.jsx`
  - passou, 16 testes;
  - confirmou compatibilidade com o contrato legado do primeiro `.onb-card` do checklist.
- `npm run format`
  - passou;
  - nao alterou arquivos fora da CP-F.
- `npm run build`
  - passou com warnings Vite conhecidos de static/dynamic import e chunks grandes.
- `npm run check`
  - passou;
  - manteve 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js`;
  - manteve warnings Vite conhecidos.
- `git diff --check`
  - passou.

## Riscos remanescentes

- O onboarding contextual usa o Dashboard como ponto de exibicao. Se no futuro houver entrada autenticada direta em outra rota, o card so aparece quando o Dashboard renderizar.
- O checklist antigo de primeiros passos continua existindo; esta CP nao fez limpeza ampla de onboarding legado para evitar misturar escopos.
- O texto do onboarding foi mantido curto e sem tour guiado; um fluxo mais detalhado pode ser avaliado depois com dados de uso.

## Proximo CP recomendado

CP-G: monetizacao de PDF/cotas, somente em fase propria, sem misturar com Registro, Clientes, seguranca ou redesign amplo.
