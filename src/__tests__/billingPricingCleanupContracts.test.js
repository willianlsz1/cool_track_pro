import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

describe('billing/pricing cleanup contracts', () => {
  it('does not keep orphan clientes paywall styles after removing commercial surfaces', () => {
    const componentsCss = readSource('src/assets/styles/components.css');
    const redesignCss = readSource('src/assets/styles/redesign.css');

    expect(componentsCss).not.toContain('clientes-paywall');
    expect(redesignCss).not.toContain('clientes-paywall');
  });

  it('does not keep the removed commercial upgrade nudge runtime stub', () => {
    const dashboardSource = readSource('src/ui/views/dashboard.js');

    expect(existsSync('src/ui/components/upgradeNudge.js')).toBe(false);
    expect(dashboardSource).not.toContain('UpgradeNudge');
    expect(dashboardSource).not.toContain('upgradeNudge');
  });

  it('does not keep hidden dashboard upgrade CTA contracts after commercial removal', () => {
    const dashboardSource = readSource('src/ui/views/dashboard.js');
    const proDraftSource = readSource('src/ui/views/dashboard/proDraft.js');

    expect(dashboardSource).not.toContain('upgradeCta');
    expect(proDraftSource).not.toContain('upgradeCta');
    expect(proDraftSource).not.toContain('appendUpgradeContract');
  });
});
