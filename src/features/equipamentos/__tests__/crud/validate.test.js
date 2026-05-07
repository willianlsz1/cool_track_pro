import { describe, expect, it, vi } from 'vitest';

import { checkSaveEquipPlanLimit, validateSaveEquipPayload } from '../../crud/validate.js';

describe('crud/validate', () => {
  it('validateSaveEquipPayload retorna validação quando payload é válido', () => {
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

  it('validateSaveEquipPayload mostra warning e bloqueia payload inválido', () => {
    const validateEquipamentoPayload = vi.fn(() => ({
      valid: false,
      errors: ['Nome é obrigatório.'],
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
    expect(Toast.warning).toHaveBeenCalledWith('Nome é obrigatório.');
  });

  it('checkSaveEquipPlanLimit permite edição sem consultar limite', async () => {
    const checkPlanLimit = vi.fn();

    const result = await checkSaveEquipPlanLimit({
      equipamentos: [{ id: 'eq-1' }],
      editingId: 'eq-1',
      checkPlanLimit,
      trackEvent: vi.fn(),
      Toast: { warning: vi.fn() },
      goTo: vi.fn(),
    });

    expect(result).toBe(true);
    expect(checkPlanLimit).not.toHaveBeenCalled();
  });

  it('checkSaveEquipPlanLimit mantém toast, telemetria e navegação quando Free bloqueia', async () => {
    const checkPlanLimit = vi.fn(() => ({
      blocked: true,
      current: 3,
      limit: 3,
      planCode: 'free',
    }));
    const trackEvent = vi.fn();
    const Toast = { warning: vi.fn() };
    const goTo = vi.fn();

    const result = await checkSaveEquipPlanLimit({
      equipamentos: [{}, {}, {}],
      editingId: null,
      checkPlanLimit,
      trackEvent,
      Toast,
      goTo,
    });

    expect(result).toBe(false);
    expect(checkPlanLimit).toHaveBeenCalledWith('equipamentos', 3);
    expect(trackEvent).toHaveBeenCalledWith('limit_reached', {
      resource: 'equipamentos',
      current: 3,
      limit: 3,
      planCode: 'free',
    });
    expect(Toast.warning).toHaveBeenCalledWith(
      'Você atingiu o limite do plano Free. Faça upgrade para continuar.',
    );
    expect(goTo).toHaveBeenCalledWith('pricing');
  });
});
