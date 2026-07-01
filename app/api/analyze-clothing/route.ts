import { analyzeClothingItem } from "@/lib/ai/clothing-analysis";
import { logVisionUsage } from "@/lib/ai/usage-tracking";
import { getUserPlanTier } from "@/lib/supabase/user";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { badRequest, ok, readJson, serverError, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

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

  const body = await readJson<AnalyzeClothingBody>(request);
  if (!body) return badRequest();

  const { imageBase64, mediaType } = body;

  if (!imageBase64 || !mediaType) {
    return badRequest("Missing required fields");
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
