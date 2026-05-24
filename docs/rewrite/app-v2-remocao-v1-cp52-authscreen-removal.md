# app-v2 - CP52 - Remocao da tela de autenticacao v1

## 1. Objetivo

Remover a UI legada de autenticacao do v1 que restava em
`src/ui/components/authscreen.js` e seu modal auxiliar de recuperacao de senha.

Este CP nao altera autenticacao real, Supabase, sessao app-v2, RLS, storage ou
rotas. O app-v2 continua usando o bootstrap autenticado proprio em
`src/app-v2/main.tsx` e seus adapters dedicados.

## 2. Evidencia de nao uso runtime

Busca executada antes da remocao:

```bash
rg -n "AuthScreen|authscreen\.js|PasswordRecoveryModal|passwordRecoveryModal\.js|auth-overlay|cooltrack-post-auth-redirect" src index.html public e2e docs/rewrite --glob '!docs/rewrite/app-v2-remocao-v1-cp51-sensitive-areas-rebuild-plan.md'
rg -n "AuthScreen|passwordRecoveryModal" src/ui src/app-v2 src/core src/domain index.html public e2e
```

Resultado:

- `src/ui/components/authscreen.js` importava
  `src/ui/components/passwordRecoveryModal.js`;
- nao havia import runtime a partir de `src/app-v2`, `src/core`,
  `src/domain`, `index.html`, `public` ou `e2e`;
- os demais usos estavam em teste dedicado da propria tela ou mocks legados.

## 3. Alteracoes

- Removido `src/ui/components/authscreen.js`.
- Removido `src/ui/components/passwordRecoveryModal.js`.
- Removido `src/__tests__/authscreen.redesign.test.js`, que validava somente a
  tela v1 aposentada.
- Removidos mocks obsoletos de `authscreen.js` em testes legados que nao tinham
  consumidor runtime desse modulo.
- Atualizado `src/__tests__/legacyShellRetirementGate.test.js` para manter os
  arquivos removidos fora da base.

## 4. Fora de escopo

- Login real do app-v2.
- Supabase Auth.
- Recuperacao de senha app-v2-native.
- Layout ou copy de autenticacao futura.
- RLS, storage e schema.

## 5. Validacao esperada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/app-v2/main.test.tsx src/app-v2/authenticatedHarness.test.tsx src/app-v2/authenticatedBrowserOptions.test.ts src/app-v2/data/appV2AuthenticatedDataSource.test.ts src/app-v2/data/supabaseAppV2SessionReader.test.ts --run
npm run format
npm run build
npm run check
```
