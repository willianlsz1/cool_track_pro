import { describe, expect, it } from 'vitest';

import { getNextNavVisibility } from './useAutoHideNav';

describe('getNextNavVisibility', () => {
  it('mantem a bottom nav visivel no topo', () => {
    expect(
      getNextNavVisibility({
        currentScrollY: 0,
        previousScrollY: 120,
        visible: false,
      }),
    ).toEqual({ visible: true, scrollY: 0 });
  });

  it('esconde ao rolar para baixo e mostra ao rolar para cima', () => {
    const hidden = getNextNavVisibility({
      currentScrollY: 140,
      previousScrollY: 80,
      visible: true,
    });

    expect(hidden).toEqual({ visible: false, scrollY: 140 });

    expect(
      getNextNavVisibility({
        currentScrollY: 90,
        previousScrollY: hidden.scrollY,
        visible: hidden.visible,
      }),
    ).toEqual({ visible: true, scrollY: 90 });
  });

  it('ignora movimentos pequenos para evitar oscilação', () => {
    expect(
      getNextNavVisibility({
        currentScrollY: 108,
        previousScrollY: 100,
        visible: true,
      }),
    ).toEqual({ visible: true, scrollY: 108 });
  });
});
