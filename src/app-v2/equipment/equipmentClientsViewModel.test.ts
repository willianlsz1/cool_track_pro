import { describe, expect, it } from 'vitest';

import {
  buildEquipmentClientDetailViewModel,
  buildEquipmentClientsListViewModel,
} from './equipmentClientsViewModel';
import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import type { BuildEquipmentViewModelInput } from './equipmentViewModel';

function createInput(): BuildEquipmentViewModelInput {
  const snapshot = createAppV2MockSnapshot();

  return {
    today: snapshot.today,
    clientes: snapshot.clientes,
    equipamentos: snapshot.equipamentos,
    compromissos: snapshot.compromissos,
    registros: snapshot.registros,
  };
}

describe('buildEquipmentClientsListViewModel', () => {
  it('lista clientes com contagem e status agregados dos equipamentos vinculados', () => {
    const viewModel = buildEquipmentClientsListViewModel(createInput());

    expect(viewModel.totalLabel).toBe('2 clientes');
    expect(viewModel.items).toHaveLength(2);
    expect(viewModel.items[0]).toMatchObject({
      id: 'cliente-1',
      equipmentCountLabel: '3 equipamentos',
      statusLabel: 'Atenção crítica',
      statusTone: 'danger',
    });
  });

  it('filtra clientes por busca operacional incluindo documento e equipamento vinculado', () => {
    const input = createInput();
    const viewModel = buildEquipmentClientsListViewModel(
      {
        ...input,
        clientes: input.clientes.map((cliente) =>
          cliente.id === 'cliente-1' ? { ...cliente, documento: '12.345.678/0001-90' } : cliente,
        ),
      },
      { query: 'CAM-001' },
    );

    expect(viewModel.query).toBe('CAM-001');
    expect(viewModel.totalLabel).toBe('1 cliente');
    expect(viewModel.items.map((item) => item.id)).toEqual(['cliente-1']);
    expect(viewModel.items[0]).toMatchObject({
      pendingCountLabel: '2 pendências',
      lastServiceLabel: 'Último serviço em 09/05',
    });
  });

  it('filtra clientes por pendencia, criticidade e equipamento sem primeiro servico', () => {
    const input = createInput();

    const pending = buildEquipmentClientsListViewModel(input, { filter: 'with_pending' });
    const critical = buildEquipmentClientsListViewModel(input, { filter: 'critical' });
    const firstService = buildEquipmentClientsListViewModel(input, {
      filter: 'without_first_service',
    });

    expect(pending.items.map((item) => item.id)).toEqual(['cliente-1']);
    expect(critical.items.map((item) => item.id)).toEqual(['cliente-1']);
    expect(firstService.items.map((item) => item.id)).toEqual(['cliente-1']);
  });
});

describe('buildEquipmentClientDetailViewModel', () => {
  it('monta detalhe do cliente com equipamentos associados pelo clienteId', () => {
    const detail = buildEquipmentClientDetailViewModel(createInput(), 'cliente-1');

    expect(detail.id).toBe('cliente-1');
    expect(detail.equipmentCountLabel).toBe('3 equipamentos vinculados');
    expect(detail.equipments.map((item) => item.id)).toEqual(['eq-1', 'eq-2', 'eq-4']);
  });

  it('monta servicos relacionados ao cliente a partir dos equipamentos vinculados', () => {
    const detail = buildEquipmentClientDetailViewModel(createInput(), 'cliente-1');

    expect(detail.services.map((item) => item.id)).toEqual(['registro-2', 'registro-1']);
    expect(detail.services[0]).toMatchObject({
      equipmentName: 'Câmara fria',
      kindLabel: 'Corretiva',
      dateLabel: '09/05',
      statusLabel: 'Atenção',
      summary: 'Alarme intermitente no controlador.',
    });
    expect(detail.servicesCountLabel).toBe('2 serviços relacionados');
  });

  it('monta resumo operacional local do cliente sem PMOC ou integracao sensivel', () => {
    const detail = buildEquipmentClientDetailViewModel(createInput(), 'cliente-1');

    expect(detail.localReport.title).toBe('Resumo local do cliente');
    expect(detail.localReport.facts).toEqual([
      { label: 'Equipamentos', value: '3 equipamentos vinculados' },
      { label: 'Serviços', value: '2 serviços relacionados' },
      { label: 'Pendências', value: '2 pendências operacionais' },
      { label: 'Último serviço', value: '09/05 - Camara fria' },
    ]);
    expect(JSON.stringify(detail.localReport)).not.toContain('PMOC');
    expect(JSON.stringify(detail.localReport)).not.toContain('Supabase');
  });
});
