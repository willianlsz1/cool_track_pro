# Mudança 21 / CP-C.2 — Layout desktop do Registro

## 1. Objetivo

Melhorar o aproveitamento do espaço no desktop da tela Registro, mantendo mobile e tablet em coluna única.

Esta CP-C.2 é implementação visual controlada. Não altera fluxo funcional, validações, PMOC runtime, PDF/share, WhatsApp, pós-save, cota `pdf_export`, Supabase/RLS/migrations, monetização, dependências, shell/sidebar, tema claro ou redesign global.

## 2. Estado inicial

- Branch observada: `main`
- HEAD inicial observado: `1d756d68c29b6351bc41f241760b06b00cc5d386`
- Working tree inicial: limpo
- Commit-base: `fix(design): refine registro action hierarchy`
- Documento-base: `docs/design/mudanca-21-cp-c1-registro-ajustes-operacionais.md`

## 3. Arquivos alterados

- `src/ui/views/registro.js`
- `src/ui/shell/templates/views.js`
- `src/assets/styles/redesign.css`
- `src/__tests__/registroLegacyHeaderRender.test.js`
- `docs/design/mudanca-21-cp-c2-registro-desktop-layout.md`

## 4. Problema visual corrigido

Após CP-C e CP-C.1, o Registro estava correto no mobile, mas no desktop ainda se comportava como uma coluna vertical larga. Isso deixava a área principal esticada, ações rápidas espalhadas e espaço útil sobrando à direita.

## 5. Comportamento desktop novo

Acima de `1200px`, `.card--registro` passa a usar duas colunas:

- coluna principal: cabeçalho/progresso, ações rápidas, dados do atendimento, contexto, cliente, materiais, impacto, PMOC/checklist, assinatura e ações finais;
- coluna lateral: resumo discreto, Evidências e dica rápida.

A coluna principal continua predominante. A coluna lateral usa largura controlada de `360px`, fica subordinada ao formulário e não cria uma segunda navegação.

A referência visual da CP-C.2 usa o desktop principal do usuário em `1920x1080`. Nessa largura, o Registro deve aproveitar melhor a área útil com composição intencional, sem parecer uma coluna mobile esticada.

## 6. Comportamento mobile preservado

Abaixo de `1200px`, Registro continua em coluna única. Não há sidebar interna no mobile, campos essenciais não foram ocultados, Evidências continua acessível como seção normal e ações rápidas permanecem antes de Dados do atendimento.

## 7. Regra das informações opcionais

As informações opcionais continuam inline:

- Cliente do serviço: `details` inline.
- Peças e materiais: `details` inline.
- Evidências: `details` inline, posicionado na coluna lateral apenas em desktop largo.
- Houve algum problema?: `details` inline.
- PMOC/checklist: `details` inline.
- Assinatura: hint/resumo inline; captura permanece no fluxo existente.

Nenhum opcional foi transformado em modal.

## 8. Preservado funcionalmente

- Fluxo de Registro.
- Validações dos campos obrigatórios.
- PMOC/checklist.
- PDF comum.
- PDF PMOC formal.
- WhatsApp/share.
- Pós-save.
- Cota `pdf_export`.
- `startServiceRegistration`.
- `go-register-equip`.
- `postAction register`.
- IDs públicos.
- `data-action`.
- `data-r-action`.
- Selectors e roots React públicos.
- Supabase/RLS/migrations.
- Monetização.
- Dependências.

## 9. Testes executados

Validações focadas:

- `npm run test -- src/__tests__/registroLegacyHeaderRender.test.js src/__tests__/registroHeaderIsland.test.jsx src/__tests__/registroPhotosIsland.test.jsx src/__tests__/registroEquipPicker.test.js src/__tests__/registroReactFieldHandlers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroLegacyChecklistRender.test.js`
  - Resultado: passou, 7 arquivos, 40 testes.
- `npx playwright test e2e/specs/registro-visual-smoke.spec.js --config=e2e/playwright.config.js`
  - Resultado: passou, 1 teste.

Validação obrigatória:

- `npm run format`
  - Resultado: passou.
- `npm run build`
  - Resultado: passou, mantendo apenas avisos Vite de import estático/dinâmico e chunk size já tratados como backlog técnico.
- `npm run check`
  - Resultado: passou. O lint manteve o aviso conhecido em `src/domain/pdf/shareReport.js`; testes e build passaram.
- `git diff --check`
  - Resultado: passou.

## 10. Validação visual

Validação visual executada com Playwright e fixture autenticada:

- Desktop principal `1920x1080`: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c2-visual\registro-cp-c2-desktop-1920.png`
- Desktop principal `1920x1080` com picker: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c2-visual\registro-cp-c2-desktop-1920-picker.png`
- Desktop `1440px`: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c2-visual\registro-cp-c2-desktop-1440.png`
- Tablet/intermediário: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c2-visual\registro-cp-c2-tablet-1024.png`
- Mobile: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c2-visual\registro-cp-c2-mobile-390.png`

Checks coletados:

- Desktop principal `1920x1080`: `.card--registro` com `display: grid`, largura útil observada de `1524px` dentro do shell atual e colunas `1136px 360px`.
- Desktop principal `1920x1080`: a tela não fica como coluna mobile esticada e usa a lateral direita com resumo, Evidências e dica rápida.
- Desktop `1440px`: `.card--registro` com `display: grid` e colunas controladas pela largura disponível.
- Desktop: `.registro-side-column` com `display: grid` e `position: sticky`.
- Desktop: cards auxiliares da lateral visíveis.
- Tablet `1024px`: `.card--registro` com `display: block`; sem duas colunas.
- Mobile `390px`: `.card--registro` com `display: block`; sem duas colunas.
- Tablet/mobile: cards auxiliares da lateral ocultos; Evidências continua no fluxo como `details`.
- Ações rápidas continuam antes de Dados do atendimento.
- Evidências permanece dentro de `.registro-side-column` e continua sendo `details`.
- Texto superior "Comece pela foto" permanece ausente.
- Picker de equipamento permanece overlay real com `z-index: 9999`.

## 11. Riscos remanescentes

- O template legado ainda precisa permanecer alinhado às ilhas React.
- O layout desktop depende de CSS escopado em `redesign.css`, que convive com `components.css`.
- A coluna lateral deve continuar discreta para não competir com Dados do atendimento.
- Shell/sidebar/header/bottom nav permanecem fora do escopo e devem ser tratados na CP-D.

## 12. Próximo CP recomendado

CP-D — Shell/sidebar/header/bottom nav: fazer a estrutura fixa parecer estrutura fixa e reduzir a sensação de painel flutuante ao redor das páginas.
