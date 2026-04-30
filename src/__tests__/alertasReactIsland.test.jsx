import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountAlertasReact, unmountAlertasReact } from '../react/entrypoints/alertasIsland.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createViewModel(overrides = {}) {
  return {
    contextBanner: null,
    cards: [
      {
        key: 'equipamento:eq-1:0',
        kind: 'equipamento',
        action: 'view-equip',
        dataId: 'eq-1',
        icon: '!',
        title: 'Alerta ativo',
        subtitle: 'Subtitulo',
        equipmentLabel: 'Split 01',
        tone: 'critical',
      },
    ],
    emptyState: null,
    ...overrides,
  };
}

describe('alertas React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in #view-alertas preserving legacy ids and data-action contracts', async () => {
    document.body.innerHTML = '<div id="view-alertas"></div>';
    const root = document.getElementById('view-alertas');

    await act(async () => {
      mountAlertasReact(root, { viewModel: createViewModel() });
    });

    expect(root?.dataset.reactAlertasMounted).toBe('true');
    expect(document.querySelector('#alertas-contextual')).not.toBeNull();
    expect(document.querySelector('#lista-alertas[role="list"]')).not.toBeNull();

    const card = document.querySelector('.alert-card');
    expect(card?.getAttribute('data-action')).toBe('view-equip');
    expect(card?.getAttribute('data-id')).toBe('eq-1');
    expect(card?.getAttribute('role')).toBe('listitem');
    expect(card?.getAttribute('tabindex')).toBe('0');
    expect(card?.classList.contains('alert-card--critical')).toBe(true);
  });

  it('updates an existing root instead of creating multiple roots for repeated calls', async () => {
    document.body.innerHTML = '<div id="view-alertas"></div>';
    const root = document.getElementById('view-alertas');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountAlertasReact(root, { viewModel: createViewModel() });
      mountAlertasReact(root, {
        viewModel: createViewModel({
          cards: [
            {
              key: 'cliente:cli-1',
              kind: 'cliente',
              action: 'go-cliente-equipamentos',
              dataId: 'cli-1',
              clienteNome: 'Cliente 1',
              icon: '\uD83D\uDD14',
              title: 'Voltar ao cliente hoje: Cliente 1',
              subtitle: 'Alerta de retorno ao cliente.',
              equipmentLabel: 'Cliente',
              tone: 'warn',
            },
          ],
        }),
      });
    });

    const cards = document.querySelectorAll('.alert-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].getAttribute('data-action')).toBe('go-cliente-equipamentos');
    expect(cards[0].getAttribute('data-cliente-nome')).toBe('Cliente 1');
    expect(cards[0].textContent).toContain('Voltar ao cliente hoje: Cliente 1');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated unmount calls', async () => {
    document.body.innerHTML = '<div id="view-alertas"></div>';
    const root = document.getElementById('view-alertas');

    await act(async () => {
      mountAlertasReact(root, { viewModel: createViewModel() });
      unmountAlertasReact(root);
      unmountAlertasReact(root);
    });

    expect(root?.dataset.reactAlertasMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });
});
