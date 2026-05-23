# Etapa 3 - Design de Equipamento

## 1. Objetivo

Definir e validar a primeira versão da área **Equipamento** no `src/app-v2/`, ainda com dados mockados, para que a Home `Hoje` tenha um destino operacional claro.

A tela deve responder rapidamente:

> Onde está o equipamento e qual ação técnica faz sentido agora?

## 2. Decisões confirmadas

1. Equipamento é o centro operacional do novo app.
2. Cliente é contexto e detalhe vinculado ao equipamento, não a porta principal do atendimento.
3. O vínculo nasce de **Equipamento para Cliente**.
4. A Etapa 3 continua isolada do legado.
5. A Etapa 3 não conecta storage, Supabase, PDF/share, WhatsApp, orçamento real ou PMOC.
6. A implementação inicial usa mock data local e view models puros.
7. Textos visíveis usam português brasileiro com acentuação correta.

## 3. Resultado implementado

Foram implementados no `src/app-v2/`:

1. Shell local `AppV2Shell` com estado React.
2. Bottom nav controlada por `activeTab`.
3. Tela `Equipamentos` com busca, filtros e cards compactos.
4. Tela de detalhe do equipamento.
5. Abertura do detalhe a partir da Home e da fila curta.
6. View model puro para lista e detalhe.
7. Testes focados para busca, filtros, equipamento sem primeiro serviço e detalhe.

## 4. Lista de equipamentos

A lista contém:

1. Título **Equipamentos** e subtítulo **Parque técnico**.
2. Busca por nome, cliente, local ou tag.
3. Filtros compactos:
   - Todos;
   - Atenção;
   - Críticos;
   - Sem primeiro serviço.
4. Cards com:
   - nome do equipamento;
   - cliente e local;
   - tipo/tag;
   - status operacional;
   - próxima ação.

Critério visual preservado:

- cards compactos;
- texto principal em azul-marinho forte;
- metadados em cinza/azul legível;
- sem métricas grandes;
- sem transformar a lista em dashboard.

## 5. Detalhe do equipamento

O detalhe contém:

1. Cabeçalho com nome, tipo/tag e status.
2. Contexto de cliente, local, criticidade e prioridade.
3. Ações mockadas:
   - **Iniciar serviço** ou **Registrar primeiro serviço**;
   - **Agendar preventiva**;
   - **Ver cliente**.
4. Resumo técnico:
   - último serviço;
   - preventiva;
   - observação.
5. Bloco compacto de cliente vinculado.

Cliente permanece contexto do equipamento, não tela principal da etapa.

## 6. Estados cobertos

1. Equipamento com preventiva vencida.
2. Equipamento crítico.
3. Equipamento sem primeiro serviço.
4. Equipamento normal.
5. Busca sem resultado.
6. Detalhe de equipamento com cliente vinculado.
7. Detalhe de equipamento sem histórico.

## 7. Fora do escopo

- Persistência real.
- Cadastro real de equipamento.
- Edição real.
- Exclusão.
- Upload de fotos.
- Storage offline.
- Supabase.
- PDF/share.
- WhatsApp.
- Orçamento real.
- PMOC.
- Integração com rotas legadas.

## 8. QA executado

Preview local:

`http://127.0.0.1:5174/src/app-v2/preview.html`

Verificado:

1. Home mostra a próxima ação.
2. Bottom nav abre `Equipamento`.
3. Lista mostra equipamentos e filtros.
4. Card abre detalhe.
5. Detalhe mostra cliente como contexto/vínculo.
6. Voltar retorna para a lista.
7. Fluxo validado em viewport mobile `390x844`.
8. Fluxo validado em viewport largo `768x900`.

## 9. Riscos remanescentes

1. Dados ainda são mockados.
2. CTAs de serviço e preventiva ainda não executam fluxo real.
3. Serviços, orçamento, WhatsApp e PMOC ficam para etapas futuras.
4. O desenho final de rotas/adaptadores ainda precisa de etapa própria.
