# app-v2 - Remocao v1 CP-12 - Ordem de desmontagem de src/ui

## 1. Objetivo

Transformar o mapa bruto do CP-11 em uma ordem de execucao para desmontar
`src/ui` sem repetir os erros do v1: remocao em massa, mistura de areas
sensiveis, perda de cobertura e dependencias escondidas entre shell, views,
storage, PDF/share e autenticacao.

Este checkpoint e documental. Ele nao altera runtime.

## 2. Diagnostico

`src/ui` nao e mais dependencia direta do app-v2, mas ainda concentra o runtime
congelado do v1 e a maior parte da cobertura de regressao historica.

Estado usado como base:

- Branch: `codex/remove-v1-dashboard-last-service-react-cp3f`.
- HEAD inicial: `9cfaf46ea707e315dde985866388e4a944777c62`.
- `src/features/`: 0 arquivos.
- `src/ui/`: 178 arquivos.
- Testes ainda referenciam fortemente:
  - `ui/views`: 133 arquivos;
  - `ui/components`: 94 arquivos;
  - `ui/controller`: 43 arquivos;
  - `ui/shell`: 41 arquivos;
  - `ui/viewModels`: 40 arquivos.

## 3. Classificacao por destino

### 3.1 Aposentar junto com o runtime v1

Esses arquivos representam shell, roteamento, templates e adapters raiz do v1.
Nao devem ser extraidos como arquitetura nova do app-v2.

- `src/ui/controller.js`
- `src/ui/shell.js`
- `src/ui/controller/routes.js`
- `src/ui/controller/handlers/navigationHandlers.js`
- `src/ui/shell/**`
- adapters raiz em `src/ui/views/*.js`

Regra: remover somente quando a cobertura correspondente tiver sido aposentada
ou substituida por smoke/contrato app-v2 equivalente.

### 3.2 Extrair ou preservar apenas como regra pura

Esses arquivos podem conter regra operacional ainda util como referencia, mas
nao devem continuar presos a `src/ui` se forem usados no futuro.

- `src/ui/helpers/equipamentosPure.js`
- `src/ui/helpers/registroPure.js`
- `src/ui/viewModels/*ViewModel.js`
- `src/ui/viewModels/*Contracts.js`
- render models locais em `src/ui/views/*/**` quando nao dependerem de DOM,
  storage ou componente visual.

Regra: cada extracao precisa provar baixo acoplamento, teste focado e destino
claro em `src/domain`, `src/core` ou `src/app-v2`.

### 3.3 Etapas sensiveis dedicadas

Essas areas nao devem ser misturadas com limpeza de arquivos:

- PDF/share/WhatsApp:
  - `src/ui/controller/handlers/reportExportHandlers.js`;
  - `src/ui/components/pdfQuotaBadge.js`;
  - `src/ui/components/pdfSuccessToast.js`;
  - `src/ui/components/shareSuccessToast.js`;
  - views de `relatorio` e `historico`.
- Assinatura/fotos/upload local:
  - `src/ui/components/photos.js`;
  - `src/ui/components/signature.js`;
  - `src/ui/components/signature/**`;
  - `src/ui/views/registro/save/**`.
- Autenticacao/conta/dados do usuario:
  - `src/ui/components/authscreen.js`;
  - `src/ui/components/passwordRecoveryModal.js`;
  - `src/ui/components/accountModal.js`;
  - `src/ui/account/userData.js`;
  - `src/ui/controller/handlers/profileAccountHandlers.js`.
- Storage/equipamentos/PMOC/nameplate:
  - `src/ui/views/equipamentos/**`;
  - `src/ui/components/nameplateCapture.js`;
  - `src/ui/components/equipmentPhotos.js`;
  - `src/ui/components/pmocModal.js`;
  - `src/ui/components/pmocInfoModal.js`;
  - `src/ui/components/clientePmocPanel.js`.

Regra: cada area sensivel precisa de plano, testes focados e validacao completa.

### 3.4 Remover somente depois de provar obsolescencia

Componentes utilitarios de UI ainda aparecem em testes ou mocks do v1, mas
podem ser os primeiros candidatos de remocao depois que as views consumidoras
forem aposentadas.

- `src/ui/components/charts.js`
- `src/ui/components/emptyState.js`
- `src/ui/components/equipmentVisual.js`
- `src/ui/components/installAppPrompt.js`
- `src/ui/components/offlineBanner.js`
- `src/ui/components/overflowBanner.js`
- `src/ui/components/pushOptInCard.js`
- `src/ui/components/skeleton.js`
- `src/ui/components/tour.js`
- `src/ui/components/usageMeter.js`

Regra: nao remover isoladamente enquanto dashboard, equipamentos, historico,
registro ou seus testes ainda importarem/mocarem esses componentes.

## 4. Ordem recomendada de execucao

### CP-13 - Contrato de aposentadoria do shell v1

Objetivo: criar um contrato objetivo que confirme que `index.html`, app-v2 e
build principal nao dependem de `src/ui/controller.js`, `src/ui/shell.js` ou
`src/ui/shell/**`.

Escopo permitido:

- teste de contrato read-only;
- documento curto com criterio de remocao;
- sem deletar arquivos ainda.

### CP-14 - Aposentar testes v1 que nao protegem app-v2

Objetivo: separar testes que ainda protegem regra operacional de testes que
existem apenas para o shell v1 congelado.

Escopo permitido:

- inventario por arquivo de teste;
- marcar destino: migrar para app-v2, manter temporariamente ou remover junto
  com runtime v1;
- sem `test.skip`.

### CP-15 - Primeiro lote de remocao de shell/controller

Objetivo: remover somente arquivos de shell/controller provados fora do build
principal e fora de contratos ainda necessarios.

Escopo permitido:

- `src/ui/shell/**`;
- `src/ui/shell.js`;
- handlers de navegacao somente se rotas/testes correspondentes forem
  aposentados no mesmo checkpoint.

### CPs dedicados posteriores

Depois do shell:

1. Dashboard e componentes utilitarios.
2. Clientes/orcamentos se nao cruzarem storage sensivel.
3. Equipamentos e setores.
4. Registro, fotos e assinatura.
5. Historico, relatorio, PDF/share e WhatsApp.
6. Conta/auth/dados do usuario.
7. CSS legado restante.

## 5. Riscos e controles

| Risco                                   | Controle                                                     |
| --------------------------------------- | ------------------------------------------------------------ |
| Apagar teste que ainda cobre regra util | Classificar teste antes de remover                           |
| Misturar shell com PDF/share            | CP separado para PDF/share e WhatsApp                        |
| Quebrar autenticacao ou conta           | Manter auth/conta em etapa dedicada                          |
| Perder regra operacional do v1          | Extrair helper puro antes de apagar adapter DOM              |
| Criar app-v2 dependente de legado       | Validar que app-v2 continua importando apenas `src/app-v2/*` |

## 6. Validacao esperada

Para este checkpoint documental:

```bash
npm run format:check
git diff --check
git diff --cached --check
```

Para qualquer checkpoint com codigo:

```bash
npm run format
npm run build
npm run check
```

Adicionar testes focados conforme a area alterada.
