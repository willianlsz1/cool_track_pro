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
  it('renderiza marker de mount, secoes principais e CTA "Comecar agora"', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    expect(root.querySelector('[data-react-landing-page-mounted="true"]')).not.toBeNull();
    expect(root.classList.contains('landing-active')).toBe(true);

    expect(document.getElementById('segmentos')).not.toBeNull();
    expect(document.getElementById('recursos')).not.toBeNull();
    expect(document.getElementById('fluxo')).not.toBeNull();
    expect(document.getElementById('relatorios')).not.toBeNull();
    expect(document.getElementById('contato')).not.toBeNull();
    expect(document.getElementById('dashboard-preview')).not.toBeNull();

    const text = root.textContent || '';
    expect(text).not.toMatch(/\\u00[0-9a-fA-F]{2}/);
    expect(text).toContain('Relatórios');
    expect(text).toContain('Câmaras frias');
    expect(text).toContain('Começar agora');

    // Anti-regressao: "Ver demonstracao" nao volta.
    expect(text).not.toMatch(/Ver demonstra[çc][aã]o/i);
    const buttons = Array.from(root.querySelectorAll('button'));
    expect(buttons.some((b) => /Ver demonstra[çc][aã]o/i.test(b.textContent || ''))).toBe(false);
  });

  it('aciona onLogin/onStart quando clica em "Comecar agora"', async () => {
    const root = createRoot();
    const onLogin = vi.fn();
    await act(async () => {
      mountLandingPageReact(root, { onLogin });
    });

    const startBtn = findButtonByText(root, 'Começar agora');
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

    // Clica na aba "Clientes" — devem aparecer KPIs e lista de clientes.
    const clientesTab = Array.from(
      dashboardArea?.querySelectorAll('button[role="tab"]') ?? [],
    ).find((b) => (b.textContent || '').trim() === 'Clientes');
    expect(clientesTab).toBeDefined();

    await act(async () => {
      clientesTab?.click();
    });

    expect(clientesTab?.getAttribute('aria-selected')).toBe('true');
    expect(dashboardArea?.textContent).toContain('Total de clientes');
    expect(dashboardArea?.textContent).toContain('Climatize SA');

    // Volta para Dashboard — deve voltar a mostrar Alertas de manutenção.
    const dashboardTab = Array.from(
      dashboardArea?.querySelectorAll('button[role="tab"]') ?? [],
    ).find((b) => (b.textContent || '').trim() === 'Dashboard');
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

    // Etapa default (id 3) renderiza descricao de "Servico e agendado".
    expect(fluxo?.textContent).toContain('Etapa 3 de 7');
    expect(fluxo?.textContent).toContain('Serviço é agendado');

    // Clica na etapa 1 (titulo "Cliente solicita atendimento") — primeira
    // ocorrencia do botao com `role="tab"` (desktop view + mobile view
    // renderizadas, ambas com mesmo texto).
    const stepButtons = Array.from(fluxo?.querySelectorAll('button[role="tab"]') ?? []).filter(
      (b) => (b.textContent || '').includes('Cliente solicita atendimento'),
    );
    expect(stepButtons.length).toBeGreaterThan(0);

    await act(async () => {
      stepButtons[0].click();
    });

    expect(fluxo?.textContent).toContain('Etapa 1 de 7');
    expect(fluxo?.textContent).toContain('Cliente solicita atendimento');
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

  it('ProblemsSection destaca problema ativo e mostra solucao ao clicar', async () => {
    const root = createRoot();
    await act(async () => {
      mountLandingPageReact(root, { onLogin: vi.fn() });
    });

    // Antes do clique, painel de solucao nao aparece.
    expect(root.textContent || '').not.toContain('Como o CoolTrackPro resolve');

    const osProblemBtn = findButtonByText(root, 'OS sem padrão');
    expect(osProblemBtn).toBeDefined();
    expect(osProblemBtn?.getAttribute('aria-pressed')).toBe('false');

    await act(async () => {
      osProblemBtn?.click();
    });

    expect(osProblemBtn?.getAttribute('aria-pressed')).toBe('true');
    expect(root.textContent || '').toContain('Como o CoolTrackPro resolve');
    expect(root.textContent || '').toContain('Templates de OS');

    // Toggle: clicar de novo no mesmo problema desativa.
    await act(async () => {
      osProblemBtn?.click();
    });
    expect(osProblemBtn?.getAttribute('aria-pressed')).toBe('false');
  });
});
