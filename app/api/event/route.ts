import { pageEventSchema } from "@/lib/validation";
import { insertRow } from "@/lib/supabase";
import { badRequest, firstZodMessage, ok, readJson, serverError, tooManyRequests } from "@/lib/api";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RATE_WINDOW_SECS = 3600;
const RATE_MAX = 100;

// Generic page/interaction event logger. Used by the demo "Love this look" /
// "Try another" buttons and key conversion points.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`${ip}:event`, RATE_WINDOW_SECS, RATE_MAX);
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSecs);

  const body = await readJson(request);
  if (!body) return badRequest();

  const parsed = pageEventSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(firstZodMessage(parsed.error));
  }

  const data = parsed.data;

  // Honeypot — silently accept but persist nothing.
  if (data.company && data.company.length > 0) {
    return ok({ mode: "honeypot" });
  }

  try {
    const result = await insertRow("page_events", {
      event_name: data.eventName,
      metadata: data.metadata ?? {},
    });

    if (!result.ok) return serverError();
    return ok({ mode: result.mode });
  } catch {
    return serverError();
  }
}
