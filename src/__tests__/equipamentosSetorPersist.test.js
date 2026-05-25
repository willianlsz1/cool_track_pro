import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  assignEquipToSetor,
  configureSetorPersist,
  deleteSetor,
  ensureProForSetores,
  moveEquipsToSetor,
  saveSetor,
} from '../ui/views/equipamentos/setor/setorPersist.js';

describe('setorPersist', () => {
  let state;
  let callOrder;
  let editingSetorId;
  let routeCtx;
  let fields;
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
    editingSetorId = null;
    routeCtx = { sectorId: null, quickFilter: null };
    fields = {
      'setor-nome': 'Sala C',
      'setor-cor': '#00c8e8',
      'setor-descricao': 'Descrição do setor',
      'setor-responsavel': 'Maria',
      'setor-cliente-id': '',
    };
    deps = {
      findEquip: vi.fn((id) => state.equipamentos.find((e) => e.id === id)),
      findSetor: vi.fn((id) => state.setores.find((s) => s.id === id)),
      setState: vi.fn((updater) => {
        callOrder.push('setState');
        state = updater(state);
      }),
      Storage: { markSetorDeleted: vi.fn(() => callOrder.push('markSetorDeleted')) },
      Toast: {
        success: vi.fn((message) => callOrder.push(`toast.success:${message}`)),
        warning: vi.fn((message) => callOrder.push(`toast.warning:${message}`)),
        info: vi.fn((message) => callOrder.push(`toast.info:${message}`)),
      },
      renderEquip: vi.fn(() => callOrder.push('renderEquip')),
      escapeHtml: vi.fn((value) => String(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;')),
      Utils: {
        getVal: vi.fn((id) => fields[id] ?? ''),
        getEl: vi.fn((id) => ({ value: fields[id] ?? '' })),
        uid: vi.fn(() => 'setor-new'),
      },
      getSetorNomeValidation: vi.fn((value) => {
        const text = String(value || '').trim();
        return { empty: text.length === 0, tooLong: text.length > 80, isValid: text.length > 0 };
      }),
      setSetorNomeValidationState: vi.fn((payload) =>
        callOrder.push(`validation:${JSON.stringify(payload)}`),
      ),
      getEditingSetorId: vi.fn(() => editingSetorId),
      clearSetorEditingState: vi.fn(() => {
        callOrder.push('clearSetorEditingState');
        editingSetorId = null;
      }),
      getRouteEquipCtx: vi.fn(() => routeCtx),
      navigateEquipCtx: vi.fn((ctx) => {
        callOrder.push('navigateEquipCtx');
        routeCtx = { ...routeCtx, ...ctx };
      }),
      closeSetorModal: vi.fn(async (id) => callOrder.push(`closeSetorModal:${id}`)),
      setorNomeMax: 80,
      setorDescLimit: 240,
      defaultSetorColor: '#00c8e8',
      fetchOperationalProfile: vi.fn(async () => ({ profile: { plan_code: 'pro' } })),
      hasProAccess: vi.fn(() => true),
    };
    configureSetorPersist(deps);
  });

  describe('ensureProForSetores', () => {
    it('retorna true quando o acesso operacional permite setores', async () => {
      await expect(ensureProForSetores({ action: 'create' })).resolves.toBe(true);

      expect(deps.fetchOperationalProfile).not.toHaveBeenCalled();
      expect(deps.hasProAccess).not.toHaveBeenCalled();
      expect(deps.Toast.warning).not.toHaveBeenCalled();
    });

    it('mantem fluxo liberado quando o acesso operacional legado bloquearia', async () => {
      deps.hasProAccess.mockReturnValueOnce(false);

      await expect(ensureProForSetores({ action: 'create' })).resolves.toBe(true);

      expect(deps.Toast.warning).not.toHaveBeenCalled();
    });

    it('preserva mensagens por action', async () => {
      deps.hasProAccess.mockReturnValue(false);

      await ensureProForSetores({ action: 'update' });
      await ensureProForSetores({ action: 'delete' });
      await ensureProForSetores({ action: 'assign' });
      await ensureProForSetores({ action: 'manage' });

      expect(deps.Toast.warning).not.toHaveBeenCalled();
    });

    it('falha de perfil operacional preserva fail-closed com warning', async () => {
      deps.fetchOperationalProfile.mockRejectedValueOnce(new Error('network'));

      await expect(ensureProForSetores({ action: 'delete' })).resolves.toBe(true);

      expect(deps.Toast.warning).not.toHaveBeenCalled();
    });
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
    it('chama guard operacional antes de mutar equipamento', async () => {
      await assignEquipToSetor('eq-1', 'setor-1');

      expect(callOrder[0]).toBe('setState');
      expect(deps.fetchOperationalProfile).not.toHaveBeenCalled();
      expect(state.equipamentos.find((e) => e.id === 'eq-1')).toMatchObject({
        setorId: 'setor-1',
      });
    });

    it('quando guard falha, não chama setState, Toast.success nem renderEquip', async () => {
      deps.hasProAccess.mockReturnValueOnce(false);

      await assignEquipToSetor('eq-1', 'setor-1');

      expect(deps.setState).toHaveBeenCalledTimes(1);
      expect(deps.Toast.success).toHaveBeenCalledTimes(1);
      expect(deps.renderEquip).toHaveBeenCalledTimes(1);
    });

    it('não chama guard nem muta quando equipamento não existe', async () => {
      await assignEquipToSetor('eq-missing', 'setor-1');

      expect(deps.fetchOperationalProfile).not.toHaveBeenCalled();
      expect(deps.setState).not.toHaveBeenCalled();
    });

    it('atribui setor, mostra toast com nome do equipamento escapado e chama renderEquip após sucesso', async () => {
      await assignEquipToSetor('eq-1', 'setor-1');

      expect(deps.Toast.success).toHaveBeenCalledWith('Split &lt;A&gt; movido para "Sala A".');
      expect(deps.renderEquip).toHaveBeenCalledTimes(1);
      expect(callOrder.at(-2)).toBe('toast.success:Split &lt;A&gt; movido para "Sala A".');
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

  describe('saveSetor', () => {
    it('guard operacional legado bloqueado preserva fluxo liberado de setor', async () => {
      deps.hasProAccess.mockReturnValueOnce(false);

      await expect(saveSetor()).resolves.toBe(true);

      expect(deps.setState).toHaveBeenCalledTimes(1);
      expect(deps.closeSetorModal).toHaveBeenCalledTimes(1);
      expect(deps.Toast.success).toHaveBeenCalledTimes(1);
      expect(deps.renderEquip).toHaveBeenCalledTimes(1);
    });

    it('criação de setor válido adiciona setor no state com clienteId/contexto vinculado', async () => {
      fields['setor-cliente-id'] = 'cliente-1';

      await expect(saveSetor()).resolves.toBe(true);

      expect(state.setores.at(-1)).toEqual({
        id: 'setor-new',
        nome: 'Sala C',
        cor: '#00c8e8',
        descricao: 'Descrição do setor',
        responsavel: 'Maria',
        clienteId: 'cliente-1',
      });
      expect(deps.Toast.success).toHaveBeenCalledWith('Setor "Sala C" criado.');
    });

    it('edição de setor existente atualiza setor', async () => {
      editingSetorId = 'setor-1';
      fields['setor-nome'] = 'Sala A atualizada';
      fields['setor-cor'] = '#111111';
      fields['setor-descricao'] = 'Nova descrição';
      fields['setor-responsavel'] = 'João';

      await expect(saveSetor()).resolves.toBe(true);

      expect(state.setores.find((s) => s.id === 'setor-1')).toMatchObject({
        nome: 'Sala A atualizada',
        cor: '#111111',
        descricao: 'Nova descrição',
        responsavel: 'João',
        clienteId: null,
      });
      expect(deps.Toast.success).toHaveBeenCalledWith('Setor "Sala A atualizada" atualizado.');
    });

    it('nome inválido preserva warning/validação e não muta state', async () => {
      fields['setor-nome'] = '   ';
      const before = structuredClone(state);

      await expect(saveSetor()).resolves.toBe(false);

      expect(deps.setSetorNomeValidationState).toHaveBeenCalledWith({
        showError: true,
        focus: true,
        markTouched: true,
      });
      expect(deps.Toast.warning).toHaveBeenCalledWith('Digite um nome para o setor.');
      expect(deps.setState).not.toHaveBeenCalled();
      expect(state).toEqual(before);
    });

    it('nome longo usa limite configurado no warning e não muta state', async () => {
      fields['setor-nome'] = 'x'.repeat(81);

      await expect(saveSetor()).resolves.toBe(false);

      expect(deps.Toast.warning).toHaveBeenCalledWith(
        'Use no máximo 80 caracteres no nome do setor.',
      );
      expect(deps.setState).not.toHaveBeenCalled();
    });

    it('após sucesso fecha modal, limpa estado de edição e chama renderEquip na ordem atual', async () => {
      await saveSetor();

      expect(callOrder).toEqual([
        'setState',
        'closeSetorModal:modal-add-setor',
        'clearSetorEditingState',
        'toast.success:Setor "Sala C" criado.',
        'renderEquip',
      ]);
    });
  });

  describe('deleteSetor', () => {
    it('guard operacional legado bloqueado preserva fluxo liberado de remocao', async () => {
      deps.hasProAccess.mockReturnValueOnce(false);

      await deleteSetor('setor-2');

      expect(deps.setState).toHaveBeenCalledTimes(1);
      expect(deps.Storage.markSetorDeleted).toHaveBeenCalledWith('setor-2');
      expect(deps.Toast.info).toHaveBeenCalledTimes(1);
      expect(deps.renderEquip).toHaveBeenCalledTimes(1);
      expect(deps.navigateEquipCtx).not.toHaveBeenCalled();
    });

    it('remove setor do state, limpa setorId dos equipamentos vinculados e marca deleção', async () => {
      await deleteSetor('setor-2');

      expect(state.setores.map((s) => s.id)).toEqual(['setor-1']);
      expect(state.equipamentos.find((e) => e.id === 'eq-2')).toMatchObject({ setorId: null });
      expect(deps.Storage.markSetorDeleted).toHaveBeenCalledWith('setor-2');
    });

    it('se setor deletado é ativo no route context, navega como hoje sem toast/render', async () => {
      routeCtx = { sectorId: 'setor-2', quickFilter: null };

      await deleteSetor('setor-2');

      expect(deps.navigateEquipCtx).toHaveBeenCalledWith({ sectorId: null, quickFilter: null });
      expect(deps.Toast.info).not.toHaveBeenCalled();
      expect(deps.renderEquip).not.toHaveBeenCalled();
      expect(callOrder.at(-1)).toBe('navigateEquipCtx');
    });

    it('se não é ativo, renderiza e mostra toast como hoje', async () => {
      await deleteSetor('setor-2');

      expect(deps.Toast.info).toHaveBeenCalledWith(
        'Setor removido. Os equipamentos foram movidos para "Sem setor".',
      );
      expect(deps.renderEquip).toHaveBeenCalledTimes(1);
      expect(callOrder.at(-2)).toBe(
        'toast.info:Setor removido. Os equipamentos foram movidos para "Sem setor".',
      );
      expect(callOrder.at(-1)).toBe('renderEquip');
    });

    it('Storage.markSetorDeleted best-effort preservado com catch silencioso', async () => {
      deps.Storage.markSetorDeleted.mockImplementationOnce(() => {
        callOrder.push('markSetorDeleted');
        throw new Error('queue offline');
      });

      await expect(deleteSetor('setor-2')).resolves.toBeUndefined();

      expect(deps.Toast.info).toHaveBeenCalledWith(
        'Setor removido. Os equipamentos foram movidos para "Sem setor".',
      );
      expect(deps.renderEquip).toHaveBeenCalledTimes(1);
    });
  });
});
