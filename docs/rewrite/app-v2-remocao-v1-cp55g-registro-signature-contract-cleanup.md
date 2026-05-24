# app-v2 - Remocao v1 CP55G - Registro signature contract cleanup

## Objetivo

Remover os vestigios inertes finais de assinatura no contrato visual do Registro
v1 depois da aposentadoria da captura, visualizacao, storage, router e
superficie de assinatura.

## Escopo

- Remover `signature` do `buildRegistroViewModel`.
- Parar de passar `isPlusOrHigher` para o view model apenas por causa da
  assinatura aposentada.
- Renomear o anchor publico do rodape de `tour-signature-anchor` para
  `registro-action-anchor`.
- Atualizar testes de contrato para travar a ausencia dos vestigios.

## Fora do escopo

- `registros.assinatura` em storage/sync/schema.
- Historico e delete cleanup de `cooltrack-sig-*`.
- Assinatura de orcamento em `src/core/orcamentos.js`.
- PDF/share, fotos, PMOC, billing, router e Supabase/RLS.

## Risco

Baixo. O `tour-signature-anchor` nao tinha consumidor runtime restante no app;
o novo id fica centralizado em `registroContracts.js` e no template.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/registroViewModel.test.js src/__tests__/contracts/registroSelectors.test.js --run
npm run format
npm run build
npm run check
```
