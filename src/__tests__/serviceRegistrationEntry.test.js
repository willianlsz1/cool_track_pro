import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
  goTo: vi.fn(),
}));

vi.mock('../core/state.js', () => ({
  getState: mocks.getState,
}));

vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
}));

describe('service registration entrypoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getState.mockReturnValue({ equipamentos: [] });
  });

  it('abre Registro diretamente quando recebe equipamento em contexto', async () => {
    const { startServiceRegistration } =
      await import('../ui/controller/serviceRegistrationEntry.js');

    const result = startServiceRegistration({ equipId: 'eq-1' });

    expect(result).toEqual({ mode: 'direct', equipId: 'eq-1' });
    expect(mocks.goTo).toHaveBeenCalledWith('registro', { equipId: 'eq-1' });
  });

  it('abre escolha rapida quando nao recebe equipamento e existem equipamentos', async () => {
    mocks.getState.mockReturnValue({ equipamentos: [{ id: 'eq-1' }] });
    const { startServiceRegistration } =
      await import('../ui/controller/serviceRegistrationEntry.js');

    const result = startServiceRegistration();

    expect(result).toEqual({ mode: 'pick-equipment' });
    expect(mocks.goTo).toHaveBeenCalledWith('registro', { openEquipPicker: true });
  });

  it('abre Registro com picker em modo cadastro quando nao ha equipamentos', async () => {
    const { startServiceRegistration } =
      await import('../ui/controller/serviceRegistrationEntry.js');

    const result = startServiceRegistration();

    expect(result).toEqual({ mode: 'create-equipment' });
    expect(mocks.goTo).toHaveBeenCalledWith('registro', { openEquipPicker: true });
  });
});
