export function buildWhatsAppSuccessCopy(channel) {
  if (channel === 'web-share') {
    return { title: 'Relatório pronto para compartilhar' };
  }
  if (channel === 'download') {
    return { title: 'Relatório baixado. Envie manualmente pelo WhatsApp.' };
  }
  return { title: 'Relatório enviado para o WhatsApp' };
}
