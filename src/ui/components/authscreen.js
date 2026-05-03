import { Auth } from '../../core/auth.js';
import { Toast } from '../../core/toast.js';
import { trackEvent } from '../../core/telemetry.js';
import { runAsyncAction } from './actionFeedback.js';
import { PasswordRecoveryModal } from './passwordRecoveryModal.js';

const POST_AUTH_REDIRECT_KEY = 'cooltrack-post-auth-redirect';

function persistPostAuthRedirect(redirect) {
  if (!redirect?.route) return;
  localStorage.setItem(POST_AUTH_REDIRECT_KEY, JSON.stringify(redirect));
}

function focusFirstField(container, selector) {
  container.querySelector(selector)?.focus();
}

function getDefaultIntentOptions() {
  return {
    highlightCopy: 'Entrar com Google',
    source: 'auth-screen',
  };
}

function handleAuthSuccess(overlay, postAuthRedirect) {
  persistPostAuthRedirect(postAuthRedirect);
  overlay.remove();
}

/** Ativa o toggle de mostrar/esconder senha em todos os .auth-input-wrap dentro de um container */
function bindPasswordToggles(container) {
  container.querySelectorAll('.auth-input-wrap').forEach((wrap) => {
    const input = wrap.querySelector('input[type="password"], input.auth-pwd-input');
    const btn = wrap.querySelector('.auth-pwd-toggle');
    if (!input || !btn) return;

    btn.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
      btn.innerHTML = isHidden ? eyeOffSVG() : eyeSVG();
    });
  });
}

// Score 0–3: 0=vazia, 1=<8 chars (danger), 2=8+ sem dígito (warning), 3=8+ com dígito/símbolo (success)
// Cores aplicadas via CSS custom properties — resolvem automaticamente em light/dark.
function scorePassword(pw) {
  if (!pw) return { score: 0, label: '', color: 'var(--text-3)' };
  if (pw.length < 8) return { score: 1, label: 'Muito curta', color: 'var(--danger)' };
  const hasDigitOrSym = /[\d\W_]/.test(pw);
  if (!hasDigitOrSym) return { score: 2, label: 'Fraca', color: 'var(--warning)' };
  return { score: 3, label: 'Forte', color: 'var(--success)' };
}

function bindStrengthMeter(container) {
  const pwInput = container.querySelector('#signup-password');
  const meter = container.querySelector('#signup-strength');
  if (!pwInput || !meter) return;

  const segs = meter.querySelectorAll('.auth-strength__seg');
  const label = meter.querySelector('.auth-strength__label');

  const update = () => {
    const { score, label: text, color } = scorePassword(pwInput.value);
    segs.forEach((seg, i) => {
      seg.style.background = i < score ? color : 'rgba(255,255,255,0.06)';
    });
    label.textContent = text;
    label.style.color = color;
    meter.setAttribute('aria-valuenow', String(score));
    meter.setAttribute('aria-label', `Força da senha: ${text || 'vazia'}`);
  };

  pwInput.addEventListener('input', update);
  update();
}

function eyeSVG() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`;
}

function eyeOffSVG() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>`;
}

function passwordInputHTML(id, placeholder, autocomplete) {
  return `
    <div class="auth-input-wrap tw-relative tw-flex tw-items-center">
      <input class="auth-input auth-pwd-input auth-input-base tw-pr-11" id="${id}" type="password"
        placeholder="${placeholder}" autocomplete="${autocomplete}" />
      <button type="button" class="auth-pwd-toggle tw-absolute tw-right-2.5 tw-top-1/2 -tw-translate-y-1/2 tw-bg-transparent tw-border-0 tw-cursor-pointer tw-p-1 tw-text-landing-text-dim tw-flex tw-items-center tw-transition-colors tw-duration-150 hover:tw-text-landing-text-body" aria-label="Mostrar senha" tabindex="-1">
        ${eyeSVG()}
      </button>
    </div>`;
}

// Brand mark — simbolo oficial do CoolTrackPro alinhado a nova landing.
//
// Mesmo glyph "compass de floco" (4 eixos atravessados pelo centro + 8
// cabeças de seta apontando pra fora + ponto central) que vive em:
//  - `public/favicon.svg` (favicon do browser)
//  - `public/brand/favicon.svg` (asset path referenciado pelo briefing)
//  - `src/react/pages/landing/components/BrandMark.jsx` (versao React,
//    usada pela landing oficial)
//  - `public/legal/{privacidade,termos,lgpd}.html` (paginas legais)
//
// Tile externo gradient cyan→blue (mesma combinacao do header da landing
// nova: `linear-gradient(135deg, #006DFF 0%, #40C4FF 100%)`). Stroke
// branco. Substitui o tile amarelo + 3-axis snowflake anterior, que
// destoava da identidade do produto.
function brandIconHTML(size = 36) {
  const radius = Math.round(size * 0.28);
  return `
    <span style="display:inline-grid;place-items:center;width:${size}px;height:${size}px;border-radius:${radius}px;background:linear-gradient(135deg,#006DFF 0%,#40C4FF 100%);box-shadow:0 6px 18px rgba(21,155,255,0.35);flex-shrink:0" aria-hidden="true">
      <img src="/brand/favicon.svg" alt="" loading="eager" decoding="async" style="display:block;width:${Math.round(size * 0.64)}px;height:${Math.round(size * 0.64)}px" />
    </span>`;
}
const ICON_LOGO = brandIconHTML(36);
const ICON_LOGO_SM = brandIconHTML(24);

const ICON_SNOWFLAKE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
  <polyline points="9 5 12 2 15 5"/><polyline points="9 19 12 22 15 19"/>
  <polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/>
</svg>`;

const ICON_FILETEXT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <polyline points="14 2 14 8 20 8"/>
  <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
</svg>`;

const ICON_BELL = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
</svg>`;

const ICON_ARROW_RIGHT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
</svg>`;

// Google mark — colored official-style G (NOT monochrome, per spec)
const ICON_GOOGLE = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="display:block;flex-shrink:0">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>`;

export const AuthScreen = {
  show(options = {}) {
    const initialTab = options.initialTab === 'signup' ? 'signup' : 'signin';
    const postAuthRedirect = options.postAuthRedirect?.route ? options.postAuthRedirect : null;
    const intentOptions = getDefaultIntentOptions();
    const existing = document.getElementById('auth-overlay');
    if (existing) {
      focusFirstField(existing, '.auth-input');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.className =
      'auth-screen tw-fixed tw-inset-0 tw-z-[9000] tw-overflow-y-auto tw-text-landing-text-body auth-screen-bg auth-screen-grid';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'auth-title');

    overlay.innerHTML = `
      <div class="auth-stage tw-relative tw-z-[1] tw-mx-auto tw-min-h-screen tw-max-w-[1280px] tw-px-14 tw-pt-12 tw-pb-[72px] tw-grid tw-grid-cols-[1fr_460px_360px] tw-gap-x-14 tw-gap-y-8 tw-box-border max-xl:tw-grid-cols-[1fr_460px] max-xl:tw-px-8 max-xl:tw-pt-10 max-xl:tw-pb-[60px] max-auth-md:tw-grid-cols-1 max-auth-md:tw-px-5 max-auth-md:tw-pt-7 max-auth-md:tw-pb-14 max-auth-md:tw-gap-y-6">
      <!-- LEFT: Branding panel (role=complementary, NUNCA aria-hidden) -->
      <aside class="auth-brand tw-flex tw-flex-col tw-relative tw-box-border max-auth-md:tw-order-2 max-sm:tw-hidden" role="complementary">
        <div class="auth-brand__logo tw-flex tw-items-center tw-gap-3 tw-relative tw-z-[1]">
          ${ICON_LOGO}
          <span class="auth-brand__logo-text tw-text-xl tw-font-bold tw-text-white tw-tracking-[-0.01em]">CoolTrack</span>
          <span class="auth-brand__logo-badge tw-text-[11px] tw-font-bold tw-text-landing-cyan tw-tracking-[0.12em] tw-uppercase tw-bg-landing-cyan/10 tw-border tw-border-landing-cyan/[0.28] tw-px-[7px] tw-py-[3px] tw-rounded-[5px] tw-align-[2px]">PRO</span>
        </div>

        <!-- Pill de audiencia — qualifica em 1s "isso é pra mim". Dot
             cyan reforca o highlight visual sem icone semantico. -->
        <span class="auth-brand__audience tw-inline-flex tw-items-center tw-gap-2 tw-pl-2.5 tw-pr-3 tw-py-[7px] tw-bg-landing-cyan/[0.08] tw-border tw-border-landing-cyan/25 tw-rounded-full tw-text-xs tw-font-semibold tw-text-landing-cyan-soft tw-tracking-[0.10em] tw-uppercase tw-mt-8 tw-self-start tw-relative tw-z-[1]">
          <span class="auth-brand__audience-dot tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-landing-cyan tw-shadow-[0_0_10px_#40C4FF]" aria-hidden="true"></span>
          Para climatização e refrigeração
        </span>

        <h1 class="auth-brand__headline tw-text-[44px] tw-font-bold tw-text-white tw-leading-[1.04] tw-tracking-[-0.02em] tw-mt-7 tw-mb-4 tw-max-w-[520px] [text-wrap:pretty] tw-relative tw-z-[1] max-auth-md:tw-text-[32px] max-auth-md:tw-mt-[18px]">
          Do serviço ao PDF, direto do celular.
        </h1>
        <p class="auth-brand__sub tw-text-base tw-text-[#b9c8dd] tw-leading-[1.55] tw-m-0 tw-max-w-[480px] tw-relative tw-z-[1] max-auth-md:tw-text-[14.5px]">
          Cadastre o equipamento, registre o serviço e envie o relatório no
          WhatsApp em menos de 1 minuto — sem sair do local.
        </p>

        <div class="auth-brand__features tw-flex tw-flex-col tw-gap-[18px] tw-mt-9 tw-max-w-[480px] tw-relative tw-z-[1] max-auth-md:tw-mt-6 max-auth-md:tw-gap-[14px]">
          <div class="auth-brand__feat tw-flex tw-items-start tw-gap-[14px]">
            <div class="auth-brand__feat-icon tw-w-[38px] tw-h-[38px] tw-rounded-[10px] tw-shrink-0 [background:linear-gradient(180deg,rgba(44,124,255,0.18),rgba(44,124,255,0.06))] tw-border tw-border-[#4d93ff]/30 tw-text-landing-cyan-soft tw-flex tw-items-center tw-justify-center">${ICON_SNOWFLAKE}</div>
            <div>
              <div class="auth-brand__feat-title tw-text-[14.5px] tw-font-semibold tw-text-white tw-mt-0.5 tw-mb-1">Cadastro por foto da placa</div>
              <div class="auth-brand__feat-desc tw-text-[13px] tw-font-normal tw-text-landing-text-mute tw-leading-[1.5]">Tire foto, a IA preenche modelo, marca e dados técnicos.</div>
            </div>
          </div>
          <div class="auth-brand__feat tw-flex tw-items-start tw-gap-[14px]">
            <div class="auth-brand__feat-icon tw-w-[38px] tw-h-[38px] tw-rounded-[10px] tw-shrink-0 [background:linear-gradient(180deg,rgba(44,124,255,0.18),rgba(44,124,255,0.06))] tw-border tw-border-[#4d93ff]/30 tw-text-landing-cyan-soft tw-flex tw-items-center tw-justify-center">${ICON_FILETEXT}</div>
            <div>
              <div class="auth-brand__feat-title tw-text-[14.5px] tw-font-semibold tw-text-white tw-mt-0.5 tw-mb-1">Checklist rápido do serviço</div>
              <div class="auth-brand__feat-desc tw-text-[13px] tw-font-normal tw-text-landing-text-mute tw-leading-[1.5]">Preventiva, corretiva, limpeza, carga de gás — em segundos.</div>
            </div>
          </div>
          <div class="auth-brand__feat tw-flex tw-items-start tw-gap-[14px]">
            <div class="auth-brand__feat-icon tw-w-[38px] tw-h-[38px] tw-rounded-[10px] tw-shrink-0 [background:linear-gradient(180deg,rgba(44,124,255,0.18),rgba(44,124,255,0.06))] tw-border tw-border-[#4d93ff]/30 tw-text-landing-cyan-soft tw-flex tw-items-center tw-justify-center">${ICON_BELL}</div>
            <div>
              <div class="auth-brand__feat-title tw-text-[14.5px] tw-font-semibold tw-text-white tw-mt-0.5 tw-mb-1">PDF no WhatsApp em um toque</div>
              <div class="auth-brand__feat-desc tw-text-[13px] tw-font-normal tw-text-landing-text-mute tw-leading-[1.5]">Relatório pronto com sua logo, fotos e assinatura do cliente.</div>
            </div>
          </div>
        </div>

        <div class="auth-brand__stats tw-mt-14 tw-pt-7 tw-border-t tw-border-landing-border-base/10 tw-flex tw-gap-14 tw-max-w-[520px] tw-relative tw-z-[1] max-auth-md:tw-mt-7 max-auth-md:tw-gap-7">
          <div>
            <div class="auth-brand__stat-num tw-text-[28px] tw-font-bold tw-text-landing-cyan tw-tracking-[-0.02em] tw-leading-none max-auth-md:tw-text-[22px]">&lt;1 min</div>
            <div class="auth-brand__stat-label tw-mt-1.5 tw-text-[11px] tw-font-semibold tw-text-landing-text-dim tw-tracking-[0.12em] tw-uppercase">Relatório pronto</div>
          </div>
          <div>
            <div class="auth-brand__stat-num tw-text-[28px] tw-font-bold tw-text-landing-cyan tw-tracking-[-0.02em] tw-leading-none max-auth-md:tw-text-[22px]">&infin;</div>
            <div class="auth-brand__stat-label tw-mt-1.5 tw-text-[11px] tw-font-semibold tw-text-landing-text-dim tw-tracking-[0.12em] tw-uppercase">Equipamentos no Pro</div>
          </div>
          <div>
            <div class="auth-brand__stat-num is-alt tw-text-[28px] tw-font-bold tw-text-white tw-tracking-[-0.02em] tw-leading-none max-auth-md:tw-text-[22px]">100%</div>
            <div class="auth-brand__stat-label tw-mt-1.5 tw-text-[11px] tw-font-semibold tw-text-landing-text-dim tw-tracking-[0.12em] tw-uppercase">Funciona offline</div>
          </div>
        </div>
      </aside>

      <!-- RIGHT: Form panel -->
      <main class="auth-form-panel tw-flex tw-items-start tw-justify-center tw-box-border tw-pt-7 max-auth-md:tw-order-1 max-auth-md:tw-pt-0" aria-labelledby="auth-title">
        <div class="auth-card auth-card-bg auth-card-glow tw-relative tw-w-full tw-max-w-[460px] tw-px-7 tw-pt-[26px] tw-pb-6 tw-rounded-[22px] max-sm:tw-px-[22px] max-sm:tw-pt-[22px] max-sm:tw-pb-5">

          <!-- Mobile-only logo (mesma marca cyan/blue do header desktop) -->
          <div class="auth-card-header tw-hidden max-sm:tw-block tw-text-center tw-mb-[18px]">
            <div class="auth-card-header__brand tw-inline-flex tw-items-center tw-gap-2.5 tw-mb-2">
              ${ICON_LOGO_SM}
              <span id="auth-title" class="tw-text-lg tw-font-bold tw-text-white">CoolTrack</span>
              <span class="auth-brand__logo-badge tw-text-[11px] tw-font-bold tw-text-landing-cyan tw-tracking-[0.12em] tw-uppercase tw-bg-landing-cyan/10 tw-border tw-border-landing-cyan/[0.28] tw-px-[7px] tw-py-[3px] tw-rounded-[5px] tw-align-[2px]">PRO</span>
            </div>
            <div class="auth-card-header__sub tw-text-[13px] tw-text-landing-text-mute tw-leading-[1.5]">Do serviço ao PDF, direto do celular.</div>
          </div>

          <!-- Tabs -->
          <div class="auth-tabs auth-tab-pill tw-flex tw-gap-1 tw-p-1 tw-rounded-xl tw-mb-[22px]" role="tablist" aria-label="Acesso">
            <button class="auth-tab active tw-flex-1 tw-px-3 tw-py-2.5 tw-cursor-pointer tw-bg-transparent tw-text-landing-text-dim tw-text-sm tw-font-semibold tw-rounded-[9px] tw-transition-[background,color,border-color] tw-duration-150 tw-border-0" id="tab-signin" type="button" role="tab" aria-selected="true" aria-controls="auth-form-signin">Entrar</button>
            <button class="auth-tab tw-flex-1 tw-px-3 tw-py-2.5 tw-cursor-pointer tw-bg-transparent tw-text-landing-text-dim tw-text-sm tw-font-semibold tw-rounded-[9px] tw-transition-[background,color,border-color] tw-duration-150 tw-border-0" id="tab-signup" type="button" role="tab" aria-selected="false" aria-controls="auth-form-signup">Criar conta</button>
          </div>

          <!-- Sign In panel -->
          <div id="auth-form-signin" role="tabpanel" aria-labelledby="tab-signin">
            <button class="auth-btn-google auth-google-base" id="btn-google-signin" type="button">
              ${ICON_GOOGLE}
              ${intentOptions.highlightCopy}
            </button>
            <div class="auth-divider tw-grid tw-grid-cols-[1fr_auto_1fr] tw-items-center tw-gap-3 tw-mt-[18px] tw-mb-4 tw-text-[11.5px] tw-text-landing-text-dim tw-tracking-[0.06em] before:tw-content-[''] before:tw-h-px before:tw-bg-landing-border-base/10 after:tw-content-[''] after:tw-h-px after:tw-bg-landing-border-base/10">ou entre com email e senha</div>
            <label class="auth-label auth-label--first auth-label-base auth-label-base--first" for="signin-email">Email</label>
            <input class="auth-input auth-input-base" id="signin-email" type="email" placeholder="seu@email.com" autocomplete="email" />
            <label class="auth-label auth-label-base" for="signin-password">Senha</label>
            ${passwordInputHTML('signin-password', 'senha', 'current-password')}
            <button class="auth-btn auth-btn--secondary auth-btn-base auth-btn-base--secondary" id="btn-signin" type="button">Entrar no app ${ICON_ARROW_RIGHT}</button>

            <div class="auth-trust-line tw-flex tw-items-center tw-justify-center tw-gap-[22px] tw-flex-wrap tw-mt-3.5 tw-mb-4 tw-text-[12.5px] tw-text-landing-text-mute">
              <span class="auth-trust-line__item tw-inline-flex tw-items-center tw-gap-1.5 [&_svg]:tw-text-landing-cyan">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                Sem cartão
              </span>
              <span class="auth-trust-line__item tw-inline-flex tw-items-center tw-gap-1.5 [&_svg]:tw-text-landing-cyan">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
                </svg>
                Funciona offline
              </span>
              <span class="auth-trust-line__item tw-inline-flex tw-items-center tw-gap-1.5 [&_svg]:tw-text-landing-cyan">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
                </svg>
                Acesso imediato
              </span>
            </div>

            <div class="auth-trust-card auth-trust-card-bg tw-flex tw-items-center tw-gap-3 tw-mb-3.5 tw-px-3.5 tw-py-3 tw-rounded-xl">
              <div class="auth-trust-card__icon auth-trust-card-icon-bg tw-w-8 tw-h-8 tw-rounded-[9px] tw-grid tw-place-items-center tw-text-[#5fe5ad] tw-shrink-0" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div>
                <div class="auth-trust-card__title tw-text-[13.5px] tw-font-semibold tw-text-[#cdf3e0] tw-leading-[1.3]">Acesso seguro e criptografado</div>
                <div class="auth-trust-card__sub tw-text-xs tw-text-[#8fc8a9] tw-mt-px">Seus dados sempre protegidos.</div>
              </div>
            </div>

            <div class="auth-actions-center tw-text-center tw-mt-1 tw-mb-3.5">
              <button class="auth-btn-forgot tw-bg-transparent tw-border-0 tw-cursor-pointer tw-text-[13px] tw-font-normal tw-text-landing-text-body tw-px-2 tw-py-1 tw-border-b tw-border-b-[#b9c8dd]/[0.22] tw-rounded-none tw-transition-colors tw-duration-150 hover:tw-text-white hover:tw-border-b-landing-cyan/60" id="btn-forgot" type="button">Esqueci minha senha</button>
            </div>

            <div class="auth-social-proof tw-flex tw-items-center tw-gap-3 tw-mt-1.5 tw-py-3 tw-px-3.5 tw-rounded-xl tw-bg-[#081822]/60 tw-border tw-border-landing-border-base/10">
              <div class="auth-social-proof__avatars tw-flex tw-shrink-0" aria-hidden="true">
                <span class="auth-social-proof__avatar tw-w-[26px] tw-h-[26px] tw-rounded-full tw-border-2 tw-border-[#0a1a31] tw-flex tw-items-center tw-justify-center tw-text-white tw-text-[11px] tw-font-bold first:tw-ml-0 -tw-ml-2" style="background:linear-gradient(135deg,#00c8e8,#0096b4)">CR</span>
                <span class="auth-social-proof__avatar tw-w-[26px] tw-h-[26px] tw-rounded-full tw-border-2 tw-border-[#0a1a31] tw-flex tw-items-center tw-justify-center tw-text-white tw-text-[11px] tw-font-bold first:tw-ml-0 -tw-ml-2" style="background:linear-gradient(135deg,#2c7cff,#40c4ff)">FR</span>
                <span class="auth-social-proof__avatar tw-w-[26px] tw-h-[26px] tw-rounded-full tw-border-2 tw-border-[#0a1a31] tw-flex tw-items-center tw-justify-center tw-text-white tw-text-[11px] tw-font-bold first:tw-ml-0 -tw-ml-2" style="background:linear-gradient(135deg,#5fe6b3,#1fa370)">LO</span>
              </div>
              <div class="auth-social-proof__text tw-flex-1 tw-min-w-0">
                <div class="auth-social-proof__num tw-text-[13.5px] tw-font-semibold tw-text-white tw-leading-[1.2]">+500 relatórios já gerados</div>
                <div class="auth-social-proof__label tw-text-xs tw-text-landing-text-mute tw-mt-0.5">Beta em produção · técnicos ativos no Brasil</div>
              </div>
            </div>
          </div>

          <!-- Sign Up panel -->
          <div id="auth-form-signup" role="tabpanel" aria-labelledby="tab-signup" hidden>
            <button class="auth-btn-google auth-google-base" id="btn-google-signup" type="button">
              ${ICON_GOOGLE}
              Criar conta com Google
            </button>
            <div class="auth-divider tw-grid tw-grid-cols-[1fr_auto_1fr] tw-items-center tw-gap-3 tw-mt-[18px] tw-mb-4 tw-text-[11.5px] tw-text-landing-text-dim tw-tracking-[0.06em] before:tw-content-[''] before:tw-h-px before:tw-bg-landing-border-base/10 after:tw-content-[''] after:tw-h-px after:tw-bg-landing-border-base/10">ou crie sua conta com email e senha</div>
            <label class="auth-label auth-label--first auth-label-base auth-label-base--first" for="signup-nome">Seu nome</label>
            <input class="auth-input auth-input-base" id="signup-nome" type="text" placeholder="Carlos Figueiredo" autocomplete="name" />
            <label class="auth-label auth-label-base" for="signup-email">Email</label>
            <input class="auth-input auth-input-base" id="signup-email" type="email" placeholder="seu@email.com" autocomplete="email" />
            <label class="auth-label auth-label-base" for="signup-password">Senha</label>
            ${passwordInputHTML('signup-password', 'mínimo 8 caracteres', 'new-password')}
            <div class="auth-strength tw-flex tw-items-center tw-gap-2.5 tw-mt-2" id="signup-strength" role="progressbar"
                 aria-live="polite" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0">
              <div class="auth-strength__bars tw-flex tw-gap-1 tw-flex-1">
                <div class="auth-strength__seg auth-strength-seg-empty tw-flex-1 tw-h-1 tw-rounded-sm tw-transition-colors tw-duration-150"></div>
                <div class="auth-strength__seg auth-strength-seg-empty tw-flex-1 tw-h-1 tw-rounded-sm tw-transition-colors tw-duration-150"></div>
                <div class="auth-strength__seg auth-strength-seg-empty tw-flex-1 tw-h-1 tw-rounded-sm tw-transition-colors tw-duration-150"></div>
              </div>
              <div class="auth-strength__label tw-text-[11px] tw-font-medium tw-min-w-[68px] tw-text-right tw-text-landing-text-dim">&nbsp;</div>
            </div>
            <label class="auth-label auth-label-base" for="signup-confirm">Confirmar senha</label>
            ${passwordInputHTML('signup-confirm', 'repita a senha', 'new-password')}
            <button class="auth-btn auth-btn--secondary auth-btn-base auth-btn-base--secondary" id="btn-signup" type="button">Começar gratuitamente ${ICON_ARROW_RIGHT}</button>
            <div class="auth-hint tw-text-xs tw-font-normal tw-text-landing-text-dim tw-text-center tw-mt-3.5 tw-leading-[1.5]">Grátis pra sempre · Sem cartão · PDF com marca d'água no free</div>
          </div>

        </div>
      </main>

      <!-- Phone mockup aside (decorativo, aria-hidden=true) — versao
           rica do app com dados ficticios. Visual only. -->
      <aside class="auth-phone-aside tw-flex tw-flex-col tw-items-center tw-pt-7 tw-relative tw-box-border max-xl:tw-hidden" aria-hidden="true">
        <div class="auth-phone auth-phone-bg auth-phone-notch tw-w-80 tw-h-[640px] tw-p-3 tw-rounded-[44px] tw-relative">
          <div class="auth-phone__screen auth-phone-screen-bg tw-w-full tw-h-full tw-rounded-[34px] tw-pt-11 tw-px-4 tw-pb-3.5 tw-relative tw-overflow-hidden tw-box-border">
            <div class="auth-phone__topbar tw-flex tw-items-center tw-gap-[7px] tw-mb-3.5">
              <span class="auth-phone__topbar-brand tw-inline-flex tw-items-center tw-gap-[7px] tw-text-[13px] tw-font-bold tw-text-white">
                ${brandIconHTML(22)} CoolTrack
              </span>
              <span class="auth-phone__topbar-pro tw-text-[9px] tw-font-bold tw-text-landing-cyan tw-tracking-[0.12em] tw-bg-landing-cyan/[0.12] tw-border tw-border-landing-cyan/[0.28] tw-px-[5px] tw-py-0.5 tw-rounded">PRO</span>
              <span class="auth-phone__topbar-spacer tw-flex-1"></span>
              <span class="auth-phone__sync-pill tw-inline-flex tw-items-center tw-gap-[5px] tw-text-[9.5px] tw-font-semibold tw-text-[#5fe5ad] tw-bg-landing-green-online/10 tw-border tw-border-landing-green-online/30 tw-px-2 tw-py-1 tw-rounded-full">
                <span class="auth-phone__sync-dot tw-w-[5px] tw-h-[5px] tw-rounded-full tw-bg-landing-green-online tw-shadow-[0_0_6px_#2ecc8b]"></span> 5 técnicos
              </span>
            </div>

            <div class="auth-phone__hero auth-phone-hero-bg tw-px-[13px] tw-py-3 tw-rounded-[14px] tw-mb-2.5">
              <div class="auth-phone__greeting tw-text-sm tw-font-bold tw-text-white">Olá, Carlos 👋</div>
              <div class="auth-phone__sub tw-text-[11px] tw-text-landing-text-mute tw-mt-0.5">Seu parque está saudável.</div>
              <span class="auth-phone__status-pill tw-inline-flex tw-items-center tw-gap-[5px] tw-mt-2 tw-px-2 tw-py-1 tw-bg-landing-green-online/[0.12] tw-border tw-border-landing-green-online/30 tw-rounded-full tw-text-[10px] tw-font-bold tw-text-[#5fe5ad] tw-tracking-[0.06em] [&_svg]:tw-w-2.5 [&_svg]:tw-h-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                TUDO OPERANDO
              </span>
            </div>

            <div class="auth-phone__kpis tw-grid tw-grid-cols-2 tw-gap-2 tw-mb-2.5">
              <div class="auth-phone__kpi auth-phone-kpi-bg tw-px-[11px] tw-py-2.5 tw-rounded-xl">
                <div class="auth-phone__kpi-label tw-text-[9.5px] tw-font-bold tw-text-landing-text-dim tw-tracking-[0.10em] tw-uppercase">Equipamentos</div>
                <div class="auth-phone__kpi-value tw-text-lg tw-font-bold tw-text-white tw-mt-0.5 tw-tracking-[-0.02em] tw-leading-none [&_em]:tw-not-italic [&_em]:tw-text-landing-cyan">12<em>/12</em></div>
                <div class="auth-phone__kpi-sub tw-text-[10px] tw-text-landing-text-dim tw-mt-px">ativos</div>
              </div>
              <div class="auth-phone__kpi auth-phone-kpi-bg tw-px-[11px] tw-py-2.5 tw-rounded-xl">
                <div class="auth-phone__kpi-label tw-text-[9.5px] tw-font-bold tw-text-landing-text-dim tw-tracking-[0.10em] tw-uppercase">Eficiência</div>
                <div class="auth-phone__kpi-value tw-text-lg tw-font-bold tw-text-white tw-mt-0.5 tw-tracking-[-0.02em] tw-leading-none [&_em]:tw-not-italic [&_em]:tw-text-landing-cyan">96<em>%</em></div>
                <div class="auth-phone__kpi-sub tw-text-[10px] tw-text-landing-text-dim tw-mt-px">excelente</div>
              </div>
            </div>

            <div class="auth-phone__card auth-phone-card-bg tw-px-[11px] tw-py-2.5 tw-rounded-xl tw-mb-2">
              <div class="auth-phone__card-label tw-text-[9.5px] tw-font-bold tw-text-landing-text-dim tw-tracking-[0.10em] tw-uppercase tw-mb-[3px]">Próximo serviço</div>
              <div class="auth-phone__card-title tw-text-[13px] tw-font-semibold tw-text-white tw-mb-px">Limpeza preventiva</div>
              <div class="auth-phone__card-meta tw-text-[10.5px] tw-text-landing-text-mute">Climatec Norte · Sala 07 · 19/05</div>
            </div>

            <div class="auth-phone__card is-alt auth-phone-card-bg--alt tw-px-[11px] tw-py-2.5 tw-rounded-xl tw-mb-2">
              <div class="auth-phone__card-label tw-text-[9.5px] tw-font-bold tw-text-landing-text-dim tw-tracking-[0.10em] tw-uppercase tw-mb-[3px]">Último serviço</div>
              <div class="auth-phone__card-title tw-text-[13px] tw-font-semibold tw-text-white tw-mb-px">Limpeza de filtros</div>
              <div class="auth-phone__card-meta tw-text-[10.5px] tw-text-landing-text-mute">há 2 dias · 12:55</div>
            </div>

            <div class="auth-phone__bottom-nav auth-phone-nav-bg tw-absolute tw-bottom-3 tw-left-3 tw-right-3 tw-h-12 tw-grid tw-grid-cols-4 tw-items-center tw-justify-items-center tw-rounded-[14px]">
              <span class="auth-phone__nav-item is-active tw-flex tw-flex-col tw-items-center tw-gap-0.5 tw-text-[9px] tw-font-semibold tw-text-center [&_svg]:tw-w-4 [&_svg]:tw-h-4 [&_svg]:tw-block [&_svg]:tw-mx-auto [&_svg]:tw-mb-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                Painel
              </span>
              <span class="auth-phone__nav-item tw-flex tw-flex-col tw-items-center tw-gap-0.5 tw-text-[9px] tw-font-semibold tw-text-landing-text-dim tw-text-center [&_svg]:tw-w-4 [&_svg]:tw-h-4 [&_svg]:tw-block [&_svg]:tw-mx-auto [&_svg]:tw-mb-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
                Parque
              </span>
              <span class="auth-phone__nav-item tw-flex tw-flex-col tw-items-center tw-gap-0.5 tw-text-[9px] tw-font-semibold tw-text-landing-text-dim tw-text-center [&_svg]:tw-w-4 [&_svg]:tw-h-4 [&_svg]:tw-block [&_svg]:tw-mx-auto [&_svg]:tw-mb-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                Serviços
              </span>
              <span class="auth-phone__nav-item tw-flex tw-flex-col tw-items-center tw-gap-0.5 tw-text-[9px] tw-font-semibold tw-text-landing-text-dim tw-text-center [&_svg]:tw-w-4 [&_svg]:tw-h-4 [&_svg]:tw-block [&_svg]:tw-mx-auto [&_svg]:tw-mb-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                Clientes
              </span>
            </div>
          </div>
        </div>

        <p class="auth-phone__caption tw-mt-[22px] tw-mx-auto tw-text-center tw-text-[12.5px] tw-text-landing-text-mute tw-leading-[1.55] tw-max-w-[280px] [&_strong]:tw-text-white [&_strong]:tw-font-semibold">
          Veja seu parque inteiro <strong>em tempo real</strong>, registre e envie em segundos.
        </p>
      </aside>

      <!-- Footer discreto: copy + links legais internos (mesma aba) +
           status. Links apontam pra /legal/*.html (paginas estaticas
           ja existentes) e pro hash #contato da landing como destino
           de "Suporte". -->
      <footer class="auth-footer tw-col-span-full tw-flex tw-items-center tw-justify-between tw-gap-4 tw-flex-wrap tw-mt-6 tw-pt-5 tw-border-t tw-border-landing-border-base/10 tw-text-xs tw-text-landing-text-dim tw-relative tw-z-[1] max-sm:tw-flex-col max-sm:tw-items-start max-sm:tw-gap-2" aria-label="Rodapé">
        <span class="auth-footer__brand-line tw-inline-flex tw-items-center tw-gap-[14px] tw-flex-wrap">
          <span class="auth-footer__brand tw-text-landing-text-mute">CoolTrackPro © 2026</span>
          <span class="auth-footer__sep tw-inline-block tw-w-px tw-h-3 tw-bg-landing-border-base/[0.18]" aria-hidden="true"></span>
          <a class="auth-footer__link tw-text-landing-text-dim tw-no-underline tw-border-b tw-border-b-transparent tw-pb-px tw-transition-colors tw-duration-150 hover:tw-text-landing-text-body" href="/legal/termos.html">Termos</a>
          <span class="auth-footer__sep tw-inline-block tw-w-px tw-h-3 tw-bg-landing-border-base/[0.18]" aria-hidden="true"></span>
          <a class="auth-footer__link tw-text-landing-text-dim tw-no-underline tw-border-b tw-border-b-transparent tw-pb-px tw-transition-colors tw-duration-150 hover:tw-text-landing-text-body" href="/legal/privacidade.html">Privacidade</a>
          <span class="auth-footer__sep tw-inline-block tw-w-px tw-h-3 tw-bg-landing-border-base/[0.18]" aria-hidden="true"></span>
          <a class="auth-footer__link tw-text-landing-text-dim tw-no-underline tw-border-b tw-border-b-transparent tw-pb-px tw-transition-colors tw-duration-150 hover:tw-text-landing-text-body" href="/#contato">Suporte</a>
        </span>
        <span class="auth-footer__status tw-inline-flex tw-items-center tw-gap-1.5 tw-text-landing-text-mute">
          <span class="auth-footer__status-dot tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-landing-green-online tw-shadow-[0_0_8px_#2ecc8b]" aria-hidden="true"></span>
          Status: todos os sistemas operacionais
        </span>
      </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    bindPasswordToggles(overlay);
    bindStrengthMeter(overlay);

    // Tabs
    const tabSignin = overlay.querySelector('#tab-signin');
    const tabSignup = overlay.querySelector('#tab-signup');
    const formSignin = overlay.querySelector('#auth-form-signin');
    const formSignup = overlay.querySelector('#auth-form-signup');
    const switchTab = (which) => {
      const isSignin = which === 'signin';
      tabSignin.classList.toggle('active', isSignin);
      tabSignup.classList.toggle('active', !isSignin);
      tabSignin.setAttribute('aria-selected', String(isSignin));
      tabSignup.setAttribute('aria-selected', String(!isSignin));
      formSignin.hidden = !isSignin;
      formSignup.hidden = isSignin;
      focusFirstField(isSignin ? formSignin : formSignup, '.auth-input');
    };
    tabSignin.addEventListener('click', () => switchTab('signin'));
    tabSignup.addEventListener('click', () => switchTab('signup'));
    if (initialTab === 'signup') switchTab('signup');

    // Sign In
    overlay.querySelector('#btn-signin').addEventListener('click', async (e) => {
      const email = overlay.querySelector('#signin-email').value.trim();
      const password = overlay.querySelector('#signin-password').value;
      if (!email || !password) {
        Toast.warning('Preencha email e senha pra entrar.');
        return;
      }
      await runAsyncAction(e.currentTarget, { loadingLabel: 'Entrando...' }, async () => {
        try {
          const user = await Auth.signIn(email, password);
          if (!user) throw new Error('AUTH_SIGNIN_FAILED');
          trackEvent('auth_signin_success', { method: 'email' });
          handleAuthSuccess(overlay, postAuthRedirect);
        } catch (err) {
          trackEvent('auth_signin_failed', { method: 'email' });
          Toast.error(err?.message || 'Não foi possível entrar. Verifique email e senha.');
        }
      });
    });

    // Sign Up
    overlay.querySelector('#btn-signup').addEventListener('click', async (e) => {
      const nome = overlay.querySelector('#signup-nome').value.trim();
      const email = overlay.querySelector('#signup-email').value.trim();
      const password = overlay.querySelector('#signup-password').value;
      const confirm = overlay.querySelector('#signup-confirm').value;
      if (!nome || !email || !password) {
        Toast.warning('Preencha nome, email e senha.');
        return;
      }
      if (password.length < 8) {
        Toast.warning('A senha precisa ter pelo menos 8 caracteres.');
        return;
      }
      if (password !== confirm) {
        Toast.warning('As senhas não conferem.');
        return;
      }
      await runAsyncAction(e.currentTarget, { loadingLabel: 'Criando...' }, async () => {
        try {
          const user = await Auth.signUp(email, password, { nome });
          if (!user) throw new Error('AUTH_SIGNUP_FAILED');
          trackEvent('auth_signup_success', { method: 'email' });
          handleAuthSuccess(overlay, postAuthRedirect);
        } catch (err) {
          trackEvent('auth_signup_failed', { method: 'email' });
          Toast.error(err?.message || 'Não foi possível criar a conta.');
        }
      });
    });

    // Google
    const googleHandler = (mode) => async (e) => {
      await runAsyncAction(e.currentTarget, { loadingLabel: 'Abrindo Google...' }, async () => {
        try {
          await Auth.signInWithGoogle();
          trackEvent(
            mode === 'signup' ? 'auth_signup_google_started' : 'auth_signin_google_started',
            {
              method: 'google',
            },
          );
        } catch (err) {
          Toast.error(err?.message || 'Não foi possível abrir o Google.');
        }
      });
    };
    overlay.querySelector('#btn-google-signin').addEventListener('click', googleHandler('signin'));
    overlay.querySelector('#btn-google-signup').addEventListener('click', googleHandler('signup'));

    // Forgot
    overlay.querySelector('#btn-forgot')?.addEventListener('click', () => {
      PasswordRecoveryModal.open();
    });

    focusFirstField(overlay, '.auth-input');
  },
};
