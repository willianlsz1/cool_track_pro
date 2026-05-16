# Design System/UI fase 1 - regras documentais do app-v2

Data: 2026-05-16

## Objetivo

Consolidar a primeira etapa documental de Design System/UI do app-v2 antes de
qualquer refinamento visual amplo ou mudanca em CSS/componentes.

## Escopo

- Usar `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md` como fonte
  normativa inicial.
- Reforcar regras para nao repetir problemas do v1.
- Separar design documental de implementacao visual.
- Definir o proximo checkpoint visual seguro.

## Fora de escopo

- Alterar CSS, Tailwind, tokens, componentes, primitives ou layout runtime.
- Criar nova biblioteca de UI.
- Copiar UI, CSS, templates, shell ou navegacao do v1.
- Refatorar telas existentes.
- Mudar storage, Supabase/RLS, billing, assinatura, PMOC, PDF/share, WhatsApp ou
  migrations.

## Decisoes consolidadas

- O app-v2 continua com React, TypeScript, Vite e Tailwind com prefixo `tw-`.
- Tokens em `src/app-v2/styles/tokens.ts` continuam como camada de organizacao,
  nao como tema final completo.
- O refinamento visual deve ser por uma area pequena por checkpoint.
- Cards devem ser usados para itens, blocos operacionais ou agrupamentos reais,
  sem empilhar cards dentro de cards.
- Status deve usar texto e cor, nunca somente cor.
- Texto longo, estado vazio, muitos itens, foco de teclado, mobile estreito e
  desktop largo entram no criterio minimo de validacao visual.

## Erros do v1 que esta fase bloqueia

- CSS global acumulado e dificil de rastrear.
- Overrides sucessivos para compensar decisao visual fraca.
- Uso de `redesign.css` como base indireta.
- Mistura de regra de negocio com renderizacao.
- Modais grandes atuando como paginas completas.
- Visual mais decorativo que operacional durante atendimento tecnico.

## Contrato para proximas etapas visuais

Antes de qualquer mudanca visual de codigo, a etapa deve declarar:

1. Area unica afetada.
2. Componentes afetados.
3. Tokens ou classes novas esperadas.
4. Estados a validar: vazio, carregado, muitos itens, texto longo, foco,
   mobile e desktop.
5. Comandos/testes de verificacao.
6. O que continuara fora do escopo.

## Proximo passo recomendado

Design System/UI fase 2: escolher uma unica area candidata para refinamento
visual controlado, preferencialmente Home Hoje, e criar plano/checklist antes de
alterar qualquer CSS, token ou componente.
