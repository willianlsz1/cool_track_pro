# Configuracoes/Conta fase 2 - UI local no app-v2

Data: 2026-05-16

## Objetivo

Implementar a primeira UI funcional de `Conta` no app-v2 usando o contrato
mock/local da fase 1.

## Escopo

- Criar view model pequeno para atalhos e preferencias locais.
- Substituir o placeholder de `Conta` por UI minima.
- Permitir atalhos para fluxos app-v2 ja existentes:
  - registrar servico;
  - abrir `Equipamentos > Clientes`;
  - abrir `Servicos > Orcamentos`;
  - voltar para Home/alertas.
- Permitir preferencias apenas em memoria:
  - densidade visual;
  - tela inicial preferida;
  - lembrete visual local.
- Exibir ajuda local textual.

## Fora de escopo

- Billing.
- Assinatura.
- Perfil real ou dados de conta persistidos.
- Storage real.
- Supabase/RLS.
- Migrations Supabase.
- PMOC.
- PDF/share real.
- WhatsApp real.
- Suporte externo, feedback real ou ticket.
- Router novo.
- Redesign amplo ou CSS legado.

## Criterio de aceite

- `accountViewModel` mapeia atalhos e preferencias locais.
- A aba `Conta` renderiza painel local sem placeholder.
- Atalhos de Clientes e Orcamentos navegam para areas app-v2 existentes.
- Preferencias mudam somente em memoria.
- Testes cobrem view model e shell.
- Validacao geral passa aceitando apenas warnings conhecidos.
