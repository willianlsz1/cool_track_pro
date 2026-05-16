import { useState, type ReactNode } from 'react';

import type { SaveClientDraft } from './clientActions';
import type { Cliente } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard } from '../ui/primitives';

interface ClientFormProps {
  title: string;
  initialClient?: Cliente;
  error?: string | null;
  onCancel: () => void;
  onSave: (draft: SaveClientDraft) => string | null;
}

export function ClientForm({ title, initialClient, error, onCancel, onSave }: ClientFormProps) {
  const [nome, setNome] = useState(initialClient?.nome ?? '');
  const [razaoSocial, setRazaoSocial] = useState(initialClient?.razaoSocial ?? '');
  const [documento, setDocumento] = useState(initialClient?.documento ?? '');
  const [contato, setContato] = useState(initialClient?.contato ?? '');
  const [endereco, setEndereco] = useState(initialClient?.endereco ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  function submit() {
    const saveError = onSave({
      id: initialClient?.id ?? '',
      mode: initialClient ? 'edit' : 'create',
      nome,
      razaoSocial,
      documento,
      contato,
      endereco,
    });

    setLocalError(saveError);
  }

  const visibleError = localError ?? error;

  return (
    <SectionCard labelledBy="client-form-title" className="tw-grid tw-gap-4">
      <div>
        <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
          Cadastro local
        </p>
        <h2
          id="client-form-title"
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
        <Field label="Nome" htmlFor="client-name">
          <input
            id="client-name"
            name="client-name"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Mercado Bom"
          />
        </Field>
        <Field label="Razao social" htmlFor="client-legal-name">
          <input
            id="client-legal-name"
            name="client-legal-name"
            value={razaoSocial}
            onChange={(event) => setRazaoSocial(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Mercado Bom LTDA"
          />
        </Field>
        <Field label="Documento" htmlFor="client-document">
          <input
            id="client-document"
            name="client-document"
            value={documento}
            onChange={(event) => setDocumento(event.target.value)}
            className={inputClass}
            placeholder="Ex.: CNPJ"
          />
        </Field>
        <Field label="Contato" htmlFor="client-contact">
          <input
            id="client-contact"
            name="client-contact"
            value={contato}
            onChange={(event) => setContato(event.target.value)}
            className={inputClass}
            placeholder="Ex.: (11) 99999-0000"
          />
        </Field>
        <Field label="Endereco" htmlFor="client-address">
          <input
            id="client-address"
            name="client-address"
            value={endereco}
            onChange={(event) => setEndereco(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Rua Central, 42"
          />
        </Field>
      </div>

      <div className="tw-flex tw-flex-col-reverse tw-gap-3 sm:tw-flex-row sm:tw-justify-end">
        <ActionButton variant="secondary" onClick={onCancel}>
          Cancelar
        </ActionButton>
        <ActionButton onClick={submit}>Salvar cliente</ActionButton>
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
