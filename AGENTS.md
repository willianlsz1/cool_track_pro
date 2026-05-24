# AGENTS.md - CoolTrack Pro

Regras obrigatorias para agentes trabalhando no CoolTrack Pro.

O objetivo atual e consolidar o app-v2 como experiencia principal, remover
vestigios do v1 quando houver evidencia suficiente e recriar areas sensiveis em
etapas proprias. O v1 pode ser lido apenas como referencia historica do fluxo do
tecnico; nao deve ser evoluido nem usado como arquitetura nova.

## 1. Fluxo padrao

Antes de editar qualquer arquivo:

1. Revise o escopo.
2. Mapeie os arquivos afetados.
3. Identifique contratos publicos envolvidos.
4. Avalie risco de ciclo, mudanca funcional, regressao visual, quebra de teste
   ou quebra de seguranca.
5. So altere codigo quando houver pelo menos 99% de certeza.

Para tarefas grandes, comece com diagnostico, plano em etapas, riscos, arquivos
afetados e validacoes esperadas. Depois execute em mudancas pequenas, seguras e
revisaveis.

## 2. Markdown e documentacao

Markdown versionado permitido:

- `AGENTS.md`;
- `docs/rewrite/checkpoints-recentes-resumo.md`;
- skills do Matt Pocock em `matt-pocock-skills/skills/`.

Nao recrie documentos `.md` separados para CPs, planos, auditorias, inventarios,
READMEs ou relatorios longos. Resuma novos checkpoints somente em
`docs/rewrite/checkpoints-recentes-resumo.md`, de forma curta e objetiva.

## 3. Arquitetura e fronteiras

Camadas existentes:

- `src/app-v2/`: foco atual do novo app.
- `src/core/`: infraestrutura, estado base, storage, router e utilidades
  centrais ainda existentes.
- `src/domain/`: regras puras e logica compartilhavel ainda existentes.
- `src/ui/`, `src/features/`, `src/react/`: areas legadas ou de transicao; devem
  ser removidas ou neutralizadas por CPs pequenos, quando houver evidencia.
- `supabase/`: migrations e functions existentes; sera refeito depois das
  migrations do v1, por etapa propria.

Regras:

- `core/` e `domain/` nao devem depender de `ui/`.
- Nao duplicar logica entre legado e app-v2.
- Nao copiar shell, templates, CSS ou navegacao legada para o app-v2.
- Nao mover arquivos apenas por estetica.
- Nao misturar redesign, seguranca, storage, Supabase, PDF/share, billing e
  limpeza de imports no mesmo checkpoint.

## 4. App-v2

Regras especificas:

- Stack planejada: React, TypeScript, Tailwind CSS com prefixo `tw-`, Vite.
- TypeScript entra apenas no app-v2 e adaptadores novos; nao converter legado por
  atacado.
- Manter o app-v2 isolado do shell legado.
- Nao importar CSS legado no app-v2.
- Nao recriar mocks divergentes por tela quando ja existir store mockada unica.
- Reaproveitar somente regras puras quando isso for melhor que reescrever.
- Nao conectar storage real, Supabase/RLS, billing, PDF/share, WhatsApp,
  upload/storage, assinatura, PMOC ou orcamento real sem etapa propria.

## 5. Areas sensiveis

As areas abaixo exigem etapa propria:

- PDF/share;
- router;
- storage e estado global;
- autenticacao, permissoes e Supabase/RLS;
- migrations e schema real;
- billing, pricing e features pagas;
- upload/storage de arquivos;
- WhatsApp;
- assinatura;
- PMOC real;
- orcamento real.

Nao misture essas areas com refatoracao visual, limpeza de imports ou
reorganizacao ampla.

## 6. UI/UX do app-v2

- Nao criar CSS global solto.
- Nao reutilizar padroes problematicos do CSS legado.
- Nao usar `!important` como solucao padrao.
- Escopar estilos ao app-v2, componente, token ou layout.
- Validar mobile, desktop, rolagem, texto longo e estado vazio quando houver
  mudanca visual.
- Nao sacrificar legibilidade por densidade visual.

## 7. Contratos publicos

Nao altere sem etapa dedicada e testes:

- `data-action`;
- `data-nav`;
- IDs usados por handlers;
- selectors usados por testes;
- storage keys;
- nomes de rotas;
- schemas;
- payloads persistidos;
- contratos de relatorio/exportacao;
- permissoes e regras de acesso.

## 8. Validacao

Para mudancas de codigo, rode:

```bash
npm run format
npm run build
npm run check
```

Alem disso, rode testes focados da area alterada.

Para mudancas documentais, rode:

```bash
npm run format:check
git diff --check
git diff --cached --check
```

Se algum comando falhar, registre o comando, o erro e o estado final. Nao afirme
que validou algo que nao foi executado.

## 9. Restricoes

Nao faca:

- mudancas fora do escopo;
- dependencias novas sem solicitacao explicita;
- edicao de `package.json` ou `package-lock.json` sem autorizacao;
- `test.skip`;
- relaxamento de lint para mascarar problema;
- barrel `index.js` sem necessidade comprovada;
- alteracao visual junto com alteracao arquitetural;
- alteracao de schema junto com refatoracao;
- remocao de codigo supostamente morto sem confirmar uso indireto;
- mudancas em seguranca junto com mudancas cosmeticas.

Preservar o favicon.

## 10. Relatorio final

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
