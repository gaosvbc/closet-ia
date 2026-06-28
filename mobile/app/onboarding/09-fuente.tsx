import { useRouter } from "expo-router";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import ChipGroup from "@/components/onboarding/ChipGroup";
import { useOnboarding } from "@/lib/onboarding-context";

const SOURCES = ["TikTok", "Instagram", "Amistad", "Google", "Pinterest", "Otro"];

export default function Fuente() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingScaffold
      step={9}
      stepLabel="09 · ¿Cómo nos conociste?"
      titleNormal="¿Cómo supiste de "
      titleAccent="nosotros?"
      ctaDisabled={!data.source}
      onContinue={() => router.push("/onboarding/10-gracias")}
    >
      <ChipGroup
        options={SOURCES}
        columns={2}
        selected={data.source ? [data.source] : []}
        onToggle={(v) => update({ source: data.source === v ? "" : v })}
      />
    </OnboardingScaffold>
  );
}
