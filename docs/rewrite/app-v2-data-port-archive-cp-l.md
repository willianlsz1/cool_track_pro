# App v2 dataPort archive CP-L

## Escopo

CP-L migrou o fluxo de arquivar e desarquivar equipamento no `AppV2Shell` para usar
`AppV2DataPort` quando a porta e injetada. O fallback mock/local foi preservado para
execucao sem `dataPort`.

Arquivos de codigo tocados:

- `src/app-v2/shell/AppV2Shell.tsx`
- `src/app-v2/equipment/EquipmentDetail.tsx`
- `src/app-v2/shell/AppV2ShellDataPort.test.tsx`

## Contratos

- `archiveEquipmentDraft(equipmentId)` agora chama
  `dataPort.archiveEquipment(equipmentId, appState.today)` quando `dataPort` existe.
- `unarchiveEquipmentDraft(equipmentId)` agora chama
  `dataPort.unarchiveEquipment(equipmentId)` quando `dataPort` existe.
- Ambos aplicam o estado retornado com `preserveCurrentServiceDraft(appState, nextState)`.
- `EquipmentDetail` aceita resultado sincrono ou assincrono para
  archive/unarchive: `string | null | Promise<string | null>`.
- Erros de rejeicao do `dataPort` viram mensagem em tela e mantem a confirmacao de
  arquivamento aberta.

## Nao alterado

- Sem mudancas em v1, router, storage real, Supabase real, PDF/share, billing,
  anexos reais, servicos, preventiva, orcamentos ou setores.
- Sem mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Sem nova dependencia.

## Validacao planejada

- `npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run build`
- `npm run check`
- `git diff --check`

## Proximo CP recomendado

Continuar a migracao por grupos pequenos no `AppV2Shell`, escolhendo um unico par
de acoes ja existente no `AppV2DataPort` e mantendo fallback mock/local ate a etapa
propria de storage/integracao real.
