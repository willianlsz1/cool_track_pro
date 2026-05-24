import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountRegistroChecklistDom,
  unmountRegistroChecklistDom,
} from '../ui/views/registro/checklistRenderer.js';

const MALICIOUS = '<img src=x onerror=alert(1)><script>alert(2)</script>';

function setRoot() {
  document.body.innerHTML = `
    <main id="view-registro">
      <div id="registro-header-root"></div>
      <details id="r-checklist-details" class="registro-details registro-details--checklist">
        <summary class="registro-details__summary">
          <span id="r-checklist-summary">selecione o equipamento primeiro</span>
        </summary>
        <div class="registro-details__body">
          <div id="r-checklist-body" class="r-checklist__body" aria-live="polite"></div>
        </div>
      </details>
      <div id="photo-preview"></div>
      <div id="registro-signature-hint"></div>
      <button data-action="save-registro"></button>
    </main>
  `;
  return document.getElementById('r-checklist-body');
}

function createChecklist(overrides = {}) {
  return {
    label: 'Split Hi-Wall (NBR 13971)',
    groups: [
      {
        label: 'Mecanico',
        items: [
          {
            id: 'filtros_limpeza',
            label: 'Limpeza dos filtros de ar',
            mandatory: true,
            status: null,
            obs: '',
            measurable: false,
            unit: '',
            measureValue: '',
          },
        ],
      },
      {
        label: 'Eletrico',
        items: [
          {
            id: 'tensao_alimentacao',
            label: 'Tensao de alimentacao dentro da faixa de placa',
            mandatory: true,
            status: 'ok',
            obs: 'Medicao normal.',
            measurable: true,
            unit: 'V',
            measureValue: 220,
          },
        ],
      },
    ],
    ...overrides,
  };
}

function expectNoInjectedMarkup(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
}

describe('registro checklist DOM renderer', () => {
  afterEach(() => {
    unmountRegistroChecklistDom();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('monta somente em #r-checklist-body preservando contratos do checklist', () => {
    const root = setRoot();

    mountRegistroChecklistDom(root, {
      checklist: createChecklist(),
      actions: {
        checklistSet: { action: 'r-checklist-set' },
        checklistObs: { action: 'r-checklist-obs' },
        checklistMeasure: { action: 'r-checklist-measure' },
      },
    });

    expect(root?.dataset.registroChecklistMounted).toBe('true');
    expect(document.getElementById('view-registro')?.dataset.registroChecklistMounted).toBe(
      undefined,
    );
    expect(document.getElementById('r-checklist-details')).not.toBeNull();
    expect(document.getElementById('r-checklist-summary')?.textContent).toContain('selecione');

    expect(root?.querySelector('.r-checklist__intro strong')?.textContent).toBe(
      'Split Hi-Wall (NBR 13971)',
    );
    expect(root?.querySelector('.r-checklist__legend')).not.toBeNull();
    expect(root?.querySelectorAll('.r-checklist__group')).toHaveLength(2);
    expect(root?.querySelector('.r-checklist__group-label')?.textContent).toBe('Mecanico');

    const rows = root?.querySelectorAll('.r-checklist__row');
    expect(rows).toHaveLength(2);
    expect(rows?.[0].dataset.itemId).toBe('filtros_limpeza');
    expect(rows?.[0].querySelector('.r-checklist__label')?.textContent).toContain('Limpeza');
    expect(rows?.[0].querySelector('.r-checklist__req')).not.toBeNull();
    expect(rows?.[0].querySelectorAll('.r-checklist__status')).toHaveLength(3);
    expect(
      rows?.[0].querySelector('[data-action="r-checklist-set"][data-status="ok"]'),
    ).not.toBeNull();
    expect(
      rows?.[0].querySelector('[data-action="r-checklist-set"][data-status="fail"]'),
    ).not.toBeNull();
    expect(
      rows?.[0].querySelector('[data-action="r-checklist-set"][data-status="na"]'),
    ).not.toBeNull();
    expect(rows?.[0].querySelector('[data-action="r-checklist-obs"]')).not.toBeNull();

    const measure = root?.querySelector(
      '[data-action="r-checklist-measure"][data-item="tensao_alimentacao"]',
    );
    expect(measure).not.toBeNull();
    expect(measure?.classList.contains('r-checklist__measure-input')).toBe(true);
    expect(measure?.dataset.unit).toBe('V');
    expect(measure?.value).toBe('220');
    expect(
      root
        ?.querySelector('[data-item="tensao_alimentacao"][data-status="ok"]')
        ?.classList.contains('is-active'),
    ).toBe(true);
    expect(
      root
        ?.querySelector('[data-item="tensao_alimentacao"][data-status="ok"]')
        ?.getAttribute('aria-pressed'),
    ).toBe('true');
    expect(document.getElementById('photo-preview')?.children).toHaveLength(0);
    expect(document.querySelector('[data-action="save-registro"]')).not.toBeNull();
  });

  it('atualiza root existente sem criar multiplos roots ou render duplicado', () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mountRegistroChecklistDom(root, { checklist: createChecklist() });
    mountRegistroChecklistDom(root, {
      checklist: createChecklist({
        groups: [
          {
            label: 'Mecanico',
            items: [
              {
                id: 'filtros_limpeza',
                label: 'Limpeza dos filtros de ar',
                mandatory: true,
                status: 'fail',
                obs: 'Filtro saturado.',
                measurable: false,
                unit: '',
                measureValue: '',
              },
            ],
          },
        ],
      }),
    });

    expect(root?.querySelectorAll('.r-checklist__intro')).toHaveLength(1);
    expect(root?.querySelectorAll('.r-checklist__row')).toHaveLength(1);
    expect(
      root
        ?.querySelector('[data-item="filtros_limpeza"][data-status="fail"]')
        ?.classList.contains('is-active'),
    ).toBe(true);
    expect(root?.querySelector('[data-action="r-checklist-obs"]')?.value).toBe('Filtro saturado.');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('desmonta com seguranca e tolera chamadas repetidas', () => {
    const root = setRoot();

    mountRegistroChecklistDom(root, { checklist: createChecklist() });
    unmountRegistroChecklistDom(root);
    unmountRegistroChecklistDom(root);

    expect(root?.dataset.registroChecklistMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renderiza estado inicial e estado sem equipamento sem depender de fluxos legados', () => {
    const root = setRoot();

    mountRegistroChecklistDom(root, { checklist: createChecklist({ groups: [] }) });

    expect(root?.dataset.registroChecklistMounted).toBe('true');
    expect(root?.querySelector('.r-checklist__intro strong')?.textContent).toBe(
      'Split Hi-Wall (NBR 13971)',
    );
    expect(root?.querySelectorAll('.r-checklist__row')).toHaveLength(0);
    expect(root?.querySelector('#r-equip')).toBeNull();
    expect(root?.querySelector('#input-fotos')).toBeNull();
    expect(root?.querySelector('#registro-signature-hint')).toBeNull();
  });

  it('renderiza dados maliciosos como texto sem HTML/script/event handler injection', () => {
    const root = setRoot();

    mountRegistroChecklistDom(root, {
      checklist: createChecklist({
        label: MALICIOUS,
        groups: [
          {
            label: MALICIOUS,
            items: [
              {
                id: 'xss_item',
                label: MALICIOUS,
                mandatory: true,
                status: null,
                obs: MALICIOUS,
                measurable: true,
                unit: 'V" onclick="alert(1)',
                measureValue: '220"><img src=x onerror=alert(1)>',
              },
            ],
          },
        ],
      }),
    });

    expect(root?.textContent).toContain('<script>alert(2)</script>');
    expect(root?.innerHTML).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expect(root?.querySelector('[data-action="r-checklist-obs"]')?.value).toBe(MALICIOUS);
    expect(root?.querySelector('[data-action="r-checklist-measure"]')?.value).toBe('');
    expectNoInjectedMarkup(root);
  });

  it('mantem o renderer isolado e createRoot fora do adapter legado de Registro', () => {
    const componentSource = readFileSync('src/ui/views/registro/checklistRenderer.js', 'utf8');
    const adapterSource = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML/);
    expect(adapterSource).toContain('./registro/checklistRenderer.js');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
