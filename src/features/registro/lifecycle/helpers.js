export function getClearRegistroFieldIds(preserveEquip = false) {
  const fieldIds = [
    'r-tipo',
    'r-tipo-custom',
    'r-pecas',
    'r-obs',
    'r-proxima',
    'r-tecnico',
    'r-custo-pecas',
    'r-custo-mao-obra',
    'r-prioridade',
    'r-cliente-nome',
    'r-cliente-documento',
    'r-local-atendimento',
    'r-cliente-contato',
  ];

  if (!preserveEquip) fieldIds.push('r-equip');
  return fieldIds;
}

export function resolveRegistroEditTarget(registros = [], id) {
  return registros.find((registro) => registro.id === id);
}

export function resolveRegistroInitEquipId(params = {}) {
  return params.equipId || params.equipamentoId || '';
}
