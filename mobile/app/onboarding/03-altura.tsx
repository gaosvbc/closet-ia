import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import UnitToggle from "@/components/onboarding/UnitToggle";
import WheelPicker from "@/components/onboarding/WheelPicker";
import { useOnboarding } from "@/lib/onboarding-context";

// cm range 140–210; ft/in expressed as total inches 55–82.
const CM_VALUES = Array.from({ length: 71 }, (_, i) => 140 + i);
const IN_VALUES = Array.from({ length: 28 }, (_, i) => 55 + i);

export default function Altura() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const isCm = data.heightUnit === "cm";

  return (
    <OnboardingScaffold
      step={3}
      stepLabel="03 · Altura"
      titleNormal="¿Cuánto "
      titleAccent="mides?"
      subtitle="Lo usamos para ajustar el fit de cada look a tu figura."
      onContinue={() => router.push("/onboarding/04-peso")}
    >
      <View style={styles.toggleWrap}>
        <UnitToggle
          value={data.heightUnit}
          onChange={(u) =>
            update({ heightUnit: u, height: u === "cm" ? 172 : 68 })
          }
          options={[
            { value: "cm", label: "cm" },
            { value: "ft", label: "ft, in" },
          ]}
        />
      </View>

      <WheelPicker
        values={isCm ? CM_VALUES : IN_VALUES}
        value={data.height}
        onChange={(v) => update({ height: v })}
        unit={isCm ? "cm" : "in"}
      />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  toggleWrap: { marginBottom: 24 },
});
