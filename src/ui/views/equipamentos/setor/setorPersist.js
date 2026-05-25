const setorPersistDeps = {
  findEquip: null,
  findSetor: null,
  setState: null,
  Storage: null,
  Toast: null,
  renderEquip: null,
  escapeHtml: null,
  Utils: null,
  getSetorNomeValidation: null,
  setSetorNomeValidationState: null,
  getEditingSetorId: null,
  clearSetorEditingState: null,
  getRouteEquipCtx: null,
  navigateEquipCtx: null,
  closeSetorModal: null,
  setorNomeMax: null,
  setorDescLimit: null,
  defaultSetorColor: null,
  fetchOperationalProfile: null,
  hasProAccess: null,
};

export function configureSetorPersist(deps = {}) {
  Object.assign(setorPersistDeps, deps);
}

function requireSetorPersistDep(name) {
  const dep = setorPersistDeps[name];
  if (!dep) throw new Error(`configureSetorPersist missing dependency: ${name}`);
  return dep;
}

function getSetorPersistValue(name, fallback) {
  const value = setorPersistDeps[name];
  return value == null ? fallback : value;
}

// Setores ficam liberados no modo operacional. O guard permanece como contrato
// para chamadas antigas, mas nao aplica gate de cobranca.
// Setores ficam liberados no modo operacional. O guard permanece como contrato
// para chamadas antigas, mas nao aplica gate de cobranca.
/** @sliceTarget setor/guard */
export async function ensureProForSetores({ action = 'manage' } = {}) {
  void action;
  return true;
}

/**
 * Move um conjunto de equipamentos pra um setor especifico (batch).
 * Usado pelo banner quick-move no drill-down __sem_setor__ dentro do contexto
 * cliente. Atualiza state.equipamentos e re-renderiza.
 *
 * Se clienteIdToLink for passado e o setor de destino for orphan (sem cliente),
 * o setor TAMBEM é vinculado ao cliente — preenchendo o gap da hierarquia
 * Cliente -> Setor -> Equipamento (assume que o user quer organizar tudo sob
 * a mesma carteira).
 *
 * @param {string[]} equipIds
 * @param {string} setorId
 * @param {string} [clienteIdToLink] — se passado, vincula também o setor
 *   orphan ao cliente. No-op se setor já tiver clienteId.
 * @returns {{moved: number, linkedSetor: boolean}}
 */
/** @sliceTarget crud/move */
export function moveEquipsToSetor(equipIds, setorId, clienteIdToLink = null) {
  if (!Array.isArray(equipIds) || !equipIds.length || !setorId) {
    return { moved: 0, linkedSetor: false };
  }
  const setState = requireSetorPersistDep('setState');
  const idsSet = new Set(equipIds);
  let moved = 0;
  let linkedSetor = false;

  setState((prev) => {
    // Se for vincular o setor orphan ao cliente, atualiza setores também.
    let nextSetores = prev.setores;
    if (clienteIdToLink) {
      nextSetores = (prev.setores || []).map((s) => {
        if (s.id === setorId && !s.clienteId) {
          linkedSetor = true;
          return { ...s, clienteId: clienteIdToLink };
        }
        return s;
      });
    }
    const nextEquipamentos = (prev.equipamentos || []).map((e) => {
      if (idsSet.has(e.id)) {
        moved++;
        return { ...e, setorId };
      }
      return e;
    });
    return { ...prev, setores: nextSetores, equipamentos: nextEquipamentos };
  });

  return { moved, linkedSetor };
}

/**
 * Atribui (ou remove) um setor a um equipamento já cadastrado.
 * Chamado pelo select inline no modal de detalhes.
 */
/** @sliceTarget crud/setor */
export async function assignEquipToSetor(equipId, setorId) {
  const findEquip = requireSetorPersistDep('findEquip');
  const eq = findEquip(equipId);
  if (!eq) return;

  const allowed = await ensureProForSetores({ action: 'assign' });
  if (!allowed) return;

  const setState = requireSetorPersistDep('setState');
  setState((prev) => ({
    ...prev,
    equipamentos: prev.equipamentos.map((e) =>
      e.id === equipId ? { ...e, setorId: setorId || null } : e,
    ),
  }));
  const findSetor = requireSetorPersistDep('findSetor');
  const setor = setorId ? findSetor(setorId) : null;
  const label = setor ? `"${setor.nome}"` : '"Sem setor"';
  const Toast = requireSetorPersistDep('Toast');
  const escapeHtml = requireSetorPersistDep('escapeHtml');
  Toast.success(`${escapeHtml(eq.nome)} movido para ${label}.`);
  const renderEquip = requireSetorPersistDep('renderEquip');
  renderEquip(); // atualiza os cards de setor em background
}

/**
 * @sliceSplit
 *   crud/setor: validacao, persistencia (state + storage), assign equips
 *   ui/modal: closeModal + clearSetorEditingState + Toast pos-save
 */
export async function saveSetor() {
  const getEditingSetorId = requireSetorPersistDep('getEditingSetorId');
  const isEditing = Boolean(getEditingSetorId());
  const allowed = await ensureProForSetores({ action: isEditing ? 'update' : 'create' });
  if (!allowed) return false;

  const Utils = requireSetorPersistDep('Utils');
  const nomeRaw = Utils.getVal('setor-nome') || '';
  const getSetorNomeValidation = requireSetorPersistDep('getSetorNomeValidation');
  const { empty, tooLong } = getSetorNomeValidation(nomeRaw);
  if (empty || tooLong) {
    // Validação inline: mostra erro abaixo do input + foco + toast leve.
    // Marca o campo como "touched" pra que o erro passe a reaparecer
    // automaticamente se o usuário esvaziar o input depois de digitar.
    const setSetorNomeValidationState = requireSetorPersistDep('setSetorNomeValidationState');
    setSetorNomeValidationState({ showError: true, focus: true, markTouched: true });
    const Toast = requireSetorPersistDep('Toast');
    const setorNomeMax = requireSetorPersistDep('setorNomeMax');
    Toast.warning(
      tooLong
        ? `Use no máximo ${setorNomeMax} caracteres no nome do setor.`
        : 'Digite um nome para o setor.',
    );
    return false;
  }
  const nome = nomeRaw.trim();

  const cor = Utils.getEl('setor-cor')?.value || requireSetorPersistDep('defaultSetorColor');
  const setorDescLimit = requireSetorPersistDep('setorDescLimit');
  const descricao = (Utils.getVal('setor-descricao') || '').trim().slice(0, setorDescLimit);
  const responsavel = (Utils.getVal('setor-responsavel') || '').trim();
  // clienteId armazenado em hidden input (preenchido quando o modal abre via
  // contexto de cliente). Hierarquia Cliente -> Setor -> Equipamento: setores
  // novos sempre tem cliente, mas mantemos null como valid value pra compat
  // com setores ainda não vinculados.
  const clienteIdRaw = Utils.getEl('setor-cliente-id')?.value || '';
  const clienteId = clienteIdRaw ? String(clienteIdRaw) : null;

  const setState = requireSetorPersistDep('setState');
  if (isEditing) {
    const editingId = getEditingSetorId();
    setState((prev) => ({
      ...prev,
      setores: (prev.setores || []).map((s) =>
        s.id === editingId
          ? { ...s, nome, cor, descricao, responsavel, ...(clienteId ? { clienteId } : {}) }
          : s,
      ),
    }));
  } else {
    setState((prev) => ({
      ...prev,
      setores: [
        ...(prev.setores || []),
        { id: Utils.uid(), nome, cor, descricao, responsavel, clienteId },
      ],
    }));
  }

  try {
    const closeSetorModal = getSetorPersistValue('closeSetorModal', async () => {
      const { Modal: M } = await import('../../../../core/modal.js');
      M.close('modal-add-setor');
    });
    await closeSetorModal('modal-add-setor');
  } catch {
    /* ignora */
  }

  // Limpa form + reseta estado de edição
  const clearSetorEditingState = requireSetorPersistDep('clearSetorEditingState');
  clearSetorEditingState();

  const Toast = requireSetorPersistDep('Toast');
  Toast.success(isEditing ? `Setor "${nome}" atualizado.` : `Setor "${nome}" criado.`);
  const renderEquip = requireSetorPersistDep('renderEquip');
  renderEquip();
  return true;
}

/** @sliceTarget crud/setor */
export async function deleteSetor(id) {
  if (id === '__sem_setor__') return;

  const allowed = await ensureProForSetores({ action: 'delete' });
  if (!allowed) return;

  // Remove setorId dos equipamentos que pertencem ao setor
  const setState = requireSetorPersistDep('setState');
  setState((prev) => ({
    ...prev,
    setores: (prev.setores || []).filter((s) => s.id !== id),
    equipamentos: prev.equipamentos.map((e) => (e.setorId === id ? { ...e, setorId: null } : e)),
  }));

  // Enfileira deleção remota (Supabase). ON DELETE SET NULL no FK cuida dos equipamentos.
  try {
    const Storage = requireSetorPersistDep('Storage');
    Storage.markSetorDeleted(id);
  } catch {
    /* ignora — a queue é melhor esforço */
  }

  const getRouteEquipCtx = requireSetorPersistDep('getRouteEquipCtx');
  const activeSectorId = getRouteEquipCtx().sectorId;
  if (activeSectorId === id) {
    const navigateEquipCtx = requireSetorPersistDep('navigateEquipCtx');
    navigateEquipCtx({ sectorId: null, quickFilter: null });
    return;
  }
  const Toast = requireSetorPersistDep('Toast');
  Toast.info('Setor removido. Os equipamentos foram movidos para "Sem setor".');
  const renderEquip = requireSetorPersistDep('renderEquip');
  renderEquip();
}
