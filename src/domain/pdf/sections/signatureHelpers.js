export function buildSignatureRecordModel(registro, equipamentos, options) {
  const {
    fallbackStatusInfo,
    formatDatetime,
    getSignatureForRecord,
    getSignatureImagePayload,
    nowIso = () => new Date().toISOString(),
    sanitizePublicText,
    statusByCode,
  } = options;

  const signatureData = getSignatureForRecord(registro.id);
  const signaturePayload = getSignatureImagePayload(signatureData);
  const signatureDate = registro.data ? formatDatetime(registro.data) : formatDatetime(nowIso());
  const clienteNome = sanitizePublicText(
    registro.clienteNome?.trim() || registro.cliente?.trim() || '',
    'Não informado',
  );
  const clienteDoc =
    registro.clienteDocumento?.trim() ||
    registro.clienteCnpj?.trim() ||
    registro.clienteCpf?.trim() ||
    '';
  const equipamento = equipamentos.find((item) => item.id === registro.equipId);
  const statusInfo = statusByCode[registro.status] || fallbackStatusInfo;

  return {
    clienteDoc,
    clienteNome,
    equipamento,
    registro,
    signatureDate,
    signaturePayload,
    statusInfo,
  };
}
