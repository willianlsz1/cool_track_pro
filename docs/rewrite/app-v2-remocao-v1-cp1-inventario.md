# app-v2 - CP-1 inventario executavel para remocao do v1

## 1. Objetivo

Criar uma fotografia verificavel das dependencias do app legado/v1 antes de
remover arquivos. Este checkpoint nao remove runtime, nao altera build e nao
muda comportamento do produto.

Plano-base: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`.

## 2. Base analisada

- Branch de trabalho: `codex/v1-removal-inventory-cp1`.
- Base de partida: `main`.
- HEAD base apos merge do plano: `5bd089d5014ba5d78256dafc6ed6e59de3bd6707`.
- Entrada principal confirmada: `index.html` monta `src/app-v2/main.tsx`.
- Root principal confirmado: `app-v2-root`.

## 3. Comandos de inventario

Comandos usados para gerar este mapa:

```bash
git status --short --branch
rg -n "src/ui|src/react|src/features|pricing|billing|stripe|planos" index.html src public docs/rewrite
rg -n "from '../features|from '../../features|from '../../../features|from '../../../../features|import\\('../features|import\\('../../features|import\\('../../../features" src/domain src/core src/ui
rg -n "from '../ui|from '../../ui|from '../../../ui|from '../../../../ui|import\\('../ui|import\\('../../ui|import\\('../../../ui" src/domain src/core src/features src/react
rg -n "from '../react|from '../../react|from '../../../react|from '../../../../react|import\\('../react|import\\('../../react|import\\('../../../react" src/ui src/features src/app-v2
rg -n "\\.\\./react|\\.\\./\\.\\./react|\\.\\./ui|\\.\\./\\.\\./ui|\\.\\./features|\\.\\./\\.\\./features|\\.\\./assets|\\.\\./\\.\\./assets" src/app-v2
```

## 4. Tamanho das superficies legadas

| Superficie       | Arquivos | Classificacao inicial         |
| ---------------- | -------- | ----------------------------- |
| `src/ui/`        | 132      | runtime legado/v1             |
| `src/react/`     | 70       | ilhas React/landing/v1 + CSS  |
| `src/features/`  | 86       | features extraidas para v1    |
| `src/__tests__/` | 211      | testes mistos, muitos legados |

Principais agrupamentos encontrados:

| Grupo                                    | Arquivos |
| ---------------------------------------- | -------- |
| `src/ui/components`                      | 42       |
| `src/react/entrypoints`                  | 23       |
| `src/react/pages`                        | 23       |
| `src/ui/viewModels`                      | 18       |
| `src/ui/views`                           | 12       |
| `src/ui/views/equipamentos`              | 11       |
| `src/react/pages/landing/components`     | 11       |
| `src/features/equipamentos/ui`           | 10       |
| `src/features/equipamentos/__tests__/ui` | 10       |
| `src/ui/views/clientes`                  | 9        |

## 5. Classificacao por destino

### 5.1 Remover apos provas de nao uso

Estes grupos parecem pertencer ao runtime v1 e devem sair depois de seus
contratos e testes serem migrados ou aposentados:

- `src/ui/shell.js`
- `src/ui/shell/**`
- `src/ui/controller/**`
- `src/ui/views/**`
- `src/react/entrypoints/**`
- `src/react/pages/**`
- `src/features/equipamentos/**`
- `src/features/historico/**`
- `src/features/registro/**`
- `src/features/relatorio/**`

Controle obrigatorio antes de deletar:

```bash
rg -n "from .*<arquivo>|import\\(.*<arquivo>|<arquivo>" src index.html public
```

### 5.2 Migrar antes de remover

Estes itens nao podem ser apagados diretamente porque ainda sao consumidos por
camadas que sobrevivem ao v1:

| Item atual                                            | Consumidor                                                 | Acao antes da remocao                                                                |
| ----------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/features/profile.js`                             | `src/domain/pdf.js`, `src/domain/whatsapp.js`, `src/ui/**` | Extrair contrato puro para `src/domain` ou `src/core`                                |
| `src/ui/components/onboarding/onboardingChecklist.js` | `src/domain/pdf/shareReport.js`                            | Inverter dependencia ou substituir por porta pura/fallback sem UI                    |
| `src/react/styles/tailwind.css`                       | `src/app-v2/index.tsx`                                     | Mover para `src/app-v2/styles/` ou `src/assets/styles/` antes de deletar `src/react` |
| `src/ui/viewModels/**`                                | `src/react/pages/**`, testes legados                       | Migrar regras ainda uteis para `src/domain` ou `src/app-v2/data`                     |
| `src/ui/components/signature/**`                      | testes de assinatura/storage/PDF legados                   | Separar regra pura e manter cobertura de seguranca antes de apagar UI                |
| `src/ui/components/photos.js`                         | `src/features/equipamentos/ui/detailController.js`         | Remover junto com equipamentos v1 ou extrair contrato se ainda for necessario        |

### 5.3 Preservar para etapas sensiveis

Estes itens aparecem no inventario, mas nao devem ser removidos no fluxo de
limpeza v1 sem etapa propria:

- `src/domain/pdf.js`
- `src/domain/pdf/shareReport.js`
- `src/domain/whatsapp.js`
- `src/core/plans/**`
- `supabase/functions/**`
- `supabase/migrations/**`
- `public/_headers`
- `public/legal/termos.html`
- `public/legal/privacidade.html`
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `tailwind.config.cjs`

Motivo: esses arquivos tocam PDF/share, WhatsApp, billing, CSP, legal,
infraestrutura ou configuracao global.

## 6. Acoplamentos confirmados

### 6.1 `domain` ainda depende de legado

```text
src/domain/pdf.js -> src/features/profile.js
src/domain/whatsapp.js -> src/features/profile.js
src/domain/pdf/shareReport.js -> src/ui/components/onboarding/onboardingChecklist.js
```

Impacto:

- CP-2 deve ser executado antes de remover `src/features/profile.js` ou
  `src/ui/components/onboarding/**`.
- O warning ESLint conhecido em `src/domain/pdf/shareReport.js` e evidencia
  desse acoplamento.

### 6.2 `ui` orquestra `features` v1

Principais consumidores:

- `src/ui/views/equipamentos.js`
- `src/ui/views/registro.js`
- `src/ui/views/historico.js`
- `src/ui/views/conta.js`
- `src/ui/controller/handlers/reportExportHandlers.js`
- `src/ui/controller/handlers/orcamentoHandlers.js`
- `src/ui/components/accountModal.js`
- `src/ui/components/orcamentoModal.js`

Impacto:

- Nao remover `src/features/**` antes de remover ou neutralizar os consumidores
  em `src/ui/**`.
- A ordem CP-4 antes de CP-5 continua correta.

### 6.3 `react` depende de contratos `ui`

As ilhas e paginas React legadas importam `src/ui/viewModels/**`,
`src/ui/views/clientes/**` e contratos DOM.

Impacto:

- CP-3 deve apagar ou aposentar ilhas React junto com os testes de ilha.
- Nao vale mover esses contratos para app-v2 sem necessidade; a maioria existe
  para preservar DOM do v1.

### 6.4 `app-v2` tem um acoplamento de pasta com `src/react`

`src/app-v2/index.tsx` importa:

```ts
import '../react/styles/tailwind.css';
```

Esse CSS contem `@tailwind components`, `@tailwind utilities` e uma animacao
antiga de landing. O app-v2 tambem importa `./styles/print.css`.

Impacto:

- Antes de deletar `src/react`, mover o CSS Tailwind usado pelo app-v2 para
  caminho neutro.
- A remocao de `src/react` nao pode ser feita como delecao de pasta inteira no
  CP-3 sem esse ajuste.

## 7. Testes ligados ao legado

Resumo por busca textual:

| Busca em `src/__tests__`                                          | Arquivos encontrados |
| ----------------------------------------------------------------- | -------------------- |
| referencias a `src/ui` ou imports relativos para `ui`             | 149                  |
| referencias a `src/react` ou imports relativos para `react`       | 57                   |
| referencias a `src/features` ou imports relativos para `features` | 35                   |
| termo `legacy` ou `Legacy`                                        | 55                   |
| qualquer referencia v1 entre `ui`, `react` ou `features`          | 158                  |

Classificacao recomendada:

| Grupo de teste                             | Destino                                                              |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Testes de ilhas React (`*Island.test.jsx`) | Remover no CP-3 se a ilha sair                                       |
| Testes de shell/views/controllers v1       | Remover no CP-4 se nao cobrirem regra reaproveitada                  |
| Testes de `features/**` com regra pura     | Migrar para `src/domain` ou novo modulo antes de remover feature     |
| Testes de assinatura/storage/PDF/WhatsApp  | Preservar ate etapa sensivel ou substituir por cobertura equivalente |
| Testes app-v2 em `src/app-v2/**`           | Preservar                                                            |

Testes sensiveis que nao devem ser apagados sem substituto:

- `src/__tests__/reportExportContracts.test.js`
- `src/__tests__/reportExportHandlers.test.js`
- `src/__tests__/registroSaveSignatureHandlers.test.js`
- `src/__tests__/registroSignatureLegacyHandlers.test.jsx`
- `src/__tests__/signatureResolver.test.js`
- `src/__tests__/storageCacheOffline.contract.test.js`
- `src/__tests__/storage.integration.test.js`
- `src/__tests__/whatsappExport.test.js`
- `src/__tests__/pdfGenerator.registroId.test.js`
- `src/__tests__/pdfGenerator.mediaChecklist.contract.test.js`

## 8. CSS e assets

Arquivos CSS legados encontrados:

- `src/assets/styles/base.css`
- `src/assets/styles/components.css`
- `src/assets/styles/components/_*.css`
- `src/assets/styles/desktop-fonts.css`
- `src/assets/styles/equipment-detail-cp-h.css`
- `src/assets/styles/equipment-list-cp-i.css`
- `src/assets/styles/layout.css`
- `src/assets/styles/redesign.css`
- `src/assets/styles/theme-premium.css`
- `src/assets/styles/tokens.css`
- `src/assets/styles/ux-polish.css`

Vestigio especifico de pricing:

- `src/assets/styles/components.css` importa `./components/_pricing.css`.
- `src/assets/styles/components/_pricing.css` ainda existe.

Arquivos grandes fora do limite arquitetural de 1000 linhas:

| Arquivo                                                 | Linhas | Observacao                                                        |
| ------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| `src/react/pages/landing/assets/problems-reference.png` | 16817  | Arquivo binario rastreado como texto/base64 ou formato inadequado |
| `src/react/pages/landing/assets/cooling-tech.png`       | 14854  | Arquivo binario rastreado como texto/base64 ou formato inadequado |
| `src/ui/views/registro.js`                              | 1867   | v1 runtime                                                        |
| `src/ui/views/historico.js`                             | 1613   | v1 runtime                                                        |
| `src/ui/views/dashboard.js`                             | 1163   | v1 runtime                                                        |
| `src/ui/components/authscreen.js`                       | 1161   | v1 auth UI                                                        |
| `src/ui/views/equipamentos.js`                          | 1157   | v1 runtime                                                        |
| `src/ui/shell/templates/modals.js`                      | 1127   | v1 shell                                                          |
| `src/ui/components/nameplateCapture.js`                 | 1111   | v1 component                                                      |

Conclusao:

- CSS legado deve ser limpo apenas no CP-6, depois da saida do runtime v1.
- Assets da landing em `src/react/pages/landing/assets/**` devem sair junto com
  landing/ilhas legadas, salvo se houver uso publico confirmado.

## 9. Vestigios publicos e comerciais

Vestigios ainda confirmados:

- `index.html` CSP permite `https://js.stripe.com`, `https://api.stripe.com` e
  `https://hooks.stripe.com`.
- `public/_headers` repete diretivas CSP com Stripe.
- `index.html` ainda contem JSON-LD com ofertas Free, Plus e Pro.
- `public/legal/termos.html` ainda referencia planos pagos, Stripe,
  cancelamento e `/#planos`.
- `public/legal/privacidade.html` ainda referencia dados de faturamento.

Destino:

- Tratar no CP-7, porque envolve superficie publica, CSP e texto legal.
- Nao misturar com remocao de shell, views ou features.

## 10. Ordem atualizada dos proximos checkpoints

1. CP-2a: mover o CSS Tailwind consumido pelo app-v2 para fora de `src/react`.
2. CP-2b: extrair `Profile` de `src/features/profile.js` para contrato puro.
3. CP-2c: remover dependencia `domain/pdf/shareReport.js -> ui/onboarding`.
4. CP-3: remover ilhas React e landing v1, com testes de ilha.
5. CP-4: remover shell/views/controllers v1 por dominio.
6. CP-5: remover `src/features/**` que sobrar apos CP-2 e CP-4.
7. CP-6: limpar CSS/assets legados.
8. CP-7: limpar CSP, legal, JSON-LD e vestigios publicos de pricing/billing.
9. CP-8: validar app-v2 como unica versao principal.

## 11. Criterio de saida do CP-1

CP-1 esta pronto quando:

- Este inventario existe em `docs/rewrite/`.
- As superficies v1 estao classificadas.
- Os acoplamentos que bloqueiam delecao direta estao listados.
- Os testes que precisam migracao ou preservacao estao identificados.
- Nenhum runtime foi alterado.
- `npm run format:check` e `git diff --check` passam.

## 12. Proximo passo recomendado

Executar CP-2a primeiro: mover `src/react/styles/tailwind.css` para uma pasta
neutra usada pelo app-v2. Esse ajuste e pequeno, reduz risco e desbloqueia a
remocao futura de `src/react/**` sem tocar ainda em PDF/share, storage,
autenticacao, billing backend ou legal.
