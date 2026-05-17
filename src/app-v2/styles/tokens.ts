export const appV2Text = {
  primary: 'tw-text-[#061635]',
  muted: 'tw-text-[#31476A]',
  subtle: 'tw-text-[#697A99]',
  action: 'tw-text-[#2563EB]',
  neutral: 'tw-text-[#334155]',
  disabled: 'tw-text-[#7A8AA6]',
  danger: 'tw-text-[#DC2626]',
  warning: 'tw-text-[#D97706]',
  success: 'tw-text-[#16A34A]',
} as const;

export const appV2Surface = {
  page: 'tw-bg-[#F3F7FC]',
  card: 'tw-bg-white',
  muted: 'tw-bg-[#F8FAFC]',
  subtle: 'tw-bg-[#F6F8FB]',
  actionSoft: 'tw-bg-[#EFF6FF]',
  disabled: 'tw-bg-[#E8EEF7]',
  dangerSoft: 'tw-bg-[#FEF2F2]',
  warningSoft: 'tw-bg-[#FFF7ED]',
  successSoft: 'tw-bg-[#F0FDF4]',
} as const;

export const appV2Border = {
  default: 'tw-border-[#E5EAF0]',
  disabled: 'tw-border-[#D7E3F2]',
  danger: 'tw-border-[#FECACA]',
  warning: 'tw-border-[#FED7AA]',
  success: 'tw-border-[#BBF7D0]',
} as const;

export const appV2Shadow = {
  card: 'tw-shadow-[0_20px_52px_-40px_rgba(15,23,42,0.46)]',
  action: 'tw-shadow-[0_20px_34px_-22px_rgba(37,99,235,0.95)]',
} as const;

export const appV2Focus =
  'focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#2CC7EA]';

export const appV2Interactive = {
  hoverMuted: 'hover:tw-bg-[#F8FAFC]',
  disabledControl:
    'disabled:tw-border-[#D7E3F2] disabled:tw-bg-[#E8EEF7] disabled:tw-text-[#7A8AA6] disabled:tw-shadow-none',
} as const;

export const appV2Status = {
  danger: {
    surface: appV2Surface.dangerSoft,
    text: appV2Text.danger,
    border: appV2Border.danger,
  },
  warning: {
    surface: appV2Surface.warningSoft,
    text: appV2Text.warning,
    border: appV2Border.warning,
  },
  success: {
    surface: appV2Surface.successSoft,
    text: appV2Text.success,
    border: appV2Border.success,
  },
  primary: {
    surface: appV2Surface.actionSoft,
    text: appV2Text.action,
    border: appV2Border.default,
  },
  muted: {
    surface: appV2Surface.muted,
    text: appV2Text.muted,
    border: appV2Border.default,
  },
} as const;

export const appV2Tone = {
  page: appV2Surface.page,
  surface: appV2Surface.card,
  surfaceBlue: appV2Surface.actionSoft,
  text: appV2Text.primary,
  mutedText: appV2Text.muted,
  subtleText: appV2Text.subtle,
  border: appV2Border.default,
  action: 'tw-bg-[#2563EB] tw-text-white hover:tw-bg-[#1D4ED8]',
  actionSoft: `${appV2Surface.actionSoft} ${appV2Text.action}`,
  focus: appV2Focus,
  warning: `${appV2Status.warning.surface} ${appV2Status.warning.text} ${appV2Status.warning.border}`,
  danger: `${appV2Status.danger.surface} ${appV2Status.danger.text} ${appV2Status.danger.border}`,
  success: `${appV2Status.success.surface} ${appV2Status.success.text} ${appV2Status.success.border}`,
} as const;
