# Contrato - Proxima preventiva pos-salvamento no app-v2

## Objetivo

Documentar a paridade controlada para o prompt de proxima preventiva do v1 sem
implementar UX nova neste checkpoint.

## Evidencia v1

O v1 possui fluxo pos-salvamento que pode acionar prompt para proxima
preventiva apos salvar Registro de Servico. Esse comportamento pertence ao
fechamento do atendimento e depende de decisao de UX, porque interfere no que o
tecnico ve imediatamente depois de concluir o registro.

Arquivos de referencia:

- `src/features/registro/save/postSave.js`;
- `src/ui/components/registroProximaPreventivaPrompt.js`;
- `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`.

## Estado app-v2 atual

O app-v2 ja cobre uma fatia segura:

- `ServiceDraft.nextMaintenanceDate` permite informar proxima manutencao durante
  o fluxo;
- `completeService` grava `proximaData` no registro mockado;
- `completeService` cria compromisso mockado `preventiva` com
  `origem: "registro"` quando a data e informada;
- relatorio imediato e reaberto exibem a proxima manutencao.

## Contrato aprovado para etapa futura

Quando houver decisao visual/UX, o prompt pos-salvamento do app-v2 deve:

- aparecer apenas depois de concluir um Registro de Servico valido;
- reutilizar dados do registro recem-concluido;
- nunca criar compromisso duplicado se `nextMaintenanceDate` ja foi informado;
- permitir confirmar, alterar ou recusar a proxima preventiva;
- continuar usando mock/local state ate etapa propria de storage real;
- preservar o fluxo atual de relatorio/reabertura;
- nao ativar notificacao, calendario real, recorrencia avancada, billing,
  WhatsApp, PDF/share ou Supabase/RLS.

## Anti-escopo

- UI nova sem aprovacao;
- modal/drawer novo;
- storage real;
- notificacoes/calendario real;
- recorrencia avancada;
- PDF/share real;
- WhatsApp real;
- billing, assinatura, cotas, Supabase/RLS, permissoes e PMOC.

## Proxima decisao humana necessaria

Escolher se o prompt sera:

- etapa leve dentro de `ServiceDone`;
- acao secundaria no resumo final;
- banner contextual na aba Servicos;
- adiado porque o campo `Proxima manutencao` dentro do fluxo ja cobre a maioria
  dos casos.
