/**
 * CoolTrack Pro - Alertas View v6.0
 * Legacy adapter for the React alertas island.
 */

import { Utils } from '../../core/utils.js';
import { getState } from '../../core/state.js';
import { Alerts, getPreventivaDueEquipmentIds } from '../../domain/alerts.js';
import { getAllClienteAlerts } from '../../core/clienteAlerts.js';
import { withSkeleton } from '../components/skeleton.js';
import { buildAlertasViewModel } from '../viewModels/alertasViewModel.js';

const ALERTAS_VIEW_ID = 'view-alertas';

let alertasBridgePromise = null;
let renderGeneration = 0;

function loadAlertasBridge() {
  alertasBridgePromise ??= import('../../react/entrypoints/alertasIsland.jsx');
  return alertasBridgePromise;
}

export function renderAlertas() {
  const { equipamentos = [], registros = [], clientes = [] } = getState();
  const maintenanceAlerts = Alerts.getAll();
  const preventivas7dCount = getPreventivaDueEquipmentIds(registros, 7).length;
  const clienteAlerts = getAllClienteAlerts(clientes);
  const viewModel = buildAlertasViewModel({
    equipamentos,
    maintenanceAlerts,
    clienteAlerts,
    preventivas7dCount,
  });

  const root = Utils.getEl(ALERTAS_VIEW_ID);
  if (!root) return null;

  const generation = ++renderGeneration;
  const listEl = Utils.getEl('lista-alertas');
  const mountIsland = () =>
    loadAlertasBridge().then(({ mountAlertasReact }) => {
      if (generation !== renderGeneration) return null;
      return mountAlertasReact(root, { viewModel });
    });

  if (!listEl) return mountIsland();

  return withSkeleton(
    listEl,
    {
      enabled: true,
      variant: 'alerts',
      count: viewModel.skeletonCount,
    },
    mountIsland,
  );
}

export function unmountAlertas() {
  renderGeneration += 1;
  const root = Utils.getEl(ALERTAS_VIEW_ID);
  if (!root?.dataset.reactAlertasMounted) return null;

  return loadAlertasBridge().then(({ unmountAlertasReact }) => {
    unmountAlertasReact(root);
    return null;
  });
}
