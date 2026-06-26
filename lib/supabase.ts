import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// Supabase integration layer — with a safe fallback mock mode.
//
// The whole app is designed to run WITHOUT Supabase configured. When the
// environment variables are absent, every write becomes a console log and the
// UI behaves exactly as if it succeeded. This keeps the validation MVP live
// from day one and lets us connect a real backend later by only adding env
// vars.
//
// SECURITY: the service role key bypasses Row Level Security and must NEVER be
// exposed to the browser. It is read only here, in modules that run on the
// server (API routes and server components). Never import this with the intent
// of shipping the service client to a Client Component.
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when we have enough configuration to talk to Supabase server-side. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

/** Public-key configuration check (URL + anon key). Mostly informational. */
export function isSupabasePublicConfigured(): boolean {
  return Boolean(SUPABASE_URL && ANON_KEY);
}

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Returns a service-role Supabase client for server-side use, or `null` when
 * Supabase is not configured (fallback mode). Callers MUST handle `null`.
 */
export function getServiceClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cachedAdminClient) return cachedAdminClient;

  cachedAdminClient = createClient(SUPABASE_URL as string, SERVICE_ROLE_KEY as string, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedAdminClient;
}

export type InsertResult =
  | { ok: true; mode: "supabase" | "fallback"; id?: string }
  | { ok: false; mode: "supabase"; error: string };

/**
 * Insert a row into a table using the service client, or log to the console in
 * fallback mode. Never throws — always returns a structured result so callers
 * can respond gracefully.
 */
export async function insertRow(
  table: string,
  payload: Record<string, unknown>
): Promise<InsertResult> {
  const client = getServiceClient();

  if (!client) {
    // Fallback mode: log instead of persisting.
    // eslint-disable-next-line no-console
    console.log(`[fallback] insert into ${table}:`, JSON.stringify(payload));
    return { ok: true, mode: "fallback" };
  }

  try {
    const { data, error } = await client
      .from(table)
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error(`[supabase] insert ${table} failed:`, error.message);
      return { ok: false, mode: "supabase", error: error.message };
    }

    return { ok: true, mode: "supabase", id: (data as { id?: string })?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // eslint-disable-next-line no-console
    console.error(`[supabase] insert ${table} threw:`, message);
    return { ok: false, mode: "supabase", error: message };
  }
}
