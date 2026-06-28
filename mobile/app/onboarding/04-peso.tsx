import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import UnitToggle from "@/components/onboarding/UnitToggle";
import { useOnboarding } from "@/lib/onboarding-context";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

export default function Peso() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const unit = data.weightUnit;

  function adjust(delta: number) {
    update({ weight: Math.max(30, Math.min(250, Math.round((data.weight + delta) * 10) / 10)) });
  }

  return (
    <OnboardingScaffold
      step={4}
      stepLabel="04 · Peso"
      titleNormal="¿Cuánto "
      titleAccent="pesas?"
      subtitle="Solo para afinar las tallas. Es privado y editable."
      onContinue={() => router.push("/onboarding/05-trabajo")}
    >
      <View style={styles.toggleWrap}>
        <UnitToggle
          value={unit}
          onChange={(u) => update({ weightUnit: u })}
          options={[
            { value: "kg", label: "kg" },
            { value: "lbs", label: "lbs" },
          ]}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Peso actual</Text>
        <Text style={styles.value}>
          {data.weight.toFixed(1)} {unit}
        </Text>
        <View style={styles.controls}>
          <Pressable style={styles.ctrl} onPress={() => adjust(-0.5)} accessibilityLabel="Bajar peso">
            <Feather name="minus" size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.ctrl} onPress={() => adjust(0.5)} accessibilityLabel="Subir peso">
            <Feather name="plus" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  toggleWrap: { marginBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  value: { fontFamily: fonts.bodySemibold, fontSize: 40, color: colors.textPrimary },
  controls: { flexDirection: "row", gap: 16, marginTop: 12 },
  ctrl: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
