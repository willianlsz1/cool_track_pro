import { beforeEach, describe, expect, it, vi } from 'vitest';

const getStateMock = vi.fn(() => ({ equipamentos: [], registros: [] }));
vi.mock('../core/state.js', () => ({
  getState: () => getStateMock(),
}));

import { UsageMeter, UsageMeterInternal as UMI } from '../ui/components/usageMeter.js';

function makeReg(data) {
  return { id: `reg-${Math.random()}`, equipId: 'eq-1', data, tipo: 'Manutencao Preventiva' };
}

describe('UsageMeter', () => {
  beforeEach(() => {
    getStateMock.mockReturnValue({ equipamentos: [], registros: [] });
  });

  it('renders operational usage without commercial cap or upgrade CTA', () => {
    const now = new Date();
    const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 10).toISOString();

    getStateMock.mockReturnValue({
      equipamentos: Array.from({ length: 4 }, (_, index) => ({ id: `eq-${index + 1}` })),
      registros: Array.from({ length: 7 }, () => makeReg(currentMonthDate)),
    });

    const html = UsageMeter.render({ planCode: 'free' });

    expect(html).toContain(
      'Equipamentos: <span class="usage-meter__value">4 / ilimitado</span> no modo operacional',
    );
    expect(html).toContain(
      'Relatorios este mes: <span class="usage-meter__value">7</span> sem limite comercial ativo',
    );
    expect(html).toContain('Area comercial indisponivel');
    expect(html).not.toContain('data-action="open-upgrade"');
    expect(html).not.toContain('LIMITE ULTRAPASSADO');
  });

  it('renders pro state without upgrade CTA priority', () => {
    const now = new Date();
    const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 10).toISOString();

    getStateMock.mockReturnValue({
      equipamentos: Array.from({ length: 7 }, (_, index) => ({ id: `eq-${index + 1}` })),
      registros: Array.from({ length: 12 }, () => makeReg(currentMonthDate)),
    });

    const html = UsageMeter.render({ planCode: 'pro' });

    expect(html).toContain('PLANO PRO ATIVO');
    expect(html).not.toContain('data-action="open-upgrade"');
  });

  it('keeps internal usage helpers coherent with unlimited commercial limits', () => {
    const now = new Date();
    const inMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 25).toISOString();

    expect(UMI.countReportsThisMonth([makeReg(inMonth), makeReg(prevMonth)])).toBe(1);
    expect(UMI.getReportBarColor(71)).toBe('var(--warning)');
    expect(UMI.getReportBarColor(91)).toBe('var(--danger)');
    expect(UMI.clampPercent(8, 3)).toBe(100);
    expect(UMI.getUsageState(4, 4).hasOverLimit).toBe(false);
    expect(UMI.getUsageState(2, 4).hasNearLimit).toBe(false);
    expect(UMI.normalizePlanCode('pro')).toBe('pro');
    expect(UMI.normalizePlanCode('enterprise')).toBe('free');
  });
});
