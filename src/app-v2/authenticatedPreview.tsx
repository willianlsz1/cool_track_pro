import { supabase } from '../core/supabase.js';
import { createAuthenticatedAppV2BrowserOptions } from './authenticatedBrowserOptions';
import { mountAuthenticatedAppV2 } from './authenticatedHarness';

const root = document.getElementById('app-v2-authenticated-preview');

if (root) {
  void mountAuthenticatedAppV2(root, createAuthenticatedAppV2BrowserOptions(supabase));
}
