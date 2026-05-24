import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureViewEquip, viewEquip } from '../ui/views/equipamentos/ui/viewEquip.js';

function configureViewEquipTestDeps(overrides = {}) {
  const calls = [];
  const deps = {
    resolveViewEquipTarget: vi.fn(() => ({ id: 'eq-1', nome: 'Split' })),
    buildViewEquipDetailModel: vi.fn(() => ({ id: 'eq-1', eq: { nome: 'Split' } })),
    renderViewEquipDetailHtml: vi.fn(() => ({
      html: '<section>detail</section>',
      firstPhotoUrl: 'foto.jpg',
    })),
    mountViewEquipDetail: vi.fn(() => calls.push('mount')),
    bindViewEquipDetailCoverActions: vi.fn(() => calls.push('bind')),
    openViewEquipDetailModal: vi.fn(async () => calls.push('open')),
    regsForEquip: vi.fn(),
    evaluateEquipmentHealth: vi.fn(),
    evaluateEquipmentRisk: vi.fn(),
    getHealthClass: vi.fn(),
    Utils: { escapeAttr: vi.fn(), formatDate: vi.fn(), escapeHtml: vi.fn() },
    getSetores: vi.fn(() => []),
    ...overrides,
  };
  configureViewEquip(deps);
  return { calls, deps };
}

describe('viewEquip orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna sem side effects quando equipamento nao existe', async () => {
    const { deps } = configureViewEquipTestDeps({
      resolveViewEquipTarget: vi.fn(() => null),
    });

    await viewEquip('missing');

    expect(deps.resolveViewEquipTarget).toHaveBeenCalledWith('missing');
    expect(deps.buildViewEquipDetailModel).not.toHaveBeenCalled();
    expect(deps.renderViewEquipDetailHtml).not.toHaveBeenCalled();
    expect(deps.mountViewEquipDetail).not.toHaveBeenCalled();
    expect(deps.bindViewEquipDetailCoverActions).not.toHaveBeenCalled();
    expect(deps.openViewEquipDetailModal).not.toHaveBeenCalled();
  });

  it('monta o model com as dependencias preservadas', async () => {
    const equip = { id: 'eq-1', nome: 'Split' };
    const { deps } = configureViewEquipTestDeps({
      resolveViewEquipTarget: vi.fn(() => equip),
    });

    await viewEquip('eq-1');

    expect(deps.buildViewEquipDetailModel).toHaveBeenCalledWith({
      id: 'eq-1',
      equip,
      regsForEquip: deps.regsForEquip,
      evaluateEquipmentHealth: deps.evaluateEquipmentHealth,
      evaluateEquipmentRisk: deps.evaluateEquipmentRisk,
      getHealthClass: deps.getHealthClass,
      utils: deps.Utils,
    });
  });

  it('renderiza o HTML a partir do model', async () => {
    const model = { id: 'eq-1', eq: { nome: 'Split' } };
    const { deps } = configureViewEquipTestDeps({
      buildViewEquipDetailModel: vi.fn(() => model),
    });

    await viewEquip('eq-1');

    expect(deps.renderViewEquipDetailHtml).toHaveBeenCalledWith(model, {
      getSetores: deps.getSetores,
    });
  });

  it('preserva a ordem mount -> bind -> open modal', async () => {
    const { calls, deps } = configureViewEquipTestDeps();

    await viewEquip('eq-1');

    expect(deps.mountViewEquipDetail).toHaveBeenCalledWith('<section>detail</section>');
    expect(deps.bindViewEquipDetailCoverActions).toHaveBeenCalledWith('foto.jpg');
    expect(deps.openViewEquipDetailModal).toHaveBeenCalledWith('eq-1');
    expect(calls).toEqual(['mount', 'bind', 'open']);
  });

  it('aguarda a abertura async do modal', async () => {
    let opened = false;
    configureViewEquipTestDeps({
      openViewEquipDetailModal: vi.fn(async () => {
        await Promise.resolve();
        opened = true;
      }),
    });

    await viewEquip('eq-1');

    expect(opened).toBe(true);
  });
});
