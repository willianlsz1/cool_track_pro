# app-v2 data port service completion - CP-Q

## Escopo

Migrar o ciclo local de inicio e conclusao de servico do `AppV2Shell` para
`AppV2DataPort` quando uma porta for injetada.

Esta CP cobre apenas:

- concluir um novo servico via `dataPort.completeService(input)`;
- atualizar um registro existente via `dataPort.updateServiceRecord(input)`;
- iniciar servico via `dataPort.startServiceFromEquipment(equipmentId,
commitmentId)`, inclusive depois de cadastrar equipamento para continuar o
  registro;
- manter fallback local com `completeServiceDraft` quando nao houver `dataPort`;
- propagar erro assincrono para a tela concluida sem navegar;
- reutilizar helper puro para montar o `CompleteServiceInput`.

## Contratos preservados

- `CompleteServiceInput` continua definido em `src/app-v2/data/appV2Actions.ts`.
- `ServiceFlow` continua validando antes de abrir a etapa concluida.
- Em sucesso, a navegacao segue como antes:
  - `Voltar para Servicos` fecha o fluxo e mostra a central de servicos;
  - `Ver equipamento` abre o equipamento do rascunho concluido.
- Em falha, a tela concluida permanece aberta e exibe a mensagem retornada.

## Nao alterado

- Geracao de orcamento a partir de servico concluido.
- Orcamento pre-servico.
- Storage real.
- Supabase/RLS.
- Router.
- PDF/share.
- WhatsApp.
- Billing.
- App legado/v1.
- `package.json`, Vite, ESLint ou TypeScript config.

## Validacao planejada

- `npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format:check`
- `npm run build`
- `npm run check`
- `git diff --check`

## Proximo CP recomendado

Migrar a geracao de orcamento a partir de servico concluido para
`dataPort.createQuoteFromServiceRecord(input)`, mantendo o escopo isolado de
PDF/share, storage real e integracoes externas.
