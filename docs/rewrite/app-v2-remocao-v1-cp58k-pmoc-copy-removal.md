# app-v2 - CP-58K remocao de copias PMOC residuais

## Objetivo

Remover textos e comentarios residuais de PMOC em superficies legadas de
cliente, perfil, equipamentos e shell, sem alterar campos, payloads,
persistencia, Supabase/RLS, migrations, storage, PDF/share ou o checklist de
Registro.

## Escopo alterado

- `src/ui/components/clienteModal.js`
- `src/ui/components/onboarding/profileModal.js`
- `src/ui/views/equipamentos.js`
- `src/ui/views/equipamentos/setor/setorUI.js`
- `src/ui/views/equipamentos/crud/payload.js`
- `src/core/clientes.js`
- `src/core/state.js`
- `src/ui/controller/handlers/navigationHandlers.js`
- `src/ui/shell/templates/modals.js`
- `src/ui/shell/templates/views.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`

## O que mudou

- Copias de PMOC foram trocadas por textos neutros de documento tecnico,
  relatorio tecnico, contexto operacional ou classificacao de cliente.
- Comentarios legados de fase PMOC foram removidos dos pontos tocados.
- Foi adicionado contrato executavel para impedir a volta dessas copias nos
  arquivos de cliente, perfil, equipamentos e helpers tocados.

## Fora do escopo

- Checklist PMOC operacional de Registro.
- `src/domain/pmoc/**`.
- Supabase/RLS, migrations e storage.
- PDF/share, WhatsApp, assinatura, fotos, billing e PMOC real app-v2-native.

## Risco

Baixo. O corte altera textos e comentarios, mantendo IDs, campos, payloads e
contratos publicos.

## Validacao esperada

- `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
