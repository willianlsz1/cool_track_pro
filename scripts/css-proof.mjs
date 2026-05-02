#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const RAW_ARGS = process.argv.slice(2);
const FORCE = RAW_ARGS.includes('--force');
const ARGS = RAW_ARGS.filter((arg) => arg !== '--force');

function usage() {
  return [
    'Uso:',
    '  node scripts/css-proof.mjs <microfamilia> [termo-curto] [--force]',
    '',
    'Exemplos:',
    '  node scripts/css-proof.mjs timeline__saved-badge saved-badge',
    '  node scripts/css-proof.mjs "hist-pill--" hist-pill --force',
  ].join('\n');
}

const CODE_PATHS = ['src/react', 'src/ui', 'e2e', 'src/__tests__', 'src/tests'];
const CSS_PATHS = ['src/assets/styles'];
const DOC_PATHS = ['docs'];

function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function runGitGrep(label, scope, args) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    windowsHide: true,
  });

  return {
    label,
    scope,
    command: ['git', ...args].join(' '),
    exitCode: result.status ?? 1,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || '',
  };
}

function countMatches(result) {
  return result.stdout ? result.stdout.split(/\r?\n/).length : 0;
}

function formatSummaryTable(results) {
  return [
    '| Busca | Escopo | Exit code | Matches |',
    '| ----- | ------ | --------: | ------: |',
    ...results.map(
      (result) =>
        `| ${result.label} | ${result.scope} | ${result.exitCode} | ${countMatches(result)} |`,
    ),
    '',
  ].join('\n');
}

function formatResult(result) {
  const output = result.stdout || result.stderr || '(sem resultados)';
  return [
    `### ${result.label}`,
    '',
    '```bash',
    result.command,
    '```',
    '',
    `Exit code: ${result.exitCode}`,
    '',
    '```text',
    output,
    '```',
    '',
  ].join('\n');
}

function buildMarkdown({ family, shortTerm, slug, results }) {
  const date = new Date().toISOString().slice(0, 10);

  return [
    `# Prova CSS: \`${family}\``,
    '',
    `Data da analise: ${date}.`,
    `Termo curto: \`${shortTerm || slug}\`.`,
    '',
    '## Objetivo',
    '',
    `Auditar a microfamilia CSS \`${family}\` antes de qualquer remocao de CSS.`,
    '',
    '## Resumo de matches',
    '',
    formatSummaryTable(results),
    '## Comandos executados',
    '',
    ...results.map(formatResult),
    '## Separacao inicial dos matches',
    '',
    '- CSS de producao: pendente de revisao manual.',
    '- Codigo fonte: pendente de revisao manual.',
    '- Testes/E2E: pendente de revisao manual.',
    '- Docs/provas: pendente de revisao manual.',
    '',
    '## Analise pendente',
    '',
    '- Verificar se os matches em CSS compartilham regra com seletores vivos.',
    '- Verificar se existe geracao dinamica por `className`, `classList`, template string, array ou builder.',
    '- Verificar se existem contratos publicos preservados por testes ou E2E.',
    '- Verificar se a microfamilia pertence a uma unica tela/fluxo.',
    '',
    '## Classificacao pendente',
    '',
    'Escolher uma opcao apos revisao manual:',
    '',
    '- [ ] Comprovadamente morta.',
    '- [ ] Ainda usada.',
    '- [ ] Inconclusiva por classe dinamica ou evidencia insuficiente.',
    '',
    '## Checklist de preservacoes',
    '',
    '- [ ] Nenhum CSS removido neste PR de prova.',
    '- [ ] Nenhum JSX/React alterado.',
    '- [ ] Nenhum handler alterado.',
    '- [ ] Nenhuma rota alterada.',
    '- [ ] Nenhum view model alterado.',
    '- [ ] Contratos `data-*`, ids e classes publicas vivas preservados.',
    '- [ ] Familias vizinhas fora do escopo preservadas.',
    '',
    '## Validacoes recomendadas',
    '',
    '```bash',
    'git grep -n -E "^(<<<<<<<|=======|>>>>>>>)($| )"',
    'npm run format',
    'npm run check',
    'npm run test',
    'npm run build',
    'git diff --check',
    '```',
    '',
    'E2E so e necessario se a prova alterar CSS, JS, JSX, testes funcionais ou comportamento.',
    '',
    '## Recomendacao pendente',
    '',
    'Definir apos classificacao manual. Se a microfamilia estiver morta, abrir PR futuro de remocao cirurgica com validacao propria.',
    '',
  ].join('\n');
}

if (ARGS.length < 1 || ARGS.length > 2) {
  console.error(usage());
  process.exit(1);
}

const family = ARGS[0]?.trim();
const shortTerm = ARGS[1]?.trim() || '';

if (!family) {
  console.error('Erro: informe uma microfamilia CSS.');
  console.error(usage());
  process.exit(1);
}

const slug = normalizeName(family);
if (!slug) {
  console.error('Erro: nao foi possivel normalizar o nome do arquivo de prova.');
  process.exit(1);
}

const outputDir = path.join('docs', 'migration');
const outputPath = path.join(outputDir, `css-${slug}-proof.md`);

if (existsSync(outputPath) && !FORCE) {
  console.error(`Erro: ${outputPath} ja existe. Use --force para sobrescrever.`);
  process.exit(1);
}

const searchTerms = [family];
if (shortTerm && shortTerm !== family) {
  searchTerms.push(shortTerm);
}

const escapedTerms = searchTerms.map(escapeRegExp);
const anyTermPattern = escapedTerms.join('|');
const classNamePattern = `className.*(${anyTermPattern})|(${anyTermPattern}).*className`;
const classListPattern = `classList.*(${anyTermPattern})|(${anyTermPattern}).*classList`;
const dynamicPattern = `(${anyTermPattern}).*\\$\\{|status.*(${anyTermPattern})|(${anyTermPattern}).*status|tone.*(${anyTermPattern})|(${anyTermPattern}).*tone`;

const results = [
  runGitGrep('Microfamilia no repo inteiro', 'repo inteiro', ['grep', '-n', family]),
  runGitGrep('Microfamilia em codigo/testes/E2E', CODE_PATHS.join(', '), [
    'grep',
    '-n',
    family,
    '--',
    ...CODE_PATHS,
  ]),
  runGitGrep('Microfamilia em CSS de producao', CSS_PATHS.join(', '), [
    'grep',
    '-n',
    family,
    '--',
    ...CSS_PATHS,
  ]),
  runGitGrep('Microfamilia em docs/provas', DOC_PATHS.join(', '), [
    'grep',
    '-n',
    family,
    '--',
    ...DOC_PATHS,
  ]),
];

if (shortTerm && shortTerm !== family) {
  results.push(
    runGitGrep('Termo curto no repo inteiro', 'repo inteiro', ['grep', '-n', shortTerm]),
    runGitGrep('Termo curto em codigo/testes/E2E', CODE_PATHS.join(', '), [
      'grep',
      '-n',
      shortTerm,
      '--',
      ...CODE_PATHS,
    ]),
    runGitGrep('Termo curto em CSS de producao', CSS_PATHS.join(', '), [
      'grep',
      '-n',
      shortTerm,
      '--',
      ...CSS_PATHS,
    ]),
    runGitGrep('Termo curto em docs/provas', DOC_PATHS.join(', '), [
      'grep',
      '-n',
      shortTerm,
      '--',
      ...DOC_PATHS,
    ]),
  );
}

results.push(
  runGitGrep('Padrao className', CODE_PATHS.join(', '), [
    'grep',
    '-n',
    '-E',
    classNamePattern,
    '--',
    ...CODE_PATHS,
  ]),
  runGitGrep('Padrao classList', CODE_PATHS.join(', '), [
    'grep',
    '-n',
    '-E',
    classListPattern,
    '--',
    ...CODE_PATHS,
  ]),
  runGitGrep('Padroes dinamicos simples', CODE_PATHS.join(', '), [
    'grep',
    '-n',
    '-E',
    dynamicPattern,
    '--',
    ...CODE_PATHS,
  ]),
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, buildMarkdown({ family, shortTerm, slug, results }), 'utf8');

console.log(`Prova CSS criada: ${outputPath}`);
console.log(`Microfamilia: ${family}`);
console.log(`Termo curto: ${shortTerm || slug}`);
console.log(`Comandos executados: ${results.length}`);
for (const result of results) {
  console.log(
    `- ${result.label} [${result.scope}]: exit ${result.exitCode}, matches ${countMatches(result)}`,
  );
}
if (FORCE) {
  console.log('Arquivo sobrescrito com --force.');
}
