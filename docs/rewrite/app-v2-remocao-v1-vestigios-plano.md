# app-v2 - Plano de remocao do app v1 e vestigios

## 1. Objetivo

Remover o runtime legado/v1 e seus vestigios depois da confirmacao de que o
app-v2 esta como entrada principal da `main`, sem quebrar contratos ainda usados
por app-v2, Supabase, PDF/share, storage, autenticacao ou validacoes.

Este plano e uma etapa de preparacao. Ele nao executa delecoes de codigo.

## 2. Estado confirmado

- Branch base analisada: `main`.
- HEAD base analisado: `94a4ee63ef6362cbff48c3a50f3fce402b09479e`.
- `index.html` monta `src/app-v2/main.tsx`.
- O root principal da aplicacao e `app-v2-root`.
- `src/main.js` nao existe mais como entrada principal.
- O app-v2 permanece concentrado em `src/app-v2/`.

Atualizacao de continuidade em `codex/remove-v1-dashboard-last-service-react-cp3f`
apos os checkpoints CP-3x, CP-3y, CP-4a..CP-4d, CP-7b..CP-7c e CP-8a..CP-8j:

- `src/react/` nao existe mais.
- `src/app.js` nao existe mais.
- `e2e/specs/` contem apenas specs app-v2:
  - `app-v2-authenticated-primary.spec.js`;
  - `app-v2-primary-entrypoint.spec.js`;
  - `app-v2-service-layout.spec.js`.
- Superficies publicas ativas de billing/pricing/checkout/portal ja foram
  removidas; a migration `20260524010000_remove_stripe_billing_schema.sql`
  permanece como evidencia de remocao do schema Stripe.
- `src/app-v2/` nao importa `src/ui`, `src/features` ou `src/react`. As
  ocorrencias `../ui/*` dentro de `src/app-v2` apontam para
  `src/app-v2/ui/*`, nao para o runtime legado.
- `src/domain` e `src/core` nao importam `src/ui`, `src/features` ou
  `src/react` por caminho estatico direto no estado atual verificado.
- `src/features/profile.js` foi removido no CP-9c; consumidores agora importam
  `Profile` diretamente de `src/core/profile.js`.
- `src/features/relatorio/**` foi removido no CP-9d; o helper puro
  `buildWhatsAppSuccessCopy` foi reclassificado em
  `src/domain/reportExportHelpers.js`.
- `src/features/historico/**` foi removido no CP-9e; helpers foram
  co-localizados em `src/ui/views/historico/helpers/**` porque a view/rota v1 de
  Historico ainda cruza timeline, registro, PDF/share e WhatsApp.
- `src/features/equipamentos/state/**` foi removido no CP-9f; estado de
  cache/render da view legada foi co-localizado em
  `src/ui/views/equipamentos/state/**`.
- `src/features/equipamentos/bridges/**` foi removido no CP-9g; bridges de
  mount/unmount da view legada foram co-localizadas em
  `src/ui/views/equipamentos/bridges/**`.

## 3. Superficies v1 mapeadas

### 3.1 Runtime legado direto

- `src/ui/`: 135 arquivos restantes.
- `src/react/`: removido.
- `src/features/`: ainda existe, concentrado em `equipamentos` sem os subgrupos
  `state` e `bridges`, `registro` e `userData.js`.
- `src/assets/styles/`: folhas legadas, incluindo `redesign.css`,
  `components.css`, `layout.css`, `theme-premium.css` e estilos derivados do v1.
- `src/__tests__/`: 202 arquivos de teste, muitos cobrindo contratos legados.
- `e2e/specs/`: 3 specs restantes, todas app-v2.

### 3.2 Acoplamentos que impedem delecao em massa

- `src/domain/pdf/shareReport.js` importa componente de onboarding legado.
- `src/features/equipamentos/**` ainda importa helpers e componentes de
  `src/ui/**`.
- Testes legados cobrem seguranca de assinatura, storage, PDF, WhatsApp,
  relatorios e contratos DOM.

Conclusao: `src/ui` e `src/features` devem ser removidos por checkpoint, depois
de extrair ou substituir contratos compartilhados. Delecao direta dessas pastas
continua insegura. `src/react` ja foi removido e e protegido por
`src/__tests__/reactCleanupContracts.test.js`.

### 3.3 Vestigios publicos e comerciais

- O conteudo publico ativo de pricing/billing foi tratado em checkpoints
  dedicados.
- Permanecem mencoes historicas em `docs/**` e contratos legados de
  compatibilidade operacional, que nao devem ser apagados junto com runtime.
- Permanecem comentarios legados em CSS e testes sobre paywall/upgrade; devem
  ser tratados como parte de CP-6 ou do checkpoint que remover o componente
  correspondente, nao como limpeza solta.

## 4. Fora de escopo inicial

Nao remover nesta primeira sequencia sem etapa dedicada:

- Supabase functions e migrations relacionadas a billing/Stripe.
- RLS, policies e schemas.
- PDF/share real e `vendor-pdf`.
- WhatsApp/share.
- Upload/storage de arquivos.
- Autenticacao.
- PMOC real.
- Orcamento real.
- Router/deep links.
- Dependencias em `package.json` ou `package-lock.json`, salvo etapa aprovada
  com evidencia de nao uso.

## 5. Riscos principais

| Risco                                                | Impacto                                                          | Controle                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Remover helper legado ainda usado por `domain`       | Quebra PDF, WhatsApp ou testes de seguranca                      | Extrair contratos puros antes de deletar                   |
| Remover testes legados antes de substituir cobertura | Regressao silenciosa em assinatura, storage ou relatorio         | Migrar ou aposentar teste com justificativa por checkpoint |
| Limpar CSS legado antes de provar nao uso            | Regressao visual em telas ainda referenciadas por testes ou docs | Usar relatorio de CSS morto e smoke visual                 |
| Remover billing backend junto com v1                 | Mistura area sensivel com limpeza estrutural                     | Manter billing backend para etapa propria                  |
| Editar legal/SEO sem revisao                         | Texto publico inconsistente                                      | Checkpoint especifico de copy/legal                        |

## 6. Plano de implementacao por checkpoints

### CP-1 - Inventario executavel de dependencias v1

Objetivo: criar uma fotografia objetiva de imports, entrypoints e testes ligados
ao v1 antes de remover arquivos.

Arquivos afetados:

- Criar documento de inventario em `docs/rewrite/`.
- Opcionalmente criar script read-only em `scripts/` apenas se `rg` manual for
  insuficiente.

Validacao:

```bash
rg -n "src/ui|src/react|src/features|pricing|billing|stripe|planos" index.html src public docs/rewrite
npm run format:check
git diff --check
```

Saida esperada:

- Lista de arquivos v1-only.
- Lista de arquivos compartilhados que precisam ser extraidos ou preservados.
- Lista de testes que devem ser migrados, mantidos ou removidos.

### CP-2 - Separar contratos compartilhados do legado

Objetivo: retirar de `src/features` e `src/ui` os contratos ainda usados por
`src/domain/**`, colocando-os em camada adequada antes da remocao do v1.

Escopo provavel:

- Extrair `Profile` usado por `src/domain/pdf.js` e `src/domain/whatsapp.js`
  para modulo puro em `src/domain/` ou `src/core/`.
- Remover dependencia de `src/domain/pdf/shareReport.js` sobre onboarding
  legado, substituindo por porta pura ou fallback sem UI.
- Atualizar testes focados desses contratos.

Validacao:

```bash
npm test -- src/__tests__/reportExportContracts.test.js src/__tests__/storageCacheOffline.contract.test.js --run
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Isolate shared contracts before v1 removal`

### CP-3 - Remover entrypoints e ilhas React legadas

Objetivo: apagar componentes React que existiam para o shell v1 e nao sao mais
entrada do produto principal.

Escopo provavel:

- `src/react/entrypoints/**`
- `src/react/pages/**` legadas, exceto se algum teste ou app-v2 importar
  diretamente.
- Testes associados que cobrem apenas ilhas DOM do v1.

Controle:

- Antes de remover cada grupo, rodar `rg` para confirmar ausencia de imports em
  app-v2 e no build principal.
- Quando a cobertura ainda for relevante, migrar o teste para helper puro ou
  app-v2 antes de deletar.

Validacao:

```bash
npm test -- src/app-v2/index.test.tsx src/app-v2/shell/AppV2Shell.test.tsx --run
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Remove legacy React islands`

### CP-4 - Remover shell, views e controllers v1

Objetivo: remover a navegacao, views e handlers do app legado depois que
contratos compartilhados ja estiverem isolados.

Escopo provavel:

- `src/ui/shell/**`
- `src/ui/views/**`
- `src/ui/controller/**`
- `src/ui/shell.js`
- View models DOM legados que nao forem mais importados por testes migrados.

Controle:

- Nao remover componentes de PDF/share, assinatura ou storage se ainda forem
  chamados por `domain` ou testes de seguranca.
- Apagar em lotes pequenos por dominio: dashboard, equipamentos, historico,
  registro, relatorios, conta.

Validacao:

```bash
npm test -- src/app-v2 --run
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Remove legacy shell and views`

### CP-5 - Remover features legadas apos extracao

Objetivo: remover `src/features/**` que servia apenas ao v1, preservando apenas
modulos que forem formalmente reclassificados como `domain` ou `core`.

Escopo provavel:

- `src/features/equipamentos/**`
- `src/features/historico/**`
- `src/features/registro/**`
- `src/features/userData.js`

Controle:

- Cada dominio deve ter `rg` de import antes da remocao.
- Regras reutilizaveis devem ser movidas para `src/domain/**` com testes puros,
  nao copiadas para app-v2.

Validacao:

```bash
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Remove legacy feature modules`

### CP-6 - Limpar CSS e assets legados

Objetivo: remover folhas de estilo e classes que pertenciam ao v1 sem afetar o
app-v2.

Escopo provavel:

- `src/assets/styles/redesign.css`
- `src/assets/styles/layout.css`
- `src/assets/styles/components.css`
- `src/assets/styles/theme-premium.css`
- Estilos de pricing/paywall remanescentes.

Controle:

- Confirmar que app-v2 nao importa CSS legado.
- Usar relatorio de CSS morto quando aplicavel.
- Fazer smoke visual mobile/desktop do app-v2.

Validacao:

```bash
npm run lint:css:dead
npm run build
npm run check
```

Commit sugerido:

- `Remove legacy CSS surfaces`

### CP-7 - Limpar vestigios publicos, pricing e legal

Objetivo: alinhar a superficie publica ao produto atual sem billing/pricing no
cliente.

Escopo provavel:

- `index.html`
- `public/legal/termos.html`
- `public/legal/privacidade.html`
- Referencias publicas a `/#planos`, Stripe, Free, Plus, Pro e assinatura paga.

Controle:

- Manter URL oficial `https://cool-track-pro.pages.dev/`.
- Nao comprar ou trocar dominio.
- Nao apagar historico tecnico em `docs/` fora do documento de checkpoint.

Validacao:

```bash
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Remove public pricing vestiges`

### CP-8 - Verificacao final para v2 como versao principal

Objetivo: provar que a `main` serve apenas o app-v2 como produto principal e que
o v1 nao participa mais do runtime.

Validacao local:

```bash
npm run format
npm run build
npm run check
npm run test:e2e:ci
rg -n "src/ui|src/react|src/features|pricing|billing|stripe|/#planos" index.html src public
```

Validacao remota:

- Smoke em `https://cool-track-pro.pages.dev/`.
- Login com conta de teste aprovada pelo usuario.
- Navegacao app-v2: Hoje, Equipamentos, Servicos, Orcamentos, Alertas e Conta.
- Confirmar que nao ha CTA de planos, checkout, portal de cliente ou pricing.

Commit sugerido:

- `Document v2 primary cleanup completion`

## 7. Ordem recomendada

1. CP-1 para travar inventario e evitar delecao por palpite.
2. CP-2 para quebrar acoplamentos sensiveis.
3. CP-3 a CP-5 para remover runtime v1 por lotes.
4. CP-6 para limpar CSS depois que runtime v1 sair.
5. CP-7 para limpar superficie publica e legal.
6. CP-8 para validar e registrar fechamento.

## 8. Criterio de pronto

A remocao do v1 so deve ser considerada concluida quando:

- `index.html` monta apenas app-v2.
- `src/ui`, `src/react` e `src/features` nao existem mais ou restaram apenas
  arquivos reclassificados com justificativa documentada.
- `src/app-v2` nao importa runtime legado.
- `src/domain` e `src/core` nao importam `src/ui`, `src/react` ou
  `src/features`.
- Nao ha CTA publico de pricing, checkout, portal de cliente ou planos pagos.
- Build, check, testes e smoke remoto passam.

## 9. Proximo passo recomendado

Executar CP-1 em uma branch propria com inventario de imports e classificacao
arquivo a arquivo. Somente depois disso iniciar CP-2, porque os acoplamentos em
`domain` e `features` ainda tornam a remocao direta insegura.
