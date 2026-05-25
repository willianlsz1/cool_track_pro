import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  REGISTRO_ACTIONS,
  REGISTRO_DATA_ATTRIBUTES,
  REGISTRO_PUBLIC_CLASSES,
  REGISTRO_PUBLIC_IDS,
} from '../ui/viewModels/registroContracts.js';
import {
  buildRegistroViewModel,
  getRegistroProgress,
  normalizeRegistroForm,
  validateRegistroFormModel,
} from '../ui/viewModels/registroViewModel.js';

const NOW = new Date('2026-05-01T12:00:00');

function buildState(overrides = {}) {
  return {
    equipamentos: [
      {
        id: 'eq-1',
        nome: 'Split Recepcao',
        tag: 'SP-01',
        local: 'Recepcao',
        tipo: 'split',
        clienteId: 'cliente-1',
        setorId: 'setor-1',
        periodicidadePreventivaDias: 30,
      },
    ],
    registros: [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-04-30T09:00',
        tipo: 'Manutencao Preventiva',
        obs: 'Limpeza de filtros realizada',
        tecnico: 'Ana',
        status: 'ok',
        prioridade: 'media',
        pecas: 'Filtro',
        proxima: '2026-05-30',
        custoPecas: 100,
        custoMaoObra: 200,
        clienteNome: 'Cliente ACME',
        checklist: {
          tipo_template: 'split',
          items: [
            { id: 'limpeza', status: 'ok', obs: '', mandatory: true },
            { id: 'dreno', status: null, obs: '', mandatory: true },
          ],
        },
      },
    ],
    clientes: [
      {
        id: 'cliente-1',
        nome: 'Cliente ACME',
        documento: '00.000.000/0001-00',
        endereco: 'Rua Um',
        contato: '(11) 90000-0000',
      },
    ],
    setores: [{ id: 'setor-1', nome: 'Recepcao', clienteId: 'cliente-1' }],
    ...overrides,
  };
}

function completeForm(overrides = {}) {
  return {
    equipId: 'eq-1',
    data: '2026-05-01T10:00',
    tipo: 'Manutencao Preventiva',
    tipoCustom: '',
    obs: 'Limpeza preventiva realizada com testes finais.',
    tecnico: 'Ana',
    status: 'ok',
    prioridade: 'media',
    pecas: 'Filtro',
    proxima: '2026-05-30',
    custoPecas: '100,50',
    custoMaoObra: '200',
    clienteNome: 'Cliente ACME',
    clienteDocumento: '00.000.000/0001-00',
    localAtendimento: 'Rua Um',
    clienteContato: '(11) 90000-0000',
    ...overrides,
  };
}

describe('registro view model', () => {
  it('representa estado inicial de novo registro sem gerar HTML', () => {
    const vm = buildRegistroViewModel({
      state: buildState({ registros: [] }),
      form: {},
      now: NOW,
    });

    expect(vm.mode).toBe('create');
    expect(vm.selectedEquipamento).toBeNull();
    expect(vm.form.equipId).toBe('');
    expect(vm.progress).toMatchObject({ total: 5, filled: 0, state: 'empty' });
    expect(vm.validation.valid).toBe(false);
    expect(vm.validation.errors).toEqual(
      expect.arrayContaining(['Campo obrigatório: Equipamento.']),
    );
    expect(Object.keys(vm)).not.toContain('html');
  });

  it('prepara modo edicao a partir do registro existente e preserva contexto do equipamento', () => {
    const state = buildState();
    const vm = buildRegistroViewModel({
      state,
      editingId: 'reg-1',
      now: NOW,
    });

    expect(vm.mode).toBe('edit');
    expect(vm.editingId).toBe('reg-1');
    expect(vm.selectedEquipamento).toMatchObject({
      id: 'eq-1',
      nome: 'Split Recepcao',
      tag: 'SP-01',
      label: 'Split Recepcao - TAG SP-01',
    });
    expect(vm.context).toMatchObject({
      hasCompanyContext: true,
      cliente: { id: 'cliente-1', nome: 'Cliente ACME' },
      setor: { id: 'setor-1', nome: 'Recepcao' },
    });
    expect(vm.form.tipo).toBe('Manutencao Preventiva');
    expect(vm.form.obs).toBe('Limpeza de filtros realizada');
    expect(vm.progress.state).toBe('complete');
    expect(Object.keys(vm)).not.toContain('signature');
  });

  it('normaliza formulario, resolve tipo Outro e valida campos puros', () => {
    const form = normalizeRegistroForm({
      ...completeForm(),
      tipo: 'Outro',
      tipoCustom: 'Teste estanqueidade',
      custoPecas: '10,5',
    });
    const validation = validateRegistroFormModel({
      form,
      equipamentos: buildState().equipamentos,
    });

    expect(form.resolvedTipo).toBe('Outro - Teste estanqueidade');
    expect(form.custoPecas).toBe('10,5');
    expect(validation.valid).toBe(true);
    expect(validation.value).toMatchObject({
      equipId: 'eq-1',
      tipo: 'Outro - Teste estanqueidade',
      custoPecas: 10.5,
    });

    const invalidOutro = validateRegistroFormModel({
      form: completeForm({ tipo: 'Outro', tipoCustom: '' }),
      equipamentos: buildState().equipamentos,
    });
    expect(invalidOutro.valid).toBe(false);
    expect(invalidOutro.errors).toEqual(
      expect.arrayContaining(['Descreva o servico no campo Qual servico.']),
    );
  });

  it('calcula progresso e checklist sem acessar DOM', () => {
    const progress = getRegistroProgress(completeForm({ obs: 'curto' }));
    expect(progress).toMatchObject({ total: 5, filled: 4, state: 'partial' });
    expect(progress.requiredFields.map((field) => field.id)).toEqual([
      'r-equip',
      'r-data',
      'r-tipo',
      'r-tecnico',
      'r-obs',
    ]);

    const vm = buildRegistroViewModel({
      state: buildState(),
      form: completeForm(),
      checklist: {
        tipo_template: 'split',
        items: [
          { id: 'limpeza', status: 'ok', obs: '', mandatory: true },
          { id: 'dreno', status: 'fail', obs: 'Corrigir dreno', mandatory: true },
        ],
      },
    });

    expect(vm.checklist).toMatchObject({
      available: true,
      hasMarks: true,
      filled: 2,
      total: 2,
      recommended: true,
    });
  });

  it('mantem textos maliciosos como dados e nao como HTML executavel', () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(2)</script>';
    const vm = buildRegistroViewModel({
      state: buildState({
        equipamentos: [{ id: 'eq-xss', nome: malicious, tag: malicious, local: malicious }],
      }),
      form: completeForm({
        equipId: 'eq-xss',
        tipo: malicious,
        obs: malicious,
        tecnico: malicious,
        clienteNome: malicious,
      }),
    });

    expect(vm.selectedEquipamento.nome).toBe(malicious);
    expect(vm.form.obs).toBe(malicious);
    expect(JSON.stringify(vm)).toContain(malicious);
    expect(JSON.stringify(vm)).not.toContain('dangerouslySetInnerHTML');
    expect(Object.keys(vm)).not.toContain('html');
  });

  it('centraliza contratos publicos atuais da tela Registro', () => {
    expect(REGISTRO_PUBLIC_IDS).toMatchObject({
      view: 'view-registro',
      hero: 'registro-hero',
      actionAnchor: 'registro-action-anchor',
      equipSelect: 'r-equip',
      dateInput: 'r-data',
      typeSelect: 'r-tipo',
      technicianInput: 'r-tecnico',
      checklistBody: 'r-checklist-body',
    });
    expect(REGISTRO_ACTIONS).toMatchObject({
      save: 'save-registro',
      clear: 'clear-registro',
      quickTemplate: 'quick-service-template',
      checklistSet: 'r-checklist-set',
    });
    expect(REGISTRO_DATA_ATTRIBUTES).toEqual(
      expect.arrayContaining(['data-action', 'data-r-action', 'data-template', 'data-item']),
    );
    expect(REGISTRO_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining([
        'registro-hero',
        'registro-field',
        'registro-details',
        'registro-actions',
        'r-checklist__row',
      ]),
    );
  });

  it('nao importa DOM React router storage PDF WhatsApp assinatura ou fotos', () => {
    const source = readFileSync('src/ui/viewModels/registroViewModel.js', 'utf8');

    expect(source).not.toMatch(/from ['"]react['"]|react-dom|createRoot/);
    expect(source).not.toMatch(/document\.|window\.|localStorage|sessionStorage/);
    expect(source).not.toMatch(/router|goTo|storage|pdf|whatsapp|components\/signature|Photos/);
  });

  it('nao mantem literais mojibake para normalizar mensagens de validacao', () => {
    const source = readFileSync('src/ui/viewModels/registroViewModel.js', 'utf8');

    expect(source).not.toMatch(/Ã|Â|�/);
    expect(source).toContain('TextDecoder');
  });
});
