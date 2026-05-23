# Remocao temporaria de billing e pricing no cliente

## Objetivo

Remover do app as superficies visiveis de billing, precificacao, checkout,
portal de assinatura e CTAs para planos ate que a area comercial seja refeita em
uma etapa propria.

## Escopo executado

- Landing sem secao de planos/precos e sem links para `#planos`.
- View `pricing` preservada como rota neutra, exibindo apenas aviso de area
  comercial indisponivel.
- CTAs de upgrade, checkout e portal de assinatura neutralizados com aviso local.
- Conta, sidebar, paywalls, PMOC, fotos, cadastro por placa e limites de PDF/
  WhatsApp deixam de navegar para precificacao.
- Testes atualizados para travar ausencia de checkout, portal, tabela de precos
  e navegacao direta para `pricing`.

## Fora do escopo

- Remocao de funcoes Supabase/Stripe, migrations, tabelas ou RLS.
- Reescrita de billing, planos, feature gating ou entitlements.
- Alteracao de storage real, PDF/share, WhatsApp, assinatura ou PMOC real.
- Remocao completa da rota interna `pricing`, mantida como fallback neutro para
  nao quebrar contratos de navegacao existentes.

## Risco remanescente

Ainda existem modulos e testes de monetizacao no repositorio para preservar
contratos antigos e evitar remocao destrutiva sem etapa dedicada. A proxima
fase comercial deve decidir se esses contratos serao apagados, isolados ou
reescritos.
