import { waitlistSchema } from "@/lib/validation";
import { insertRow } from "@/lib/supabase";
import { badRequest, firstZodMessage, ok, readJson, serverError } from "@/lib/api";

export const runtime = "nodejs";

// Captures a waitlist lead and, when present, the embedded survey response.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest();

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(firstZodMessage(parsed.error));
  }

  const data = parsed.data;

  // Honeypot — silently accept (so bots can't probe) but persist nothing.
  if (data.company && data.company.length > 0) {
    return ok({ mode: "honeypot" });
  }

  try {
    const leadResult = await insertRow("leads", {
      email: data.email,
      first_name: data.firstName || null,
      source: "waitlist",
      consent_email: data.consentEmail,
    });

    if (!leadResult.ok) {
      return serverError();
    }

    const hasSurvey =
      data.q1MinutesDeciding !== undefined ||
      data.q2WardrobeSize !== undefined ||
      data.q3TriedAppBefore !== undefined ||
      data.q4WouldPay !== undefined;

    if (hasSurvey) {
      await insertRow("survey_responses", {
        lead_id: leadResult.mode === "supabase" ? leadResult.id ?? null : null,
        q1_minutes_deciding: data.q1MinutesDeciding ?? null,
        q2_wardrobe_size: data.q2WardrobeSize ?? null,
        q3_tried_app_before: data.q3TriedAppBefore ?? null,
        q4_would_pay: data.q4WouldPay ?? null,
      });
    }

    return ok({ mode: leadResult.mode });
  } catch {
    return serverError();
  }
}
