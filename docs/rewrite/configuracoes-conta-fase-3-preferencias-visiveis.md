# Configuracoes/Conta fase 3 - preferencias locais visiveis no app-v2

Data: 2026-05-16

## Objetivo

Aplicar as preferencias locais de `Conta` em comportamento visual limitado no
app-v2, mantendo tudo em memoria e sem abrir areas sensiveis.

## Escopo

- Aplicar densidade visual somente na composicao da aba `Conta`.
- Exibir lembrete visual local quando a preferencia estiver ligada.
- Permitir abrir a tela inicial preferida por acao explicita.
- Manter preferencias apenas em estado React da sessao.

## Fora de escopo

- Persistencia em storage real ou localStorage.
- Perfil real, billing, assinatura ou feature paga.
- Supabase/RLS, migrations ou permissoes.
- PMOC.
- PDF/share real.
- WhatsApp real.
- Router novo.
- Redesign amplo ou CSS global.

## Criterio de aceite

- `accountViewModel` expoe os efeitos visiveis das preferencias.
- `Conta` muda densidade de forma local e testavel.
- O lembrete local aparece apenas quando ativado.
- O botao de tela inicial abre uma area app-v2 ja existente.
- Testes cobrem view model e shell.
- Validacao geral passa aceitando apenas warnings conhecidos.
