import { describe, expect, it, vi } from 'vitest';

import {
  renderViewEquipCoverBlock,
  renderViewEquipDadosPlacaSections,
  renderViewEquipDetailHtml,
  renderViewEquipServiceTimeline,
  renderViewEquipSetorInfoRow,
} from '../../ui/detail.js';

function makeUtils() {
  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  return {
    escapeHtml: vi.fn(escapeHtml),
    escapeAttr: vi.fn(escapeHtml),
    formatDatetime: vi.fn((value) => `dt:${value}`),
  };
}

function makeDeps(overrides = {}) {
  const utils = overrides.Utils ?? makeUtils();
  return {
    Utils: utils,
    getSetores: overrides.getSetores ?? vi.fn(() => []),
    getEquipmentVisualMeta:
      overrides.getEquipmentVisualMeta ??
      vi.fn(() => ({
        initials: 'SP',
        tone: 'cyan',
        photoUrl: null,
      })),
    isCachedPlanPlusOrHigher: overrides.isCachedPlanPlusOrHigher ?? vi.fn(() => true),
    formatDadosPlacaRows: overrides.formatDadosPlacaRows ?? vi.fn(() => []),
    eqDetailSubtitle:
      overrides.eqDetailSubtitle ?? vi.fn((eq) => (eq.local ? utils.escapeHtml(eq.local) : '')),
    infoRowValueOrEmpty:
      overrides.infoRowValueOrEmpty ??
      vi.fn((value, addLabel, safeId, variant = '', fieldKey = '') => {
        const clean = value && String(value).trim() !== '' ? String(value).trim() : null;
        if (clean) {
          return `<span class="info-row__value${variant === 'mono' ? ' info-row__value--mono' : ''}">${utils.escapeHtml(clean)}</span>`;
        }
        const focusAttr = fieldKey ? ` data-focus-field="${utils.escapeAttr(fieldKey)}"` : '';
        return `<button type="button" class="info-row__value info-row__value--add" data-action="edit-equip" data-id="${safeId}"${focusAttr}>${utils.escapeHtml(addLabel)}</button>`;
      }),
    riskFactorChipHtml:
      overrides.riskFactorChipHtml ??
      vi.fn(
        (factor, safeId) =>
          `<button type="button" class="eq-risk-panel__factor eq-risk-panel__factor--actionable" data-action="go-register-equip" data-id="${safeId}">${utils.escapeHtml(factor)}</button>`,
      ),
  };
}

function makeModel(overrides = {}) {
  const eq = {
    id: 'eq-1',
    nome: 'Split Sala',
    tag: 'TAG-01',
    tipo: 'Split Hi-Wall',
    fluido: 'R-410A',
    modelo: 'M-9000',
    local: 'Sala 1',
    setorId: 'setor-1',
    periodicidadePreventivaDias: 90,
    fotos: [],
    dadosPlaca: { fabricante: 'ACME' },
    ...overrides.eq,
  };
  return {
    eq,
    regs: overrides.regs ?? [],
    score: overrides.score ?? 88,
    cls: overrides.cls ?? 'ok',
    safeId: overrides.safeId ?? 'eq-1',
    context: overrides.context ?? { periodicidadeDias: 60 },
    risk: overrides.risk ?? {
      classification: 'alto',
      factors: ['preventiva vencida'],
    },
    proximaPreventiva: overrides.proximaPreventiva ?? '10/06/2026',
    pmocContext: overrides.pmocContext ?? {
      status: 'atencao',
      statusLabel: 'Atenção',
      statusTone: 'warn',
      periodicidadeLabel: '60 dias',
      ultimaPreventivaLabel: '01/04/2026',
      proximaPreventivaLabel: '10/06/2026',
      recommendedAction: 'Preventiva prevista para breve.',
      ctaLabel: 'Registrar preventiva',
    },
    healthSummary: overrides.healthSummary ?? 'Histórico dentro da rotina prevista',
    ringR: overrides.ringR ?? 30,
    ringC: overrides.ringC ?? 188.5,
    ringOffset: overrides.ringOffset ?? 22.6,
  };
}

describe('detail HTML render helpers', () => {
  it('renderiza setor info row quando há setor resolvido', () => {
    const deps = makeDeps({
      getSetores: vi.fn(() => [{ id: 'setor-1', nome: 'Cobertura' }]),
    });

    const html = renderViewEquipSetorInfoRow({ setorId: 'setor-1' }, deps);

    expect(html).toContain('info-row info-row--setor');
    expect(html).toContain('Setor');
    expect(html).toContain('Cobertura');
    expect(html).not.toContain('info-row__value--muted');
  });

  it('renderiza timeline com registros e empty state quando não há registros', () => {
    const deps = makeDeps();

    const html = renderViewEquipServiceTimeline(
      [
        { tipo: 'Preventiva <ok>', data: '2026-05-01T10:00:00.000Z' },
        { tipo: 'Corretiva', data: '2026-04-01T10:00:00.000Z' },
      ],
      deps,
    );
    const empty = renderViewEquipServiceTimeline([], deps);

    expect(html).toContain('eq-svc-timeline');
    expect(html).toContain('Preventiva &lt;ok&gt;');
    expect(html).toContain('dt:2026-05-01T10:00:00.000Z');
    expect(empty).toContain('Nenhum serviço registrado neste equipamento.');
  });

  it('renderiza cover com foto, fallback e ação de fotos para Plus', () => {
    const deps = makeDeps({
      getEquipmentVisualMeta: vi.fn(() => ({
        initials: 'SL',
        tone: 'green',
        photoUrl: 'https://cdn.test/foto.jpg?x=<bad>',
      })),
      isCachedPlanPlusOrHigher: vi.fn(() => true),
    });
    const model = makeModel({ eq: { fotos: [{ url: 'https://cdn.test/foto.jpg' }] } });

    const result = renderViewEquipCoverBlock(model, deps);

    expect(result.firstPhotoUrl).toBe('https://cdn.test/foto.jpg?x=<bad>');
    expect(result.html).toContain('eq-detail-cover--has-photo');
    expect(result.html).toContain('src="https://cdn.test/foto.jpg?x=&lt;bad&gt;"');
    expect(result.html).toContain('eq-detail-cover__fallback-initials">SL</span>');
    expect(result.html).toContain('data-action="open-eq-photos-editor"');
    expect(result.html).toContain('data-id="eq-1"');
    expect(result.html).toContain('Gerenciar fotos');
  });

  it('preserva CTA Free para fotos sem alterar data-action do gate', () => {
    const deps = makeDeps({ isCachedPlanPlusOrHigher: vi.fn(() => false) });

    const result = renderViewEquipCoverBlock(makeModel(), deps);

    expect(result.html).toContain('eq-detail-cover--locked');
    expect(result.html).toContain('data-action="open-upgrade"');
    expect(result.html).toContain('data-upgrade-source="equip_detail_photos"');
    expect(result.html).toContain('data-highlight-plan="plus"');
    expect(result.html).toContain('Desbloquear com Plus');
  });

  it('renderiza dados de placa fixos e extras escapados', () => {
    const deps = makeDeps({
      formatDadosPlacaRows: vi.fn(() => [
        { label: 'Fabricante', value: 'ACME <script>', extra: false },
        { label: 'Serial', value: 'SN-1', extra: false, mono: true },
        { label: 'Tensão custom', value: '220V <img>', extra: true },
      ]),
    });

    const result = renderViewEquipDadosPlacaSections(makeModel().eq, deps);

    expect(result.dadosPlacaSectionHtml).toContain('Dados da etiqueta');
    expect(result.dadosPlacaSectionHtml).toContain('ACME &lt;script&gt;');
    expect(result.dadosPlacaSectionHtml).toContain('info-row__value--mono');
    expect(result.dadosPlacaExtrasSectionHtml).toContain('Outras informações da etiqueta');
    expect(result.dadosPlacaExtrasSectionHtml).toContain('220V &lt;img&gt;');
  });

  it('renderiza detalhe completo preservando título, ações principais, risco e timeline', () => {
    const deps = makeDeps({
      getSetores: vi.fn(() => [{ id: 'setor-1', nome: 'Sala técnica' }]),
      formatDadosPlacaRows: vi.fn(() => [{ label: 'Fabricante', value: 'ACME', extra: false }]),
    });
    const model = makeModel({
      regs: [{ tipo: 'Preventiva', data: '2026-05-01T10:00:00.000Z' }],
    });

    const result = renderViewEquipDetailHtml(model, deps);

    expect(result.html).toContain('class="eq-detail-view"');
    expect(result.html).toContain('id="eq-det-title">Split Sala</div>');
    expect(deps.eqDetailSubtitle).toHaveBeenCalledWith(model.eq);
    expect(result.html).toContain('eq-detail-hero eq-detail-hero--ok');
    expect(result.html).toContain('eq-risk-panel eq-risk-panel--alto');
    expect(result.html).toContain('eq-pmoc-context eq-pmoc-context--warn');
    expect(result.html).toContain('PMOC / Preventiva');
    expect(result.html).toContain('Atenção');
    expect(result.html).toContain('01/04/2026');
    expect(result.html).toContain('10/06/2026');
    expect(result.html).toContain('Registrar preventiva');
    expect(deps.riskFactorChipHtml).toHaveBeenCalledWith('preventiva vencida', 'eq-1');
    expect(result.html).toContain('Histórico de serviços');
    expect(result.html).toContain('data-action="go-register-equip" data-id="eq-1"');
    expect(result.html).toContain('data-action="edit-equip" data-id="eq-1"');
    expect(result.html).toContain('data-action="toggle-eq-detail-menu" data-id="eq-1"');
    expect(result.html).toContain('data-action="delete-equip" data-id="eq-1"');
    expect(result.firstPhotoUrl).toBeNull();
  });

  it('escapa campos maliciosos relevantes no HTML completo', () => {
    const deps = makeDeps();
    const model = makeModel({
      safeId: 'eq-&quot;1',
      eq: {
        nome: '<img src=x onerror=alert(1)>',
        tipo: '<script>tipo</script>',
        fluido: '<b>R</b>',
        modelo: '<svg>',
        local: '<local>',
        tag: '<tag>',
      },
      healthSummary: '&lt;safe summary&gt;',
      risk: { classification: 'baixo', factors: [] },
    });

    const result = renderViewEquipDetailHtml(model, deps);

    expect(result.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(result.html).toContain('&lt;script&gt;tipo&lt;/script&gt;');
    expect(result.html).toContain('&lt;b&gt;R&lt;/b&gt;');
    expect(result.html).toContain('&lt;svg&gt;');
    expect(result.html).not.toContain('<img src=x onerror=alert(1)>');
    expect(result.html).not.toContain('<script>tipo</script>');
  });
});
