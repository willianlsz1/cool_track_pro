import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function listMarkdownFiles(dir = '.') {
  const output = execFileSync('git', ['ls-files', '-z', '--', `${dir}/**/*.md`, '*.md'], {
    encoding: 'utf8',
  });

  return output.split('\0').filter(Boolean);
}

function listVersionedFiles(...patterns) {
  const output = execFileSync('git', ['ls-files', '-z', '--', ...patterns], {
    encoding: 'utf8',
  });

  return output.split('\0').filter((path) => path && existsSync(path));
}

function isAllowedMarkdown(path) {
  return (
    path === 'AGENTS.md' ||
    path === 'docs/rewrite/checkpoints-recentes-resumo.md' ||
    path.startsWith('matt-pocock-skills/skills/')
  );
}

describe('versioned markdown policy', () => {
  it('keeps checkpoint markdown consolidated and only preserves Matt Pocock skills', () => {
    expect(listMarkdownFiles().filter((path) => !isAllowedMarkdown(path))).toEqual([]);
  });

  it('does not keep stale QA metric artifacts after checkpoint consolidation', () => {
    expect(listVersionedFiles('docs/rewrite/qa-design-system-ui-*/metrics.json')).toEqual([]);
  });
});
