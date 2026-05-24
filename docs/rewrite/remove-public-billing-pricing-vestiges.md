# Remocao de vestigios publicos de billing/pricing

## Objetivo

Fechar o checkpoint de remocao de billing/pricing na superficie publica e no
bootstrap do cliente, mantendo integracoes sensiveis de backend para uma etapa
propria.

## Alterado

- `index.html`: removidas origens Stripe da CSP e ofertas Free/Plus/Pro do
  JSON-LD.
- `public/_headers`: removidas origens Stripe da CSP servida pelo deploy.
- `public/legal/termos.html`: removidas secoes de planos pagos, pagamento,
  cancelamento, Stripe e link `/#planos`.
- `public/legal/privacidade.html`: removidas referencias a dados de pagamento,
  faturamento e Stripe como subprocessador.
- `src/app.js`: removida a consulta de billing/plano durante o bootstrap.

## Fora de escopo

- Supabase functions, migrations e testes de hardening de billing/Stripe.
- Gates legados de plano ainda acoplados a telas v1.
- PDF/share, WhatsApp, storage, RLS, quotas e assinatura.

## Risco remanescente

Ainda existem modulos legados de plano e monetizacao no codigo, porque eles
estao acoplados a areas sensiveis e devem ser removidos em cortes proprios. Este
checkpoint remove apenas a superficie publica e a consulta de billing no boot.

## Validacao esperada

```bash
rg -n "js\\.stripe|api\\.stripe|hooks\\.stripe|/#planos|pagina de planos|planos pagos|portal de cliente|processador de pagamento|Dados de pagamento|Planos, pagamento|checkout|pricing|billing|Stripe" index.html public/_headers public/legal src/app.js
npm run format
npm run build
npm run check
```
