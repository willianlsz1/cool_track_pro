import { trackEvent } from '../../../core/telemetry.js';
import { CONTEXTUAL_ONBOARDING_STORAGE_KEY } from '../../../core/storage/constants.js';
import { userStorage } from '../../../core/userStorage.js';

export const CONTEXTUAL_ONBOARDING_KEY = CONTEXTUAL_ONBOARDING_STORAGE_KEY;

const STATUS_SEEN = 'seen';
const STATUS_SKIPPED = 'skipped';
const STATUS_COMPLETED = 'completed';

const ACTIONS = Object.freeze({
  register: 'contextual-onboarding-register',
  clients: 'contextual-onboarding-clientes',
  skip: 'contextual-onboarding-skip',
});

function nowIso() {
  try {
    return new Date().toISOString();
  } catch {
    return '';
  }
}

function readState() {
  try {
    const raw = userStorage.get(CONTEXTUAL_ONBOARDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeState(next) {
  userStorage.set(CONTEXTUAL_ONBOARDING_KEY, JSON.stringify(next));
}

function buildState(status, extras = {}) {
  return {
    status,
    updatedAt: nowIso(),
    ...extras,
  };
}

function hiddenModel() {
  return {
    visible: false,
    title: '',
    description: '',
    actions: {
      register: { label: '', action: ACTIONS.register },
      clients: { label: '', action: ACTIONS.clients },
      skip: { label: '', action: ACTIONS.skip },
    },
  };
}

function visibleModel() {
  return {
    visible: true,
    title: 'Como voce quer comecar?',
    description: 'Escolha uma primeira acao. Voce pode mudar de caminho depois.',
    actions: {
      register: {
        label: 'Quero registrar um servico',
        action: ACTIONS.register,
      },
      clients: {
        label: 'Quero organizar meus clientes',
        action: ACTIONS.clients,
      },
      skip: {
        label: 'Pular',
        action: ACTIONS.skip,
      },
    },
  };
}

function isFinalState(state) {
  return [STATUS_SEEN, STATUS_SKIPPED, STATUS_COMPLETED].includes(state?.status);
}

export const ContextualOnboarding = {
  init() {
    return this.getState();
  },

  getState() {
    return readState();
  },

  getRenderModel() {
    const current = readState();
    if (isFinalState(current)) return hiddenModel();

    writeState(buildState(STATUS_SEEN));
    trackEvent('contextual_onboarding_seen', {});
    return visibleModel();
  },

  skip() {
    writeState(buildState(STATUS_SKIPPED));
    trackEvent('contextual_onboarding_skipped', {});
  },

  complete(choice) {
    const normalizedChoice =
      choice === 'organize-clients' ? 'organize-clients' : 'register-service';
    writeState(buildState(STATUS_COMPLETED, { choice: normalizedChoice }));
    trackEvent('contextual_onboarding_completed', { choice: normalizedChoice });
  },
};
