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

**Etapa zero**:
Marco inicial do Rewrite zero usado para planejar e validar o novo app antes de implementar fluxos em codigo.
_Avoid_: CP-I, continuacao da Mudanca 21, redesign incremental

**Fluxo tecnico principal**:
Fatia inicial do novo app que cobre cliente/equipamento, registro de servico e saida operacional para historico ou relatorio.
_Avoid_: dashboard primeiro, tela demonstrativa, vitrine visual

**Equipamento**:
Unidade operacional principal atendida pelo tecnico no novo app.
_Avoid_: item secundario do cliente, detalhe escondido

**Cliente**:
Organizacao ou pessoa responsavel por um ou mais equipamentos, com detalhe proprio no novo app.
_Avoid_: campo auxiliar, ponto de partida obrigatorio do atendimento

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

**Fechamento de servico**:
Etapa final do Registro de servico que oferece gerar relatorio, criar orcamento ou agendar proximo compromisso.
_Avoid_: salvar e abandonar, historico como CTA principal

**Relatorio por WhatsApp**:
Saida primaria de compartilhamento do relatorio tecnico para o cliente.
_Avoid_: PDF como unico destino, download sem envio, canal secundario escondido

**Orcamento**:
Proposta comercial ligada preferencialmente ao Fechamento de servico, podendo tambem nascer de um Equipamento como demanda avulsa.
_Avoid_: aba isolada, documento sem contexto operacional

**PMOC**:
Modulo futuro de servico especializado, fora do nucleo da Etapa zero.
_Avoid_: requisito central do primeiro fluxo, acoplamento inicial, mistura com PDF/share e billing

**Hoje**:
Area fixa de entrada do novo app que contem a Home operacional e proximas acoes.
_Avoid_: dashboard de metricas

**Servicos**:
Area fixa que agrupa registros de servico, historico, relatorios e orcamentos.
_Avoid_: abas separadas para historico, relatorio e orcamentos

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
- O **Rewrite zero** nao reaproveita a UI, a hierarquia visual ou o CSS do **App legado** como base.
- A **Etapa zero** substitui a nomenclatura CP-I para o planejamento do **Rewrite zero**.
- O **Fluxo tecnico principal** e a primeira fatia funcional do **Novo app**.
- O **Equipamento** e o centro do **Fluxo tecnico principal**.
- Um **Cliente** pode ter um ou mais **Equipamentos**.
- Um **Equipamento** pertence a um **Cliente** quando ha cliente cadastrado.
- O **Vinculo equipamento-cliente** acontece no contexto do **Equipamento**.
- A **Home operacional** abre o **Novo app** e direciona o tecnico para o proximo **Equipamento** ou servico relevante.
- A **Home operacional** apresenta uma **Proxima acao** como foco principal.
- A **Proxima acao** possui um **CTA contextual** principal.
- A **Home operacional** pode exibir uma **Fila do dia** curta abaixo da **Proxima acao**.
- Um **Compromisso de servico** nasce a partir de um **Equipamento**.
- Um **Compromisso de servico** pode virar **Proxima acao** ou item da **Fila do dia**.
- Ao ser iniciado, um **Compromisso de servico** vira **Registro de servico** dentro de **Servicos**.
- Um **Registro de servico** pertence a um **Equipamento**.
- Um **Registro de servico** termina em **Fechamento de servico**.
- **Fechamento de servico** pode gerar **Relatorio por WhatsApp**, criar orcamento ou agendar novo **Compromisso de servico**.
- Um **Orcamento** nasce preferencialmente do **Fechamento de servico**.
- Um **Orcamento** pode nascer de um **Equipamento** quando nao houver servico anterior.
- **PMOC** pertence a etapas futuras do **Rewrite zero**, nao ao nucleo da **Etapa zero**.
- O **Novo app** tem quatro areas fixas: **Hoje**, **Equipamento**, **Servicos** e **Conta**.
- A area **Equipamento** contem uma visao de **Equipamentos** e uma visao de **Clientes**.
- A visao de **Clientes** mostra detalhes do **Cliente** e seus **Equipamentos** vinculados.
- **Servicos** inclui historico, relatorios e orcamentos.

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

> **Dev:** "Relatorio significa baixar PDF?"
> **Domain expert:** "Nao como padrao. Para tecnicos, a saida mais usada e Relatorio por WhatsApp."

> **Dev:** "Orcamento fica solto em uma area propria?"
> **Domain expert:** "Nao. Orcamento nasce principalmente do Fechamento de servico e fica acompanhado em Servicos."

> **Dev:** "PMOC precisa entrar no primeiro fluxo?"
> **Domain expert:** "Nao. PMOC e plano de outra etapa; a Etapa zero deve resolver o fluxo tecnico comum primeiro."

> **Dev:** "Orcamentos vira uma aba principal?"
> **Domain expert:** "Nao. Orcamentos fica dentro de Servicos junto com registros, historico e relatorios."

## Flagged ambiguities

- "Comecar do zero" foi usado de forma ampla. Resolvido: significa **Rewrite zero** com novo app React em paralelo no mesmo repositorio, nao pequenas correcoes visuais no app atual.
- "CP-I" nao deve nomear o rewrite. Resolvido: o novo ciclo usa **Etapa zero** como marco inicial.
- "Cliente primeiro" conflita com o fluxo desejado. Resolvido: **Equipamento** vem primeiro; **Cliente** e contexto depois.
- "Dashboard" pode significar metricas ou orientacao. Resolvido: a entrada do app e a **Home operacional**, nao dashboard de metricas.
- "Cliente como contexto" nao significa campo auxiliar. Resolvido: **Cliente** tem detalhe proprio, mas o **Vinculo equipamento-cliente** e feito a partir do **Equipamento**.
- "Usar TypeScript" nao significa migrar o legado. Resolvido: TypeScript pertence a **Stack app-v2** e exige etapa propria de configuracao.
- "Premium" nao significa hero, marketing ou tela respirada demais. Resolvido: a **Linguagem visual app-v2** e uma ferramenta tecnica de campo com acabamento proprietario.
- "Densidade" nao e uma escolha unica para todos os breakpoints. Resolvido: a **Densidade visual app-v2** e mobile compacto e desktop respirado, sempre com **Proxima acao** dominante.
- "Navegacao responsiva" nao significa repetir bottom nav em todas as larguras nem reduzir desktop a icones soltos. Resolvido: a **Navegacao app-v2** usa bottom nav no mobile e navegacao lateral contextual sempre expandida no desktop, com **Hoje** e turno operacional como informacao principal.
