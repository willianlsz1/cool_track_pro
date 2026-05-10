# Mudança 21 / CP-C — Registro como página de trabalho

## 1. Objetivo

Aplicar o contrato visual da CP-B na tela Registro, reduzindo a sensação de "modal dentro de modal" e tornando o fluxo uma página operacional de trabalho para o técnico em campo.

O foco desta CP-C foi a hierarquia visual local do Registro. Não houve troca de tema, redesign global, alteração de shell/sidebar, alteração funcional do fluxo, mudança em PMOC runtime, PDF/share, WhatsApp, monetização, Supabase, dependências ou contratos públicos.

## 2. Estado inicial

- Branch observada: `main`
- HEAD inicial observado: `05db74f9c52389912263caf856d26238f0f0bbbf`
- Working tree inicial: limpo
- Documento-base: `docs/design/mudanca-21-cp-b-contrato-visual-superficies.md`

## 3. Arquivos alterados

- `src/react/pages/RegistroHeader.jsx`
- `src/assets/styles/redesign.css`
- `docs/design/mudanca-21-cp-c-registro-pagina-trabalho.md`

## 4. Comportamento visual anterior

- O wrapper de Registro ainda herdava aparência de card por regras globais.
- O cabeçalho compacto tinha peso de painel.
- Foto e ações rápidas apareciam antes de "Dados do atendimento" na ilha React.
- A foto tinha tratamento de tile destacado.
- Ações rápidas tinham peso próximo de cards de tarefa.
- O foco programático do router em `#main-content` podia desenhar um contorno grande ao redor da rota Registro, reforçando a sensação de painel.
- Seções opcionais tinham tratamento mais próximo de mini-cards.

## 5. Comportamento visual novo

- O wrapper `.card--registro` foi neutralizado como superfície de página: sem fundo, borda, padding ou sombra.
- O cabeçalho `.registro-hero--compact` passou a funcionar como cabeçalho de página/progresso: sem sombra, sem radius e com separação inferior sutil.
- Na ilha React, "Dados do atendimento" passou a vir antes de foto e ações rápidas.
- "Dados do atendimento" ficou como núcleo visual do Registro, com borda lateral e superfície controlada.
- "Comece pela foto" virou atalho auxiliar leve, com borda tracejada e sem sombra.
- "Ações rápidas" ficaram menores e subordinadas.
- Seções opcionais foram suavizadas: menos peso de card, menos preenchimento visual e sem sombra.
- O outline global de foco do `#main-content` foi neutralizado somente quando `body[data-route='registro']`, para evitar que a página inteira pareça um painel/modal.

## 6. Superfícies reclassificadas

- Página: `#view-registro` e `.card--registro` deixam de comunicar card central.
- Cabeçalho de página: `.registro-hero--compact` comunica estado/progresso, não modal.
- Seção principal: `.registro-bloco--required` é o núcleo visual do formulário.
- Atalho auxiliar: `.registro-photo-quick` fica subordinado ao formulário.
- Seção auxiliar: `.registro-quick` fica subordinada ao formulário e ao CTA principal.
- Seções opcionais: `.registro-details` ficam mais leves.
- Overlay real: `registro-equip-picker` foi preservado como camada superior com backdrop.

## 7. Preservado funcionalmente

- Fluxo de salvamento do Registro.
- Validações dos campos obrigatórios.
- PMOC/checklist funcional.
- PDF/share.
- WhatsApp.
- Pós-save.
- Cota `pdf_export`.
- IDs públicos.
- `data-action`.
- `data-r-action`.
- Selectors e roots React públicos.
- Supabase/RLS/migrations.
- Monetização.
- Dependências.

## 8. Testes alterados/adicionados

Nenhum teste foi alterado ou adicionado. A mudança preservou os contratos existentes.

## 9. Validação executada

Validações focadas já executadas:

- `npm run test -- src/__tests__/registroHeaderIsland.test.jsx src/__tests__/registroReactFieldHandlers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/registroPdfWhatsappLegacyContracts.test.js src/__tests__/registroPostSaveLegacyFlow.test.js src/__tests__/registroSaveSignatureHandlers.test.js`
  - Resultado: passou, 7 arquivos, 43 testes.
- `npx playwright test e2e/specs/registro-visual-smoke.spec.js --config=e2e/playwright.config.js`
  - Resultado: passou, 1 teste.

Validação visual executada com Playwright e fixture autenticada:

- Desktop: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c-visual\registro-cp-c-desktop.png`
- Mobile: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c-visual\registro-cp-c-mobile.png`
- Overlay picker: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c-visual\registro-cp-c-equip-picker-overlay.png`

Checks de layout coletados via Playwright:

- `requiredBeforeAuxiliary: true`
- `.card--registro` sem sombra, fundo ou borda.
- `#main-content` sem outline na rota Registro.
- `.registro-hero--compact` sem sombra e sem radius.
- `.registro-photo-quick` sem sombra e com borda tracejada.
- Picker de equipamento visível como overlay.

Validação final obrigatória:

- `npm run format`
  - Resultado: passou.
- `npm run build`
  - Resultado: passou, mantendo apenas avisos Vite de import estático/dinâmico e chunk size já tratados como backlog técnico.
- `npm run check`
  - Resultado: passou. O lint manteve o aviso conhecido em `src/domain/pdf/shareReport.js`; testes e build passaram.
- `git diff --check`
  - Resultado: passou.

## 10. Riscos remanescentes

- O CSS de Registro ainda convive com regras antigas em `components.css`, `theme-premium.css` e `redesign.css`; novos CPs devem evitar ampliar o escopo global.
- O template legado em `src/ui/shell/templates/views.js` permanece como fallback/HTML inicial; a ordem operacional após montagem React foi ajustada na ilha `RegistroHeader`.
- A assinatura e o CTA principal ainda têm peso visual alto, mas foram preservados por serem parte do fechamento do fluxo.
- A sidebar continua com aparência de painel em alguns pontos; isso fica para CP-D.
- O bottom nav mobile pode sobrepor parte da área inferior durante screenshots longos; isso deve ser tratado junto com shell/mobile, não nesta CP-C.

## 11. Próximo CP recomendado

CP-D — Shell/sidebar/header/bottom nav: fazer a estrutura fixa parecer estrutura fixa e reduzir a sensação de painel flutuante ao redor das páginas.
