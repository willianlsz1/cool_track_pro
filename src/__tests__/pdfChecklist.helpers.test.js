import { describe, expect, it } from 'vitest';

import {
  buildChecklistGroups,
  createChecklistLayoutState,
  getRegistrosWithChecklist,
  summarizeChecklistItems,
} from '../domain/pdf/sections/checklistHelpers.js';

describe('pdf checklist helpers', () => {
  it('filtra apenas registros com checklist.items', () => {
    const valid = { id: 'valid', checklist: { items: [] } };
    const result = getRegistrosWithChecklist([
      valid,
      { id: 'missing' },
      { id: 'null', checklist: null },
      { id: 'invalid-items', checklist: { items: {} } },
    ]);

    expect(result).toEqual([valid]);
  });

  it('preserva cursor inicial da section', () => {
    expect(createChecklistLayoutState(42)).toEqual({ y: 48 });
  });

  it('resume status ok, fail e na ignorando pendentes ou desconhecidos', () => {
    expect(
      summarizeChecklistItems([
        { status: 'ok' },
        { status: 'fail' },
        { status: 'na' },
        { status: null },
        { status: 'pending' },
      ]),
    ).toEqual({ ok: 1, fail: 1, na: 1 });
  });

  it('agrupa checklist pela ordem e labels do template ignorando itens sem status', () => {
    const tpl = {
      items: [
        { id: 'clean-filter', group: 'Mecanico', label: 'Limpeza dos filtros' },
        { id: 'tray', group: 'Mecanico', label: 'Bandeja de condensado' },
        { id: 'voltage', group: 'Eletrico', label: 'Tensao de alimentacao' },
      ],
    };
    const registro = {
      checklist: {
        items: [
          { id: 'voltage', status: 'na', obs: 'sem acesso' },
          { id: 'clean-filter', status: 'ok', measure: { value: 1 } },
          { id: 'tray', status: null },
        ],
      },
    };

    const { groupsOrder, groupBuckets } = buildChecklistGroups(registro, tpl);

    expect(groupsOrder).toEqual(['Mecanico', 'Eletrico']);
    expect(groupBuckets.get('Mecanico')).toEqual([
      {
        id: 'clean-filter',
        status: 'ok',
        measure: { value: 1 },
        label: 'Limpeza dos filtros',
      },
    ]);
    expect(groupBuckets.get('Eletrico')).toEqual([
      {
        id: 'voltage',
        status: 'na',
        obs: 'sem acesso',
        label: 'Tensao de alimentacao',
      },
    ]);
  });

  it('nao importa render, jsPDF, autoTable, DOM ou UI', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile('src/domain/pdf/sections/checklistHelpers.js', 'utf8'),
    );

    expect(source).not.toMatch(/checklist\.js|jspdf|autoTable|document|window|ui\//);
  });
});
