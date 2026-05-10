import { useAutoHideNav } from './useAutoHideNav';
import { appV2Tone } from '../styles/tokens';

const navItems = [
  { label: 'Hoje', marker: 'H', active: true },
  { label: 'Equipamento', marker: 'E', active: false },
  { label: 'Serviços', marker: 'S', active: false },
  { label: 'Conta', marker: 'C', active: false },
] as const;

export function BottomNav() {
  const visible = useAutoHideNav();

  return (
    <nav
      className={`tw-fixed tw-inset-x-0 tw-bottom-0 tw-z-20 tw-border-t tw-bg-white/95 tw-px-3 tw-pb-[calc(10px+env(safe-area-inset-bottom))] tw-pt-2 tw-shadow-[0_-18px_42px_-32px_rgba(10,19,40,0.62)] tw-backdrop-blur tw-transition-transform tw-duration-200 ${appV2Tone.border}`}
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      aria-label="Navegação principal"
    >
      <div className="tw-mx-auto tw-grid tw-max-w-[520px] tw-grid-cols-4 tw-gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`tw-flex tw-min-h-14 tw-flex-col tw-items-center tw-justify-center tw-gap-1 tw-rounded-lg tw-border-0 tw-bg-transparent tw-px-1 tw-py-1.5 tw-text-xs tw-font-extrabold ${appV2Tone.focus} ${
              item.active ? 'tw-text-[#1D4ED8]' : appV2Tone.mutedText
            }`}
            aria-current={item.active ? 'page' : undefined}
          >
            <span
              className={`tw-grid tw-h-6 tw-w-6 tw-place-items-center tw-rounded-md tw-text-[11px] tw-font-black ${
                item.active ? 'tw-bg-[#E6F0FF] tw-text-[#1D4ED8]' : 'tw-bg-[#F6F9FC]'
              }`}
              aria-hidden="true"
            >
              {item.marker}
            </span>
            <span className="tw-leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
