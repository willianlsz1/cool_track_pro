import { readFileSync } from 'node:fs';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShellViews } from '../ui/shell/templates/views.js';
import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_PUBLIC_IDS,
} from '../ui/viewModels/relatorioContracts.js';
import { buildRelatorioCompanyPmocModel } from '../ui/viewModels/relatorioCompanyPmocModel.js';

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

describe('relatorio company PMOC model', () => {
  it('mantem o bloco invisivel para planos nao Pro', () => {
    expect(buildRelatorioCompanyPmocModel({ isPro: false })).toEqual(
      expect.objectContaining({
        visible: false,
        showAttention: false,
      }),
    );
  });

  it('expõe contrato visual Pro com acao PMOC e navegacao de pendencias sob atencao', () => {
    expect(buildRelatorioCompanyPmocModel({ isPro: true, hasPmocAttention: true })).toEqual(
      expect.objectContaining({
        visible: true,
        title: 'PMOC',
        primaryAction: RELATORIO_ACTIONS.openPmocModal,
        primaryLabel: 'Gerar PMOC formal',
        showAttention: true,
        attentionLabel: 'PMOC precisa de aten\u00e7\u00e3o',
        secondaryNav: RELATORIO_NAV_TARGETS.clientes,
        secondaryLabel: 'Ver pend\u00eancias',
      }),
    );
  });
});

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
    expect(slot()?.querySelector('[data-nav="pricing"]')).toBeNull();
    expect(ctx.mocks.getPmocSummaryForCliente).not.toHaveBeenCalled();
    expect(ctx.mocks.signatureOpen).not.toHaveBeenCalled();
  });

  it('preserva contrato Pro com PMOC disponivel e sem pendencias', async () => {
    const ctx = await loadRelatorio({ planCode: 'pro', pmocSummary: { status: 'em_dia' } });

    await renderRelatorio(ctx, { equipId: 'eq-1' });

    const block = slot()?.querySelector('.rel-company-pmoc');
    const primary = block?.querySelector('[data-action="open-pmoc-modal"]');

    expect(block).not.toBeNull();
    expect(block?.getAttribute('aria-label')).toBe('PMOC da empresa');
    expect(block?.querySelector('.rel-company-pmoc__head h3')?.textContent).toBe('PMOC');
    expect(block?.querySelector('.rel-company-pmoc__desc')?.textContent).toContain(
      'Documento anual',
    );
    expect(block?.querySelector('.rel-company-pmoc__actions')).not.toBeNull();
    expect(primary?.textContent).toContain('Gerar PMOC formal');
    expect(primary?.classList.contains('btn--primary')).toBe(true);
    expect(block?.querySelector('.rel-company-pmoc__alert')).toBeNull();
    expect(block?.querySelector('[data-nav="clientes"]')).toBeNull();
  });

  it('preserva alerta e navegacao legada para clientes quando PMOC exige atencao', async () => {
    const ctx = await loadRelatorio({ planCode: 'pro', pmocSummary: { status: 'atencao' } });

    await renderRelatorio(ctx, { equipId: 'eq-1' });

    const block = slot()?.querySelector('.rel-company-pmoc');
    const alert = block?.querySelector('.rel-company-pmoc__alert');
    const pending = block?.querySelector('[data-nav="clientes"]');

    expect(alert?.textContent).toBe('PMOC precisa de aten\u00e7\u00e3o');
    expect(pending?.textContent).toContain('Ver pend\u00eancias');
    expect(pending?.classList.contains('btn--ghost')).toBe(true);
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
