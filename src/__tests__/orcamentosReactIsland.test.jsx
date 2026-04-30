import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountOrcamentosReact,
  unmountOrcamentosReact,
} from '../react/entrypoints/orcamentosIsland.jsx';
import { ORCAMENTO_ACTIONS } from '../ui/viewModels/orcamentosViewModel.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createViewModel(overrides = {}) {
  return {
    filters: { statusFilter: 'todos', busca: '' },
    statusFilters: [
      { id: 'todos', label: 'Todos', isActive: true },
      { id: 'enviado', label: 'Enviado', isActive: false },
    ],
    kpis: {
      totalAtivos: 1,
      totalAprovados: 0,
      valorPipeline: 1250,
      valorPipelineLabel: 'R$ 1.250,00',
    },
    isEmpty: false,
    isFilterEmpty: false,
    filterEmptyMessage: 'Nenhum orcamento corresponde ao filtro.',
    emptyState: null,
    cards: [
      {
        id: 'orc-1',
        numero: 'ORC-2026-0001',
        statusLabel: 'Enviado',
        statusMeta: { label: 'Enviado', color: '#51a3ff', bg: 'rgba(81,163,255,0.12)' },
        totalLabel: 'R$ 1.250,00',
        titleLabel: 'Instalacao split',
        clienteLine: 'Cliente Alpha',
        createdLabel: 'Criado 10/04/2026',
        validityLabel: 'Vale ate 18/04/2026',
        signed: null,
        actions: [
          {
            kind: 'edit',
            action: ORCAMENTO_ACTIONS.openModal,
            mode: 'edit',
            id: 'orc-1',
            label: 'Ver / editar',
          },
          {
            kind: 'sendSignature',
            action: ORCAMENTO_ACTIONS.sendSignature,
            id: 'orc-1',
            label: 'Enviar p/ assinatura',
            title: 'Gera link unico de assinatura e envia pelo WhatsApp',
          },
          { kind: 'share', action: ORCAMENTO_ACTIONS.share, id: 'orc-1', label: 'WhatsApp (PDF)' },
          {
            kind: 'download',
            action: ORCAMENTO_ACTIONS.download,
            id: 'orc-1',
            label: 'Baixar PDF',
            title: 'Baixar PDF do orcamento',
          },
          {
            kind: 'markApproved',
            action: ORCAMENTO_ACTIONS.markApproved,
            id: 'orc-1',
            label: 'Marcar aprovado',
          },
          {
            kind: 'delete',
            action: ORCAMENTO_ACTIONS.delete,
            id: 'orc-1',
            ariaLabel: 'Apagar orcamento',
            title: 'Apagar',
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe('orcamentos React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in #view-orcamentos preserving legacy ids, classes and action contracts', async () => {
    document.body.innerHTML = '<div id="view-orcamentos"></div>';
    const root = document.getElementById('view-orcamentos');
    const onSearchInput = vi.fn();

    await act(async () => {
      mountOrcamentosReact(root, { viewModel: createViewModel(), onSearchInput });
    });

    expect(root?.dataset.reactOrcamentosMounted).toBe('true');
    expect(root?.querySelector('.orc-page')).not.toBeNull();
    expect(root?.querySelector('#orc-busca.orc-search__input')).not.toBeNull();
    expect(
      root?.querySelector('.orc-filter-chips [data-action="orc-set-status-filter"]'),
    ).not.toBeNull();
    expect(root?.querySelector('.orc-cards')).not.toBeNull();

    const card = root?.querySelector('.orc-card[data-id="orc-1"]');
    expect(card).not.toBeNull();
    expect(card?.querySelector('.orc-card__numero')?.textContent).toContain('ORC-2026-0001');
    expect(card?.querySelector('.orc-status-pill')?.textContent).toContain('Enviado');
    expect(
      card?.querySelector('[data-action="open-orcamento-modal"][data-mode="edit"]'),
    ).not.toBeNull();
    expect(card?.querySelector('[data-action="orc-send-signature"]')).not.toBeNull();
    expect(card?.querySelector('[data-action="orc-share"]')).not.toBeNull();
    expect(card?.querySelector('[data-action="orc-download"]')).not.toBeNull();
    expect(card?.querySelector('[data-action="orc-mark-approved"]')).not.toBeNull();
    expect(card?.querySelector('[data-action="orc-delete"]')).not.toBeNull();
  });

  it('renders empty and filter-empty states with legacy contracts', async () => {
    document.body.innerHTML = '<div id="view-orcamentos"></div>';
    const root = document.getElementById('view-orcamentos');

    await act(async () => {
      mountOrcamentosReact(root, {
        viewModel: createViewModel({
          isEmpty: true,
          cards: [],
          emptyState: { action: ORCAMENTO_ACTIONS.openModal, mode: 'create' },
        }),
      });
    });

    expect(root?.querySelector('.orc-empty')).not.toBeNull();
    expect(
      root?.querySelector('[data-action="open-orcamento-modal"][data-mode="create"]'),
    ).not.toBeNull();

    await act(async () => {
      mountOrcamentosReact(root, {
        viewModel: createViewModel({
          isEmpty: false,
          isFilterEmpty: true,
          cards: [],
          filterEmptyMessage: 'Nenhum orcamento corresponde ao filtro.',
        }),
      });
    });

    expect(root?.querySelector('.orc-empty-filter')?.textContent).toContain(
      'Nenhum orcamento corresponde ao filtro.',
    );
  });

  it('updates an existing root instead of creating multiple roots for repeated calls', async () => {
    document.body.innerHTML = '<div id="view-orcamentos"></div>';
    const root = document.getElementById('view-orcamentos');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountOrcamentosReact(root, { viewModel: createViewModel() });
      mountOrcamentosReact(root, {
        viewModel: createViewModel({
          cards: [
            {
              ...createViewModel().cards[0],
              id: 'orc-2',
              numero: 'ORC-2026-0002',
              titleLabel: 'Novo titulo',
            },
          ],
        }),
      });
    });

    const cards = root?.querySelectorAll('.orc-card');
    expect(cards).toHaveLength(1);
    expect(cards?.[0].getAttribute('data-id')).toBe('orc-2');
    expect(cards?.[0].textContent).toContain('Novo titulo');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated unmount calls', async () => {
    document.body.innerHTML = '<div id="view-orcamentos"></div>';
    const root = document.getElementById('view-orcamentos');

    await act(async () => {
      mountOrcamentosReact(root, { viewModel: createViewModel() });
      unmountOrcamentosReact(root);
      unmountOrcamentosReact(root);
    });

    expect(root?.dataset.reactOrcamentosMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('escapes dynamic content and does not use unsafe React HTML APIs', async () => {
    document.body.innerHTML = '<div id="view-orcamentos"></div>';
    const root = document.getElementById('view-orcamentos');

    await act(async () => {
      mountOrcamentosReact(root, {
        viewModel: createViewModel({
          cards: [
            {
              ...createViewModel().cards[0],
              numero: '<img src=x onerror=alert(1)>',
              titleLabel: '<script>alert(1)</script>',
              clienteLine: '<svg onload=alert(1)>',
              signed: {
                nome: '<iframe src=javascript:alert(1)>',
                dateLabel: '11/04/2026',
              },
            },
          ],
        }),
      });
    });

    const html = root?.innerHTML || '';
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;svg onload=alert(1)&gt;');
    expect(html).toContain('&lt;iframe src=javascript:alert(1)&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');

    const source = readFileSync('src/react/pages/OrcamentosPage.jsx', 'utf8');
    expect(source).not.toMatch(/dangerouslySetInnerHTML|innerHTML/);
  });
});
