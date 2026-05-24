import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';
import { RELATORIO_PUBLIC_IDS } from '../ui/viewModels/relatorioContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setupDom() {
  document.body.innerHTML = renderShellViews();
}

function baseState(overrides = {}) {
  return {
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split Recepcao',
        tag: 'SP-01',
        local: 'Recepcao',
        clienteId: 'cliente-1',
        setorId: 'setor-1',
        criticidade: 'media',
        prioridadeOperacional: 'normal',
        periodicidadePreventivaDias: 30,
      },
    ],
    registros: [
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
        proxima: '2026-05-10',
      },
    ],
    clientes: [{ id: 'cliente-1', nome: 'Cliente ACME' }],
    setores: [{ id: 'setor-1', nome: 'Recepcao' }],
    ...overrides,
  };
}

async function loadRelatorio({ state = baseState(), planCode = 'free', pmocSummary = null } = {}) {
  vi.resetModules();

  const getState = vi.fn(() => state);
  const findEquip = vi.fn(
    (id) => state.equipamentos?.find((equipamento) => equipamento.id === id) || null,
  );
  const refreshQuota = vi.fn();
  const getPmocSummaryForCliente = vi.fn(() => pmocSummary);
  const getSignatureForRecord = vi.fn(() => null);
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
    formatDadosPlacaRows: vi.fn(() => []),
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

  const relatorio = await import('../ui/views/relatorio.js');
  return {
    relatorio,
    mocks: {
      findEquip,
      getPmocSummaryForCliente,
      getSignatureForRecord,
      refreshQuota,
      signatureOpen,
    },
  };
}

async function renderRelatorio(ctx, options = {}) {
  await act(async () => {
    ctx.relatorio.populateRelatorioSelects();
    await ctx.relatorio.renderRelatorio(options);
  });
}

function slot() {
  return document.getElementById(RELATORIO_PUBLIC_IDS.companyPmocSlot);
}

function expectNoExecutableHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[href^="javascript:"], [src^="javascript:"]')).toBeNull();
  expect(root?.querySelector('[data-nav^="javascript:"]')).toBeNull();
}

describe('relatorio legacy #rel-company-pmoc-slot contracts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    setupDom();
  });

  it('mantem o slot vazio fora do Pro sem executar PMOC, PDF, WhatsApp, quota ou assinatura', async () => {
    const ctx = await loadRelatorio({ planCode: 'free' });

    await renderRelatorio(ctx, { equipId: 'eq-1' });

    expect(slot()).not.toBeNull();
    expect(slot()?.querySelector('.rel-company-pmoc')).toBeNull();
    expect(slot()?.querySelector(['[data-nav="', 'pric', 'ing', '"]'].join(''))).toBeNull();
    expect(ctx.mocks.getPmocSummaryForCliente).not.toHaveBeenCalled();
    expect(ctx.mocks.signatureOpen).not.toHaveBeenCalled();
  });

  it('move o PMOC Pro para o hero e mantem o slot legado vazio', async () => {
    const ctx = await loadRelatorio({ planCode: 'pro', pmocSummary: { status: 'em_dia' } });

    await renderRelatorio(ctx, { equipId: 'eq-1' });

    const hero = document.querySelector('.pmoc-hero');
    const primary = hero?.querySelector('[data-action="open-pmoc-modal"]');

    expect(slot()?.querySelector('.rel-company-pmoc')).toBeNull();
    expect(hero?.textContent).toContain('PMOC formal');
    expect(primary?.textContent).toContain('Gerar PMOC');
    expect(primary?.getAttribute('data-tier')).toBe('pro');
    expect(ctx.mocks.refreshQuota).toHaveBeenCalled();
  });

  it('nao reintroduz alerta ou navegacao PMOC legada quando PMOC exige atencao', async () => {
    const ctx = await loadRelatorio({ planCode: 'pro', pmocSummary: { status: 'atencao' } });

    await renderRelatorio(ctx, { equipId: 'eq-1' });

    expect(slot()?.querySelector('.rel-company-pmoc')).toBeNull();
    expect(document.querySelector('.pmoc-hero')?.textContent).toContain('PMOC formal');
    expect(document.querySelector('[data-nav="clientes"]')).toBeNull();
    expect(ctx.mocks.refreshQuota).toHaveBeenCalled();
    expect(ctx.mocks.signatureOpen).not.toHaveBeenCalled();
  });

  it('mantem dados maliciosos inertes e nao importa createRoot no adapter legado', async () => {
    const alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
    const maliciousState = baseState({
      equipamentos: [
        {
          ...baseState().equipamentos[0],
          nome: '<img src=x onerror=alert(1)>',
          tag: '<script>alert(1)</script>',
          local: '<svg onload=alert(1)>',
          clienteId: 'cliente-1',
          setorId: 'setor-1',
        },
      ],
      clientes: [{ id: 'cliente-1', nome: '<b onclick=alert(1)>Cliente</b>' }],
      setores: [{ id: 'setor-1', nome: '<img src=x onerror=alert(1)>' }],
    });
    const ctx = await loadRelatorio({
      state: maliciousState,
      planCode: 'pro',
      pmocSummary: { status: 'atrasado' },
    });

    await renderRelatorio(ctx, { equipId: 'eq-1' });

    expectNoExecutableHtml(slot());
    expect(alertSpy).not.toHaveBeenCalled();
    expect(readFileSync('src/ui/views/relatorio.js', 'utf8')).not.toMatch(/createRoot/);
  });
});
