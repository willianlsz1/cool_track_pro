import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildRegistroChecklistSoftRequiredWarning,
  buildRegistroChecklistViewModel,
  cloneRegistroChecklistForEdit,
  collectRegistroChecklistForSave,
  parseRegistroChecklistMeasure,
  resolveRegistroChecklistTemplate,
} from '../ui/views/registro/checklist/pmocChecklist.js';

const modulePath = join(process.cwd(), 'src/ui/views/registro/checklist/pmocChecklist.js');

const template = {
  tipo_template: 'split_hi_wall',
  label: 'Split Hi Wall',
  items: [
    {
      id: 'filtros_limpeza',
      group: 'Filtros',
      label: 'Limpeza dos filtros',
      mandatory: true,
      measurable: false,
    },
    {
      id: 'tensao_alimentacao',
      group: 'Eletrica',
      label: 'Tensao de alimentacao',
      mandatory: true,
      measurable: true,
      unit: 'V',
    },
  ],
};

function buildChecklist() {
  return {
    tipo_template: 'split_hi_wall',
    items: [
      {
        id: 'filtros_limpeza',
        status: 'ok',
        obs: 'Filtro limpo.',
        measure: null,
      },
      {
        id: 'tensao_alimentacao',
        status: null,
        obs: '',
        measure: { value: 221.5, unit: 'V' },
      },
    ],
  };
}

describe('pmocChecklist registro view helpers', () => {
  it('buildRegistroChecklistViewModel preserva shape do renderer DOM', () => {
    const viewModel = buildRegistroChecklistViewModel(template, buildChecklist());

    expect(viewModel).toEqual({
      label: 'Split Hi Wall',
      groups: [
        {
          label: 'Filtros',
          items: [
            {
              id: 'filtros_limpeza',
              label: 'Limpeza dos filtros',
              mandatory: true,
              measurable: false,
              unit: '',
              status: 'ok',
              obs: 'Filtro limpo.',
              measureValue: '',
            },
          ],
        },
        {
          label: 'Eletrica',
          items: [
            {
              id: 'tensao_alimentacao',
              label: 'Tensao de alimentacao',
              mandatory: true,
              measurable: true,
              unit: 'V',
              status: null,
              obs: '',
              measureValue: '221.5',
            },
          ],
        },
      ],
    });
  });

  it('resolveRegistroChecklistTemplate delega o tipo do equipamento ao resolver injetado', () => {
    const calls = [];
    const result = resolveRegistroChecklistTemplate(
      { id: 'eq-1', tipo: 'split' },
      {
        getChecklistTemplate: (tipo) => {
          calls.push(tipo);
          return { tipo_template: `${tipo}_template` };
        },
      },
    );

    expect(calls).toEqual(['split']);
    expect(result).toEqual({ tipo_template: 'split_template' });
  });

  it('collectRegistroChecklistForSave retorna null para checklist vazio e preserva preenchido', () => {
    const empty = {
      tipo_template: 'split_hi_wall',
      items: [
        { id: 'a', status: null },
        { id: 'b', status: null },
      ],
    };
    const filled = buildChecklist();

    expect(collectRegistroChecklistForSave(null)).toBeNull();
    expect(collectRegistroChecklistForSave(empty)).toBeNull();
    expect(collectRegistroChecklistForSave(filled)).toBe(filled);
  });

  it('buildRegistroChecklistSoftRequiredWarning preserva warning sem Toast nem bloqueio', () => {
    const validateChecklist = (checklist) => ({
      complete: false,
      missing: checklist.items.filter((item) => item.status == null).map((item) => item.id),
    });
    const isPreventivaTipo = (tipo) => tipo === 'Preventiva';

    expect(
      buildRegistroChecklistSoftRequiredWarning('Corretiva', {
        checklist: null,
        isPreventivaTipo,
        validateChecklist,
      }),
    ).toBeNull();
    expect(
      buildRegistroChecklistSoftRequiredWarning('Preventiva', {
        checklist: null,
        isPreventivaTipo,
        validateChecklist,
      }),
    ).toContain('Sem checklist NBR');
    expect(
      buildRegistroChecklistSoftRequiredWarning('Preventiva', {
        checklist: buildChecklist(),
        isPreventivaTipo,
        validateChecklist,
      }),
    ).toContain('1 item obrigatório pendente');
  });

  it('cloneRegistroChecklistForEdit clona sem compartilhar referencias', () => {
    const checklist = buildChecklist();
    const cloned = cloneRegistroChecklistForEdit(checklist);

    expect(cloned).toEqual(checklist);
    expect(cloned).not.toBe(checklist);
    expect(cloned.items).not.toBe(checklist.items);
  });

  it('parseRegistroChecklistMeasure preserva regra numerica pt-BR', () => {
    expect(parseRegistroChecklistMeasure('', 'V')).toBeNull();
    expect(parseRegistroChecklistMeasure('abc', 'V')).toBeNull();
    expect(parseRegistroChecklistMeasure('221,5', 'V')).toEqual({ value: 221.5, unit: 'V' });
  });

  it('nao importa adapter principal nem modulos com side effects fortes', () => {
    const source = readFileSync(modulePath, 'utf8');

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('reportExportHandlers');
    expect(source).not.toContain('domain/pdf');
    expect(source).not.toContain('PlanCache');
    expect(source).not.toContain('Toast');
    expect(source).not.toContain('document.');
  });
});
