import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { isOnboardingComplete } from "@/lib/storage";
import { useAuth } from "@/lib/auth/AuthContext";
import { isMockMode, supabase } from "@/lib/supabase";
import { colors } from "@/constants/colors";

// Entry point. Mock mode (no Supabase env vars) keeps the original
// AsyncStorage-only flag check so local dev without credentials still works.
// With real credentials, routing is driven by the session and the
// profile's onboarding_completed flag.
export default function Index() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      let active = true;
      (async () => {
        const done = await isOnboardingComplete();
        if (!active) return;
        router.replace(done ? "/(tabs)" : "/register");
        setChecking(false);
      })();
      return () => {
        active = false;
      };
    }

    if (loading) return;

    let active = true;
    (async () => {
      if (!session) {
        router.replace("/register");
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase!
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single();

      if (!active) return;
      if (!profile?.onboarding_completed) {
        router.replace("/onboarding/01-que-usas");
      } else {
        router.replace("/(tabs)");
      }
      setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [router, loading, session]);

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
