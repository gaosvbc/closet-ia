import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import OnboardingScaffold from "@/components/onboarding/OnboardingScaffold";
import { useOnboarding } from "@/lib/onboarding-context";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

export default function Fotos() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  async function pick(which: "facePhoto" | "bodyPhoto") {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        update({ [which]: res.assets[0].uri });
      }
    } catch {
      // Permission denied or unavailable — leave as-is.
    }
  }

  return (
    <OnboardingScaffold
      step={6}
      stepLabel="06 · Añade tus fotos"
      titleNormal="Añade tus "
      titleAccent="fotos"
      subtitle="Una de tu rostro y otra de cuerpo entero para probarte cualquier look."
      skipLabel="Omitir"
      onSkip={() => router.push("/onboarding/07-avatar")}
      onContinue={() => router.push("/onboarding/07-avatar")}
    >
      <View style={styles.cards}>
        <UploadCard
          caption="Foto de rostro"
          label="ROSTRO"
          uri={data.facePhoto}
          onPress={() => pick("facePhoto")}
        />
        <UploadCard
          caption="Cuerpo entero"
          label="CUERPO"
          uri={data.bodyPhoto}
          onPress={() => pick("bodyPhoto")}
        />
      </View>

      <View style={styles.privacy}>
        <Feather name="lock" size={14} color={colors.textSecondary} />
        <Text style={styles.privacyText}>
          Tus fotos son privadas y solo visibles para ti. Puedes cambiarlas
          cuando quieras.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}

function UploadCard({
  label,
  caption,
  uri,
  onPress,
}: {
  label: string;
  caption: string;
  uri: string | null;
  onPress: () => void;
}) {
  return (
    <View style={styles.uploadWrap}>
      <Text style={styles.uploadLabel}>{label}</Text>
      <Pressable style={styles.upload} onPress={onPress} accessibilityRole="button">
        {uri ? (
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <>
            <View style={styles.plus}>
              <Feather name="plus" size={20} color={colors.white} />
            </View>
            <Text style={styles.caption}>{caption}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { flexDirection: "row", gap: 12 },
  uploadWrap: { flex: 1, gap: 8 },
  uploadLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  upload: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
  },
  preview: { width: "100%", height: "100%" },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  privacy: { flexDirection: "row", gap: 8, marginTop: 20, alignItems: "flex-start" },
  privacyText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
