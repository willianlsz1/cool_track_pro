# Mudanca 21 / CP-F - Modais, drawers, paywalls e estados vazios

## 1. Objetivo

Aplicar o contrato visual de superficies aos overlays e estados transversais do app, diferenciando modal real, picker, paywall, popover/dropdown e estado vazio sem alterar fluxos funcionais.

## 2. Estado inicial

- Branch: `main`
- HEAD inicial: `c2eabefcba182d74bcfbd763f5d463a071a02b87`
- Commit base: `refactor(design): align client equipment surfaces`
- Working tree inicial: limpo
- Escopo: visual controlado em overlays, paywalls, pickers, popovers/dropdowns e estados vazios.

## 3. Arquivos alterados

- `src/ui/components/registroEquipPicker.js`
- `src/ui/components/clientesPaywallModal.js`
- `src/ui/components/clienteModal.js`
- `src/ui/components/pmocModal.js`
- `src/ui/components/pmocInfoModal.js`
- `src/assets/styles/redesign.css`
- `src/__tests__/registroEquipPicker.test.js`
- `src/__tests__/clientesPaywallModal.test.js`
- `src/__tests__/clienteModalLimit.test.js`
- `src/__tests__/pmocOverlays.test.js`
- `docs/design/mudanca-21-cp-f-modais-drawers-paywalls-empty-states.md`

## 4. Comportamento visual anterior

- Modais, cards e pickers usavam pesos visuais proximos.
- Alguns overlays dependiam mais do conteudo interno do que da camada para comunicar elevacao.
- Paywalls e upsells podiam parecer apenas cards comuns.
- Estados vazios tinham risco de parecer bloqueio comercial quando deveriam orientar a proxima acao.
- Popovers/dropdowns ainda tinham aparencia inconsistente com a hierarquia de superficies.

## 5. Comportamento visual novo

- Overlays reais receberam backdrop escuro, blur, z-index consistente, largura controlada e sombra de camada temporaria.
- Modais de cliente, PMOC formal e PMOC informativo foram marcados como `data-surface="modal"`.
- Paywalls de Clientes e PMOC nao-Pro foram marcados como `data-surface="paywall"` e receberam tratamento visual de bloqueio/upgrade.
- Picker de equipamento foi marcado como `data-surface="picker"` e preservado como camada temporaria acima da pagina.
- Estados vazios foram suavizados com borda tracejada e fundo leve, reduzindo a aparencia de paywall.
- Menus contextuais foram tratados como superficies compactas, sem virar painel administrativo.

## 6. Mudancas em modais

- `clienteModal`, `pmocModal` Pro e `pmocInfoModal` agora expoem explicitamente a superficie como modal.
- O CSS reforca que modais reais sao Nível 4: camada temporaria, com backdrop e sombra superiores aos cards.
- Conteudos internos longos continuam rolaveis dentro do modal, sem transformar a pagina em card.

## 7. Mudancas em drawers, sheets e pickers

- O picker de equipamento continua como overlay real, com backdrop e sheet mais claramente temporarios.
- No mobile, overlays mantem comportamento de sheet/folha inferior quando aplicavel.
- O CTA de cadastro de equipamento da etapa anterior foi preservado como acao oficial.

## 8. Mudancas em paywalls e upsells

- Paywalls foram diferenciados de empty states por borda/acento dourado, sombra de overlay e CTA principal.
- O bloqueio PMOC nao-Pro continua apontando para Pro sem alterar contrato de plano.
- `upgrade-inline-hint` e `upgrade-nudge-card` receberam peso comercial controlado, sem competir com modais reais.

## 9. Mudancas em estados vazios

- Empty states permanecem orientativos.
- O tratamento visual agora usa superficie leve, borda tracejada e icone discreto.
- A regra da CP-B foi preservada: estado vazio orienta proxima acao e nao deve parecer paywall por padrao.

## 10. Preservado funcionalmente

- Abertura e fechamento de modais.
- `data-action`, `data-cli-action`, `data-post-action`, `data-nav`, IDs e seletores publicos existentes.
- Registro e picker de equipamento.
- Clientes Free e paywall de limite.
- Equipamentos e detalhe do equipamento.
- PMOC formal Pro e informativo PMOC.
- PDF, WhatsApp/share, pos-save e cota `pdf_export`.
- Supabase/RLS, rotas, validacoes, monetizacao e dependencias.

## 11. Testes executados

- `npx vitest run src/__tests__/registroEquipPicker.test.js src/__tests__/clientesPaywallModal.test.js src/__tests__/clienteModalLimit.test.js src/__tests__/pmocOverlays.test.js`
- `npx playwright test e2e/specs/cp-f-visual-validation.spec.js --config=e2e/playwright.config.js`

## 12. Validacao visual

Foram revisadas capturas locais:

- `test-results/cp-f-registro-picker-1920.png`
- `test-results/cp-f-cliente-modal-1920.png`
- `test-results/cp-f-clientes-paywall-1920.png`
- `test-results/cp-f-pmoc-paywall-1920.png`
- `test-results/cp-f-equip-detail-overlay-1920.png`
- `test-results/cp-f-registro-picker-mobile.png`

Observacao: as capturas `fullPage` mostram conteudo abaixo de overlays fixos quando a pagina e mais alta que o viewport. A validacao visual foi feita pelo viewport efetivo, onde os overlays continuam superiores a pagina.

## 13. Riscos remanescentes

- `src/assets/styles/redesign.css` segue grande e legado; consolidacao deve ficar para CP propria.
- Alguns modais ainda carregam conteudo denso por natureza do fluxo, embora agora estejam visualmente separados da pagina.
- A padronizacao foi visual e escopada; uma futura CP pode extrair tokens/classes dedicadas se houver decisao de consolidar CSS.

## 14. Proximo CP recomendado

CP-G - Copy visual e microtextos, depois que a hierarquia de paginas, shell, cards, modais, paywalls e empty states ja foi alinhada.
