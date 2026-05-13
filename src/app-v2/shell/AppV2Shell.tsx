import { useState } from 'react';

import { EquipmentDetail } from '../equipment/EquipmentDetail';
import { EquipmentList } from '../equipment/EquipmentList';
import { HomeToday } from '../home/HomeToday';
import { BottomNav, type AppV2Tab } from '../navigation/BottomNav';
import {
  completeService,
  startServiceFromEquipment as startServiceFlowAction,
  type AppV2FlowState,
} from '../data/appV2Actions';
import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import { selectAppV2OperationalState } from '../data/appV2Selectors';
import { ServiceFlow } from '../service/ServiceFlow';
import { ServicesHome } from '../service/ServicesHome';
import type { ServiceDraft } from '../service/serviceFlowViewModel';
import { appV2Tone } from '../styles/tokens';

export function AppV2Shell() {
  const [appState, setAppState] = useState<AppV2FlowState>(() => ({
    ...createAppV2MockSnapshot(),
    serviceDraft: null,
  }));
  const [activeTab, setActiveTab] = useState<AppV2Tab>('hoje');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [isServiceFlowOpen, setIsServiceFlowOpen] = useState(false);
  const operationalState = selectAppV2OperationalState(appState);
  const serviceDraft = operationalState.serviceDraft;

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

  function startServiceFromEquipment(equipmentId: string, commitmentId?: string) {
    const nextState = startServiceFlowAction(appState, equipmentId, commitmentId);
    setAppState(nextState);
    setIsServiceFlowOpen(true);
    setActiveTab('servicos');
  }

  function startFallbackService() {
    startServiceFromEquipment(operationalState.serviceFlowInput.equipamentos[0]?.id ?? 'eq-1');
  }

  function updateServiceDraft(draft: ServiceDraft) {
    setAppState((current) => ({
      ...current,
      serviceDraft: draft,
    }));
  }

  function completeCurrentService(draft: ServiceDraft) {
    setAppState((current) =>
      completeService(
        {
          ...current,
          serviceDraft: draft,
        },
        {
          id: `reg-shell-${current.registros.length + 1}`,
          date: current.today,
          technician: 'Técnico app-v2',
          diagnosis: draft.diagnosis,
          actionsDone: draft.actionsDone,
          finalStatus: draft.finalStatus,
        },
      ),
    );
  }

  return (
    <div className={`tw-min-h-screen tw-font-sans ${appV2Tone.page} ${appV2Tone.text}`}>
      {activeTab === 'hoje' ? (
        <HomeToday
          input={operationalState.homeInput}
          onOpenEquipment={openEquipment}
          onStartService={startServiceFromEquipment}
        />
      ) : null}

      {activeTab === 'equipamento' && selectedEquipmentId ? (
        <EquipmentDetail
          equipmentId={selectedEquipmentId}
          input={operationalState.equipmentInput}
          onBack={() => setSelectedEquipmentId(null)}
          onStartService={startServiceFromEquipment}
        />
      ) : null}

      {activeTab === 'equipamento' && !selectedEquipmentId ? (
        <EquipmentList input={operationalState.equipmentInput} onOpenEquipment={openEquipment} />
      ) : null}

      {activeTab === 'servicos' && isServiceFlowOpen && serviceDraft ? (
        <ServiceFlow
          input={operationalState.serviceFlowInput}
          initialDraft={serviceDraft}
          onBackToServices={() => setIsServiceFlowOpen(false)}
          onDraftChange={updateServiceDraft}
          onCompleteService={completeCurrentService}
          onOpenEquipment={openEquipment}
        />
      ) : null}

      {activeTab === 'servicos' && (!isServiceFlowOpen || !serviceDraft) ? (
        <ServicesHome
          draft={serviceDraft}
          input={operationalState.servicesInput}
          onResumeService={() => setIsServiceFlowOpen(true)}
          onStartService={startFallbackService}
        />
      ) : null}

      {activeTab === 'conta' ? (
        <Placeholder
          title="Conta"
          description="Preferências e dados da conta ficam fora desta fundação."
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
