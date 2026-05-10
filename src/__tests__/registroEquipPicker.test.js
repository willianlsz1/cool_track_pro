import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
}));

vi.mock('../core/state.js', () => ({
  getState: mocks.getState,
}));

describe('registro equipment picker', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML =
      '<select id="r-equip"></select><button id="r-equip-trigger"></button>';
    document.body.className = '';
    mocks.getState.mockReturnValue({
      equipamentos: [],
      clientes: [],
      setores: [],
    });
    globalThis.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };
  });

  it('oferece cadastro com postAction register quando nao ha equipamentos', async () => {
    const { openRegistroEquipPicker } = await import('../ui/components/registroEquipPicker.js');

    openRegistroEquipPicker();

    expect(document.getElementById('registro-equip-picker')?.dataset.surface).toBe('picker');
    const createButton = document.querySelector('.registro-equip-picker__create');
    expect(createButton?.classList.contains('btn')).toBe(true);
    expect(createButton?.classList.contains('btn--primary')).toBe(true);
    expect(createButton?.dataset.action).toBe('open-modal');
    expect(createButton?.dataset.id).toBe('modal-add-eq');
    expect(createButton?.dataset.postAction).toBe('register');
  });

  it('fecha o picker ao acionar cadastro de primeiro equipamento', async () => {
    const { openRegistroEquipPicker } = await import('../ui/components/registroEquipPicker.js');

    openRegistroEquipPicker();
    document.querySelector('.registro-equip-picker__create')?.click();

    expect(document.getElementById('registro-equip-picker')).toBeNull();
    expect(document.body.classList.contains('has-equip-picker-open')).toBe(false);
  });
});
