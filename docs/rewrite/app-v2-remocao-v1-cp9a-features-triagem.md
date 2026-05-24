# app-v2 remocao v1 - CP-9a triagem de src/features

## Objetivo

Mapear `src/features` por dominio e escolher o primeiro lote seguro para
remocao futura do runtime v1, sem apagar codigo por palpite.

Este checkpoint e documental. Ele nao altera runtime, app-v2, storage,
Supabase/RLS, PDF/share, WhatsApp, PMOC, billing/pricing, CSS ou schema.

## Estado verificado

Branch: `codex/remove-v1-dashboard-last-service-react-cp3f`.

Contagem por dominio em `src/features`:

| Dominio      | Arquivos | Leitura atual                                                                 |
| ------------ | -------- | ----------------------------------------------------------------------------- |
| equipamentos | 37       | Maior bloco, fortemente acoplado a `src/ui/views/equipamentos.js` e contratos |
| historico    | 0        | Resolvido no CP-9e; helpers co-localizados com a view v1 de historico         |
| registro     | 16       | Bloco sensivel: salvamento, fotos, assinatura, PMOC e pos-salvamento          |
| relatorio    | 2        | Pequeno, mas ligado a exportacao/PDF/WhatsApp via handlers                    |
| profile.js   | 1        | Re-export de compatibilidade ainda mockado por muitos testes legados          |
| userData.js  | 1        | Usado por conta/account modal e testes de export/delete de conta              |

## Acoplamentos relevantes

### Equipamentos

`src/features/equipamentos/**` continua ligado a:

- `src/ui/views/equipamentos.js`;
- `src/ui/viewModels/equipamentosContracts.js`;
- `src/ui/views/equipamentos/constants.js`;
- `src/ui/views/equipamentos/helpers.js`;
- `src/ui/components/equipmentVisual.js`;
- `src/ui/components/photos.js`.

Classificacao: nao e primeiro lote. A area e grande e mistura listagem, detalhe,
setores, fotos, nameplate e CRUD.

Atualizacao CP-9f: o subgrupo `state/**` foi removido de `src/features` e
co-localizado em `src/ui/views/equipamentos/state/**`, pois representa cache e
estado de UI da view legada. A area restante ainda mistura bridges, UI, CRUD,
setores, fotos e nameplate.

Atualizacao CP-9g: o subgrupo `bridges/**` foi removido de `src/features` e
co-localizado em `src/ui/views/equipamentos/bridges/**`. O lote ficou restrito a
mount/unmount e generation guards da view legada; CRUD, storage, setores, fotos
e nameplate permanecem fora do escopo.

Atualizacao CP-9h: o subgrupo `utils/**` foi removido de `src/features` e
co-localizado em `src/ui/views/equipamentos/utils/**`, pois os helpers ja eram
dependentes da view legada de Equipamentos. CRUD, storage, setores, fotos e
nameplate permanecem fora do escopo.

Atualizacao CP-9i: o subgrupo `nameplate/**` foi removido de `src/features` e
co-localizado em `src/ui/views/equipamentos/nameplate/**`. O lote ficou restrito
ao helper de coleta/erro de dados de placa usado pela view legada; CRUD,
storage, setores e fotos permanecem fora do escopo.

Atualizacao CP-9j: `ui/listRenderer.js` foi removido de `src/features` e
co-localizado em `src/ui/views/equipamentos/ui/listRenderer.js`, pois o bridge
da lista ja havia sido movido para a view legada. Demais helpers de `ui/**`,
CRUD, storage, setores e fotos permanecem fora do escopo.

Atualizacao CP-9k: `ui/headerMount.js` foi removido de `src/features` e
co-localizado em `src/ui/views/equipamentos/ui/headerMount.js`, pois e apenas um
wrapper de roots DOM para a bridge de header ja co-localizada na view legada.
Demais helpers de `ui/**`, CRUD, storage, setores e fotos permanecem fora do
escopo.

Atualizacao CP-9l: `ui/toolbar.js` foi removido de `src/features` e
co-localizado em `src/ui/views/equipamentos/ui/toolbar.js`, preservando os CTAs
e `data-action` existentes. Demais helpers de `ui/**`, CRUD, storage, setores e
fotos permanecem fora do escopo.

Atualizacao CP-9m: `ui/renderFlatList.js` foi removido de `src/features` e
co-localizado em `src/ui/views/equipamentos/ui/renderFlatList.js`, preservando a
assinatura `renderFlatList(filtro, options, setorId)` e a injecao de
dependencias. Demais helpers de `ui/**`, CRUD, storage, setores e fotos
permanecem fora do escopo.

### Historico

Resolvido no CP-9e. Os helpers de `src/features/historico/**` foram
co-localizados em `src/ui/views/historico/helpers/**` e os testes foram movidos
para `src/__tests__/historicoHelpers/**`.

A view v1 de Historico ainda existe e continua sensivel por tocar timeline,
registro, PDF/share e WhatsApp:

- `render/renderHelpers.js`;
- `filters/filterHelpers.js`;
- `actions/cardMenuHelpers.js`;
- `delete/deleteHelpers.js`.

Tambem ha containers e rota no shell v1:

- rota `historico` em `src/ui/controller/routes.js`;
- view `#view-historico` em `src/ui/shell/templates/views.js`;
- botoes `data-nav="historico"` em templates de historico/relatorio/dashboard.

Classificacao atual: `src/features/historico/**` concluido. Remocao da
view/rota `historico` permanece adiada por envolver router legado, timeline,
registro, PDF/share e WhatsApp.

### Registro

`src/features/registro/**` cobre payload, persistencia, fotos, assinatura,
report/share e pos-salvamento. Os subgrupos `lifecycle` e `checklist` foram
tratados depois nos CP-9t/CP-9u por conterem helpers puros locais da view.

Classificacao: adiar. A area toca storage, assinatura, PMOC, PDF/share e
regressoes historicas.

### Relatorio

Resolvido no CP-9d. O helper puro `buildWhatsAppSuccessCopy` foi movido para
`src/domain/reportExportHelpers.js` e `src/features/relatorio/**` foi removido.

Classificacao atual: concluido para este modulo. O fluxo PDF/WhatsApp/PMOC em
si permanece fora de escopo.

### Profile e UserData

`src/features/profile.js` foi removido no CP-9c. Os consumidores agora apontam
para `src/core/profile.js`. `src/features/userData.js` participa de
export/delete de conta.

Classificacao atual: Profile concluido; UserData adiado por envolver conta,
autenticacao, Edge Functions e LGPD.

## Primeiro lote recomendado

CP-9b diagnosticou que a remocao direta da superficie v1 de Historico era
sensivel. CP-9e executou apenas o lote seguro: remover `src/features/historico`
por co-localizacao dos helpers junto da view legada.

## Controles para CP-9b

- Nao remover `relatorio`, PDF, WhatsApp, PMOC, quotas ou handlers de exportacao.
- Nao remover registro, assinatura, fotos ou storage.
- Manter app-v2 como fonte atual de registros em `Servicos > Registros`.
- Adicionar contrato de ausencia em `legacyV1RemovalContracts.test.js`.
- Rodar busca por `historico` antes/depois para separar referencias historicas
  em docs de referencias runtime/teste.

## Validacao esperada para CP-9b

- RED/GREEN em `legacyV1RemovalContracts.test.js`.
- Testes focados de rotas/shell que forem impactados.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
