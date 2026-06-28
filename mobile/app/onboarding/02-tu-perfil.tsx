import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import SelectCard from "@/components/onboarding/SelectCard";
import { useOnboarding, type Gender } from "@/lib/onboarding-context";
import { colors } from "@/constants/colors";

const OPTIONS: { value: Gender; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { value: "male", label: "Hombre", icon: "gender-male" },
  { value: "female", label: "Mujer", icon: "gender-female" },
  { value: "prefer_not", label: "Prefiero no decirlo", icon: "gender-male-female" },
];

export default function TuPerfil() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <OnboardingScaffold
      step={2}
      stepLabel="02 · Tu perfil"
      titleNormal="Cuéntanos sobre "
      titleAccent="ti"
      subtitle="Para que los looks realmente te queden."
      ctaDisabled={!data.gender}
      onContinue={() => router.push("/onboarding/03-altura")}
    >
      <View style={styles.cards}>
        {OPTIONS.map((o) => (
          <SelectCard
            key={o.value}
            label={o.label}
            layout="row"
            selected={data.gender === o.value}
            onPress={() => update({ gender: o.value })}
            icon={
              <MaterialCommunityIcons name={o.icon} size={24} color={colors.accent} />
            }
          />
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 12 },
});
