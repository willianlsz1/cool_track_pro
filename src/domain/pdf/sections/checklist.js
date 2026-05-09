/**
 * CoolTrack Pro - PDF Checklist Section (PMOC Fase 3, abr/2026)
 *
 * Renderiza o checklist NBR 13971 dos registros filtrados no PDF.
 * Aparece quando ao menos UM registro do filtro tem `checklist`
 * preenchido. Cada checklist vira um bloco identificado por
 * "{equipamento} — {data do registro}" com tabela de itens.
 *
 * Layout:
 *   CHECKLIST NBR 13971
 *   ─────────────────────────
 *   {Equip A} · 25/04/2026
 *     Mecânico
 *       Limpeza dos filtros        ✓ Conforme         (obs)
 *       Bandeja de condensado      ✗ Não conforme     bandeja com sujidade
 *     Elétrico
 *       ...
 *   {Equip B} · 25/04/2026
 *     ...
 */

import autoTable from 'jspdf-autotable';
import { Utils } from '../../../core/utils.js';
import { PDF_COLORS as C, PDF_TYPO as T } from '../constants.js';
import { accentLine, txt } from '../primitives.js';
import { getTemplateByKey, formatMeasure } from '../../pmoc/checklistTemplates.js';

const STATUS_LABEL = {
  ok: 'Conforme',
  fail: 'Não conforme',
  na: 'N/A',
};

const STATUS_COLOR = (status) => {
  if (status === 'ok') return [34, 167, 100];
  if (status === 'fail') return [215, 43, 63];
  if (status === 'na') return [120, 130, 145];
  return C.text3;
};

function formatRegistroDate(data) {
  if (!data) return '';
  try {
    return Utils.formatDate(data);
  } catch {
    return String(data);
  }
}

function findEquipName(equipId, equipamentos) {
  const eq = (equipamentos || []).find((e) => e.id === equipId);
  return eq?.nome || eq?.tag || '—';
}

function getRegistrosWithChecklist(filtered) {
  return (filtered || []).filter(
    (r) => r.checklist && typeof r.checklist === 'object' && Array.isArray(r.checklist.items),
  );
}

function createChecklistLayoutState(startY) {
  return { y: startY + 6 };
}

function ensureChecklistPageSpace(doc, pageHeight, margin, layout, needed) {
  if (layout.y + needed > pageHeight - margin) {
    doc.addPage();
    layout.y = margin;
  }
}

function renderChecklistSectionHeader(doc, pageWidth, pageHeight, margin, layout) {
  ensureChecklistPageSpace(doc, pageHeight, margin, layout, 20);
  txt(doc, 'CHECKLIST NBR 13971', margin, layout.y, {
    size: T.h2.size,
    style: T.h2.style,
    color: C.text3,
  });
  layout.y += 2;
  accentLine(doc, margin, layout.y + 1, pageWidth - margin, C.border);
  layout.y += 5;
}

function renderChecklistRecordHeader(doc, margin, layout, registro, equipamentos) {
  const equipName = findEquipName(registro.equipId, equipamentos);
  const dateStr = formatRegistroDate(registro.data);

  txt(doc, `${equipName} · ${dateStr}`, margin, layout.y, {
    size: T.h3?.size ?? 9,
    style: T.h3?.style ?? 'bold',
    color: C.text2,
  });
  layout.y += 4;
}

function buildChecklistGroups(registro, tpl) {
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

function renderChecklistEmptyItems(doc, margin, layout) {
  txt(doc, '(nenhum item marcado)', margin + 4, layout.y, {
    size: 8,
    style: 'italic',
    color: C.text3,
  });
  layout.y += 5;
}

function summarizeChecklistItems(items) {
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

function renderChecklistSummary(doc, margin, layout, checklistItems) {
  const summary = summarizeChecklistItems(checklistItems);
  txt(
    doc,
    `${summary.ok} conforme · ${summary.fail} não conforme · ${summary.na} N/A`,
    margin + 4,
    layout.y,
    { size: 8, style: 'italic', color: C.text3 },
  );
  layout.y += 4;
}

function renderChecklistGroupTable(doc, margin, layout, groupName, items) {
  txt(doc, groupName, margin + 2, layout.y, {
    size: 8,
    style: 'bold',
    color: C.text3,
  });
  layout.y += 3;

  autoTable(doc, {
    startY: layout.y,
    body: items.map((it) => [
      it.label,
      STATUS_LABEL[it.status] || '—',
      formatMeasure(it.measure),
      it.obs || '',
    ]),
    theme: 'plain',
    margin: { left: margin + 2, right: margin },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.2, valign: 'top' },
    columnStyles: {
      0: { cellWidth: 70, textColor: C.text1 },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 22, textColor: C.text1, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 'auto', textColor: C.text2 },
    },
    didParseCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 1) return;
      const itemRow = items[data.row.index];
      if (itemRow) {
        data.cell.styles.textColor = STATUS_COLOR(itemRow.status);
      }
    },
  });
  layout.y = (doc.lastAutoTable?.finalY ?? layout.y) + 2;
}

function renderChecklistRecord(doc, pageHeight, margin, layout, registro, equipamentos) {
  const tpl = getTemplateByKey(registro.checklist.tipo_template);

  ensureChecklistPageSpace(doc, pageHeight, margin, layout, 12);
  renderChecklistRecordHeader(doc, margin, layout, registro, equipamentos);

  const { groupsOrder, groupBuckets } = buildChecklistGroups(registro, tpl);

  if (!groupsOrder.length) {
    renderChecklistEmptyItems(doc, margin, layout);
    return;
  }

  renderChecklistSummary(doc, margin, layout, registro.checklist.items || []);

  for (const groupName of groupsOrder) {
    const items = groupBuckets.get(groupName);
    ensureChecklistPageSpace(doc, pageHeight, margin, layout, 8 + items.length * 5);
    renderChecklistGroupTable(doc, margin, layout, groupName, items);
  }

  layout.y += 3;
}

/**
 * Desenha a seção de checklist no PDF. Pula silenciosamente quando
 * nenhum registro tem checklist (PDFs de FREE / serviços não-PMOC).
 *
 * @returns {number} novo Y após a seção
 */
export function drawChecklist(doc, pageWidth, pageHeight, margin, startY, filtered, equipamentos) {
  const registrosWithChecklist = getRegistrosWithChecklist(filtered);
  if (!registrosWithChecklist.length) return startY;

  const layout = createChecklistLayoutState(startY);
  renderChecklistSectionHeader(doc, pageWidth, pageHeight, margin, layout);

  for (const registro of registrosWithChecklist) {
    renderChecklistRecord(doc, pageHeight, margin, layout, registro, equipamentos);
  }

  return layout.y;
}
