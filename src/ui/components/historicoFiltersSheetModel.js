export const HISTORICO_FILTERS_SHEET_IDS = Object.freeze({
  overlay: 'hist-filters-sheet-overlay',
  title: 'hist-filters-sheet-title',
  setor: 'hfs-setor',
  equip: 'hfs-equip',
  close: 'hfs-close',
  reset: 'hfs-reset',
  apply: 'hfs-apply',
});

export const HISTORICO_FILTERS_SHEET_CLASSES = Object.freeze([
  'modal-overlay',
  'hist-filters-sheet-overlay',
  'modal',
  'hist-filters-sheet',
  'hist-filters-sheet__head',
  'hist-filters-sheet__handle',
  'hist-filters-sheet__head-row',
  'hist-filters-sheet__title',
  'hist-filters-sheet__close',
  'hist-filters-sheet__body',
  'hist-filters-sheet__field',
  'hist-filters-sheet__label',
  'hist-filters-sheet__select',
  'hist-filters-sheet__tipo-grid',
  'hist-filters-sheet__tipo-chip',
  'hist-filters-sheet__foot',
  'hist-filters-sheet__reset',
  'hist-filters-sheet__apply',
]);

export const HISTORICO_FILTERS_SHEET_DATA_ATTRIBUTES = Object.freeze([
  'data-current',
  'data-tipo-id',
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function normalizeHistoricoFiltersSheetInitial(initial = {}) {
  return {
    setor: text(initial.setor),
    equip: text(initial.equip),
    tipo: text(initial.tipo),
  };
}

export function getHistoricoFiltersSheetEquipOptions({
  equipamentos = [],
  setorId = '',
  currentEquipId = '',
} = {}) {
  const selectedSetorId = text(setorId);
  const selectedEquipId = text(currentEquipId);
  const rows = selectedSetorId
    ? asArray(equipamentos).filter((equipamento) => text(equipamento?.setorId) === selectedSetorId)
    : asArray(equipamentos);
  const stillValid = rows.some((equipamento) => text(equipamento?.id) === selectedEquipId);

  return rows.map((equipamento) => {
    const id = text(equipamento?.id);
    return {
      id,
      label: text(equipamento?.nome || equipamento?.id),
      selected: Boolean(stillValid && id === selectedEquipId),
    };
  });
}

export function buildHistoricoFiltersSheetModel({
  setores = [],
  equipamentos = [],
  tipoOptions = [],
  initial = {},
} = {}) {
  const safeInitial = normalizeHistoricoFiltersSheetInitial(initial);

  return {
    initial: safeInitial,
    showSetorSelect: asArray(setores).length > 0,
    setorOptions: asArray(setores).map((setor) => {
      const id = text(setor?.id);
      return {
        id,
        label: text(setor?.nome || setor?.id),
        selected: id === safeInitial.setor,
      };
    }),
    equipOptions: getHistoricoFiltersSheetEquipOptions({
      equipamentos,
      setorId: safeInitial.setor,
      currentEquipId: safeInitial.equip,
    }),
    tipoOptions: asArray(tipoOptions).map((option) => {
      const id = text(option?.id);
      return {
        id,
        label: text(option?.label),
        active: id === safeInitial.tipo,
      };
    }),
  };
}
