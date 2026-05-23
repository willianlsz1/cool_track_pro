# Design System/UI fase 2 - Home Hoje checklist visual

Data: 2026-05-16

## Objetivo

Escolher uma unica area candidata para o primeiro refinamento visual controlado
do app-v2 e registrar checklist antes de qualquer mudanca em CSS, tokens,
componentes ou runtime.

## Area escolhida

`Home Hoje`.

Justificativa:

- ja era a recomendacao de `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md`;
- concentra a proxima acao do tecnico e a leitura rapida do turno;
- possui componentes pequenos e identificaveis;
- permite validar hierarquia, densidade, texto longo, mobile e desktop sem tocar
  em storage, Supabase/RLS, billing, PMOC, PDF/share ou WhatsApp.

## Arquivos candidatos para etapa visual futura

- `src/app-v2/home/HomeToday.tsx`;
- `src/app-v2/home/NextActionCard.tsx`;
- `src/app-v2/home/ShortQueue.tsx`;
- `src/app-v2/home/homeViewModel.ts`;
- `src/app-v2/home/homeViewModel.test.ts`;
- `src/app-v2/styles/tokens.ts`, somente se houver decisao visual reutilizavel.

## Escopo permitido para a etapa visual futura

- Refinar hierarquia visual da Home.
- Ajustar densidade e espacamento dentro da area Home.
- Melhorar leitura de proxima acao, fila curta e resumo auxiliar.
- Corrigir overflow de texto longo.
- Ajustar estados visuais usando tokens existentes ou novos tokens justificados.
- Atualizar testes se houver contrato renderizado relevante.

## Fora de escopo

- Alterar shell inteiro, BottomNav, router ou navegacao global.
- Alterar Equipamentos, Servicos, Conta ou Orcamentos.
- Copiar UI, CSS, templates ou navegacao do v1.
- Criar dependencia ou biblioteca de UI.
- Mudar storage, Supabase/RLS, billing, assinatura, PMOC, PDF/share, WhatsApp ou
  migrations.
- Tratar security hardening, React Doctor, warnings Vite ou PDF/share.

## Checklist obrigatorio antes de codigo

1. Confirmar objetivo visual em uma frase.
2. Declarar se `src/app-v2/styles/tokens.ts` sera tocado ou nao.
3. Listar componentes afetados.
4. Definir estados de validacao:
   - mobile 390px;
   - desktop 1366px;
   - desktop largo 1920px;
   - texto longo em equipamento, cliente/local e motivo;
   - estado sem alertas;
   - muitos compromissos/alertas;
   - foco de teclado em CTAs.
5. Declarar comandos/testes antes de editar runtime.

## Validacao esperada para etapa visual futura

- Teste focado da Home quando houver mudanca de contrato renderizado.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- Validacao visual em browser para mobile e desktop.
- `git diff --check`.

## Proximo passo recomendado

Design System/UI fase 3: executar QA visual inicial da Home Hoje em browser e,
somente com evidencia de problema concreto, aplicar um refinamento pequeno em
Home Hoje com testes e validacao visual.
