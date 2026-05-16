import { useAutoHideNav } from './useAutoHideNav';
import { appV2Tone } from '../styles/tokens';

export type AppV2Tab = 'hoje' | 'equipamento' | 'servicos' | 'conta';

const navItems = [
  { id: 'hoje', label: 'Hoje', desktopLabel: 'Hoje', marker: 'home' },
  { id: 'equipamento', label: 'Equipamento', desktopLabel: 'Equipamentos', marker: 'equipment' },
  { id: 'servicos', label: 'Serviços', desktopLabel: 'Serviços', marker: 'service' },
  { id: 'conta', label: 'Conta', desktopLabel: 'Conta', marker: 'account' },
] as const;

interface BottomNavProps {
  activeTab?: AppV2Tab;
  onSelectTab?: (tab: AppV2Tab) => void;
}

export function BottomNav({ activeTab = 'hoje', onSelectTab }: BottomNavProps) {
  const visible = useAutoHideNav();

  return (
    <nav
      className={`tw-fixed tw-inset-x-0 tw-bottom-0 tw-z-20 tw-border-t tw-bg-white/95 tw-px-3 tw-pb-[calc(10px+env(safe-area-inset-bottom))] tw-pt-2 tw-shadow-[0_-18px_42px_-32px_rgba(15,23,42,0.28)] tw-backdrop-blur tw-transition-transform tw-duration-200 lg:tw-hidden ${appV2Tone.border}`}
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      aria-label="Navegacao principal"
    >
      <div className="tw-mx-auto tw-grid tw-max-w-[520px] tw-grid-cols-4 tw-gap-1">
        {navItems.map((item) => {
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab?.(item.id)}
              className={`tw-flex tw-min-h-14 tw-flex-col tw-items-center tw-justify-center tw-gap-1 tw-rounded-lg tw-border-0 tw-bg-transparent tw-px-1 tw-py-1.5 tw-text-xs tw-font-semibold ${appV2Tone.focus} ${
                isActive ? 'tw-text-[#2563EB]' : appV2Tone.mutedText
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`tw-grid tw-h-6 tw-w-6 tw-place-items-center tw-rounded-md ${
                  isActive ? 'tw-bg-[#EFF6FF] tw-text-[#2563EB]' : 'tw-bg-[#F6F8FB]'
                }`}
                aria-hidden="true"
              >
                <NavIcon name={item.marker} />
              </span>
              <span className="tw-leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface DesktopSidebarProps {
  activeTab?: AppV2Tab;
  onSelectTab?: (tab: AppV2Tab) => void;
}

export function DesktopSidebar({ activeTab = 'hoje', onSelectTab }: DesktopSidebarProps) {
  return (
    <aside
      className="tw-fixed tw-inset-y-0 tw-left-0 tw-z-20 tw-hidden tw-box-border tw-w-[248px] tw-border-r tw-border-[#163157] tw-bg-[#061635] tw-px-5 tw-py-7 lg:tw-flex lg:tw-flex-col"
      aria-label="Navegacao principal"
    >
      <div className="tw-flex tw-items-center tw-gap-3">
        <img
          src="/icons/icon-192x192.png"
          alt=""
          className="tw-h-10 tw-w-10 tw-shrink-0 tw-rounded-xl tw-shadow-[0_16px_34px_-22px_rgba(56,189,248,0.8)]"
          aria-hidden="true"
        />
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-truncate tw-text-sm tw-font-bold tw-text-white">CoolTrack Pro</p>
          <p className="tw-m-0 tw-mt-0.5 tw-text-xs tw-font-semibold tw-text-[#46C8F0]">app-v2</p>
        </div>
      </div>

      <nav className="tw-mt-12 tw-flex tw-flex-col tw-gap-2">
        {navItems.map((item) => {
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab?.(item.id)}
              className={`tw-flex tw-min-h-12 tw-items-center tw-gap-3 tw-rounded-xl tw-border tw-px-3 tw-text-left tw-text-sm tw-font-semibold tw-transition-colors ${appV2Tone.focus} ${
                isActive
                  ? 'tw-border-[#67E8F9] tw-bg-[#2CC7EA] tw-text-[#041329] tw-shadow-[0_18px_34px_-22px_rgba(44,199,234,0.8)]'
                  : 'tw-border-transparent tw-bg-[#0A1D3A] tw-text-[#B7C4DE] hover:tw-border-[#244466] hover:tw-bg-[#102B4D] hover:tw-text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`tw-grid tw-h-7 tw-w-7 tw-shrink-0 tw-place-items-center ${
                  isActive ? 'tw-text-[#041329]' : 'tw-text-[#85A4C8]'
                }`}
                aria-hidden="true"
              >
                <NavIcon name={item.marker} />
              </span>
              <span>{item.desktopLabel}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function NavIcon({ name }: { name: (typeof navItems)[number]['marker'] }) {
  if (name === 'home') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="tw-h-5 tw-w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === 'equipment') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="tw-h-5 tw-w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M10 17h4" />
      </svg>
    );
  }

  if (name === 'service') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="tw-h-5 tw-w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-3 1.5-1.5-1.5 1.5-3z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="tw-h-5 tw-w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
