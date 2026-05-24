import { userStorage } from './userStorage.js';

const PROFILE_KEY = 'cooltrack-profile';
const LAST_TEC_KEY = 'cooltrack-last-tecnico';

function safeParseJSON(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const Profile = {
  get() {
    const scoped = safeParseJSON(userStorage.get(PROFILE_KEY));
    if (scoped) return scoped;

    const legacyRaw = localStorage.getItem(PROFILE_KEY);
    if (legacyRaw == null) return null;

    const legacy = safeParseJSON(legacyRaw);
    if (legacy === null) {
      try {
        localStorage.removeItem(PROFILE_KEY);
      } catch {
        /* storage unavailable: no-op */
      }
      return null;
    }
    return legacy;
  },

  save(data) {
    userStorage.set(PROFILE_KEY, JSON.stringify(data));
  },

  getDefaultTecnico() {
    return (
      this.get()?.nome || userStorage.get(LAST_TEC_KEY) || localStorage.getItem(LAST_TEC_KEY) || ''
    );
  },

  saveLastTecnico(nome) {
    if (!nome) return;
    userStorage.set(LAST_TEC_KEY, nome);
  },
};
