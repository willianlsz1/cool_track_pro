# Mudanca 13 / CP-Q - Mapeamento do acoplamento domain/pdf -> UI assinatura

## 1. Base

- Branch: `main`
- HEAD: `4cb23a4dea6ec2558ac7e95b61a029a5b4ad8a9b`
- Data: 2026-05-09
- Arquivos analisados:
  - `src/domain/pdf.js`
  - `src/domain/pdf/sections/signatures.js`
  - `src/domain/pdf/sections/signatureHelpers.js`
  - `src/ui/components/signature.js`
  - `src/ui/components/signature/signature-storage.js`
  - `src/core/signatureStorage.js`
  - `src/__tests__/pdfSignature.helpers.test.js`
  - `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js`
  - `src/__tests__/signatureResolver.test.js`
  - `src/__tests__/reportExportContracts.test.js`
- LOC dos arquivos principais:
  - `src/domain/pdf.js`: 176
  - `src/domain/pdf/sections/signatures.js`: 277
  - `src/domain/pdf/sections/signatureHelpers.js`: 34
  - `src/ui/components/signature.js`: 12
  - `src/ui/components/signature/signature-storage.js`: 205

## 2. Objetivo

Mapear em modo read-only o acoplamento atual entre `domain/pdf.js` e `ui/components/signature.js`, identificando o fluxo real de resolucao de assinatura no PDF, riscos e um proximo corte seguro para desacoplar sem mudar comportamento.

## 3. Acoplamentos atuais

| Acoplamento                                      | Origem                                                       | Destino                                                                  | Evidencia                                                                                             | Side effects                                                                              | Risco                                                                 | Tratamento sugerido                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `domain/pdf.js` importa barrel de UI             | `src/domain/pdf.js`                                          | `src/ui/components/signature.js`                                         | `import { resolveSignatureForRecord } from '../ui/components/signature.js'`                           | Puxa modulo de UI para camada domain                                                      | Viola regra de camadas e aparece no lint como `no-restricted-imports` | CP-R com DI do resolver em `generateMaintenanceReport` mantendo default atual           |
| `domain/pdf.js` usa resolver async de assinatura | `resolvePdfSignatureDataUrls`                                | `resolveSignatureForRecord(registro)`                                    | Pre-resolve assinaturas para `Map` antes de `drawSignaturePages`                                      | Pode acessar fetch, localStorage, Supabase e migracao legacy via resolver                 | PDF passa a depender de infraestrutura/UI para renderizar assinatura  | Introduzir dependencia explicita `signatureResolver` no contexto do PDF                 |
| Resolver UI acessa storage/cache/core            | `src/ui/components/signature/signature-storage.js`           | `src/core/signatureStorage.js`, Supabase, localStorage, FileReader/fetch | `getSignatureSignedUrl`, `normalizeSignatureEntry`, `uploadSignatureDataUrl`, `getSignatureForRecord` | Fetch signed URL, cache local, migracao fire-and-forget, update em `registros.assinatura` | Alterar local errado pode quebrar preview, PDF e migracao on-demand   | Manter implementation intacta no CP-R; apenas inverter dependencia no PDF               |
| Barrel UI mistura modal e storage                | `src/ui/components/signature.js`                             | `signature-modal`, `signature-viewer-modal`, `signature-storage`         | Re-exporta modais e resolver/storage                                                                  | Import do PDF no barrel pode carregar superficie de UI desnecessaria                      | Maior acoplamento e risco de ciclo futuro                             | PDF deve receber resolver por parametro ou importar facade domain/core, nao o barrel UI |
| `signatures.js` usa helper puro                  | `src/domain/pdf/sections/signatures.js`                      | `src/domain/pdf/sections/signatureHelpers.js`                            | `buildSignatureRecordModel` importado no CP-P                                                         | Nenhum side effect no helper                                                              | Baixo; helper depende de callbacks para assinatura                    | Preservar como esta                                                                     |
| `signatureHelpers.js` usa callbacks injetados    | `src/domain/pdf/sections/signatureHelpers.js`                | callbacks `getSignatureForRecord`, `getSignatureImagePayload`            | Teste `pdfSignature.helpers.test.js` cobre ausencia de imports proibidos                              | Nenhum, so modelagem                                                                      | Baixo; contrato depende dos callbacks manterem shape                  | Manter DI simples                                                                       |
| Contrato CP-H cobre fallback                     | `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js` | PDFGenerator + mock de resolver UI                                       | Mock em `../ui/components/signature.js`; cobre sucesso e erro                                         | Teste valida fallback sem derrubar PDF                                                    | Bom contrato, mas ainda referencia acoplamento atual                  | Atualizar/estender no CP-R para cobrir DI                                               |
| Contrato CP-B registra baseline                  | `src/__tests__/reportExportContracts.test.js`                | source check de `domain/pdf.js`                                          | Espera `../ui/components/signature.js`                                                                | Nenhum em runtime                                                                         | Esse contrato devera mudar quando o desacoplamento ocorrer            | No CP-R, alterar contrato para travar ausencia do import UI                             |
| Possivel ciclo futuro                            | `domain/pdf.js` -> UI barrel -> modais/storage               | UI ja importa core e pode crescer para views/handlers                    | Evidencia no barrel de `signature.js`                                                                 | Carregamento de UI em domain                                                              | Medio: build/chunk e camada podem piorar                              | Desacoplar antes de novos splits                                                        |

## 4. Fluxo real da assinatura no PDF

| Ordem | Bloco assinatura PDF                                       | Responsabilidade                                                    | Dependencias                                | Side effects                                                          | Risco                                                                |
| ----: | ---------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
|     1 | `PDFGenerator.generateMaintenanceReport(options, context)` | Entrada publica do gerador                                          | `options`, `context`, `getState`, `Profile` | Catch retorna `null` em falha                                         | Mudanca de assinatura publica quebraria handlers                     |
|     2 | `buildPdfGenerationContext`                                | Le estado, filtros, profile e plano                                 | `getState`, `Profile.get`                   | Le state/profile                                                      | Registro filtrado errado afeta assinatura                            |
|     3 | `buildPdfDocumentModel`                                    | Aplica filtros e `registroId`                                       | `generatorHelpers`, `reportModel`           | Nenhum esperado                                                       | Assinatura de registro errado se filtro quebrar                      |
|     4 | `renderPdfServicesSection`                                 | Renderiza servicos e fotos antes das assinaturas                    | `drawServices`                              | Muta `doc`                                                            | Ordem visual precisa ser preservada                                  |
|     5 | `resolvePdfSignatureDataUrls(filtered)`                    | Resolve assinatura de cada registro filtrado                        | `resolveSignatureForRecord` importado da UI | Fetch/localStorage/Supabase/migracao podem ocorrer dentro do resolver | Acoplamento de camada e side effects silenciosos                     |
|     6 | Catch por registro no resolver                             | Tratar erro como ausencia                                           | `try/catch` local                           | Falha silenciosa                                                      | Bug real pode virar assinatura ausente sem alerta                    |
|     7 | `getSignatureSync`                                         | Adaptar `Map` async para callback sync                              | `signatureDataUrls`                         | Nenhum                                                                | Callback precisa continuar retornando `null` quando ausente          |
|     8 | `drawSignaturePages`                                       | Orquestrar paginas de comprovante                                   | `signatures.js`, `getSignatureSync`         | Muta `doc`, adiciona paginas                                          | Layout/regressao visual                                              |
|     9 | `getSignedRecords`                                         | Filtrar registros com `registro.assinatura` ou assinatura resolvida | `registro.assinatura`, callback sync        | Nenhum                                                                | Registro com flag true e resolver nulo ainda entra e mostra fallback |
|    10 | `buildSignatureRecordModel`                                | Montar model de registro/equipamento/status/payload                 | `signatureHelpers.js`, callbacks            | Nenhum                                                                | Baixo; coberto por teste CP-P                                        |
|    11 | `drawSignatureImage`                                       | Renderizar imagem ou fallback visual                                | `getSignatureImagePayload`, `doc.addImage`  | Pode logar erro e desenhar fallback                                   | Payload invalido nao deve derrubar PDF                               |
|    12 | `finalizePdfDocument`                                      | Retornar blob ou salvar arquivo                                     | `doc.output`, `doc.save`                    | Blob/download                                                         | Contratos PDF/WhatsApp dependem do blob                              |

## 5. Testes existentes e lacunas

| Teste                                                        | O que cobre                                                                                                             | Lacuna                                                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js` | PDFGenerator chama resolver de assinatura, preserva `registroId`, renderiza assinatura e fallback quando resolver falha | Mock ainda mira `../ui/components/signature.js`; precisara evoluir quando houver DI |
| `src/__tests__/signatureResolver.test.js`                    | Resolver retorna dataUrl legacy, cache local, reference remoto, migracao on-demand e dedup                              | Testa resolver no modulo UI, nao uma facade domain/core                             |
| `src/__tests__/reportExportContracts.test.js`                | Documenta baseline de import UI no PDF e consumo de assinatura                                                          | Atualmente espera o acoplamento; no CP-R deve inverter para proibir esse import     |
| `src/__tests__/pdfSignature.helpers.test.js`                 | Helper puro de modelagem nao importa render/UI/resolver                                                                 | Nao cobre `resolvePdfSignatureDataUrls` porque ele ainda fica em `pdf.js`           |
| `src/__tests__/pdfGenerator.registroId.test.js`              | Filtro `registroId` no PDF                                                                                              | Nao foca assinatura, mas protege registro alvo                                      |

Lacunas criticas antes de editar: contrato explicito para novo caminho de DI, garantia de default backward-compatible quando nenhum resolver for passado, e contrato source-level removendo `domain/pdf.js -> ui/components/signature.js`.

## 6. Opcoes de desacoplamento

| Opcao                                                        | Como funcionaria                                                                                                                             | Beneficio                                                      | Risco                                                                                                     | Pre-requisitos                                 | Recomendacao                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Manter baseline e documentar                                 | Nao alterar codigo, aceitar import UI                                                                                                        | Zero risco imediato                                            | Mantem violacao de camada e warning                                                                       | Nenhum                                         | Nao recomendado apos CP-Q                           |
| Criar adapter/DI em `domain/pdf.js` para resolver assinatura | `generateMaintenanceReport` recebe resolver no `context`; default preserva resolver atual ate proximo corte ou usa callback vindo do handler | Menor diff, preserva comportamento e permite teste de contrato | Se default continuar importando UI, desacopla parcialmente; se remover default, handlers precisam injetar | Contrato para default e para resolver injetado | **Recomendado para CP-R**                           |
| Mover resolver puro para `domain/pdf/signatureResolver.js`   | Extrair parte de resolucao para modulo domain                                                                                                | Remove import UI do PDF                                        | Resolver atual usa Supabase/localStorage/fetch e migracao; nao e puro                                     | Mapear storage e separar side effects          | Nao recomendado agora                               |
| Criar facade em domain para assinatura PDF                   | Novo modulo domain recebe funcoes de storage/core e expoe resolver especifico do PDF                                                         | Caminho limpo de arquitetura                                   | Pode virar copia do resolver UI e ampliar escopo                                                          | Contratos de storage e migracao                | Candidato posterior, nao CP-R                       |
| Injetar resolver a partir de `reportExportHandlers`          | Handler importa/fornece resolver ao PDF via `context`                                                                                        | Remove import UI do domain no fluxo principal                  | Toca handler e fluxo export; precisa preservar PMOC/preview/quota                                         | Contrato PDF/export atualizado                 | Possivel, mas CP-R deve avaliar diff minimo         |
| Desacoplar `ui/components/signature.js` em CP separado       | Separar barrel UI de storage/resolver                                                                                                        | Reduz superficie de import                                     | Pode tocar Registro/Historico/Relatorio                                                                   | Mapeamento dos consumidores UI                 | Melhor depois da DI do PDF                          |
| Adiar para proxima mudanca                                   | Fazer stability checkpoint antes                                                                                                             | Baixo risco agora                                              | Mantem divida e warning                                                                                   | Nenhum                                         | Nao necessario; ha 90% de confianca para DI pequena |

## 7. Riscos principais

- Import circular: baixo hoje, mas cresce porque `domain/pdf.js` importa barrel de UI que tambem reexporta modais.
- Fallback silencioso: `resolvePdfSignatureDataUrls` suprime erro por registro e trata como ausencia.
- Storage/assinatura: resolver atual pode usar signed URL, fetch, localStorage, Supabase e migracao fire-and-forget.
- Assinatura ausente/invalida: precisa continuar renderizando fallback sem quebrar o PDF.
- PDF quebrado: qualquer mudanca em `drawSignaturePages` ou `drawSignatureImage` afeta layout e comprovantes.
- Regressao de layout: CP-Q nao deve alterar render; CP-R tambem deve evitar mexer em `signatures.js`.
- DI excessiva: injetar muitas dependencias no helper visual pioraria legibilidade; preferir um unico resolver.
- Camada domain importando UI: risco arquitetural atual e warning de lint existente.

## 8. Recomendacao final

Proximo CP recomendado: **CP-R - desacoplar signature UI import com DI**.

Justificativa: ha confianca suficiente para um corte pequeno que mantenha `drawSignaturePages` e o resolver atual intactos, mas mude `domain/pdf.js` para receber um resolver explicitamente pelo contexto do gerador. O CP-R deve incluir contrato para o resolver injetado e atualizar o contrato source-level para garantir que `domain/pdf.js` nao importe mais `../ui/components/signature.js`.
