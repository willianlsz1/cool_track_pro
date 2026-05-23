# app-v2 - Authenticated harness browser audit CP-W

## Objetivo

Auditar em browser local o harness autenticado opt-in criado na CP-V, sem
alterar runtime, shell, telas, router, storage amplo, PDF/share, WhatsApp,
billing, upload ou PMOC.

Esta CP e documental/validacao. Ela nao amplia persistencia real e nao muda o
comportamento do preview default.

## Escopo revisado antes da execucao

Arquivos runtime observados:

- `src/app-v2/authenticated-preview.html`
- `src/app-v2/authenticatedPreview.tsx`
- `src/app-v2/authenticatedHarness.ts`
- `src/app-v2/preview.html`
- `src/app-v2/preview.tsx`

Arquivos documentais alterados:

- `docs/rewrite/app-v2-authenticated-harness-browser-audit-cp-w.md`
- `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`

Contratos envolvidos:

- `mountAuthenticatedAppV2`
- `createAuthenticatedAppV2BrowserOptions`
- `createSupabaseAppV2SessionReader`
- URL autenticada opt-in:
  `http://localhost:5173/src/app-v2/authenticated-preview.html`
- URL local/mockada default:
  `http://localhost:5173/src/app-v2/preview.html`

## Riscos avaliados

- **Mudanca funcional:** baixa, porque esta CP nao altera runtime.
- **Regressao visual:** baixa, validada por carregamento browser dos dois
  entrypoints.
- **Quebra de contrato publico:** baixa, nenhum contrato foi editado.
- **Storage/auth real:** medio, porque a sessao real nao foi validada nesta CP.
- **Seguranca/RLS:** fora do escopo; nenhuma migration ou policy foi alterada.

## Evidencia browser

Servidor local:

```text
http://localhost:5173/src/app-v2/authenticated-preview.html -> 200
```

### Entrypoint autenticado opt-in

URL aberta:

```text
http://localhost:5173/src/app-v2/authenticated-preview.html
```

Titulo observado:

```text
CoolTrack Pro app-v2 authenticated preview
```

Evidencia de UI carregada:

- root `app-v2-authenticated-preview` existe;
- sidebar/topo mostra `Hoje`, `Equipamentos`, `Servicos` e `Conta`;
- conteudo inicial mostra a tela `Hoje`;
- nenhum erro ou warning de console foi retornado pela leitura do browser.

Screenshot local gerado para conferencia manual:

```text
C:/Users/KABUM/AppData/Local/Temp/cooltrack-app-v2-cp-w-authenticated-preview.png
```

### Preview default local/mockado

URL aberta:

```text
http://localhost:5173/src/app-v2/preview.html
```

Titulo observado:

```text
CoolTrack Pro app-v2 preview
```

Evidencia de UI carregada:

- root do preview default existe;
- sidebar/topo mostra `Hoje`, `Equipamentos`, `Servicos` e `Conta`;
- conteudo inicial mostra a tela `Hoje`;
- nenhum erro ou warning de console foi retornado pela leitura do browser.

## Limites da evidencia

A leitura de `localStorage` pelo contexto restrito do browser retornou storage
indisponivel para avaliacao direta. Por isso, esta CP nao declara prova browser
forte de "sessao ausente" por inspecao de storage.

A garantia de fallback local sem sessao permanece coberta por testes de unidade
e integracao do harness:

- `authenticatedHarness.test.tsx`
- `appV2AuthenticatedDataSource.test.ts`
- `appV2DataSourceFactory.test.ts`
- `supabaseAppV2SessionReader.test.ts`

Sessao real tambem nao foi validada nesta CP porque exige uma sessao Supabase
real disponivel no browser local. Esse teste deve ser uma CP propria ou uma
validacao manual assistida quando houver credenciais/sessao ativa.

## Fronteiras preservadas

Nao foram alterados:

- `src/app-v2/preview.tsx`;
- `src/app-v2/index.tsx`;
- `src/app-v2/shell/*`;
- telas do app-v2;
- v1/legado;
- router/deep links;
- migrations, schemas ou policies RLS;
- storage real amplo;
- PDF/share;
- WhatsApp;
- billing;
- upload/storage de arquivos;
- assinatura, PMOC real ou orcamento real;
- `package.json`, Vite, ESLint ou TypeScript config.

## Validacao executada

Browser:

```text
GET /src/app-v2/authenticated-preview.html -> 200
GET /src/app-v2/preview.html -> carregou UI sem erros de console
```

Validacao final esperada para fechar esta CP documental:

```bash
npm run format:check
git diff --check
```

Como a CP nao altera codigo, `npm run build`, `npm run check` e testes focados
podem ser usados como validacao adicional se houver mudanca inesperada de
runtime. A ultima CP de runtime ja validou esses comandos no HEAD anterior.

## Resultado

O harness autenticado opt-in abre no browser local e nao quebra o preview
default. A CP confirma o carregamento visual e a ausencia de erros de console
nos dois entrypoints.

## Proximo CP recomendado

Validar o harness autenticado com sessao Supabase real ativa:

1. autenticar uma conta de teste no ambiente local;
2. abrir `authenticated-preview.html`;
3. confirmar que `clientesReader`, `clientesWriter` e `equipamentosWriter`
   operam sob o usuario autenticado;
4. manter router, storage amplo, PDF/share, WhatsApp, billing, upload e PMOC
   fora do escopo.
