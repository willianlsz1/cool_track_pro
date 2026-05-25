import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadOnboardingChecklist({
  state = { clientes: [], equipamentos: [], registros: [] },
} = {}) {
  vi.resetModules();

  vi.doMock('../core/state.js', () => ({
    getState: () => state,
  }));
  vi.doMock('../core/telemetry.js', () => ({
    trackEvent: vi.fn(),
  }));

  return import('../ui/components/onboarding/onboardingChecklist.js');
}

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('keeps the client step visible in the operational checklist', async () => {
    const { OnboardingChecklist } = await loadOnboardingChecklist();

    OnboardingChecklist.init('user-1');
    const model = OnboardingChecklist.getRenderModel();

    expect(model.visible).toBe(true);
    expect(model.total).toBe(5);
    expect(model.steps.map((step) => step.id)).toEqual([
      'cliente',
      'equipamento',
      'servico',
      'relatorio',
      'pdf',
    ]);
    expect(model.steps.find((step) => step.id === 'cliente')).toMatchObject({
      nav: 'clientes',
      completed: false,
    });
  });
});
