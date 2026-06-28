import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { isOnboardingComplete } from "@/lib/storage";
import { colors } from "@/constants/colors";

// Entry point: route to the app if onboarding is done, otherwise to onboarding.
export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const done = await isOnboardingComplete();
      if (!active) return;
      router.replace(done ? "/(tabs)" : "/onboarding/01-que-usas");
      setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  if (!checking) return null;

  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
});
