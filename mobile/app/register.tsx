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

// Shown once before onboarding, even in mock mode (no backend call — this is
// a demo form). "Crear cuenta" moves into onboarding; "Iniciar sesión" treats
// the visitor as a returning user and skips straight into the app.
export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length > 0;

  function submit() {
    if (!canSubmit) return;
    router.replace("/onboarding/01-que-usas");
  }

  function signIn() {
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <AccentTitle normal="Crea tu " accent="cuenta" />
            <Text style={styles.subtitle}>
              Guarda tu armario y tus looks para acceder desde cualquier dispositivo.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              autoCapitalize="words"
              autoComplete="name"
            />
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
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Crear cuenta" onPress={submit} disabled={!canSubmit} />
          <Pressable onPress={signIn} accessibilityRole="button" style={styles.signInLink}>
            <Text style={styles.signInText}>
              ¿Ya tienes cuenta? <Text style={styles.signInAccent}>Iniciar sesión</Text>
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
  footer: { gap: 16, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12 },
  signInLink: { alignItems: "center" },
  signInText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  signInAccent: { fontFamily: fonts.bodyMedium, color: colors.accent },
});
