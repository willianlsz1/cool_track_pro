import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mountDashboardReadOnlyBlocksReact,
  unmountDashboardReadOnlyBlocksReact,
} from '../react/entrypoints/dashboardReadOnlyBlocksIsland.jsx';
import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../ui/viewModels/dashboardContracts.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function emptyReadOnlyBlocks() {
  return {
    criticalNow: {
      visible: false,
      count: 0,
      groups: [],
    },
    alertsMini: {
      visible: false,
      alerts: [],
    },
    criticalEquipments: {
      visible: false,
      equipments: [],
    },
    recentServices: {
      visible: false,
      records: [],
    },
  };
}

function filledReadOnlyBlocks(overrides = {}) {
  const malicious = overrides.malicious || 'Split <img src=x onerror=alert(1)>';
  return {
    criticalNow: {
      visible: true,
      count: 1,
      groups: [
        {
          label: 'Crítico agora',
          items: [
            {
              icon: '!!',
              tone: 'danger',
              title: malicious,
              subtitle: malicious,
              action: DASHBOARD_ACTIONS.goRegisterEquip,
              id: 'eq-1',
              ctaLabel: 'Registrar',
            },
          ],
        },
      ],
    },
    alertsMini: {
      visible: true,
      alerts: [
        {
          critical: true,
          action: DASHBOARD_ACTIONS.goRegisterEquip,
          id: 'eq-1',
          icon: '!',
          equipmentName: malicious,
          title: malicious,
          subtitle: malicious,
        },
      ],
    },
    criticalEquipments: {
      visible: true,
      equipments: [
        {
          id: 'eq-1',
          statusClass: 'danger',
          ariaLabel: malicious,
          visual: {
            initials: 'SP',
            tone: 'danger',
            photoUrl: '',
          },
          name: malicious,
          meta: malicious,
          statusLabel: 'Crítico',
          health: {
            score: 42,
            className: 'danger',
          },
          risk: {
            classification: 'alto',
            label: 'Alto',
            score: 88,
            trend: {
              trend: 'worsening',
              delta: 7,
            },
          },
          priority: {
            level: 3,
            label: 'Alta',
          },
          metrics: {
            lastLabel: 'Ontem',
            lastType: malicious,
            nextLabel: 'Hoje',
            nextClass: 'equip-card__metric-value--danger',
            nextIcon: '!!',
          },
          ctaLabel: 'Registrar serviço corretivo →',
        },
      ],
    },
    recentServices: {
      visible: true,
      records: [
        {
          dateLabel: '30/04/2026 10:00',
          title: malicious,
          context: malicious,
          obs: malicious,
        },
      ],
    },
  };
}

function setRoot() {
  document.body.innerHTML = `<div id="${DASHBOARD_PUBLIC_IDS.readOnlyBlocksRoot}"></div>`;
  return document.getElementById(DASHBOARD_PUBLIC_IDS.readOnlyBlocksRoot);
}

function assertNoUnsafeHtml(root) {
  expect(root?.querySelector('script')).toBeNull();
  expect(root?.querySelector('img')).toBeNull();
  expect(root?.querySelector('[onerror]')).toBeNull();
  expect(root?.querySelector('[onclick]')).toBeNull();
  expect(root?.innerHTML).not.toMatch(/javascript:/i);
}

describe('dashboard read-only blocks React island', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts in the read-only container preserving public sections in empty state', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardReadOnlyBlocksReact(root, { readOnlyBlocks: emptyReadOnlyBlocks() });
    });

    expect(root?.dataset.reactDashboardReadOnlyBlocksMounted).toBe('true');
    expect(root?.id).toBe(DASHBOARD_PUBLIC_IDS.readOnlyBlocksRoot);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.criticalSection}`)).not.toBeNull();
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.alertsSection}`)).not.toBeNull();
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.criticosSection}`)).not.toBeNull();
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.recentesSection}`)).not.toBeNull();
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.criticalSection}`)?.hidden).toBe(true);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.alertsSection}`)?.hidden).toBe(true);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.criticosSection}`)?.hidden).toBe(true);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.recentesSection}`)?.hidden).toBe(true);
    expect(root?.querySelectorAll('.dash__section')).toHaveLength(4);
    expect(root?.querySelectorAll('.dash__section-header')).toHaveLength(4);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.criticalNowCount}`)?.textContent).toBe('0');
  });

  it('updates an existing root without duplicate React roots or duplicate sections', async () => {
    const root = setRoot();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      mountDashboardReadOnlyBlocksReact(root, { readOnlyBlocks: emptyReadOnlyBlocks() });
      mountDashboardReadOnlyBlocksReact(root, { readOnlyBlocks: filledReadOnlyBlocks() });
    });

    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.criticalSection}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.alertsSection}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.criticosSection}`)).toHaveLength(1);
    expect(root?.querySelectorAll(`#${DASHBOARD_PUBLIC_IDS.recentesSection}`)).toHaveLength(1);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.criticalSection}`)?.hidden).toBe(false);
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.alertsSection}`)?.hidden).toBe(false);
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'createRoot() on a container that has already been passed to createRoot()',
      ),
    );
  });

  it('unmounts safely and tolerates repeated calls', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardReadOnlyBlocksReact(root, { readOnlyBlocks: filledReadOnlyBlocks() });
      unmountDashboardReadOnlyBlocksReact(root);
      unmountDashboardReadOnlyBlocksReact(root);
    });

    expect(root?.dataset.reactDashboardReadOnlyBlocksMounted).toBeUndefined();
    expect(root?.innerHTML).toBe('');
  });

  it('renders mini alerts, critical equipments and recent services preserving DOM contracts', async () => {
    const root = setRoot();

    await act(async () => {
      mountDashboardReadOnlyBlocksReact(root, { readOnlyBlocks: filledReadOnlyBlocks() });
    });

    const alertCard = root?.querySelector('.alert-card');
    expect(alertCard).not.toBeNull();
    expect(alertCard?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.goRegisterEquip);
    expect(alertCard?.getAttribute('data-id')).toBe('eq-1');
    expect(root?.querySelector('.dash-alertas-list')).not.toBeNull();

    const criticalNow = root?.querySelector('.critical-now-item');
    expect(criticalNow).not.toBeNull();
    expect(criticalNow?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.goRegisterEquip);
    expect(criticalNow?.getAttribute('data-id')).toBe('eq-1');
    expect(root?.querySelector(`#${DASHBOARD_PUBLIC_IDS.criticalNowCount}`)?.textContent).toBe('1');

    const criticalEquip = root?.querySelector('.equip-card');
    expect(criticalEquip).not.toBeNull();
    expect(criticalEquip?.getAttribute('data-action')).toBe(DASHBOARD_ACTIONS.viewEquip);
    expect(criticalEquip?.getAttribute('data-id')).toBe('eq-1');
    expect(root?.querySelector('.equip-card__cta')?.getAttribute('data-action')).toBe(
      DASHBOARD_ACTIONS.goRegisterEquip,
    );

    const recentCard = root?.querySelector('.recent-card');
    expect(recentCard).not.toBeNull();
    expect(recentCard?.getAttribute('data-nav')).toBe('historico');
    expect(root?.querySelector('.dash-recentes-grid')).not.toBeNull();
  });

  it('escapes dynamic text and does not use unsafe React HTML APIs', async () => {
    const root = setRoot();
    const malicious = '"><script>alert(1)</script><img src=x onerror=alert(2)> onclick="alert(3)"';
    const model = filledReadOnlyBlocks({ malicious });
    model.criticalEquipments.equipments[0].visual.photoUrl = 'javascript:alert(4)';

    await act(async () => {
      mountDashboardReadOnlyBlocksReact(root, {
        readOnlyBlocks: model,
      });
    });

    expect(root?.textContent).toContain(malicious);
    assertNoUnsafeHtml(root);

    const componentSource = readFileSync('src/react/pages/DashboardReadOnlyBlocks.jsx', 'utf8');
    expect(componentSource).not.toMatch(/dangerouslySetInnerHTML|innerHTML|document\.|window\./);
  });

  it('does not require charts, onboarding, header or createRoot in dashboard adapter', () => {
    const dashboardSource = readFileSync('src/ui/views/dashboard.js', 'utf8');

    expect(document.getElementById('chart-status-pie')).toBeNull();
    expect(document.getElementById('dash-onboarding')).toBeNull();
    expect(document.getElementById('app-header')).toBeNull();
    expect(dashboardSource).toContain('../../react/entrypoints/dashboardReadOnlyBlocksIsland.jsx');
    expect(dashboardSource).not.toMatch(/react-dom\/client|createRoot/);
  });
});
