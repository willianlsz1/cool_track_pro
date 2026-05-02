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
    <div class="auth-input-wrap">
      <input class="auth-input auth-pwd-input" id="${id}" type="password"
        placeholder="${placeholder}" autocomplete="${autocomplete}" />
      <button type="button" class="auth-pwd-toggle" aria-label="Mostrar senha" tabindex="-1">
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
    overlay.className = 'auth-screen';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'auth-title');

    overlay.innerHTML = `
      <style>
        /* ─ Auth screen — alinhada a identidade da landing nova
           (React + Tailwind). Tokens visuais espelham
           tailwind.config.cjs > landing.* sempre que possivel.
           CSS scoped em .auth-screen — nao toca CSS legado.

           Paleta:
             navy 1:        #02143b
             navy 2:        #031B4E
             navy deep:     #03080f / #061226
             card:          rgba(15,33,60,0.95) → rgba(8,22,42,0.92)
             border line:   rgba(120,170,230,0.10/0.18)
             cyan:          #40C4FF (landing.cyan)
             cyan soft:     #67E8F9
             blue:          #006DFF / #2c7cff (landing.blue)
             blue light:    #4d93ff
             text head:     #ffffff
             text body:     #cdd9ee
             text mute:     #94a8c8
             text dim:      #6b80a3
             ok:            #2ecc8b */
        .auth-screen {
          position: fixed; inset: 0; z-index: 9000;
          overflow-y: auto;
          font-family: var(--font, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
          color: #cdd9ee;
          background:
            radial-gradient(1200px 600px at 18% -10%, rgba(44,124,255,0.18), transparent 60%),
            radial-gradient(900px 600px at 95% 10%, rgba(64,196,255,0.10), transparent 65%),
            radial-gradient(700px 500px at 50% 110%, rgba(44,124,255,0.10), transparent 60%),
            linear-gradient(180deg, #05101f 0%, #040b18 60%, #03080f 100%);
        }
        .auth-screen::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(120,170,230,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120,170,230,0.05) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%);
          pointer-events: none;
          z-index: 0;
        }
        .auth-screen button:focus-visible,
        .auth-screen input:focus-visible,
        .auth-screen [role="tab"]:focus-visible,
        .auth-screen a:focus-visible {
          outline: 2px solid #40C4FF; outline-offset: 2px;
        }

        .auth-stage {
          position: relative; z-index: 1;
          max-width: 1280px; min-height: 100vh;
          margin: 0 auto;
          padding: 48px 56px 72px;
          display: grid;
          grid-template-columns: 1fr 460px 360px;
          column-gap: 56px;
          row-gap: 32px;
          box-sizing: border-box;
        }

        /* ─ Left brand panel ─ */
        .auth-brand {
          display: flex; flex-direction: column;
          padding: 0;
          background: transparent;
          border: 0;
          position: relative;
          box-sizing: border-box;
        }
        .auth-brand::before, .auth-brand::after { content: none; }

        .auth-brand__logo {
          display: flex; align-items: center; gap: 12px;
          position: relative; z-index: 1;
        }
        .auth-brand__logo-text {
          font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;
        }
        .auth-brand__logo-badge {
          font-size: 11px; font-weight: 700; color: #40C4FF;
          letter-spacing: 0.12em; text-transform: uppercase;
          background: rgba(64,196,255,0.10);
          border: 1px solid rgba(64,196,255,0.28);
          padding: 3px 7px; border-radius: 5px;
          vertical-align: 2px;
        }

        .auth-brand__headline {
          font-size: 44px; font-weight: 700; color: #ffffff;
          line-height: 1.04; letter-spacing: -0.02em;
          margin: 28px 0 16px;
          max-width: 520px;
          text-wrap: pretty;
          position: relative; z-index: 1;
        }
        .auth-brand__sub {
          font-size: 16px; color: #b9c8dd; line-height: 1.55;
          margin: 0; max-width: 480px;
          position: relative; z-index: 1;
        }

        .auth-brand__features {
          display: flex; flex-direction: column; gap: 18px;
          margin-top: 36px;
          max-width: 480px;
          position: relative; z-index: 1;
        }
        .auth-brand__feat {
          display: flex; align-items: flex-start; gap: 14px;
        }
        .auth-brand__feat-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(180deg, rgba(44,124,255,0.18), rgba(44,124,255,0.06));
          border: 1px solid rgba(77,147,255,0.30);
          color: #67E8F9;
          display: flex; align-items: center; justify-content: center;
        }
        .auth-brand__feat-title {
          font-size: 14.5px; font-weight: 600; color: #ffffff; margin: 2px 0 4px;
        }
        .auth-brand__feat-desc {
          font-size: 13px; font-weight: 400; color: #94a8c8; line-height: 1.5;
        }
        .auth-brand__feat-desc strong { color: #cdd9ee; font-weight: 500; }

        .auth-brand__stats {
          margin-top: 56px;
          padding-top: 28px;
          border-top: 1px solid rgba(120,170,230,0.10);
          display: flex; gap: 56px;
          max-width: 520px;
          position: relative; z-index: 1;
        }
        .auth-brand__stat-num {
          font-size: 28px; font-weight: 700; color: #40C4FF;
          letter-spacing: -0.02em; line-height: 1;
        }
        .auth-brand__stat-num.is-alt { color: #ffffff; }
        .auth-brand__stat-label {
          margin-top: 6px;
          font-size: 11px; font-weight: 600; color: #6b80a3;
          letter-spacing: 0.12em; text-transform: uppercase;
        }

        /* ─ Center form panel ─ */
        .auth-form-panel {
          display: flex; align-items: flex-start; justify-content: center;
          padding: 0;
          background: transparent;
          box-sizing: border-box;
          padding-top: 28px;
        }
        .auth-card {
          position: relative;
          width: 100%; max-width: 460px;
          padding: 26px 28px 24px;
          background: linear-gradient(180deg, rgba(15,33,60,0.95) 0%, rgba(8,22,42,0.92) 100%);
          border: 1px solid rgba(120,170,230,0.18);
          border-radius: 22px;
          box-shadow:
            0 30px 80px rgba(0,0,0,0.55),
            0 0 0 1px rgba(120,170,230,0.04) inset,
            0 1px 0 rgba(255,255,255,0.04) inset;
        }
        .auth-card::before {
          content: '';
          position: absolute; inset: -1px;
          border-radius: 22px;
          padding: 1px;
          background: linear-gradient(180deg, rgba(77,147,255,0.35), rgba(77,147,255,0) 40%);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
        }
        .auth-card-header {
          text-align: center; margin-bottom: 18px;
          display: none;
        }
        .auth-card-header__brand {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 8px;
        }
        .auth-card-header__sub {
          font-size: 13px; color: #94a8c8; line-height: 1.5;
        }

        /* ─ Tabs ─ */
        .auth-tabs {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(8,18,34,0.7);
          border: 1px solid rgba(120,170,230,0.10);
          border-radius: 12px;
          margin-bottom: 22px;
        }
        .auth-tab {
          flex: 1; padding: 10px 12px; border: none; cursor: pointer;
          background: transparent; color: #6b80a3;
          font-size: 14px; font-weight: 600; font-family: inherit;
          border-radius: 9px;
          transition: background .15s, color .15s, border-color .15s;
        }
        .auth-tab.active {
          background: linear-gradient(180deg, rgba(44,124,255,0.22), rgba(44,124,255,0.10));
          color: #ffffff;
          border: 1px solid rgba(77,147,255,0.30);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.06) inset,
            0 6px 16px rgba(44,124,255,0.18);
        }

        /* ─ Google button (white surface, dark text — Google brand
             guidelines compatible) ─ */
        .auth-btn-google {
          width: 100%; height: 52px; border-radius: 14px;
          background: linear-gradient(180deg, #ffffff 0%, #e9eef7 100%);
          color: #11243f;
          font-size: 15px; font-weight: 800; font-family: inherit;
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
          border: 1px solid rgba(255,255,255,0.82);
          cursor: pointer;
          box-shadow:
            0 16px 34px rgba(44,124,255,0.34),
            0 0 0 1px rgba(64,196,255,0.22),
            0 1px 0 rgba(255,255,255,0.75) inset;
          transition: opacity .15s, transform .12s, box-shadow .15s;
        }
        .auth-btn-google:hover {
          opacity: .98;
          transform: translateY(-1px);
          box-shadow:
            0 18px 38px rgba(44,124,255,0.42),
            0 0 0 1px rgba(64,196,255,0.30),
            0 1px 0 rgba(255,255,255,0.78) inset;
        }
        .auth-btn-google:active { transform: translateY(0); }

        /* ─ Divider ─ */
        .auth-divider {
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: center; gap: 12px;
          margin: 18px 0 16px;
          font-size: 11.5px; color: #6b80a3;
          letter-spacing: 0.06em;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; height: 1px; background: rgba(120,170,230,0.10);
        }

        /* ─ Labels ─ */
        .auth-label {
          display: block;
          font-size: 12.5px; font-weight: 600;
          color: #cdd9ee;
          margin-top: 14px; margin-bottom: 7px;
          letter-spacing: 0.01em;
        }
        .auth-label--first { margin-top: 0; }

        /* ─ Inputs ─ */
        .auth-input {
          width: 100%; box-sizing: border-box;
          height: 48px; padding: 0 14px; border-radius: 12px;
          background: rgba(6,14,28,0.7);
          border: 1px solid rgba(120,170,230,0.10);
          color: #f1f6fb; font-size: 14.5px; font-weight: 400; font-family: inherit;
          outline: none;
          transition: border-color .15s, box-shadow .15s, background .15s;
        }
        .auth-input:focus {
          border-color: rgba(77,147,255,0.55);
          box-shadow: 0 0 0 4px rgba(44,124,255,0.12);
          background: rgba(8,22,42,0.85);
        }
        .auth-input::placeholder { color: #4f6d92; }

        .auth-input-wrap {
          position: relative; display: flex; align-items: center;
        }
        .auth-input-wrap .auth-input { padding-right: 44px; }
        .auth-pwd-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 4px;
          color: #6b80a3; display: flex; align-items: center;
          transition: color .15s;
        }
        .auth-pwd-toggle:hover { color: #cdd9ee; }

        /* ─ Strength meter ─ */
        .auth-strength {
          display: flex; align-items: center; gap: 10px;
          margin-top: 8px;
        }
        .auth-strength__bars { display: flex; gap: 4px; flex: 1; }
        .auth-strength__seg {
          flex: 1; height: 4px; border-radius: 2px;
          background: rgba(120,170,230,0.10);
          transition: background .15s;
        }
        .auth-strength__label {
          font-size: 11px; font-weight: 500;
          min-width: 68px; text-align: right;
          color: #6b80a3;
        }

        /* ─ Email CTA (secondary path after Google) ─ */
        .auth-btn {
          width: 100%; height: 50px; margin-top: 20px;
          border-radius: 12px;
          background: rgba(7, 21, 40, 0.54);
          color: #eaf3ff;
          font-size: 14.5px; font-weight: 700; font-family: inherit;
          letter-spacing: -0.005em;
          border: 1px solid rgba(64,196,255,0.34);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow:
            0 10px 24px rgba(0,0,0,0.26),
            0 1px 0 rgba(255,255,255,0.10) inset;
          transition: transform .12s, opacity .15s, border-color .15s, background .15s;
        }
        .auth-btn--secondary {
          background: rgba(7, 21, 40, 0.48);
        }
        .auth-btn--secondary:hover {
          border-color: rgba(64,196,255,0.58);
          background: rgba(12, 34, 62, 0.72);
        }
        .auth-btn:hover { transform: translateY(-1px); }
        .auth-btn:active { transform: translateY(0); }

        /* ─ Forgot link / hints ─ */
        .auth-actions-center { text-align: center; margin: 4px 0 14px; }
        .auth-btn-forgot {
          background: none; border: none; cursor: pointer; font-family: inherit;
          font-size: 13px; font-weight: 400;
          color: #cdd9ee;
          padding: 4px 8px;
          border-bottom: 1px solid rgba(185,200,221,0.22);
          border-radius: 0;
          transition: color .15s, border-color .15s;
        }
        .auth-btn-forgot:hover { color: #ffffff; border-color: rgba(64,196,255,0.6); }

        .auth-hint {
          font-size: 12px; font-weight: 400; color: #6b80a3;
          text-align: center;
          margin-top: 14px; line-height: 1.5;
        }

        /* ─ Audience pill ─ */
        .auth-brand__audience {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 12px 7px 10px;
          background: rgba(64,196,255,0.08);
          border: 1px solid rgba(64,196,255,0.25);
          border-radius: 999px;
          font-size: 12px; font-weight: 600;
          color: #67E8F9;
          letter-spacing: 0.10em; text-transform: uppercase;
          margin-top: 32px;
          align-self: flex-start;
          position: relative; z-index: 1;
        }
        .auth-brand__audience .auth-brand__audience-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #40C4FF;
          box-shadow: 0 0 10px #40C4FF;
        }

        /* ─ Trust line (3 micro-promises) ─ */
        .auth-trust-line {
          display: flex; align-items: center; justify-content: center;
          gap: 22px; flex-wrap: wrap;
          margin: 14px 0 16px;
          font-size: 12.5px; color: #94a8c8;
        }
        .auth-trust-line__item {
          display: inline-flex; align-items: center; gap: 6px;
        }
        .auth-trust-line__item svg { color: #40C4FF; }

        /* ─ Trust card — "Acesso seguro e criptografado" ─ */
        .auth-trust-card {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 14px;
          padding: 12px 14px;
          background: rgba(46,204,139,0.08);
          border: 1px solid rgba(46,204,139,0.22);
          border-radius: 12px;
        }
        .auth-trust-card__icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(46,204,139,0.14);
          border: 1px solid rgba(46,204,139,0.30);
          display: grid; place-items: center;
          color: #5fe5ad; flex-shrink: 0;
        }
        .auth-trust-card__title {
          font-size: 13.5px; font-weight: 600; color: #cdf3e0; line-height: 1.3;
        }
        .auth-trust-card__sub {
          font-size: 12px; color: #8fc8a9; margin-top: 1px;
        }

        /* ─ Social proof ─ */
        .auth-social-proof {
          display: flex; align-items: center; gap: 12px;
          margin-top: 6px; padding: 12px 14px;
          background: rgba(8,18,34,0.6);
          border: 1px solid rgba(120,170,230,0.10);
          border-radius: 12px;
        }
        .auth-social-proof__avatars { display: flex; flex-shrink: 0; }
        .auth-social-proof__avatar {
          width: 26px; height: 26px; border-radius: 50%;
          border: 2px solid #0a1a31;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 11px; font-weight: 700;
          margin-left: -8px;
        }
        .auth-social-proof__avatar:first-child { margin-left: 0; }
        .auth-social-proof__text { flex: 1; min-width: 0; }
        .auth-social-proof__num {
          font-size: 13.5px; font-weight: 600; color: #ffffff; line-height: 1.2;
        }
        .auth-social-proof__label {
          font-size: 12px; color: #94a8c8; margin-top: 2px;
        }

        /* ─ Right phone aside ─ */
        .auth-phone-aside {
          display: flex; flex-direction: column; align-items: center;
          padding: 28px 0 0;
          background: transparent;
          border: 0;
          position: relative;
          box-sizing: border-box;
        }
        .auth-phone-aside::before { content: none; }
        .auth-phone {
          width: 320px; height: 640px; padding: 12px;
          background: linear-gradient(180deg, #1a2942, #0a1729);
          border: 1px solid rgba(120,170,230,0.18);
          border-radius: 44px;
          box-shadow:
            0 50px 120px rgba(0,0,0,0.6),
            0 0 0 1px rgba(120,170,230,0.06) inset,
            0 30px 60px rgba(44,124,255,0.10);
          position: relative;
        }
        .auth-phone::before {
          content: '';
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          width: 110px; height: 26px; border-radius: 14px;
          background: #03080f; z-index: 5;
        }
        .auth-phone__screen {
          width: 100%; height: 100%; border-radius: 34px;
          background:
            radial-gradient(600px 300px at 50% -10%, rgba(44,124,255,0.25), transparent 60%),
            linear-gradient(180deg, #07182f 0%, #050d1c 100%);
          padding: 44px 16px 14px;
          position: relative; overflow: hidden;
          box-sizing: border-box;
        }
        .auth-phone__topbar {
          display: flex; align-items: center; gap: 7px;
          margin-bottom: 14px;
        }
        .auth-phone__topbar-brand {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 700; color: #ffffff;
        }
        .auth-phone__topbar-pro {
          font-size: 9px; font-weight: 700; color: #40C4FF;
          letter-spacing: 0.12em;
          background: rgba(64,196,255,0.12);
          border: 1px solid rgba(64,196,255,0.28);
          padding: 2px 5px; border-radius: 4px;
        }
        .auth-phone__topbar-spacer { flex: 1; }
        .auth-phone__sync-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9.5px; font-weight: 600; color: #5fe5ad;
          background: rgba(46,204,139,0.10);
          border: 1px solid rgba(46,204,139,0.30);
          padding: 4px 8px; border-radius: 999px;
        }
        .auth-phone__sync-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #2ecc8b;
          box-shadow: 0 0 6px #2ecc8b;
        }
        .auth-phone__hero {
          padding: 12px 13px;
          background: linear-gradient(180deg, rgba(15,33,60,0.9), rgba(8,22,42,0.7));
          border: 1px solid rgba(120,170,230,0.18);
          border-radius: 14px;
          margin-bottom: 10px;
        }
        .auth-phone__greeting {
          font-size: 14px; font-weight: 700; color: #ffffff;
        }
        .auth-phone__sub {
          font-size: 11px; color: #94a8c8; margin-top: 2px;
        }
        .auth-phone__status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 8px;
          padding: 4px 8px;
          background: rgba(46,204,139,0.12);
          border: 1px solid rgba(46,204,139,0.30);
          border-radius: 999px;
          font-size: 10px; font-weight: 700; color: #5fe5ad;
          letter-spacing: 0.06em;
        }
        .auth-phone__status-pill svg { width: 10px; height: 10px; }
        .auth-phone__kpis {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
          margin-bottom: 10px;
        }
        .auth-phone__kpi {
          padding: 10px 11px;
          background: rgba(8,22,42,0.6);
          border: 1px solid rgba(120,170,230,0.10);
          border-radius: 12px;
        }
        .auth-phone__kpi-label {
          font-size: 9.5px; font-weight: 700; color: #6b80a3;
          letter-spacing: 0.10em; text-transform: uppercase;
        }
        .auth-phone__kpi-value {
          font-size: 18px; font-weight: 700; color: #ffffff;
          margin-top: 2px; letter-spacing: -0.02em; line-height: 1;
        }
        .auth-phone__kpi-value em {
          font-style: normal; color: #40C4FF;
        }
        .auth-phone__kpi-sub {
          font-size: 10px; color: #6b80a3; margin-top: 1px;
        }
        .auth-phone__card {
          padding: 10px 11px;
          background: linear-gradient(180deg, rgba(44,124,255,0.10), rgba(8,22,42,0.6));
          border: 1px solid rgba(77,147,255,0.25);
          border-radius: 12px;
          margin-bottom: 8px;
        }
        .auth-phone__card.is-alt {
          background: rgba(8,22,42,0.6);
          border: 1px solid rgba(120,170,230,0.10);
        }
        .auth-phone__card-label {
          font-size: 9.5px; font-weight: 700; color: #6b80a3;
          letter-spacing: 0.10em; text-transform: uppercase;
          margin-bottom: 3px;
        }
        .auth-phone__card-title {
          font-size: 13px; font-weight: 600; color: #ffffff;
          margin-bottom: 1px;
        }
        .auth-phone__card-meta {
          font-size: 10.5px; color: #94a8c8;
        }
        .auth-phone__bottom-nav {
          position: absolute; bottom: 12px; left: 12px; right: 12px;
          height: 48px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          align-items: center; justify-items: center;
          background: rgba(6,14,28,0.85);
          border: 1px solid rgba(120,170,230,0.18);
          border-radius: 14px;
          backdrop-filter: blur(8px);
        }
        .auth-phone__nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          font-size: 9px; font-weight: 600; color: #6b80a3;
          text-align: center;
        }
        .auth-phone__nav-item.is-active { color: #40C4FF; }
        .auth-phone__nav-item svg {
          width: 16px; height: 16px;
          display: block; margin: 0 auto 2px;
        }
        .auth-phone__caption {
          margin: 22px auto 0;
          text-align: center;
          font-size: 12.5px; color: #94a8c8; line-height: 1.55;
          max-width: 280px;
        }
        .auth-phone__caption strong { color: #ffffff; font-weight: 600; }

        /* ─ Footer ─ */
        .auth-footer {
          grid-column: 1 / -1;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          margin-top: 24px; padding-top: 20px;
          border-top: 1px solid rgba(120,170,230,0.10);
          font-size: 12px; color: #6b80a3;
          position: relative; z-index: 1;
        }
        .auth-footer__brand-line {
          display: inline-flex; align-items: center; gap: 14px;
          flex-wrap: wrap;
        }
        .auth-footer__brand { color: #94a8c8; }
        .auth-footer__sep {
          display: inline-block; width: 1px; height: 12px;
          background: rgba(120,170,230,0.18);
        }
        .auth-footer__link {
          color: #6b80a3; text-decoration: none;
          border-bottom: 1px solid rgba(120,170,230,0.0);
          padding-bottom: 1px;
          transition: color .15s, border-color .15s;
        }
        .auth-footer__link:hover { color: #cdd9ee; }
        .auth-footer__status {
          display: inline-flex; align-items: center; gap: 6px;
          color: #94a8c8;
        }
        .auth-footer__status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2ecc8b;
          box-shadow: 0 0 8px #2ecc8b;
        }

        /* ─ Responsive ─ */
        @media (max-width: 1280px) {
          .auth-stage {
            grid-template-columns: 1fr 460px;
            padding: 40px 32px 60px;
          }
          .auth-phone-aside { display: none; }
        }
        @media (max-width: 900px) {
          .auth-stage {
            grid-template-columns: 1fr;
            row-gap: 24px;
            padding: 28px 20px 56px;
          }
          .auth-form-panel { order: 1; padding-top: 0; }
          .auth-brand { order: 2; padding: 0; }
          .auth-brand__headline { font-size: 32px; margin-top: 18px; }
          .auth-brand__sub { font-size: 14.5px; }
          .auth-brand__features { margin-top: 24px; gap: 14px; }
          .auth-brand__stats { margin-top: 28px; gap: 28px; }
          .auth-brand__stat-num { font-size: 22px; }
        }
        @media (max-width: 640px) {
          .auth-brand { display: none; }
          .auth-card-header { display: block; }
          .auth-card { padding: 22px 22px 20px; }
          .auth-footer {
            flex-direction: column; align-items: flex-start; gap: 8px;
          }
        }
      </style>

      <div class="auth-stage">
      <!-- LEFT: Branding panel (role=complementary, NUNCA aria-hidden) -->
      <aside class="auth-brand" role="complementary">
        <div class="auth-brand__logo">
          ${ICON_LOGO}
          <span class="auth-brand__logo-text">CoolTrack</span>
          <span class="auth-brand__logo-badge">PRO</span>
        </div>

        <!-- Pill de audiencia — qualifica em 1s "isso é pra mim". Dot
             cyan reforca o highlight visual sem icone semantico. -->
        <span class="auth-brand__audience">
          <span class="auth-brand__audience-dot" aria-hidden="true"></span>
          Para climatização e refrigeração
        </span>

        <h1 class="auth-brand__headline">
          Do serviço ao PDF, direto do celular.
        </h1>
        <p class="auth-brand__sub">
          Cadastre o equipamento, registre o serviço e envie o relatório no
          WhatsApp em menos de 1 minuto — sem sair do local.
        </p>

        <div class="auth-brand__features">
          <div class="auth-brand__feat">
            <div class="auth-brand__feat-icon">${ICON_SNOWFLAKE}</div>
            <div>
              <div class="auth-brand__feat-title">Cadastro por foto da placa</div>
              <div class="auth-brand__feat-desc">Tire foto, a IA preenche modelo, marca e dados técnicos.</div>
            </div>
          </div>
          <div class="auth-brand__feat">
            <div class="auth-brand__feat-icon">${ICON_FILETEXT}</div>
            <div>
              <div class="auth-brand__feat-title">Checklist rápido do serviço</div>
              <div class="auth-brand__feat-desc">Preventiva, corretiva, limpeza, carga de gás — em segundos.</div>
            </div>
          </div>
          <div class="auth-brand__feat">
            <div class="auth-brand__feat-icon">${ICON_BELL}</div>
            <div>
              <div class="auth-brand__feat-title">PDF no WhatsApp em um toque</div>
              <div class="auth-brand__feat-desc">Relatório pronto com sua logo, fotos e assinatura do cliente.</div>
            </div>
          </div>
        </div>

        <div class="auth-brand__stats">
          <div>
            <div class="auth-brand__stat-num">&lt;1 min</div>
            <div class="auth-brand__stat-label">Relatório pronto</div>
          </div>
          <div>
            <div class="auth-brand__stat-num">&infin;</div>
            <div class="auth-brand__stat-label">Equipamentos no Pro</div>
          </div>
          <div>
            <div class="auth-brand__stat-num is-alt">100%</div>
            <div class="auth-brand__stat-label">Funciona offline</div>
          </div>
        </div>
      </aside>

      <!-- RIGHT: Form panel -->
      <main class="auth-form-panel" aria-labelledby="auth-title">
        <div class="auth-card">

          <!-- Mobile-only logo (mesma marca cyan/blue do header desktop) -->
          <div class="auth-card-header">
            <div class="auth-card-header__brand">
              ${ICON_LOGO_SM}
              <span id="auth-title" style="font-size:18px;font-weight:700;color:#ffffff">CoolTrack</span>
              <span class="auth-brand__logo-badge">PRO</span>
            </div>
            <div class="auth-card-header__sub">Do serviço ao PDF, direto do celular.</div>
          </div>

          <!-- Tabs -->
          <div class="auth-tabs" role="tablist" aria-label="Acesso">
            <button class="auth-tab active" id="tab-signin" type="button" role="tab" aria-selected="true" aria-controls="auth-form-signin">Entrar</button>
            <button class="auth-tab" id="tab-signup" type="button" role="tab" aria-selected="false" aria-controls="auth-form-signup">Criar conta</button>
          </div>

          <!-- Sign In panel -->
          <div id="auth-form-signin" role="tabpanel" aria-labelledby="tab-signin">
            <button class="auth-btn-google" id="btn-google-signin" type="button">
              ${ICON_GOOGLE}
              ${intentOptions.highlightCopy}
            </button>
            <div class="auth-divider">ou entre com email e senha</div>
            <label class="auth-label auth-label--first" for="signin-email">Email</label>
            <input class="auth-input" id="signin-email" type="email" placeholder="seu@email.com" autocomplete="email" />
            <label class="auth-label" for="signin-password">Senha</label>
            ${passwordInputHTML('signin-password', 'senha', 'current-password')}
            <button class="auth-btn auth-btn--secondary" id="btn-signin" type="button">Entrar no app ${ICON_ARROW_RIGHT}</button>

            <div class="auth-trust-line">
              <span class="auth-trust-line__item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                Sem cartão
              </span>
              <span class="auth-trust-line__item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
                </svg>
                Funciona offline
              </span>
              <span class="auth-trust-line__item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
                </svg>
                Acesso imediato
              </span>
            </div>

            <div class="auth-trust-card">
              <div class="auth-trust-card__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div>
                <div class="auth-trust-card__title">Acesso seguro e criptografado</div>
                <div class="auth-trust-card__sub">Seus dados sempre protegidos.</div>
              </div>
            </div>

            <div class="auth-actions-center">
              <button class="auth-btn-forgot" id="btn-forgot" type="button">Esqueci minha senha</button>
            </div>

            <div class="auth-social-proof">
              <div class="auth-social-proof__avatars" aria-hidden="true">
                <span class="auth-social-proof__avatar" style="background:linear-gradient(135deg,#00c8e8,#0096b4)">CR</span>
                <span class="auth-social-proof__avatar" style="background:linear-gradient(135deg,#2c7cff,#40c4ff)">FR</span>
                <span class="auth-social-proof__avatar" style="background:linear-gradient(135deg,#5fe6b3,#1fa370)">LO</span>
              </div>
              <div class="auth-social-proof__text">
                <div class="auth-social-proof__num">+500 relatórios já gerados</div>
                <div class="auth-social-proof__label">Beta em produção · técnicos ativos no Brasil</div>
              </div>
            </div>
          </div>

          <!-- Sign Up panel -->
          <div id="auth-form-signup" role="tabpanel" aria-labelledby="tab-signup" hidden>
            <button class="auth-btn-google" id="btn-google-signup" type="button">
              ${ICON_GOOGLE}
              Criar conta com Google
            </button>
            <div class="auth-divider">ou crie sua conta com email e senha</div>
            <label class="auth-label auth-label--first" for="signup-nome">Seu nome</label>
            <input class="auth-input" id="signup-nome" type="text" placeholder="Carlos Figueiredo" autocomplete="name" />
            <label class="auth-label" for="signup-email">Email</label>
            <input class="auth-input" id="signup-email" type="email" placeholder="seu@email.com" autocomplete="email" />
            <label class="auth-label" for="signup-password">Senha</label>
            ${passwordInputHTML('signup-password', 'mínimo 8 caracteres', 'new-password')}
            <div class="auth-strength" id="signup-strength" role="progressbar"
                 aria-live="polite" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0">
              <div class="auth-strength__bars">
                <div class="auth-strength__seg"></div>
                <div class="auth-strength__seg"></div>
                <div class="auth-strength__seg"></div>
              </div>
              <div class="auth-strength__label">&nbsp;</div>
            </div>
            <label class="auth-label" for="signup-confirm">Confirmar senha</label>
            ${passwordInputHTML('signup-confirm', 'repita a senha', 'new-password')}
            <button class="auth-btn auth-btn--secondary" id="btn-signup" type="button">Começar gratuitamente ${ICON_ARROW_RIGHT}</button>
            <div class="auth-hint">Grátis pra sempre · Sem cartão · PDF com marca d’água no free</div>
          </div>

        </div>
      </main>

      <!-- Phone mockup aside (decorativo, aria-hidden=true) — versao
           rica do app com dados ficticios. Visual only. -->
      <aside class="auth-phone-aside" aria-hidden="true">
        <div class="auth-phone">
          <div class="auth-phone__screen">
            <div class="auth-phone__topbar">
              <span class="auth-phone__topbar-brand">
                ${brandIconHTML(22)} CoolTrack
              </span>
              <span class="auth-phone__topbar-pro">PRO</span>
              <span class="auth-phone__topbar-spacer"></span>
              <span class="auth-phone__sync-pill">
                <span class="auth-phone__sync-dot"></span> 5 técnicos
              </span>
            </div>

            <div class="auth-phone__hero">
              <div class="auth-phone__greeting">Olá, Carlos 👋</div>
              <div class="auth-phone__sub">Seu parque está saudável.</div>
              <span class="auth-phone__status-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                TUDO OPERANDO
              </span>
            </div>

            <div class="auth-phone__kpis">
              <div class="auth-phone__kpi">
                <div class="auth-phone__kpi-label">Equipamentos</div>
                <div class="auth-phone__kpi-value">12<em>/12</em></div>
                <div class="auth-phone__kpi-sub">ativos</div>
              </div>
              <div class="auth-phone__kpi">
                <div class="auth-phone__kpi-label">Eficiência</div>
                <div class="auth-phone__kpi-value">96<em>%</em></div>
                <div class="auth-phone__kpi-sub">excelente</div>
              </div>
            </div>

            <div class="auth-phone__card">
              <div class="auth-phone__card-label">Próximo serviço</div>
              <div class="auth-phone__card-title">Limpeza preventiva</div>
              <div class="auth-phone__card-meta">Climatec Norte · Sala 07 · 19/05</div>
            </div>

            <div class="auth-phone__card is-alt">
              <div class="auth-phone__card-label">Último serviço</div>
              <div class="auth-phone__card-title">Limpeza de filtros</div>
              <div class="auth-phone__card-meta">há 2 dias · 12:55</div>
            </div>

            <div class="auth-phone__bottom-nav">
              <span class="auth-phone__nav-item is-active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                Painel
              </span>
              <span class="auth-phone__nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
                Parque
              </span>
              <span class="auth-phone__nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                Serviços
              </span>
              <span class="auth-phone__nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                Clientes
              </span>
            </div>
          </div>
        </div>

        <p class="auth-phone__caption">
          Veja seu parque inteiro <strong>em tempo real</strong>, registre e envie em segundos.
        </p>
      </aside>

      <!-- Footer discreto: copy + links legais internos (mesma aba) +
           status. Links apontam pra /legal/*.html (paginas estaticas
           ja existentes) e pro hash #contato da landing como destino
           de "Suporte". -->
      <footer class="auth-footer" aria-label="Rodapé">
        <span class="auth-footer__brand-line">
          <span class="auth-footer__brand">CoolTrackPro © 2026</span>
          <span class="auth-footer__sep" aria-hidden="true"></span>
          <a class="auth-footer__link" href="/legal/termos.html">Termos</a>
          <span class="auth-footer__sep" aria-hidden="true"></span>
          <a class="auth-footer__link" href="/legal/privacidade.html">Privacidade</a>
          <span class="auth-footer__sep" aria-hidden="true"></span>
          <a class="auth-footer__link" href="/#contato">Suporte</a>
        </span>
        <span class="auth-footer__status">
          <span class="auth-footer__status-dot" aria-hidden="true"></span>
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
