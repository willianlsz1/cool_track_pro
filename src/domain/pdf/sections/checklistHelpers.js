export function getRegistrosWithChecklist(filtered) {
  return (filtered || []).filter(
    (r) => r.checklist && typeof r.checklist === 'object' && Array.isArray(r.checklist.items),
  );
}

export function createChecklistLayoutState(startY) {
  return { y: startY + 6 };
}

export function buildChecklistGroups(registro, tpl) {
  const groupsOrder = [];
  const groupBuckets = new Map();

  tpl.items.forEach((tplItem) => {
    const filled = (registro.checklist.items || []).find((i) => i.id === tplItem.id);
    if (!filled || filled.status == null) return;
    if (!groupBuckets.has(tplItem.group)) {
      groupsOrder.push(tplItem.group);
      groupBuckets.set(tplItem.group, []);
    }
    groupBuckets.get(tplItem.group).push({ ...filled, label: tplItem.label });
  });

  return { groupsOrder, groupBuckets };
}

export function summarizeChecklistItems(items) {
  return (items || []).reduce(
    (acc, i) => {
      if (i.status === 'ok') acc.ok += 1;
      else if (i.status === 'fail') acc.fail += 1;
      else if (i.status === 'na') acc.na += 1;
      return acc;
    },
    { ok: 0, fail: 0, na: 0 },
  );
}
