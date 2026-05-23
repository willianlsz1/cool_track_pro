# app-v2 - CP-Y - sessao real no authenticated preview

## Objetivo

Validar o app-v2 com sessao Supabase real no browser antes de promover a branch
como versao principal.

Esta CP e um gate obrigatorio para o corte final, mas a execucao completa exige
uma conta real de teste. Ela nao altera runtime, storage, RLS, billing,
PDF/share, WhatsApp, upload/storage, PMOC ou v1.

## Estado atual

- Branch: `codex/rewrite-zero-react-parallel`
- HEAD preflight: `78f75a132c06996f0caf12b3ba27c216dbdecca7`
- HEAD base antes da validacao:
  `b4445e4b1ba92d8027c1e9bad44ba3e7f68ccdcf`.
- Preview Cloudflare responsivo validado em CP-AK.
- `.env.local` possui `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Conta de teste validada em ambiente local:
  - email: `user@gmail.com`;
  - senha: nao registrada neste documento.
- Segunda conta de teste validada para isolamento:
  - email: `user1@gmail.com`;
  - senha: nao registrada neste documento.

## O que pode ser validado sem conta real

- O entrypoint `src/app-v2/authenticated-preview.html` existe.
- O entrypoint monta `src/app-v2/authenticatedPreview.tsx`.
- O bootstrap autenticado usa Supabase somente no entrypoint/factory, mantendo
  shell e telas sem import direto de auth/storage.
- O PR atual esta com checks externos verdes e merge state limpo.
- O executor opt-in `scripts/app-v2-real-session-smoke.mjs` valida configuracao
  local e falha cedo quando as credenciais reais nao existem.

## Evidencia real executada em 2026-05-23

Com Vite local em `http://127.0.0.1:5173`, o smoke opt-in foi executado com
sessao Supabase real:

```powershell
node scripts/app-v2-real-session-smoke.mjs
```

Resultado:

- `ok`: `true`;
- `userId`: `8438983a-aafb-428f-b2f8-f1be4b4870de`;
- `email`: `user@gmail.com`;
- cliente criado: `Cliente CP-Y 2026-05-23T22-26-53-420Z`;
- equipamento criado: `Equipamento CP-Y 2026-05-23T22-26-53-420Z`;
- tag criada: `CPY-2026-05-23T22-26`.

Durante a validacao, tentativas anteriores criaram clientes CP-Y sem
equipamento enquanto o writer real ainda estava desalinhado com o schema. A
execucao final acima confirma escrita real minima de cliente e equipamento pelo
browser autenticado.

## O que ainda nao pode ser provado com uma unica conta real

Resolvido em 2026-05-23 com o smoke de isolamento entre duas contas reais.

## Evidencia de isolamento real executada em 2026-05-23

Com Vite local em `http://127.0.0.1:5173`, o smoke opt-in de isolamento foi
executado com duas sessoes Supabase reais:

```powershell
node scripts/app-v2-real-session-isolation-smoke.mjs
```

Antes de criar nova evidencia, o harness remove somente linhas de teste do
usuario primario com prefixos `Cliente CP-Y` e `Equipamento CP-Y`, para evitar
falso negativo por limite do plano durante reexecucoes.

Resultado:

- `ok`: `true`;
- usuario primario: `user@gmail.com`
  (`8438983a-aafb-428f-b2f8-f1be4b4870de`);
- usuario secundario: `user1@gmail.com`
  (`38f8141e-85b2-4606-b086-178a4474047d`);
- cliente criado pelo primario:
  `Cliente CP-Y isolamento 2026-05-23T22-45-13-450Z`;
- equipamento criado pelo primario:
  `Equipamento CP-Y isolamento 2026-05-23T22-45-13-450Z`;
- leitura direta como usuario secundario:
  - `clientes`: `[]`;
  - `equipamentos`: `[]`;
- browser autenticado do usuario secundario abriu `authenticated-preview.html`
  e nao exibiu os nomes criados pelo usuario primario.

## Procedimento de execucao quando houver conta de teste

1. Exportar credenciais de teste somente no ambiente local:

```powershell
$env:APP_V2_TEST_EMAIL = "<email-da-conta-de-teste>"
$env:APP_V2_TEST_PASSWORD = "<senha-da-conta-de-teste>"
```

2. Abrir o app em ambiente local com `.env.local`:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

3. Em outro terminal, executar o smoke real opt-in:

```powershell
node scripts/app-v2-real-session-smoke.mjs
```

Esse comando:

- le `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do ambiente ou de
  `.env.local`;
- autentica via `supabase.auth.signInWithPassword`;
- abre `authenticated-preview.html` com Playwright;
- cria um cliente real de teste com prefixo `Cliente CP-Y`;
- cria um equipamento real de teste com prefixo `Equipamento CP-Y`;
- falha se houver erro de console bloqueante no browser.

Os registros criados sao evidencia do smoke e podem ser removidos manualmente
depois, se necessario.

4. Autenticar manualmente a conta no mesmo projeto Supabase usado por
   `.env.local`, caso seja necessario confirmar o comportamento visual.

5. Abrir:

```text
http://127.0.0.1:5173/src/app-v2/authenticated-preview.html
```

6. Confirmar no browser:

- tela `Hoje` carrega sem erro de console;
- dados de clientes/equipamentos pertencem ao usuario autenticado;
- criar ou editar um cliente;
- criar ou editar um equipamento;
- recarregar a pagina e confirmar persistencia;
- confirmar que dados de outro usuario nao aparecem.

## Criterio de aceite da CP-Y

A CP-Y so pode ser marcada como concluida quando houver evidencia de browser com
sessao real e ao menos uma leitura/escrita real minima sob usuario autenticado.
Sem essa evidencia, o app-v2 ainda nao deve ser promovido como versao principal
final.

## Proximo passo

Remover o estado draft do PR de corte quando houver aprovacao explicita para
promover o app-v2 como versao principal.
