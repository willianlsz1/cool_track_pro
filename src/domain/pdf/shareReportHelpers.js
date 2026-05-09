export function buildShareReportContext({
  pdfBlob,
  fileName,
  whatsappText,
  metadata = {},
  supabaseClient,
  buildFileName,
}) {
  const safeName = buildFileName({
    registroId: metadata.registroId,
    fileName,
  });

  return {
    pdfBlob,
    safeName,
    whatsappText,
    metadata,
    supabaseClient,
  };
}
