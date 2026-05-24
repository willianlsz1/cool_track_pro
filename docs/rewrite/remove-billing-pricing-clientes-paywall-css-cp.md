# Remocao de billing/pricing - CSS paywall de clientes

## Objetivo

Remover estilos orfaos do antigo paywall de clientes apos a retirada das
superficies comerciais de billing, pricing, checkout e planos pagos.

## Alteracoes

- Removido o bloco `.clientes-paywall*` de `src/assets/styles/components.css`.
- Removidos overrides `.clientes-paywall*` de `src/assets/styles/redesign.css`.
- Removido o stub comercial `src/ui/components/upgradeNudge.js`, que ja
  retornava string vazia depois da retirada de billing/pricing.
- Removido o contrato morto `upgradeCta` do bloco operacional do Dashboard,
  incluindo o renderer escondido `appendUpgradeContract`.
- Renomeado o controle bloqueado do modal PMOC de `pmoc-upgrade` para
  `pmoc-unavailable`, mantendo a mensagem local de indisponibilidade sem nome
  de acao comercial.
- Neutralizadas mensagens comerciais do fluxo de leitura de placa por foto,
  tanto no cliente quanto na Edge Function `analyze-nameplate`, sem alterar
  limites operacionais ou reserva de quota.
- Removido o slot vazio `dash-upgrade-inline-hint` do Dashboard legado,
  incluindo contrato publico, template e limpeza runtime.
- Removidos estilos mortos `.upgrade-nudge-card*` e override
  `.upgrade-inline-hint` dos CSS legados.
- Removidos aliases comerciais antigos `manage-plan`, `upgrade` e
  `conta-manage-plan` da delegacao local de Conta.
- Adicionado contrato automatizado para impedir retorno desse CSS orfao e do
  stub/CTA de upgrade.

## Contratos preservados

- Nenhum renderer, rota, storage, PDF/share, WhatsApp, Supabase/RLS ou billing
  novo foi alterado.
- Os cards operacionais do Dashboard continuam renderizando alertas, clientes
  em risco e rascunho em andamento sem CTA comercial escondido.
- A camada tecnica de planos/limites permanece como compatibilidade operacional
  para fluxos legados que ainda dependem desses helpers.

## Fora de escopo

- Reescrever a area comercial futura.
- Remover helpers tecnicos de plano usados por PDF, fotos, assinatura,
  nameplate, relatorios ou quotas.
- Remover documentacao historica que cita billing/pricing como contexto de
  migracao.

## Validacao

- RED inicial: `npm test -- src/__tests__/billingPricingCleanupContracts.test.js --run`
  falhou enquanto `.clientes-paywall*` ainda existia nos CSS legados.
- GREEN: o mesmo teste passou apos a remocao dos blocos orfaos.
- RED adicional: o teste falhou enquanto o stub `upgradeNudge.js` existia.
- RED adicional: o teste falhou enquanto `upgradeCta` ainda existia no modelo
  do Dashboard.
- RED adicional: o teste falhou enquanto o modal PMOC bloqueado ainda continha
  o id comercial `pmoc-upgrade`.
- RED adicional: o teste falhou enquanto nameplate ainda orientava upgrade ou
  assinatura de plano pago.
- RED adicional: o teste falhou enquanto `dash-upgrade-inline-hint`,
  `.upgrade-nudge-card*` e aliases comerciais de Conta ainda existiam.
- GREEN adicional: `billingPricingCleanupContracts` e
  `dashboardLegacyProDraftContracts` passaram apos remover o contrato morto.
- GREEN adicional: `billingPricingCleanupContracts` passou apos remover o slot,
  estilos e aliases comerciais restantes deste checkpoint.

## Riscos remanescentes

- Outros termos historicos de paywall/upgrade continuam existindo em fluxos
  tecnicos sensiveis, principalmente fotos, assinatura, nameplate, PDF/share e
  quotas. Eles devem ser tratados em checkpoints proprios para evitar regressao.
