# Plano acelerado de refatoracao do CSS legado

Data da analise: 2026-05-01.

## 1. Objetivo

A migracao visual principal React + Tailwind esta concluida, mas o CSS legado continua grande, principalmente `src/assets/styles/components.css` e seus parciais. A estrategia de remover microclasses com prova individual e segura, mas lenta demais para familias grandes como `dash-*`, `equip-*`, `rel-*`, `registro-*`, `hist-*`, `cli-*` e `orc-*`.

Este plano troca a limpeza classe por classe por uma estrategia acelerada baseada em design system minimo, substituicao visual por tela/bloco, congelamento do CSS legado e remocao de familias somente depois que os contratos visuais forem substituidos e validados.

Este documento nao autoriza remocao imediata de CSS.

## 2. Estrategia nova

Nao limpar classe por classe em familias grandes.

A nova estrategia e:

1. Congelar `components.css` como legado: novas UI React nao devem adicionar estilos nele.
2. Criar componentes base em `src/react/components/ui`, usando Tailwind `tw-` e preservando contratos publicos quando aplicados.
3. Aplicar os componentes em uma tela ou bloco por vez, com PRs pequenos.
4. Manter classes legadas temporariamente nos elementos migrados quando forem contrato publico ou ajudarem a evitar regressao visual.
5. Remover CSS legado apenas depois que a tela/bloco estiver usando os componentes novos, os testes passarem, o E2E passar, screenshots forem comparados e grep confirmar ausencia de uso real.

O ganho vem de substituir familias inteiras por primitives reutilizaveis, nao de perseguir seletores isolados em `components.css`.

## 3. Regra de congelamento de `components.css`

`src/assets/styles/components.css` deve ser tratado como arquivo congelado.

Status: congelamento formal aplicado em 2026-05-01. A politica esta documentada em `docs/migration/css-freeze-policy.md` e o topo de `src/assets/styles/components.css` sinaliza o arquivo como congelado.

Regra proposta:

- Nao adicionar nova classe visual em `components.css`.
- Nao mover CSS novo para `components.css`.
- Nao editar familias existentes salvo para:
  - corrigir bug de seguranca ou regressao visual comprovada;
  - remover CSS ja substituido por componente React/Tailwind;
  - adicionar comentario curto de congelamento, em PR proprio.
- Novos componentes React devem usar `tw-*` diretamente ou um componente compartilhado em `src/react/components/ui`.
- Classes legadas existentes podem continuar no DOM como contrato publico ate a remocao planejada.
- Parciais legados em `src/assets/styles/components/*` seguem a mesma regra quando forem de UI historica.

O primeiro PR desta nova fase deve documentar essa regra no proprio arquivo ou em um README de styles, sem alterar visual.

## 4. Design system minimo recomendado

Criar `src/react/components/ui` com primitives pequenas, sem acoplar regra de negocio, storage, router, backend, handlers globais ou modais reais.

Componentes recomendados:

| Componente   | Responsabilidade                                                                          | Substitui classes antigas                                                                        | Observacoes                                                                  |
| ------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `Button`     | Botao visual com variantes `primary`, `secondary`, `ghost`, `danger`, `icon`, `link`.     | `btn*`, `dash__hero-cta*`, `orc-btn*`, `rel-toolbar__btn*`, `empty-state__cta`, CTAs de cards.   | Deve repassar `data-action`, `data-nav`, `data-id` e `disabled`.             |
| `Card`       | Superficie padrao com variantes `default`, `interactive`, `section`, `metric`, `warning`. | `dash__card`, `orc-card`, `cli-card`, `equip-card`, `rel-record`, `alert-card`, `recent-card`.   | Deve aceitar `as`, `className` temporario e atributos `data-*`.              |
| `Input`      | Campo de texto/busca com label opcional, icone e estado de erro.                          | `search-bar*`, `cli-search*`, `equip-search-row`, `registro-field*`, `rel-input*`.               | Deve preservar ids publicos quando aplicado.                                 |
| `Select`     | Select visual com label/erro e opcao compacta.                                            | filtros `rel-*`, `hist-*`, `registro-*`, `equip-filter*`.                                        | Nao deve acessar dados globais.                                              |
| `Badge`      | Label pequeno para status, plano, contagem e chip simples.                                | `pro-badge`, `upgrade-*`, `dash__section-count`, `cli-kpi*`, `rel-chip*`, `hist-pill*`.          | Base para `StatusPill` e contadores.                                         |
| `StatusPill` | Status semantico com tons controlados.                                                    | `orc-status-pill`, `rel-status*`, `equip-card__status*`, `r-checklist__status*`, `hist-pill--*`. | Deve receber `tone`, `label` e `title`; sem montar classe dinamica insegura. |
| `EmptyState` | Estado vazio com titulo, descricao e CTA opcional.                                        | `empty-state*`, `dash__empty`, `rel-empty*`, vazios de Clientes/Alertas/Equipamentos.            | Primeiro candidato para reduzir duplicacao visual.                           |
| `PageHeader` | Hero/cabecalho de tela com titulo, resumo, meta e CTAs.                                   | `dash__hero*`, `equip-hero*`, `rel-hero*`, `registro-hero*`, headers de Clientes/Orcamentos.     | Deve ser flexivel, mas nao virar layout generico demais.                     |
| `FilterChip` | Chip removivel/ativo de filtro.                                                           | `rel-chip*`, `hist-chip*`, `equip-filter*`, `cli-filter*`.                                       | Deve repassar `data-action` e id do filtro.                                  |
| `ActionMenu` | Menu pequeno de acoes por card/lista.                                                     | `setor-card__menu`, `eq-detail-menu`, menus de Clientes/Orcamentos.                              | Comecar como visual controlado por props; handlers continuam externos.       |
| `ModalShell` | Estrutura visual de modal, sem regra de abertura/captura.                                 | modais `eq-*`, `setor-*`, PMOC, assinatura/viewer quando forem migrados visualmente.             | Deve ficar por ultimo; risco alto por foco, a11y e fluxos reais.             |

## 5. Ordem recomendada de criacao dos componentes

1. `Button` e `Badge`: menor risco, aparecem em quase todas as telas e permitem substituir CTAs/status sem mexer em layout complexo.
2. `StatusPill`: reduz variantes dinamicas de status em Orcamentos, Relatorio, Equipamentos, Registro e Historico.
3. `Card`: substitui superficies repetidas depois que `Button` e `Badge` estiverem estaveis.
4. `Input` e `Select`: atacam filtros/busca com contratos preservados.
5. `FilterChip`: remove duplicacao em Relatorio, Historico, Clientes e Equipamentos.
6. `EmptyState`: padroniza vazios e CTAs sem alterar fluxos.
7. `PageHeader`: aplica em headers ja migrados e reduz `hero*`.
8. `ActionMenu`: somente apos handlers de card/menu estarem protegidos.
9. `ModalShell`: ultimo, porque modais carregam foco, overlay, teclado, captura, storage e fluxos externos.

## 6. Ordem recomendada por tela

Ordem proposta:

1. Orcamentos.
2. Clientes.
3. Relatorio.
4. Dashboard.
5. Historico.
6. Registro.
7. Equipamentos.

Motivo: comecar pelas telas mais React e com menos fluxo externo pesado. Equipamentos fica por ultimo porque mistura lista React, header React, setores, detalhe, fotos, nameplate, paywall, CRUD e storage/backend legados.

## 7. Plano por tela

### 7.1 Orcamentos

Classes antigas mais importantes:

- `orc-card*`
- `orc-status-pill`
- `orc-modal*`
- classes de botoes/acoes de orcamento
- `btn*` compartilhado

Componentes novos que substituiriam:

- `Button`
- `Badge`
- `StatusPill`
- `Card`
- `ActionMenu` em uma segunda fase

Riscos:

- PDF, assinatura, WhatsApp, delete e modais continuam fluxos sensiveis.
- `ORCAMENTO_STATUS_META` ja controla status; nao duplicar fonte de verdade em CSS.
- Status visual deve continuar correto para `rascunho`, `enviado`, `visualizado`, `aprovado`, `recusado` e `expirado`.

Testes necessarios:

- Island de Orcamentos.
- Testes de view model/status.
- Testes de handlers de PDF/WhatsApp/assinatura/delete.
- E2E lifecycle.
- Screenshot antes/depois de cards e status principais.

CSS removivel depois:

- Subfamilias de `orc-card*` substituidas por `Card`.
- Regras de status antigas substituidas por `StatusPill`.
- Botoes especificos que passarem a usar `Button`.
- Nao remover modal/assinatura ate `ModalShell` existir e estar aplicado.

### 7.2 Clientes

Classes antigas mais importantes:

- `cli-*`
- cards/lista de cliente
- busca e filtros
- empty states
- acoes por cliente

Componentes novos que substituiriam:

- `Button`
- `Badge`
- `Card`
- `Input`
- `FilterChip`
- `EmptyState`

Riscos:

- `ClientesPage.jsx` esta perto do limite de 1000 linhas; aplicar primitives deve vir junto de extracao coesa, nao crescimento do arquivo.
- PMOC e modais de cliente ainda podem depender de contratos `data-cli-action`.
- Busca atual usa `#cli-search-input` como contrato publico.

Testes necessarios:

- `clientesReactIsland.test.jsx`.
- `clientesRouteAccess.test.js`.
- Testes de busca/filtros.
- E2E lifecycle.
- Screenshot lista vazia, lista com clientes e filtro ativo.

CSS removivel depois:

- `cli-card*` migrado para `Card`.
- `cli-search*` migrado para `Input`.
- `cli-filter*`/chips migrados para `FilterChip`.
- `empty-state*` usado apenas por Clientes se substituido por `EmptyState`.

### 7.3 Relatorio

Classes antigas mais importantes:

- `rel-hero*`
- `rel-chip*`
- `rel-record*`
- `rel-status*`
- `rel-toolbar__btn*`
- PMOC/quota/export

Componentes novos que substituiriam:

- `Button`
- `Badge`
- `StatusPill`
- `Card`
- `Input`
- `Select`
- `FilterChip`
- `PageHeader`

Riscos:

- PDF, WhatsApp, PMOC real, quota e assinatura continuam legados.
- `#rel-company-pmoc-slot` e contratos PMOC devem continuar fora do primeiro ciclo.
- Export dropdown nao deve ser reimplementado junto com primitives.

Testes necessarios:

- `relatorioHeroIsland.test.jsx`.
- `relatorioControlsIsland.test.jsx`.
- `relatorioCardsIsland.test.jsx`.
- Testes de PDF/WhatsApp/PMOC/quota.
- E2E lifecycle.
- Screenshot de controles e cards em modo compacto/detalhado.

CSS removivel depois:

- `rel-toolbar__btn*` substituido por `Button`.
- `rel-chip*` substituido por `FilterChip`.
- `rel-status*` substituido por `StatusPill`.
- Parte de `rel-record*` substituida por `Card`.

### 7.4 Dashboard

Classes antigas mais importantes:

- `dash__hero*`
- `dash__card*`
- `dash__section*`
- `dash__continue-card*`
- `alert-card`
- `critical-now-item`
- `recent-card`
- `chart*`

Componentes novos que substituiriam:

- `Button`
- `Badge`
- `Card`
- `StatusPill`
- `EmptyState`
- `PageHeader`

Riscos:

- Charts e header global seguem legados deliberados.
- Dashboard tem muitas ilhas; aplicar design system deve ser por bloco, nao em lote.
- Planos, onboarding e overflow tem contratos `data-action` sensiveis.

Testes necessarios:

- Islands de Dashboard ja existentes.
- `dashboardViewModel.test.js`, regras e premium.
- E2E lifecycle.
- Screenshot de Dashboard sem dados, com dados, Pro/Free, onboarding/overflow.

CSS removivel depois:

- Subfamilias `dash__card*` quando `Card` cobrir cards.
- `dash__section*` quando secoes forem padronizadas.
- `dash__hero*` depois de `PageHeader`.
- Nao remover `chart*` enquanto charts forem legado deliberado.

### 7.5 Historico

Classes antigas mais importantes:

- `hist-*`
- `timeline*`
- `hist-filters-sheet*`
- chips/filtros
- empty states

Componentes novos que substituiriam:

- `Button`
- `Badge`
- `StatusPill`
- `Card`
- `Input`
- `Select`
- `FilterChip`
- `EmptyState`

Riscos:

- Sheet mobile continua legado deliberado por overlay dinamico, `attachDialogA11y`, animacao e callbacks imperativos.
- Timeline usa modificadores dinamicos e dados de registro.
- Fotos, assinatura, delete, PDF e navegacao continuam legados.

Testes necessarios:

- `historicoFiltersIsland.test.jsx`.
- `historicoTimelineIsland.test.jsx`.
- Testes do sheet mobile.
- E2E lifecycle.
- Screenshot desktop/mobile com filtros ativos, timeline vazia e timeline com registros.

CSS removivel depois:

- Chips/filtros `hist-*` apos `FilterChip`, `Input` e `Select`.
- Empty states apos `EmptyState`.
- Nao remover `timeline*` sem screenshot/E2E especifico e prova de todos os estados.
- Nao remover `hist-filters-sheet*` enquanto o sheet for legado.

### 7.6 Registro

Classes antigas mais importantes:

- `registro-*`
- `r-checklist*`
- `photo-thumb*`
- `registro-sig-hint*`
- botoes/acoes de salvamento

Componentes novos que substituiriam:

- `Button`
- `Badge`
- `StatusPill`
- `Card`
- `Input`
- `Select`
- `EmptyState`

Riscos:

- Salvamento, edicao, PDF, WhatsApp, route guard, assinatura real, fotos/lightbox e persistencia continuam legados.
- Checklist tri-state preserva contratos `data-action`, `data-r-action`, `data-item`, `data-status`, `aria-pressed`.
- Fotos e assinatura tem validacao defensiva de URLs/data URI.

Testes necessarios:

- Islands de Registro.
- Testes de handlers de campos, checklist, fotos, assinatura, salvamento, PDF/WhatsApp.
- E2E lifecycle.
- E2E save e save-and-share com mocks.
- Screenshot de Registro novo, edicao, com fotos e assinatura.

CSS removivel depois:

- `registro-field*` depois de `Input`/`Select`.
- `r-checklist*` so depois de `StatusPill` e testes tri-state.
- `photo-thumb*` apenas se o bloco de fotos migrar visualmente para primitives.
- Botoes de salvamento so depois de `Button` sem tocar no fluxo legado.

### 7.7 Equipamentos

Classes antigas mais importantes:

- `equip-*`
- `setor-*`
- `eq-*`
- `equip-card*`
- `equip-search-row`
- `equip-filter*`
- classes de fotos/nameplate/paywall

Componentes novos que substituiriam:

- `Button`
- `Badge`
- `StatusPill`
- `Card`
- `Input`
- `Select`
- `FilterChip`
- `ActionMenu`
- `ModalShell` por ultimo

Riscos:

- Maior risco da lista: setores, detalhe/modal, fotos, CRUD, nameplate, plano/paywall e storage/backend continuam legados.
- `equip-card*` pode ser usado por lista React e render legado de setores/detalhe.
- `setor-*` e `eq-*` possuem estados dinamicos, menus e modais.

Testes necessarios:

- Islands de header/lista.
- Testes de render/handlers de setores/detalhe.
- Testes de fotos/nameplate/paywall.
- E2E lifecycle.
- E2E leve de fotos/nameplate/paywall com mocks.
- Screenshot de lista, contexto cliente/setor, detalhe, setor grid, modais e paywall.

CSS removivel depois:

- `equip-filter*` e `equip-search-row` depois de `Input`, `Select` e `FilterChip`.
- `equip-card*` apenas quando lista e card legado forem substituidos ou separados.
- `setor-*` e `eq-*` so depois de migrar visualmente setores/detalhe/modais.
- Classes de fotos/nameplate/paywall apenas apos hardening especifico.

## 8. Plano de PRs pequenos e reversiveis

### PR 1: Congelar `components.css` e documentar regra

Status: concluido em 2026-05-01.

Escopo:

- Adicionar comentario curto no topo de `components.css` ou criar `docs/migration/css-freeze-policy.md`.
- Referenciar este plano e `css-legacy-inventory.md`.
- Nao alterar nenhuma regra visual.

Validacao:

- `npm run format`
- `npm run check`
- `npm run test`
- `npm run build`

### PR 2: Criar `Button` e `Badge` sem aplicar

Escopo:

- Criar `src/react/components/ui/Button.jsx`.
- Criar `src/react/components/ui/Badge.jsx`.
- Criar `src/react/components/ui/index.js`.
- Criar testes unitarios de props, variantes, `data-*`, `disabled`, `aria-*` e `className`.
- Nao substituir uso em telas ainda.

Validacao:

- Testes novos.
- Checks completos.

### PR 3: Aplicar `Button`/`Badge` em Orcamentos

Escopo:

- Aplicar apenas em `OrcamentosPage.jsx`.
- Preservar `data-action`, `data-id`, `data-status`, `data-nav` e classes legadas quando ainda forem contrato.
- Nao alterar PDF, assinatura, WhatsApp, delete ou modal real.

Validacao:

- Testes de Orcamentos.
- E2E lifecycle.
- Screenshot de lista/cards/status.

### PR 4: Remover CSS antigo substituido de Orcamentos

Escopo:

- Rodar greps para classes de Orcamentos substituidas.
- Remover somente CSS que nao aparece fora de docs/provas.
- Preservar modal/assinatura/export se ainda nao migrados.

Validacao:

- Greps antes/depois.
- Screenshot antes/depois.
- Checks completos.

### PR 5: Repetir em Clientes

Escopo:

- Aplicar `Button`, `Badge`, `Input`, `FilterChip` e `EmptyState` em Clientes em fatias pequenas.
- Manter `#clientes-root` e `#cli-search-input`.
- Nao tocar PMOC/modais fora do necessario.

Validacao:

- `clientesReactIsland.test.jsx`.
- `clientesRouteAccess.test.js`.
- E2E lifecycle.
- Screenshot lista vazia, lista com clientes e busca.

### PRs seguintes

1. Relatorio: controles/chips/status com `Button`, `Badge`, `StatusPill`, `Input`, `Select`, `FilterChip`.
2. Dashboard: cards e secoes com `Card`, `Badge`, `Button`, `EmptyState`, sem tocar charts/header.
3. Historico: filtros/chips/empty; manter sheet mobile legado ate `ActionMenu`/`ModalShell` amadurecerem.
4. Registro: campos/CTAs/status de checklist; manter salvamento/PDF/WhatsApp/assinatura/fotos legados.
5. Equipamentos: header/lista primeiro; setores/detalhe/modais so depois de `ActionMenu` e `ModalShell`.

## 9. Criterios para remover CSS

Uma familia CSS so deve ser removida quando todos os criterios abaixo forem verdadeiros:

1. O componente/bloco visual foi substituido por componente React/Tailwind.
2. O PR de substituicao ja foi validado e integrado.
3. Teste unitario/island da tela passa.
4. Teste de adapter/handler passa quando houver contratos `data-*`.
5. E2E lifecycle passa.
6. Screenshot antes/depois foi comparado para a rota/bloco afetado.
7. `git grep` confirma ausencia de uso real fora de docs/provas.
8. Busca por geracao dinamica (`className`, `classList`, template strings e builders) nao encontra a familia.
9. O CSS a remover nao compartilha seletor composto com familia viva.
10. A remocao esta limitada a uma familia ou subfamilia pequena.

Se algum criterio falhar, a familia continua congelada.

## 10. Riscos e excecoes

Riscos principais:

- Remover classe que ainda e contrato visual de ilha React.
- Quebrar estado dinamico nao coberto por grep, como status, plano, quota, filtros ou modais.
- Alterar visual sem perceber porque `components.css` tem seletores compostos e media queries.
- Crescer arquivos React ja grandes, especialmente `ClientesPage.jsx`.
- Misturar refactor visual com fluxos externos como PDF, WhatsApp, assinatura, fotos, PMOC, storage/backend ou checkout.

Excecoes deliberadas:

- Header global pode continuar legado ate haver decisao propria.
- Charts do Dashboard seguem legado deliberado.
- Sheet mobile do Historico segue legado deliberado enquanto depender de overlay dinamico e callbacks imperativos.
- Modais reais, captura, upload, assinatura, PDF, WhatsApp, PMOC, paywall, storage/backend e checkout ficam fora dos primeiros PRs de design system.
- Classes legadas podem permanecer no DOM como contrato mesmo depois de um componente novo existir.

## 11. Proximo PR recomendado

Proximo PR recomendado: criar `Button` e `Badge` em `src/react/components/ui`, sem aplicar em telas ainda.

Escopo sugerido:

- Criar `src/react/components/ui/Button.jsx`.
- Criar `src/react/components/ui/Badge.jsx`.
- Criar `src/react/components/ui/index.js`.
- Cobrir props, variantes, `data-*`, `aria-*`, `disabled` e `className` em testes.
- Nao aplicar os componentes em telas.
- Nao remover CSS.
- Rodar `npm run format`, `npm run check`, `npm run test` e `npm run build`.

Depois disso, aplicar `Button`/`Badge` em Orcamentos em PR separado, preservando contratos e classes legadas enquanto ainda forem publicas.
