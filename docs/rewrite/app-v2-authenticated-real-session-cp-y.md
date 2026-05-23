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
- Preview Cloudflare responsivo validado em CP-AK.
- `.env.local` possui `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- O ambiente atual nao possui credenciais de conta de teste:
  - `APP_V2_TEST_EMAIL`: ausente;
  - `APP_V2_TEST_PASSWORD`: ausente;
  - `TEST_USER_EMAIL`: ausente;
  - `TEST_USER_PASSWORD`: ausente.

## O que pode ser validado sem conta real

- O entrypoint `src/app-v2/authenticated-preview.html` existe.
- O entrypoint monta `src/app-v2/authenticatedPreview.tsx`.
- O bootstrap autenticado usa Supabase somente no entrypoint/factory, mantendo
  shell e telas sem import direto de auth/storage.
- O PR atual esta com checks externos verdes e merge state limpo.

## O que ainda nao pode ser provado sem conta real

- `auth.getUser()` retornando usuario real no browser.
- Leitura real de clientes/equipamentos sob usuario autenticado.
- Escrita real minima de cliente.
- Escrita real minima de equipamento vinculado ao cliente.
- Isolamento de dados entre usuarios reais.

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

3. Autenticar a conta no mesmo projeto Supabase usado por `.env.local`.

4. Abrir:

```text
http://127.0.0.1:5173/src/app-v2/authenticated-preview.html
```

5. Confirmar no browser:

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

Fornecer ou criar uma conta de teste Supabase para o projeto usado por
`.env.local`. Depois disso, executar o procedimento acima e atualizar este
documento com a evidencia.
