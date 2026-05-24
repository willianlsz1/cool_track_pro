# Remocao de billing/pricing - CSS paywall de clientes

## Objetivo

Remover estilos orfaos do antigo paywall de clientes apos a retirada das
superficies comerciais de billing, pricing, checkout e planos pagos.

## Alteracoes

- Removido o bloco `.clientes-paywall*` de `src/assets/styles/components.css`.
- Removidos overrides `.clientes-paywall*` de `src/assets/styles/redesign.css`.
- Adicionado contrato automatizado para impedir retorno desse CSS orfao.

## Contratos preservados

- Nenhum renderer, rota, storage, PDF/share, WhatsApp, Supabase/RLS ou billing
  novo foi alterado.
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

## Riscos remanescentes

- Outros termos historicos de paywall/upgrade continuam existindo em fluxos
  tecnicos sensiveis, principalmente fotos, assinatura, nameplate, PDF/share e
  quotas. Eles devem ser tratados em checkpoints proprios para evitar regressao.
