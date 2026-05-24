# app-v2 - CP54A - Remocao de Orcamentos v1

## 1. Objetivo

Remover a cadeia visual legada de Orcamentos v1 depois da promocao do app-v2,
mantendo o fluxo local/mock de orcamentos em `Servicos > Orcamentos`.

Este CP nao recria orcamento real, nao altera migrations, nao muda PDF/share,
nao muda WhatsApp, nao muda token publico, nao muda assinatura e nao altera
storage real.

## 2. Evidencia de escopo

Busca executada antes da remocao:

```bash
rg -n "orcamentoHandlers|views/orcamentos|views\\orcamentos|orcamentos\\.js|renderOrcamentos|loadAndRenderOrcamentos|setOrcStatusFilter|setOrcBusca|deleteOrcamentoFlow|markOrcamentoApproved|orcamentoModal|OrcamentoModal|ORCAMENTO_ACTIONS|view-orcamentos|go-orcamentos" src index.html public e2e
```

Resultado:

- `src/ui/views/orcamentos.js` era a view DOM v1.
- `src/ui/components/orcamentoModal.js` reabria a view v1 e chamava handlers
  v1 de PDF/share.
- `src/ui/controller/handlers/orcamentoHandlers.js` era o ponto de acao da
  cadeia v1.
- `src/ui/viewModels/orcamentosViewModel.js` ficava restrito a essa cadeia e
  seus testes dedicados.
- `src/app-v2/**` usa `ServicesQuotesHome`, `servicesQuotesViewModel` e
  actions locais proprias.

## 3. Alteracoes

- Removida a view DOM v1 `src/ui/views/orcamentos.js`.
- Removido o modal v1 `src/ui/components/orcamentoModal.js`.
- Removido o handler v1 `src/ui/controller/handlers/orcamentoHandlers.js`.
- Removido o view model v1 `src/ui/viewModels/orcamentosViewModel.js`.
- Removido o placeholder `#view-orcamentos` do template v1.
- Removido `orcamentos` do layout de navegacao legado.
- Removido o atalho legado `go-orcamentos`.
- Removida a acao `Novo orcamento` dos cards legados de Clientes.
- Aposentados os testes dedicados da view/view model v1 de Orcamentos.
- Atualizados gates de remocao para impedir retorno da cadeia v1.

## 4. Fora de escopo

- `src/core/orcamentos.js`.
- `src/domain/orcamentoFollowUp.js`.
- migrations e RLS de `orcamentos`.
- PDF/share/WhatsApp de relatorios ou historico.
- orcamento real app-v2-native.

## 5. Validacao esperada

```bash
rg -n "orcamentoHandlers|views/orcamentos|views\\orcamentos|renderOrcamentos|OrcamentoModal|ORCAMENTO_ACTIONS|view-orcamentos|go-orcamentos|novo-orcamento|Novo orçamento" src index.html public e2e
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/navigationMode.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
