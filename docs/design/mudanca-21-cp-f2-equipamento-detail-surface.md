# Mudança 21 / CP-F.2 — Detalhe do equipamento como superfície de trabalho

## 1. Objetivo

Corrigir a decisão visual do detalhe do equipamento depois da CP-F.1. A CP-F.1 tornou o conteúdo rolável, mas o detalhe ainda parecia uma página inteira presa dentro de um modal pesado.

Esta CP-F.2 mantém o comportamento funcional atual e reclassifica visualmente o detalhe como superfície de trabalho: menos backdrop, menos caixa modal, hierarquia mais operacional e corpo ainda rolável quando necessário.

## 2. Estado inicial

- Branch observada: `main`
- HEAD observado no início: `315b9becdd93431d51e65c92ddfe288e87f815f7`
- Working tree inicial: limpo
- Base funcional preservada: CP-F.1 já garantia scroll interno e acesso ao botão de fechar.

## 3. Diagnóstico

O detalhe é aberto pelo fluxo legado de equipamentos:

- `viewEquip(id)` monta o HTML do detalhe.
- `mountViewEquipDetail(html)` injeta o conteúdo em `#eq-det-corpo`.
- `openViewEquipDetailModal(id, Modal)` abre `#modal-eq-det`.

Converter para rota/página real exigiria mexer em navegação, estado, handlers e contratos públicos. Isso ficou fora do limite seguro desta CP. A alternativa segura foi manter o container técnico existente e alterar a superfície visual para se comportar como detalhe de trabalho.

## 4. Arquivos alterados

- `src/features/equipamentos/ui/detail.js`
- `src/ui/shell/templates/modals.js`
- `src/assets/styles/redesign.css`
- `src/features/equipamentos/__tests__/ui/detail.test.js`
- `src/__tests__/equipmentDetailOverlayShell.test.js`
- `docs/design/mudanca-21-cp-f2-equipamento-detail-surface.md`

## 5. Comportamento anterior

- O overlay ocupava quase a tela inteira, mas ainda tinha peso de modal.
- A capa/foto ficava dominante.
- A ação principal dependia do rodapé fixo.
- PMOC, criticidade, histórico, detalhes técnicos e foto competiam no mesmo nível.
- Em desktop 1920x1080, a composição ainda parecia pesada e pouco operacional.

## 6. Comportamento novo

- O container técnico `#modal-eq-det` foi preservado, mas o backdrop ficou mais leve.
- O shell do detalhe passou a se apresentar como superfície de trabalho.
- O cabeçalho interno agora concentra:
  - nome do equipamento;
  - local/TAG;
  - ação principal `Registrar serviço`;
  - ação secundária `Editar`;
  - menu de ações menos frequentes.
- A capa/foto foi movida para painel lateral de apoio em desktop.
- O resumo operacional fica no topo com score e fatores de risco.
- PMOC/preventiva virou painel contextual organizado.
- Histórico e detalhes técnicos ficam em áreas próprias.
- O corpo continua rolável e com fechamento sempre acessível.

## 7. Preservação funcional

Foram preservados:

- abrir detalhe do equipamento;
- fechar/voltar;
- editar equipamento;
- registrar serviço;
- registrar preventiva;
- menu de ações;
- fotos/anexos;
- PMOC/preventiva contextual;
- histórico;
- dados técnicos;
- `data-action`, `data-id`, IDs e selectors públicos principais;
- Registro;
- PDF/WhatsApp;
- cota `pdf_export`;
- Supabase/RLS;
- dependências e configs.

Não foram alterados:

- PDF/share;
- WhatsApp/share;
- Registro;
- PMOC runtime;
- PDF PMOC formal;
- monetização/cotas;
- Supabase/RLS/migrations;
- segurança/auth;
- `package.json` ou `package-lock.json`;
- tema claro azul/branco;
- rotas públicas;
- Cliente -> Equipamentos;
- limite Free de Clientes.

## 8. Testes executados

Testes focados:

- `npx vitest run src/features/equipamentos/__tests__/ui/detail.test.js src/features/equipamentos/__tests__/ui/detailController.test.js src/__tests__/equipmentDetailOverlayShell.test.js src/__tests__/equipamentosLegacyRender.test.js src/__tests__/equipamentosLegacySetorDetailHandlers.test.js src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js src/__tests__/equipamentosReactHeaderLegacyHandlers.test.jsx`
- Resultado: 7 arquivos / 41 testes passaram.

Validação visual temporária:

- `npx playwright test -c e2e/playwright.config.js e2e/specs/cp-f2-equip-detail-surface.tmp.spec.js`
- Resultado final: 3 cenários passaram.
- O spec temporário foi removido antes do commit.

## 9. Validação visual

Foram geradas e revisadas capturas locais:

- `test-results/cp-f2-equip-detail-desktop-1920-top.png`
- `test-results/cp-f2-equip-detail-desktop-1920-scrolled.png`
- `test-results/cp-f2-equip-detail-short-1366-top.png`
- `test-results/cp-f2-equip-detail-short-1366-scrolled.png`
- `test-results/cp-f2-equip-detail-mobile-390-top.png`
- `test-results/cp-f2-equip-detail-mobile-390-scrolled.png`

Verificações feitas:

- desktop 1920x1080 usa composição de trabalho com coluna lateral de mídia;
- desktop 1366x768 mantém acesso ao fechar, ações e rolagem;
- mobile permanece em coluna única;
- capa/foto deixa de dominar a primeira tela;
- ação principal fica visível no topo;
- PMOC, risco, histórico e detalhes técnicos ficam mais separados;
- conteúdo continua acessível por scroll.

## 10. Riscos remanescentes

- O detalhe ainda usa tecnicamente `#modal-eq-det`; uma migração para rota própria exigiria CP separada.
- `redesign.css` continua grande e legado, com sobreposições históricas.
- Alguns blocos do detalhe ainda são densos por natureza do domínio técnico.
- O shell global e tema claro azul/branco continuam fora desta CP.

## 11. Próximo CP recomendado

Retomar a CP-G de copy visual e microtextos, agora com o detalhe do equipamento menos bloqueante e com hierarquia mais clara.
