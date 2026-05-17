import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EquipmentForm } from './EquipmentForm';
import type { SaveEquipmentDraft } from './equipmentActions';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | null = null;

async function renderForm(onSave = vi.fn(() => null)) {
  const host = document.createElement('div');
  document.body.appendChild(host);

  root = createRoot(host);
  await act(async () => {
    root?.render(
      <EquipmentForm
        title="Novo equipamento"
        clientes={[
          { id: 'cliente-1', nome: 'Mercado Bom Preco' },
          { id: 'cliente-2', nome: 'Industria Frio Sul' },
        ]}
        setores={[{ id: 'setor-1', nome: 'Recepcao', clienteId: 'cliente-1' }]}
        onCancel={() => undefined}
        onSave={onSave}
      />,
    );
  });

  return { host, onSave };
}

async function clickButton(host: HTMLElement, label: RegExp) {
  const button = Array.from(host.querySelectorAll('button')).find((item) =>
    label.test(item.textContent ?? ''),
  );

  if (!button) {
    throw new Error(`Botao nao encontrado: ${label}`);
  }

  await act(async () => {
    button.click();
  });
}

async function fillInput(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function selectOption(select: HTMLSelectElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;

  await act(async () => {
    valueSetter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('EquipmentForm', () => {
  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }

    root = null;
    document.body.innerHTML = '';
  });

  it('aplica exemplo local de etiqueta no rascunho sem camera, upload ou storage', async () => {
    const onSave = vi.fn((_draft: SaveEquipmentDraft) => null);
    const { host } = await renderForm(onSave);

    await clickButton(host, /^Usar exemplo local$/i);

    expect(host.textContent).toContain('Dados técnicos sugeridos aplicados ao rascunho.');

    const name = host.querySelector('input[name="equipment-name"]');
    const location = host.querySelector('input[name="equipment-location"]');
    expect(name).toBeInstanceOf(HTMLInputElement);
    expect(location).toBeInstanceOf(HTMLInputElement);

    await fillInput(name as HTMLInputElement, 'Split recepcao');
    await fillInput(location as HTMLInputElement, 'Recepcao');
    await clickButton(host, /^Salvar equipamento$/i);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'SPL-024',
        tipo: 'Split Hi-Wall',
        componente: 'Evaporadora',
        fluidoRefrigerante: 'R-410A',
        marcaModelo: 'Carrier 24.000 BTU',
        numeroSerie: '312KAKY3F817',
        capacidadeBtuh: '24000',
        periodicidadePreventivaDias: '105',
      }),
    );
    expect(host.textContent).not.toContain('Supabase');
    expect(host.textContent).not.toContain('Upload real');
  });

  it('envia contexto, operação e dados técnicos editados manualmente', async () => {
    const onSave = vi.fn((_draft: SaveEquipmentDraft) => null);
    const { host } = await renderForm(onSave);

    await fillInput(host.querySelector('input[name="equipment-name"]') as HTMLInputElement, 'Rack');
    await fillInput(
      host.querySelector('input[name="equipment-location"]') as HTMLInputElement,
      'Casa de maquinas',
    );
    await selectOption(
      host.querySelector('select[name="equipment-sector"]') as HTMLSelectElement,
      'setor-1',
    );
    await selectOption(
      host.querySelector('select[name="equipment-criticality"]') as HTMLSelectElement,
      'critica',
    );
    await selectOption(
      host.querySelector('select[name="equipment-priority"]') as HTMLSelectElement,
      'alta',
    );
    await fillInput(
      host.querySelector('input[name="equipment-preventive-days"]') as HTMLInputElement,
      '45',
    );
    await clickButton(host, /^Salvar equipamento$/i);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Rack',
        local: 'Casa de maquinas',
        clienteId: 'cliente-1',
        setorId: 'setor-1',
        criticidade: 'critica',
        prioridadeOperacional: 'alta',
        periodicidadePreventivaDias: '45',
      }),
    );
  });
});
