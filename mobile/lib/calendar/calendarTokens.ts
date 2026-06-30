import * as SecureStore from "expo-secure-store";

// Google Calendar OAuth tokens. Stored exclusively in expo-secure-store
// (iOS Keychain / Android Keystore) — never in AsyncStorage, plain state,
// or Supabase. Supabase only ever sees the boolean
// user_profiles.google_calendar_connected flag.
const ACCESS_TOKEN_KEY = "atelia_gcal_access_token";
const REFRESH_TOKEN_KEY = "atelia_gcal_refresh_token";
const EXPIRES_AT_KEY = "atelia_gcal_expires_at";

export interface CalendarTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number; // epoch ms
}

export async function saveCalendarTokens(tokens: CalendarTokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(EXPIRES_AT_KEY, String(tokens.expiresAt));
  if (tokens.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export async function getCalendarTokens(): Promise<CalendarTokens | null> {
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  const expiresAtRaw = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAtRaw ? Number(expiresAtRaw) : 0,
  };
}

export async function clearCalendarTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
}

export async function isCalendarTokenValid(): Promise<boolean> {
  const tokens = await getCalendarTokens();
  if (!tokens) return false;
  return tokens.expiresAt > Date.now();
}
