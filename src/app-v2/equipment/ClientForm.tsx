import { faFloppyDisk, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { Cliente } from '../domain/types';
import { appV2Border, appV2Focus, appV2Shadow, appV2Text } from '../styles/tokens';
import {
  FieldGroup,
  FormStack,
  fieldInputClass,
  fieldSelectClass,
  fieldTextareaClass,
} from '../ui/FieldGroup';
import { SectionEyebrow } from '../ui/primitives';
import type { SaveClientDraft } from './clientActions';

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
  const [finalidadeAmbiente, setFinalidadeAmbiente] = useState(
    initialClient?.finalidadeAmbiente ?? '',
  );
  const [contato, setContato] = useState(initialClient?.contato ?? '');
  const [endereco, setEndereco] = useState(initialClient?.endereco ?? '');
  const [canalChamados, setCanalChamados] = useState(initialClient?.canalChamados ?? '');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(
    initialClient?.inscricaoEstadual ?? '',
  );
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState(
    initialClient?.inscricaoMunicipal ?? '',
  );
  const [observacoesInternas, setObservacoesInternas] = useState(
    initialClient?.observacoesInternas ?? '',
  );
  const [localError, setLocalError] = useState<string | null>(null);

  function submit() {
    const saveError = onSave({
      id: initialClient?.id ?? '',
      mode: initialClient ? 'edit' : 'create',
      nome,
      razaoSocial,
      documento,
      finalidadeAmbiente,
      contato,
      endereco,
      canalChamados,
      inscricaoEstadual,
      inscricaoMunicipal,
      observacoesInternas,
    });

    setLocalError(saveError);
  }

  const visibleError = localError ?? error;

  return (
    <section
      aria-labelledby="client-form-title"
      className={`tw-rounded-[20px] tw-border tw-bg-white tw-p-5 md:tw-p-6 ${appV2Border.default} ${appV2Shadow.card}`}
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
        <p className="tw-m-0 tw-mt-2 tw-text-xs tw-font-medium tw-leading-5 tw-text-[#52677F]">
          Informe primeiro os dados que identificam o cliente no dia a dia. Apenas o nome é
          obrigatório.
        </p>
      </div>

      {visibleError ? (
        <p className="tw-m-0 tw-mt-4 tw-rounded-xl tw-border tw-border-[#FCA5A5] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#B91C1C]">
          {visibleError}
        </p>
      ) : null}

      <div className="tw-mt-6 tw-space-y-7">
        <ClientFormSection
          eyebrow="Identificação"
          title="Dados principais"
          description="Nome e documento ajudam a localizar o cliente em equipamentos, serviços e relatórios."
        >
          <FormStack>
            <FieldGroup label="Nome do cliente" htmlFor="client-name">
              <input
                id="client-name"
                name="client-name"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className={fieldInputClass}
                placeholder="Ex.: Mercado Bom Preço"
              />
              <FieldHelp>Nome usado na rotina técnica e nas listas do app.</FieldHelp>
            </FieldGroup>
            <FieldGroup label="Razão social" htmlFor="client-legal-name" optional>
              <input
                id="client-legal-name"
                name="client-legal-name"
                value={razaoSocial}
                onChange={(event) => setRazaoSocial(event.target.value)}
                className={fieldInputClass}
                placeholder="Ex.: Mercado Bom Preço LTDA"
              />
            </FieldGroup>
            <FieldGroup label="CNPJ ou CPF" htmlFor="client-document" optional>
              <input
                id="client-document"
                name="client-document"
                value={documento}
                onChange={(event) => setDocumento(event.target.value)}
                className={fieldInputClass}
                placeholder="00.000.000/0001-00 ou 000.000.000-00"
              />
            </FieldGroup>
            <FieldGroup label="Finalidade do ambiente" htmlFor="client-environment" optional>
              <select
                id="client-environment"
                name="client-environment"
                value={finalidadeAmbiente}
                onChange={(event) => setFinalidadeAmbiente(event.target.value)}
                className={fieldSelectClass}
              >
                <option value="">Selecione...</option>
                <option value="Comercial">Comercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Residencial">Residencial</option>
                <option value="Condominio">Condomínio</option>
                <option value="Outro">Outro</option>
              </select>
              <FieldHelp>Ajuda a classificar o cliente em documentos técnicos futuros.</FieldHelp>
            </FieldGroup>
          </FormStack>
        </ClientFormSection>

        <ClientFormSection
          eyebrow="Localização e contato"
          title="Como encontrar e acionar o cliente"
          description="Dados de contato reduzem atrito ao iniciar atendimento ou registrar retorno."
        >
          <FormStack>
            <FieldGroup label="Endereço" htmlFor="client-address" optional>
              <input
                id="client-address"
                name="client-address"
                value={endereco}
                onChange={(event) => setEndereco(event.target.value)}
                className={fieldInputClass}
                placeholder="Ex.: Rua Central, 42 - Bairro - Cidade/UF"
              />
            </FieldGroup>
            <FieldGroup label="Telefone / WhatsApp / e-mail" htmlFor="client-contact" optional>
              <input
                id="client-contact"
                name="client-contact"
                value={contato}
                onChange={(event) => setContato(event.target.value)}
                className={fieldInputClass}
                placeholder="Ex.: (11) 99999-0000 ou contato@cliente.com"
              />
            </FieldGroup>
            <FieldGroup label="Canal de chamados" htmlFor="client-ticket-channel" optional>
              <input
                id="client-ticket-channel"
                name="client-ticket-channel"
                value={canalChamados}
                onChange={(event) => setCanalChamados(event.target.value)}
                className={fieldInputClass}
                placeholder="Ex.: WhatsApp, portal do cliente, e-mail"
              />
              <FieldHelp>Canal usado pelo cliente para solicitar atendimento.</FieldHelp>
            </FieldGroup>
          </FormStack>
        </ClientFormSection>

        <ClientFormSection
          eyebrow="Dados opcionais"
          title="Documentos e observações"
          description="Preencha quando houver dados formais. Observações internas não saem em documento."
        >
          <FormStack>
            <FieldGroup label="Inscrição estadual" htmlFor="client-state-registration" optional>
              <input
                id="client-state-registration"
                name="client-state-registration"
                value={inscricaoEstadual}
                onChange={(event) => setInscricaoEstadual(event.target.value)}
                className={fieldInputClass}
                placeholder="Isento ou número"
              />
            </FieldGroup>
            <FieldGroup label="Inscrição municipal" htmlFor="client-city-registration" optional>
              <input
                id="client-city-registration"
                name="client-city-registration"
                value={inscricaoMunicipal}
                onChange={(event) => setInscricaoMunicipal(event.target.value)}
                className={fieldInputClass}
                placeholder="Conforme prefeitura"
              />
            </FieldGroup>
            <FieldGroup label="Observações internas" htmlFor="client-internal-notes" optional>
              <textarea
                id="client-internal-notes"
                name="client-internal-notes"
                value={observacoesInternas}
                onChange={(event) => setObservacoesInternas(event.target.value)}
                className={fieldTextareaClass}
                placeholder="Notas privadas para a equipe técnica"
              />
              <FieldHelp>Não aparece em relatório enviado ao cliente.</FieldHelp>
            </FieldGroup>
          </FormStack>
        </ClientFormSection>
      </div>

      <div className="tw-mt-6 tw-flex tw-flex-col-reverse tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-pt-4 sm:tw-flex-row sm:tw-justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`tw-min-h-10 tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-5 tw-text-xs tw-font-semibold ${appV2Text.muted} ${appV2Focus}`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          className={`tw-inline-flex tw-min-h-10 tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-border-0 tw-bg-[#2563EB] tw-px-5 tw-text-xs tw-font-semibold tw-text-white ${appV2Focus}`}
        >
          <FontAwesomeIcon icon={faFloppyDisk} className="tw-h-3 tw-w-3" aria-hidden="true" />
          Salvar cliente
        </button>
      </div>
    </section>
  );
}

function ClientFormSection({
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
    <section className="tw-border-t tw-border-[#EDF2F7] tw-pt-5 first:tw-border-t-0 first:tw-pt-0">
      <div className="tw-mb-4">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h3 className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-bold ${appV2Text.primary}`}>{title}</h3>
        <p className="tw-m-0 tw-mt-1 tw-text-xs tw-font-medium tw-leading-5 tw-text-[#52677F]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function FieldHelp({ children }: { children: ReactNode }) {
  return (
    <span className="tw-text-xs tw-font-medium tw-leading-5 tw-text-[#6F87A3]">{children}</span>
  );
}
