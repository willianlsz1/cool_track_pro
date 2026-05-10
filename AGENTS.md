# AGENTS.md - CoolTrack Pro

Este arquivo define regras obrigatorias para agentes de codigo trabalhando no CoolTrack Pro.

O objetivo e preservar a arquitetura atual, evitar regressoes e impedir que novas mudancas recriem a divida tecnica que exigiu a fase de fortalecimento da base.

## 1. Regra de ouro

Antes de editar qualquer arquivo:

1. Revise o escopo.
2. Mapeie os arquivos afetados.
3. Identifique contratos publicos envolvidos.
4. Avalie risco de ciclo, mudanca funcional, regressao visual, quebra de teste ou quebra de seguranca.
5. So altere codigo se houver pelo menos 99% de certeza.

100% de certeza e impossivel na pratica.
O limite minimo aceitavel para mudancas de codigo, arquitetura, contratos publicos, seguranca, storage, permissoes, PDF/share ou fluxos criticos no CoolTrack Pro e 99%.

Se houver menos de 99% de certeza, nao implemente por tentativa.
Documente:

- o que foi analisado;
- o risco encontrado;
- o motivo da incerteza;
- o plano recomendado;
- quais dados ou validacoes faltam para continuar.

Para mudancas puramente documentais, siga evidencia clara e preserve o historico tecnico.

## 2. Arquitetura do projeto

Preserve a separacao entre camadas:

- `src/core/`: infraestrutura, estado base, storage, router e utilidades centrais.
- `src/domain/`: regras de negocio puras e logica compartilhavel.
- `src/ui/`: shell legado, views, controllers, handlers e integracao visual.
- `src/features/`: modulos funcionais extraidos por dominio.
- `src/react/`: componentes React e UI moderna em migracao.
- `docs/`: documentacao de migracao, inventarios e decisoes tecnicas.

Regras:

- `core/` e `domain/` nao devem depender de `ui/`.
- Evite imports cruzados entre camadas sem justificativa forte.
- Nao duplique logica entre legado e React.
- Quando logica for compartilhada, prefira helper puro em `domain/` ou `core/`.
- Nao mova arquivos apenas por estetica.
- Nao faca refatoracao ampla junto com correcao pontual.
- Nao misture redesign, seguranca, arquitetura e limpeza de imports no mesmo CP.

## 3. Contratos publicos e compatibilidade

Nao altere sem CP dedicado e testes:

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

## 4. Imports, chunks e bundle

Evite misturar import estatico e dinamico do mesmo modulo sem necessidade.

Ao tratar warnings Vite static+dynamic:

- escolha apenas um grupo pequeno por CP;
- confirme que o import estatico ja e inevitavel no grafo;
- confirme que nao ha risco provavel de ciclo;
- preserve comportamento assincrono quando necessario com `Promise.resolve(...)`;
- rode build/check/testes focados;
- documente warnings antes/depois.

Nao mexa em `manualChunks`, vendor pesado ou PDF sem CP dedicado.

Nao otimize bundle por palpite.

## 5. Areas sensiveis

As areas abaixo exigem CP proprio:

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
- upload/storage de arquivos

Nao misture essas areas com refatoracao visual, limpeza de imports ou reorganizacao de pastas.

## 6. Seguranca

Security hardening deve ser tratado de forma isolada.

Para achados do Codex Security:

- analisar evidencia antes de alterar;
- classificar severidade;
- priorizar achados high;
- nao misturar com redesign;
- nao misturar com React Doctor;
- nao misturar com refatoracao ampla;
- criar testes ou validacao objetiva quando possivel;
- documentar risco antes/depois.

Mudancas em RLS, storage, permissoes, dados sensiveis ou feature paga exigem analise dedicada.

A Mudanca 17 sera dedicada a:

- Security hardening;
- Codex Security triage;
- correcao priorizada dos achados de maior severidade.

## 7. React Doctor

React Doctor fica em backlog futuro.

Nao aplicar sugestoes automaticamente.

Antes de remover exports, arquivos, props ou componentes:

- verificar uso real;
- verificar imports dinamicos;
- verificar testes;
- verificar falsos positivos;
- documentar decisao.

## 8. Validacao minima

Para mudancas de codigo, rode:

```bash
npm run format
npm run build
npm run check
```

Alem disso, rode testes focados da area alterada.

Para mudancas documentais, rode pelo menos:

```bash
npm run format
npm run build
npm run check
```

Se algum comando falhar, nao esconda a falha.
Registre o erro, o comando executado e o estado final.

## 9. Restricoes para agentes

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

No fluxo local, siga a branch indicada pelo usuario.
No Codex Cloud, trabalhar na branch `work` e aceitavel quando esse for o fluxo ativo.

## 10. Relatorio final obrigatorio

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

## 11. Estado atual da base

A Mudanca 16 foi encerrada como base estavel operacional.

Estado conhecido:

- build passando;
- check passando;
- testes focados dos CPs recentes passando;
- warnings Vite static+dynamic restantes tratados como backlog tecnico controlado;
- `src/domain/pdf/shareReport.js` mantem warning ESLint arquitetural conhecido para CP dedicado futuro.

Proximo foco principal:

- Mudanca 17 - Security hardening / Codex Security triage.

Backlogs futuros:

- warnings Vite remanescentes;
- CP dedicado de PDF/share;
- React Doctor;
- consolidacao visual/CSS quando aplicavel.

## 12. Rewrite zero / app-v2

O ciclo de rewrite nao deve continuar a nomenclatura CP-I ou Mudanca 21.

Antes de qualquer tarefa do rewrite, leia:

- `CONTEXT.md`
- `docs/rewrite/etapa-0-plano-mestre.md`
- `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`
- `docs/rewrite/etapa-0-stack-e-regras-agentes.md`

Regras especificas:

- O novo app planejado fica em `src/app-v2/`.
- Stack planejada: React, TypeScript, Tailwind CSS com prefixo `tw-`, Vite.
- TypeScript entra apenas no `app-v2` e adaptadores novos; nao converter legado.
- Nao criar `src/app-v2/` sem etapa propria.
- Nao editar `package.json`, `package-lock.json`, Vite, ESLint ou TypeScript sem autorizacao explicita da etapa tecnica.
- Nao importar CSS legado no app-v2.
- Nao copiar shell, templates, componentes ou navegacao legada.
- Reaproveitar somente regras puras, contratos mapeados e adaptadores planejados.
- Areas sensiveis continuam exigindo etapa propria: storage, Supabase/RLS, billing, PDF/share, WhatsApp com quota, upload/storage, assinatura e PMOC.
