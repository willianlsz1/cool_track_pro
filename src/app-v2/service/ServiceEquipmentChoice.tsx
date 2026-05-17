import { appV2Tone } from '../styles/tokens';
import { ActionButton, ListRow, PageShell, SectionCard, StatusBadge } from '../ui/primitives';
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
          <p
            className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            Registro de serviço
          </p>
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
    <PageShell>
      <header>
        <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
          Registro de serviço
        </p>
        <h1
          className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight sm:tw-text-[2rem] ${appV2Tone.text}`}
        >
          Escolher equipamento
        </h1>
        <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
          Selecione o equipamento antes de iniciar o atendimento.
        </p>
      </header>

      <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="service-equipment-choice">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-border-[#E5EAF0] tw-px-4 tw-py-4">
          <h2
            id="service-equipment-choice"
            className={`tw-m-0 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
          >
            Equipamentos disponiveis
          </h2>
          <StatusBadge>{equipamentos.length}</StatusBadge>
        </div>

        {equipamentos.map((equipamento) => {
          const cliente = equipamento.clienteId
            ? clientes.find((item) => item.id === equipamento.clienteId)
            : undefined;

          return (
            <ListRow key={equipamento.id} className="tw-px-4 tw-py-4">
              <div className="tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between">
                <div className="tw-min-w-0">
                  <p className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>
                    {equipamento.nome}
                  </p>
                  <p className={`tw-m-0 tw-mt-1 tw-text-sm ${appV2Tone.mutedText}`}>
                    {cliente?.nome ?? 'Sem cliente vinculado'} - {equipamento.local}
                  </p>
                </div>
                <ActionButton
                  variant="secondary"
                  className="tw-min-h-10 tw-w-full tw-px-4 tw-py-2 sm:tw-w-auto"
                  onClick={() => onSelectEquipment(equipamento.id)}
                >
                  Iniciar {equipamento.nome}
                </ActionButton>
              </div>
            </ListRow>
          );
        })}
      </SectionCard>
    </PageShell>
  );
}
