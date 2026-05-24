import { describe, expect, it, vi } from 'vitest';

import { checkSaveEquipPlanLimit, validateSaveEquipPayload } from '../../crud/validate.js';

describe('crud/validate', () => {
  it('validateSaveEquipPayload retorna validacao quando payload e valido', () => {
    const validateEquipamentoPayload = vi.fn((payload, options) => ({
      valid: true,
      value: { ...payload, normalized: true },
      options,
    }));
    const Toast = { warning: vi.fn() };
    const getValue = vi.fn(
      (id) =>
        ({
          'eq-nome': 'Split Sala',
          'eq-local': 'Sala',
          'eq-tag': 'TAG-1',
          'eq-modelo': 'Modelo A',
        })[id],
    );
    const equipamentos = [{ id: 'eq-1' }];

    const result = validateSaveEquipPayload({
      equipamentos,
      editingId: 'eq-1',
      getValue,
      validateEquipamentoPayload,
      Toast,
    });

    expect(result).toEqual({
      valid: true,
      value: {
        nome: 'Split Sala',
        local: 'Sala',
        tag: 'TAG-1',
        modelo: 'Modelo A',
        normalized: true,
      },
      options: { existingEquipamentos: equipamentos, editingId: 'eq-1' },
    });
    expect(validateEquipamentoPayload).toHaveBeenCalledWith(
      {
        nome: 'Split Sala',
        local: 'Sala',
        tag: 'TAG-1',
        modelo: 'Modelo A',
      },
      { existingEquipamentos: equipamentos, editingId: 'eq-1' },
    );
    expect(Toast.warning).not.toHaveBeenCalled();
  });

  it('validateSaveEquipPayload mostra warning e bloqueia payload invalido', () => {
    const validateEquipamentoPayload = vi.fn(() => ({
      valid: false,
      errors: ['Nome e obrigatorio.'],
    }));
    const Toast = { warning: vi.fn() };

    const result = validateSaveEquipPayload({
      equipamentos: [],
      editingId: null,
      getValue: vi.fn(() => ''),
      validateEquipamentoPayload,
      Toast,
    });

    expect(result).toBeNull();
    expect(Toast.warning).toHaveBeenCalledWith('Nome e obrigatorio.');
  });

  it('checkSaveEquipPlanLimit permite edicao sem consultar limite', async () => {
    const checkPlanLimit = vi.fn();

    const result = await checkSaveEquipPlanLimit({
      equipamentos: [{ id: 'eq-1' }],
      editingId: 'eq-1',
      checkPlanLimit,
      trackEvent: vi.fn(),
      Toast: { warning: vi.fn() },
    });

    expect(result).toBe(true);
    expect(checkPlanLimit).not.toHaveBeenCalled();
  });

  it('checkSaveEquipPlanLimit mantem toast e telemetria quando Free bloqueia', async () => {
    const checkPlanLimit = vi.fn(() => ({
      blocked: true,
      current: 3,
      limit: 3,
      planCode: 'free',
    }));
    const trackEvent = vi.fn();
    const Toast = { warning: vi.fn() };

    const result = await checkSaveEquipPlanLimit({
      equipamentos: [{}, {}, {}],
      editingId: null,
      checkPlanLimit,
      trackEvent,
      Toast,
    });

    expect(result).toBe(false);
    expect(checkPlanLimit).toHaveBeenCalledWith('equipamentos', 3);
    expect(trackEvent).toHaveBeenCalledWith('limit_reached', {
      resource: 'equipamentos',
      current: 3,
      limit: 3,
      planCode: 'free',
    });
    expect(Toast.warning).toHaveBeenNthCalledWith(
      1,
      'Voce atingiu o limite do plano Free. Faca upgrade para continuar.',
    );
    expect(Toast.warning).toHaveBeenNthCalledWith(2, 'Planos pagos foram removidos desta versao.');
  });
});
