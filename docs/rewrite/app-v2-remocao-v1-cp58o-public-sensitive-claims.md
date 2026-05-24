# app-v2 - CP-58O claims publicas de areas sensiveis

## Objetivo

Remover do `index.html` claims publicas antigas de PDF, assinatura, fotos,
WhatsApp, offline e Supabase Storage, porque essas areas nao devem ser
reaproveitadas do v1 e devem ser refeitas em etapas app-v2-native proprias.

## Evidencia

- O metadata publico ainda dizia que o tecnico registrava com foto e assinatura,
  funcionava sem internet e gerava PDF pronto.
- O JSON-LD ainda anunciava PDF com assinatura digital, fotos por equipamento e
  compartilhamento via WhatsApp.
- O comentario de CSP ainda citava Supabase Storage como destino de imagem.

## Escopo alterado

- `index.html` passa a descrever gestao de clientes, equipamentos, servicos,
  alertas, relatorios operacionais e orcamentos locais.
- O teste publico de vestigios passa a bloquear retorno dessas promessas no
  entrypoint publico.
- Plano de continuidade atualizado.

## Fora do escopo

- Alterar CSP real, Supabase/auth, storage, migrations, PDF/share, WhatsApp,
  assinatura, fotos, PMOC ou layout visual.
- Criar as novas implementacoes app-v2-native dessas areas.

## Risco

Baixo. A mudanca e de metadata/copy publica e teste. O risco residual e de
marketing: a pagina fica mais conservadora ate as areas sensiveis serem
recriadas no app-v2.

## Validacao esperada

- `npm test -- src/__tests__/publicPricingVestiges.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
