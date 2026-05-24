function asChecklistArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildRegistroChecklistSnapshotMap(checklist = null) {
  return new Map(asChecklistArray(checklist?.items).map((item) => [item.id, item]));
}

function buildRegistroChecklistGroups(template) {
  const groupsOrder = [];
  const groupBuckets = new Map();

  asChecklistArray(template?.items).forEach((item) => {
    const group = String(item?.group || '');
    if (!groupBuckets.has(group)) {
      groupsOrder.push(group);
      groupBuckets.set(group, []);
    }
    groupBuckets.get(group).push(item);
  });

  return { groupsOrder, groupBuckets };
}

function buildRegistroChecklistItemViewModel(item, snapshotMap) {
  const snap = snapshotMap.get(item.id) || { status: null, obs: '', measure: null };
  return {
    id: String(item?.id || ''),
    label: String(item?.label || ''),
    mandatory: Boolean(item?.mandatory),
    measurable: Boolean(item?.measurable),
    unit: String(item?.unit || ''),
    status: snap.status || null,
    obs: String(snap.obs || ''),
    measureValue: snap.measure && snap.measure.value != null ? String(snap.measure.value) : '',
  };
}

export function buildRegistroChecklistViewModel(template, checklist = null) {
  const snapshotMap = buildRegistroChecklistSnapshotMap(checklist);
  const { groupsOrder, groupBuckets } = buildRegistroChecklistGroups(template);

  return {
    label: String(template?.label || ''),
    groups: groupsOrder.map((group) => ({
      label: group,
      items: groupBuckets
        .get(group)
        .map((item) => buildRegistroChecklistItemViewModel(item, snapshotMap)),
    })),
  };
}

export function resolveRegistroChecklistTemplate(equip, { getChecklistTemplate }) {
  return getChecklistTemplate(equip.tipo);
}

function hasRegistroChecklistMarks(checklist) {
  return (checklist?.items || []).some((item) => item.status != null);
}

export function collectRegistroChecklistForSave(checklist) {
  if (!checklist) return null;
  return hasRegistroChecklistMarks(checklist) ? checklist : null;
}

export function buildRegistroChecklistSoftRequiredWarning(
  tipo,
  { checklist, isPreventivaTipo, validateChecklist },
) {
  if (!isPreventivaTipo(tipo)) return null;

  if (!checklist) {
    return 'Sem checklist NBR. Recomendado para preventiva; voce pode preencher antes de salvar.';
  }

  const validationCl = validateChecklist(checklist);
  if (!validationCl.complete && validationCl.missing?.length) {
    const first = validationCl.missing[0];
    const rest = validationCl.missing.length - 1;
    return rest > 0
      ? `${validationCl.missing.length} itens obrigatórios pendentes (ex: "${first}"). Salvando mesmo assim.`
      : `1 item obrigatório pendente: "${first}". Salvando mesmo assim.`;
  }

  return null;
}

export function cloneRegistroChecklistForEdit(checklist) {
  return JSON.parse(JSON.stringify(checklist));
}

export function parseRegistroChecklistMeasure(rawValue, unit) {
  const trimmed = String(rawValue ?? '').trim();
  if (trimmed === '') return null;

  const num = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(num)) return null;

  return { value: num, unit: String(unit || '') };
}
