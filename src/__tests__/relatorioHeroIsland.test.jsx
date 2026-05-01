import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountRelatorioHeroReact,
  unmountRelatorioHeroReact,
} from '../react/entrypoints/relatorioHeroIsland.jsx';
import { RELATORIO_PUBLIC_IDS, RELATORIO_VIEW_MODES } from '../ui/viewModels/relatorioContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setRoot() {
  document.body.innerHTML = `
    <section id="${RELATORIO_PUBLIC_IDS.view}">
      <section id="${RELATORIO_PUBLIC_IDS.hero}" class="rel-hero" aria-live="polite"></section>
    </section>
  `;
  return document.getElementById(RELATORIO_PUBLIC_IDS.hero);
}

function createHero(overrides = {}) {
  return {
    brand: 'Relat\u00f3rio r\u00e1pido',
    title: 'Resumo dos servi\u00e7os',
    metaText: 'Todo o per\u00edodo \u00b7 Todos os equipamentos',
    emittedAt: '01/05/2026',
    narrativeText: '',
    viewMode: RELATORIO_VIEW_MODES.compact,
    kpis: [
      {
        key: 'records',
        icon: 'clipboardCheck',
        iconTone: 'cyan',
        value: '0',
        label: 'Registros',
        ariaLabel: 'Registros: 0',
      },
    ],
    ...overrides,
  };
}

function createFilledHero(overrides = {}) {
  return createHero({
    brand: 'Relat\u00f3rios da empresa',
    title: 'Contexto do relat\u00f3rio',
    metaText: 'Cliente: Cliente Alpha \u00b7 Setor: Sala t\u00e9cnica',
    narrativeText:
      '3 atendimentos em 1 equipamento \u00b7 predom\u00ednio de Preventiva (67%) \u00b7 1 corretiva.',
    viewMode: RELATORIO_VIEW_MODES.detailed,
    kpis: [
      {
        key: 'records',
        icon: 'clipboardCheck',
        iconTone: 'cyan',
        value: '3',
        label: 'Registros',
        ariaLabel: 'Registros: 3',
      },
      {
        key: 'total',
        icon: 'dollarSign',
        iconTone: 'cyan',
        value: 'R$ 135,00',
        label: 'Custo total',
        ariaLabel: 'Custo total: R$ 135,00',
      },
      {
        key: 'type',
        icon: 'shieldCheck',
        iconTone: 'cyan',
        value: '2\u00d7 Preventiva',
        valueClass: 'rel-kpi__value--compact',
        label: 'Tipo mais comum',
        title: '2 \u00d7 Manuten\u00e7\u00e3o Preventiva',
      },
      {
        key: 'nextDue',
        icon: 'calendarClock',
        iconTone: 'gold',
        value: 'daqui 2d',
        valueClass: 'rel-kpi__value--gold',
        label: 'Pr\u00f3x. vencimento',
        ariaLabel: 'Pr\u00f3ximo vencimento: daqui 2d',
      },
    ],
    ...overrides,
  });
}

describe('relatorio hero React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('monta somente em #rel-hero preservando ids, classes e estado vazio', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioHeroReact(root, { hero: createHero() });
    });

    expect(root?.dataset.reactRelatorioHeroMounted).toBe('true');
    expect(
      document.getElementById(RELATORIO_PUBLIC_IDS.view)?.dataset.reactRelatorioHeroMounted,
    ).toBe(undefined);
    expect(root?.classList.contains('rel-hero')).toBe(true);
    expect(root?.querySelector(`#${RELATORIO_PUBLIC_IDS.heroTitle}`)?.textContent).toBe(
      'Resumo dos servi\u00e7os',
    );
    expect(root?.querySelector('.rel-hero__brand')).not.toBeNull();
    expect(root?.querySelector('.rel-hero__title')).not.toBeNull();
    expect(root?.querySelector('.rel-hero__meta')?.textContent).toContain('Todo o per\u00edodo');
    expect(root?.querySelector('.rel-hero__kpis')).not.toBeNull();
    expect(root?.querySelectorAll('.rel-kpi')).toHaveLength(1);
    expect(root?.querySelector('.rel-kpi__row')).not.toBeNull();
    expect(root?.querySelector('.rel-kpi__icon')).not.toBeNull();
    expect(root?.querySelector('.rel-kpi__value')?.textContent).toBe('0');
    expect(root?.querySelector('.rel-kpi__label')?.textContent).toBe('Registros');
    expect(root?.textContent).not.toContain('Custo total');
    expect(root?.textContent).not.toContain('Tipo mais comum');
    expect(root?.textContent).not.toContain('Pr\u00f3x. vencimento');
  });

  it('atualiza root existente sem criar roots ou renders duplicados', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountRelatorioHeroReact(root, { hero: createHero() });
      mountRelatorioHeroReact(root, { hero: createFilledHero() });
    });

    expect(root?.querySelectorAll(`#${RELATORIO_PUBLIC_IDS.heroTitle}`)).toHaveLength(1);
    expect(root?.querySelectorAll('.rel-hero__brand')).toHaveLength(1);
    expect(root?.querySelectorAll('.rel-kpi')).toHaveLength(4);
    expect(root?.textContent).toContain('3 atendimentos em 1 equipamento');
    expect(root?.textContent).toContain('R$ 135,00');
    expect(root?.textContent).toContain('2\u00d7 Preventiva');
    expect(root?.textContent).toContain('Pr\u00f3x. vencimento');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('desmonta com seguran\u00e7a e tolera chamadas repetidas', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioHeroReact(root, { hero: createFilledHero() });
      unmountRelatorioHeroReact(root);
      unmountRelatorioHeroReact(root);
    });

    expect(root?.dataset.reactRelatorioHeroMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('preserva data-view-mode e estado ativo do modo compacto/detalhado', async () => {
    const root = setRoot();

    await act(async () => {
      mountRelatorioHeroReact(root, { hero: createFilledHero() });
    });

    const compact = root?.querySelector('[data-view-mode="compact"]');
    const detailed = root?.querySelector('[data-view-mode="detailed"]');
    expect(compact?.getAttribute('role')).toBe('radio');
    expect(detailed?.getAttribute('role')).toBe('radio');
    expect(compact?.getAttribute('aria-checked')).toBe('false');
    expect(detailed?.getAttribute('aria-checked')).toBe('true');
    expect(detailed?.classList.contains('is-active')).toBe(true);
  });

  it('escapa conte\u00fado din\u00e2mico sem HTML/script/event handler injection', async () => {
    const root = setRoot();
    const malicious = '"><img src=x onerror=alert(1)><script>alert(2)</script>';

    await act(async () => {
      mountRelatorioHeroReact(root, {
        hero: createFilledHero({
          brand: malicious,
          title: malicious,
          metaText: malicious,
          emittedAt: malicious,
          narrativeText: malicious,
          kpis: [
            {
              key: 'xss',
              icon: 'clipboardCheck',
              iconTone: 'cyan',
              value: malicious,
              label: malicious,
              title: malicious,
              ariaLabel: malicious,
            },
          ],
        }),
      });
    });

    expect(root?.textContent).toContain('<script>alert(2)</script>');
    expect(root?.innerHTML).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expect(root?.querySelector('script')).toBeNull();
    expect(root?.querySelector('img')).toBeNull();
    expect(root?.querySelector('[onclick]')).toBeNull();
    expect(root?.querySelector('[onerror]')).toBeNull();
    expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();

    const componentSource = readFileSync('src/react/pages/RelatorioHero.jsx', 'utf8');
    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
  });

  it('mantem createRoot fora do adapter legado e sem dependencias de PDF/WhatsApp', () => {
    const adapterSource = readFileSync('src/ui/views/relatorio.js', 'utf8');

    expect(adapterSource).toContain('../../react/entrypoints/relatorioHeroIsland.jsx');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
