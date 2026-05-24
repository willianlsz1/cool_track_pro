# app-v2 - Remocao v1 CP56 - Signature persisted field plan

## Objetivo

Mapear o corte seguro do campo persistido `registros.assinatura` depois da
aposentadoria da UI, storage dedicado, router, historico e copy de assinatura
v1.

Este CP nao altera runtime. Ele define a ordem de execucao para nao misturar
storage/sync/schema, Supabase/RLS, orcamentos e billing.

## Estado atual encontrado

### Registro local

- `src/ui/views/registro.js` ainda passa `assinaturaPayload: false` para manter
  o shape de criacao.
- `src/ui/views/registro/save/persistence.js` ainda grava
  `assinatura: assinaturaPayload`.
- Testes ainda travam esse shape em:
  - `src/__tests__/registroSaveSignatureHandlers.test.js`
  - `src/__tests__/exploratory/signature-payload.test.js`
  - `src/__tests__/registroSavePersistenceHelpers.test.js`

### Storage/sync

- `src/core/storage/storageNormalizers.js`
- `src/core/storage/normalizers.js`
- `src/core/storage/storageRemoteSync.js`
- `src/core/storage/remote.js`
- `src/__tests__/storage.integration.test.js`
- `src/__tests__/storageCacheOffline.contract.test.js`

Esses arquivos ainda normalizam ou sincronizam `assinatura` em registros.

### Supabase/RLS

- `supabase/migrations/20260411000000_baseline_core_tables.sql` declara
  `registros.assinatura boolean default false`.
- `supabase/migrations/20260509210000_enforce_signature_plan_gate.sql` adiciona
  trigger/helper/policies para assinatura de registros.
- `supabase/tests/10_signature_plan_gate.test.sql` testa esse gate.
- `supabase/tests/README.md` documenta o contrato.

### Fora da trilha Registro

- `src/core/orcamentos.js`,
  `supabase/migrations/20260426170000_orcamentos_assinatura_digital.sql` e
  `src/domain/orcamentoFollowUp.js` pertencem a assinatura de orcamento e devem
  virar CP proprio.
- `src/core/plans/subscriptionPlans.js` ainda tem
  `FEATURE_DIGITAL_SIGNATURE`; isso pertence a billing/features e deve virar CP
  proprio.

## Ordem recomendada

### CP56A - Registro local sem campo assinatura

Escopo:

- Remover `assinaturaPayload` do save de Registro.
- Remover `assinatura` do payload criado por
  `src/ui/views/registro/save/persistence.js`.
- Atualizar testes de Registro para esperar ausencia do campo, nao
  `assinatura: false`.

Validacao:

```bash
npm test -- src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/exploratory/signature-payload.test.js src/__tests__/registroSavePersistenceHelpers.test.js --run
npm run format
npm run build
npm run check
```

### CP56B - Storage/sync sem assinatura de registros

Escopo:

- Remover normalizacao/sync de `assinatura` nos adaptadores locais/remotos.
- Atualizar testes de storage para nao depender desse shape.
- Nao alterar Supabase/RLS ainda.

Validacao:

```bash
npm test -- src/__tests__/storage.integration.test.js src/__tests__/storageCacheOffline.contract.test.js --run
npm run format
npm run build
npm run check
```

### CP56C - Supabase/RLS assinatura de registros

Escopo:

- Avaliar se a coluna `registros.assinatura` deve permanecer por compatibilidade
  historica ou ganhar migration de desuso.
- Se removida/descontinuada, aposentar trigger/helper/policies e
  `supabase/tests/10_signature_plan_gate.test.sql`.
- Validar com Supabase CLI quando disponivel.

Validacao:

```bash
supabase test db
npm run format
npm run build
npm run check
```

Bloqueio aceitavel:

- Se Docker/Supabase local nao estiver disponivel, nao aplicar migration sem
  validacao objetiva.

### CP56D - Orcamentos assinatura digital

Escopo:

- Tratar `orc-sign`, status `aguardando_assinatura`,
  `assinatura_cliente_dataurl` e RPCs de orcamento.
- Nao misturar com Registro.

### CP56E - Billing/feature flag

Escopo:

- Remover `FEATURE_DIGITAL_SIGNATURE` e gates comerciais relacionados, se ainda
  sem consumidor.
- Nao misturar com Supabase/RLS.

## Riscos

- Remover o campo local antes de ajustar normalizers pode recriar
  `assinatura: false` silenciosamente.
- Remover Supabase/RLS sem `supabase test db` pode quebrar migrations antigas ou
  shadow DB.
- Orcamentos usam outra assinatura e outro schema; misturar com Registro pode
  apagar funcionalidade errada.
- Billing/features deve ficar separado porque o usuario pediu refazer billing em
  etapa propria.
