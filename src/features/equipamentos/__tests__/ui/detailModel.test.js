import { describe, expect, it, vi } from 'vitest';

import { buildViewEquipDetailModel } from '../../ui/detailModel.js';

function makeUtils() {
  return {
    escapeAttr: vi.fn((value) => `attr:${String(value)}`),
    escapeHtml: vi.fn((value) => `html:${String(value)}`),
    formatDate: vi.fn((value) => `date:${String(value)}`),
  };
}

function makeDeps(overrides = {}) {
  const utils = overrides.utils ?? makeUtils();
  const regsForEquip = overrides.regsForEquip ?? vi.fn(() => []);
  const health = overrides.health ?? {
    score: 90,
    context: { proximaPreventiva: '2026-06-10' },
    reasons: [],
  };
  const risk = overrides.risk ?? {
    score: 20,
    classification: 'baixo',
    factors: ['rotina estável'],
  };

  return {
    id: overrides.id ?? 'eq-1',
    equip: overrides.equip ?? { id: 'eq-1', nome: 'Split 01' },
    regsForEquip,
    evaluateEquipmentHealth: overrides.evaluateEquipmentHealth ?? vi.fn(() => health),
    evaluateEquipmentRisk: overrides.evaluateEquipmentRisk ?? vi.fn(() => risk),
    getHealthClass: overrides.getHealthClass ?? vi.fn(() => 'ok'),
    utils,
  };
}

describe('buildViewEquipDetailModel', () => {
  it('monta model básico para equipamento sem registros', () => {
    const deps = makeDeps({
      id: 'eq-<1>',
      health: { score: 90, context: {}, reasons: [] },
    });

    const model = buildViewEquipDetailModel(deps);

    expect(model).toMatchObject({
      id: 'eq-<1>',
      eq: deps.equip,
      regs: [],
      score: 90,
      cls: 'ok',
      safeId: 'attr:eq-<1>',
      context: {},
      proximaPreventiva: 'Sem agenda',
      healthSummary: 'Histórico dentro da rotina prevista',
      ringR: 30,
      ringC: 188.5,
      ringOffset: 18.8,
    });
    expect(model.health).toEqual({ score: 90, context: {}, reasons: [] });
    expect(model.risk).toEqual({
      score: 20,
      classification: 'baixo',
      factors: ['rotina estável'],
    });
  });

  it('ordena registros do mais recente para o mais antigo e preserva quantidade', () => {
    const regs = [
      { id: 'r-old', data: '2026-01-10T10:00:00.000Z', tipo: 'Preventiva' },
      { id: 'r-new', data: '2026-03-10T10:00:00.000Z', tipo: 'Corretiva' },
      { id: 'r-mid', data: '2026-02-10T10:00:00.000Z', tipo: 'Inspeção' },
    ];
    const deps = makeDeps({ regsForEquip: vi.fn(() => regs) });

    const model = buildViewEquipDetailModel(deps);

    expect(model.regs).toHaveLength(3);
    expect(model.regs.map((reg) => reg.id)).toEqual(['r-new', 'r-mid', 'r-old']);
  });

  it('preserva health, risk, classe e chama as dependências de domínio esperadas', () => {
    const regs = [{ id: 'r1', data: '2026-02-01', tipo: 'Preventiva' }];
    const equip = { id: 'eq-1', nome: 'Câmara fria', criticidade: 'alta' };
    const health = {
      score: 58,
      context: { proximaPreventiva: '2026-05-20', daysToNext: 12 },
      reasons: ['preventiva vencida', 'criticidade alta'],
    };
    const risk = {
      score: 72,
      classification: 'alto',
      factors: ['preventiva vencida'],
      suggestedAction: 'registrar preventiva',
    };
    const deps = makeDeps({
      equip,
      regsForEquip: vi.fn(() => regs),
      health,
      risk,
      getHealthClass: vi.fn(() => 'danger'),
    });

    const model = buildViewEquipDetailModel(deps);

    expect(deps.regsForEquip).toHaveBeenCalledWith('eq-1');
    expect(deps.evaluateEquipmentHealth).toHaveBeenCalledWith(equip, model.regs);
    expect(deps.getHealthClass).toHaveBeenCalledWith(58);
    expect(deps.evaluateEquipmentRisk).toHaveBeenCalledWith(equip, model.regs);
    expect(model.health).toBe(health);
    expect(model.risk).toBe(risk);
    expect(model.cls).toBe('danger');
    expect(model.score).toBe(58);
  });

  it('formata próxima preventiva a partir do contexto de health', () => {
    const deps = makeDeps({
      health: {
        score: 82,
        context: { proximaPreventiva: '2026-07-15', daysToNext: 68 },
        reasons: [],
      },
    });

    const model = buildViewEquipDetailModel(deps);

    expect(deps.utils.formatDate).toHaveBeenCalledWith('2026-07-15');
    expect(model.proximaPreventiva).toBe('date:2026-07-15');
    expect(model.context.daysToNext).toBe(68);
  });

  it('preserva campos consumidos pelo HTML atual', () => {
    const model = buildViewEquipDetailModel(makeDeps());

    expect(Object.keys(model)).toEqual([
      'id',
      'eq',
      'regs',
      'health',
      'score',
      'cls',
      'safeId',
      'context',
      'risk',
      'proximaPreventiva',
      'healthSummary',
      'ringR',
      'ringC',
      'ringOffset',
    ]);
  });

  it('lida com dados ausentes no equipamento sem quebrar', () => {
    const deps = makeDeps({
      equip: { id: 'eq-1' },
      health: { score: 0, context: null, reasons: [] },
      risk: { score: 0, classification: 'baixo', factors: [] },
      getHealthClass: vi.fn(() => 'danger'),
    });

    const model = buildViewEquipDetailModel(deps);

    expect(model.eq).toEqual({ id: 'eq-1' });
    expect(model.proximaPreventiva).toBe('Sem agenda');
    expect(model.healthSummary).toBe('Histórico dentro da rotina prevista');
    expect(model.ringOffset).toBe(188.5);
  });

  it('escapa resumo de health quando há motivos', () => {
    const deps = makeDeps({
      health: {
        score: 70,
        context: {},
        reasons: ['<script>risco</script>', 'preventiva vencida', 'ignorado no resumo'],
      },
    });

    const model = buildViewEquipDetailModel(deps);

    expect(deps.utils.escapeHtml).toHaveBeenCalledWith(
      '<script>risco</script> | preventiva vencida',
    );
    expect(model.healthSummary).toBe('html:<script>risco</script> | preventiva vencida');
  });
});
