# Etapa zero - Plano mestre do rewrite

## 1. Objetivo

Planejar o **Rewrite zero** do CoolTrack Pro como um novo app React em paralelo dentro do mesmo repositorio.

Este documento substitui a ideia de continuar a Mudanca 21 / CP-I. O app atual passa a ser referencia funcional e baseline de comparacao, nao base visual ou estrutural para o novo app.

Artefatos da Etapa zero:

- Plano mestre: `docs/rewrite/etapa-0-plano-mestre.md`
- Inventario do fluxo tecnico legado: `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`
- Stack e regras para agentes: `docs/rewrite/etapa-0-stack-e-regras-agentes.md`
- Plano da proxima etapa: `docs/rewrite/etapa-1-base-tecnica-app-v2.md`
- Design da Home Hoje: `docs/rewrite/etapa-2-home-hoje-design.md`
- Plano da Home Hoje: `docs/rewrite/etapa-2-home-hoje-plano.md`
- Design de Equipamento: `docs/rewrite/etapa-3-equipamento-design.md`
- Plano de Equipamento: `docs/rewrite/etapa-3-equipamento-plano.md`

## 2. Decisoes confirmadas

1. O novo ciclo sera chamado de **Etapa zero**, nao CP-I.
2. O caminho escolhido e um novo app React em paralelo no repo atual.
3. O app atual nao deve ser consertado visualmente como estrategia principal.
4. A primeira fatia funcional sera o **Fluxo tecnico principal**.
5. O fluxo comeca por **Equipamento** como centro operacional.
6. **Cliente** tem detalhe proprio, mas nao e a porta principal do atendimento.
7. O vinculo operacional nasce de **Equipamento** para **Cliente**.
8. A primeira tela do novo app sera a **Home operacional**, nao dashboard de metricas nem lista crua.
9. A Home operacional deve responder "o que o tecnico faz agora?".
10. A Home operacional tera uma **Proxima acao** priorizada.
11. A Proxima acao tera um **CTA contextual** principal.
12. A Home operacional tera uma fila curta abaixo da Proxima acao.
13. Preventiva e corretiva serao tratadas como **Compromisso de servico**.
14. **Registro de servico** sera um fluxo por etapas curto.
15. O fechamento do Registro de servico tera tres saidas: relatorio, orcamento e proximo compromisso.
16. O compartilhamento principal do relatorio sera WhatsApp.
17. Orcamento nasce preferencialmente do fechamento de servico, mas tambem pode nascer de Equipamento como demanda avulsa.
18. PMOC fica fora do nucleo da Etapa zero e entra como plano de etapas futuras.
19. O destino planejado do novo app sera `src/app-v2/`.
20. O novo app podera reaproveitar regras puras e contratos mapeados, mas nao UI/CSS/templates legados.
21. Antes de implementar `src/app-v2/`, a Etapa zero deve produzir inventario minimo do legado para o fluxo tecnico.
22. A stack planejada do novo app sera React, TypeScript e Tailwind no Vite.
23. TypeScript entra apenas no app-v2 e em adaptadores novos; o legado nao sera convertido.
24. Tailwind deve preservar o prefixo `tw-` e nao importar CSS legado como base.
25. A navegacao fixa inicial tera quatro areas: **Hoje**, **Equipamento**, **Servicos** e **Conta**.
26. A area **Equipamento** tera visoes de Equipamentos e Clientes.
27. A area **Servicos** inclui registros, historico, relatorios e orcamentos.

## 3. Prioridade da Home operacional

A Home operacional deve priorizar a proxima acao nesta ordem:

1. Preventiva ou corretiva agendada para hoje ou vencida.
2. Servico iniciado ou incompleto.
3. Equipamento cadastrado recentemente sem primeiro servico.
4. Ultimo equipamento atendido com acao rapida para historico ou relatorio.
5. Lista curta de equipamentos criticos.

Estrutura recomendada da Home:

1. Uma Proxima acao unica no topo, com CTA contextual.
2. Uma fila curta com 3 proximos itens operacionais e link "Ver todos".
3. Bottom nav mobile auto-ocultavel com Hoje, Equipamento, Servicos e Conta.

A Home nao deve virar agenda completa nem dashboard denso de metricas.
Atalhos rapidos na Home foram rejeitados para evitar duplicar a bottom nav.

## 4. Compromisso de servico

Preventiva e corretiva devem ser tratadas como **Compromisso de servico**.

Regras confirmadas:

- nasce a partir de um Equipamento;
- pode ter data e prioridade;
- aparece na Home operacional quando e relevante;
- pode ser a Proxima acao ou item da fila curta;
- quando iniciado, vira registro de servico;
- quando concluido, alimenta historico, relatorio e possivelmente orcamento.

## 5. Registro de servico

O Registro de servico deve ser um fluxo por etapas curto, nao um formulario longo unico.

Etapas iniciais recomendadas:

1. Equipamento e contexto.
2. Tipo de servico: preventiva, corretiva, instalacao, visita ou outro.
3. Diagnostico e acoes executadas.
4. Fotos e anexos, se houver.
5. Assinatura e fechamento.
6. Saida: relatorio, orcamento ou historico.

Fechamento recomendado:

1. Gerar relatorio.
2. Criar orcamento.
3. Agendar proximo compromisso.

O Historico deve ser atualizado automaticamente, sem virar CTA principal de fechamento.

No caminho de gerar relatorio, o WhatsApp deve ser tratado como canal principal de compartilhamento, porque e o uso mais comum dos tecnicos.

Orcamento:

- nasce preferencialmente do fechamento de servico, levando equipamento, cliente, diagnostico e fotos como contexto;
- tambem pode nascer diretamente de um Equipamento quando for demanda avulsa;
- deve ser acompanhado dentro de Servicos, nao em uma aba fixa isolada.

## 6. Navegacao base

### Hoje

Entrada do app. Mostra Home operacional, Proxima acao e contexto suficiente para o tecnico saber o que fazer.

### Equipamento

Area operacional para encontrar, cadastrar e abrir equipamentos.

Deve conter:

- visao de Equipamentos;
- visao de Clientes;
- detalhe do Equipamento;
- detalhe do Cliente com equipamentos vinculados;
- filtros por cliente, setor, status e prioridade quando fizer sentido.

### Servicos

Area de execucao e consulta de trabalho tecnico.

Inclui:

- registros de servico;
- historico;
- relatorios;
- orcamentos.

### Conta

Area nao operacional para plano, dados do usuario e configuracoes.

## 7. Fronteira com o app legado

O app legado pode ser usado para:

- entender regras de negocio existentes;
- conferir contratos de dados;
- comparar fluxos atuais;
- evitar perda de funcionalidades criticas.
- reaproveitar regras puras quando estiverem mapeadas;
- reaproveitar contratos de dados por adaptadores planejados.

O app legado nao deve ser usado como base para:

- CSS;
- hierarquia visual;
- shell;
- navegacao;
- componentes;
- layout;
- nomenclatura de CPs da Mudanca 21.

Permitido planejar reaproveitamento:

- funcoes puras de dominio;
- normalizacao e validacao de dados quando estiverem limpas;
- contratos de storage depois de mapeados;
- regras de plano e billing apenas por adaptador;
- geracao e compartilhamento de relatorio somente em etapa sensivel propria.

Nao reaproveitar:

- CSS;
- HTML/templates legados;
- shell e navegacao atual;
- componentes visuais atuais;
- organizacao por abas atual.

## 8. Arquitetura planejada no repositorio

Destino planejado do novo app:

```text
src/app-v2/
```

Regras iniciais:

- nao criar a pasta durante a Etapa zero se ainda estivermos apenas planejando;
- nao importar CSS legado como base;
- nao misturar componentes no shell atual;
- nao substituir rotas atuais sem etapa propria;
- integrar dominio, storage e dados apenas por adaptadores planejados em etapa futura.

Stack planejada para `src/app-v2/`:

- React;
- TypeScript;
- Tailwind CSS com prefixo `tw-`;
- Vite.

Pendencias antes de implementar:

- Etapa 1 autorizada para editar `package.json` e `package-lock.json`;
- TypeScript e tipos de React adicionados na Etapa 1;
- configuracao de TypeScript criada na Etapa 1;
- comando de typecheck definido na Etapa 1;
- manter o legado em JavaScript.

## 9. Fora do escopo da Etapa zero

- Implementar telas do novo app.
- Alterar `src/`.
- Mexer em CSS legado.
- Remover codigo atual.
- Alterar Supabase, RLS, storage, billing, PDF/share ou PMOC.
- Migrar dados.
- Criar dependencias novas.
- Definir PMOC em detalhe.

## 10. Planos para etapas futuras

### PMOC

PMOC deve entrar como modulo ou protocolo especializado de servico em etapa futura.

Direcao inicial:

- nao comanda a arquitetura da Etapa zero;
- nao deve ser misturado agora com PDF/share, billing ou regras sensiveis;
- pode ser tratado depois como tipo de servico, checklist especializado ou fluxo complementar;
- deve herdar a base do fluxo tecnico comum depois que ele estiver definido.

## 11. Proximas decisoes em aberto

- Modelo de registro de servico no novo app.
- Criterios para descartar ou reaproveitar regras do app legado.
- Criterios de adaptadores antes de conectar storage real.
- Modelo da etapa de Servicos apos Equipamento.

## 12. Inventario minimo antes de implementar

Antes de criar codigo em `src/app-v2/`, a Etapa zero deve mapear:

- dados necessarios para Equipamento;
- dados necessarios para Cliente;
- dados necessarios para Registro de servico;
- como o app atual representa preventiva e corretiva;
- o que gera Historico;
- o que alimenta relatorio e WhatsApp;
- o que alimenta Orcamento;
- quais regras podem ser reaproveitadas como dominio puro;
- quais pontos exigem adaptador em etapa futura.

Esse inventario nao deve copiar telas, CSS ou templates. O objetivo e evitar perda de regra critica durante o rewrite.

Estado: inventario inicial criado em `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`.

## 13. Riscos iniciais

- Repetir o app atual com nomes novos se a navegacao nao for redesenhada de fato.
- Transformar Home operacional em dashboard de metricas.
- Reduzir Cliente a campo auxiliar e perder gestao de parque instalado.
- Misturar rewrite com ajustes cosmeticos pendentes do app legado.
- Comecar implementacao antes de fechar contratos de produto suficientes.
