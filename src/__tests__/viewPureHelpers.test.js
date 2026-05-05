import { describe, expect, test } from 'vitest';
import {
  normalizeText,
  classifyRiskFactor,
  recencia,
  ctaLabelForAction,
  componentPillModel,
  preventiveTimelineModel,
} from '../ui/views/equipamentos/helpers.js';
} from '../ui/helpers/equipamentosPure.js';

import { asArray, isPreventivaTipo } from '../ui/helpers/registroPure.js';

describe('equipamentos pure helpers', () => {
  test('normalizeText remove acentos e caixa', () => {
    expect(normalizeText('PréventÍva')).toBe('preventiva');
  });

  test('classifyRiskFactor identifica fator positivo', () => {
    expect(classifyRiskFactor('Histórico limpo e em dia')).toBe('positive');
    expect(classifyRiskFactor('parado desde ontem')).toBe('neutral');
  });

  test('recencia calcula labels esperadas', () => {
    const now = new Date('2026-05-04T00:00:00Z');
    expect(recencia('2026-05-04T00:00:00Z', now)).toBe('hoje');
    expect(recencia('2026-05-03T00:00:00Z', now)).toBe('ontem');
  });

  test('ctaLabelForAction preserva mapeamento', () => {
    const ACTION = { REGISTER_PREVENTIVE: 'rp' };
    expect(ctaLabelForAction('rp', ACTION)).toBe('Registrar serviço preventivo');
    expect(ctaLabelForAction('x', ACTION)).toBe('Registrar serviço');
  });

  test('componentPillModel retorna pill configurado ou null', () => {
    expect(componentPillModel('evaporadora')).toEqual({ label: 'Evap.', tint: 'cyan' });
    expect(componentPillModel('desconhecido')).toBeNull();
  });

  test('preventiveTimelineModel calcula próximos rótulos', () => {
    const d = (v) => v;
    expect(preventiveTimelineModel({}, d)).toBeNull();
    expect(preventiveTimelineModel({ proximaPreventiva: -2 }, d)).toEqual({
      nextLabel: 'vencida há 2d',
      nextTone: 'danger',
    });
    expect(preventiveTimelineModel({ proximaPreventiva: 'ref' }, () => 0)).toEqual({
      nextLabel: 'hoje',
      nextTone: 'danger',
    });
    expect(preventiveTimelineModel({ proximaPreventiva: 3 }, d)).toEqual({
      nextLabel: '3 dias',
      nextTone: 'warn',
    });
  });
});

describe('registro pure helpers', () => {
  test('asArray normaliza valor', () => {
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray(null)).toEqual([]);
  });

  test('isPreventivaTipo detecta tipo preventiva', () => {
    expect(isPreventivaTipo('Manutenção preventiva')).toBe(true);
    expect(isPreventivaTipo('Corretiva')).toBe(false);
  });
});
