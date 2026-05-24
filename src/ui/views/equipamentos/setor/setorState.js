/**
 * State/model helpers for Equipamentos setor views.
 * Keep pure: no DOM, no Storage/Supabase, no render side effects.
 */

export function buildSetorGridForClienteModel({ setores, equipamentos, clienteId }) {
  // Bug fix #100: Filtra setores DUAL-PATH pra ser robusto a sync issues.
  //
  //   Caminho 1 (direto): setor.clienteId === clienteId
  //   Caminho 2 (derivado): setor tem equipamento.clienteId === clienteId
  const equipsDoCliente = (equipamentos || []).filter((e) => e.clienteId === clienteId);
  const setoresIdsViaEquip = new Set(equipsDoCliente.map((e) => e.setorId).filter(Boolean));
  const setoresDoCliente = (setores || []).filter(
    (s) => s.clienteId === clienteId || setoresIdsViaEquip.has(s.id),
  );
  // Equipamentos do cliente sem setor (compat backward)
  const equipsSemSetor = equipsDoCliente.filter((e) => !e.setorId);

  return {
    setoresDoCliente,
    equipamentos,
    equipsDoCliente,
    equipsSemSetor,
  };
}
