# AGENTS.md - CoolTrack Pro

Regras obrigatorias para agentes trabalhando no CoolTrack Pro.

O objetivo atual e consolidar o app-v2 como experiencia principal, remover
vestigios do v1 quando houver evidencia suficiente e recriar areas sensiveis em
etapas proprias. O v1 pode ser lido apenas como referencia historica do fluxo do
tecnico; nao deve ser evoluido nem usado como arquitetura nova.

## 0. Prioridade das instrucoes

Em caso de conflito, siga esta ordem:

1. Instrucao explicita do usuario na tarefa atual.
2. Este `AGENTS.md`.
3. Documentos versionados permitidos, especialmente
   `docs/rewrite/checkpoints-recentes-resumo.md`.
4. Padroes existentes no codigo.
5. Preferencias gerais do agente/modelo.

Se ainda houver conflito, pare e reporte a ambiguidade antes de editar.

## 1. Fluxo padrao

Antes de editar qualquer arquivo:

1. Revise o escopo.
2. Rode `git status --short --branch`.
3. Mapeie os arquivos afetados.
4. Identifique contratos publicos envolvidos.
5. Avalie risco de ciclo, mudanca funcional, regressao visual, quebra de teste
   ou quebra de seguranca.
6. Identifique validacoes necessarias.
7. So altere codigo quando houver evidencia suficiente e o impacto estiver claro.

Para tarefas grandes, comece com:

- diagnostico;
- plano em etapas;
- riscos;
- arquivos afetados;
- contratos publicos envolvidos;
- validacoes esperadas.

Depois execute em mudancas pequenas, seguras e revisaveis.

Antes de editar, o agente deve conseguir responder objetivamente:

- qual arquivo sera alterado;
- por que esse arquivo precisa ser alterado;
- qual contrato publico pode ser afetado;
- qual comportamento deve permanecer igual;
- qual teste ou validacao confirma a mudanca;
- qual risco permanece.

Se algum item estiver incerto, nao implemente ainda; registre a duvida.

## 2. Markdown e documentacao

Markdown versionado permitido:

- `AGENTS.md`;
- `docs/rewrite/checkpoints-recentes-resumo.md`;
- skills do Matt Pocock em `matt-pocock-skills/skills/`.

Nao crie novos arquivos `.md` para CPs, planos, auditorias, inventarios,
READMEs, relatorios longos ou resumos de execucao.

Relatorios finais devem ser enviados no chat, nao salvos como arquivo.

Quando for necessario registrar um checkpoint no repositorio, adicione apenas um
resumo curto e objetivo em:

- `docs/rewrite/checkpoints-recentes-resumo.md`

Esse resumo deve conter no maximo:

- identificador do checkpoint;
- data;
- escopo;
- arquivos principais;
- validacoes executadas;
- riscos remanescentes.

Nao duplique no markdown informacoes que ja estao no Git, em commits, diffs ou
logs de validacao.

Se a tarefa pedir "crie um plano", "registre auditoria" ou "documente o CP",
primeiro confirme se o destino e `docs/rewrite/checkpoints-recentes-resumo.md`
ou resposta no chat. Nao crie arquivo novo por iniciativa propria.

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
- Nao remover codigo supostamente morto sem confirmar usos diretos e indiretos.

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

Se uma tarefa tocar acidentalmente uma area sensivel, pare, registre o risco e
peca confirmacao antes de continuar.

## 6. UI/UX do app-v2

- Nao criar CSS global solto.
- Nao reutilizar padroes problematicos do CSS legado.
- Nao usar `!important` como solucao padrao.
- Escopar estilos ao app-v2, componente, token ou layout.
- Validar mobile, desktop, rolagem, texto longo e estado vazio quando houver
  mudanca visual.
- Nao sacrificar legibilidade por densidade visual.
- Nao alterar comportamento funcional junto com ajuste visual, salvo quando for
  inevitavel e explicitamente documentado.

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

Ao remover legado, confirme usos com busca textual e entendimento do fluxo. Nao
confie apenas em ausencia de import direto.

## 8. Git e working tree

Antes de editar:

- rode `git status --short --branch`;
- identifique mudancas preexistentes;
- nao reverta mudancas que nao foram feitas pelo agente;
- nao use `git reset --hard`;
- nao use force push;
- nao faca commit/push sem pedido explicito.

Se houver mudancas preexistentes no mesmo arquivo, trabalhe com elas sem
reverter. Se elas impedirem a tarefa, reporte o bloqueio.

Se `git add`, commit ou push falhar:

- diagnostique permissao, lock, credencial e rede separadamente;
- nao misture correcao de Git com mudanca de codigo;
- registre o erro exato e o estado final.

## 9. Validacao

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

Para mudancas visuais, valide tambem:

- desktop;
- mobile;
- rolagem;
- texto longo;
- estado vazio;
- ausencia de overflow horizontal.

Para remocao de codigo legado, valide tambem:

- `rg` para usos diretos;
- `rg` para referencias indiretas relevantes;
- testes focados;
- build/check completos.

Se algum comando falhar, registre:

- comando executado;
- erro relevante;
- causa provavel, se conhecida;
- estado final;
- risco remanescente.

Nao afirme que validou algo que nao foi executado.

## 10. Restricoes

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
- mudancas em seguranca junto com mudancas cosmeticas;
- criacao de arquivos markdown novos para planos/checkpoints/relatorios.

Preservar o favicon.

## 11. Modo de trabalho esperado

O agente deve trabalhar em ciclos pequenos:

1. diagnosticar;
2. declarar plano curto;
3. editar o menor conjunto de arquivos;
4. validar;
5. reportar resultado e risco.

Prefira remover ambiguidade antes de aumentar escopo.

Nao transforme checkpoints pequenos em refatoracoes amplas.

Nao avance para area sensivel apenas porque encontrou codigo relacionado.

## 12. Estados finais permitidos

Ao final, classifique o trabalho como:

- `concluido`: escopo implementado e validado;
- `parcial`: parte concluida, com pendencias explicitas;
- `bloqueado`: falta permissao, contexto, credencial, ambiente ou decisao;
- `somente diagnostico`: nenhuma edicao feita.

Nunca use `concluido` se validacoes obrigatorias nao foram executadas.

## 13. Relatorio final

Toda mudanca deve terminar com relatorio no chat contendo:

1. Estado final: `concluido`, `parcial`, `bloqueado` ou `somente diagnostico`.
2. Branch.
3. HEAD inicial.
4. HEAD final/commit.
5. Working tree antes/depois.
6. Arquivos alterados.
7. O que foi alterado.
8. O que nao foi alterado.
9. Validacao executada.
10. Testes executados.
11. Warnings conhecidos.
12. Riscos remanescentes.
13. Proximo passo recomendado.
