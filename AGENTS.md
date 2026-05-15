# AGENTS.md - CoolTrack Pro

Regras obrigatorias para agentes trabalhando no CoolTrack Pro.

O objetivo atual e manter o app legado/v1 congelado, usar sua experiencia apenas
como referencia funcional e concentrar evolucao no app-v2 em `src/app-v2/`.

## 1. Regras globais

Antes de editar qualquer arquivo:

1. Revise o escopo.
2. Mapeie os arquivos afetados.
3. Identifique contratos publicos envolvidos.
4. Avalie risco de ciclo, mudanca funcional, regressao visual, quebra de teste
   ou quebra de seguranca.
5. So altere codigo se houver pelo menos 99% de certeza.

100% de certeza e impossivel na pratica. O limite minimo aceitavel para mudancas
de codigo, arquitetura, contratos publicos, seguranca, storage, permissoes,
PDF/share ou fluxos criticos e 99%.

Se houver menos de 99% de certeza, nao implemente por tentativa. Documente:

- o que foi analisado;
- o risco encontrado;
- o motivo da incerteza;
- o plano recomendado;
- quais dados ou validacoes faltam para continuar.

Para mudancas puramente documentais, siga evidencia clara e preserve o historico
tecnico.

## 2. Arquitetura e fronteiras

Camadas existentes:

- `src/core/`: infraestrutura, estado base, storage, router e utilidades centrais.
- `src/domain/`: regras de negocio puras e logica compartilhavel.
- `src/ui/`: shell legado/v1, views, controllers, handlers e integracao visual.
- `src/features/`: modulos funcionais extraidos por dominio.
- `src/react/`: componentes React do ciclo anterior.
- `src/app-v2/`: foco atual do novo app.
- `docs/`: documentacao de migracao, rewrite, inventarios e decisoes tecnicas.

Regras:

- `core/` e `domain/` nao devem depender de `ui/`.
- Evite imports cruzados entre camadas sem justificativa forte.
- Nao duplique logica entre legado/v1 e app-v2.
- Quando logica for compartilhada, prefira helper puro em `domain/`, `core/` ou
  adaptador planejado.
- Nao mova arquivos apenas por estetica.
- Nao faca refatoracao ampla junto com correcao pontual.
- Nao misture redesign, seguranca, arquitetura e limpeza de imports no mesmo
  checkpoint.

## 3. App legado/v1 congelado

O app legado/v1 esta congelado. Ele deve ser tratado como baseline operacional e
referencia funcional, nao como area de evolucao.

Permitido:

- ler codigo legado para entender contratos, regras e comportamento;
- usar o legado como referencia de fluxo do tecnico;
- corrigir bug no legado apenas quando o usuario pedir explicitamente;
- preservar compatibilidade quando uma mudanca autorizada tocar contratos
  publicos existentes.

Nao permitido sem pedido explicito:

- redesign do legado;
- ajustes cosmeticos em CSS legado;
- refatoracao ampla em `src/ui`, `src/core`, `src/domain`, `src/features` ou
  `src/react`;
- converter legado para TypeScript;
- copiar shell, templates, componentes, CSS ou navegacao legada para o app-v2;
- resolver warnings legados de Vite/chunk, React Doctor ou PDF/share durante
  tarefas do app-v2.

## 4. Foco atual: app-v2

O foco atual do projeto e `src/app-v2/`.

Antes de qualquer tarefa do app-v2, leia quando relevante:

- `CONTEXT.md`
- `docs/rewrite/etapa-0-plano-mestre.md`
- `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`
- `docs/rewrite/etapa-0-stack-e-regras-agentes.md`
- relatorios recentes em `docs/rewrite/`

Regras especificas:

- Stack planejada: React, TypeScript, Tailwind CSS com prefixo `tw-`, Vite.
- TypeScript entra apenas no app-v2 e adaptadores novos; nao converter legado.
- Manter o app-v2 isolado do shell legado.
- Nao importar CSS legado no app-v2.
- Nao recriar mocks divergentes por tela quando ja existir store mockada unica.
- Reaproveitar somente regras puras, contratos mapeados e adaptadores
  planejados.
- Nao conectar storage real, Supabase/RLS, billing, PDF/share, WhatsApp,
  upload/storage, assinatura, PMOC ou orcamento real sem etapa propria.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript sem
  autorizacao explicita da etapa tecnica.

## 5. UI/UX do app-v2

Guardrails obrigatorios para UI/UX do app-v2:

- Nao criar CSS global solto.
- Nao reutilizar padroes problematicos de `redesign.css`.
- Nao empilhar overrides para corrigir decisao visual fraca.
- Nao usar `!important` como solucao padrao.
- Escopar estilos ao app-v2, componente, token ou layout.
- Preferir tokens e constantes de design quando isso reduzir duplicacao.
- Nao iniciar redesign amplo sem documento de regras em `docs/rewrite`.
- Validar mobile, desktop, rolagem, texto longo e estado vazio.
- Nao sacrificar legibilidade por densidade visual.
- Nao misturar refinamento visual com mudanca de arquitetura, storage,
  seguranca ou integracao real.

O documento detalhado de Design System/UI deve ficar em `docs/rewrite/`, nao
dentro deste arquivo.

## 6. Contratos publicos e compatibilidade

Nao altere sem etapa dedicada e testes:

- `data-action`
- `data-nav`
- IDs usados por handlers
- selectors usados por testes ou fluxos legados
- storage keys
- nomes de rotas
- schemas
- payloads persistidos
- contratos de PDF/relatorio
- permissoes e regras de acesso

Mudancas nesses pontos podem quebrar fluxo silenciosamente.

## 7. Areas sensiveis

As areas abaixo exigem etapa propria:

- PDF/share
- `src/domain/pdf/shareReport.js`
- `vendor-pdf`
- `manualChunks`
- router
- storage
- estado global
- permissoes
- autenticacao
- Supabase/RLS
- features pagas
- billing
- upload/storage de arquivos
- WhatsApp com quota
- assinatura
- PMOC real
- orcamento real

Nao misture essas areas com refatoracao visual, limpeza de imports ou
reorganizacao de pastas.

## 8. Seguranca

Security hardening deve ser tratado de forma isolada.

Para achados de seguranca:

- analisar evidencia antes de alterar;
- classificar severidade;
- priorizar achados high;
- nao misturar com redesign;
- nao misturar com React Doctor;
- nao misturar com refatoracao ampla;
- criar testes ou validacao objetiva quando possivel;
- documentar risco antes/depois.

Mudancas em RLS, storage, permissoes, dados sensiveis ou feature paga exigem
analise dedicada.

## 9. Imports, chunks e bundle

Evite misturar import estatico e dinamico do mesmo modulo sem necessidade.

Ao tratar warnings Vite static+dynamic:

- escolha apenas um grupo pequeno por etapa;
- confirme que o import estatico ja e inevitavel no grafo;
- confirme que nao ha risco provavel de ciclo;
- preserve comportamento assincrono quando necessario com `Promise.resolve(...)`;
- rode build/check/testes focados;
- documente warnings antes/depois.

Nao mexa em `manualChunks`, vendor pesado ou PDF sem etapa dedicada.
Nao otimize bundle por palpite.

## 10. React Doctor

React Doctor fica em backlog futuro.

Nao aplicar sugestoes automaticamente.

Antes de remover exports, arquivos, props ou componentes:

- verificar uso real;
- verificar imports dinamicos;
- verificar testes;
- verificar falsos positivos;
- documentar decisao.

## 11. Validacao minima

Para mudancas de codigo, rode:

```bash
npm run format
npm run build
npm run check
```

Alem disso, rode testes focados da area alterada.

Para mudancas documentais, rode pelo menos a validacao pedida na etapa. Quando a
etapa nao especificar, use:

```bash
npm run format:check
git diff --check
```

Se algum comando falhar, nao esconda a falha. Registre o erro, o comando
executado e o estado final.

## 12. Restricoes para agentes

Nao faca:

- mudancas fora do escopo;
- dependencias novas sem solicitacao explicita;
- edicao de `package.json` ou `package-lock.json` sem autorizacao;
- criacao de `test.skip`;
- relaxamento de lint para mascarar problema;
- criacao de barrel `index.js` sem necessidade comprovada;
- alteracao visual junto com alteracao arquitetural;
- alteracao de schema junto com refatoracao;
- remocao de codigo supostamente morto sem confirmar uso indireto;
- mudancas em seguranca junto com mudancas cosmeticas;
- mudancas em PDF/share junto com limpeza de imports.

No fluxo local, siga a branch indicada pelo usuario. No Codex Cloud, trabalhar na
branch `work` e aceitavel quando esse for o fluxo ativo.

## 13. Estado atual da base

Estado conhecido:

- app legado/v1 congelado como baseline operacional;
- app-v2 e o foco atual em `src/app-v2/`;
- fundacao tecnica do app-v2 registrada em `docs/rewrite` como 100% no criterio
  de contratos, store mockada unica, acoes puras, seletores operacionais e
  testes de fluxo;
- QA manual ampliado da navegacao app-v2 registrado em `docs/rewrite`;
- warnings Vite static+dynamic restantes tratados como backlog tecnico
  controlado;
- `src/domain/pdf/shareReport.js` mantem warning ESLint arquitetural conhecido
  para etapa dedicada futura.

Proximo foco recomendado:

- continuar o app-v2 por etapas pequenas, documentadas e validadas;
- antes de refinamento visual amplo, criar ou atualizar documento de regras de
  Design System/UI em `docs/rewrite`.

Backlogs futuros:

- warnings Vite remanescentes;
- etapa dedicada de PDF/share;
- React Doctor;
- security hardening isolado;
- integracoes reais do app-v2 somente por etapa propria.

## 14. Relatorio final obrigatorio

Toda mudanca deve terminar com relatorio contendo:

1. Branch.
2. HEAD inicial.
3. HEAD final/commit.
4. Working tree antes/depois.
5. Arquivos alterados.
6. O que foi alterado.
7. O que nao foi alterado.
8. Validacao executada.
9. Testes executados.
10. Riscos remanescentes.
11. Proximo passo recomendado.
