import { onboardingSchema } from "@/lib/validation";
import { insertRow } from "@/lib/supabase";
import { badRequest, firstZodMessage, ok, readJson, serverError } from "@/lib/api";

export const runtime = "nodejs";

// Onboarding capture: creates a lead and, only with explicit consent, a body
// profile. Body measurements are never stored unless `consentBodyData` is true.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest();

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(firstZodMessage(parsed.error));
  }

  const data = parsed.data;

  if (data.company && data.company.length > 0) {
    return ok({ mode: "honeypot" });
  }

  try {
    const leadResult = await insertRow("leads", {
      email: data.email,
      source: "onboarding",
      consent_email: true,
    });

    if (!leadResult.ok) {
      return serverError();
    }

    const hasProfile =
      data.bodyType !== undefined ||
      data.fitPreference !== undefined ||
      data.genderExpression !== undefined ||
      data.biggestChallenge !== undefined ||
      data.heightCm !== undefined ||
      data.weightKg !== undefined;

    // Store measurements ONLY with explicit consent. Without consent we still
    // keep non-measurement style preferences (body type / fit / challenge),
    // which carry no health data — but height and weight are dropped.
    if (hasProfile) {
      const consented = data.consentBodyData === true;
      await insertRow("body_profiles", {
        lead_id: leadResult.mode === "supabase" ? leadResult.id ?? null : null,
        height_cm: consented ? (data.heightCm ?? null) : null,
        weight_kg: consented ? (data.weightKg ?? null) : null,
        body_type: data.bodyType ?? null,
        fit_preference: data.fitPreference ?? null,
        gender_expression: data.genderExpression ?? null,
        biggest_challenge: data.biggestChallenge ?? null,
        consent_body_data: consented,
      });
    }

    return ok({ mode: leadResult.mode });
  } catch {
    return serverError();
  }
}
