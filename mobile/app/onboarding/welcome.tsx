import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import Dots from "@/components/onboarding/Dots";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.center}>
        {/* Brand mark */}
        <View style={styles.mark}>
          <Text style={styles.markLetter}>C</Text>
        </View>

        <Text style={styles.headline}>
          Tu armario.{"\n"}Tu estilo.{"\n"}
          <Text style={styles.headlineItalic}>Tu historia.</Text>
        </Text>
        <Text style={styles.subtitle}>La cámara como tu estilista diario.</Text>
      </View>

      <View style={styles.bottom}>
        <Dots active={0} />
        <Button
          label="Comenzar"
          variant="light"
          onPress={() => router.push("/onboarding/slide2")}
        />
        <Button
          label="Iniciar sesión"
          variant="outlineLight"
          onPress={() => router.push("/onboarding/register")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.accent, paddingHorizontal: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 28 },
  mark: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  markLetter: {
    fontFamily: fonts.displayItalic,
    fontSize: 52,
    color: colors.accent,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 44,
    color: colors.white,
    textAlign: "center",
  },
  headlineItalic: { fontFamily: fonts.displayItalic },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.white,
    opacity: 0.7,
    textAlign: "center",
  },
  bottom: { gap: 16, paddingBottom: 24 },
});
