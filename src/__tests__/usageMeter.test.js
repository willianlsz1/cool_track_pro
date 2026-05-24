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

    const html = UsageMeter.render();

    expect(html).toContain('Equipamentos cadastrados:');
    expect(html).toContain('<span class="usage-meter__value">4</span>');
    expect(html).toContain('Relatorios este mes:');
    expect(html).toContain('<span class="usage-meter__value">7</span>');
    expect(html).not.toContain('data-action="open-upgrade"');
    expect(html).not.toContain('upgrade');
  });

  it('keeps internal usage helpers coherent with unlimited operational limits', () => {
    const now = new Date();
    const inMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 25).toISOString();

    expect(UMI.countReportsThisMonth([makeReg(inMonth), makeReg(prevMonth)])).toBe(1);
    expect(UMI.getReportBarColor()).toBe('var(--primary)');
    expect(UMI.clampPercent(8, 3)).toBe(100);
    expect(UMI.getUsageState(4, 4).hasOverLimit).toBe(false);
    expect(UMI.getUsageState(2, 4).hasNearLimit).toBe(false);
    expect(UMI.normalizePlanCode('pro')).toBe('free');
    expect(UMI.normalizePlanCode('enterprise')).toBe('free');
  });
});
