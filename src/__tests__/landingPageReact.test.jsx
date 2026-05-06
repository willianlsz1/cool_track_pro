import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountLandingPageReact } from '../react/entrypoints/landingIsland.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createRoot() {
  const el = document.createElement('div');
  el.id = 'app';
  document.body.appendChild(el);
  return el;
}

function findButtonByText(root, text) {
  const matcher = typeof text === 'string' ? (t) => t.includes(text) : text;
  return Array.from(root.querySelectorAll('button')).find((b) => matcher(b.textContent || ''));
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('LandingPage (React)', () => {
  it('renderiza marker de mount, secoes principais e CTA "Comecar gratis"', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    expect(root.querySelector('[data-react-landing-page-mounted="true"]')).not.toBeNull();
    expect(root.classList.contains('landing-active')).toBe(true);

    expect(document.getElementById('segmentos')).not.toBeNull();
    expect(document.getElementById('recursos')).not.toBeNull();
    expect(document.getElementById('fluxo')).not.toBeNull();
    expect(document.getElementById('planos')).not.toBeNull();
    expect(document.getElementById('relatorios')).not.toBeNull();
    expect(document.getElementById('contato')).not.toBeNull();
    expect(document.getElementById('dashboard-preview')).not.toBeNull();

    const text = root.textContent || '';
    expect(text).not.toMatch(/\\u00[0-9a-fA-F]{2}/);
    expect(text).toContain('Relatórios');
    expect(text).toContain('Câmaras frias');
    expect(text).toContain('Começar grátis');

    // Anti-regressao: "Ver demonstracao" nao volta.
    expect(text).not.toMatch(/Ver demonstra[çc][aã]o/i);
    const buttons = Array.from(root.querySelectorAll('button'));
    expect(buttons.some((b) => /Ver demonstra[çc][aã]o/i.test(b.textContent || ''))).toBe(false);
  });

  it('aciona onLogin/onStart quando clica no CTA principal', async () => {
    const root = createRoot();
    const onLogin = vi.fn();
    await act(async () => {
      mountLandingPageReact(root, { onLogin });
    });

    const startBtn = findButtonByText(root, 'Começar grátis');
    expect(startBtn).toBeDefined();

    await act(async () => {
      startBtn?.click();
    });
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('mount idempotente — segundo mount no mesmo root nao duplica conteudo', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });
    expect(root.querySelectorAll('[data-react-landing-page-mounted="true"]')).toHaveLength(1);
  });

  it('DashboardPreview troca conteudo ao clicar em uma aba diferente', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    // Aba inicial e Dashboard — tem alerts e chart bars do layout overview.
    const dashboardArea = document.getElementById('dashboard-preview');
    expect(dashboardArea?.textContent).toContain('Alertas de manutenção');
    expect(dashboardArea?.querySelector('img[src="/brand/favicon.svg"]')).not.toBeNull();

    const previewTabs = Array.from(dashboardArea?.querySelectorAll('button[role="tab"]') ?? []);
    expect(previewTabs.map((b) => (b.textContent || '').trim())).toEqual([
      'Painel',
      'Clientes',
      'Equipamentos',
      'Atendimentos',
      'Preventivas',
      'Relatórios',
      'Alertas',
    ]);

    // Clica na aba "Clientes" — devem aparecer KPIs e lista de clientes.
    const clientesTab = previewTabs.find((b) => (b.textContent || '').trim() === 'Clientes');
    expect(clientesTab).toBeDefined();

    await act(async () => {
      clientesTab?.click();
    });

    expect(clientesTab?.getAttribute('aria-selected')).toBe('true');
    expect(dashboardArea?.textContent).toContain('Total de clientes');
    expect(dashboardArea?.textContent).toContain('Climatize SA');

    const alertasTab = previewTabs.find((b) => (b.textContent || '').trim() === 'Alertas');
    await act(async () => {
      alertasTab?.click();
    });
    expect(alertasTab?.getAttribute('aria-selected')).toBe('true');
    expect(dashboardArea?.textContent).toContain('Alertas ativos');
    expect(dashboardArea?.textContent).toContain('Equipamentos críticos');

    // Volta para Dashboard — deve voltar a mostrar Alertas de manutenção.
    const dashboardTab = previewTabs.find((b) => (b.textContent || '').trim() === 'Painel');
    await act(async () => {
      dashboardTab?.click();
    });
    expect(dashboardArea?.textContent).toContain('Alertas de manutenção');
  });

  it('WorkflowSection mostra detalhe da etapa ativa e troca ao clicar', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    const fluxo = document.getElementById('fluxo');
    expect(fluxo).not.toBeNull();

    // Etapa default (id 3) renderiza descricao de preventiva no calendario.
    expect(fluxo?.textContent).toContain('Etapa 3 de 6');
    expect(fluxo?.textContent).toContain('Preventiva no calendário');

    // Clica na etapa 1 (titulo "Cliente chama") — primeira
    // ocorrencia do botao com `role="tab"` (desktop view + mobile view
    // renderizadas, ambas com mesmo texto).
    const stepButtons = Array.from(fluxo?.querySelectorAll('button[role="tab"]') ?? []).filter(
      (b) => (b.textContent || '').includes('Cliente chama'),
    );
    expect(stepButtons.length).toBeGreaterThan(0);

    await act(async () => {
      stepButtons[0].click();
    });

    expect(fluxo?.textContent).toContain('Etapa 1 de 6');
    expect(fluxo?.textContent).toContain('Cliente chama');
    expect(stepButtons[0].getAttribute('aria-selected')).toBe('true');
  });

  it('Footer mostra links legais (Privacidade, Termos de uso, LGPD) com hrefs corretos abrindo na mesma aba', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    const legalNav = root.querySelector('nav[aria-label="Documentos legais"]');
    expect(legalNav).not.toBeNull();

    const links = Array.from(legalNav?.querySelectorAll('a') ?? []);
    const linkMap = Object.fromEntries(
      links.map((a) => [(a.textContent || '').trim(), a.getAttribute('href') || '']),
    );

    expect(linkMap['Privacidade']).toBe('/legal/privacidade.html');
    expect(linkMap['Termos de uso']).toBe('/legal/termos.html');
    expect(linkMap['LGPD']).toBe('/legal/lgpd.html');

    // Sao links internos do produto — devem abrir na MESMA aba.
    // Anti-regressao: nenhum dos 3 pode usar target="_blank".
    for (const a of links) {
      expect(a.getAttribute('target')).not.toBe('_blank');
    }
  });

  it('PricingSection renderiza Free, Plus e Pro com badge "Mais popular" no Pro', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    const planos = document.getElementById('planos');
    expect(planos).not.toBeNull();

    // 3 cards (data-plan=free|plus|pro) renderizados.
    const freeCard = planos?.querySelector('[data-plan="free"]');
    const plusCard = planos?.querySelector('[data-plan="plus"]');
    const proCard = planos?.querySelector('[data-plan="pro"]');
    expect(freeCard).not.toBeNull();
    expect(plusCard).not.toBeNull();
    expect(proCard).not.toBeNull();

    // Nomes dos planos visiveis.
    const text = planos?.textContent || '';
    expect(text).toContain('Free');
    expect(text).toContain('Plus');
    expect(text).toContain('Pro');
    expect(text).toContain('Planos para cada fase');

    // Badge "Mais popular" so no card Pro.
    const proBadge = proCard?.querySelector('[data-plan-badge]');
    expect(proBadge).not.toBeNull();
    expect((proBadge?.textContent || '').toLowerCase()).toContain('mais popular');
    expect(freeCard?.querySelector('[data-plan-badge]')).toBeNull();
    expect(plusCard?.querySelector('[data-plan-badge]')).toBeNull();

    // Linha de confianca renderiza.
    expect(text).toContain('Sem fidelidade');
    expect(text).toContain('Cancele quando quiser');
    expect(text).toContain('Suporte em português');
  });

  it('PricingSection toggle Mensal/Anual altera Plus de R$ 29 para R$ 24, Pro de R$ 99 para R$ 82, Free permanece R$ 0', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    const planos = document.getElementById('planos');
    expect(planos).not.toBeNull();

    const getPrice = (planId) =>
      (planos?.querySelector(`[data-plan="${planId}"] [data-price]`)?.textContent || '').trim();

    // Default: Mensal.
    expect(getPrice('free')).toBe('R$ 0');
    expect(getPrice('plus')).toBe('R$ 29');
    expect(getPrice('pro')).toBe('R$ 99');

    // Toggle Anual e Mensal sao buttons reais com aria-pressed.
    const annualBtn = planos?.querySelector('button[data-billing="annual"]');
    const monthlyBtn = planos?.querySelector('button[data-billing="monthly"]');
    expect(annualBtn).not.toBeNull();
    expect(monthlyBtn).not.toBeNull();
    expect(monthlyBtn?.getAttribute('aria-pressed')).toBe('true');
    expect(annualBtn?.getAttribute('aria-pressed')).toBe('false');

    await act(async () => {
      annualBtn?.click();
    });

    expect(annualBtn?.getAttribute('aria-pressed')).toBe('true');
    expect(monthlyBtn?.getAttribute('aria-pressed')).toBe('false');

    // Anual aplicado: Plus 24, Pro 82, Free segue 0.
    expect(getPrice('free')).toBe('R$ 0');
    expect(getPrice('plus')).toBe('R$ 24');
    expect(getPrice('pro')).toBe('R$ 82');

    // Notas anuais aparecem em Plus e Pro.
    const plusNote =
      planos?.querySelector('[data-plan="plus"] [data-billing-note]')?.textContent || '';
    const proNote =
      planos?.querySelector('[data-plan="pro"] [data-billing-note]')?.textContent || '';
    expect(plusNote).toContain('Cobrado R$ 290/ano');
    expect(plusNote).toContain('economize R$ 58');
    expect(proNote).toContain('Cobrado R$ 990/ano');
    expect(proNote).toContain('economize R$ 198');

    // Voltando ao Mensal: precos voltam ao valor original.
    await act(async () => {
      monthlyBtn?.click();
    });
    expect(getPrice('plus')).toBe('R$ 29');
    expect(getPrice('pro')).toBe('R$ 99');
  });

  it('PricingSection — header tem link "Planos" apontando para #planos', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    const headerNav = root.querySelector('nav[aria-label="Navegação principal da landing"]');
    expect(headerNav).not.toBeNull();

    const planosLink = Array.from(headerNav?.querySelectorAll('a') ?? []).find(
      (a) => (a.textContent || '').trim() === 'Planos',
    );
    expect(planosLink).toBeDefined();
    expect(planosLink?.getAttribute('href')).toBe('#planos');
  });

  it('PricingSection CTAs dos planos acionam o mesmo callback principal', async () => {
    const root = createRoot();
    const onLogin = vi.fn();
    await act(async () => {
      mountLandingPageReact(root, { onLogin });
    });

    const planos = document.getElementById('planos');
    expect(planos).not.toBeNull();

    const freeCta = planos?.querySelector('[data-plan-cta="free"]');
    const plusCta = planos?.querySelector('[data-plan-cta="plus"]');
    const proCta = planos?.querySelector('[data-plan-cta="pro"]');
    expect(freeCta).not.toBeNull();
    expect(plusCta).not.toBeNull();
    expect(proCta).not.toBeNull();

    await act(async () => {
      freeCta?.click();
    });
    await act(async () => {
      plusCta?.click();
    });
    await act(async () => {
      proCta?.click();
    });

    // 3 CTAs disparam o mesmo callback principal.
    expect(onLogin).toHaveBeenCalledTimes(3);

    // CTAs sao botoes reais (nao <a target="_blank">) — i.e., nao abrem
    // nova aba. Anti-regressao para garantir que ninguem reintroduza
    // checkout/Stripe externos neste PR.
    expect(freeCta?.tagName).toBe('BUTTON');
    expect(plusCta?.tagName).toBe('BUTTON');
    expect(proCta?.tagName).toBe('BUTTON');
  });

  it('ProblemsSection destaca problema ativo e mostra solucao ao clicar', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    // Antes do clique, painel de solucao nao aparece.
    expect(root.textContent || '').not.toContain('Como o CoolTrack resolve');

    const osProblemBtn = findButtonByText(root, 'Atendimento sem padrão');
    expect(osProblemBtn).toBeDefined();
    expect(osProblemBtn?.getAttribute('aria-pressed')).toBe('false');

    await act(async () => {
      osProblemBtn?.click();
    });

    expect(osProblemBtn?.getAttribute('aria-pressed')).toBe('true');
    expect(root.textContent || '').toContain('Como o CoolTrack resolve');
    expect(root.textContent || '').toContain('Template pronto pra cada tipo de serviço');

    // Toggle: clicar de novo no mesmo problema desativa.
    await act(async () => {
      osProblemBtn?.click();
    });
    expect(osProblemBtn?.getAttribute('aria-pressed')).toBe('false');
  });
});
