import { describe, expect, it } from 'vitest';

import {
  getClearRegistroFieldIds,
  resolveRegistroEditTarget,
  resolveRegistroInitEquipId,
} from '../ui/views/registro/lifecycle/helpers.js';

describe('registro lifecycle helpers', () => {
  it('getClearRegistroFieldIds preserva r-equip quando preserveEquip=true', () => {
    expect(getClearRegistroFieldIds()).toContain('r-equip');
    expect(getClearRegistroFieldIds(false)).toContain('r-equip');
    expect(getClearRegistroFieldIds(true)).not.toContain('r-equip');
  });

  it('getClearRegistroFieldIds preserva campos limpos pelo reset base', () => {
    expect(getClearRegistroFieldIds()).toEqual([
      'r-tipo',
      'r-tipo-custom',
      'r-pecas',
      'r-obs',
      'r-proxima',
      'r-tecnico',
      'r-custo-pecas',
      'r-custo-mao-obra',
      'r-prioridade',
      'r-cliente-nome',
      'r-cliente-documento',
      'r-local-atendimento',
      'r-cliente-contato',
      'r-equip',
    ]);
  });

  it('resolveRegistroEditTarget resolve registro existente e preserva fallback ausente', () => {
    const registros = [{ id: 'reg-1' }, { id: 'reg-2' }];

    expect(resolveRegistroEditTarget(registros, 'reg-2')).toBe(registros[1]);
    expect(resolveRegistroEditTarget(registros, 'missing')).toBeUndefined();
    expect(resolveRegistroEditTarget(undefined, 'reg-1')).toBeUndefined();
  });

  it('resolveRegistroInitEquipId preserva prioridade equipId sobre equipamentoId', () => {
    expect(resolveRegistroInitEquipId({ equipId: 'eq-1', equipamentoId: 'eq-2' })).toBe('eq-1');
    expect(resolveRegistroInitEquipId({ equipamentoId: 'eq-2' })).toBe('eq-2');
    expect(resolveRegistroInitEquipId({})).toBe('');
    expect(resolveRegistroInitEquipId()).toBe('');
  });

  it('mantem modulo de lifecycle sem import do adapter legado', async () => {
    const moduleText = await import('node:fs/promises').then((fs) =>
      fs.readFile('src/ui/views/registro/lifecycle/helpers.js', 'utf8'),
    );

    expect(moduleText).not.toMatch(/ui\/views\/registro|views\/registro|registro\.js/);
  });
});
