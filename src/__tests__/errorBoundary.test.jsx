import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '../react/components/ErrorBoundary.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Componente que sempre lança no render. Usa flag externa pra alternar
// estado entre runs sem precisar de re-import.
const bombFlag = { shouldThrow: true };
function Bomb() {
  if (bombFlag.shouldThrow) {
    throw new Error('boom');
  }
  return <div>safe</div>;
}

function setupHost() {
  document.body.innerHTML = '<div id="host"></div>';
  const host = document.getElementById('host');
  return { host, root: createRoot(host) };
}

describe('<ErrorBoundary />', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    bombFlag.shouldThrow = true;
    // React 18 loga toda exception capturada por boundary no console.
    // Silenciar pra teste limpo.
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    document.body.innerHTML = '';
  });

  it('renderiza children no caminho feliz', async () => {
    const { host, root } = setupHost();

    await act(async () => {
      root.render(
        <ErrorBoundary name="test">
          <div>conteudo ok</div>
        </ErrorBoundary>,
      );
    });

    expect(host.textContent).toContain('conteudo ok');
    expect(host.querySelector('[role="alert"]')).toBeNull();

    await act(async () => {
      root.unmount();
    });
  });

  it('renderiza fallback default quando filho lança', async () => {
    const { host, root } = setupHost();

    await act(async () => {
      root.render(
        <ErrorBoundary name="test">
          <Bomb />
        </ErrorBoundary>,
      );
    });

    const alert = host.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert.textContent.toLowerCase()).toContain('algo deu errado');

    const button = host.querySelector('button');
    expect(button).not.toBeNull();
    expect(button.textContent.toLowerCase()).toContain('tentar novamente');

    await act(async () => {
      root.unmount();
    });
  });

  it('reset limpa o estado de erro e volta ao normal', async () => {
    const { host, root } = setupHost();

    await act(async () => {
      root.render(
        <ErrorBoundary name="test">
          <Bomb />
        </ErrorBoundary>,
      );
    });

    expect(host.querySelector('[role="alert"]')).not.toBeNull();

    // Simula correção do erro antes do reset
    bombFlag.shouldThrow = false;

    await act(async () => {
      host.querySelector('button').click();
    });

    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.textContent).toContain('safe');

    await act(async () => {
      root.unmount();
    });
  });

  it('chama prop onReset quando usuário clica tentar novamente', async () => {
    const onReset = vi.fn();
    const { host, root } = setupHost();

    await act(async () => {
      root.render(
        <ErrorBoundary name="test" onReset={onReset}>
          <Bomb />
        </ErrorBoundary>,
      );
    });

    // Pra não tentar re-renderizar Bomb depois do reset (ainda lança), desliga
    bombFlag.shouldThrow = false;

    await act(async () => {
      host.querySelector('button').click();
    });

    expect(onReset).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });

  it('usa fallback custom quando passado como render prop', async () => {
    const { host, root } = setupHost();

    await act(async () => {
      root.render(
        <ErrorBoundary
          name="test"
          fallback={(error, reset) => (
            <div data-testid="custom">
              custom: {error.message}
              <button type="button" onClick={reset}>
                retry
              </button>
            </div>
          )}
        >
          <Bomb />
        </ErrorBoundary>,
      );
    });

    expect(host.querySelector('[data-testid="custom"]')).not.toBeNull();
    expect(host.textContent).toContain('custom: boom');
    expect(host.querySelector('[role="alert"]')).toBeNull();

    await act(async () => {
      root.unmount();
    });
  });
});
