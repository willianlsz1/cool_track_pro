/**
 * Module-level editing/context state for the equipamentos view.
 *
 * Extraído de src/ui/views/equipamentos.js no Mudança 11 / CP-B.5.
 * Mantém contrato simples de get/set sem validação nem reatividade.
 */

let _editingEquipId = null;
let _editingSetorId = null;
let _forcedEquipContext = null;

export function getEditingEquipId() {
  return _editingEquipId;
}

export function setEditingEquipId(id) {
  _editingEquipId = id;
}

export function getEditingSetorId() {
  return _editingSetorId;
}

export function setEditingSetorId(id) {
  _editingSetorId = id;
}

export function getForcedEquipContext() {
  return _forcedEquipContext;
}

export function setForcedEquipContext(context) {
  _forcedEquipContext = context;
}

export function clearEditingState() {
  _editingEquipId = null;
  _editingSetorId = null;
  _forcedEquipContext = null;
}
