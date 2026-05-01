# Status final da migracao visual React + Tailwind

## 1. Marco de fechamento

- Data do fechamento: 2026-05-01.
- Branch analisada: `main`.
- Commit base observado: `757cd5d` (`757cd5d (HEAD -> main, origin/main, origin/HEAD) Enforce repo validation workflow`).
- Status: migracao visual principal concluida.

Este fechamento nao significa que todo o codigo legado foi removido. Significa que as superficies visuais principais das telas operacionais ja sao renderizadas por ilhas React controladas, com Tailwind disponivel de forma isolada (`tw-`, `preflight: false`) e com adapters legados preservando fluxos externos.

## 2. React concluido

| Area         | Roots/contratos React atuais                                                                                                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alertas      | `#view-alertas`                                                                                                                                                                                                                               |
| Orcamentos   | `#view-orcamentos`                                                                                                                                                                                                                            |
| Clientes     | `#clientes-root`                                                                                                                                                                                                                              |
| Equipamentos | `#equip-hero`, portals para `#equip-filters` e `#equip-context-chip`, lista em `#lista-equip`                                                                                                                                                 |
| Dashboard    | `#dash-hero`, `#dash-kpis-root`, `#dash-next-action-card`, `#dash-last-service`, `#dash-month-section`, `#dash-readonly-blocks-root`, `#dash-pro-ops-row`, `#dash-pro-draft-root`, `#dash-empty`, `#dash-onboarding`, `#dash-overflow-banner` |
| Historico    | `#hist-filters-root`, `#timeline`                                                                                                                                                                                                             |
| Relatorio    | `#rel-hero`, `#rel-controls-root`, `#relatorio-corpo`                                                                                                                                                                                         |
| Registro     | `#registro-header-root`, `#r-checklist-body`, `#registro-photos-root`, `#registro-signature-hint`                                                                                                                                             |

Cobertura principal existente:

- Testes de island React para roots migrados.
- Testes de adapter/render legado onde o contrato historico ainda importa.
- Testes de handlers legados acionados por DOM emitido por React.
- E2E de lifecycle em `e2e/specs/react-islands-lifecycle.spec.js`.
- E2E leve para fluxos criticos selecionados de Registro e fotos.

## 3. Legado deliberado

Estes blocos continuam fora de React por decisao de arquitetura e risco:

- Adapters em `src/ui/views/*`: leem estado, chamam view models, resolvem plano, montam ilhas e preservam lifecycle.
- Roteador/lifecycle em `src/ui/controller/routes.js`.
- Handlers globais por `data-action`, `data-r-action`, `data-rel-action`, `data-hist-action` e `data-cli-action`.
- Header global legado compartilhado entre rotas.
- Charts do Dashboard, isolados como legado deliberado via helper testavel.
- Sheet mobile de filtros do Historico, mantido legado por overlay dinamico, `attachDialogA11y`, animacao e callbacks imperativos.
- Equipamentos: setores, detalhe/modal, fotos, CRUD, nameplate, plano/paywall e storage/backend.
- Relatorio: PDF, WhatsApp, PMOC real, quota, assinatura/modal e navegacao.
- Registro: captura/modal/persistencia de assinatura, salvamento/edicao, PDF, WhatsApp, route guard e navegacao pos-save.
- Upload/remocao/lightbox/storage local de fotos.
- Storage/backend real, auth, billing, checkout/pricing e sync.
- CSS legado global, incluindo `components.css`, mantido ate auditoria visual por prefixo.

## 4. Fase de hardening

A fase atual nao deve criar novas migracoes amplas. O foco e provar integracoes e reduzir risco:

1. Proteger contratos de setores/detalhe/fotos/nameplate de Equipamentos antes de qualquer nova migracao.
2. Aumentar E2E leve onde ainda ha maior risco de integracao entre ilhas React e handlers legados.
3. Revisar handlers globais por tela, mantendo `data-*` enquanto houver consumidores legados.
4. Separar callbacks por adapter apenas quando uma tela estiver estavel e totalmente coberta.
5. Monitorar arquivos perto/acima do limite arquitetural de 1000 linhas antes de adicionar novas responsabilidades.
6. Manter `createRoot` restrito a `src/react/entrypoints/*`.

## 5. Limpeza futura

A limpeza final deve acontecer em PRs pequenos e reversiveis:

1. CSS legado por prefixo (`dash-*`, `equip-*`, `setor-*`, `hist-*`, `rel-*`, `registro-*`, `cli-*`, `orc-*`, `alert-*`), sempre com E2E/screenshot da rota afetada.
2. Testes legacy que hoje protegem contratos historicos podem ser substituidos por testes React/adapter equivalentes, mas nao removidos em lote.
3. Renderers HTML mortos devem ser removidos apenas depois de grep, teste e prova de root/lifecycle.
4. Reducao de `data-action` deve ser por tela, trocando contratos internos por callbacks quando nao houver consumidor externo.
5. Warnings de bundle/import dinamico devem ser tratados em PR proprio de build/performance.
6. Arquivos grandes devem ser divididos por coesao, sem mudar comportamento visual.

## 6. Criterio de 100%

O projeto pode ser tratado como 100% migrado visualmente quando:

- Toda superficie visual principal das telas operacionais esta em React.
- Todo legado remanescente esta documentado como fluxo externo, adapter, handler, CSS ou infraestrutura deliberada.
- Nenhum adapter de tela importa `createRoot` diretamente.
- As rotas desmontam ilhas no lifecycle.
- E2E de lifecycle cobre as ilhas principais.
- Build, unit tests, checks e E2E passam.

Pelo criterio acima, a migracao visual principal esta encerrada. A proxima etapa e hardening/limpeza, nao migracao visual ampla.

## 7. Proximos PRs recomendados

1. Proteger render/adapter legado de setores e detalhe de Equipamentos.
2. Proteger fotos/nameplate/paywall de Equipamentos como contratos antes de decidir migracao.
3. Revisar header global como excecao deliberada ou preparar futura ilha.
4. Criar plano de reducao de CSS por prefixo com evidencia visual.
5. Reduzir handlers globais por tela depois que contratos e E2E estiverem estaveis.
