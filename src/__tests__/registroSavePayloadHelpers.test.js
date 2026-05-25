import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildRegistroPayloadDraft,
  buildRegistroPersistPayload,
  normalizeRegistroServiceTypeValue,
  validateRegistroOperationalFieldsData,
  validateRegistroPayloadDraftData,
} from '../ui/views/registro/save/payload.js';

const baseValues = {
  equipId: 'eq-1',
  data: '2026-04-10T10:00',
  tipo: 'Outro',
  tipoCustom: 'Higienização',
  obs: 'Revisao detalhada do equipamento',
  tecnico: 'Ana',
  status: 'ok',
  prioridade: 'alta',
  pecas: 'Filtro',
  proxima: '2026-04-20',
  custoPecas: '25,50',
  custoMaoObra: '100',
  clienteNome: 'Cliente A',
  clienteDocumento: '123',
  localAtendimento: 'Sala 1',
  clienteContato: '(11) 99999-0000',
};

describe('registro save payload helpers', () => {
  it('monta o payload draft sem acessar DOM ou side effects', () => {
    expect(buildRegistroPayloadDraft(baseValues, 'Outro · Higienização')).toEqual({
      equipId: 'eq-1',
      data: '2026-04-10T10:00',
      tipo: 'Outro · Higienização',
      obs: 'Revisao detalhada do equipamento',
      tecnico: 'Ana',
      status: 'ok',
      pecas: 'Filtro',
      proxima: '2026-04-20',
      custoPecas: '25,50',
      custoMaoObra: '100',
      clienteNome: 'Cliente A',
      clienteDocumento: '123',
      localAtendimento: 'Sala 1',
      clienteContato: '(11) 99999-0000',
    });
  });

  it('normaliza tipo Outro e retorna motivos puros de invalidade', () => {
    expect(normalizeRegistroServiceTypeValue({ tipo: 'Preventiva' })).toEqual({
      valid: true,
      tipo: 'Preventiva',
    });

    expect(normalizeRegistroServiceTypeValue(baseValues)).toEqual({
      valid: true,
      tipo: 'Outro · Higienização',
    });

    expect(normalizeRegistroServiceTypeValue({ tipo: 'Outro', tipoCustom: '  ' })).toEqual({
      valid: false,
      reason: 'missing-custom',
    });

    expect(
      normalizeRegistroServiceTypeValue(
        { tipo: 'Outro', tipoCustom: 'x'.repeat(41) },
        { tipoCustomMax: 40 },
      ),
    ).toEqual({ valid: false, reason: 'custom-too-long', limit: 40 });
  });

  it('delega validacao de payload preservando normalizacao do contrato core', () => {
    const draft = buildRegistroPayloadDraft(
      {
        ...baseValues,
        tipo: 'Preventiva',
        obs: '  Revisao geral  ',
        tecnico: '  Ana  ',
      },
      '  Preventiva  ',
    );

    const result = validateRegistroPayloadDraftData(draft, {
      existingEquipamentos: [{ id: 'eq-1' }],
    });

    expect(result.valid).toBe(true);
    expect(result.value.tipo).toBe('Preventiva');
    expect(result.value.tecnico).toBe('Ana');
    expect(result.value.obs).toBe('Revisao geral');
    expect(result.value.custoPecas).toBe(25.5);
  });

  it('retorna erros de validacao sem Toast ou foco', () => {
    const result = validateRegistroPayloadDraftData(
      { ...baseValues, equipId: 'eq-missing', tipo: '', tecnico: '' },
      { existingEquipamentos: [{ id: 'eq-1' }] },
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Equipamento inválido para este registro.',
        'Campo obrigatório: Tipo de serviço.',
        'Campo obrigatório: Técnico responsável.',
      ]),
    );
  });

  it('valida campos operacionais sem side effects de apresentacao', () => {
    expect(validateRegistroOperationalFieldsData({ data: '', status: 'ok' })).toEqual({
      valid: false,
      errors: ['Data é obrigatória quando status operacional é informado.'],
    });

    expect(
      validateRegistroOperationalFieldsData({ data: '2026-04-10T10:00', status: 'ok' }),
    ).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('monta payload persistivel com descricao fallback e prioridade do formulario', () => {
    const validatedPayload = validateRegistroPayloadDraftData(
      buildRegistroPayloadDraft({ ...baseValues, obs: 'curto', tipo: 'Preventiva' }, 'Preventiva'),
      { existingEquipamentos: [{ id: 'eq-1' }] },
    ).value;

    expect(buildRegistroPersistPayload(validatedPayload, { prioridade: 'media' })).toMatchObject({
      equipId: 'eq-1',
      tipo: 'Preventiva',
      obs: 'curto',
      descricaoFinal: 'Serviço de preventiva registrado em modo rapido.',
      prioridade: 'media',
      custoPecas: 25.5,
      custoMaoObra: 100,
    });
  });

  it('nao importa adapter obsoleto de Registro', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/ui/views/registro/save/payload.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('Toast');
    expect(source).not.toContain('Storage');
  });
});
