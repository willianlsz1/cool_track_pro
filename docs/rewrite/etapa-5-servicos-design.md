# Etapa 5 - Design da Central de Serviços

## 1. Objetivo

Definir a primeira versão útil da aba **Serviços** no `src/app-v2/`, ainda com dados mockados, para que ela deixe de ser apenas um ponto de retomada e passe a organizar o trabalho técnico recente.

A tela deve responder rapidamente:

> O que está em andamento, o que foi concluído recentemente e quais saídas ainda precisam evoluir?

## 2. Decisões confirmadas

1. A Etapa 5 segue a opção A: **Serviços primeiro**.
2. `Serviços` será uma central operacional mínima, não um dashboard.
3. A tela deve apoiar o fluxo da Etapa 4, sem substituir a Home `Hoje`.
4. A tela deve mostrar serviço em andamento quando existir draft local.
5. A tela deve mostrar registros recentes mockados.
6. Relatório, Orçamento e Próximo compromisso aparecem como caminhos planejados, sem execução real.
7. A Etapa 5 continua sem storage, Supabase, PDF/share, WhatsApp, orçamento real, agendamento real e integração com o legado.
8. Textos visíveis devem usar português brasileiro correto.

## 3. Papel da aba Serviços

`Serviços` deve ser a área onde o técnico entende o estado do trabalho técnico, mas sem virar lista completa de histórico nem área financeira.

Prioridade da tela:

1. Serviço em andamento.
2. Registros recentes.
3. Pendências de saída futura: relatório, orçamento ou próximo compromisso.
4. Estado vazio claro quando não houver nada mockado.

Não é prioridade da Etapa 5:

- métricas grandes;
- gráfico;
- busca avançada;
- filtros complexos;
- relatório real;
- orçamento real;
- histórico completo.

## 4. Estrutura recomendada

### Cabeçalho

Mostra:

- título **Serviços**;
- subtítulo curto, como **Trabalho técnico**;
- indicação textual de que a tela organiza registros e saídas técnicas.

O cabeçalho não deve ocupar muito espaço no mobile.

### Bloco de serviço em andamento

Quando houver draft local:

- equipamento;
- cliente/local;
- tipo do serviço;
- status do preenchimento;
- CTA **Retomar registro**.

Quando não houver draft:

- estado vazio curto;
- CTA **Iniciar registro** mantendo o comportamento mockado atual.

### Lista de registros recentes

Cards compactos com:

- equipamento;
- cliente/local;
- tipo de serviço;
- data;
- status final;
- resumo técnico curto;
- saída pendente mockada quando existir.

Os cards devem ser densos, legíveis e orientados a trabalho. Não usar composição de dashboard.

### Saídas futuras

Cada registro pode exibir uma saída planejada:

- **Relatório pendente**;
- **Orçamento sugerido**;
- **Próximo compromisso sugerido**;
- **Sem pendência**.

Nesta etapa, essas saídas são informativas ou desabilitadas. Nenhum botão deve chamar PDF, WhatsApp, orçamento real ou agendamento real.

## 5. Dados necessários

Reaproveitar tipos existentes de `src/app-v2/domain/types.ts`:

- `Cliente`;
- `Equipamento`;
- `RegistroServico`;
- `ServiceRecordKind`;
- `ServiceRecordStatus`.

Criar modelagem local apenas se necessário para a UI da Etapa 5, por exemplo:

- status de saída mockada;
- agrupamento de registros recentes;
- resumo do serviço em andamento.

A modelagem deve ficar em `src/app-v2/service/` e não deve alterar contratos globais se não houver necessidade real.

## 6. Comportamento esperado

1. A aba `Serviços` abre em estado útil mesmo sem serviço em andamento.
2. Se existir draft local, ele aparece no topo.
3. O técnico pode retomar o registro em andamento.
4. Registros recentes aparecem abaixo do andamento.
5. Saídas futuras aparecem como estado visual, sem ação real.
6. A navegação inferior continua disponível e não cobre conteúdo crítico.

## 7. Fora do escopo

- Persistência real.
- Supabase.
- Storage local definitivo.
- Rotas reais.
- Shell legado.
- PDF/share.
- WhatsApp.
- Orçamento real.
- Agendamento real.
- Histórico completo.
- Busca avançada.
- Filtros complexos.
- PMOC.
- Fotos.
- Assinatura.
- Billing/plano.
- Nova dependência.

## 8. Critério de aceite

A Etapa 5 estará correta quando:

1. `Serviços` deixar de ser tela mínima e passar a organizar trabalho técnico recente.
2. Serviço em andamento continuar retomável.
3. Registros recentes mockados aparecerem com contexto de equipamento e cliente/local.
4. Saídas futuras ficarem claras sem parecer funcionais.
5. A tela continuar compacta e operacional no mobile.
6. Nenhuma integração real com legado/storage/PDF/WhatsApp/orçamento/agendamento for criada.
7. View models puros tiverem testes focados.

## 9. Riscos remanescentes

1. Transformar `Serviços` em dashboard cedo demais.
2. Criar botões que pareçam executar relatório, orçamento ou agendamento real.
3. Duplicar a Home `Hoje` em vez de complementar o fluxo.
4. Acoplar registros mockados ao formato futuro de storage antes da etapa de adaptadores.

## 10. Resultado da execução

Implementado em `src/app-v2/service/`:

- view model puro para a central de Serviços;
- testes focados para estado vazio, serviço em andamento, registros recentes e saídas futuras;
- card de serviço em andamento;
- card compacto de registro recente;
- pill visual de saída futura mockada;
- `ServicesHome` ligada ao novo view model.

Mantido fora do escopo: storage, Supabase, rotas reais, legado, PDF/share, WhatsApp, orçamento real, agendamento real, histórico completo, filtros complexos, PMOC, fotos e assinatura.
