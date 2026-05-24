export function collectSaveEquipDadosPlaca({
  collectDadosPlaca,
  DadosPlacaValidationError,
  formatDecimalHint,
  Toast,
  documentRef = document,
}) {
  // Dados da etiqueta (13 campos opcionais). Coletados em JSONB pra persistência
  // em equipamentos.dados_placa. Se nenhum foi preenchido, mantém object vazio
  // (migration constraint: jsonb_typeof = 'object').
  //
  // collectDadosPlaca() pode lançar DadosPlacaValidationError quando um valor
  // decimal ultrapassa o range plausível (provável separador decimal esquecido).
  // Traduzimos pra Toast amigável e focamos o input em vez de propagar o erro.
  try {
    return { ok: true, dadosPlaca: collectDadosPlaca() };
  } catch (err) {
    if (err instanceof DadosPlacaValidationError) {
      const hint = formatDecimalHint(err.value);
      Toast.warning(
        `${err.label} (${err.unit}): ${err.value} parece alto demais. ` +
          `Use vírgula como separador decimal — ex: ${hint} em vez de ${err.value}.`,
      );
      const input = documentRef.getElementById(err.inputId);
      if (input) {
        input.focus();
        if (typeof input.select === 'function') input.select();
      }
      return { ok: false };
    }
    throw err;
  }
}
