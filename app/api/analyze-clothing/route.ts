import { analyzeClothingItem } from "@/lib/ai/clothing-analysis";
import { logVisionUsage } from "@/lib/ai/usage-tracking";
import { getUserPlanTier } from "@/lib/supabase/user";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { badRequest, ok, readJson, serverError, tooManyRequests, unauthorized } from "@/lib/api";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

// 4.5 MB decoded ≈ 6 MB base64 (base64 overhead is ~33%).
const MAX_IMAGE_BASE64_LEN = 6_000_000;

// 10 analyses per hour per IP — tight because each call charges Anthropic tokens.
const RATE_WINDOW_SECS = 3600;
const RATE_MAX = 10;

interface AnalyzeClothingBody {
  imageBase64?: string;
  mediaType?: string;
}

const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png"]);

// Analyzes a clothing item photo with Claude Vision. Analysis depth is
// resolved server-side from the user's plan tier — the client never chooses
// it — and the call is never allowed to block saving an item: any failure
// here should surface as a friendly "fill in manually" message client-side.
export async function POST(request: Request) {
  // The caller's identity is derived exclusively from a verified Supabase
  // session token — never from a client-supplied id — so no one can spend
  // another user's plan quota or Anthropic budget by guessing a UUID.
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return unauthorized();

  const ip = getClientIp(request);
  const rl = checkRateLimit(`${ip}:analyze-clothing`, RATE_WINDOW_SECS, RATE_MAX);
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSecs);

  const body = await readJson<AnalyzeClothingBody>(request);
  if (!body) return badRequest();

  const { imageBase64, mediaType } = body;

  if (!imageBase64 || !mediaType) {
    return badRequest("Missing required fields");
  }

  if (imageBase64.length > MAX_IMAGE_BASE64_LEN) {
    return badRequest("Image exceeds maximum allowed size (4.5 MB)");
  }

  if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
    return badRequest("Unsupported image type");
  }

  try {
    const planTier = await getUserPlanTier(userId);

    const { analysis, usage } = await analyzeClothingItem(
      imageBase64,
      mediaType as "image/jpeg" | "image/png",
      planTier
    );

    // Fire-and-forget: never let usage logging block or fail the response.
    void logVisionUsage(userId, planTier, usage);

    return ok({ analysis, planTier });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Clothing analysis error:", error);
    return serverError("Failed to analyze clothing item. Please try again.");
  }
}
