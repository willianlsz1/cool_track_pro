import { appV2Tone } from '../styles/tokens';

export type ServicesSubView = 'registros' | 'relatorios';

interface ServicesSubViewNavProps {
  activeView: ServicesSubView;
  onSelectView: (view: ServicesSubView) => void;
}

const subViews: Array<{ id: ServicesSubView; label: string }> = [
  { id: 'registros', label: 'Registros' },
  { id: 'relatorios', label: 'Relatorios' },
];

export function ServicesSubViewNav({ activeView, onSelectView }: ServicesSubViewNavProps) {
  return (
    <div
      className={`tw-flex tw-gap-2 tw-overflow-x-auto tw-rounded-2xl tw-border tw-bg-white tw-p-1 ${appV2Tone.border}`}
      aria-label="Subvisoes de servicos"
    >
      {subViews.map((view) => {
        const isActive = activeView === view.id;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelectView(view.id)}
            aria-pressed={isActive}
            className={`tw-min-h-10 tw-shrink-0 tw-rounded-xl tw-px-4 tw-text-sm tw-font-bold ${
              isActive
                ? 'tw-bg-[#2563EB] tw-text-white'
                : `${appV2Tone.mutedText} hover:tw-bg-[#F8FAFC]`
            } ${appV2Tone.focus}`}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
