import { describe, expect, it } from 'vitest';

import { buildAccountViewModel } from './accountViewModel';

describe('accountViewModel', () => {
  it('mapeia atalhos e preferencias locais sem areas sensiveis', () => {
    const viewModel = buildAccountViewModel({
      density: 'confortavel',
      startTab: 'hoje',
      reminderEnabled: false,
    });

    expect(viewModel).toMatchObject({
      title: 'Conta',
      subtitle: 'Painel local',
      description: 'Atalhos e preferências operacionais locais desta sessão.',
      emptyState: {
        title: 'Sem pendências locais',
        description: 'Preferências e atalhos estão prontos para uso nesta sessão.',
      },
      localBoundary: {
        title: 'Somente local',
        description: 'Dados reais e integrações ficam para etapas dedicadas.',
      },
      shortcutGroups: [
        {
          title: 'Atalhos operacionais',
          items: [
            { id: 'start-service', label: 'Registrar serviço' },
            { id: 'open-clients', label: 'Clientes' },
            { id: 'open-quotes', label: 'Orçamentos' },
            { id: 'open-alerts', label: 'Alertas' },
          ],
        },
      ],
      preferences: {
        density: {
          label: 'Densidade visual',
          valueLabel: 'Confortável',
          layoutClassName: 'tw-gap-5',
        },
        startTab: {
          label: 'Tela inicial',
          valueLabel: 'Hoje',
          actionLabel: 'Abrir Hoje',
        },
        reminder: {
          label: 'Lembrete visual',
          valueLabel: 'Desligado',
          banner: null,
        },
      },
    });
    expect(JSON.stringify(viewModel)).not.toContain('PMOC');
    expect(JSON.stringify(viewModel)).not.toContain(['Bill', 'ing'].join(''));
    expect(JSON.stringify(viewModel)).not.toContain('Supabase');
    expect(JSON.stringify(viewModel)).not.toContain('WhatsApp');
    expect(JSON.stringify(viewModel)).not.toContain('PDF');
    expect(JSON.stringify(viewModel)).not.toContain('mockadas');
  });

  it('expoe efeitos visiveis para preferencias locais ativadas', () => {
    const viewModel = buildAccountViewModel({
      density: 'compacta',
      startTab: 'servicos',
      reminderEnabled: true,
    });

    expect(viewModel.preferences.density).toMatchObject({
      valueLabel: 'Compacta',
      layoutClassName: 'tw-gap-3',
    });
    expect(viewModel.preferences.startTab).toMatchObject({
      valueLabel: 'Serviços',
      actionLabel: 'Abrir Serviços',
    });
    expect(viewModel.preferences.reminder).toMatchObject({
      valueLabel: 'Ligado',
      banner: 'Lembrete local ativo nesta sessão.',
    });
  });
});
