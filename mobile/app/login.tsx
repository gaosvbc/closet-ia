import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AccentTitle from "@/components/onboarding/AccentTitle";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { isMockMode } from "@/lib/supabase";
import { signInSchema } from "@/lib/auth/validation";

// Real sign-in screen. In mock mode there's no backend to authenticate
// against, so this just drops the visitor straight into the app, matching
// the rest of the demo experience.
export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  async function submit() {
    if (!canSubmit || submitting) return;
    setError(null);

    if (isMockMode) {
      router.replace("/(tabs)");
      return;
    }

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.");
      return;
    }

    setSubmitting(true);
    const result = await signIn(parsed.data.email, parsed.data.password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // app/index.tsx decides between resuming onboarding or going to the
    // tabs based on the session + profile it loads.
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <AccentTitle normal="Inicia " accent="sesión" />
            <Text style={styles.subtitle}>
              Accede a tu armario y tus looks guardados.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable accessibilityRole="button" style={styles.forgotLink}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña? Contacta soporte.</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Iniciar sesión" onPress={submit} disabled={!canSubmit} loading={submitting} />
          <Pressable onPress={() => router.replace("/register")} accessibilityRole="button" style={styles.signInLink}>
            <Text style={styles.signInText}>
              ¿No tienes cuenta? <Text style={styles.signInAccent}>Crear cuenta</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 40, gap: 32 },
  header: { gap: 10 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  form: { gap: 16 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.accent },
  forgotLink: { alignItems: "flex-start" },
  forgotText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  footer: { gap: 16, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12 },
  signInLink: { alignItems: "center" },
  signInText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  signInAccent: { fontFamily: fonts.bodyMedium, color: colors.accent },
});
