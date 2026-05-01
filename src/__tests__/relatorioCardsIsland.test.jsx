import { readFileSync } from 'node:fs';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountRelatorioCardsReact,
  unmountRelatorioCardsReact,
} from '../react/entrypoints/relatorioCardsIsland.jsx';
import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../ui/viewModels/relatorioContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const SAFE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/atK9E8AAAAASUVORK5CYII=';

function setRoot() {
  document.body.innerHTML = `
    <section id="${RELATORIO_PUBLIC_IDS.view}">
      <div id="${RELATORIO_PUBLIC_IDS.body}" class="rel-records"></div>
    </section>
  `;
  return document.getElementById(RELATORIO_PUBLIC_IDS.body);
}

function createEmptyCards(overrides = {}) {
  return {
    today: '01/05/2026',
    viewMode: RELATORIO_VIEW_MODES.compact,
    isEmpty: true,
    showCorretivasBanner: false,
    corretivasBanner: null,
    proximasAcoes: [],
    records: [],
    ...overrides,
  };
}

function createRecord(overrides = {}) {
  return {
    id: 'reg-1',
    title: 'Preventiva',
    tipoTone: 'cyan',
    tipoIcon: 'shieldCheck',
    statusTone: 'ok',
    statusLabel: 'Concluido',
    dateText: '20/04/2026 09:00',
    relativeText: 'ha 11 dias',
    singleEquipFilter: false,
    equipName: 'Split Recepcao',
    equipTag: 'SP-01',
    technician: 'Ana',
    cost: {
      totalText: 'R$ 120,00',
      partsText: 'R$ 100,00',
      laborText: 'R$ 20,00',
    },
    signature: {
      state: 'available',
      recordId: 'reg-1',
      clienteNome: 'Cliente ACME',
      dataUrl: SAFE_SIGNATURE,
    },
    equipmentSpecs: [
      { label: 'Equipamento', value: 'Split Recepcao' },
      { label: 'TAG', value: 'SP-01', mono: true },
      { label: 'Local', value: 'Recepcao' },
      { label: 'Fluido', value: 'R410A' },
    ],
    pecas: 'Filtro lavavel',
    proxima: {
      dateText: '10/05/2026',
      tone: 'gold',
      label: 'daqui 9d',
    },
    obs: 'Filtros limpos e fluxo ok',
    expanded: false,
    ...overrides,
  };
}

function createFilledCards(overrides = {}) {
  return {
    ...createEmptyCards({
      isEmpty: false,
      showCorretivasBanner: true,
      corretivasBanner: { count: 2, total: 3, pct: 67 },
      proximasAcoes: [
        {
          equipNome: 'Split Recepcao',
          dateText: '10/05/2026',
          tone: 'warn',
          label: 'daqui 9d',
        },
      ],
      records: [
        createRecord(),
        createRecord({
          id: 'reg-2',
          title: 'Corretiva',
          tipoTone: 'gold',
          tipoIcon: 'wrench',
          statusTone: 'warn',
          statusLabel: 'Atencao',
          equipName: 'Fan Coil Clinica',
          equipTag: 'FC-02',
          technician: 'Bia',
          cost: null,
          signature: { state: 'none' },
          equipmentSpecs: [{ label: 'Equipamento', value: 'Fan Coil Clinica' }],
          pecas: '',
          proxima: null,
          obs: 'Ruido intermitente',
        }),
      ],
    }),
    ...overrides,
  };
}

function expectNoExecutableHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
}

describe('relatorio cards React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('monta somente em #relatorio-corpo preservando estado vazio e CTA legado', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioCardsReact(root, { cards: createEmptyCards() });
    });

    expect(root?.dataset.reactRelatorioCardsMounted).toBe('true');
    expect(root?.dataset.viewMode).toBe(RELATORIO_VIEW_MODES.compact);
    expect(root?.classList.contains('rel-records')).toBe(true);
    expect(
      document.getElementById(RELATORIO_PUBLIC_IDS.view)?.dataset.reactRelatorioCardsMounted,
    ).toBe(undefined);
    expect(root?.querySelector('.rel-empty')).not.toBeNull();
    expect(root?.querySelector('.rel-empty__cta')?.getAttribute('data-nav')).toBe(
      RELATORIO_NAV_TARGETS.registro,
    );
    expect(root?.querySelector('.rel-record')).toBeNull();
    expectNoExecutableHtml(root);
  });

  it('atualiza root existente sem criar roots ou render duplicado', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountRelatorioCardsReact(root, { cards: createEmptyCards() });
      mountRelatorioCardsReact(root, { cards: createFilledCards() });
    });

    expect(root?.querySelectorAll('.rel-empty')).toHaveLength(0);
    expect(root?.querySelectorAll('.rel-records')).toHaveLength(0);
    expect(root?.querySelectorAll('.rel-record')).toHaveLength(2);
    expect(root?.querySelectorAll('.rel-record[data-id="reg-1"]')).toHaveLength(1);
    expect(root?.querySelector('.rel-corretivas-banner')).not.toBeNull();
    expect(root?.querySelector('.rel-proximas__item')).not.toBeNull();
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('desmonta com seguranca e tolera chamadas repetidas', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioCardsReact(root, { cards: createFilledCards() });
      unmountRelatorioCardsReact(root);
      unmountRelatorioCardsReact(root);
    });

    expect(root?.dataset.reactRelatorioCardsMounted).toBeUndefined();
    expect(root?.dataset.viewMode).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renderiza registros preservando classes, atributos e modo compacto/detalhado', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioCardsReact(root, { cards: createFilledCards() });
    });

    const first = root?.querySelector('.rel-record[data-id="reg-1"]');
    expect(first).not.toBeNull();
    expect(first?.classList.contains('rel-record')).toBe(true);
    expect(first?.querySelector('.rel-record__head')).not.toBeNull();
    expect(first?.querySelector('.rel-record__title')?.textContent).toBe('Preventiva');
    expect(first?.querySelector('.rel-record__meta')?.textContent).toContain('20/04/2026');
    expect(first?.querySelector('.rel-record__toggle')?.getAttribute('data-rel-action')).toBe(
      RELATORIO_ACTIONS.toggleCard,
    );
    expect(first?.querySelector('.rel-record__toggle')?.getAttribute('data-id')).toBe('reg-1');
    expect(first?.querySelector('.rel-record__details')?.hasAttribute('hidden')).toBe(true);
    expect(first?.querySelector('.rel-record__section')).not.toBeNull();
    expect(first?.querySelector('.rel-spec')).not.toBeNull();
    expect(first?.querySelector('.rel-status')).not.toBeNull();
    expect(first?.querySelector('.rel-tipo-icon')).not.toBeNull();
    expect(first?.textContent).toContain('Split Recepcao');
    expect(first?.textContent).toContain('SP-01');
    expect(first?.textContent).toContain('Ana');
    expect(first?.textContent).toContain('R$ 120,00');
    expect(first?.textContent).toContain('Filtro lavavel');
    expect(first?.textContent).toContain('Filtros limpos e fluxo ok');

    await act(async () => {
      mountRelatorioCardsReact(root, {
        cards: createFilledCards({
          viewMode: RELATORIO_VIEW_MODES.detailed,
          records: [createRecord({ expanded: true })],
        }),
      });
    });

    const detailed = root?.querySelector('.rel-record[data-id="reg-1"]');
    expect(root?.dataset.viewMode).toBe(RELATORIO_VIEW_MODES.detailed);
    expect(detailed?.classList.contains('is-expanded')).toBe(true);
    expect(detailed?.querySelector('.rel-record__toggle')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(detailed?.querySelector('.rel-record__details')?.hasAttribute('hidden')).toBe(false);
  });

  it('preserva assinatura apenas como contrato DOM e bloqueia URLs inseguras', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioCardsReact(root, {
        cards: createFilledCards({
          records: [
            createRecord(),
            createRecord({
              id: 'reg-xss',
              signature: {
                state: 'available',
                recordId: 'reg-xss',
                clienteNome: 'Cliente XSS',
                dataUrl: 'javascript:alert(1)',
              },
            }),
          ],
        }),
      });
    });

    const signatureButton = root?.querySelector('[data-action="rel-view-signature"]');
    expect(signatureButton).not.toBeNull();
    expect(signatureButton?.getAttribute('data-id')).toBe('reg-1');
    expect(signatureButton?.querySelector('img')?.getAttribute('src')).toBe(SAFE_SIGNATURE);
    expect(root?.querySelector('.rel-record[data-id="reg-xss"] img')).toBeNull();
    expect(
      root?.querySelector('.rel-record[data-id="reg-xss"] .rel-sigthumb--unavailable'),
    ).not.toBeNull();
    expectNoExecutableHtml(root);
  });

  it('renderiza dados maliciosos como texto sem HTML/script/event handler injection', async () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await act(async () => {
      mountRelatorioCardsReact(root, {
        cards: createFilledCards({
          proximasAcoes: [
            { equipNome: malicious, dateText: malicious, label: malicious, tone: 'warn' },
          ],
          records: [
            createRecord({
              id: 'reg-xss',
              title: malicious,
              equipName: malicious,
              equipTag: malicious,
              technician: malicious,
              equipmentSpecs: [{ label: malicious, value: malicious }],
              pecas: malicious,
              obs: malicious,
              signature: {
                state: 'available',
                recordId: 'reg-xss',
                clienteNome: malicious,
                dataUrl: 'javascript:alert(1)',
              },
            }),
          ],
        }),
      });
    });

    expect(root?.textContent).toContain('<script>alert(2)</script>');
    expect(root?.innerHTML).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expect(root?.querySelector('img')).toBeNull();
    expectNoExecutableHtml(root);
  });

  it('mantem componente puro e createRoot fora do adapter legado', () => {
    const componentSource = readFileSync('src/react/pages/RelatorioCards.jsx', 'utf8');
    const adapterSource = readFileSync('src/ui/views/relatorio.js', 'utf8');

    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
    expect(adapterSource).toContain('../../react/entrypoints/relatorioCardsIsland.jsx');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
