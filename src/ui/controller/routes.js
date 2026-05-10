import { currentRoute, registerRoute } from '../../core/router.js';
import { renderDashboard, updateHeader } from '../views/dashboard.js';
import {
  renderEquip,
  populateEquipSelects,
  unmountEquipamentosHeader,
  unmountEquipamentosList,
} from '../views/equipamentos.js';
import { renderHist, setHistClienteFilter, clearHistClienteFilter } from '../views/historico.js';
import { renderAlertas, unmountAlertas } from '../views/alertas.js';
import {
  renderRelatorio,
  populateRelatorioSelects,
  unmountRelatorioHero,
  unmountRelatorioControls,
  unmountRelatorioCards,
} from '../views/relatorio.js';
import {
  initRegistro,
  loadRegistroForEdit,
  unmountRegistroHeader,
  unmountRegistroChecklist,
  unmountRegistroPhotos,
  unmountRegistroSignature,
} from '../views/registro.js';
import { renderPricing } from '../views/pricing.js';
import { renderClientes, unmountClientes } from '../views/clientes.js';
import {
  getClientesAccessSnapshot,
  resolveClientesAccess,
} from '../../core/plans/clientesAccess.js';
import { renderConta } from '../views/conta.js';
import { renderPrivacidade } from '../views/privacidade.js';
import { renderConfiguracoes } from '../views/configuracoes.js';
import { OnboardingChecklist } from '../components/onboarding/onboardingChecklist.js';

export function registerAppRoutes() {
  function renderClientesPlanLoading() {
    const container = document.querySelector('#view-clientes .view-content');
    if (!container) return;
    container.innerHTML = `
      <div class="view-loading" role="status" aria-live="polite" style="padding:16px">
        Validando plano...
      </div>
    `;
  }

  registerRoute('inicio', () => {
    updateHeader();
    renderDashboard();
  });

  registerRoute(
    'equipamentos',
    (params = {}) => {
      populateEquipSelects();
      const renderResult = renderEquip('', params);
      updateHeader();
      return renderResult;
    },
    () => {
      unmountEquipamentosHeader();
      unmountEquipamentosList();
    },
  );

  registerRoute(
    'registro',
    (params = {}) => {
      populateEquipSelects();
      initRegistro(params);
      if (params.editRegistroId) loadRegistroForEdit(params.editRegistroId);
      // UX V2 audit fix: equipamento picker com search + group por setor.
      // Lazy import (carrega so quando entra em /registro).
      import('../components/registroEquipPicker.js').then((m) => {
        m.initRegistroEquipPicker?.();
        if (params.openEquipPicker) {
          m.openRegistroEquipPicker?.();
        }
      });
      updateHeader();
    },
    () => {
      unmountRegistroHeader();
      unmountRegistroChecklist();
      unmountRegistroPhotos();
      unmountRegistroSignature();
    },
  );

  registerRoute(
    'historico',
    (params = {}) => {
      populateEquipSelects();
      // Filtro por cliente vindo de /clientes -> "Ver servicos". Se nao tiver
      // clienteId nos params, limpa o filtro existente.
      if (params.clienteId) {
        setHistClienteFilter({ id: params.clienteId, nome: params.clienteNome || '' });
      } else {
        clearHistClienteFilter();
      }
      renderHist();
      updateHeader();
    },
    () =>
      import('../views/historico.js').then((mod) => {
        mod.unmountHistoricoFilters?.();
        mod.unmountHistoricoTimeline?.();
      }),
  );

  registerRoute(
    'alertas',
    () => {
      const renderResult = renderAlertas();
      updateHeader();
      return renderResult;
    },
    () => {
      unmountAlertas();
    },
  );

  registerRoute(
    'relatorio',
    (params = {}) => {
      populateRelatorioSelects();
      if (params.equipId) {
        const select = document.getElementById('rel-equip');
        if (select) select.value = String(params.equipId);
      }
      renderRelatorio(params.equipId ? { equipId: String(params.equipId) } : {});
      updateHeader();
      OnboardingChecklist.markStep('relatorio');
    },
    () => {
      unmountRelatorioHero();
      unmountRelatorioControls();
      unmountRelatorioCards();
    },
  );

  registerRoute('pricing', (params = {}) => {
    renderPricing(params);
    updateHeader();
  });

  registerRoute(
    'clientes',
    async () => {
      let decision = getClientesAccessSnapshot();

      if (!decision.resolved) {
        renderClientesPlanLoading();
        await resolveClientesAccess();
        if (currentRoute() !== 'clientes') return;
      }

      renderClientes();
      updateHeader();
    },
    () => {
      unmountClientes();
    },
  );

  registerRoute('conta', () => {
    renderConta();
    updateHeader();
  });

  registerRoute('privacidade', () => {
    renderPrivacidade();
    updateHeader();
  });

  registerRoute('configuracoes', () => {
    renderConfiguracoes();
    updateHeader();
  });

  // V3 Instalação (abr/2026): orçamentos disponiveis em todos os planos
  // (Free com limite de 1/mês como porta de entrada).
  registerRoute(
    'orcamentos',
    async (params = {}) => {
      updateHeader();
      const { loadAndRenderOrcamentos } = await import('../views/orcamentos.js');
      await loadAndRenderOrcamentos(params);
    },
    async () => {
      const { unmountOrcamentos } = await import('../views/orcamentos.js');
      await unmountOrcamentos();
    },
  );
}
