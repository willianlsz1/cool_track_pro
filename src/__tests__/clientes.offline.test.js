import { beforeEach, describe, expect, it, vi } from 'vitest';

const stateRef = { value: { clientes: [] } };

vi.mock('../core/state.js', () => ({
  getState: () => stateRef.value,
  setState: (updater) => {
    stateRef.value = updater(stateRef.value);
  },
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: {
    UNAUTHORIZED: 'UNAUTHORIZED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SYNC_FAILED: 'SYNC_FAILED',
    NETWORK_ERROR: 'NETWORK_ERROR',
  },
  AppError: class AppError extends Error {
    constructor(message) {
      super(message);
    }
  },
  handleError: vi.fn(),
}));

function makeSupabaseMock({ upsertError = null } = {}) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: upsertError }),
        })),
      })),
    })),
  };
}

describe('clientes offline fallback', () => {
  beforeEach(() => {
    stateRef.value = { clientes: [] };
    vi.resetModules();
  });

  it('salva cliente localmente quando upsert falha por erro de rede', async () => {
    const supabase = makeSupabaseMock({ upsertError: { message: 'Failed to fetch' } });
    vi.doMock('../core/supabase.js', () => ({ supabase }));

    const { upsertCliente } = await import('../core/clientes.js');
    const saved = await upsertCliente({ nome: 'Cliente Offline' });

    expect(saved.id).toBeTruthy();
    expect(saved.nome).toBe('Cliente Offline');
    expect(stateRef.value.clientes).toHaveLength(1);
    expect(stateRef.value.clientes[0].id).toBe(saved.id);
  });
});
