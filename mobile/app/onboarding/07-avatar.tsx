import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import { useOnboarding } from "@/lib/onboarding-context";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

const BODY_TYPES = [
  { value: "slim", label: "Esbelto" },
  { value: "medium", label: "Medio" },
  { value: "curvy", label: "Curvy" },
];

export default function Avatar() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingScaffold
      step={7}
      stepLabel="07 · Crea tu avatar"
      titleNormal="Crea tu "
      titleAccent="avatar"
      subtitle="Pruébate looks y mira cómo te quedan de verdad."
      skipLabel="Omitir"
      onSkip={() => router.push("/onboarding/08-marcas")}
      onContinue={() => router.push("/onboarding/08-marcas")}
    >
      {/* Avatar preview placeholder */}
      <View style={styles.preview}>
        <Feather name="user" size={72} color={colors.textSecondary} strokeWidth={1} />
      </View>

      {/* Body type selector */}
      <View style={styles.types}>
        {BODY_TYPES.map((t) => {
          const sel = data.bodyType === t.value;
          return (
            <Pressable
              key={t.value}
              onPress={() => update({ bodyType: t.value })}
              style={[styles.type, sel ? styles.typeSel : styles.typeIdle]}
              accessibilityRole="button"
              accessibilityState={{ selected: sel }}
            >
              <Text
                style={[styles.typeText, { color: sel ? colors.white : colors.textPrimary }]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: 280,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  types: { flexDirection: "row", gap: 10, marginTop: 24 },
  type: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
  },
  typeIdle: { backgroundColor: colors.surface, borderColor: colors.border },
  typeSel: { backgroundColor: colors.accent, borderColor: colors.accent },
  typeText: { fontFamily: fonts.bodyMedium, fontSize: 14 },
});
