import { createHash } from "crypto";
import { cookies } from "next/headers";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";

// =============================================================================
// Admin dashboard logic — auth + server-side analytics.
//
// Auth is a simple password gate suitable for a single-operator validation
// dashboard. The ADMIN_PASSWORD never leaves the server: we set an httpOnly
// cookie whose value is a salted hash of the password, and compare hashes on
// each request. There is no client-side password check anywhere.
// =============================================================================

export const ADMIN_COOKIE = "vct_admin";

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`vct::${pw}`).digest("hex");
}

/** Constant-time-ish check of the admin session cookie. */
export function isAuthenticated(): boolean {
  const expected = expectedToken();
  if (!expected) return false;
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return Boolean(token) && token === expected;
}

/** Verify a submitted password and return the cookie token to set, or null. */
export function tokenForPassword(password: string): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  const candidate = createHash("sha256").update(`vct::${password}`).digest("hex");
  const expected = createHash("sha256").update(`vct::${pw}`).digest("hex");
  return candidate === expected ? expected : null;
}

export interface AdminStats {
  totalLeads: number;
  surveyResponses: number;
  surveyCompletionRate: number; // 0..1
  featureVotes: { label: string; count: number }[];
  planBreakdown: { plan: string; count: number }[];
  billingBreakdown: { monthly: number; annual: number };
  recentLeads: { email: string; createdAt: string }[];
}

/**
 * Pull aggregate stats from Supabase (service-role, server-only). Returns null
 * if Supabase is not configured. Aggregation is done in JS, which is fine at
 * validation scale.
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getServiceClient();
  if (!client) return null;

  const [leadsRes, surveyRes, featureRes, priceRes, recentRes] =
    await Promise.all([
      client.from("leads").select("id", { count: "exact", head: true }),
      client
        .from("survey_responses")
        .select("id", { count: "exact", head: true }),
      client.from("feature_votes").select("feature_label"),
      client.from("price_votes").select("plan_selected, billing_preference"),
      client
        .from("leads")
        .select("email, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const totalLeads = leadsRes.count ?? 0;
  const surveyResponses = surveyRes.count ?? 0;

  // Feature votes ranked by popularity.
  const featureMap = new Map<string, number>();
  for (const row of (featureRes.data ?? []) as { feature_label: string }[]) {
    featureMap.set(
      row.feature_label,
      (featureMap.get(row.feature_label) ?? 0) + 1
    );
  }
  const featureVotes = [...featureMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Plan + billing breakdown.
  const planMap = new Map<string, number>();
  let monthly = 0;
  let annual = 0;
  for (const row of (priceRes.data ?? []) as {
    plan_selected: string;
    billing_preference: string | null;
  }[]) {
    planMap.set(row.plan_selected, (planMap.get(row.plan_selected) ?? 0) + 1);
    if (row.billing_preference === "annual") annual += 1;
    else if (row.billing_preference === "monthly") monthly += 1;
  }
  const planBreakdown = ["free", "basic", "pro"].map((plan) => ({
    plan,
    count: planMap.get(plan) ?? 0,
  }));

  const recentLeads = ((recentRes.data ?? []) as {
    email: string;
    created_at: string;
  }[]).map((row) => ({ email: row.email, createdAt: row.created_at }));

  return {
    totalLeads,
    surveyResponses,
    surveyCompletionRate: totalLeads > 0 ? surveyResponses / totalLeads : 0,
    featureVotes,
    planBreakdown,
    billingBreakdown: { monthly, annual },
    recentLeads,
  };
}
