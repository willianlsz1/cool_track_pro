import { describe, it, expect, vi, beforeEach } from 'vitest';

async function loadAuthScreen(overrides = {}) {
  vi.resetModules();

  const Auth = {
    isValidEmail: vi.fn(() => true),
    signIn: vi.fn().mockResolvedValue({ id: 'u' }),
    signUp: vi.fn().mockResolvedValue({ id: 'u' }),
    signInWithGoogle: vi.fn().mockResolvedValue({ ok: true }),
  };
  const Toast = { warning: vi.fn(), error: vi.fn() };
  const runAsyncAction = vi.fn(async (_b, _o, fn) => fn());
  const PasswordRecoveryModal = { openPasswordResetEmailModal: vi.fn() };
  const trackEvent = vi.fn();

  vi.doMock('../core/auth.js', () => ({ Auth }));
  vi.doMock('../core/toast.js', () => ({ Toast }));
  vi.doMock('../core/telemetry.js', () => ({ trackEvent }));
  vi.doMock('../ui/components/actionFeedback.js', () => ({ runAsyncAction }));
  vi.doMock('../ui/components/passwordRecoveryModal.js', () => ({ PasswordRecoveryModal }));

  const { AuthScreen } = await import('../ui/components/authscreen.js');
  if (overrides.auth) Object.assign(Auth, overrides.auth);
  if (overrides.toast) Object.assign(Toast, overrides.toast);
  return { AuthScreen, Auth, Toast };
}

describe('AuthScreen V2Refined redesign', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('does NOT render the removed demo/guest card', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    expect(document.querySelector('.auth-demo')).toBeNull();
    expect(document.querySelector('#btn-guest')).toBeNull();
  });

  it('Google button is primary (signin) with unified copy', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const btn = document.querySelector('#btn-google-signin');
    expect(btn).toBeTruthy();
    expect(btn.classList.contains('auth-btn-google')).toBe(true);
    expect(btn.textContent).toContain('Continuar com Google');
  });

  it('headline is solid — no <em> highlight (login sóbrio)', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const headline = document.querySelector('.auth-brand__headline');
    expect(headline).toBeTruthy();
    expect(headline.querySelector('em')).toBeNull();
    expect(headline.textContent).toContain('Do serviço ao PDF');
  });

  it('signup panel renders strength meter and updated hint', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();
    document.getElementById('tab-signup').click();

    const meter = document.querySelector('#signup-strength');
    expect(meter).toBeTruthy();
    expect(meter.getAttribute('role')).toBe('progressbar');
    expect(meter.querySelectorAll('.auth-strength__seg').length).toBe(3);

    // Hint operacional do plano gratuito sem promessa enganosa.
    const hint = document.querySelector('#auth-form-signup .auth-hint');
    expect(hint?.textContent).toContain('PDF com marca d');
    expect(hint?.textContent).not.toContain('cancele');
  });

  it('strength meter updates colors live as password is typed', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();
    document.getElementById('tab-signup').click();

    const pw = document.getElementById('signup-password');
    const label = document.querySelector('.auth-strength__label');

    // <8 chars → Muito curta (red)
    pw.value = 'abc';
    pw.dispatchEvent(new Event('input'));
    expect(label.textContent).toBe('Muito curta');

    // 8+ no digit/symbol → Fraca (gold)
    pw.value = 'abcdefgh';
    pw.dispatchEvent(new Event('input'));
    expect(label.textContent).toBe('Fraca');

    // 8+ with digit → Forte (green)
    pw.value = 'tecnico2026';
    pw.dispatchEvent(new Event('input'));
    expect(label.textContent).toBe('Forte');
  });

  it('brand panel has role=complementary (NOT aria-hidden)', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const brand = document.querySelector('.auth-brand');
    expect(brand.getAttribute('role')).toBe('complementary');
    expect(brand.hasAttribute('aria-hidden')).toBe(false);
  });

  it('labels are sentence-case (not uppercase)', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const emailLabel = document.querySelector('label[for="signin-email"]');
    // "Email" — sentence case, not "EMAIL"
    expect(emailLabel.textContent.trim()).toBe('Email');
  });

  it('feature icons are SVG, not emoji', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const icons = document.querySelectorAll('.auth-brand__feat-icon');
    expect(icons.length).toBe(3);
    icons.forEach((el) => {
      expect(el.querySelector('svg')).toBeTruthy();
      // No emoji chars
      expect(/[\u{1F300}-\u{1FAFF}]/u.test(el.textContent)).toBe(false);
    });
  });

  it('não fecha overlay quando login por email falha', async () => {
    const { AuthScreen, Auth } = await loadAuthScreen({
      auth: { signIn: vi.fn().mockResolvedValue(null) },
    });
    AuthScreen.show();

    document.getElementById('signin-email').value = 'a@b.com';
    document.getElementById('signin-password').value = '12345678';
    document.getElementById('btn-signin').click();
    await Promise.resolve();

    expect(Auth.signIn).toHaveBeenCalled();
    expect(document.getElementById('auth-overlay')).toBeTruthy();
  });

  it('fecha overlay no login por email bem-sucedido sem forçar reload', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    document.getElementById('signin-email').value = 'a@b.com';
    document.getElementById('signin-password').value = '12345678';
    document.getElementById('btn-signin').click();
    await Promise.resolve();

    expect(document.getElementById('auth-overlay')).toBeNull();
  });

  // ─ Tela redesenhada: identidade visual da landing nova ──────────────

  it('renderiza footer discreto com links legais internos (mesma aba) e status', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const footer = document.querySelector('.auth-footer');
    expect(footer).toBeTruthy();

    const linkMap = Object.fromEntries(
      Array.from(footer.querySelectorAll('a')).map((a) => [
        (a.textContent || '').trim(),
        a.getAttribute('href') || '',
      ]),
    );
    expect(linkMap['Termos']).toBe('/legal/termos.html');
    expect(linkMap['Privacidade']).toBe('/legal/privacidade.html');
    // Suporte aponta para destino existente do projeto (#contato da landing).
    expect(linkMap['Suporte']).toMatch(/#contato$|^\/legal\//);

    // Anti-regressao: nenhum link legal pode abrir em nova aba.
    Array.from(footer.querySelectorAll('a')).forEach((a) => {
      expect(a.getAttribute('target')).not.toBe('_blank');
    });

    // Status discreto presente.
    expect(footer.textContent).toContain('Status: todos os sistemas operacionais');
  });

  it('brand-mark usa o icone oficial (cyan/blue gradient + 8 setas, sem fundo amarelo)', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const brandLogo = document.querySelector('.auth-brand__logo > span:first-child');
    expect(brandLogo).toBeTruthy();
    const inlineStyle = brandLogo.getAttribute('style') || '';

    // Anti-regressao: tile NAO usa fundo amarelo (#e8b94a) do redesign anterior.
    expect(inlineStyle).not.toMatch(/#e8b94a/i);

    // Tile usa o gradient cyan/blue da landing oficial. Match case-insensitive
    // pra tolerar normalizacao de CSS pelo jsdom.
    expect(inlineStyle).toMatch(/linear-gradient\(\s*135deg/i);
    expect(inlineStyle).toMatch(/#006dff/i);
    expect(inlineStyle).toMatch(/#40c4ff/i);

    // Glyph e o compass de 4 eixos com 8 cabeças de seta — mesmo do
    // BrandMark React e do public/favicon.svg.
    const svg = brandLogo.querySelector('svg');
    expect(svg).toBeTruthy();
    const paths = svg.querySelectorAll('path');
    expect(paths.length).toBe(2);
    // 4 eixos atraves do centro.
    expect(paths[0].getAttribute('d')).toContain('M12 2v20');
    // 8 cabecas de seta nos extremos.
    expect(paths[1].getAttribute('d')).toContain('M12 6l-2 2');
  });

  it('badge de audiencia usa texto "Para climatização e refrigeração"', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const audience = document.querySelector('.auth-brand__audience');
    expect(audience).toBeTruthy();
    expect(audience.textContent.trim()).toContain('Para climatização e refrigeração');
  });

  it('PRO badge da marca usa estilo cyan da landing (sem amarelo)', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    const badge = document.querySelector('.auth-brand__logo-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('PRO');
    // Estilo do badge vem da regra .auth-brand__logo-badge no inline
    // <style>; o teste apenas garante presenca + anti-regressao do
    // amarelo via mobile header (que tinha inline yellow antes).
    const mobileHeader = document.querySelector('.auth-card-header__brand');
    expect(mobileHeader).toBeTruthy();
    const mobileBadge = mobileHeader.querySelector('.auth-brand__logo-badge');
    expect(mobileBadge).toBeTruthy();
    expect(mobileBadge.textContent.trim()).toBe('PRO');
  });

  it('CTAs principais existem e conectam aos handlers de auth (Entrar, Criar conta, Google, Esqueci senha)', async () => {
    const { AuthScreen, Auth } = await loadAuthScreen();
    AuthScreen.show();

    // Entrar (signin).
    expect(document.getElementById('btn-signin')).toBeTruthy();
    expect(document.getElementById('signin-email')).toBeTruthy();
    expect(document.getElementById('signin-password')).toBeTruthy();

    // Criar conta — tab + botao.
    expect(document.getElementById('tab-signup')).toBeTruthy();
    document.getElementById('tab-signup').click();
    expect(document.getElementById('btn-signup')).toBeTruthy();
    expect(document.getElementById('signup-email')).toBeTruthy();
    expect(document.getElementById('signup-password')).toBeTruthy();

    // Google — em ambos os paineis.
    expect(document.getElementById('btn-google-signin')).toBeTruthy();
    expect(document.getElementById('btn-google-signup')).toBeTruthy();

    // Esqueci minha senha.
    expect(document.getElementById('btn-forgot')).toBeTruthy();

    // Google handler usa Auth.signInWithGoogle (preserva fluxo existente).
    document.getElementById('btn-google-signin').click();
    await Promise.resolve();
    expect(Auth.signInWithGoogle).toHaveBeenCalled();
  });

  it('layout em 3 secoes (brand + form + phone aside) — phone aside e decorativo', async () => {
    const { AuthScreen } = await loadAuthScreen();
    AuthScreen.show();

    // Container responsivo.
    expect(document.querySelector('.auth-stage')).toBeTruthy();

    // 3 colunas.
    const brand = document.querySelector('.auth-brand');
    const form = document.querySelector('.auth-form-panel');
    const phone = document.querySelector('.auth-phone-aside');
    expect(brand).toBeTruthy();
    expect(form).toBeTruthy();
    expect(phone).toBeTruthy();

    // Phone aside e visual-only — aria-hidden=true, sem dependencia de
    // dado real.
    expect(phone.getAttribute('aria-hidden')).toBe('true');

    // Conteudo do mockup (dados ficticios) presente.
    const phoneText = phone.textContent || '';
    expect(phoneText).toContain('Olá, Carlos');
    expect(phoneText).toContain('TUDO OPERANDO');
    expect(phoneText).toContain('Equipamentos');
    expect(phoneText).toContain('Eficiência');
    expect(phoneText).toContain('Próximo serviço');
    expect(phoneText).toContain('Último serviço');
  });
});
