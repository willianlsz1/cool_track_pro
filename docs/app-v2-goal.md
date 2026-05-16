# app-v2 goal - Paridade Registro de Servico

## Diretriz superior

Implementacoes futuras do app-v2 devem seguir
`docs/rewrite/plano-paridade-funcional-v1-v2.md`.

O objetivo do app-v2 nao e ser uma versao enxuta do v1. O objetivo e preservar
paridade funcional operacional com o app legado, mantendo visual, shell,
componentes e arquitetura novos no app-v2.

Antes de novos checkpoints de codigo, preencher ou atualizar a matriz de
paridade do fluxo afetado e separar paridade obrigatoria, melhoria permitida,
backlog e areas sensiveis.

## Checkpoint atual - Reauditoria funcional pos-fechamento visual

Reauditar documentalmente a matriz UX v1-v2 apos o fechamento da primeira
passada visual do app-v2 e escolher a proxima lacuna nao sensivel por evidencia,
sem implementar runtime nesta etapa.

### Analise resumida

Os quatro candidatos listados pela fase 12 ja possuem evidencia de execucao no
worktree atual:

- Historico/filtros em `docs/rewrite/servicos-registros-filtros-app-v2.md`;
- Relatorios locais em `docs/rewrite/relatorios-consolidados-locais-app-v2.md`;
- Orcamentos mock/action e fases locais em documentos de Orcamentos;
- Clientes filtros/relatorio local em
  `docs/rewrite/clientes-fase-5-consulta-relatorio-local.md`.

A estimativa geral permanece **76%** nesta etapa porque nao houve recalculo
item a item dos 38 itens ponderados.

### Plano

- Revisar matriz e auditoria funcional v1-v2.
- Revisar evidencias dos quatro candidatos nao sensiveis.
- Classificar se cada candidato ainda esta aberto ou ja foi executado.
- Escolher o proximo checkpoint seguro sem runtime.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao alterar `src/`, runtime, CSS, tokens, primitives, componentes, testes,
  storage real, localStorage, Supabase/RLS, migrations, PMOC, billing real,
  assinatura, PDF/share, WhatsApp, perfil real, security hardening, React Doctor
  ou redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/reauditoria-funcional-pos-fechamento-visual.md`.
- Historico/filtros, Relatorios locais, Orcamentos mock/action e Clientes
  filtros/relatorio local foram classificados como candidatos ja executados no
  worktree atual.
- A estimativa geral permanece **76%** ate recalculo documental completo dos 38
  itens ponderados.
- O proximo checkpoint recomendado foi definido como recalculo documental da
  matriz UX v1-v2.

### Validacao executada

- `npm run format:check` falhou antes da formatacao em
  `docs/rewrite/reauditoria-funcional-pos-fechamento-visual.md`.
- `git diff --check` passou antes da formatacao.
- `npm run format` passou e formatou o novo relatorio.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou apos a formatacao.

### Proximo checkpoint recomendado

Recalculo documental completo da matriz UX v1-v2 apos fechamento visual e
candidatos nao sensiveis ja executados, revisando os 38 itens ponderados,
atualizando status e percentual geral quando houver evidencia documental e de
testes, sem alterar runtime e mantendo PMOC, Supabase/RLS, migrations, storage
real, billing real, assinatura, PDF/share, WhatsApp, perfil real, security
hardening e React Doctor em etapas proprias.

---

## Historico - Design System/UI fase 12 fechamento da primeira passada visual

Fechar documentalmente a primeira passada visual do app-v2, consolidando Home
Hoje, Equipamentos, Servicos e Conta, evidencias de QA, criterios aceitos,
limites do que nao foi coberto e gates para nao reabrir visual sem novo achado
objetivo.

### Analise resumida

As fases 1 a 11 de Design System/UI fecharam ciclos controlados para Home Hoje,
Equipamentos, Servicos e Conta. As pastas de QA visual registram 76 screenshots
somando Home, Equipamentos, Servicos e Conta, com validacoes em mobile 390,
desktop 1366 e desktop 1920 nos ciclos que exigiram browser real.

Este fechamento nao torna a UX do app-v2 100% migrada. Ele encerra a primeira
passada visual local e mantem a estimativa funcional geral em **76%** ate nova
auditoria funcional.

### Plano

- Revisar relatorios Design System/UI fases 1 a 11.
- Consolidar evidencias de QA visual e screenshots.
- Registrar criterios aceitos e limites do fechamento.
- Definir gates para reabrir visual sem repetir erro do v1.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao alterar `src/`, runtime, CSS, tokens, primitives, componentes, testes,
  storage real, localStorage, Supabase/RLS, migrations, PMOC, billing real,
  assinatura, PDF/share, WhatsApp, perfil real, security hardening, React Doctor
  ou redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/design-system-ui-fase-12-fechamento-primeira-passada.md`.
- Home Hoje, Equipamentos, Servicos e Conta foram consolidados como primeira
  passada visual encerrada no recorte local.
- Foram registradas 76 evidencias visuais em screenshots nos ciclos de QA.
- Foram definidos gates para reabrir visual somente com achado objetivo ou novo
  fluxo funcional que altere densidade/hierarquia.
- A estimativa funcional geral permanece **76%**.
- PMOC permanece excluido deste ciclo e deve ser refeito em nova etapa propria.
- Supabase/RLS e migrations permanecem em etapa propria futura; algumas
  migrations podem ser refeitas se necessario, mas nao neste ciclo visual.

### Validacao executada

- `npm run format:check` falhou antes da formatacao em
  `docs/rewrite/design-system-ui-fase-12-fechamento-primeira-passada.md`.
- `git diff --check` passou antes da formatacao.
- `npm run format` passou e formatou o novo relatorio.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou apos a formatacao.

### Proximo checkpoint recomendado

Reauditoria funcional documental pos-fechamento visual: revisar a matriz UX
v1-v2 e escolher uma unica proxima lacuna nao sensivel entre Historico/filtros,
Relatorios locais, Orcamentos mock/action e Clientes filtros/relatorio local,
sem implementar runtime nesta etapa e mantendo PMOC, Supabase/RLS, migrations,
storage real, billing real, assinatura, PDF/share, WhatsApp, perfil real,
security hardening e React Doctor em etapas proprias.

---

## Historico - Reauditoria matriz UX v1-v2 pos Conta visual

Reauditar documentalmente a matriz UX v1-v2 apos o fechamento visual de `Conta`,
confirmar que a primeira passada visual das areas principais do app-v2 nao muda
a estimativa funcional geral e escolher o proximo checkpoint seguro sem reabrir
fluxos ja fechados por suposicao.

### Analise resumida

Home Hoje, Equipamentos, Servicos e Conta ja possuem ciclos visuais recentes no
recorte local. `Conta` foi validada em 13 cenarios entre mobile 390, desktop
1366 e desktop 1920, sem overflow horizontal de pagina, sem elementos visiveis
fora da viewport e sem termos sensiveis visiveis.

A estimativa geral permanece **76%**, porque a fase visual nao cria nova
paridade funcional. As lacunas restantes continuam concentradas em areas
sensiveis ou etapas proprias.

### Plano

- Revisar matriz de paridade e auditoria funcional v1-v2.
- Revisar evidencias da fase 11 de `Conta`.
- Consolidar o estado visual recente de Home Hoje, Equipamentos, Servicos e
  Conta.
- Classificar candidatos ao proximo checkpoint sem reabrir fluxos ja fechados.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao alterar `src/`, runtime, CSS, tokens, primitives, componentes, testes,
  storage real, localStorage, Supabase/RLS, migrations, PMOC, billing real,
  assinatura, PDF/share, WhatsApp, perfil real, security hardening, React Doctor
  ou redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-conta-design.md`.
- Home Hoje, Equipamentos, Servicos e Conta foram reconhecidos como areas com
  ciclos visuais recentes no recorte local.
- A estimativa geral permanece **76%**, porque esta etapa nao cria nova
  paridade funcional.
- PMOC permanece excluido deste ciclo e deve ser refeito em nova etapa propria.
- Supabase/RLS e migrations permanecem em etapa propria futura; algumas
  migrations podem ser refeitas se necessario, mas nao neste ciclo UX.
- O proximo checkpoint recomendado foi definido como fechamento documental da
  primeira passada visual do app-v2.

### Validacao executada

- `npm run format:check` falhou antes da formatacao em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-conta-design.md`.
- `git diff --check` passou antes da formatacao.
- `npm run format` passou e formatou o novo relatorio.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou apos a formatacao.

### Proximo checkpoint recomendado

Design System/UI fase 12: fechamento documental da primeira passada visual do
app-v2, consolidando Home Hoje, Equipamentos, Servicos e Conta, evidencias de
QA, criterios aceitos, limites do que nao foi coberto e gates para nao reabrir
visual sem novo achado objetivo; sem alterar runtime, sem CSS, sem tokens, sem
componentes, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC, sem
billing real, sem assinatura, sem PDF/share, sem WhatsApp, sem perfil real, sem
security hardening e sem React Doctor.

---

## Historico - Design System/UI fase 11 QA visual Conta

Executar QA visual real de `Conta` app-v2 em browser com screenshots mobile 390,
desktop 1366 e desktop 1920, cobrindo estado default, densidade compacta,
lembrete ativo, foco em controle, texto longo local e preferencias; somente
depois decidir se existe ajuste visual pequeno; sem runtime funcional novo, sem
storage real, sem localStorage, sem Supabase/RLS, sem migrations, sem PMOC, sem
billing real, sem assinatura, sem PDF/share, sem WhatsApp, sem perfil real e sem
redesign amplo.

### Analise resumida

A fase 10 classificou riscos visuais de `Conta` sem alterar runtime. A fase 11
executa a verificacao real em browser para separar risco teorico de problema
visual concreto.

### Plano

- Abrir `src/app-v2/preview.html` no servidor local.
- Capturar `Conta` em mobile 390, desktop 1366 e desktop 1920.
- Incluir estado default, densidade compacta, lembrete ativo, foco em atalho,
  texto local e preferencias.
- Salvar screenshots e `metrics.json`.
- Corrigir somente achado visual pequeno se houver evidencia objetiva.
- Atualizar documentos de acompanhamento.
- Rodar validacao focada e documental.

### Anti-escopo

- Nao alterar regras de negocio, store, actions, view models, contratos
  funcionais, storage real, localStorage, Supabase/RLS, migrations, PMOC,
  PDF/share real, WhatsApp real, billing real, assinatura, perfil real, router
  global, seguranca, React Doctor ou redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/design-system-ui-fase-11-conta-qa-visual.md`.
- Evidencias visuais salvas em
  `docs/rewrite/qa-design-system-ui-fase-11-conta/`.
- Foram capturados 13 cenarios: 5 em mobile 390, 4 em desktop 1366 e 4 em
  desktop 1920.
- Default, densidade compacta, lembrete ativo, foco em atalho, texto local e
  preferencias foram validados.
- A captura ficou sem overflow horizontal de pagina, sem elementos visiveis fora
  da viewport e sem termos sensiveis visiveis nos 13 cenarios.
- Nao houve ajuste visual porque nao houve achado objetivo.

### Validacao executada

- QA visual capturou 13 cenarios em
  `docs/rewrite/qa-design-system-ui-fase-11-conta/`.
- `metrics.json` ficou sem overflow horizontal de pagina, sem elementos visiveis
  fora da viewport e sem termos sensiveis visiveis nos 13 cenarios.
- `npm run format` passou.
- `npm run format:check` passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de `Conta`,
para escolher o proximo fluxo do app-v2 por lacuna funcional ou visual ainda nao
sensivel; manter PMOC, Supabase/RLS, migrations, storage real, billing real,
PDF/share, WhatsApp, perfil real e security hardening em etapas proprias.

---

## Historico - Design System/UI fase 10 auditoria visual Conta

Auditar documentalmente a area `Conta` do app-v2, cobrindo atalhos locais,
preferencias em memoria, lembrete local, ajuda, estados locais, texto longo,
foco, mobile/desktop e densidade compacta, sem alterar runtime, sem storage
real, sem Supabase/RLS, sem migrations, sem PMOC, sem billing real, sem
assinatura, sem PDF/share, sem WhatsApp, sem perfil real e sem redesign amplo.

### Analise resumida

`Conta` ja deixou de ser placeholder no criterio mock/local e possui view model,
UI minima, preferencias locais, microcopy, estados locais, acessibilidade basica
e testes focados. A area ainda nao teve auditoria visual dedicada dentro do
ciclo Design System/UI.

### Plano

- Revisar documentos de `Conta` fases 1 a 6.
- Revisar `AccountHome`, `accountViewModel` e testes focados.
- Classificar riscos visuais sem alterar runtime.
- Definir matriz minima de QA visual futura.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao alterar `src/`, runtime, CSS, tokens, componentes, primitives, storage
  real, localStorage, Supabase/RLS, migrations, PMOC, billing real, assinatura,
  PDF/share, WhatsApp, perfil real, security hardening, React Doctor ou redesign
  amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/design-system-ui-fase-10-conta-auditoria-visual.md`.
- Atalhos locais, preferencias em memoria, lembrete local, ajuda, estados
  locais, texto longo, foco, mobile/desktop e densidade compacta foram
  classificados como criterios obrigatorios da proxima fase visual.
- Riscos de densidade compacta em mobile, atalhos com texto longo, selects em
  grid, lembrete condicional, termos sensiveis proximos e excesso de blocos
  foram documentados.
- Perfil real, persistencia, billing, assinatura, Supabase/RLS, migrations,
  PMOC, PDF/share, WhatsApp e suporte real foram mantidos fora do ciclo.

### Validacao executada

- `npm run format` passou.
- `npm run format:check` passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 11: executar QA visual real de `Conta` app-v2 em browser
com screenshots mobile 390, desktop 1366 e desktop 1920, cobrindo estado default,
densidade compacta, lembrete ativo, foco em controle, texto longo local e
preferencias; somente depois decidir se existe ajuste visual pequeno; sem
runtime funcional novo, sem storage real, sem localStorage, sem Supabase/RLS, sem
migrations, sem PMOC, sem billing real, sem assinatura, sem PDF/share, sem
WhatsApp, sem perfil real e sem redesign amplo.

---

## Historico - Reauditoria matriz UX v1-v2 pos Servicos visual

Reauditar a matriz UX v1-v2 apos o fechamento visual local de `Servicos`,
escolher o proximo fluxo do app-v2 por lacuna funcional ou visual ainda nao
sensivel e manter PMOC, Supabase/RLS, migrations, storage real, billing real,
PDF/share, WhatsApp e security hardening em etapas proprias.

### Analise resumida

`Servicos` fechou a fase visual com 27 cenarios em mobile 390, desktop 1366 e
desktop 1920 sem overflow horizontal de pagina nem elementos visiveis fora da
viewport apos ajuste pontual no input `Buscar registros`. Isso encerra o ciclo
visual local de Registros, Relatorios e Orcamentos no recorte atual.

Home Hoje, Equipamentos e Servicos ja possuem ciclos visuais recentes. `Conta`
saiu de placeholder no ciclo funcional local, mas ainda nao recebeu auditoria
visual dedicada como area principal do app-v2.

### Plano

- Revisar matriz de paridade e auditoria funcional v1-v2.
- Revisar evidencias das fases 8 e 9 de `Servicos`.
- Revisar fechamento local de `Conta`.
- Classificar candidatos nao sensiveis ao proximo fluxo.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao alterar `src/`, runtime, CSS, tokens, componentes, primitives, storage
  real, Supabase/RLS, migrations, PMOC, billing real, assinatura, PDF/share,
  WhatsApp, perfil real, security hardening, React Doctor ou redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-servicos-design.md`.
- `Servicos` foi confirmado como visualmente fechado para Registros,
  Relatorios e Orcamentos nos cenarios cobertos pela fase 9.
- A estimativa geral permanece **76%**, porque a fase visual nao altera peso
  funcional e as lacunas restantes de `Servicos` sao sensiveis ou de etapa
  propria.
- PMOC permanece excluido deste ciclo e deve ser refeito em nova etapa propria.
- Supabase/RLS e migrations permanecem em etapa propria futura; algumas
  migrations podem ser refeitas se necessario, mas nao neste ciclo UX.
- O proximo fluxo nao sensivel foi definido como auditoria visual documental de
  `Conta`.

### Validacao executada

- `npm run format` passou.
- `npm run format:check` passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 10: auditoria visual documental de `Conta` no app-v2,
cobrindo atalhos locais, preferencias em memoria, lembrete local, ajuda,
estados locais, texto longo, foco, mobile/desktop e densidade compacta, sem
alterar runtime, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC,
sem billing real, sem assinatura, sem PDF/share, sem WhatsApp, sem perfil real
e sem redesign amplo.

---

## Historico - Design System/UI fase 9 QA visual Servicos

Executar QA visual real de `Servicos` app-v2 em browser com screenshots mobile
390, desktop 1366 e desktop 1920, cobrindo Registros, Relatorios, Orcamentos,
estados vazios, texto longo, preview de relatorio e edicao local de orcamento;
somente depois decidir se existe ajuste visual pequeno; sem runtime funcional,
storage real, Supabase/RLS, migrations, PMOC, PDF/share real, WhatsApp real,
billing real ou redesign amplo.

### Analise resumida

A fase 8 classificou os riscos visuais de `Servicos` sem alterar runtime. A fase
9 executa a verificacao real em browser para separar risco teorico de problema
visual concreto.

### Plano

- Abrir `src/app-v2/preview.html` no servidor local.
- Capturar Registros, Relatorios e Orcamentos em mobile 390, desktop 1366 e
  desktop 1920.
- Incluir estados vazios, texto tecnico, preview de relatorio, edicao de
  orcamento e item local longo.
- Salvar screenshots e `metrics.json`.
- Corrigir somente achado visual pequeno se houver evidencia objetiva.
- Atualizar documentos de acompanhamento.
- Rodar validacao focada e geral.

### Anti-escopo

- Nao alterar regras de negocio, store, actions, view models, contratos
  funcionais, storage real, Supabase/RLS, migrations, PMOC, PDF/share real,
  WhatsApp real, billing real, assinatura, router global, seguranca, React
  Doctor ou redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/design-system-ui-fase-9-servicos-qa-visual.md`.
- Evidencias visuais salvas em
  `docs/rewrite/qa-design-system-ui-fase-9-servicos/`.
- Foram capturados 27 cenarios: 9 em mobile 390, 9 em desktop 1366 e 9 em
  desktop 1920.
- A primeira captura encontrou overflow horizontal de 2px em
  `Servicos > Registros` no mobile 390.
- `src/app-v2/service/ServicesHome.tsx` recebeu somente `tw-box-border` no input
  `Buscar registros`, espelhando o padrao ja usado em Relatorios.
- A recaptura completa ficou sem overflow horizontal de pagina e sem elementos
  visiveis fora da viewport nos 27 cenarios.

### Validacao executada

- QA visual pos-ajuste recapturou 27 cenarios em
  `docs/rewrite/qa-design-system-ui-fase-9-servicos/`.
- `metrics.json` pos-ajuste ficou sem overflow horizontal de pagina e sem
  elementos visiveis fora da viewport nos 27 cenarios.
- `npm run format` passou.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 38
  testes.
- `npm run build` passou com warnings Vite conhecidos de chunks/static+dynamic.
- `npm run check` passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite conhecidos.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de
`Servicos`, para escolher o proximo fluxo do app-v2 por lacuna funcional ou
visual ainda nao sensivel; manter PMOC, Supabase/RLS, migrations, storage real,
billing real, PDF/share, WhatsApp e security hardening em etapas proprias.

---

## Historico - Design System/UI fase 8 auditoria visual Servicos

Auditar documentalmente a area de `Servicos` do app-v2, cobrindo Registros,
Relatorios e Orcamentos locais apos os checkpoints funcionais ja existentes,
sem alterar runtime, sem PDF/share real, WhatsApp real, storage real,
Supabase/RLS, migrations, PMOC, billing real, assinatura, router novo ou
redesign amplo.

### Analise resumida

`Servicos` ja concentra Registros com filtros locais, Relatorios consolidados
locais e Orcamentos mock/local. A proxima etapa segura e separar os riscos
visuais de subvisoes, filtros, listas, preview de relatorio e edicao local de
orcamento antes de qualquer QA em browser ou ajuste visual.

### Plano

- Revisar regras documentais de Design System/UI do app-v2.
- Revisar componentes de `Servicos` como evidencia estatica.
- Classificar riscos visuais sem alterar runtime.
- Criar matriz minima de QA visual futura.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao alterar runtime, CSS, tokens, primitives, componentes, testes, storage
  real, Supabase/RLS, migrations, PMOC, PDF/share real, WhatsApp real, billing
  real, assinatura, router global, seguranca, React Doctor ou redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/design-system-ui-fase-8-servicos-auditoria-visual.md`.
- Registros, Relatorios e Orcamentos foram auditados por risco visual sem
  alterar runtime.
- Riscos de subvisao horizontal, densidade de filtros, lista operacional,
  preview imprimivel, cards de orcamento e edicao local foram documentados.
- Definida matriz minima de QA visual para mobile 390, desktop 1366 e desktop 1920.
- PMOC, PDF/share real, WhatsApp real, storage real, Supabase/RLS, migrations e
  billing real foram mantidos fora do ciclo.

### Validacao executada

- `npm run format:check` falhou antes da formatacao em `docs/app-v2-goal.md`,
  `docs/rewrite/auditoria-ux-funcional-v1-v2.md` e
  `docs/rewrite/design-system-ui-fase-8-servicos-auditoria-visual.md`.
- `npm run format` passou e formatou os documentos alterados.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 9: executar QA visual real de `Servicos` app-v2 em
browser com screenshots mobile 390, desktop 1366 e desktop 1920, cobrindo
Registros, Relatorios, Orcamentos, estados vazios, texto longo, preview de
relatorio e edicao local de orcamento; somente depois decidir se existe ajuste
visual pequeno; sem runtime funcional, storage real, Supabase/RLS, migrations,
PMOC, PDF/share real, WhatsApp real, billing real ou redesign amplo.

---

## Historico - Reauditoria matriz UX v1-v2 pos Equipamentos visual

Reauditar documentalmente a matriz UX v1-v2 apos o fechamento visual local de
Equipamentos, escolher o proximo fluxo do app-v2 por lacuna funcional ou visual
ainda nao sensivel e manter PMOC, Supabase/RLS, migrations, storage real,
billing real, PDF/share, WhatsApp, security hardening e React Doctor em etapas
proprias.

### Analise resumida

Equipamentos esta visualmente fechado para lista, filtros, estado vazio, texto
longo e detalhe com anexos locais. A area continua `parcial` na matriz por
lacunas sensiveis ou de etapa propria, como delecao destrutiva, upload/storage
real, gates reais, persistencia real e Supabase/RLS/migrations.

### Plano

- Revisar matriz, auditoria UX e relatorios das fases 5, 6 e 7 de Equipamentos.
- Confirmar se a porcentagem geral muda ou permanece igual.
- Classificar candidatos nao sensiveis ao proximo fluxo.
- Registrar decisao documental e atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao alterar runtime, CSS, tokens, componentes, testes, storage real,
  Supabase/RLS, migrations, PMOC, PDF/share, billing real, assinatura,
  WhatsApp, router global, seguranca, React Doctor ou redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-equipamentos-design.md`.
- A estimativa geral permanece **76%** porque o fechamento visual de
  Equipamentos nao altera peso funcional da matriz.
- Equipamentos permanece avancado localmente, mas as lacunas restantes foram
  mantidas em etapas sensiveis proprias.
- Acoes pos-salvamento, filtros de Registros, Relatorios consolidados e
  Orcamentos mock/local ja possuem checkpoints anteriores; nao foram reabertos
  para evitar retrabalho.
- PMOC permanece excluido deste ciclo e deve ser refeito em etapa propria
  futura.
- Supabase/RLS e migrations permanecem em etapa propria futura; algumas
  migrations podem ser refeitas se necessario, mas nao neste ciclo UX.

### Validacao executada

- `npm run format:check` falhou antes da formatacao em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-equipamentos-design.md`.
- `npm run format` passou e formatou o novo relatorio.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 8: auditoria visual documental de `Servicos` no app-v2,
cobrindo Registros, Relatorios e Orcamentos locais apos os checkpoints
funcionais ja existentes, sem alterar runtime, sem PDF/share real, WhatsApp
real, storage real, Supabase/RLS, migrations, PMOC, billing real, assinatura,
router novo ou redesign amplo.

---

## Historico - Design System/UI fase 7 filtros mobile Equipamentos

Corrigir somente a faixa de filtros de Equipamentos no mobile para evitar chip
parcialmente cortado, preferindo quebra de linha ou comportamento equivalente
sem overflow horizontal de pagina; validar novamente mobile 390, desktop 1366 e
desktop 1920; sem storage real, Supabase/RLS, migrations, PMOC, PDF/share,
billing real ou redesign amplo.

### Analise resumida

A fase 6 confirmou que Equipamentos nao tinha overflow horizontal de pagina, mas
o chip `Sem primeiro servico` ficava parcialmente cortado no mobile 390 dentro
da faixa rolavel. A fase 7 resolve esse achado com ajuste pequeno no container
de filtros.

### Plano

- Ajustar somente a faixa de filtros em `EquipmentList`.
- Manter filtros, textos, estados e handlers.
- Reexecutar QA visual em mobile 390, desktop 1366 e desktop 1920.
- Documentar evidencias pos-ajuste.
- Rodar validacao focada e geral.

### Anti-escopo

- Nao alterar regras de negocio, store, actions, view model, contratos,
  storage real, Supabase/RLS, migrations, PMOC, PDF/share, billing real,
  assinatura, WhatsApp, router global, seguranca, React Doctor ou redesign
  amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/design-system-ui-fase-7-equipamentos-filtros-mobile.md`.
- `src/app-v2/equipment/EquipmentList.tsx` passou a quebrar linha na faixa de
  filtros com `tw-flex-wrap`, removendo `tw-overflow-x-auto`.
- Evidencias pos-ajuste salvas em
  `docs/rewrite/qa-design-system-ui-fase-7-equipamentos-filtros/`.
- Foram recapturados 12 cenarios: lista, filtro sem resultado, texto longo e
  detalhe com anexos em mobile 390, desktop 1366 e desktop 1920.
- Todos os cenarios ficaram sem overflow horizontal de pagina e sem elementos
  visiveis fora da viewport.

### Validacao executada

- QA visual pos-ajuste recapturou 12 cenarios em
  `docs/rewrite/qa-design-system-ui-fase-7-equipamentos-filtros/`.
- `metrics.json` pos-ajuste ficou sem overflow horizontal de pagina e sem
  elementos visiveis fora da viewport nos 12 cenarios.
- `npm run format` passou.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellEquipmentAttachments.test.tsx --run`
  passou com 39 testes.
- `npm run build` passou com warnings Vite conhecidos de chunks/static+dynamic.
- `npm run format:check` passou.
- `npm run check` passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite conhecidos.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de
Equipamentos, para escolher o proximo fluxo do app-v2 por lacuna funcional ou
visual ainda nao sensivel; manter PMOC, Supabase/RLS, migrations, storage real,
billing real, PDF/share, WhatsApp e security hardening em etapas proprias.

---

## Historico - Design System/UI fase 6 QA visual Equipamentos

Executar QA visual real de Equipamentos app-v2 em browser com screenshots
mobile 390, desktop 1366 e desktop 1920, incluindo texto longo, estado vazio e
detalhe com anexos, e somente depois decidir se existe ajuste visual pequeno;
sem runtime funcional, storage real, Supabase/RLS, migrations, PMOC, PDF/share,
billing real ou redesign amplo.

### Analise resumida

A fase 5 classificou riscos visuais de Equipamentos sem alterar runtime. A fase
6 executa a verificacao real em browser para separar problema visual concreto de
risco apenas teorico.

### Plano

- Abrir `src/app-v2/preview.html` no servidor local.
- Navegar para Equipamentos.
- Capturar lista, filtro sem resultado, texto longo e detalhe com anexos.
- Salvar screenshots e `metrics.json`.
- Classificar achados.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao implementar runtime nesta fase.
- Nao alterar storage real, Supabase/RLS, migrations, PMOC, PDF/share, billing
  real, assinatura, WhatsApp, router global, seguranca, React Doctor ou
  redesign amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/design-system-ui-fase-6-equipamentos-qa-visual.md`.
- Evidencias visuais salvas em
  `docs/rewrite/qa-design-system-ui-fase-6-equipamentos/`.
- Foram capturados 12 screenshots: lista, filtro sem resultado, texto longo e
  detalhe com anexos em mobile 390, desktop 1366 e desktop 1920.
- Nao houve overflow horizontal da pagina em nenhum cenario.
- Estado vazio e detalhe com 3 anexos locais renderizaram corretamente.
- Texto longo foi truncado sem quebrar layout.
- Achado visual: no mobile 390, o chip `Sem primeiro servico` fica
  parcialmente cortado dentro da faixa de filtros rolavel.

### Validacao executada

- Captura visual real executada em 12 cenarios.
- `metrics.json` salvo em
  `docs/rewrite/qa-design-system-ui-fase-6-equipamentos/`.
- Achado visual registrado para Fase 7.

### Proximo checkpoint recomendado

Design System/UI fase 7: ajustar somente a faixa de filtros de Equipamentos no
mobile para evitar chip parcialmente cortado, preferindo quebra de linha ou
comportamento equivalente sem overflow horizontal de pagina; validar novamente
mobile 390, desktop 1366 e desktop 1920; sem storage real, Supabase/RLS,
migrations, PMOC, PDF/share, billing real ou redesign amplo.

---

## Historico - Design System/UI fase 5 auditoria visual Equipamentos

Auditar documentalmente a area de Equipamentos app-v2 apos a cobertura
mock/local, cobrindo lista, card, detalhe, estados vazios, anexos locais,
mobile/desktop, rolagem e texto longo, sem alterar runtime, sem storage real,
sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share, sem billing real e
sem redesign amplo.

### Analise resumida

A fase 12 confirmou que Equipamentos esta avancado para UX funcional mock/local,
mas ainda nao passou por uma trava visual propria. A fase 5 de Design System/UI
separa os riscos de lista, card, detalhe, estados vazios, anexos e texto longo
antes de qualquer ajuste visual.

### Plano

- Revisar regras documentais de Design System/UI do app-v2.
- Revisar os componentes de Equipamentos como evidencia estatica.
- Classificar riscos visuais sem alterar runtime.
- Criar matriz minima de QA visual futura.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao implementar runtime, CSS, tokens, primitives, componentes, testes,
  browser QA, input real de arquivo, camera, upload, storage real,
  Supabase/RLS, migrations, billing real, assinatura real, quotas, PMOC,
  PDF/share, WhatsApp, router global, seguranca, React Doctor ou redesign
  amplo.

### Resultado deste checkpoint

- Criado relatorio documental em
  `docs/rewrite/design-system-ui-fase-5-equipamentos-auditoria-visual.md`.
- Riscos visuais de lista, card, detalhe, anexos locais, estados vazios e texto
  longo foram classificados sem alterar runtime.
- Definida matriz minima de QA visual para mobile 390, desktop 1366 e desktop 1920.
- PMOC, storage real, Supabase/RLS, migrations, billing real e PDF/share foram
  mantidos fora do ciclo.

### Validacao executada

- `npm run format:check` falhou antes da formatacao em
  `docs/app-v2-goal.md` e
  `docs/rewrite/design-system-ui-fase-5-equipamentos-auditoria-visual.md`.
- `npm run format` passou e formatou os documentos alterados.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 6: executar QA visual real de Equipamentos app-v2 em
browser com screenshots mobile 390, desktop 1366 e desktop 1920, incluindo
texto longo, estado vazio e detalhe com anexos, e somente depois decidir se
existe ajuste visual pequeno; sem runtime funcional, storage real, Supabase/RLS,
migrations, PMOC, PDF/share, billing real ou redesign amplo.

---

## Historico - Equipamentos avancados fase 12 reauditoria de paridade

Reauditar a area de Equipamentos apos anexos placeholder locais, atualizar a
porcentagem/estado de paridade UX v1-v2 e decidir documentalmente se o restante
deve ir para design, backlog sensivel ou etapas proprias, sem implementar
storage real, Supabase/RLS, migrations, PMOC, PDF/share, billing real,
assinatura real ou redesign geral.

### Analise resumida

A fase 11 reduziu a lacuna local de fotos/anexos com placeholder mock/local.
Ainda assim, upload/storage real, gates reais, delecao destrutiva, PMOC,
Supabase/RLS e migrations continuam fora do ciclo atual. A fase 12 reaudita o
estado para impedir que a etapa de design herde pendencias sensiveis como se
fossem UX funcional simples.

### Plano

- Revisar evidencias atuais de Equipamentos avancados.
- Atualizar estado de paridade na auditoria v1-v2.
- Separar restante entre design, backlog sensivel e etapa propria.
- Atualizar documentos de acompanhamento.
- Rodar validacao documental.

### Anti-escopo

- Nao implementar runtime, input real de arquivo, camera, upload, storage real,
  Supabase/RLS, migrations, billing real, assinatura real, quotas, pricing,
  PMOC, PDF/share, WhatsApp, router novo, design geral ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-12-reauditoria-paridade.md`.
- `Equipamentos: setores/fotos/delecao` foi atualizado na auditoria para
  refletir setores, arquivamento/desarquivamento e anexos placeholder locais.
- A porcentagem geral estimada permanece **76%** porque a linha continua
  `parcial` pelo metodo de peso e as lacunas restantes sao sensiveis ou exigem
  etapa propria.
- PMOC foi mantido excluido deste ciclo e deve ser refeito em nova etapa
  propria.
- O restante foi separado entre design, backlog sensivel e etapa propria de
  delecao destrutiva.

### Validacao executada

- `npm run format:check` passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 5: auditoria visual documental de Equipamentos app-v2
apos a cobertura mock/local, cobrindo lista, card, detalhe, estados vazios,
anexos locais, mobile/desktop, rolagem e texto longo, sem alterar runtime, sem
storage real, sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share, sem
billing real e sem redesign amplo.

---

## Historico - Equipamentos avancados fase 11 anexos placeholder local

Implementar somente anexos/fotos placeholder mock/local no app-v2 usando o
contrato da fase 10, com no maximo 3 itens, exibicao no detalhe/card e
preservacao em criar/editar/arquivar/desarquivar, sem input real de arquivo, sem
upload, sem storage real, sem billing real, sem assinatura real, sem
Supabase/RLS, sem migrations, sem PMOC, sem PDF/share e sem redesign geral.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-11-anexos-placeholder-local.md`.
- `Equipamento` ganhou `anexos?: EquipmentAttachment[]`.
- `saveEquipmentAttachment` adiciona/edita anexo local com limite de 3 itens.
- A action bloqueia metadados de arquivo, URL, bucket, signed URL e storage.
- Card e detalhe exibem anexos/capa local.
- Shell adiciona placeholder local sem input de arquivo.

### Validacao executada

- `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2ShellEquipmentAttachments.test.tsx --run`
  passou com 33 testes.
- `npm run format` passou.
- `npm run build` passou com warnings Vite conhecidos de chunks/static+dynamic.
- `npm run check` passou com o warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite conhecidos.
- `git diff --check` passou.

---

## Historico - Equipamentos avancados fase 10 contrato fotos e anexos

Decidir contrato local para fotos/anexos de equipamento sem upload/storage real,
separando placeholder/mock local, permissoes, limites e futura persistencia,
ainda sem billing real, sem assinatura real, sem Supabase/RLS, sem migrations,
sem PMOC, sem PDF/share e sem redesign geral.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-10-contrato-fotos-anexos.md`.
- Definido contrato `EquipmentAttachment` local, pequeno e sem storage real.
- Definido limite inicial de ate 3 itens visuais por equipamento no mock.
- Definido que a proxima fase pode implementar apenas placeholder/mock local.
- Definido que upload/storage real, billing/gates reais e Supabase/RLS ficam
  para etapas proprias.

### Validacao executada

- `npm run format:check` passou.
- `git diff --check` passou.

---

## Historico - Equipamentos avancados fase 9 runtime desarquivamento e compromissos

Implementar somente runtime mock/local do contrato da fase 8, cancelando
compromissos `agendado` ao arquivar equipamento, criando `unarchiveEquipment`,
impedindo que arquivados alimentem Home/fila e mantendo historico em
Servicos/Relatorios, ainda sem fotos, sem billing real, sem assinatura real, sem
storage real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-9-runtime-desarquivamento-compromissos.md`.
- `archiveEquipment` cancela localmente compromissos `agendado` do equipamento.
- `unarchiveEquipment` remove `archivedAt` sem reabrir compromissos cancelados.
- Detalhe de equipamento arquivado permite desarquivar localmente.
- Home, alertas, fila e escolha operacional de Servicos ignoram arquivados.
- Inicio direto de servico por equipamento arquivado fica bloqueado.

### Validacao executada

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/domain/homePriority.test.ts src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou pelos comportamentos ausentes.
- RED adicional:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque Servicos
  ainda aceitava/listava equipamento arquivado.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/domain/homePriority.test.ts src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 92 testes.
- Validacao geral:
  `npm run format`, `npm run build` e `npm run check` passaram. Manteve 1
  warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings
  Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Equipamentos avancados fase 10: decidir contrato local para fotos/anexos de
equipamento sem upload/storage real, separando placeholder/mock local,
permissoes, limites e futura persistencia, ainda sem billing real, sem
assinatura real, sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share e sem
redesign geral.

---

## Historico - Equipamentos avancados fase 8 contrato desarquivamento e compromissos

Decidir o contrato local de desarquivamento e tratamento de compromissos de
equipamento arquivado antes de qualquer persistencia real, ainda sem fotos, sem
billing real, sem assinatura real, sem storage real, sem Supabase/RLS, sem
migrations, sem PMOC e sem redesign geral.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-8-contrato-desarquivamento-compromissos.md`.
- Definido que equipamento arquivado deve sair da operacao ativa sem perder
  historico.
- Definido que compromissos `agendado` vinculados a equipamento arquivado devem
  ser preservados como registros, mas deixar de alimentar Home, fila e proxima
  acao.
- Definido que a forma local recomendada e converter esses compromissos
  `agendado` para `cancelado` ao arquivar.
- Definido que desarquivar remove `archivedAt`, mas nao reabre compromissos
  cancelados automaticamente.

### Validacao executada

- `npm run format:check` passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Equipamentos avancados fase 9: implementar somente runtime mock/local do
contrato da fase 8, cancelando compromissos `agendado` ao arquivar equipamento,
criando `unarchiveEquipment`, impedindo que arquivados alimentem Home/fila e
mantendo historico em Servicos/Relatorios, ainda sem fotos, sem billing real,
sem assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem
PMOC e sem redesign geral.

---

## Historico - Equipamentos avancados fase 7 arquivamento equipamento local

Implementar somente arquivamento mock/local de equipamento no app-v2, com
confirmacao, preservando registros, relatorios, orcamentos e compromissos,
ocultando arquivados da lista operacional por padrao e mantendo resolucao de
historico, ainda sem fotos, sem billing real, sem assinatura real, sem storage
real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

### Analise resumida

A fase 6 escolheu arquivamento local como contrato inicial para equipamento. A
fase 7 implementou esse contrato sem copiar a delecao destrutiva do v1:
equipamento permanece no snapshot para historico/relatorios, mas sai da lista
operacional padrao.

### Plano

- Criar teste RED para action pura de arquivamento.
- Criar teste RED para view model ocultar arquivados na lista e manter detalhe.
- Criar teste RED de shell com confirmacao e preservacao de historico.
- Implementar metadado local `archivedAt`.
- Implementar action, view model, detalhe e shell.
- Atualizar documentos de acompanhamento.
- Rodar validacao focada e geral.

### Anti-escopo

- Nao implementar delecao destrutiva, desarquivamento, fotos, upload, storage
  real, Supabase/RLS, migrations, billing real, assinatura real, quotas,
  pricing, PMOC, PDF/share, WhatsApp, router novo, design geral ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-7-arquivamento-equipamento-local.md`.
- `archiveEquipment` marca `archivedAt` sem remover equipamento.
- Registros, relatorios, orcamentos e compromissos permanecem preservados.
- Lista operacional de Equipamentos oculta arquivados por padrao.
- Detalhe mostra estado arquivado e bloqueia inicio de servico pelo CTA
  principal.
- `AppV2Shell` ganhou handler local de arquivamento.

### Validacao executada

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `archiveEquipment`, metadados de arquivamento e botao
  `Arquivar equipamento` ainda nao existiam.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 61 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Equipamentos avancados fase 8: decidir contrato local de desarquivamento e/ou
tratamento de compromissos futuros de equipamento arquivado antes de qualquer
persistencia real, ainda sem fotos, sem billing real, sem assinatura real, sem
storage real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

---

## Historico - Equipamentos avancados fase 6 contrato arquivamento equipamento

Decidir o contrato de arquivamento versus delecao de equipamento no app-v2 antes
de qualquer action ou UI, avaliando impacto em registros, relatorios, orcamentos,
compromissos, filtros e historico, ainda sem fotos, sem billing real, sem
assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC e
sem redesign geral.

### Analise resumida

A fase 5 entregou delecao segura de setor porque ela apenas remove o agrupamento.
Para equipamento, o v1 remove tambem registros vinculados. No app-v2, essa
politica seria arriscada porque equipamento ainda referencia historico,
relatorios, orcamentos, compromissos e filtros locais.

### Plano

- Revisar comportamento de delecao de equipamento no v1.
- Revisar dependencias locais de equipamento no app-v2.
- Decidir contrato recomendado para runtime futuro.
- Registrar anti-escopo e riscos remanescentes.
- Atualizar documentos de acompanhamento.
- Validar documentacao.

### Anti-escopo

- Nao implementar action/UI de arquivamento.
- Nao implementar delecao destrutiva.
- Nao alterar fotos, upload, storage real, Supabase/RLS, migrations, billing,
  assinatura, quotas, pricing, PMOC, PDF/share, WhatsApp, router, CSS legado,
  Tailwind config ou redesign geral.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-6-contrato-arquivamento-equipamento.md`.
- Delecao destrutiva de equipamento foi bloqueada para etapa futura propria.
- Arquivamento local foi escolhido como contrato recomendado para a proxima
  fatia de runtime.
- Registros, relatorios, orcamentos e compromissos devem ser preservados no
  contrato inicial.

### Validacao executada

- Validacao documental:
  `npm run format`, `npm run format:check` e `git diff --check` passaram.

### Proximo checkpoint recomendado

Equipamentos avancados fase 7: implementar somente arquivamento mock/local de
equipamento no app-v2, com confirmacao, preservando registros, relatorios,
orcamentos e compromissos, ocultando arquivados da lista operacional por padrao e
mantendo resolucao de historico, ainda sem fotos, sem billing real, sem
assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC e
sem redesign geral.

---

## Historico - Equipamentos avancados fase 5 delecao setor local

Implementar somente delecao mock/local de setor no app-v2, com confirmacao,
limpando `setorId` dos equipamentos e preservando equipamentos, registros,
relatorios e orcamentos, ainda sem delecao de equipamento, sem fotos, sem
billing real, sem assinatura real, sem storage real, sem Supabase/RLS, sem
migrations, sem PMOC e sem redesign geral.

### Analise resumida

A fase 4 decidiu que delecao de setor poderia ser a primeira fatia mock/local,
desde que preservasse equipamentos e historico. A fase 5 implementou apenas essa
fatia: remover agrupamento de setor com confirmacao e mover equipamentos para
"Sem setor".

### Plano

- Criar teste RED para action pura de delecao de setor.
- Criar teste RED para fluxo de shell com confirmacao.
- Implementar `deleteEquipmentSector`.
- Adicionar confirmacao local em `EquipmentList`.
- Atualizar documentos de acompanhamento.
- Rodar validacao focada e geral.

### Anti-escopo

- Nao implementar delecao/arquivamento de equipamento, fotos, upload, storage
  real, Supabase/RLS, migrations, billing real, assinatura real, quotas,
  pricing, PMOC, PDF/share, WhatsApp, router novo, design geral ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-5-delecao-setor-local.md`.
- `deleteEquipmentSector` remove setor do snapshot local.
- Equipamentos do setor removido permanecem sem `setorId`.
- Registros e orcamentos permanecem preservados.
- `AppV2Shell` ganhou handler local de delecao de setor.
- `EquipmentList` ganhou confirmacao antes de remover setor.

### Validacao executada

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `deleteEquipmentSector` e o botao `Remover setor Recepcao`
  ainda nao existiam.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 48 testes.
- Validacao focada ampliada:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 56 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Equipamentos avancados fase 6: decidir contrato de arquivamento versus delecao
de equipamento no app-v2 antes de qualquer action ou UI, avaliando impacto em
registros, relatorios, orcamentos, compromissos, filtros e historico, ainda sem
fotos, sem billing real, sem assinatura real, sem storage real, sem
Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

---

## Historico - Equipamentos avancados fase 4 delecao contrato local

Revisar delecao de equipamento e setor como contrato documental antes de
qualquer UI, avaliando impactos em registros, relatorios, orcamentos, filtros e
historico local, ainda sem fotos, sem billing real, sem assinatura real, sem
storage real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

### Analise resumida

A fase 3 adicionou criacao/edicao simples de setores mock/local. A fase 4
revisou delecao antes de qualquer action ou UI porque o v1 mistura delecao de
equipamento com remocao de registros, enquanto delecao de setor limpa `setorId`
dos equipamentos e enfileira exclusao remota.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-4-delecao-contrato-local.md`.
- Delecao de equipamento v1 foi classificada como destrutiva sobre equipamento e
  registros vinculados.
- Delecao de setor v1 foi classificada como remocao de agrupamento com limpeza
  de `setorId` dos equipamentos.
- Foi decidido que setor pode ser a primeira delecao mock/local futura.
- Foi decidido que delecao de equipamento exige etapa propria e nao deve copiar
  automaticamente a politica destrutiva do v1.

### Validacao executada

- `npm run format` executado.
- `npm run format:check` passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Equipamentos avancados fase 5: implementar somente delecao mock/local de setor
no app-v2, com confirmacao, limpando `setorId` dos equipamentos e preservando
equipamentos, registros, relatorios e orcamentos, ainda sem delecao de
equipamento, sem fotos, sem billing real, sem assinatura real, sem storage real,
sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

---

## Historico - Equipamentos avancados fase 3 setores mock/local CRUD simples

Ampliar setores mock/local com criacao e edicao simples de setor no app-v2, sem
delecao, sem fotos, sem billing real, sem assinatura real, sem storage real, sem
Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

### Analise resumida

A fase 2 criou o contrato local de setor e permitiu vincular equipamentos a
setores mockados. A fase 3 adicionou somente o gerenciamento local minimo de
setor: criar, editar nome/cliente/cor/responsavel e refletir isso na lista e nos
filtros ja existentes.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-3-setores-crud-local.md`.
- `saveEquipmentSector` cria e edita setores no snapshot mockado.
- `AppV2Shell` ganhou handler local para salvar setores.
- `EquipmentList` ganhou painel minimo para criar/editar setor.
- Filtros e exibicao de setor ja existentes passam a refletir setores criados
  ou editados localmente.

### Validacao executada

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `saveEquipmentSector` e o botao `Novo setor` ainda nao
  existiam.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 45 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Equipamentos avancados fase 4: revisar delecao de equipamento e setor como
contrato documental antes de qualquer UI, avaliando impactos em registros,
relatorios, orcamentos, filtros e historico local, ainda sem fotos, sem billing
real, sem assinatura real, sem storage real, sem Supabase/RLS, sem migrations,
sem PMOC e sem redesign geral.

---

## Historico - Equipamentos avancados fase 2 setores mock/local

Implementar setores mock/local basicos no app-v2, sem fotos, sem delecao, sem
billing real, sem assinatura real, sem storage real, sem Supabase/RLS, sem
migrations, sem PMOC e sem redesign geral.

### Analise resumida

A fase 1 separou setores como fatia segura e manteve fotos/delecao em etapas
proprias. A fase 2 implementou apenas o contrato local de setor: `setores` no
snapshot, `setorId` no equipamento, exibicao no detalhe/lista, escolha no
formulario e filtro local.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-2-setores-mock-local.md`.
- `SetorEquipamento` foi adicionado ao contrato do app-v2.
- Snapshot mockado ganhou `setores`.
- `Equipamento` ganhou `setorId?: string`.
- Formulario, lista e detalhe de Equipamentos passaram a usar setor mock/local.
- Filtro local por setor foi adicionado na lista de Equipamentos.

### Validacao executada

- RED:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `setorId`, `sectorLabel`, filtro e select de setor ainda nao
  existiam.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 49 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Equipamentos avancados fase 3: ampliar setores mock/local com criacao/edicao
simples de setor no app-v2, ainda sem delecao, sem fotos, sem billing real, sem
assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC e
sem redesign geral.

---

## Historico - Equipamentos avancados fase 1 contrato local

Mapear setores, fotos e delecao do v1 contra o app-v2 antes de qualquer UI ou
mudanca de runtime.

### Analise resumida

O v1 mistura setores, fotos, plano/billing, upload/storage e delecao dentro da
area de Equipamentos. No app-v2, o contrato atual de equipamento cobre apenas
campos operacionais basicos. Para nao repetir o acoplamento do v1, a fase 1
separou setores como possivel fatia mock/local e manteve fotos/delecao para
etapas proprias.

### Plano

- Mapear setores, fotos e delecao no v1.
- Mapear o contrato atual de Equipamentos no app-v2.
- Definir o que pode ser fase mock/local e o que fica bloqueado por risco.
- Atualizar matriz/auditoria e documentos de acompanhamento.
- Validar documentacao.

### Anti-escopo

- Nao alterar runtime, UI, tipos, store, storage, Supabase/RLS, migrations,
  PMOC, billing, assinatura, PDF/share, WhatsApp, security hardening, React
  Doctor ou CSS.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/equipamentos-avancados-fase-1-contrato-local.md`.
- Setores foram definidos como proxima fatia possivel somente em mock/local.
- Fotos foram separadas para etapa propria por upload/storage, plano e fallback.
- Delecao foi separada para etapa propria por risco sobre registros, historico,
  relatorios e orcamentos.
- Nenhum arquivo de runtime foi alterado nesta fase documental.

### Validacao documental executada

- `npm run format` executado.
- `npm run build` passou com warnings Vite/chunk conhecidos.
- `npm run check` passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Equipamentos avancados fase 2: implementar setores mock/local basicos no
app-v2, sem fotos, sem delecao, sem billing real, sem assinatura real, sem
storage real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

---

## Historico - Design System/UI fase 4 fechamento Home Hoje

Revisar Home Hoje apos a correcao visual, confirmar se ainda ha problema
concreto e encerrar o ciclo visual da Home quando a evidencia nao indicar nova
intervencao.

### Analise resumida

O QA visual pos-correcao cobriu mobile 390px, desktop 1366px e desktop 1920px,
incluindo cenario de texto longo. A Home permaneceu sem overflow horizontal, a
navegacao respeitou os breakpoints e os alertas ativos ficaram sem borda nativa
preta. A revisao identificou um segundo risco visual pequeno: o divisor da lista
de alertas ainda precisava de cor explicita para nao herdar preto padrao.

### Plano

- Registrar evidencia visual pos-correcao.
- Criar teste RED para impedir retorno do divisor escuro.
- Aplicar correcao minima no divisor de `Alertas ativos`.
- Atualizar documentos de acompanhamento.
- Rodar testes e validacao geral.

### Anti-escopo

- Nao alterar CSS, Tailwind, tokens, componentes, primitives, layout runtime,
  storage, Supabase/RLS, PMOC, PDF/share, WhatsApp, billing, assinatura,
  migrations, security hardening, React Doctor ou imports.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/design-system-ui-fase-4-fechamento-home-hoje.md`.
- Evidencias visuais foram salvas em
  `docs/rewrite/qa-design-system-ui-fase-4-home-hoje/`.
- A lista de alertas recebeu `tw-divide-[#E5EAF0]` para estabilizar a cor do
  divisor.
- O ciclo visual da Home Hoje foi encerrado sem novo redesign.
- Nao houve mudanca de fluxo, dados, shell, tokens, storage ou integracoes
  sensiveis.

### Validacao executada

- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque os
  divisores de alerta ainda nao tinham cor explicita.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 33
  testes.
- QA visual reexecutado em mobile 390px, desktop 1366px e desktop 1920px:
  sem overflow horizontal, nav correta por breakpoint e zero botoes com risco
  de borda nativa; divisor de alertas com cor explicita.
- Validacao focada ampliada:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/home/homeViewModel.test.ts --run`
  passou com 35 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Equipamentos avancados fase 1 documental: decidir contrato mock/local para
setores, fotos e delecao antes de qualquer UI, sem upload/storage real,
Supabase/RLS, migrations, PMOC, billing, assinatura, PDF/share, WhatsApp real ou
design geral.

---

## Historico - Design System/UI fase 3 QA visual Home Hoje

Executar QA visual inicial da Home Hoje em browser e aplicar apenas refinamento
pequeno com evidencia concreta.

### Analise resumida

O QA visual cobriu mobile 390px, desktop 1366px e desktop 1920px. A Home nao
apresentou overflow horizontal e respeitou os breakpoints de navegacao. O unico
problema concreto foi uma borda nativa preta nos botoes de `Alertas ativos` da
coluna auxiliar desktop.

### Plano

- Registrar evidencia visual e metricas.
- Criar teste RED para impedir retorno da borda nativa.
- Aplicar correcao minima em `HomeToday`.
- Atualizar documentos de acompanhamento.
- Rodar testes e validacao geral.

### Anti-escopo

- Nao alterar CSS, Tailwind, tokens, componentes, primitives, layout runtime,
  storage, Supabase/RLS, PMOC, PDF/share, WhatsApp, billing, assinatura,
  migrations, security hardening, React Doctor ou imports.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/design-system-ui-fase-3-qa-visual-home-hoje.md`.
- Evidencias visuais foram salvas em
  `docs/rewrite/qa-design-system-ui-fase-3-home-hoje/`.
- Botoes de alerta da Home receberam `tw-border-0` para remover borda nativa.
- Nao houve mudanca de fluxo, dados, shell, tokens, storage ou integracoes.

### Validacao executada

- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque os
  botoes de alerta ainda nao tinham `tw-border-0`.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 33
  testes.
- QA visual reexecutado em mobile 390px, desktop 1366px e desktop 1920px:
  sem overflow horizontal, nav correta por breakpoint e zero botoes com risco
  de borda nativa.
- Validacao focada ampliada:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/home/homeViewModel.test.ts --run`
  passou com 35 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

---

## Historico - Design System/UI fase 2 Home Hoje checklist

Escolher uma unica area candidata para refinamento visual controlado e criar
plano/checklist antes de alterar qualquer CSS, token ou componente.

### Analise resumida

Home Hoje foi escolhida porque ja era a recomendacao da regra de UI, concentra a
proxima acao do tecnico e permite validar hierarquia/densidade sem abrir areas
sensiveis ou redesenhar o shell inteiro.

### Plano

- Criar checklist documental da Design System/UI fase 2.
- Registrar arquivos candidatos para uma etapa visual futura.
- Declarar estados obrigatorios de validacao antes de qualquer codigo.
- Atualizar documentos de acompanhamento.
- Validar somente documentacao.

### Anti-escopo

- Nao alterar CSS, Tailwind, tokens, componentes, primitives, layout runtime,
  storage, Supabase/RLS, PMOC, PDF/share, WhatsApp, billing, assinatura,
  migrations, security hardening, React Doctor ou imports.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/design-system-ui-fase-2-home-hoje-checklist.md`.
- Home Hoje foi escolhida como primeira area candidata.
- Checklist futuro exige mobile 390px, desktop 1366px, desktop largo 1920px,
  texto longo, estado sem alertas, muitos itens e foco de teclado.
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md` passou a apontar
  para QA visual inicial de Home Hoje como proximo passo.
- Nenhum arquivo de runtime foi alterado.

### Validacao documental executada

- `npx prettier --write docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md docs/rewrite/design-system-ui-fase-2-home-hoje-checklist.md`
  executado.
- `npm run format:check -- docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md docs/rewrite/design-system-ui-fase-2-home-hoje-checklist.md`
  passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 3: executar QA visual inicial da Home Hoje em browser e,
somente com evidencia de problema concreto, aplicar um refinamento pequeno em
Home Hoje com testes e validacao visual.

---

## Historico - Design System/UI fase 1 documental

Criar regras documentais de Design System/UI do app-v2 em `docs/rewrite/` antes
de qualquer refinamento visual amplo, sem alterar CSS, componentes, primitives,
storage, Supabase/RLS, PMOC, PDF/share, WhatsApp, billing, assinatura ou
migrations.

### Analise resumida

`docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md` ja existia como regra
inicial de UI. A fase 1 consolida esse documento como fonte normativa, cria um
contrato de checkpoint visual e evita abrir runtime visual sem checklist.

### Plano

- Criar contrato documental da Design System/UI fase 1.
- Atualizar `etapa-10-regras-design-system-ui-app-v2.md` com regra de
  checkpoint visual.
- Atualizar matriz/auditoria com o status documental de design.
- Validar somente documentacao.

### Anti-escopo

- Nao alterar CSS, Tailwind, tokens, componentes, primitives, layout runtime,
  storage, Supabase/RLS, PMOC, PDF/share, WhatsApp, billing, assinatura,
  migrations, security hardening, React Doctor ou imports.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`.
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md` passou a declarar
  a fase 1 como fonte normativa inicial.
- Checkpoints visuais futuros agora devem declarar area unica, componentes,
  tokens/classes esperados, estados de validacao e escopo proibido antes de
  editar codigo.
- Nenhum arquivo de runtime foi alterado.

### Validacao documental executada

- `npx prettier --write docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`
  executado.
- `npm run format:check -- docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`
  passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 2: escolher uma unica area candidata para refinamento
visual controlado, preferencialmente Home Hoje, e criar plano/checklist antes de
alterar qualquer CSS, token ou componente.

---

## Historico - Configuracoes/Conta fase 6 encerramento documental

Consolidar encerramento documental do ciclo local de `Conta` e recalcular
impacto na matriz/auditoria funcional v1-v2 sem iniciar persistencia, billing,
assinatura, perfil real, Supabase/RLS, PMOC, PDF/share, WhatsApp real ou
migrations.

### Analise resumida

As fases 1 a 5 tiraram `Conta` de placeholder e entregaram cobertura mock/local:
contrato, UI minima, preferencias visiveis, microcopy, estados locais,
acessibilidade e resiliencia de texto. A fase 6 nao altera runtime; apenas fecha
o ciclo local e atualiza o impacto documental.

### Plano

- Criar documento de encerramento da fase 6.
- Atualizar matriz de paridade para `Conta` deixar de ser placeholder.
- Atualizar auditoria funcional com o novo percentual estimado.
- Preservar todos os limites sensiveis e rodar validacao documental.

### Anti-escopo

- Nao criar billing, assinatura, perfil real, storage real, localStorage,
  Supabase/RLS, migrations, PMOC, PDF/share real, WhatsApp real, suporte
  externo, feedback real, router novo, tokens globais novos, design final ou
  CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`.
- `Configuracoes/Conta` foi reclassificada de placeholder para cobertura
  mock/local no criterio funcional.
- Auditoria funcional recalculou a cobertura geral estimada de 74% para 76%.
- Registro de Servico permanece em 97%, pois esta fase nao altera esse fluxo.
- Preferencias continuam somente em memoria.

### Validacao documental executada

- `npx prettier --write docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`
  executado.
- `npm run format:check -- docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`
  passou.
- `git diff --check` passou.

### Proximo checkpoint recomendado

Design System/UI fase 1 documental: criar regras de design do app-v2 em
`docs/rewrite/` antes de qualquer refinamento visual amplo, sem alterar CSS,
componentes, primitives, storage, Supabase/RLS, PMOC, PDF/share, WhatsApp,
billing, assinatura ou migrations.

---

## Historico - Configuracoes/Conta fase 5 acessibilidade e responsividade local

Revisar acessibilidade e responsividade local da aba `Conta` com checagem de
textos longos, foco e layout mobile/desktop, ainda sem design final amplo,
persistencia, billing, assinatura, perfil real, Supabase/RLS, PMOC, PDF/share,
WhatsApp real ou migrations.

### Analise resumida

A fase 4 consolidou microcopy e estados locais. A fase 5 fecha ajustes locais de
acessibilidade e resiliencia visual sem mexer em primitives globais: descricoes
associadas aos selects, estado pressionado no lembrete, IDs unicos e quebra
segura de texto em cards.

### Plano

- Criar teste RED para atributos de acessibilidade e resiliencia de texto.
- Ajustar apenas `AccountHome` com `aria-describedby`, `aria-pressed`, labels e
  classes locais.
- Preservar comportamento em memoria das fases anteriores.
- Atualizar matriz/auditoria e rodar validacao focada/geral.

### Anti-escopo

- Nao criar billing, assinatura, perfil real, storage real, localStorage,
  Supabase/RLS, migrations, PMOC, PDF/share real, WhatsApp real, suporte
  externo, feedback real, router novo, tokens globais novos, design final ou
  CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/configuracoes-conta-fase-5-a11y-responsividade-local.md`.
- Selects de preferencias passaram a usar `aria-describedby`.
- Botao de lembrete visual passou a expor `aria-pressed`.
- Atalhos locais receberam atributo testavel e quebra segura de texto.
- Textos locais da aba receberam quebra segura para reduzir risco de overflow.
- Preferencias seguem somente em memoria.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` falhou porque
  os atributos de acessibilidade ainda nao existiam.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` passou com 5
  testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao focada ampliada:
  `npm test -- src/app-v2/account/accountViewModel.test.ts src/app-v2/shell/AppV2ShellAccount.test.tsx src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run`
  passou com 43 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Configurações/Conta fase 6: consolidar encerramento documental do ciclo local de
Conta e recalcular impacto na matriz/auditoria funcional v1-v2 sem iniciar
persistencia, billing, assinatura, perfil real, Supabase/RLS, PMOC, PDF/share,
WhatsApp real ou migrations.

---

## Historico - Configuracoes/Conta fase 4 microcopy e estados locais

Consolidar microcopy e estados vazios locais da aba `Conta` dentro das regras de
UI do app-v2, ainda sem design final amplo, persistencia, billing, assinatura,
perfil real, Supabase/RLS, PMOC, PDF/share, WhatsApp real ou migrations.

### Analise resumida

A fase 3 aplicou preferencias locais em comportamento visivel, mas a aba ainda
exibia linguagem de mock e nao tinha um estado vazio local claro. A fase 4
mantem o mesmo comportamento em memoria e melhora apenas a comunicacao
operacional da tela.

### Plano

- Expandir `accountViewModel` com microcopy local de estado vazio e limite
  local.
- Renderizar estado vazio e limite local em `AccountHome`.
- Remover linguagem de mock da UI visivel.
- Testar view model e shell com RED/GREEN.
- Atualizar matriz/auditoria e rodar validacao focada/geral.

### Anti-escopo

- Nao criar billing, assinatura, perfil real, storage real, localStorage,
  Supabase/RLS, migrations, PMOC, PDF/share real, WhatsApp real, suporte
  externo, feedback real, router novo, tokens globais novos, design final ou
  CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/configuracoes-conta-fase-4-microcopy-estados-locais.md`.
- `accountViewModel` passou a expor estado vazio e limite local generico.
- `AccountHome` passou a renderizar os blocos locais sem iniciar integracao
  real.
- Microcopy visivel removeu linguagem de mock da aba `Conta`.
- Preferencias seguem somente em memoria.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` falhou porque
  a microcopy local e os blocos de estado ainda nao existiam.
- RED:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` falhou porque
  a UI ainda exibia a microcopy antiga e nao renderizava estado vazio/limite
  local.
- GREEN:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` passou com 2
  testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` passou com 4
  testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Configurações/Conta fase 5: revisar acessibilidade e responsividade local da
aba `Conta` com checagem de textos longos, foco e layout mobile/desktop, ainda
sem design final amplo, persistencia, billing, assinatura, perfil real,
Supabase/RLS, PMOC, PDF/share, WhatsApp real ou migrations.

---

## Historico - Configuracoes/Conta fase 3 preferencias visiveis

Aplicar preferencias locais em comportamento visivel limitado, ainda somente em
memoria e sem billing, assinatura, perfil real, storage real, Supabase/RLS,
PMOC, PDF/share, WhatsApp real ou migrations.

### Analise resumida

A fase 2 entregou a UI local da aba `Conta`, mas as preferencias ainda eram
basicamente rotulos. A fase 3 aplica efeitos visiveis pequenos e reversiveis:
densidade local na propria aba, lembrete visual local e acao explicita para
abrir a tela inicial escolhida.

### Plano

- Expandir `accountViewModel` com efeitos visiveis derivados das preferencias.
- Aplicar densidade e lembrete somente em `AccountHome`.
- Conectar a acao de tela inicial escolhida no shell sem criar router novo.
- Testar view model e shell com RED/GREEN.
- Atualizar matriz/auditoria e rodar validacao focada/geral.

### Anti-escopo

- Nao criar billing, assinatura, perfil real, storage real, localStorage,
  Supabase/RLS, migrations, PMOC, PDF/share real, WhatsApp real, suporte
  externo, feedback real, router novo, design final ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/configuracoes-conta-fase-3-preferencias-visiveis.md`.
- `accountViewModel` passou a expor classe de densidade, rotulo de acao de tela
  inicial e banner de lembrete local.
- `AccountHome` passou a aplicar densidade local, mostrar lembrete visual e
  oferecer botao para abrir a tela inicial escolhida.
- `AppV2Shell` passou a abrir `Hoje`, `Equipamentos` ou `Servicos > Registros`
  pela preferencia local.
- Preferencias seguem somente em memoria.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` falhou porque
  os efeitos visiveis ainda nao existiam.
- RED:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` falhou porque
  a UI ainda nao aplicava densidade/banner/atalho de tela inicial.
- GREEN:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` passou com 2
  testes.
- GREEN parcial:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` passou apos
  ajustar a assercao para o texto real de `Servicos`.
- Validacao focada:
  `npm test -- src/app-v2/account/accountViewModel.test.ts src/app-v2/shell/AppV2ShellAccount.test.tsx --run`
  passou com 6 testes.
- Validacao focada ampliada:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run`
  passou com 36 testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao geral:
  `npm run format`, `npm run build` e `npm run check` passaram. Manteve 1
  warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings
  Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Configurações/Conta fase 4: consolidar microcopy e estados vazios locais da aba
`Conta` dentro das regras de UI do app-v2, ainda sem design final amplo,
persistencia, billing, assinatura, perfil real, Supabase/RLS, PMOC, PDF/share,
WhatsApp real ou migrations.

---

## Historico - Configuracoes/Conta fase 2 UI local

Implementar view model e UI minima dos atalhos e preferencias mock/local
definidos na fase 1, ainda sem billing, assinatura, perfil real, storage real,
Supabase/RLS, PMOC, PDF/share, WhatsApp real ou migrations.

### Analise resumida

A fase 1 definiu `Conta` como painel local de atalhos e preferencias sem areas
sensiveis. A fase 2 remove o placeholder e entrega uma UI operacional minima,
reusando apenas fluxos app-v2 ja existentes e mantendo preferencias em estado
React de sessao.

### Plano

- Criar `accountViewModel` com atalhos, preferencias e ajuda local.
- Criar `AccountHome` para renderizar a aba `Conta`.
- Conectar atalhos locais no shell sem criar rota nova.
- Testar view model e shell com RED/GREEN.
- Atualizar matriz/auditoria e rodar validacao focada/geral.

### Anti-escopo

- Nao criar billing, assinatura, perfil real, storage real, Supabase/RLS,
  migrations, PMOC, PDF/share real, WhatsApp real, suporte externo, feedback
  real, router novo, design final ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/configuracoes-conta-fase-2-ui-local.md`.
- `accountViewModel` mapeia atalhos, preferencias e ajuda local.
- `AccountHome` substitui o placeholder de `Conta`.
- Atalhos locais abrem registro, `Equipamentos > Clientes`, `Servicos >
Orcamentos` e Home/alertas.
- Preferencias de densidade, tela inicial e lembrete visual ficam somente em
  memoria.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` falhou porque
  `accountViewModel` ainda nao existia.
- RED:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` falhou porque
  `Conta` ainda era placeholder.
- GREEN:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` passou com 1
  teste.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` passou com 3
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/account/accountViewModel.test.ts src/app-v2/shell/AppV2ShellAccount.test.tsx src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run`
  passou com 40 testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao geral:
  `npm run check` passou. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Configurações/Conta fase 3: aplicar preferencias locais em comportamento
visivel limitado, ainda somente em memoria e sem billing, assinatura, perfil
real, storage real, Supabase/RLS, PMOC, PDF/share, WhatsApp real ou migrations.

---

## Historico - Configuracoes/Conta fase 1 contrato local

Mapear preferencias operacionais simples e atalhos locais para a aba `Conta`
antes de implementar UI, mantendo escopo documental/mock-local e sem billing,
assinatura, storage real, Supabase/RLS, PMOC, PDF/share ou migrations.

### Analise resumida

O v1 tinha `Configuracoes` como painel de atalhos para registro, orcamentos,
PMOC, clientes, alertas, perfil e ajuda. No app-v2, `Conta` ainda e
placeholder. A fase segura e mapear um contrato local que preserve atalhos uteis
sem reabrir PMOC, perfil real, billing, storage, Supabase/RLS ou integracoes.

### Plano

- Registrar contrato documental em
  `docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`.
- Separar atalhos permitidos, preferencias mock/local e ajuda local.
- Marcar PMOC, perfil real, billing, storage, Supabase/RLS e suporte real como
  fora de escopo.
- Atualizar matriz/auditoria e validar documentacao.

### Anti-escopo

- Nao implementar UI, action, view model, billing, assinatura, perfil real,
  storage real, Supabase/RLS, migrations, PMOC, PDF/share real, WhatsApp real,
  suporte externo, feedback real, router novo, design final ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`.
- Mapeados atalhos locais permitidos: registro, `Equipamentos > Clientes`,
  `Servicos > Orcamentos` e Home/alertas.
- Mapeadas preferencias apenas em memoria: densidade visual, tela inicial e
  lembrete visual local.
- PMOC foi explicitamente excluido desta fase e mantido para etapa propria.
- Nenhum codigo de UI/runtime foi alterado neste checkpoint.

### Validacao executada

- `npx prettier --write docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`
  executado.
- `git diff --check` passou.
- `npm run format:check -- docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`
  passou.

### Proximo checkpoint recomendado

Configuracoes/Conta fase 2: implementar view model e UI minima dos atalhos e
preferencias mock/local definidos na fase 1, ainda sem billing, assinatura,
perfil real, storage real, Supabase/RLS, PMOC, PDF/share, WhatsApp real ou
migrations.

---

## Historico - Orcamentos fase 3 itens locais simples

Reduzir a lacuna de itens de orcamento permitindo adicionar itens locais simples
ao rascunho mockado em `Servicos > Orcamentos`, mantendo escopo local/mock e
sem billing, assinatura, PDF/share real, WhatsApp real, storage real,
Supabase/RLS, PMOC ou migrations.

### Analise resumida

O app-v2 ja permitia criar orcamento mockado e editar titulo, total e status do
rascunho. A lacuna seguinte era representar itens simples sem abrir orcamento
real, regras comerciais, cobranca, envio, PDF/share, storage ou integracoes.

### Plano

- Registrar contrato documental em
  `docs/rewrite/orcamentos-fase-3-itens-locais-app-v2.md`.
- Ampliar o contrato mockado de `Orcamento` com itens locais simples.
- Recalcular total local pela soma dos itens quando houver itens.
- Expor resumo de itens no view model de orcamentos.
- Conectar adicao de item local no formulario de edicao de rascunho.
- Atualizar matriz/auditoria e rodar validacao focada/geral.

### Anti-escopo

- Nao criar billing, assinatura, PDF/share real, WhatsApp real, storage real,
  Supabase/RLS, migrations, PMOC, desconto, imposto, validade, condicoes
  comerciais, envio, download, cobranca, router novo, design final ou CSS
  legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/orcamentos-fase-3-itens-locais-app-v2.md`.
- `Orcamento` passou a aceitar `itens` locais simples no contrato mockado.
- `updateQuoteDraft` normaliza itens e recalcula total pela soma dos itens.
- `servicesQuotesViewModel` passou a expor `itemsLabel` e itens formatados.
- `Servicos > Orcamentos` ganhou campos simples para adicionar item local no
  rascunho.
- Os testes de shell de Orcamentos foram separados em
  `src/app-v2/shell/AppV2ShellQuotes.test.tsx` para manter
  `AppV2Shell.test.tsx` abaixo de 1000 linhas.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `updateQuoteDraft` ainda ignorava `items` e nao recalculava o total.
- RED:
  `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts --run`
  falhou porque o view model ainda nao expunha `itemsLabel`.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  dos inputs de item local.
- GREEN:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 23 testes.
- GREEN:
  `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts --run`
  passou com 2 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 36
  testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run`
  passou com 71 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Configuracoes/Conta fase 1: mapear preferencias operacionais simples e
documentar contrato mock/local antes de implementar a UI, ainda sem billing,
assinatura, storage real, Supabase/RLS, PMOC, PDF/share ou migrations.

---

## Historico - Orcamentos fase 2 edicao local basica

Reduzir a lacuna de edicao de orcamentos permitindo editar localmente um
rascunho mockado em `Servicos > Orcamentos`, mantendo escopo local/mock e sem
billing, assinatura, PDF/share real, WhatsApp real, storage real, Supabase/RLS,
PMOC ou migrations.

### Analise resumida

O app-v2 ja criava orcamento mockado a partir do fechamento de servico e listava
o pipeline local. A lacuna seguinte era permitir ajuste basico do rascunho sem
criar orcamento real, envio, cobranca, storage ou integracao externa.

### Plano

- Registrar contrato documental em
  `docs/rewrite/orcamentos-fase-2-edicao-local-app-v2.md`.
- Criar action pura para atualizar rascunho de orcamento local.
- Conectar formulario minimo em `Servicos > Orcamentos`.
- Restringir a edicao a rascunhos mockados.
- Atualizar matriz/auditoria e rodar validacao focada/geral.

### Anti-escopo

- Nao criar billing, assinatura, PDF/share real, WhatsApp real, storage real,
  Supabase/RLS, migrations, PMOC, itens detalhados, envio, download, cobranca,
  router novo, design final ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/orcamentos-fase-2-edicao-local-app-v2.md`.
- `updateQuoteDraft` atualiza titulo, total e status de rascunho local.
- A edicao rejeita orcamento inexistente, titulo vazio e status inicial
  diferente de `rascunho`.
- `Servicos > Orcamentos` ganhou formulario minimo para editar rascunho.
- A lista local reflete os valores editados apos salvar.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `updateQuoteDraft` ainda nao existia.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  do botao `Editar orcamento`.
- GREEN:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 22 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 35
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 69 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Orcamentos fase 3: itens locais simples do rascunho mockado, ainda sem billing,
assinatura, PDF/share real, WhatsApp real, storage real, Supabase/RLS, PMOC ou
migrations.

---

## Historico - Orcamentos mock/action pos-fechamento

Reduzir a lacuna de saidas pos-salvamento criando orcamento mockado a partir do
fechamento de servico, mantendo escopo local/mock e sem billing, assinatura,
PDF/share real, WhatsApp real, storage real, Supabase/RLS, PMOC ou migrations.

### Analise resumida

O app-v2 ja preservava custos opcionais no Registro de Servico e ja tinha
`Servicos > Orcamentos` como pipeline local. A lacuna era transformar a sugestao
pos-fechamento em uma acao mockada, sem virar orcamento real ou integracao
comercial.

### Plano

- Registrar contrato documental em
  `docs/rewrite/orcamentos-mock-action-pos-fechamento-app-v2.md`.
- Criar action pura para gerar orcamento mockado a partir de registro concluido.
- Conectar CTA no estado `Servico concluido`.
- Abrir `Servicos > Orcamentos` com o novo item local.
- Atualizar matriz/auditoria e rodar validacao focada/geral.

### Anti-escopo

- Nao criar billing, assinatura, PDF/share real, WhatsApp real, storage real,
  Supabase/RLS, migrations, PMOC, envio, download, cobranca, router novo,
  design final ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/orcamentos-mock-action-pos-fechamento-app-v2.md`.
- `createQuoteFromServiceRecord` cria orcamento local `rascunho` vinculado ao
  registro/equipamento/cliente.
- O total inicial soma custos locais de pecas e mao de obra.
- O estado `Servico concluido` ganhou CTA `Criar orcamento mockado`.
- O CTA conclui o servico, cria o orcamento local e abre `Servicos >
Orcamentos`.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `createQuoteFromServiceRecord` ainda nao existia.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  do botao `Criar orcamento mockado`.
- GREEN:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 21 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 34
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 67 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Orcamentos fase 2: edicao local basica do rascunho mockado, ainda sem billing,
assinatura, PDF/share real, WhatsApp real, storage real, Supabase/RLS, PMOC ou
migrations.

---

## Checkpoint atual - Relatorios consolidados locais

Reduzir a lacuna de relatorios consolidados em `Servicos > Relatorios` com
filtros e resumo mock/local por periodo, cliente e equipamento, sem PDF/share
real, storage real, Supabase/RLS, migrations, PMOC, WhatsApp real, billing ou
design final.

### Analise resumida

O app-v2 ja reabria relatorio por registro e tinha busca/KPIs locais. A lacuna
seguinte era consulta consolidada por recorte operacional, sem gerar documento
regulatorio, PDF real ou integracao externa.

### Plano

- Registrar contrato documental em
  `docs/rewrite/relatorios-consolidados-locais-app-v2.md`.
- Evoluir `servicesReportsViewModel` com filtros locais e resumo consolidado.
- Conectar controles simples em `ServiceReportsHome`.
- Atualizar matriz/auditoria e rodar validacao focada/geral.

### Anti-escopo

- Nao criar exportacao PDF/share real, WhatsApp real, storage real,
  Supabase/RLS, migrations, PMOC, billing, assinatura, quotas, router novo,
  design final ou CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/relatorios-consolidados-locais-app-v2.md`.
- `Servicos > Relatorios` ganhou filtros locais por periodo, cliente e
  equipamento.
- A busca textual existente foi preservada e combinada com filtros.
- O resumo consolidado local exibe relatorios, prontos, atencao, pendentes,
  pecas e mao de obra do recorte filtrado.
- Preview e impressao local por registro permanecem inalterados.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/service/servicesReportsViewModel.test.ts --run`
  falhou porque o view model ainda tratava filtros como string de busca.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  dos selects de filtro em Relatorios.
- GREEN:
  `npm test -- src/app-v2/service/servicesReportsViewModel.test.ts --run`
  passou com 8 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 33
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 41 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Orcamentos mock/action a partir do fechamento de servico, ainda local e sem
billing, assinatura, PDF/share real, WhatsApp real, storage real ou Supabase.

---

## Checkpoint atual - Servicos Registros: filtros locais

Reduzir a lacuna de historico avancado em `Servicos > Registros` com filtros
mock/local por periodo, cliente, equipamento, tipo e status, preservando a busca
existente e sem abrir integracoes sensiveis.

### Analise resumida

Clientes fase 5 reduziu a lacuna de consulta por base instalada. A proxima
lacuna funcional segura era o historico de servicos: o app-v2 ja tinha lista e
busca local, mas ainda nao tinha filtros dedicados equivalentes ao uso
operacional do v1.

### Plano

- 5A: registrar contrato documental em
  `docs/rewrite/servicos-registros-filtros-app-v2.md`.
- 5B: evoluir `servicesHomeViewModel` com filtros locais por periodo, cliente,
  equipamento, tipo e status usando TDD.
- 5C: conectar controles simples em `ServicesHome`, sem design final.
- 5D: atualizar docs de paridade e rodar validacao focada/geral.

### Anti-escopo

- Nao criar rota nova, storage real, Supabase/RLS, migrations, PMOC, PDF/share
  real, WhatsApp real, billing, assinatura, quotas, router novo, design final ou
  CSS legado.

### Resultado deste checkpoint

- Criado contrato documental em
  `docs/rewrite/servicos-registros-filtros-app-v2.md`.
- `Servicos > Registros` ganhou filtros locais por periodo, cliente,
  equipamento, tipo e status.
- A busca textual existente foi preservada e combinada com os filtros.
- O view model passou a expor filtros normalizados e opcoes de filtro a partir
  do snapshot mockado.
- O fluxo continua local/mockado e nao toca PMOC, Supabase, migrations,
  storage real, PDF/share, WhatsApp real ou billing.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts --run` falhou
  por ausencia do contrato de filtros.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  dos selects de filtro.
- GREEN:
  `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts --run` passou
  com 10 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 32
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 42 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Relatorios locais consolidados por periodo/equipamento/cliente, ainda
mock/local, sem PDF/share real, storage real, Supabase/RLS, PMOC ou WhatsApp
real.

---

## Checkpoint atual - Clientes fase 5: consulta e relatorio local

Completar consulta operacional por Cliente dentro de `Equipamentos > Clientes`,
com busca, filtros locais e resumo local consolidado, sem PMOC, storage real,
Supabase/RLS, migrations, PDF/share, WhatsApp real, billing ou design final.

### Analise resumida

Clientes fase 4 reduziu a friccao entre criar Cliente e criar Equipamento. A
lacuna seguinte era evitar repetir a lista generica do v1: a fase 5 transforma
Clientes em uma consulta operacional de base instalada, mantendo Cliente como
subvisao forte dentro de Equipamentos.

### Plano

- 5A: registrar contrato documental em
  `docs/rewrite/clientes-fase-5-consulta-relatorio-local.md`.
- 5B: evoluir `equipmentClientsViewModel` com busca, filtros e resumo local por
  Cliente usando TDD.
- 5C: conectar UI minima em `ClientList` e `ClientDetail`, sem design final.
- 5D: atualizar docs de paridade e rodar validacao focada/geral.

### Anti-escopo

- Nao criar aba global de Clientes, router novo, storage real, Supabase/RLS,
  migrations, PMOC, PDF/share, WhatsApp real, billing, upload, design final ou
  CSS legado.

### Resultado deste checkpoint

- Criado contrato documental da fase 5 em `docs/rewrite`.
- `Equipamentos > Clientes` ganhou busca por cliente, documento, contato,
  endereco, equipamento vinculado e texto de servico relacionado.
- A lista de Clientes ganhou filtros locais: todos, com pendencia, criticos e
  sem primeiro servico.
- O detalhe de Cliente ganhou `Resumo local do cliente` com equipamentos,
  servicos, pendencias e ultimo servico.
- O fluxo permanece mock/local e nao abre PMOC, Supabase, migrations, PDF/share
  ou WhatsApp real.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts --run`
  falhou por ausencia de `query`, filtros e `localReport`.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  de `client-search` e do resumo local.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts --run`
  passou com 6 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 31
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 37 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Historico/filtros em `Servicos > Registros`, ainda mock/local, sem storage real,
PMOC, PDF/share ou WhatsApp real.

---

## Checkpoint atual - Clientes fase 4: vinculo com equipamento

Vincular o Cliente recem-criado ao formulario de Equipamento com UX minima,
mantendo tudo mock/local.

### Analise resumida

Clientes fase 3 criou e editou Cliente dentro de `Equipamentos > Clientes`. A
lacuna operacional seguinte era reduzir a friccao entre criar Cliente e criar o
primeiro Equipamento desse Cliente. A menor fatia segura e abrir o formulario de
Equipamento a partir do detalhe do Cliente com o Cliente ja selecionado.

### Plano

- Criar teste RED no shell para criar Cliente, abrir o detalhe, acionar criacao
  de Equipamento e confirmar o Cliente pre-selecionado.
- Reaproveitar `EquipmentForm` e `saveEquipment`.
- Guardar no shell apenas a intencao local de criar equipamento para um Cliente.
- Atualizar a matriz de paridade.

### Anti-escopo

- Nao criar wizard, modal novo, aba global de Clientes, storage real,
  Supabase/RLS, PMOC, router novo, design final, CSS legado, PDF/share,
  WhatsApp real, billing, upload ou migracao real de dados.

### Resultado deste checkpoint

- O detalhe de Cliente ganhou a acao `Criar equipamento para este cliente`.
- O shell abre `Novo equipamento` na area Equipamentos com o Cliente
  pre-selecionado.
- O equipamento salvo fica vinculado ao Cliente recem-criado no mock local.
- O fluxo reaproveita `EquipmentForm` e `saveEquipment`, sem storage real,
  Supabase/RLS, router novo ou UI final nova.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque o
  botao `Criar equipamento para este cliente` ainda nao existia.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 29
  testes.
- Validacao focada:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/equipment/clientActions.test.ts src/app-v2/equipment/equipmentActions.test.ts --run`
  passou com 39 testes.
- Validacao geral:
  `npm run format`, `npm run typecheck -- --pretty false`,
  `npm run format:check`, `git diff --check`, `npm run build` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

### Proximo checkpoint recomendado

Clientes fase 5: mapear filtros/consulta dedicada por Cliente ou relatorio local
por Cliente antes de qualquer nova UI, sem PMOC, storage real, Supabase/RLS,
router novo, PDF/share ou WhatsApp real.

---

## Checkpoint atual - Clientes fase 3: criar/editar mock local

Criar e editar Cliente mockado dentro de `Equipamentos > Clientes`, preservando
a subvisao atual e a UI minima neutra do app-v2.

### Analise resumida

Clientes ja existe como subvisao de Equipamentos, com lista, detalhe,
equipamentos vinculados e servicos relacionados. A lacuna funcional seguinte e
permitir cadastro e edicao mockados de Cliente para reduzir dependencia de dados
pre-carregados sem abrir storage real, Supabase/RLS, PMOC, router novo ou design
final.

### Plano

- Criar testes RED para action pura de Cliente: criar, editar, preservar `id`,
  nao duplicar e bloquear nome vazio.
- Adicionar teste shell para criar cliente em `Equipamentos > Clientes`.
- Adicionar teste shell para editar cliente no detalhe.
- Implementar helper puro `saveClient` mock/local.
- Reaproveitar primitives do app-v2 em formulario simples de Cliente.
- Atualizar a matriz de paridade.

### Anti-escopo

- Nao criar aba global de Clientes, storage real, Supabase/RLS, PMOC, router
  novo, design final, CSS legado, PDF/share, WhatsApp real, billing, upload ou
  migracao real de dados.

### Resultado deste checkpoint

- Criado `saveClient` como action pura mock/local para criar e editar Cliente
  em `AppV2MockSnapshot`.
- A criacao exige nome e normaliza campos textuais opcionais.
- A edicao atualiza por `id`, preserva o `id` e nao duplica a lista local.
- `Equipamentos > Clientes` ganhou acao `Novo cliente` com formulario simples
  usando primitives do app-v2.
- O detalhe de Cliente ganhou `Editar cliente`, reaproveitando o mesmo
  formulario simples.
- Nenhum storage real, Supabase/RLS, router novo, PMOC, CSS legado, PDF/share,
  WhatsApp real ou billing foi conectado.

### Validacao focada executada

- RED:
  `npm run typecheck -- --pretty false` falhou porque
  `src/app-v2/equipment/clientActions.ts` ainda nao existia.
- GREEN parcial:
  `npm run typecheck -- --pretty false` passou apos a implementacao.
- Validacao geral:
  `npm run build` passou com warnings Vite/chunk conhecidos.
- Validacao geral:
  `npm run check` passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- Bloqueio local:
  `npm test -- src/app-v2/equipment/clientActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou isoladamente neste ambiente porque o Vite/esbuild retornou
  `Error: spawn EPERM` antes de executar os testes. A suite completa dentro de
  `npm run check` carregou e passou.

### Proximo checkpoint recomendado

Clientes fase 4: vincular cliente recem-criado ao formulario de Equipamento com
UX minima, mantendo tudo mock/local e sem storage real, Supabase/RLS, PMOC,
router novo ou design final.

---

## Checkpoint atual - Equipamentos fase 2: onboarding do primeiro equipamento

Conectar o estado vazio do inicio de Registro de Servico ao cadastro mockado do
primeiro equipamento, reaproveitando o formulario simples de Equipamentos.

### Analise resumida

O app-v2 ja orienta o usuario a ir para Equipamentos quando tenta iniciar um
Registro de Servico sem nenhum equipamento cadastrado. A fase 1 adicionou
criacao/edicao mockada local. A lacuna funcional restante e reduzir a friccao:
quando o usuario veio do inicio de servico sem equipamento, cadastrar o primeiro
equipamento deve devolver o usuario ao fluxo de Registro de Servico com o
equipamento recem-criado selecionado.

### Plano

- Criar teste RED de shell para base vazia: iniciar registro, ir para
  Equipamentos, criar equipamento e abrir Registro de Servico automaticamente.
- Guardar no shell uma intencao local de iniciar servico apos criar
  equipamento.
- Reaproveitar `saveEquipment` e `startServiceFromEquipment` mockados, sem
  router novo.
- Atualizar a matriz de paridade.

### Anti-escopo

- Nao criar wizard, modal novo, storage real, Supabase/RLS, router novo,
  onboarding visual final, CSS legado, billing, PMOC, PDF/share, WhatsApp real,
  upload/fotos ou migracao real de dados.

### Validacao esperada

- Teste de shell do caminho vazio -> criar equipamento -> iniciar registro.
- Repetir testes focados de Equipamentos/Shell.

### Criterio de conclusao

- O usuario que tenta iniciar servico sem equipamentos consegue cadastrar o
  primeiro equipamento e cair no Registro de Servico desse equipamento.
- A criacao normal em Equipamentos continua apenas adicionando o item na lista.
- O fluxo permanece mock/local.

### Resultado deste checkpoint

- O shell guarda uma intencao local quando o usuario tenta iniciar Registro de
  Servico sem equipamentos e escolhe `Ir para Equipamentos`.
- Ao cadastrar o primeiro equipamento nesse caminho, o app-v2 cria o
  equipamento no mock e abre automaticamente o Registro de Servico desse
  equipamento.
- A criacao normal pela area Equipamentos continua apenas adicionando o item na
  lista.
- O comportamento reaproveita `saveEquipment` e `startServiceFromEquipment`,
  sem router novo, storage real, Supabase/RLS ou UI final nova.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque o app
  criava o equipamento mas permanecia na lista.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/equipment/equipmentActions.test.ts --run`
  passou com 31 testes.

### Proximo checkpoint recomendado

Clientes fase 3: criar/editar Cliente mockado com UI minima dentro de
Equipamentos > Clientes, preservando subvisao atual, sem storage real,
Supabase/RLS, PMOC, router novo ou design final.

---

## Historico - Equipamentos fase 1: criar/editar mock local

Mapear e implementar a primeira fatia segura de criacao/edicao de equipamento
no app-v2 usando estado/mock local e UI minima existente.

### Analise resumida

O v1 permite criar e editar equipamento validando ao menos nome, local e dados
operacionais basicos, preservando `id` em edicao e evitando duplicacao. O
app-v2 ja lista equipamentos, abre detalhe, vincula Cliente como contexto e
inicia Registro de Servico, mas ainda nao possui action mockada de criar/editar
equipamento.

A menor fatia segura e criar um contrato puro de upsert local para equipamento,
com validacoes amigaveis e testes, e so conectar ao shell se for possivel
reaproveitar os padroes simples atuais de lista/detalhe sem criar design final,
storage real, Supabase/RLS ou CSS legado.

### Plano

- Criar testes RED de action para criar equipamento, editar por `id`, preservar
  `id`, nao duplicar e bloquear nome/local ausentes.
- Implementar helper puro em `src/app-v2/equipment`, sem storage real.
- Se seguro, conectar UI minima em Equipamentos com campos simples e estado
  local, reaproveitando primitives do app-v2.
- Atualizar a matriz de paridade com o resultado real.

### Anti-escopo

- Nao criar design final, CSS global, CSS legado, tema/tokens novos, router
  novo, storage real, Supabase/RLS, billing, assinatura, PMOC, PDF/share,
  WhatsApp real, upload/fotos, limite de plano ou migracao real de dados.

### Validacao esperada

- Testes focados de action/view model/shell quando houver conexao visual.
- `npm run format`, `npm run build`, `npm run check`, `npm run format:check` e
  `git diff --check` ao final do ciclo.

### Criterio de conclusao

- Criacao mockada adiciona equipamento valido na lista.
- Edicao mockada atualiza o equipamento correto por `id`, sem duplicar.
- Erros de nome/local aparecem como mensagens locais amigaveis.
- Fluxos existentes de lista, detalhe e inicio de servico permanecem
  preservados.

### Resultado deste checkpoint

- Criado `saveEquipment` como action pura mock/local para criar e editar
  equipamento em `AppV2MockSnapshot`.
- A criacao exige nome e local, normaliza campos textuais e adiciona o item na
  lista local.
- A edicao atualiza por `id`, preserva o `id`, nao duplica a lista e mantem
  campos operacionais existentes quando a UI minima nao os envia.
- `Equipamentos` ganhou acao `Novo equipamento` com formulario simples usando
  primitives do app-v2.
- O detalhe de Equipamento ganhou `Editar equipamento`, reaproveitando o mesmo
  formulario simples.
- Erros de nome/local aparecem como mensagem local no formulario.
- Nenhum storage real, Supabase/RLS, router novo, CSS legado, upload/fotos,
  billing, PMOC, PDF/share ou WhatsApp real foi conectado.

### Validacao focada executada

- RED action:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts --run` falhou
  porque `equipmentActions` ainda nao existia.
- RED shell:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque ainda
  nao havia `Novo equipamento` nem `Editar equipamento`.
- RED preservacao:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts --run` falhou
  porque a edicao minima apagava campos operacionais existentes.
- GREEN focado:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 30 testes.

### Proximo checkpoint recomendado

Equipamentos fase 2: mapear e implementar estado vazio/onboarding funcional de
primeiro equipamento conectado ao fluxo de Registro de Servico, usando o mesmo
formulario mockado, sem storage real, sem router novo e sem design final.

---

## Historico - Clientes fase 2: servicos relacionados mockados

Exibir servicos relacionados no detalhe de Cliente usando registros mockados
existentes, sem PMOC, sem storage real, sem router novo e sem criar design
novo.

### Analise resumida

O v1 permite consultar contexto por cliente e relacionar historico/servicos ao
cliente. O app-v2 ja tem Clientes como subvisao dentro de Equipamentos e mostra
equipamentos vinculados, mas o detalhe do Cliente ainda nao exibe registros de
servico relacionados.

A menor fatia segura e derivar, em view model, os registros cujo equipamento
pertence ao cliente e renderizar uma lista simples no detalhe atual. Isso
preserva a UX funcional de consulta sem copiar tela de historico, sem PMOC e
sem storage real.

### Plano

- Adicionar teste RED no view model de Clientes para servicos relacionados.
- Adicionar teste RED no shell garantindo que o detalhe do Cliente mostra
  servicos relacionados.
- Implementar derivacao pura em `equipmentClientsViewModel`.
- Renderizar uma secao simples em `ClientDetail` usando `SectionCard` e
  `ListRow`.
- Atualizar a matriz de paridade.

### Anti-escopo

- Nao implementar PMOC, relatorio por cliente, filtros avancados, router novo,
  storage real, Supabase/RLS, PDF/share, WhatsApp real, billing ou design novo.
- Nao copiar UI/CSS/template do historico legado.

### Validacao esperada

- Testes focados de view model e shell.
- Validacao geral ao final do ciclo.

### Resultado deste checkpoint

- `buildEquipmentClientDetailViewModel` agora deriva servicos relacionados pelos
  equipamentos vinculados ao cliente.
- `ClientDetail` exibe a secao simples `Servicos relacionados` reaproveitando
  `SectionCard`, `ListRow` e `StatusBadge`.
- A lista mostra equipamento, tipo, data, status e resumo tecnico do registro.
- O detalhe de Cliente continua mock/local e sem aba global nova.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou antes da implementacao porque `detail.services` ainda nao existia e o
  shell nao exibia `Servicos relacionados`.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 23 testes apos a implementacao.

### Proximo checkpoint recomendado

Alertas e proximas acoes fase 1: mapear na matriz as regras v1 de alertas de
cliente, preventiva vencida/proxima e criticidade contra a Home operacional
atual do app-v2, antes de implementar qualquer nova UI.

---

## Checkpoint atual - Alertas e proximas acoes fase 1: mapeamento funcional

Mapear as regras v1 de alertas e proximas acoes contra a Home operacional atual
do app-v2, sem implementar UI nova.

### Analise resumida

O v1 concentra a regra operacional em `src/domain/maintenance.js`, especialmente
em `buildMaintenanceAlerts`: status critico, falta de historico em ativo
critico/alta prioridade, preventiva vencida, preventiva proxima e reincidencia
de corretivas/ocorrencias. A ordenacao usa severidade, score operacional,
criticidade, prioridade e dias de atraso.

O app-v2 ja possui `pickNextHomeAction` e `buildHomeTodayViewModel`, mas hoje
prioriza apenas compromissos vencidos/hoje, primeiro servico e fila curta
mockada. A regra completa de alertas do v1 ainda nao foi portada para dominio
puro do app-v2.

### Plano

- Registrar na matriz a regra v1 analisada.
- Registrar equivalente v2 atual.
- Separar lacuna segura de dominio/testes da lacuna visual.
- Recomendar proximo checkpoint pequeno sem UI nova.

### Anti-escopo

- Nao implementar UI nova, notificacao real, calendario real, storage real,
  Supabase/RLS, PMOC, PDF/share, WhatsApp real, billing, assinatura, router novo
  ou CSS/design.

### Resultado deste checkpoint

- Matriz atualizada com o escopo funcional dos alertas v1.
- Lacuna definida: portar priorizacao de alertas para dominio puro/mockado do
  app-v2 antes de qualquer tela nova.

### Proximo checkpoint recomendado

Alertas e proximas acoes fase 2: criar dominio puro/testado no app-v2 para
priorizar alertas mockados por status critico, preventiva vencida/proxima, falta
de historico em equipamento critico e reincidencia corretiva, sem nova UI, sem
storage real e sem notificacoes/calendario reais.

---

## Checkpoint atual - Alertas e proximas acoes fase 2: dominio puro mockado

Criar dominio puro e testado no app-v2 para priorizar alertas mockados a partir
dos dados locais existentes.

### Analise resumida

O mapeamento anterior identificou que o v1 usa alertas por equipamento com
severidade, criticidade, prioridade operacional, preventiva vencida/proxima,
falta de historico e reincidencia. A Home do app-v2 hoje possui apenas
`pickNextHomeAction`, sem uma lista pura de alertas equivalentes.

### Plano

- Criar testes RED para prioridade de status critico, preventiva
  vencida/proxima, falta de historico critico e reincidencia corretiva.
- Implementar helper puro em `src/app-v2/domain`, sem conectar UI.
- Preservar contratos atuais de `pickNextHomeAction`.
- Atualizar matriz com o checkpoint.

### Anti-escopo

- Nao implementar UI nova, notificacao real, calendario real, storage real,
  Supabase/RLS, PMOC, PDF/share, WhatsApp real, billing, assinatura, router novo
  ou CSS/design.

### Validacao esperada

- Teste focado de dominio.
- Testes atuais de Home/domínio continuam passando.

### Resultado deste checkpoint

- Criado `buildHomeAlerts` em dominio puro do app-v2.
- Cobertos alertas mockados de status critico, preventiva vencida, preventiva
  proxima, equipamento critico sem historico e reincidencia corretiva.
- A ordenacao considera severidade e score operacional local por criticidade e
  prioridade operacional.
- Nenhuma UI, storage real, notificacao real ou integracao sensivel foi
  conectada.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/domain/homeAlerts.test.ts --run` falhou com 4
  assercoes porque o helper ainda retornava lista vazia.
- GREEN:
  `npm test -- src/app-v2/domain/homeAlerts.test.ts src/app-v2/domain/homePriority.test.ts --run`
  passou com 6 testes.

### Proximo checkpoint recomendado

Alertas e proximas acoes fase 3: consumir `buildHomeAlerts` no view model da
Home para alimentar indicadores/estado operacional com os alertas mockados,
reaproveitando UI atual e sem criar novo layout.

---

## Checkpoint atual - Alertas e proximas acoes fase 3: Home consome alertas

Consumir `buildHomeAlerts` no view model da Home para refletir alertas mockados
na prioridade operacional sem criar layout novo.

### Analise resumida

O dominio puro de alertas ja cobre os principais sinais v1. A menor fatia segura
de UX funcional e fazer a Home usar esses alertas para o contador operacional e
para a proxima acao quando houver equipamento fora de operacao, preservando o
componente visual atual.

### Resultado deste checkpoint

- `buildHomeTodayViewModel` consome `buildHomeAlerts`.
- O card de resumo antes baseado apenas em vencidos agora mostra alertas ativos.
- A proxima acao prioriza `critical_status` e permite iniciar registro pelo
  equipamento critico.
- A fila curta de compromissos foi preservada.
- Nao houve nova tela, novo layout, storage real, notificacao real ou area
  sensivel.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts --run`
  falhou porque alertas criticos ainda duplicavam compromissos e a Home ainda
  priorizava preventiva vencida.
- GREEN:
  `npm test -- src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/domain/homePriority.test.ts --run`
  passou com 9 testes.

### Proximo checkpoint recomendado

Alertas e proximas acoes fase 4: exibir uma lista curta de alertas ativos na
Home usando componentes existentes, sem criar design final, sem notificacoes
reais e sem storage real.

---

## Checkpoint atual - Alertas e proximas acoes fase 4: lista curta na Home

Exibir uma lista curta de alertas ativos na Home, usando os dados ja calculados
em view model e componentes existentes.

### Plano

- Expor alertas resumidos no `HomeTodayViewModel`.
- Renderizar card simples no aside atual, sem layout novo amplo.
- Testar view model e shell.

### Anti-escopo

- Nao criar design final, CSS novo global, notificacao real, calendario real,
  storage real, Supabase/RLS, PMOC, PDF/share, WhatsApp real, billing,
  assinatura ou router.

### Resultado deste checkpoint

- `HomeTodayViewModel` passou a expor uma lista curta de alertas ativos.
- `HomeToday` renderiza `Alertas ativos` no aside usando `SectionCard`,
  `StatusBadge` e botao simples existente.
- Clicar em um alerta abre o detalhe do equipamento, usando o mesmo callback da
  Home.
- Testes antigos de inicio de servico foram atualizados para refletir a nova
  prioridade: equipamento critico antes de preventiva vencida.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/home/homeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `alerts` ainda nao existia no view model e a Home nao
  renderizava `Alertas ativos`.
- GREEN:
  `npm test -- src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 28 testes.

### Proximo checkpoint recomendado

Equipamentos fase 1: mapear criar/editar equipamento mockado do v1 contra o
app-v2 e implementar a menor fatia segura de formulario/dominio local, sem
storage real, sem Supabase/RLS e sem design final.

---

## Checkpoint atual - Historico de Servicos fase 1: busca local em Registros

Adicionar busca local simples em `Servicos > Registros` para reduzir a lacuna
de consulta do Historico v1 sem recriar a tela legada.

### Analise resumida

O v1 permite consultar historico por registros e contexto operacional. O
app-v2 ja lista registros recentes e permite editar/reabrir relatorio por
caminhos locais, mas ainda nao possui busca na subvisao `Registros`.

A menor fatia segura e filtrar registros recentes em memoria por equipamento,
cliente, tecnico, tipo e texto do registro, usando input simples e mensagem
local de estado vazio.

### Plano

- Criar testes RED no view model de Servicos para busca local.
- Criar teste shell para busca em `Servicos > Registros`.
- Implementar filtro puro em `buildServicesHomeViewModel`.
- Adicionar input simples no topo da lista de registros.
- Atualizar matriz de paridade.

### Anti-escopo

- Nao criar filtros avancados, periodo, ordenacao customizada ou tela de
  Historico legada.
- Nao criar router novo, storage real, Supabase/RLS, PDF/share, WhatsApp,
  billing, PMOC ou CSS legado.

### Validacao esperada

- Testes focados de view model e shell.
- Validacao geral ao final do ciclo.

### Resultado deste checkpoint

- `buildServicesHomeViewModel` filtra registros recentes por query local
  normalizada.
- `Servicos > Registros` ganhou input simples `Buscar registros`.
- A busca cobre equipamento, cliente, local, tipo, tecnico, texto do registro,
  pecas e custos.
- Estado sem resultado mostra mensagem local `Nenhum registro encontrado.`
- Nenhum router, storage real, historico legado, CSS legado ou integracao
  sensivel foi tocado.

### Validacao focada executada

- RED/GREEN:
  `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 28 testes.

### Proximo checkpoint recomendado

Clientes fase 2: exibir servicos relacionados no detalhe de Cliente usando
registros mockados existentes, sem PMOC, sem storage real, sem router novo e
sem criar design novo.

---

## Historico - Orçamentos mockados dentro de Serviços

Implementar a primeira fatia segura de paridade funcional de Orçamentos no
app-v2 usando UI mínima neutra já existente em Serviços.

### Decisão de produto aplicada

A UX funcional do v1 deve ser preservada como comportamento operacional, não
como layout, CSS ou componente visual legado. Quando o app-v2 resolver uma
capacidade útil com fluxo melhor, a matriz pode marcar `coberto por
substituição v2`.

Com isso, o prompt de próxima preventiva pós-salvamento fica coberto por
substituição v2: o app-v2 já captura `Próxima manutenção` dentro do fluxo de
Registro de Serviço e cria compromisso mockado no fechamento, sem reabrir o
prompt visual do v1.

### Análise resumida

O v1 possui módulo de Orçamentos com pipeline, status, vínculo com cliente,
equipamento ou registro e ações sensíveis de PDF, WhatsApp e assinatura. O
app-v2 já possui contrato `Orcamento` e `orcamentos` na store mockada, mas a
área Serviços ainda não expõe uma subvisão de Orçamentos.

A menor fatia segura é listar orçamentos mockados dentro de Serviços, com
estado vazio funcional e resumo de pipeline. Não haverá criação, edição,
assinatura, PDF, WhatsApp, storage real ou billing.

### Plano

- Atualizar a matriz com a decisão de substituição da próxima preventiva.
- Criar testes RED para view model de Orçamentos mockados.
- Criar teste shell garantindo a subvisão `Orçamentos` dentro de Serviços, sem
  virar aba global.
- Implementar view model pequeno e componentes mínimos reutilizando primitivas
  do app-v2.
- Atualizar documentação de paridade ao final.

### Anti-escopo

- Não criar orçamento real, edição real, assinatura, PDF/share, WhatsApp real,
  billing, cotas, Supabase/RLS, storage real, PMOC ou router novo obrigatório.
- Não copiar UI/CSS/template legado.
- Não criar CSS global, tema/tokens ou design final novo.
- Não implementar modal de orçamento, download, aprovação real ou envio.

### Validação esperada

- Testes focados de view model e shell.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Critério de conclusão

- Serviços possui subvisão `Orçamentos` com UI mínima neutra.
- Orçamentos mockados são listados com número, título, cliente/equipamento,
  status e total.
- Estado vazio orienta que orçamentos surgirão em etapa mock/local futura, sem
  prometer PDF/WhatsApp/assinatura real.
- Orçamentos não viram aba principal global.
- Matriz registra o fluxo como parcial/coberto apenas na fatia mock local.

### Resultado deste checkpoint

- `Servicos` ganhou subvisao `Orcamentos`, sem virar aba principal global.
- `servicesQuotesViewModel` lista orcamentos mockados com numero, titulo,
  cliente, equipamento, status e total.
- A subvisao exibe KPIs locais de ativos, aprovados e pipeline.
- `appV2MockData` passou a ter um orcamento mockado de exemplo vinculado a
  cliente, equipamento e registro.
- Nenhuma acao de criacao, edicao, PDF/share, WhatsApp, assinatura, billing,
  storage real, Supabase/RLS ou PMOC foi implementada.

### Validacao focada executada

- RED:
  `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque o view model nao existia e a subvisao `Orcamentos` nao estava
  disponivel.
- GREEN:
  `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 20 testes.

---

## Checkpoint atual - Edicao de Registro fase 2: equipamento e data

Completar a fatia segura da edicao mockada no app-v2 permitindo alterar
equipamento e data de um registro existente, sem criar design novo e
reaproveitando padroes ja presentes no app-v2.

### Analise resumida

A fase 1 ja reidrata o draft, salva por `id`, nao duplica historico e preserva
campos migrados. A lacuna restante aprovada e permitir alterar os dados basicos
do registro em modo edicao: equipamento e data.

O app-v2 ja tem um padrao de escolha de equipamento em
`ServiceEquipmentChoice`, usado quando o registro inicia sem contexto. Para a
fase 2, a mudanca segura e reutilizar esse mesmo componente no modo edicao, sem
novo picker visual. O campo de data pode reaproveitar o mesmo estilo de input
`type="date"` usado em `nextMaintenanceDate`, mantendo validacao local por
`validateServiceCompletion`.

### Plano

- Adicionar testes RED para editar equipamento e data de registro existente.
- Cobrir relatorio/reabertura refletindo novo equipamento e nova data.
- Reaproveitar `ServiceEquipmentChoice` para troca de equipamento em modo
  edicao.
- Inserir campo simples de data no fluxo atual, usando padrao visual ja
  existente.
- Preservar `id`, nao duplicar historico e manter campos ja migrados.
- Atualizar matriz de paridade e validacoes.

### Anti-escopo

- Nao criar design novo, CSS global, CSS legado ou tema/tokens novos.
- Nao criar calendario complexo, tela grande nova ou router obrigatorio.
- Nao implementar storage real, Supabase/RLS, PDF/share real, WhatsApp real,
  billing, assinatura, cotas, permissoes ou PMOC.
- Nao recomputar historico complexo de status se isso exigir regra nova grande.

### Validacao esperada

- Testes focados de action/view model.
- Testes de shell relacionados a edicao.
- Testes de relatorio/reabertura.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- Registro existente pode alterar equipamento e data no mock local.
- O `id` e preservado e o historico nao duplica.
- Relatorio/reabertura refletem novo equipamento e nova data.
- Diagnostico, acoes, pecas, custos, proxima manutencao e fallback legado
  continuam preservados.
- Equipamento inexistente e data ausente/invalida continuam bloqueados.

### Resultado deste checkpoint

- A edicao de registro existente permite alterar data no passo de contexto com
  input simples `type="date"`.
- A edicao permite alterar equipamento reaproveitando `ServiceEquipmentChoice`,
  o mesmo padrao visual do inicio sem contexto.
- Ao escolher outro equipamento, o draft volta ao fluxo de edicao sem router
  novo e sem picker visual novo.
- `updateServiceRecord` continua preservando `id`, sem duplicar historico, e
  grava equipamento/data editados.
- Relatorio imediato e reaberto refletem equipamento e data editados.
- Diagnostico, acoes, pecas, custos, proxima manutencao e fallback de
  `observacoes` continuam cobertos.

### Validacao executada

- RED relatorio:
  `npm test -- src/app-v2/service/serviceReportViewModel.test.ts --run`
  falhou porque o relatorio imediato ainda usava `today` em vez de
  `draft.serviceDate`.
- RED shell:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque o
  fluxo ainda nao tinha `input[name="service-date"]` nem troca de equipamento.
- GREEN relatorio:
  `npm test -- src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 10 testes.
- GREEN shell:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 17
  testes.
- GREEN focado app-v2:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 55 testes.

### Proximo checkpoint recomendado

Contrato documental de tecnico global no app-v2, sem storage real.

### Acao automatica

Continuando automaticamente para contrato documental de tecnico global, porque
a lacuna pode ser decomposta sem storage real, sem design novo e sem area
sensivel.

---

## Checkpoint atual - Contrato documental de tecnico global

Definir contrato seguro para a capacidade do v1 de adicionar tecnico informado
no Registro de Servico a uma lista global de tecnicos.

### Analise resumida

No v1, `buildRegistroCreateStateMutation` adiciona
`persistedPayload.tecnico` a `prev.tecnicos` quando o nome ainda nao existe. O
app-v2 ja exige tecnico no draft, mas ainda nao possui lista global mockada nem
contrato para evoluir essa paridade sem tocar storage real.

### Resultado deste checkpoint

- Criado `docs/rewrite/contrato-tecnico-global-app-v2.md`.
- Definido que a primeira paridade segura deve ser `tecnicos: string[]` no mock
  local.
- Definido que criacao e edicao de Registro de Servico podem acumular tecnico
  nao vazio no mock.
- Definido anti-escopo: UI nova, autocomplete, storage real, Supabase/RLS,
  permissoes, perfil, migracao, PDF/share e WhatsApp.

### Validacao esperada

- `npm run format:check`.
- `git diff --check`.

### Proximo checkpoint recomendado

Tecnico global fase 1 mockada: acumular tecnico informado em lista mockada no
app-v2 durante criacao e edicao de Registro de Servico, sem UI nova e sem
storage real.

### Acao automatica

Continuar automaticamente, porque a proxima fatia e app-v2/mock local, sem UI
nova e sem area sensivel.

---

## Checkpoint atual - Tecnico global fase 1 mockada

Acumular tecnico informado em lista mockada no app-v2 durante criacao e edicao
de Registro de Servico, sem UI nova e sem storage real.

### Resultado deste checkpoint

- `AppV2MockData` agora possui `tecnicos: string[]`.
- `createAppV2MockSnapshot` clona a lista de tecnicos.
- `completeService` adiciona tecnico novo ao mock local.
- `updateServiceRecord` adiciona tecnico editado ao mock local.
- A regra usa `trim`, ignora nome vazio e nao duplica nome existente.
- Nenhuma UI, autocomplete, storage real, Supabase/RLS, permissao, perfil,
  PDF/share ou WhatsApp foi alterado.

### Validacao executada

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `tecnicos` ainda era `undefined`.
- GREEN:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 20 testes.

### Proximo checkpoint recomendado

Definir contrato controlado para prompt de proxima preventiva pos-salvamento no
app-v2, sem implementar UX nova.

### Acao automatica

Continuando automaticamente apenas para a fatia documental segura antes do gate
de UX.

---

## Checkpoint atual - Contrato de proxima preventiva pos-salvamento

Documentar o contrato do prompt pos-salvamento sem implementar UX nova.

### Resultado deste checkpoint

- Criado
  `docs/rewrite/contrato-proxima-preventiva-pos-salvamento-app-v2.md`.
- Registrado que o app-v2 ja cria compromisso mockado quando
  `nextMaintenanceDate` e informado durante o fluxo.
- Registrado que prompt futuro deve evitar duplicidade e permitir confirmar,
  alterar ou recusar a proxima preventiva.
- Mantidos fora do escopo: UI nova, modal/drawer, storage real, notificacao,
  calendario real, recorrencia avancada, PDF/share, WhatsApp, billing,
  Supabase/RLS, permissoes e PMOC.

### Proximo checkpoint recomendado

Decisao humana de UX para prompt de proxima preventiva pos-salvamento, ou
aprovar explicitamente manter apenas o campo `Proxima manutencao` dentro do
fluxo como comportamento final do app-v2.

### Acao automatica

Bloqueado por gate humano: a proxima acao funcional exige decisao visual/UX.

---

## Historico - Edicao de Registro de Servico existente fase 1 mockada

Implementar a primeira fatia segura da edicao de registro existente no app-v2:

> contrato/action/view model para editar um registro salvo no mock local,
> preservando `id`, sem duplicar registro, com reidratacao de draft a partir do
> registro existente e sem design novo, CSS legado, storage real, router novo
> obrigatorio ou integracoes sensiveis.

### Analise resumida

No v1, `buildRegistroEditStateMutation` localiza o registro por `editingId`,
gera uma versao editada com `buildEditedRegistro`, substitui apenas o item
correspondente em `prev.registros` e reconcilia status dos equipamentos. O modo
edicao tambem reidrata campos do registro existente no formulario, incluindo
tipo `Outro`, tecnico, observacoes, pecas, custos e dados operacionais.

No app-v2, `completeService` cobre criacao/conclusao mockada e ja valida
equipamento/data. A lacuna segura agora e criar a fatia equivalente mockada:
reidratar `ServiceDraft` a partir de `RegistroServico` e atualizar um registro
existente sem duplicar. Ha 99% de certeza para atuar porque a mudanca fica em
app-v2, action pura, view model e testes. A conexao visual ao shell so deve
acontecer se couber no padrao atual sem novo desenho.

### Plano

- Adicionar testes RED para reidratacao de draft a partir de registro existente.
- Adicionar testes RED para editar registro existente no mock preservando `id`
  e sem duplicar.
- Cobrir campos migrados: equipamento, data, tipo, `Outro`, tecnico,
  diagnostico, acoes, observacoes/fallback legado, pecas, custos e proxima
  manutencao.
- Reutilizar a validacao de equipamento existente e data valida no modo edicao.
- Implementar helpers/actions pequenos em app-v2.
- Atualizar matriz de paridade e validacoes.

### Anti-escopo

- Nao criar design final novo nem CSS global.
- Nao copiar UI/CSS/template legado.
- Nao implementar storage real, Supabase/RLS, PDF/share real, WhatsApp real,
  billing, cotas, assinatura, PMOC, permissoes ou package/config.
- Nao implementar edicao visual completa se exigir decisao de UX.

### Validacao esperada

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts --run`.
- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/service/serviceReportViewModel.test.ts --run`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- Registro existente e atualizado por `id` sem duplicacao.
- Edicao preserva o `id`.
- Edicao preserva campos migrados do Registro de Servico.
- Reidratacao aceita registros antigos apenas com `observacoes`.
- Edicao bloqueia equipamento inexistente e data ausente/invalida.
- Fluxo valido atual de conclusao/relatorio continua passando.

### Resultado deste checkpoint

- `createServiceDraftFromRecord` reidrata o draft de edicao a partir de
  `RegistroServico`.
- Registros antigos apenas com `observacoes` continuam abrindo por fallback.
- `updateServiceRecord` atualiza o registro existente por `id`, preserva o
  `id` e nao duplica historico.
- A action de edicao reutiliza a validacao de equipamento existente e data
  valida.
- O shell ganhou conexao minima usando o fluxo visual existente: botao
  `Editar` em registro recente, draft reidratado e salvamento via
  `updateServiceRecord`.
- Nao houve router novo, storage real, CSS global, CSS legado ou integracao
  sensivel.

### Validacao executada

- RED/GREEN view model:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts --run`
  passou com 10 testes.
- GREEN action + view model:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts --run`
  passou com 27 testes.
- GREEN shell:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 16
  testes.
- GREEN fluxo app-v2:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 52 testes.
- `npm run format`: passou.
- `npm run build`: passou com warnings Vite conhecidos de import
  static/dynamic e chunk size.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite conhecidos no build.
- `npm run format:check`: passou dentro de `npm run check`.
- `git diff --check`: passou.

### Proximo checkpoint recomendado

Edicao de Registro fase 2: definir UX aprovada para alterar equipamento e data
dentro do fluxo de edicao, ou limitar explicitamente a fase 2 a uma fatia sem
UI nova.

### Gate

O ciclo automatico deve parar aqui: a proxima evolucao funcional relevante da
edicao exige decisao visual/UX para editar equipamento e data no fluxo, ou uma
nova fatia explicitamente limitada sem UI.

---

## Historico - Diagnostico e acoes separados

Implementar a proxima lacuna funcional segura do Registro de Servico:

> Separar diagnostico e acoes executadas no registro mockado e no relatorio
> local do app-v2, preservando `observacoes` como compatibilidade e sem tocar
> storage real, PDF/share, WhatsApp real, router ou contratos legados.

### Analise resumida

No v1, `obs` alimenta a descricao final do registro. No app-v2, o fluxo ja
captura `diagnosis` e `actionsDone` separados no draft, mas o registro mockado
salva ambos apenas concatenados em `observacoes`. Ao reabrir relatorio a partir
de registro, diagnostico e acoes voltam duplicados a partir de `observacoes`.

Ha 99% de certeza para atuar porque a mudanca fica restrita ao contrato
mockado do app-v2, action pura e view model de relatorio local. Nao ha storage
real, schema real, router, PDF/share, WhatsApp, billing, PMOC, permissoes,
package/config ou CSS legado envolvidos.

### Plano

- Adicionar testes RED em `appV2Flow.test.ts` garantindo que o registro mockado
  preserva diagnostico e acoes separadamente, mantendo `observacoes`.
- Adicionar teste RED em `serviceReportViewModel.test.ts` garantindo que
  relatorio reaberto usa diagnostico e acoes separados quando existirem.
- Adicionar campos opcionais ao tipo `RegistroServico` mockado do app-v2.
- Atualizar `completeService` para preencher os campos separados.
- Atualizar view model de relatorio para preferir campos separados e manter
  fallback por `observacoes`.
- Atualizar matriz de paridade e validacoes.

### Anti-escopo

- Nao alterar UI estrutural, CSS global, design visual ou shell legado.
- Nao alterar storage real, Supabase/RLS, PDF/share, WhatsApp real, billing,
  PMOC, assinatura, permissoes, router ou package/config.
- Nao migrar dados reais nem alterar contratos legados.

### Validacao esperada

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceReportViewModel.test.ts --run`.
- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- Registro mockado preserva diagnostico e acoes separadamente.
- `observacoes` continua preenchida como compatibilidade.
- Relatorio reaberto usa diagnostico e acoes separados quando existirem.
- Relatorio reaberto continua aceitando registros antigos apenas com
  `observacoes`.
- Matriz de paridade marca a lacuna como coberta.

### Resultado deste checkpoint

- `RegistroServico` mockado passou a aceitar `diagnostico` e
  `acoesExecutadas` opcionais.
- `completeService` grava diagnostico e acoes separadamente e mantem
  `observacoes` concatenada para compatibilidade.
- `buildServiceReportViewModelFromRecord` prefere os campos separados quando
  existirem.
- Registros antigos apenas com `observacoes` continuam abrindo relatorio por
  fallback.

### Validacao executada

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceReportViewModel.test.ts --run`
  falhou porque o registro nao possuia campos separados e o relatorio reaberto
  duplicava `observacoes`.
- GREEN focado:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 24 testes.
- GREEN de fluxo:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 39 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check`,
  `npm run format:check` e `git diff --check` passaram.

### Proximo checkpoint recomendado

Definir por decisao humana qual lacuna restante deve abrir proxima etapa:
tecnico global, edicao de registro existente, prompt de proxima preventiva ou
pos-salvamento PDF/WhatsApp real.

### Gate

O ciclo automatico deve parar aqui: as lacunas restantes envolvem contrato
novo, UX de prompt, fluxo maior de edicao ou areas sensiveis.

---

## Historico - Validacao amigavel de equipamento e data

Implementar a proxima lacuna funcional segura do Registro de Servico:

> Validacao amigavel de equipamento e data do Registro de Servico no app-v2,
> sem alterar router, storage real, contratos legados ou areas sensiveis.

### Analise resumida

No v1, o payload do Registro valida `equipId` contra equipamentos existentes e
exige `data` valida antes de persistir. No app-v2, a conclusao mockada ja
recebe `date` e `serviceDraft.equipmentId`, mas ainda nao bloqueia de forma
amigavel quando o equipamento desaparece do snapshot ou quando a data do
contrato mockado vem ausente/invalida.

Ha 99% de certeza para atuar porque a mudanca fica restrita ao app-v2:
action pura/mockada, shell do fluxo, testes focados e matriz de paridade. Nao
ha storage real, schema real, router, PDF/share, WhatsApp, billing, PMOC,
permissoes ou CSS legado envolvidos.

### Plano

- Adicionar testes RED em `appV2Flow.test.ts` para equipamento inexistente,
  data ausente/invalida e fluxo valido preservado.
- Adicionar teste RED no shell garantindo mensagem amigavel local quando a
  conclusao falha por equipamento invalido.
- Implementar validacao pura em `completeService`.
- Capturar erro no shell e passar mensagem local para o fluxo.
- Exibir mensagem local no app-v2 sem alterar estrutura visual ampla.
- Atualizar matriz de paridade e validacoes.

### Anti-escopo

- Nao criar novo campo visual de data neste checkpoint.
- Nao alterar router, storage real, Supabase/RLS, PDF/share, WhatsApp real,
  billing, PMOC, assinatura, permissoes ou package/config.
- Nao copiar UI, CSS, template ou shell legado.
- Nao implementar edicao de registro, tecnico global ou lista real de tecnicos.

### Validacao esperada

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- `completeService` bloqueia equipamento inexistente com mensagem amigavel.
- `completeService` bloqueia data ausente ou invalida com mensagem amigavel.
- O shell exibe a mensagem local no fluxo quando a conclusao falha.
- Fluxo valido de conclusao permanece preservado.
- Matriz de paridade marca validacao de equipamento/data como coberta.

### Resultado deste checkpoint

- `completeService` passou a chamar `validateServiceCompletion` antes de criar
  o registro mockado.
- `validateServiceCompletion` bloqueia equipamento inexistente e data ausente
  ou invalida em formato calendario simples `YYYY-MM-DD`.
- `ServiceFlow` valida antes de sair da revisao para a etapa final.
- `ServiceStepReview` exibe mensagem local amigavel quando a validacao falha.
- O shell usa a mesma validacao da action, preservando o fluxo valido atual.

### Validacao executada

- RED inicial:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `completeService` ainda nao bloqueava equipamento/data e o shell
  avancava para finalizado.
- GREEN focado:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 30 testes.

### Proximo checkpoint recomendado

Separar diagnostico e acoes executadas no registro mockado e no relatorio local
do app-v2, preservando `observacoes` como compatibilidade e sem tocar storage
real, PDF/share, WhatsApp real, router ou contratos legados.

---

## Historico - QA visual dos campos do Registro

Corrigir regressao visual observada no Registro de Servico do app-v2:

> labels e campos compactos da etapa de execucao nao podem se amontoar,
> sobrepor ou encostar visualmente uns nos outros em desktop ou mobile.

### Analise resumida

A captura enviada mostra a etapa de execucao com campos de custos e proxima
manutencao visualmente apertados. A causa confirmada esta no agrupamento de
campos compactos em grid: o teste inicial media apenas label contra o proprio
controle, mas nao media a distancia entre o controle anterior e o proximo label
quando o grid quebra para uma coluna no mobile.

Ha 99% de certeza para atuar porque a mudanca fica restrita ao app-v2:
componente visual do Registro de Servico e teste Playwright de layout no
preview. Nao ha regra de negocio, storage, integracao real, PDF/share,
WhatsApp, billing, PMOC, permissoes ou contrato legado envolvidos.

### Plano

- Criar teste Playwright RED no preview app-v2 medindo retangulos reais de
  label/input.
- Validar que labels de `Custo de pecas`, `Custo de mao de obra`,
  `Proxima manutencao` e `Status final` mantem respiro vertical minimo e nao
  sobrepoem seus controles.
- Validar em mobile que um grupo de campo nao invade visualmente o proximo
  label quando o grid de custos quebra para uma coluna.
- Validar em desktop que o Registro de Servico usa quase toda a superficie util
  do app-v2, sem ficar centralizado em uma coluna estreita.
- Ajustar apenas espacamento/estrutura local da etapa de execucao.
- Revalidar teste focado de shell, teste e2e novo, format, build, check e
  `git diff --check`.

### Anti-escopo

- Nao redesenhar o fluxo inteiro.
- Nao alterar regra de negocio do Registro de Servico.
- Nao tocar app legado.
- Nao alterar storage real, Supabase/RLS, PDF/share, WhatsApp real, billing,
  PMOC, assinatura, permissoes, package/config ou router.
- Nao mexer em calendario, recorrencia, notificacoes ou prompt legado.

### Validacao esperada

- TDD RED com Playwright antes da correcao visual.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run`.
- Playwright focado do novo teste visual.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- O teste automatizado falha antes da correcao por espacamento insuficiente ou
  sobreposicao.
- Labels compactos da etapa de execucao mantem respiro vertical minimo de 20px
  em relacao aos seus controles.
- Grupos de campo compactos mantem respiro vertical minimo de 20px entre o fim
  do controle anterior e o inicio do proximo label em mobile.
- Custos em duas colunas nao colidem entre si em desktop.
- O fluxo funcional existente permanece passando.

### Resultado deste checkpoint

- Criado teste Playwright focado em `e2e/specs/app-v2-service-layout.spec.js`.
- O teste mede `getBoundingClientRect()` real no preview app-v2 para travar
  respiro minimo entre labels e controles compactos.
- RED confirmado: `Custo de pecas` tinha 8px de respiro, abaixo do minimo de
  12px.
- `ServiceStepExecution` passou a usar `tw-gap-3` entre labels e controles da
  etapa de execucao.
- GREEN confirmado no Playwright: labels de custos, proxima manutencao e status
  final nao sobrepoem controles e mantem respiro minimo em desktop.
- A segunda validacao visual mostrou que o problema maior era estrutural:
  `ServiceFlow` limitava o fluxo a `tw-max-w-[980px]`, usando apenas 58,6% da
  largura util em desktop grande.
- O teste Playwright passou a travar aproveitamento minimo de 70% da superficie
  desktop e largura superior a 1180px.
- `ServiceFlow` deixou de sobrescrever o `PageShell` com 980px e voltou a usar
  o limite padrao do app-v2.
- A terceira validacao visual mostrou que ainda havia uma lacuna mobile: o
  respiro entre `Custo de pecas` e `Custo de mao de obra` era de 12px quando a
  grade quebrava para uma coluna.
- O teste Playwright agora trava respiro minimo de 20px entre grupos de campos
  compactos em mobile.
- `ServiceStepExecution` passou a usar `tw-gap-x-3 tw-gap-y-5` no grid de
  custos, preservando colunas no desktop e aumentando apenas o respiro vertical.
- A quarta validacao visual mostrou que 12px entre label e controle continuava
  parecendo colado na borda com foco ativo. O contrato Playwright agora exige
  20px entre label e controle.
- `ServiceStepExecution` passou a usar `tw-gap-5` em todos os labels da etapa
  de execucao e `tw-mt-5` antes dos botoes de status.
- A largura desktop tambem foi endurecida: o Registro de Servico agora deve usar
  mais de 90% da superficie util. `ServiceFlow` usa `tw-max-w-none` apenas nesse
  fluxo.

### Validacao executada

- TDD RED:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou primeiro por seletor ambiguo do teste; apos ajuste do seletor, falhou
  corretamente por `Custo de pecas` com 8px de respiro.
- GREEN focado:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 1 teste.
- `npm run format`: passou.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run`: passou com 1
  arquivo e 14 testes.
- Revalidacao Playwright apos format:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 1 teste.
- RED de largura:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou com ratio `0.5861244019138756`, abaixo do minimo `0.7`.
- GREEN de largura:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 1 teste apos remover o limite local de 980px.
- RED mobile entre grupos:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou com 12px entre `Custo de pecas` e `Custo de mao de obra`, abaixo do
  minimo de 20px.
- GREEN mobile/desktop:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 2 testes apos aumentar o gap vertical do grid de custos.
- RED de respiro label-controle:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou com 12px entre label e campo, abaixo do novo minimo de 20px.
- RED de largura desktop:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  falhou com ratio `0.7655502392344498`, abaixo do minimo `0.9`.
- GREEN final visual:
  `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-service-layout.spec.js --project=chromium`
  passou com 2 testes apos ampliar respiro interno e liberar largura total do
  `ServiceFlow`.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `npm run format:check`: passou.
- `git diff --check`: passou.

---

## Historico - Proxima manutencao

Implementar a proxima lacuna de paridade do Registro de Servico:

> Proxima manutencao deve virar campo opcional do Registro de Servico no
> app-v2, conectando-se ao agendamento mockado ja existente, sem calendario
> completo, sem recorrencia avancada e sem storage real.

### Analise resumida

No v1, `proxima` entra no payload e no registro persistido. O pos-salvamento
tambem pode acionar prompt de proxima preventiva. A capacidade operacional a
preservar neste checkpoint e registrar a data de proxima manutencao e refletir
isso no agendamento mockado do app-v2.

No v2 atual, `scheduleNextCommitment` ja existe como action mockada, mas o
Registro de Servico ainda nao coleta `proxima` nem cria compromisso ao concluir.

Ha 99% de certeza para implementar porque a mudanca fica restrita ao app-v2:
draft, action mockada, view models, UI de execucao, relatorio e testes. O
compromisso criado sera uma preventiva simples com `origem: "registro"`, sem
calendario completo, sem recorrencia avancada, sem storage real, sem
notificacoes e sem integracoes sensiveis.

### Plano

- Adicionar testes RED para `nextMaintenanceDate` no resumo tecnico.
- Adicionar testes RED para relatorio imediato e reaberto exibirem proxima
  manutencao.
- Adicionar teste RED em `completeService` para gravar `proximaData` e criar
  compromisso mockado.
- Adicionar teste RED no shell preenchendo a data sem abrir calendario real.
- Incluir `nextMaintenanceDate` opcional em `ServiceDraft`.
- Exibir campo opcional de data na etapa de execucao.
- Propagar a data para revisao, conclusao, relatorio imediato, registro
  mockado, relatorio reaberto e recentes.
- Atualizar a matriz de paridade para refletir `Registrar proxima manutencao`
  como coberto.

### Anti-escopo

- Nao implementar calendario completo.
- Nao implementar recorrencia avancada, notificacoes, lembretes reais ou push.
- Nao alterar storage real nem schema persistido real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver prompt WhatsApp/PDF/fallback neste checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel`,
  `servicesHomeViewModel`, `appV2Actions` e `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `nextMaintenanceDate`.
- A etapa de execucao exibe data opcional de proxima manutencao.
- O campo nao bloqueia conclusao quando vazio.
- Quando preenchido, o registro mockado recebe `proximaData`.
- Quando preenchido, a store mockada cria um compromisso preventiva com
  `origem: "registro"` para o mesmo equipamento.
- Revisao, conclusao, relatorio imediato, relatorio reaberto e recentes exibem
  a proxima manutencao.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `nextMaintenanceDate` opcional.
- `ServiceStepExecution` passou a exibir campo opcional `Proxima manutencao`.
- A revisao e a conclusao exibem a data quando informada e fallback quando
  vazia.
- `RegistroServico` do app-v2 recebe `proximaData` no mock local quando a data
  e preenchida.
- `completeService` cria compromisso mockado `preventiva` com
  `origem: "registro"` para o mesmo equipamento.
- Relatorio imediato, relatorio reaberto e registros recentes preservam a
  proxima manutencao.
- Matriz de paridade atualizada: `Registrar proxima manutencao` passou de
  `parcial` para `coberto`; o prompt legado de proxima preventiva ficou como
  `parcial`, coberto por compromisso mockado sem prompt legado.
- Proximo checkpoint recomendado: validacao amigavel de equipamento e data do
  Registro de Servico no app-v2, sem alterar router, storage real, contratos
  legados ou areas sensiveis.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou com 5 testes porque `nextMaintenanceDate`, `proximaData`, compromisso
  mockado e input `service-next-maintenance` ainda nao existiam.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 5 arquivos e 51 testes antes da validacao completa.

---

## Historico - Custos opcionais

Implementar a proxima lacuna de paridade do Registro de Servico:

> Custos de pecas e mao de obra devem virar campos opcionais do Registro de
> Servico no app-v2, sem orcamento real, sem billing e sem storage real.

### Analise resumida

No v1, `custoPecas` e `custoMaoObra` entram no payload e no registro criado,
separados de `pecas`, `proxima` e das saidas comerciais. A capacidade
operacional a preservar neste checkpoint e registrar os valores informados pelo
tecnico no atendimento, sem transformar isso em orcamento real, cobranca,
estoque, billing ou persistencia real.

No v2 atual, o draft ja cobre tecnico, tipo, diagnostico, acoes, pecas e
status final, mas nao preserva custos. Isso mantem a linha `Registrar custos`
como regressao na matriz.

Ha 99% de certeza para implementar porque a mudanca fica restrita ao app-v2,
com campos opcionais no draft, registro mockado, view models, UI da etapa de
execucao e relatorios. Nao ha schema real, storage real, PDF/share, WhatsApp
real, billing ou orcamento real envolvidos.

### Plano

- Adicionar testes RED para custos opcionais no resumo tecnico do fluxo.
- Adicionar testes RED para relatorio imediato e reaberto exibirem custos.
- Adicionar testes RED para `completeService` gravar `custoPecas` e
  `custoMaoObra` no registro mockado.
- Adicionar teste RED no shell preenchendo custos sem exigir orcamento.
- Incluir `partsCost` e `laborCost` opcionais em `ServiceDraft`.
- Exibir campos opcionais na etapa de execucao.
- Propagar custos para revisao, conclusao, relatorio imediato, registro
  mockado, registros recentes e busca de relatorios.
- Atualizar a matriz de paridade para refletir `Registrar custos` como coberto.

### Anti-escopo

- Nao gerar orcamento real.
- Nao somar total comercial, estoque, itens de orcamento, billing ou cobranca.
- Nao alterar storage real nem schema persistido real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao mexer em Supabase/RLS, PDF/share, WhatsApp real, PMOC, assinatura,
  permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver proxima manutencao neste checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel`,
  `servicesHomeViewModel`, `servicesReportsViewModel`, `appV2Actions` e
  `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `npm run format:check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `partsCost` e `laborCost`.
- A etapa de execucao exibe custos opcionais de pecas e mao de obra.
- Os campos nao bloqueiam conclusao quando vazios.
- Revisao, conclusao, relatorio imediato, registro mockado, registros recentes
  e relatorio reaberto exibem custos quando informados.
- Os valores ficam isolados no mock app-v2 como `custoPecas` e
  `custoMaoObra`, sem orcamento real, billing ou storage real.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `partsCost` e `laborCost` opcionais.
- `ServiceStepExecution` passou a exibir campos opcionais `Custo de pecas` e
  `Custo de mao de obra`.
- A revisao e a conclusao exibem custos quando informados, sem bloquear o
  fluxo quando vazios.
- `RegistroServico` do app-v2 ganhou `custoPecas` e `custoMaoObra` opcionais
  no mock local.
- Relatorio imediato, relatorio reaberto, registros recentes e busca de
  relatorios preservam custos informados.
- O card de registro recente exibe pecas/custos quando existirem.
- Matriz de paridade atualizada: `Registrar custos` passou de `regressao` para
  `coberto`.
- Proximo checkpoint recomendado: proxima manutencao deve virar campo opcional
  do Registro de Servico no app-v2, conectando-se ao agendamento mockado ja
  existente, sem calendario completo, sem recorrencia avancada e sem storage
  real.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou com 6 testes porque `partsCost`, `laborCost`, `custoPecas`,
  `custoMaoObra` e os inputs `service-parts-cost` e `service-labor-cost` ainda
  nao existiam.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 53 testes.
- `npm run format`: passou.
- Revalidacao focada apos format:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 53 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `npm run format:check`: passou.
- `git diff --check`: passou.

---

## Historico - Pecas usadas

Implementar a proxima lacuna de paridade do Registro de Servico:

> Pecas usadas devem virar campo opcional do Registro de Servico no app-v2, sem
> custos, sem orcamento real e sem storage real.

### Analise resumida

No v1, `pecas` entra no payload e no registro criado, separado de `custoPecas`
e `custoMaoObra`. A capacidade operacional a preservar neste checkpoint e
registrar quais pecas foram usadas no atendimento, sem abrir captura de custo,
orcamento real ou storage real.

No v2 atual, o draft possui tecnico, diagnostico, acoes e status, mas nao tem
campo para pecas. Isso faz o relatorio e o registro mockado perderem uma
informacao operacional que ja existia no v1.

Ha 99% de certeza para implementar esse checkpoint porque a mudanca fica
isolada ao draft, view models, UI da etapa de execucao, registro mockado e
relatorio app-v2. O campo sera opcional e textual, sem custos, sem orcamento,
sem storage real, sem PDF/share e sem WhatsApp real.

### Plano

- Adicionar teste RED no view model para `partsUsed` opcional no draft, revisao
  e conclusao.
- Adicionar teste RED no relatorio imediato e reaberto para exibir pecas usadas.
- Adicionar teste RED na action para gravar `pecas` no registro mockado apenas
  quando houver texto.
- Adicionar teste RED no shell para preencher pecas na etapa de execucao e
  manter o valor na conclusao/relatorio.
- Incluir `partsUsed` no `ServiceDraft`.
- Exibir campo opcional `Pecas usadas` na etapa de execucao.
- Propagar o texto para revisao, conclusao, relatorio imediato, registro
  mockado, registros recentes e relatorio reaberto.
- Atualizar a matriz de paridade para refletir a cobertura de `Registrar pecas`.

### Anti-escopo

- Nao alterar storage real nem schema persistido real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver custos, orcamento real, proxima manutencao, estoque ou cadastro
  de pecas neste checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel`,
  `servicesHomeViewModel`, `servicesReportsViewModel`, `appV2Actions` e
  `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `partsUsed`.
- A etapa de execucao exibe campo opcional para pecas usadas.
- O campo nao bloqueia a conclusao quando vazio.
- Revisao, conclusao, relatorio imediato, registro mockado e relatorio reaberto
  exibem pecas usadas quando informadas.
- O valor fica isolado no mock app-v2 como `pecas` opcional, sem custos e sem
  storage real.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `partsUsed` opcional.
- `ServiceStepExecution` passou a exibir campo opcional `Pecas usadas`.
- A revisao e a conclusao exibem pecas usadas quando informadas, sem bloquear o
  fluxo quando vazio.
- `RegistroServico` do app-v2 ganhou `pecas` opcional no mock local.
- Relatorio imediato, relatorio reaberto, registros recentes e busca de
  relatorios preservam pecas usadas.
- Matriz de paridade atualizada: `Registrar pecas` passou de `regressao` para
  `coberto`.
- Proximo checkpoint recomendado: custos de pecas e mao de obra como campos
  opcionais do Registro de Servico no app-v2, sem orcamento real, sem billing e
  sem storage real.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou com 6 testes porque `partsUsed`, `pecas` e
  `textarea[name="service-parts-used"]` ainda nao existiam.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 47 testes.
- `npm run format`: passou.
- Revalidacao focada apos format:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 47 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.

---

## Historico - Outro customizado

Implementar a proxima lacuna de paridade do Registro de Servico:

> Campo `Outro` deve permitir descricao customizada no Registro de Servico do
> app-v2, sem alterar storage real e sem copiar UI legado.

### Analise resumida

No v1, `normalizeRegistroServiceTypeValue` valida `tipo: "Outro"` com
`tipoCustom`, exige texto nao vazio e limita a descricao customizada a 40
caracteres. O valor persistivel vira `Outro · descricao`.

No v2 atual, o tipo `outro` existe como opcao, mas sem descricao customizada. A
revisao, a conclusao, o relatorio e o historico mostram apenas `Servico`, o que
perde informacao operacional do v1.

Ha 99% de certeza para implementar esse checkpoint porque a mudanca fica
isolada no contrato mockado do app-v2, sem storage real, sem UI legado e sem
alterar rotas, PDF/share, WhatsApp, billing, Supabase ou permissoes.

### Plano

- Adicionar teste RED no view model para `customKind` no draft e label
  `Outro · descricao`.
- Adicionar teste RED no relatorio imediato e reaberto para exibir a descricao
  customizada.
- Adicionar teste RED no shell para selecionar `Outro`, preencher descricao e
  concluir sem perder o label.
- Incluir `customKind` no `ServiceDraft`.
- Exibir campo local de descricao apenas quando `Outro` estiver selecionado.
- Bloquear `Continuar` em `Tipo` quando `Outro` estiver vazio ou acima de 40
  caracteres.
- Persistir a descricao somente no mock app-v2 como `tipoDescricao` opcional do
  registro concluido.
- Atualizar a matriz de paridade para refletir a cobertura desse item.

### Anti-escopo

- Nao alterar storage real nem schema persistido real.
- Nao copiar UI, CSS, template ou shell legado.
- Nao tocar app legado.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Nao resolver custos, pecas ou proxima manutencao neste checkpoint.

### Validacao esperada

- TDD RED antes da implementacao.
- Testes focados de `serviceFlowViewModel`, `serviceReportViewModel`,
  `servicesHomeViewModel`, `servicesReportsViewModel`, `appV2Actions` e
  `AppV2Shell`.
- `npm run format`.
- `npm run build`.
- `npm run check`.
- `git diff --check`.

### Criterio de conclusao

- O draft de Registro de Servico carrega `customKind`.
- Selecionar `Outro` exibe campo de descricao customizada.
- O usuario nao avanca da etapa de tipo com `Outro` vazio ou acima de 40
  caracteres.
- Revisao, conclusao, relatorio imediato, registro mockado e relatorio reaberto
  exibem `Outro · descricao`.
- O tipo base continua `outro`; a descricao customizada fica isolada como dado
  mockado do app-v2.

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `customKind`.
- `ServiceStepType` passou a exibir `Descricao do tipo` quando `Outro` e
  selecionado.
- `Continuar` na etapa de tipo fica bloqueado para `Outro` vazio ou acima de 40
  caracteres.
- Revisao, conclusao, relatorio imediato, registro mockado, registros recentes e
  relatorios reabertos exibem `Outro · descricao`.
- `RegistroServico` do app-v2 ganhou `tipoDescricao` opcional para preservar o
  label customizado no mock local.
- Matriz de paridade atualizada: `Validar tipo de servico` passou de `parcial`
  para `coberto`.
- Proximo checkpoint recomendado: pecas usadas devem virar campo opcional do
  Registro de Servico no app-v2, sem custos, sem orcamento real e sem storage
  real.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `customKind`, `tipoDescricao`, label `Outro · descricao` e input
  `service-kind-custom` ainda nao existiam.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 41 testes.
- `npm run format`: passou.
- Revalidacao focada apos format:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 6 arquivos e 41 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.
- `npm run format:check`: passou dentro de `npm run check`.

---

## Historico - Tecnico como dado operacional

### Resultado deste checkpoint

- `ServiceDraft` passou a carregar `technician`.
- A etapa de execucao ganhou campo local `Tecnico responsavel`.
- O botao `Revisar` agora depende de tecnico, diagnostico e acoes preenchidos.
- A revisao, a conclusao, o relatorio imediato e a lista de registros recentes
  mostram o tecnico informado.
- `AppV2Shell` deixou de injetar `Tecnico app-v2` ao concluir o registro.
- Matriz de paridade atualizada: `Validar tecnico obrigatorio` passou de
  `regressao` para `coberto`.
- Proximo checkpoint recomendado: campo `Outro` deve permitir descricao
  customizada no Registro de Servico do app-v2, sem alterar storage real e sem
  copiar UI legado.

### Validacao executada

- TDD RED:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou porque `ServiceDraft` nao tinha `technician`, a revisao/conclusao nao
  exibiam tecnico, o relatorio imediato usava `Nao informado` e a UI nao tinha
  input `service-technician`.
- GREEN focado:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 4 arquivos e 22 testes.
- `npm run format`: passou.
- Revalidacao focada apos format:
  `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 4 arquivos e 22 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.
- `npm run format:check`: passou.
- `git diff --check`: passou.

---

## Historico - Paridade Registro de Servico

Iniciar checkpoint de paridade funcional v1 -> v2 para **Registro de Servico**.

Este checkpoint e documental. Nao implementa codigo porque a comparacao mostrou
lacunas amplas demais para uma alteracao segura com 99% de certeza.

### Capacidade v1 a preservar

O Registro de Servico v1 permite:

- abrir registro direto por equipamento;
- abrir registro sem equipamento e acionar escolha de equipamento;
- orientar criacao de equipamento quando nao ha equipamentos;
- validar equipamento, data, tipo, tecnico, status, proxima manutencao e custos;
- persistir observacoes, pecas, custos, cliente/local e assinatura/checklist
  quando aplicavel;
- atualizar status do equipamento depois do registro;
- adicionar tecnico novo quando necessario;
- manter historico automaticamente;
- oferecer pos-salvamento com PDF/WhatsApp/toast/fallback para relatorio;
- acionar prompt de proxima preventiva depois de salvar.

### Equivalente v2 atual

O app-v2 cobre parcialmente:

- abertura direta por equipamento via `startServiceFromEquipment`;
- fluxo por etapas com contexto, tipo, execucao, revisao e conclusao;
- conclusao mockada via `completeService`;
- atualizacao de status do equipamento;
- insercao de registro mockado no historico;
- preview simples de relatorio no estado concluido;
- subvisao `Servicos > Relatorios` em working tree atual.

### Lacunas

- Inicio sem equipamento ainda cai em fallback para primeiro equipamento mockado,
  nao em escolha operacional.
- Estado sem equipamentos nao orienta criacao antes do registro.
- Tecnico nao e campo do fluxo; o shell injeta valor fixo.
- `Outro` nao possui descricao customizada.
- `pecas`, `custoPecas`, `custoMaoObra` e `proxima` nao existem no draft v2.
- Agendamento de proximo compromisso existe como action, mas nao esta integrado
  ao fechamento do Registro de Servico.
- Pos-salvamento WhatsApp/PDF/fallback permanece area sensivel e nao deve ser
  misturado neste checkpoint.

### Melhoria permitida

- Criar matriz de paridade do fluxo.
- Classificar lacunas entre paridade obrigatoria, melhoria permitida, backlog e
  area sensivel.
- Recomendar o primeiro checkpoint pequeno de codigo sem tocar areas sensiveis.

### Anti-escopo

- Nao alterar `src/` neste checkpoint documental.
- Nao copiar UI, CSS, template, shell ou picker legado.
- Nao conectar storage real.
- Nao mexer em Supabase/RLS, billing, PDF/share, WhatsApp real, PMOC,
  assinatura, permissoes ou upload/storage.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.

### Arquivos afetados

- `docs/app-v2-goal.md`.
- `docs/rewrite/matriz-paridade-v1-v2.md`.

### Validacao esperada

- `npm run format:check`.
- `git diff --check`.

### Resultado deste checkpoint

- Implementado estado de escolha de equipamento para inicio sem contexto.
- Implementado estado vazio orientando ir para Equipamentos quando nao ha
  equipamentos.
- Abertura direta por equipamento foi preservada.
- Matriz de paridade atualizada: as capacidades "abrir registro sem equipamento
  com seletor/picker" e "orientar criacao de equipamento quando nao ha
  equipamentos" passaram de `regressao` para `coberto`.
- Proximo checkpoint recomendado: tecnico deve virar dado operacional do
  Registro de Servico no app-v2, sem storage real e sem lista global de
  tecnicos.

### Validacao executada

- TDD RED: `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou
  porque `Iniciar registro` ainda abria direto o primeiro equipamento em vez de
  mostrar escolha/estado vazio.
- GREEN: `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 1
  arquivo e 10 testes.
- `npm run format`: passou.
- `git diff --check`: passou.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.

---

## Historico - Servicos > Relatorios

### Checkpoint

Implementar `Servicos > Relatorios` como subvisao interna de `Servicos`,
derivada dos Registros de Servico concluidos, com KPIs, busca, lista
responsiva, preview reabrivel e impressao escopada ao documento do relatorio.

## Preservacao do estado anterior

O checkpoint anterior de relatorio simples de Registro de Servico foi preservado
por commit separado antes de iniciar esta implementacao.

- Branch: `codex/rewrite-zero-react-parallel`.
- Commit de preservacao: `7600c6b674a92e289dca384612d7d2ce3c1da9a5`
  (`feat(app-v2): add simple service report preview`).
- HEAD base deste checkpoint: `7600c6b674a92e289dca384612d7d2ce3c1da9a5`.
- Working tree apos preservacao: limpo.
- Working tree final: sujo apenas com este checkpoint de `Servicos >
Relatorios` e atualizacao deste documento.
- Validacoes conhecidas do checkpoint anterior: `npm run format`, `npm run
format:check`, `npm run typecheck`, testes app-v2, `npm run build`, `npm run
check`, `git diff --check`, isolamento textual e QA desktop/mobile passaram;
  `npm run check` manteve apenas warning conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.

## Escopo executado

- `Relatorios` criado como subvisao dentro de `Servicos`, sem aparecer na
  sidebar desktop nem na bottom nav mobile.
- Lista de relatorios derivada dos registros mockados concluidos ja existentes.
- KPIs implementados:
  - `Relatorios prontos`;
  - `Com atencao`;
  - `Pendentes`;
  - `Este mes`.
- Busca local implementada por atendimento/ID, cliente, equipamento e tipo de
  servico.
- Cada item possui acao `Ver relatorio`.
- `Ver relatorio` abre preview dedicado dentro de `Servicos > Relatorios` com
  `Voltar para relatorios`.
- Preview historico usa o mesmo modelo puro do relatorio simples e reabre
  relatorios a partir do registro concluido.
- Impressao escopada por wrapper `data-app-v2-print-scope="service-report"` e
  CSS de print local do app-v2.

## Anti-escopo preservado

- Relatorios nao virou aba principal global.
- Nao foi implementada agenda completa, calendario, recorrencia avancada ou
  edicao completa de compromissos.
- Nao foi implementado PMOC, Modelo B HVAC, Modelo C mensal, relatorio mensal,
  checklist regulatorio, assinatura real, WhatsApp/share real, download binario
  robusto, storage real, Supabase, billing, backend, rotas reais, autenticacao
  ou permissoes reais.
- Nao houve uso de `src/domain/pdf/shareReport.js` nem modulos legados de
  PDF/share.
- Nao houve mudanca em `package.json`, `package-lock.json`, Vite, ESLint ou
  TypeScript.

## Checklist de progresso atual

- [x] Preservar explicitamente o estado anterior por commit separado.
- [x] Criar modelo puro de `Servicos > Relatorios`.
- [x] Criar subvisao `Relatorios` dentro de `Servicos`.
- [x] Implementar KPIs aprovados.
- [x] Implementar busca local aprovada.
- [x] Implementar lista derivada de registros concluidos.
- [x] Implementar acao `Ver relatorio`.
- [x] Implementar preview dedicado com `Voltar para relatorios`.
- [x] Escopar impressao para imprimir somente o documento.
- [x] Adicionar ou ajustar testes focados.
- [x] Executar QA desktop/mobile.
- [x] Validar isolamento app-v2.
- [x] Atualizar este arquivo com resultado real.

## Decisoes tomadas

- A subnavegacao de `Servicos` fica limitada a `Registros` e `Relatorios` neste
  checkpoint; `Orcamentos` nao foi criado porque nao era necessario para a
  navegacao controlada.
- A lista de relatorios usa status local derivado:
  - status `warn`/`danger` vira `Atencao`;
  - registro sem observacoes vira `Pendente de revisao`;
  - demais registros viram `Pronto`.
- A impressao continua usando `window.print()`, mas o CSS de print esconde shell,
  botoes e navegacao, deixando visivel apenas o documento marcado.
- O agendamento simples de proximo compromisso permaneceu em backlog; nao era
  necessario para integrar relatorios.

## Arquivos alterados neste checkpoint

- `docs/app-v2-goal.md`.
- `src/app-v2/index.tsx`.
- `src/app-v2/service/ServiceReportPreview.tsx`.
- `src/app-v2/service/ServiceReportsHome.tsx`.
- `src/app-v2/service/ServiceReportsKpis.tsx`.
- `src/app-v2/service/ServiceReportsList.tsx`.
- `src/app-v2/service/ServicesHome.tsx`.
- `src/app-v2/service/ServicesSubViewNav.tsx`.
- `src/app-v2/service/serviceReportViewModel.test.ts`.
- `src/app-v2/service/serviceReportViewModel.ts`.
- `src/app-v2/service/servicesReportsViewModel.test.ts`.
- `src/app-v2/service/servicesReportsViewModel.ts`.
- `src/app-v2/shell/AppV2Shell.test.tsx`.
- `src/app-v2/styles/print.css`.

## Componentes e modelos criados ou ajustados

- Criado `servicesReportsViewModel.ts`: deriva itens, busca, fallback e KPIs.
- Ajustado `serviceReportViewModel.ts`: adiciona
  `buildServiceReportViewModelFromRecord` para reabrir relatorio historico.
- Criado `ServiceReportsHome.tsx`: subvisao de lista e preview dedicado.
- Criados `ServiceReportsKpis.tsx`, `ServiceReportsList.tsx` e
  `ServicesSubViewNav.tsx`.
- Ajustado `ServiceReportPreview.tsx`: marca area imprimivel e regioes ocultas
  no print.
- Ajustado `ServicesHome.tsx`: orquestra subvisoes `Registros` e `Relatorios`
  sem crescer o shell global.

## Testes adicionados ou ajustados

- `servicesReportsViewModel.test.ts`: cobre derivacao dos relatorios, KPIs,
  busca por ID/cliente/equipamento/tipo, fallback e ausencia de escopo
  regulatorio/legado.
- `serviceReportViewModel.test.ts`: cobre reabertura do relatorio a partir de
  registro concluido.
- `AppV2Shell.test.tsx`: cobre subvisao dentro de `Servicos`, ausencia de aba
  global, busca, preview dedicado, volta para lista, print scoped por atributo e
  regressao de iniciar/retomar/concluir servico.

## Comandos executados neste checkpoint

- `npm run format`: passou.
- `npm run format:check`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx`:
  passou com 3 arquivos e 16 testes.
- `npm run test -- src/app-v2`: passou com 12 arquivos e 51 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos do legado.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `sessionStorage`, `supabase`, `billing`, `WhatsApp`, `whatsapp`, `PMOC`,
  `pmoc`, `src/domain/pdf/shareReport.js` e `shareReport`: sem referencias
  proibidas apos ajuste do teste.

## QA desktop/mobile

- Desktop 1920x1080: `Relatorios` aparece como subvisao dentro de `Servicos`,
  nao aparece na navegacao global, KPIs ficam no topo, busca filtra por
  `camara`, lista fica legivel, `Ver relatorio` abre preview dedicado e nao ha
  overflow horizontal.
- Mobile 390x844: bottom nav permanece preservada, `Relatorios` continua apenas
  dentro de `Servicos`, KPIs/lista ficam acessiveis, `Ver relatorio` abre o
  preview e nao ha overflow horizontal.
- Ajuste feito durante QA: adicionado `tw-box-border` ao campo de busca para
  remover overflow horizontal mobile de 18px.
- Preview dedicado: contem cliente, equipamento, status e execucao; botao
  `Voltar para relatorios` funciona; acao de imprimir fica acessivel.
- Print scoped: o documento possui `data-app-v2-print-scope="service-report"` e
  a UI operacional possui `data-app-v2-print-hidden="true"`, evitando shell,
  nav, filtros, lista e botoes no print.
- A tela manteve densidade operacional, sem virar dashboard administrativo
  pesado.

## Resultado do checkpoint atual

Concluido em working tree sujo, sem commit final deste checkpoint. O app-v2 tem
agora uma subvisao operacional `Servicos > Relatorios`, local e testavel,
derivada dos Registros de Servico concluidos, com KPIs, busca, lista, preview
reabrivel e impressao escopada.

- Isolamento app-v2 confirmado.
- `Relatorios` nao virou aba principal global.
- PMOC, Modelo B HVAC e Modelo C mensal ficaram fora.
- WhatsApp/share real, storage real, Supabase, billing e rotas reais ficaram
  fora.
- PDF/share legado nao foi usado.
- Maior arquivo app-v2 apos a tarefa: `src/app-v2/equipment/equipmentViewModel.ts`
  com 328 linhas.

## Backlog final

- Evoluir detalhe de Cliente para servicos relacionados.
- Melhorar dados mockados de historico por cliente/equipamento.
- Implementar agendamento simples de proximo compromisso em checkpoint proprio,
  se ainda fizer sentido.
- Criar exportacao/download mais robusto em checkpoint proprio, se a previa
  imprimivel deixar de ser suficiente.
- Criar Modelo B - Registro Tecnico HVAC em checkpoint proprio.
- Criar Modelo C - Relatorio mensal em checkpoint proprio.
- PMOC contextual somente depois que Servicos, Relatorios, Clientes e PDF
  simples estiverem estaveis.

---

# Historico - Relatorio simples de Registro de Servico

## Checkpoint atual

Criar uma primeira versao simples, isolada e testavel de relatorio imprimivel
de Registro de Servico no app-v2, preservando o checkpoint visual recem
commitado.

## Preservacao do estado anterior

O checkpoint visual de Registro de Servico foi preservado por commit separado
antes deste checkpoint.

- Branch: `codex/rewrite-zero-react-parallel`.
- HEAD base deste checkpoint: `49425640b48e30a9729e84b81b2d4b2862178d93`.
- Commit preservado: `4942564 feat(app-v2): refine service registration flow`.
- Working tree inicial: limpo.
- Checkpoint preservado no commit: refinamento visual do Registro de Servico,
  primitivas internas do fluxo, estado disabled de `ActionButton`, testes do
  shell e atualizacao de `docs/app-v2-goal.md`.
- Validacoes conhecidas antes deste checkpoint: testes focados app-v2 com 10
  arquivos e 42 testes passando, build/check passando com warnings conhecidos,
  isolamento app-v2 validado e QA desktop/mobile sem overflow.

## Escopo permitido do checkpoint atual

- Criar modelo puro para relatorio simples de Registro de Servico.
- Adicionar acao de relatorio somente no fluxo concluido.
- Renderizar uma previa imprimivel dentro do app-v2.
- Usar `window.print()` como mecanismo simples de salvar/imprimir pelo browser.
- Reusar primitivas visuais existentes do app-v2.
- Adicionar testes de modelo e comportamento observavel no shell.
- Validar QA desktop/mobile da previa.

## Anti-escopo do checkpoint atual

- Relatorio regulatorio, checklist normativo, WhatsApp, compartilhamento real,
  billing, Supabase, storage real, rotas reais, autenticacao, permissoes reais,
  backend, e-mail, assinatura digital, anexos, fotos reais ou nova area
  funcional.
- Imports do legado, `src/domain/pdf/shareReport.js` ou qualquer modulo legado
  de exportacao/compartilhamento.
- Mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.

## Checklist de progresso atual

- [x] Preservar checkpoint visual anterior por commit separado.
- [x] Registrar plano real do checkpoint.
- [x] Criar modelo puro de relatorio.
- [x] Criar previa imprimivel no fluxo concluido.
- [x] Adicionar ou ajustar testes focados.
- [x] Executar QA desktop/mobile.
- [x] Validar isolamento do app-v2.
- [x] Validar limite de 1000 linhas por arquivo.
- [x] Executar comandos de validacao.
- [x] Registrar resultado final.

## Decisoes tomadas no checkpoint atual

- Estrategia escolhida: previa imprimivel no app-v2 com `window.print()`.
- Nao sera implementado download binario neste checkpoint.
- O relatorio nasce do estado concluido do fluxo e usa apenas draft + mock
  atual.
- O modelo de relatorio fica puro e testavel; a UI apenas renderiza e dispara
  impressao.

## Arquivos alterados no checkpoint atual

- `docs/app-v2-goal.md`.
- `src/app-v2/service/ServiceDone.tsx`.
- `src/app-v2/service/ServiceFlow.tsx`.
- `src/app-v2/service/ServiceReportPreview.tsx`.
- `src/app-v2/service/serviceFlowViewModel.test.ts`.
- `src/app-v2/service/serviceFlowViewModel.ts`.
- `src/app-v2/service/serviceReportViewModel.test.ts`.
- `src/app-v2/service/serviceReportViewModel.ts`.
- `src/app-v2/shell/AppV2Shell.test.tsx`.

## Testes adicionados ou ajustados no checkpoint atual

- `serviceReportViewModel.test.ts`: cobre montagem do relatorio simples com
  cabecalho, cliente, equipamento, servico, execucao, assinaturas visuais,
  fallback e ausencia de blocos regulatorios/PMOC.
- `serviceFlowViewModel.test.ts`: atualizado porque `Relatorio` deixou de ser
  saida indisponivel e virou acao real no estado concluido.
- `AppV2Shell.test.tsx`: cobre ausencia da acao antes da conclusao, abertura da
  previa no estado concluido, assinaturas visuais, ausencia de PMOC e chamada de
  `window.print()`.

## Comandos executados no checkpoint atual

- `npm run format`: passou.
- `npm run format:check`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx`: RED falhou pelo titulo/blocos/assinaturas ainda ausentes; GREEN passou com 2 arquivos e 10 testes.
- `npm run test -- src/app-v2`: passou com 11 arquivos e 45 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos do legado.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `sessionStorage`, `supabase`, `billing`, `WhatsApp`, `whatsapp`, `PMOC`,
  `pmoc`, `src/domain/pdf/shareReport.js` e `shareReport`: sem referencias
  proibidas.
- Limite de tamanho: maior arquivo em `src/app-v2` e
  `equipmentViewModel.ts` com 328 linhas.
- QA Browser desktop 1920x1080 e mobile 390x844 no preview app-v2: passou sem
  overflow horizontal.

## Resultado do checkpoint atual

Concluido sem commit final nesta rodada. O app-v2 agora tem uma base simples de
relatorio de Registro de Servico por previa imprimivel, sem download binario,
sem import do legado e sem integracoes reais.

### Estrategia escolhida

- Modelo puro em `serviceReportViewModel.ts` com blocos de cabecalho, cliente,
  equipamento, servico, execucao e assinaturas visuais.
- Previa visual em `ServiceReportPreview.tsx`.
- Acao `Ver relatorio` exibida somente no estado concluido.
- Impressao/salvamento via browser com `window.print()`.

### QA desktop/mobile

- Desktop 1920x1080: a acao aparece depois da conclusao, a previa renderiza
  cliente/equipamento/status e nao ha overflow horizontal. Sidebar desktop
  visivel; bottom nav oculto. A acao de imprimir/salvar esta acessivel.
- Mobile 390x844: a previa e legivel, a acao de imprimir permanece acessivel e
  nao ha overflow horizontal. Bottom nav visivel; sidebar oculta.
- O relatorio contem identificacao, data, status, tipo, cliente, equipamento,
  local, diagnostico e acoes executadas.
- O relatorio nao mostra PMOC e nao aciona WhatsApp/share.

### Backlog final do checkpoint atual

- Evoluir detalhe de Cliente para servicos relacionados.
- Melhorar dados mockados de historico por cliente/equipamento.
- Criar etapa futura para exportacao/download mais robusto, se a previa
  imprimivel deixar de ser suficiente.
- Modulo regulatorio/contextual apenas depois que Registro de Servico, Clientes
  e relatorio simples estiverem estabilizados.

---

# Historico - Registro de Servico visual

## Checkpoint atual

Refinar visualmente o fluxo de Registro de Servico do app-v2, preservando o
contrato visual minimo, Clientes dentro de Equipamentos e o isolamento do
app-v2.

## Preservacao do estado anterior

O estado anterior foi preservado por commit antes deste checkpoint.

- Branch: `codex/rewrite-zero-react-parallel`.
- HEAD base deste checkpoint: `8181e6446362e0fce9247078efbe91f0c8ebca93`.
- Working tree inicial: limpo.
- Checkpoints preservados no commit: contrato visual minimo, Clientes dentro de
  Equipamentos, `docs/app-v2-goal.md` e `CONTEXT.md`.
- Validacoes conhecidas antes deste checkpoint: testes focados app-v2 com 10
  arquivos e 42 testes passando, build/check passando com warnings conhecidos,
  isolamento app-v2 validado e QA desktop/mobile sem overflow.

## Escopo permitido do checkpoint atual

- Refinar a apresentacao visual do Registro de Servico existente.
- Melhorar hierarquia de titulo, status, progresso, contexto de equipamento,
  contexto de cliente/local, acoes e resumo.
- Reusar `PageShell`, `SectionCard`, `StatusBadge`, `ListRow` e `ActionButton`.
- Criar componentes internos pequenos em `src/app-v2/service/` apenas para
  organizar o fluxo.
- Ajustar `serviceFlowViewModel` somente para dados derivados visuais ja
  existentes.
- Adicionar ou ajustar testes observaveis do Registro de Servico.
- Executar QA desktop/mobile do fluxo.

## Anti-escopo do checkpoint atual

- PMOC, PDF/share, WhatsApp, billing, Supabase, storage real, rotas reais,
  autenticacao, permissoes reais ou backend.
- Persistencia real ou criacao real de servico fora do mock atual.
- Edicao avancada de servico, cliente ou equipamento.
- Nova aba principal ou nova area funcional.
- Imports do legado ou mudancas no app legado.
- Mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.

## Checklist de progresso atual

- [x] Registrar estado inicial preservado por commit.
- [x] Refinar componentes visuais do Registro de Servico.
- [x] Ajustar view model apenas se necessario para contexto visual.
- [x] Adicionar ou ajustar testes focados.
- [x] Executar QA desktop/mobile.
- [x] Validar isolamento do app-v2.
- [x] Validar limite de 1000 linhas por arquivo.
- [x] Executar comandos de validacao.
- [x] Registrar resultado final.

## Decisoes tomadas no checkpoint atual

- O fluxo continua com as mesmas etapas funcionais: contexto, tipo, execucao,
  revisao e conclusao.
- O refinamento e visual/estrutural; nao cria PMOC, PDF, WhatsApp ou
  persistencia real.
- O contexto de cliente aparece apenas quando derivado do `clienteId` ja
  existente no mock.
- `serviceFlowViewModel` nao precisou de alteracao; os dados derivados atuais
  foram suficientes para o refinamento.
- As saidas futuras do resumo permanecem indisponiveis/desabilitadas; nao foi
  implementado PDF, WhatsApp, orcamento ou agenda real.

## Arquivos alterados no checkpoint atual

- `docs/app-v2-goal.md`.
- `src/app-v2/service/ServiceDone.tsx`.
- `src/app-v2/service/ServiceFlow.tsx`.
- `src/app-v2/service/ServiceFlowPrimitives.tsx`.
- `src/app-v2/service/ServiceStepContext.tsx`.
- `src/app-v2/service/ServiceStepExecution.tsx`.
- `src/app-v2/service/ServiceStepReview.tsx`.
- `src/app-v2/service/ServiceStepType.tsx`.
- `src/app-v2/shell/AppV2Shell.test.tsx`.
- `src/app-v2/ui/primitives.tsx`.

## Testes adicionados ou ajustados no checkpoint atual

- `AppV2Shell.test.tsx`: reforcou cobertura observavel do Registro de Servico
  validando abertura do fluxo, contexto de equipamento/cliente, estado em
  andamento, resumo e conclusao.
- Testes focados do app-v2 preservados: 10 arquivos, 42 testes passando.

## Comandos executados no checkpoint atual

- `npm run format`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2MockStore.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx`: passou com 10 arquivos e 42 testes.
- `npm run format:check`: passou.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `supabase`, `billing`, `PDF`, `pdf`, `share`, `WhatsApp`, `whatsapp`,
  `PMOC` e `pmoc`: sem referencias proibidas.
- Limite de tamanho: maior arquivo em `src/app-v2` e
  `equipmentViewModel.ts` com 328 linhas.
- QA Playwright desktop 1920x1080 e mobile 390x844 no preview app-v2: passou
  sem overflow horizontal no inicio, contexto do fluxo e resumo concluido.

## Resultado do checkpoint atual

Concluido. O Registro de Servico ficou visualmente mais organizado sem mudar a
regra de negocio: cabecalho do fluxo, progresso, contexto do equipamento,
contexto do cliente/local, etapas, acoes e resumo final foram refinados com as
primitivas do app-v2.

### QA desktop/mobile

- Desktop 1920x1080: fluxo abriu a partir de `Iniciar servico`, exibiu
  equipamento/cliente, manteve acoes acessiveis e concluiu sem overflow
  horizontal.
- Mobile 390x844: bottom nav permaneceu acessivel, o fluxo concluiu sem
  overflow horizontal e as acoes principais continuaram disponiveis.
- Estados de iniciar, executar, revisar e concluir ficaram claros visualmente.
- Contexto de equipamento e cliente/local ficou compreensivel sem criar
  integracao nova.

### Backlog final do checkpoint atual

- PDF simples de Registro de Servico em checkpoint proprio, ainda sem PMOC.
- Evoluir detalhe de Cliente para servicos relacionados em checkpoint proprio.
- PMOC contextual somente depois que app-v2, Registro de Servico e PDFs simples
  estiverem estabilizados.

---

# Historico - Clientes em Equipamentos

## Checkpoint atual

Criar a subvisao de Clientes dentro da area Equipamentos no app-v2,
preservando o baseline visual aprovado e sem transformar Clientes em aba
principal global.

## Preservacao do checkpoint anterior

O checkpoint visual/QA anterior permanece nao commitado neste working tree. A
tarefa atual sera aplicada explicitamente sobre essa base, sem misturar
silenciosamente baseline visual e nova subvisao. Um commit separado podera ser
feito depois se o usuario autorizar.

## Escopo permitido do checkpoint atual

- Criar Clientes como subvisao forte dentro de Equipamentos.
- Renderizar lista de clientes mockados usando contratos e dados existentes.
- Exibir detalhe de cliente quando isso couber sem fluxo complexo.
- Mostrar equipamentos vinculados ao cliente quando houver `clienteId` no mock.
- Alternar entre as visoes Equipamentos e Clientes sem sair da area
  Equipamentos.
- Reusar `PageShell`, `SectionCard`, `StatusBadge`, `ListRow` e `ActionButton`.
- Adicionar view model pequeno dentro de `src/app-v2/`.
- Adicionar testes observaveis da subvisao Clientes e preservar testes atuais.

## Anti-escopo do checkpoint atual

- Nova aba principal global de Clientes.
- Storage real, Supabase, PDF/share, WhatsApp, billing, PMOC, rotas reais,
  persistencia real, autenticacao ou permissoes reais.
- Criacao, edicao avancada ou exclusao real de cliente.
- Refinamento visual dedicado do fluxo de Registro de Servico.
- Mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Mudancas no app legado.

## Checklist de progresso atual

- [x] Registrar preservacao do checkpoint visual anterior.
- [x] Resolver decisao de navegacao Clientes com o usuario.
- [x] Implementar subvisao Clientes dentro de Equipamentos.
- [x] Adicionar testes focados da subvisao.
- [x] Atualizar QA desktop/mobile.
- [x] Validar isolamento do app-v2.
- [x] Validar limite de 1000 linhas por arquivo.
- [x] Executar comandos de validacao.
- [x] Registrar resultado final.

## Decisoes tomadas no checkpoint atual

- Clientes nao vira quinta area principal do app-v2.
- Clientes sera uma subvisao forte dentro de Equipamentos, com detalhe proprio.
- A area Equipamentos representa a base instalada/ativos atendidos; Clientes
  aparece como visao irma de Equipamentos dentro dessa area.
- O detalhe futuro de Cliente podera concentrar dados do cliente, equipamentos
  vinculados, servicos relacionados e PMOC futuro, sem implementar PMOC neste
  checkpoint.
- O vinculo operacional continua nascendo do Equipamento para o Cliente.

## Arquivos alterados no checkpoint atual

- `CONTEXT.md`.
- `docs/app-v2-goal.md`.
- `src/app-v2/equipment/ClientDetail.tsx`.
- `src/app-v2/equipment/ClientList.tsx`.
- `src/app-v2/equipment/EquipmentDetail.tsx`.
- `src/app-v2/equipment/EquipmentList.tsx`.
- `src/app-v2/equipment/EquipmentSubViewNav.tsx`.
- `src/app-v2/equipment/equipmentClientsViewModel.test.ts`.
- `src/app-v2/equipment/equipmentClientsViewModel.ts`.
- `src/app-v2/equipment/equipmentViewModel.ts`.
- `src/app-v2/shell/AppV2Shell.test.tsx`.
- `src/app-v2/shell/AppV2Shell.tsx`.

O working tree tambem preserva mudancas nao commitadas do checkpoint visual
anterior, registradas no historico abaixo.

## Testes adicionados no checkpoint atual

- `equipmentClientsViewModel.test.ts`: lista de clientes, contagem/status
  agregados e detalhe com equipamentos vinculados por `clienteId`.
- `AppV2Shell.test.tsx`: acesso a Clientes por Equipamentos, retorno para
  Equipamentos, abertura de detalhe de Cliente, equipamentos vinculados e
  garantia de que Clientes nao aparece como area principal.

## Comandos executados no checkpoint atual

- `npm run format`: passou.
- `npm run format:check`: passou.
- `npm run typecheck`: passou.
- `npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2MockStore.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx`: passou com 10 arquivos e 42 testes.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `supabase`, `billing`, `PDF`, `pdf`, `share`, `WhatsApp`, `whatsapp`, `PMOC`
  e `pmoc`: sem referencias proibidas.
- Limite de tamanho: maior arquivo em `src/app-v2` e
  `equipmentViewModel.ts` com 382 linhas.
- QA Playwright desktop 1920x1080 e mobile 390x844: passou sem overflow
  horizontal.

## Resultado do checkpoint atual

Concluido. Clientes foi criada como subvisao forte dentro de Equipamentos, sem
nova aba principal global, usando apenas dados mockados e contratos existentes.
A lista de clientes renderiza a partir de `clientes`, o detalhe de cliente abre
sem fluxo complexo e os equipamentos vinculados aparecem pela relacao
`clienteId`.

### QA desktop/mobile

- Desktop: sidebar fixa permanece visivel, bottom nav fica oculta, Clientes abre
  dentro de Equipamentos e o detalhe do cliente nao gera overflow horizontal.
- Mobile: sidebar fica oculta, bottom nav permanece fixa, Clientes abre dentro
  de Equipamentos e o detalhe do cliente nao gera overflow horizontal.
- Clientes nao aparece como quinta area principal.
- Estados vazios/fallbacks simples foram mantidos para lista de clientes e
  equipamentos vinculados, sem criar CRUD ou integracao real.

### Backlog final do checkpoint atual

- Refinar visualmente Registro de Servico em checkpoint dedicado.
- Evoluir, em etapa futura, o detalhe de Cliente para incluir servicos
  relacionados e PMOC contextual quando o modulo PMOC for escopo permitido.
- Avaliar se a area Equipamentos deve ganhar componente controlador proprio
  quando houver mais subvisoes, para reduzir estado no shell.
- Manter storage real, Supabase, PDF/share, WhatsApp, billing, PMOC e rotas
  reais fora do app-v2 ate etapas dedicadas.

---

# Historico - QA baseline e contrato visual minimo

## Objetivo atual

Fechar a primeira passada visual do app-v2 antes de qualquer feature nova,
criando uma fundacao visual reutilizavel, validando shell, navegacao e fluxos
principais, e registrando o que fica aprovado ou em backlog.

## Escopo permitido

- QA baseline de Home, Equipamentos, Servicos e Conta em desktop e mobile.
- Criar primitivas visuais minimas dentro de `src/app-v2/`.
- Reduzir repeticao visual clara de classes Tailwind.
- Adicionar smoke tests observaveis do shell e dos fluxos principais existentes.
- Corrigir apenas problemas pequenos de consistencia visual, responsividade ou
  uso das primitivas criadas neste checkpoint.
- Validar isolamento do app-v2 contra legado e integracoes reais.

## Anti-escopo

- Clientes como subvisao funcional nova.
- Storage real, Supabase, PDF/share, WhatsApp, billing, PMOC ou rotas reais.
- Mudancas em `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript.
- Refatoracao ampla do shell, dominio, store ou view models.
- Design system completo.
- Mudancas no app legado.

## Checklist de progresso

- [x] Registrar plano efetivo do checkpoint.
- [x] Criar contrato visual minimo.
- [x] Aplicar primitivas onde reduzir repeticao sem mudar fluxo.
- [x] Adicionar smoke tests do shell.
- [x] Validar testes focados do app-v2.
- [x] Validar isolamento por busca textual.
- [x] Validar limite de 1000 linhas por arquivo.
- [x] Executar QA baseline desktop/mobile.
- [x] Registrar resultado final.

## Decisoes tomadas

- As primitivas devem viver dentro de `src/app-v2/ui/`.
- O checkpoint usa Tailwind com prefixo `tw-`, mantendo os tokens existentes.
- As primitivas serao pequenas e aplicadas somente onde diminuirem repeticao
  obvia.
- A visao de Clientes em Equipamentos permanece backlog.
- `PageShell`, `SectionCard`, `StatusBadge`, `ListRow` e `ActionButton` formam
  o contrato visual minimo deste checkpoint.
- O shell permaneceu como orquestrador do estado mockado; nao houve extracao
  adicional porque o arquivo continuou legivel e abaixo do limite.

## Itens concluidos

- Plano aprovado pelo usuario.
- Registro inicial do goal criado.
- Primitivas visuais minimas criadas em `src/app-v2/ui/primitives.tsx`.
- Home, Equipamentos, Servicos e Conta passaram a usar primitivas onde havia
  repeticao clara de pagina, card, badge, lista ou botao.
- Smoke tests do shell ampliados para navegacao principal, sidebar/bottom nav,
  abertura de detalhe, inicio, retomada e conclusao de servico.
- QA baseline executado para Home, Equipamentos, detalhe de Equipamento,
  Servicos e Conta em desktop e mobile.

## Backlog final

- Criar a subvisao de Clientes dentro de Equipamentos em checkpoint futuro.
- Revisar a experiencia do fluxo de Registro de Servico com o mesmo contrato
  visual, sem mudar regras de negocio.
- Avaliar, em etapa propria, se formatos repetidos de data/tom em view models
  justificam utilitario pequeno.
- Manter storage real, Supabase, PDF/share, WhatsApp, billing, PMOC e rotas
  reais fora do app-v2 ate etapas dedicadas.
- Warnings Vite/chunk e o warning conhecido em `src/domain/pdf/shareReport.js`
  permanecem backlog controlado fora deste checkpoint.

## Comandos de teste executados

- `npm run format`: passou.
- `npm run test -- src/app-v2/domain/homePriority.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/navigation/useAutoHideNav.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/data/appV2MockStore.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx`: passou com 9 arquivos e 38 testes.
- `npm run typecheck`: passou.
- `git diff --check`: passou.
- Busca textual em `src/app-v2` para `src/ui`, `src/core`, `localStorage`,
  `supabase`, `billing`, `PDF`, `pdf`, `share`, `WhatsApp`, `whatsapp`, `PMOC`
  e `pmoc`: sem referencias proibidas.
- Limite de tamanho: maior arquivo em `src/app-v2` continua
  `equipmentViewModel.ts` com 380 linhas.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- QA browser/app-v2: passou em desktop 1920x1080 e mobile 390x844, sem overflow
  horizontal, com sidebar desktop fixa de 248px e bottom nav apenas mobile.

## Resultado final

Concluido. A primeira passada visual do app-v2 fica fechada como baseline
aprovado para Home, Equipamentos, Servicos e Conta. O contrato visual minimo foi
criado e aplicado sem feature nova, sem mudanca em contratos de dominio, sem
integracao real e sem imports proibidos para legado ou areas sensiveis.

## QA baseline

### Aprovado

- Home: hierarquia operacional, proxima acao, fila curta e cards laterais
  mantidos sem overflow.
- Equipamentos: lista, controles existentes e detalhe continuam operacionais em
  desktop e mobile.
- Servicos: central, estado vazio, servico em andamento, retomada e conclusao
  permanecem funcionando.
- Conta: placeholder visual mantido sem acoes novas.
- Shell: sidebar desktop de 248px e bottom nav mobile preservados.

### Ajustado

- Criadas primitivas visuais minimas para reduzir repeticao de Tailwind.
- Aplicados `PageShell`, `SectionCard`, `StatusBadge`, `ListRow` e
  `ActionButton` em telas e cards existentes.
- Smoke tests do shell ampliados para o baseline de navegacao e fluxo.

### Riscos remanescentes

- Registro de Servico ainda usa parte dos cards locais antigos; fica para
  refinamento visual dedicado.
- View models ainda concentram formatacao de data/tom, mas sem duplicacao
  suficiente para justificar refactor neste checkpoint.
- Store e acoes continuam mockadas por design; nao representam persistencia
  real.
