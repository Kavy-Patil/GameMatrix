import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process?.env : undefined;

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  envProcess?.VITE_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  envProcess?.VITE_SUPABASE_ANON_KEY ||
  '';

/**
 * Checks whether Supabase has been properly configured with valid non-placeholder credentials.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-public-key')
  );
}

// Fallback dummy client placeholder if not yet configured
const dummyUrl = 'https://placeholder.supabase.co';
const dummyKey = 'placeholder-key';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : dummyUrl,
  isSupabaseConfigured() ? supabaseAnonKey : dummyKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
