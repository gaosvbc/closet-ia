import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase client with a safe fallback "mock mode". When the EXPO_PUBLIC_*
// environment variables are absent, `isMockMode` is true and `supabase` is
// null — the whole app then runs on the bundled demo data in lib/mock-data.ts
// and never crashes.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isMockMode = !url || !key;

export const supabase: SupabaseClient | null = isMockMode
  ? null
  : createClient(url as string, key as string);
