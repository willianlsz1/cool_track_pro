# Mudanca 21 / CP-G - Copy visual e microtextos

## 1. Objetivo

Refinar textos curtos, labels, CTAs, dicas e mensagens de apoio nas superficies trabalhadas na Mudanca 21, mantendo a linguagem mais operacional para tecnico de campo e sem alterar fluxos funcionais.

## 2. Estado inicial

- Branch: `main`
- HEAD inicial: `88eb9015cc35a284b037d049aef1c966b8c79021`
- Commit base: `refactor(design): standardize overlays and empty states`
- Working tree inicial: limpo
- Escopo: copy visual e microtextos. Sem CSS, tema claro, rotas, dependencias, Supabase/RLS, PDF/share runtime, WhatsApp/share, PMOC runtime ou monetizacao.

## 3. Arquivos alterados

- `src/react/pages/RegistroHeader.jsx`
- `src/ui/shell/templates/views.js`
- `src/react/pages/ClientesPage.jsx`
- `src/ui/views/clientes/emptyStateRenderer.js`
- `src/ui/components/clienteModal.js`
- `src/ui/components/clientesPaywallModal.js`
- `src/ui/components/registroEquipPicker.js`
- `src/ui/components/pmocModal.js`
- `src/ui/components/pmocInfoModal.js`
- `src/ui/components/upgradeNudge.js`
- `src/features/equipamentos/ui/renderEquip.js`
- `src/features/equipamentos/ui/detail.js`
- `src/ui/viewModels/equipamentosViewModel.js`
- `src/__tests__/clientesPaywallModal.test.js`
- `src/__tests__/upgradeNudge.test.js`
- `src/__tests__/pmocOverlays.test.js`
- `src/__tests__/registroLegacyChecklistRender.test.js`
- `src/features/equipamentos/__tests__/ui/detail.test.js`

## 4. Grupos de textos revisados

### Registro

- Acoes rapidas agora explicam que preenchem tipo e descricao e precisam de revisao.
- Dados do atendimento passaram a falar em salvar e gerar relatorio tecnico, sem tratar PDF como "liberado".
- Campo de descricao virou "O que o cliente precisa saber", com exemplo mais tecnico e objetivo.
- Evidencias foram descritas como fotos/anexos e prova do atendimento.
- Rodape de salvar deixou claro que o WhatsApp abre para o tecnico enviar, sem sugerir envio automatico.

### Clientes

- Header e empty state ficaram menos empresariais.
- A copy prioriza cliente, equipamento, servico e historico.
- O resumo PMOC diferencia melhor cronograma preventivo de PMOC formal.
- Paywall de limite Free ficou mais direto: Free inclui um cliente; Plus libera mais capacidade.

### Equipamentos e detalhes

- Subtitulo da tela ficou mais operacional: encontrar equipamento, ver status e registrar servico.
- Empty states explicam a proxima acao sem parecer upsell.
- Detalhe do equipamento troca "rotina preventiva" por "preventiva do equipamento" e torna o historico mais especifico.

### PMOC

- `pmocModal` diferencia PMOC formal anual de relatorio tecnico de visita.
- `pmocInfoModal` compara "relatorio tecnico do servico" com "PMOC formal anual".
- O bloqueio PMOC nao-Pro comunica recurso Pro sem parecer erro tecnico.

### Paywalls e upsells

- `clientesPaywallModal` usa CTA "Ver plano Plus" e explica capacidade.
- `upgradeNudge` usa linguagem de rotina de campo para Plus e PMOC formal para Pro.
- Hint inline passou a dizer que o recurso fica disponivel no plano necessario.

## 5. Exemplos antes/depois

- Antes: "Preencha os 5 campos para liberar o PDF do cliente."
- Depois: "Preencha os campos obrigatorios para salvar e gerar o relatorio tecnico."

- Antes: "Envio direto pelo WhatsApp."
- Depois: "WhatsApp abre para voce fazer o envio."

- Antes: "PMOC formal e exclusivo do plano Pro."
- Depois: "PMOC formal anual e recurso Pro."

- Antes: "Relatorios profissionais."
- Depois: "Relatorios tecnicos."

## 6. Preservado funcionalmente

- Fluxo de Registro.
- Validacoes.
- PMOC/checklist.
- PDF comum e PDF PMOC formal.
- WhatsApp/share.
- Pos-save.
- Cota `pdf_export`.
- Clientes Free.
- Equipamentos.
- `startServiceRegistration`, `go-register-equip` e `postAction register`.
- Rotas, Supabase/RLS, IDs, selectors publicos, `data-action`, `data-cli-action`, `data-post-action` e `data-nav`.

## 7. Testes executados

- `npx vitest run src/__tests__/clientesPaywallModal.test.js src/__tests__/upgradeNudge.test.js src/__tests__/pmocOverlays.test.js src/__tests__/registroLegacyHeaderRender.test.js src/__tests__/clientesReactIsland.test.jsx src/features/equipamentos/__tests__/ui/detail.test.js src/features/equipamentos/__tests__/ui/renderEquip.test.js src/features/equipamentos/__tests__/utils/viewModels.test.js`: passou, 8 arquivos / 49 testes.
- `npx vitest run src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/pmocOverlays.test.js src/__tests__/registroLegacyHeaderRender.test.js`: passou, 3 arquivos / 20 testes.
- `npm run format`: passou.
- `npm run build`: passou com warnings Vite static/dynamic e chunk size conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings Vite conhecidos.
- `git diff --check`: passou.

## 8. Validacao visual

Validacao visual executada:

- `npx playwright test e2e/specs/registro-visual-smoke.spec.js e2e/specs/equipamentos-visual-smoke.spec.js --config=e2e/playwright.config.js`: passou com 1 teste executado e 1 skip definido pelo proprio spec.
- O smoke de Registro validou roots, CTAs e contratos principais sem erros de console.
- O spec de Equipamentos permaneceu condicionado pelo proprio teste e ficou marcado como skip.
- Clientes/paywall/empty states foram validados por testes focados de texto e revisao de diff nesta CP.

## 9. Riscos remanescentes

- Existem textos antigos fora do escopo desta CP, como Historico, onboarding de perfil e areas de conta/pricing.
- A linguagem de PMOC formal ainda deve preservar formalidade minima quando aparecer no documento gerado; runtime de PDF ficou fora do escopo.
- `redesign.css` continua legado e grande, mas nao foi alterado nesta CP.

## 10. Proximo CP recomendado

CP-H - Fechamento documental da Mudanca 21, consolidando auditoria, contrato, CPs implementadas, validacoes visuais e proximas frentes.
