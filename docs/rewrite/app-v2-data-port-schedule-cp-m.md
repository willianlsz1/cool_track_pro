# App v2 dataPort schedule CP-M

## Escopo

CP-M migra o fluxo de agendar preventiva local no detalhe do equipamento para usar
`AppV2DataPort.scheduleCommitment(...)` quando `dataPort` e injetado no
`AppV2Shell`.

O fallback mock/local com `scheduleNextCommitment(...)` permanece ativo quando nao
ha `dataPort`.

Arquivos de codigo tocados:

- `src/app-v2/shell/AppV2Shell.tsx`
- `src/app-v2/equipment/EquipmentDetail.tsx`
- `src/app-v2/shell/AppV2ShellDataPort.test.tsx`

## Contratos

- `schedulePreventiveDraft(equipmentId, targetDate)` valida a data ISO local
  antes de chamar qualquer porta.
- Data invalida retorna `Informe uma data valida para agendar a preventiva.` e
  nao chama `dataPort.scheduleCommitment(...)`.
- Com `dataPort`, o shell chama `scheduleCommitment(...)` com o mesmo input do
  fallback local:
  - `id: compromisso-local-${equipmentId}-${appState.compromissos.length + 1}`
  - `equipmentId`
  - `kind: preventiva`
  - `targetDate`
  - `origin: periodicidade`
- O estado retornado pela porta e aplicado com
  `preserveCurrentServiceDraft(appState, nextState)`.
- Rejeicao da porta retorna a mensagem do `Error` ou o fallback
  `Nao foi possivel agendar a preventiva.`.
- `EquipmentDetail` aceita resultado sincrono ou assincrono em
  `onSchedulePreventive` e so fecha o bloco de agendamento quando o resultado
  resolve sem erro.

## Nao alterado

- Sem mudancas em v1, router, storage real, Supabase real, PDF/share, billing,
  WhatsApp, anexos reais, servicos, orcamento real, PMOC real ou assinatura.
- Sem mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou
  TypeScript config.
- Sem nova dependencia.
- Sem alteracao nos contratos existentes de `AppV2DataPort` ou
  `memoryAppV2DataAdapter`.

## Validacao planejada

- `npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run build`
- `npm run check`
- `git diff --check`

## Proximo CP recomendado

Continuar a migracao por um unico fluxo pequeno do `AppV2Shell` ja coberto pelo
`AppV2DataPort`, mantendo fallback mock/local e deixando storage real/Supabase
real para etapa propria.
