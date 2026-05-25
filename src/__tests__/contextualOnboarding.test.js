import { beforeEach, describe, expect, it } from 'vitest';

import { CONTEXTUAL_ONBOARDING_STORAGE_KEY } from '../core/storage/constants.js';
import { setCurrentUser } from '../core/userStorage.js';

const userScopedStorageKey = (userId) => `ct:${userId}:${CONTEXTUAL_ONBOARDING_STORAGE_KEY}`;
const STORAGE_KEY = userScopedStorageKey('user-1');

describe('ContextualOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentUser('user-1');
  });

  it('shows once for a user and persists seen state', async () => {
    const { ContextualOnboarding } =
      await import('../ui/components/onboarding/contextualOnboarding.js');

    const firstModel = ContextualOnboarding.getRenderModel();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const secondModel = ContextualOnboarding.getRenderModel();

    expect(firstModel.visible).toBe(true);
    expect(firstModel.actions.register.action).toBe('contextual-onboarding-register');
    expect(firstModel.actions.clients.action).toBe('contextual-onboarding-clientes');
    expect(saved.status).toBe('seen');
    expect(secondModel.visible).toBe(false);
  });

  it('keeps onboarding scoped per user', async () => {
    const { ContextualOnboarding } =
      await import('../ui/components/onboarding/contextualOnboarding.js');

    ContextualOnboarding.getRenderModel();
    setCurrentUser('user-2');

    expect(ContextualOnboarding.getRenderModel().visible).toBe(true);
    expect(localStorage.getItem(userScopedStorageKey('user-2'))).toContain('"seen"');
  });

  it('persists skipped and completed states without changing navigation mode or plan data', async () => {
    const { ContextualOnboarding } =
      await import('../ui/components/onboarding/contextualOnboarding.js');

    localStorage.setItem('cooltrack-navigation-mode', 'empresa');
    localStorage.setItem('ct:user-1:plan-cache', 'free');

    ContextualOnboarding.skip();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toMatchObject({ status: 'skipped' });
    expect(ContextualOnboarding.getRenderModel().visible).toBe(false);

    localStorage.removeItem(STORAGE_KEY);
    ContextualOnboarding.complete('register-service');

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toMatchObject({
      status: 'completed',
      choice: 'register-service',
    });
    expect(localStorage.getItem('cooltrack-navigation-mode')).toBe('empresa');
    expect(localStorage.getItem('ct:user-1:plan-cache')).toBe('free');
  });
});
