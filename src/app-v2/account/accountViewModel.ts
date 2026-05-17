import type { AppV2Tab } from '../navigation/BottomNav';

export type AccountShortcutId = 'start-service' | 'open-clients' | 'open-quotes' | 'open-alerts';
export type AccountDensityPreference = 'confortavel' | 'compacta';
export type AccountStartTabPreference = Extract<AppV2Tab, 'hoje' | 'equipamento' | 'servicos'>;

export interface AccountPreferencesState {
  density: AccountDensityPreference;
  startTab: AccountStartTabPreference;
  reminderEnabled: boolean;
}

export interface AccountShortcutViewModel {
  id: AccountShortcutId;
  label: string;
  description: string;
}

export interface AccountShortcutGroupViewModel {
  title: string;
  items: AccountShortcutViewModel[];
}

export interface AccountPreferenceViewModel {
  label: string;
  valueLabel: string;
}

export interface AccountDensityPreferenceViewModel extends AccountPreferenceViewModel {
  layoutClassName: string;
}

export interface AccountStartTabPreferenceViewModel extends AccountPreferenceViewModel {
  actionLabel: string;
}

export interface AccountReminderPreferenceViewModel extends AccountPreferenceViewModel {
  banner: string | null;
}

export interface AccountLocalMessageViewModel {
  title: string;
  description: string;
}

export interface AccountViewModel {
  title: 'Conta';
  subtitle: 'Painel local';
  description: string;
  emptyState: AccountLocalMessageViewModel;
  localBoundary: AccountLocalMessageViewModel;
  shortcutGroups: AccountShortcutGroupViewModel[];
  preferences: {
    density: AccountDensityPreferenceViewModel;
    startTab: AccountStartTabPreferenceViewModel;
    reminder: AccountReminderPreferenceViewModel;
  };
  helpItems: string[];
}

export function buildAccountViewModel(preferences: AccountPreferencesState): AccountViewModel {
  return {
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
          {
            id: 'start-service',
            label: 'Registrar serviço',
            description: 'Abre o fluxo local de registro no app-v2.',
          },
          {
            id: 'open-clients',
            label: 'Clientes',
            description: 'Abre Equipamentos > Clientes.',
          },
          {
            id: 'open-quotes',
            label: 'Orçamentos',
            description: 'Abre Serviços > Orçamentos.',
          },
          {
            id: 'open-alerts',
            label: 'Alertas',
            description: 'Volta para a Home operacional.',
          },
        ],
      },
    ],
    preferences: {
      density: {
        label: 'Densidade visual',
        valueLabel: preferences.density === 'compacta' ? 'Compacta' : 'Confortável',
        layoutClassName: preferences.density === 'compacta' ? 'tw-gap-3' : 'tw-gap-5',
      },
      startTab: {
        label: 'Tela inicial',
        valueLabel: getStartTabLabel(preferences.startTab),
        actionLabel: `Abrir ${getStartTabLabel(preferences.startTab)}`,
      },
      reminder: {
        label: 'Lembrete visual',
        valueLabel: preferences.reminderEnabled ? 'Ligado' : 'Desligado',
        banner: preferences.reminderEnabled ? 'Lembrete local ativo nesta sessão.' : null,
      },
    },
    helpItems: [
      'Hoje concentra alertas e próximas ações.',
      'Equipamentos organiza parque, clientes e detalhes locais.',
      'Serviços concentra registros, relatórios e orçamentos locais.',
    ],
  };
}

function getStartTabLabel(tab: AccountStartTabPreference): string {
  if (tab === 'equipamento') {
    return 'Equipamentos';
  }

  if (tab === 'servicos') {
    return 'Serviços';
  }

  return 'Hoje';
}
