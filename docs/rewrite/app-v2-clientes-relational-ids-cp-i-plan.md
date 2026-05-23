# app-v2 - CP-I plano de reconciliacao de IDs relacionais de Cliente

## 1. Objetivo

Preparar a passagem segura de `Cliente` real para relacionamentos reais sem
quebrar o app-v2 nem repetir erros do v1, onde regras de persistencia,
navegacao e renderizacao ficaram acopladas.

A CP-I ainda nao deve escrever `equipamentos` ou `setores` reais. O objetivo e
fechar o contrato antes de mutacao relacional.

## 2. Problema a resolver

Na base local/mock do app-v2, `clienteId` usa IDs como `cliente-1`. No Supabase,
`clientes.id` e UUID. Se equipamentos ou setores forem conectados diretamente
sem reconciliacao, o app pode criar referencias quebradas ou exibir dados
mistos:

- cliente real com UUID;
- equipamento mock apontando para `cliente-1`;
- setor mock apontando para `cliente-1`;
- fluxo de servico ou orcamento lendo contexto inconsistente.

## 3. Area escolhida

Comecar por **Cliente -> Equipamentos**.

Motivo:

- equipamento e a entidade operacional principal do tecnico;
- servico, alerta, relatorio e orcamento dependem de equipamento;
- setor pode continuar como contexto local ate o contrato de equipamento estar
  claro;
- evitar conectar setores antes de definir ownership de equipamento.

## 4. Plano de execucao

### CP-I.1 - Mapeamento read-only

- mapear campos da tabela real de equipamentos contra `Equipamento` do app-v2;
- identificar campos obrigatorios, opcionais e sem correspondencia;
- mapear como `cliente_id` real substitui `clienteId` local;
- documentar lacunas antes de codigo.

Validacao:

- documento em `docs/rewrite`;
- sem runtime.

### CP-I.2 - Mapper puro

- criar mapper Supabase -> `Equipamento`;
- testar campos minimos, opcionais, status e relacao `clienteId`;
- nao importar Supabase real no mapper.

Validacao:

- teste unitario focado;
- varredura de imports proibidos no app-v2.

### CP-I.3 - Reader real read-only de equipamentos por cliente

- criar reader injetado para equipamentos filtrados por `user_id`/ownership e
  `cliente_id`;
- depender de cliente real autenticado;
- nao alterar UI.

Validacao:

- teste com client mockado;
- teste SQL/RLS especifico antes de qualquer escrita.

### CP-I.4 - Adapter composto read-only

- compor equipamentos reais na `AppV2DataPort` somente quando cliente real
  tambem estiver ativo;
- preservar fallback local quando reader real falhar;
- nao ativar no preview por padrao.

Validacao:

- testes de factory e adapter;
- shell deve continuar carregando local sem opcoes.

## 5. Fora de escopo

- escrita real de equipamento;
- upload/storage de anexos;
- setores reais;
- servicos reais;
- orcamentos reais;
- PDF/share;
- WhatsApp;
- billing/quotas;
- router/deep links.

## 6. Riscos

- tabela real de equipamentos pode nao ter paridade com o tipo `Equipamento`;
- status/criticidade/prioridade podem precisar de normalizacao;
- anexos e fotos devem continuar fora ate etapa de storage;
- IDs locais existentes nao devem ser enviados como UUID real.

## 7. Criterio de aceite

- nenhum mock ID e usado como FK real;
- nenhum runtime real e ativado no preview;
- mappers e readers ficam testados isoladamente;
- SQL/RLS de leitura por ownership e validado antes de conectar a factory;
- proximo CP de escrita so e aberto depois de leitura relacional consistente.

## 8. Resultado

CP-I executada em:

- `docs/rewrite/app-v2-equipamentos-readonly-mapping-cp-i1.md`
- `docs/rewrite/app-v2-equipamentos-readonly-cp-i.md`

Resumo:

- criado mapper puro de equipamentos reais;
- criado reader read-only por `user_id` e `cliente_id`;
- criado adapter read-only explicito por cliente real;
- criado teste SQL/RLS de leitura Cliente -> Equipamentos;
- preview segue local;
- escrita real de equipamento continua bloqueada ate contrato de ownership de
  `cliente_id`.
