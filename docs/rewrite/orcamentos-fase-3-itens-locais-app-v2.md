# Orcamentos fase 3 - itens locais simples no app-v2

Data: 2026-05-16

## Objetivo

Reduzir a lacuna de itens de orcamento permitindo adicionar itens locais simples
ao rascunho mockado em `Servicos > Orcamentos`.

## Escopo

- Ampliar o contrato mockado de `Orcamento` com itens locais simples.
- Cada item possui descricao, quantidade, valor unitario e total calculado.
- Recalcular o total do rascunho pela soma dos itens quando houver itens.
- Exibir resumo de quantidade de itens na lista de orcamentos.
- Permitir adicionar item local no formulario minimo de edicao de rascunho.

## Fora de escopo

- Billing.
- Assinatura.
- PDF/share real.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Migrations Supabase.
- PMOC.
- Desconto, imposto, validade, condicoes comerciais ou cobranca.
- Orcamento real, envio, download ou assinatura.
- Design final ou redesign amplo.

## Criterio de aceite

- `updateQuoteDraft` normaliza itens locais simples.
- O total do rascunho usa a soma dos itens quando itens forem informados.
- O view model mostra contagem de itens locais por orcamento.
- O shell permite adicionar item local e salvar o rascunho.
- A lista reflete a contagem de itens e o total recalculado.
- Testes focados cobrem action, view model e shell.
- Validacao geral passa aceitando apenas warnings conhecidos.
