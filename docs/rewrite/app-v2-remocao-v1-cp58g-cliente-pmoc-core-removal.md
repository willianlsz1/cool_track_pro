# CP-58G - Remocao do helper core PMOC de Cliente

## Objetivo

Remover o helper legado `core/clientePmoc.js` depois que Clientes, Dashboard e
Historico deixaram de consumir essa superficie PMOC v1.

## Escopo executado

- Removido `src/core/clientePmoc.js`.
- Removido o teste dedicado `src/__tests__/clientePmoc.test.js`.
- Adicionado contrato para bloquear a volta do helper `buildClientePmocDetails`.

## Fora do escopo

- Checklist PMOC no Registro.
- Contexto preventiva/PMOC em Equipamentos.
- `src/core/pmocProgress.js` e `src/domain/pmoc/**`.
- Supabase, migrations, RLS, storage, PDF/share, billing e app-v2 runtime.

## Validacao esperada

- Scan de referencias para `clientePmoc` e `buildClientePmocDetails`.
- Teste focado de contrato de remocao v1.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
