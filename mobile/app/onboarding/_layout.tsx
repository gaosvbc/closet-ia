import { Stack } from "expo-router";
import { OnboardingProvider } from "@/lib/onboarding-context";

// Wraps the whole 10-step flow in the onboarding state provider so each screen
// shares the same answers.
export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
    </OnboardingProvider>
  );
}
