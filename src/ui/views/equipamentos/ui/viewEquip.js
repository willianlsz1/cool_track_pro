import { renderViewEquipDetailHtml as defaultRenderViewEquipDetailHtml } from './detail.js';
import {
  bindViewEquipDetailCoverActions as defaultBindViewEquipDetailCoverActions,
  mountViewEquipDetail as defaultMountViewEquipDetail,
  openViewEquipDetailModal as defaultOpenViewEquipDetailModal,
} from './detailController.js';
import { buildViewEquipDetailModel as defaultBuildViewEquipDetailModel } from './detailModel.js';

const viewEquipDeps = {
  resolveViewEquipTarget: null,
  regsForEquip: null,
  evaluateEquipmentHealth: null,
  evaluateEquipmentRisk: null,
  getHealthClass: null,
  Utils: null,
  getSetores: null,
  buildViewEquipDetailModel: defaultBuildViewEquipDetailModel,
  renderViewEquipDetailHtml: defaultRenderViewEquipDetailHtml,
  mountViewEquipDetail: defaultMountViewEquipDetail,
  bindViewEquipDetailCoverActions: defaultBindViewEquipDetailCoverActions,
  openViewEquipDetailModal: defaultOpenViewEquipDetailModal,
};

export function configureViewEquip(deps = {}) {
  Object.assign(viewEquipDeps, deps);
}

function getRequiredViewEquipDep(name) {
  const dep = viewEquipDeps[name];
  if (!dep) {
    throw new Error(`viewEquip dependency not configured: ${name}`);
  }
  return dep;
}

export async function viewEquip(id) {
  const resolveViewEquipTarget = getRequiredViewEquipDep('resolveViewEquipTarget');
  const eq = resolveViewEquipTarget(id);
  if (!eq) return;

  const buildViewEquipDetailModel = getRequiredViewEquipDep('buildViewEquipDetailModel');
  const renderViewEquipDetailHtml = getRequiredViewEquipDep('renderViewEquipDetailHtml');
  const mountViewEquipDetail = getRequiredViewEquipDep('mountViewEquipDetail');
  const bindViewEquipDetailCoverActions = getRequiredViewEquipDep(
    'bindViewEquipDetailCoverActions',
  );
  const openViewEquipDetailModal = getRequiredViewEquipDep('openViewEquipDetailModal');

  const model = buildViewEquipDetailModel({
    id,
    equip: eq,
    regsForEquip: getRequiredViewEquipDep('regsForEquip'),
    evaluateEquipmentHealth: getRequiredViewEquipDep('evaluateEquipmentHealth'),
    evaluateEquipmentRisk: getRequiredViewEquipDep('evaluateEquipmentRisk'),
    getHealthClass: getRequiredViewEquipDep('getHealthClass'),
    utils: getRequiredViewEquipDep('Utils'),
  });
  const detail = renderViewEquipDetailHtml(model, {
    getSetores: getRequiredViewEquipDep('getSetores'),
  });
  mountViewEquipDetail(detail.html);
  bindViewEquipDetailCoverActions(detail.firstPhotoUrl);
  await openViewEquipDetailModal(id);
}
