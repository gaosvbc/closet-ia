import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { setOnboardingComplete } from "@/lib/storage";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function finish() {
    // Mock account creation — persist the flag and enter the app.
    await setOnboardingComplete();
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.progressWrap}>
        <ProgressBar step={5} total={5} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crea tu cuenta</Text>

        <View style={styles.form}>
          <Input
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Valeria Andrade"
            autoCapitalize="words"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="valeria@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        <Button label="Crear cuenta" onPress={finish} />

        <Pressable onPress={finish} style={styles.loginLink}>
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta? <Text style={styles.loginAccent}>Iniciar sesión</Text>
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.divider} />
        </View>

        <Pressable
          onPress={finish}
          style={({ pressed }) => [styles.google, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
        >
          <Feather name="chrome" size={18} color={colors.textPrimary} />
          <Text style={styles.googleText}>Google</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  progressWrap: { paddingHorizontal: 24, paddingTop: 8 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, gap: 20 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.textPrimary },
  form: { gap: 16 },
  loginLink: { alignItems: "center" },
  loginText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  loginAccent: { fontFamily: fonts.bodyMedium, color: colors.accent },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  google: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    height: 52,
  },
  googleText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textPrimary },
});
