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
    const dashboardContractsSource = readSource('src/ui/viewModels/dashboardContracts.js');
    const dashboardReadOnlyBlocksSource = readSource('src/ui/views/dashboard/readOnlyBlocks.js');
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');

    expect(dashboardSource).not.toContain('upgradeCta');
    expect(dashboardSource).not.toContain('_renderReadOnlyBlocksUpgradeHint');
    expect(proDraftSource).not.toContain('upgradeCta');
    expect(proDraftSource).not.toContain('appendUpgradeContract');
    expect(dashboardContractsSource).not.toContain('upgradeInlineHint');
    expect(dashboardReadOnlyBlocksSource).not.toContain('dash-upgrade-inline-hint');
    expect(shellViewsSource).not.toContain('dash-upgrade-inline-hint');
  });

  it('does not keep commercial upgrade style hooks after billing removal', () => {
    const componentsCss = readSource('src/assets/styles/components.css');
    const redesignCss = readSource('src/assets/styles/redesign.css');

    for (const source of [componentsCss, redesignCss]) {
      expect(source).not.toContain('upgrade-inline-hint');
      expect(source).not.toContain('upgrade-nudge-card');
    }
  });

  it('does not keep account actions named as billing or upgrade flows', () => {
    const contaSource = readSource('src/ui/views/conta.js');

    expect(contaSource).not.toContain("case 'manage-plan'");
    expect(contaSource).not.toContain("case 'upgrade'");
    expect(contaSource).not.toContain("case 'conta-manage-plan'");
  });

  it('does not keep PMOC blocked-state controls named as commercial upgrade actions', () => {
    const pmocModalSource = readSource('src/ui/components/pmocModal.js');

    expect(pmocModalSource).not.toContain('pmoc-upgrade');
  });

  it('does not keep nameplate quota messages pointing to paid-plan conversion', () => {
    const nameplateClientSource = readSource('src/ui/components/nameplateCapture.js');
    const nameplateFunctionSource = readSource('supabase/functions/analyze-nameplate/index.ts');

    for (const source of [nameplateClientSource, nameplateFunctionSource]) {
      expect(source).not.toContain('Faça upgrade');
      expect(source).not.toContain('Assine o Plus');
      expect(source).not.toContain('sugere Pro');
    }
  });
});
