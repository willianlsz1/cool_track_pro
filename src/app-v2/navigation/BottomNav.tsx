import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faCircleUser,
  faMicrochip,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
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
      aria-label="Navegação principal"
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
      className="tw-fixed tw-inset-y-0 tw-left-0 tw-z-20 tw-hidden tw-box-border tw-w-[260px] tw-shrink-0 tw-bg-[#071D3A] tw-px-5 tw-py-7 tw-shadow-[1px_0_0_rgba(0,0,0,0.05)] lg:tw-flex lg:tw-flex-col"
      aria-label="Navegação principal"
    >
      <div className="tw-flex tw-items-center tw-gap-3 tw-pl-2">
        <img
          src="/icons/icon-192x192.png"
          alt=""
          className="tw-h-10 tw-w-10 tw-shrink-0 tw-rounded-xl tw-shadow-[0_16px_34px_-22px_rgba(56,189,248,0.8)]"
          aria-hidden="true"
        />
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-truncate tw-text-xl tw-font-bold tw-tracking-tight tw-text-white">
            CoolTrack Pro
          </p>
          <p className="tw-m-0 tw-mt-0.5 tw-text-[0.65rem] tw-font-medium tw-text-[#7C9BCB]">
            app-v2
          </p>
        </div>
      </div>

      <nav className="tw-mt-10 tw-flex tw-flex-col tw-gap-1.5">
        {navItems.map((item) => {
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab?.(item.id)}
              className={`tw-flex tw-min-h-10 tw-items-center tw-gap-3 tw-rounded-xl tw-border-0 tw-px-4 tw-text-left tw-text-sm tw-font-medium tw-transition-colors ${appV2Tone.focus} ${
                isActive
                  ? 'tw-bg-[#10345E] tw-text-white'
                  : 'tw-bg-transparent tw-text-[#CFE3FF] hover:tw-bg-[#0F2A4A] hover:tw-text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`tw-grid tw-h-6 tw-w-6 tw-shrink-0 tw-place-items-center ${
                  isActive ? 'tw-text-[#60A5FA]' : 'tw-text-[#7C9BCB]'
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
    return <FontAwesomeIcon icon={faCalendarDays} className="tw-h-5 tw-w-5" />;
  }

  if (name === 'equipment') {
    return <FontAwesomeIcon icon={faMicrochip} className="tw-h-5 tw-w-5" />;
  }

  if (name === 'service') {
    return <FontAwesomeIcon icon={faWrench} className="tw-h-5 tw-w-5" />;
  }

  return <FontAwesomeIcon icon={faCircleUser} className="tw-h-5 tw-w-5" />;
}
