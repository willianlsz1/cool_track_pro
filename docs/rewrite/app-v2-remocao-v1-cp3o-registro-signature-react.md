# CP-3o - Remocao da ilha React de assinatura do registro

## Objetivo

Remover `registroSignatureIsland` do runtime legado/v1 mantendo os contratos
publicos do bloco de assinatura usados pelos handlers de Registro.

## Alteracoes

- Criado `src/ui/views/registro/signatureHint.js` com renderizacao DOM segura.
- `src/ui/views/registro.js` deixou de importar dinamicamente a ilha React de
  assinatura.
- Removidos:
  - `src/react/entrypoints/registroSignatureIsland.jsx`
  - `src/react/pages/RegistroSignature.jsx`
  - `src/__tests__/registroSignatureIsland.test.jsx`
- Adicionado `src/__tests__/registroSignatureHint.test.js`.
- Atualizados testes que ainda esperavam `data-react-registro-signature-mounted`
  ou mocks da ilha React.

## Contratos preservados

- Root publico `#registro-signature-hint`.
- Acoes delegadas:
  - `signature-upsell-cta`
  - `registro-signature-capture`
  - `registro-signature-open`
  - `registro-signature-remove`
- Classes publicas `registro-sig-hint*`.
- Preview aceita apenas `data:image/png`, `jpeg/jpg` e `webp` validados pelo
  view model.

## Fora de escopo

- Assinatura real, PDF/share, storage, WhatsApp, billing, router ou app-v2.
- Remocao das ilhas React de header/checklist do Registro.

## Validacao esperada

```bash
npm test -- src/__tests__/registroSignatureHint.test.js src/__tests__/registroSignatureLegacyHandlers.test.jsx src/__tests__/registroLifecycle.contract.test.js src/__tests__/registroPdfWhatsappLegacyContracts.test.js src/__tests__/registroMateriaisToggle.test.js src/__tests__/registroProximaPreventivaPrompt.test.js src/__tests__/contracts/registroSelectors.test.js --run
rg -n "registroSignatureIsland|RegistroSignature|mountRegistroSignatureReact|unmountRegistroSignatureReact|reactRegistroSignatureMounted|data-react-registro-signature" src\ui src\react src\__tests__ index.html public -S
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
