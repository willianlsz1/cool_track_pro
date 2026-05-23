import type { AppV2SessionReader, AppV2SessionUser } from './appV2SessionReader';

export interface SupabaseAppV2AuthClient {
  auth: {
    getUser(): Promise<SupabaseAppV2GetUserResult>;
  };
}

interface SupabaseAppV2GetUserResult {
  data?: {
    user?: {
      id?: string | null;
      email?: string | null;
    } | null;
  } | null;
  error?: { message?: string } | null;
}

export function createSupabaseAppV2SessionReader(
  client: SupabaseAppV2AuthClient,
): AppV2SessionReader {
  return {
    async getCurrentUser(): Promise<AppV2SessionUser | null> {
      try {
        const { data, error } = await client.auth.getUser();

        if (error) {
          return null;
        }

        const id = String(data?.user?.id ?? '').trim();

        if (!id) {
          return null;
        }

        return {
          id,
          email: data?.user?.email ?? null,
        };
      } catch (_error) {
        return null;
      }
    },
  };
}
