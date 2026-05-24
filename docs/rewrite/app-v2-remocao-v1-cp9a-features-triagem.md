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
| equipamentos | 59       | Maior bloco, fortemente acoplado a `src/ui/views/equipamentos.js` e contratos |
| historico    | 8        | Bloco pequeno, usado pela view v1 de historico                                |
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

### Historico

`src/features/historico/**` e consumido por `src/ui/views/historico.js`:

- `render/renderHelpers.js`;
- `filters/filterHelpers.js`;
- `actions/cardMenuHelpers.js`;
- `delete/deleteHelpers.js`.

Tambem ha containers e rota no shell v1:

- rota `historico` em `src/ui/controller/routes.js`;
- view `#view-historico` em `src/ui/shell/templates/views.js`;
- botoes `data-nav="historico"` em templates de historico/relatorio/dashboard.

Classificacao: melhor candidato para primeiro lote de runtime v1, desde que seja
tratado como checkpoint proprio e nao junto com Relatorio. A remocao deve
preservar o app-v2 `Servicos > Registros` como caminho atual para registros.

### Registro

`src/features/registro/**` cobre payload, persistencia, fotos, assinatura,
checklist PMOC, lifecycle, report/share e pos-salvamento.

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

Criar CP-9b para remover a superficie v1 de Historico, limitado a:

- rota `historico` do router legado;
- container `#view-historico` no shell legado;
- `src/ui/views/historico.js`;
- sub-renderers `src/ui/views/historico/**`;
- helpers `src/features/historico/**`;
- testes estritamente legados de historico que nao protegem app-v2.

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
