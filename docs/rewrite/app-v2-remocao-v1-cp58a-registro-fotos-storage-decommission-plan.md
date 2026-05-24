# app-v2 - Remocao v1 CP-58A - Plano para descomissionar `registro-fotos`

## Objetivo

Mapear o que ainda prende o projeto ao bucket legado `registro-fotos` e definir
uma sequencia segura para remover fotos/storage legado sem repetir erros do v1.

Este CP e documental. Ele nao altera runtime, migrations, policies, RLS, Edge
Functions, buckets ou storage real.

## Diagnostico

O runtime client-side legado de fotos ja foi removido nos CPs anteriores:

- `src/core/photoStorage.js` removido.
- `src/ui/components/photos.js` removido.
- `src/ui/viewModels/registroPhotosModel.js` removido.
- Fluxos de lightbox e mocks test-only removidos.

Ainda restam dependencias sensiveis em Supabase/storage:

- `supabase/functions/delete-user-account/index.ts` ainda inclui
  `registro-fotos` como bucket padrao para limpeza de conta.
- `supabase/functions/delete-user-account/lifecycle.ts` recebe lista de buckets
  e apaga objetos em `{userId}/**` antes de apagar tabelas/Auth.
- `src/__tests__/deleteUserAccountLifecycle.test.js` valida a ordem fail-closed
  usando `registro-fotos`.
- `supabase/tests/11_public_abuse_surfaces.test.sql` valida bucket privado,
  limite e policies canonicas de `registro-fotos`.
- Migrations historicas ainda criam/endurecem policies do bucket. Elas nao devem
  ser editadas retroativamente sem etapa de banco propria.

## Risco principal

Remover `registro-fotos` do delete-user-account agora pode quebrar LGPD: contas
com arquivos antigos no bucket deixariam objetos orfaos ao excluir a conta.

Remover migrations/policies existentes tambem e arriscado porque:

- migrations antigas representam historico aplicado;
- ambientes ja provisionados podem ter bucket e objetos reais;
- testes de abuso publico ainda assumem que o bucket existente e privado e
  protegido;
- a nova arquitetura de fotos/storage ainda nao foi definida.

## Decisao recomendada

Nao remover o bucket/policies imediatamente.

Tratar `registro-fotos` como bucket legado em modo de drenagem:

1. Bloquear novos writes pelo app-v2 ate existir nova etapa de fotos/storage.
2. Manter limpeza em delete-user-account enquanto houver possibilidade de dados
   antigos.
3. Separar etapa futura para inventario/migracao/expurgo de objetos antigos.
4. So depois remover referencias ativas e atualizar testes Supabase.

## Sequencia segura proposta

### CP-58B - Contrato de bucket legado em drenagem

- Renomear/documentar constantes e testes para deixar claro que
  `registro-fotos` e legado.
- Manter delete-user-account limpando o bucket.
- Adicionar contrato impedindo novos writes client-side para `registro-fotos`.

### CP-58C - Plano de nova arquitetura de anexos/fotos

- Definir se fotos voltam como anexos de equipamento, anexos de servico ou ambos.
- Definir modelo de metadados, ownership, quota, compressao, tipos MIME e
  lifecycle.
- Definir bucket novo ou namespace novo.
- Definir como app-v2 acessa via dataPort/adapters.

### CP-58D - Migracao/expurgo de legado

- Criar estrategia para contas existentes:
  - manter apenas limpeza por exclusao de conta;
  - ou criar job/migration de expurgo;
  - ou migrar objetos para novo modelo.
- Validar em ambiente Supabase real antes de remover safeguards.

### CP-58E - Remocao final de `registro-fotos`

- Remover default bucket legado do delete-user-account somente depois da decisao
  sobre dados existentes.
- Atualizar testes Supabase e lifecycle.
- Remover policies/funcoes atuais apenas via migration nova, nunca editando
  migrations historicas.

## Validacao esperada por etapa de codigo

- Teste unitario de delete-user-account.
- Teste de contrato contra novos writes client-side.
- `npm run format`
- `npm run build`
- `npm run check`
- Quando houver mudanca Supabase: `supabase test db` ou equivalente disponivel
  no ambiente.

## Status

Bloqueado para remocao direta de runtime sensivel. Pode avancar com CP-58B
documental/contratual sem tocar bucket real.
