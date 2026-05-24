# app-v2 - CP-3c remocao da ilha React de Orcamentos v1

## 1. Objetivo

Remover mais um lote pequeno do CP-3: a ilha React antiga de Orcamentos,
mantendo os contratos DOM publicos do adapter v1 ate a remocao futura do shell
legado.

## 2. Mudanca

- Removido `src/react/entrypoints/orcamentosIsland.jsx`.
- Removido `src/react/pages/OrcamentosPage.jsx`.
- Removido o teste dedicado `src/__tests__/orcamentosReactIsland.test.jsx`.
- `src/ui/views/orcamentos.js` deixou de carregar React dinamicamente e passou a
  renderizar a pagina com DOM API e `textContent`, usando o mesmo
  `buildOrcamentosViewModel`.
- A cobertura remanescente de `src/__tests__/orcamentosView.security.test.js`
  preserva empty state, filtros, cards, acoes principais e escape de conteudo.

## 3. Fora de escopo

- Remover outras ilhas React.
- Remover `src/ui/**`, `src/features/**` ou contratos DOM v1.
- Alterar app-v2, PDF/share, storage, WhatsApp, Supabase, auth ou billing.
- Reescrever fluxo real de orcamentos ou assinatura.

## 4. Risco

Risco medio controlado. A tela de Orcamentos v1 tem mais acoes que Alertas, mas
o produto principal ja entra pelo app-v2. O renderer preserva classes `.orc-*`,
`#orc-busca`, `data-action`, `data-id`, `data-status`, `data-mode` e o escape de
conteudo dinamico via `textContent`.

## 5. Validacao esperada

```bash
rg -n "orcamentosIsland|mountOrcamentosReact|unmountOrcamentosReact|OrcamentosPage|reactOrcamentosMounted|data-react-orcamentos-page" src index.html public
npm test -- src/__tests__/orcamentosView.security.test.js src/__tests__/orcamentosViewModel.test.js --run
npm run format
npm run build
npm run check
git diff --check
```

## 6. Proximo passo

Continuar CP-3 apenas em lotes pequenos. As proximas ilhas mais acopladas devem
ser avaliadas contra CP-4, porque talvez seja mais seguro remover o adapter v1
inteiro do que recriar fallbacks DOM temporarios.
