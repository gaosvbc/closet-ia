import { insertRow } from "@/lib/supabase";
import type { PlanTier } from "@/lib/ai/clothing-analysis";

// Claude Haiku 4.5 list pricing, per the integration spec: $1 / $5 per
// million input / output tokens respectively.
const INPUT_COST_PER_TOKEN = 1 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 5 / 1_000_000;

export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
}

/**
 * Logs one Claude Vision call to `vision_api_usage` for cost monitoring.
 * Never throws — a logging failure must not affect the user-facing analysis
 * result, so it goes through the same fallback-safe `insertRow` helper used
 * everywhere else in the app.
 */
export async function logVisionUsage(
  userId: string,
  planTier: PlanTier,
  usage: { inputTokens: number; outputTokens: number }
): Promise<void> {
  const tokensUsed = usage.inputTokens + usage.outputTokens;
  const estimatedCostUsd = estimateCostUsd(usage.inputTokens, usage.outputTokens);

  await insertRow("vision_api_usage", {
    user_id: userId,
    plan_tier: planTier,
    tokens_used: tokensUsed,
    estimated_cost_usd: estimatedCostUsd,
  });
}
