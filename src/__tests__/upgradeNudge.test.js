import { UpgradeNudge } from '../ui/components/upgradeNudge.js';

describe('UpgradeNudge', () => {
  it('does not render commercial dashboard nudges', () => {
    expect(UpgradeNudge.renderDashboardCard({ planCode: 'free' })).toBe('');
    expect(UpgradeNudge.renderDashboardCard({ planCode: 'plus' })).toBe('');
    expect(UpgradeNudge.renderDashboardCard({ planCode: 'pro' })).toBe('');
  });

  it('does not render commercial inline hints', () => {
    expect(UpgradeNudge.renderInlineHint('Setores', { requiredPlan: 'pro' })).toBe('');
  });
});
