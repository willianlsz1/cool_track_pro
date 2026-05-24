# app-v2 remocao v1 - CP54E quote PDF generator removal

## Objetivo

Remover o gerador PDF legado de orcamento depois que o fluxo v1 de orcamentos e
os CTAs de PDF/share foram aposentados.

Este CP nao recria PDF no app-v2. O app-v2 ainda trata orcamentos como
rascunhos locais dentro de Servicos; PDF/share real deve ser redesenhado em
etapa propria.

## Escopo executado

- Removeu `src/domain/pdf/orcamentoPdf.js`.
- Atualizou `legacyV1RemovalContracts.test.js` com contrato de ausencia para o
  gerador legado de PDF de orcamento.
- Atualizou o plano de vestigios v1 com o corte CP54E.

## Evidencia de escopo

Busca de consumidores antes da remocao:

```bash
rg -n "generateOrcamentoPdf|orcamentoPdf|domain/pdf/orcamentoPdf" src
```

Resultado: nenhum consumidor runtime em `src/ui`, `src/app-v2` ou testes.

## Fora de escopo

- Recriar PDF de orcamento no app-v2.
- Recriar share/WhatsApp.
- Remover PMOC/checklist PDF restante.
- Remover assinatura, fotos/upload/storage ou Supabase.
- Alterar `vendor-pdf`, `manualChunks`, Vite ou package files.

## Risco

Baixo para runtime atual: nao havia consumidor do gerador removido.

Medio para paridade futura: PDF de orcamento deve ser reconstruido como fluxo
app-v2 nativo, sem reaproveitar o gerador v1 removido.

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

Abrir CP separado para remover PMOC/checklist PDF restante, sem misturar com
assinatura, fotos/upload/storage ou recriacao de PDF/share real.
