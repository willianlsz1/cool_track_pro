# Relatorios consolidados locais no app-v2

Data: 2026-05-16

## Objetivo

Reduzir a lacuna de relatorios consolidados da auditoria v1 -> app-v2
adicionando filtros locais e resumo consolidado em `Servicos > Relatorios`.

## Escopo

- Filtrar relatorios locais por periodo, cliente e equipamento.
- Manter a busca textual existente.
- Exibir resumo consolidado local com totais de relatorios, prontos, atencao,
  pendentes, pecas e mao de obra.
- Manter preview por registro e impressao local ja existentes.

## Fora de escopo

- PDF/share real.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Migrations Supabase.
- PMOC.
- Billing, assinatura e quotas.
- Router novo.
- Design final ou redesign amplo.

## Criterio de aceite

- `servicesReportsViewModel` aceita filtros locais por periodo, cliente e
  equipamento.
- O resumo consolidado reflete somente os relatorios filtrados.
- `ServiceReportsHome` exibe controles simples para filtros e bloco de resumo.
- Testes focados cobrem view model e shell.
- Validacao geral passa aceitando apenas warnings conhecidos.
