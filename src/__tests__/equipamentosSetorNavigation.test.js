import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  configureSetorNavigation,
  setActiveSector,
} from '../ui/views/equipamentos/setor/setorNavigation.js';

describe('setActiveSector', () => {
  const navigateEquipCtx = vi.fn();

  beforeEach(() => {
    navigateEquipCtx.mockClear();
    configureSetorNavigation({
      getRouteEquipCtx: () => ({ clienteId: 'cliente-1', clienteNome: 'Cliente A' }),
      navigateEquipCtx,
    });
  });

  it('navega para setor preservando contexto de cliente e limpando quickFilter', () => {
    setActiveSector('setor-1');

    expect(navigateEquipCtx).toHaveBeenCalledWith({
      sectorId: 'setor-1',
      quickFilter: null,
      clienteId: 'cliente-1',
      clienteNome: 'Cliente A',
    });
  });

  it('volta ao grid preservando cliente quando id é null', () => {
    setActiveSector(null);

    expect(navigateEquipCtx).toHaveBeenCalledWith({
      sectorId: null,
      quickFilter: null,
      clienteId: 'cliente-1',
      clienteNome: 'Cliente A',
    });
  });
});
