# app-v2 - CP-I.1 mapeamento read-only Cliente -> Equipamentos

## 1. Objetivo

Mapear a tabela real `public.equipamentos` contra o tipo `Equipamento` do
app-v2 antes de conectar leitura relacional. Esta etapa evita gravar ou ler
dados mistos entre IDs mockados e IDs reais.

Esta CP nao altera runtime.

## 2. Fontes analisadas

- `src/app-v2/domain/types.ts`
- `src/app-v2/data/appV2MockData.ts`
- `supabase/migrations/20260411000000_baseline_core_tables.sql`
- `supabase/migrations/20260417000000_equipamentos_manutencao_fields.sql`
- `supabase/migrations/20260418140000_setores.sql`
- `supabase/migrations/20260418150000_equipamentos_fotos.sql`
- `supabase/migrations/20260421120000_equipamentos_dados_placa.sql`
- `supabase/migrations/20260425120000_pmoc_clientes_empresa.sql`
- `supabase/migrations/20260425140000_baseline_core_rls.sql`
- `supabase/migrations/20260426120000_equipamentos_componente.sql`
- `supabase/migrations/20260426130000_setores_cliente_id.sql`

## 3. Contrato real encontrado

Tabela: `public.equipamentos`

Colunas relevantes:

| Supabase                        | app-v2 `Equipamento`          | Observacao                                        |
| ------------------------------- | ----------------------------- | ------------------------------------------------- |
| `id`                            | `id`                          | No schema atual e `text`, nao UUID.               |
| `user_id`                       | nao exposto                   | Usado so para ownership/RLS.                      |
| `cliente_id`                    | `clienteId`                   | UUID real de `public.clientes.id`.                |
| `setor_id`                      | `setorId`                     | Ainda `text`; setor real fica para etapa propria. |
| `nome`                          | `nome`                        | Obrigatorio.                                      |
| `local`                         | `local`                       | Obrigatorio.                                      |
| `status`                        | `status`                      | Normalizar para `ok`, `warn`, `danger`.           |
| `tag`                           | `tag`                         | Opcional.                                         |
| `tipo`                          | `tipo`                        | Opcional.                                         |
| `modelo`                        | `marcaModelo`                 | Nome legado da coluna real.                       |
| `fluido`                        | `fluidoRefrigerante`          | Nome legado da coluna real.                       |
| `componente`                    | `componente`                  | `evaporadora`, `condensadora`, `unidade_unica`.   |
| `criticidade`                   | `criticidade`                 | `baixa`, `media`, `alta`, `critica`.              |
| `prioridade_operacional`        | `prioridadeOperacional`       | `baixa`, `normal`, `alta`.                        |
| `periodicidade_preventiva_dias` | `periodicidadePreventivaDias` | Inteiro entre 15 e 365 quando presente.           |
| `created_at`                    | `createdAt`                   | ISO/string retornado pelo PostgREST.              |
| `dados_placa.numero_serie`      | `numeroSerie`                 | JSONB opcional.                                   |
| `dados_placa.capacidade_btu`    | `capacidadeBtuh`              | Converter para string no app-v2.                  |
| `fotos`                         | fora desta CP                 | Storage/anexos continuam fora de escopo.          |
| `patrimonio`                    | sem campo no app-v2           | Backlog PMOC/inventario.                          |

## 4. Decisoes

- `clienteId` no app-v2 passa a representar UUID real quando a fonte real esta
  ativa.
- IDs locais como `cliente-1` nao devem ser enviados como `cliente_id`.
- `equipamentos.id` permanece `text` nesta fase porque o schema real ainda usa
  `text primary key`.
- `fotos` nao sera mapeado para `anexos` nesta fase, pois anexos/storage exigem
  etapa propria.
- `status`, `criticidade` e `prioridadeOperacional` devem aceitar apenas valores
  conhecidos; valores desconhecidos caem para defaults seguros.
- `archivedAt` nao tem coluna real correspondente e continua fora desta leitura.

## 5. Proximo passo

Executar CP-I.2:

- criar mapper puro Supabase -> `Equipamento`;
- testar campos minimos;
- testar normalizacao de status/criticidade/prioridade;
- testar `cliente_id` UUID real em `clienteId`;
- nao importar Supabase real no mapper.
