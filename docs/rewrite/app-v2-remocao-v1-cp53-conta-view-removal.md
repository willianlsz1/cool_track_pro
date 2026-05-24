# app-v2 - CP53 - Remocao da view Conta v1

## 1. Objetivo

Remover a view legada `src/ui/views/conta.js`, que ficou sem entrada runtime
apos a promocao do app-v2 e a remocao do shell/controller v1.

Este CP nao remove `src/ui/account/userData.js`, porque exportacao/exclusao de
dados cruza LGPD, autenticacao e Edge Functions. Esse handler deve ser tratado
em CP separado.

## 2. Evidencia de nao uso runtime

Busca/grafo executado antes da remocao:

```bash
node <script read-only de inbound imports para src/ui/views>
rg -n "renderConta|conta\.js|contaSource|view-conta|goTo\('privacidade'\)|/legal/privacidade.html|contaView" src/__tests__ src/ui src/app-v2 index.html e2e
```

Resultado:

- `src/ui/views/conta.js` nao tinha import runtime fora de testes;
- `src/ui/shell/templates/views.js` mantinha apenas o placeholder
  `#view-conta`;
- os demais usos eram `contaView.test`, um mock legado e contratos de limpeza.

## 3. Alteracoes

- Removido `src/ui/views/conta.js`.
- Removido `src/__tests__/contaView.test.js`.
- Removido o placeholder `#view-conta` de `src/ui/shell/templates/views.js`.
- Atualizados gates/contratos para garantir que a view Conta v1 continua
  removida.

## 4. Fora de escopo

- `src/ui/account/userData.js`.
- Supabase Auth.
- Edge Functions de exportacao/exclusao de dados.
- Conta app-v2.
- Legal publico em `public/legal/**`.

## 5. Validacao esperada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/billingPricingCleanupContracts.test.js src/__tests__/historicoRegistroIntegration.contract.test.js src/__tests__/userData.test.js --run
npm run format
npm run build
npm run check
```
