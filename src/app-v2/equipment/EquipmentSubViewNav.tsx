import { appV2Tabs } from '../styles/tokens';

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
    <div className={appV2Tabs.group} aria-label="Visões de Equipamentos">
      {subViews.map((item) => {
        const isActive = item.id === activeView;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectView(item.id)}
            aria-pressed={isActive}
            className={`${appV2Tabs.item} tw-flex-1 sm:tw-flex-none ${
              isActive ? appV2Tabs.active : appV2Tabs.inactive
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
