import { describe, expect, it } from 'vitest';
import {
  renderActiveContext,
  renderAlertStrip,
  renderSummary,
} from '../ui/views/clientes/summaryRenderer.js';

describe('clientes summaryRenderer', () => {
  it('renderActiveContext escapa termos dinâmicos', () => {
    const html = renderActiveContext({
      searchTerm: '<img src=x onerror=alert(1)>',
      statusFilter: 'sem_manutencao',
      cityFilter: 'Campinas<script>',
    });

    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('sem manutencao');
    expect(html).toContain('Campinas&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('renderAlertStrip não renderiza alerta para cliente sem histórico', () => {
    const html = renderAlertStrip({
      indexed: new Map([
        ['c1', { status: 'precisa_atencao', lastServiceTs: 0 }],
        ['c2', { status: 'sem_manutencao', lastServiceTs: 0 }],
      ]),
    });

    expect(html).toBe('');
  });

  it('renderSummary respeita summaryCollapsed em viewport mobile', () => {
    const html = renderSummary({
      clientes: [],
      equipamentos: [],
      registros: [],
      indexed: new Map(),
      summaryCollapsed: true,
      windowObj: { matchMedia: () => ({ matches: true }) },
    });

    expect(html).toContain('cli-summary is-collapsed');
    expect(html).toContain('aria-expanded="false"');
  });
});
