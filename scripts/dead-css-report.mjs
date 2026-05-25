#!/usr/bin/env node
/**
 * Lightweight CSS reference report for the current app.
 *
 * It scans versioned CSS files and lists simple class selectors whose class
 * names do not appear in source files. This is only a review aid: dynamic class
 * names, selectors composed at runtime, and third-party/runtime markup still
 * require manual confirmation before deleting CSS.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const CSS_FILES = [
  'src/app-v2/styles/tailwind.css',
  'src/app-v2/styles/print.css',
  'src/ui/components/onboarding/firstTimeExperience.css',
  'public/legal/_style.css',
];

const SOURCE_GLOBS = [
  'src/app-v2',
  'src/ui',
  'src/core',
  'src/domain',
  'public',
  'index.html',
  'preview.html',
  'preview',
];

const IGNORED_CLASS_PREFIXES = [
  'tw-',
  'fa-',
  'sr-only',
  'visually-hidden',
  'is-',
  'has-',
  'no-',
  'print-',
];

function gitLsFiles(paths) {
  return execFileSync('git', ['ls-files', ...paths], { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function extractClassSelectors(css) {
  const matches = css.matchAll(/\.([_a-zA-Z][-_a-zA-Z0-9]*)/g);
  return unique([...matches].map((match) => match[1])).sort();
}

function shouldIgnoreClassName(className) {
  return IGNORED_CLASS_PREFIXES.some(
    (prefix) => className === prefix || className.startsWith(prefix),
  );
}

function countSourceReferences(className, sourceFiles) {
  let count = 0;
  for (const file of sourceFiles) {
    const source = readFileSync(file, 'utf8');
    if (source.includes(className)) count += 1;
  }
  return count;
}

const cssFiles = gitLsFiles(CSS_FILES);
const sourceFiles = gitLsFiles(SOURCE_GLOBS).filter(
  (file) => !file.endsWith('.css') && !/\.(png|jpg|jpeg|ico|webp|woff2?|ttf|eot|pdf)$/i.test(file),
);

const rows = [];

for (const cssFile of cssFiles) {
  const css = readFileSync(cssFile, 'utf8');
  const classes = extractClassSelectors(css).filter(
    (className) => !shouldIgnoreClassName(className),
  );
  const unreferenced = classes.filter(
    (className) => countSourceReferences(className, sourceFiles) === 0,
  );

  rows.push({
    cssFile,
    totalClasses: classes.length,
    unreferenced,
  });
}

console.log('\nCSS reference report');
console.log(`CSS files scanned: ${cssFiles.length}`);
console.log(`Source files scanned: ${sourceFiles.length}`);

for (const row of rows) {
  console.log(`\n${row.cssFile}`);
  console.log(`Classes scanned: ${row.totalClasses}`);
  console.log(`No direct source reference: ${row.unreferenced.length}`);
  if (row.unreferenced.length > 0) {
    console.log(row.unreferenced.map((className) => `.${className}`).join('\n'));
  }
}

console.log('\nReview dynamic classes manually before deleting CSS.');
