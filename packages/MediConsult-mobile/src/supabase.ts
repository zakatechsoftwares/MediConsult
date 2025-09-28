// src/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const SUPABASE_URL = process.env.SUPABASE_URL ?? (Constants.manifest?.extra?.SUPABASE_URL as string) ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? (Constants.manifest?.extra?.SUPABASE_ANON_KEY as string) ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase keys are not set. Set SUPABASE_URL and SUPABASE_ANON_KEY in environment.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function isAuthError(e: any) {
  return !!(e?.status === 401 || e?.statusCode === 401);
}
