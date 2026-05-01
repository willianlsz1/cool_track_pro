import {
  RELATORIO_ACTIONS,
  RELATORIO_NAV_TARGETS,
  RELATORIO_PLAN_CODES,
} from './relatorioContracts.js';

export function buildRelatorioCompanyPmocModel({ isPro = false, hasPmocAttention = false } = {}) {
  const visible = Boolean(isPro);
  const showAttention = visible && Boolean(hasPmocAttention);

  return {
    visible,
    planCode: visible ? RELATORIO_PLAN_CODES.pro : '',
    ariaLabel: 'PMOC da empresa',
    title: 'PMOC',
    description: 'Documento anual com cronograma, evid\u00eancias e assinaturas.',
    primaryAction: RELATORIO_ACTIONS.openPmocModal,
    primaryLabel: 'Gerar PMOC formal',
    showAttention,
    attentionLabel: showAttention ? 'PMOC precisa de aten\u00e7\u00e3o' : '',
    secondaryNav: showAttention ? RELATORIO_NAV_TARGETS.clientes : '',
    secondaryLabel: showAttention ? 'Ver pend\u00eancias' : '',
  };
}
