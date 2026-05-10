# Mudança 21 / CP-C.1 — Correções de hierarquia e ordem operacional no Registro

## 1. Objetivo

Corrigir ajustes observados após a CP-C mantendo Registro como página de trabalho: recolocar ações rápidas no começo do fluxo, remover o atalho dominante de foto da área superior, manter fotos dentro de Evidências e corrigir o CTA vazio do picker de equipamento.

Esta CP-C.1 é implementação visual controlada. Não altera fluxo funcional, validações, PMOC runtime, PDF/share, WhatsApp, pós-save, cota `pdf_export`, Supabase/RLS/migrations, monetização, dependências, shell/sidebar, tema claro ou redesign global.

## 2. Estado inicial

- Branch observada: `main`
- HEAD inicial observado: `6067a8a0fd6b10acec01d6a16b735677af2567ad`
- Working tree inicial: limpo
- Documento-base: `docs/design/mudanca-21-cp-c-registro-pagina-trabalho.md`
- Commit-base: `refactor(design): make registro a work page`

## 3. Arquivos alterados

- `src/react/pages/RegistroHeader.jsx`
- `src/react/pages/RegistroPhotos.jsx`
- `src/ui/shell/templates/views.js`
- `src/ui/components/registroEquipPicker.js`
- `src/assets/styles/redesign.css`
- `src/__tests__/registroHeaderIsland.test.jsx`
- `src/__tests__/registroPhotosIsland.test.jsx`
- `src/__tests__/registroEquipPicker.test.js`
- `docs/design/mudanca-21-cp-c1-registro-ajustes-operacionais.md`

## 4. Problemas corrigidos

- "Ações rápidas" ficou abaixo de "Dados do atendimento" após a CP-C.
- "Comece pela foto" ocupava área nobre e sugeria etapa principal.
- O CTA "+ Cadastrar primeiro equipamento" no picker usava aparência crua/default.
- O atalho de câmera precisava continuar disponível sem competir com o formulário.

## 5. Nova ordem visual do Registro

Ordem operacional no cabeçalho React:

1. Cabeçalho/progresso do Registro.
2. Ações rápidas.
3. Dados do atendimento.
4. Contexto do atendimento, quando aplicável.
5. Blocos opcionais, incluindo Evidências.

"Dados do atendimento" permanece como núcleo visual do formulário. As ações rápidas voltam para o início para preencher tipo/descrição sem parecer CTA principal.

## 6. Decisão sobre "Comece pela foto"

O bloco superior "Comece pela foto / Tirar foto da etiqueta agora" foi removido da área principal.

A funcionalidade de foto não foi removida. O atalho de câmera continua dentro de Evidências, junto do dropzone e dos inputs `input-fotos` e `input-fotos-camera`. A classe pública `registro-photo-quick` foi preservada nesse atalho rebaixado para manter compatibilidade de selector sem manter o bloco dominante no topo.

## 7. Correção do CTA do picker

O botão "+ Cadastrar primeiro equipamento" recebeu as classes oficiais `btn btn--primary`, preservando:

- `data-action="open-modal"`
- `data-id="modal-add-eq"`
- `data-post-action="register"`

O fluxo de fechar o picker e abrir o cadastro de equipamento permanece inalterado.

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

- `npm run test -- src/__tests__/registroHeaderIsland.test.jsx src/__tests__/registroPhotosIsland.test.jsx src/__tests__/registroEquipPicker.test.js src/__tests__/registroReactFieldHandlers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroLegacyChecklistRender.test.js`
  - Resultado: passou, 6 arquivos, 35 testes.
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

- Desktop: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c1-visual\registro-cp-c1-desktop.png`
- Mobile: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c1-visual\registro-cp-c1-mobile.png`
- Picker vazio: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-c1-visual\registro-cp-c1-empty-picker.png`

Checks de layout coletados:

- Ordem no cabeçalho React: `quick -> required`.
- Texto superior "Comece pela foto" ausente.
- Inputs `input-fotos` e `input-fotos-camera` presentes em Evidências.
- Atalho de câmera presente em Evidências com `registro-photo-quick--evidence`.
- Botão do picker com `btn`, `btn--primary` e `data-post-action="register"`.
- Picker visível como overlay.

Critérios visuais confirmados:

- Ações rápidas aparecem antes de "Dados do atendimento".
- "Dados do atendimento" continua sendo o núcleo visual.
- "Comece pela foto" não aparece na área superior.
- Evidências continua cobrindo fotos.
- CTA do picker parece ação oficial.
- Picker continua claramente acima da página.

## 11. Riscos remanescentes

- O fallback legado em `src/ui/shell/templates/views.js` ainda replica parte do markup de Registro e precisa continuar alinhado às ilhas React.
- O CSS do Registro ainda convive com regras antigas em `components.css` e `redesign.css`.
- O bottom nav mobile e a sidebar permanecem fora do escopo e devem ser tratados na CP-D.
- Mudanças futuras devem evitar reintroduzir foto como etapa principal fora de Evidências.

## 12. Próximo CP recomendado

CP-D — Shell/sidebar/header/bottom nav: fazer a estrutura fixa parecer estrutura fixa e reduzir a sensação de painel flutuante ao redor das páginas.
