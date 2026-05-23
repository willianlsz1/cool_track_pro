# app-v2 data port sectors CP-O

## Escopo

Migrar criar, editar e remover setores no app-v2 para usar `AppV2DataPort`
quando uma porta for injetada no `AppV2Shell`.

O fallback mock/local continua ativo quando `dataPort` nao existe.

## Contratos

- `AppV2Shell.saveSectorDraft` monta `nextDraft` com
  `draft.id || createNextSectorId(...)`.
- Com `dataPort`, `saveSectorDraft` chama `dataPort.saveSector(nextDraft)`.
- Com `dataPort`, `deleteSectorDraft` chama `dataPort.deleteSector(sectorId)`.
- O estado retornado pela porta e aplicado com `preserveCurrentServiceDraft`.
- Erros de `Error` sao exibidos na UI; erros desconhecidos usam fallback local.
- `EquipmentList.onSaveSector` e `EquipmentList.onDeleteSector` aceitam retorno
  sincrono ou `Promise<string | null>`.

## Nao alterado

- Nenhuma integracao real de storage, Supabase, billing, WhatsApp, PDF/share ou
  router.
- Nenhum arquivo de package, lockfile, Vite, ESLint ou TypeScript.
- Nenhum fluxo do app legado/v1.
- Nenhum contrato publico fora do app-v2 autorizado nesta CP.

## Validacao planejada

- `npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run build`
- `npm run check`
- `git diff --check`
- Formatacao apenas se necessaria.

## Proximo CP recomendado

Continuar a expansao pequena do `AppV2DataPort` para outro fluxo mock/local do
app-v2 que ja tenha contrato mapeado, mantendo fallback local e testes de erro.
