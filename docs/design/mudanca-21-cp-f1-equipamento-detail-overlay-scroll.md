# Mudança 21 / CP-F.1 — Detalhe do equipamento com overlay rolável

## 1. Objetivo

Corrigir o detalhe do equipamento para funcionar como overlay grande controlado, com altura limitada ao viewport, fechamento acessível e corpo com scroll interno.

Esta CP-F.1 não altera fluxo funcional, dados, PMOC runtime, PDF, WhatsApp, monetização, Supabase, rotas ou dependências.

## 2. Estado inicial

- Branch observada: `main`
- HEAD observado no início: `ce3b415a32636902f4f763a39b0f654a4f988a00`
- Commit observado no HEAD: `refactor(design): refine operational copy`
- Working tree observado no início: limpo
- Base real observada: CP-G já estava aplicada sobre a CP-F. A CP-F.1 foi feita sobre o HEAD atual, sem reverter CP-G.

## 3. Problema observado

O detalhe do equipamento tinha conteúdo denso dentro de um modal genérico:

- foto/capa;
- identificação e localização;
- eficiência/status;
- fatores de risco;
- PMOC/preventiva;
- ficha técnica;
- histórico;
- ações de registrar, editar, menu e excluir.

O shell do modal renderizava `#eq-det-corpo` diretamente dentro de `.modal`, sem cabeçalho próprio, sem botão de fechar visível no topo e sem declarar o root como corpo rolável. Em telas com menor altura, partes do conteúdo podiam ficar fora da área útil e a página de fundo podia parecer competir com o overlay.

## 4. Arquivos alterados

- `src/ui/shell/templates/modals.js`
- `src/assets/styles/redesign.css`
- `src/__tests__/equipmentDetailOverlayShell.test.js`
- `docs/design/mudanca-21-cp-f1-equipamento-detail-overlay-scroll.md`

## 5. Comportamento novo

O modal de detalhe do equipamento passou a ter:

- classe específica `modal--eq-detail`;
- cabeçalho de shell `eq-detail-shell-head`;
- botão de fechar sempre no topo com `data-action="close-modal"` e `data-id="modal-eq-det"`;
- `#eq-det-corpo` preservado, agora também como `modal__body modal__body--scroll eq-detail-shell-body`;
- altura máxima baseada no viewport;
- overflow interno no corpo correto;
- footer de ações sticky dentro do corpo rolável;
- capa com altura controlada para não empurrar o restante do conteúdo para fora da tela.

## 6. Desktop, altura menor e mobile

Desktop:

- o overlay fica centralizado;
- a largura continua ampla para conteúdo denso;
- a altura é limitada por `100dvh`;
- o corpo rola internamente;
- fechar e ações principais permanecem acessíveis.

Altura menor:

- o modal não depende do scroll do body por baixo;
- o conteúdo excedente fica dentro do scroll de `#eq-det-corpo`;
- o footer de ações continua alcançável.

Mobile:

- o detalhe se comporta como sheet/fullscreen controlado;
- o layout continua em coluna;
- o fechar fica no topo;
- o corpo rola internamente.

## 7. Preservado funcionalmente

Foram preservados:

- abrir e fechar detalhe do equipamento;
- editar equipamento;
- registrar serviço;
- registrar preventiva;
- menu de ações;
- PMOC/preventiva contextual;
- histórico;
- fotos;
- dados técnicos;
- cliente/setor;
- Registro;
- PDF/WhatsApp;
- cota `pdf_export`;
- Supabase/RLS;
- rotas;
- IDs, `data-action`, `data-cli-action`, `data-nav` e selectors públicos.

## 8. Testes e validação

Teste estrutural adicionado:

- garante que o detalhe usa `modal--eq-detail`;
- garante que `#eq-det-corpo` continua existindo;
- garante que `#eq-det-corpo` é corpo rolável;
- garante que o botão de fechar do overlay está presente e aponta para `modal-eq-det`.

Validação focada executada:

- `npx vitest run src/__tests__/equipmentDetailOverlayShell.test.js src/features/equipamentos/__tests__/ui/detail.test.js src/features/equipamentos/__tests__/ui/detailController.test.js`
- Playwright temporário para validar detalhe em 1920x1080, 1366x768 e 390x844.

Screenshots revisadas:

- `test-results/cp-f1-equip-detail-scroll-desktop-1920.png`
- `test-results/cp-f1-equip-detail-scroll-short-1366.png`
- `test-results/cp-f1-equip-detail-scroll-mobile-390.png`

Observação: a spec Playwright usada para validação visual foi temporária e removida antes do commit.

Validações obrigatórias para fechamento:

- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

## 9. Riscos remanescentes

- O detalhe continua denso por natureza; uma CP futura pode avaliar se parte do conteúdo deve virar rota dedicada em vez de overlay.
- `redesign.css` segue grande e legado; consolidação ampla deve continuar fora desta CP.
- O footer sticky melhora acesso às ações, mas deve ser observado em conteúdos extremos com histórico muito longo.

## 10. Próximo CP recomendado

Retomar a CP-G/continuação de copy e microtextos depois da correção visual do overlay, ou abrir CP dedicada para transformar detalhe muito denso em rota/página se a operação em campo continuar exigindo mais espaço.
