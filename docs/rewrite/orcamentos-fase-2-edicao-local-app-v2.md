# Orcamentos fase 2 - edicao local basica no app-v2

Data: 2026-05-16

## Objetivo

Reduzir a lacuna de edicao de orcamentos no app-v2 permitindo editar localmente
um rascunho mockado dentro de `Servicos > Orcamentos`.

## Escopo

- Criar action pura para atualizar um `Orcamento` local existente.
- Permitir edicao de titulo, total e status do rascunho.
- Exibir formulario minimo de edicao em `Servicos > Orcamentos`.
- Restringir a edicao a orcamentos com status `rascunho`.
- Manter a operacao apenas em memoria, usando a store mockada do app-v2.

## Fora de escopo

- Billing.
- Assinatura.
- PDF/share real.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Migrations Supabase.
- PMOC.
- Itens detalhados de orcamento.
- Orcamento real, envio, download, assinatura ou cobranca.
- Design final ou redesign amplo.

## Criterio de aceite

- A action atualiza apenas o orcamento informado.
- A edicao rejeita titulo vazio.
- A edicao rejeita orcamento que nao esteja em `rascunho`.
- O shell permite editar titulo, total e status de um rascunho local.
- A lista de orcamentos reflete os novos valores apos salvar.
- Testes focados cobrem action e shell.
- Validacao geral passa aceitando apenas warnings conhecidos.
