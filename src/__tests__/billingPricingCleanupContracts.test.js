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

function collectFiles(dir, pattern) {
  return readdirSync(dir)
    .filter((entry) => pattern.test(entry))
    .map((entry) => `${dir}/${entry}`)
    .sort();
}

describe('billing/pricing cleanup contracts', () => {
  it('does not keep skipped e2e paywall specs after commercial cleanup', () => {
    expect(existsSync('e2e/specs/equipamentos-legacy-photos-nameplate-paywall.spec.js')).toBe(
      false,
    );
    expect(existsSync('src/__tests__/setorModal.premium.test.js')).toBe(false);
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

  it('does not present Setores as a commercial Pro surface in runtime copy', () => {
    const sources = [
      readSource('src/ui/views/equipamentos/setor/setorUI.js'),
      readSource('src/ui/shell/templates/modals.js'),
    ].join('\n');

    expect(sources).not.toContain('Setores é uma feature do plano Pro');
    expect(sources).not.toContain('Pro · Setores');
    expect(sources).not.toContain('Setor (Pro)');
    expect(sources).not.toContain('>PRO<');
    expect(sources).not.toContain('pro-badge');
  });

  it('does not keep Setores runtime comments tied to commercial plan language', () => {
    const sources = [
      readSource('src/ui/views/equipamentos/setor/setorPersist.js'),
      readSource('src/ui/views/equipamentos/ui/renderEquip.js'),
      readSource('src/ui/controller/handlers/equipmentHandlers.js'),
      readSource('src/ui/views/equipamentos/equipmentCards.js'),
      readSource('src/core/inputValidation.js'),
    ].join('\n');

    expect(sources).not.toContain('feature exclusiva do plano Pro');
    expect(sources).not.toContain('feature Pro');
    expect(sources).not.toContain('Setores (PRO)');
    expect(sources).not.toContain('Setor (PRO)');
    expect(sources).not.toContain('Vista Pro');
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

  it('does not keep nameplate runtime copy tied to paid-plan labels', () => {
    const sources = [
      readSource('src/ui/components/nameplateCapture.js'),
      readSource('src/domain/nameplateAnalysis.js'),
      readSource('src/ui/shell/templates/modals.js'),
      readSource('src/ui/controller/handlers/navigationHandlers.js'),
    ].join('\n');

    expect(sources).not.toContain('Teste grátis');
    expect(sources).not.toContain('Free com quota');
    expect(sources).not.toContain('Free e acabou');
    expect(sources).not.toContain('Plus+');
    expect(sources).not.toContain('plano efetivo');
    expect(sources).not.toContain('vira o Plus');
    expect(sources).not.toContain('Upsell CTA');
    expect(sources).not.toContain('>PLUS<');
    expect(sources).not.toContain('plus-badge');
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
      expect(source).not.toContain('_showPmocChecklistUpsell');
      expect(source).not.toContain('_redirectPmocChecklistUpsell');
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
      'portal',
      'comercial',
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

  it('does not keep removed commercial terms in active Supabase Edge Functions', () => {
    const functionSources = collectRuntimeSources('supabase/functions');
    const forbidden = ['billing', 'pricing', 'checkout', 'stripe', 'Stripe', 'portal'];

    const offenders = [];
    for (const path of functionSources) {
      const source = readSource(path);
      for (const term of forbidden) {
        if (source.includes(term)) offenders.push(`${path}: ${term}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('does not keep removed commercial provider terms in Supabase dashboard queries', () => {
    const dashboardQueriesSource = readSource('supabase/dashboard-queries.sql');

    expect(dashboardQueriesSource).not.toMatch(/billing|stripe|checkout|portal|stripe_/i);
  });

  it('keeps removed commercial schema terms limited to known historical migrations covered by retirement', () => {
    const migrationFiles = collectFiles('supabase/migrations', /\.sql$/);
    const commercialMigrationFiles = migrationFiles.filter((path) =>
      /billing|stripe|checkout/i.test(readSource(path)),
    );
    const retirementMigration = readSource(
      'supabase/migrations/20260524010000_remove_commercial_schema.sql',
    );

    expect(commercialMigrationFiles).toEqual([
      'supabase/migrations/20260411000001_security_subscription_usage.sql',
      'supabase/migrations/20260419130000_protect_profile_fields.sql',
      'supabase/migrations/20260509190000_harden_profile_usage.sql',
      'supabase/migrations/20260524010000_remove_commercial_schema.sql',
    ]);
    expect(existsSync('supabase/migrations/20260420160000_stripe_webhook_idempotency.sql')).toBe(
      false,
    );
    expect(existsSync('supabase/migrations/20260425150000_stripe_webhook_claimed_at.sql')).toBe(
      false,
    );
    expect(retirementMigration).toContain('drop column if exists stripe_customer_id');
    expect(retirementMigration).toContain('drop column if exists stripe_subscription_id');
    expect(retirementMigration).toContain('drop table if exists public.stripe_webhook_events');
  });

  it('does not keep removed commercial wording in historical Supabase comments', () => {
    const sources = [
      readSource('supabase/functions/analyze-nameplate/index.ts'),
      readSource('supabase/migrations/20260420130000_enforce_photo_plan_gate.sql'),
      readSource('supabase/migrations/20260420140000_enforce_setores_pro_gate.sql'),
      readSource('supabase/migrations/20260420150000_enforce_plan_quotas.sql'),
    ].join('\n');

    expect(sources).not.toMatch(
      /Kiwify|webhook do Stripe|pricing table|margem real|teste grátis|workflow real|feature premium|sem pagar|upsell/i,
    );
    expect(sources).not.toMatch(/\u00c3[\u0080-\u00bf]|\u00e2[\u0080-\u00ff\u20ac\u201d]/);
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
    expect(sources).not.toContain('PREMIUM_FEATURE_EQUIPAMENTOS');
    expect(sources).not.toContain('PREMIUM_FEATURE_PDF_EXPORT');
    expect(sources).not.toContain('pdf_export');
    expect(sources).not.toContain('whatsapp_share');
  });

  it('does not route active Equipamentos and Historico callers through paid-plan helpers', () => {
    const sources = [
      readSource('src/ui/views/equipamentos.js'),
      readSource('src/ui/views/equipamentos/bridges/renderPlan.js'),
      readSource('src/ui/views/equipamentos/setor/setorPersist.js'),
      readSource('src/ui/views/equipamentos/ui/openEditEquip.js'),
      readSource('src/ui/views/equipamentos/ui/renderEquip.js'),
      readSource('src/ui/views/equipamentos/ui/renderFlatList.js'),
      readSource('src/ui/views/historico.js'),
    ].join('\n');

    expect(sources).not.toContain('hasProAccess');
    expect(sources).not.toContain('hasPlusAccess');
    expect(sources).not.toContain('isCachedPlanPro');
  });

  it('does not describe exported account data with removed billing or PDF/share labels', () => {
    const exportUserDataSource = readSource('supabase/functions/export-user-data/index.ts');

    expect(exportUserDataSource).not.toContain('dados de cadastro e assinatura');
    expect(exportUserDataSource).not.toContain('contadores de uso mensal (PDF, WhatsApp)');
    expect(exportUserDataSource).not.toContain('pdf_export');
    expect(exportUserDataSource).not.toContain('whatsapp_share');
  });
});
