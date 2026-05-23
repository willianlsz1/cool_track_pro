# Configuracoes/Conta fase 1 - contrato mock/local

Data: 2026-05-16

## Objetivo

Mapear a primeira fatia segura de `Conta` no app-v2 antes de implementar UI:
atalhos e preferencias operacionais simples, todos mock/local, sem abrir areas
sensiveis.

## Referencias analisadas

- v1: `src/ui/views/configuracoes.js`.
- v2: `src/app-v2/shell/AppV2Shell.tsx`.
- Matriz: `docs/rewrite/matriz-paridade-v1-v2.md`.
- Auditoria: `docs/rewrite/auditoria-ux-funcional-v1-v2.md`.

## Estado atual

- No v1, `Configuracoes` concentra atalhos para registro, orcamentos, PMOC,
  clientes, alertas, perfil e ajuda.
- No app-v2, a aba `Conta` existe na navegacao principal, mas ainda e
  placeholder.
- As capacidades reais de billing, assinatura, perfil persistido, storage,
  Supabase/RLS, PMOC, suporte externo e feedback real exigem etapas proprias.

## Contrato permitido para a proxima fase

`Conta` deve funcionar como painel operacional local com grupos pequenos:

1. Atalhos operacionais mock/local:
   - iniciar registro de servico usando fluxo app-v2 ja existente;
   - abrir `Equipamentos > Clientes`;
   - abrir `Servicos > Orcamentos`;
   - abrir Home/alertas operacionais ja exibidos na Home.
2. Preferencias locais somente em memoria:
   - densidade visual: `confortavel` ou `compacta`;
   - preferencia de tela inicial: `Hoje`, `Equipamentos` ou `Servicos`;
   - lembrete visual local para revisar pendencias, sem notificacao real.
3. Ajuda local:
   - resumo textual de como o app-v2 organiza Hoje, Equipamentos, Servicos e
     Conta;
   - explicacao local de status/criticidade;
   - nenhum envio real de suporte ou feedback.

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

## Decisoes de mapeamento

- `Gerar PMOC` do v1 nao entra no app-v2 nesta fase; PMOC sera excluido e
  refeito em etapa propria.
- `Novo orcamento` deve apontar para `Servicos > Orcamentos`, sem criacao real
  fora do fluxo mockado ja existente.
- `Clientes` deve apontar para `Equipamentos > Clientes`, preservando a decisao
  atual de nao criar aba global separada.
- `Alertas` deve apontar para a Home operacional, sem nova rota.
- `Meu perfil` fica fora da primeira UI funcional; quando entrar, deve ser mock
  ou etapa propria, sem autenticacao/storage real.

## Criterio de aceite da proxima fase

- Criar view model pequeno para `Conta` com grupos de atalhos e preferencias
  locais.
- Renderizar UI minima em `activeTab === 'conta'`.
- Testar shell navegando por pelo menos dois atalhos locais.
- Testar alteracao de preferencia apenas em memoria.
- Garantir ausencia de billing, assinatura, PMOC, Supabase, storage real,
  PDF/share e WhatsApp real.
