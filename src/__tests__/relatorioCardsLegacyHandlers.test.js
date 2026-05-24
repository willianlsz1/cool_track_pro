import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const SAFE_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/atK9E8AAAAASUVORK5CYII=';
const MALICIOUS_ID = 'javascript:alert(1)" onclick="alert(2)';

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
  ];
}

function createRegistro(overrides = {}) {
  return {
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
    ...overrides,
  };
}

function buildState(overrides = {}) {
  return {
    equipamentos: baseEquipamentos(),
    registros: [createRegistro()],
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
      getPmocSummaryForCliente,
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

async function clickAndFlush(element) {
  await act(async () => {
    element.click();
  });
}

function expectNoExecutableHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
}

describe('relatorio cards DOM renderer with legacy handlers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    setupDom();
  });

  it('mantem o handler legado de rel-toggle-card lendo data-id dos cards DOM', async () => {
    const module = await loadRelatorioView();

    await renderWithRelatorio(module);

    const body = document.querySelector('#relatorio-corpo');
    const card = document.querySelector('.rel-record[data-id="reg-1"]');
    const toggle = card?.querySelector('.rel-record__toggle');
    const details = card?.querySelector('.rel-record__details');

    expect(body?.dataset.relatorioCardsMounted).toBe('true');
    expect(body?.dataset.viewMode).toBe('compact');
    expect(toggle?.getAttribute('data-rel-action')).toBe('rel-toggle-card');
    expect(toggle?.getAttribute('data-id')).toBe('reg-1');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(details?.hasAttribute('hidden')).toBe(true);

    await clickAndFlush(toggle);

    await vi.waitFor(() => {
      const expandedCard = document.querySelector('.rel-record[data-id="reg-1"]');
      expect(expandedCard?.classList.contains('is-expanded')).toBe(true);
      expect(
        expandedCard?.querySelector('.rel-record__toggle')?.getAttribute('aria-expanded'),
      ).toBe('true');
      expect(expandedCard?.querySelector('.rel-record__details')?.hasAttribute('hidden')).toBe(
        false,
      );
    });

    const expandedToggle = document.querySelector(
      '.rel-record[data-id="reg-1"] [data-rel-action="rel-toggle-card"]',
    );
    await clickAndFlush(expandedToggle);

    await vi.waitFor(() => {
      const collapsedCard = document.querySelector('.rel-record[data-id="reg-1"]');
      expect(collapsedCard?.classList.contains('is-expanded')).toBe(false);
      expect(
        collapsedCard?.querySelector('.rel-record__toggle')?.getAttribute('aria-expanded'),
      ).toBe('false');
      expect(collapsedCard?.querySelector('.rel-record__details')?.hasAttribute('hidden')).toBe(
        true,
      );
    });

    expect(module.mocks.signatureOpen).not.toHaveBeenCalled();
  });

  it('mantem o handler legado de rel-view-signature acionando o modal legado por data-id', async () => {
    const module = await loadRelatorioView();

    await renderWithRelatorio(module);
    module.mocks.refreshQuota.mockClear();
    module.mocks.getPmocSummaryForCliente.mockClear();

    const signatureButton = document.querySelector(
      '.rel-record[data-id="reg-1"] .rel-sigthumb[data-action="rel-view-signature"]',
    );
    expect(signatureButton).not.toBeNull();
    expect(signatureButton?.getAttribute('data-id')).toBe('reg-1');
    expect(signatureButton?.querySelector('img')?.getAttribute('src')).toBe(SAFE_SIGNATURE);

    await clickAndFlush(signatureButton);

    expect(module.mocks.signatureOpen).toHaveBeenCalledTimes(1);
    expect(module.mocks.signatureOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'reg-1', equipId: 'eq-1' }),
      { equipNome: 'Split Recepcao' },
    );
    expect(module.mocks.refreshQuota).not.toHaveBeenCalled();
    expect(module.mocks.getPmocSummaryForCliente).not.toHaveBeenCalled();
  });

  it('nao cria preview clicavel para assinatura insegura e nao executa payloads em data-id', async () => {
    const state = buildState({
      registros: [
        createRegistro({
          id: MALICIOUS_ID,
          data: '2026-04-21T09:00:00',
          assinatura: true,
        }),
        createRegistro({
          id: 'reg-unsafe',
          data: '2026-04-20T09:00:00',
          assinatura: true,
        }),
      ],
    });
    const module = await loadRelatorioView({
      state,
      signatureById: {
        [MALICIOUS_ID]: SAFE_SIGNATURE,
        'reg-unsafe': 'javascript:alert(1)',
      },
    });

    await renderWithRelatorio(module);

    const body = document.querySelector('#relatorio-corpo');
    const signatureButtons = [...body.querySelectorAll('[data-action="rel-view-signature"]')];
    const maliciousButton = signatureButtons.find(
      (button) => button.getAttribute('data-id') === MALICIOUS_ID,
    );
    const unsafeCard = [...body.querySelectorAll('.rel-record')].find(
      (card) => card.getAttribute('data-id') === 'reg-unsafe',
    );

    expect(maliciousButton).not.toBeNull();
    expect(maliciousButton?.querySelector('img')?.getAttribute('src')).toBe(SAFE_SIGNATURE);
    expect(unsafeCard?.querySelector('[data-action="rel-view-signature"]')).toBeNull();
    expect(unsafeCard?.querySelector('.rel-sigthumb--unavailable')).not.toBeNull();
    expectNoExecutableHtml(body);

    await clickAndFlush(maliciousButton);

    expect(module.mocks.signatureOpen).toHaveBeenCalledTimes(1);
    expect(module.mocks.signatureOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: MALICIOUS_ID }),
      { equipNome: 'Split Recepcao' },
    );
  });

  it('mantem fluxos PDF WhatsApp PMOC quota fora dos handlers dos cards e createRoot fora do adapter', () => {
    const adapterSource = readFileSync('src/ui/views/relatorio.js', 'utf8');

    expect(adapterSource).toContain('[data-rel-action="rel-toggle-card"]');
    expect(adapterSource).toContain('[data-action="rel-view-signature"]');
    expect(adapterSource).not.toMatch(/from ['"]react['"]|from ['"]react-dom\/client['"]/);
    expect(adapterSource).not.toMatch(/\bcreateRoot\b/);
    expect(adapterSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
