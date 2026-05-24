import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountEquipamentosListDom,
  unmountEquipamentosListDom,
} from '../ui/views/equipamentos/ui/listRenderer.js';
import { EQUIPAMENTOS_ACTIONS } from '../ui/viewModels/equipamentosContracts.js';

function createCard(overrides = {}) {
  return {
    id: 'eq-1',
    name: 'Split Alpha',
    statusClass: 'warn',
    statusLabel: 'Em atencao',
    ariaLabel: 'Split Alpha - Em atencao',
    isIdle: false,
    visual: {
      photoUrl: '',
      initials: 'SA',
      tone: 2,
    },
    nameClass: '',
    tagParts: ['ALPHA-01', 'R410A', 'Alta'],
    componentPill: null,
    subtitle: 'Sala tecnica',
    score: 82,
    healthClass: 'ok',
    risk: {
      classification: 'medio',
      label: 'Medio',
      score: 35,
      factors: ['preventiva sem agenda'],
    },
    timeline: null,
    primaryLabel: 'PROXIMA ACAO',
    primaryTitle: 'Registrar preventiva',
    primaryMeta: '',
    ctaLabel: 'Registrar servico',
    ...overrides,
  };
}

function createViewModel(overrides = {}) {
  const card = createCard();
  return {
    listTitle: 'Todos os equipamentos',
    cards: [card],
    idleCards: [],
    activeCards: [card],
    clusterActive: false,
    quickMove: null,
    emptyState: null,
    ...overrides,
  };
}

describe('equipamentos DOM flat list renderer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts only in #lista-equip preserving card classes and list actions', async () => {
    document.body.innerHTML =
      '<section id="view-equipamentos"><div id="lista-equip"></div></section>';
    const root = document.getElementById('lista-equip');

    mountEquipamentosListDom(root, { viewModel: createViewModel() });

    expect(root?.dataset.equipamentosListMounted).toBe('true');
    expect(document.getElementById('view-equipamentos')?.dataset.equipamentosListMounted).toBe(
      undefined,
    );
    expect(root?.querySelector('[data-testid="equipamentos-list"]')).not.toBeNull();
    expect(root?.querySelector('.equip-card[data-id="eq-1"]')?.getAttribute('data-action')).toBe(
      EQUIPAMENTOS_ACTIONS.viewEquip,
    );
    expect(root?.querySelector('.equip-card__type-icon')).not.toBeNull();
    expect(
      root?.querySelector(
        `.equip-card__type-icon[data-action="${EQUIPAMENTOS_ACTIONS.openPhotosEditor}"][data-id="eq-1"]`,
      ),
    ).not.toBeNull();
    expect(
      root?.querySelector(
        `.equip-card__primary-cta[data-action="${EQUIPAMENTOS_ACTIONS.goRegisterEquip}"][data-id="eq-1"]`,
      ),
    ).not.toBeNull();
  });

  it('updates an existing root instead of creating duplicate React roots', async () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';
    const root = document.getElementById('lista-equip');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mountEquipamentosListDom(root, { viewModel: createViewModel() });
    mountEquipamentosListDom(root, {
      viewModel: createViewModel({
        cards: [
          createCard({ id: 'eq-2', name: 'Camara Beta', visual: { initials: 'CB', tone: 1 } }),
        ],
        activeCards: [
          createCard({ id: 'eq-2', name: 'Camara Beta', visual: { initials: 'CB', tone: 1 } }),
        ],
      }),
    });

    expect(root?.querySelectorAll('.equip-card')).toHaveLength(1);
    expect(root?.querySelector('.equip-card')?.getAttribute('data-id')).toBe('eq-2');
    expect(root?.textContent).toContain('Camara Beta');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated unmount calls', async () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';
    const root = document.getElementById('lista-equip');

    mountEquipamentosListDom(root, { viewModel: createViewModel() });
    unmountEquipamentosListDom(root);
    unmountEquipamentosListDom(root);

    expect(root?.dataset.equipamentosListMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders empty state with legacy action contracts', async () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';
    const root = document.getElementById('lista-equip');

    mountEquipamentosListDom(root, {
      viewModel: createViewModel({
        cards: [],
        activeCards: [],
        emptyState: {
          icon: '-',
          title: 'Nenhum equipamento ainda',
          description: 'Cadastre o primeiro equipamento.',
          cta: {
            label: '+ Novo equipamento',
            action: EQUIPAMENTOS_ACTIONS.openModal,
            id: 'modal-add-eq',
            tone: 'primary',
            size: 'sm',
            autoWidth: true,
          },
        },
      }),
    });

    expect(root?.querySelector('.empty-state')?.textContent).toContain('Nenhum equipamento ainda');
    expect(
      root?.querySelector(
        `[data-action="${EQUIPAMENTOS_ACTIONS.openModal}"][data-id="modal-add-eq"]`,
      ),
    ).not.toBeNull();
  });

  it('renders quick move controls and keeps delegated handlers actionable', async () => {
    document.body.innerHTML =
      '<section id="view-equipamentos"><div id="lista-equip"></div></section>';
    const view = document.getElementById('view-equipamentos');
    const root = document.getElementById('lista-equip');
    const delegatedHandler = vi.fn();
    view?.addEventListener('click', (event) => {
      const target = event.target.closest?.('[data-action]');
      delegatedHandler(target?.getAttribute('data-action'));
    });

    mountEquipamentosListDom(root, {
      viewModel: createViewModel({
        cards: [createCard({ id: 'eq-1' }), createCard({ id: 'eq-2', name: 'Split Beta' })],
        activeCards: [createCard({ id: 'eq-1' }), createCard({ id: 'eq-2', name: 'Split Beta' })],
        quickMove: {
          equipIds: ['eq-1', 'eq-2'],
          setoresDoCliente: [{ id: 's1', nome: 'Sala tecnica' }],
          setoresOrfaos: [{ id: 's2', nome: 'Sem cliente' }],
        },
      }),
    });

    expect(root?.querySelector('.quick-move-banner')?.getAttribute('data-equip-ids')).toBe(
      'eq-1,eq-2',
    );
    expect(root?.querySelector('#quick-move-target-setor')).not.toBeNull();
    const moveButton = root?.querySelector(
      `[data-action="${EQUIPAMENTOS_ACTIONS.quickMoveEquipBatch}"]`,
    );
    expect(moveButton).not.toBeNull();

    moveButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    root
      ?.querySelector(`[data-action="${EQUIPAMENTOS_ACTIONS.viewEquip}"][data-id="eq-1"]`)
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(delegatedHandler).toHaveBeenCalledWith(EQUIPAMENTOS_ACTIONS.quickMoveEquipBatch);
    expect(delegatedHandler).toHaveBeenCalledWith(EQUIPAMENTOS_ACTIONS.viewEquip);
  });

  it('escapes dynamic content and avoids unsafe React HTML APIs', async () => {
    document.body.innerHTML = '<div id="lista-equip"></div>';
    const root = document.getElementById('lista-equip');
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    mountEquipamentosListDom(root, {
      viewModel: createViewModel({
        cards: [
          createCard({
            id: 'eq-xss',
            name: malicious,
            tagParts: [malicious, malicious, malicious],
            subtitle: malicious,
            primaryTitle: malicious,
            risk: {
              classification: 'medio',
              label: malicious,
              score: 9,
              factors: [malicious],
            },
          }),
        ],
        activeCards: [],
      }),
    });

    const html = root?.innerHTML || '';
    expect(root?.textContent).toContain('<script>alert(2)</script>');
    expect(html).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(2)</script>');
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img[src="x"]')).toBeNull();
    expect(root?.querySelector('[onerror]')).toBeNull();

    const pageSource = readFileSync('src/ui/views/equipamentos/ui/listRenderer.js', 'utf8');
    expect(pageSource).not.toMatch(/dangerouslySetInnerHTML/);
  });

  it('keeps DOM renderer in the list bridge, not the legacy adapter or React island', () => {
    const adapterSource = readFileSync('src/ui/views/equipamentos.js', 'utf8');
    const bridgeSource = readFileSync('src/ui/views/equipamentos/bridges/listBridge.js', 'utf8');

    expect(adapterSource).not.toContain('equipamentosListIsland.jsx');
    expect(bridgeSource).toContain('../ui/listRenderer.js');
    expect(bridgeSource).not.toContain('../../../react/entrypoints/equipamentosListIsland.jsx');
    expect(adapterSource).not.toMatch(/from ['"]react['"]/);
    expect(adapterSource).not.toMatch(/createRoot/);
  });
});
