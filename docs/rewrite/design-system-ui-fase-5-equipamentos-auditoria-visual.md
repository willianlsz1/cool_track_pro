# Design System/UI fase 5 - auditoria visual Equipamentos

Data: 2026-05-16

## Objetivo

Auditar documentalmente a area de Equipamentos do app-v2 apos a cobertura
mock/local de setores, arquivamento, desarquivamento e anexos placeholder,
antes de qualquer refinamento visual de runtime.

Esta fase existe para impedir que a etapa de design repita problemas do v1 ou
misture risco visual com integracoes sensiveis.

## Escopo

- Lista de equipamentos.
- Card de equipamento.
- Detalhe de equipamento.
- Estados vazios e filtros sem resultado.
- Estado arquivado e desarquivamento local.
- Anexos locais placeholder.
- Mobile, desktop, rolagem e texto longo como criterios de QA futura.

## Fora de escopo

- Alterar `src/`, CSS, tokens, primitives, componentes ou testes.
- Rodar QA visual em browser nesta fase.
- Implementar redesign amplo.
- Importar CSS, shell, templates ou navegacao do v1.
- Implementar input real de arquivo, camera, upload ou storage real.
- Implementar Supabase/RLS, migrations, billing real, assinatura real, quotas ou
  pricing.
- Reabrir PMOC, PDF/share, WhatsApp, router global, seguranca ou React Doctor.

## Evidencias revisadas

- `AGENTS.md`.
- `docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`.
- `docs/rewrite/design-system-ui-fase-2-home-hoje-checklist.md`.
- `docs/rewrite/design-system-ui-fase-4-fechamento-home-hoje.md`.
- `docs/rewrite/equipamentos-avancados-fase-12-reauditoria-paridade.md`.
- `docs/design/mudanca-21-cp-b-contrato-visual-superficies.md`.
- `src/app-v2/equipment/EquipmentList.tsx`.
- `src/app-v2/equipment/EquipmentCard.tsx`.
- `src/app-v2/equipment/EquipmentDetail.tsx`.
- `src/app-v2/equipment/EquipmentForm.tsx`.
- `src/app-v2/equipment/ClientList.tsx`.
- `src/app-v2/equipment/ClientDetail.tsx`.

## Diagnostico visual documental

### Lista

A lista concentra busca, filtros, seletor de setores, formulario de criacao de
equipamento e formulario de setores no mesmo fluxo. Isso e funcionalmente util,
mas a etapa visual precisa confirmar se o mobile nao vira uma sequencia longa
de controles antes dos itens.

Risco:

- densidade excessiva antes da lista em viewport estreito;
- filtro, setor e criacao competindo por hierarquia;
- estados vazios parecendo erro quando o filtro apenas nao retorna itens;
- texto longo de cliente, local, setor ou titulo quebrando ritmo da lista.

### Card

O card ja comunica status, proxima acao, cliente, setor, tipo/tag e anexo local.
Apos anexos placeholder, o card ganhou mais uma linha informacional e precisa
ser validado contra truncamento e altura excessiva.

Risco:

- `tw-truncate` esconder informacao importante demais sem affordance;
- badges de status e proxima acao comprimirem o nome do equipamento;
- capa/anexo local aumentar densidade vertical em listas longas;
- cards com nomes longos ficarem visualmente parecidos com erro de layout.

### Detalhe

O detalhe usa um bloco principal e uma coluna de blocos laterais para anexos,
resumo tecnico e cliente vinculado. A composicao e coerente para desktop, mas
precisa de QA real em mobile e alturas menores.

Risco:

- sensacao de excesso de cards no detalhe;
- acao de anexo placeholder competir com a leitura do resumo tecnico;
- botoes de arquivar, cancelar e confirmar ficarem longos em mobile;
- detalhe arquivado, erro de arquivamento e erro de anexo criarem excesso de
  alertas visuais simultaneos;
- coluna lateral ficar correta em desktop, mas longa demais em mobile.

### Anexos locais

Os anexos locais estao corretamente limitados a placeholder mock/local. Do ponto
de vista visual, eles devem ser tratados como evidencia auxiliar, nao como area
de upload real.

Risco:

- usuario interpretar placeholder como upload funcional;
- label de anexo muito longo estourar ou perder contexto;
- estado sem anexo parecer pendencia operacional obrigatoria;
- limite de tres anexos nao ficar claro quando a acao falhar.

### Estados vazios

Estados vazios e filtros sem resultado ainda precisam de validacao visual
dedicada. A mensagem deve separar claramente "nao ha equipamento cadastrado" de
"o filtro atual nao encontrou itens".

Risco:

- vazio real e filtro sem resultado parecerem o mesmo estado;
- usuario nao perceber como voltar para "Todos";
- CTA de primeiro equipamento competir com formulario de setores.

## Matriz de QA visual necessaria

A proxima fase deve validar no browser, no minimo:

| Cenario                                             | Viewport minimo              |
| --------------------------------------------------- | ---------------------------- |
| Lista com muitos equipamentos                       | 390x844, 1366x768, 1920x1080 |
| Lista vazia sem equipamento                         | 390x844, 1366x768            |
| Lista com filtro sem resultado                      | 390x844, 1366x768            |
| Card com nome, cliente, local, setor e anexo longos | 390x844, 1366x768            |
| Detalhe ativo sem anexos                            | 390x844, 1366x768            |
| Detalhe ativo com 1 e 3 anexos                      | 390x844, 1366x768, 1920x1080 |
| Detalhe arquivado                                   | 390x844, 1366x768            |
| Confirmacao de arquivamento                         | 390x844                      |
| Erro de anexo ou limite atingido                    | 390x844                      |
| Navegacao por foco nos botoes principais            | 390x844, 1366x768            |

Critérios:

- sem overflow horizontal;
- sem sobreposicao com navegacao inferior ou lateral;
- texto longo nao deve cobrir botoes, badges ou conteudo seguinte;
- estados vazios devem ser distinguiveis de erro;
- o detalhe deve permanecer escaneavel sem parecer pagina de cards acumulados;
- anexo placeholder nao deve sugerir upload real.

## Decisoes

- A Fase 5 nao altera runtime.
- Equipamentos nao deve puxar nova fatia funcional pequena antes do QA visual.
- PMOC segue excluido deste ciclo e deve ser refeito em etapa propria futura.
- Supabase/RLS, migrations, upload/storage real, billing real e PDF/share
  continuam bloqueados para etapas proprias.
- Qualquer ajuste visual futuro deve ser pequeno, baseado em screenshot e
  limitado a Equipamentos.

## Proximo checkpoint recomendado

Design System/UI fase 6: executar QA visual real de Equipamentos app-v2 em
browser com screenshots mobile 390, desktop 1366 e desktop 1920, incluindo
texto longo, estado vazio e detalhe com anexos, e somente depois decidir se
existe ajuste visual pequeno; sem runtime funcional, storage real, Supabase/RLS,
migrations, PMOC, PDF/share, billing real ou redesign amplo.
