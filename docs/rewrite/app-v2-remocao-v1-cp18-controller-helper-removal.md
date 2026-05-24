# app-v2 - Remocao v1 CP-18 - Corte do helper de controller legado

## 1. Objetivo

Remover o helper orfao `src/ui/controller/helpers/themeInitHelpers.js` apos a
retirada do orquestrador `src/ui/controller.js`, sem tocar em rotas, handlers,
views, modais ou areas sensiveis ainda pendentes.

## 2. Diagnostico

Buscas executadas antes do corte:

```bash
rg -n "initControllerHelpers|setEquipViewMode|themeInitHelpers|expandEtiqueta|bindEtiqueta|bindNameplate|bindEquipDetails|resetRegistroEditingState" src docs/rewrite
rg -n "controller/helpers/themeInitHelpers|helpers/themeInitHelpers" src e2e index.html vite.config.js docs/rewrite
```

Resultado:

- `initControllerHelpers` nao era importado por runtime ativo.
- `src/ui/controller/helpers/themeInitHelpers.js` era a unica implementacao
  restante do helper.
- As referencias ativas restantes eram indiretas e opcionais via `window` em
  codigo legado que ainda sera removido por checkpoints futuros.

## 3. Escopo removido

- `src/ui/controller/helpers/themeInitHelpers.js`

## 4. Escopo ajustado

- `src/__tests__/legacyShellRetirementGate.test.js`
- comentarios/referencias locais que apontavam diretamente para
  `themeInitHelpers.js`.

## 5. Escopo preservado

- `src/ui/controller/routes.js`
- `src/ui/controller/handlers/**`
- `src/ui/views/**`
- `src/ui/components/**`
- `src/ui/shell/navigationMode.js`
- `src/ui/shell/templates/views.js`
- `src/ui/shell/templates/modals.js`

## 6. Fora de escopo

Nao foram alterados:

- router core;
- fluxo real de Registro;
- PDF/share;
- WhatsApp;
- assinatura;
- fotos/upload/storage;
- autenticacao;
- Supabase/RLS;
- PMOC real;
- orcamento real.

## 7. Validacao esperada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
