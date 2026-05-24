# app-v2 - CP-58P: remocao de promessas sensiveis nas paginas legais publicas

## Objetivo

Remover das paginas legais publicas referencias a funcionalidades legadas que
serao refeitas em etapa app-v2-native: PDF, assinatura digital, fotos e
funcionamento offline como promessa de produto.

## Arquivos alterados

- `public/legal/termos.html`
- `public/legal/privacidade.html`
- `src/__tests__/publicPricingVestiges.test.js`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## O que mudou

- A descricao publica do servico passou a citar cadastro de equipamentos,
  registros de servico, relatorios operacionais e analise de risco.
- A lista de conteudo do usuario deixou de prometer fotos, PDFs e assinaturas
  como superficie atual.
- A politica de privacidade passou a tratar dados profissionais como
  informacoes operacionais, sem citar fotos como recurso ativo.
- A secao de cookies/tecnologias deixou de vender funcionamento offline e
  passou a descrever o Service Worker como cache tecnico de resiliencia.
- O teste de superficie publica passou a bloquear retorno desses termos nas
  paginas legais.

## Fora do escopo

- Runtime do app.
- Service Worker.
- PDF/share real.
- WhatsApp real.
- Upload/storage real.
- Assinatura real.
- PMOC real.
- Supabase/RLS/migrations.
- Billing/pricing.

## Risco

Baixo. A alteracao e de copia legal/publica e teste de contrato textual. Nao
altera navegacao, storage, schema, handlers, service worker ou runtime.
