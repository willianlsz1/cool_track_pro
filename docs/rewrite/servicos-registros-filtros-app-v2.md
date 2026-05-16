# Servicos - Registros com filtros locais no app-v2

Data: 2026-05-16

## Objetivo

Reduzir a lacuna de historico avancado da auditoria v1 -> app-v2 adicionando
filtros locais em `Servicos > Registros`, sem copiar o historico legado e sem
abrir integracoes sensiveis.

## Escopo

- Busca textual existente continua.
- Adicionar filtros mock/local por periodo, cliente, equipamento, tipo de
  servico e status.
- Manter a lista de registros dentro de `Servicos`, sem criar rota ou area nova.
- Preservar edicao/reabertura de relatorio existentes.

## Fora de escopo

- Storage real.
- Supabase/RLS.
- Migrations Supabase.
- PMOC.
- PDF/share real.
- WhatsApp real.
- Billing, assinatura e quotas.
- Router novo.
- Design final ou redesign amplo.

## Criterio de aceite

- `servicesHomeViewModel` filtra registros por periodo, cliente, equipamento,
  tipo/status e busca textual.
- `ServicesHome` exibe controles simples para esses filtros.
- Testes focados cobrem view model e shell.
- Validacao geral do repo passa, aceitando apenas warnings conhecidos.
