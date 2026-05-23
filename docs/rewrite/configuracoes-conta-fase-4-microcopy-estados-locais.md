# Configuracoes/Conta fase 4 - microcopy e estados locais no app-v2

Data: 2026-05-16

## Objetivo

Consolidar microcopy e estados locais da aba `Conta`, mantendo a experiencia
operacional clara sem iniciar design final amplo ou integracoes sensiveis.

## Escopo

- Remover linguagem tecnica de mock da UI de `Conta`.
- Exibir estado vazio local quando nao houver pendencias de conta.
- Exibir limite local generico para separar comportamento de sessao de etapas
  dedicadas.
- Manter o comportamento em memoria ja entregue nas fases anteriores.

## Fora de escopo

- Persistencia em storage real ou localStorage.
- Perfil real, billing, assinatura ou feature paga.
- Supabase/RLS, migrations ou permissoes.
- PMOC.
- PDF/share real.
- WhatsApp real.
- Router novo.
- Redesign amplo, tokens globais novos ou CSS global.

## Criterio de aceite

- `accountViewModel` expoe microcopy local sem prometer areas sensiveis.
- A aba `Conta` renderiza estado vazio local.
- A aba `Conta` renderiza limite local generico.
- A UI nao exibe linguagem de mock para o usuario final.
- Testes cobrem view model e shell.
- Validacao geral passa aceitando apenas warnings conhecidos.
