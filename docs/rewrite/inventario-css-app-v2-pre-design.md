# Inventario CSS app-v2 pre-design

Data: 2026-05-16

HEAD analisado: `27fd5048d214a1068a6bbf86a25e3797ceee2ac1`

## Objetivo

Mapear como o CSS do `app-v2` esta organizado antes de novas etapas de design,
para evitar repetir o principal problema do v1: acumulacao visual global,
overrides sucessivos e estilos dificeis de rastrear.

Esta etapa e documental. Nao altera runtime, CSS, Tailwind, tokens,
componentes, testes, storage, Supabase/RLS, migrations, PMOC, pricing,
PDF/share, WhatsApp ou billing.

## Fontes analisadas

- `tailwind.config.cjs`
- `src/react/styles/tailwind.css`
- `src/app-v2/index.tsx`
- `src/app-v2/preview.html`
- `src/app-v2/styles/tokens.ts`
- `src/app-v2/styles/print.css`
- Varredura de `src/app-v2/` para imports CSS, `style=`, `!important`,
  `redesign.css`, imports de `src/ui`, imports de `src/core`, cores hexadecimais
  e usos de `appV2Tone`.
- Documentos normativos:
  - `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md`
  - `docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`

## Estado atual do CSS

| Item                    | Estado encontrado                                                                                                   | Leitura                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Tailwind                | Configurado em `tailwind.config.cjs` com `prefix: 'tw-'` e `preflight: false`.                                      | Correto para isolamento do app-v2.                                       |
| Conteudo Tailwind       | Inclui `./src/app-v2/**/*.{ts,tsx}` e `./src/react/**/*.{js,jsx,ts,tsx}`.                                           | App-v2 participa do build Tailwind, mas ainda compartilha entrada React. |
| CSS importado no app-v2 | `src/app-v2/index.tsx` importa `../react/styles/tailwind.css` e `./styles/print.css`.                               | Ha uma dependencia de arquivo CSS fora de `src/app-v2`.                  |
| CSS proprio do app-v2   | Apenas `src/app-v2/styles/print.css`.                                                                               | Nao ha acumulacao de CSS global proprio no app-v2.                       |
| Tokens app-v2           | `src/app-v2/styles/tokens.ts` exporta `appV2Tone` com classes Tailwind reutilizaveis.                               | Existe base de organizacao, mas ainda nao e um design token completo.    |
| Tema Tailwind           | `theme.extend.colors` possui namespace `landing.*`, nao `app-v2.*`.                                                 | App-v2 depende de classes arbitrarias e tokens em string.                |
| CSS legado/redesign     | Nenhuma ocorrencia de `redesign.css` em `src/app-v2/`.                                                              | Nao ha vazamento direto do CSS problematico do v1.                       |
| Imports de camadas v1   | Nenhuma ocorrencia de `src/ui` ou `src/core` na varredura focada de CSS/imports em `src/app-v2/`.                   | Nao ha acoplamento visual direto com shell legado neste recorte.         |
| `!important`            | Restrito a `src/app-v2/styles/print.css`, dentro de `@media print`.                                                 | Aceitavel como excecao de impressao; nao deve virar padrao de tela.      |
| Inline style            | `preview.html` usa `body style="margin: 0"`; `BottomNav.tsx` usa `transform`; `EquipmentList.tsx` usa cor dinamica. | Baixo risco, mas deve permanecer excecao justificada.                    |
| Classes nos componentes | Varredura encontrou 745 linhas com `className=` ou classes `tw-` em `src/app-v2/`.                                  | A linguagem visual esta majoritariamente embutida nos componentes.       |
| Cores hexadecimais      | Varredura encontrou 221 linhas com hex em `src/app-v2/`, incluindo tokens, componentes, mocks e testes.             | Principal risco antes de design amplo.                                   |
| Uso de `appV2Tone`      | Varredura encontrou 327 usos agrupados por arquivo.                                                                 | O token atual ajuda, mas convive com muitos valores diretos.             |

## O que esta saudavel

- O app-v2 nao importa `redesign.css`.
- O app-v2 nao possui arquivo CSS global proprio acumulando layout de tela.
- O Tailwind esta prefixado com `tw-`, reduzindo colisao com legado.
- O preflight do Tailwind esta desligado, reduzindo reset global indesejado.
- O unico `!important` aparece em CSS de impressao, nao em tela interativa.
- A base ja usa `appV2Tone` em muitos pontos, o que indica uma camada inicial de
  decisao visual reutilizavel.
- As regras documentais de Design System/UI ja bloqueiam CSS global solto,
  copia do v1 e redesign amplo sem checkpoint.

## Riscos de repetir o v1

1. Valores visuais hardcoded estao espalhados por muitos componentes.
   O risco nao e o Tailwind em si, mas cada tela decidir cor, borda, sombra,
   espacamento e hierarquia por conta propria.

2. `appV2Tone` e util, mas ainda e um conjunto de strings de classes.
   Ele cobre tons principais, mas nao formaliza tipografia, raio, sombra,
   densidade, espacos, estados de foco por componente ou variantes de superficie.

3. O arquivo Tailwind importado pelo app-v2 fica em `src/react/styles`.
   O conteudo e generico, mas a localizacao pode confundir a fronteira entre
   app-v2 e ciclos anteriores.

4. O tema Tailwind tem namespace `landing.*`, nao um namespace semantico do
   app-v2. Isso incentiva uso de `tw-bg-[#...]`, `tw-text-[#...]` e
   `tw-border-[#...]` em vez de papeis visuais nomeados.

5. Parte dos testes do app-v2 valida classes Tailwind especificas.
   Isso pode tornar uma futura etapa de design mais fragil se testes passarem a
   proteger implementacao visual em vez de comportamento ou contrato de UX.

6. `print.css` usa `!important` de forma concentrada e justificavel, mas deve
   continuar isolado a impressao. Qualquer novo `!important` em tela deve ser
   tratado como bloqueio tecnico.

7. A quantidade de classes em `className` indica que componentes ainda carregam
   muita decisao visual local. Em pequenas telas isso e aceitavel; em design
   amplo, vira custo de manutencao.

## Regras CSS obrigatorias antes de design

- Nao importar `redesign.css`, CSS do v1, shell legado, templates legados ou
  navegacao legada no app-v2.
- Nao criar novo CSS global para corrigir tela.
- Nao usar `!important` fora de `src/app-v2/styles/print.css`.
- Toda cor reutilizavel deve virar token ou variante antes de ser repetida em
  mais de um componente.
- Toda sombra, raio, borda, foco ou superficie repetida deve ser centralizada em
  token, primitive ou helper do app-v2.
- Classes arbitrarias de Tailwind continuam permitidas para caso pontual, mas
  nao podem virar padrao de sistema sem nome.
- Testes novos devem priorizar comportamento, texto, estados, acessibilidade e
  fluxo. Validar classe visual diretamente so quando ela for contrato explicito.
- Qualquer mudanca em `tailwind.config.cjs`, `src/react/styles/tailwind.css` ou
  criacao de novo CSS compartilhado deve ser etapa tecnica separada, nao parte
  de ajuste visual de tela.

## Recomendacao para a etapa de design

O app-v2 pode entrar em design, mas nao diretamente em redesign de telas.

Primeiro checkpoint recomendado:

1. Criar uma etapa curta de endurecimento do sistema visual do app-v2.
2. Decidir se `src/react/styles/tailwind.css` deve permanecer compartilhado ou
   se o app-v2 precisa de entrada CSS propria, sem alterar comportamento.
3. Expandir `src/app-v2/styles/tokens.ts` ou modulo equivalente com papeis
   semanticos minimos: superficie, texto, borda, foco, acao, status, raio,
   sombra e densidade.
4. Definir uma politica para reduzir novas cores hexadecimais diretas.
5. So depois executar design por area unica, com QA mobile/desktop e sem tocar
   storage, Supabase/RLS, migrations, PMOC, pricing, PDF/share, WhatsApp,
   billing, security hardening ou React Doctor.

Conclusao: nao ha sinal de contaminacao direta pelo CSS problematico do v1, mas
ha risco real de o app-v2 criar uma nova acumulacao se o design comecar sem
formalizar tokens e primitives. O aval para design deve ser condicionado a esse
checkpoint de CSS/tokens antes de qualquer passada visual ampla.

## Checkpoint executado - endurecimento inicial de tokens

Data: 2026-05-16

Recorte executado apos este inventario:

- `src/app-v2/styles/tokens.ts` passou a expor papeis semanticos iniciais:
  `appV2Text`, `appV2Surface`, `appV2Border`, `appV2Shadow`, `appV2Focus`,
  `appV2Interactive` e `appV2Status`.
- `appV2Tone` foi preservado como alias de compatibilidade para consumidores
  existentes.
- `src/app-v2/ui/primitives.tsx` passou a consumir os papeis semanticos em
  `SectionCard`, `StatusBadge`, `ListRow` e `ActionButton`.
- Variantes Tailwind como `hover:` e `disabled:` ficaram declaradas como classes
  completas em `appV2Interactive`, para evitar composicao dinamica que o Tailwind
  poderia nao detectar.

Escopo preservado:

- Nenhuma tela foi redesenhada.
- Nenhum CSS global novo foi criado.
- Nenhum import de CSS legado foi adicionado.
- Nenhuma mudanca em `tailwind.config.cjs`, `package.json`,
  `package-lock.json`, storage, Supabase/RLS, migrations, PMOC, pricing,
  PDF/share, WhatsApp, billing, security hardening ou React Doctor.

Resultado do checkpoint:

- A base ja tem papeis minimos para superficie, texto, borda, sombra, foco,
  interacao e status.
- A proxima etapa de design deve usar esses papeis antes de criar novas cores
  hexadecimais ou classes visuais repetidas.
- Ainda existe backlog de hardcodes visuais espalhados nas telas. Eles devem ser
  reduzidos por area, junto do primeiro checkpoint visual concreto, nao por
  varredura ampla.

## Checkpoint visual - Home Hoje alinhada ao mockup React

Data: 2026-05-16

Direcao adotada:

- Usar o mockup React/Tailwind enviado pelo usuario como referencia visual
  principal para a Home.
- Manter o shell real do app-v2, sem duplicar sidebar dentro da tela.
- Usar Font Awesome React, autorizado pelo usuario, para iconografia funcional
  da Home e da navegacao.
- Preservar o icone oficial do CoolTrack usado no v1 como marca do app-v2.
- Converter o mockup para Tailwind com prefixo `tw-` e para os dados/view models
  existentes do app-v2.

Escopo executado:

- `src/app-v2/home/HomeToday.tsx` recebeu a composicao visual compacta da Home:
  header com eyebrow e data, tres cards de resumo, card de proxima acao, fila
  curta e coluna lateral de resumo/alertas/proximo/lembrete.
- `src/app-v2/navigation/BottomNav.tsx` teve somente a sidebar desktop alinhada
  ao mockup: largura de 260px, ativo azul-marinho discreto, logo oficial do
  CoolTrack e iconografia Font Awesome. A bottom nav mobile foi preservada.
- O prototipo HTML estatico rejeitado foi removido para nao deixar artefato
  paralelo confundindo a decisao visual.

Escopo preservado:

- Nenhuma mudanca funcional em store, seletores, acoes, Supabase/RLS,
  migrations, PMOC, pricing, PDF/share, WhatsApp ou billing.
- Nenhuma mudanca funcional em rotas ou contratos de navegacao.
- Nenhuma mudanca visual na bottom nav mobile.
- Nenhum CSS global novo.

Risco controlado:

- A Home ainda contem valores visuais diretos herdados do mockup. Eles ficam
  aceitos neste checkpoint porque a prioridade foi validar a direcao visual da
  tela; a reducao incremental para tokens deve acontecer por area depois do QA
  visual.
