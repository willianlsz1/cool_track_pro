import { useState } from 'react';

import { ClientDetail } from '../equipment/ClientDetail';
import { ClientList } from '../equipment/ClientList';
import { EquipmentDetail } from '../equipment/EquipmentDetail';
import { EquipmentList } from '../equipment/EquipmentList';
import type { EquipmentSubView } from '../equipment/EquipmentSubViewNav';
import { HomeToday } from '../home/HomeToday';
import { BottomNav, DesktopSidebar, type AppV2Tab } from '../navigation/BottomNav';
import {
  completeService,
  startServiceFromEquipment as startServiceFlowAction,
  updateServiceRecord,
  validateServiceCompletion,
  type AppV2FlowState,
} from '../data/appV2Actions';
import { createAppV2MockSnapshot, type AppV2MockSnapshot } from '../data/appV2MockStore';
import { selectAppV2OperationalState } from '../data/appV2Selectors';
import { ServiceFlow } from '../service/ServiceFlow';
import { ServiceEquipmentChoice } from '../service/ServiceEquipmentChoice';
import { ServicesHome } from '../service/ServicesHome';
import { createServiceDraftFromRecord, type ServiceDraft } from '../service/serviceFlowViewModel';
import { appV2Tone } from '../styles/tokens';
import { PageShell, SectionCard } from '../ui/primitives';

interface AppV2ShellProps {
  initialSnapshot?: AppV2MockSnapshot;
}

export function AppV2Shell({ initialSnapshot }: AppV2ShellProps) {
  const [appState, setAppState] = useState<AppV2FlowState>(() => ({
    ...(initialSnapshot ?? createAppV2MockSnapshot()),
    serviceDraft: null,
  }));
  const [activeTab, setActiveTab] = useState<AppV2Tab>('hoje');
  const [equipmentSubView, setEquipmentSubView] = useState<EquipmentSubView>('equipments');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isServiceFlowOpen, setIsServiceFlowOpen] = useState(false);
  const [isServiceEquipmentChoiceOpen, setIsServiceEquipmentChoiceOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const operationalState = selectAppV2OperationalState(appState);
  const serviceDraft = operationalState.serviceDraft;

  function selectTab(tab: AppV2Tab) {
    setActiveTab(tab);

    if (tab === 'equipamento') {
      setSelectedEquipmentId(null);
      setSelectedClientId(null);
      setEquipmentSubView('equipments');
    }

    if (tab !== 'servicos') {
      setIsServiceEquipmentChoiceOpen(false);
    }
  }

  function openEquipment(equipmentId: string) {
    setSelectedEquipmentId(equipmentId);
    setSelectedClientId(null);
    setEquipmentSubView('equipments');
    setActiveTab('equipamento');
  }

  function openClient(clientId: string) {
    setSelectedClientId(clientId);
    setSelectedEquipmentId(null);
    setEquipmentSubView('clients');
    setActiveTab('equipamento');
  }

  function selectEquipmentSubView(view: EquipmentSubView) {
    setEquipmentSubView(view);
    setSelectedEquipmentId(null);
    setSelectedClientId(null);
  }

  function startServiceFromEquipment(equipmentId: string, commitmentId?: string) {
    const nextState = startServiceFlowAction(appState, equipmentId, commitmentId);
    setAppState(nextState);
    setEditingServiceId(null);
    setIsServiceFlowOpen(true);
    setIsServiceEquipmentChoiceOpen(false);
    setActiveTab('servicos');
  }

  function startFallbackService() {
    setIsServiceFlowOpen(false);
    setIsServiceEquipmentChoiceOpen(true);
    setActiveTab('servicos');
  }

  function changeEditingEquipment() {
    if (!editingServiceId || !appState.serviceDraft) {
      return;
    }

    setIsServiceFlowOpen(false);
    setIsServiceEquipmentChoiceOpen(true);
    setActiveTab('servicos');
  }

  function selectEquipmentForService(equipmentId: string) {
    if (editingServiceId && appState.serviceDraft) {
      setAppState((current) => ({
        ...current,
        serviceDraft: current.serviceDraft
          ? {
              ...current.serviceDraft,
              equipmentId,
              commitmentId: undefined,
            }
          : current.serviceDraft,
      }));
      setIsServiceEquipmentChoiceOpen(false);
      setIsServiceFlowOpen(true);
      setActiveTab('servicos');
      return;
    }

    startServiceFromEquipment(equipmentId);
  }

  function openEquipmentListForService() {
    setIsServiceEquipmentChoiceOpen(false);
    setSelectedEquipmentId(null);
    setSelectedClientId(null);
    setEquipmentSubView('equipments');
    setActiveTab('equipamento');
  }

  function updateServiceDraft(draft: ServiceDraft) {
    setAppState((current) => ({
      ...current,
      serviceDraft: draft,
    }));
  }

  function completeCurrentService(draft: ServiceDraft) {
    setAppState((current) => {
      const completion = {
        id: editingServiceId ?? `reg-shell-${current.registros.length + 1}`,
        date: draft.serviceDate ?? current.today,
        technician: draft.technician,
        diagnosis: draft.diagnosis,
        actionsDone: draft.actionsDone,
        finalStatus: draft.finalStatus,
      };
      const stateWithDraft = {
        ...current,
        serviceDraft: draft,
      };

      return editingServiceId
        ? updateServiceRecord(stateWithDraft, completion)
        : completeService(stateWithDraft, completion);
    });
    setEditingServiceId(null);
  }

  function validateCurrentService(draft: ServiceDraft): string | null {
    try {
      validateServiceCompletion(
        {
          ...appState,
          serviceDraft: draft,
        },
        {
          id: editingServiceId ?? `reg-shell-${appState.registros.length + 1}`,
          date: draft.serviceDate ?? appState.today,
          technician: draft.technician,
          diagnosis: draft.diagnosis,
          actionsDone: draft.actionsDone,
          finalStatus: draft.finalStatus,
        },
      );
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Nao foi possivel concluir o servico.';
    }
  }

  function editServiceRecord(registroId: string) {
    const registro = appState.registros.find((item) => item.id === registroId);

    if (!registro) {
      return;
    }

    setEditingServiceId(registroId);
    setAppState((current) => ({
      ...current,
      serviceDraft: createServiceDraftFromRecord(registro),
    }));
    setIsServiceEquipmentChoiceOpen(false);
    setIsServiceFlowOpen(true);
    setActiveTab('servicos');
  }

  return (
    <div className="tw-min-h-screen tw-bg-[#061635] tw-font-sans tw-text-[#061635]">
      <DesktopSidebar activeTab={activeTab} onSelectTab={selectTab} />

      <div
        className={`tw-min-h-screen ${appV2Tone.page} lg:tw-ml-[248px] lg:tw-rounded-l-[28px] lg:tw-shadow-[-22px_0_50px_-44px_rgba(0,0,0,0.85)]`}
      >
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
            onOpenClient={openClient}
            onStartService={startServiceFromEquipment}
          />
        ) : null}

        {activeTab === 'equipamento' && selectedClientId ? (
          <ClientDetail
            clientId={selectedClientId}
            input={operationalState.equipmentInput}
            onBack={() => setSelectedClientId(null)}
            onOpenEquipment={openEquipment}
          />
        ) : null}

        {activeTab === 'equipamento' && !selectedEquipmentId && !selectedClientId ? (
          equipmentSubView === 'clients' ? (
            <ClientList
              input={operationalState.equipmentInput}
              activeView={equipmentSubView}
              onSelectView={selectEquipmentSubView}
              onOpenClient={openClient}
            />
          ) : (
            <EquipmentList
              input={operationalState.equipmentInput}
              activeView={equipmentSubView}
              onSelectView={selectEquipmentSubView}
              onOpenEquipment={openEquipment}
            />
          )
        ) : null}

        {activeTab === 'servicos' && isServiceEquipmentChoiceOpen ? (
          <ServiceEquipmentChoice
            clientes={operationalState.serviceFlowInput.clientes}
            equipamentos={operationalState.serviceFlowInput.equipamentos}
            onCreateEquipment={openEquipmentListForService}
            onSelectEquipment={selectEquipmentForService}
          />
        ) : null}

        {activeTab === 'servicos' &&
        !isServiceEquipmentChoiceOpen &&
        isServiceFlowOpen &&
        serviceDraft ? (
          <ServiceFlow
            input={operationalState.serviceFlowInput}
            initialDraft={serviceDraft}
            onBackToServices={() => setIsServiceFlowOpen(false)}
            onDraftChange={updateServiceDraft}
            onCompleteService={completeCurrentService}
            onValidateService={validateCurrentService}
            onChangeEquipment={editingServiceId ? changeEditingEquipment : undefined}
            onOpenEquipment={openEquipment}
          />
        ) : null}

        {activeTab === 'servicos' &&
        !isServiceEquipmentChoiceOpen &&
        (!isServiceFlowOpen || !serviceDraft) ? (
          <ServicesHome
            draft={serviceDraft}
            input={operationalState.servicesInput}
            onResumeService={() => setIsServiceFlowOpen(true)}
            onStartService={startFallbackService}
            onEditService={editServiceRecord}
          />
        ) : null}

        {activeTab === 'conta' ? (
          <Placeholder
            title="Conta"
            description="Preferências e dados da conta ficam fora desta fundação."
          />
        ) : null}
      </div>

      <BottomNav activeTab={activeTab} onSelectTab={selectTab} />
    </div>
  );
}

function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <PageShell className="tw-gap-0">
      <SectionCard className="sm:tw-p-6">
        <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
          Em breve
        </p>
        <h1
          className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}
        >
          {title}
        </h1>
        <p
          className={`tw-m-0 tw-mt-3 tw-max-w-[560px] tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}
        >
          {description}
        </p>
      </SectionCard>
    </PageShell>
  );
}
