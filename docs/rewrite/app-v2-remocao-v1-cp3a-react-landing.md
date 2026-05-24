# app-v2 - CP-3a remocao da landing React v1

## 1. Objetivo

Iniciar o CP-3 por um lote pequeno e seguro: remover a landing React antiga e
seus testes dedicados, sem tocar nas demais ilhas React ainda acopladas a views,
controllers e features do v1.

## 2. Mudanca

- Removido `src/react/entrypoints/landingIsland.jsx`.
- Removida a arvore `src/react/pages/landing/**`, incluindo assets grandes.
- Removidos os testes dedicados da landing React antiga:
  - `src/__tests__/landingPageReact.test.jsx`;
  - `src/__tests__/landingPage.a11y.test.js`.
- O bootstrap legado em `src/app.js` deixou de carregar a landing React quando
  nao ha usuario e passa a abrir a tela de autenticacao.
- Removida referencia documental interna a `BrandMark.jsx` de
  `src/ui/components/authscreen.js`.

## 3. Fora de escopo

- Remover demais ilhas React de dashboard, equipamentos, registro, historico,
  relatorio, alertas, clientes ou orcamentos.
- Remover `src/ui/**`, `src/features/**` ou testes de contratos v1.
- Alterar app-v2, auth real, storage, PDF/share, WhatsApp, Supabase ou billing.
- Alterar paginas legais/publicas fora da referencia removida.

## 4. Risco

Risco baixo controlado. A entrada principal da `main` ja monta app-v2, e a
landing removida era parte do bootstrap v1. O fallback legado sem usuario agora
abre a tela de autenticacao em vez de tentar carregar uma ilha removida.

## 5. Validacao esperada

```bash
rg -n "landingIsland|LandingPage|landing/assets|landing/components|landingMockData|landingIcons|mountLandingPageReact|BrandMark|DashboardPreview" src index.html public
npm run format
npm run build
npm run check
git diff --check
```

## 6. Proximo passo

Continuar CP-3 em lotes por dominio, escolhendo a proxima ilha React com menor
acoplamento e removendo seus testes dedicados junto com o runtime correspondente.
