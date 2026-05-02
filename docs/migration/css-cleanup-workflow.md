# Workflow de auditoria e limpeza CSS

Data de criacao: 2026-05-01.

## Objetivo

Padronizar a auditoria de microfamilias CSS legadas depois da migracao visual React + Tailwind. Este fluxo evita remocoes por grep simples e separa prova, remocao e validacao em PRs pequenos.

## Regras principais

- Nao remover CSS no mesmo PR que cria a prova.
- Nao alterar JSX, handlers, rotas ou view models durante uma prova CSS.
- Nao misturar microfamilias diferentes no mesmo PR.
- Nao usar `components.css`, `redesign.css` ou `desktop-fonts.css` para novas UIs React.
- Nao remover familias grandes por busca textual simples.
- Preservar ids, classes publicas e contratos `data-*` ate haver substituicao visual validada.

## Fluxo oficial

1. Escolher uma microfamilia pequena marcada como suspeita em `docs/migration/css-legacy-inventory.md`.
2. Confirmar que o nome e especifico o suficiente para grep confiavel.
3. Criar uma prova inicial com:

   ```bash
   npm run css:proof -- <microfamilia> <termo-curto>
   ```

4. Revisar manualmente o markdown gerado em `docs/migration/css-<nome-normalizado>-proof.md`.
5. Separar os matches em:
   - CSS de producao;
   - codigo fonte;
   - testes/E2E;
   - docs/provas.
6. Verificar geracao dinamica:
   - `className`;
   - `classList`;
   - template strings;
   - arrays/builders;
   - status/tone vindo de dados.
7. Classificar a microfamilia como:
   - comprovadamente morta;
   - ainda usada;
   - inconclusiva.
8. Atualizar `docs/migration/css-legacy-inventory.md` com a classificacao.
9. Se estiver morta, abrir PR separado para remover apenas os seletores comprovados.

## Uso do script auxiliar

```bash
npm run css:proof -- timeline__saved-badge saved-badge
```

Forma direta:

```bash
node scripts/css-proof.mjs <microfamilia> [termo-curto] [--force]
```

Exemplos:

```bash
node scripts/css-proof.mjs timeline__saved-badge saved-badge
node scripts/css-proof.mjs "hist-pill--" hist-pill --force
```

O script:

- roda buscas `git grep` no repo inteiro;
- roda buscas em `src/react`, `src/ui`, `e2e`, `src/__tests__` e `src/tests`;
- roda buscas em `src/assets/styles`;
- roda buscas em `docs`;
- usa o termo curto para buscas complementares quando informado;
- procura padroes `className`, `classList` e dinamicos simples apenas em `src/react`, `src/ui`, `e2e`, `src/__tests__` e `src/tests`;
- adiciona tabela de resumo de matches no markdown gerado;
- registra comandos, exit code e saida;
- cria um markdown inicial de prova;
- nao remove CSS;
- nao edita arquivos de producao;
- nao sobrescreve prova existente sem `--force`.

## Criterios para remover CSS em PR futuro

A remocao so deve acontecer se todos os itens forem verdadeiros:

- prova dedicada existe;
- microfamilia foi classificada como comprovadamente morta;
- `git grep` nao encontra uso em codigo fonte, testes ou E2E;
- geracao dinamica foi descartada;
- seletores removidos nao compartilham regra com classes vivas;
- testes relevantes passam;
- build passa;
- E2E ou validacao visual foi executado quando a remocao afetar tela;
- `git diff --check` passa.

## Validacoes recomendadas para PR de prova

Quando o PR altera apenas docs e o script auxiliar:

```bash
git grep -n -E "^(<<<<<<<|=======|>>>>>>>)($| )"
npm run format
npm run check
npm run test
npm run build
git diff --check
```

E2E nao e obrigatorio para prova documental pura. Rode E2E se qualquer CSS, JS, JSX, rota, handler ou teste funcional for alterado.

## Validacoes recomendadas para PR de remocao

```bash
git grep -n "<microfamilia>"
git grep -n -E "^(<<<<<<<|=======|>>>>>>>)($| )"
npm run format
npm run check
npm run test
npm run build
npm run test:e2e
git diff --check
```

Tambem registrar screenshot ou validacao visual quando a regra removida puder afetar uma tela.

## Limitacoes

- O script nao prova obsolescencia sozinho; ele gera evidencia inicial.
- `git grep` nao entende todos os estados dinamicos de runtime.
- Classes montadas por concatenacao indireta, dados remotos ou HTML de terceiros ainda exigem revisao manual.
- Uma classe usada apenas por teste pode ser contrato publico e nao deve ser removida sem decisao explicita.
- Familias grandes como `equip-*`, `eq-*`, `setor-*`, `registro-*`, `rel-*`, `dash-*`, `hist-*` e `timeline*` exigem recorte por microfamilia.

## Proximo uso recomendado

Usar o fluxo para abrir o PR de remocao cirurgica de `.timeline__saved-badge`, ja provada como morta em `docs/migration/css-timeline-saved-badge-proof.md`, ou para provar outra microfamilia pequena antes de qualquer remocao.
