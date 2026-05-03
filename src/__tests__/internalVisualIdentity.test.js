import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('internal visual identity tokens', () => {
  it('defines the dark operational token foundation for the authenticated app', () => {
    const tokens = readFileSync('src/assets/styles/tokens.css', 'utf8');
    const redesign = readFileSync('src/assets/styles/redesign.css', 'utf8');
    const clientesPremium = readFileSync('src/assets/styles/clientes-premium.css', 'utf8');
    const charts = readFileSync('src/ui/components/charts.js', 'utf8');

    expect(tokens).toContain('--ct-app-bg: #26282b;');
    expect(tokens).toContain('--ct-surface: #353941;');
    expect(tokens).toContain('--ct-surface-raised: #3e434d;');
    expect(tokens).toContain('--ct-surface-subtle: #2d3036;');
    expect(tokens).toContain('--ct-border: rgba(144, 184, 248, 0.16);');
    expect(tokens).toContain('--ct-border-strong: rgba(144, 184, 248, 0.28);');
    expect(tokens).toContain('--ct-brand: #5f85db;');
    expect(tokens).toContain('--ct-brand-hover: #90b8f8;');
    expect(tokens).toContain('--ct-text: #f4f7fb;');
    expect(tokens).toContain('--ct-text-muted: #c7d0e0;');
    expect(tokens).toContain('--ct-text-faint: #98a4b8;');
    expect(tokens).toContain('--ct-shadow-soft: 0 18px 48px rgba(0, 0, 0, 0.28);');
    expect(tokens).toContain('--ct-success: #4ade80;');
    expect(tokens).toContain('--ct-info: #90b8f8;');
    expect(tokens).toContain('--ct-warn: #fbbf24;');
    expect(tokens).toContain('--ct-error: #fb7185;');
    expect(tokens).toContain('--bg: var(--ct-app-bg);');
    expect(tokens).toContain('--surface: var(--ct-surface);');
    expect(tokens).toContain('--card-hover: var(--ct-surface-raised);');
    expect(tokens).toContain('--primary: var(--ct-brand);');
    expect(tokens).toContain('--primary-strong: var(--ct-brand-hover);');
    expect(tokens).toContain('--text: var(--ct-text);');
    expect(tokens).toContain('--muted: var(--ct-text-muted);');
    expect(tokens).toContain('--muted-light: var(--ct-text-faint);');
    expect(tokens).toContain('--neon-cyan: var(--ct-brand);');
    expect(tokens).toContain('--neon-red: var(--ct-error);');
    expect(redesign).toContain('var(--ct-app-bg)');
    expect(redesign).toContain('var(--ct-surface) 0%, var(--ct-surface-subtle) 100%');
    expect(redesign).toContain('var(--ct-brand-hover), var(--ct-brand)');
    expect(redesign).toContain('var(--ct-gold-soft)');
    expect(redesign).toContain('.app-shell--with-sidebar .app-sidebar__brand');
    expect(redesign).toContain('PR 3 — Shared controls token foundation');
    expect(redesign).toContain('#app:not(.landing-active) .btn--primary');
    expect(redesign).toContain('background: var(--ct-brand) !important;');
    expect(redesign).toContain('#app:not(.landing-active) .form-control');
    expect(redesign).toContain('box-shadow: 0 0 0 3px rgba(144, 184, 248, 0.22) !important;');
    expect(redesign).toContain('#app:not(.landing-active) .badge--ok');
    expect(redesign).toContain('background: var(--ct-success-soft) !important;');
    expect(redesign).toContain('#app:not(.landing-active) .empty-state');
    expect(redesign).toContain('body:not(.landing-active) .modal-overlay');
    expect(redesign).toContain('Sidebar rhythm polish');
    expect(redesign).toContain('#app:not(.landing-active) .app-sidebar__nav');
    expect(redesign).toContain('min-height: 46px;');
    expect(redesign).toContain('gap: 24px !important;');
    expect(redesign).toContain('System visual polish - dark operational consistency');
    expect(redesign).toContain(
      ".modal\n  input:not([type='checkbox']):not([type='radio']):not([type='file']),",
    );
    expect(redesign).toContain('#app:not(.landing-active) .hist-quickfilter');
    expect(redesign).toContain('#app:not(.landing-active) .cli-card__actions');
    expect(redesign).toContain('overflow-wrap: anywhere;');
    expect(redesign).toContain('PR 4 - Dashboard operational dark refresh');
    expect(redesign).toContain('#app:not(.landing-active) #dash');
    expect(redesign).toContain('--dsh-accent: var(--ct-brand);');
    expect(redesign).toContain('--dsh-card-bg: var(--ct-surface);');
    expect(redesign).toContain('#app:not(.landing-active) #dash .dash__hero');
    expect(redesign).toContain('#app:not(.landing-active) #dash .dash__kpi');
    expect(redesign).toContain('#app:not(.landing-active) #dash .onb-card');
    expect(redesign).toContain('#app:not(.landing-active) #dash .dash-overflow-banner');
    expect(redesign).toContain('PR 5 - Equipamentos operational dark refresh');
    expect(redesign).toContain('#app:not(.landing-active) #view-equipamentos');
    expect(redesign).toContain('#app:not(.landing-active) #view-equipamentos .equip-hero');
    expect(redesign).toContain('#app:not(.landing-active) #view-equipamentos .equip-card');
    expect(redesign).toContain('#app:not(.landing-active) #view-equipamentos .quick-move-banner');
    expect(redesign).toContain('#app:not(.landing-active) #view-equipamentos .equip-idle-cluster');
    expect(redesign).toContain('PR 6 - Relatorios operational dark refresh');
    expect(redesign).toContain('#app:not(.landing-active) #view-relatorio');
    expect(redesign).toContain('#app:not(.landing-active) #view-relatorio .rel-record');
    expect(redesign).toContain(
      '#app:not(.landing-active) #view-relatorio .rel-toolbar__btn--whatsapp',
    );
    expect(redesign).toContain('PR 6 - Alertas operational dark refresh');
    expect(redesign).toContain('#app:not(.landing-active) #view-alertas');
    expect(redesign).toContain('#app:not(.landing-active) #view-alertas .alert-card--critical');
    expect(redesign).toContain('PR 6 - Orcamentos operational dark refresh');
    expect(redesign).toContain('#app:not(.landing-active) #view-orcamentos');
    expect(redesign).toContain(
      "#app:not(.landing-active) #view-orcamentos .orc-status-pill[data-status='aprovado']",
    );
    expect(redesign).toContain('PR 6 - Shell, page headers and action bars refinement');
    expect(redesign).toContain('--ct-action-height: 44px;');
    expect(redesign).toContain('#app:not(.landing-active) .app-shell--with-sidebar .app-sidebar');
    expect(redesign).toContain('#app:not(.landing-active) .app-sidebar__footer');
    expect(redesign).toContain('#app:not(.landing-active) .cli-page__header');
    expect(redesign).toContain('#app:not(.landing-active) #view-equipamentos .equip-hero');
    expect(redesign).toContain('#app:not(.landing-active) .hist-sticky-header');
    expect(redesign).toContain('#app:not(.landing-active) #view-relatorio .rel-hero');
    expect(redesign).toContain('#app:not(.landing-active) #view-alertas .section-title');
    expect(redesign).toContain('#app:not(.landing-active) #view-orcamentos .orc-header');
    expect(redesign).toContain(
      '#app:not(.landing-active) #view-relatorio .rel-toolbar__btn--whatsapp',
    );
    expect(redesign).toContain('background: rgba(144, 184, 248, 0.09) !important;');
    expect(redesign).toContain('PR 7 - Charts, filters, chips and pills refinement');
    expect(redesign).toContain('--ct-chip-height: 34px;');
    expect(redesign).toContain('#app:not(.landing-active) .chart-card');
    expect(redesign).toContain('#app:not(.landing-active) .chart-card__body canvas');
    expect(redesign).toContain('#app:not(.landing-active) .rel-segmented__opt.is-active');
    expect(redesign).toContain('#app:not(.landing-active) .hist-quickfilter.is-active');
    expect(redesign).toContain('#app:not(.landing-active) .hist-active-chip');
    expect(redesign).toContain('#app:not(.landing-active) .equip-filter--active');
    expect(redesign).toContain('#app:not(.landing-active) .equip-card__health-bar-full');
    expect(redesign).toContain('overflow-wrap: anywhere;');
    expect(redesign).toContain('background: var(--ct-success-soft) !important;');
    expect(redesign).toContain('background: var(--ct-warn-soft) !important;');
    expect(redesign).toContain('background: var(--ct-error-soft) !important;');
    expect(redesign).toContain('background: rgba(144, 184, 248, 0.1) !important;');
    expect(redesign).toContain('linear-gradient(90deg, var(--ct-brand), var(--ct-brand-hover))');
    expect(charts).toContain("primary: cssVar('--ct-brand')");
    expect(charts).toContain("primaryHover: cssVar('--ct-brand-hover')");
    expect(charts).toContain("success: cssVar('--ct-success')");
    expect(charts).toContain("warning: cssVar('--ct-warn')");
    expect(charts).toContain("danger: cssVar('--ct-error')");
    expect(charts).toContain('backgroundColor: c.surface3');
    expect(charts).toContain('cornerRadius: 10');
    expect(clientesPremium).toContain('PR 5 - Clientes operational dark refresh');
    expect(clientesPremium).toContain('--cli-card: var(--ct-surface);');
    expect(clientesPremium).toContain('--cli-panel: var(--ct-app-bg);');
    expect(clientesPremium).toContain('.cli-card');
    expect(clientesPremium).toContain('.cli-pmoc');
    expect(clientesPremium).toContain('Clientes KPI polish');
    expect(clientesPremium).toContain('.cli-kpi .cli-kpi__sub');
    expect(clientesPremium).toContain('border-radius: 999px !important;');
    expect(clientesPremium).toContain(
      'background: color-mix(in srgb, var(--ct-success-soft) 64%, transparent) !important;',
    );
    expect(clientesPremium).toContain('Clientes card polish');
    expect(clientesPremium).toContain('.cli-card__actions');
    expect(clientesPremium).toContain('text-overflow: ellipsis;');
    expect(clientesPremium).toContain('background: var(--ct-success-soft) !important;');
    expect(clientesPremium).toContain('background: var(--ct-warn-soft) !important;');
    expect(clientesPremium).toContain('background: var(--ct-error-soft) !important;');
    expect(clientesPremium).not.toMatch(/Ver demonstra[Ã§c][Ã£a]o/i);
    expect(redesign).not.toContain('linear-gradient(135deg, #f6c85f 0%, #d79b36 100%)');
    expect(redesign).not.toMatch(/Ver demonstra[çc][ãa]o/i);
  });
});
