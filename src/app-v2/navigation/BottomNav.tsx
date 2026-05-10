import { useAutoHideNav } from './useAutoHideNav';
import { appV2Tone } from '../styles/tokens';

export type AppV2Tab = 'hoje' | 'equipamento' | 'servicos' | 'conta';

const navItems = [
  { id: 'hoje', label: 'Hoje', marker: 'H' },
  { id: 'equipamento', label: 'Equipamento', marker: 'E' },
  { id: 'servicos', label: 'Serviços', marker: 'S' },
  { id: 'conta', label: 'Conta', marker: 'C' },
] as const;

interface BottomNavProps {
  activeTab?: AppV2Tab;
  onSelectTab?: (tab: AppV2Tab) => void;
}

export function BottomNav({ activeTab = 'hoje', onSelectTab }: BottomNavProps) {
  const visible = useAutoHideNav();

  return (
    <nav
      className={`tw-fixed tw-inset-x-0 tw-bottom-0 tw-z-20 tw-border-t tw-bg-white/95 tw-px-3 tw-pb-[calc(10px+env(safe-area-inset-bottom))] tw-pt-2 tw-shadow-[0_-18px_42px_-32px_rgba(10,19,40,0.62)] tw-backdrop-blur tw-transition-transform tw-duration-200 ${appV2Tone.border}`}
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
              className={`tw-flex tw-min-h-14 tw-flex-col tw-items-center tw-justify-center tw-gap-1 tw-rounded-lg tw-border-0 tw-bg-transparent tw-px-1 tw-py-1.5 tw-text-xs tw-font-extrabold ${appV2Tone.focus} ${
                isActive ? 'tw-text-[#1D4ED8]' : appV2Tone.mutedText
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`tw-grid tw-h-6 tw-w-6 tw-place-items-center tw-rounded-md tw-text-[11px] tw-font-black ${
                  isActive ? 'tw-bg-[#E6F0FF] tw-text-[#1D4ED8]' : 'tw-bg-[#F6F9FC]'
                }`}
                aria-hidden="true"
              >
                {item.marker}
              </span>
              <span className="tw-leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
