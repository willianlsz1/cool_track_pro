import { readFileSync } from 'node:fs';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountRelatorioControlsReact,
  unmountRelatorioControlsReact,
} from '../react/entrypoints/relatorioControlsIsland.jsx';
import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../ui/viewModels/relatorioContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setRoot() {
  document.body.innerHTML = `
    <section id="${RELATORIO_PUBLIC_IDS.view}">
      <div id="${RELATORIO_PUBLIC_IDS.controlsRoot}" style="display: contents"></div>
      <div id="${RELATORIO_PUBLIC_IDS.body}" class="rel-records"></div>
    </section>
  `;
  return document.getElementById(RELATORIO_PUBLIC_IDS.controlsRoot);
}

function createControls(overrides = {}) {
  return {
    pageTitle: 'Relatorio rapido',
    pageSubtitle: 'Gere e envie o PDF do servico em poucos toques.',
    viewMode: RELATORIO_VIEW_MODES.compact,
    isPro: false,
    advancedOpen: false,
    filters: {
      equipId: '',
      de: '',
      ate: '',
      hasPeriodoFilter: false,
      hasEquipFilter: false,
      periodoTxt: 'Todo o periodo',
      equipTxt: 'Todos os equipamentos',
    },
    equipOptions: [
      { id: 'eq-1', label: 'Split Recepcao - Sala' },
      { id: 'eq-2', label: 'Cassete Financeiro - Financeiro' },
    ],
    modeSegmentActive: 'servicos',
    ...overrides,
  };
}

function createFilteredControls(overrides = {}) {
  return createControls({
    pageTitle: 'Relatorios da empresa',
    pageSubtitle: 'Contexto Pro por cliente, setor e equipamento.',
    viewMode: RELATORIO_VIEW_MODES.detailed,
    isPro: true,
    advancedOpen: true,
    filters: {
      equipId: 'eq-1',
      de: '2026-04-01',
      ate: '2026-04-30',
      hasPeriodoFilter: true,
      hasEquipFilter: true,
      periodoTxt: '1 de abr a 30 de abr',
      equipTxt: 'Split Recepcao',
    },
    modeSegmentActive: 'cliente',
    ...overrides,
  });
}

function expectNoInjectedMarkup(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('img')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
}

describe('relatorio controls React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('monta somente no root dos controles preservando ids, classes e contratos DOM', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioControlsReact(root, { controls: createControls() });
    });

    expect(root?.dataset.reactRelatorioControlsMounted).toBe('true');
    expect(
      document.getElementById(RELATORIO_PUBLIC_IDS.view)?.dataset.reactRelatorioControlsMounted,
    ).toBe(undefined);
    expect(document.querySelector('#view-relatorio')).not.toBeNull();

    const relatorioView = document.querySelector('#view-relatorio');
    expect(relatorioView.querySelector('.servicos-toggle')).not.toBeNull();
    expect(relatorioView.querySelectorAll('.servicos-toggle__btn')).toHaveLength(2);
    expect(relatorioView.querySelector('[data-nav="historico"]')).not.toBeNull();
    expect(relatorioView.querySelector('[data-nav="relatorio"]')).not.toBeNull();

    expect(document.querySelector('.rel-toolbar')).not.toBeNull();
    expect(document.querySelector('.rel-toolbar__actions')).not.toBeNull();
    expect(document.querySelectorAll('.rel-toolbar__btn').length).toBeGreaterThanOrEqual(3);
    expect(document.querySelector('[data-action="whatsapp-export"]')).not.toBeNull();
    expect(document.querySelector('[data-action="export-pdf"]')).not.toBeNull();
    expect(document.querySelector('[data-action="toggle-export-dd"]')).not.toBeNull();
    expect(document.querySelector('#rel-export-dd.rel-export-dd')).not.toBeNull();
    expect(document.querySelector('#btn-export-dd-toggle')).not.toBeNull();
    expect(document.querySelector('#rel-export-dd-menu.rel-export-dd__menu')).not.toBeNull();
    expect(document.querySelectorAll('#rel-export-dd-menu .rel-export-dd__item')).toHaveLength(3);
    expect(document.querySelector('#pdf-quota-slot.rel-toolbar__quota-slot')).not.toBeNull();

    expect(document.querySelector('#rel-main-title')?.textContent).toBe('Relatorio rapido');
    expect(document.querySelector('#rel-mode-segment-slot')).not.toBeNull();
    expect(document.querySelector('#rel-mode-segment-slot .rel-mode-segment')).toBeNull();
    expect(document.querySelector('#rel-hero.rel-hero')).not.toBeNull();
    expect(document.querySelector('#rel-filters.rel-filters')).not.toBeNull();
    expect(document.querySelector('#rel-filters-chips.rel-filters__chips')).not.toBeNull();
    expect(document.querySelector('#rel-filters-advanced.rel-filters__advanced')).not.toBeNull();
    expect(document.querySelector('#rel-filters-advanced')?.hasAttribute('hidden')).toBe(true);
    expect(document.querySelector('#rel-equip')?.value).toBe('');
    expect(document.querySelector('#rel-de')?.getAttribute('type')).toBe('date');
    expect(document.querySelector('#rel-ate')?.getAttribute('type')).toBe('date');
    expect(document.querySelector('#rel-equip option[value="eq-1"]')?.textContent).toContain(
      'Split Recepcao',
    );
    expect(document.querySelector('#rel-filters [data-action="rel-clear-filters"]')).toBeNull();
  });

  it('atualiza root existente sem criar roots ou renders duplicados', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountRelatorioControlsReact(root, { controls: createControls() });
      mountRelatorioControlsReact(root, { controls: createFilteredControls() });
    });

    expect(root?.querySelectorAll('#rel-filters')).toHaveLength(1);
    expect(root?.querySelectorAll('#rel-equip')).toHaveLength(1);
    expect(root?.querySelector('#rel-equip')?.value).toBe('eq-1');
    expect(root?.querySelector('#rel-de')?.defaultValue).toBe('2026-04-01');
    expect(root?.querySelector('#rel-ate')?.defaultValue).toBe('2026-04-30');
    expect(root?.querySelectorAll('#rel-filters-chips .rel-chip')).toHaveLength(3);
    expect(root?.querySelectorAll('#rel-filters-chips .rel-chip.is-active')).toHaveLength(2);
    expect(root?.querySelector('#rel-filters-chips')?.textContent).toContain('Split Recepcao');
    expect(root?.querySelector('#rel-filters-chips')?.textContent).toContain('1 de abr');
    expect(root?.querySelector('[data-action="rel-clear-filters"]')).not.toBeNull();
    expect(root?.querySelector('#rel-filters-advanced')?.hasAttribute('hidden')).toBe(false);
    expect(root?.querySelectorAll('#rel-mode-segment-slot .rel-mode-segment__item')).toHaveLength(
      4,
    );
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('desmonta com seguranca e tolera chamadas repetidas', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioControlsReact(root, { controls: createFilteredControls() });
      unmountRelatorioControlsReact(root);
      unmountRelatorioControlsReact(root);
    });

    expect(root?.dataset.reactRelatorioControlsMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('preserva modo detalhado, disclosure avancado, PMOC e quota como DOM', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioControlsReact(root, { controls: createFilteredControls() });
    });

    const compact = document.querySelector('[data-view-mode="compact"]');
    const detailed = document.querySelector('[data-view-mode="detailed"]');
    expect(compact?.getAttribute('role')).toBe('radio');
    expect(detailed?.getAttribute('role')).toBe('radio');
    expect(detailed?.getAttribute('aria-checked')).toBe('true');
    expect(detailed?.classList.contains('rel-segmented__opt')).toBe(true);
    expect(detailed?.classList.contains('is-active')).toBe(true);
    expect(document.querySelector('.rel-segmented')).not.toBeNull();
    expect(document.querySelector('.rel-mode-segment')).not.toBeNull();
    expect(document.querySelector('.rel-mode-segment__item.is-active')?.textContent).toBe(
      'Cliente',
    );

    const toggle = document.querySelector('#rel-filters-chips [data-action="rel-toggle-advanced"]');
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(toggle?.getAttribute('aria-controls')).toBe('rel-filters-advanced');
    expect(document.querySelector('#rel-filters-chips')?.textContent).toContain('Fechar filtros');

    expect(document.querySelector('#rel-dd-pmoc-main')?.hidden).toBe(false);
    expect(document.querySelector('#rel-dd-pmoc-info')?.hidden).toBe(false);
    expect(document.querySelector('#rel-dd-pmoc-nudge')?.hidden).toBe(true);
    expect(document.querySelector('#rel-dd-pmoc-main')?.getAttribute('data-action')).toBe(
      RELATORIO_ACTIONS.openPmocModal,
    );
    expect(document.querySelector('#rel-dd-pmoc-info')?.getAttribute('data-action')).toBe(
      RELATORIO_ACTIONS.openPmocInfo,
    );
    expect(document.querySelector('#rel-dd-pmoc-main')?.getAttribute('data-tier')).toBe('unknown');
    expect(document.querySelector('#rel-dd-pmoc-nudge')?.getAttribute('data-nav')).toBe(
      RELATORIO_NAV_TARGETS.pricing,
    );
    expect(document.querySelector('#pdf-quota-slot')).not.toBeNull();
  });

  it('renderiza valores maliciosos como texto sem HTML/script/event handler injection', async () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await act(async () => {
      mountRelatorioControlsReact(root, {
        controls: createFilteredControls({
          pageTitle: malicious,
          pageSubtitle: malicious,
          filters: {
            equipId: 'eq-xss',
            de: '2026-04-01',
            ate: '2026-04-30',
            hasPeriodoFilter: true,
            hasEquipFilter: true,
            periodoTxt: malicious,
            equipTxt: malicious,
          },
          equipOptions: [{ id: 'eq-xss', label: malicious }],
        }),
      });
    });

    expect(root?.textContent).toContain('<script>alert(2)</script>');
    expect(root?.innerHTML).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expectNoInjectedMarkup(root);
  });

  it('renderiza sem depender de cards, PDF, WhatsApp, assinatura, PMOC ou quota', async () => {
    const root = setRoot();
    document.getElementById(RELATORIO_PUBLIC_IDS.body)?.remove();

    await act(async () => {
      mountRelatorioControlsReact(root, { controls: createControls() });
    });

    expect(root?.querySelector('#rel-filters')).not.toBeNull();
    expect(root?.querySelector('[data-rel-action="rel-toggle-card"]')).toBeNull();
    expect(root?.querySelector('[data-action="rel-view-signature"]')).toBeNull();
  });

  it('mantem componente puro e createRoot fora do adapter legado', () => {
    const componentSource = readFileSync('src/react/pages/RelatorioControls.jsx', 'utf8');
    const adapterSource = readFileSync('src/ui/views/relatorio.js', 'utf8');

    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
    expect(adapterSource).toContain('../../react/entrypoints/relatorioControlsIsland.jsx');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
