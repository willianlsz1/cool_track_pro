# Marco de estabilidade 100% - CoolTrackPro

## 1. Marco de estabilidade

Este documento registra o fechamento da fase de hardening pos-migracao React + Tailwind. A base atual atingiu o criterio interno de estabilidade 100% definido pelo time. Nenhuma nova feature deve ser implementada antes do planejamento explicito de proximo escopo.

A migracao visual principal foi fechada em `docs/migration/react-tailwind-final-status.md`. Este documento e o fechamento da fase seguinte: cobertura E2E, contratos DOM e estabilizacao de flakiness.

## 2. Data e branch analisada

- Data do fechamento: 2026-05-01.
- Branch: `main`.
- Status: trabalho de hardening pos-migracao concluido para a base atual.
- Working tree: arquivos novos do PR de Historico aparecem como `??` ate serem incluidos no fluxo de release; nao ha mudancas pendentes em codigo de producao.

Comandos usados para validar o estado:

```
git branch --show-current
git status --short
git grep -n -E "^(<<<<<<<|=======|>>>>>>>)($| )"
npm run format
npm run check
npm run test
npm run build
npm run test:e2e
git diff --check
```

## 3. Criterio interno de 100%

A barra de "100% estavel" e definida pelos itens abaixo. Todos foram atendidos para o escopo coberto.

1. Areas centrais do produto possuem ao menos um smoke E2E em `e2e/specs/*` validando contratos DOM, mount flags React e ausencia de `console.error`/`pageerror`.
2. Existe pelo menos um spec funcional aprofundado por area com side effects (PDF/WhatsApp/Storage) mockados, sem dependencias externas reais.
3. Spec integrado `core-flow-smoke` cobre o fluxo cliente -> equipamento -> registro -> relatorio em uma unica execucao.
4. Flakiness conhecida foi diagnosticada e corrigida com mudanca minima e local em specs (`body[data-route="inicio"]` antes de `goTo`).
5. `npm run check` e `npm run test:e2e` passam em multiplas execucoes consecutivas, sem retries de Playwright fora dos limites do `expect.timeout`.
6. Nenhum codigo de producao (JSX/React, handlers, rotas, view models, CSS, storage/backend) foi alterado para atingir o marco.

## 4. Cobertura E2E atual

Suite atual: 11 arquivos em `e2e/specs/`, 23 testes totais, executados em paralelo (8 workers) na ordem do file system. Tempo total medio entre 22s e 30s.

| Spec                                                   | Tipo                          | Tempo medio |
| ------------------------------------------------------ | ----------------------------- | ----------- |
| `navigation-and-modal.spec.js`                         | smoke navegacao + modal       | ~6s         |
| `react-islands-lifecycle.spec.js`                      | lifecycle ilhas React (12)    | ~8s/each    |
| `equipamentos-visual-smoke.spec.js`                    | smoke visual + ctx drill      | ~10s        |
| `equipamentos-legacy-photos-nameplate-paywall.spec.js` | funcional fotos/paywall (2)   | ~12s        |
| `orcamentos-visual-smoke.spec.js`                      | smoke visual (2)              | ~8s         |
| `core-flow-smoke.spec.js`                              | integrado cliente->relatorio  | ~12s        |
| `registro-visual-smoke.spec.js`                        | smoke visual                  | ~5s         |
| `registro-post-save.spec.js`                           | funcional save + toast (2)    | ~6s         |
| `relatorio-visual-smoke.spec.js`                       | smoke visual                  | ~3s         |
| `relatorio-export-pmoc.spec.js`                        | funcional dropdown/PDF/PMOC   | ~3s         |
| `historico-functional-smoke.spec.js`                   | funcional filtros/sheet/saved | ~13s        |

Padrao de fixture: `setupAuthedPage` em `e2e/fixtures/authedSession.js` injeta sessao Supabase fake, mocks REST/Auth e popula `remoteData` com cliente/setor/equipamento/registro minimos.

## 5. Areas cobertas

### Orcamentos

- `orcamentos-visual-smoke.spec.js` - estado vazio + lista com cards.
- Contratos: `#view-orcamentos`, `.orc-empty`, `.orc-card__numero`, `.orc-status-pill[data-status]`, `data-action` em `open-orcamento-modal`/`orc-share`/`orc-download`/`orc-mark-approved`, `data-mode="create"`, preservacao de `data-id`, filtros por status.

### Equipamentos

- `equipamentos-visual-smoke.spec.js` - hero, filtros, lista, drill cliente+setor com `data-setor-id`/`data-cliente-id`, `#equip-context-chip` populado, detalhe modal.
- `equipamentos-legacy-photos-nameplate-paywall.spec.js` - editor de fotos legado, nameplate analise mockada, paywall de fotos sem checkout real.
- `react-islands-lifecycle.spec.js` - header e lista flat sem duplicar React roots.

### Registro

- `registro-visual-smoke.spec.js` - roots, CTAs, contratos principais.
- `registro-post-save.spec.js` - dois testes: salva via `save-registro` com toast pos-save, e salva-e-compartilha via `save-and-share-registro` com WhatsApp mockado. Reforcado com assinatura DOM (`registro-sig-hint`, `[data-r-action]` defensivo, `signature-upsell-cta` defensivo) e a11y do toast (`role="status"`, `aria-live="polite"`, classes estruturais).
- `react-islands-lifecycle.spec.js` - header, checklist, photos e signature islands.

### Relatorio

- `relatorio-visual-smoke.spec.js` - hero, controles, cards/empty, PMOC slot.
- `relatorio-export-pmoc.spec.js` - funcional com mock de `reportExportHandlers.js`: dropdown abre/fecha alterando `aria-expanded` e `hidden`, PDF/WhatsApp/PMOC clicks registrados em `window.__relatorioExportPmocE2e`, quota slot defensivo (Pro = oculto).
- `react-islands-lifecycle.spec.js` - hero, controles e cards islands.

### Historico

- `react-islands-lifecycle.spec.js` - filtros e timeline islands com mount flags.
- `historico-functional-smoke.spec.js` - filtros (`data-period`, `data-tipo-id`, toggle `aria-pressed`), timeline (`data-reg-id`, `data-photo-url`, `data-equip-id`), saved-highlight via `sessionStorage["cooltrack-highlight-id"]`, sheet mobile (viewport 380x800) com `#hfs-setor`/`equip`/`close`/`reset`/`apply`. Inclui mock de `/storage/v1/**` para evitar upload real do data-URL de foto.

### core-flow integrado

- `core-flow-smoke.spec.js` - bootstrap Pro, navega `equipamentos -> registro -> relatorio`, valida mount flags em cada area, dispara `change` no `#r-equip` para destravar a ilha checklist, asserta `.rel-record[data-id]` ou `.rel-empty` no relatorio.

## 6. Workflow CSS legado

A limpeza CSS continua sob o workflow ja documentado:

- `docs/migration/css-cleanup-workflow.md` - politica e regra de prova antes de remocao.
- `scripts/css-proof.mjs` - automatiza coleta inicial de evidencias.
- `npm run css:proof -- <microfamilia> [termo-curto] [--force]` - roda o probe.

Provas concluidas vivem em `docs/migration/css-*-proof.md`. Microfamilias mortas ja removidas: `orc-timeline*`, `hist-plan-limit-banner*`, `.timeline__saved-badge`. O probe nao prova obsolescencia sozinho - revisao manual continua obrigatoria, e a regra "PR A: prova / PR B: remocao cirurgica" segue valida.

## 7. Warnings conhecidos e aceitos

Os warnings abaixo aparecem em `npm run check` e `npm run build`. Foram analisados, classificados como nao-bloqueantes para o marco e nao serao tratados antes do planejamento de proxima fase.

- **31 warnings ESLint pre-existentes**: `no-unused-vars` em modulos historicos (`src/app.js`, `src/core/storage.js`, `src/domain/pdf/*`) e 1 `no-restricted-imports` deliberado em `src/domain/pdf.js` (legado documentado em `docs/audits/product-review.md`).
- **Warnings Vite de imports dinamicos/estaticos mistos**: `equipamentos.js`, `contextState.js`, `signature.js`, `historico.js`, `usageLimits.js`, `clientes.js`, `orcamentos.js`, `orcamentoHandlers.js`. Sao consequencia esperada de modulos consumidos tanto via dynamic import (lazy chunks) quanto via static import (handlers globais). Resolvel-os exigiria mudar o desenho de imports do controller, fora de escopo de hardening.
- **Chunks grandes vendor-pdf/index**: `vendor-pdf.js` ~775kB, `index.js` ~891kB. Tamanho conhecido por jspdf + jspdf-autotable + Sentry no bundle. Code-split adicional ja foi avaliado no inventario de bundle (`docs/bundle-audit.md`); custo/beneficio nao justifica intervencao agora.

Warnings transitorios de E2E (instabilidade de ambiente, nao do app) sao tolerados conforme historico interno: failures de `goTo` antes de `body[data-route="inicio"]` foram estabilizadas; failures `ERR_NO_BUFFER_SPACE`/`ERR_CONNECTION_REFUSED` sob alta concorrencia paralela continuam possiveis em re-runs isolados.

## 8. Riscos remanescentes aceitos

Os fluxos abaixo NAO sao exercitados por E2E. Foram intencionalmente deixados fora do escopo deste marco. Cada um pode virar um PR dedicado no futuro.

- **PDF real**: nao gerado por nenhum spec. `exportPdfFlow` e mockado em `registro-post-save.spec.js` e `relatorio-export-pmoc.spec.js`. Nao ha cobertura E2E de rasterizacao real, watermark Free, header institucional ou conteudo do PDF.
- **WhatsApp real**: nenhum spec abre `wa.me` ou popup real. `shareWhatsAppFlow` e mockado e `popups` e asserted como `[]`. Validacao de URL formada com filtros corretos depende de testes unitarios.
- **Upload real de fotos**: nenhum spec faz upload para Supabase Storage. Storage e mockado via `page.route('**/storage/v1/**', ...)` em specs que tocam fotos. Falhas reais de quota/CORS/timeout no upload nao sao cobertas.
- **Assinatura real / canvas**: nenhum spec interage com o canvas de assinatura. Apenas hint/upsell DOM e validado defensivamente. Captura, persistencia, viewer modal e fluxo PDF com assinatura aplicada continuam cobertos apenas por testes unitarios.
- **PMOC modal real**: clicks em `[data-action="open-pmoc-modal"]` sao mockados em `relatorio-export-pmoc.spec.js` (record + no-op). Nao ha E2E que abre `pmocModal.js`, valida formulario, gera documento ou navega ao final.
- **Quota Free/Plus**: `relatorio-export-pmoc.spec.js` usa fixture Pro, onde `#pdf-quota-slot` fica vazio (Pro = ilimitado). Cobertura defensiva valida estrutura SE emitida; spec dedicado com fixture Plus/Free para validar label/tone do badge fica como gap conhecido.

## 9. Regra de avanco

A partir deste marco, congelamento de features para a base atual. O time aplica as regras abaixo:

1. **Apos 100% atingido, e permitido apenas planejar nova feature**. Discussoes de escopo, criterios de sucesso, dependencias e plano de testes podem comecar.
2. **Implementacao de qualquer feature nova exige**: plano escrito com escopo curto, lista de testes (unit + E2E quando aplicavel), criterio de aceite e PR proprio. Nao misturar feature com hardening, refactor ou cleanup CSS.
3. **Bug fixes criticos** continuam permitidos via PR cirurgico. Se o fix tocar codigo de producao, deve incluir teste de regressao na mesma PR.
4. **Refactors estruturais** ficam congelados ate o proximo planejamento explicito. Pequenas limpezas localizadas com prova continuam permitidas (ver workflow CSS).
5. **Riscos remanescentes** da secao 8 podem ser priorizados como PRs dedicados a qualquer momento; cada um abre seu proprio escopo.

## 10. Criterio para Ordem de Servico

Ordem de Servico foi citada nos handoffs como proximo modulo grande. A regra para iniciar:

1. **Apenas planejamento inicial e permitido agora**. Coletar requisitos, levantar dados, esbocar fluxo e estimar impacto sao atividades validas neste marco.
2. **Implementacao exige aprovacao explicita** depois do planejamento revisado. Nao iniciar codigo, JSX, handler, rota, view model, CSS, schema ou storage antes desta aprovacao.
3. **Pre-requisitos sugeridos antes de iniciar codigo**: PR de quota Free/Plus dedicado (item da secao 8), revisao do estado de `PostSaveRegistroCompletion` (componente parece orfao em producao - ver `docs/migration/css-cleanup-workflow.md` para protocolo de prova), e baseline de performance documentado.
4. **Quando a implementacao comecar**: respeitar a regra "uma coisa por PR" do handoff, escopo curto, validacoes obrigatorias e testes E2E proporcionais ao risco.

Este marco serve como ponto de referencia. Qualquer alteracao no codigo de producao da base atual deve respeitar as regras das secoes 9 e 10.
