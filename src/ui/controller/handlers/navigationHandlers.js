import { on } from '../../../core/events.js';
import { Modal } from '../../../core/modal.js';
import { goTo } from '../../../core/router.js';
import { SupportFeedbackModal } from '../../components/supportFeedbackModal.js';
import { Toast } from '../../../core/toast.js';
import { Tour } from '../../components/tour.js';
import { OnboardingChecklist } from '../../components/onboarding/onboardingChecklist.js';
import { ContextualOnboarding } from '../../components/onboarding/contextualOnboarding.js';
import {
  clearEditingState as clearEquipEditingState,
  clearForcedEquipContext,
  clearSetorEditingState,
  lockEquipContext,
} from '../../views/equipamentos.js';
import { populateClienteSelect } from '../../views/clientes.js';
import {
  applyNameplateCtaGate,
  resetNameplateCtaState,
} from '../../components/nameplateCapture.js';
import { PushOptInCard } from '../../components/pushOptInCard.js';
import { InstallAppPrompt } from '../../components/installAppPrompt.js';
import { startServiceRegistration } from '../serviceRegistrationEntry.js';

let isHelpOpen = false;

function removeContextualOnboardingCard() {
  document.querySelector('[data-contextual-onboarding]')?.remove();
}

// Memoria do parent original do menu (.header-settings) pra restaurar quando
// fechar. Evita perder a posicao DOM-padrao quando reabrir do header (mobile).
let _menuOriginalParent = null;

function setHelpMenuState(open, anchorEl = null) {
  const menu = document.getElementById('header-help-menu');
  const headerTrigger = document.getElementById('header-help-btn');
  const sidenavTrigger = document.getElementById('sidenav-settings');
  if (!menu) return;
  isHelpOpen = Boolean(open);

  // Atualiza aria-expanded em ambos os triggers
  if (headerTrigger) {
    headerTrigger.setAttribute('aria-expanded', String(isHelpOpen));
    headerTrigger.classList.toggle('is-active', isHelpOpen);
  }
  if (sidenavTrigger) {
    sidenavTrigger.setAttribute('aria-expanded', String(isHelpOpen));
    sidenavTrigger.classList.toggle('is-active', isHelpOpen);
  }

  if (!isHelpOpen) {
    menu.hidden = true;
    menu.style.cssText = '';
    // Restaura ao parent original (caso tivermos movido pra body)
    if (_menuOriginalParent && menu.parentElement === document.body) {
      _menuOriginalParent.appendChild(menu);
    }
    return;
  }

  // Aberto via Ajuda na sidebar: move o menu pra ser filho direto do
  // body com position fixed perto do anchor. Isso evita problemas de
  // containing block / overflow / display:contents do parent original.
  if (anchorEl) {
    if (!_menuOriginalParent) _menuOriginalParent = menu.parentElement;
    if (menu.parentElement !== document.body) {
      document.body.appendChild(menu);
    }
    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = Math.min(320, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));
    const bottom = Math.max(8, window.innerHeight - rect.top + 8);
    menu.style.cssText = `position: fixed !important; left: ${left}px !important; bottom: ${bottom}px !important; right: auto !important; top: auto !important; z-index: 9999 !important; display: grid !important;`;
    menu.hidden = false;
  } else {
    // Aberto via header (mobile): restaura ao parent original e usa o
    // positioning padrao do CSS.
    if (_menuOriginalParent && menu.parentElement === document.body) {
      _menuOriginalParent.appendChild(menu);
    }
    menu.style.cssText = '';
    menu.hidden = false;
  }
}

export function bindNavigationHandlers() {
  if (!document.body.dataset.helpMenuBound) {
    document.body.dataset.helpMenuBound = '1';
    document.addEventListener('click', (event) => {
      // Considera clique "dentro" quando mira o trigger, o menu em si
      // ou qualquer wrapper ativo (.header-help / .header-settings).
      const insideHelp = event.target.closest(
        '#header-help-btn, #header-help-menu, .header-help, .header-settings, #sidenav-settings, .app-sidebar__settings',
      );
      if (!insideHelp && isHelpOpen) setHelpMenuState(false);
    });

    document.addEventListener('app:route-changed', () => {
      if (isHelpOpen) setHelpMenuState(false);
    });
  }

  on('open-modal', (el) => {
    const id = el.dataset.id;
    // Ao abrir o modal de equipamento via "+ Novo", garante que não estamos em modo edição
    if (id === 'modal-add-eq') {
      clearEquipEditingState();
      clearForcedEquipContext();
      // Sync visibilidade do select de componente (evap/cond) baseado no
      // tipo atual. Também bind one-time do change listener no tipo pra
      // re-sync quando user trocar.
      import('../../views/equipamentos.js').then((m) => {
        m.syncComponenteVisibility?.();
        m.applyEquipModalExperience?.({ triggerEl: el });
        const tipoEl = document.getElementById('eq-tipo');
        if (tipoEl && !tipoEl.dataset.componenteBound) {
          tipoEl.dataset.componenteBound = '1';
          tipoEl.addEventListener('change', () => m.syncComponenteVisibility?.());
        }
      });
      // Inicializa os custom dropdowns de Setor + Cliente (V2 redesign).
      // Idempotente: bind global so na primeira chamada; sync labels sempre.
      import('../../components/eqContextPicker.js').then((m) => {
        m.initEqContextPickers?.();
      });
      // Popula select de clientes (lazy hydrate). Fire-and-forget;
      // se falhar, o wrapper fica hidden (default) e o campo simplesmente
      // não aparece — não quebra o cadastro.
      Promise.resolve(populateClienteSelect())
        .then(() => {
          // Bug fix #103: pre-preenche Setor + Cliente quando o "+ Novo
          // equipamento" foi clicado dentro do drill-down de um setor.
          // Lê data-setor-id e data-cliente-id do botao trigger.
          const setorId = el.dataset.setorId || '';
          const clienteId = el.dataset.clienteId || '';
          if (setorId) {
            const setorSelect = document.getElementById('eq-setor');
            if (setorSelect) {
              setorSelect.value = setorId;
              // Dispara change pra que o eqContextPicker sincronize o label
              // do dropdown custom (que mostra o nome do setor selecionado).
              setorSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          if (clienteId) {
            const clienteSelect = document.getElementById('eq-cliente');
            if (clienteSelect) {
              clienteSelect.value = clienteId;
              clienteSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          return import('../../views/equipamentos/contextState.js').then((ctxModule) => {
            const routeCtx = ctxModule.getRouteEquipCtx?.() || {};
            const forcedClienteId = clienteId || routeCtx.clienteId || '';
            const forcedSetorId = setorId || routeCtx.sectorId || '';
            if (!forcedClienteId && !forcedSetorId) return;
            const clienteNome =
              el.dataset.clienteNome ||
              routeCtx.clienteNome ||
              document.querySelector('#eq-cliente option:checked')?.textContent ||
              '';
            const setorNome =
              document.querySelector('#eq-setor option:checked')?.textContent ||
              (forcedSetorId ? 'Setor selecionado' : '');
            lockEquipContext({
              clienteId: forcedClienteId || null,
              clienteNome: clienteNome || '',
              setorId: forcedSetorId || null,
              setorNome: setorNome || '',
            });
            import('../../views/equipamentos.js').then((m) =>
              m.applyEquipModalExperience?.({ triggerEl: el }),
            );
          });
        })
        .catch(() => {
          /* no-op: campo cliente é opcional */
        });
      // V4: o bloco de fotos saiu desse modal. O unico gate sincrono que
      // resta aqui e o do hero CTA de analise de placa.
      resetNameplateCtaState();
      applyNameplateCtaGate({ isPlusOrPro: true, trialRemaining: null });
    }
    if (id === 'modal-add-setor') clearSetorEditingState();
    Modal.open(id);
  });
  on('close-modal', (el) => {
    const id = el.dataset.id;
    Modal.close(id);
    // Ao fechar modais de criação/edição via Cancelar, reseta estado de edição
    if (id === 'modal-add-eq') {
      clearEquipEditingState();
      resetNameplateCtaState();
    }
    if (id === 'modal-add-setor') clearSetorEditingState();
  });
  on('toggle-help-menu', (el) => {
    // Se o trigger é o botao Ajuda do sidebar, passa ele como anchor
    // pra o menu ser reposicionado pra cima dele em vez do gear do header.
    const anchor = el?.id === 'sidenav-settings' ? el : null;
    setHelpMenuState(!isHelpOpen, anchor);
  });
  on('help-open-tutorial', () => {
    setHelpMenuState(false);
    Tour.restart();
  });
  on('help-score-info', () => {
    setHelpMenuState(false);
    // setTimeout garante que o evento de clique terminou de propagar
    // antes de abrir o modal — necessário no mobile
    setTimeout(() => Modal.open('modal-score-info'), 80);
  });
  on('help-support', () => {
    setHelpMenuState(false);
    SupportFeedbackModal.open('suporte');
  });

  on('help-feedback', () => {
    setHelpMenuState(false);
    SupportFeedbackModal.open('feedback');
  });

  on('start-service-registration', (el) => {
    startServiceRegistration({
      equipId: el?.dataset?.equipId || el?.dataset?.id || '',
    });
  });

  on('contextual-onboarding-register', () => {
    ContextualOnboarding.complete('register-service');
    removeContextualOnboardingCard();
    startServiceRegistration();
  });

  on('contextual-onboarding-clientes', () => {
    ContextualOnboarding.complete('organize-clients');
    removeContextualOnboardingCard();
    goTo('clientes');
  });

  on('contextual-onboarding-skip', () => {
    ContextualOnboarding.skip();
    removeContextualOnboardingCard();
  });

  on('go-register-equip', (el) => {
    Modal.close('modal-eq-det');
    startServiceRegistration({ equipId: el.dataset.id });
  });

  on('edit-reg', (el) => {
    goTo('registro', { editRegistroId: el.dataset.id });
  });

  on('go-equipamentos-preventiva-7d', () => {
    goTo('equipamentos', { statusFilter: 'preventiva-7d' });
  });

  // Continue draft card: navega para registro com o id para recuperar.
  on('continue-draft', (el) => {
    const id = el?.dataset?.id;
    if (id) {
      goTo('registro', { editRegistroId: id });
    } else {
      goTo('registro');
    }
  });

  // Descarta o rascunho via clique no X do continue card.
  on('discard-draft', async () => {
    try {
      sessionStorage.removeItem('cooltrack-editing-id');
    } catch (_e) {
      /* sessionStorage indisponivel */
    }
    Toast.success('Rascunho descartado.');
  });

  // Click num card de alerta de cliente em /alertas → navega pra grade de
  // setores do cliente (mesmo flow do "Ver equipamentos" no card do cliente).
  on('go-cliente-equipamentos', (el) => {
    const clienteId = el?.dataset?.id;
    const clienteNome = el?.dataset?.clienteNome || '';
    if (!clienteId) return;
    goTo('equipamentos', {
      equipCtx: { clienteId, clienteNome },
    });
  });

  // Onboarding checklist — dispensar permanentemente o card de "Primeiros passos"
  on('onboarding-dismiss', () => {
    OnboardingChecklist.dismiss();
  });

  // Push: ativar/desativar notificações na tela de Conta
  on('push-enable', async () => {
    await PushOptInCard.enable();
    const host = document.querySelector('.conta-sections');
    if (host) await PushOptInCard.render(host);
  });
  on('push-disable', async () => {
    await PushOptInCard.disable();
    const host = document.querySelector('.conta-sections');
    if (host) await PushOptInCard.render(host);
  });

  // PWA install — dispara prompt nativo do navegador (Chrome/Edge)
  on('install-app-prompt', async () => {
    await InstallAppPrompt.prompt();
    // appinstalled listener limpa o card automático em caso de sucesso.
  });
  on('install-app-dismiss', () => {
    InstallAppPrompt.dismiss();
  });
}
