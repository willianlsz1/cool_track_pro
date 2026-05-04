import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

async function loadOrcamentosView({ orcamentos = [] } = {}) {
  vi.resetModules();

  const getState = vi.fn(() => ({ orcamentos }));
  const markExpiredLocally = vi.fn((items) => items);

  vi.doMock('../core/state.js', () => ({ getState }));
  vi.doMock('../core/orcamentos.js', () => ({
    loadOrcamentos: vi.fn(),
    deleteOrcamento: vi.fn(),
    upsertOrcamento: vi.fn(),
    markExpiredLocally,
    TEMPLATE_INSTALACAO_SPLIT: [
      { descricao: 'Instalação unidade evaporadora', qty: 1, valorUnitario: 420 },
    ],
  }));
  vi.doMock('../core/toast.js', () => ({
    Toast: { success: vi.fn(), error: vi.fn() },
  }));
  vi.doMock('../core/modal.js', () => ({
    CustomConfirm: { show: vi.fn() },
  }));

  const module = await import('../ui/views/orcamentos.js');
  return { ...module, mocks: { getState, markExpiredLocally } };
}

describe('renderOrcamentos security and legacy contracts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '<div id="view-orcamentos"></div>';
  });

  it('renders empty state with the existing public classes and create action', async () => {
    const { renderOrcamentos } = await loadOrcamentosView({ orcamentos: [] });

    await act(async () => {
      await renderOrcamentos();
    });

    const container = document.getElementById('view-orcamentos');
    expect(container?.querySelector('.orc-page')).not.toBeNull();
    expect(container?.querySelector('.orc-empty')).not.toBeNull();
    expect(
      container?.querySelector('[data-action="open-orcamento-modal"][data-mode="create"]'),
    ).not.toBeNull();
  });

  it('preserves list ids, classes, filters and primary data-action contracts', async () => {
    const { renderOrcamentos } = await loadOrcamentosView({
      orcamentos: [
        {
          id: 'orc-1',
          numero: 'ORC-1',
          clienteNome: 'Cliente Alpha',
          clienteTelefone: '11999990000',
          titulo: 'Instalacao',
          total: 100,
          status: 'enviado',
          createdAt: '2026-04-10T10:00:00.000Z',
          enviadoEm: '2026-04-11T10:00:00.000Z',
          validadeDias: 7,
        },
      ],
    });

    await act(async () => {
      await renderOrcamentos();
    });

    const container = document.getElementById('view-orcamentos');
    expect(container?.querySelector('#orc-busca.orc-search__input')).not.toBeNull();
    expect(
      container?.querySelector('.orc-filter-chips [data-action="orc-set-status-filter"]'),
    ).not.toBeNull();
    expect(container?.querySelector('.orc-cards')).not.toBeNull();
    expect(container?.querySelector('.orc-card[data-id="orc-1"]')).not.toBeNull();
    expect(
      container?.querySelector('[data-action="open-orcamento-modal"][data-mode="edit"]'),
    ).not.toBeNull();
    expect(container?.querySelector('[data-action="orc-send-signature"]')).not.toBeNull();
    expect(container?.querySelector('[data-action="orc-share"]')).not.toBeNull();
    expect(container?.querySelector('[data-action="orc-download"]')).not.toBeNull();
    expect(container?.querySelector('[data-action="orc-mark-approved"]')).not.toBeNull();
    expect(container?.querySelector('[data-action="orc-delete"]')).not.toBeNull();
  });

  it('escapes dynamic orcamento content rendered through legacy HTML', async () => {
    const { renderOrcamentos } = await loadOrcamentosView({
      orcamentos: [
        {
          id: 'orc-<unsafe>',
          numero: '<img src=x onerror=alert(1)>',
          clienteNome: '<script>alert(1)</script>',
          clienteTelefone: '<svg onload=alert(1)>',
          titulo: '<b>Unsafe</b>',
          total: 50,
          status: 'aprovado',
          createdAt: '2026-04-10T10:00:00.000Z',
          assinadoEm: '2026-04-11T10:00:00.000Z',
          assinadoNome: '<iframe src=javascript:alert(1)>',
        },
      ],
    });

    await act(async () => {
      await renderOrcamentos();
    });

    const html = document.getElementById('view-orcamentos').innerHTML;
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;b&gt;Unsafe&lt;/b&gt;');
    expect(html).toContain('&lt;iframe src=javascript:alert(1)&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<iframe src=javascript:alert(1)>');
  });
});
