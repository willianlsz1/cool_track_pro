# CSS Cleanup React Tailwind Plan

## Objetivo

Reduzir gradualmente a dependencia de CSS visual legado e de overrides globais, especialmente em `src/assets/styles/redesign.css`, sem alterar comportamento, contratos DOM, regras de negocio ou fluxos existentes.

Este plano assume que a migracao visual do app interno deve continuar de forma incremental. React nao elimina CSS: ele muda onde a composicao visual vive. Tailwind tambem gera CSS, mas aplicado perto do componente, com menor dependencia de seletores globais, menor acoplamento por cascata e melhor revisabilidade por tela.

## Principios

- Tokens globais continuam sendo a fonte de verdade para cor, espacamento, radius, sombra, foco e estados.
- CSS global deve ser minimo e previsivel.
- Estilo especifico de tela deve migrar para componentes React/Tailwind quando a tela ja estiver em React ou quando a migracao for segura.
- CSS legado deve ser removido apenas com prova de obsolescencia.
- `data-action`, `data-id`, `data-mode`, `data-nav`, IDs, handlers e testes existentes devem ser preservados.
- Nenhum PR deste plano deve criar feature nova, aba de O.S., regra de negocio, rota, storage/backend ou mudanca de auth logic.

## Mapa de Arquivos

### `src/assets/styles/tokens.css`

Classificacao: manter.

Responsabilidade desejada:

- tokens de marca e tema interno;
- aliases de compatibilidade para tokens antigos;
- status tokens;
- foco, bordas, sombras e superficies compartilhadas.

Nao deve conter:

- estilos de tela;
- seletores de componentes;
- overrides por rota.

### `src/assets/styles/layout.css`

Classificacao: manter e consolidar.

Responsabilidade desejada:

- shell autenticado;
- layout base;
- grid principal;
- comportamento responsivo global;
- estrutura de header/sidebar quando nao for especifica de tela.

Nao deve conter:

- estilos de cards de Clientes, Equipamentos, Relatorios ou Historico;
- regras de modal especificas;
- estados visuais de telas.

### `src/assets/styles/components.css`

Classificacao: consolidar em etapas.

Responsabilidade desejada:

- componentes vanilla/legados ainda vivos;
- estilos compartilhados que nao foram migrados para React;
- contratos antigos que ainda sao emitidos por views imperativas.

Risco:

- arquivo grande, com classes dinamicas e contratos de testes;
- nao remover em lote.

### `src/assets/styles/redesign.css`

Classificacao: reduzir e documentar excecoes.

Responsabilidade desejada:

- camada temporaria de compatibilidade visual;
- ajustes globais inevitaveis;
- correcoes de cascata transversais enquanto `components.css` ainda contem legado.

Destino final:

- arquivo pequeno;
- sem blocos grandes por tela;
- sem PRs novos adicionando secoes inteiras;
- excecoes documentadas.

### `src/assets/styles/clientes-premium.css`

Classificacao: migrar para React/Tailwind quando Clientes receber componentes base.

Responsabilidade atual:

- polish visual escopado de Clientes;
- ponte entre legado e UI nova.

Destino final:

- reduzir para zero ou manter apenas fallback temporario;
- mover cards, filtros, header e empty states para componentes React.

### CSS scoped de telas existentes

Classificacao: manter temporariamente, depois migrar por tela.

Exemplos:

- `src/assets/styles/internal-top-polish.css`;
- arquivos scoped de componentes legados em `src/assets/styles/components/_*.css`.

Regra:

- preferir scoped CSS a novos overrides globais;
- cada scoped CSS deve ter cabecalho explicando escopo e criterio de remocao.

### `src/react/pages` e `src/react/components`

Classificacao: migrar visual especifico para React/Tailwind.

Responsabilidade desejada:

- composicao visual de telas React;
- uso de componentes base;
- classes Tailwind e variantes controladas por props;
- preservacao de contratos DOM quando handlers legados dependem deles.

## Classificacao do CSS

### Manter

- tokens em `tokens.css`;
- layout global em `layout.css`;
- classes usadas por handlers, contratos, testes ou views legadas;
- estilos de fluxos ainda imperativos: fotos, assinatura, nameplate, PMOC, PDF/WhatsApp, paywall, modais legados.

### Consolidar

- duplicacoes em `redesign.css`;
- aliases de cores hardcoded que podem virar token local ou global;
- regras globais equivalentes para botoes, inputs, cards e pills;
- comentarios obsoletos que nao explicam excecao atual.

### Migrar para React/Tailwind

- headers de paginas React;
- action bars;
- filtros e tabs React;
- cards de Dashboard, Clientes, Equipamentos, Relatorios, Alertas e Orcamentos;
- empty states React;
- status pills renderizadas por React;
- tabelas/listas React.

### Remover

- seletores sem emissor em React, views, shell, componentes, testes e E2E;
- classes de visual antigo comprovadamente vencidas por blocos posteriores;
- regras de componentes removidos;
- estilos de card Plano Pro/sidebar se o markup correspondente nao existir mais;
- referencias a demo/guest visual removido.

### Documentar como Excecao

- `!important` necessario para vencer legado;
- classes dinamicas que nao aparecem em grep simples;
- regras globais temporarias que aguardam migracao de componente;
- hardcodes preservados por contraste ou por compatibilidade de PDF/modal.

## Componentes Base Propostos

### `Button`

Variantes:

- `primary`;
- `secondary`;
- `ghost`;
- `danger`;
- `premium`.

Regras:

- azul de marca para acao operacional primaria;
- verde apenas para significado semantico de sucesso;
- dourado apenas para premium/Pro;
- preservar `data-action`, `data-id` e `type`.

### `Card`

Variantes:

- `default`;
- `raised`;
- `subtle`;
- `interactive`.

Regras:

- usar tokens de surface, border, shadow e radius;
- aceitar `className` para compatibilidade gradual;
- evitar cards aninhados sem necessidade.

### `Badge` e `StatusPill`

Variantes:

- `success`;
- `info`;
- `warning`;
- `danger`;
- `neutral`;
- `premium`.

Regras:

- fundo suave;
- borda sutil;
- dot opcional;
- texto com truncation segura.

### `Input` e `Select`

Regras:

- foco acessivel com token;
- altura consistente;
- suporte a `aria-*`, `id`, `name`, `data-*`;
- sem comportamento proprio.

### `Modal`

Regras:

- overlay, dialog, header, body e footer consistentes;
- scroll interno seguro;
- manter handlers existentes;
- nao migrar auth modal neste plano.

### `Tabs`

Regras:

- active state consistente;
- suporte a `aria-selected`, `role`, `data-mode`;
- overflow seguro em mobile.

### `Table`

Regras:

- header, rows, hover e empty state consistentes;
- mobile pode trocar para cards quando a tela ja fizer isso;
- preservar colunas e dados existentes.

### `ActionBar`

Regras:

- alinhamento consistente entre acoes primarias, secundarias e overflow;
- preservar `data-action`;
- empilhar corretamente em mobile.

### `PageHeader`

Regras:

- titulo;
- subtitulo/contexto;
- slot de acoes;
- slot de filtros/tabs.

### `EmptyState`

Regras:

- iconografia funcional;
- mensagem curta;
- CTA opcional;
- sem criar nova acao.

## Estrategia por PR

### PR 1 - Auditoria e Inventario CSS

Objetivo:

- gerar inventario atualizado por arquivo, prefixo e emissor;
- classificar seletores como manter, consolidar, migrar, remover ou excecao.

Arquivos provaveis:

- criar ou atualizar `docs/migration/css-legacy-inventory.md`;
- criar provas especificas em `docs/migration/css-*-proof.md` quando houver remocao futura.

Validações:

- `npm run format`;
- `npm run check`.

Aceite:

- nenhuma alteracao visual;
- nenhum CSS removido;
- inventario com riscos e proximos candidatos.

### PR 2 - Criar Componentes UI Base React/Tailwind

Objetivo:

- criar componentes base sem migrar telas inteiras.

Arquivos provaveis:

- `src/react/components/ui/Button.jsx`;
- `src/react/components/ui/Card.jsx`;
- `src/react/components/ui/Badge.jsx`;
- `src/react/components/ui/Input.jsx`;
- `src/react/components/ui/Select.jsx`;
- `src/react/components/ui/Modal.jsx`;
- `src/react/components/ui/Tabs.jsx`;
- `src/react/components/ui/Table.jsx`;
- `src/react/components/ui/ActionBar.jsx`;
- `src/react/components/ui/PageHeader.jsx`;
- `src/react/components/ui/EmptyState.jsx`;
- `src/react/components/ui/StatusPill.jsx`;
- `src/react/components/ui/index.js`.

Testes:

- atualizar/adicionar testes em `src/__tests__/uiPrimitives.test.jsx`.

Aceite:

- componentes preservam props HTML e `data-*`;
- sem telas migradas;
- sem mudanca funcional.

### PR 3 - Migrar Dashboard para Componentes Base

Objetivo:

- substituir estilos visuais duplicados da Dashboard por componentes base.

Arquivos provaveis:

- `src/react/pages/Dashboard*.jsx`;
- testes de dashboard;
- remover apenas CSS comprovadamente substituido.

Preservar:

- IDs e contratos dos cards atuais;
- dados e view models;
- onboarding e acoes existentes.

Aceite:

- visual equivalente;
- menor dependencia de blocos Dashboard em `redesign.css`.

### PR 4 - Migrar Clientes

Objetivo:

- mover header, filtros, KPIs, cards e empty state de Clientes para componentes base.

Arquivos provaveis:

- `src/react/pages/ClientesPage.jsx`;
- `src/assets/styles/clientes-premium.css`;
- testes de Clientes.

Preservar:

- `data-action`;
- PMOC entry points;
- modal triggers;
- filtros e paginacao.

Aceite:

- reduzir ou remover partes de `clientes-premium.css`;
- manter comportamento atual.

### PR 5 - Migrar Equipamentos

Objetivo:

- migrar header, filtros, cards, status e empty states React de Equipamentos.

Arquivos provaveis:

- `src/react/pages/EquipamentosHeader.jsx`;
- `src/react/pages/EquipamentosListPage.jsx`;
- CSS scoped de Equipamentos;
- testes de Equipamentos.

Preservar:

- fotos;
- nameplate;
- setores;
- paywall;
- contexto de cliente/setor.

Aceite:

- nao tocar em fluxos imperativos de detalhe/fotos alem do necessario.

### PR 6 - Migrar Relatorios, Alertas e Orcamentos

Objetivo:

- migrar page headers, action bars, filtros, cards, tabelas/listas e pills para componentes base.

Arquivos provaveis:

- `src/react/pages/Relatorio*.jsx`;
- `src/react/pages/AlertasPage.jsx`;
- `src/react/pages/OrcamentosPage.jsx`;
- `src/assets/styles/internal-top-polish.css`;
- blocos correspondentes em `redesign.css`.

Preservar:

- PDF/export;
- WhatsApp/share;
- assinatura;
- quotas/paywall;
- checkout/pricing entry points.

Aceite:

- reduzir CSS scoped de topo e blocos PR6/PR11 em `redesign.css`.

### PR 7 - Migrar Modais Principais

Objetivo:

- padronizar modais principais sem alterar handlers.

Escopo inicial recomendado:

- Novo cliente;
- Novo orçamento;
- detalhe/equipamento;
- fotos/equipamento;
- setores.

Arquivos provaveis:

- componentes React se o modal ja estiver em React;
- wrappers vanilla apenas quando a migracao React for arriscada;
- CSS scoped de modal.

Preservar:

- submit handlers;
- IDs;
- validacoes;
- foco;
- scroll.

Aceite:

- scroll e visual consistentes;
- menos regras globais de `.modal` em `redesign.css`.

### PR 8 - Remover CSS Antigo Comprovadamente Morto

Objetivo:

- remover seletores com prova documental.

Processo:

1. escolher uma microfamilia;
2. provar ausencia de emissor em React, views, shell, componentes, testes e E2E;
3. remover CSS;
4. rodar testes focados;
5. atualizar inventario.

Aceite:

- nenhuma remocao por duvida;
- cada remocao com prova em docs.

### PR 9 - Consolidar `redesign.css`

Objetivo:

- deixar `redesign.css` como camada pequena de compatibilidade.

Tarefas:

- mover blocos por tela restantes para arquivos scoped ou componentes;
- reduzir duplicacoes;
- reduzir `!important` onde a cascata permitir;
- manter excecoes documentadas;
- atualizar testes de identidade visual.

Aceite:

- arquivo menor;
- responsabilidade clara;
- novos estilos nao devem ser adicionados ali sem justificativa.

## Testes Necessarios

Por PR:

- testes focados da area impactada;
- `npm run format`;
- `npm run check`;
- `npm run test`;
- `npm run build`;
- `git diff --check`.

Smoke visual recomendado:

- Dashboard;
- Clientes;
- Equipamentos;
- Historico;
- Relatorios;
- Alertas;
- Orcamentos;
- modais principais;
- desktop e mobile.

## Riscos

- Classes dinamicas podem nao aparecer em busca textual simples.
- `redesign.css` vence cascata por estar carregado tarde; remover regra pode revelar CSS antigo.
- Componentes React ainda convivem com handlers vanilla baseados em `data-*`.
- Migrar visual para Tailwind sem preservar contratos pode quebrar fluxos legados.
- Reduzir `!important` antes de simplificar `components.css` pode causar regressao visual.

## Criterios de Aceite Globais

- `data-action`, `data-id`, `data-mode`, `data-nav` preservados.
- IDs preservados.
- Handlers e event listeners preservados.
- Testes existentes preservados ou atualizados apenas quando o contrato visual mudar intencionalmente.
- Nenhuma feature nova.
- Nenhuma aba de O.S.
- Tokens globais seguem como fonte de verdade.
- Dependencia de `redesign.css` reduzida gradualmente.
- CSS morto removido apenas com prova.
