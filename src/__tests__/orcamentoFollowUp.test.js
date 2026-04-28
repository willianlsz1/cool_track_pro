import { describe, expect, it } from 'vitest';
import {
  FOLLOW_UP_DAYS,
  getFollowUpMeta,
  getOrcamentoDisplayStatus,
} from '../domain/orcamentoFollowUp.js';

describe('orcamentoFollowUp', () => {
  it('mantém aguardando_assinatura quando ainda não houve visualização', () => {
    expect(getOrcamentoDisplayStatus({ status: 'aguardando_assinatura' })).toBe(
      'aguardando_assinatura',
    );
  });

  it('mapeia aguardando_assinatura para visualizado quando visualizadoEm existe', () => {
    expect(
      getOrcamentoDisplayStatus({
        status: 'aguardando_assinatura',
        visualizadoEm: '2026-04-20T00:00:00.000Z',
      }),
    ).toBe('visualizado');
  });

  it('mapeia enviado para visualizado quando visualizadoEm existe', () => {
    expect(
      getOrcamentoDisplayStatus({
        status: 'enviado',
        visualizadoEm: '2026-04-20T00:00:00.000Z',
      }),
    ).toBe('visualizado');
  });

  it('habilita follow-up após X dias em status enviado', () => {
    const now = new Date('2026-04-28T00:00:00.000Z').getTime();
    const sentAt = new Date(now - FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const meta = getFollowUpMeta({ status: 'enviado', enviadoEm: sentAt }, now);
    expect(meta.shouldShow).toBe(true);
    expect(meta.daysOpen).toBe(FOLLOW_UP_DAYS);
  });

  it('não habilita follow-up quando já assinado', () => {
    const now = new Date('2026-04-28T00:00:00.000Z').getTime();
    const sentAt = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();
    const meta = getFollowUpMeta({ status: 'enviado', enviadoEm: sentAt, assinadoEm: sentAt }, now);
    expect(meta.shouldShow).toBe(false);
  });

  it('faz parse estável de data-only para follow-up sem drift de fuso', () => {
    const now = new Date(2026, 0, FOLLOW_UP_DAYS + 1, 12, 0, 0, 0).getTime();
    const meta = getFollowUpMeta({ status: 'enviado', enviadoEm: '2026-01-01' }, now);
    expect(meta.shouldShow).toBe(true);
  });
});
