export function mockSupabase() {
  const from = () => ({
    upsert: async () => ({ data: [], error: null }),
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: [], error: null }),
    update: async () => ({ data: [], error: null }),
    delete: async () => ({ data: [], error: null }),
    eq: function eq() {
      return this;
    },
    order: function order() {
      return this;
    },
    limit: function limit() {
      return this;
    },
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  });

  return {
    auth: {
      getUser: async () => ({ data: { user: { id: 'test-user' } } }),
    },
    from,
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        download: async () => ({ data: null, error: null }),
      }),
    },
  };
}
