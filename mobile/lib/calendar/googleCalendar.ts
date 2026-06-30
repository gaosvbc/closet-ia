export interface CalendarEvent {
  title: string;
  startTime: string; // "10:00 AM" formatted
  isAllDay: boolean;
}

interface GoogleEventItem {
  summary?: string;
  start?: { dateTime?: string; date?: string };
}

function formatStartTime(dateTime: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateTime));
}

function startOfTodayISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
}

function endOfTodayISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
}

// Read-only, today-only fetch from the user's primary calendar. Returns
// only title + start time — no attendees, descriptions, or locations, to
// keep the scope minimal and privacy-conscious.
export async function getTodayEvents(accessToken: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: startOfTodayISO(),
    timeMax: endOfTodayISO(),
    singleEvents: "true",
    orderBy: "startTime",
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    throw new Error(`Google Calendar request failed: ${response.status}`);
  }

  const data = await response.json();
  const items: GoogleEventItem[] = data.items ?? [];

  return items.map((item) => {
    const isAllDay = !item.start?.dateTime;
    return {
      title: item.summary || "Evento sin título",
      startTime: isAllDay && item.start?.date ? "Todo el día" : formatStartTime(item.start?.dateTime ?? ""),
      isAllDay,
    };
  });
}
