# app-v2 - CP-58L remocao do detector PMOC de tipo de servico

## Objetivo

Remover o helper legado que tratava `PMOC` como tipo contextual de servico e
deixar o Registro recomendar o checklist apenas para tipos preventivos. Este e
um corte preparatorio antes da remocao completa do checklist PMOC de Registro.

## Escopo alterado

- `src/ui/views/registro.js`
- `src/ui/shell/templates/views.js`
- `src/__tests__/registroLegacyChecklistRender.test.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `src/domain/pmoc/serviceType.js`
- `src/__tests__/pmocServiceType.test.js`

## O que mudou

- `src/domain/pmoc/serviceType.js` foi removido.
- Registro deixou de importar o detector PMOC e passou a usar uma funcao local
  preventiva-only para recomendacao do checklist.
- O atributo runtime `pmocRecommended` foi substituido por
  `checklistRecommended` nos pontos tocados.
- Textos de recomendacao foram ajustados de `preventiva/PMOC` para
  `preventiva`.

## Fora do escopo

- Remover o checklist PMOC de Registro.
- Remover `src/domain/pmoc/checklistTemplates.js`.
- Alterar payloads `registro.checklist`.
- Supabase/RLS, migrations, storage, PDF/share, WhatsApp, fotos, assinatura,
  billing ou PMOC real app-v2-native.

## Risco

Baixo/medio. A recomendacao visual muda de PMOC/preventiva para preventiva-only,
mas o checklist e sua persistencia ainda permanecem para o proximo CP.

## Validacao esperada

- `npm test -- src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
