import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

import type { SaveEquipmentDraft } from './equipmentActions';
import type { Cliente, EquipmentStatus, Equipamento, SetorEquipamento } from '../domain/types';
import { appV2Border, appV2Focus, appV2Shadow, appV2Text } from '../styles/tokens';
import { FieldGroup, FormGrid, fieldInputClass, fieldSelectClass } from '../ui/FieldGroup';

interface EquipmentFormProps {
  title: string;
  clientes: Cliente[];
  setores?: SetorEquipamento[];
  initialEquipment?: Equipamento;
  initialClientId?: string;
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
  error,
  onCancel,
  onSave,
}: EquipmentFormProps) {
  const [nome, setNome] = useState(initialEquipment?.nome ?? '');
  const [local, setLocal] = useState(initialEquipment?.local ?? '');
  const [tipo, setTipo] = useState(initialEquipment?.tipo ?? '');
  const [tag, setTag] = useState(initialEquipment?.tag ?? '');
  const [clienteId, setClienteId] = useState(initialEquipment?.clienteId ?? initialClientId ?? '');
  const [setorId, setSetorId] = useState(initialEquipment?.setorId ?? '');
  const [status, setStatus] = useState(initialEquipment?.status ?? 'ok');
  const [localError, setLocalError] = useState<string | null>(null);

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
          Preencha os dados básicos para adicionar o equipamento ao parque técnico.
        </p>
      </div>

      {visibleError ? (
        <p className="tw-m-0 tw-mt-6 tw-rounded-xl tw-border tw-border-[#FCA5A5] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#B91C1C]">
          {visibleError}
        </p>
      ) : null}

      <FormGrid className="tw-mt-6">
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
        <FieldGroup label="Tipo" htmlFor="equipment-type">
          <input
            id="equipment-type"
            name="equipment-type"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            className={fieldInputClass}
            placeholder="Ex.: Refrigeração"
          />
        </FieldGroup>
        <FieldGroup label="Tag" htmlFor="equipment-tag">
          <input
            id="equipment-tag"
            name="equipment-tag"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className={fieldInputClass}
            placeholder="Ex.: SPL-024"
          />
        </FieldGroup>
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
        </FieldGroup>
        <FieldGroup label="Setor" htmlFor="equipment-sector">
          <select
            id="equipment-sector"
            name="equipment-sector"
            value={setorId}
            onChange={(event) => setSetorId(event.target.value)}
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
        <FieldGroup label="Status" htmlFor="equipment-status">
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

      <div className="tw-mt-6 tw-flex tw-flex-col-reverse tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-pt-5 sm:tw-flex-row sm:tw-justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`tw-min-h-10 tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-5 tw-text-xs tw-font-medium ${appV2Text.muted} ${appV2Focus}`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          className={`tw-inline-flex tw-min-h-10 tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-border tw-border-[#2563EB] tw-bg-[#2563EB] tw-px-5 tw-text-xs tw-font-semibold tw-text-white ${appV2Focus}`}
        >
          <FontAwesomeIcon icon={faSave} aria-hidden="true" className="tw-text-[0.8rem]" />
          Salvar equipamento
        </button>
      </div>
    </section>
  );
}
