import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

const mountAuthenticatedAppV2 = vi.fn().mockResolvedValue({ unmount: vi.fn() });
const createAuthenticatedAppV2BrowserOptions = vi.fn(() => ({ sessionReader: {} }));
const mountAppV2 = vi.fn(() => ({ unmount: vi.fn() }));
const supabase = { auth: { getUser: vi.fn() } };

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
  vi.resetModules();
  vi.unmock('../core/supabase.js');
  vi.unmock('./authenticatedHarness');
  vi.unmock('./authenticatedBrowserOptions');
  vi.unmock('./index');
});

describe('app-v2 production bootstrap', () => {
  it('monta o app-v2 autenticado no root de producao quando ele existe', async () => {
    const root = document.createElement('div');
    root.id = 'app-v2-root';
    document.body.appendChild(root);
    mockAuthenticatedBootstrap();

    await import('./main');
    await flushBootstrap();

    expect(createAuthenticatedAppV2BrowserOptions).toHaveBeenCalledWith(supabase);
    expect(mountAuthenticatedAppV2).toHaveBeenCalledWith(root, { sessionReader: {} });
    expect(mountAppV2).not.toHaveBeenCalled();
  });

  it('nao monta nada quando o root de producao nao existe', async () => {
    mockAuthenticatedBootstrap();

    await import('./main');
    await flushBootstrap();

    expect(createAuthenticatedAppV2BrowserOptions).not.toHaveBeenCalled();
    expect(mountAuthenticatedAppV2).not.toHaveBeenCalled();
    expect(mountAppV2).not.toHaveBeenCalled();
  });

  it('monta fallback local quando o bootstrap autenticado nao tem env de Supabase', async () => {
    const root = document.createElement('div');
    root.id = 'app-v2-root';
    document.body.appendChild(root);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.doMock('../core/supabase.js', () => {
      throw new Error('[Supabase] Missing required environment variable: VITE_SUPABASE_ANON_KEY.');
    });
    vi.doMock('./index', () => ({ mountAppV2 }));

    await import('./main');
    await flushBootstrap();

    expect(createAuthenticatedAppV2BrowserOptions).not.toHaveBeenCalled();
    expect(mountAuthenticatedAppV2).not.toHaveBeenCalled();
    expect(mountAppV2).toHaveBeenCalledWith(root);
  });

  it('mantem bootstrap de producao separado dos previews e do app anterior', () => {
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

function mockAuthenticatedBootstrap() {
  vi.doMock('../core/supabase.js', () => ({ supabase }));
  vi.doMock('./authenticatedHarness', () => ({ mountAuthenticatedAppV2 }));
  vi.doMock('./authenticatedBrowserOptions', () => ({
    createAuthenticatedAppV2BrowserOptions,
  }));
  vi.doMock('./index', () => ({ mountAppV2 }));
}

async function flushBootstrap() {
  for (let index = 0; index < 10; index += 1) {
    await Promise.resolve();
  }
}
