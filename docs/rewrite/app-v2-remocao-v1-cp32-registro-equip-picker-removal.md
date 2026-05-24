# app-v2 - CP32 remocao do registroEquipPicker legado

## Objetivo

Remover o picker legado de equipamento do registro quando confirmado que ele nao
participa mais do runtime principal nem do app-v2.

## Evidencia

- `index.html` continua montando o app-v2 por `src/app-v2/main.tsx`.
- `rg` encontrou `initRegistroEquipPicker`, `openRegistroEquipPicker` e
  `syncRegistroEquipLabel` apenas em `src/ui/components/registroEquipPicker.js`
  e no teste dedicado `src/__tests__/registroEquipPicker.test.js`.
- O seletor `open-equip-picker` permanece apenas em template/markup legado e no
  proprio componente removido, sem import ativo do inicializador.

## Alteracoes

- Removido `src/ui/components/registroEquipPicker.js`.
- Removido `src/__tests__/registroEquipPicker.test.js`.
- Ampliado `legacyShellRetirementGate` para impedir retorno do componente e do
  teste legado.
- Atualizado o plano de remocao v1 com o CP32 e contagens atuais.

## Fora do escopo

- CSS legado `.registro-equip-picker*` em `components.css` e `redesign.css`.
- Template legado `src/ui/shell/templates/views.js`.
- Registro v1, assinatura, fotos, PDF/share, WhatsApp, storage, Supabase/RLS,
  PMOC, billing, pricing ou router.

## Validacao planejada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/registroLegacyHeaderRender.test.js src/__tests__/registroLegacyFieldHandlers.test.js src/__tests__/registroLifecycle.contract.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
