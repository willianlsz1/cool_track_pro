# app-v2 - CP-58M remocao do TWA build legado

## Objetivo

Remover `twa-build/`, artefato Android/TWA legado gerado por Bubblewrap, sem
alterar o app-v2, Supabase, migrations, storage, PDF/share, billing runtime,
assinatura, fotos ou PMOC.

## Evidencia

- A busca por `twa-build`, `TWA`, `Trusted Web Activity`, `bubblewrap`,
  `web_app_manifest` e `assetlinks` encontrou referencias ativas apenas dentro
  da propria pasta `twa-build/`.
- O manifesto TWA apontava para `cooltrackpro.netlify.app`, dominio antigo e
  fora do alvo atual do projeto.
- A pasta incluia `android.keystore` local e dependencia Android billing do
  browser helper, ambos fora do fluxo app-v2 principal.

## Escopo alterado

- Removida a pasta `twa-build/`.
- Atualizado contrato de remocao v1 para impedir retorno do artefato TWA.
- Atualizado plano de continuidade.

## Fora do escopo

- Criar novo app Android/TWA app-v2-native.
- Cloudflare Pages, dominio, DNS ou deploy.
- Supabase/RLS, migrations, storage, PDF/share, WhatsApp, billing, assinatura,
  fotos ou PMOC.

## Risco

Baixo para o app web. O risco residual e apenas operacional: caso ainda exista
um processo externo de build Android usando essa pasta local, ele precisara ser
refeito em etapa propria app-v2-native.

## Validacao esperada

- `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
