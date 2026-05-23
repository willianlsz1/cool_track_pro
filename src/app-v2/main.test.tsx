import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

const mountAuthenticatedAppV2 = vi.fn().mockResolvedValue({ unmount: vi.fn() });
const createAuthenticatedAppV2BrowserOptions = vi.fn(() => ({ sessionReader: {} }));
const supabase = { auth: { getUser: vi.fn() } };

vi.mock('../core/supabase.js', () => ({ supabase }));
vi.mock('./authenticatedHarness', () => ({ mountAuthenticatedAppV2 }));
vi.mock('./authenticatedBrowserOptions', () => ({
  createAuthenticatedAppV2BrowserOptions,
}));

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
  vi.resetModules();
});

describe('app-v2 production bootstrap', () => {
  it('monta o app-v2 autenticado no root de producao quando ele existe', async () => {
    const root = document.createElement('div');
    root.id = 'app-v2-root';
    document.body.appendChild(root);

    await import('./main');

    expect(createAuthenticatedAppV2BrowserOptions).toHaveBeenCalledWith(supabase);
    expect(mountAuthenticatedAppV2).toHaveBeenCalledWith(root, { sessionReader: {} });
  });

  it('nao monta nada quando o root de producao nao existe', async () => {
    await import('./main');

    expect(createAuthenticatedAppV2BrowserOptions).not.toHaveBeenCalled();
    expect(mountAuthenticatedAppV2).not.toHaveBeenCalled();
  });

  it('mantem bootstrap de producao separado dos previews e do app legado', () => {
    const source = readFileSync(resolve(__dirname, 'main.tsx'), 'utf8');

    expect(source).toContain("document.getElementById('app-v2-root')");
    expect(source).toContain('mountAuthenticatedAppV2');
    expect(source).toContain('createAuthenticatedAppV2BrowserOptions');
    expect(source).toContain('../core/supabase.js');
    expect(source).not.toContain('app-v2-preview');
    expect(source).not.toContain('app-v2-authenticated-preview');
    expect(source).not.toContain('/src/app.js');
    expect(source).not.toContain('core/auth');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
  });
});
