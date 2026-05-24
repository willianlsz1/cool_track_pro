import { describe, expect, it, vi } from 'vitest';

import { collectSaveEquipDadosPlaca } from '../../ui/views/equipamentos/nameplate/dadosPlaca.js';

class DadosPlacaValidationError extends Error {
  constructor({ label, unit, value, inputId }) {
    super('invalid decimal');
    this.label = label;
    this.unit = unit;
    this.value = value;
    this.inputId = inputId;
  }
}

describe('nameplate/dadosPlaca', () => {
  it('retorna dados válidos coletados', () => {
    const result = collectSaveEquipDadosPlaca({
      collectDadosPlaca: vi.fn(() => ({ tensao: '220' })),
      DadosPlacaValidationError,
      formatDecimalHint: vi.fn(),
      Toast: { warning: vi.fn() },
      documentRef: { getElementById: vi.fn() },
    });

    expect(result).toEqual({ ok: true, dadosPlaca: { tensao: '220' } });
  });

  it('DadosPlacaValidationError mostra warning e foca/select no input', () => {
    const focus = vi.fn();
    const select = vi.fn();
    const Toast = { warning: vi.fn() };
    const documentRef = { getElementById: vi.fn(() => ({ focus, select })) };

    const result = collectSaveEquipDadosPlaca({
      collectDadosPlaca: vi.fn(() => {
        throw new DadosPlacaValidationError({
          label: 'Corrente',
          unit: 'A',
          value: '999',
          inputId: 'dp-corrente',
        });
      }),
      DadosPlacaValidationError,
      formatDecimalHint: vi.fn(() => '9,99'),
      Toast,
      documentRef,
    });

    expect(result).toEqual({ ok: false });
    expect(Toast.warning).toHaveBeenCalledWith(
      'Corrente (A): 999 parece alto demais. Use vírgula como separador decimal — ex: 9,99 em vez de 999.',
    );
    expect(documentRef.getElementById).toHaveBeenCalledWith('dp-corrente');
    expect(focus).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
  });

  it('erro inesperado é relançado', () => {
    const unexpected = new Error('boom');

    expect(() =>
      collectSaveEquipDadosPlaca({
        collectDadosPlaca: vi.fn(() => {
          throw unexpected;
        }),
        DadosPlacaValidationError,
        formatDecimalHint: vi.fn(),
        Toast: { warning: vi.fn() },
        documentRef: { getElementById: vi.fn() },
      }),
    ).toThrow(unexpected);
  });
});
