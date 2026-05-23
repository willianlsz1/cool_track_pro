# app-v2 dataPort - CP-P orcamentos locais mockados

## Escopo

Migrar somente os fluxos locais ja mockados de orcamentos para `AppV2DataPort`
quando uma porta for injetada no `AppV2Shell`.

Fluxos cobertos:

- salvar rascunho local por `dataPort.updateQuoteDraft(draft)`;
- criar orcamento pre-servico por `dataPort.createPreServiceQuote(draft)`.

## Contratos

- Sem `dataPort`, o shell preserva os fallbacks locais:
  - `updateQuoteDraft(appState, draft)`;
  - `createPreServiceQuoteDraft(appState, draft)`.
- Com `dataPort`, o shell aplica o estado retornado pela porta usando
  `preserveCurrentServiceDraft(appState, nextState)`.
- `ServicesQuotesHome` aceita handlers sincronas ou assincronas para:
  - `onSaveQuote`;
  - `onCreatePreServiceQuote`.
- `ServicesHome` repassa os mesmos handlers sem cast para preservar tipagem de
  Promise ate a tela de orcamentos.
- Em erro ou rejection, a UI mostra a mensagem retornada e mantem o editor ou
  painel de criacao aberto.
- Em sucesso de criacao pre-servico, a UI continua abrindo o rascunho criado
  para edicao local.

## Nao alterado

- Concluir servico.
- Criar orcamento a partir de servico concluido.
- v1/legado.
- Storage real.
- Supabase/RLS.
- Router.
- PDF/share.
- WhatsApp.
- Billing.
- Package/config.

## Validacao planejada

- `npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format:check`
- `npm run build`
- `npm run check`
- `git diff --check`

## Proximo CP recomendado

Avaliar CP dedicado para fluxo de servico via `AppV2DataPort`, mantendo
separados os casos de concluir servico, editar registro e gerar orcamento a
partir de servico concluido.
