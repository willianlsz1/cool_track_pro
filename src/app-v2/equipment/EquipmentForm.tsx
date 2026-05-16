import { useState, type ReactNode } from 'react';

import type { SaveEquipmentDraft } from './equipmentActions';
import type { Cliente, EquipmentStatus, Equipamento } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard } from '../ui/primitives';

interface EquipmentFormProps {
  title: string;
  clientes: Cliente[];
  initialEquipment?: Equipamento;
  initialClientId?: string;
  error?: string | null;
  onCancel: () => void;
  onSave: (draft: SaveEquipmentDraft) => string | null;
}

export function EquipmentForm({
  title,
  clientes,
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
      status,
    });

    setLocalError(saveError);
  }

  const visibleError = localError ?? error;

  return (
    <SectionCard labelledBy="equipment-form-title" className="tw-grid tw-gap-4">
      <div>
        <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
          Cadastro local
        </p>
        <h2
          id="equipment-form-title"
          className={`tw-m-0 tw-mt-2 tw-text-xl tw-font-bold ${appV2Tone.text}`}
        >
          {title}
        </h2>
      </div>

      {visibleError ? (
        <p className="tw-m-0 tw-rounded-xl tw-border tw-border-[#FCA5A5] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#B91C1C]">
          {visibleError}
        </p>
      ) : null}

      <div className="tw-grid tw-gap-3 sm:tw-grid-cols-2">
        <Field label="Nome" htmlFor="equipment-name">
          <input
            id="equipment-name"
            name="equipment-name"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Split 24.000 BTU"
          />
        </Field>
        <Field label="Local" htmlFor="equipment-location">
          <input
            id="equipment-location"
            name="equipment-location"
            value={local}
            onChange={(event) => setLocal(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Recepcao"
          />
        </Field>
        <Field label="Tipo" htmlFor="equipment-type">
          <input
            id="equipment-type"
            name="equipment-type"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Refrigeracao"
          />
        </Field>
        <Field label="Tag" htmlFor="equipment-tag">
          <input
            id="equipment-tag"
            name="equipment-tag"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className={inputClass}
            placeholder="Ex.: SPL-024"
          />
        </Field>
        <Field label="Cliente" htmlFor="equipment-client">
          <select
            id="equipment-client"
            name="equipment-client"
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
            className={inputClass}
          >
            <option value="">Sem cliente vinculado</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="equipment-status">
          <select
            id="equipment-status"
            name="equipment-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as EquipmentStatus)}
            className={inputClass}
          >
            <option value="ok">Operacional</option>
            <option value="warn">Atencao</option>
            <option value="danger">Critico</option>
          </select>
        </Field>
      </div>

      <div className="tw-flex tw-flex-col-reverse tw-gap-3 sm:tw-flex-row sm:tw-justify-end">
        <ActionButton variant="secondary" onClick={onCancel}>
          Cancelar
        </ActionButton>
        <ActionButton onClick={submit}>Salvar equipamento</ActionButton>
      </div>
    </SectionCard>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`tw-grid tw-gap-2 tw-text-sm tw-font-semibold ${appV2Tone.text}`}
      htmlFor={htmlFor}
    >
      {label}
      {children}
    </label>
  );
}

const inputClass = `tw-min-h-12 tw-w-full tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-4 tw-text-base tw-font-medium tw-text-[#061635] placeholder:tw-text-[#697A99] ${appV2Tone.border} ${appV2Tone.focus}`;
