import { useEffect, useState } from 'react';

import { AccountHome } from '../account/AccountHome';
import { AlertsHome } from '../alerts/AlertsHome';
import type {
  AccountPreferencesState,
  AccountShortcutId,
  AccountStartTabPreference,
} from '../account/accountViewModel';
import { ClientDetail } from '../equipment/ClientDetail';
import type { ClientSaveResult } from '../equipment/ClientForm';
import { ClientList } from '../equipment/ClientList';
import { EquipmentDetail } from '../equipment/EquipmentDetail';
import type { EquipmentSaveResult } from '../equipment/EquipmentForm';
import { EquipmentList } from '../equipment/EquipmentList';
import { saveClient, type SaveClientDraft } from '../equipment/clientActions';
import {
  archiveEquipment,
  deleteEquipmentSector,
  saveEquipment,
  saveEquipmentAttachment,
  saveEquipmentSector,
  type SaveEquipmentDraft,
  type SaveEquipmentSectorDraft,
  unarchiveEquipment,
} from '../equipment/equipmentActions';
import type { EquipmentSubView } from '../equipment/EquipmentSubViewNav';
import { HomeToday } from '../home/HomeToday';
import { BottomNav, DesktopSidebar, type AppV2Tab } from '../navigation/BottomNav';
import {
  createQuoteFromServiceRecord,
  createPreServiceQuoteDraft,
  scheduleNextCommitment,
  startServiceFromEquipment as startServiceFlowAction,
  updateQuoteDraft,
  validateServiceCompletion,
  type AppV2FlowState,
} from '../data/appV2Actions';
import type { AppV2DataPort } from '../data/appV2DataPort';
import { createAppV2MockSnapshot, type AppV2MockSnapshot } from '../data/appV2MockStore';
import { selectAppV2OperationalState } from '../data/appV2Selectors';
import { ServiceFlow } from '../service/ServiceFlow';
import { ServiceEquipmentChoice } from '../service/ServiceEquipmentChoice';
import { ServicesHome } from '../service/ServicesHome';
import type { PreServiceQuoteCreateDraft, QuoteEditDraft } from '../service/ServicesQuotesHome';
import type { ServicesSubView } from '../service/ServicesSubViewNav';
import type { ServiceActionResult } from '../service/serviceActionResult';
import { createServiceDraftFromRecord, type ServiceDraft } from '../service/serviceFlowViewModel';
import { appV2Tone } from '../styles/tokens';
import {
  buildCompleteServiceInput,
  completeServiceDraft,
  createNextClientId,
  createNextEquipmentId,
  createNextSectorId,
  preserveCurrentServiceDraft,
} from './appV2ShellState';

interface AppV2ShellProps {
  initialSnapshot?: AppV2MockSnapshot;
  dataPort?: AppV2DataPort;
}

type EquipmentArchiveResult = string | null | Promise<string | null>;
type EquipmentAttachmentResult = string | null | Promise<string | null>;
type EquipmentSectorResult = string | null | Promise<string | null>;
type PreventiveScheduleResult = string | null | Promise<string | null>;

export function AppV2Shell({ initialSnapshot, dataPort }: AppV2ShellProps) {
  const [appState, setAppState] = useState<AppV2FlowState>(() => ({
    ...(initialSnapshot ?? createAppV2MockSnapshot()),
    serviceDraft: null,
  }));
  const [activeTab, setActiveTab] = useState<AppV2Tab>('hoje');
  const [homeView, setHomeView] = useState<'overview' | 'alerts'>('overview');
  const [equipmentSubView, setEquipmentSubView] = useState<EquipmentSubView>('equipments');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isServiceFlowOpen, setIsServiceFlowOpen] = useState(false);
  const [isServiceEquipmentChoiceOpen, setIsServiceEquipmentChoiceOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [completedServiceRecordId, setCompletedServiceRecordId] = useState<string | null>(null);
  const [servicesInitialView, setServicesInitialView] = useState<ServicesSubView>('registros');
  const [accountPreferences, setAccountPreferences] = useState<AccountPreferencesState>({
    density: 'confortavel',
    startTab: 'hoje',
    reminderEnabled: false,
  });
  const [startServiceAfterEquipmentCreate, setStartServiceAfterEquipmentCreate] = useState(false);
  const [equipmentFormClientId, setEquipmentFormClientId] = useState<string | null>(null);
  const operationalState = selectAppV2OperationalState(appState);
  const serviceDraft = operationalState.serviceDraft;

  useEffect(() => {
    if (!dataPort) {
      return undefined;
    }

    let isActive = true;

    dataPort
      .loadSnapshot()
      .then((nextState) => {
        if (!isActive) {
          return;
        }

        setAppState({
          ...nextState,
          serviceDraft: nextState.serviceDraft ?? null,
        });
      })
      .catch(() => {
        // The app-v2 preview must remain usable when an injected read source fails.
      });

    return () => {
      isActive = false;
    };
  }, [dataPort]);

  function selectTab(tab: AppV2Tab) {
    setActiveTab(tab);

    if (tab === 'hoje') {
      setHomeView('overview');
    }

    if (tab === 'equipamento') {
      setSelectedEquipmentId(null);
      setSelectedClientId(null);
      setEquipmentSubView('equipments');
      setEquipmentFormClientId(null);
    }

    if (tab !== 'servicos') {
      setIsServiceEquipmentChoiceOpen(false);
    }

    if (tab !== 'equipamento') {
      setStartServiceAfterEquipmentCreate(false);
      setEquipmentFormClientId(null);
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
    setEquipmentFormClientId(null);
  }

  function startServiceFromEquipment(equipmentId: string, commitmentId?: string) {
    if (dataPort) {
      return dataPort
        .startServiceFromEquipment(equipmentId, commitmentId)
        .then((nextState) => {
          openStartedService(nextState);
          return null;
        })
        .catch(() => null);
    }

    const nextState = startServiceFlowAction(appState, equipmentId, commitmentId);
    openStartedService(nextState);
    return null;
  }

  function openStartedService(nextState: AppV2FlowState) {
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
    setStartServiceAfterEquipmentCreate(true);
    setActiveTab('equipamento');
  }

  function updateServiceDraft(draft: ServiceDraft) {
    setAppState((current) => ({
      ...current,
      serviceDraft: draft,
    }));
  }

  function saveEquipmentDraft(draft: SaveEquipmentDraft): EquipmentSaveResult {
    try {
      const equipmentId =
        draft.id || createNextEquipmentId(appState.equipamentos.length + 1, appState);
      const nextDraft = {
        ...draft,
        id: equipmentId,
      };

      if (dataPort) {
        return dataPort
          .saveEquipment(nextDraft)
          .then((nextState) => {
            if (startServiceAfterEquipmentCreate && draft.mode !== 'edit') {
              return dataPort.startServiceFromEquipment(equipmentId).then((serviceState) => {
                openStartedService(serviceState);
                setStartServiceAfterEquipmentCreate(false);
                return null;
              });
            }

            setAppState(preserveCurrentServiceDraft(appState, nextState));
            setStartServiceAfterEquipmentCreate(false);
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível salvar o equipamento.'));
      }

      const nextState = saveEquipment(appState, nextDraft);

      if (startServiceAfterEquipmentCreate && draft.mode !== 'edit') {
        const serviceState = startServiceFlowAction(nextState, equipmentId);

        setAppState(serviceState);
        setEditingServiceId(null);
        setIsServiceFlowOpen(true);
        setIsServiceEquipmentChoiceOpen(false);
        setStartServiceAfterEquipmentCreate(false);
        setActiveTab('servicos');
        return null;
      }

      setAppState(preserveCurrentServiceDraft(appState, nextState));
      setStartServiceAfterEquipmentCreate(false);
      return null;
    } catch (error) {
      return getSaveErrorMessage(error, 'Não foi possível salvar o equipamento.');
    }
  }

  function saveClientDraft(draft: SaveClientDraft): ClientSaveResult {
    try {
      const clientId = draft.id || createNextClientId(appState.clientes.length + 1, appState);
      const nextDraft = {
        ...draft,
        id: clientId,
      };

      if (dataPort) {
        return dataPort
          .saveClient(nextDraft)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível salvar o cliente.'));
      }

      const nextState = saveClient(appState, nextDraft);

      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return getSaveErrorMessage(error, 'Não foi possível salvar o cliente.');
    }
  }

  function saveSectorDraft(draft: SaveEquipmentSectorDraft): EquipmentSectorResult {
    try {
      const sectorId = draft.id || createNextSectorId(appState.setores.length + 1, appState);
      const nextDraft = {
        ...draft,
        id: sectorId,
      };

      if (dataPort) {
        return dataPort
          .saveSector(nextDraft)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível salvar o setor.'));
      }

      const nextState = saveEquipmentSector(appState, nextDraft);

      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível salvar o setor.';
    }
  }

  function deleteSectorDraft(sectorId: string): EquipmentSectorResult {
    try {
      if (dataPort) {
        return dataPort
          .deleteSector(sectorId)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível remover o setor.'));
      }

      const nextState = deleteEquipmentSector(appState, sectorId);

      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível remover o setor.';
    }
  }

  function archiveEquipmentDraft(equipmentId: string): EquipmentArchiveResult {
    try {
      if (dataPort) {
        return dataPort
          .archiveEquipment(equipmentId, appState.today)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível arquivar o equipamento.'));
      }

      const nextState = archiveEquipment(appState, equipmentId, appState.today);

      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível arquivar o equipamento.';
    }
  }

  function unarchiveEquipmentDraft(equipmentId: string): EquipmentArchiveResult {
    try {
      if (dataPort) {
        return dataPort
          .unarchiveEquipment(equipmentId)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) =>
            getSaveErrorMessage(error, 'Não foi possível desarquivar o equipamento.'),
          );
      }

      const nextState = unarchiveEquipment(appState, equipmentId);

      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível desarquivar o equipamento.';
    }
  }

  function addPlaceholderAttachmentDraft(equipmentId: string): EquipmentAttachmentResult {
    const equipment = appState.equipamentos.find((item) => item.id === equipmentId);
    const attachmentCount = equipment?.anexos?.length ?? 0;
    const nextIndex = attachmentCount + 1;
    const attachment = {
      id: `foto-${equipmentId}-${nextIndex}`,
      kind: 'foto',
      label: nextIndex === 1 ? 'Foto principal local' : `Foto local ${nextIndex}`,
      source: 'placeholder',
      createdAt: appState.today,
      cover: nextIndex === 1,
    } as const;

    try {
      if (dataPort) {
        return dataPort
          .saveEquipmentAttachment(equipmentId, attachment)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível adicionar a foto.'));
      }

      const nextState = saveEquipmentAttachment(appState, equipmentId, attachment);

      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível adicionar a foto.';
    }
  }

  function schedulePreventiveDraft(
    equipmentId: string,
    targetDate: string,
  ): PreventiveScheduleResult {
    try {
      if (!isValidLocalIsoDate(targetDate)) {
        return 'Informe uma data válida para agendar a preventiva.';
      }

      const input = {
        id: `compromisso-local-${equipmentId}-${appState.compromissos.length + 1}`,
        equipmentId,
        kind: 'preventiva',
        targetDate,
        origin: 'periodicidade',
      } as const;

      if (dataPort) {
        return dataPort
          .scheduleCommitment(input)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível agendar a preventiva.'));
      }

      const nextState = scheduleNextCommitment(appState, input);

      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível agendar a preventiva.';
    }
  }

  function createEquipmentForClient(clientId: string) {
    setSelectedClientId(null);
    setSelectedEquipmentId(null);
    setEquipmentSubView('equipments');
    setEquipmentFormClientId(clientId);
    setActiveTab('equipamento');
  }

  function completeCurrentService(draft: ServiceDraft): ServiceActionResult {
    try {
      if (completedServiceRecordId) {
        setAppState((current) => ({
          ...current,
          serviceDraft: null,
        }));
        setCompletedServiceRecordId(null);
        setEditingServiceId(null);
        return null;
      }

      if (dataPort) {
        const input = buildCompleteServiceInput(appState, draft, editingServiceId);
        const completion = editingServiceId
          ? dataPort.updateServiceRecord(input)
          : dataPort.completeService(input);

        return completion
          .then((nextState) => {
            setAppState({
              ...nextState,
              serviceDraft: nextState.serviceDraft ?? null,
            });
            setCompletedServiceRecordId(null);
            setEditingServiceId(null);
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível concluir o serviço.'));
      }

      setAppState((current) => completeServiceDraft(current, draft, editingServiceId).nextState);
      setEditingServiceId(null);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível concluir o serviço.';
    }
  }

  function createQuoteFromCompletedService(draft: ServiceDraft): ServiceActionResult {
    try {
      if (dataPort) {
        const input = buildCompleteServiceInput(appState, draft, editingServiceId);
        const recordId = completedServiceRecordId ?? input.id;
        const completion = completedServiceRecordId
          ? Promise.resolve(appState)
          : editingServiceId
            ? dataPort.updateServiceRecord(input)
            : dataPort.completeService(input);

        return completion
          .then((completedState) => {
            if (!completedServiceRecordId) {
              setAppState(preserveCurrentServiceDraft(appState, completedState));
              setCompletedServiceRecordId(recordId);
            }

            return dataPort.createQuoteFromServiceRecord({
              id: `orcamento-${recordId}`,
              recordId,
            });
          })
          .then((nextState) => {
            setAppState({
              ...nextState,
              serviceDraft: nextState.serviceDraft ?? null,
            });
            setCompletedServiceRecordId(null);
            openPostServiceQuoteView();
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível criar o orçamento.'));
      }

      setAppState((current) => {
        const { nextState, recordId } = completeServiceDraft(current, draft, editingServiceId);

        return createQuoteFromServiceRecord(nextState, {
          id: `orcamento-${recordId}`,
          recordId,
        });
      });
      openPostServiceQuoteView();
      return null;
    } catch (error) {
      return getSaveErrorMessage(error, 'Não foi possível criar o orçamento.');
    }
  }

  function openPostServiceQuoteView() {
    setEditingServiceId(null);
    setIsServiceFlowOpen(false);
    setIsServiceEquipmentChoiceOpen(false);
    setServicesInitialView('orcamentos');
    setActiveTab('servicos');
  }

  function saveQuoteDraft(draft: QuoteEditDraft): ServiceActionResult {
    try {
      if (dataPort) {
        return dataPort
          .updateQuoteDraft(draft)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível salvar o orçamento.'));
      }

      const nextState = updateQuoteDraft(appState, draft);
      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível salvar o orçamento.';
    }
  }

  function createPreServiceQuote(draft: PreServiceQuoteCreateDraft): ServiceActionResult {
    try {
      if (dataPort) {
        return dataPort
          .createPreServiceQuote(draft)
          .then((nextState) => {
            setAppState(preserveCurrentServiceDraft(appState, nextState));
            return null;
          })
          .catch((error) => getSaveErrorMessage(error, 'Não foi possível criar o orçamento.'));
      }

      const nextState = createPreServiceQuoteDraft(appState, draft);
      setAppState(preserveCurrentServiceDraft(appState, nextState));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível criar o orçamento.';
    }
  }

  function validateCurrentService(draft: ServiceDraft): string | null {
    try {
      validateServiceCompletion(
        {
          ...appState,
          serviceDraft: draft,
        },
        buildCompleteServiceInput(appState, draft, editingServiceId),
      );
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Não foi possível concluir o serviço.';
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

  function runAccountShortcut(shortcut: AccountShortcutId) {
    if (shortcut === 'start-service') {
      startFallbackService();
      return;
    }

    if (shortcut === 'open-clients') {
      setSelectedEquipmentId(null);
      setSelectedClientId(null);
      setEquipmentSubView('clients');
      setEquipmentFormClientId(null);
      setActiveTab('equipamento');
      return;
    }

    if (shortcut === 'open-quotes') {
      setServicesInitialView('orcamentos');
      setIsServiceEquipmentChoiceOpen(false);
      setIsServiceFlowOpen(false);
      setActiveTab('servicos');
      return;
    }

    setHomeView('alerts');
    setActiveTab('hoje');
  }

  function openEquipmentList() {
    setSelectedEquipmentId(null);
    setSelectedClientId(null);
    setEquipmentSubView('equipments');
    setEquipmentFormClientId(null);
    setActiveTab('equipamento');
    setHomeView('overview');
  }

  function openAccountStartTab(tab: AccountStartTabPreference) {
    if (tab === 'equipamento') {
      setSelectedEquipmentId(null);
      setSelectedClientId(null);
      setEquipmentSubView('equipments');
      setEquipmentFormClientId(null);
      setActiveTab('equipamento');
      return;
    }

    if (tab === 'servicos') {
      setServicesInitialView('registros');
      setIsServiceEquipmentChoiceOpen(false);
      setIsServiceFlowOpen(false);
      setActiveTab('servicos');
      return;
    }

    setActiveTab('hoje');
  }

  return (
    <div className="tw-min-h-screen tw-bg-[#061635] tw-font-sans tw-text-[#061635]">
      <DesktopSidebar activeTab={activeTab} onSelectTab={selectTab} />

      <div
        className={`tw-min-h-screen ${appV2Tone.page} lg:tw-ml-[260px] lg:tw-rounded-l-[28px] lg:tw-shadow-[-22px_0_50px_-44px_rgba(0,0,0,0.85)]`}
      >
        {activeTab === 'hoje' && homeView === 'overview' ? (
          <HomeToday
            input={operationalState.homeInput}
            onOpenEquipment={openEquipment}
            onStartService={startServiceFromEquipment}
            onOpenAlerts={() => setHomeView('alerts')}
            onOpenQuotes={() => {
              setServicesInitialView('orcamentos');
              setIsServiceEquipmentChoiceOpen(false);
              setIsServiceFlowOpen(false);
              setActiveTab('servicos');
            }}
          />
        ) : null}

        {activeTab === 'hoje' && homeView === 'alerts' ? (
          <AlertsHome
            input={operationalState.homeInput}
            onOpenEquipment={openEquipment}
            onOpenEquipmentList={openEquipmentList}
          />
        ) : null}

        {activeTab === 'equipamento' && selectedEquipmentId ? (
          <EquipmentDetail
            equipmentId={selectedEquipmentId}
            input={operationalState.equipmentInput}
            onBack={() => setSelectedEquipmentId(null)}
            onOpenClient={openClient}
            onStartService={startServiceFromEquipment}
            onSaveEquipment={saveEquipmentDraft}
            onArchiveEquipment={archiveEquipmentDraft}
            onUnarchiveEquipment={unarchiveEquipmentDraft}
            onAddPlaceholderAttachment={addPlaceholderAttachmentDraft}
            onSchedulePreventive={schedulePreventiveDraft}
          />
        ) : null}

        {activeTab === 'equipamento' && selectedClientId ? (
          <ClientDetail
            clientId={selectedClientId}
            input={operationalState.equipmentInput}
            onBack={() => setSelectedClientId(null)}
            onOpenEquipment={openEquipment}
            onSaveClient={saveClientDraft}
            onCreateEquipmentForClient={createEquipmentForClient}
          />
        ) : null}

        {activeTab === 'equipamento' && !selectedEquipmentId && !selectedClientId ? (
          equipmentSubView === 'clients' ? (
            <ClientList
              input={operationalState.equipmentInput}
              activeView={equipmentSubView}
              onSelectView={selectEquipmentSubView}
              onOpenClient={openClient}
              onSaveClient={saveClientDraft}
            />
          ) : (
            <EquipmentList
              input={operationalState.equipmentInput}
              activeView={equipmentSubView}
              onSelectView={selectEquipmentSubView}
              onOpenEquipment={openEquipment}
              onSaveEquipment={saveEquipmentDraft}
              onSaveSector={saveSectorDraft}
              onDeleteSector={deleteSectorDraft}
              initialClientId={equipmentFormClientId}
              contextBanner={
                startServiceAfterEquipmentCreate
                  ? {
                      title: 'Cadastro para continuar o registro',
                      description:
                        'Salve este equipamento para retomar o Registro de serviço automaticamente.',
                    }
                  : undefined
              }
              onInitialClientHandled={() => setEquipmentFormClientId(null)}
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
            onCreateQuoteFromCompletedService={createQuoteFromCompletedService}
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
            initialView={servicesInitialView}
            input={operationalState.servicesInput}
            onResumeService={() => setIsServiceFlowOpen(true)}
            onStartService={startFallbackService}
            onEditService={editServiceRecord}
            onSaveQuote={saveQuoteDraft}
            onCreatePreServiceQuote={createPreServiceQuote}
          />
        ) : null}

        {activeTab === 'conta' ? (
          <AccountHome
            preferences={accountPreferences}
            onShortcut={runAccountShortcut}
            onOpenStartTab={openAccountStartTab}
            onChangePreferences={setAccountPreferences}
          />
        ) : null}
      </div>

      <BottomNav activeTab={activeTab} onSelectTab={selectTab} />
    </div>
  );
}

function isValidLocalIsoDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function getSaveErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
