import type { AuthenticatedAppV2MountOptions } from './authenticatedHarness';
import { createSupabaseAppV2SessionReader } from './data/supabaseAppV2SessionReader';
import type { SupabaseAppV2AuthClient } from './data/supabaseAppV2SessionReader';
import { loadAppV2ClientesFromSupabase } from './data/supabaseAppV2ClientsReader';
import type { AppV2ClientesSupabaseClient } from './data/supabaseAppV2ClientsReader';
import { saveAppV2ClienteToSupabase } from './data/supabaseAppV2ClientsWriter';
import type { SupabaseAppV2ClientsWriteClient } from './data/supabaseAppV2ClientsWriter';
import { saveAppV2EquipamentoToSupabase } from './data/supabaseAppV2EquipmentsWriter';
import type { SupabaseAppV2EquipmentsWriteClient } from './data/supabaseAppV2EquipmentsWriter';

export type AppV2AuthenticatedBrowserClient = SupabaseAppV2AuthClient &
  AppV2ClientesSupabaseClient &
  SupabaseAppV2ClientsWriteClient &
  SupabaseAppV2EquipmentsWriteClient;

export function createAuthenticatedAppV2BrowserOptions(
  client: AppV2AuthenticatedBrowserClient,
): AuthenticatedAppV2MountOptions {
  return {
    sessionReader: createSupabaseAppV2SessionReader(client),
    clientesReader: (userId) => loadAppV2ClientesFromSupabase({ client, userId }),
    clientesWriter: ({ userId, draft }) =>
      saveAppV2ClienteToSupabase({
        client,
        userId,
        draft,
      }),
    equipamentosWriter: ({ userId, draft }) =>
      saveAppV2EquipamentoToSupabase({
        client,
        userId,
        draft,
      }),
  };
}
