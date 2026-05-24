# CP-3p - Remocao da ilha React do header do Registro

## Objetivo

Remover `registroHeaderIsland` do runtime legado/v1 mantendo os contratos
publicos do header de Registro usados por handlers, checklist, assinatura,
PDF/WhatsApp e ciclo de rota.

## Alteracoes

- Criado `src/ui/views/registro/headerRenderer.js` com sincronizacao DOM segura
  sobre o template legado existente.
- `src/ui/views/registro.js` deixou de importar dinamicamente
  `registroHeaderIsland`.
- Removidos:
  - `src/react/entrypoints/registroHeaderIsland.jsx`
  - `src/react/pages/RegistroHeader.jsx`
  - `src/__tests__/registroHeaderIsland.test.jsx`
- Atualizados testes que esperavam `data-react-registro-header-mounted` ou mock
  direto da ilha React.

## Contratos preservados

- Root publico `#registro-header-root`.
- Campos publicos:
  - `#r-equip`
  - `#r-data`
  - `#r-tipo`
  - `#r-tipo-custom`
  - `#r-obs`
  - `#r-tecnico`
- Acoes delegadas:
  - `quick-service-template`
  - `open-equip-picker`
- Contexto operacional:
  - `#registro-context-card`
  - `#registro-context-cliente`
  - `#registro-context-setor`
  - `#registro-context-equip`
  - `#registro-context-hint`
- Hero/progresso:
  - `#registro-hero`
  - `#registro-hero-meter`
  - `#form-progress-count`
  - `#registro-hero-pill-text`

## Fora de escopo

- Remocao da ilha React de checklist do Registro.
- PDF/share, storage, WhatsApp real, assinatura real, router, billing,
  Supabase/RLS ou app-v2.

## Validacao executada

```bash
npm test -- src/__tests__/registroLegacyHeaderRender.test.js src/__tests__/registroLegacyFieldHandlers.test.js --run
npm test -- src/__tests__/registroLegacyHeaderRender.test.js src/__tests__/registroLegacyFieldHandlers.test.js src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/registroChecklistHandlers.test.js src/__tests__/registroLifecycle.contract.test.js src/__tests__/registroLegacySignatureRender.test.js src/__tests__/registroMateriaisToggle.test.js src/__tests__/registroPdfWhatsappLegacyContracts.test.js src/__tests__/registroPostSaveLegacyFlow.test.js src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/contracts/registroSelectors.test.js src/__tests__/contracts/routes.test.js src/__tests__/registroRouteLifecycle.test.js --run
```

Observacao: o conjunto focado ainda emite warning de `act(...)` associado ao
checklist React legado. O warning nao foi introduzido pelo header DOM e fica
fora deste checkpoint.
