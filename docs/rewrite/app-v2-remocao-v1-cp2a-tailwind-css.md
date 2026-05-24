# app-v2 - CP-2a CSS Tailwind fora de src/react

## 1. Objetivo

Remover o acoplamento direto do app-v2 com `src/react/styles/tailwind.css`,
preparando a remocao futura de `src/react/**` sem quebrar as ilhas React v1 que
ainda existem.

Este checkpoint nao remove ilhas React, nao altera Tailwind config, nao altera
CSS legado e nao muda comportamento visual intencionalmente.

## 2. Mudanca

- Criado `src/app-v2/styles/tailwind.css`.
- Atualizado `src/app-v2/index.tsx` para importar `./styles/tailwind.css`.
- Mantido `src/react/styles/tailwind.css` porque ainda e importado por ilhas
  React legadas:
  - `src/react/entrypoints/alertasIsland.jsx`;
  - `src/react/entrypoints/clientesIsland.jsx`;
  - `src/react/entrypoints/equipamentosListIsland.jsx`;
  - `src/react/entrypoints/landingIsland.jsx`;
  - `src/react/entrypoints/orcamentosIsland.jsx`.

## 3. Fora de escopo

- Remover `src/react/styles/tailwind.css`.
- Remover `src/react/**`.
- Alterar `tailwind.config.cjs`.
- Limpar CSS legado.
- Alterar runtime v1, PDF/share, storage, auth, billing, legal ou CSP.

## 4. Risco

Risco baixo. O app-v2 passou a consumir o mesmo conteudo CSS por caminho proprio.
O arquivo antigo fica preservado para os consumidores legados ate CP-3.

## 5. Validacao esperada

```bash
rg -n "react/styles/tailwind|styles/tailwind.css|@tailwind" src index.html tailwind.config.cjs
npm test -- src/app-v2/index.test.tsx --run
npm run format
npm run build
npm run check
```

## 6. Proximo passo

Executar CP-2b: extrair o contrato `Profile` ainda usado por `src/domain/pdf.js`
e `src/domain/whatsapp.js` para fora de `src/features/profile.js`.
