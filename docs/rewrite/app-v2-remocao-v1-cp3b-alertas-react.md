# app-v2 - CP-3b remocao da ilha React de Alertas v1

## 1. Objetivo

Continuar o CP-3 por um lote pequeno: remover a ilha React antiga de Alertas,
mantendo apenas um renderer DOM local no adapter legado enquanto o shell v1
ainda existe.

## 2. Mudanca

- Removido `src/react/entrypoints/alertasIsland.jsx`.
- Removido `src/react/pages/AlertasPage.jsx`.
- Removido o teste dedicado `src/__tests__/alertasReactIsland.test.jsx`.
- `src/ui/views/alertas.js` deixou de carregar React dinamicamente e passou a
  renderizar os mesmos contratos publicos com DOM API e `textContent`.
- Testes de shell, empty state e seguranca de Alertas foram ajustados para o
  renderer legado sem React.

## 3. Fora de escopo

- Remover outras ilhas React.
- Remover `src/ui/**`, `src/features/**` ou contratos DOM v1.
- Alterar app-v2, PDF/share, storage, WhatsApp, Supabase, auth ou billing.
- Fazer redesign visual de Alertas.

## 4. Risco

Risco baixo controlado. Alertas ainda pertence ao runtime v1, mas a entrada
principal do produto ja e app-v2. O renderer preserva os IDs `alertas-contextual`
e `lista-alertas`, os atributos `data-action`, `data-id`, `data-nav`, roles e a
proteção contra HTML dinamico via `textContent`.

## 5. Validacao esperada

```bash
rg -n "alertasIsland|mountAlertasReact|unmountAlertasReact|AlertasPage|reactAlertasMounted|data-react-alertas-page" src index.html public
npm test -- src/__tests__/alertasShellContracts.test.js src/__tests__/alertasView.emptyState.test.js src/__tests__/alertasView.security.test.js src/__tests__/alertasViewModel.test.js --run
npm run format
npm run build
npm run check
git diff --check
```

## 6. Proximo passo

Continuar CP-3 por outro lote pequeno de ilha React, escolhendo uma tela com
baixo acoplamento ou aguardando CP-4 quando a remocao do adapter v1 for mais
segura que recriar fallback DOM temporario.
