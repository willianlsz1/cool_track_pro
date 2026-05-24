# app-v2 - Remocao v1 CP-13 - Contrato de aposentadoria do shell legado

## 1. Objetivo

Criar evidencia executavel de que a entrada principal do produto, agora app-v2,
nao depende de `src/ui/controller.js`, `src/ui/shell.js` ou `src/ui/shell/**`.

Este checkpoint nao remove runtime. Ele prepara a remocao futura do shell v1 com
um contrato objetivo.

## 2. Diagnostico

Scan executado antes da alteracao:

```bash
rg "src/ui|ui/shell|ui/controller|\\.\\/ui\\/shell|\\.\\/ui\\/controller|\\.\\.\\/ui\\/shell|\\.\\.\\/ui\\/controller" index.html src\\app-v2 src\\core src\\domain vite.config.js package.json -n
```

Resultado relevante:

- `index.html` monta `/src/app-v2/main.tsx`.
- `src/app-v2/` nao possui referencia a `src/ui/shell` ou
  `src/ui/controller`.
- `src/core/router.js` contem apenas comentario historico sobre o controller
  legado; nao ha import estatico de `src/ui`.
- As referencias reais a `src/ui/shell` e `src/ui/controller` permanecem em
  testes e documentos historicos de migracao.

## 3. Alteracao

Foi adicionado contrato em
`src/__tests__/legacyV1RemovalContracts.test.js` para:

- confirmar que `index.html` continua apontando para `/src/app-v2/main.tsx`;
- bloquear `/src/ui/` e `/src/app.js` no HTML principal;
- varrer `index.html`, `vite.config.js` e todos os arquivos `.ts`, `.tsx`,
  `.js`, `.jsx` e `.html` em `src/app-v2`;
- falhar se aparecer referencia a:
  - `src/ui/controller`;
  - `src/ui/shell`;
  - `../ui/controller`;
  - `../ui/shell`;
  - `../../ui/controller`;
  - `../../ui/shell`.

## 4. Fora de escopo

Nao foi removido:

- `src/ui/controller.js`;
- `src/ui/controller/**`;
- `src/ui/shell.js`;
- `src/ui/shell/**`;
- testes legados que ainda protegem contratos do v1 congelado;
- PDF/share, WhatsApp, assinatura, fotos, auth, storage, PMOC ou router.

## 5. Risco remanescente

O contrato prova independencia do app-v2 e do entrypoint principal em relacao ao
shell v1, mas nao prova que todos os testes legados podem ser removidos. O
proximo checkpoint deve inventariar os testes de shell/controller e separar:

- cobertura que pode ser aposentada junto com o v1;
- cobertura que deve migrar para app-v2;
- cobertura sensivel que precisa de etapa propria.

## 6. Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
