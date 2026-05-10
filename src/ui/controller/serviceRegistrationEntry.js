import { goTo } from '../../core/router.js';
import { getState } from '../../core/state.js';

function normalizeEquipId(params = {}) {
  return String(params.equipId || params.equipamentoId || params.id || '').trim();
}

function hasEquipamentos() {
  const state = getState();
  return Array.isArray(state.equipamentos) && state.equipamentos.length > 0;
}

export function startServiceRegistration(params = {}) {
  const equipId = normalizeEquipId(params);
  if (equipId) {
    goTo('registro', { equipId });
    return { mode: 'direct', equipId };
  }

  goTo('registro', { openEquipPicker: true });
  return { mode: hasEquipamentos() ? 'pick-equipment' : 'create-equipment' };
}
