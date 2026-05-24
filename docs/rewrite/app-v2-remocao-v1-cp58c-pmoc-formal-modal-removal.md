# app-v2 - CP-58C remocao do modal formal PMOC v1

## Objetivo

Remover a superficie formal de PMOC do runtime legado/v1 que ainda existia como
modal, post-action e contrato de teste, sem reaproveitar essa implementacao no
app-v2.

O PMOC do v2 deve ser recriado em etapa propria, depois da limpeza das migrations
e artefatos Supabase do v1. Este CP usa o v1 apenas como referencia funcional.

## Escopo executado

- Removido `src/ui/components/pmocModal.js`.
- Removido `src/ui/components/pmocInfoModal.js`.
- Removido o teste dedicado `src/__tests__/pmocOverlays.test.js`.
- Removido o botao `open-pmoc-modal` do painel PMOC legado de cliente.
- Removida a post-action `openPmoc` do cadastro legado de equipamentos.
- Substituido o atalho "Salvar e abrir PMOC" por "Salvar e registrar servico",
  mantendo uma acao operacional util sem abrir runtime PMOC formal v1.
- Atualizados contratos para garantir ausencia dos modais PMOC formais e do
  seletor `open-pmoc-modal`.

## Referencias boas do v1 para recriacao futura

Nao reutilizar o codigo v1, mas preservar como referencia de produto:

- PMOC como acompanhamento por cliente, nao como PDF isolado.
- Status por equipamento com vencido, sem registro e em dia.
- Chamada direta para registrar servico quando o equipamento exige acao.
- Resumo com proxima manutencao, realizadas/previstas e ano-base.

## Fora de escopo

- PMOC app-v2-native.
- PDF/share PMOC.
- Supabase, migrations, RLS, buckets ou storage real.
- Remocao completa do painel operacional PMOC legado de cliente.
- Regras de checklist operacional restantes.

## Validacao esperada

- Testes focados de contratos e post-actions.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
