import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  _renderSetorGridForClienteEmptyHtml,
  _renderSetorGridForClienteHtml,
  configureSetorUI,
  renderSetorGrid,
} from '../../setor/setorUI.js';

const Utils = {
  escapeAttr: (value) => String(value).replaceAll('"', '&quot;'),
  escapeHtml: (value) => String(value).replaceAll('<', '&lt;'),
  getEl: vi.fn(),
};

function configure(overrides = {}) {
  configureSetorUI({
    Utils,
    emptyStateHtml: ({ cta }) =>
      `<section data-empty="setor"><button data-action="${cta.action}">${cta.label}</button></section>`,
    getState: () => ({ setores: [], equipamentos: [] }),
    setorCardHtml: (setor, equipamentos) => `
      <article class="setor-card" data-action="open-setor" data-id="${setor.id}" data-eq-count="${equipamentos.length}">
        <button data-action="edit-setor" data-id="${setor.id}">Editar</button>
        <button data-action="toggle-setor-menu" data-id="${setor.id}">Menu</button>
        <button data-action="delete-setor" data-id="${setor.id}">Excluir</button>
      </article>`,
    setToolbar: vi.fn(),
    unmountEquipamentosList: vi.fn(),
    ...overrides,
  });
}

describe('setorUI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    configure();
  });

  it('renderiza empty state por cliente tratando setores como opcionais', () => {
    const html = _renderSetorGridForClienteEmptyHtml({
      equipsSemSetor: [],
      clienteId: 'cliente-1',
      safeNome: 'Cliente A',
    });

    expect(html).toContain('Setores sao opcionais para Cliente A');
    expect(html).toContain('Voce pode manter equipamentos direto no cliente');
    expect(html).toContain('data-action="open-setor-modal"');
    expect(html).toContain('data-cliente-id="cliente-1"');
  });

  it('renderiza banner Sem setor no empty state com ação open-setor __sem_setor__', () => {
    const html = _renderSetorGridForClienteEmptyHtml({
      equipsSemSetor: [{ id: 'eq-1' }, { id: 'eq-2' }],
      clienteId: 'cliente-1',
      safeNome: 'Cliente A',
    });

    expect(html).toContain('2 equipamentos sem setor vinculado');
    expect(html).toContain('data-action="open-setor" data-id="__sem_setor__"');
  });

  it('renderiza tile Sem setor quando cliente tem setores e equipamentos órfãos', () => {
    const html = _renderSetorGridForClienteHtml({
      setoresDoCliente: [{ id: 'setor-1' }],
      equipamentos: [{ id: 'eq-1', clienteId: 'cliente-1', setorId: 'setor-1' }],
      equipsSemSetor: [{ id: 'eq-2', clienteId: 'cliente-1', setorId: null }],
      clienteId: 'cliente-1',
      safeNome: 'Cliente A',
    });

    expect(html).toContain('data-action="open-setor" data-id="__sem_setor__"');
    expect(html).toContain('Sem setor');
  });

  it('preserva card de setor com ações edit/toggle/delete quando aplicável', () => {
    const html = _renderSetorGridForClienteHtml({
      setoresDoCliente: [{ id: 'setor-1' }],
      equipamentos: [{ id: 'eq-1', clienteId: 'cliente-1', setorId: 'setor-1' }],
      equipsSemSetor: [],
      clienteId: 'cliente-1',
      safeNome: 'Cliente A',
    });

    expect(html).toContain('data-action="edit-setor"');
    expect(html).toContain('data-action="toggle-setor-menu"');
    expect(html).toContain('data-action="delete-setor"');
  });

  it('renderSetorGrid preserva empty state global com data-action open-setor-modal', () => {
    const list = document.createElement('div');
    const search = document.createElement('div');
    Utils.getEl.mockImplementation((id) => {
      if (id === 'lista-equip') return list;
      if (id === 'equip-search-bar') return search;
      return null;
    });

    renderSetorGrid();

    expect(list.innerHTML).toContain('data-action="open-setor-modal"');
    expect(search.style.display).toBe('none');
  });
});
