import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import ProgressBar from "@/components/onboarding/ProgressBar";
import AccentTitle from "@/components/onboarding/AccentTitle";
import Button from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Shared chrome for the 10 onboarding screens: back button + progress bar +
// optional skip, the step label, the accented title, subtitle, scrollable body,
// and a pinned primary CTA.
export default function OnboardingScaffold({
  step,
  stepLabel,
  titleNormal,
  titleAccent,
  subtitle,
  children,
  ctaLabel = "Continuar",
  onContinue,
  ctaDisabled = false,
  onBack,
  showBack = true,
  skipLabel,
  onSkip,
}: {
  step: number;
  stepLabel: string;
  titleNormal: string;
  titleAccent: string;
  subtitle?: string;
  children?: React.ReactNode;
  ctaLabel?: string;
  onContinue: () => void;
  ctaDisabled?: boolean;
  onBack?: () => void;
  showBack?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
}) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="dark" />

      {/* Top row: back + progress + skip */}
      <View style={styles.topRow}>
        {showBack ? (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            accessibilityRole="button"
            accessibilityLabel="Atrás"
            style={styles.backBtn}
          >
            <Feather name="chevron-left" size={20} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}

        <View style={styles.progressWrap}>
          <ProgressBar step={step} total={10} />
        </View>

        {skipLabel ? (
          <Pressable onPress={onSkip} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipText}>{skipLabel}</Text>
          </Pressable>
        ) : (
          <View style={styles.skip} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepLabel}>{stepLabel}</Text>
        <AccentTitle normal={titleNormal} accent={titleAccent} />
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={ctaLabel} onPress={onContinue} disabled={ctaDisabled} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrap: { flex: 1 },
  skip: { minWidth: 48, alignItems: "flex-end" },
  skipText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  stepLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 10,
  },
  body: { marginTop: 28 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
