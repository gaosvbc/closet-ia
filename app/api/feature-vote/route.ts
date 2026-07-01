import { featureVoteSchema } from "@/lib/validation";
import { insertRow } from "@/lib/supabase";
import { badRequest, firstZodMessage, ok, readJson, serverError, tooManyRequests } from "@/lib/api";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RATE_WINDOW_SECS = 3600;
const RATE_MAX = 20;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`${ip}:feature-vote`, RATE_WINDOW_SECS, RATE_MAX);
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSecs);

  const body = await readJson(request);
  if (!body) return badRequest();

  const parsed = featureVoteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(firstZodMessage(parsed.error));
  }

  const data = parsed.data;

  // Honeypot — silently accept but persist nothing.
  if (data.company && data.company.length > 0) {
    return ok({ mode: "honeypot" });
  }

  try {
    const result = await insertRow("feature_votes", {
      email: data.email || null,
      feature_key: data.featureKey,
      feature_label: data.featureLabel,
    });

    if (!result.ok) return serverError();
    return ok({ mode: result.mode });
  } catch {
    return serverError();
  }
}
