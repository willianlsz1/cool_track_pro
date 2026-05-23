# CP-K - bridge de escrita controlada do AppV2Shell para dataPort

## Escopo

Esta CP conecta apenas os writes de cliente e equipamento do `AppV2Shell` ao
`dataPort` injetado. O preview continua sem Supabase real e sem criar porta no
entrypoint; a injeção permanece responsabilidade de `mountAppV2(..., { dataPort })`.

## Contratos preservados

- Sem `dataPort`, `saveClientDraft` e `saveEquipmentDraft` mantêm o caminho local
  com `saveClient` e `saveEquipment`.
- Com `dataPort`, o shell gera `id` quando necessário antes de chamar
  `dataPort.saveClient(...)` ou `dataPort.saveEquipment(...)`.
- O estado retornado pela porta é aplicado no shell com
  `preserveCurrentServiceDraft(...)`.
- O fluxo contextual `startServiceAfterEquipmentCreate` continua ativo após
  criar equipamento e usa o state retornado pelo write.
- `ClientForm` e `EquipmentForm` aceitam retorno síncrono ou assíncrono de
  `onSave`.
- Wrappers de lista/detalhe só fecham formulário depois do save resolver sem
  erro.

## Fora de escopo

- Supabase real no preview.
- Router, storage real, permissões, billing, PDF/share, anexos reais,
  assinatura, PMOC real ou orçamento real.
- Writes de setor, archive/unarchive, foto placeholder, preventiva, serviço e
  orçamento.
- Alterações de `package.json`, Vite, ESLint ou TypeScript config.

## Validação esperada

- `npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx src/app-v2/equipment/EquipmentForm.test.tsx --run`
- `npm run build`
- `npm run check`
- `git diff --check`

## Riscos remanescentes

- A porta injetada ainda é um contrato de integração; adaptadores reais devem
  tratar consistência, persistência e autorização em CP própria.
- Os demais writes do shell continuam locais por decisão de escopo e precisam de
  CPs próprias para migração controlada.

## Próximo CP recomendado

Migrar um grupo pequeno dos writes restantes para `dataPort`, começando por
setores ou archive/unarchive, com testes dedicados e sem misturar storage real.
