export function buildWhatsAppSuccessCopy(channel) {
  if (channel === 'web-share') {
    return { title: 'RelatÃ³rio pronto para compartilhar' };
  }
  if (channel === 'download') {
    return { title: 'RelatÃ³rio baixado. Envie manualmente pelo WhatsApp.' };
  }
  return { title: 'RelatÃ³rio enviado para o WhatsApp' };
}
