"use client";

// Client-side helper to record page events. Posts to /api/event, which either
// writes to Supabase (page_events) or logs to the server console in fallback
// mode. If the request itself fails, we log to the browser console so the demo
// still "feels real" and nothing is ever lost silently to the user.

export async function logEvent(
  eventName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, metadata }),
      keepalive: true,
    });
  } catch {
    // eslint-disable-next-line no-console
    console.log("[event:fallback]", eventName, metadata ?? {});
  }
}
