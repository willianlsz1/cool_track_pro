import autoTable from 'jspdf-autotable';
import { PDF_COLORS as C, PDF_TYPO as T } from '../constants.js';
import { accentLine, fillPage, fillRect, roundRect, txt } from '../primitives.js';
import { drawChecklist } from './checklist.js';
import {
  buildCoverContext,
  buildCoverConclusaoModel,
  buildCoverEquipamentosRows,
  buildCoverFichaTecnicaBlocks,
  buildCoverInfoBlocksModel,
  buildCoverPendenciasModel,
  buildCoverResumoModel,
  buildCoverTitleModel,
} from './coverHelpers.js';

// ------------------------------- masthead -------------------------------

function drawMasthead(doc, pageWidth, margin, profile) {
  const mastheadH = 20;
  // Faixa sutil bg2 dá identidade sem "cartão dashboard". Linha fina inferior
  // separa do conteúdo como masthead de invoice formal.
  fillRect(doc, 0, 0, pageWidth, mastheadH, C.bg2);
  fillRect(doc, 0, mastheadH, pageWidth, 0.4, C.borderStrong);
  fillRect(doc, 0, 0, pageWidth, 2.5, C.primary);

  // Lado esquerdo: produto que gerou o PDF (pequeno, discreto — não rouba cena)
  txt(doc, 'COOLTRACK', margin, 10, {
    size: 8,
    style: 'bold',
    color: C.primary,
  });
  txt(doc, 'Gestão de Manutenção', margin, 15, {
    size: 7,
    color: C.text3,
  });

  // Lado direito: IDENTIDADE DO PRESTADOR — quem assina o serviço.
  // Esse é o bloco que legitima o documento pro cliente do Willian.
  const empresa = profile?.empresa?.trim() || profile?.nome?.trim() || 'Prestador de Serviço';
  const contatoParts = [profile?.telefone?.trim(), profile?.email?.trim()].filter(Boolean);

  txt(doc, empresa, pageWidth - margin, 10, {
    size: 10,
    style: 'bold',
    color: C.text,
    align: 'right',
  });
  if (contatoParts.length) {
    txt(doc, contatoParts.join('  ·  '), pageWidth - margin, 15, {
      size: 7.5,
      color: C.text3,
      align: 'right',
    });
  }
}

// -------------------------- title & meta line --------------------------

function drawTitleBlock(doc, pageWidth, margin, startY, model) {
  let y = startY;

  // V3 refator: titulo grande + faixa de identificadores
  // (OS · Data · Cliente · Técnico) consolidada num strip único.
  // Cliente fica em destaque (bold + cor text) porque eh quem
  // recebe o documento — segue convenção de invoice/recibo formal.

  txt(doc, 'RELATÓRIO DE MANUTENÇÃO', margin, y, {
    size: T.title.size,
    style: T.title.style,
    color: C.text,
  });

  if (model.osNumber) {
    // OS em badge destacado no canto direito
    const osLabel = `OS ${model.osNumber}`;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const osWidth = doc.getTextWidth(osLabel) + 6;
    doc.setFillColor(...C.primary);
    doc.roundedRect(pageWidth - margin - osWidth, y - 4.5, osWidth, 6.5, 1, 1, 'F');
    txt(doc, osLabel, pageWidth - margin - 3, y, {
      size: 9,
      style: 'bold',
      color: C.white,
      align: 'right',
    });
  }
  y += 8;

  // V3: Strip horizontal "DATA · CLIENTE · TÉCNICO" — tudo numa linha so,
  // pra cliente ler o quem-pra-quem-quando em um vistazo.
  // Constroi label inline tipo "Emitido 26/04/2026  |  Cliente: Empresa X  |  Técnico: Fulano"
  // Usa cores diferentes pra label (cinza) e value (escuro) — implementado
  // segmento por segmento pra ter controle de cor.
  let cursorX = margin;
  const drawSegment = (label, value, valueBold = false) => {
    txt(doc, label, cursorX, y, { size: 7.5, color: C.text3 });
    doc.setFontSize(7.5);
    const labelW = doc.getTextWidth(label) + 1;
    txt(doc, value, cursorX + labelW, y, {
      size: 8.5,
      color: C.text,
      style: valueBold ? 'bold' : 'normal',
    });
    doc.setFontSize(8.5);
    if (valueBold) doc.setFont('helvetica', 'bold');
    const valueW = doc.getTextWidth(value);
    doc.setFont('helvetica', 'normal');
    cursorX += labelW + valueW + 6;

    // Separador "·"
    txt(doc, '·', cursorX - 3, y, { size: 8, color: C.text3 });
  };

  drawSegment('Emitido em ', model.emitido);
  if (model.clienteNome) drawSegment('Cliente ', model.clienteNome, true);
  drawSegment('Técnico ', model.tecnicoNome);

  // Periodo se tiver — segunda linha discreta
  if (model.periodoTexto) {
    y += 5;
    txt(doc, model.periodoTexto, margin, y, { size: 7, color: C.text3, style: 'italic' });
  }

  y += 5;
  accentLine(doc, margin, y, pageWidth - margin, C.borderStrong);
  return y + 6;
}

// --------------------------- técnico + cliente ---------------------------

function drawInfoBlocks(doc, pageWidth, margin, startY, profile, cliente) {
  const colGap = 6;
  const blockW = (pageWidth - margin * 2 - colGap) / 2;
  const model = buildCoverInfoBlocksModel(profile, cliente);
  const { blockH } = model;
  const leftX = margin;
  const rightX = margin + blockW + colGap;

  // Caixa técnico (esquerda) — expandida com dados legais PMOC quando
  // preenchidos. Linha vazia é filtrada em drawLabeledBlock.
  drawLabeledBlock(doc, leftX, startY, blockW, blockH, 'TÉCNICO RESPONSÁVEL', model.tecnicoLines);

  // Caixa cliente (direita) — só aparece quando extractClientBlock retorna algo
  drawLabeledBlock(doc, rightX, startY, blockW, blockH, 'CLIENTE / LOCAL', model.clienteLines);

  return startY + blockH + 8;
}

function drawLabeledBlock(doc, x, y, w, h, label, lines) {
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, h, 'S');
  fillRect(doc, x, y, 2.5, h, C.primary);

  txt(doc, label, x + 6, y + 5.5, {
    size: 6.5,
    style: 'bold',
    color: C.text3,
  });

  let cursorY = y + 12;
  lines.forEach((line) => {
    if (!line?.value) return;
    txt(doc, line.value, x + 6, cursorY, {
      size: line.size || 9,
      style: line.bold ? 'bold' : 'normal',
      color: line.color || C.text,
    });
    cursorY += (line.size || 9) * 0.5 + 2;
  });
}

// ------------------------- resumo executivo -------------------------

function drawResumoExecutivo(doc, pageWidth, margin, startY, filtered, equipamentos) {
  // Refator V3: 3 cards visuais (Servicos / Equipamentos / Status geral)
  // em vez de bullets de prosa. Numero grande no topo, label embaixo,
  // barra colorida lateral pra identidade. Compacto, lido em 1 segundo.
  const model = buildCoverResumoModel(filtered, equipamentos);

  let y = startY;
  txt(doc, 'RESUMO EXECUTIVO', margin, y, {
    size: T.h2.size,
    style: T.h2.style,
    color: C.text3,
  });
  y += 2;
  accentLine(doc, margin, y + 1, pageWidth - margin, C.border);
  y += 6;

  // Layout: 3 cards lado a lado, gap 4mm
  const gap = 4;
  const cardW = (pageWidth - margin * 2 - gap * 2) / 3;
  const cardH = 22;

  const cards = [
    {
      x: margin,
      value: String(model.totalServicos),
      label: model.totalServicos === 1 ? 'Serviço realizado' : 'Serviços realizados',
      barColor: C.primary,
      valueColor: C.text,
    },
    {
      x: margin + cardW + gap,
      value: String(model.equipCount),
      label: model.equipCount === 1 ? 'Equipamento atendido' : 'Equipamentos atendidos',
      barColor: C.accent,
      valueColor: C.text,
    },
    {
      x: margin + cardW * 2 + gap * 2,
      value: model.statusLabel,
      label: 'Status geral',
      barColor: model.statusColor,
      valueColor: model.statusColor,
      smallValue: model.statusLabel.length > 4, // "Fora de operação" / "Requer atenção" precisam fonte menor
    },
  ];

  cards.forEach((card) => {
    // Box com borda fina + barra lateral colorida
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.setFillColor(...C.surface);
    doc.rect(card.x, y, cardW, cardH, 'FD');
    fillRect(doc, card.x, y, 2.5, cardH, card.barColor);

    // Valor grande
    txt(doc, card.value, card.x + 6, y + 11, {
      size: card.smallValue ? 12 : 18,
      style: 'bold',
      color: card.valueColor,
    });

    // Label embaixo
    txt(doc, card.label, card.x + 6, y + 18, {
      size: 7.5,
      color: C.text3,
    });
  });

  return y + cardH + 6;
}

function drawConclusao(doc, pageWidth, margin, startY, filtered) {
  const { conclusion } = buildCoverConclusaoModel(filtered);

  let y = startY;
  txt(doc, 'CONCLUSÃO', margin, y, {
    size: T.h2.size,
    style: T.h2.style,
    color: C.text3,
  });
  y += 2;
  accentLine(doc, margin, y + 1, pageWidth - margin, C.border);
  y += 6;

  roundRect(doc, margin, y - 2, pageWidth - margin * 2, 14, 1.2, C.surface);
  fillRect(doc, margin, y - 2, 2.5, 14, C.primary);
  txt(doc, 'Situação final do equipamento', margin + 6, y + 3.5, {
    size: 8,
    style: 'bold',
    color: C.text3,
  });
  txt(doc, conclusion, margin + 6, y + 9, {
    size: 9,
    color: C.text,
  });

  return y + 16;
}

// ---------------------- tabela de equipamentos ----------------------

function drawEquipamentosTable(doc, pageWidth, margin, startY, filtered, equipamentos) {
  const rows = buildCoverEquipamentosRows(filtered, equipamentos);
  if (!rows.length) return startY;

  let y = startY;
  txt(doc, 'EQUIPAMENTOS ATENDIDOS', margin, y, {
    size: T.h2.size,
    style: T.h2.style,
    color: C.text3,
  });
  y += 2;
  accentLine(doc, margin, y + 1, pageWidth - margin, C.border);
  y += 3;

  autoTable(doc, {
    startY: y + 2,
    // V3 refator: coluna nova "•" pra bullet colorido de status (canto esquerdo).
    // Mantive a coluna texto "Status" no fim porque cliente formal precisa do
    // label escrito ("Funcionando normalmente"), nao so cor.
    head: [['', 'Tag', 'Equipamento', 'Localização', 'Último', 'Próximo', 'Status']],
    body: rows.map((r) => ['', r.tag, r.nome, r.local, r.ultimo, r.proxima, r.statusLabel]),
    theme: 'plain',
    margin: { left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: C.text2,
      lineColor: C.border,
      lineWidth: 0.15,
      overflow: 'ellipsize', // V3: previne wrap feio — corta com elipse
      valign: 'middle',
    },
    headStyles: {
      fillColor: C.bg2,
      textColor: C.text3,
      fontStyle: 'bold',
      fontSize: 7,
      lineColor: C.borderStrong,
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [252, 252, 253] },
    columnStyles: {
      0: { cellWidth: 6, halign: 'center', fontSize: 11 }, // bullet status
      1: { cellWidth: 18, fontStyle: 'bold', textColor: C.text },
      2: { cellWidth: 42 },
      3: { cellWidth: 36, textColor: C.text3 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell(data) {
      if (data.section !== 'body') return;
      const row = rows[data.row.index];
      if (!row) return;
      // Label de status (ultima coluna) recebe a cor
      if (data.column.index === 6) {
        data.cell.styles.textColor = row.statusColor;
      }
    },
    // V4: desenha círculo de status nativamente em vez de char '●'.
    // A fonte helvetica padrão do jsPDF não tem o glyph U+25CF e renderiza
    // como '%lt' (artefato visual). doc.circle() é portátil pra qualquer fonte.
    didDrawCell(data) {
      if (data.section !== 'body' || data.column.index !== 0) return;
      const row = rows[data.row.index];
      if (!row) return;
      const { x, y, width, height } = data.cell;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const [r, g, b] = row.statusColor;
      data.doc.setFillColor(r, g, b);
      data.doc.circle(cx, cy, 1.3, 'F');
    },
  });

  return doc.lastAutoTable.finalY + 6;
}

// --------------------------- pendências ---------------------------

function drawFichaTecnica(doc, pageWidth, pageHeight, margin, startY, filtered, equipamentos) {
  // Reúne equipamentos distintos do filtro que tenham ao menos uma linha de
  // ficha técnica. Sem categorização/insights — só:
  //   "Dados da etiqueta"         (campos fixos de FIELD_ORDER)
  //   "Outras informações da etiqueta" (camposExtras flat, com cap)
  const PDF_EXTRAS_CAP = 10; // cap global de extras por equipamento no PDF
  const blocks = buildCoverFichaTecnicaBlocks(filtered, equipamentos);

  if (!blocks.length) return startY;

  // Cabeçalho da seção
  let y = startY + 6;
  if (y + 20 > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }
  txt(doc, 'FICHA TÉCNICA DO EQUIPAMENTO', margin, y, {
    size: T.h2.size,
    style: T.h2.style,
    color: C.text3,
  });
  y += 2;
  accentLine(doc, margin, y + 1, pageWidth - margin, C.border);
  y += 5;

  const renderTable = (rows) => {
    autoTable(doc, {
      startY: y,
      body: rows.map((r) => [r.label, r.value]),
      theme: 'plain',
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.2 },
      columnStyles: {
        0: { cellWidth: 55, textColor: C.text3 },
        1: { cellWidth: 'auto', textColor: C.text1 },
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 2;
  };

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  for (const { eq, fixedRows, extraRows } of blocks) {
    ensureSpace(14);

    txt(doc, String(eq.nome || eq.tag || '—'), margin, y, {
      size: T.h3?.size ?? 9,
      style: T.h3?.style ?? 'bold',
      color: C.text2,
    });
    y += 4;

    if (fixedRows.length) {
      txt(doc, 'Dados da etiqueta', margin, y, {
        size: 8,
        style: 'bold',
        color: C.text3,
      });
      y += 3;
      ensureSpace(fixedRows.length * 5);
      renderTable(fixedRows);
    }

    if (extraRows.length) {
      const display = extraRows.slice(0, PDF_EXTRAS_CAP);
      const truncated = extraRows.length - display.length;

      ensureSpace(8 + display.length * 5 + (truncated ? 4 : 0));

      txt(doc, 'Outras informações da etiqueta', margin, y, {
        size: 8,
        style: 'bold',
        color: C.text3,
      });
      y += 3;

      renderTable(display);

      if (truncated > 0) {
        txt(doc, `(+${truncated} campos omitidos)`, margin, y, {
          size: 7,
          style: 'italic',
          color: C.text3,
        });
        y += 4;
      }
    }

    y += 3; // respiro entre blocos de equipamentos
  }

  return y;
}

function drawPendencias(doc, pageWidth, pageHeight, margin, startY, filtered, equipamentos) {
  const pendentes = buildCoverPendenciasModel(filtered, equipamentos);
  if (!pendentes.length) return; // Sem fallback "nada pendente" — redundante com o resumo

  let y = startY;
  if (y > pageHeight - 50) return; // Sem espaço na capa, pendências migram pra próxima seção

  txt(doc, 'AÇÕES RECOMENDADAS', margin, y, {
    size: T.h2.size,
    style: T.h2.style,
    color: C.amber,
  });
  y += 2;
  accentLine(doc, margin, y + 1, pageWidth - margin, C.amber);
  y += 5;

  pendentes.forEach((pendencia) => {
    if (y > pageHeight - 25) return;

    roundRect(doc, margin, y, pageWidth - margin * 2, 14, 1.5, C.surface);
    fillRect(doc, margin, y, 2.5, 14, pendencia.cor);
    txt(doc, pendencia.equipamento?.nome || '—', margin + 6, y + 6, {
      size: 9.5,
      style: 'bold',
      color: C.text,
    });
    txt(doc, pendencia.acao, margin + 6, y + 11, { size: 7.5, color: C.text3 });
    y += 16;
  });
}

// ------------------------------- entry -------------------------------

function renderCoverBackground({ doc, pageWidth, pageHeight }) {
  fillPage(doc, pageWidth, pageHeight);
}

function buildCoverChecklistAdapterContext(
  { doc, pageWidth, pageHeight, margin, filtered, equipamentos },
  startY,
) {
  return {
    doc,
    pageWidth,
    pageHeight,
    margin,
    startY,
    filtered,
    equipamentos,
  };
}

function runCoverChecklistSection({
  doc,
  pageWidth,
  pageHeight,
  margin,
  startY,
  filtered,
  equipamentos,
}) {
  return drawChecklist(doc, pageWidth, pageHeight, margin, startY, filtered, equipamentos);
}

function renderCoverChecklist(context, y) {
  return runCoverChecklistSection(buildCoverChecklistAdapterContext(context, y));
}

export function drawCover(
  doc,
  pageWidth,
  pageHeight,
  margin,
  profile,
  _filtEq,
  de,
  ate,
  filtered,
  equipamentos,
  _drawFooter,
  context = {},
) {
  const coverContext = buildCoverContext({
    doc,
    pageWidth,
    pageHeight,
    margin,
    profile,
    de,
    ate,
    filtered,
    equipamentos,
    context,
  });

  renderCoverBackground(coverContext);

  drawMasthead(doc, pageWidth, margin, profile);

  let y = drawTitleBlock(doc, pageWidth, margin, 32, buildCoverTitleModel(coverContext));

  y = drawInfoBlocks(doc, pageWidth, margin, y, profile, coverContext.cliente);
  y = drawResumoExecutivo(doc, pageWidth, margin, y, filtered, equipamentos);
  y = drawEquipamentosTable(doc, pageWidth, margin, y, filtered, equipamentos);
  y = drawConclusao(doc, pageWidth, margin, y, filtered);
  y = drawFichaTecnica(doc, pageWidth, pageHeight, margin, y, filtered, equipamentos);
  y = renderCoverChecklist(coverContext, y);
  drawPendencias(doc, pageWidth, pageHeight, margin, y, filtered, equipamentos);
}
