# app-v2 remocao v1 - CP-8k inventario atualizado

## Objetivo

Atualizar o plano de remocao do v1 com o estado real apos os checkpoints ja
executados, antes de iniciar novas remocoes em `src/ui` ou `src/features`.

Este checkpoint e documental. Ele nao altera runtime, app-v2, storage,
Supabase/RLS, PDF/share, WhatsApp, PMOC, billing/pricing ou schema.

## Evidencia verificada

- Branch: `codex/remove-v1-dashboard-last-service-react-cp3f`.
- HEAD inicial do checkpoint: `dad8fc5`.
- `src/react/` nao existe.
- `src/app.js` nao existe.
- `e2e/specs/` tem apenas specs app-v2:
  - `app-v2-authenticated-primary.spec.js`;
  - `app-v2-primary-entrypoint.spec.js`;
  - `app-v2-service-layout.spec.js`.
- Contagem atual:
  - `src/ui`: 135 arquivos;
  - `src/features`: 87 arquivos;
  - `src/__tests__`: 202 arquivos;
  - `e2e/specs`: 3 arquivos.
- `src/app-v2` nao importa o runtime legado `src/ui`, `src/features` ou
  `src/react`. As importacoes `../ui/*` dentro de `src/app-v2` sao internas de
  `src/app-v2/ui/*`.
- `src/domain` e `src/core` nao tem import estatico direto para `src/ui`,
  `src/features` ou `src/react` no estado atual verificado.

## Atualizacao aplicada

- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md` passou a registrar que:
  - `src/react` ja foi removido;
  - os E2Es legados foram removidos de `e2e/specs`;
  - billing/pricing publico ativo ja foi tratado em checkpoints dedicados;
  - o proximo risco real esta concentrado em `src/ui`, `src/features`, CSS
    legado e testes legados.

## Fora de escopo

Nao foram removidos:

- `src/ui`;
- `src/features`;
- CSS legado;
- testes legados unitarios/contratuais;
- documentacao historica;
- Supabase migrations/functions;
- contratos de PDF/share, WhatsApp, PMOC ou quotas operacionais.

## Proximo passo recomendado

Executar um checkpoint de triagem antes de deletar runtime:

1. Mapear `src/features` por dominio e separar arquivos puramente de regra dos
   adapters DOM legados.
2. Escolher o menor dominio com menor acoplamento para migrar/remover primeiro.
3. Manter testes de seguranca, PDF/share, assinatura, storage e PMOC fora do
   lote ate haver etapa dedicada.

## Validacao esperada

- `npm run format:check`
- `git diff --check`
- `git diff --cached --check`
