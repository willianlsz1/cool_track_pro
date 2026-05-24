import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const SAFE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/atK9E8AAAAASUVORK5CYII=';

function setupDom() {
  document.body.innerHTML = renderShellViews();
}

function baseEquipamentos() {
  return [
    {
      id: 'eq-1',
      nome: 'Split Recepcao',
      tag: 'SP-01',
      local: 'Recepcao',
      clienteId: 'cliente-1',
      setorId: 'setor-1',
      fluido: 'R410A',
      criticidade: 'media',
      prioridadeOperacional: 'normal',
      periodicidadePreventivaDias: 30,
    },
    {
      id: 'eq-2',
      nome: 'Fan Coil Clinica',
      tag: 'FC-02',
      local: 'Clinica',
      fluido: 'R32',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
    },
  ];
}

function baseRegistros() {
  return [
    {
      id: 'reg-1',
      equipId: 'eq-1',
      clienteNome: 'Cliente ACME',
      data: '2026-04-20T09:00:00',
      tipo: 'Preventiva',
      tecnico: 'Ana',
      status: 'ok',
      custoPecas: 100,
      custoMaoObra: 20,
      pecas: 'Filtro lavavel',
      obs: 'Filtros limpos e fluxo ok',
      proxima: '2026-05-10',
      assinatura: true,
    },
    {
      id: 'reg-2',
      equipId: 'eq-2',
      data: '2026-04-10T09:00:00',
      tipo: 'Corretiva',
      tecnico: 'Bia',
      status: 'warn',
      custoPecas: 0,
      custoMaoObra: 0,
      obs: 'Ruido intermitente',
      assinatura: false,
    },
  ];
}

function buildState(overrides = {}) {
  return {
    equipamentos: baseEquipamentos(),
    registros: baseRegistros(),
    clientes: [{ id: 'cliente-1', nome: 'Cliente ACME' }],
    setores: [{ id: 'setor-1', nome: 'Recepcao' }],
    ...overrides,
  };
}

async function loadRelatorioView({
  state = buildState(),
  planCode = 'pro',
  signatureById = { 'reg-1': SAFE_SIGNATURE },
} = {}) {
  vi.resetModules();

  const getState = vi.fn(() => state);
  const findEquip = vi.fn(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  const refreshQuota = vi.fn();
  const getPmocSummaryForCliente = vi.fn(() => null);
  const getSignatureForRecord = vi.fn((id) => signatureById[id] || null);
  const signatureOpen = vi.fn();

  vi.doMock('../core/state.js', () => ({
    getState,
    findEquip,
  }));
  vi.doMock('../core/plans/planCache.js', () => ({
    getCachedPlan: vi.fn(() => planCode),
  }));
  vi.doMock('../ui/components/skeleton.js', () => ({
    withSkeleton: (_el, _opts, renderFn) => renderFn(),
  }));
  vi.doMock('../domain/maintenance.js', () => ({
    CRITICIDADE_LABEL: { media: 'Media', alta: 'Alta' },
    PRIORIDADE_OPERACIONAL_LABEL: { normal: 'Normal', alta: 'Alta' },
  }));
  vi.doMock('../domain/dadosPlacaDisplay.js', () => ({
    formatDadosPlacaRows: vi.fn(() => [{ label: 'Placa', value: 'PLACA-123', mono: true }]),
  }));
  vi.doMock('../ui/components/pdfQuotaBadge.js', () => ({
    PdfQuotaBadge: { refresh: refreshQuota },
  }));
  vi.doMock('../ui/components/signature.js', () => ({
    getSignatureForRecord,
    SignatureViewerModal: { open: signatureOpen },
  }));
  vi.doMock('../core/pmocProgress.js', () => ({
    getPmocSummaryForCliente,
  }));

  const module = await import('../ui/views/relatorio.js');
  return {
    ...module,
    mocks: {
      findEquip,
      getSignatureForRecord,
      refreshQuota,
      signatureOpen,
    },
  };
}

async function renderWithRelatorio(module, options) {
  await act(async () => {
    module.populateRelatorioSelects();
    await module.renderRelatorio(options);
  });
}

function expectClass(element, className) {
  expect(element?.classList.contains(className)).toBe(true);
}

function expectNoExecutableHtml(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect(root.querySelector('[onerror]')).toBeNull();
  expect(root.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
}

describe('relatorio legacy cards render adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renderiza estado vazio preservando container, empty state e CTA legado', async () => {
    setupDom();
    const module = await loadRelatorioView({
      state: buildState({ equipamentos: [], registros: [], clientes: [], setores: [] }),
    });

    await renderWithRelatorio(module);

    const body = document.querySelector('#relatorio-corpo');
    expect(body).not.toBeNull();
    expectClass(body, 'rel-records');
    expect(body.querySelector('.rel-empty')).not.toBeNull();
    expect(body.querySelector('.rel-empty__cta')).not.toBeNull();
    expect(body.querySelector('.rel-empty__cta')?.getAttribute('data-nav')).toBe('registro');
    expect(body.querySelector('.rel-record')).toBeNull();
    expectNoExecutableHtml(body);
  });

  it('renderiza registros preservando classes publicas, conteudo e atributos dos cards', async () => {
    setupDom();
    const module = await loadRelatorioView();

    await renderWithRelatorio(module);

    const body = document.querySelector('#relatorio-corpo');
    const records = [...body.querySelectorAll('.rel-record')];
    expectClass(body, 'rel-records');
    expect(records).toHaveLength(2);

    const first = body.querySelector('.rel-record[data-id="reg-1"]');
    expect(first).not.toBeNull();
    expectClass(first.querySelector('.rel-record__head'), 'rel-record__head');
    expectClass(first.querySelector('.rel-record__title'), 'rel-record__title');
    expectClass(first.querySelector('.rel-record__meta'), 'rel-record__meta');
    expectClass(first.querySelector('.rel-record__toggle'), 'rel-record__toggle');
    expectClass(first.querySelector('.rel-record__details'), 'rel-record__details');
    expectClass(first.querySelector('.rel-record__section'), 'rel-record__section');
    expect(first.querySelector('.rel-spec')).not.toBeNull();
    expect(first.querySelector('.rel-status')).not.toBeNull();
    expect(first.querySelector('.rel-tipo-icon')).not.toBeNull();
    expect(first.querySelector('.rel-sigthumb')).not.toBeNull();

    expect(first.textContent).toContain('Preventiva');
    expect(first.textContent).toContain('Split Recepcao');
    expect(first.textContent).toContain('SP-01');
    expect(first.textContent).toContain('Ana');
    expect(first.textContent).toContain('R$');
    expect(first.textContent).toContain('Filtro lavavel');
    expect(first.textContent).toContain('Filtros limpos e fluxo ok');
    expect(first.textContent).toContain('PLACA-123');
  });

  it('preserva modo compacto e detalhado como disponibilidade dos detalhes', async () => {
    setupDom();
    const compactModule = await loadRelatorioView();

    await renderWithRelatorio(compactModule);

    const compactCard = document.querySelector('.rel-record[data-id="reg-1"]');
    expect(compactCard.querySelector('.rel-record__toggle')?.getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(compactCard.querySelector('.rel-record__details')?.hasAttribute('hidden')).toBe(true);

    setupDom();
    localStorage.setItem('cooltrack_relatorio_view_mode', 'detailed');
    const detailedModule = await loadRelatorioView();

    await renderWithRelatorio(detailedModule);

    const detailedCard = document.querySelector('.rel-record[data-id="reg-1"]');
    expectClass(detailedCard, 'is-expanded');
    expect(detailedCard.querySelector('.rel-record__toggle')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(detailedCard.querySelector('.rel-record__details')?.hasAttribute('hidden')).toBe(false);
  });

  it('preserva acoes de expandir card e assinatura sem executar modais', async () => {
    setupDom();
    const module = await loadRelatorioView();

    await renderWithRelatorio(module);

    const first = document.querySelector('.rel-record[data-id="reg-1"]');
    const toggle = first.querySelector('[data-rel-action="rel-toggle-card"]');
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('data-id')).toBe('reg-1');
    expect(toggle.getAttribute('aria-controls')).toBe('rec-reg-1-details');

    const signatureButton = first.querySelector('[data-action="rel-view-signature"]');
    expect(signatureButton).not.toBeNull();
    expect(signatureButton.getAttribute('data-id')).toBe('reg-1');
    expect(signatureButton.getAttribute('aria-label')).toContain('Cliente ACME');
    expect(signatureButton.querySelector('img')?.getAttribute('src')).toBe(SAFE_SIGNATURE);
    expect(module.mocks.signatureOpen).not.toHaveBeenCalled();
  });

  it('escapa dados dinamicos dos cards sem injetar HTML/script/event handler', async () => {
    setupDom();
    const malicious = '<img src=x onerror=alert(1)>';
    const module = await loadRelatorioView({
      state: buildState({
        equipamentos: [
          {
            id: 'eq-x',
            nome: malicious,
            tag: '<script>alert(1)</script>',
            local: '<svg onload=alert(1)>',
            fluido: 'javascript:alert(1)',
            criticidade: 'media',
            prioridadeOperacional: 'normal',
          },
        ],
        registros: [
          {
            id: 'reg-x',
            equipId: 'eq-x',
            clienteNome: '<b onclick=alert(1)>Cliente</b>',
            data: '2026-04-20T09:00:00',
            tipo: malicious,
            tecnico: '<span onclick=alert(1)>Ana</span>',
            status: 'ok',
            custoPecas: 1,
            custoMaoObra: 1,
            pecas: '<script>alert(1)</script>',
            obs: '<button onclick=alert(1)>obs</button>',
            assinatura: true,
          },
        ],
      }),
      signatureById: {
        'reg-x': 'javascript:alert(1)',
      },
    });

    await renderWithRelatorio(module);

    const body = document.querySelector('#relatorio-corpo');
    expect(body.textContent).toContain(malicious);
    expect(body.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(body.innerHTML).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(body.innerHTML).not.toContain('<button onclick=');
    expect(body.innerHTML).not.toContain('src="javascript:alert(1)"');
    expectNoExecutableHtml(body);
    expect(module.mocks.signatureOpen).not.toHaveBeenCalled();
  });

  it('mantem adapter sem createRoot e sem depender da ilha React de cards', () => {
    const adapterSource = readFileSync('src/ui/views/relatorio.js', 'utf8');
    const rendererSource = readFileSync('src/ui/views/relatorio/cardsRenderer.js', 'utf8');
    const removedIslandPath =
      '../../react/entrypoints/' + ['relatorio', 'Cards', 'Island.jsx'].join('');

    expect(adapterSource).not.toContain(removedIslandPath);
    expect(adapterSource).toContain('./relatorio/cardsRenderer.js');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
    expect(rendererSource).toContain('data-rel-action="${RELATORIO_ACTIONS.toggleCard}"');
    expect(rendererSource).toContain('data-action="${RELATORIO_ACTIONS.viewSignature}"');
  });
});
