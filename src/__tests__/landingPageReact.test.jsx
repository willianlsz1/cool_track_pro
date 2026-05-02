import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountLandingPageReact } from '../react/entrypoints/landingIsland.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createRoot() {
  const el = document.createElement('div');
  el.id = 'app';
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('LandingPage (React)', () => {
  it('renderiza marker de mount, secoes principais e CTAs com texto em PT', async () => {
    const root = createRoot();

    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    // Marker de mount — usado por especs E2E pra confirmar que a flag
    // ligou e a nova landing montou.
    expect(root.querySelector('[data-react-landing-page-mounted="true"]')).not.toBeNull();

    // Shell legacy parity — landing-active e mantido.
    expect(root.classList.contains('landing-active')).toBe(true);

    // Secoes principais ancoradas por id pra navegacao suave.
    expect(document.getElementById('segmentos')).not.toBeNull();
    expect(document.getElementById('recursos')).not.toBeNull();
    expect(document.getElementById('fluxo')).not.toBeNull();
    expect(document.getElementById('relatorios')).not.toBeNull();
    expect(document.getElementById('contato')).not.toBeNull();
    expect(document.getElementById('dashboard-preview')).not.toBeNull();

    // Conteudo em UTF-8 nativo (sem escapes Unicode literais).
    const text = root.textContent || '';
    expect(text).not.toMatch(/\\u00[0-9a-fA-F]{2}/);
    expect(text).toContain('Relatórios');
    expect(text).toContain('Câmaras frias');
    expect(text).toContain('Começar agora');

    // Anti-regressao: a landing React nao tem mais botao "Ver demonstracao"
    // (removido neste PR — produto nao tem demo flow).
    expect(text).not.toMatch(/Ver demonstra[çc][aã]o/i);
    const buttons = Array.from(root.querySelectorAll('button'));
    expect(buttons.some((b) => /Ver demonstra[çc][aã]o/i.test(b.textContent || ''))).toBe(false);
  });

  it('aciona onLogin/onStart quando o usuario clica em "Comecar agora"', async () => {
    const root = createRoot();
    const onLogin = vi.fn();

    await act(async () => {
      mountLandingPageReact(root, { onLogin });
    });

    const startBtn = Array.from(root.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Começar agora'),
    );
    expect(startBtn).toBeDefined();

    await act(async () => {
      startBtn?.click();
    });

    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('e idempotente — segundo mount no mesmo root nao duplica conteudo', async () => {
    const root = createRoot();

    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    expect(root.querySelectorAll('[data-react-landing-page-mounted="true"]')).toHaveLength(1);
  });
});
