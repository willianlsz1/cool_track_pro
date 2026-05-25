import { readdirSync, readFileSync, statSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function listRuntimeSources(dir = 'src/app-v2'): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = `${dir}/${entry}`;
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listRuntimeSources(path);
    }

    if (!/\.(?:ts|tsx)$/.test(entry) || /\.test\.(?:ts|tsx)$/.test(entry)) {
      return [];
    }

    return [path.replace(/\\/g, '/')];
  });
}

function readSource(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('app-v2 boundary contracts', () => {
  it('keeps app-v2 runtime out of legacy auth and storage modules', () => {
    const sources = listRuntimeSources();
    const forbiddenPattern =
      /(?:core\/auth|core\\auth|core\/storage|core\\storage|localStorage|sessionStorage)/;

    const matches = sources.filter((sourcePath) => forbiddenPattern.test(readSource(sourcePath)));

    expect(matches).toEqual([]);
  });

  it('keeps direct Supabase client wiring limited to explicit app-v2 entrypoints', () => {
    const allowedDirectSupabaseImports = new Set([
      'src/app-v2/authenticatedPreview.tsx',
      'src/app-v2/main.tsx',
    ]);
    const matches = listRuntimeSources().filter((sourcePath) => {
      const source = readSource(sourcePath);

      return (
        !allowedDirectSupabaseImports.has(sourcePath) &&
        /(?:core\/supabase|core\\supabase|\.\.\/core\/supabase\.js)/.test(source)
      );
    });

    expect(matches).toEqual([]);
  });
});
