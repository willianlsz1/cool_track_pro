import type { ReactNode } from 'react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSave, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';

import type { SaveEquipmentDraft } from './equipmentActions';
import type {
  Cliente,
  EquipmentCriticality,
  EquipmentStatus,
  Equipamento,
  OperationalPriority,
  SetorEquipamento,
} from '../domain/types';
import { appV2Border, appV2Button, appV2Shadow, appV2Text } from '../styles/tokens';
import { FieldGroup, FormGrid, fieldInputClass, fieldSelectClass } from '../ui/FieldGroup';
import { SectionEyebrow } from '../ui/primitives';

interface EquipmentFormProps {
  title: string;
  clientes: Cliente[];
  setores?: SetorEquipamento[];
  initialEquipment?: Equipamento;
  initialClientId?: string;
  initialSectorId?: string;
  error?: string | null;
  onCancel: () => void;
  onSave: (draft: SaveEquipmentDraft) => string | null;
}

export function EquipmentForm({
  title,
  clientes,
  setores = [],
  initialEquipment,
  initialClientId,
  initialSectorId,
  error,
  onCancel,
  onSave,
}: EquipmentFormProps) {
  const initialSelectedSectorId = initialEquipment?.setorId ?? initialSectorId ?? '';
  const [nome, setNome] = useState(initialEquipment?.nome ?? '');
  const [local, setLocal] = useState(initialEquipment?.local ?? '');
  const [tipo, setTipo] = useState(initialEquipment?.tipo ?? '');
  const [tag, setTag] = useState(initialEquipment?.tag ?? '');
  const [componente, setComponente] = useState(initialEquipment?.componente ?? '');
  const [fluidoRefrigerante, setFluidoRefrigerante] = useState(
    initialEquipment?.fluidoRefrigerante ?? '',
  );
  const [marcaModelo, setMarcaModelo] = useState(initialEquipment?.marcaModelo ?? '');
  const [numeroSerie, setNumeroSerie] = useState(initialEquipment?.numeroSerie ?? '');
  const [capacidadeBtuh, setCapacidadeBtuh] = useState(initialEquipment?.capacidadeBtuh ?? '');
  const [clienteId, setClienteId] = useState(
    initialEquipment?.clienteId ??
      initialClientId ??
      getSectorClientId(setores, initialSelectedSectorId) ??
      '',
  );
  const [setorId, setSetorId] = useState(initialSelectedSectorId);
  const [status, setStatus] = useState<EquipmentStatus>(initialEquipment?.status ?? 'ok');
  const [criticidade, setCriticidade] = useState<EquipmentCriticality>(
    initialEquipment?.criticidade ?? 'media',
  );
  const [prioridadeOperacional, setPrioridadeOperacional] = useState<OperationalPriority>(
    initialEquipment?.prioridadeOperacional ?? 'normal',
  );
  const [periodicidadePreventivaDias, setPeriodicidadePreventivaDias] = useState(
    initialEquipment?.periodicidadePreventivaDias?.toString() ?? '',
  );
  const [labelAssistApplied, setLabelAssistApplied] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const sectorClientId = getSectorClientId(setores, setorId);
  const sectorClientName = getClientName(clientes, sectorClientId);

  function selectSector(nextSectorId: string) {
    setSetorId(nextSectorId);

    const nextClientId = getSectorClientId(setores, nextSectorId);

    if (nextClientId) {
      setClienteId(nextClientId);
    }
  }

  function applyLocalLabelSuggestion() {
    setTag((current) => current || 'SPL-024');
    setTipo((current) => current || 'Split Hi-Wall');
    setComponente((current) => current || 'Evaporadora');
    setFluidoRefrigerante((current) => current || 'R-410A');
    setMarcaModelo((current) => current || 'Carrier 24.000 BTU');
    setNumeroSerie((current) => current || '312KAKY3F817');
    setCapacidadeBtuh((current) => current || '24000');
    setPeriodicidadePreventivaDias((current) => current || '105');
    setLabelAssistApplied(true);
  }

  function submit() {
    const saveError = onSave({
      id: initialEquipment?.id ?? '',
      mode: initialEquipment ? 'edit' : 'create',
      nome,
      local,
      tipo,
      tag,
      clienteId,
      setorId,
      status,
      componente,
      fluidoRefrigerante,
      marcaModelo,
      numeroSerie,
      capacidadeBtuh,
      criticidade,
      prioridadeOperacional,
      periodicidadePreventivaDias,
    });

    setLocalError(saveError);
  }

  const visibleError = localError ?? error;

  return (
    <section
      aria-labelledby="equipment-form-title"
      className={`tw-mb-6 tw-rounded-[20px] tw-border tw-bg-white tw-p-6 ${appV2Border.default} ${appV2Shadow.card}`}
    >
      <div>
        <p className="tw-m-0 tw-mb-3 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-3 tw-py-1 tw-text-[0.7rem] tw-font-semibold tw-uppercase tw-tracking-[0.05em] tw-text-[#1E4F8A]">
          Cadastro local
        </p>
        <h2
          id="equipment-form-title"
          className={`tw-m-0 tw-text-xl tw-font-bold ${appV2Text.primary}`}
        >
          {title}
        </h2>
        <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-leading-relaxed ${appV2Text.muted}`}>
          Cadastre primeiro o que identifica o equipamento. Detalhes técnicos e operação podem ser
          preenchidos agora ou revisados depois.
        </p>
      </div>

      <div className="tw-mt-6 tw-rounded-2xl tw-border tw-border-[#BFDBFE] tw-bg-[#EFF6FF] tw-p-4">
        <div className="tw-flex tw-flex-col tw-gap-4 md:tw-flex-row md:tw-items-center md:tw-justify-between">
          <div className="tw-flex tw-gap-3">
            <span className="tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-bg-white tw-text-[#2563EB]">
              <FontAwesomeIcon icon={faCamera} aria-hidden="true" />
            </span>
            <div>
              <p className="tw-m-0 tw-text-sm tw-font-bold tw-text-[#071A33]">
                Etiqueta do equipamento
              </p>
              <p className="tw-m-0 tw-mt-1 tw-text-xs tw-font-medium tw-leading-5 tw-text-[#52677F]">
                Preenchimento local para validar o fluxo. Não usa câmera, upload, storage ou IA
                nesta etapa.
              </p>
              {labelAssistApplied ? (
                <p className="tw-m-0 tw-mt-2 tw-text-xs tw-font-bold tw-text-[#16A34A]">
                  Dados técnicos sugeridos aplicados ao rascunho.
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={applyLocalLabelSuggestion}
            className={`${appV2Button.base} ${appV2Button.compact} ${appV2Button.secondary} tw-shrink-0`}
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} aria-hidden="true" />
            Usar exemplo local
          </button>
        </div>
      </div>

      {visibleError ? (
        <p className="tw-m-0 tw-mt-6 tw-rounded-xl tw-border tw-border-[#FCA5A5] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#B91C1C]">
          {visibleError}
        </p>
      ) : null}

      <FormSection
        eyebrow="Essenciais"
        title="Identificação rápida"
        description="Nome e local são os campos obrigatórios para salvar o equipamento."
      >
        <FormGrid>
          <FieldGroup label="Nome" htmlFor="equipment-name">
            <input
              id="equipment-name"
              name="equipment-name"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className={fieldInputClass}
              placeholder="Ex.: Split 24.000 BTU"
            />
          </FieldGroup>
          <FieldGroup label="Local" htmlFor="equipment-location">
            <input
              id="equipment-location"
              name="equipment-location"
              value={local}
              onChange={(event) => setLocal(event.target.value)}
              className={fieldInputClass}
              placeholder="Ex.: Recepção"
            />
          </FieldGroup>
          <FieldGroup label="Status inicial" htmlFor="equipment-status">
            <select
              id="equipment-status"
              name="equipment-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as EquipmentStatus)}
              className={fieldSelectClass}
            >
              <option value="ok">Operacional</option>
              <option value="warn">Atenção</option>
              <option value="danger">Crítico</option>
            </select>
          </FieldGroup>
        </FormGrid>
      </FormSection>

      <FormSection
        eyebrow="Contexto"
        title="Cliente e setor"
        description="Use setor para organizar o parque e herdar cliente quando fizer sentido."
      >
        <FormGrid>
          <FieldGroup label="Cliente" htmlFor="equipment-client">
            <select
              id="equipment-client"
              name="equipment-client"
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              className={fieldSelectClass}
            >
              <option value="">Sem cliente vinculado</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
            {sectorClientName ? (
              <span className="tw-text-[0.7rem] tw-font-medium tw-leading-5 tw-text-[#52677F]">
                {clienteId === sectorClientId
                  ? `Cliente herdado do setor: ${sectorClientName}. Pode ser alterado neste equipamento.`
                  : `Cliente alterado neste equipamento. O setor pertence a ${sectorClientName}.`}
              </span>
            ) : null}
          </FieldGroup>
          <FieldGroup label="Setor" htmlFor="equipment-sector">
            <select
              id="equipment-sector"
              name="equipment-sector"
              value={setorId}
              onChange={(event) => selectSector(event.target.value)}
              className={fieldSelectClass}
            >
              <option value="">Sem setor</option>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>
          </FieldGroup>
        </FormGrid>
      </FormSection>

      <FormSection
        eyebrow="Detalhes técnicos"
        title="Dados da etiqueta"
        description="Preencha o que souber agora. O restante pode ficar em branco."
      >
        <FormGrid>
          <FieldGroup label="Tag/código" htmlFor="equipment-tag">
            <input
              id="equipment-tag"
              name="equipment-tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className={fieldInputClass}
              placeholder="Ex.: SPL-024"
            />
          </FieldGroup>
          <FieldGroup label="Tipo de equipamento" htmlFor="equipment-type">
            <input
              id="equipment-type"
              name="equipment-type"
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
              className={fieldInputClass}
              placeholder="Ex.: Split Hi-Wall"
            />
          </FieldGroup>
          <FieldGroup label="Componente" htmlFor="equipment-component" optional>
            <select
              id="equipment-component"
              name="equipment-component"
              value={componente}
              onChange={(event) => setComponente(event.target.value)}
              className={fieldSelectClass}
            >
              <option value="">Não informado</option>
              <option value="Evaporadora">Evaporadora</option>
              <option value="Condensadora">Condensadora</option>
              <option value="Equipamento unico">Equipamento único</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Fluido refrigerante" htmlFor="equipment-fluid" optional>
            <input
              id="equipment-fluid"
              name="equipment-fluid"
              value={fluidoRefrigerante}
              onChange={(event) => setFluidoRefrigerante(event.target.value)}
              className={fieldInputClass}
              placeholder="Ex.: R-410A"
            />
          </FieldGroup>
          <FieldGroup label="Marca/modelo" htmlFor="equipment-model" optional>
            <input
              id="equipment-model"
              name="equipment-model"
              value={marcaModelo}
              onChange={(event) => setMarcaModelo(event.target.value)}
              className={fieldInputClass}
              placeholder="Ex.: Carrier 24.000 BTU"
            />
          </FieldGroup>
          <FieldGroup label="Número de série" htmlFor="equipment-serial" optional>
            <input
              id="equipment-serial"
              name="equipment-serial"
              value={numeroSerie}
              onChange={(event) => setNumeroSerie(event.target.value)}
              className={fieldInputClass}
              placeholder="Ex.: 312KAKY3F817"
            />
          </FieldGroup>
          <FieldGroup label="Capacidade (BTU/h)" htmlFor="equipment-capacity" optional>
            <input
              id="equipment-capacity"
              name="equipment-capacity"
              value={capacidadeBtuh}
              onChange={(event) => setCapacidadeBtuh(event.target.value)}
              className={fieldInputClass}
              placeholder="Ex.: 9000, 12000, 24000"
            />
          </FieldGroup>
        </FormGrid>
      </FormSection>

      <FormSection
        eyebrow="Operação"
        title="Prioridade e preventiva"
        description="Criticidade e prioridade ajudam a Home a ordenar alertas e próximas ações."
      >
        <FormGrid>
          <FieldGroup label="Criticidade do ativo" htmlFor="equipment-criticality">
            <select
              id="equipment-criticality"
              name="equipment-criticality"
              value={criticidade}
              onChange={(event) => setCriticidade(event.target.value as EquipmentCriticality)}
              className={fieldSelectClass}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Prioridade operacional" htmlFor="equipment-priority">
            <select
              id="equipment-priority"
              name="equipment-priority"
              value={prioridadeOperacional}
              onChange={(event) =>
                setPrioridadeOperacional(event.target.value as OperationalPriority)
              }
              className={fieldSelectClass}
            >
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Periodicidade preventiva (dias)" htmlFor="equipment-preventive-days">
            <input
              id="equipment-preventive-days"
              name="equipment-preventive-days"
              value={periodicidadePreventivaDias}
              onChange={(event) => setPeriodicidadePreventivaDias(event.target.value)}
              className={fieldInputClass}
              inputMode="numeric"
              placeholder="Ex.: 105"
            />
            {tipo ? (
              <span className="tw-text-[0.7rem] tw-font-medium tw-leading-5 tw-text-[#52677F]">
                Revise a periodicidade conforme tipo, criticidade e rotina do cliente.
              </span>
            ) : null}
          </FieldGroup>
        </FormGrid>
      </FormSection>

      <div className="tw-mt-6 tw-flex tw-flex-col-reverse tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-pt-5 sm:tw-flex-row sm:tw-justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`${appV2Button.base} ${appV2Button.compact} ${appV2Button.secondary}`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          className={`${appV2Button.base} ${appV2Button.compact} ${appV2Button.primary}`}
        >
          <FontAwesomeIcon icon={faSave} aria-hidden="true" className="tw-text-[0.8rem]" />
          Salvar equipamento
        </button>
      </div>
    </section>
  );
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="tw-mt-6 tw-border-t tw-border-[#EDF2F7] tw-pt-6">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <div className="tw-mt-2 tw-mb-4">
        <h3 className={`tw-m-0 tw-text-base tw-font-bold ${appV2Text.primary}`}>{title}</h3>
        <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-medium tw-leading-5 ${appV2Text.muted}`}>
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function getSectorClientId(setores: SetorEquipamento[], sectorId: string): string | undefined {
  return setores.find((setor) => setor.id === sectorId)?.clienteId;
}

function getClientName(clientes: Cliente[], clientId: string | undefined): string | undefined {
  return clientId ? clientes.find((cliente) => cliente.id === clientId)?.nome : undefined;
}
