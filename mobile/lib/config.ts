// API base URL for the Next.js backend (analyze-clothing and friends). Unset
// in mock mode — callers must check `isApiConfigured` before fetching.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export const isApiConfigured = API_URL.length > 0;
