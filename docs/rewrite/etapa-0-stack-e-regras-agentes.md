# Etapa zero - Stack e regras para agentes

## 1. Objetivo

Definir a stack planejada para o **Novo app** e as regras de trabalho para agentes que atuarem no **Rewrite zero**.

Este documento e normativo para o ciclo `src/app-v2/`, mas ainda nao autoriza implementacao. A Etapa zero continua documental ate existir etapa propria para configurar TypeScript e iniciar codigo.

## 2. Stack planejada

### Base

- Vite.
- React.
- TypeScript.
- Tailwind CSS.

### Decisoes

1. O novo app sera criado em `src/app-v2/`.
2. TypeScript sera usado apenas no novo app e nos adaptadores novos.
3. O legado nao sera convertido para TypeScript.
4. Tailwind pode ser usado no novo app, preservando o prefixo atual `tw-`.
5. O novo app nao deve importar CSS legado como base.
6. Componentes visuais do legado nao devem ser copiados.
7. Bibliotecas novas de UI nao devem ser adicionadas sem etapa propria e justificativa.
8. Estado deve comecar simples com React state/context e evoluir apenas se a complexidade justificar.

### Pendencias tecnicas antes de codigo

O repo passou a possuir configuracao TypeScript na Etapa 1. A configuracao deve continuar restrita ao app-v2 e adaptadores novos.

A Etapa 1 autorizou e validou:

- edicao de `package.json`;
- edicao de `package-lock.json`;
- instalacao de `typescript`;
- instalacao de `@types/react`;
- instalacao de `@types/react-dom`;
- criacao de `tsconfig.json` ou configuracao equivalente;
- inclusao de `npm run typecheck` no fluxo de validacao.

Nenhum agente deve editar `package.json`, `package-lock.json`, configs de build ou configs de lint alem do que foi aprovado para a etapa ativa.

## 3. Principio de trabalho dos agentes

O agente principal esperado e o Codex.

Agentes devem atuar como engenheiros de produto e codigo, nao como executores de redesign cosmetico. O objetivo e construir um novo app coerente, sem carregar a divida visual e estrutural do app legado.

## 4. Regras obrigatorias para o Rewrite zero

Antes de qualquer mudanca:

1. Ler `AGENTS.md`.
2. Ler `CONTEXT.md`.
3. Ler `docs/rewrite/etapa-0-plano-mestre.md`.
4. Ler `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`.
5. Ler este documento.
6. Declarar se a tarefa e documental, arquitetura, produto, configuracao ou codigo.

Durante a Etapa zero:

- nao criar `src/app-v2/` sem pedido explicito;
- nao alterar `src/`;
- nao alterar CSS legado;
- nao alterar rotas, shell, storage, Supabase, billing, PDF/share ou PMOC;
- nao continuar nomenclatura CP-I;
- nao tratar Mudanca 21 como trilha ativa do rewrite;
- documentar incertezas em vez de implementar por tentativa.

Durante etapas de implementacao futuras:

- manter `src/app-v2/` isolado do shell legado;
- nao importar `src/assets/styles/components.css`, `redesign.css`, `layout.css` ou CSS legado equivalente;
- reaproveitar somente regras puras, contratos mapeados e adaptadores planejados;
- criar componentes pequenos e coesos;
- preservar fronteiras entre produto, dominio, adaptadores e UI;
- adicionar testes focados para regras novas;
- validar build, lint e testes relevantes.

Textos de interface:

- usar portugues brasileiro com ortografia e acentuacao corretas;
- nao remover acentos de textos visiveis por conveniencia tecnica;
- manter identificadores de codigo sem acento quando forem nomes de tipos, campos, chaves ou contratos.

## 5. Regras de design para o Novo app

O novo app deve ser uma ferramenta operacional para tecnico em campo.

Direcao obrigatoria:

- primeira tela: **Hoje / Home operacional**;
- foco: proxima acao clara;
- navegacao fixa inicial: **Hoje**, **Equipamento**, **Servicos**, **Conta**;
- Equipamento e o centro operacional;
- Cliente tem detalhe proprio dentro da area Equipamento;
- Servicos agrupa registros, historico, relatorios e orcamentos;
- WhatsApp e saida primaria de relatorio;
- PMOC fica para etapa futura.

Evitar:

- dashboard de metricas como primeira tela;
- landing page dentro do app autenticado;
- listas cruas sem proxima acao;
- cards decorativos;
- UI dominada por uma cor so;
- copiar layout da Mudanca 21.

## 6. Regras de TypeScript

Quando TypeScript for aprovado:

- usar tipos de dominio explicitos para `Equipamento`, `Cliente`, `RegistroServico`, `CompromissoServico`, `Orcamento`;
- preferir `type`/`interface` simples e locais no inicio;
- evitar tipos globais prematuros;
- validar dados externos em adaptadores antes de entrar no dominio;
- nao usar `any` para contornar modelagem incerta;
- se houver incerteza de contrato, documentar lacuna e criar tipo conservador.

## 7. Regras de Tailwind

Quando Tailwind for usado:

- manter prefixo `tw-`;
- nao depender de preflight global;
- criar tokens/constantes de design do app-v2 antes de espalhar classes;
- nao misturar Tailwind com classes do CSS legado no mesmo componente;
- evitar componentes enormes cheios de classes repetidas;
- extrair primitives quando houver repeticao real.

## 8. Regras de adaptadores

O app-v2 nao deve acessar diretamente estruturas sensiveis do legado sem adaptador.

Adaptadores futuros devem separar:

- leitura de dados;
- escrita de dados;
- normalizacao;
- erros;
- sincronizacao;
- limites de plano;
- PDF/share;
- Supabase.

Areas que exigem etapa propria:

- storage offline;
- Supabase/RLS;
- billing e feature gates;
- PDF/share;
- WhatsApp com quota;
- upload/storage de fotos;
- assinatura;
- PMOC.

## 9. Validacao minima

Mudancas documentais:

```bash
npm run format
npm run build
npm run check
git diff --check
```

Mudancas de codigo futuras:

```bash
npm run format
npm run build
npm run check
```

Tambem rodar testes focados da area alterada.

Se TypeScript for introduzido, a etapa deve incluir comando de typecheck no fluxo de validacao.

Estado apos Etapa 1: `npm run check` inclui `npm run typecheck`.

## 10. Relatorio final esperado de agentes

Toda entrega deve informar:

1. Branch.
2. HEAD inicial.
3. HEAD final ou commit.
4. Working tree antes/depois.
5. Arquivos alterados.
6. O que mudou.
7. O que nao mudou.
8. Validacao executada.
9. Testes executados.
10. Riscos remanescentes.
11. Proximo passo recomendado.
