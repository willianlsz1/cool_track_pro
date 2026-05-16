# Contrato - Tecnico global no app-v2

## Objetivo

Definir a paridade funcional segura para a capacidade do v1 de adicionar o
tecnico informado no Registro de Servico a uma lista global de tecnicos.

Este contrato e documental. Ele nao autoriza storage real, Supabase/RLS,
permissoes, lista visual nova, autocomplete novo ou migracao de dados.

## Evidencia v1

No v1, `buildRegistroCreateStateMutation` preserva `prev.tecnicos` e adiciona
`persistedPayload.tecnico` quando o nome ainda nao existe na lista. A regra e
local ao estado do app, deduplica por igualdade exata e nao cria entidade rica
de tecnico.

Arquivos de referencia:

- `src/features/registro/save/persistence.js`;
- `src/ui/views/registro.js`;
- `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`.

## Contrato app-v2 proposto

Enquanto o app-v2 estiver em mock/local state, a paridade segura deve ser:

- `AppV2MockData` pode possuir `tecnicos: string[]`;
- concluir um Registro de Servico com tecnico nao vazio adiciona o nome ao
  array mockado quando ainda nao existir;
- editar um Registro de Servico tambem pode adicionar o tecnico editado ao
  array mockado;
- nomes vazios ou apenas espacos nao entram na lista;
- a regra deve ser pura, testavel e reaproveitada por `completeService` e
  `updateServiceRecord`;
- a lista mockada nao deve ser exibida em UI nova neste checkpoint;
- nenhuma regra de permissao, usuario, billing, perfil, Supabase ou storage real
  deve ser inferida desta fase.

## Normalizacao minima

Para evitar divergencia grosseira no mock:

- trim antes de salvar;
- deduplicar por comparacao exata apos trim;
- preservar a grafia digitada no primeiro cadastro;
- nao aplicar busca fuzzy, acento-insensitive, case-insensitive ou merge
  automatico nesta etapa.

Essas normalizacoes avancadas dependem de decisao de produto porque podem juntar
tecnicos distintos por engano.

## Anti-escopo

- storage real;
- tabela `tecnicos` remota;
- Supabase/RLS;
- permissoes por usuario/equipe;
- autocomplete/lista visual;
- edicao/renomeacao/remocao de tecnico;
- migracao de dados legado;
- perfil do tecnico responsavel;
- PDF/share/WhatsApp.

## Proxima fatia segura

Implementar apenas a regra mockada em app-v2:

- adicionar `tecnicos` ao snapshot mockado;
- criar helper/action pura para acumular tecnico informado;
- cobrir `completeService` e `updateServiceRecord` com testes;
- atualizar a matriz de paridade.
