import { supabase } from '../core/supabase.js';
import { createAuthenticatedAppV2BrowserOptions } from './authenticatedBrowserOptions';
import type { AppV2AuthenticatedBrowserClient } from './authenticatedBrowserOptions';
import { mountAuthenticatedAppV2 } from './authenticatedHarness';

const root = document.getElementById('app-v2-root');
const appV2Client = supabase as unknown as AppV2AuthenticatedBrowserClient;

if (root) {
  void mountAuthenticatedAppV2(root, createAuthenticatedAppV2BrowserOptions(appV2Client));
}
