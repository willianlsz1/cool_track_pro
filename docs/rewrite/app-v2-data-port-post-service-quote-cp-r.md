# app-v2 data port - CP-R post-service quote

## Escopo

Migrar somente o fluxo de gerar orcamento pos-diagnostico a partir de um servico
concluido para `AppV2DataPort` quando a porta for injetada no `AppV2Shell`.

## Contratos preservados

- Sem `dataPort`, o fallback local continua usando `completeServiceDraft` e
  `createQuoteFromServiceRecord`.
- Com `dataPort`, o shell conclui ou atualiza o registro por
  `completeService`/`updateServiceRecord` antes de chamar
  `createQuoteFromServiceRecord`.
- O id do orcamento gerado segue `orcamento-${recordId}`.
- O sucesso continua abrindo `Servicos > Orcamentos`.
- Falhas mantem a tela concluida aberta, exibem a mensagem de erro e nao
  navegam.

## Nao alterado

- PDF/share.
- WhatsApp.
- Storage real.
- Supabase/RLS.
- Billing.
- Router.
- Package/config.
- App legado/v1.

## Validacao planejada

- `npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format:check`
- `npm run build`
- `npm run check`
- `git diff --check`

## Proximo CP recomendado

Revisar a camada intermediaria de `ServicesHome` e os tipos de handlers de
servicos/orcamentos para remover casts temporarios e manter o contrato async
explicito de ponta a ponta.
