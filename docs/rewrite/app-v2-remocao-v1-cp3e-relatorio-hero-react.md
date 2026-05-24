# app-v2 - Remocao v1 CP-3e - Hero de relatorios React

## Objetivo

Remover a ilha React legada do hero de relatorios sem alterar filtros, cards,
exportacao, PDF/share, WhatsApp, assinatura ou quota.

## Arquivos alterados

- `src/ui/views/relatorio.js`
- `src/__tests__/relatorioLegacyControls.test.js`
- `src/react/entrypoints/relatorioHeroIsland.jsx`
- `src/react/pages/RelatorioHero.jsx`
- `src/__tests__/relatorioHeroIsland.test.jsx`

## Decisao

O hero de relatorios era apenas um renderer do shell v1. O adapter
`src/ui/views/relatorio.js` agora renderiza esse bloco diretamente em DOM,
preservando os contratos publicos:

- `#rel-hero`
- `#rel-hero-title`
- `.rel-hero`
- `.rel-hero__brand`
- `.rel-hero__head`
- `.rel-hero__meta`
- `.rel-hero__kpis`
- `.rel-kpi`
- `.rel-segmented`
- `data-view-mode`

As demais ilhas de relatorio permanecem fora deste checkpoint:

- `relatorioControlsIsland`
- `relatorioCardsIsland`

## Fora de escopo

- Exportacao PDF/WhatsApp.
- Quota de PDF.
- Cards de relatorio.
- Controles/filtros React.
- Assinaturas.
- Storage/Supabase.
- Redesign visual.

## Validacao esperada

```bash
npm test -- src/__tests__/relatorioLegacyControls.test.js src/__tests__/relatorioView.test.js --run
rg -n "relatorioHeroIsland|mountRelatorioHeroReact|unmountRelatorioHeroReact|RelatorioHero.jsx|data-react-relatorio-hero" src index.html public -S
npm run format
npm run build
npm run check
```

## Risco remanescente

Baixo/medio. O bloco removido era visual, mas fica dentro da tela de relatorios,
que tambem contem exportacao e assinatura. Por isso o checkpoint ficou limitado
ao hero e manteve controles, cards e handlers sensiveis inalterados.
