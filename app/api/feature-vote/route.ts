import { featureVoteSchema } from "@/lib/validation";
import { insertRow } from "@/lib/supabase";
import { badRequest, firstZodMessage, ok, readJson, serverError } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest();

  const parsed = featureVoteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(firstZodMessage(parsed.error));
  }

  const data = parsed.data;

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
