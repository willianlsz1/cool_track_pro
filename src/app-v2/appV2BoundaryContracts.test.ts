import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, normalize, resolve } from 'node:path';

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

function listRelativeImports(source: string): string[] {
  return Array.from(source.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g), (match) => match[1]);
}

function resolveSourceImport(sourcePath: string, importPath: string): string {
  return normalize(resolve(dirname(sourcePath), importPath)).replace(/\\/g, '/');
}

describe('app-v2 boundary contracts', () => {
  it('keeps app-v2 runtime out of retired auth and storage modules', () => {
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

  it('keeps app-v2 runtime independent from retired UI trees and sensitive domains', () => {
    const root = normalize(resolve('.')).replace(/\\/g, '/');
    const forbiddenPrefixes = [
      ['src', 'ui'],
      ['src', 'features'],
      ['src', 'react'],
      ['src', 'domain', 'pdf'],
      ['src', 'domain', 'pmoc'],
      ['src', 'core', 'orcamentos'],
    ].map((segments) => `${root}/${segments.join('/')}`);
    const matches = listRuntimeSources().flatMap((sourcePath) => {
      const source = readSource(sourcePath);

      return listRelativeImports(source)
        .map((importPath) => resolveSourceImport(sourcePath, importPath))
        .filter((resolvedImport) =>
          forbiddenPrefixes.some((prefix) => resolvedImport.startsWith(prefix)),
        )
        .map((resolvedImport) => `${sourcePath} -> ${resolvedImport.slice(root.length + 1)}`);
    });

    expect(matches).toEqual([]);
  });
});
