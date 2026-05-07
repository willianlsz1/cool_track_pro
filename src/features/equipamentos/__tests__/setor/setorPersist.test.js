import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  assignEquipToSetor,
  configureSetorPersist,
  moveEquipsToSetor,
} from '../../setor/setorPersist.js';

describe('setorPersist', () => {
  let state;
  let callOrder;
  let deps;

  beforeEach(() => {
    state = {
      setores: [
        { id: 'setor-1', nome: 'Sala A', clienteId: null },
        { id: 'setor-2', nome: 'Sala B', clienteId: 'cliente-2' },
      ],
      equipamentos: [
        { id: 'eq-1', nome: 'Split <A>', setorId: null },
        { id: 'eq-2', nome: 'Cassete', setorId: 'setor-2' },
        { id: 'eq-3', nome: 'VRF', setorId: null },
      ],
    };
    callOrder = [];
    deps = {
      findEquip: vi.fn((id) => state.equipamentos.find((e) => e.id === id)),
      findSetor: vi.fn((id) => state.setores.find((s) => s.id === id)),
      setState: vi.fn((updater) => {
        callOrder.push('setState');
        state = updater(state);
      }),
      Toast: { success: vi.fn((message) => callOrder.push(`toast:${message}`)) },
      renderEquip: vi.fn(() => callOrder.push('renderEquip')),
      ensureProForSetores: vi.fn(async () => {
        callOrder.push('guard');
        return true;
      }),
      escapeHtml: vi.fn((value) => String(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;')),
    };
    configureSetorPersist(deps);
  });

  describe('moveEquipsToSetor', () => {
    it('move equipamentos selecionados para setor existente sem alterar os demais', () => {
      const result = moveEquipsToSetor(['eq-1', 'eq-3'], 'setor-2');

      expect(result).toEqual({ moved: 2, linkedSetor: false });
      expect(state.equipamentos).toEqual([
        { id: 'eq-1', nome: 'Split <A>', setorId: 'setor-2' },
        { id: 'eq-2', nome: 'Cassete', setorId: 'setor-2' },
        { id: 'eq-3', nome: 'VRF', setorId: 'setor-2' },
      ]);
    });

    it('retorna zero e não muta quando destino é vazio', () => {
      const before = structuredClone(state);

      const result = moveEquipsToSetor(['eq-1'], '');

      expect(result).toEqual({ moved: 0, linkedSetor: false });
      expect(deps.setState).not.toHaveBeenCalled();
      expect(state).toEqual(before);
    });

    it('vincula setor orphan ao cliente informado e preserva contadores', () => {
      const result = moveEquipsToSetor(['eq-1'], 'setor-1', 'cliente-1');

      expect(result).toEqual({ moved: 1, linkedSetor: true });
      expect(state.setores.find((s) => s.id === 'setor-1')).toMatchObject({
        clienteId: 'cliente-1',
      });
      expect(state.equipamentos.find((e) => e.id === 'eq-1')).toMatchObject({
        setorId: 'setor-1',
      });
    });

    it('não marca linkedSetor quando setor já tem cliente', () => {
      const result = moveEquipsToSetor(['eq-1'], 'setor-2', 'cliente-1');

      expect(result).toEqual({ moved: 1, linkedSetor: false });
      expect(state.setores.find((s) => s.id === 'setor-2')).toMatchObject({
        clienteId: 'cliente-2',
      });
    });
  });

  describe('assignEquipToSetor', () => {
    it('chama guard Pro antes de mutar equipamento', async () => {
      await assignEquipToSetor('eq-1', 'setor-1');

      expect(callOrder[0]).toBe('guard');
      expect(callOrder[1]).toBe('setState');
      expect(deps.ensureProForSetores).toHaveBeenCalledWith({ action: 'assign' });
      expect(state.equipamentos.find((e) => e.id === 'eq-1')).toMatchObject({
        setorId: 'setor-1',
      });
    });

    it('quando guard falha, não chama setState, Toast.success nem renderEquip', async () => {
      deps.ensureProForSetores.mockResolvedValueOnce(false);

      await assignEquipToSetor('eq-1', 'setor-1');

      expect(deps.setState).not.toHaveBeenCalled();
      expect(deps.Toast.success).not.toHaveBeenCalled();
      expect(deps.renderEquip).not.toHaveBeenCalled();
    });

    it('não chama guard nem muta quando equipamento não existe', async () => {
      await assignEquipToSetor('eq-missing', 'setor-1');

      expect(deps.ensureProForSetores).not.toHaveBeenCalled();
      expect(deps.setState).not.toHaveBeenCalled();
    });

    it('atribui setor, mostra toast com nome do equipamento escapado e chama renderEquip após sucesso', async () => {
      await assignEquipToSetor('eq-1', 'setor-1');

      expect(deps.Toast.success).toHaveBeenCalledWith('Split &lt;A&gt; movido para "Sala A".');
      expect(deps.renderEquip).toHaveBeenCalledTimes(1);
      expect(callOrder.at(-2)).toBe('toast:Split &lt;A&gt; movido para "Sala A".');
      expect(callOrder.at(-1)).toBe('renderEquip');
    });

    it('remove setor quando destino é vazio e usa label Sem setor', async () => {
      await assignEquipToSetor('eq-2', '');

      expect(state.equipamentos.find((e) => e.id === 'eq-2')).toMatchObject({
        setorId: null,
      });
      expect(deps.Toast.success).toHaveBeenCalledWith('Cassete movido para "Sem setor".');
      expect(deps.findSetor).not.toHaveBeenCalled();
    });
  });
});
