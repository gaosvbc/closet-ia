import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import type { PlanTier } from "@/lib/ai/clothing-analysis";

// Resolves which AI analysis tier a user is entitled to. Falls back to the
// cheapest tier ("essential") whenever we can't positively confirm a paid
// plan — Supabase not configured, no profile row yet, or a read error. This
// keeps the AI cost ceiling safe by default rather than accidentally
// granting the most expensive tier.
export async function getUserPlanTier(userId: string): Promise<PlanTier> {
  if (!isSupabaseConfigured()) return "essential";

  const client = getServiceClient();
  if (!client) return "essential";

  try {
    const { data, error } = await client
      .from("user_profiles")
      .select("plan_tier")
      .eq("id", userId)
      .single();

    if (error || !data) return "essential";

    const tier = (data as { plan_tier?: string }).plan_tier;
    if (tier === "pro" || tier === "elite") return tier;
    return "essential";
  } catch {
    return "essential";
  }
}
