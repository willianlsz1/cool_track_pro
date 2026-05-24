# app-v2 - CP-58Q: remocao de imagens publicas da landing v1

## Objetivo

Remover imagens publicas antigas da landing/v1 que nao sao referenciadas pelo
app-v2 principal e ainda carregavam material de comunicacao legado, incluindo
imagem nomeada como `passo-3-pdf.png`, preservando favicons.

## Arquivos alterados

- `public/brand/*.png`
- `public/brand/Perfil.jpg`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## O que mudou

- Removidas imagens da landing antiga em `public/brand/`.
- Preservado `public/brand/favicon.svg`.
- Adicionado contrato para garantir que as imagens antigas nao voltem como
  assets publicos do app principal.
- O contrato tambem bloqueia referencias a essas imagens nos entrypoints/fontes
  executaveis cobertos.

## Fora do escopo

- Icones PWA atuais em `public/icons/`.
- Favicons atuais em `public/favicon*` e `public/brand/favicon.svg`.
- Open Graph atual em `public/icons/og-image.png`.
- Service Worker.
- PDF/share, WhatsApp, upload/storage, assinatura, PMOC, Supabase/RLS ou
  billing/pricing.

## Risco

Baixo. A busca de referencias nao encontrou consumidores runtime para as
imagens removidas. Assets PWA/OG e favicons atuais foram preservados.
