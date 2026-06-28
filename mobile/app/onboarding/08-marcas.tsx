import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import ChipGroup from "@/components/onboarding/ChipGroup";
import { useOnboarding } from "@/lib/onboarding-context";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

const BRANDS = [
  "Zara", "Massimo Dutti", "COS", "Mango", "H&M", "Sandro", "Arket", "Pull&Bear",
];
const MIN = 3;

export default function Marcas() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [query, setQuery] = useState("");

  // Include any custom brands the user already typed in and added, so they
  // show up (and stay toggleable) alongside the preset list.
  const allOptions = [...BRANDS, ...data.brands.filter((b) => !BRANDS.includes(b))];
  const filtered = allOptions.filter((b) =>
    b.toLowerCase().includes(query.trim().toLowerCase())
  );

  function toggle(brand: string) {
    update({
      brands: data.brands.includes(brand)
        ? data.brands.filter((b) => b !== brand)
        : [...data.brands, brand],
    });
  }

  function addCustom() {
    const brand = query.trim();
    if (!brand || data.brands.includes(brand)) return;
    update({ brands: [...data.brands, brand] });
    setQuery("");
  }

  const enough = data.brands.length >= MIN;

  return (
    <OnboardingScaffold
      step={8}
      stepLabel="08 · Elige marcas"
      titleNormal="Elige "
      titleAccent="marcas"
      subtitle="Las que ya tienes o las que te gustaría tener."
      skipLabel="Omitir"
      onSkip={() => router.push("/onboarding/09-fuente")}
      ctaDisabled={!enough}
      onContinue={() => router.push("/onboarding/09-fuente")}
    >
      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={addCustom}
        returnKeyType="done"
        placeholder="Buscar o agregar marcas…"
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
      />

      <Text style={styles.counter}>
        {enough
          ? `${data.brands.length} marcas seleccionadas`
          : `Seleccionadas: ${data.brands.length} de ${MIN} mínimo`}
      </Text>

      <View style={styles.chips}>
        <ChipGroup options={filtered} selected={data.brands} onToggle={toggle} />
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
  counter: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.accent,
    marginTop: 16,
  },
  chips: { marginTop: 14 },
});
