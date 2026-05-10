import { useState } from 'react';

import { EquipmentDetail } from '../equipment/EquipmentDetail';
import { EquipmentList } from '../equipment/EquipmentList';
import { HomeToday } from '../home/HomeToday';
import { BottomNav, type AppV2Tab } from '../navigation/BottomNav';
import { appV2Tone } from '../styles/tokens';

export function AppV2Shell() {
  const [activeTab, setActiveTab] = useState<AppV2Tab>('hoje');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  function selectTab(tab: AppV2Tab) {
    setActiveTab(tab);

    if (tab === 'equipamento') {
      setSelectedEquipmentId(null);
    }
  }

  function openEquipment(equipmentId: string) {
    setSelectedEquipmentId(equipmentId);
    setActiveTab('equipamento');
  }

  return (
    <div className={`tw-min-h-screen tw-font-sans ${appV2Tone.page} ${appV2Tone.text}`}>
      {activeTab === 'hoje' ? <HomeToday onOpenEquipment={openEquipment} /> : null}
      {activeTab === 'equipamento' && selectedEquipmentId ? (
        <EquipmentDetail
          equipmentId={selectedEquipmentId}
          onBack={() => setSelectedEquipmentId(null)}
        />
      ) : null}
      {activeTab === 'equipamento' && !selectedEquipmentId ? (
        <EquipmentList onOpenEquipment={openEquipment} />
      ) : null}
      {activeTab === 'servicos' ? (
        <Placeholder
          title="Serviços"
          description="A etapa de serviços será ligada depois da área Equipamento."
        />
      ) : null}
      {activeTab === 'conta' ? (
        <Placeholder
          title="Conta"
          description="Preferências e dados da conta ficam fora da Etapa 3."
        />
      ) : null}

      <BottomNav activeTab={activeTab} onSelectTab={selectTab} />
    </div>
  );
}

function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <main className="tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-[520px] tw-flex-col tw-px-4 tw-pb-36 tw-pt-5">
      <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
        <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>Em breve</p>
        <h1 className={`tw-mt-1 tw-text-3xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
          {title}
        </h1>
        <p className={`tw-mt-3 tw-text-sm tw-font-semibold tw-leading-6 ${appV2Tone.mutedText}`}>
          {description}
        </p>
      </section>
    </main>
  );
}
