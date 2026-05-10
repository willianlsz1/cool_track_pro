import { goTo } from '../../core/router.js';

const OVERLAY_ID = 'clientes-paywall-overlay';
let _bound = false;
const ICON_STROKE =
  'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

const ICONS = {
  cliente: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path ${ICON_STROKE} d="M20 21v-2a4 4 0 0 0-4-4h-1" />
    <path ${ICON_STROKE} d="M4 21v-2a4 4 0 0 1 4-4h1" />
    <circle ${ICON_STROKE} cx="12" cy="8" r="4" />
  </svg>`,
  setor: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path ${ICON_STROKE} d="M3 10.5 12 3l9 7.5" />
    <path ${ICON_STROKE} d="M5 9.5V20h14V9.5" />
    <path ${ICON_STROKE} d="M10 20v-5h4v5" />
  </svg>`,
  relatorio: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path ${ICON_STROKE} d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path ${ICON_STROKE} d="M14 3v5h5" />
    <path ${ICON_STROKE} d="M9 13h6M9 17h6" />
  </svg>`,
  buscaCliente: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <circle ${ICON_STROKE} cx="10" cy="10" r="4.5" />
    <path ${ICON_STROKE} d="m21 21-5.4-5.4" />
    <path ${ICON_STROKE} d="M10 7.8v4.4M7.8 10h4.4" />
  </svg>`,
};

function close() {
  document.getElementById(OVERLAY_ID)?.remove();
}

function bindOnce() {
  if (_bound) return;
  _bound = true;
  document.addEventListener('click', (event) => {
    const btn = event.target.closest?.('[data-clientes-lock-action]');
    if (!btn) return;
    const action = btn.dataset.clientesLockAction;

    if (action === 'pricing') {
      event.preventDefault();
      close();
      goTo('pricing', { highlightPlan: btn.dataset.highlightPlan || 'plus' });
      return;
    }

    if (action === 'continue') {
      event.preventDefault();
      close();
      goTo('inicio');
    }
  });
}

function buildMarkup({ reason = 'client_limit', highlightPlan = 'plus', limit = 1 } = {}) {
  const isClientLimit = reason === 'client_limit';
  const badge = highlightPlan === 'plus' ? 'PLANO PLUS' : 'UPGRADE';
  const title = isClientLimit ? `Seu plano Free inclui ${limit} cliente` : 'Organize clientes';
  const subtitle = isClientLimit
    ? 'Voce ja usou o cliente incluido no Free. Para cadastrar mais clientes, faca upgrade para o Plus.'
    : 'Clientes ficam disponiveis em todos os planos. O upgrade libera mais capacidade para sua carteira.';
  const context = isClientLimit
    ? 'Cliente cadastrado no Free. Mais clientes estao disponiveis a partir do plano Plus.'
    : 'Continue organizando clientes conforme o limite do seu plano.';

  return `
    <div class="clientes-paywall" role="document">
      <section class="clientes-paywall__hero">
        <span class="clientes-paywall__hero-orb clientes-paywall__hero-orb--a"></span>
        <span class="clientes-paywall__hero-orb clientes-paywall__hero-orb--b"></span>
        <span class="clientes-paywall__badge">${badge}</span>

        <div class="clientes-paywall__mockup">
          <article class="clientes-paywall__mockup-card">
            <span class="clientes-paywall__mockup-icon clientes-paywall__mockup-icon--orange">${ICONS.cliente}</span>
            <span class="clientes-paywall__mockup-line clientes-paywall__mockup-line--lg"></span>
            <span class="clientes-paywall__mockup-line clientes-paywall__mockup-line--sm"></span>
          </article>
          <article class="clientes-paywall__mockup-card">
            <span class="clientes-paywall__mockup-icon clientes-paywall__mockup-icon--blue">${ICONS.setor}</span>
            <span class="clientes-paywall__mockup-line clientes-paywall__mockup-line--lg"></span>
            <span class="clientes-paywall__mockup-line clientes-paywall__mockup-line--sm"></span>
          </article>
          <article class="clientes-paywall__mockup-card">
            <span class="clientes-paywall__mockup-icon clientes-paywall__mockup-icon--teal">${ICONS.relatorio}</span>
            <span class="clientes-paywall__mockup-line clientes-paywall__mockup-line--lg"></span>
            <span class="clientes-paywall__mockup-line clientes-paywall__mockup-line--sm"></span>
          </article>
        </div>

        <h3 class="clientes-paywall__title" id="clientes-lock-title">${title}</h3>
        <p class="clientes-paywall__sub">${subtitle}</p>
      </section>

      <section class="clientes-paywall__context" aria-label="Contexto de bloqueio do recurso">
        ${context}
      </section>

      <section class="clientes-paywall__perks" aria-label="Beneficios do recurso Clientes">
        <article class="clientes-paywall__perk">
          <span class="clientes-paywall__perk-icon clientes-paywall__perk-icon--cyan" aria-hidden="true">${ICONS.buscaCliente}</span>
          <div class="clientes-paywall__perk-body">
            <div class="clientes-paywall__perk-title">Mais clientes</div>
          </div>
        </article>

        <article class="clientes-paywall__perk">
          <span class="clientes-paywall__perk-icon clientes-paywall__perk-icon--amber" aria-hidden="true">${ICONS.setor}</span>
          <div class="clientes-paywall__perk-body">
            <div class="clientes-paywall__perk-title">Equipamentos por cliente</div>
          </div>
        </article>

        <article class="clientes-paywall__perk">
          <span class="clientes-paywall__perk-icon clientes-paywall__perk-icon--teal" aria-hidden="true">${ICONS.relatorio}</span>
          <div class="clientes-paywall__perk-body">
            <div class="clientes-paywall__perk-title">Relatorios profissionais</div>
          </div>
        </article>
      </section>

      <section class="clientes-paywall__impact" aria-label="Impacto do recurso Clientes">
        <p>Voce mantem cliente, equipamento e historico no mesmo contexto.</p>
        <p>Voce evita misturar atendimentos de clientes diferentes.</p>
        <p>Voce continua trabalhando no mesmo fluxo de campo.</p>
      </section>

      <footer class="clientes-paywall__actions">
        <button type="button" class="clientes-paywall__cancel" data-clientes-lock-action="continue">
          Agora nao
        </button>
        <button type="button" class="clientes-paywall__upgrade" data-clientes-lock-action="pricing" data-highlight-plan="${highlightPlan}">
          Fazer upgrade para o Plus
        </button>
      </footer>

      <p class="clientes-paywall__trust">Sem contrato. Cancele quando quiser.</p>
    </div>`;
}

export const ClientesPaywallModal = {
  open(options = {}) {
    close();
    bindOnce();

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'clientes-paywall-overlay modal-overlay is-open';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.dataset.surface = 'paywall';
    overlay.setAttribute('aria-labelledby', 'clientes-lock-title');
    overlay.innerHTML = buildMarkup(options);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        close();
        goTo('inicio');
      }
    });

    document.body.appendChild(overlay);
  },
  close,
};
