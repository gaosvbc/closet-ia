import AsyncStorage from "@react-native-async-storage/async-storage";

// Tiny wrapper around the onboarding-complete flag used by the redirect logic
// in app/index.tsx and set when the user finishes registration.
const ONBOARDING_KEY = "onboarding_complete";

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch {
    // Non-fatal: worst case the user sees onboarding again next launch.
  }
}
