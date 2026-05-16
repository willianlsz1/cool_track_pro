# Etapa 10 - Regras de Design System/UI do app-v2

## Objetivo

Definir regras praticas para qualquer refinamento visual do `app-v2` antes da
Etapa 10-A. Este documento nao autoriza mudanca visual por si so; ele cria o
contrato minimo para evitar repetir problemas do app v1.

Atualizacao 2026-05-16: a Design System/UI fase 1 documental consolida este
arquivo como fonte normativa inicial. As fases 2 a 4 aplicaram o primeiro ciclo
controlado em Home Hoje, com checklist, QA visual, dois ajustes pequenos e
fechamento por evidencia. Esse ciclo nao autoriza redesign geral; ele confirma
que novos refinamentos visuais devem continuar por area unica e problema
concreto.

Atualizacao 2026-05-16 pos fase 12: a primeira passada visual do app-v2 fica
documentalmente fechada para Home Hoje, Equipamentos, Servicos e Conta no
recorte local. Novos ciclos visuais dessas areas exigem achado objetivo ou novo
fluxo funcional que altere densidade/hierarquia; preferencia estetica isolada
nao reabre visual.

## Contexto

O `app-v2` ja possui fundacao mockada, shell operacional, navegacao principal e
fluxos de Home, Equipamentos e Servicos em `src/app-v2/`. O sistema visual atual
usa React, TypeScript, Tailwind com prefixo `tw-` e tokens em
`src/app-v2/styles/tokens.ts`.

O proximo trabalho visual deve partir dessa base, sem copiar CSS, shell,
templates ou padroes problematicos do legado.

## Problemas do v1 que nao devem se repetir

- CSS acumulado por camadas, com regras globais dificeis de rastrear.
- Overrides sucessivos para corrigir decisoes visuais anteriores.
- Uso de arquivos como `redesign.css` como base indireta de novas telas.
- Estilos vazando entre abas, modais e componentes.
- Modais grandes funcionando como paginas completas.
- Cards dentro de cards sem hierarquia clara.
- Telas bonitas, mas lentas de escanear durante atendimento tecnico.
- Estados comunicados apenas por cor.

## Principios de UI/UX

- Cada tela deve responder rapidamente: "o que o tecnico faz agora?"
- Cada tela deve ter uma acao principal clara.
- Informacao tecnica deve ser facil de escanear em poucos segundos.
- Mobile e desktop devem seguir o mesmo sistema visual, mudando densidade e
  distribuicao, nao linguagem.
- Status sempre usa texto + cor, nunca apenas cor.
- Estado vazio deve orientar a proxima acao possivel.
- A interface deve priorizar trabalho repetido, nao marketing.
- Evitar "quadrado dentro de quadrado"; use cards apenas para itens, blocos
  operacionais ou agrupamentos realmente necessarios.

## Regras de CSS e escopo

- Nao criar CSS global solto.
- Nao usar `!important` como solucao padrao.
- Nao empilhar overrides para forcar layout.
- Nao reutilizar `redesign.css` como base do app-v2.
- Todo estilo novo deve ser escopado ao app-v2, componente, token ou layout.
- Tailwind deve manter prefixo `tw-`.
- Classes muito repetidas devem virar token, helper local ou componente base.
- Nao misturar classes do CSS legado com componentes do app-v2.
- Apos mudanca visual bem-sucedida, CSS obsoleto da area afetada deve ser
  removido quando comprovadamente seguro.

## Regras de tokens

- Tokens vivem em `src/app-v2/styles/tokens.ts` ou modulo equivalente do app-v2.
- Tokens devem representar decisao reutilizavel: cor, foco, superficie, borda,
  texto, acao, sucesso, alerta e perigo.
- Nao criar token para valor usado uma unica vez sem previsao clara de reuso.
- Nao espalhar novas cores hexadecimais se elas representam papel ja existente.
- A paleta principal continua azul e branco, com contraste forte para texto.
- Texto cinza deve ser legivel em mobile; se a leitura ficar fraca, escurecer o
  token em vez de corrigir tela por tela.

## Componentes base

Os componentes abaixo devem guiar o app-v2 antes de criar variacoes novas:

- `AppV2Shell`: estrutura da experiencia e navegacao.
- `BottomNav`: navegacao principal mobile.
- `HomeToday`, `NextActionCard`, `ShortQueue`: prioridade operacional da Home.
- `EquipmentList`, `EquipmentCard`, `EquipmentDetail`: lista e detalhe tecnico.
- `ServiceFlow`, `ServicesHome`, `RecentServiceCard`, `ServiceOutputPill`:
  registro e central de servicos.

Novos componentes devem nascer pequenos, com responsabilidade unica e sem regra
de negocio misturada na renderizacao.

## Modal, sheet e drawer

- Modal e para decisao curta, confirmacao ou edicao pequena.
- Sheet e para acao contextual curta no mobile.
- Drawer e para navegacao auxiliar ou detalhes laterais no desktop.
- Nenhum deles deve virar pagina completa escondida.
- Se o conteudo exigir muitas secoes, filtros, historico ou fluxo de etapas,
  deve ser uma tela.
- Todo overlay precisa ter titulo claro, acao principal, cancelamento seguro e
  comportamento previsivel em mobile.

## Hierarquia visual

- Uma tela deve ter um titulo principal, contexto curto e uma acao dominante.
- Use tamanho, peso e espacamento para hierarquia antes de adicionar bordas.
- Cards repetidos devem ter estrutura consistente.
- Blocos secundarios devem ser visualmente mais calmos que a acao principal.
- Filtros e contadores nao devem competir com a proxima acao do tecnico.
- Texto longo deve quebrar sem estourar containers.
- Listas devem continuar usaveis com muitos itens, poucos itens e nenhum item.

## Criterios minimos de validacao visual

Antes de considerar qualquer mudanca visual concluida:

- validar mobile estreito;
- validar desktop/largura maior;
- validar rolagem com bottom nav;
- validar texto longo em titulo, cliente, equipamento e local;
- validar estado vazio;
- validar estado com muitos itens;
- validar contraste de texto principal e secundario;
- validar foco de teclado quando houver input ou botao;
- confirmar que nenhum CSS legado foi importado ou copiado;
- confirmar que nao houve mudanca funcional fora do escopo visual.

## Contrato para checkpoints visuais

Todo checkpoint visual futuro deve declarar antes de editar codigo:

- area unica afetada;
- componentes afetados;
- tokens, helpers ou classes novas esperadas;
- estados obrigatorios de validacao: vazio, carregado, muitos itens, texto
  longo, foco, mobile estreito e desktop largo;
- comandos/testes de verificacao;
- escopo proibido preservado.

O checkpoint visual nao deve misturar redesign, storage, Supabase/RLS, billing,
assinatura, PMOC, PDF/share, WhatsApp, migrations, security hardening, React
Doctor ou limpeza ampla de imports.

## Duvidas e recomendacao segura

Ainda nao ha decisao final sobre uma biblioteca de componentes. A recomendacao
segura e continuar com componentes proprios pequenos, Tailwind `tw-` e tokens do
app-v2 ate surgir necessidade real de biblioteca externa.

## Proximo passo recomendado

Reauditoria funcional documental pos-fechamento visual: revisar a matriz UX
v1-v2 e escolher uma unica proxima lacuna nao sensivel entre Historico/filtros,
Relatorios locais, Orcamentos mock/action e Clientes filtros/relatorio local,
sem implementar runtime nesta etapa e mantendo PMOC, Supabase/RLS, migrations,
storage real, billing real, assinatura, PDF/share, WhatsApp, perfil real,
security hardening e React Doctor em etapas proprias.
