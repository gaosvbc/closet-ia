import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import SelectCard from "@/components/onboarding/SelectCard";
import { useOnboarding, type ClothingType } from "@/lib/onboarding-context";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

export default function QueUsas() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  function toggle(type: ClothingType) {
    const has = data.clothingType.includes(type);
    update({
      clothingType: has
        ? data.clothingType.filter((t) => t !== type)
        : [...data.clothingType, type],
    });
  }

  return (
    <OnboardingScaffold
      step={1}
      stepLabel="01 · ¿Qué usas?"
      titleNormal="¿Qué "
      titleAccent="usas?"
      subtitle="Puedes elegir ambas opciones si te interesan los dos estilos."
      showBack={false}
      ctaDisabled={data.clothingType.length === 0}
      onContinue={() => router.push("/onboarding/02-tu-perfil")}
    >
      <View style={styles.cards}>
        <SelectCard
          label="Ropa femenina"
          selected={data.clothingType.includes("feminine")}
          onPress={() => toggle("feminine")}
          style={{ flex: 1 }}
          icon={<Feather name="shopping-bag" size={26} color={colors.accent} />}
        />
        <SelectCard
          label="Ropa masculina"
          selected={data.clothingType.includes("masculine")}
          onPress={() => toggle("masculine")}
          style={{ flex: 1 }}
          icon={<Feather name="shopping-bag" size={26} color={colors.accent} />}
        />
      </View>

      <Pressable style={styles.lang} accessibilityRole="button">
        <Feather name="globe" size={14} color={colors.textSecondary} />
        <Text style={styles.langText}>Idioma · Español</Text>
      </Pressable>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  cards: { flexDirection: "row", gap: 12 },
  lang: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 24 },
  langText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
});
