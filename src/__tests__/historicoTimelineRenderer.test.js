import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountHistoricoTimelineDom,
  unmountHistoricoTimelineDom,
} from '../ui/views/historico/timelineRenderer.js';

function setRoot() {
  document.body.innerHTML = `
    <main id="view-historico">
      <section id="timeline"></section>
    </main>
  `;
  return document.getElementById('timeline');
}

function createTimelineItem(overrides = {}) {
  return {
    id: 'reg-1',
    equipId: 'eq-1',
    isLatest: true,
    status: 'warn',
    headerDateLabel: '09:30',
    headPills: [
      { id: 'today', label: 'Hoje', color: 'success' },
      { id: 'type', label: 'Preventiva mensal', color: 'cyan' },
    ],
    serviceTitle: 'Preventiva mensal',
    equipmentName: 'Split Recepcao',
    setorName: 'Loja',
    setorTag: 'LOJA',
    context: 'Alpha Mercado - Loja - Split Recepcao',
    obs: 'Troca de filtros',
    meta: [
      { id: 'tecnico', icon: 'user', text: 'Ana' },
      { id: 'pecas', icon: 'box', text: 'Filtro G4' },
      {
        id: 'custo',
        className: 'meta-mono',
        prefix: 'Total: ',
        highlight: 'R$ 120',
        highlightClassName: 'meta-cyan',
        details: '(pecas R$ 80,00 - mao R$ 40,00)',
      },
    ],
    photoUrls: ['https://cdn.example/foto-1.jpg'],
    extraPhotoCount: 0,
    signature: {
      url: 'data:image/png;base64,assinatura',
      ariaLabel: 'Ver assinatura de Alpha Mercado em tamanho grande',
      alt: 'Assinatura registrada pelo cliente Alpha Mercado',
    },
    showFilterEquip: true,
    ...overrides,
  };
}

function createTimelineViewModel(overrides = {}) {
  return {
    operationSummary: { totalServicosHoje: 1, totalEquipHoje: 1 },
    attentionItems: [],
    emptyState: null,
    groups: [
      {
        id: 'hoje',
        label: 'Hoje',
        countLabel: '1 servico',
        items: [createTimelineItem()],
      },
    ],
    ...overrides,
  };
}

describe('historico timeline DOM renderer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts only in #timeline preserving groups, item classes and public attributes', () => {
    const root = setRoot();
    mountHistoricoTimelineDom(root, { viewModel: createTimelineViewModel() });

    expect(root?.dataset.historicoTimelineMounted).toBe('true');
    expect(document.getElementById('view-historico')?.dataset.historicoTimelineMounted).toBe(
      undefined,
    );
    expect(root?.querySelector('.hist-op-summary')).not.toBeNull();
    expect(root?.querySelector('.timeline')).not.toBeNull();
    expect(root?.querySelector('.hist-day-group')?.textContent).toContain('Hoje');
    expect(root?.querySelector('.timeline__item--latest')?.getAttribute('data-reg-id')).toBe(
      'reg-1',
    );
    expect(root?.querySelector('.timeline__dot')).not.toBeNull();
    expect(root?.querySelector('.timeline__item__service')?.textContent).toContain(
      'Preventiva mensal',
    );
    expect(root?.querySelector('.timeline__item__equipment')?.textContent).toContain(
      'Split Recepcao',
    );
    expect(root?.querySelector('[data-action="edit-reg"][data-id="reg-1"]')).not.toBeNull();
    expect(root?.querySelector('[data-action="delete-reg"][data-id="reg-1"]')).not.toBeNull();
    expect(
      root?.querySelector('[data-hist-action="toggle-card-menu"][data-id="reg-1"]'),
    ).not.toBeNull();
    expect(
      root?.querySelector('[data-hist-action="hist-filter-equip"][data-equip-id="eq-1"]'),
    ).not.toBeNull();
  });

  it('updates an existing root without duplicate React roots or duplicate renders', () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mountHistoricoTimelineDom(root, { viewModel: createTimelineViewModel() });
    mountHistoricoTimelineDom(root, {
      viewModel: createTimelineViewModel({
        groups: [
          {
            id: 'ontem',
            label: 'Ontem',
            countLabel: '1 servico',
            items: [
              createTimelineItem({
                id: 'reg-2',
                equipId: 'eq-2',
                serviceTitle: 'Corretiva',
                equipmentName: 'Chiller Central',
              }),
            ],
          },
        ],
      }),
    });

    expect(root?.querySelectorAll('.timeline')).toHaveLength(1);
    expect(root?.querySelectorAll('.timeline__item')).toHaveLength(1);
    expect(root?.querySelector('.timeline__item')?.getAttribute('data-reg-id')).toBe('reg-2');
    expect(root?.textContent).toContain('Chiller Central');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated calls', () => {
    const root = setRoot();
    mountHistoricoTimelineDom(root, { viewModel: createTimelineViewModel() });
    unmountHistoricoTimelineDom(root);
    unmountHistoricoTimelineDom(root);

    expect(root?.dataset.historicoTimelineMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders filtered empty state without depending on filters, modals, PDF or delete flows', () => {
    const root = setRoot();
    mountHistoricoTimelineDom(root, {
      viewModel: createTimelineViewModel({
        operationSummary: { totalServicosHoje: 0, totalEquipHoje: 0 },
        groups: [],
        emptyState: {
          variant: 'default',
          icon: 'search',
          title: 'Nenhum resultado para esse filtro',
          description: 'Tente outro termo ou remova um filtro acima.',
        },
      }),
    });

    expect(root?.querySelector('.empty-state')).not.toBeNull();
    expect(root?.querySelector('.empty-state')?.textContent).toContain(
      'Nenhum resultado para esse filtro',
    );
    expect(root?.querySelector('.timeline__item')).toBeNull();
  });

  it('preserves photo DOM contracts and omits retired signature actions', () => {
    const root = setRoot();
    mountHistoricoTimelineDom(root, {
      viewModel: createTimelineViewModel({
        groups: [
          {
            id: 'hoje',
            label: 'Hoje',
            countLabel: '2 servicos',
            items: [
              createTimelineItem({
                id: 'reg-safe',
                photoUrls: ['https://cdn.example/foto-safe.jpg', 'javascript:alert(1)'],
                signature: {
                  url: 'data:image/png;base64,assinatura',
                  ariaLabel: 'Ver assinatura segura',
                  alt: 'Assinatura registrada pelo cliente',
                },
              }),
              createTimelineItem({
                id: 'reg-unsafe',
                photoUrls: ['JaVaScRiPt:alert(2)'],
                signature: {
                  url: 'javascript:alert(3)',
                  ariaLabel: 'Assinatura insegura',
                  alt: 'Assinatura insegura',
                },
                isLatest: false,
              }),
            ],
          },
        ],
      }),
    });

    expect(
      root?.querySelector(
        '.timeline__item__photos-thumb img[src="https://cdn.example/foto-safe.jpg"]',
      ),
    ).not.toBeNull();
    expect(root?.querySelector('[data-photo-url^="javascript:"]')).toBeNull();
    expect(
      root?.querySelector('[data-hist-action="hist-view-signature"][data-id="reg-safe"]'),
    ).toBeNull();
    expect(
      root?.querySelector('[data-hist-action="hist-view-signature"][data-id="reg-unsafe"]'),
    ).toBeNull();
  });

  it('keeps current handlers actionable through data-action and data-hist-action attributes', () => {
    const root = setRoot();
    const view = document.getElementById('view-historico');
    const delegatedHandler = vi.fn();
    view?.addEventListener('click', (event) => {
      const target = event.target.closest?.('[data-action],[data-hist-action]');
      delegatedHandler(
        target?.getAttribute('data-action') || target?.getAttribute('data-hist-action'),
      );
    });
    mountHistoricoTimelineDom(root, { viewModel: createTimelineViewModel() });

    root
      ?.querySelector('[data-action="edit-reg"][data-id="reg-1"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    root
      ?.querySelector('[data-action="delete-reg"][data-id="reg-1"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(delegatedHandler).toHaveBeenCalledWith('edit-reg');
    expect(delegatedHandler).toHaveBeenCalledWith('delete-reg');
    expect(delegatedHandler).not.toHaveBeenCalledWith('hist-open-photo');
    expect(root?.querySelector('[data-hist-action="hist-view-signature"]')).toBeNull();
    expect(delegatedHandler).not.toHaveBeenCalledWith('hist-view-signature');
  });

  it('escapes dynamic text and avoids unsafe React HTML APIs', () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';
    mountHistoricoTimelineDom(root, {
      viewModel: createTimelineViewModel({
        groups: [
          {
            id: 'hoje',
            label: malicious,
            countLabel: '1 servico',
            items: [
              createTimelineItem({
                serviceTitle: malicious,
                equipmentName: malicious,
                setorName: malicious,
                obs: malicious,
                context: malicious,
                headPills: [{ id: 'type', label: malicious, color: 'cyan' }],
                meta: [{ id: 'tecnico', icon: 'user', text: malicious }],
                signature: null,
                photoUrls: [],
              }),
            ],
          },
        ],
      }),
    });

    const html = root?.innerHTML || '';
    expect(root?.textContent).toContain('<script>alert(2)</script>');
    expect(html).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(2)</script>');
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img[src="x"]')).toBeNull();
    expect(root?.querySelector('[onerror]')).toBeNull();

    const pageSource = readFileSync('src/ui/views/historico/timelineRenderer.js', 'utf8');
    expect(pageSource).not.toMatch(/dangerouslySetInnerHTML/);
  });

  it('keeps React root creation out of the current Historico adapter source', () => {
    const adapterSource = readFileSync('src/ui/views/historico.js', 'utf8');

    expect(adapterSource).not.toMatch(/react-dom\/client|createRoot/);
    expect(adapterSource).toContain('./historico/timelineRenderer.js');
    expect(adapterSource).not.toContain(['historicoTimeline', 'Island.jsx'].join(''));
  });
});
