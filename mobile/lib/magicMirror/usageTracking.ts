import { supabase, isMockMode } from "@/lib/supabase";

export const SESSION_LIMIT_SECONDS = 300; // 5 min/day hard cap — do not weaken

// Token rates are estimates calibrated to match the project's existing
// $0.10-0.20/min unit-economics assumption (master doc section 2). They are
// not the verified Gemini Flash Live price list (unavailable to confirm in
// this sandbox). Revisit once real Gemini billing data is available.
const VIDEO_TOKENS_PER_SEC = 258;
const AUDIO_IN_TOKENS_PER_SEC = 32;
const AUDIO_OUT_TOKENS_PER_SEC = 25;
const VIDEO_USD_PER_MILLION = 10;
const AUDIO_IN_USD_PER_MILLION = 2;
const AUDIO_OUT_USD_PER_MILLION = 12;

export function estimateSessionCostUsd(seconds: number): number {
  return (
    (seconds * VIDEO_TOKENS_PER_SEC * VIDEO_USD_PER_MILLION +
      seconds * AUDIO_IN_TOKENS_PER_SEC * AUDIO_IN_USD_PER_MILLION +
      seconds * AUDIO_OUT_TOKENS_PER_SEC * AUDIO_OUT_USD_PER_MILLION) /
    1_000_000
  );
}

export interface UsageState {
  secondsUsed: number;
  remainingSeconds: number;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Mock mode (no Supabase) reports a full day available so local dev never
// gets blocked by the usage table.
export async function getTodayUsage(userId: string): Promise<UsageState> {
  if (isMockMode || !supabase) {
    return { secondsUsed: 0, remainingSeconds: SESSION_LIMIT_SECONDS };
  }
  const { data } = await supabase
    .from("magic_mirror_usage")
    .select("seconds_used")
    .eq("user_id", userId)
    .eq("usage_date", todayIso())
    .maybeSingle();
  const secondsUsed = data?.seconds_used ?? 0;
  return { secondsUsed, remainingSeconds: Math.max(0, SESSION_LIMIT_SECONDS - secondsUsed) };
}

// Called every 10-15s during an active session (and once more at session end)
// so the server counter advances even if the app crashes or is force-closed.
export async function recordHeartbeat(
  userId: string,
  additionalSeconds: number,
  additionalCostUsd: number
): Promise<UsageState> {
  if (isMockMode || !supabase || additionalSeconds <= 0) {
    return getTodayUsage(userId);
  }

  const today = todayIso();
  const { data: existing } = await supabase
    .from("magic_mirror_usage")
    .select("seconds_used, estimated_cost_usd")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  const newSecondsUsed = Math.min(
    SESSION_LIMIT_SECONDS,
    (existing?.seconds_used ?? 0) + additionalSeconds
  );
  const newCost = (existing?.estimated_cost_usd ?? 0) + additionalCostUsd;

  await supabase.from("magic_mirror_usage").upsert(
    {
      user_id: userId,
      usage_date: today,
      seconds_used: newSecondsUsed,
      estimated_cost_usd: newCost,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,usage_date" }
  );

  return {
    secondsUsed: newSecondsUsed,
    remainingSeconds: Math.max(0, SESSION_LIMIT_SECONDS - newSecondsUsed),
  };
}
