import { readFileSync } from 'node:fs';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountRegistroHeaderReact,
  unmountRegistroHeaderReact,
} from '../react/entrypoints/registroHeaderIsland.jsx';
import { REGISTRO_ACTIONS, REGISTRO_MODES } from '../ui/viewModels/registroContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const MALICIOUS = '<img src=x onerror=alert(1)><script>alert(2)</script>';

function setRoot() {
  document.body.innerHTML = `
    <main id="view-registro">
      <div id="registro-header-root"></div>
      <section id="r-checklist-details"><div id="r-checklist-body"></div></section>
      <input id="input-fotos" />
      <div id="registro-signature-hint"></div>
      <button data-action="save-registro"></button>
    </main>
  `;
  return document.getElementById('registro-header-root');
}

function createViewModel(overrides = {}) {
  return {
    mode: REGISTRO_MODES.create,
    editingId: '',
    form: {
      equipId: '',
      data: '',
      tipo: '',
      tipoCustom: '',
      obs: '',
      tecnico: '',
    },
    selectedEquipamento: null,
    context: {
      hasCompanyContext: false,
      missingEquipFromParams: false,
      shouldWarnEquipmentOnly: false,
      cliente: null,
      setor: null,
      equipamento: null,
    },
    progress: {
      total: 5,
      filled: 0,
      state: 'empty',
    },
    actions: {
      save: { action: REGISTRO_ACTIONS.save },
      saveAndShare: { action: REGISTRO_ACTIONS.saveAndShare },
      clear: { action: REGISTRO_ACTIONS.clear },
      quickTemplate: { action: REGISTRO_ACTIONS.quickTemplate },
    },
    ...overrides,
  };
}

function createEquipmentOptions() {
  return [
    { id: 'eq-1', label: 'Split Recepcao - Recepcao' },
    { id: 'eq-2', label: 'Chiller Central - Cobertura' },
  ];
}

function expectNoInjectedMarkup(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
}

describe('registro header React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('monta somente no root do header preservando hero, campos principais e quick templates', async () => {
    const root = setRoot();

    await act(async () => {
      mountRegistroHeaderReact(root, {
        viewModel: createViewModel(),
        equipmentOptions: createEquipmentOptions(),
        technicianOptions: ['Ana', 'Bruno'],
      });
    });

    expect(root?.dataset.reactRegistroHeaderMounted).toBe('true');
    expect(document.getElementById('view-registro')?.dataset.reactRegistroHeaderMounted).toBe(
      undefined,
    );
    expect(root?.querySelector('#registro-hero.registro-hero')).not.toBeNull();
    expect(root?.querySelector('#registro-hero')?.dataset.state).toBe('empty');
    expect(root?.querySelector('#registro-hero-pill-text')?.textContent).toContain('Novo registro');
    expect(root?.querySelectorAll('#registro-hero-meter .registro-hero__seg')).toHaveLength(5);
    expect(root?.querySelector('#form-progress-count')?.textContent).toBe('0');

    ['r-equip', 'r-data', 'r-tipo', 'r-obs', 'r-tecnico'].forEach((id) => {
      expect(root?.querySelector(`#${id}`)).not.toBeNull();
    });
    expect(root?.querySelector('#r-equip')?.classList.contains('registro-field__select')).toBe(
      true,
    );
    expect(root?.querySelector('#r-data')?.getAttribute('type')).toBe('datetime-local');
    expect(root?.querySelector('#r-tipo option[value="Outro"]')).not.toBeNull();
    expect(root?.querySelector('#r-obs')?.classList.contains('registro-field__textarea')).toBe(
      true,
    );
    expect(root?.querySelector('#r-tecnico')?.getAttribute('list')).toBe('lista-tecnicos');

    expect(root?.querySelectorAll('[data-action="quick-service-template"]')).toHaveLength(5);
    expect(root?.querySelector('[data-template="limpeza"]')).not.toBeNull();
    const headerOrder = Array.from(
      root?.querySelectorAll('.registro-quick, .registro-bloco--required') || [],
    ).map((node) => (node.classList.contains('registro-quick') ? 'quick' : 'required'));
    expect(headerOrder).toEqual(['quick', 'required']);
    expect(root?.querySelector('.registro-photo-quick')).toBeNull();
    expect(root?.textContent).not.toContain('Comece pela foto');
    expect(root?.textContent).not.toContain('Tirar foto da etiqueta agora');
    expect(root?.querySelector('[data-r-action="open-equip-picker"]')).not.toBeNull();
    expect(document.querySelector('[data-action="save-registro"]')).not.toBeNull();
    expect(root?.querySelector('#r-checklist-body')).toBeNull();
    expect(root?.querySelector('#input-fotos')).toBeNull();
    expect(root?.querySelector('#registro-signature-hint')).toBeNull();
  });

  it('atualiza root existente sem criar multiplos roots ou render duplicado', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountRegistroHeaderReact(root, {
        viewModel: createViewModel(),
        equipmentOptions: createEquipmentOptions(),
      });
      mountRegistroHeaderReact(root, {
        viewModel: createViewModel({
          mode: REGISTRO_MODES.edit,
          form: {
            equipId: 'eq-1',
            data: '2026-04-30T09:00',
            tipo: 'Manuten\u00e7\u00e3o Preventiva',
            tipoCustom: '',
            obs: 'Limpeza preventiva realizada com testes finais.',
            tecnico: 'Ana',
          },
          selectedEquipamento: {
            id: 'eq-1',
            nome: 'Split Recepcao',
            meta: 'Split Hi-Wall - Recepcao',
          },
          progress: { total: 5, filled: 5, state: 'complete' },
        }),
        equipmentOptions: createEquipmentOptions(),
      });
    });

    expect(root?.querySelectorAll('#registro-hero')).toHaveLength(1);
    expect(root?.querySelectorAll('#r-equip')).toHaveLength(1);
    expect(root?.querySelector('#registro-hero')?.dataset.state).toBe('complete');
    expect(root?.querySelector('#registro-hero-pill-text')?.textContent).toContain('Editando');
    expect(root?.querySelector('#r-equip')?.value).toBe('eq-1');
    expect(root?.querySelector('#r-data')?.value).toBe('2026-04-30T09:00');
    expect(root?.querySelector('#r-tipo')?.value).toBe('Manuten\u00e7\u00e3o Preventiva');
    expect(root?.querySelector('#r-obs')?.value).toBe(
      'Limpeza preventiva realizada com testes finais.',
    );
    expect(root?.querySelector('#r-tecnico')?.value).toBe('Ana');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('desmonta com seguranca e tolera chamadas repetidas', async () => {
    const root = setRoot();

    await act(async () => {
      mountRegistroHeaderReact(root, {
        viewModel: createViewModel(),
        equipmentOptions: createEquipmentOptions(),
      });
      unmountRegistroHeaderReact(root);
      unmountRegistroHeaderReact(root);
    });

    expect(root?.dataset.reactRegistroHeaderMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renderiza equipamento selecionado, contexto e ausencia de equipamento', async () => {
    const root = setRoot();

    await act(async () => {
      mountRegistroHeaderReact(root, {
        viewModel: createViewModel({
          form: {
            equipId: 'eq-1',
            data: '',
            tipo: '',
            tipoCustom: '',
            obs: '',
            tecnico: '',
          },
          selectedEquipamento: {
            id: 'eq-1',
            nome: 'Split Recepcao',
            meta: 'Split Hi-Wall - Recepcao',
          },
          context: {
            hasCompanyContext: true,
            missingEquipFromParams: false,
            shouldWarnEquipmentOnly: false,
            cliente: { nome: 'Cliente ACME' },
            setor: { nome: 'Recepcao' },
            equipamento: { nome: 'Split Recepcao', tag: 'SP-01' },
          },
        }),
        equipmentOptions: createEquipmentOptions(),
      });
    });

    expect(root?.querySelector('#r-equip')?.value).toBe('eq-1');
    expect(root?.querySelector('#r-equip-name')?.textContent).toContain('Split Recepcao');
    expect(root?.querySelector('#r-equip-meta')?.hidden).toBe(false);
    expect(root?.querySelector('#registro-context-card')?.hidden).toBe(false);
    expect(root?.querySelector('#registro-context-cliente')?.textContent).toContain('Cliente ACME');
    expect(root?.querySelector('#registro-context-setor')?.textContent).toContain('Recepcao');
    expect(root?.querySelector('#registro-context-equip')?.textContent).toContain('Split Recepcao');

    await act(async () => {
      mountRegistroHeaderReact(root, {
        viewModel: createViewModel({
          context: {
            hasCompanyContext: false,
            missingEquipFromParams: true,
            shouldWarnEquipmentOnly: false,
            cliente: null,
            setor: null,
            equipamento: null,
          },
        }),
        equipmentOptions: createEquipmentOptions(),
      });
    });

    expect(root?.querySelector('#registro-context-card')?.hidden).toBe(true);
    expect(root?.querySelector('#registro-context-hint')?.hidden).toBe(false);
    expect(root?.querySelector('#registro-context-hint')?.textContent).toContain('Equipamento');
  });

  it('renderiza dados maliciosos como texto sem HTML/script/event handler injection', async () => {
    const root = setRoot();

    await act(async () => {
      mountRegistroHeaderReact(root, {
        viewModel: createViewModel({
          mode: REGISTRO_MODES.edit,
          form: {
            equipId: 'eq-xss',
            data: '2026-04-30T09:00',
            tipo: 'Outro',
            tipoCustom: MALICIOUS,
            obs: MALICIOUS,
            tecnico: MALICIOUS,
          },
          selectedEquipamento: {
            id: 'eq-xss',
            nome: MALICIOUS,
            meta: MALICIOUS,
          },
          context: {
            hasCompanyContext: true,
            missingEquipFromParams: false,
            shouldWarnEquipmentOnly: false,
            cliente: { nome: MALICIOUS },
            setor: { nome: MALICIOUS },
            equipamento: { nome: MALICIOUS, tag: MALICIOUS },
          },
          progress: { total: 5, filled: 5, state: 'complete' },
        }),
        equipmentOptions: [{ id: 'eq-xss', label: MALICIOUS }],
      });
    });

    expect(root?.textContent).toContain('<script>alert(2)</script>');
    expect(root?.innerHTML).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expect(root?.querySelector('#r-obs')?.value).toBe(MALICIOUS);
    expect(root?.querySelector('#r-tecnico')?.value).toBe(MALICIOUS);
    expectNoInjectedMarkup(root);
  });

  it('mantem createRoot fora do adapter legado de Registro', () => {
    const componentSource = readFileSync('src/react/pages/RegistroHeader.jsx', 'utf8');
    const adapterSource = readFileSync('src/ui/views/registro.js', 'utf8');

    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
    expect(adapterSource).toContain('../../react/entrypoints/registroHeaderIsland.jsx');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
