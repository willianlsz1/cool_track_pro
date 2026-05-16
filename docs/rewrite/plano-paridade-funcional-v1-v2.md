# Plano de paridade funcional v1 -> v2

## 1. Objetivo

Guiar a migracao do app legado/v1 para o app-v2 sem perder as funcionalidades
operacionais que ja funcionavam bem no v1.

O app-v2 deve preservar a capacidade operacional do v1, corrigindo a principal
fonte de problema do legado: visual acumulado, CSS fragil, acoplamento entre UI
e regra, e quebras recorrentes quando uma regra mudava.

Este documento deve orientar o `/goal` do Codex para implementacoes futuras no
app-v2.

## 2. Decisao central

O app-v2 nao e uma versao enxuta do app-v1.

O app-v2 e uma nova experiencia visual e tecnica que deve atingir paridade
funcional operacional com o app-v1 antes de substituir fluxos usados pelo
usuario.

Permitido:

- preservar capacidades, regras e atalhos bons do v1;
- melhorar fluxo quando a capacidade original continua coberta;
- reescrever regra em TypeScript quando houver teste de equivalencia;
- criar adaptadores planejados para contratos legados;
- trocar UI, shell, layout, componentes e CSS por padroes novos do app-v2.

Nao permitido:

- copiar CSS, HTML, templates, shell ou componentes visuais do legado;
- remover capacidade usada no v1 sem decisao documentada;
- tratar mock simples como substituto de fluxo real do v1;
- misturar migracao funcional com PDF/share, Supabase, billing, PMOC ou storage
  real sem etapa propria;
- corrigir visual quebrando fluxo operacional.

## 3. Regra para todo checkpoint futuro

Antes de implementar qualquer fluxo no app-v2, o Codex deve responder:

1. Qual capacidade existente no v1 esta sendo preservada?
2. Qual melhoria esta sendo feita sobre essa capacidade?
3. Qual parte do v1 nao sera portada neste checkpoint?
4. Existe risco de regressao funcional para o tecnico?
5. Quais testes ou QA comparativo provam que a capacidade continua coberta?

Se a resposta nao for clara, o checkpoint deve parar em analise/documentacao.

## 4. Matriz de paridade obrigatoria

Cada fluxo migrado deve ter uma matriz com este formato:

| Fluxo v1            | Capacidade v1                                                                 | Equivalente v2          | Status  | Melhoria permitida                                   | Validacao             |
| ------------------- | ----------------------------------------------------------------------------- | ----------------------- | ------- | ---------------------------------------------------- | --------------------- |
| Registro de servico | Salvar atendimento com equipamento, data, tipo, tecnico, status e observacoes | Fluxo app-v2 por etapas | Parcial | Reduzir formulario longo, manter campos obrigatorios | Teste de payload + QA |

Status permitidos:

- `coberto`: v2 cobre a capacidade do v1.
- `parcial`: v2 cobre parte, com lacuna documentada.
- `regressao`: v2 perdeu capacidade usada no v1.
- `fora desta etapa`: capacidade reconhecida, mas isolada para checkpoint futuro.
- `substituido com melhoria`: v2 muda o fluxo, mas preserva ou melhora a
  capacidade.

## 5. Ordem recomendada de migracao

### Etapa A - Registro de servico

Prioridade maxima, porque alimenta historico, relatorio, WhatsApp, orcamento,
status do equipamento e preventiva.

Capacidades v1 a preservar:

- abrir registro a partir de equipamento;
- abrir registro com escolha de equipamento quando necessario;
- validar equipamento, data, tipo, tecnico e status;
- registrar diagnostico/observacoes;
- registrar proxima manutencao;
- registrar custos quando a etapa permitir;
- atualizar status do equipamento apos salvar;
- adicionar tecnico novo quando aplicavel;
- manter historico automaticamente.

Melhorias v2 desejadas:

- fluxo por etapas curto;
- contexto claro de cliente/equipamento;
- menos formulario longo;
- estado de rascunho/andamento mais explicito;
- fechamento com saidas claras.

### Etapa B - Historico e consulta

Capacidades v1 a preservar:

- listar registros por data;
- consultar por equipamento;
- consultar contexto por cliente quando possivel;
- manter historico apos salvar registro;
- abrir registro ou relatorio a partir do historico.

Melhorias v2 desejadas:

- consulta dentro de `Servicos`;
- filtros mais claros;
- caminho direto para relatorio sem criar novo servico.

### Etapa C - Relatorio e WhatsApp

Capacidades v1 a preservar:

- gerar visao de relatorio a partir de registros;
- filtrar por equipamento e periodo;
- calcular quantidade de servicos, custo, tipo mais comum e proxima manutencao;
- gerar texto de WhatsApp quando a etapa sensivel for aprovada;
- manter fallback para relatorio quando compartilhamento falhar.

Melhorias v2 desejadas:

- preview dedicado;
- impressao isolada do documento;
- acesso por `Servicos > Relatorios`;
- separacao entre modelo de relatorio e UI.

Observacao: PDF/share, WhatsApp real e cotas continuam areas sensiveis e exigem
checkpoint proprio.

### Etapa D - Equipamentos

Capacidades v1 a preservar:

- criar e editar equipamento;
- validar nome, local, status, tag e criticidade;
- bloquear tag duplicada;
- sugerir periodicidade preventiva;
- vincular equipamento a cliente;
- mostrar status operacional e prioridade.

Melhorias v2 desejadas:

- visual mais escaneavel;
- detalhe de equipamento mais claro;
- acoes contextuais para iniciar servico e ver historico.

### Etapa E - Clientes

Capacidades v1 a preservar:

- listar clientes;
- abrir detalhe de cliente;
- mostrar equipamentos vinculados;
- manter dados cadastrais relevantes;
- calcular resumo operacional por cliente quando a etapa permitir.

Melhorias v2 desejadas:

- cliente como subvisao forte dentro de Equipamentos;
- detalhe com equipamentos, servicos relacionados e contexto operacional;
- sem transformar Cliente em aba principal global.

### Etapa F - Orcamentos

Capacidades v1 a preservar:

- criar orcamento vinculado a cliente, equipamento ou registro;
- manter status do pipeline;
- numerar orcamento;
- editar itens, valores, validade e observacoes;
- compartilhar ou baixar apenas em etapa sensivel propria.

Melhorias v2 desejadas:

- nascer preferencialmente do fechamento de servico;
- ficar acompanhado dentro de `Servicos`;
- nao virar modulo solto desconectado do atendimento.

### Etapa G - Alertas, preventivas e proximas acoes

Capacidades v1 a preservar:

- calcular preventiva vencida;
- calcular preventiva proxima;
- priorizar equipamento critico ou em atencao;
- sugerir proxima acao;
- considerar periodicidade, criticidade e recencia.

Melhorias v2 desejadas:

- compromisso de servico explicito;
- Home operacional orientada por proxima acao;
- fila curta e acionavel.

## 6. Estrategia tecnica para linguagens diferentes

O app legado e majoritariamente JavaScript e o app-v2 usa React + TypeScript.
A migracao deve evitar dois extremos:

- nao converter o legado inteiro para TypeScript;
- nao importar codigo legado diretamente dentro da UI v2.

Estrategia correta:

1. Mapear contrato v1 em documento ou teste.
2. Identificar se a regra v1 e pura, misturada com UI ou misturada com
   infraestrutura.
3. Para regra pura:
   - reaproveitar por adaptador quando seguro; ou
   - reescrever em TypeScript com teste de equivalencia.
4. Para regra misturada com UI:
   - extrair comportamento esperado;
   - reimplementar no app-v2 com componentes novos.
5. Para regra misturada com storage, Supabase, PDF/share, billing ou permissao:
   - documentar como area sensivel;
   - criar adaptador somente em checkpoint proprio.

## 7. Adaptadores de migracao

Adaptadores devem ser pequenos, testaveis e orientados por contrato.

Tipos de adaptador permitidos:

- normalizador de dados do legado para tipos do app-v2;
- seletor que deriva view model do app-v2 a partir de contrato legado;
- porta de leitura mockada ou planejada;
- porta de escrita planejada, sem conectar storage real antes da etapa propria;
- wrapper de regra pura com teste de equivalencia.

Tipos de adaptador proibidos neste plano:

- componente React que importa template legado;
- CSS legado dentro de app-v2;
- chamada direta de storage real no meio da UI;
- import direto de PDF/share legado;
- atalho que mistura shell v1 e shell v2.

## 8. Politica de melhoria durante paridade

Toda melhoria encontrada durante a analise deve ser classificada antes de virar
codigo.

Classificacoes:

- `melhoria estrutural`: reduz acoplamento, duplica menos regra ou melhora
  testabilidade.
- `melhoria funcional`: reduz friccao do usuario mantendo a capacidade v1.
- `melhoria visual`: melhora hierarquia, legibilidade ou responsividade sem
  mudar regra.
- `sensivel`: toca storage, permissao, PDF/share, billing, Supabase, WhatsApp
  real, assinatura ou PMOC.
- `backlog`: boa ideia, mas fora do checkpoint.

Regra:

- melhorias estruturais e funcionais podem entrar no checkpoint se forem
  pequenas, testaveis e diretamente ligadas ao fluxo em migracao;
- melhorias visuais devem seguir `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md`;
- melhorias sensiveis devem virar etapa propria;
- backlog deve ser documentado, nao implementado por impulso.

## 9. Criterios de pronto por fluxo

Um fluxo do app-v2 so pode ser considerado pronto para substituir o v1 quando:

- a matriz de paridade esta preenchida;
- nao ha `regressao` sem plano aprovado;
- testes focados cobrem regras de dominio ou view model;
- QA manual compara o fluxo v1 e v2;
- mobile e desktop foram verificados;
- textos longos e estado vazio foram verificados;
- nenhuma area sensivel foi misturada sem autorizacao;
- o app-v2 continua sem import de UI/CSS legado;
- o relatorio final lista lacunas restantes.

## 10. Modelo de prompt para o Codex

Use este bloco como base para proximos `/goal` de implementacao:

```text
Objetivo: migrar o fluxo [NOME_DO_FLUXO] do app v1 para o app-v2 com paridade
funcional operacional e melhoria controlada.

Antes de editar codigo:
1. Ler AGENTS.md, CONTEXT.md e docs/rewrite/plano-paridade-funcional-v1-v2.md.
2. Mapear a capacidade equivalente no v1.
3. Preencher ou atualizar a matriz de paridade do fluxo.
4. Separar: paridade obrigatoria, melhoria permitida, backlog e areas sensiveis.
5. Listar arquivos afetados e riscos.

Durante a implementacao:
- preservar visual/shell/CSS do app-v2;
- nao copiar UI/CSS/template legado;
- usar TypeScript apenas no app-v2/adaptadores novos;
- usar adaptadores para contratos/regras do legado;
- manter checkpoint pequeno e testavel;
- nao tocar PDF/share, Supabase, billing, storage real, WhatsApp real, PMOC ou
  permissao sem etapa propria.

Validacao:
- npm run format
- npm run build
- npm run check
- testes focados da area
- QA manual comparativo v1 x v2
- git diff --check

Relatorio final:
- branch, HEAD inicial/final, working tree antes/depois;
- arquivos alterados;
- capacidade v1 preservada;
- melhoria aplicada;
- lacunas e riscos remanescentes;
- proximo passo recomendado.
```

## 11. Primeiro checkpoint recomendado

Criar `docs/rewrite/matriz-paridade-v1-v2.md` com a matriz inicial dos fluxos
operacionais do v1.

Ordem inicial:

1. Registro de servico.
2. Historico.
3. Relatorio.
4. WhatsApp.
5. Equipamentos.
6. Clientes.
7. Orcamentos.
8. Alertas/preventivas/proximas acoes.

Esse primeiro checkpoint deve ser documental/read-only sobre codigo, usando o
legado como fonte de verdade funcional e o app-v2 atual como destino de
comparacao.

## 12. Anti-escopo imediato

Nao iniciar ainda:

- migracao de storage real;
- Supabase/RLS;
- billing;
- PDF/share legado;
- WhatsApp real;
- PMOC;
- assinatura;
- upload/storage de fotos;
- redesign amplo;
- remocao de codigo legado.

Essas areas so entram depois de a matriz de paridade mostrar qual capacidade v1
precisa ser preservada e qual contrato v2 vai receber a migracao.
