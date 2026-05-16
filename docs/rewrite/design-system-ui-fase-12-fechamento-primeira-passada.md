# Design System/UI fase 12 - fechamento da primeira passada visual

Data: 2026-05-16

## Objetivo

Fechar documentalmente a primeira passada visual do app-v2 apos os ciclos de
Home Hoje, Equipamentos, Servicos e Conta, consolidando evidencias, criterios
aceitos, limites do que nao foi coberto e gates para nao reabrir visual sem novo
achado objetivo.

## Escopo

- Consolidar as fases 1 a 11 de Design System/UI.
- Registrar as evidencias de QA visual existentes.
- Separar fechamento visual local de paridade funcional completa.
- Definir criterios para reabrir visual no futuro.
- Definir o proximo checkpoint seguro apos a primeira passada visual.

## Fora de escopo

- Alterar `src/`, runtime, CSS, tokens, primitives ou componentes.
- Rodar novo QA visual em browser.
- Reabrir Home Hoje, Equipamentos, Servicos ou Conta sem novo achado objetivo.
- Iniciar PMOC.
- Iniciar Supabase/RLS, migrations, storage real ou persistencia real.
- Iniciar billing real, assinatura, quotas, pricing ou feature paga.
- Iniciar PDF/share real ou WhatsApp real.
- Iniciar perfil real, security hardening, React Doctor ou redesign amplo.

## Evidencias consolidadas

| Fase | Area         | Evidencia principal                                        | Resultado aceito                                           |
| ---- | ------------ | ---------------------------------------------------------- | ---------------------------------------------------------- |
| 1    | Regras UI    | `design-system-ui-fase-1-regras-app-v2.md`                 | Regras documentais e bloqueios contra erros do v1.         |
| 2    | Home Hoje    | `design-system-ui-fase-2-home-hoje-checklist.md`           | Area unica escolhida e checklist antes de codigo.          |
| 3    | Home Hoje    | `qa-design-system-ui-fase-3-home-hoje/`                    | QA inicial, achado local e ajuste pequeno em Home.         |
| 4    | Home Hoje    | `qa-design-system-ui-fase-4-home-hoje/`                    | Home encerrada no recorte visual local.                    |
| 5    | Equipamentos | `design-system-ui-fase-5-equipamentos-auditoria-visual.md` | Riscos visuais mapeados antes de runtime.                  |
| 6    | Equipamentos | `qa-design-system-ui-fase-6-equipamentos/`                 | QA real com achado controlado no rail de filtros mobile.   |
| 7    | Equipamentos | `qa-design-system-ui-fase-7-equipamentos-filtros/`         | Ajuste pequeno e recaptura sem overflow/offscreen.         |
| 8    | Servicos     | `design-system-ui-fase-8-servicos-auditoria-visual.md`     | Riscos de Registros, Relatorios e Orcamentos mapeados.     |
| 9    | Servicos     | `qa-design-system-ui-fase-9-servicos/`                     | QA real, ajuste pequeno em Registros e recaptura completa. |
| 10   | Conta        | `design-system-ui-fase-10-conta-auditoria-visual.md`       | Riscos de Conta mapeados antes de QA real.                 |
| 11   | Conta        | `qa-design-system-ui-fase-11-conta/`                       | QA real sem achado visual bloqueante.                      |

## Evidencias de screenshots

| Pasta de QA                                          | Screenshots |
| ---------------------------------------------------- | ----------- |
| `qa-design-system-ui-fase-3-home-hoje/`              | 6           |
| `qa-design-system-ui-fase-4-home-hoje/`              | 6           |
| `qa-design-system-ui-fase-6-equipamentos/`           | 12          |
| `qa-design-system-ui-fase-7-equipamentos-filtros/`   | 12          |
| `qa-design-system-ui-fase-9-servicos/`               | 27          |
| `qa-design-system-ui-fase-11-conta/`                 | 13          |
| **Total da primeira passada visual com screenshots** | **76**      |

As evidencias cobrem mobile 390, desktop 1366 e desktop 1920 nos ciclos que
exigiram QA visual real.

## Criterios aceitos

A primeira passada visual fica aceita para o recorte local porque:

- cada area foi tratada em checkpoint proprio;
- auditorias documentais vieram antes de QA ou ajuste visual;
- ajustes de runtime so ocorreram quando havia achado objetivo;
- Home Hoje, Equipamentos, Servicos e Conta ficaram sem overflow horizontal de
  pagina nos cenarios finais registrados;
- as recapturas pos-ajuste ficaram sem elementos visiveis fora da viewport nos
  cenarios medidos;
- areas sensiveis foram mantidas fora do ciclo visual;
- PMOC foi explicitamente excluido e deve ser refeito em etapa propria;
- Supabase/RLS e migrations foram preservados para etapa propria futura, com
  possibilidade de refazer migrations se necessario.

## Limites do fechamento

Este fechamento nao significa UX v2 100% migrada.

Ele significa apenas que a primeira passada visual controlada das areas
principais do app-v2 esta encerrada no recorte local documentado.

Continuam fora:

- paridade funcional completa;
- storage real e persistencia real;
- Supabase/RLS, permissoes e migrations;
- PMOC;
- billing real, assinatura, quotas e pricing;
- PDF/share real;
- WhatsApp real;
- perfil real;
- security hardening;
- React Doctor;
- redesign amplo.

A estimativa funcional geral permanece **76%** ate nova auditoria funcional.

## Gates para reabrir visual

Nao reabrir Home Hoje, Equipamentos, Servicos ou Conta por preferencia estetica
isolada. Um novo checkpoint visual deve existir somente se houver pelo menos uma
das condicoes abaixo:

- screenshot ou metrica mostrando overflow horizontal;
- elemento visivel fora da viewport;
- texto cobrindo botao, badge, campo ou conteudo seguinte;
- foco de teclado invisivel em controle relevante;
- estado vazio confundido com erro ou base real vazia;
- evidencia de que a UI sugere integracao real que ainda nao existe;
- novo fluxo funcional local que altere a densidade ou hierarquia da area.

Se a condicao for atendida, o checkpoint deve declarar area unica, componentes
afetados, estados de validacao e anti-escopo antes de alterar runtime.

## Decisao

A primeira passada visual do app-v2 fica fechada para Home Hoje, Equipamentos,
Servicos e Conta no recorte local.

O trabalho nao deve continuar repetindo QA visual sem novo achado objetivo. O
proximo passo deve voltar para a matriz funcional e escolher a proxima lacuna
nao sensivel por evidencia.

## Proximo checkpoint recomendado

Reauditoria funcional documental pos-fechamento visual: revisar a matriz UX
v1-v2 e escolher uma unica proxima lacuna nao sensivel entre Historico/filtros,
Relatorios locais, Orcamentos mock/action e Clientes filtros/relatorio local,
sem implementar runtime nesta etapa e mantendo PMOC, Supabase/RLS, migrations,
storage real, billing real, assinatura, PDF/share, WhatsApp, perfil real,
security hardening e React Doctor em etapas proprias.

## Validacao

- `npm run format:check` falhou antes da formatacao em
  `docs/rewrite/design-system-ui-fase-12-fechamento-primeira-passada.md`.
- `git diff --check` passou antes da formatacao.
- `npm run format` passou e formatou o novo relatorio.
- `npm run format:check` passou apos a formatacao.
- `git diff --check` passou apos a formatacao.
