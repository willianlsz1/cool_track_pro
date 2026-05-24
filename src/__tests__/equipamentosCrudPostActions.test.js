import { describe, expect, it, vi } from 'vitest';

import { runSaveEquipPostActions } from '../ui/views/equipamentos/crud/postActions.js';

function createHarness() {
  document.body.innerHTML = `
    <input id="eq-nome" />
  `;
  const input = document.getElementById('eq-nome');
  const focusNameInput = vi.fn(() => input.focus());
  const focusSpy = vi.spyOn(input, 'focus');

  return {
    focusNameInput,
    focusSpy,
    goTo: vi.fn(),
    startServiceRegistration: vi.fn(),
  };
}

function run(overrides = {}) {
  const harness = createHarness();
  runSaveEquipPostActions({
    keepOpen: false,
    openRegistro: false,
    payload: { equipId: 'eq-1', clienteId: 'cli-1' },
    focusNameInput: harness.focusNameInput,
    goTo: harness.goTo,
    startServiceRegistration: harness.startServiceRegistration,
    ...overrides,
  });
  return harness;
}

describe('crud/postActions', () => {
  it('nao faz navegacao ou foco quando nao ha postAction', () => {
    const harness = run();

    expect(harness.focusNameInput).not.toHaveBeenCalled();
    expect(harness.focusSpy).not.toHaveBeenCalled();
    expect(harness.goTo).not.toHaveBeenCalled();
  });

  it('foca eq-nome no fluxo clone/keepOpen sem navegar', () => {
    const harness = run({ keepOpen: true });

    expect(harness.focusNameInput).toHaveBeenCalledTimes(1);
    expect(harness.focusSpy).toHaveBeenCalledTimes(1);
    expect(harness.goTo).not.toHaveBeenCalled();
  });

  it('chama orquestrador de registro com equipId no fluxo register', () => {
    const harness = run({ openRegistro: true });

    expect(harness.startServiceRegistration).toHaveBeenCalledTimes(1);
    expect(harness.startServiceRegistration).toHaveBeenCalledWith({ equipId: 'eq-1' });
    expect(harness.goTo).not.toHaveBeenCalled();
    expect(harness.focusNameInput).not.toHaveBeenCalled();
  });

  it('nao navega para registro quando equipId nao existe', () => {
    const harness = run({ openRegistro: true, payload: { clienteId: 'cli-1' } });

    expect(harness.startServiceRegistration).not.toHaveBeenCalled();
    expect(harness.goTo).not.toHaveBeenCalled();
  });
});
