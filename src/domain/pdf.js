/**
 * CoolTrack Pro - PDF Generator v8.0
 * Orquestrador de geracao: filtra dados, monta contexto (OS, cliente, emissao)
 * e delega para os builders de secao. O rodape com paginacao X/Y e carimbado
 * por ultimo, depois de todas as paginas terem sido criadas.
 */

import { jsPDF } from 'jspdf';
// v5 do jspdf-autotable nao anexa mais `doc.autoTable` por side-effect;
// a funcao e importada e chamada como autoTable(doc, options). As sections
// (cover, services) fazem esse import diretamente.
import { getState } from '../core/state.js';
import { Profile } from '../features/profile.js';
import { resolveSignatureForRecord } from '../ui/components/signature.js';
import { buildPdfDocumentModel } from './pdf/generatorHelpers.js';
import { drawWatermarkAllPages } from './pdf/primitives.js';
import { buildReportFileName } from './pdf/reportModel.js';
import { drawCover } from './pdf/sections/cover.js';
import { stampFooterTotals } from './pdf/sections/footer.js';
import { drawServices } from './pdf/sections/services.js';
import { drawSignaturePages } from './pdf/sections/signatures.js';
import { drawUpsellBlock } from './pdf/sections/upsell.js';
import { PLAN_CODE_FREE } from '../core/plans/subscriptionPlans.js';

const PAGE_MARGIN = 15;

function createPdfDocument() {
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

function getPdfDimensions(doc) {
  return {
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
  };
}

function buildPdfGenerationContext(options = {}, context = {}) {
  const { registros, equipamentos } = getState();
  const { filtEq = '', de = '', ate = '', registroId = '' } = options;
  const { planCode } = context;
  const profile = Profile.get();

  return {
    options,
    registros,
    equipamentos,
    filtEq,
    de,
    ate,
    registroId,
    planCode,
    profile,
  };
}

function buildPdfDocumentSurface() {
  const doc = createPdfDocument();
  const { pageWidth, pageHeight } = getPdfDimensions(doc);

  return { doc, pageWidth, pageHeight, margin: PAGE_MARGIN };
}

function renderPdfCoverSection(pdfSurface, generationContext, documentModel) {
  const { doc, pageWidth, pageHeight, margin } = pdfSurface;
  const { profile, filtEq, de, ate, equipamentos } = generationContext;
  const { filtered, reportContext } = documentModel;

  drawCover(
    doc,
    pageWidth,
    pageHeight,
    margin,
    profile,
    filtEq,
    de,
    ate,
    filtered,
    equipamentos,
    null,
    reportContext,
  );
}

async function renderPdfServicesSection(pdfSurface, generationContext, documentModel) {
  const { doc, pageWidth, pageHeight, margin } = pdfSurface;
  const { equipamentos, profile } = generationContext;
  const { filtered, reportContext } = documentModel;

  doc.addPage();
  await drawServices(
    doc,
    pageWidth,
    pageHeight,
    margin,
    filtered,
    equipamentos,
    profile,
    null,
    reportContext,
  );
}

async function resolvePdfSignatureDataUrls(filtered) {
  // Pre-resolve todas as assinaturas (Storage -> localStorage) num Map.
  const signatureDataUrls = new Map();
  await Promise.all(
    filtered.map(async (registro) => {
      try {
        const dataUrl = await resolveSignatureForRecord(registro);
        if (dataUrl) signatureDataUrls.set(registro.id, dataUrl);
      } catch (_err) {
        /* signature falhou -> trata como ausente no PDF */
      }
    }),
  );
  return signatureDataUrls;
}

async function renderPdfSignatureSection(pdfSurface, generationContext, documentModel) {
  const { doc, pageWidth, pageHeight, margin } = pdfSurface;
  const { equipamentos, profile } = generationContext;
  const { filtered, reportContext } = documentModel;
  const signatureDataUrls = await resolvePdfSignatureDataUrls(filtered);
  const getSignatureSync = (registroId) => signatureDataUrls.get(registroId) || null;

  drawSignaturePages(
    doc,
    pageWidth,
    pageHeight,
    margin,
    filtered,
    equipamentos,
    profile,
    getSignatureSync,
    null,
    reportContext,
  );
}

function renderPdfFreePlanBranding(pdfSurface, generationContext) {
  const { doc, pageWidth, pageHeight, margin } = pdfSurface;
  const { planCode } = generationContext;

  if (planCode === PLAN_CODE_FREE) {
    drawUpsellBlock(doc, pageWidth, pageHeight, margin);
    drawWatermarkAllPages(doc, pageWidth, pageHeight);
  }
}

function renderPdfFooter(pdfSurface, generationContext, documentModel) {
  const { doc, pageWidth, pageHeight, margin } = pdfSurface;
  const { profile } = generationContext;
  const { osNumber, emitido } = documentModel;

  stampFooterTotals(doc, pageWidth, pageHeight, margin, profile, {
    osNumber,
    emitido,
  });
}

function finalizePdfDocument(pdfSurface, generationContext) {
  const { doc } = pdfSurface;
  const { options, profile } = generationContext;
  const fileName = buildReportFileName(profile);

  if (options.asBlob === true) {
    const blob = doc.output('blob');
    return { fileName, blob };
  }

  doc.save(fileName);
  return fileName;
}

function handlePdfGenerationFailure(err) {
  console.error('[PDF v8]', err);
  return null;
}

export const PDFGenerator = {
  async generateMaintenanceReport(options = {}, context = {}) {
    try {
      const generationContext = buildPdfGenerationContext(options, context);
      const documentModel = buildPdfDocumentModel(generationContext);
      const pdfSurface = buildPdfDocumentSurface();

      renderPdfCoverSection(pdfSurface, generationContext, documentModel);

      if (documentModel.filtered.length > 0) {
        await renderPdfServicesSection(pdfSurface, generationContext, documentModel);
        await renderPdfSignatureSection(pdfSurface, generationContext, documentModel);
      }

      renderPdfFreePlanBranding(pdfSurface, generationContext);

      renderPdfFooter(pdfSurface, generationContext, documentModel);

      return finalizePdfDocument(pdfSurface, generationContext);
    } catch (err) {
      return handlePdfGenerationFailure(err);
    }
  },
};

export default PDFGenerator;
