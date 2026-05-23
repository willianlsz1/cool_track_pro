# Configuracoes/Conta fase 6 - encerramento documental do ciclo local

Data: 2026-05-16

## Objetivo

Consolidar o encerramento documental do ciclo local de `Conta` no app-v2 e
recalcular o impacto de paridade funcional depois das fases 1 a 5.

## Escopo

- Registrar que `Conta` deixou de ser placeholder no criterio mock/local.
- Consolidar evidencias das fases 1 a 5.
- Atualizar matriz de paridade e auditoria funcional v1-v2.
- Separar explicitamente o que permanece fora do ciclo local.
- Definir o proximo passo recomendado sem abrir integracoes sensiveis.

## Fora de escopo

- Persistencia em storage real ou localStorage.
- Perfil real, billing, assinatura ou feature paga.
- Supabase/RLS, migrations ou permissoes.
- PMOC.
- PDF/share real.
- WhatsApp real.
- Router novo.
- Redesign amplo, tokens globais novos ou CSS global.

## Evidencias consolidadas

- Fase 1 criou o contrato local de atalhos, preferencias e ajuda.
- Fase 2 implementou view model e UI minima de `Conta`.
- Fase 3 aplicou preferencias locais em comportamento visivel limitado.
- Fase 4 consolidou microcopy e estados locais.
- Fase 5 revisou acessibilidade e resiliencia local de texto.

## Recalculo documental

No recorte dos 38 itens da auditoria funcional, `Configuracoes/Conta` deixa de
ser classificado como `pendente UI minima` e passa para `coberto por substituicao
v2` no criterio mock/local.

Impacto estimado:

- Cobertura anterior: 28,0 / 38 itens = aproximadamente 74%.
- Cobertura apos encerramento local de Conta: 29,0 / 38 itens =
  aproximadamente 76%.
- Registro de Servico permanece em aproximadamente 97%, pois esta fase nao muda
  esse fluxo.

## Decisao

O ciclo local de `Conta` fica encerrado como cobertura funcional mock/local. As
lacunas restantes pertencem a etapas proprias, principalmente perfil real,
persistencia, billing, assinatura, Supabase/RLS, migrations e PMOC.

## Proximo passo recomendado

Design System/UI fase 1 documental: criar regras de design do app-v2 em
`docs/rewrite/` antes de qualquer refinamento visual amplo, sem alterar CSS,
componentes, primitives, storage, Supabase/RLS, PMOC, PDF/share, WhatsApp,
billing, assinatura ou migrations.
