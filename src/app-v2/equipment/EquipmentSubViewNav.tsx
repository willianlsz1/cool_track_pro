import { appV2Tone } from '../styles/tokens';

export type EquipmentSubView = 'equipments' | 'clients';

interface EquipmentSubViewNavProps {
  activeView: EquipmentSubView;
  onSelectView: (view: EquipmentSubView) => void;
}

const subViews: Array<{ id: EquipmentSubView; label: string }> = [
  { id: 'equipments', label: 'Equipamentos' },
  { id: 'clients', label: 'Clientes' },
];

export function EquipmentSubViewNav({ activeView, onSelectView }: EquipmentSubViewNavProps) {
  return (
    <div
      className={`tw-inline-flex tw-w-full tw-rounded-2xl tw-border tw-bg-white tw-p-1.5 sm:tw-w-auto ${appV2Tone.border}`}
      aria-label="Visões de Equipamentos"
    >
      {subViews.map((item) => {
        const isActive = item.id === activeView;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectView(item.id)}
            aria-pressed={isActive}
            className={`tw-min-h-9 tw-flex-1 tw-rounded-xl tw-border-0 tw-px-6 tw-text-sm tw-font-bold sm:tw-flex-none ${appV2Tone.focus} ${
              isActive ? 'tw-bg-[#1E4F8A] tw-text-white' : `${appV2Tone.mutedText} tw-bg-white`
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
