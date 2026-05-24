# app-v2 - Remocao v1 CP-11 - Mapa do runtime legado em src/ui

## 1. Objetivo

Registrar o estado atual de `src/ui` depois da remocao completa dos arquivos em
`src/features`, para definir o proximo lote seguro da remocao do v1 sem tocar
em PDF/share, WhatsApp, storage, autenticacao, router ou contratos publicos.

Este checkpoint e documental/read-only sobre runtime. Ele nao remove codigo.

## 2. Estado verificado

- Branch: `codex/remove-v1-dashboard-last-service-react-cp3f`.
- HEAD inicial do checkpoint: `9b49612b4fb29a18c3100d4974163a9da593b1da`.
- `src/features/`: 0 arquivos restantes.
- Ocorrencias de `features/` em `src/`: apenas contratos de ausencia em
  `src/__tests__/legacyV1RemovalContracts.test.js`.
- `src/ui/`: 178 arquivos restantes.

Distribuicao atual de `src/ui`:

| Area          | Arquivos |
| ------------- | -------- |
| `account`     | 1        |
| `components`  | 52       |
| `composables` | 2        |
| `controller`  | 10       |
| `helpers`     | 2        |
| `root`        | 2        |
| `shell`       | 7        |
| `viewModels`  | 17       |
| `views`       | 85       |

Distribuicao interna de `src/ui/views`:

| Area de view   | Arquivos |
| -------------- | -------- |
| `equipamentos` | 41       |
| `registro`     | 11       |
| `clientes`     | 10       |
| `dashboard`    | 7        |
| `historico`    | 6        |
| `relatorio`    | 2        |
| adapters raiz  | 8        |

## 3. Fronteiras de import

Resultado relevante do scan:

- `src/app-v2` usa `../ui/*` apenas para `src/app-v2/ui/*`.
- `src/core` nao importa `src/ui` por caminho estatico direto.
- `src/domain` nao importa `src/ui` por caminho estatico direto; restam
  comentarios historicos sobre dependencias legadas.
- A massa de dependencias atual esta em testes e no proprio runtime legado.

Arquivos de teste que ainda referenciam areas de `src/ui`:

| Padrao          | Arquivos de teste |
| --------------- | ----------------- |
| `ui/views`      | 133               |
| `ui/components` | 94                |
| `ui/controller` | 43                |
| `ui/shell`      | 41                |
| `ui/viewModels` | 40                |
| `ui/account`    | 1                 |

Conclusao: `src/ui` ainda representa o runtime legado congelado e varios
contratos de regressao. A remocao direta da pasta ainda e insegura.

## 4. Areas sensiveis dentro de src/ui

Nao remover em lote junto com limpeza estrutural:

- PDF/share e WhatsApp:
  - `src/ui/controller/handlers/reportExportHandlers.js`;
  - componentes de sucesso/assinatura/quota PDF;
  - views de `relatorio` e `historico` conectadas ao export.
- Assinatura e fotos:
  - `src/ui/components/signature/**`;
  - `src/ui/components/signature.js`;
  - `src/ui/components/photos.js`;
  - fluxo de save em `src/ui/views/registro/save/**`.
- Autenticacao, conta e dados do usuario:
  - `src/ui/components/authscreen.js`;
  - `src/ui/components/accountModal.js`;
  - `src/ui/account/userData.js`;
  - handlers de conta/perfil.
- Router/shell:
  - `src/ui/controller/routes.js`;
  - `src/ui/controller.js`;
  - `src/ui/shell/**`.
- Storage local, equipamentos e PMOC real:
  - `src/ui/views/equipamentos/**`;
  - `src/ui/views/registro/**`;
  - componentes PMOC e nameplate.

## 5. Prioridade recomendada

### Proximo lote seguro

Fazer um CP documental/contratual para classificar `src/ui` por tipo de destino:

1. **Aposentar somente quando o v1 for removido por completo**
   - shell, routes, adapters raiz de views e handlers de navegacao.
2. **Extrair para camada pura antes de remover**
   - view models ainda uteis como referencia operacional;
   - helpers sem DOM, storage ou side effects reais.
3. **Tratar em etapa sensivel dedicada**
   - PDF/share, WhatsApp, assinatura, fotos, auth, storage, router e PMOC.

### Codigo ainda nao recomendado

Nao ha um lote de delecao de `src/ui` com risco baixo suficiente neste ponto. A
proxima alteracao de codigo deve ser escolhida somente depois de um inventario
por arquivo confirmando:

- ausencia de import estatico e dinamico;
- ausencia de leitura direta em testes de contrato;
- ausencia de dependencia em `index.html`, shell, router e handlers;
- substituicao ou aposentadoria explicita da cobertura correspondente.

## 6. Validacao do checkpoint

Como este CP e documental/read-only, a validacao esperada e:

```bash
npm run format:check
git diff --check
git diff --cached --check
```

Se o plano for convertido em codigo no proximo CP, voltar ao baseline completo:

```bash
npm run format
npm run build
npm run check
```
