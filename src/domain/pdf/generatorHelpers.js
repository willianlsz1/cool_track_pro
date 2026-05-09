import { buildOsNumber, extractClientBlock, filterRegistrosForReport } from './reportModel.js';

export function buildPdfDocumentModel(generationContext, now = new Date(), osStorage) {
  const { registros, registroId, filtEq, de, ate } = generationContext;
  const filtered = filterRegistrosForReport(registros, { registroId, filtEq, de, ate });
  const osNumber = buildOsNumber(now, osStorage);
  const emitido = now.toLocaleDateString('pt-BR');
  const cliente = extractClientBlock(filtered);

  return {
    filtered,
    osNumber,
    emitido,
    reportContext: { osNumber, emitido, cliente },
  };
}
