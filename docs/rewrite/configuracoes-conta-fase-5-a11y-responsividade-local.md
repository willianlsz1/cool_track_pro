# Configuracoes/Conta fase 5 - acessibilidade e responsividade local no app-v2

Data: 2026-05-16

## Objetivo

Revisar acessibilidade e responsividade local da aba `Conta`, mantendo o escopo
em ajustes pequenos, testaveis e sem integracoes sensiveis.

## Escopo

- Associar controles de preferencias a textos auxiliares por `aria-describedby`.
- Expor estado pressionado do lembrete visual por `aria-pressed`.
- Garantir IDs unicos para secoes renderizadas na aba.
- Adicionar quebra segura de texto em blocos que podem receber microcopy longa.
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

- Selects de preferencias possuem descricoes associadas.
- O botao de lembrete informa estado pressionado.
- Atalhos locais preservam foco e quebra segura de texto.
- Secoes principais nao duplicam IDs.
- Testes cobrem shell/Conta.
- Validacao geral passa aceitando apenas warnings conhecidos.
