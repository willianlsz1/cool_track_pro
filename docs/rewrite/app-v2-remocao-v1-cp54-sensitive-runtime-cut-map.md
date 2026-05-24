# app-v2 - CP54 - Mapa de corte do runtime sensivel v1

## 1. Objetivo

Mapear a ordem segura para remover os fluxos sensiveis restantes do runtime v1
sem reutilizar seus arquivos no app-v2.

Este CP e documental. Ele nao remove codigo, nao altera contratos publicos, nao
ativa storage real, nao muda PDF/share, nao muda WhatsApp, nao muda PMOC e nao
altera billing.

## 2. Diagnostico atual

Depois do CP53, `src/ui/views/conta.js` nao existe mais. Os proximos candidatos
nao podem ser apagados em massa porque ainda existem cadeias legadas entre
views, handlers, modais, componentes e testes de contrato.

Achados relevantes:

- `src/ui/views/orcamentos.js` ainda e carregado por
  `src/ui/controller/handlers/orcamentoHandlers.js` e por
  `src/ui/components/orcamentoModal.js`.
- `src/ui/views/relatorio.js` ainda concentra contratos de filtros, cards,
  exportacao PDF, WhatsApp e PMOC documental.
- `src/ui/controller/handlers/reportExportHandlers.js` ainda atende
  `data-action="export-pdf"` e `data-action="whatsapp-export"` vindos de
  Relatorios e Historico.
- `src/ui/views/registro/save/reportShare.js` ainda cruza pos-salvamento com
  PDF/share por DI.
- `src/ui/views/registro/save/signature.js`, componentes de assinatura e
  storages de assinatura ainda pertencem ao fluxo v1.
- `src/ui/views/registro/save/photos.js`, componentes de fotos e storages de
  fotos ainda pertencem ao fluxo v1.
- PMOC ainda aparece em Relatorios, Registro, dominio PDF e componentes/modais
  legados.

## 3. Decisao

Nao remover um arquivo sensivel isolado quando ele for apenas um ponto de uma
cadeia ativa de testes legados. Primeiro deve-se cortar o consumidor da cadeia,
depois remover o suporte que ficou orfao.

O app-v2 nao deve importar ou adaptar esses arquivos. A recriacao futura deve
usar contratos app-v2-native, como ja definido no CP51.

## 4. Ordem recomendada de cortes

### CP54A - Orcamentos v1 real/local

Objetivo: aposentar a view e modal v1 de Orcamentos, mantendo o app-v2 em
`Servicos > Orcamentos`.

Arquivos provaveis:

- `src/ui/views/orcamentos.js`
- `src/ui/components/orcamentoModal.js`
- `src/ui/controller/handlers/orcamentoHandlers.js`
- `src/ui/viewModels/orcamentosViewModel.js`, se ficar sem consumidor runtime
- testes dedicados de `orcamentosView*` e contratos que importam a view v1
- gates de remocao em `legacyShellRetirementGate` e
  `legacyV1RemovalContracts`

Fora de escopo:

- `src/core/orcamentos.js`
- migrations de `orcamentos`
- token publico e assinatura real de orcamento
- PDF/share/WhatsApp

### CP54B - Relatorio view v1 sem PDF/share

Objetivo: remover a view DOM v1 de Relatorio e seus renderers, preservando
apenas cobertura app-v2 de relatorios locais.

Arquivos provaveis:

- `src/ui/views/relatorio.js`
- `src/ui/views/relatorio/cardsRenderer.js`
- `src/ui/views/relatorio/controlsRenderer.js`
- testes dedicados `relatorioLegacy*`, `relatorioView*` e contratos que
  importam diretamente a view v1

Fora de escopo:

- `src/domain/pdf/**`
- `src/ui/controller/handlers/reportExportHandlers.js`
- Historico com `export-pdf`/`whatsapp-export`
- PMOC real

### CP54C - PDF/share/WhatsApp v1

Objetivo: remover handlers e dominio de share legado que nao sejam usados pelo
app-v2.

Arquivos provaveis:

- `src/ui/controller/handlers/reportExportHandlers.js`
- `src/ui/components/pdfQuotaBadge.js`
- `src/ui/components/pdfSuccessToast.js`
- `src/ui/components/shareSuccessToast.js`
- `src/domain/pdf/shareReport.js` e helpers, se nao houver consumidor app-v2
- testes `reportExport*`, `shareReport*`, `registroPdfWhatsapp*` e
  `historicoPdfWhatsapp*` que existirem apenas para contratos v1

Fora de escopo:

- `vendor-pdf`
- `manualChunks`
- novo gerador app-v2
- WhatsApp real novo

### CP54D - Assinatura v1

Objetivo: remover UI e storage legado de assinatura.

Arquivos provaveis:

- `src/ui/components/signature.js`
- `src/ui/components/signature/**`
- `src/core/signatureStorage.js`
- `src/ui/views/registro/save/signature.js`
- `src/ui/views/registro/signatureHint.js`
- secoes de assinatura no PDF legado quando o CP54C ja tiver cortado PDF/share

Fora de escopo:

- componente app-v2 de assinatura
- upload real
- assinatura de orcamento publico

### CP54E - Fotos/anexos v1

Objetivo: remover UI, helpers e storage legado de fotos.

Arquivos provaveis:

- `src/ui/components/photos.js`
- `src/ui/components/equipmentPhotos.js`
- `src/ui/components/nameplateCapture.js`, se o fluxo de placa/foto v1 for
  aposentado junto
- `src/core/photoStorage.js`
- `src/core/blobQueue.js`, se ficar sem consumidor
- `src/ui/views/registro/save/photos.js`
- `src/ui/views/equipamentos/fotos.js`

Fora de escopo:

- anexos app-v2-native
- Supabase Storage
- upload real

### CP54F - PMOC v1

Objetivo: remover PMOC legado depois que Relatorio/PDF/share e Registro
sensivel estiverem cortados.

Arquivos provaveis:

- `src/ui/components/pmocModal.js`
- `src/ui/components/pmocInfoModal.js`
- `src/ui/components/clientePmocPanel.js`
- `src/core/pmocProgress.js`
- `src/core/clientePmoc.js`
- `src/domain/pmoc/**`
- `src/domain/pdf/pmoc/**`
- `src/ui/views/registro/checklist/pmocChecklist.js`

Fora de escopo:

- novo dominio PMOC app-v2-native
- relatorio PMOC novo
- schema real novo

## 5. Validacao por corte

Para cada CP de remocao:

```bash
rg -n "<arquivo-ou-export>" src index.html public e2e docs/rewrite
npm test -- <testes-focados> --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

Se o teste focado falhar por `spawn EPERM` local no Vitest/esbuild, registrar a
falha e usar `npm run check` como validacao ampla somente se ele executar a
suite e sair com codigo 0.

## 6. Proximo CP recomendado

Executar CP54A: remover Orcamentos v1 visual/modal/handler, porque o app-v2 ja
tem `Servicos > Orcamentos` local/mock e esse corte e menor que Relatorio,
PDF/share, assinatura, fotos e PMOC.

Antes de apagar, confirmar novamente os consumidores de:

```bash
rg -n "views/orcamentos|orcamentos\\.js|renderOrcamentos|orcamentoModal|orcamentoHandlers|ORCAMENTO_ACTIONS" src index.html public e2e
```
