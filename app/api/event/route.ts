import { pageEventSchema } from "@/lib/validation";
import { insertRow } from "@/lib/supabase";
import { badRequest, firstZodMessage, ok, readJson, serverError } from "@/lib/api";

export const runtime = "nodejs";

// Generic page/interaction event logger. Used by the demo "Love this look" /
// "Try another" buttons and key conversion points.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest();

  const parsed = pageEventSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(firstZodMessage(parsed.error));
  }

  const data = parsed.data;

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
