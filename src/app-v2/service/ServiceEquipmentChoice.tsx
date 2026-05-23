import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faMicrochip, faPlay } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard, SectionEyebrow } from '../ui/primitives';
import type { Cliente, Equipamento } from '../domain/types';

interface ServiceEquipmentChoiceProps {
  clientes: Cliente[];
  equipamentos: Equipamento[];
  onCreateEquipment: () => void;
  onSelectEquipment: (equipmentId: string) => void;
}

export function ServiceEquipmentChoice({
  clientes,
  equipamentos,
  onCreateEquipment,
  onSelectEquipment,
}: ServiceEquipmentChoiceProps) {
  if (equipamentos.length === 0) {
    return (
      <PageShell>
        <SectionCard>
          <SectionEyebrow>Registro de serviço</SectionEyebrow>
          <h1
            className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}
          >
            Nenhum equipamento cadastrado
          </h1>
          <p
            className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}
          >
            Cadastre um equipamento antes de registrar um serviço.
          </p>
          <ActionButton onClick={onCreateEquipment} className="tw-mt-5 tw-w-full sm:tw-w-auto">
            Ir para Equipamentos
          </ActionButton>
        </SectionCard>
      </PageShell>
    );
  }

  return (
    <PageShell className="tw-gap-6 lg:tw-gap-7">
      <header>
        <h1
          className={`tw-m-0 tw-text-[1.8rem] tw-font-bold tw-leading-tight tw-tracking-tight ${appV2Tone.text}`}
        >
          Escolher equipamento
        </h1>
        <p className={`tw-m-0 tw-mt-1.5 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
          Selecione o equipamento antes de iniciar o atendimento.
        </p>
        <p
          className={`tw-m-0 tw-mt-1 tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-font-medium ${appV2Tone.subtleText}`}
        >
          <FontAwesomeIcon icon={faCircleInfo} className="tw-h-3 tw-w-3" aria-hidden="true" />
          Equipamentos disponíveis para serviço hoje
        </p>
      </header>

      <SectionCard className="tw-rounded-[20px] tw-p-5" labelledBy="service-equipment-choice">
        <div className="tw-mb-4 tw-flex tw-items-center tw-justify-between tw-gap-3">
          <h2
            id="service-equipment-choice"
            className={`tw-m-0 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide ${appV2Tone.text}`}
          >
            Equipamentos disponíveis
          </h2>
        </div>

        <div className="tw-flex tw-flex-col tw-gap-4">
          {equipamentos.map((equipamento) => {
            const cliente = equipamento.clienteId
              ? clientes.find((item) => item.id === equipamento.clienteId)
              : undefined;

            return (
              <div
                key={equipamento.id}
                className="tw-flex tw-flex-col tw-gap-4 tw-rounded-[18px] tw-border tw-border-[#EDF2F7] tw-p-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between"
              >
                <div className="tw-min-w-0 tw-flex-1">
                  <p className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>
                    {equipamento.nome}
                  </p>
                  <p className={`tw-m-0 tw-mt-1 tw-text-xs ${appV2Tone.mutedText}`}>
                    {cliente?.nome ?? 'Sem cliente vinculado'} · {equipamento.local}
                  </p>
                </div>
                <ActionButton
                  className="tw-min-h-10 tw-w-full tw-rounded-[10px] tw-px-5 tw-py-2 tw-text-xs sm:tw-w-auto"
                  onClick={() => onSelectEquipment(equipamento.id)}
                >
                  <FontAwesomeIcon icon={faPlay} className="tw-h-3 tw-w-3" aria-hidden="true" />
                  Iniciar {equipamento.nome}
                </ActionButton>
              </div>
            );
          })}
        </div>

        <div className="tw-mt-4 tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-bg-[#EFF6FF] tw-px-3 tw-py-1 tw-text-xs tw-font-bold tw-text-[#1E4F8A]">
          <FontAwesomeIcon icon={faMicrochip} className="tw-h-3 tw-w-3" aria-hidden="true" />
          {equipamentos.length}{' '}
          {equipamentos.length === 1 ? 'equipamento disponível' : 'equipamentos disponíveis'}
        </div>
      </SectionCard>
    </PageShell>
  );
}
