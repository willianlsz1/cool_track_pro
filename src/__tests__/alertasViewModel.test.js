import { describe, expect, it } from 'vitest';

import { buildAlertasViewModel } from '../ui/viewModels/alertasViewModel.js';

describe('buildAlertasViewModel', () => {
  it('returns the setup empty state when there are no equipamentos', () => {
    const viewModel = buildAlertasViewModel({
      equipamentos: [],
      maintenanceAlerts: [],
      clienteAlerts: [],
      preventivas7dCount: 0,
    });

    expect(viewModel.cards).toEqual([]);
    expect(viewModel.contextBanner).toBeNull();
    expect(viewModel.emptyState).toMatchObject({
      ariaLabel: 'Sem equipamentos',
      title: 'Cadastre um equipamento para receber alertas',
      cta: { nav: 'equipamentos' },
    });
  });

  it('returns the positive empty state when equipamentos exist and no alerts are active', () => {
    const viewModel = buildAlertasViewModel({
      equipamentos: [{ id: 'eq-1' }],
      maintenanceAlerts: [],
      clienteAlerts: [],
      preventivas7dCount: 0,
    });

    expect(viewModel.cards).toEqual([]);
    expect(viewModel.emptyState).toMatchObject({
      ariaLabel: 'Sem alertas',
      title: 'Tudo em dia!',
      cta: { nav: 'equipamentos', tone: 'outline' },
    });
  });

  it('builds context, client cards first, and maintenance cards in existing order', () => {
    const viewModel = buildAlertasViewModel({
      equipamentos: [{ id: 'eq-1' }],
      maintenanceAlerts: [
        {
          severity: 'danger',
          icon: '!',
          title: 'Registrar preventiva',
          subtitle: 'Vence hoje',
          equipmentName: 'Split 01',
          recommendedAction: 'register-now',
          eq: { id: 'eq-1', nome: 'Split 01' },
        },
        {
          severity: 'warn',
          icon: '?',
          title: 'Inspecionar leitura',
          subtitle: 'Consumo acima do normal',
          recommendedAction: 'inspect',
          eq: { id: 'eq-2', nome: 'Self 02' },
        },
      ],
      clienteAlerts: [
        {
          clienteId: 'cli-1',
          clienteNome: 'ACME',
          note: 'Retorno combinado',
          daysRemaining: 0,
        },
      ],
      preventivas7dCount: 2,
    });

    expect(viewModel.contextBanner).toMatchObject({
      count: 2,
      action: 'go-equipamentos-preventiva-7d',
      ctaLabel: 'Ver equipamentos \u2192',
    });
    expect(viewModel.cards.map((card) => card.kind)).toEqual([
      'cliente',
      'equipamento',
      'equipamento',
    ]);
    expect(viewModel.cards[0]).toMatchObject({
      action: 'go-cliente-equipamentos',
      dataId: 'cli-1',
      clienteNome: 'ACME',
      equipmentLabel: 'Cliente',
      subtitle: 'Retorno combinado',
      title: 'Voltar ao cliente hoje: ACME',
      tone: 'warn',
    });
    expect(viewModel.cards[1]).toMatchObject({
      action: 'go-register-equip',
      dataId: 'eq-1',
      equipmentLabel: 'Split 01',
      title: 'Registrar preventiva',
      tone: 'critical',
    });
    expect(viewModel.cards[2]).toMatchObject({
      action: 'view-equip',
      dataId: 'eq-2',
      equipmentLabel: 'Self 02',
      tone: '',
    });
  });

  it('formats client alert status labels for overdue, today, and upcoming alerts', () => {
    const viewModel = buildAlertasViewModel({
      equipamentos: [{ id: 'eq-1' }],
      clienteAlerts: [
        { clienteId: 'late-1', clienteNome: 'Cliente A', daysRemaining: -1 },
        { clienteId: 'late-2', clienteNome: 'Cliente B', daysRemaining: -3 },
        { clienteId: 'today', clienteNome: 'Cliente C', daysRemaining: 0 },
        { clienteId: 'soon', clienteNome: 'Cliente D', daysRemaining: 2 },
      ],
    });

    expect(viewModel.cards.map((card) => card.title)).toEqual([
      'Voltar ao cliente: Cliente A (vencido ha 1 dia)',
      'Voltar ao cliente: Cliente B (vencido ha 3 dias)',
      'Voltar ao cliente hoje: Cliente C',
      'Voltar ao cliente em 2 dias: Cliente D',
    ]);
    expect(viewModel.cards.map((card) => card.tone)).toEqual(['critical', 'critical', 'warn', '']);
  });

  it('handles missing or invalid data without DOM or React dependencies', () => {
    const viewModel = buildAlertasViewModel({
      equipamentos: [{ id: 'eq-1' }],
      maintenanceAlerts: [
        null,
        {
          recommendedAction: 'unknown-action',
          eq: null,
        },
      ],
      clienteAlerts: [
        null,
        { clienteId: 'future', clienteNome: 'Futuro', daysRemaining: 8 },
        { clienteId: 'missing-name', daysRemaining: 1 },
      ],
      preventivas7dCount: Number.NaN,
    });

    expect(viewModel.contextBanner).toBeNull();
    expect(viewModel.cards).toHaveLength(2);
    expect(viewModel.cards[0]).toMatchObject({
      kind: 'cliente',
      dataId: 'missing-name',
      clienteNome: '',
      title: 'Voltar ao cliente em 1 dia: ',
    });
    expect(viewModel.cards[1]).toMatchObject({
      kind: 'equipamento',
      action: 'view-equip',
      dataId: '',
      icon: '!',
      title: '',
      subtitle: '',
      equipmentLabel: '-',
    });
  });
});
