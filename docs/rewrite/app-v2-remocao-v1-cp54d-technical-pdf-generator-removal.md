# app-v2 remocao v1 - CP54D technical PDF generator removal

## Objetivo

Remover o gerador PDF tecnico legado e suas secoes de relatorio depois que a
superficie de PDF/share/WhatsApp v1 foi aposentada.

Este CP preserva os helpers ainda compartilhados por PMOC/checklist ate um CP
proprio: `src/domain/pdf/constants.js`, `src/domain/pdf/primitives.js`,
`src/domain/pdf/safeLinks.js`, `src/domain/pdf/sanitizers.js`,
`src/domain/pdf/sections/checklist.js`,
`src/domain/pdf/sections/checklistHelpers.js`,
`src/domain/pdf/sections/upsell.js` e `src/domain/pdf/pmoc/**`.

## Escopo executado

- Removeu `src/domain/pdf.js`.
- Removeu `src/domain/pdf/generatorHelpers.js`.
- Removeu `src/domain/pdf/reportModel.js`.
- Removeu secoes legadas de PDF tecnico:
  - `src/domain/pdf/sections/cover.js`;
  - `src/domain/pdf/sections/coverHelpers.js`;
  - `src/domain/pdf/sections/footer.js`;
  - `src/domain/pdf/sections/services.js`;
  - `src/domain/pdf/sections/servicesHelpers.js`;
  - `src/domain/pdf/sections/signatureHelpers.js`;
  - `src/domain/pdf/sections/signatures.js`.
- Removeu testes dedicados aos arquivos removidos.
- Atualizou `legacyV1RemovalContracts.test.js` com contrato de ausencia para o
  gerador tecnico e suas secoes.

## Fora de escopo

- Remover PMOC.
- Remover checklist/upsell/safeLinks/sanitizers ainda usados por testes PMOC e
  checklist.
- Remover assinatura, fotos/upload/storage ou Supabase.
- Alterar `vendor-pdf`, `manualChunks`, Vite ou package files.
- Recriar PDF no app-v2.

## Risco

Baixo para runtime app-v2: nao havia consumidor runtime app-v2 do gerador
tecnico removido.

Medio para paridade futura: PDF tecnico deve ser reconstruido como fluxo
app-v2 nativo em etapa propria, sem reaproveitar o gerador v1 removido.

## Validacao executada

```bash
npm run format # passou
npm run check # passou
```

`npm run check` cobriu lint, typecheck, format check, suite Vitest completa e
build. O build manteve apenas o aviso conhecido de chunk grande.

Antes do commit, executar:

```bash
git diff --check
git diff --cached --check
```

## Proximo passo

Abrir CP sensivel para PMOC/checklist PDF restante e outro CP para assinatura,
fotos/upload/storage. Nao juntar esses cortes com recriacao de PDF/share real.
