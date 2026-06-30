import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { saveCalendarTokens, clearCalendarTokens, getCalendarTokens } from "./calendarTokens";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

// Read-only access to the user's primary calendar — nothing broader, per
// the privacy-conscious scope requested in the spec.
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export function getGoogleAuthRequestConfig() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "atelia" });
  return {
    clientId: GOOGLE_CLIENT_ID ?? "",
    scopes: [CALENDAR_SCOPE],
    redirectUri,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
    extraParams: {
      access_type: "offline",
      prompt: "consent",
    },
  };
}

export const googleDiscovery = discovery;

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google client ID not configured");
  }

  const response = await fetch(discovery.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  const data = (await response.json()) as TokenResponse;
  await saveCalendarTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google client ID not configured");
  }

  const response = await fetch(discovery.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = (await response.json()) as TokenResponse;
  await saveCalendarTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
}

export async function disconnectGoogleCalendar(): Promise<void> {
  await clearCalendarTokens();
}

// Returns a usable access token, refreshing it first if expired. Returns
// null if the user never connected their calendar or the refresh fails —
// callers should treat that as "no calendar data" and omit the badge,
// never as an error to surface.
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getCalendarTokens();
  if (!tokens) return null;
  if (tokens.expiresAt > Date.now()) return tokens.accessToken;
  if (!tokens.refreshToken) return null;
  try {
    await refreshAccessToken(tokens.refreshToken);
    const refreshed = await getCalendarTokens();
    return refreshed?.accessToken ?? null;
  } catch {
    return null;
  }
}
