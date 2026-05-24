# app-v2 - CP-7: remocao de vestigios publicos de pricing

## Objetivo

Remover da superficie publica do app textos de billing, pricing, checkout,
planos pagos e retencao fiscal/financeira enquanto a area comercial sera refeita
em etapa propria.

## Escopo executado

- Criado contrato `publicPricingVestiges.test.js` para impedir retorno de copy
  publica de pricing/billing em `index.html` e paginas legais principais.
- Ajustados `public/legal/termos.html` e `public/legal/privacidade.html` para
  manter apenas termos operacionais e privacidade/LGPD.

## Fora de escopo

- Backend, Supabase functions, migrations, RLS, storage, PDF/share, WhatsApp,
  PMOC, assinatura e quotas.
- Historico tecnico em `docs/`.
- Dependencias e configuracao de build.

## Validacao planejada

```bash
npm test -- src/__tests__/publicPricingVestiges.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
