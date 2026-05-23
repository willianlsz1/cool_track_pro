# CoolTrack Pro

Contexto de produto e arquitetura para orientar o rewrite do CoolTrack Pro sem confundir o app legado com a nova experiencia.

## Language

**Rewrite zero**:
Novo aplicativo React criado em paralelo no mesmo repositorio, usando o app atual como referencia funcional e nao como base visual.
_Avoid_: redesign incremental, ajuste visual, remendo de CSS

**App legado**:
Aplicacao atual hibrida de views legadas e ilhas React que permanece como referencia e baseline ate o novo app substituir fluxos validados.
_Avoid_: app novo, design system novo

**Novo app**:
Experiencia React limpa que recria shell, navegacao, telas, componentes e sistema visual a partir de um plano novo.
_Avoid_: tela atual reformada, CSS legado reaproveitado

**app-v2**:
Destino planejado em `src/app-v2/` para o Novo app React em paralelo.
_Avoid_: misturar no shell legado, importar CSS legado, substituir rotas atuais sem etapa propria

**Stack app-v2**:
React, TypeScript e Tailwind CSS no Vite, aplicados somente ao Novo app e a adaptadores novos.
_Avoid_: converter legado para TypeScript, editar package sem etapa propria, importar CSS legado

**Linguagem visual app-v2**:
Ferramenta tecnica premium de campo: clara, rapida, confiavel, com hierarquia forte de Proxima acao e acabamento proprietario sem virar vitrine visual.
_Avoid_: dashboard decorativo, app generico SaaS, excesso de hero, visual marketing

**Densidade visual app-v2**:
Mobile-first compacto e desktop respirado, mantendo a Proxima acao como centro absoluto e usando o espaco extra apenas para apoio contextual.
_Avoid_: compacto em tudo, respirado em tudo, desktop como dashboard, mobile com rolagem desnecessaria

**Navegacao app-v2**:
Mobile usa bottom nav e desktop usa navegacao lateral sempre expandida com contexto de turno operacional: data/status do turno, proximo atendimento e resumo curto da fila.
_Avoid_: bottom nav no desktop, menu lateral no mobile, navegacao duplicada, nav competindo com conteudo, lateral puramente iconografica, lateral compacta no desktop, conta ou plano como contexto principal

**Reaproveitamento seguro**:
Uso planejado de regras puras, contratos de dados e adaptadores do App legado sem trazer UI, CSS ou navegacao legada para o Novo app.
_Avoid_: copiar template, importar CSS legado, adaptar tela antiga

**Paridade funcional operacional**:
Contrato minimo em que o Novo app preserva as capacidades operacionais boas do App legado enquanto substitui visual, shell, navegacao e arquitetura.
_Avoid_: v2 enxuto que perde fluxo, reimplementacao visual que remove atalho util, paridade de CSS legado

**Melhoria com paridade**:
Evolucao estrutural ou funcional permitida durante a migracao quando preserva a capacidade do App legado e reduz friccao, acoplamento ou risco.
_Avoid_: copiar defeito legado, refatoracao ampla sem contrato, melhoria que remove fluxo usado

**Adaptador de migracao**:
Camada planejada que traduz contratos e regras do App legado para o app-v2 sem importar UI, CSS, shell ou infraestrutura sensivel diretamente.
_Avoid_: import direto de tela legada, storage real acoplado, ponte improvisada entre shells

**Etapa zero**:
Marco inicial do Rewrite zero usado para planejar e validar o novo app antes de implementar fluxos em codigo.
_Avoid_: CP-I, continuacao da Mudanca 21, redesign incremental

**Fluxo tecnico principal**:
Fatia inicial do novo app que cobre cliente/equipamento, registro de servico e saida operacional para historico ou relatorio.
_Avoid_: dashboard primeiro, tela demonstrativa, vitrine visual

**Equipamento**:
Unidade operacional principal atendida pelo tecnico no novo app.
_Avoid_: item secundario do cliente, detalhe escondido

**Equipamentos**:
Area fixa do Novo app que concentra lista, detalhe e organizacao de
Equipamentos, Clientes e Setores.
_Avoid_: usar o nome da area no singular, esconder o Equipamento dentro do
Cliente, criar uma area global separada para Setores

**Etiqueta do Equipamento**:
Fonte tecnica auxiliar usada para preencher dados como tag, modelo, fluido, serie e capacidade. No app-v2 inicial, deve entrar como rascunho revisavel e local/mock antes de qualquer camera, upload, storage ou IA real.
_Avoid_: salvar automaticamente, exigir foto para cadastrar, misturar cadastro com storage real, tratar reconhecimento como verdade sem revisao

**Cliente**:
Organizacao ou pessoa responsavel por um ou mais equipamentos, com detalhe proprio no novo app.
O cadastro pode conter dados formais e operacionais opcionais para apoiar relatorios futuros, como documento, inscricoes, contato, canal de chamados, finalidade do ambiente e observacoes internas.
_Avoid_: campo auxiliar, ponto de partida obrigatorio do atendimento, PMOC real acoplado ao cadastro local

**Setor**:
Agrupamento operacional de Equipamentos por area fisica ou funcional. Pode existir sem Cliente para uso como modelo ou organizacao local, mas o fluxo principal deve incentivar vinculo com Cliente.
_Avoid_: cor decorativa como valor principal, modulo separado de carteira, grupo que apaga historico ao ser removido

**Painel de Setor**:
Detalhe contextual de um Setor dentro da area Equipamentos, usado para ver resumo, equipamentos vinculados e acoes locais sem criar uma area global nova.
_Avoid_: tela global de setor, modulo administrativo separado, detalhe mais forte que Equipamento

**Vinculo equipamento-cliente**:
Associacao feita a partir do Equipamento para indicar qual Cliente e responsavel por ele.
_Avoid_: vincular cliente ao equipamento como fluxo principal

**Home operacional**:
Tela inicial que orienta o tecnico sobre a proxima acao com base em equipamentos, servicos realizados e preventivas ou corretivas marcadas.
_Avoid_: dashboard de metricas, lista crua, vitrine visual

**Proxima acao**:
Acao operacional mais relevante que o tecnico deve executar agora, ordenada por agenda vencida/hoje, servico incompleto, equipamento sem primeiro servico, retorno ao ultimo atendimento e equipamentos criticos.
_Avoid_: KPI principal, card promocional, sugestao generica

**CTA contextual**:
Botao principal unico da Home operacional cujo texto e destino mudam conforme a Proxima acao.
_Avoid_: botao fixo generico, grupo de CTAs equivalentes

**Fila do dia**:
Lista curta de proximos itens operacionais exibida abaixo da Proxima acao na Home operacional.
_Avoid_: agenda completa, dashboard denso, lista infinita

**Compromisso de servico**:
Preventiva ou corretiva marcada para um Equipamento que pode aparecer na Home operacional e virar Registro de servico quando iniciada.
_Avoid_: campo solto, lembrete sem fluxo, evento desconectado do registro

**Registro de servico**:
Fluxo por etapas curto usado pelo tecnico para documentar o atendimento de um Equipamento.
_Avoid_: formulario longo unico, checklist escondido, anotacao solta

**Criacao contextual de equipamento**:
Criacao de Equipamento iniciada porque o tecnico tentou registrar servico sem
um Equipamento adequado. A experiencia deve explicar que salvar o Equipamento
retoma o Registro de servico na mesma sessao local.
_Avoid_: wizard novo, router novo, persistencia real da intencao, cadastro
desconectado do atendimento

**Fechamento de servico**:
Etapa final do Registro de servico que oferece gerar relatorio, criar Orcamento
pos-diagnostico quando houver proxima etapa a aprovar, ou agendar proximo
compromisso.
_Avoid_: salvar e abandonar, historico como CTA principal

**Agendamento de proximo compromisso**:
Passo simples do **Fechamento de servico** para criar uma nova preventiva ou corretiva do mesmo **Equipamento**.
_Avoid_: agenda completa, recorrencia avancada, modulo de calendario

**Relatorio por WhatsApp**:
Saida primaria de compartilhamento do relatorio tecnico para o cliente.
_Avoid_: PDF como unico destino, download sem envio, canal secundario escondido

**Orcamento**:
Proposta comercial vinculada ao contexto operacional de Cliente, Equipamento ou
Servico. O fluxo principal e o Orcamento pre-servico; o Orcamento
pos-diagnostico e excecao contextual quando uma visita ou diagnostico indicar
proxima etapa a aprovar.
_Avoid_: aba isolada, documento sem contexto operacional, tratar todo Orcamento
como saida de servico ja concluido

**Orcamento pre-servico**:
Proposta comercial criada antes da execucao, normalmente a partir de um
Equipamento, Cliente ou demanda de instalacao/troca/reparo. Quando aprovado,
pode originar um Registro de servico contextualizado.
_Avoid_: tratar todo orcamento como saida de servico ja executado

**Orcamento pos-diagnostico**:
Proposta comercial criada depois de uma visita, diagnostico ou corretiva
incompleta indicar reparo maior, peca ou proxima etapa que ainda nao deve ser
executada sem aprovacao.
_Avoid_: cobrar como se o servico ja estivesse concluido, gerar orcamento
generico apos qualquer fechamento de servico

**Ciclo de Orcamento**:
Estados de produto de um Orcamento: rascunho, enviado, aprovado e recusado.
No app-v2 local, a primeira etapa pode cobrir rascunho e preparar a transicao
para aprovacao mockada futura sem envio real, billing ou storage real.
_Avoid_: envio real implicito, aprovacao comercial sem estado explicito,
misturar ciclo de Orcamento com conclusao de Registro de servico

**PMOC**:
Modulo futuro de servico especializado, fora do nucleo da Etapa zero.
_Avoid_: requisito central do primeiro fluxo, acoplamento inicial, mistura com PDF/share e billing

**Hoje**:
Area fixa de entrada do novo app que contem a Home operacional e proximas acoes.
_Avoid_: dashboard de metricas

**Servicos**:
Area fixa que agrupa registros de servico, historico, relatorios e orcamentos.
_Avoid_: abas separadas para historico, relatorio e orcamentos

**Relatorios**:
Subvisao de **Servicos** que concentra relatorios gerados e permite reabrir relatorio de um **Registro de servico** concluido.
_Avoid_: aba principal global, destino acessivel apenas no fechamento imediato

**Conta**:
Area fixa para plano, dados do usuario e configuracoes.
_Avoid_: area operacional, menu de atalhos do tecnico

## Relationships

- O **Novo app** nasce em paralelo ao **App legado**.
- O **app-v2** e o destino planejado do **Novo app**.
- A **Stack app-v2** e React, TypeScript, Tailwind CSS e Vite.
- A **Linguagem visual app-v2** orienta o acabamento do **Novo app** sem copiar a UI do **App legado**.
- A **Densidade visual app-v2** adapta a mesma linguagem para mobile e desktop sem mudar a prioridade operacional.
- A **Navegacao app-v2** muda de forma por breakpoint, preserva as mesmas areas do **Novo app** e expoe contexto de **Hoje** no desktop.
- O **App legado** fornece referencia funcional para o **Rewrite zero**.
- O **Reaproveitamento seguro** permite usar regras e contratos mapeados do **App legado**.
- A **Paridade funcional operacional** protege fluxos, atalhos e saidas uteis do **App legado** sem autorizar copia visual ou CSS legado.
- A **Melhoria com paridade** permite melhorar estrutura e fluxo somente quando a capacidade operacional do **App legado** continua coberta.
- Um **Adaptador de migracao** pode conectar regras e contratos legados ao **app-v2** sem contaminar o Novo app com UI, CSS ou infraestrutura sensivel.
- O **Rewrite zero** nao reaproveita a UI, a hierarquia visual ou o CSS do **App legado** como base.
- A **Etapa zero** substitui a nomenclatura CP-I para o planejamento do **Rewrite zero**.
- O **Fluxo tecnico principal** e a primeira fatia funcional do **Novo app**.
- O **Equipamento** e o centro do **Fluxo tecnico principal**.
- Um **Cliente** pode ter um ou mais **Equipamentos**.
- Um **Equipamento** pertence a um **Cliente** quando ha cliente cadastrado.
- Um **Setor** agrupa **Equipamentos** por area fisica ou funcional.
- Um **Setor** pode estar vinculado a um **Cliente**, mas tambem pode existir sem
  Cliente para uso local ou como modelo.
- O fluxo principal de **Setor** deve favorecer o vinculo com **Cliente** e a
  gestao dos **Equipamentos** dentro do agrupamento.
- O **Painel de Setor** vive dentro da area **Equipamento** e nao cria uma area
  global propria.
- O **Painel de Setor** pode listar **Equipamentos** vinculados, resumir status e
  oferecer criacao de **Equipamento** ja contextualizada pelo **Setor**.
- A primeira fatia do **Painel de Setor** deve priorizar equipamentos do setor,
  resumo operacional, proximo compromisso relevante, edicao do **Setor** e
  criacao de **Equipamento** ja vinculado ao **Setor**.
- Criar **Equipamento** a partir do **Painel de Setor** deve preencher o
  **Setor** automaticamente e tambem o **Cliente** quando o **Setor** tiver
  Cliente vinculado.
- Alterar o **Cliente** no formulario de **Equipamento** nao altera o
  **Cliente** do **Setor** automaticamente.
- A cor do **Setor** nao deve ser informacao principal na UI do app-v2. Ela pode
  permanecer no contrato local por compatibilidade, mas a primeira fatia do
  fluxo deve remover a cor do formulario e nao depender de cor para comunicar
  organizacao.
- O **Vinculo equipamento-cliente** acontece no contexto do **Equipamento**.
- A **Home operacional** abre o **Novo app** e direciona o tecnico para o proximo **Equipamento** ou servico relevante.
- A **Home operacional** apresenta uma **Proxima acao** como foco principal.
- A **Proxima acao** possui um **CTA contextual** principal.
- A **Home operacional** pode exibir uma **Fila do dia** curta abaixo da **Proxima acao**.
- Um **Compromisso de servico** nasce a partir de um **Equipamento**.
- Um **Compromisso de servico** pode virar **Proxima acao** ou item da **Fila do dia**.
- Ao ser iniciado, um **Compromisso de servico** vira **Registro de servico** dentro de **Servicos**.
- Um **Registro de servico** pertence a um **Equipamento**.
- Quando o tecnico tenta iniciar um **Registro de servico** sem um
  **Equipamento** adequado, o Novo app pode acionar a **Criacao contextual de
  equipamento**.
- A **Criacao contextual de equipamento** deve retornar ao **Registro de
  servico** apos salvar o **Equipamento**, sem criar uma area nova nem depender
  de storage real.
- Um **Registro de servico** termina em **Fechamento de servico**.
- **Fechamento de servico** pode gerar **Relatorio por WhatsApp**, criar
  **Orcamento pos-diagnostico** quando houver proxima etapa a aprovar, ou
  agendar novo **Compromisso de servico**.
- **Agendamento de proximo compromisso** cria um **Compromisso de servico** para o mesmo **Equipamento** do **Registro de servico** concluido.
- O **Orcamento pre-servico** e o fluxo principal de Orcamentos quando a
  aprovacao comercial vem antes da execucao.
- Um **Orcamento pre-servico** pode nascer de um **Equipamento**, de um
  **Cliente** ou de `Servicos > Orcamentos`.
- Um **Orcamento pos-diagnostico** nasce do **Fechamento de servico** apenas
  quando o atendimento serviu para diagnosticar ou levantar uma proxima etapa.
- Um **Orcamento** aprovado pode futuramente originar um **Registro de servico**
  contextualizado.
- O **Ciclo de Orcamento** separa proposta em rascunho, enviada, aprovada ou
  recusada antes de originar um **Registro de servico**.
- **PMOC** pertence a etapas futuras do **Rewrite zero**, nao ao nucleo da **Etapa zero**.
- O **Novo app** tem quatro areas fixas: **Hoje**, **Equipamentos**,
  **Servicos** e **Conta**.
- A area **Equipamentos** contem uma visao de **Equipamentos** e uma visao de
  **Clientes**.
- A visao de **Clientes** mostra detalhes do **Cliente** e seus **Equipamentos** vinculados.
- O detalhe de **Cliente** pode futuramente concentrar servicos relacionados e
  **PMOC** contextual, sem tornar **Cliente** uma area global do **Novo app**.
- **Servicos** inclui historico, relatorios e orcamentos.
- **Relatorios** pertence a **Servicos** e tambem pode ser acessado a partir de
  um **Registro de servico** concluido.

## Example dialogue

> **Dev:** "Vamos ajustar a lista de equipamentos atual?"
> **Domain expert:** "Nao. Isso faz parte do App legado. Para o Rewrite zero, use a tela atual apenas como referencia funcional e desenhe o Novo app em paralelo."

> **Dev:** "Onde fica o novo app?"
> **Domain expert:** "O destino planejado e src/app-v2/, isolado do shell e CSS legados ate uma etapa de integracao propria."

> **Dev:** "Vamos converter o projeto todo para TypeScript?"
> **Domain expert:** "Nao. TypeScript entra no app-v2 e em adaptadores novos; o legado continua em JavaScript."

> **Dev:** "Qual linguagem visual guia o app-v2?"
> **Domain expert:** "Ferramenta tecnica premium de campo: clara, rapida, confiavel, com Proxima acao dominante e acabamento proprietario."

> **Dev:** "A densidade deve ser igual em celular e desktop?"
> **Domain expert:** "Nao. Mobile deve ser compacto para uso em campo; desktop pode respirar mais, mas sem virar dashboard e sem tirar foco da Proxima acao."

> **Dev:** "A navegacao principal fica igual em mobile e desktop?"
> **Domain expert:** "Nao. Mobile usa bottom nav; desktop usa uma lateral mais larga com contexto de turno operacional, liberando a area principal sem competir com a Proxima acao."

> **Dev:** "O que entra no contexto da lateral desktop?"
> **Domain expert:** "Data/status do turno, proximo atendimento e resumo curto da fila. Conta e plano continuam na area Conta, nao como foco da lateral."

> **Dev:** "A lateral desktop pode recolher para modo compacto?"
> **Domain expert:** "Nao. No desktop ela fica sempre expandida; se nao houver largura para isso, o layout deve voltar para mobile com bottom nav."

> **Dev:** "Podemos copiar a tela antiga e limpar depois?"
> **Domain expert:** "Nao. Reaproveitamento seguro significa regra e contrato mapeado, nao UI, CSS, templates ou navegacao legada."

> **Dev:** "Se o v1 fazia uma acao util, podemos deixar para depois porque o v2 esta mais bonito?"
> **Domain expert:** "Nao. Paridade funcional operacional e contrato minimo: o v2 pode mudar a experiencia visual, mas nao deve piorar a capacidade do tecnico."

> **Dev:** "Durante a paridade, podemos melhorar um fluxo que no v1 era confuso?"
> **Domain expert:** "Sim, desde que seja melhoria com paridade: a capacidade continua existindo e a mudanca reduz friccao ou risco."

> **Dev:** "Como o v1 e o v2 usam bases tecnicas diferentes, importamos direto o codigo antigo?"
> **Domain expert:** "Nao. Use adaptador de migracao para regras e contratos; UI, CSS, shell e storage sensivel nao entram direto no app-v2."

> **Dev:** "Continuamos chamando isso de CP-I?"
> **Domain expert:** "Nao. O rewrite reinicia a numeracao como Etapa zero, porque nao e continuidade incremental da Mudanca 21."

> **Dev:** "Comecamos pelo Dashboard para ficar bonito rapido?"
> **Domain expert:** "Nao. Comecamos pelo Fluxo tecnico principal, porque ele prova a operacao real antes de qualquer tela de resumo."

> **Dev:** "O tecnico primeiro escolhe o cliente?"
> **Domain expert:** "Nao necessariamente. No novo app, ele deve encontrar o Equipamento primeiro; o Cliente aparece como contexto."

> **Dev:** "Cliente e so um campo no cadastro de Equipamento?"
> **Domain expert:** "Nao. Cliente tem detalhe proprio, mas o vinculo operacional nasce do Equipamento para o Cliente."

> **Dev:** "Cliente vira aba principal?"
> **Domain expert:** "Nao. Cliente e uma visao forte dentro de Equipamentos, com detalhe proprio e lista dos equipamentos vinculados."

> **Dev:** "Entao a primeira tela e uma lista de equipamentos?"
> **Domain expert:** "Nao. A Home operacional deve mostrar o que o tecnico precisa fazer agora, usando os equipamentos e servicos recentes como contexto."

> **Dev:** "Se houver preventiva vencida e equipamento novo sem servico, qual aparece primeiro?"
> **Domain expert:** "A preventiva ou corretiva vencida/para hoje aparece primeiro; equipamento novo sem primeiro servico vem depois."

> **Dev:** "A Home sempre mostra Novo registro como botao principal?"
> **Domain expert:** "Nao. O CTA contextual muda: iniciar servico, continuar registro, registrar primeiro servico, ver relatorio ou abrir historico."

> **Dev:** "A Home mostra uma agenda completa?"
> **Domain expert:** "Nao. Ela mostra uma Proxima acao no topo e uma Fila do dia curta abaixo."

> **Dev:** "Preventiva e corretiva sao so campos do equipamento?"
> **Domain expert:** "Nao. Elas sao Compromissos de servico: nascem no Equipamento, aparecem na Home e viram Registro de servico quando iniciadas."

> **Dev:** "Registro de servico e um formulario grande?"
> **Domain expert:** "Nao. No novo app, Registro de servico e um fluxo por etapas curto para uso em campo."

> **Dev:** "Depois de salvar, o tecnico vai para o historico?"
> **Domain expert:** "Nao como acao principal. O Fechamento de servico oferece relatorio, orcamento ou proximo compromisso; o historico e atualizado automaticamente."

> **Dev:** "Agendar preventiva precisa abrir uma agenda completa?"
> **Domain expert:** "Nao nesta etapa. O fechamento oferece um agendamento simples para o proximo compromisso do mesmo equipamento."

> **Dev:** "Relatorio significa baixar PDF?"
> **Domain expert:** "Nao como padrao. Para tecnicos, a saida mais usada e Relatorio por WhatsApp."

> **Dev:** "Orcamento nasce sempre depois do atendimento?"
> **Domain expert:** "Nao. O fluxo principal e Orcamento pre-servico; Orcamento pos-diagnostico so aparece quando uma visita ou diagnostico indicar proxima etapa a aprovar."

> **Dev:** "PMOC precisa entrar no primeiro fluxo?"
> **Domain expert:** "Nao. PMOC e plano de outra etapa; a Etapa zero deve resolver o fluxo tecnico comum primeiro."

> **Dev:** "Orcamentos vira uma aba principal?"
> **Domain expert:** "Nao. Orcamentos fica dentro de Servicos junto com registros, historico e relatorios."

> **Dev:** "Relatorios precisa virar uma aba principal?"
> **Domain expert:** "Nao. Relatorios fica como subvisao dentro de Servicos, mas cada registro concluido tambem oferece acesso direto ao seu relatorio."

## Flagged ambiguities

- "Comecar do zero" foi usado de forma ampla. Resolvido: significa **Rewrite zero** com novo app React em paralelo no mesmo repositorio, nao pequenas correcoes visuais no app atual.
- "Nao copiar o v1" pode ser confundido com aceitar perda funcional. Resolvido: o v2 nao copia UI/CSS legado, mas deve perseguir **Paridade funcional operacional** nos fluxos bons do v1.
- "Melhorar durante a migracao" pode virar escopo solto. Resolvido: melhorias devem ser **Melhoria com paridade**, classificadas e validadas contra a capacidade existente no v1.
- "CP-I" nao deve nomear o rewrite. Resolvido: o novo ciclo usa **Etapa zero** como marco inicial.
- "Cliente primeiro" conflita com o fluxo desejado. Resolvido: **Equipamento** vem primeiro; **Cliente** e contexto depois.
- "Dashboard" pode significar metricas ou orientacao. Resolvido: a entrada do app e a **Home operacional**, nao dashboard de metricas.
- "Cliente como contexto" nao significa campo auxiliar. Resolvido: **Cliente** tem detalhe proprio, mas o **Vinculo equipamento-cliente** e feito a partir do **Equipamento**.
- "Usar TypeScript" nao significa migrar o legado. Resolvido: TypeScript pertence a **Stack app-v2** e exige etapa propria de configuracao.
- "Premium" nao significa hero, marketing ou tela respirada demais. Resolvido: a **Linguagem visual app-v2** e uma ferramenta tecnica de campo com acabamento proprietario.
- "Densidade" nao e uma escolha unica para todos os breakpoints. Resolvido: a **Densidade visual app-v2** e mobile compacto e desktop respirado, sempre com **Proxima acao** dominante.
- "Navegacao responsiva" nao significa repetir bottom nav em todas as larguras nem reduzir desktop a icones soltos. Resolvido: a **Navegacao app-v2** usa bottom nav no mobile e navegacao lateral contextual sempre expandida no desktop, com **Hoje** e turno operacional como informacao principal.
