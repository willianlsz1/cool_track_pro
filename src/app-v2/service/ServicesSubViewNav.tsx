import { appV2Tabs } from '../styles/tokens';

export type ServicesSubView = 'registros' | 'relatorios' | 'orcamentos';

interface ServicesSubViewNavProps {
  activeView: ServicesSubView;
  onSelectView: (view: ServicesSubView) => void;
}

const subViews: Array<{ id: ServicesSubView; label: string }> = [
  { id: 'registros', label: 'Registros' },
  { id: 'relatorios', label: 'Relatórios' },
  { id: 'orcamentos', label: 'Orçamentos' },
];

export function ServicesSubViewNav({ activeView, onSelectView }: ServicesSubViewNavProps) {
  return (
    <div className={appV2Tabs.group} aria-label="Subvisões de serviços">
      {subViews.map((view) => {
        const isActive = activeView === view.id;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelectView(view.id)}
            aria-pressed={isActive}
            className={`${appV2Tabs.item} ${isActive ? appV2Tabs.active : appV2Tabs.inactive}`}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
