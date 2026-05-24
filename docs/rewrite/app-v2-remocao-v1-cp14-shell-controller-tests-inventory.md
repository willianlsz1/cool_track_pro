# app-v2 - Remocao v1 CP-14 - Inventario de testes do shell/controller legado

## 1. Objetivo

Classificar os testes que ainda prendem `src/ui/shell/**` e
`src/ui/controller/**` antes de qualquer remocao de runtime v1.

Este checkpoint e documental. Ele nao remove testes nem codigo.

## 2. Estado verificado

- Branch: `codex/remove-v1-dashboard-last-service-react-cp3f`.
- HEAD inicial: `07ddcd0510ae3356031bf8551d3009b0a3b3e9b5`.
- `src/app-v2`, `index.html` e `vite.config.js` estao protegidos pelo contrato
  do CP-13 contra referencias a `src/ui/shell` e `src/ui/controller`.
- O acoplamento restante esta concentrado em testes legados e documentos.

Comando base:

```bash
rg "ui/shell|ui/controller" src\__tests__ -l
```

Resultado: 67 arquivos de teste ainda referenciam `ui/shell` ou
`ui/controller`.

## 3. Contagem por superficie

| Superficie                                    | Arquivos de teste |
| --------------------------------------------- | ----------------- |
| `ui/shell/templates/views`                    | 28                |
| `ui/controller/handlers/reportExportHandlers` | 28                |
| `ui/controller/handlers/registroHandlers`     | 13                |
| `ui/shell/navigationMode`                     | 11                |
| `ui/controller/routes`                        | 9                 |
| `ui/controller/handlers/navigationHandlers`   | 8                 |
| `ui/controller/handlers/equipmentHandlers`    | 5                 |
| `ui/shell/templates/modals`                   | 3                 |
| `ui/shell/templates/header`                   | 2                 |
| `ui/shell.js`                                 | 2                 |
| `ui/controller/serviceRegistrationEntry`      | 2                 |
| `ui/controller.js`                            | 1                 |

## 4. Classificacao por destino

### 4.1 Aposentar junto com shell/router v1

Esses testes verificam montagem, template ou navegacao do shell legado. Devem
ser removidos somente no mesmo checkpoint que remover o runtime correspondente.

- `src/__tests__/shell.test.js`
- `src/__tests__/navigationMode.test.js`
- `src/__tests__/controller.init.test.js`
- `src/__tests__/contracts/routes.test.js`
- `src/__tests__/clientesRouteAccess.test.js`
- `src/__tests__/equipamentosRouteLifecycle.test.js`
- `src/__tests__/registroRouteLifecycle.test.js`
- `src/__tests__/globalHeaderContracts.test.js`
- `src/__tests__/a11y/views.test.js`
- `src/__tests__/equipmentDetailOverlayShell.test.js`
- `src/__tests__/equipamentosCpIAssets.test.js`

Controle: antes de remover, confirmar que app-v2 possui smoke equivalente para
entrada principal, navegacao primaria e estados visuais necessarios.

### 4.2 Migrar para app-v2 ou para contrato puro antes de aposentar

Esses testes protegem comportamento operacional que ainda pode importar como
referencia de paridade, mas nao deve continuar preso ao shell v1.

- Dashboard legado:
  - `dashboardLegacyHero.test.js`
  - `dashboardLegacyKpis.test.js`
  - `dashboardLegacyLastService.test.js`
  - `dashboardLegacyMonth.test.js`
  - `dashboardLegacyNextAction.test.js`
  - `dashboardLegacyOnboardingEmptyOverflow.test.js`
  - `dashboardLegacyProDraftContracts.test.js`
  - `dashboardLegacyReadOnlyBlocks.test.js`
  - `dashboardLegacyChartsContracts.test.js`
- Equipamentos legado:
  - `equipamentosLegacyHeaderHandlers.test.js`
  - `equipamentosLegacyPhotosNameplatePaywall.test.js`
  - `equipamentosLegacySetorDetailHandlers.test.js`
- Historico/registro DOM:
  - `historicoFilters.contract.test.js`
  - `historicoFiltersLegacyRender.test.js`
  - `historicoFiltersSheetIntegration.test.js`
  - `historicoRegistroIntegration.contract.test.js`
  - `registroChecklistHandlers.test.js`
  - `registroChecklistPmoc.contract.test.js`
  - `registroClientFork.test.js`
  - `registroLegacyChecklistRender.test.js`
  - `registroLegacyFieldHandlers.test.js`
  - `registroLegacyHeaderRender.test.js`
  - `registroLegacyPhotosRender.test.js`
  - `registroLegacySignatureRender.test.js`
  - `registroLifecycle.contract.test.js`
  - `registroMateriaisToggle.test.js`
  - `registroPostSaveLegacyFlow.test.js`
  - `registroProximaPreventivaPrompt.test.js`
  - `registroSaveSignatureHandlers.test.js`
  - `registroSignatureLegacyHandlers.test.jsx`

Controle: migrar somente o comportamento ainda relevante para app-v2 ou helper
puro. Nao manter snapshot DOM do v1 como contrato futuro.

### 4.3 Manter para etapa sensivel dedicada

Esses testes cruzam PDF/share, WhatsApp, assinatura, relatorio, PMOC ou fluxos
criticos. Nao devem ser removidos junto com shell/controller.

- `src/__tests__/criticalFlow.contract.test.js`
- `src/__tests__/historicoPdfWhatsappIntegration.contract.test.js`
- `src/__tests__/registroPdfWhatsappLegacyContracts.test.js`
- `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`
- `src/__tests__/relatorioCardsLegacyHandlers.test.js`
- `src/__tests__/relatorioCompanyPmocContracts.test.js`
- `src/__tests__/relatorioExportPmocLegacyHandlers.test.js`
- `src/__tests__/relatorioLegacyCards.test.js`
- `src/__tests__/relatorioLegacyControls.test.js`
- `src/__tests__/relatorioNavigationLegacyContracts.test.js`
- `src/__tests__/reportExportContracts.test.js`
- `src/__tests__/reportExportHandlers.test.js`
- regressions ligadas a save/relatorio:
  - `regressions/clear-registro-edit-state.test.js`
  - `regressions/edit-preserves-photos.test.js`
  - `regressions/photo-failure-path.test.js`
- exploratorios de payload que ainda mocam report export:
  - `exploratory/photo-base64-payload.test.js`
  - `exploratory/signature-payload.test.js`

Controle: tratar em CP especifico de PDF/share/WhatsApp ou Registro
sensivel, com plano proprio.

### 4.4 Contratos de transicao que devem continuar por enquanto

Esses testes nao sao alvo de remocao imediata porque registram a propria
sequencia de limpeza ou impedem regressao durante a transicao:

- `src/__tests__/legacyV1RemovalContracts.test.js`
- `src/__tests__/reactCleanupContracts.test.js`
- `src/__tests__/billingPricingCleanupContracts.test.js`
- `src/__tests__/contracts/registroSelectors.test.js`
- `src/__tests__/reportExportHelpers.test.js`
- `src/__tests__/serviceRegistrationEntry.test.js`
- `src/__tests__/historicoCardActions.contract.test.js`
- `src/__tests__/equipamentos.ownership.test.js`
- `src/__tests__/contextualOnboardingHandlers.test.js`

## 5. Ordem recomendada

### CP-15 - Shell/router test retirement plan executable

Criar uma lista executavel dos testes que podem ser aposentados junto com
shell/router e bloquear que sejam removidos sem teste app-v2 equivalente.

Nao remover codigo ainda.

### CP-16 - Primeiro lote real de aposentadoria

Remover somente testes puramente shell/router depois de confirmar:

- app-v2 primary entrypoint smoke cobre entrada principal;
- app-v2 shell tests cobrem navegacao primaria;
- nenhum teste sensivel de PDF/share, WhatsApp, Registro, PMOC ou storage entra
  no lote.

### CP-17+ - Runtime correspondente

Somente apos CP-16, remover o runtime shell/controller que ficou sem cobertura
necessaria, em lotes pequenos.

## 6. Riscos

| Risco                                             | Controle                                          |
| ------------------------------------------------- | ------------------------------------------------- |
| Remover teste que ainda protege regra operacional | Migrar para app-v2/helper puro antes de aposentar |
| Misturar shell/router com PDF/share               | Manter CP sensivel separado                       |
| Remover cobertura de navegacao antes do app-v2    | Exigir smoke/app-v2 shell tests equivalentes      |
| Deixar contrato v1 virar requisito futuro         | Classificar como referencia, nao como design v2   |

## 7. Validacao esperada

Como este CP e documental:

```bash
npm run format:check
git diff --check
git diff --cached --check
```
