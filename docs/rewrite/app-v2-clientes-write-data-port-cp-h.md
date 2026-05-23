# app-v2 - CP-H adapter de escrita real de Clientes

## 1. Objetivo

Compor a escrita real opcional de `Cliente` na `AppV2DataPort`, sem ativar
Supabase no preview e sem mudar o fluxo visual do app-v2.

Esta CP depende da CP-G:

- writer `saveAppV2ClienteToSupabase`;
- contrato SQL/RLS de `clientes` validado localmente;
- regra de create real com UUID gerado pelo banco;
- regra de edit real exigindo UUID valido.

## 2. Escopo

Incluido:

- novo adapter `createAppV2ClientesWriteDataAdapter`;
- composicao opt-in na `createAppV2DataSource`;
- novo modo `clientes-readwrite`;
- testes para fallback local, escrita real, erro RLS propagado e exigencia de
  UUID real para edicao.

Fora de escopo:

- ativar Supabase no preview;
- auth real no app-v2;
- outros dominios alem de `Cliente`;
- storage, router, upload, billing, PDF/share, WhatsApp, PMOC ou Orcamento real.

## 3. Contrato adotado

`createAppV2ClientesWriteDataAdapter` recebe:

- `basePort`;
- `userId`;
- `clientesWriter`.

Comportamento:

- sem `userId` ou sem `clientesWriter`, delega `saveClient` para a porta local;
- com ambos, chama o writer real;
- erro do writer real e propagado, sem fallback silencioso para mock;
- retorno do writer e mesclado no snapshot retornado, usando o UUID real;
- demais metodos continuam delegados para a porta base.

Na `createAppV2DataSource`, escrita real so fica ativa quando existem:

- sessao com `userId`;
- `clientesReader`;
- `clientesWriter`.

Sem reader, a factory permanece local mesmo com writer presente. Isso evita o
estado parcial em que o app escreve no banco, mas o proximo `loadSnapshot`
continua lendo somente mock/local.

## 4. Arquivos alterados

- `src/app-v2/data/appV2ClientesWriteDataAdapter.ts`
- `src/app-v2/data/appV2ClientesWriteDataAdapter.test.ts`
- `src/app-v2/data/appV2DataSourceFactory.ts`
- `src/app-v2/data/appV2DataSourceFactory.test.ts`
- `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`

## 5. Validacao esperada

```bash
npm test -- src/app-v2/data/appV2ClientesWriteDataAdapter.test.ts src/app-v2/data/appV2DataSourceFactory.test.ts --run
supabase test db supabase/tests/12_clientes_rls_contract.test.sql
npm run format
npm run build
npm run check
git diff --check
```

## 6. Riscos remanescentes

- Ainda nao ha sessao/auth real conectada ao app-v2.
- O preview segue local por padrao.
- Reconciliacao de relacionamentos dependentes de `clienteId` real continua fora
  desta CP.
- Equipamentos, setores, registros e orcamentos ainda usam IDs/mock locais.

## 7. Proximo CP recomendado

**CP-I - reconciliacao de IDs e leitura relacional minima para Cliente**

Plano detalhado:

- `docs/rewrite/app-v2-clientes-relational-ids-cp-i-plan.md`

Objetivo sugerido:

- mapear como equipamentos/setores devem trocar `clienteId` local por UUID real;
- definir se o primeiro relacionamento real sera equipamento ou setor;
- nao escrever relacionamento real ainda sem documento de contrato e teste RLS.
