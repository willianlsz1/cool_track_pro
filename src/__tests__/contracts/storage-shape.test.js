import { describe, expect, it, vi } from 'vitest';
import { Storage } from '../../core/storage.js';

/**
 * Chaves mapeadas em src/core/storage*:
 * - state raiz: clientes, setores, equipamentos, registros, tecnicos
 * - metadados de sync: dirty/deletions/cache-owner (interno; não parte do contrato deste teste)
 * - outras chaves em src/core/: assinatura pendente, oauth pending, plan cache/dev mode,
 *   error log, chaves de userStorage (escopo de outros módulos; não da API Storage).
 *
 * Regra: aqui validamos somente API pública do storage module (save/load).
 * Estratégia: strict nas root keys + objectContaining em todos os sub-objetos.
 */

vi.mock('../../core/supabase.js', async () => {
  const { mockSupabase } = await import('../helpers/mockSupabase.js');
  return { supabase: mockSupabase() };
});

describe('contracts/storage-shape', () => {
  it('save/load preserva shape público sem campos extras', () => {
    const state = {
      clientes: [{ id: 'c1', nome: 'Cliente 1' }],
      setores: [{ id: 's1', nome: 'Setor 1', cliente_id: 'c1' }],
      equipamentos: [],
      registros: [],
      tecnicos: [],
    };

    const ok = Storage.save(state);
    expect(ok).toBe(true);

    const loaded = Storage.load({});
    expect(loaded).toEqual({
      clientes: [expect.objectContaining({ id: 'c1', nome: 'Cliente 1' })],
      setores: [
        expect.objectContaining({
          id: 's1',
          nome: 'Setor 1',
          clienteId: 'c1',
        }),
      ],
      equipamentos: [],
      registros: [],
      tecnicos: [],
    });

    expect(Object.keys(loaded).sort()).toEqual([
      'clientes',
      'equipamentos',
      'registros',
      'setores',
      'tecnicos',
    ]);
  });
});
