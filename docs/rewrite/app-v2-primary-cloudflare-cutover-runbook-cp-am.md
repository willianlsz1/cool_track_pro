# app-v2 - CP-AM - runbook de promocao Cloudflare

## Objetivo

Definir o procedimento operacional para promover o app-v2 como versao principal
no Cloudflare Pages depois que os gates finais forem aprovados.

Esta CP e documental. Ela nao executa merge, nao altera runtime, nao muda
Cloudflare, nao altera DNS, nao toca em Supabase/RLS, storage, billing,
PDF/share, WhatsApp, upload/storage, PMOC, assinatura, orcamento real ou v1.

## Estado de entrada

- Branch de trabalho: `codex/rewrite-zero-react-parallel`.
- PR de corte: `https://github.com/Willianlsz1/Cool_Track_Pro/pull/287`.
- App-v2 ja e o bootstrap principal da branch desde CP-AB.
- Fallback SPA do Cloudflare Pages foi ajustado em CP-AJ.
- Smoke responsivo externo do Cloudflare Pages foi validado em CP-AK.
- Checklist go/no-go foi consolidado em CP-AL.
- Executor opt-in de sessao real foi criado para CP-Y:

```powershell
node scripts/app-v2-real-session-smoke.mjs
```

## Pre-condicoes obrigatorias

Antes de promover para principal, todos os itens abaixo precisam estar
comprovados no estado atual da branch:

| Gate                                   | Evidencia esperada                                            |
| -------------------------------------- | ------------------------------------------------------------- |
| PR atualizado                          | PR #287 aponta para o HEAD final da branch                    |
| PR nao esta em draft                   | Draft removido somente depois dos demais gates                |
| Checks remotos verdes                  | CI, Playwright, pgTAP, size-limit, Cloudflare Pages, Supabase |
| CP-Y executada                         | Smoke real com conta Supabase de teste                        |
| Escrita real minima                    | Cliente e equipamento CP-Y criados sob usuario autenticado    |
| Isolamento real ou decisao documentada | Dois usuarios validados ou etapa RLS dedicada aprovada        |
| Areas fora do corte aprovadas          | Checklist CP-AL assinado pelo usuario/produto                 |
| Rollback confirmado                    | CP-AB e este runbook apontam caminho de reversao              |
| Worktree limpa                         | `git status --short` sem alteracoes locais                    |
| HEAD remoto igual ao local             | `origin/codex/rewrite-zero-react-parallel` no mesmo commit    |

## Procedimento de promocao

1. Confirmar estado local:

```powershell
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git ls-remote origin codex/rewrite-zero-react-parallel
```

2. Confirmar PR e checks:

```powershell
gh pr view 287 --json url,isDraft,mergeStateStatus,headRefOid,statusCheckRollup
```

Aceitar somente:

- `isDraft: false`;
- `mergeStateStatus: CLEAN`;
- todos os checks obrigatorios em `SUCCESS`.

3. Executar CP-Y no ambiente local com conta real de teste:

```powershell
$env:APP_V2_TEST_EMAIL = "<email-da-conta-de-teste>"
$env:APP_V2_TEST_PASSWORD = "<senha-da-conta-de-teste>"
npm run dev -- --host 127.0.0.1 --port 5173
```

Em outro terminal:

```powershell
node scripts/app-v2-real-session-smoke.mjs
```

Registrar no documento CP-Y:

- usuario usado, sem senha;
- commit testado;
- data/hora;
- cliente CP-Y criado;
- equipamento CP-Y criado;
- resultado do comando.

4. Remover draft do PR somente depois dos gates acima:

```powershell
gh pr ready 287
```

5. Fazer merge pelo GitHub ou CLI, preservando o historico do PR:

```powershell
gh pr merge 287 --merge
```

6. Aguardar o deploy da branch principal no Cloudflare Pages.

7. Rodar smoke pos-promocao na URL principal:

- abrir `/`;
- abrir `/equipamentos`;
- abrir `/servicos`;
- abrir `/conta`;
- confirmar `#app-v2-root`;
- confirmar ausencia do root legado `#app`;
- confirmar navegacao principal visivel;
- confirmar ausencia de erro bloqueante no console;
- confirmar login/sessao real com usuario de teste;
- confirmar que cliente/equipamento real aparecem para o usuario autenticado.

8. Registrar o resultado em um documento de fechamento ou atualizar CP-Y/CP-AL.

## Criterios de sucesso pos-promocao

O corte so deve ser considerado concluido quando:

- Cloudflare Pages publicou a branch principal sem erro;
- as rotas principais respondem 200;
- refresh direto em `/equipamentos`, `/servicos` e `/conta` permanece no app-v2;
- login/sessao real funciona;
- leitura real de cliente/equipamento funciona;
- escrita real minima continua funcionando;
- nao ha erro de console bloqueante;
- o v1 permanece disponivel no repositorio como baseline congelado e rollback.

## Rollback

Rollback tecnico minimo:

1. Criar commit revertendo `index.html` para o root legado conforme CP-AB.
2. Restaurar no `index.html`:

```html
<div id="app">
  <noscript>
    <p style="padding: 20px; text-align: center">
      CoolTrack Pro requer JavaScript. Por favor, habilite no seu navegador.
    </p>
  </noscript>
</div>
<script type="module" src="/src/app.js"></script>
```

3. Se o rollback precisar restaurar tambem o visual legado completo, recolocar
   os links CSS listados em CP-AB.
4. Rodar:

```powershell
npm run format
npm run check
git diff --check
```

5. Commitar e promover a reversao pela branch principal.
6. Confirmar no Cloudflare Pages:

- `/` volta a montar o root legado `#app`;
- `/src/app.js` carrega;
- fluxo basico do v1 abre;
- rotas app-v2 deixam de ser consideradas contrato principal.

Rollback operacional alternativo:

- se Cloudflare permitir rollback de deploy pelo painel, restaurar o deploy
  anterior estavel enquanto o commit de rollback e preparado no repositorio.

## Limites assumidos do primeiro corte

Mesmo com a promocao, os itens abaixo continuam fora do primeiro corte ate
etapa propria:

- PDF/share real;
- WhatsApp real;
- billing/features pagas;
- upload/storage real;
- PMOC real;
- assinatura digital real;
- orcamento real com aceite/envio externo.

Essas areas nao devem ser corrigidas durante o corte, salvo se houver incidente
direto causado pela promocao.

## Proximo passo

Executar CP-Y com conta Supabase real. Se CP-Y passar e as areas fora do corte
forem aprovadas explicitamente, usar este runbook para tirar o PR de draft,
fazer merge e validar o Cloudflare principal.
