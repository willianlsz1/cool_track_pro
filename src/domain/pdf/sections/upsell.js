import { PDF_COLORS as C } from '../constants.js';
import { fillRect } from '../primitives.js';

// URL exibida no bloco de upsell. Trocar para o domínio oficial quando adquirido.
const UPSELL_URL = 'cooltrack.app';

// Bloco compacto exibido na última página de PDFs gerados no plano Free.
// Objetivo: o cliente do técnico entende que existe versão Pro sem marca d'água
// e tem uma URL pra explorar. Discreto: 12mm de altura, fonte 8pt, fundo claro.
//
// Posicionamento: logo acima do footer da última página. Não detecta colisão
// com conteúdo acima — em PDFs muito densos pode sobrepor a base do conteúdo,
// trade-off aceitável dado o fundo opaco da caixa.
export function drawUpsellBlock(doc, pageWidth, pageHeight, margin) {
  // Garante que estamos na última página antes de desenhar.
  doc.setPage(doc.internal.getNumberOfPages());

  const blockHeight = 12;
  const footerOffset = 14; // alinhado com sections/footer.js
  const blockGap = 4;
  const blockY = pageHeight - footerOffset - blockGap - blockHeight;
  const blockX = margin;
  const blockW = pageWidth - margin * 2;

  // Fundo claro (slate-50)
  fillRect(doc, blockX, blockY, blockW, blockHeight, [248, 250, 252]);

  // Borda sutil
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(blockX, blockY, blockW, blockHeight, 'S');

  // Barra lateral accent (cyan da paleta)
  fillRect(doc, blockX, blockY, 2.5, blockHeight, C.accent);

  // Texto + URL na mesma linha, centralizado verticalmente no bloco.
  const textY = blockY + blockHeight / 2 + 1.2;
  const textStartX = blockX + 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.text2);
  const prefix = "Versão Free · No plano Pro, seus PDFs saem sem marca d'água. Saiba mais em ";
  doc.text(prefix, textStartX, textY);

  // URL em bold + cor primary, logo após o texto base (mesma linha).
  const prefixWidth = doc.getTextWidth(prefix);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.primary);
  doc.text(UPSELL_URL, textStartX + prefixWidth, textY);
}
