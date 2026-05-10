import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handlers: new Map(),
  goTo: vi.fn(),
  startServiceRegistration: vi.fn(),
  skip: vi.fn(),
  complete: vi.fn(),
}));

vi.mock('../core/events.js', () => ({
  on: (action, handler) => mocks.handlers.set(action, handler),
}));

vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
}));

vi.mock('../ui/controller/serviceRegistrationEntry.js', () => ({
  startServiceRegistration: mocks.startServiceRegistration,
}));

vi.mock('../ui/components/onboarding/contextualOnboarding.js', () => ({
  ContextualOnboarding: {
    skip: mocks.skip,
    complete: mocks.complete,
  },
}));

vi.mock('../core/modal.js', () => ({
  Modal: { close: vi.fn(), open: vi.fn() },
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: { closeLightbox: vi.fn() },
}));

vi.mock('../ui/components/supportFeedbackModal.js', () => ({
  SupportFeedbackModal: { open: vi.fn() },
}));

vi.mock('../core/toast.js', () => ({
  Toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() },
}));

vi.mock('../ui/components/tour.js', () => ({
  Tour: { restart: vi.fn() },
}));

vi.mock('../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: { dismiss: vi.fn() },
}));

vi.mock('../ui/components/authscreen.js', () => ({
  AuthScreen: { show: vi.fn() },
}));

vi.mock('../ui/views/equipamentos.js', () => ({
  clearEditingState: vi.fn(),
  clearForcedEquipContext: vi.fn(),
  clearSetorEditingState: vi.fn(),
  clearEquipPhotosEditingState: vi.fn(),
  lockEquipContext: vi.fn(),
}));

vi.mock('../ui/views/clientes.js', () => ({
  populateClienteSelect: vi.fn(),
}));

vi.mock('../ui/components/nameplateCapture.js', () => ({
  applyNameplateCtaGate: vi.fn(),
  resetNameplateCtaState: vi.fn(),
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: vi.fn(() => false),
}));

vi.mock('../ui/components/pushOptInCard.js', () => ({
  PushOptInCard: { enable: vi.fn(), disable: vi.fn(), render: vi.fn() },
}));

vi.mock('../ui/components/installAppPrompt.js', () => ({
  InstallAppPrompt: { dismiss: vi.fn(), prompt: vi.fn() },
}));

describe('contextual onboarding navigation handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.handlers.clear();
    document.body.innerHTML = '<article data-contextual-onboarding></article>';
  });

  it('starts service registration from the contextual onboarding action', async () => {
    const { bindNavigationHandlers } =
      await import('../ui/controller/handlers/navigationHandlers.js');
    bindNavigationHandlers();

    await mocks.handlers.get('contextual-onboarding-register')?.();

    expect(mocks.complete).toHaveBeenCalledWith('register-service');
    expect(mocks.startServiceRegistration).toHaveBeenCalledWith();
    expect(document.querySelector('[data-contextual-onboarding]')).toBeNull();
  });

  it('navigates to Clientes from the contextual onboarding action', async () => {
    const { bindNavigationHandlers } =
      await import('../ui/controller/handlers/navigationHandlers.js');
    bindNavigationHandlers();

    await mocks.handlers.get('contextual-onboarding-clientes')?.();

    expect(mocks.complete).toHaveBeenCalledWith('organize-clients');
    expect(mocks.goTo).toHaveBeenCalledWith('clientes');
    expect(document.querySelector('[data-contextual-onboarding]')).toBeNull();
  });

  it('skips contextual onboarding without touching navigation mode', async () => {
    localStorage.setItem('cooltrack-navigation-mode', 'empresa');
    const { bindNavigationHandlers } =
      await import('../ui/controller/handlers/navigationHandlers.js');
    bindNavigationHandlers();

    await mocks.handlers.get('contextual-onboarding-skip')?.();

    expect(mocks.skip).toHaveBeenCalledWith();
    expect(localStorage.getItem('cooltrack-navigation-mode')).toBe('empresa');
    expect(document.querySelector('[data-contextual-onboarding]')).toBeNull();
  });
});
