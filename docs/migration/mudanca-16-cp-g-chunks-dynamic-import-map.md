# Mudanca 16 / CP-G - Mapeamento chunks e dynamic imports

## 1. Base

- Branch: `main`
- HEAD: `1449e45d5847520a0c6d64dfcfb7662316158651`
- Data: 2026-05-09
- Comandos rodados:
  - `npm run check`
  - `npm run build`
  - listagem de `dist/assets` por tamanho
  - buscas por `import(`, bridges React, entrypoints e imports estaticos suspeitos
- Estado do build/check:
  - `npm run check` passou;
  - ESLint manteve 1 warning conhecido em `src/domain/pdf/shareReport.js`;
  - `npm run build` passou;
  - Vite manteve warnings de dynamic/static import e chunks acima de 500 kB.

## 2. Objetivo

Mapear, sem alterar codigo, os warnings Vite de modulos importados dinamica e estaticamente, os chunks grandes gerados no build e os fluxos que provavelmente causam perda de efetividade do code splitting.

## 3. Warnings Vite atuais

| Warning Vite                    | Arquivo/modulo                                    | Tipo                  | Causa provavel                                                                                     | Impacto                                           | Risco |
| ------------------------------- | ------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----- |
| Dynamic import nao separa chunk | `src/core/utils.js`                               | static + dynamic      | Helper core usado por quase todo app e tambem carregado dinamicamente em `equipmentHandlers.js`    | Lazy import sem efeito para `utils`               | Medio |
| Dynamic import nao separa chunk | `src/core/supabase.js`                            | static + dynamic      | Supabase e usado no bootstrap/storage e tambem em handlers/navigation/equipamentos                 | Cliente remoto fica no grafo principal            | Alto  |
| Dynamic import nao separa chunk | `src/core/storage.js`                             | static + dynamic      | Storage central entra no bootstrap/state e tambem no online status                                 | Cache/storage fica preso no bundle principal      | Alto  |
| Dynamic import nao separa chunk | `src/core/state.js`                               | static + dynamic      | State global usado em views/domains e carregado dinamicamente por handlers                         | Separacao por rota nao acontece para state        | Alto  |
| Dynamic import nao separa chunk | `src/core/modal.js`                               | static + dynamic      | Modal e infraestrutura transversal; varios handlers tentam lazy load                               | Modal segue no grafo inicial                      | Medio |
| Dynamic import nao separa chunk | `src/core/router.js`                              | static + dynamic      | Router e importado no bootstrap, componentes e handlers                                            | Lazy de navegacao nao reduz bundle                | Alto  |
| Dynamic import nao separa chunk | `src/core/auth.js`                                | static + dynamic      | Auth entra em app/authscreen/plano e em export/report                                              | Export/report nao isola auth                      | Alto  |
| Dynamic import nao separa chunk | `src/domain/maintenance.js`                       | static + dynamic      | Dominio usado por dashboards/equipamentos/relatorio e lazy em setores                              | Lazy em setores nao separa regras PMOC/manutencao | Medio |
| Dynamic import nao separa chunk | `src/features/profile.js`                         | static + dynamic      | Perfil usado por PDF/WhatsApp/onboarding/shell e lazy em PMOC export                               | Dados da empresa entram em varios fluxos          | Medio |
| Dynamic import nao separa chunk | `src/core/plans/subscriptionPlans.js`             | static + dynamic      | Plano usado no app, billing, PDF, equipamentos e export                                            | Gating/plano nao separa                           | Medio |
| Dynamic import nao separa chunk | `src/core/plans/planCache.js`                     | static + dynamic      | Cache de plano usado em app/shell/views e lazy em export PMOC                                      | Cache de plano segue inicial                      | Medio |
| Dynamic import nao separa chunk | `src/core/plans/monetization.js`                  | static + dynamic      | Billing usado em views e lazy em navigation/export/equipamentos                                    | Monetizacao contamina rotas                       | Alto  |
| Dynamic import nao separa chunk | `src/ui/views/dashboard.js`                       | static + dynamic      | Rota importa dashboard estatico e handlers/equipamentos importam dinamico                          | Rota dashboard nao e isolada                      | Medio |
| Dynamic import nao separa chunk | `src/ui/components/nameplateCapture.js`           | static + dynamic      | Equipamentos importa estatico e tambem carrega fluxo por lazy                                      | OCR/nameplate nao separa totalmente               | Medio |
| Dynamic import nao separa chunk | `src/ui/views/equipamentos/contextState.js`       | static + dynamic      | Contexto de equipamento usado por view/hero e handlers                                             | Contexto da rota fica no bundle principal         | Medio |
| Dynamic import nao separa chunk | `src/ui/views/equipamentos.js`                    | static + dynamic      | View e registrada estaticamente em rotas/helpers e carregada por handlers/historico                | Rota pesada nao separa                            | Alto  |
| Dynamic import nao separa chunk | `src/ui/components/signature.js`                  | static + dynamic      | Registro tenta lazy, mas historico/relatorio/reportExport importam estatico                        | Assinatura fica compartilhada no bundle principal | Alto  |
| Dynamic import nao separa chunk | `src/ui/views/historico.js`                       | static + dynamic      | Rota importa dinamico, mas handlers/theme/routes importam estatico                                 | Historico nao vira chunk isolado                  | Alto  |
| Dynamic import nao separa chunk | `src/core/usageLimits.js`                         | static + dynamic      | Quota usada por conta/report/equipamentos e lazy em navigation                                     | Quotas ficam no grafo inicial                     | Medio |
| Dynamic import nao separa chunk | `src/core/clientes.js`                            | static + dynamic      | Clientes usado por view/modal e lazy em handlers/export                                            | Cliente core nao separa                           | Medio |
| Dynamic import nao separa chunk | `src/ui/views/clientes.js`                        | static + dynamic      | View clientes e importada em rotas/handlers e lazy em handlers                                     | Rota clientes nao separa                          | Medio |
| Dynamic import nao separa chunk | `src/ui/controller/handlers/orcamentoHandlers.js` | static + dynamic      | Handler registrado no controller e lazy em modal de orcamento                                      | Orcamentos nao separa handler                     | Medio |
| Chunk grande                    | `dist/assets/vendor-pdf.*.js`                     | vendor chunk > 500 kB | `jspdf`, `html2canvas`, `canvg`, `svg-pathdata`, `stackblur`, `rgbcolor` agrupados em manualChunks | Download pesado quando PDF entra no grafo         | Alto  |
| Chunk grande                    | `dist/assets/index.*.js`                          | app chunk > 500 kB    | Views, handlers, storage, router, core e bridges ainda entram no entry principal                   | Carregamento inicial pesado                       | Alto  |
| Chunk grande                    | `dist/assets/index.*.css`                         | CSS > 500 kB          | CSS global acumulado                                                                               | CSS inicial pesado                                | Medio |

## 4. Top assets/chunks

| Chunk/asset                           | Tamanho bruto | Tipo      | Provavel origem                                        | Risco       | Observacao                                                |
| ------------------------------------- | ------------: | --------- | ------------------------------------------------------ | ----------- | --------------------------------------------------------- |
| `cooling-tech.Cw8VWBGU.png`           |   1,941,137 B | imagem    | asset visual grande                                    | Medio       | Maior asset bruto; nao e warning JS, mas afeta rede/cache |
| `index.ClzbFRc_.js`                   |     960,519 B | JS entry  | app principal, rotas, handlers e imports anulando lazy | Alto        | Acima de 500 kB minificado                                |
| `vendor-pdf.BULMqd7w.js`              |     776,011 B | JS vendor | PDF/html2canvas/canvg/jspdf                            | Alto        | Acima de 500 kB minificado                                |
| `index.DrBp-0zg.css`                  |     544,286 B | CSS       | CSS global/app                                         | Medio       | Acima de 500 kB                                           |
| `vendor-sentry.DmKQbHIp.js`           |     340,738 B | JS vendor | Sentry                                                 | Medio       | Separado por manualChunks                                 |
| `vendor-charts.CFNrZGOd.js`           |     207,438 B | JS vendor | Chart.js                                               | Baixo/medio | Separado por manualChunks                                 |
| `vendor-supabase.D3Pb_Qvf.js`         |     196,924 B | JS vendor | Supabase/Phoenix                                       | Medio       | Cliente remoto transversal                                |
| `ErrorBoundary.gN4ztuqt.js`           |     143,364 B | JS chunk  | React/error boundary/Sentry glue                       | Medio       | Pode ser puxado cedo por React                            |
| `landingIsland.BPcD6b-v.js`           |      81,807 B | JS island | landing React                                          | Baixo       | Chunk isolado                                             |
| `tailwind.CzoHfK92.css`               |      32,877 B | CSS       | Tailwind separado                                      | Baixo       | Pequeno                                                   |
| `pdf.BcjuirQP.js`                     |      28,999 B | JS app    | dominio PDF                                            | Medio       | Pequeno, mas aciona vendor-pdf                            |
| `pmocReport.Be5uxh65.js`              |      24,344 B | JS app    | relatorio PMOC                                         | Medio       | Fluxo de export                                           |
| `purify.es.B5CD4DQe.js`               |      22,896 B | JS vendor | DOMPurify                                              | Baixo       | Isolado                                                   |
| `clientesIsland.C9N_6z9V.js`          |      21,965 B | JS island | React clientes                                         | Baixo       | Chunk isolado                                             |
| `orcamentoSignaturePage.CsHb00vA.js`  |      15,795 B | JS app    | assinatura orcamento                                   | Baixo       | Lazy no app                                               |
| `relatorioCardsIsland.DK4WV880.js`    |      13,866 B | JS island | React relatorio cards                                  | Baixo       | Chunk isolado                                             |
| `relatorioControlsIsland.DeriQVWI.js` |      12,222 B | JS island | React relatorio controls                               | Baixo       | Chunk isolado                                             |
| `registroHeaderIsland.mLIYQ2aS.js`    |      12,144 B | JS island | React registro header                                  | Baixo       | Chunk isolado                                             |
| `historicoTimelineIsland.CRVv98-C.js` |      11,284 B | JS island | React timeline                                         | Baixo       | Chunk isolado                                             |
| `equipamentosListIsland.1ALdWmpP.js`  |      10,950 B | JS island | React lista equipamentos                               | Baixo       | Chunk isolado                                             |

## 5. Causas por fluxo

| Fluxo                 | Modulos envolvidos                                                                                  | Static import | Dynamic import | Causa provavel                                                                       | Tratamento sugerido                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------- | ------------- | -------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Registro              | `registro.js`, `signature.js`, `state.js`, `router.js`, `storage.js`                                | Sim           | Sim            | Adapter legado usa infraestrutura compartilhada e tenta lazy para assinatura         | Mapear assinatura primeiro; nao mexer sem contrato de assinatura/Registro          |
| Historico             | `historico.js`, `equipamentos.js`, `signature.js`, `planCache.js`                                   | Sim           | Sim            | Historico ainda e importado por rotas/helpers e chama equipamentos por fallback      | Corrigir static+dynamic de views por grupo, iniciando por imports mortos/indiretos |
| Relatorio/PDF         | `reportExportHandlers.js`, `pdf.js`, `shareReport.js`, `vendor-pdf`, `auth`, `planCache`, `profile` | Sim           | Sim            | Export tenta lazy, mas PDF/plano/perfil tambem entram estaticamente em outros fluxos | CP dedicado para PDF/share e quota antes de chunk manual                           |
| Equipamentos          | `equipamentos.js`, `contextState.js`, `nameplateCapture.js`, `modal.js`, `usageLimits.js`           | Sim           | Sim            | View grande e handlers compartilham modulos com imports mistos                       | Corrigir imports da view/handlers com contratos de equipamentos                    |
| Orcamentos            | `orcamentoHandlers.js`, `orcamentoModal.js`, `orcamentoPdf.js`                                      | Sim           | Sim            | Handler e registrado estaticamente e lazy no modal                                   | Separar handler leve de acoes pesadas em CP proprio                                |
| Clientes              | `clientes.js`, `clientes view`, `clienteModal`                                                      | Sim           | Sim            | Core e view usados por modal/handlers/export                                         | Mapear boundary clientes/core antes de alterar                                     |
| Dashboard             | `dashboard.js`, charts bridges, routes/theme helpers                                                | Sim           | Sim            | Rota importada estaticamente por registro de rotas e dinamicamente por handlers      | Corrigir rota dashboard depois de mapear routes/themeInit                          |
| Signature/photo/modal | `signature.js`, `photoStorage.js`, `modal.js`, `nameplateCapture.js`                                | Sim           | Sim            | Infra UI compartilhada e usada em fluxos Registro/Equipamentos/PDF                   | Priorizar remover lazy redundante ou centralizar chamada com contrato              |
| Bridges React         | `react/entrypoints/*`, `ui/views/*`, `ErrorBoundary`                                                | Sim parcial   | Sim            | Islands estao bem separadas, mas adapters legados ainda puxam core pesado            | Manter islands; tratar core/view imports antes de mexer em React                   |

## 6. Riscos principais

- Chunk inicial grande: `index.*.js` ficou em 960,519 B.
- Lazy import anulado por static import em 22 modulos.
- Duplicidade entry/lazy em rotas (`historico`, `equipamentos`, `clientes`, `dashboard`) e core (`state`, `router`, `storage`, `modal`).
- PDF/share pesado: `vendor-pdf.*.js` ficou em 776,011 B e qualquer acoplamento de PDF pode puxar custo alto.
- Registro/Historico/Equipamentos pesados: adapters grandes continuam como fonte de imports transversais.
- Bridges React: islands individuais estao pequenos, mas o entry principal segue grande por infraestrutura compartilhada.
- Impacto mobile: rede e parse inicial podem degradar, especialmente por `index.*.js`, `vendor-pdf.*.js`, CSS global e PNG grande.

## 7. Opcoes de proximo CP

| Opcao de proximo CP                             | Beneficio                               | Risco                                            | Pre-requisitos                                            | Recomendacao                         |
| ----------------------------------------------- | --------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- | ------------------------------------ |
| CP-H - corrigir static+dynamic import por grupo | Reduz warnings sem mexer no Vite config | Medio/alto se atacar views grandes               | Escolher 1 grupo pequeno e coberto por testes             | Recomendado                          |
| CP-H - separar chunk PDF/share                  | Pode reduzir custo de PDF no entry      | Alto por quota, share, fallback e onboarding     | Contratos PDF/WhatsApp/share e restricted import restante | Nao primeiro                         |
| CP-H - separar Registro/Historico islands       | Pode reduzir entry por rota             | Alto por adapters grandes e rotas                | Mapa de routes/themeInit e contratos recentes             | Nao primeiro                         |
| CP-H - manualChunks no Vite                     | Rapido para reduzir warning aparente    | Alto se esconder acoplamento real e piorar cache | Entender grafo e validar E2E mobile                       | Nao recomendado agora                |
| CP-H - zerar ultimo restricted import           | Remove warning ESLint final             | Medio/alto por efeito onboarding em PDF/share    | CP dedicado de inversion hook                             | Pode vir depois                      |
| CP-H - Playwright smoke flows                   | Aumenta confianca de cortes de chunk    | Baixo/medio                                      | Infra Playwright estavel                                  | Alternativa se quiser mais seguranca |
| CP-H - stability checkpoint                     | Consolida estado                        | Baixo                                            | Encerrar antes de mexer em build                          | Prematuro                            |

## 8. Recomendacao final

Recomendo **CP-H - corrigir static+dynamic import por grupo**.

Justificativa: o mapa mostra warnings em grupos bem definidos. O primeiro corte deve atacar um grupo pequeno e reversivel, provavelmente imports redundantes de core/view com contrato existente, antes de mexer em `manualChunks` ou PDF/share. Alterar `manualChunks` agora trataria o sintoma, mas nao o acoplamento que esta anulando lazy loading.
