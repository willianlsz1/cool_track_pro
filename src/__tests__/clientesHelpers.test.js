import { describe, expect, it } from 'vitest';
import { extractCity, formatRelativeDate, lastServiceClass } from '../ui/views/clientes/helpers.js';

describe('clientes/helpers', () => {
  it('extractCity suporta formatos com UF e fallback por vírgula', () => {
    expect(extractCity('Rua X, 123 - São Paulo, SP')).toBe('São Paulo');
    expect(extractCity('Av. Beira Mar, 456 - Santos/SP')).toBe('Santos');
    expect(extractCity('Centro, Recife')).toBe('Recife');
    expect(extractCity('Sem separador')).toBe('');
  });

  it('formatRelativeDate retorna Hoje/Ontem/xdias/Nunca', () => {
    const now = new Date('2026-04-28T12:00:00.000Z').getTime();
    expect(formatRelativeDate(now, now)).toBe('Hoje');
    expect(formatRelativeDate(now - 24 * 60 * 60 * 1000, now)).toBe('Ontem');
    expect(formatRelativeDate(now - 3 * 24 * 60 * 60 * 1000, now)).toBe('3 dias atrás');
    expect(formatRelativeDate(null, now)).toBe('Nunca');
  });

  it('lastServiceClass aplica thresholds de warning/danger', () => {
    expect(lastServiceClass(Number.POSITIVE_INFINITY)).toBe('cli-stat__value--danger');
    expect(lastServiceClass(61 * 24 * 60 * 60 * 1000)).toBe('cli-stat__value--danger');
    expect(lastServiceClass(31 * 24 * 60 * 60 * 1000)).toBe('cli-stat__value--warn');
    expect(lastServiceClass(10 * 24 * 60 * 60 * 1000)).toBe('cli-stat__value--ok');
  });
});
