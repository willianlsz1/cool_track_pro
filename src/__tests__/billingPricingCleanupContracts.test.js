import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

function collectRuntimeSources(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const path = `${dir}/${entry}`;
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry === '__tests__') continue;
      out.push(...collectRuntimeSources(path));
      continue;
    }
    if (!/\.(js|jsx|ts|tsx)$/.test(entry)) continue;
    if (entry.includes('.test.')) continue;
    out.push(path);
  }
  return out;
}

describe('billing/pricing cleanup contracts', () => {
  it('does not keep skipped e2e paywall specs after commercial cleanup', () => {
    expect(existsSync('e2e/specs/equipamentos-legacy-photos-nameplate-paywall.spec.js')).toBe(
      false,
    );
  });

  it('does not keep legacy e2e assertions that navigate to pricing', () => {
    expect(existsSync('e2e/specs/relatorio-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep orphan clientes paywall styles after removing commercial surfaces', () => {
    expect(existsSync('src/assets/styles/components.css')).toBe(false);
    expect(existsSync('src/assets/styles/redesign.css')).toBe(false);
  });

  it('does not keep the removed commercial upgrade nudge runtime stub', () => {
    expect(existsSync('src/ui/components/upgradeNudge.js')).toBe(false);
  });

  it('does not keep hidden dashboard upgrade CTA contracts after retiring the dashboard cluster', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');

    expect(existsSync('src/ui/views/dashboard.js')).toBe(false);
    expect(existsSync('src/ui/views/dashboard/proDraft.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/dashboardContracts.js')).toBe(false);
    expect(existsSync('src/ui/views/dashboard/readOnlyBlocks.js')).toBe(false);
    expect(shellViewsSource).not.toContain('dash-upgrade-inline-hint');
  });

  it('does not keep commercial upgrade style hooks after billing removal', () => {
    expect(existsSync('src/assets/styles/components.css')).toBe(false);
    expect(existsSync('src/assets/styles/components/_pmoc.css')).toBe(false);
    expect(existsSync('src/assets/styles/redesign.css')).toBe(false);
  });

  it('does not keep account actions named as billing or upgrade flows', () => {
    expect(existsSync('src/ui/views/conta.js')).toBe(false);
  });

  it('does not keep the removed legacy PMOC formal modal after commercial cleanup', () => {
    expect(existsSync('src/ui/components/pmocModal.js')).toBe(false);
  });

  it('does not keep nameplate quota messages pointing to paid-plan conversion', () => {
    const nameplateClientSource = readSource('src/ui/components/nameplateCapture.js');
    const nameplateFunctionSource = readSource('supabase/functions/analyze-nameplate/index.ts');

    for (const source of [nameplateClientSource, nameplateFunctionSource]) {
      expect(source).not.toContain('Faça upgrade');
      expect(source).not.toContain('Assine o Plus');
      expect(source).not.toContain('sugere Pro');
      expect(source).not.toContain('Cota mensal do Plus');
      expect(source).not.toContain('Cota mensal do Pro');
    }
  });

  it('does not keep paid-plan copy in legacy runtime gates', () => {
    const sources = [
      readSource('src/ui/views/registro.js'),
      readSource('src/ui/shell/templates/modals.js'),
    ];

    expect(existsSync('src/ui/components/accountModal.js')).toBe(false);
    expect(existsSync('src/ui/controller/handlers/profileAccountHandlers.js')).toBe(false);

    for (const source of sources) {
      expect(source).not.toContain('planos pagos');
      expect(source).not.toContain('diferencial pago');
      expect(source).not.toContain('Desbloquear com Plus');
      expect(source).not.toContain('area comercial removida');
    }
  });

  it('does not keep active commercial billing/pricing terms in runtime modules', () => {
    const runtimeSources = [
      ...collectRuntimeSources('src/core'),
      ...collectRuntimeSources('src/domain'),
      ...collectRuntimeSources('src/features'),
      ...collectRuntimeSources('src/ui'),
    ].filter((path) => !path.startsWith('src/ui/views/pricing'));

    const forbidden = [
      'billing',
      'pricing',
      'checkout',
      'stripe',
      'Stripe',
      'start-checkout',
      'manage-subscription',
      'open-upgrade',
    ];

    const offenders = [];
    for (const path of runtimeSources) {
      const source = readSource(path);
      for (const term of forbidden) {
        if (source.includes(term)) offenders.push(`${path}: ${term}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('does not keep PDF or WhatsApp usage quota resources in runtime modules', () => {
    const sources = [
      readSource('src/core/usageLimits.js'),
      readSource('src/core/plans/operationalAccessPolicy.js'),
      readSource('src/core/plans/operationalPlan.js'),
    ].join('\n');

    expect(sources).not.toContain('USAGE_RESOURCE_PDF_EXPORT');
    expect(sources).not.toContain('USAGE_RESOURCE_WHATSAPP_SHARE');
    expect(sources).not.toContain('FEATURE_PDF_EXPORT');
    expect(sources).not.toContain('PREMIUM_FEATURE_PDF_EXPORT');
    expect(sources).not.toContain('pdf_export');
    expect(sources).not.toContain('whatsapp_share');
  });

  it('does not describe exported account data with removed billing or PDF/share labels', () => {
    const exportUserDataSource = readSource('supabase/functions/export-user-data/index.ts');

    expect(exportUserDataSource).not.toContain('dados de cadastro e assinatura');
    expect(exportUserDataSource).not.toContain('contadores de uso mensal (PDF, WhatsApp)');
    expect(exportUserDataSource).not.toContain('pdf_export');
    expect(exportUserDataSource).not.toContain('whatsapp_share');
  });
});
