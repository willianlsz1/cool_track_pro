import { describe, expect, it, vi } from 'vitest';

import { runSaveEquipPostActions } from '../../crud/postActions.js';

function createHarness() {
  document.body.innerHTML = `
    <input id="eq-nome" />
    <button type="button" data-action="open-pmoc-modal">PMOC</button>
  `;
  const input = document.getElementById('eq-nome');
  const pmocButton = document.querySelector('[data-action="open-pmoc-modal"]');
  const focusNameInput = vi.fn(() => input.focus());
  const focusSpy = vi.spyOn(input, 'focus');
  const clickSpy = vi.spyOn(pmocButton, 'click');

  return {
    focusNameInput,
    focusSpy,
    clickSpy,
    goTo: vi.fn(),
    startServiceRegistration: vi.fn(),
    requestAnimationFrameRef: vi.fn((callback) => callback()),
    documentRef: document,
    pmocButton,
  };
}

function run(overrides = {}) {
  const harness = createHarness();
  runSaveEquipPostActions({
    keepOpen: false,
    openRegistro: false,
    openPmoc: false,
    payload: { equipId: 'eq-1', clienteId: 'cli-1' },
    focusNameInput: harness.focusNameInput,
    goTo: harness.goTo,
    startServiceRegistration: harness.startServiceRegistration,
    requestAnimationFrameRef: harness.requestAnimationFrameRef,
    documentRef: harness.documentRef,
    ...overrides,
  });
  return harness;
}

describe('crud/postActions', () => {
  it('não faz navegação, click ou foco quando não há postAction', () => {
    const harness = run();

    expect(harness.focusNameInput).not.toHaveBeenCalled();
    expect(harness.focusSpy).not.toHaveBeenCalled();
    expect(harness.goTo).not.toHaveBeenCalled();
    expect(harness.requestAnimationFrameRef).not.toHaveBeenCalled();
    expect(harness.clickSpy).not.toHaveBeenCalled();
  });

  it('foca eq-nome no fluxo clone/keepOpen sem navegar ou clicar', () => {
    const harness = run({ keepOpen: true });

    expect(harness.focusNameInput).toHaveBeenCalledTimes(1);
    expect(harness.focusSpy).toHaveBeenCalledTimes(1);
    expect(harness.goTo).not.toHaveBeenCalled();
    expect(harness.requestAnimationFrameRef).not.toHaveBeenCalled();
    expect(harness.clickSpy).not.toHaveBeenCalled();
  });

  it('chama orquestrador de registro com equipId no fluxo register', () => {
    const harness = run({ openRegistro: true });

    expect(harness.startServiceRegistration).toHaveBeenCalledTimes(1);
    expect(harness.startServiceRegistration).toHaveBeenCalledWith({ equipId: 'eq-1' });
    expect(harness.goTo).not.toHaveBeenCalled();
    expect(harness.focusNameInput).not.toHaveBeenCalled();
    expect(harness.requestAnimationFrameRef).not.toHaveBeenCalled();
    expect(harness.clickSpy).not.toHaveBeenCalled();
  });

  it('não navega para registro quando equipId não existe', () => {
    const harness = run({ openRegistro: true, payload: { clienteId: 'cli-1' } });

    expect(harness.startServiceRegistration).not.toHaveBeenCalled();
    expect(harness.goTo).not.toHaveBeenCalled();
    expect(harness.clickSpy).not.toHaveBeenCalled();
  });

  it('agenda dois requestAnimationFrame no fluxo pmoc', () => {
    const harness = run({ openPmoc: true });

    expect(harness.goTo).toHaveBeenCalledWith('relatorio');
    expect(harness.requestAnimationFrameRef).toHaveBeenCalledTimes(2);
  });

  it('seta dataset.clienteId no botão PMOC e clica quando clienteId existe', () => {
    const harness = run({ openPmoc: true });

    expect(harness.pmocButton.dataset.clienteId).toBe('cli-1');
    expect(harness.clickSpy).toHaveBeenCalledTimes(1);
  });

  it('clica no botão PMOC sem setar clienteId quando clienteId não existe', () => {
    const harness = run({ openPmoc: true, payload: { equipId: 'eq-1' } });

    expect(harness.pmocButton.dataset.clienteId).toBeUndefined();
    expect(harness.clickSpy).toHaveBeenCalledTimes(1);
  });

  it('não chama ações de outros fluxos quando só pmoc está ativo', () => {
    const harness = run({ openPmoc: true });

    expect(harness.focusNameInput).not.toHaveBeenCalled();
    expect(harness.goTo).toHaveBeenCalledTimes(1);
    expect(harness.goTo).not.toHaveBeenCalledWith('registro', { equipId: 'eq-1' });
  });
});
