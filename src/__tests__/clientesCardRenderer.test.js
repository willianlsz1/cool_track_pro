import { describe, expect, it, vi } from 'vitest';
import { renderCard } from '../ui/views/clientes/cardRenderer.js';

describe('clientes cardRenderer', () => {
  it('renderCard suporta data indefinido sem quebrar', () => {
    const html = renderCard({ id: 'c1', nome: 'Cliente 1' }, undefined, {
      getClienteAlert: () => null,
      daysUntilAlert: () => null,
    });

    expect(html).toContain('Cliente 1');
    expect(html).toContain('Equipamentos');
  });

  it('renderCard mostra "Alerta hoje" quando alertDays === 0', () => {
    const html = renderCard(
      { id: 'c1', nome: 'Cliente 1' },
      { status: 'ativo', equipsCount: 0, servicesCount: 0 },
      { getClienteAlert: vi.fn(() => ({ id: 'a1' })), daysUntilAlert: vi.fn(() => 0) },
    );

    expect(html).toContain('Alerta hoje');
  });
});
