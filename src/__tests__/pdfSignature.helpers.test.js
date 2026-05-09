import fs from 'node:fs/promises';

import { describe, expect, it, vi } from 'vitest';

import { buildSignatureRecordModel } from '../domain/pdf/sections/signatureHelpers.js';

const statusByCode = {
  ok: { label: 'Operacional', color: [0, 120, 0] },
  fail: { label: 'Com problema', color: [180, 0, 0] },
};

const fallbackStatusInfo = { label: 'Fallback', color: [0, 0, 0] };

function makeDeps(overrides = {}) {
  return {
    fallbackStatusInfo,
    formatDatetime: vi.fn((value) => `fmt:${value}`),
    getSignatureForRecord: vi.fn(() => 'signature-data-url'),
    getSignatureImagePayload: vi.fn((value) => ({ data: value, format: 'PNG' })),
    nowIso: vi.fn(() => '2026-05-09T12:00:00.000Z'),
    sanitizePublicText: vi.fn((value, fallback = '') => value || fallback),
    statusByCode,
    ...overrides,
  };
}

describe('pdf signature helpers', () => {
  it('preserva dados de registro, cliente, equipamento, status e data', () => {
    const deps = makeDeps();
    const registro = {
      id: 'reg-1',
      equipId: 'eq-1',
      clienteNome: ' Cliente A ',
      clienteDocumento: ' 123 ',
      data: '2026-04-10T10:30:00.000Z',
      status: 'ok',
    };
    const equipamentos = [{ id: 'eq-1', nome: 'Split' }];

    const model = buildSignatureRecordModel(registro, equipamentos, deps);

    expect(model).toEqual({
      clienteDoc: '123',
      clienteNome: 'Cliente A',
      equipamento: equipamentos[0],
      registro,
      signatureDate: 'fmt:2026-04-10T10:30:00.000Z',
      signaturePayload: { data: 'signature-data-url', format: 'PNG' },
      statusInfo: statusByCode.ok,
    });
    expect(deps.getSignatureForRecord).toHaveBeenCalledWith('reg-1');
    expect(deps.getSignatureImagePayload).toHaveBeenCalledWith('signature-data-url');
    expect(deps.nowIso).not.toHaveBeenCalled();
  });

  it('preserva fallback de cliente, documento, data atual e status desconhecido', () => {
    const deps = makeDeps({
      getSignatureForRecord: vi.fn(() => null),
      getSignatureImagePayload: vi.fn(() => null),
    });
    const registro = {
      id: 'reg-2',
      equipId: 'missing',
      cliente: '',
      assinatura: true,
      status: 'unknown',
    };

    const model = buildSignatureRecordModel(registro, [], deps);

    expect(model.clienteNome).toBe('Não informado');
    expect(model.clienteDoc).toBe('');
    expect(model.equipamento).toBeUndefined();
    expect(model.signatureDate).toBe('fmt:2026-05-09T12:00:00.000Z');
    expect(model.signaturePayload).toBeNull();
    expect(model.statusInfo).toBe(fallbackStatusInfo);
    expect(deps.nowIso).toHaveBeenCalledTimes(1);
  });

  it('nao importa render, jsPDF, DOM, UI, resolver de assinatura ou handlers', async () => {
    const source = await fs.readFile('src/domain/pdf/sections/signatureHelpers.js', 'utf8');

    expect(source).not.toContain("from './signatures.js'");
    expect(source).not.toMatch(/from ['"].*(jspdf|autoTable|ui\/)/i);
    expect(source).not.toMatch(/\b(document|window)\./i);
    expect(source).not.toMatch(/resolveSignature|signature-storage|reportExportHandlers/i);
  });
});
