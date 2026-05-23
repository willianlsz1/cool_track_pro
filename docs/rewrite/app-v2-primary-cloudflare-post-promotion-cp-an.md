# app-v2 - CP-AN - validacao pos-promocao Cloudflare

## Objetivo

Registrar a validacao executada depois do merge do PR de corte do app-v2 para
`main` e do deploy principal no Cloudflare Pages.

Esta CP e documental. Ela nao altera runtime, storage, Supabase/RLS, billing,
PDF/share, WhatsApp, upload/storage, PMOC, assinatura, orcamento real ou v1.

## Estado validado

- PR promovido: `https://github.com/Willianlsz1/Cool_Track_Pro/pull/287`.
- Merge commit em `main`: `2f575934c04798377a4000d72c21e7f65bd2c906`.
- Cloudflare Pages principal:
  `https://cool-track-pro.pages.dev`.
- Deploy Cloudflare do commit:
  `https://1bbe3bf7.cool-track-pro.pages.dev`.

## Gates remotos

Checks do commit de merge em `main`:

- `CI / test-and-build`: sucesso.
- `E2E / Playwright`: sucesso.
- `pgTAP`: sucesso.
- `Cloudflare Pages`: sucesso.
- `Supabase Preview`: sucesso.

## Smoke HTTP

Com `Invoke-WebRequest`, as rotas abaixo responderam `200` e retornaram o
documento do app-v2:

- `https://cool-track-pro.pages.dev/`
- `https://cool-track-pro.pages.dev/equipamentos`
- `https://1bbe3bf7.cool-track-pro.pages.dev/`
- `https://1bbe3bf7.cool-track-pro.pages.dev/equipamentos`

O dominio custom `https://cooltrack.app/` falhou na validacao local por relacao
de confianca SSL/TLS no ambiente do agente. Isso nao bloqueia o Pages default,
mas deve ser revisado separadamente se esse dominio for usado como producao
publica.

## Smoke browser anonimo

Com Playwright headless em `https://cool-track-pro.pages.dev`, foram validadas
as rotas:

- `/`
- `/equipamentos`
- `/servicos`
- `/conta`

Resultado por rota:

- status HTTP `200`;
- `#app-v2-root`: presente;
- `#app`: ausente;
- navegacao principal visivel;
- nenhum erro bloqueante no console.

## Smoke autenticado real

Com sessao Supabase real injetada no browser para o usuario de teste primario
registrado em CP-Y:

- `#app-v2-root`: presente;
- `#app`: ausente;
- navegacao principal visivel;
- nenhum erro bloqueante no console;
- cliente criado pela UI de producao:
  `Cliente CP-AM 2026-05-23T22-59-06-265Z`;
- equipamento criado pela UI de producao:
  `Equipamento CP-AM 2026-05-23T22-59-06-265Z`;
- tag criada: `CPAM-2026-05-23T22-59`;
- cliente e equipamento apareceram na UI depois do salvamento.

Antes da escrita, o smoke removeu somente linhas de teste do proprio usuario com
prefixos `Cliente CP-AM` e `Equipamento CP-AM`, para evitar falso negativo por
limite do plano em reexecucoes.

## Resultado

O app-v2 esta promovido como versao principal no Cloudflare Pages default e
passou nos criterios tecnicos do runbook CP-AM:

- branch `main` recebeu o merge;
- Cloudflare Pages publicou o commit de merge;
- rotas principais respondem;
- fallback SPA funciona em rota direta;
- root v2 monta no lugar do root legado;
- sessao real carrega no entrypoint principal;
- leitura e escrita minima real funcionam via UI;
- checks remotos do merge passaram.

## Pendencias fora do corte

Continuam fora do primeiro corte e exigem etapas proprias:

- dominio custom `cooltrack.app`/certificado, se for o dominio publico final;
- PDF/share real;
- WhatsApp real;
- billing/features pagas;
- upload/storage real;
- PMOC real;
- assinatura digital real;
- orcamento real com aceite/envio externo.
