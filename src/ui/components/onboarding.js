/**
 * Modulo de onboarding (barrel) para manter API publica compativel.
 */

const HIGHLIGHT_KEY = 'cooltrack-highlight-id';

export { Profile } from '../../core/profile.js';
export { OnboardingBanner } from './onboarding/onboardingBanner.js';
export { ProfileModal } from './onboarding/profileModal.js';
export { FirstTimeExperience } from './onboarding/firstTimeExperience.js';

export const SavedHighlight = {
  markForHighlight(id) {
    sessionStorage.setItem(HIGHLIGHT_KEY, id);
  },
  applyIfPending() {
    const id = sessionStorage.getItem(HIGHLIGHT_KEY);
    if (!id) return false;
    sessionStorage.removeItem(HIGHLIGHT_KEY);
    requestAnimationFrame(() => {
      const el = Array.from(document.querySelectorAll('[data-reg-id]')).find(
        (node) => node.getAttribute('data-reg-id') === id,
      );
      if (!el) return;
      el.classList.add('timeline__item--saved');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => el.classList.remove('timeline__item--saved'), 3000);
    });
    return true;
  },
};
