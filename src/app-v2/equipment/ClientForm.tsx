import { useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faUserPlus } from '@fortawesome/free-solid-svg-icons';

import type { SaveClientDraft } from './clientActions';
import type { Cliente } from '../domain/types';
import { appV2Border, appV2Focus, appV2Shadow, appV2Text } from '../styles/tokens';

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
    <section
      aria-labelledby="client-form-title"
      className={`tw-rounded-[20px] tw-border tw-bg-white tw-p-5 ${appV2Border.default} ${appV2Shadow.card}`}
    >
      <div>
        <p className="tw-m-0 tw-mb-3 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-2.5 tw-py-1 tw-text-[0.7rem] tw-font-semibold tw-uppercase tw-tracking-[0.05em] tw-text-[#1E4F8A]">
          Cadastro local
        </p>
        <h2
          id="client-form-title"
          className={`tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-base tw-font-bold ${appV2Text.primary}`}
        >
          <FontAwesomeIcon icon={faUserPlus} className="tw-h-4 tw-w-4 tw-text-[#2563EB]" />
          {title}
        </h2>
      </div>

      {visibleError ? (
        <p className="tw-m-0 tw-rounded-xl tw-border tw-border-[#FCA5A5] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#B91C1C]">
          {visibleError}
        </p>
      ) : null}

      <div className="tw-mt-4 tw-grid tw-gap-4 sm:tw-grid-cols-2">
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
        <Field label="Razão social" htmlFor="client-legal-name">
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
        <Field label="Endereço" htmlFor="client-address">
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

      <div className="tw-mt-5 tw-flex tw-flex-col-reverse tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-pt-4 sm:tw-flex-row sm:tw-justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`tw-min-h-9 tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-5 tw-text-xs tw-font-semibold ${appV2Text.muted} ${appV2Focus}`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          className={`tw-inline-flex tw-min-h-9 tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-border-0 tw-bg-[#2563EB] tw-px-5 tw-text-xs tw-font-semibold tw-text-white ${appV2Focus}`}
        >
          <FontAwesomeIcon icon={faFloppyDisk} className="tw-h-3 tw-w-3" aria-hidden="true" />
          Salvar cliente
        </button>
      </div>
    </section>
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
      className="tw-grid tw-gap-1.5 tw-text-[0.7rem] tw-font-semibold tw-uppercase tw-text-[#1E4F8A]"
      htmlFor={htmlFor}
    >
      {label}
      {children}
    </label>
  );
}

const inputClass = `tw-min-h-10 tw-w-full tw-rounded-xl tw-border tw-bg-[#F8FAFD] tw-px-3.5 tw-text-sm tw-font-medium tw-normal-case tw-text-[#071A33] placeholder:tw-font-normal placeholder:tw-text-[#9AADCA] ${appV2Border.default} ${appV2Focus}`;
