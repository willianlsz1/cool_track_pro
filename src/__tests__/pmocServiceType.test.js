import { describe, expect, it } from 'vitest';

import {
  isPmocLikeServiceType,
  isPreventivaLikeServiceType,
  isPreventivaOrPmocServiceType,
} from '../domain/pmoc/serviceType.js';

describe('PMOC service type detection', () => {
  it('identifica tipos preventivos usados no fluxo contextual', () => {
    expect(isPreventivaLikeServiceType('Preventiva')).toBe(true);
    expect(isPreventivaLikeServiceType('Manutenção preventiva')).toBe(true);
    expect(isPreventivaLikeServiceType('preventivo mensal')).toBe(true);
    expect(isPreventivaLikeServiceType('Limpeza preventiva')).toBe(true);
    expect(isPreventivaLikeServiceType('Higienização')).toBe(true);
  });

  it('identifica PMOC como tipo contextual proprio', () => {
    expect(isPmocLikeServiceType('PMOC')).toBe(true);
    expect(isPmocLikeServiceType('Checklist PMOC')).toBe(true);
    expect(isPreventivaOrPmocServiceType('Preventiva PMOC')).toBe(true);
  });

  it('nao classifica corretiva como preventiva ou PMOC por texto incidental', () => {
    expect(isPreventivaLikeServiceType('Corretiva com revisão preventiva')).toBe(false);
    expect(isPmocLikeServiceType('Corretiva com checklist PMOC')).toBe(false);
    expect(isPreventivaOrPmocServiceType('Troca de capacitor')).toBe(false);
  });
});
