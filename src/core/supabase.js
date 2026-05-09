import { createClient } from '@supabase/supabase-js';
import { getSupabaseBrowserConfig } from './supabaseConfig.js';

const { url: supabaseUrl, anonKey: supabaseKey } = getSupabaseBrowserConfig();

export const supabase = createClient(supabaseUrl, supabaseKey);
