/**
 * Testes do fallback de schema anterior em setores.
 *
 * Contexto: P1 (migration 20260420120000) adiciona as colunas descricao +
 * responsavel. Enquanto a migration nao rodar no Supabase remoto, upserts
 * e selects com essas colunas falham com 400. O storage.js detecta isso e
 * refaz a operacao com o shape anterior (id, nome, cor) para que o setor ainda
 * persista e os equipamentos com setor_id nao quebrem no FK.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do cliente Supabase com controle fino por chamada.
/**
 * createSupabaseMock permite simular:
 *   - Sucesso no upsert de uma tabela
 *   - Erro "column descricao/responsavel does not exist" no primeiro upsert
 *     seguido de sucesso no segundo (fallback)
 *   - Erro de schema na primeira SELECT (descricao/responsavel) com fallback
 *     para o SELECT anterior bem-sucedido
 */
function createSupabaseMock({ userId = 'u1', setoresUpsertQueue, setoresSelectQueue } = {}) {
  // Queue-based mocks: cada chamada consome o primeiro item. Permite
  // sequenciar "falha com colunas novas" -> "sucesso com shape anterior".
  const upsertQueues = {
    equipamentos: [{ data: null, error: null }],
    registros: [{ data: null, error: null }],
    tecnicos: [{ data: null, error: null }],
    setores: setoresUpsertQueue || [{ data: null, error: null }],
  };
  const selectQueues = {
    equipamentos: [{ data: [], error: null }],
    registros: [{ data: [], error: null }],
    tecnicos: [{ data: [], error: null }],
    setores: setoresSelectQueue || [{ data: [], error: null }],
  };

  const upsertCalls = { setores: [] };
  const selectCalls = { setores: [] };

  const from = vi.fn((table) => ({
    upsert: vi.fn((rows, opts) => {
      if (table === 'setores') upsertCalls.setores.push({ rows, opts });
      const next = upsertQueues[table]?.shift() ?? { data: null, error: null };
      return Promise.resolve(next);
    }),
    select: vi.fn((columns) => {
      if (table === 'setores') selectCalls.setores.push(columns);
      return {
        eq: vi.fn(async () => selectQueues[table]?.shift() ?? { data: [], error: null }),
      };
    }),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({ in: vi.fn(async () => ({ data: null, error: null })) })),
    })),
  }));

  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }) },
    from,
    upsertCalls,
    selectCalls,
  };
}

async function loadStorage(supabase) {
  vi.resetModules();
  vi.doMock('../core/supabase.js', () => ({ supabase }));
  vi.doMock('../core/toast.js', () => ({
    Toast: { info: vi.fn(), success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  }));
  const { Storage } = await import('../core/storage.js');
  return Storage;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('pushSetores fallback (schema nao migrado)', () => {
  it('retry com shape anterior quando Supabase retorna "column responsavel does not exist"', async () => {
    const supabaseMock = createSupabaseMock({
      setoresUpsertQueue: [
        // Primeira tentativa: PostgREST rejeita colunas novas
        {
          data: null,
          error: {
            message: `Could not find the 'responsavel' column of 'setores' in the schema cache`,
          },
        },
        // Segunda tentativa: shape anterior funciona
        { data: null, error: null },
      ],
    });

    const Storage = await loadStorage(supabaseMock);

    await Storage._syncToSupabase(
      {
        equipamentos: [],
        registros: [],
        tecnicos: [],
        setores: [
          {
            id: 's1',
            nome: 'Cozinha',
            cor: '#00c8e8',
            descricao: 'desc',
            responsavel: 'Ana',
            clienteId: 'c1',
          },
        ],
      },
      { silent: true },
    );

    // Confirma que tentou 2x: primeira com colunas novas, segunda sem
    expect(supabaseMock.upsertCalls.setores).toHaveLength(2);

    const firstCall = supabaseMock.upsertCalls.setores[0].rows[0];
    expect(firstCall).toHaveProperty('descricao', 'desc');
    expect(firstCall).toHaveProperty('responsavel', 'Ana');
    expect(firstCall).toHaveProperty('cliente_id', 'c1');

    const secondCall = supabaseMock.upsertCalls.setores[1].rows[0];
    expect(secondCall).not.toHaveProperty('descricao');
    expect(secondCall).not.toHaveProperty('responsavel');
    // O shape anterior ainda preserva nome e cor (e id + user_id)
    expect(secondCall).toMatchObject({
      id: 's1',
      nome: 'Cozinha',
      cor: '#00c8e8',
    });
  });

  it('nao retry em erro nao relacionado ao schema (propaga para AppError)', async () => {
    const supabaseMock = createSupabaseMock({
      setoresUpsertQueue: [{ data: null, error: { message: 'network timeout' } }],
    });
    const Storage = await loadStorage(supabaseMock);

    // Silent=true nao suprime o throw; _syncToSupabase absorve erros mas
    // registra via handleError. Aqui so validamos que nao houve retry.
    await Storage._syncToSupabase(
      {
        equipamentos: [],
        registros: [],
        tecnicos: [],
        setores: [{ id: 's1', nome: 'X', cor: '#00c8e8' }],
      },
      { silent: true },
    );

    // Apenas 1 tentativa de upsert (sem retry)
    expect(supabaseMock.upsertCalls.setores).toHaveLength(1);
  });
});

describe('pullFromSupabase fallback (SELECT com colunas novas)', () => {
  it('refaz SELECT sem descricao/responsavel quando schema ainda nao migrou', async () => {
    const supabaseMock = createSupabaseMock({
      setoresSelectQueue: [
        {
          data: null,
          error: {
            message: `column setores.responsavel does not exist`,
          },
        },
        // Retry com select anterior
        {
          data: [{ id: 's1', nome: 'Cozinha', cor: '#00c8e8', cliente_id: 'c1' }],
          error: null,
        },
      ],
    });

    const Storage = await loadStorage(supabaseMock);
    const result = await Storage.loadFromSupabase();

    // Setor foi trazido via select anterior (sem descricao/responsavel)
    expect(result.setores).toHaveLength(1);
    expect(result.setores[0]).toMatchObject({
      id: 's1',
      nome: 'Cozinha',
      cor: '#00c8e8',
      clienteId: 'c1',
    });

    // Confirma que 2 SELECTs foram feitos: primeiro full, segundo anterior
    expect(supabaseMock.selectCalls.setores).toHaveLength(2);
    expect(supabaseMock.selectCalls.setores[0]).toContain('descricao');
    expect(supabaseMock.selectCalls.setores[0]).toContain('responsavel');
    expect(supabaseMock.selectCalls.setores[0]).toContain('cliente_id');
    expect(supabaseMock.selectCalls.setores[1]).not.toContain('descricao');
    expect(supabaseMock.selectCalls.setores[1]).not.toContain('responsavel');
    expect(supabaseMock.selectCalls.setores[1]).toContain('cliente_id');
  });

  it('faz fallback sem cliente_id quando o schema remoto ainda nao tem essa coluna', async () => {
    const supabaseMock = createSupabaseMock({
      setoresSelectQueue: [
        { data: null, error: { message: `column setores.cliente_id does not exist` } },
        { data: [{ id: 's1', nome: 'Cozinha', cor: '#00c8e8' }], error: null },
      ],
    });

    const Storage = await loadStorage(supabaseMock);
    const result = await Storage.loadFromSupabase();

    expect(result.setores).toHaveLength(1);
    expect(result.setores[0]).toMatchObject({
      id: 's1',
      nome: 'Cozinha',
      cor: '#00c8e8',
      clienteId: null,
    });
    expect(supabaseMock.selectCalls.setores).toHaveLength(2);
    expect(supabaseMock.selectCalls.setores[0]).toContain('cliente_id');
    expect(supabaseMock.selectCalls.setores[1]).not.toContain('cliente_id');
  });
});
