import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Verifies the Supabase access token from a request's `Authorization: Bearer`
 * header and returns the authenticated user's id, or null if the header is
 * missing, the token is invalid/expired, or Supabase isn't configured.
 *
 * Uses the anon client, never the service role client — the token itself is
 * the proof of identity, so no elevated privileges are needed to check it,
 * and using the service role here would defeat the point of verification.
 */
export async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  if (!SUPABASE_URL || !ANON_KEY) return null;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
