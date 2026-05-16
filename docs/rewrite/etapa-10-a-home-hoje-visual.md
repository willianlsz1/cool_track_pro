# Etapa 10-A - Home Hoje visual do app-v2

## Objetivo

Implementar no `app-v2` o refinamento visual aprovado da Home Hoje, usando o
mockup como referencia de hierarquia, distribuicao e linguagem visual, sem
redesenhar o shell inteiro e sem tocar no app legado/v1.

## Mockup usado como referencia

O mockup aprovado define uma tela de turno tecnico com:

- fundo claro e neutro;
- cabecalho com marca, contexto do turno e data;
- resumo rapido com tres indicadores;
- card principal de proxima acao;
- fila curta escaneavel;
- area lateral auxiliar no desktop.

A implementacao nao copia pixel a pixel. Ela preserva os contratos funcionais do
app-v2 e adapta a intencao visual para os componentes atuais.

## Arquivos alterados

- `src/app-v2/home/HomeToday.tsx`;
- `src/app-v2/home/NextActionCard.tsx`;
- `src/app-v2/home/ShortQueue.tsx`;
- `src/app-v2/home/homeViewModel.ts`;
- `src/app-v2/home/homeViewModel.test.ts`.

## Decisoes visuais aplicadas

- A Home deixou de usar largura de prototipo mobile no desktop e passou a usar
  grid responsivo com coluna principal e area lateral auxiliar.
- O cabecalho agora comunica `CoolTrack Pro`, `app-v2`, `Hoje`,
  `Atendimentos de hoje` e a data mockada derivada do view model.
- O resumo rapido mostra servicos hoje, vencidos e proximo atendimento.
- A proxima acao virou o bloco dominante, com label textual, status com texto e
  cor, equipamento, cliente/local, motivo e dois CTAs integrados.
- A fila curta virou lista leve, com status a esquerda, texto tecnico no centro,
  badge a direita e affordance de abertura do item.
- No desktop, a coluna auxiliar mostra resumo do turno, proximo na fila e um
  lembrete tecnico leve.
- O polimento 10-A.1 removeu marcadores textuais confusos como `OS`, `45` e `h`,
  removeu tempo estimado e trocou a dica por um lembrete tecnico leve.
- O polimento 10-A.1 tambem compactou a Home sem reset global: as margens
  padrao de titulos e paragrafos da propria Home foram zeradas nos componentes
  afetados, evitando espaco vazio no cabecalho e melhorando a convivencia com a
  bottom nav.

## Diferencas intencionais em relacao ao mockup

- O card principal usa foto quando `imageUrl` existir no view model; como a store
  mockada atual nao tem foto de equipamento, a Home usa fallback tecnico limpo.
- O link `Ver todos` da fila curta e visual nesta etapa; a navegacao completa de
  lista/filtro fica para etapa propria se for necessario.
- Nao ha calculo de tempo nesta etapa.

## O que nao mudou

- App legado/v1;
- CSS legado;
- `redesign.css`;
- `package.json` e `package-lock.json`;
- dependencias;
- shadcn;
- Supabase, storage real, billing, PDF/share, WhatsApp, PMOC real, assinatura ou
  orcamento real;
- Equipamentos, Servicos, Conta ou shell inteiro.

## Validacao mobile/desktop

Validar antes de concluir a etapa:

- mobile 390px: coluna unica, proxima acao no topo, resumo compacto e sem
  overflow horizontal;
- desktop 1366px: conteudo principal e area lateral aparecem como uma tela de
  turno, nao como mobile esticado;
- desktop 1920px: largura maxima segura, sem espalhar informacao alem do
  necessario;
- status continuam usando texto + cor;
- CTA principal continua claro;
- bottom nav continua acessivel.

## Riscos remanescentes

- A Home ainda usa dados mockados; agenda real, fotos reais de equipamento e
  destino funcional de `Ver todos` devem virar etapas proprias.
- A area lateral existe apenas no desktop; se o usuario quiser algo equivalente
  no mobile, isso deve ser decidido separadamente para nao aumentar altura dos
  cards.
- A acao `Ver todos` precisa de decisao futura de destino real antes de virar
  navegacao funcional.

## Proximo passo recomendado

Revisar visualmente a Home Hoje no navegador. Se aprovada, consolidar a etapa em
commit e escolher entre:

- ajustar pequenos detalhes da propria Home;
- iniciar refinamento controlado de Equipamentos;
- documentar o destino funcional de `Ver todos` antes de ativar a acao.
