import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isMockMode } from "@/lib/supabase";

const DEMO_USER_ID_KEY = "demo_user_id";

function generateUuid(): string {
  // RFC4122-ish v4 UUID using Math.random — good enough for a local demo
  // identity, not a security-sensitive value.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Resolves the current user's id: the real Supabase auth user when
 * configured and signed in, otherwise a stable per-device id persisted in
 * AsyncStorage so demo/mock mode behaves consistently across app launches.
 */
export async function getUserId(): Promise<string> {
  if (!isMockMode && supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) return data.user.id;
  }

  const existing = await AsyncStorage.getItem(DEMO_USER_ID_KEY);
  if (existing) return existing;

  const generated = generateUuid();
  await AsyncStorage.setItem(DEMO_USER_ID_KEY, generated);
  return generated;
}
