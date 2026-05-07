const setorPersistDeps = {
  findEquip: null,
  findSetor: null,
  setState: null,
  Toast: null,
  renderEquip: null,
  ensureProForSetores: null,
  escapeHtml: null,
};

export function configureSetorPersist(deps = {}) {
  Object.assign(setorPersistDeps, deps);
}

function requireSetorPersistDep(name) {
  const dep = setorPersistDeps[name];
  if (!dep) throw new Error(`configureSetorPersist missing dependency: ${name}`);
  return dep;
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

  const ensureProForSetores = requireSetorPersistDep('ensureProForSetores');
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
