# app-v2 - Primary bootstrap CP-AA

## Objetivo

Criar um bootstrap de produção para o app-v2 sem promover ainda o app-v2 para a
raiz `/` e sem alterar `index.html`.

Esta CP prepara o arquivo que poderá ser usado em uma futura troca controlada do
entrypoint principal, mas mantém o v1 como produção atual.

## Escopo revisado antes da execução

Arquivos de runtime alterados:

- `src/app-v2/main.tsx`
- `src/app-v2/main.test.tsx`

Arquivos documentais alterados:

- `docs/rewrite/app-v2-primary-bootstrap-cp-aa.md`
- `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`
- `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`
- `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`

Contratos envolvidos:

- root de produção futuro: `app-v2-root`;
- `mountAuthenticatedAppV2`;
- `createAuthenticatedAppV2BrowserOptions`;
- `AppV2AuthenticatedBrowserClient`.

## Implementação

Foi criado:

```text
src/app-v2/main.tsx
```

Responsabilidade:

- procurar `document.getElementById('app-v2-root')`;
- compor opções autenticadas usando o client Supabase real;
- chamar `mountAuthenticatedAppV2` quando o root existir;
- não montar nada quando o root não existir.

Esse arquivo é um bootstrap de produção app-v2, diferente de:

- `src/app-v2/preview.tsx`, que segue local/mockado;
- `src/app-v2/authenticatedPreview.tsx`, que segue harness autenticado opt-in.

## O que não foi alterado

- `index.html`;
- `/src/app.js`;
- v1/legado;
- router/deep links;
- storage real amplo;
- migrations, schemas ou policies RLS;
- PDF/share;
- WhatsApp;
- billing;
- upload/storage de arquivos;
- assinatura, PMOC real ou orçamento real;
- `package.json`, Vite, ESLint ou TypeScript config.

## TDD executado

RED:

```bash
npm test -- src/app-v2/main.test.tsx --run
```

Resultado esperado/observado:

- falhou porque `src/app-v2/main.tsx` ainda não existia.

GREEN:

```bash
npm test -- src/app-v2/main.test.tsx --run
```

Resultado:

- 1 arquivo;
- 3 testes passaram.

Testes focados adicionais:

```bash
npm test -- src/app-v2/main.test.tsx src/app-v2/index.test.tsx src/app-v2/authenticatedBrowserOptions.test.ts src/app-v2/authenticatedHarness.test.tsx --run
```

Resultado:

- 4 arquivos;
- 14 testes passaram.

## Validação final esperada

Para fechar esta CP:

```bash
npm run format
npm run build
npm run check
git diff --check
```

Resultado esperado:

- build passa;
- check passa com o warning conhecido em `src/domain/pdf/shareReport.js`;
- warnings Vite static/dynamic e chunk-size permanecem backlog controlado.

## Resultado

O app-v2 agora tem um bootstrap de produção pronto para uma futura CP-AB de
troca controlada do `index.html`.

## Próximo CP recomendado

Se houver sessão de teste disponível:

```text
CP-Y - validar sessão Supabase real no authenticated preview
```

Se não houver sessão de teste disponível:

```text
CP-AB - trocar index.html para o bootstrap app-v2 em uma etapa controlada,
com validação local, browser, E2E e rollback explícito
```
