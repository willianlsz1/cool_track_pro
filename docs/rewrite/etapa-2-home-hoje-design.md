# Etapa 2 - Design da Home Hoje

## 1. Objetivo

Criar um prototipo navegavel da **Home operacional Hoje** no `src/app-v2/`, com dados mockados, visual real e sem conexao com storage, rotas ou shell legado.

A tela deve responder rapidamente:

> O que o tecnico faz agora?

## 2. Decisoes confirmadas

1. A Home deve ser **comando operacional**, nao agenda completa nem dashboard.
2. A postura inicial deve ser direta: **Hoje** + **Proxima acao**.
3. Nao usar saudacao grande como "Ola, Joao".
4. Pode haver contexto discreto como data ou turno.
5. A Proxima acao deve ter motivo operacional curto.
6. O CTA deve ser composto por:
   - botao principal forte;
   - acao secundaria textual.
7. A fila abaixo deve mostrar 3 itens e link **Ver todos**.
8. Cada item da fila deve ser linha clicavel com status claro.
9. Nao usar atalhos rapidos na Home.
10. A bottom nav mobile deve ser auto-ocultavel:
    - visivel no topo/parado;
    - some ao rolar para baixo;
    - reaparece ao rolar para cima.
11. A Etapa 2 entrega apenas a Home `Hoje`, sem Equipamento real e sem Servicos real.

## 3. Direcao visual

A imagem enviada pelo usuario e referencia visual principal para a paleta:

- branco como superficie principal;
- azul como cor de acao e identidade;
- azul claro como apoio;
- bordas claras;
- cards limpos;
- botoes solidos;
- estados por cor.

Ajuste obrigatorio para o app de campo:

- texto padrao em azul-marinho forte;
- evitar cinza claro em texto importante;
- cinza apenas para metadado secundario e com contraste suficiente;
- vermelho, laranja e verde apenas para estados operacionais reais;
- nao transformar a Home em dashboard corporativo.

## 4. Layout aprovado

Estrutura mobile-first:

1. Topo discreto:
   - titulo **Hoje**;
   - contexto curto, por exemplo "Turno de campo" ou data.
2. Card dominante de Proxima acao:
   - label "Proxima acao";
   - titulo da acao;
   - equipamento;
   - cliente/local quando houver;
   - motivo operacional curto;
   - CTA principal;
   - acao secundaria textual.
3. Fila curta:
   - titulo "Fila curta";
   - link "Ver todos";
   - ate 3 linhas clicaveis.
4. Bottom nav:
   - Hoje;
   - Equipamento;
   - Servicos;
   - Conta.

## 5. Conteudo da Proxima acao

Exemplos de motivo curto:

- "Preventiva vencida ha 2 dias";
- "Corretiva marcada para hoje";
- "Equipamento cadastrado sem primeiro servico";
- "Servico iniciado ontem";
- "Sem urgencias agora".

Exemplos de CTA principal:

- "Iniciar servico";
- "Registrar primeiro servico";
- "Revisar equipamentos".

Exemplos de acao secundaria textual:

- "Ver equipamento";
- "Ver historico";
- "Ver fila".

## 6. Estados do prototipo

O prototipo deve permitir validar pelo menos estes estados:

1. Preventiva/corretiva vencida.
2. Compromisso para hoje.
3. Equipamento sem primeiro servico.
4. Sem urgencias agora.
5. Fila curta com tres itens.
6. Bottom nav auto-ocultavel.

## 7. Fora do escopo

- Buscar equipamento real.
- Novo equipamento real.
- Equipamento detalhado.
- Servico real.
- Storage offline.
- Supabase/RLS.
- Billing.
- WhatsApp.
- PDF/share.
- Orcamento.
- PMOC.
- Integracao com o shell legado.

## 8. Criterio de aceite

A Etapa 2 esta correta quando:

1. A Home deixa clara uma unica Proxima acao.
2. A fila nao compete com o CTA principal.
3. Nao ha dashboard de metricas.
4. Nao ha atalhos duplicando a bottom nav.
5. O texto tem contraste forte.
6. O visual segue azul/branco com cara de ferramenta tecnica.
7. A implementacao fica isolada em `src/app-v2/`.
8. A validacao passa sem novos warnings relevantes.

## 9. Resultado da execucao

Status: implementado como prototipo isolado em `src/app-v2/`.

Entregue:

- Home `Hoje` com Proxima acao dominante;
- fila curta com tres itens clicaveis;
- bottom nav com Hoje, Equipamento, Servicos e Conta;
- auto-hide da bottom nav ao rolar;
- preview isolado em `src/app-v2/preview.html`;
- view model e regra de auto-hide cobertas por testes focados.

Validacao visual:

- preview aberto em Vite;
- texto principal em azul-marinho forte;
- margem/fonte do preview corrigidas;
- auto-hide verificado por browser com `transform` real.

Mantido fora do escopo:

- legado;
- storage;
- rotas reais;
- Supabase;
- PDF/share;
- WhatsApp;
- Orcamento;
- PMOC.
