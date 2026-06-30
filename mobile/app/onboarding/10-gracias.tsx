import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import AccentTitle from "@/components/onboarding/AccentTitle";
import { setOnboardingComplete } from "@/lib/storage";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

export default function Gracias() {
  const router = useRouter();
  const [finishing, setFinishing] = useState(false);
  const scale = useRef(new Animated.Value(0.6)).current;

  async function finish() {
    if (finishing) return;
    setFinishing(true);
    await setOnboardingComplete();
    router.replace("/(tabs)");
  }

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    // Auto-advance to the app after a short personalisation beat.
    const t = setTimeout(() => {
      void finish();
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.center}>
        <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
          <Feather name="check" size={36} color={colors.white} />
        </Animated.View>
        <AccentTitle normal="Gracias por " accent="confiar" style={styles.title} />
        <Text style={styles.subtitle}>
          Ahora personalizamos AtelIA para ti…
        </Text>
        <LoadingDots />
      </View>

      <View style={styles.footer}>
        <Button label="Empezar" onPress={finish} loading={finishing} />
      </View>
    </SafeAreaView>
  );
}

function LoadingDots() {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(d, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.dots}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 18 },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { textAlign: "center" },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
  },
  dots: { flexDirection: "row", gap: 8, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  footer: { paddingBottom: 16 },
});
