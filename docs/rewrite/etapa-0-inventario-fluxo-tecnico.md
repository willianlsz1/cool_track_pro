# Etapa zero - Inventario minimo do fluxo tecnico legado

## 1. Escopo

Inventario documental para orientar o **Rewrite zero** antes de qualquer implementacao em `src/app-v2/`.

Objetivo: extrair dados, regras e contratos funcionais do app legado que nao podem ser perdidos no novo fluxo tecnico.

Fora do escopo:

- copiar UI, CSS, templates, shell ou navegacao legada;
- alterar `src/`;
- alterar Supabase, storage, billing, PDF/share, PMOC ou orcamentos;
- decidir schema novo definitivo;
- criar adaptadores.

## 2. Fontes lidas

- `src/core/state.js`
- `src/core/storage.js`
- `src/core/storage/storageNormalizers.js`
- `src/core/inputValidation.js`
- `src/core/maintenanceNormalization.js`
- `src/core/equipmentRules.js`
- `src/domain/maintenance.js`
- `src/domain/priorityEngine.js`
- `src/domain/suggestedAction.js`
- `src/domain/whatsapp.js`
- `src/ui/views/equipamentos/crud/payload.js`
- `src/ui/views/equipamentos/crud/persist.js`
- `src/ui/views/equipamentos/crud/postActions.js`
- `src/features/registro/save/payload.js`
- `src/ui/views/registro/save/persistence.js`
- `src/features/registro/save/postSave.js`
- `src/features/registro/save/reportShare.js`
- `src/ui/controller/serviceRegistrationEntry.js`
- `src/ui/viewModels/equipamentosViewModel.js`
- `src/ui/viewModels/clientesViewModel.js`
- `src/ui/views/clientes/dataModel.js`
- `src/ui/viewModels/relatorioViewModel.js`
- `src/ui/viewModels/orcamentosViewModel.js`
- `src/core/clientes.js`
- `src/core/clienteAlerts.js`
- `src/core/orcamentos.js`
- `docs/architecture/codebase-inventory.md`

## 3. Estado legado relevante

O estado central do app legado possui:

- `equipamentos`
- `registros`
- `tecnicos`
- `setores`
- `clientes`
- `orcamentos`

Observacao para o rewrite: esses nomes podem orientar o inventario, mas nao obrigam o novo app a repetir a mesma organizacao de UI.

## 4. Equipamento

### Campos persistidos encontrados

Campos principais:

- `id`
- `nome`
- `local`
- `status`
- `tag`
- `tipo`
- `componente`
- `modelo`
- `fluido`
- `criticidade`
- `prioridadeOperacional`
- `periodicidadePreventivaDias`
- `setorId`
- `clienteId`
- `fotos`
- `dadosPlaca`

Campos remotos mapeados:

- `setor_id`
- `cliente_id`
- `prioridade_operacional`
- `periodicidade_preventiva_dias`

### Validacoes e normalizacoes

Regras relevantes:

- `nome` e `local` sao obrigatorios.
- `tag` e normalizada para maiusculas.
- `tag` duplicada e bloqueada.
- `status` valido: `ok`, `warn`, `danger`.
- `criticidade` valida: `baixa`, `media`, `alta`, `critica`.
- `prioridadeOperacional` valida: `baixa`, `normal`, `alta`.
- `periodicidadePreventivaDias` e limitada e pode ser sugerida por tipo e criticidade.

### Regra de periodicidade preventiva

Tipos de equipamento possuem periodicidade base. Criticidade ajusta o intervalo:

- `baixa`: intervalo maior;
- `media`: intervalo base;
- `alta`: intervalo menor;
- `critica`: intervalo mais agressivo.

O intervalo final e normalizado entre limites definidos pelo legado.

### Uso no app-v2

Reaproveitamento seguro provavel:

- normalizacao de criticidade;
- normalizacao de prioridade operacional;
- calculo sugerido de periodicidade preventiva;
- validacao de campos essenciais;
- regras de status operacional.

Nao reaproveitar:

- modal legado de equipamento;
- HTML da lista atual;
- CSS de `equipment-list-cp-i.css`;
- filtros e cards como componentes visuais.

## 5. Cliente

### Campos persistidos encontrados

Campos principais:

- `id`
- `nome`
- `razaoSocial`
- `cnpj`
- `inscricaoEstadual`
- `inscricaoMunicipal`
- `endereco`
- `contato`
- `urlChamados`
- `finalidade`
- `observacoes`
- `createdAt`
- `updatedAt`

Campos remotos mapeados:

- `razao_social`
- `inscricao_estadual`
- `inscricao_municipal`
- `url_chamados`

### Relacao com equipamento

- `Cliente` possui varios `Equipamentos`.
- O vinculo e armazenado no `Equipamento` por `clienteId`.
- Ao apagar cliente, equipamentos vinculados ficam sem cliente.

### Indices e resumo operacional

O legado calcula por cliente:

- quantidade de equipamentos;
- quantidade de servicos;
- servicos no mes;
- ultimo servico;
- status por recencia de manutencao;
- cidade extraida do endereco;
- quantidade de preventivas vencidas no parque do cliente.

### Uso no app-v2

Cliente deve manter detalhe proprio no novo app, mas como subvisao forte dentro de **Equipamento**.

Reaproveitamento seguro provavel:

- shape de dados cadastrais;
- regra de vinculo via `equipamento.clienteId`;
- indices de resumo operacional por cliente.

Nao reaproveitar:

- rota/tela legado de clientes;
- paywall visual legado;
- paginacao/filtros como UI.

## 6. Compromisso de servico

O legado nao tem uma entidade dedicada chamada `Compromisso de servico`.

Representacoes existentes:

- `registro.proxima`: data da proxima manutencao.
- periodicidade preventiva por equipamento.
- alertas derivados de proximidade ou atraso.
- alerta local por cliente em `core/clienteAlerts.js`.

### Regras encontradas

O contexto de manutencao calcula:

- ultimo registro do equipamento;
- periodicidade preventiva;
- proxima preventiva programada;
- proxima preventiva calculada por data do ultimo registro + periodicidade;
- dias ate a proxima preventiva;
- dias desde o ultimo servico;
- quantidade recente de corretivas.

Relatorio calcula proximas acoes com janela padrao de 14 dias e limite padrao de 5 itens.

Alertas consideram:

- preventiva vencida;
- preventiva nos proximos dias;
- equipamento sem historico;
- status de atencao ou critico.

### Decisao para app-v2

No novo app, **Compromisso de servico** deve virar conceito explicito de produto.

Origem inicial:

- preventiva/corretiva marcada a partir do Equipamento;
- registro anterior com `proxima`;
- regra calculada de periodicidade quando nao houver data manual.

Necessita decisao futura:

- se vira entidade persistida propria;
- se continua derivado de registros/equipamentos;
- como tratar compromisso concluido, cancelado ou reagendado.

## 7. Registro de servico

### Campos persistidos encontrados

Campos principais:

- `id`
- `equipId`
- `data`
- `tipo`
- `obs`
- `status`
- `pecas`
- `proxima`
- `fotos`
- `tecnico`
- `prioridade`
- `custoPecas`
- `custoMaoObra`
- `assinatura`
- `checklist`

Campos contextuais de cliente/local:

- `clienteNome`
- `clienteDocumento`
- `localAtendimento`
- `clienteContato`

### Validacoes

Regras relevantes:

- `equipId` obrigatorio e precisa existir.
- `data` obrigatoria e precisa ser valida.
- `tipo` obrigatorio.
- `tecnico` e obrigatorio no fluxo padrao.
- `status` precisa ser `ok`, `warn` ou `danger`.
- `proxima` nao pode ser anterior a data do servico.
- custos devem ser numeros validos e nao negativos.
- `obs`, `pecas`, tecnico e dados de cliente possuem limites de tamanho.

### Persistencia e efeito colateral

Ao criar registro:

- adiciona registro em `state.registros`;
- adiciona tecnico novo em `state.tecnicos`, se necessario;
- atualiza status do equipamento com base no status operacional do registro.

Ao editar registro:

- atualiza campos do registro;
- reconcilia status do equipamento conforme historico atualizado.

### Entrada no fluxo

O legado possui `startServiceRegistration(params)`:

- se recebe `equipId`, abre registro direto para aquele equipamento;
- se nao recebe, abre registro com picker de equipamento;
- se nao ha equipamentos, modo esperado e criar equipamento.

### Uso no app-v2

Registro de servico deve virar fluxo por etapas curto.

Reaproveitamento seguro provavel:

- validacao de payload;
- normalizacao de tipo customizado;
- criacao/edicao de registro como regra;
- atualizacao de status do equipamento depois do registro.

Nao reaproveitar:

- formulario legado;
- picker legado;
- toasts pos-save como UX final;
- fluxo de modal atual.

## 8. Historico

Historico legado deriva de `state.registros`.

Regras importantes:

- registros pertencem a equipamentos por `equipId`;
- ordenacao frequente por `data` descendente;
- filtros podem usar equipamento, periodo e contexto de cliente via equipamento;
- historico deve ser atualizado automaticamente apos salvar Registro de servico.

Decisao ja confirmada para app-v2:

- Historico nao e CTA principal do fechamento.
- Historico e consequencia automatica do Registro de servico.

## 9. Relatorio e WhatsApp

### Relatorio

Relatorio legado e visao agregada de registros, com filtros por:

- equipamento;
- periodo inicial;
- periodo final.

Ele calcula:

- quantidade de servicos;
- custo total;
- tipo mais comum;
- proxima manutencao;
- narrativa do periodo;
- quantidade de corretivas;
- proximas acoes.

### WhatsApp

`domain/whatsapp.js` gera texto resumido para WhatsApp a partir de registros filtrados.

Dados usados:

- registros;
- equipamento;
- data do servico;
- tipo de servico;
- tecnico;
- empresa do perfil.

Classificacao de tipo de servico:

- limpeza de filtros;
- inspecao geral;
- carga de gas;
- preventiva;
- corretiva;
- manutencao/outros.

Fluxo pos-save legado:

- pode abrir WhatsApp direto;
- se falhar/cancelar, cai para rota de relatorio com intent;
- tambem existem acoes de PDF/WhatsApp em toast pos-save.

### Uso no app-v2

Confirmado:

- WhatsApp e canal principal de relatorio para tecnico.

Reaproveitamento seguro provavel:

- classificacao de tipo de servico;
- geracao de texto base;
- filtros por `equipId` e `registroId`.

Area sensivel para etapa futura:

- PDF/share;
- cotas;
- integracao com `window.open`;
- fallback para relatorio.

## 10. Orcamento

### Campos persistidos encontrados

Campos principais:

- `id`
- `numero`
- `clienteId`
- `clienteNome`
- `clienteTelefone`
- `clienteEndereco`
- `titulo`
- `descricao`
- `itens`
- `subtotal`
- `desconto`
- `total`
- `validadeDias`
- `formaPagamento`
- `observacoes`
- `status`
- `enviadoEm`
- `aprovadoEm`
- `registroId`
- `equipamentoId`
- `createdAt`
- `updatedAt`
- `shareToken`
- `shareTokenExpiresAt`
- `visualizadoEm`
- `assinaturaClienteDataUrl`
- `assinadoEm`
- `assinadoNome`

### Status e acoes

Status encontrados:

- `rascunho`
- `enviado`
- `aguardando_assinatura`
- `aprovado`
- `recusado`
- `expirado`

Acoes encontradas:

- ver/editar;
- enviar assinatura;
- compartilhar por WhatsApp com PDF;
- baixar PDF;
- marcar aprovado;
- criar servico quando aprovado;
- apagar.

### Decisao para app-v2

Confirmado:

- Orcamento nasce preferencialmente do Fechamento de servico;
- tambem pode nascer de Equipamento como demanda avulsa;
- acompanhamento fica dentro de **Servicos**.

Reaproveitamento seguro provavel:

- shape de dados;
- numeracao;
- status de pipeline;
- vinculo com `registroId` e `equipamentoId`.

Nao reaproveitar nesta etapa:

- PDF de orcamento;
- assinatura digital;
- modal/lista legado;
- acoplamento visual com a rota atual.

## 11. Regras de prioridade e Home operacional

Fontes relevantes:

- `core/equipmentRules.js`
- `domain/maintenance.js`
- `domain/priorityEngine.js`
- `domain/suggestedAction.js`
- `ui/viewModels/relatorioViewModel.js`
- `ui/viewModels/alertasViewModel.js`

Regras encontradas:

- equipamento `danger` vira critico;
- preventiva vencida vira critico;
- equipamento `warn` vira atencao;
- preventiva nos proximos 7 dias aumenta prioridade;
- equipamento sem dados gera acao de coleta de dados;
- corretivas recentes recorrentes sugerem investigacao de causa;
- criticidade influencia prioridade;
- prioridade operacional influencia risco;
- proximas acoes sao ordenadas por vencimento/proximidade.

Mapeamento inicial para Home operacional:

1. Preventiva/corretiva vencida ou para hoje.
2. Servico incompleto, quando existir entidade ou estado para isso.
3. Equipamento novo sem primeiro servico.
4. Ultimo equipamento atendido com saida para relatorio/WhatsApp ou historico.
5. Equipamentos criticos ou em atencao.

Lacuna:

- o legado nao possui conceito forte de "servico incompleto" como entidade persistida independente; precisa decisao futura.

## 12. Candidatos a reaproveitamento seguro

Alta prioridade:

- normalizacao de equipamento;
- validacao de equipamento;
- normalizacao de cliente;
- validacao de registro;
- calculo de periodicidade preventiva;
- calculo de status operacional;
- contexto de manutencao por equipamento;
- sugestao de acao;
- classificacao de tipos para WhatsApp.

Media prioridade:

- resumo operacional por cliente;
- KPIs de relatorio;
- pipeline de orcamento;
- numeracao de orcamento;
- filtros de registros por periodo/equipamento.

Baixa prioridade ou etapa sensivel:

- PDF/share;
- assinatura;
- billing/cotas;
- PMOC;
- Supabase/RLS;
- storage offline completo.

## 13. Riscos e lacunas

- `Compromisso de servico` ainda e derivado no legado; o app-v2 precisa decidir se sera entidade propria.
- `Servico incompleto` nao aparece como contrato claro no legado.
- WhatsApp e central para tecnicos, mas o fluxo atual passa por area sensivel de share/PDF/quota.
- Orcamento possui vinculo com registro/equipamento, mas o fluxo atual nasceu como modulo de instalacao; o app-v2 deve generalizar sem copiar a UI.
- Cliente tem detalhe proprio, mas parte do legado foi criada em contexto PMOC; app-v2 precisa separar cliente operacional de PMOC futuro.
- Storage offline-first e Supabase sao sensiveis; nao devem ser importados diretamente sem adaptador.

## 14. Proximo passo recomendado

Antes de implementar `src/app-v2/`, criar um documento de **contratos de produto da Etapa zero** com:

- modelo conceitual do app-v2;
- decisoes pendentes de entidade para Compromisso de servico;
- estados do Registro de servico;
- contrato de Home operacional;
- fronteira dos adaptadores de dados.
