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
  signupsByDay: { date: string; count: number }[];
  onboarding: {
    starts: number;
    completes: number;
    completionRate: number; // 0..1
    bodyMeasurementRate: number; // 0..1 of body profiles that include height
  };
  bodyTypeDistribution: { label: string; count: number }[];
  fitPreferenceDistribution: { label: string; count: number }[];
  featureVotes: { label: string; count: number }[];
  planBreakdown: { plan: string; count: number }[];
  billingBreakdown: { monthly: number; annual: number };
  survey: {
    averageMinutesDeciding: number | null;
    wardrobeSizeDistribution: { label: string; count: number }[];
  };
  recentLeads: { email: string; source: string | null; createdAt: string }[];
}

// Representative midpoints for the q1 minute buckets, used to compute an
// average. Buckets are stored as text; this maps them to a number.
const MINUTES_MIDPOINT: Record<string, number> = {
  "<5": 3,
  "5-10": 7.5,
  "10-20": 15,
  "20+": 25,
};

/**
 * Pull aggregate stats from Supabase (service-role, server-only). Returns null
 * if Supabase is not configured. Aggregation is done in JS, which is fine at
 * validation scale.
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getServiceClient();
  if (!client) return null;

  const [
    leadsCountRes,
    surveyCountRes,
    leadDatesRes,
    bodyRes,
    featureRes,
    priceRes,
    surveyRowsRes,
    eventsRes,
    recentRes,
  ] = await Promise.all([
    client.from("leads").select("id", { count: "exact", head: true }),
    client.from("survey_responses").select("id", { count: "exact", head: true }),
    client.from("leads").select("created_at"),
    client
      .from("body_profiles")
      .select("body_type, fit_preference, height_cm, consent_body_data"),
    client.from("feature_votes").select("feature_label"),
    client.from("price_votes").select("plan_selected, billing_preference"),
    client
      .from("survey_responses")
      .select("q1_minutes_deciding, q2_wardrobe_size"),
    client.from("page_events").select("event_name"),
    client
      .from("leads")
      .select("email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalLeads = leadsCountRes.count ?? 0;
  const surveyResponses = surveyCountRes.count ?? 0;

  // Signups by day — last 14 days.
  const dayMap = new Map<string, number>();
  for (const row of (leadDatesRes.data ?? []) as { created_at: string }[]) {
    const day = row.created_at.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const signupsByDay: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    signupsByDay.push({ date: key, count: dayMap.get(key) ?? 0 });
  }

  // Body profile distributions.
  const bodyTypeMap = new Map<string, number>();
  const fitMap = new Map<string, number>();
  let bodyProfiles = 0;
  let withMeasurements = 0;
  for (const row of (bodyRes.data ?? []) as {
    body_type: string | null;
    fit_preference: string | null;
    height_cm: number | null;
    consent_body_data: boolean | null;
  }[]) {
    bodyProfiles += 1;
    if (row.body_type)
      bodyTypeMap.set(row.body_type, (bodyTypeMap.get(row.body_type) ?? 0) + 1);
    if (row.fit_preference)
      fitMap.set(
        row.fit_preference,
        (fitMap.get(row.fit_preference) ?? 0) + 1
      );
    if (row.consent_body_data && row.height_cm != null) withMeasurements += 1;
  }
  const toDistribution = (m: Map<string, number>) =>
    [...m.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

  // Feature votes ranked by popularity.
  const featureMap = new Map<string, number>();
  for (const row of (featureRes.data ?? []) as { feature_label: string }[]) {
    featureMap.set(
      row.feature_label,
      (featureMap.get(row.feature_label) ?? 0) + 1
    );
  }
  const featureVotes = toDistribution(featureMap);

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
  const planBreakdown = ["essential", "pro"].map((plan) => ({
    plan,
    count: planMap.get(plan) ?? 0,
  }));

  // Survey: average minutes + wardrobe size distribution.
  let minutesSum = 0;
  let minutesCount = 0;
  const wardrobeMap = new Map<string, number>();
  for (const row of (surveyRowsRes.data ?? []) as {
    q1_minutes_deciding: string | null;
    q2_wardrobe_size: string | null;
  }[]) {
    if (row.q1_minutes_deciding && MINUTES_MIDPOINT[row.q1_minutes_deciding]) {
      minutesSum += MINUTES_MIDPOINT[row.q1_minutes_deciding];
      minutesCount += 1;
    }
    if (row.q2_wardrobe_size)
      wardrobeMap.set(
        row.q2_wardrobe_size,
        (wardrobeMap.get(row.q2_wardrobe_size) ?? 0) + 1
      );
  }

  // Onboarding completion from events.
  let starts = 0;
  let completes = 0;
  for (const row of (eventsRes.data ?? []) as { event_name: string }[]) {
    if (row.event_name === "onboarding_start") starts += 1;
    else if (row.event_name === "onboarding_complete") completes += 1;
  }

  const recentLeads = ((recentRes.data ?? []) as {
    email: string;
    source: string | null;
    created_at: string;
  }[]).map((row) => ({
    email: row.email,
    source: row.source,
    createdAt: row.created_at,
  }));

  return {
    totalLeads,
    surveyResponses,
    surveyCompletionRate: totalLeads > 0 ? surveyResponses / totalLeads : 0,
    signupsByDay,
    onboarding: {
      starts,
      completes,
      completionRate: starts > 0 ? completes / starts : 0,
      bodyMeasurementRate:
        bodyProfiles > 0 ? withMeasurements / bodyProfiles : 0,
    },
    bodyTypeDistribution: toDistribution(bodyTypeMap),
    fitPreferenceDistribution: toDistribution(fitMap),
    featureVotes,
    planBreakdown,
    billingBreakdown: { monthly, annual },
    survey: {
      averageMinutesDeciding:
        minutesCount > 0 ? minutesSum / minutesCount : null,
      wardrobeSizeDistribution: toDistribution(wardrobeMap),
    },
    recentLeads,
  };
}
