import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import Dots from "@/components/onboarding/Dots";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

// Shared layout for the two informational onboarding slides on the wine bg.
export default function InfoSlide({
  icon,
  title,
  body,
  activeDot,
  buttonLabel,
  onNext,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  activeDot: number;
  buttonLabel: string;
  onNext: () => void;
}) {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <Feather name={icon} size={64} color={colors.white} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <View style={styles.bottom}>
        <Dots active={activeDot} />
        <Button label={buttonLabel} variant="light" onPress={onNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.accent, paddingHorizontal: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.white,
    opacity: 0.7,
    textAlign: "center",
    maxWidth: 300,
  },
  bottom: { gap: 16, paddingBottom: 24 },
});
