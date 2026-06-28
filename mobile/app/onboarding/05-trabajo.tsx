import { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import ChipGroup from "@/components/onboarding/ChipGroup";
import { useOnboarding } from "@/lib/onboarding-context";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

const OCCUPATIONS = [
  "Abogada", "Marketing", "Ingeniería", "Estudiante", "Docente",
  "Consultoría", "Enfermería", "Diseño", "Ventas",
];

export default function Trabajo() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [query, setQuery] = useState("");

  const filtered = OCCUPATIONS.filter((o) =>
    o.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <OnboardingScaffold
      step={5}
      stepLabel="05 · ¿En qué trabajas?"
      titleNormal="¿En qué "
      titleAccent="trabajas?"
      subtitle="Personalizamos las recomendaciones para días hábiles y fines de semana."
      ctaDisabled={!data.occupation && !query.trim()}
      onContinue={() => {
        if (!data.occupation && query.trim()) update({ occupation: query.trim() });
        router.push("/onboarding/06-fotos");
      }}
    >
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Escribe o selecciona tu ocupación"
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
      />
      <View style={styles.chips}>
        <ChipGroup
          options={filtered}
          selected={data.occupation ? [data.occupation] : []}
          onToggle={(v) =>
            update({ occupation: data.occupation === v ? "" : v })
          }
        />
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chips: { marginTop: 20 },
});
