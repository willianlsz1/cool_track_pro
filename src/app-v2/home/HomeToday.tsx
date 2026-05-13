import { useMemo } from 'react';

import { NextActionCard } from './NextActionCard';
import { ShortQueue } from './ShortQueue';
import {
  mockHomeClientes,
  mockHomeCompromissos,
  mockHomeEquipamentos,
  mockHomeRegistros,
  mockHomeToday,
} from './mockHomeData';
import { buildHomeTodayViewModel, type BuildHomeTodayViewModelInput } from './homeViewModel';
import { appV2Tone } from '../styles/tokens';

const defaultHomeInput: BuildHomeTodayViewModelInput = {
  today: mockHomeToday,
  clientes: mockHomeClientes,
  equipamentos: mockHomeEquipamentos,
  compromissos: mockHomeCompromissos,
  registros: mockHomeRegistros,
};

interface HomeTodayProps {
  input?: BuildHomeTodayViewModelInput;
  onOpenEquipment?: (equipmentId: string) => void;
  onStartService?: (equipmentId: string) => void;
}

export function HomeToday({ input, onOpenEquipment, onStartService }: HomeTodayProps) {
  const viewModel = useMemo(() => buildHomeTodayViewModel(input ?? defaultHomeInput), [input]);

  function openNextEquipment() {
    if (viewModel.nextAction.equipmentId) {
      onOpenEquipment?.(viewModel.nextAction.equipmentId);
    }
  }

  function startNextService() {
    if (viewModel.nextAction.equipmentId) {
      onStartService?.(viewModel.nextAction.equipmentId);
    }
  }

  return (
    <main className="tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-[520px] tw-flex-col tw-px-4 tw-pb-36 tw-pt-5">
      <header className="tw-mb-5 tw-flex tw-items-start tw-justify-between tw-gap-4">
        <div>
          <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            {viewModel.context}
          </p>
          <h1 className={`tw-mt-1 tw-text-3xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
            {viewModel.title}
          </h1>
        </div>
        <div
          className={`tw-rounded-lg tw-border tw-bg-white tw-px-3 tw-py-2 tw-text-right tw-text-xs tw-font-bold ${appV2Tone.border} ${appV2Tone.mutedText}`}
        >
          10/05
        </div>
      </header>

      <NextActionCard
        action={viewModel.nextAction}
        onPrimaryAction={startNextService}
        onSecondaryAction={openNextEquipment}
      />
      <ShortQueue items={viewModel.queue} onOpenItem={onOpenEquipment} />
    </main>
  );
}
