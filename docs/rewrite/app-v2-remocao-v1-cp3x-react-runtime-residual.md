# app-v2 remocao v1 - CP-3x residuos src/react

## Objetivo

Remover a arvore residual `src/react/` apos a migracao das ilhas v1 para
renderers DOM, sem alterar o app-v2 React/TypeScript em `src/app-v2/`.

## Alteracoes

- Removidos utilitarios React sem consumidor de runtime:
  - `src/react/components/ErrorBoundary.jsx`
  - `src/react/components/ui/Button.jsx`
  - `src/react/components/ui/Badge.jsx`
  - `src/react/components/ui/index.js`
  - `src/react/styles/tailwind.css`
  - `src/react/README.md`
- Removidos testes exclusivos desses utilitarios:
  - `src/__tests__/errorBoundary.test.jsx`
  - `src/__tests__/uiPrimitives.test.jsx`
- `tailwind.config.cjs` deixou de varrer `src/react/**/*`.
- O comentario congelado de `src/assets/styles/components.css` passou a apontar
  novas UIs para `src/app-v2` e Tailwind `tw-*`.
- `reactCleanupContracts.test.js` agora protege a ausencia da arvore `src/react`.
- Testes legados que ja cobrem handlers DOM tiveram nomes atualizados para
  remover referencias stale a ilhas React:
  - `src/__tests__/registroLegacyFieldHandlers.test.js`
  - `src/__tests__/equipamentosLegacyHeaderHandlers.test.js`

## Contratos preservados

- React continua disponivel para o app-v2 em `src/app-v2/`.
- Nenhum contrato publico de DOM legado foi alterado.
- Nenhuma dependencia de `package.json` foi removida, porque o app-v2 ainda usa
  React.

## Fora de escopo

- Remover React do projeto.
- Alterar Vite, ESLint, TypeScript ou dependencias.
- Atualizar documentos historicos de migracao que citam `src/react` como
  referencia passada.
- PDF/share, storage, router, Supabase/RLS, billing e pricing.

## Validacao

- RED inicial: `npm test -- src/__tests__/reactCleanupContracts.test.js --run`
  falhou porque `src/react` ainda existia.
- RED adicional: o mesmo contrato falhou enquanto nomes antigos de testes
  legados ainda continham `React`.
- Validacao final deve incluir:
  - `npm test -- src/__tests__/reactCleanupContracts.test.js --run`
  - `npm run format`
  - `npm run build`
  - `npm run check`
  - scans de residuos para imports vivos de `src/react`.

## Riscos remanescentes

- Documentos historicos ainda citam `src/react` para preservar contexto de
  migracao; isso nao representa uso de runtime.
